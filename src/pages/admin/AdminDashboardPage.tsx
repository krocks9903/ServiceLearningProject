import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { theme } from "../../constants/theme";

interface AdminStats {
  total_volunteers: number;
  active_volunteers: number;
  pending_volunteers: number;
  total_events: number;
  upcoming_events: number;
  total_hours: number;
}

export default function AdminDashboardPage() {
  const { user, profile, isAdmin, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define styles at the top to avoid hoisting issues
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: theme.colors.background,
      fontFamily: theme.typography.fontFamily,
    } as React.CSSProperties,
    header: {
      backgroundColor: theme.colors.secondary,
      color: theme.colors.white,
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: theme.shadows.md,
    } as React.CSSProperties,
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    } as React.CSSProperties,
    logo: {
      fontSize: "1.5rem",
    } as React.CSSProperties,
    headerTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
    } as React.CSSProperties,
    headerRight: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    } as React.CSSProperties,
    userInfo: {
      fontSize: theme.typography.fontSize.sm,
      opacity: 0.9,
    } as React.CSSProperties,
    logoutButton: {
      backgroundColor: "transparent",
      color: theme.colors.white,
      border: `1px solid ${theme.colors.white}`,
      padding: "0.5rem 1rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: "pointer",
      transition: theme.transitions.base,
    } as React.CSSProperties,
    main: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "2rem",
    } as React.CSSProperties,
    welcome: {
      marginBottom: "2rem",
    } as React.CSSProperties,
    welcomeTitle: {
      fontSize: theme.typography.fontSize["3xl"],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "0.5rem",
    } as React.CSSProperties,
    welcomeSubtitle: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.lg,
    } as React.CSSProperties,
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "1.5rem",
      marginBottom: "2rem",
    } as React.CSSProperties,
    statCard: {
      backgroundColor: theme.colors.white,
      padding: "1.5rem",
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    statTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.secondary,
      marginBottom: "0.5rem",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
    } as React.CSSProperties,
    statValue: {
      fontSize: theme.typography.fontSize["4xl"],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "0.25rem",
    } as React.CSSProperties,
    statDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    actionsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "1.5rem",
    } as React.CSSProperties,
    actionCard: {
      backgroundColor: theme.colors.white,
      padding: "2rem",
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.neutral[200]}`,
      cursor: "pointer",
      transition: theme.transitions.base,
    } as React.CSSProperties,
    actionTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "0.75rem",
    } as React.CSSProperties,
    actionDescription: {
      color: theme.colors.text.secondary,
      marginBottom: "1rem",
      lineHeight: theme.typography.lineHeight.relaxed,
    } as React.CSSProperties,
    actionButton: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: "none",
      padding: "0.75rem 1.5rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: "pointer",
      transition: theme.transitions.base,
    } as React.CSSProperties,
    error: {
      backgroundColor: "#fee",
      color: "#c00",
      padding: "1rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      border: "1px solid #fcc",
      textAlign: "center" as const,
    } as React.CSSProperties,
    loadingContainer: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      gap: "1rem",
    } as React.CSSProperties,
    spinner: {
      border: `3px solid ${theme.colors.neutral[300]}`,
      borderTop: `3px solid ${theme.colors.primary}`,
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      animation: "spin 1s linear infinite",
    } as React.CSSProperties,
  };

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/admin/login");
      return;
    }
    fetchStats();
  }, [user, isAdmin, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all stats in parallel with individual error handling
      const results = await Promise.allSettled([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "volunteer"),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "volunteer")
          .eq("status", "active"),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "volunteer")
          .eq("status", "pending"),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .gte("end_date", new Date().toISOString()),
        supabase.from("hour_logs").select("hours"),
      ]);

      // Extract counts and data, handling failures gracefully
      const totalVolunteers =
        results[0].status === "fulfilled" ? results[0].value.count || 0 : 0;
      const activeVolunteers =
        results[1].status === "fulfilled" ? results[1].value.count || 0 : 0;
      const pendingVolunteers =
        results[2].status === "fulfilled" ? results[2].value.count || 0 : 0;
      const totalEvents =
        results[3].status === "fulfilled" ? results[3].value.count || 0 : 0;
      const upcomingEvents =
        results[4].status === "fulfilled" ? results[4].value.count || 0 : 0;
      const hourLogs =
        results[5].status === "fulfilled" ? results[5].value.data || [] : [];

      // Calculate total hours
      const totalHours = hourLogs.reduce(
        (sum, log) => sum + (Number(log.hours) || 0),
        0
      );

      setStats({
        total_volunteers: totalVolunteers,
        active_volunteers: activeVolunteers,
        pending_volunteers: pendingVolunteers,
        total_events: totalEvents,
        upcoming_events: upcomingEvents,
        total_hours: Math.round(totalHours * 10) / 10, // Round to 1 decimal place
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: theme.colors.text.secondary }}>
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Admin Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>🔐</span>
          <h1 style={styles.headerTitle}>Admin Portal</h1>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.userInfo}>
            Welcome, {profile?.first_name || "Admin"}
          </span>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.white;
              e.currentTarget.style.color = theme.colors.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.white;
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <main style={styles.main}>
        <div style={styles.welcome}>
          <h1 style={styles.welcomeTitle}>Admin Dashboard</h1>
          <p style={styles.welcomeSubtitle}>
            Manage volunteers, events, and track impact
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statTitle}>Total Volunteers</div>
              <div style={styles.statValue}>{stats.total_volunteers}</div>
              <div style={styles.statDescription}>
                {stats.active_volunteers} active, {stats.pending_volunteers}{" "}
                pending
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statTitle}>Events</div>
              <div style={styles.statValue}>{stats.total_events}</div>
              <div style={styles.statDescription}>
                {stats.upcoming_events} upcoming
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statTitle}>Total Hours</div>
              <div style={styles.statValue}>{stats.total_hours}</div>
              <div style={styles.statDescription}>Hours volunteered</div>
            </div>
          </div>
        )}

        <div style={styles.actionsGrid}>
          <div
            style={styles.actionCard}
            onClick={() => navigate("/admin/volunteers")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = theme.shadows.lg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = theme.shadows.md;
            }}
          >
            <h3 style={styles.actionTitle}>Manage Volunteers</h3>
            <p style={styles.actionDescription}>
              View all volunteers, their profiles, hours logged, and status.
            </p>
            <button style={styles.actionButton}>View Volunteers →</button>
          </div>

          <div
            style={styles.actionCard}
            onClick={() => navigate("/admin/hours")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = theme.shadows.lg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = theme.shadows.md;
            }}
          >
            <h3 style={styles.actionTitle}>Approve Hours</h3>
            <p style={styles.actionDescription}>
              Review and approve volunteer hour submissions and logs.
            </p>
            <button style={styles.actionButton}>Manage Hours →</button>
          </div>

          <div
            style={styles.actionCard}
            onClick={() => navigate("/admin/shifts")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = theme.shadows.lg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = theme.shadows.md;
            }}
          >
            <h3 style={styles.actionTitle}>Manage Events & Shifts</h3>
            <p style={styles.actionDescription}>
              Create, edit, and manage volunteer events and shifts.
            </p>
            <button style={styles.actionButton}>Manage Events →</button>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
