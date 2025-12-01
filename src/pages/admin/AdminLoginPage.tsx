import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { theme } from "../../constants/theme";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, isAdmin } = useAdminAuth();

  useEffect(() => {
    if (user && isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [user, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError || profile?.role !== "admin") {
          await supabase.auth.signOut();
          setError("Access denied. Admin privileges required.");
          setLoading(false);
          return;
        }

        // Redirect to admin dashboard
        navigate("/admin/dashboard");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1D3557 0%, #2C3E50 100%)",
      fontFamily: theme.typography.fontFamily,
    } as React.CSSProperties,
    loginCard: {
      backgroundColor: theme.colors.white,
      padding: "3rem",
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.xl,
      width: "100%",
      maxWidth: "400px",
      border: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    header: {
      textAlign: "center" as const,
      marginBottom: "2rem",
    } as React.CSSProperties,
    logo: {
      fontSize: "3rem",
      marginBottom: "1rem",
    } as React.CSSProperties,
    title: {
      fontSize: theme.typography.fontSize["3xl"],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "0.5rem",
    } as React.CSSProperties,
    subtitle: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
    } as React.CSSProperties,
    form: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "1.5rem",
    } as React.CSSProperties,
    inputGroup: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.5rem",
    } as React.CSSProperties,
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    } as React.CSSProperties,
    input: {
      padding: "0.875rem",
      fontSize: theme.typography.fontSize.base,
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      transition: theme.transitions.base,
      fontFamily: theme.typography.fontFamily,
    } as React.CSSProperties,
    button: {
      backgroundColor: theme.colors.secondary,
      color: theme.colors.white,
      border: "none",
      padding: "0.875rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: "pointer",
      transition: theme.transitions.base,
      boxShadow: theme.shadows.sm,
      fontFamily: theme.typography.fontFamily,
    } as React.CSSProperties,
    buttonDisabled: {
      backgroundColor: theme.colors.neutral[400],
      cursor: "not-allowed",
    } as React.CSSProperties,
    error: {
      backgroundColor: "#fee",
      color: "#c00",
      padding: "0.875rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      border: "1px solid #fcc",
    } as React.CSSProperties,
    footer: {
      marginTop: "2rem",
      textAlign: "center" as const,
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
    } as React.CSSProperties,
    link: {
      color: theme.colors.primary,
      textDecoration: "none",
      fontWeight: theme.typography.fontWeight.semibold,
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <div style={styles.header}>
          <div style={styles.logo}>🔐</div>
          <h1 style={styles.title}>Admin Portal</h1>
          <p style={styles.subtitle}>Harry Chapin Food Bank of SWFL</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              placeholder="admin@harrychapinfoodbank.org"
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#2C3E50";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = theme.colors.secondary;
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {loading ? "Signing In..." : "Sign In to Admin Portal"}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            <a href="/" style={styles.link}>
              ← Back to Volunteer Portal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
