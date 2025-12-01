import { useState, useEffect } from "react"
import { supabase } from "../../services/supabaseClient"
import { theme } from "../../theme"
import { formatTimeInEST } from "../../utils/formatDate"

interface Volunteer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
}

interface Shift {
  id: string
  title?: string
  name?: string
  start_time: string
  end_time: string
  capacity?: number | null
  max_volunteers?: number | null
}

interface Assignment {
  id: string
  volunteer_id: string
  shift_id: string
  status: string
  created_at: string
  profiles: Volunteer
  shifts: Shift
}

interface VolunteerAssignmentsModalProps {
  eventId: string
  eventTitle: string
  isOpen: boolean
  onClose: () => void
}

export default function VolunteerAssignmentsModal({ 
  eventId, 
  eventTitle, 
  isOpen, 
  onClose 
}: VolunteerAssignmentsModalProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
      padding: "1rem",
    } as React.CSSProperties,
    modal: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.xl,
      maxWidth: "900px",
      width: "100%",
      maxHeight: "90vh",
      overflow: "auto",
    } as React.CSSProperties,
    header: {
      padding: "2rem 2rem 1rem",
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    } as React.CSSProperties,
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      margin: 0,
    } as React.CSSProperties,
    closeButton: {
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: theme.colors.text.secondary,
      padding: "0.25rem",
    } as React.CSSProperties,
    content: {
      padding: "2rem",
    } as React.CSSProperties,
    eventInfo: {
      backgroundColor: theme.colors.neutral[50],
      padding: "1.5rem",
      borderRadius: theme.borderRadius.base,
      marginBottom: "2rem",
    } as React.CSSProperties,
    eventTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "0.5rem",
    } as React.CSSProperties,
    assignmentsTable: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.neutral[200]}`,
      overflow: "hidden",
    } as React.CSSProperties,
    tableHeader: {
      backgroundColor: theme.colors.neutral[50],
      padding: "1rem",
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      display: "grid",
      gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr",
      gap: "1rem",
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
    } as React.CSSProperties,
    assignmentRow: {
      padding: "1rem",
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      display: "grid",
      gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr",
      gap: "1rem",
      alignItems: "center",
      transition: theme.transitions.base,
    } as React.CSSProperties,
    volunteerInfo: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.25rem",
    } as React.CSSProperties,
    volunteerName: {
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    } as React.CSSProperties,
    volunteerEmail: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    shiftInfo: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.25rem",
    } as React.CSSProperties,
    shiftName: {
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    } as React.CSSProperties,
    shiftTime: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    statusBadge: {
      padding: "0.25rem 0.75rem",
      borderRadius: theme.borderRadius.full,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      textTransform: "uppercase" as const,
      textAlign: "center" as const,
    } as React.CSSProperties,
    registeredStatus: {
      backgroundColor: `${theme.colors.success}20`,
      color: theme.colors.success,
    } as React.CSSProperties,
    checkedInStatus: {
      backgroundColor: `${theme.colors.info}20`,
      color: theme.colors.info,
    } as React.CSSProperties,
    noShowStatus: {
      backgroundColor: `${theme.colors.error}20`,
      color: theme.colors.error,
    } as React.CSSProperties,
    actionButton: {
      padding: "0.25rem 0.5rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: "pointer",
      transition: theme.transitions.base,
      border: "none",
    } as React.CSSProperties,
    checkInButton: {
      backgroundColor: theme.colors.info,
      color: theme.colors.white,
    } as React.CSSProperties,
    noShowButton: {
      backgroundColor: theme.colors.error,
      color: theme.colors.white,
    } as React.CSSProperties,
    removeButton: {
      backgroundColor: theme.colors.neutral[400],
      color: theme.colors.white,
    } as React.CSSProperties,
    error: {
      backgroundColor: "#fee",
      color: "#c00",
      padding: "1rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      border: "1px solid #fcc",
      marginBottom: "1rem",
    } as React.CSSProperties,
    success: {
      backgroundColor: "#efe",
      color: "#060",
      padding: "1rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      border: "1px solid #cfc",
      marginBottom: "1rem",
    } as React.CSSProperties,
    loading: {
      textAlign: "center" as const,
      padding: "2rem",
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    emptyState: {
      textAlign: "center" as const,
      padding: "3rem",
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    summary: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "1rem",
      marginBottom: "2rem",
    } as React.CSSProperties,
    summaryCard: {
      backgroundColor: theme.colors.white,
      padding: "1rem",
      borderRadius: theme.borderRadius.base,
      border: `1px solid ${theme.colors.neutral[200]}`,
      textAlign: "center" as const,
    } as React.CSSProperties,
    summaryValue: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "0.25rem",
    } as React.CSSProperties,
    summaryLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
  }

  const fetchAssignments = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Fetching assignments for eventId:", eventId)
      
      // First, let's try a simple query to see if the table exists and has data
      const { data: simpleData, error: simpleError } = await supabase
        .from("volunteer_assignments")
        .select("*")
        .eq("event_id", eventId)

      console.log("Simple query result:", { simpleData, simpleError })

      if (simpleError) {
        console.error("Simple query error:", simpleError)
        setError(`Database error: ${simpleError.message}`)
        return
      }

      // If simple query works, try the full query with joins
      // First try to see what columns are available in shifts
      const { data: shiftColumns, error: shiftError } = await supabase
        .from("shifts")
        .select("*")
        .limit(1)

      console.log("Shift columns test:", { shiftColumns, shiftError })

      // Try a simpler join query without assuming column names
      const { data, error } = await supabase
        .from("volunteer_assignments")
        .select(`
          *,
          profiles!volunteer_id!inner(id, email, first_name, last_name, phone),
          shifts!shift_id!inner(*)
        `)
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })

      console.log("Full query result:", { data, error })

      if (error) {
        console.error("Error fetching assignments:", error)
        setError(`Query error: ${error.message}`)
        return
      }

      setAssignments(data || [])
    } catch (error) {
      console.error("Unexpected error fetching assignments:", error)
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const updateAssignmentStatus = async (assignmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("volunteer_assignments")
        .update({ status: newStatus })
        .eq("id", assignmentId)

      if (error) {
        console.error("Error updating assignment:", error)
        setError("Failed to update assignment status")
        return
      }

      setSuccess(`Assignment status updated to ${newStatus}`)
      fetchAssignments()
    } catch (error) {
      console.error("Error updating assignment:", error)
      setError("Failed to update assignment status")
    }
  }

  const removeAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this volunteer from the shift?')) return

    try {
      const { error } = await supabase
        .from("volunteer_assignments")
        .delete()
        .eq("id", assignmentId)

      if (error) {
        console.error("Error removing assignment:", error)
        setError("Failed to remove assignment")
        return
      }

      setSuccess("Volunteer removed from shift")
      fetchAssignments()
    } catch (error) {
      console.error("Error removing assignment:", error)
      setError("Failed to remove assignment")
    }
  }

  const formatTime = (dateString: string) => {
    return formatTimeInEST(dateString)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const baseStyle = styles.statusBadge
    switch (status) {
      case 'registered':
        return { ...baseStyle, ...styles.registeredStatus }
      case 'checked_in':
        return { ...baseStyle, ...styles.checkedInStatus }
      case 'no_show':
        return { ...baseStyle, ...styles.noShowStatus }
      default:
        return baseStyle
    }
  }

  const getSummaryStats = () => {
    const total = assignments.length
    const checkedIn = assignments.filter(a => a.status === 'checked_in').length
    const noShow = assignments.filter(a => a.status === 'no_show').length
    const registered = assignments.filter(a => a.status === 'registered').length

    return { total, checkedIn, noShow, registered }
  }

  useEffect(() => {
    if (isOpen) {
      fetchAssignments()
    }
  }, [isOpen, eventId])

  if (!isOpen) return null

  const summary = getSummaryStats()

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Volunteer Assignments</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.eventInfo}>
            <div style={styles.eventTitle}>{eventTitle}</div>
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {success && (
            <div style={styles.success}>
              {success}
            </div>
          )}

          <div style={styles.summary}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryValue}>{summary.total}</div>
              <div style={styles.summaryLabel}>Total Registrations</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryValue}>{summary.registered}</div>
              <div style={styles.summaryLabel}>Registered</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryValue}>{summary.checkedIn}</div>
              <div style={styles.summaryLabel}>Checked In</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryValue}>{summary.noShow}</div>
              <div style={styles.summaryLabel}>No Show</div>
            </div>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div style={styles.emptyState}>
              No volunteers have registered for this event yet.
            </div>
          ) : (
            <div style={styles.assignmentsTable}>
              <div style={styles.tableHeader}>
                <div>Volunteer</div>
                <div>Shift</div>
                <div>Status</div>
                <div>Registered</div>
                <div>Actions</div>
              </div>

              {assignments.map((assignment) => (
                <div key={assignment.id} style={styles.assignmentRow}>
                  <div style={styles.volunteerInfo}>
                    <div style={styles.volunteerName}>
                      {assignment.profiles.first_name} {assignment.profiles.last_name}
                    </div>
                    <div style={styles.volunteerEmail}>{assignment.profiles.email}</div>
                  </div>

                  <div style={styles.shiftInfo}>
                    <div style={styles.shiftName}>
                      {assignment.shifts.title || assignment.shifts.name || `Shift ${assignment.shifts.id.slice(0, 8)}`}
                    </div>
                    <div style={styles.shiftTime}>
                      {formatTime(assignment.shifts.start_time)} - {formatTime(assignment.shifts.end_time)}
                    </div>
                  </div>

                  <div>
                    <span style={getStatusBadge(assignment.status)}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    {formatDate(assignment.created_at)}
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {assignment.status === 'registered' && (
                      <>
                        <button
                          style={{
                            ...styles.actionButton,
                            ...styles.checkInButton
                          }}
                          onClick={() => updateAssignmentStatus(assignment.id, 'checked_in')}
                        >
                          Check In
                        </button>
                        <button
                          style={{
                            ...styles.actionButton,
                            ...styles.noShowButton
                          }}
                          onClick={() => updateAssignmentStatus(assignment.id, 'no_show')}
                        >
                          No Show
                        </button>
                      </>
                    )}
                    <button
                      style={{
                        ...styles.actionButton,
                        ...styles.removeButton
                      }}
                      onClick={() => removeAssignment(assignment.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
