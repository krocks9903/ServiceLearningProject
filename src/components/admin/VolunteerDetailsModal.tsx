import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import type { VolunteerDetails } from "../../types/volunteer";
import { theme } from "../../constants/theme";

interface VolunteerDetailsModalProps {
  volunteer: VolunteerDetails;
  isOpen: boolean;
  onClose: () => void;
  onGenerateReport: (volunteer: VolunteerDetails) => void;
  onStatusUpdate?: (volunteerId: string, newStatus: string) => void;
}

export default function VolunteerDetailsModal({
  volunteer,
  isOpen,
  onClose,
  onGenerateReport,
  onStatusUpdate,
}: VolunteerDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<string | null>(
    null
  );
  const [statusHistory, setStatusHistory] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && volunteer) {
      fetchVolunteerDetails();
    }
  }, [isOpen, volunteer]);

  const fetchVolunteerDetails = async () => {
    setLoading(true);
    try {
      // Try to fetch onboarding status
      try {
        const { data: onboardingData } = await supabase
          .from("volunteer_onboarding")
          .select(
            `
            completed,
            completed_at,
            onboarding_items (
              title,
              description,
              required
            )
          `
          )
          .eq("volunteer_id", volunteer.id);

        setOnboardingStatus(onboardingData || []);
      } catch (onboardingError) {
        console.log("Onboarding data not available:", onboardingError);
        setOnboardingStatus([]);
      }

      // Try to fetch recent activities
      try {
        const { data: activitiesData } = await supabase
          .from("volunteer_assignments")
          .select(
            `
            created_at,
            shifts (
              title,
              start_time,
              end_time,
              events (title)
            )
          `
          )
          .eq("volunteer_id", volunteer.id)
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentActivities(activitiesData || []);
      } catch (activitiesError) {
        console.log("Activities data not available:", activitiesError);
        setRecentActivities([]);
      }

      // Try to fetch status history
      try {
        const { data: statusHistoryData } = await supabase
          .from("volunteer_status_history")
          .select(
            `
            status,
            changed_at,
            changed_by,
            reason
          `
          )
          .eq("volunteer_id", volunteer.id)
          .order("changed_at", { ascending: false })
          .limit(10);

        setStatusHistory(statusHistoryData || []);
      } catch (statusHistoryError) {
        console.log("Status history data not available:", statusHistoryError);
        setStatusHistory([]);
      }
    } catch (error) {
      console.error("Error fetching volunteer details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return "Not provided";
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zip_code,
    ].filter(Boolean);
    return parts.join(", ") || "Not provided";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "Not provided";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return `${age} years old`;
  };

  const handleStatusChange = (newStatus: string) => {
    setPendingStatusChange(newStatus);
    setShowStatusConfirmation(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange || !onStatusUpdate) return;

    setStatusUpdating(true);
    try {
      // Update the volunteer status in the database
      const { error } = await supabase
        .from("profiles")
        .update({
          status: pendingStatusChange,
          updated_at: new Date().toISOString(),
        })
        .eq("id", volunteer.id);

      if (error) {
        console.error("Error updating volunteer status:", error);
        alert("Failed to update volunteer status. Please try again.");
        return;
      }

      // Try to record the status change in history
      try {
        await supabase.from("volunteer_status_history").insert({
          volunteer_id: volunteer.id,
          status: pendingStatusChange,
          changed_at: new Date().toISOString(),
          changed_by: "admin", // This could be enhanced to track the actual admin user
          reason: `Status changed from ${volunteer.status} to ${pendingStatusChange}`,
        });
      } catch (historyError) {
        console.log("Could not record status history:", historyError);
        // Don't fail the main operation if history recording fails
      }

      // Call the parent component's status update handler
      onStatusUpdate(volunteer.id, pendingStatusChange);

      // Close the confirmation dialog
      setShowStatusConfirmation(false);
      setPendingStatusChange(null);

      alert(`Volunteer status successfully updated to ${pendingStatusChange}`);
    } catch (error) {
      console.error("Error updating volunteer status:", error);
      alert("Failed to update volunteer status. Please try again.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const cancelStatusChange = () => {
    setShowStatusConfirmation(false);
    setPendingStatusChange(null);
  };

  const styles = {
    overlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modal: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.xl,
      maxWidth: "800px",
      width: "90%",
      maxHeight: "90vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column" as const,
    },
    header: {
      padding: "1.5rem",
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.neutral[50],
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
    },
    closeButton: {
      backgroundColor: "transparent",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: theme.colors.text.secondary,
      padding: "0.5rem",
      borderRadius: theme.borderRadius.base,
    },
    content: {
      padding: "1.5rem",
      overflowY: "auto" as const,
      flex: 1,
    },
    section: {
      marginBottom: "2rem",
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: "1rem",
      borderBottom: `2px solid ${theme.colors.primary}`,
      paddingBottom: "0.5rem",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "1rem",
    },
    field: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.25rem",
    },
    fieldLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.secondary,
      textTransform: "uppercase" as const,
    },
    fieldValue: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      wordBreak: "break-word" as const,
    },
    statusBadge: {
      display: "inline-block",
      padding: "0.25rem 0.75rem",
      borderRadius: theme.borderRadius.full,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      textTransform: "uppercase" as const,
    },
    skillsContainer: {
      display: "flex",
      flexWrap: "wrap" as const,
      gap: "0.5rem",
    },
    skillTag: {
      backgroundColor: theme.colors.primary + "20",
      color: theme.colors.primary,
      padding: "0.25rem 0.5rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
    },
    actions: {
      padding: "1.5rem",
      borderTop: `1px solid ${theme.colors.neutral[200]}`,
      display: "flex",
      gap: "1rem",
      justifyContent: "flex-end",
    },
    button: {
      padding: "0.75rem 1.5rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: "pointer",
      border: "none",
      transition: theme.transitions.base,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
    },
    secondaryButton: {
      backgroundColor: "transparent",
      color: theme.colors.text.secondary,
      border: `1px solid ${theme.colors.neutral[300]}`,
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
    },
    spinner: {
      border: `3px solid ${theme.colors.neutral[300]}`,
      borderTop: `3px solid ${theme.colors.primary}`,
      borderRadius: "50%",
      width: "30px",
      height: "30px",
      animation: "spin 1s linear infinite",
    },
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return theme.colors.success;
      case "pending":
        return theme.colors.warning;
      case "inactive":
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusBadge = (status: string) => ({
    ...styles.statusBadge,
    backgroundColor: `${getStatusColor(status)}20`,
    color: getStatusColor(status),
  });

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {volunteer.first_name} {volunteer.last_name} - Details
          </h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.content}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
            </div>
          ) : (
            <>
              {/* Personal Information */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Personal Information</h3>
                <div style={styles.grid}>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Full Name</span>
                    <span style={styles.fieldValue}>
                      {volunteer.first_name} {volunteer.last_name}
                    </span>
                  </div>
                  {volunteer.volunteer_number && (
                    <div style={styles.field}>
                      <span style={styles.fieldLabel}>Volunteer Number</span>
                      <span
                        style={{
                          ...styles.fieldValue,
                          fontFamily: "monospace",
                          fontSize: theme.typography.fontSize.lg,
                          fontWeight: theme.typography.fontWeight.bold,
                          color: theme.colors.primary,
                        }}
                      >
                        {volunteer.volunteer_number}
                      </span>
                    </div>
                  )}
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Email</span>
                    <span style={styles.fieldValue}>{volunteer.email}</span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Phone</span>
                    <span style={styles.fieldValue}>
                      {volunteer.phone || "Not provided"}
                    </span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Date of Birth</span>
                    <span style={styles.fieldValue}>
                      {volunteer.date_of_birth
                        ? formatDate(volunteer.date_of_birth)
                        : "Not provided"}
                    </span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Age</span>
                    <span style={styles.fieldValue}>
                      {volunteer.date_of_birth
                        ? calculateAge(volunteer.date_of_birth)
                        : "Not provided"}
                    </span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>T-Shirt Size</span>
                    <span style={styles.fieldValue}>
                      {volunteer.t_shirt_size || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Address Information</h3>
                <div style={styles.field}>
                  <span style={styles.fieldLabel}>Address</span>
                  <span style={styles.fieldValue}>
                    {formatAddress(volunteer.address)}
                  </span>
                </div>
              </div>

              {/* Emergency Contact */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Emergency Contact</h3>
                <div style={styles.grid}>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Contact Name</span>
                    <span style={styles.fieldValue}>
                      {volunteer.emergency_contact_name || "Not provided"}
                    </span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Contact Phone</span>
                    <span style={styles.fieldValue}>
                      {volunteer.emergency_contact_phone || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills and Tags */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Skills & Tags</h3>
                <div style={styles.grid}>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Skills</span>
                    <div style={styles.skillsContainer}>
                      {volunteer.skills && volunteer.skills.length > 0 ? (
                        volunteer.skills.map((skill, index) => (
                          <span key={index} style={styles.skillTag}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={styles.fieldValue}>No skills listed</span>
                      )}
                    </div>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Tags</span>
                    <div style={styles.skillsContainer}>
                      {volunteer.tags && volunteer.tags.length > 0 ? (
                        volunteer.tags.map((tag, index) => (
                          <span key={index} style={styles.skillTag}>
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span style={styles.fieldValue}>No tags assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Volunteer Status */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Volunteer Status</h3>
                <div style={styles.grid}>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Status</span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={getStatusBadge(volunteer.status)}>
                          {volunteer.status}
                        </span>
                        {volunteer.status === "pending" && (
                          <span
                            style={{
                              fontSize: theme.typography.fontSize.xs,
                              color: theme.colors.warning,
                              fontWeight: theme.typography.fontWeight.semibold,
                              backgroundColor: `${theme.colors.warning}20`,
                              padding: "0.25rem 0.5rem",
                              borderRadius: theme.borderRadius.base,
                            }}
                          >
                            ⏳ Needs Validation
                          </span>
                        )}
                        {volunteer.status === "active" && (
                          <span
                            style={{
                              fontSize: theme.typography.fontSize.xs,
                              color: theme.colors.success,
                              fontWeight: theme.typography.fontWeight.semibold,
                              backgroundColor: `${theme.colors.success}20`,
                              padding: "0.25rem 0.5rem",
                              borderRadius: theme.borderRadius.base,
                            }}
                          >
                            ✅ Validated
                          </span>
                        )}
                        {volunteer.status === "inactive" && (
                          <span
                            style={{
                              fontSize: theme.typography.fontSize.xs,
                              color: theme.colors.error,
                              fontWeight: theme.typography.fontWeight.semibold,
                              backgroundColor: `${theme.colors.error}20`,
                              padding: "0.25rem 0.5rem",
                              borderRadius: theme.borderRadius.base,
                            }}
                          >
                            ❌ Inactive
                          </span>
                        )}
                      </div>
                      {onStatusUpdate && (
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                          }}
                        >
                          {volunteer.status !== "active" && (
                            <button
                              style={{
                                ...styles.button,
                                backgroundColor: theme.colors.success,
                                color: theme.colors.white,
                                padding: "0.25rem 0.75rem",
                                fontSize: theme.typography.fontSize.xs,
                                fontWeight:
                                  theme.typography.fontWeight.semibold,
                                cursor: "pointer",
                                border: "none",
                                borderRadius: theme.borderRadius.base,
                                transition: theme.transitions.base,
                                opacity: statusUpdating ? 0.6 : 1,
                              }}
                              onClick={() => handleStatusChange("active")}
                              disabled={statusUpdating}
                            >
                              ✓ Approve
                            </button>
                          )}
                          {volunteer.status !== "pending" && (
                            <button
                              style={{
                                ...styles.button,
                                backgroundColor: theme.colors.warning,
                                color: theme.colors.white,
                                padding: "0.25rem 0.75rem",
                                fontSize: theme.typography.fontSize.xs,
                                fontWeight:
                                  theme.typography.fontWeight.semibold,
                                cursor: "pointer",
                                border: "none",
                                borderRadius: theme.borderRadius.base,
                                transition: theme.transitions.base,
                                opacity: statusUpdating ? 0.6 : 1,
                              }}
                              onClick={() => handleStatusChange("pending")}
                              disabled={statusUpdating}
                            >
                              ⏳ Set Pending
                            </button>
                          )}
                          {volunteer.status !== "inactive" && (
                            <button
                              style={{
                                ...styles.button,
                                backgroundColor: theme.colors.error,
                                color: theme.colors.white,
                                padding: "0.25rem 0.75rem",
                                fontSize: theme.typography.fontSize.xs,
                                fontWeight:
                                  theme.typography.fontWeight.semibold,
                                cursor: "pointer",
                                border: "none",
                                borderRadius: theme.borderRadius.base,
                                transition: theme.transitions.base,
                                opacity: statusUpdating ? 0.6 : 1,
                              }}
                              onClick={() => handleStatusChange("inactive")}
                              disabled={statusUpdating}
                            >
                              ❌ Deactivate
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Total Hours</span>
                    <span style={styles.fieldValue}>
                      {volunteer.total_hours || 0} hours
                    </span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Events Attended</span>
                    <span style={styles.fieldValue}>
                      {volunteer.events_attended || 0} events
                    </span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Last Activity</span>
                    <span style={styles.fieldValue}>
                      {volunteer.last_volunteer_date
                        ? formatDate(volunteer.last_volunteer_date)
                        : "No activity"}
                    </span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Member Since</span>
                    <span style={styles.fieldValue}>
                      {formatDate(volunteer.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Onboarding Status */}
              {onboardingStatus.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Onboarding Status</h3>
                  <div style={styles.grid}>
                    {onboardingStatus.map((item, index) => (
                      <div key={index} style={styles.field}>
                        <span style={styles.fieldLabel}>
                          {item.onboarding_items?.title}
                        </span>
                        <span
                          style={{
                            ...styles.fieldValue,
                            color: item.completed
                              ? theme.colors.success
                              : theme.colors.warning,
                          }}
                        >
                          {item.completed ? "✓ Completed" : "⏳ Pending"}
                          {item.completed_at &&
                            ` (${formatDate(item.completed_at)})`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status History */}
              {statusHistory.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Status History</h3>
                  <div style={styles.grid}>
                    {statusHistory.map((historyItem, index) => (
                      <div key={index} style={styles.field}>
                        <span style={styles.fieldLabel}>
                          {formatDate(historyItem.changed_at)}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span style={getStatusBadge(historyItem.status)}>
                            {historyItem.status}
                          </span>
                          <span style={styles.fieldValue}>
                            by {historyItem.changed_by}
                          </span>
                        </div>
                        {historyItem.reason && (
                          <span
                            style={{
                              ...styles.fieldValue,
                              fontSize: theme.typography.fontSize.sm,
                              color: theme.colors.text.secondary,
                              fontStyle: "italic",
                            }}
                          >
                            {historyItem.reason}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activities */}
              {recentActivities.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Recent Activities</h3>
                  <div style={styles.grid}>
                    {recentActivities.map((activity, index) => (
                      <div key={index} style={styles.field}>
                        <span style={styles.fieldLabel}>
                          {activity.shifts?.events?.title || "Activity"}
                        </span>
                        <span style={styles.fieldValue}>
                          {activity.shifts?.title} -{" "}
                          {formatDate(activity.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div style={styles.actions}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={onClose}
          >
            Close
          </button>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={() => onGenerateReport(volunteer)}
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Status Change Confirmation Dialog */}
      {showStatusConfirmation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: theme.borderRadius.lg,
              padding: "2rem",
              maxWidth: "400px",
              width: "90%",
              boxShadow: theme.shadows.xl,
            }}
          >
            <h3
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                marginBottom: "1rem",
              }}
            >
              Confirm Status Change
            </h3>
            <p
              style={{
                color: theme.colors.text.secondary,
                marginBottom: "2rem",
              }}
            >
              Are you sure you want to change {volunteer.first_name}{" "}
              {volunteer.last_name}'s status to{" "}
              <strong>{pendingStatusChange}</strong>?
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                style={{
                  ...styles.button,
                  ...styles.secondaryButton,
                }}
                onClick={cancelStatusChange}
                disabled={statusUpdating}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.button,
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.white,
                }}
                onClick={confirmStatusChange}
                disabled={statusUpdating}
              >
                {statusUpdating ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
