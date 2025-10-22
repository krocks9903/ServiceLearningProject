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

interface VolunteerStats {
  totalHours: number
  eventsAttended: number
  upcomingEvents: number
  memberMonths: number
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<VolunteerStats>({
    totalHours: 0,
    eventsAttended: 0,
    upcomingEvents: 0,
    memberMonths: 0
  })
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    t_shirt_size: ""
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Professional stock imagery
  const profileBgImage = "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=80"

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate("/login")
      return
    }
    fetchProfile()
    fetchStats()
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
        email: data.email || "",
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

  const fetchStats = async () => {
    if (!user) return

    try {
      // Fetch hour logs
      const { data: hourLogs } = await supabase
        .from('hour_logs')
        .select('hours')
        .eq('volunteer_id', user.id)
        .eq('verified_at', true)

      const totalHours = hourLogs?.reduce((sum, log) => sum + (log.hours || 0), 0) || 0

      // Fetch volunteer assignments
      const { data: assignments } = await supabase
        .from('volunteer_assignments')
        .select('status, events:event_id(start_date)')
        .eq('volunteer_id', user.id)

      const eventsAttended = assignments?.filter(a => 
        a.status === 'completed' || a.status === 'checked_in'
      ).length || 0

      const upcomingEvents = assignments?.filter(a => {
        if (!a.events?.start_date) return false
        return new Date(a.events.start_date) > new Date()
      }).length || 0

      // Calculate member months
      const { data: profileData } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single()

      const memberMonths = profileData?.created_at 
        ? Math.floor((new Date().getTime() - new Date(profileData.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
        : 0

      setStats({ totalHours, eventsAttended, upcomingEvents, memberMonths })
    } catch (error) {
      console.error("Error fetching stats:", error)
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\(\)]+$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setMessage({ type: 'error', text: 'Please enter a valid phone number' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      // Update profile
      const { data, error } = await supabase
        .from("profiles")
        .update({
          email: formData.email,
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

      // If email changed, update auth email
      if (formData.email !== profile?.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: formData.email
        })
        
        if (authError) {
          console.error("Error updating email:", authError)
          setMessage({ type: 'error', text: 'Profile updated but email change requires verification' })
        } else {
          setMessage({ type: 'success', text: 'Profile updated! Please check your new email for verification link.' })
        }
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      }

      setProfile(data)
      setIsEditing(false)
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setMessage(null), 5000)
    } catch (error) {
      console.error("Error:", error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (profile) {
      setFormData({
        email: profile.email || "",
        phone: profile.phone || "",
        t_shirt_size: profile.t_shirt_size || ""
      })
    }
    setMessage(null)
  }

  if (authLoading || loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your profile...</p>
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
        <div style={styles.errorCard}>
          <h2 style={styles.errorTitle}>Profile Not Found</h2>
          <p style={styles.errorText}>
            Unable to load your profile. Please try again or contact support.
          </p>
          <button onClick={() => navigate('/dashboard')} style={styles.errorButton}>
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={{
        ...styles.hero,
        background: `linear-gradient(135deg, rgba(230, 57, 70, 0.92) 0%, rgba(29, 53, 87, 0.88) 100%), url(${profileBgImage}) center/cover`
      }}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            {profile.first_name} {profile.last_name}
          </h1>
          <p style={styles.heroSubtitle}>
            Volunteer Profile & Settings
          </p>
          <div style={styles.statusBadgeContainer}>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: profile.status === "active" ? '#d1fae5' : '#fecaca',
              color: profile.status === "active" ? '#065f46' : '#991b1b'
            }}>
              {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)} Member
            </span>
          </div>
        </div>
      </div>

      {/* Message Notification */}
      {message && (
        <div style={styles.messageContainer}>
          <div style={{
            ...styles.message,
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            borderColor: message.type === 'success' ? '#c3e6cb' : '#f5c6cb',
          }}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} style={styles.closeButton}>×</button>
          </div>
        </div>
      )}

      <div style={styles.contentWrapper}>
        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⏱</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.totalHours}</div>
              <div style={styles.statLabel}>Volunteer Hours</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>✓</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.eventsAttended}</div>
              <div style={styles.statLabel}>Events Attended</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📅</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.upcomingEvents}</div>
              <div style={styles.statLabel}>Upcoming Events</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📆</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.memberMonths}</div>
              <div style={styles.statLabel}>Months as Member</div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={styles.twoColumnGrid}>
          {/* Profile Information Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={styles.editButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Edit Profile
                </button>
              )}
            </div>
            <div style={styles.cardBody}>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Full Name</div>
                  <div style={styles.infoValue}>{profile.first_name} {profile.last_name}</div>
                </div>

                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Email Address</div>
                  <div style={styles.infoValue}>{profile.email || "Not provided"}</div>
                </div>

                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Phone Number</div>
                  <div style={styles.infoValue}>{profile.phone || "Not provided"}</div>
                </div>

                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>T-Shirt Size</div>
                  <div style={styles.infoValue}>{profile.t_shirt_size || "Not specified"}</div>
                </div>

                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Member Since</div>
                  <div style={styles.infoValue}>
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </div>
                </div>

                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Last Updated</div>
                  <div style={styles.infoValue}>
                    {new Date(profile.updated_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                {isEditing ? 'Edit Your Information' : 'Quick Actions'}
              </h2>
            </div>
            <div style={styles.cardBody}>
              {isEditing ? (
                <form onSubmit={handleSubmit} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label htmlFor="email" style={styles.formLabel}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      style={styles.input}
                      required
                    />
                    <small style={styles.helpText}>
                      You will need to verify your new email address
                    </small>
                  </div>

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
                    <small style={styles.helpText}>
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
                    <small style={styles.helpText}>
                      For volunteer appreciation events and giveaways
                    </small>
                  </div>

                  <div style={styles.formActions}>
                    <button
                      type="button"
                      onClick={handleCancel}
                      style={styles.cancelButton}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.neutral[200]}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.neutral[100]}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        ...styles.submitButton,
                        ...(saving ? { opacity: 0.6, cursor: 'not-allowed' } : {})
                      }}
                      onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#c72e3a')}
                      onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = theme.colors.primary)}
                    >
                      {saving ? "Saving Changes..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={styles.quickActions}>
                  <button
                    onClick={() => navigate('/dashboard')}
                    style={styles.quickActionButton}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={styles.quickActionIcon}>🏠</div>
                    <div style={styles.quickActionText}>
                      <div style={styles.quickActionTitle}>Dashboard</div>
                      <div style={styles.quickActionDesc}>View your volunteer dashboard</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/events')}
                    style={styles.quickActionButton}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={styles.quickActionIcon}>🔍</div>
                    <div style={styles.quickActionText}>
                      <div style={styles.quickActionTitle}>Browse Events</div>
                      <div style={styles.quickActionDesc}>Find volunteer opportunities</div>
                    </div>
                  </button>

                  <button
                    onClick={() => window.open('/Volunteer Handbook 2025.pdf', '_blank')}
                    style={styles.quickActionButton}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={styles.quickActionIcon}>📚</div>
                    <div style={styles.quickActionText}>
                      <div style={styles.quickActionTitle}>Handbook</div>
                      <div style={styles.quickActionDesc}>View volunteer resources</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      ...styles.quickActionButton,
                      border: `2px solid ${theme.colors.primary}`,
                      backgroundColor: theme.colors.primary + '10'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.backgroundColor = theme.colors.primary + '20'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.backgroundColor = theme.colors.primary + '10'
                    }}
                  >
                    <div style={styles.quickActionIcon}>✏</div>
                    <div style={styles.quickActionText}>
                      <div style={styles.quickActionTitle}>Edit Profile</div>
                      <div style={styles.quickActionDesc}>Update your information</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Details Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Account Details</h2>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <div style={styles.detailIcon}>🔐</div>
                <div style={styles.detailContent}>
                  <div style={styles.detailTitle}>Account Security</div>
                  <div style={styles.detailText}>
                    Your account is secured with Supabase authentication
                  </div>
                </div>
              </div>

              <div style={styles.detailItem}>
                <div style={styles.detailIcon}>📧</div>
                <div style={styles.detailContent}>
                  <div style={styles.detailTitle}>Email Notifications</div>
                  <div style={styles.detailText}>
                    Receive updates about events and volunteer opportunities
                  </div>
                </div>
              </div>

              <div style={styles.detailItem}>
                <div style={styles.detailIcon}>🔒</div>
                <div style={styles.detailContent}>
                  <div style={styles.detailTitle}>Privacy</div>
                  <div style={styles.detailText}>
                    Your information is kept confidential and secure
                  </div>
                </div>
              </div>

              <div style={styles.detailItem}>
                <div style={styles.detailIcon}>💬</div>
                <div style={styles.detailContent}>
                  <div style={styles.detailTitle}>Need Help?</div>
                  <div style={styles.detailText}>
                    Contact Angelina Codi, Volunteer Coordinator
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 72px)',
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.fontFamily,
  } as React.CSSProperties,

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 72px)',
    gap: '1rem',
  } as React.CSSProperties,

  spinner: {
    width: '48px',
    height: '48px',
    border: `4px solid ${theme.colors.neutral[200]}`,
    borderTop: `4px solid ${theme.colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  } as React.CSSProperties,

  loadingText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.base,
  } as React.CSSProperties,

  errorCard: {
    maxWidth: '600px',
    margin: '4rem auto',
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.lg,
    textAlign: 'center' as const,
  } as React.CSSProperties,

  errorTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: '1rem',
  } as React.CSSProperties,

  errorText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: '2rem',
    lineHeight: theme.typography.lineHeight.relaxed,
  } as React.CSSProperties,

  errorButton: {
    backgroundColor: theme.colors.primary,
    color: 'white',
    padding: '0.75rem 2rem',
    borderRadius: theme.borderRadius.lg,
    border: 'none',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  hero: {
    color: 'white',
    padding: '3.5rem 2rem',
    marginBottom: '2rem',
  } as React.CSSProperties,

  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  } as React.CSSProperties,

  heroTitle: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: '0.75rem',
    lineHeight: theme.typography.lineHeight.tight,
  } as React.CSSProperties,

  heroSubtitle: {
    fontSize: theme.typography.fontSize.xl,
    opacity: 0.95,
    lineHeight: theme.typography.lineHeight.relaxed,
    marginBottom: '1rem',
  } as React.CSSProperties,

  statusBadgeContainer: {
    marginTop: '1.5rem',
  } as React.CSSProperties,

  statusBadge: {
    display: 'inline-block',
    padding: '0.5rem 1.25rem',
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    boxShadow: theme.shadows.sm,
  } as React.CSSProperties,

  messageContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
  } as React.CSSProperties,

  message: {
    padding: '1rem 1.5rem',
    marginBottom: '1.5rem',
    borderRadius: theme.borderRadius.lg,
    border: '1px solid',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: theme.shadows.sm,
  } as React.CSSProperties,

  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'inherit',
    padding: '0',
    lineHeight: '1',
  } as React.CSSProperties,

  contentWrapper: {
    padding: '0 2rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  } as React.CSSProperties,

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  } as React.CSSProperties,

  statCard: {
    backgroundColor: 'white',
    padding: '1.75rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    border: `1px solid ${theme.colors.neutral[200]}`,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  statIcon: {
    fontSize: '2.5rem',
    lineHeight: '1',
  } as React.CSSProperties,

  statContent: {
    flex: '1',
  } as React.CSSProperties,

  statValue: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.tight,
  } as React.CSSProperties,

  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginTop: '0.25rem',
  } as React.CSSProperties,

  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  } as React.CSSProperties,

  card: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    border: `1px solid ${theme.colors.neutral[200]}`,
    overflow: 'hidden',
  } as React.CSSProperties,

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    backgroundColor: theme.colors.neutral[50],
  } as React.CSSProperties,

  cardTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: 0,
  } as React.CSSProperties,

  editButton: {
    backgroundColor: 'transparent',
    color: theme.colors.primary,
    border: `2px solid ${theme.colors.primary}`,
    padding: '0.5rem 1rem',
    borderRadius: theme.borderRadius.base,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  cardBody: {
    padding: '1.5rem',
  } as React.CSSProperties,

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  } as React.CSSProperties,

  infoItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  } as React.CSSProperties,

  infoLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  } as React.CSSProperties,

  infoValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
    wordBreak: 'break-word' as const,
  } as React.CSSProperties,

  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  } as React.CSSProperties,

  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  } as React.CSSProperties,

  formLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  } as React.CSSProperties,

  input: {
    padding: '0.75rem',
    fontSize: theme.typography.fontSize.base,
    border: `2px solid ${theme.colors.neutral[300]}`,
    borderRadius: theme.borderRadius.base,
    transition: 'border-color 0.2s ease',
    fontFamily: theme.typography.fontFamily,
  } as React.CSSProperties,

  helpText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.xs,
    lineHeight: theme.typography.lineHeight.relaxed,
  } as React.CSSProperties,

  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,

  cancelButton: {
    flex: '1',
    backgroundColor: theme.colors.neutral[100],
    color: theme.colors.text.primary,
    border: 'none',
    padding: '0.875rem',
    borderRadius: theme.borderRadius.base,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  submitButton: {
    flex: '1',
    backgroundColor: theme.colors.primary,
    color: 'white',
    border: 'none',
    padding: '0.875rem',
    borderRadius: theme.borderRadius.base,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: theme.shadows.sm,
  } as React.CSSProperties,

  quickActions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  } as React.CSSProperties,

  quickActionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: theme.colors.neutral[50],
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.borderRadius.lg,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left' as const,
  } as React.CSSProperties,

  quickActionIcon: {
    fontSize: '2rem',
    lineHeight: '1',
  } as React.CSSProperties,

  quickActionText: {
    flex: '1',
  } as React.CSSProperties,

  quickActionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: '0.25rem',
  } as React.CSSProperties,

  quickActionDesc: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  } as React.CSSProperties,

  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  } as React.CSSProperties,

  detailItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.neutral[200]}`,
  } as React.CSSProperties,

  detailIcon: {
    fontSize: '1.75rem',
    lineHeight: '1',
  } as React.CSSProperties,

  detailContent: {
    flex: '1',
  } as React.CSSProperties,

  detailTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: '0.25rem',
  } as React.CSSProperties,

  detailText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
  } as React.CSSProperties,
}
