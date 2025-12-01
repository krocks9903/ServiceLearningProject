import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { theme } from "../../constants/theme";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        // Check if user is admin and redirect accordingly
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Default to dashboard if profile fetch fails
          navigate("/dashboard");
          return;
        }

        // Redirect based on role
        if (profile?.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
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
      background:
        "linear-gradient(135deg, rgba(248, 249, 250, 0.85) 0%, rgba(233, 236, 239, 0.85) 100%), url('https://harrychapinfoodbank.org/wp-content/uploads/2020/11/152-edit-560x420.jpg') center/cover",
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
      backgroundColor: theme.colors.primary,
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
          <div style={styles.logo}>🍽</div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>
            Harry Chapin Food Bank of SWFL Volunteer Portal
          </p>
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
              placeholder="your@email.com"
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
                e.currentTarget.style.backgroundColor = "#c72e3a";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = theme.colors.primary;
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            Don't have an account?{" "}
            <Link to="/signup" style={styles.link}>
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
