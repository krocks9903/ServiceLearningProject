import { useState, useEffect } from "react"
import { supabase } from "../services/supabaseClient"
import { useAuth } from "../hooks/useAuth.tsx"
import { useNavigate } from "react-router-dom"
import { theme } from "../theme"

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  t_shirt_size: string
  status: string
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    phone: "",
    t_shirt_size: ""
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate("/login")
      return
    }
    fetchProfile()
  }, [user, navigate, authLoading])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        setMessage({ type: 'error', text: 'Failed to load profile' })
        return
      }

      setProfile(data)
      setFormData({
        phone: data.phone || "",
        t_shirt_size: data.t_shirt_size || ""
      })
    } catch (error) {
      console.error("Error:", error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          phone: formData.phone,
          t_shirt_size: formData.t_shirt_size,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating profile:", error)
        setMessage({ type: 'error', text: 'Failed to update profile' })
        return
      }

      setProfile(data)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      console.error("Error:", error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const styles = {
    container: {
      minHeight: "calc(100vh - 80px)",
      backgroundColor: theme.colors.background,
      padding: "2rem",
    } as React.CSSProperties,
    inner: {
      maxWidth: "800px",
      margin: "0 auto",
    } as React.CSSProperties,
    header: {
      marginBottom: "2rem",
    } as React.CSSProperties,
    title: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      color: theme.colors.text.primary,
      marginBottom: "0.5rem",
    } as React.CSSProperties,
    subtitle: {
      fontSize: "1.125rem",
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding: "2rem",
      boxShadow: theme.shadows.md,
      marginBottom: "2rem",
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: theme.colors.text.primary,
      marginBottom: "1.5rem",
      paddingBottom: "0.75rem",
      borderBottom: `2px solid ${theme.colors.background}`,
    } as React.CSSProperties,
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "1.25rem",
    } as React.CSSProperties,
    infoItem: {
      display: "flex",
      flexDirection: "column",
      gap: "0.25rem",
    } as React.CSSProperties,
    label: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: theme.colors.text.secondary,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    } as React.CSSProperties,
    value: {
      fontSize: "1.125rem",
      color: theme.colors.text.primary,
      fontWeight: "500",
    } as React.CSSProperties,
    statusBadge: {
      display: "inline-block",
      padding: "0.375rem 0.75rem",
      borderRadius: theme.borderRadius.full,
      fontSize: "0.875rem",
      fontWeight: "600",
      textTransform: "capitalize",
    } as React.CSSProperties,
    statusActive: {
      backgroundColor: "#d4edda",
      color: "#155724",
    } as React.CSSProperties,
    statusInactive: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
    } as React.CSSProperties,
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    } as React.CSSProperties,
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    } as React.CSSProperties,
    formLabel: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: theme.colors.text.primary,
    } as React.CSSProperties,
    input: {
      padding: "0.75rem",
      fontSize: "1rem",
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      transition: "border-color 0.2s",
    } as React.CSSProperties,
    button: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: "none",
      padding: "0.875rem",
      borderRadius: theme.borderRadius.md,
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s",
    } as React.CSSProperties,
    buttonDisabled: {
      backgroundColor: theme.colors.text.light,
      cursor: "not-allowed",
    } as React.CSSProperties,
    alert: {
      padding: "1rem 1.5rem",
      borderRadius: theme.borderRadius.md,
      marginBottom: "2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: theme.shadows.sm,
    } as React.CSSProperties,
    alertSuccess: {
      backgroundColor: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb",
    } as React.CSSProperties,
    alertError: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb",
    } as React.CSSProperties,
    closeButton: {
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: "inherit",
      padding: "0",
      lineHeight: "1",
    } as React.CSSProperties,
    loadingContainer: {
      minHeight: "calc(100vh - 80px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "1rem",
    } as React.CSSProperties,
    spinner: {
      border: `4px solid ${theme.colors.border}`,
      borderTop: `4px solid ${theme.colors.primary}`,
      borderRadius: "50%",
      width: "50px",
      height: "50px",
      animation: "spin 1s linear infinite",
    } as React.CSSProperties,
  }

  if (authLoading || loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: theme.colors.text.secondary }}>Loading your profile...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <div style={styles.card}>
            <h2 style={{ color: theme.colors.text.primary }}>Profile not found</h2>
            <p style={{ color: theme.colors.text.secondary }}>
              Unable to load your profile. Please try again or contact support.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>Manage your volunteer account information</p>
        </div>

        {message && (
          <div style={{
            ...styles.alert,
            ...(message.type === 'success' ? styles.alertSuccess : styles.alertError)
          }}>
            <span>
              {message.type === 'success' ? '✓ ' : '⚠️ '}
              {message.text}
            </span>
            <button
              onClick={() => setMessage(null)}
              style={styles.closeButton}
            >
              ×
            </button>
          </div>
        )}

        {/* Profile Information Display */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Profile Information</h2>
          
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.label}>Full Name</span>
              <span style={styles.value}>{profile.first_name} {profile.last_name}</span>
            </div>
            
            <div style={styles.infoItem}>
              <span style={styles.label}>Email Address</span>
              <span style={styles.value}>{profile.email}</span>
            </div>
            
            <div style={styles.infoItem}>
              <span style={styles.label}>Phone Number</span>
              <span style={styles.value}>{profile.phone || "Not provided"}</span>
            </div>
            
            <div style={styles.infoItem}>
              <span style={styles.label}>T-Shirt Size</span>
              <span style={styles.value}>{profile.t_shirt_size || "Not specified"}</span>
            </div>
            
            <div style={styles.infoItem}>
              <span style={styles.label}>Account Status</span>
              <span style={{
                ...styles.statusBadge,
                ...(profile.status === "active" ? styles.statusActive : styles.statusInactive)
              }}>
                {profile.status}
              </span>
            </div>
            
            <div style={styles.infoItem}>
              <span style={styles.label}>Member Since</span>
              <span style={styles.value}>
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Update Profile Form */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Update Profile</h2>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="phone" style={styles.formLabel}>
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(239) 555-0123"
                style={styles.input}
              />
              <small style={{ color: theme.colors.text.secondary, fontSize: "0.875rem" }}>
                We'll use this to contact you about volunteer opportunities
              </small>
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="t_shirt_size" style={styles.formLabel}>
                T-Shirt Size
              </label>
              <select
                id="t_shirt_size"
                name="t_shirt_size"
                value={formData.t_shirt_size}
                onChange={handleInputChange}
                style={styles.input}
              >
                <option value="">Select a size</option>
                <option value="XS">Extra Small (XS)</option>
                <option value="S">Small (S)</option>
                <option value="M">Medium (M)</option>
                <option value="L">Large (L)</option>
                <option value="XL">Extra Large (XL)</option>
                <option value="XXL">2XL</option>
                <option value="XXXL">3XL</option>
              </select>
              <small style={{ color: theme.colors.text.secondary, fontSize: "0.875rem" }}>
                For volunteer appreciation events and giveaways
              </small>
            </div>
            
            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.button,
                ...(saving ? styles.buttonDisabled : {})
              }}
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
