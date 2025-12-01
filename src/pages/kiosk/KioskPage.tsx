import { useState, useEffect } from "react"
import { supabase } from "../../services/supabaseClient"
import { theme } from "../../constants/theme"

interface Volunteer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
}

interface Event {
  id: string
  title: string
  start_date: string
  end_date: string
  location: string
}

interface Shift {
  id: string
  title: string
  start_time: string
  end_time: string
  event_id: string
  events: Event
}

interface Assignment {
  id: string
  volunteer_id: string
  shift_id: string
  status: string
  created_at: string
  volunteers: Volunteer
  shifts: Shift
}

export default function KioskPage() {
  const [volunteerEmail, setVolunteerEmail] = useState("")
  const [volunteerNumber, setVolunteerNumber] = useState("")
  const [lookupMethod, setLookupMethod] = useState<"email" | "number">("number")
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleVolunteerLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (lookupMethod === "email" && !volunteerEmail.trim()) return
    if (lookupMethod === "number" && !volunteerNumber.trim()) return

    setLoading(true)
    setMessage(null)

    try {
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, volunteer_number, status')
      
      // Look up by email or volunteer number
      if (lookupMethod === "email") {
        query = query.eq('email', volunteerEmail.trim().toLowerCase())
      } else {
        // Look up by volunteer number (case-insensitive)
        const searchNumber = volunteerNumber.trim().toUpperCase()
        query = query.ilike('volunteer_number', searchNumber)
      }
      
      const { data: volunteerData, error } = await query.single()

      if (error || !volunteerData) {
        console.error('Volunteer lookup error:', error, 'Search:', lookupMethod === "email" ? volunteerEmail : volunteerNumber)
        const errorMsg = lookupMethod === "email" 
          ? 'Volunteer not found. Please check your email address.'
          : `Volunteer not found with number: ${volunteerNumber.trim().toUpperCase()}. Please check your volunteer number or try using your email address.`
        setMessage({ type: 'error', text: errorMsg })
        setVolunteer(null)
        setAssignments([])
        return
      }

      // Check if volunteer is active
      if (volunteerData.status !== 'active') {
        setMessage({ type: 'error', text: `Volunteer account is ${volunteerData.status}. Please contact the administrator.` })
        setVolunteer(null)
        setAssignments([])
        return
      }

      // If volunteer number lookup but no number in database, suggest using email
      if (lookupMethod === "number" && !volunteerData.volunteer_number) {
        setMessage({ type: 'error', text: 'Volunteer number not found. This account may not have been assigned a volunteer number yet. Please try using your email address instead.' })
        setVolunteer(null)
        setAssignments([])
        return
      }

      setVolunteer(volunteerData)

      // Get today's assignments for this volunteer
      const today = new Date().toISOString().split('T')[0]
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('volunteer_assignments')
        .select(`
          *,
          profiles!volunteer_id(id, first_name, last_name, email, phone),
          shifts!shift_id(
            *,
            events!event_id(*)
          )
        `)
        .eq('volunteer_id', volunteerData.id)
        .in('status', ['registered', 'checked_in'])
        .gte('created_at', today)

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError)
        setMessage({ type: 'error', text: 'Error loading volunteer assignments.' })
        return
      }

      setAssignments(assignmentsData || [])
      
      if (!assignmentsData || assignmentsData.length === 0) {
        setMessage({ type: 'error', text: 'No volunteer assignments found for today.' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (assignment: Assignment) => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('volunteer_assignments')
        .update({ 
          status: 'checked_in',
          checked_in_at: new Date().toISOString()
        })
        .eq('id', assignment.id)

      if (error) {
        console.error('Error checking in:', error)
        setMessage({ type: 'error', text: 'Error checking in. Please try again.' })
        return
      }

      // Update local state
      setAssignments(prev => 
        prev.map(a => 
          a.id === assignment.id 
            ? { ...a, status: 'checked_in' }
            : a
        )
      )

      setMessage({ type: 'success', text: `Successfully checked in for ${assignment.shifts.events.title}!` })
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async (assignment: Assignment) => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('volunteer_assignments')
        .update({ 
          status: 'completed',
          checked_out_at: new Date().toISOString()
        })
        .eq('id', assignment.id)

      if (error) {
        console.error('Error checking out:', error)
        setMessage({ type: 'error', text: 'Error checking out. Please try again.' })
        return
      }

      // Update local state
      setAssignments(prev => 
        prev.map(a => 
          a.id === assignment.id 
            ? { ...a, status: 'completed' }
            : a
        )
      )

      setMessage({ type: 'success', text: `Successfully checked out from ${assignment.shifts.events.title}!` })
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  const resetKiosk = () => {
    setVolunteerEmail("")
    setVolunteerNumber("")
    setVolunteer(null)
    setAssignments([])
    setMessage(null)
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: theme.colors.background,
      fontFamily: theme.typography.fontFamily,
      padding: '2rem',
    } as React.CSSProperties,

    header: {
      textAlign: 'center' as const,
      marginBottom: '3rem',
    } as React.CSSProperties,

    title: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: '1rem',
    } as React.CSSProperties,

    subtitle: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.secondary,
      marginBottom: '2rem',
    } as React.CSSProperties,

    timeDisplay: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      backgroundColor: 'white',
      padding: '1rem 2rem',
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      display: 'inline-block',
    } as React.CSSProperties,

    form: {
      maxWidth: '500px',
      margin: '0 auto 3rem',
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.lg,
    } as React.CSSProperties,

    formGroup: {
      marginBottom: '1.5rem',
    } as React.CSSProperties,

    label: {
      display: 'block',
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
      marginBottom: '0.5rem',
    } as React.CSSProperties,

    input: {
      width: '100%',
      padding: '1rem',
      border: `2px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily,
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,

    button: {
      width: '100%',
      backgroundColor: theme.colors.primary,
      color: 'white',
      border: 'none',
      padding: '1rem 2rem',
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    } as React.CSSProperties,

    volunteerInfo: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      marginBottom: '2rem',
    } as React.CSSProperties,

    volunteerName: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: '0.5rem',
    } as React.CSSProperties,

    volunteerEmail: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      marginBottom: '1rem',
    } as React.CSSProperties,

    assignmentsList: {
      display: 'grid',
      gap: '1rem',
    } as React.CSSProperties,

    assignmentCard: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      border: `2px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,

    eventTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: '0.5rem',
    } as React.CSSProperties,

    shiftInfo: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      marginBottom: '1rem',
    } as React.CSSProperties,

    statusBadge: {
      display: 'inline-block',
      padding: '0.5rem 1rem',
      borderRadius: theme.borderRadius.full,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      textTransform: 'uppercase' as const,
      marginBottom: '1rem',
    } as React.CSSProperties,

    actionButtons: {
      display: 'flex',
      gap: '1rem',
    } as React.CSSProperties,

    checkInButton: {
      flex: 1,
      backgroundColor: theme.colors.success,
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    } as React.CSSProperties,

    checkOutButton: {
      flex: 1,
      backgroundColor: theme.colors.warning,
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    } as React.CSSProperties,

    resetButton: {
      backgroundColor: theme.colors.neutral[100],
      color: theme.colors.text.primary,
      border: `2px solid ${theme.colors.neutral[300]}`,
      padding: '0.75rem 1.5rem',
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as React.CSSProperties,

    message: {
      padding: '1rem',
      borderRadius: theme.borderRadius.base,
      marginBottom: '1rem',
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
    } as React.CSSProperties,

    successMessage: {
      backgroundColor: `${theme.colors.success}20`,
      color: theme.colors.success,
      border: `1px solid ${theme.colors.success}`,
    } as React.CSSProperties,

    errorMessage: {
      backgroundColor: `${theme.colors.error}20`,
      color: theme.colors.error,
      border: `1px solid ${theme.colors.error}`,
    } as React.CSSProperties,

    loading: {
      textAlign: 'center' as const,
      padding: '2rem',
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,

    emptyState: {
      textAlign: 'center' as const,
      padding: '3rem',
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Volunteer Check-In Kiosk</h1>
        <p style={styles.subtitle}>
          Welcome! Please enter your email to check in for your volunteer shift.
        </p>
        <div style={styles.timeDisplay}>
          {currentTime.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          ...styles.message,
          ...(message.type === 'success' ? styles.successMessage : styles.errorMessage)
        }}>
          {message.text}
        </div>
      )}

      {/* Volunteer Lookup Form */}
      {!volunteer && (
        <form style={styles.form} onSubmit={handleVolunteerLookup}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Lookup Method</label>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => {
                  setLookupMethod("number")
                  setVolunteerEmail("")
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: `2px solid ${lookupMethod === "number" ? theme.colors.primary : theme.colors.neutral[300]}`,
                  borderRadius: theme.borderRadius.base,
                  backgroundColor: lookupMethod === "number" ? theme.colors.primary : 'white',
                  color: lookupMethod === "number" ? 'white' : theme.colors.text.primary,
                  cursor: 'pointer',
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                Volunteer Number
              </button>
              <button
                type="button"
                onClick={() => {
                  setLookupMethod("email")
                  setVolunteerNumber("")
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: `2px solid ${lookupMethod === "email" ? theme.colors.primary : theme.colors.neutral[300]}`,
                  borderRadius: theme.borderRadius.base,
                  backgroundColor: lookupMethod === "email" ? theme.colors.primary : 'white',
                  color: lookupMethod === "email" ? 'white' : theme.colors.text.primary,
                  cursor: 'pointer',
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                Email Address
              </button>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              {lookupMethod === "number" ? "Enter Your Volunteer Number" : "Enter Your Email Address"}
            </label>
            {lookupMethod === "number" ? (
              <input
                type="text"
                style={styles.input}
                value={volunteerNumber}
                onChange={(e) => setVolunteerNumber(e.target.value.toUpperCase())}
                placeholder="V-20250115-0001"
                required
                disabled={loading}
                pattern="V-\d{8}-\d{4}"
                title="Format: V-YYYYMMDD-XXXX"
              />
            ) : (
              <input
                type="email"
                style={styles.input}
                value={volunteerEmail}
                onChange={(e) => setVolunteerEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={loading}
              />
            )}
          </div>
          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Looking up...' : 'Find My Assignments'}
          </button>
        </form>
      )}

      {/* Volunteer Information */}
      {volunteer && (
        <div>
          <div style={styles.volunteerInfo}>
            <h2 style={styles.volunteerName}>
              {volunteer.first_name} {volunteer.last_name}
            </h2>
            <p style={styles.volunteerEmail}>{volunteer.email}</p>
            {(volunteer as any).volunteer_number && (
              <p style={{ 
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.secondary,
                marginTop: '0.5rem',
                fontWeight: theme.typography.fontWeight.semibold
              }}>
                Volunteer #: {(volunteer as any).volunteer_number}
              </p>
            )}
            <button
              style={styles.resetButton}
              onClick={resetKiosk}
            >
              Look Up Different Volunteer
            </button>
          </div>

          {/* Assignments */}
          {assignments.length > 0 ? (
            <div style={styles.assignmentsList}>
              {assignments.map((assignment) => (
                <div key={assignment.id} style={styles.assignmentCard}>
                  <h3 style={styles.eventTitle}>
                    {assignment.shifts.events.title}
                  </h3>
                  <p style={styles.shiftInfo}>
                    <strong>Shift:</strong> {assignment.shifts.title}<br />
                    <strong>Time:</strong> {new Date(assignment.shifts.start_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - {new Date(assignment.shifts.end_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}<br />
                    <strong>Location:</strong> {assignment.shifts.events.location}
                  </p>
                  
                  <div style={{
                    ...styles.statusBadge,
                    backgroundColor: assignment.status === 'checked_in' 
                      ? `${theme.colors.success}20` 
                      : `${theme.colors.info}20`,
                    color: assignment.status === 'checked_in' 
                      ? theme.colors.success 
                      : theme.colors.info,
                  }}>
                    {assignment.status === 'checked_in' ? 'Checked In' : 'Registered'}
                  </div>

                  <div style={styles.actionButtons}>
                    {assignment.status === 'registered' && (
                      <button
                        style={styles.checkInButton}
                        onClick={() => handleCheckIn(assignment)}
                        disabled={loading}
                      >
                        Check In
                      </button>
                    )}
                    {assignment.status === 'checked_in' && (
                      <button
                        style={styles.checkOutButton}
                        onClick={() => handleCheckOut(assignment)}
                        disabled={loading}
                      >
                        Check Out
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <h3>No volunteer assignments found for today.</h3>
              <p>Please contact a staff member if you believe this is an error.</p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div style={styles.loading}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: `3px solid ${theme.colors.neutral[300]}`,
            borderTop: `3px solid ${theme.colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
