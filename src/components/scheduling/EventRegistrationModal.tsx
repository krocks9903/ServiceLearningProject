import { useState, useEffect } from "react"
import { supabase } from "../../services/supabaseClient"
import { useAuth } from "../../hooks/useAuth"
import { theme } from "../../theme"

interface Event {
  id: string
  title: string
  description: string
  location: string
  start_date: string
  end_date: string
  max_volunteers: number | null
  status: string
}

interface Shift {
  id: string
  event_id: string
  title: string
  description: string
  start_time: string
  end_time: string
  capacity: number | null
  location?: string
}

interface EventRegistrationModalProps {
  event: Event
  isOpen: boolean
  onClose: () => void
  onRegistrationSuccess?: () => void
}

export default function EventRegistrationModal({ 
  event, 
  isOpen, 
  onClose, 
  onRegistrationSuccess 
}: EventRegistrationModalProps) {
  const { user } = useAuth()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [selectedShift, setSelectedShift] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [shiftsLoading, setShiftsLoading] = useState(false)
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
      maxWidth: "600px",
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
    eventDetail: {
      display: "flex",
      marginBottom: "0.5rem",
      fontSize: theme.typography.fontSize.sm,
    } as React.CSSProperties,
    eventLabel: {
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.secondary,
      minWidth: "80px",
    } as React.CSSProperties,
    eventValue: {
      color: theme.colors.text.primary,
    } as React.CSSProperties,
    shiftSection: {
      marginBottom: "2rem",
    } as React.CSSProperties,
    shiftTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "1rem",
    } as React.CSSProperties,
    shiftCard: {
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      padding: "1rem",
      marginBottom: "1rem",
      cursor: "pointer",
      transition: theme.transitions.base,
    } as React.CSSProperties,
    shiftCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}10`,
    } as React.CSSProperties,
    shiftHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "0.5rem",
    } as React.CSSProperties,
    shiftName: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    } as React.CSSProperties,
    shiftTime: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    shiftDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginBottom: "0.5rem",
    } as React.CSSProperties,
    shiftCapacity: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    buttonGroup: {
      display: "flex",
      gap: "1rem",
      justifyContent: "flex-end",
    } as React.CSSProperties,
    button: {
      padding: "0.75rem 1.5rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: "pointer",
      transition: theme.transitions.base,
      border: "none",
    } as React.CSSProperties,
    primaryButton: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
    } as React.CSSProperties,
    secondaryButton: {
      backgroundColor: "transparent",
      color: theme.colors.text.secondary,
      border: `1px solid ${theme.colors.neutral[300]}`,
    } as React.CSSProperties,
    disabledButton: {
      backgroundColor: theme.colors.neutral[300],
      color: theme.colors.text.secondary,
      cursor: "not-allowed",
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
  }

  const fetchShifts = async () => {
    setShiftsLoading(true)
    try {
      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("event_id", event.id)
        .order("start_time")

      if (error) {
        console.error("Error fetching shifts:", error)
        setError("Failed to load shifts")
        return
      }

      setShifts(data || [])
    } catch (error) {
      console.error("Error fetching shifts:", error)
      setError("Failed to load shifts")
    } finally {
      setShiftsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!selectedShift) {
      setError("Please select a shift")
      return
    }

    if (!user) {
      setError("You must be logged in to register")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check if user is already registered for this shift
      const { data: existingRegistration } = await supabase
        .from("volunteer_assignments")
        .select("id")
        .eq("volunteer_id", user.id)
        .eq("shift_id", selectedShift)
        .single()

      if (existingRegistration) {
        setError("You are already registered for this shift")
        setLoading(false)
        return
      }

      // Register for the shift
      const { error } = await supabase
        .from("volunteer_assignments")
        .insert({
          volunteer_id: user.id,
          shift_id: selectedShift,
          event_id: event.id,
          status: "registered"
        })

      if (error) {
        console.error("Error registering:", error)
        setError("Failed to register for shift")
        return
      }

      setSuccess("Successfully registered for the shift!")
      setTimeout(() => {
        onRegistrationSuccess?.()
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Error registering:", error)
      setError("Failed to register for shift")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  useEffect(() => {
    if (isOpen) {
      fetchShifts()
    }
  }, [isOpen, event.id])

  if (!isOpen) return null

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Register for Event</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.eventInfo}>
            <div style={styles.eventTitle}>{event.title}</div>
            <div style={styles.eventDetail}>
              <span style={styles.eventLabel}>Date:</span>
              <span style={styles.eventValue}>{formatDate(event.start_date)}</span>
            </div>
            <div style={styles.eventDetail}>
              <span style={styles.eventLabel}>Location:</span>
              <span style={styles.eventValue}>{event.location}</span>
            </div>
            <div style={styles.eventDetail}>
              <span style={styles.eventLabel}>Time:</span>
              <span style={styles.eventValue}>
                {formatTime(event.start_date)} - {formatTime(event.end_date)}
              </span>
            </div>
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

          <div style={styles.shiftSection}>
            <h3 style={styles.shiftTitle}>Available Shifts</h3>
            
            {shiftsLoading ? (
              <div style={styles.loading}>Loading shifts...</div>
            ) : shifts.length === 0 ? (
              <div style={styles.loading}>No shifts available for this event.</div>
            ) : (
              shifts.map((shift) => (
                <div
                  key={shift.id}
                  style={{
                    ...styles.shiftCard,
                    ...(selectedShift === shift.id ? styles.shiftCardSelected : {})
                  }}
                  onClick={() => setSelectedShift(shift.id)}
                >
                  <div style={styles.shiftHeader}>
                    <div style={styles.shiftName}>{shift.title}</div>
                    <div style={styles.shiftTime}>
                      {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                    </div>
                  </div>
                  {shift.description && (
                    <div style={styles.shiftDescription}>{shift.description}</div>
                  )}
                  <div style={styles.shiftCapacity}>
                    {shift.max_volunteers 
                      ? `Capacity: ${shift.max_volunteers} volunteers`
                      : "Unlimited capacity"
                    }
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={styles.buttonGroup}>
            <button
              style={{
                ...styles.button,
                ...styles.secondaryButton
              }}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              style={{
                ...styles.button,
                ...(loading ? styles.disabledButton : styles.primaryButton)
              }}
              onClick={handleRegister}
              disabled={loading || !selectedShift}
              onMouseEnter={(e) => {
                if (!loading && selectedShift) {
                  e.currentTarget.style.backgroundColor = '#c72e3a'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && selectedShift) {
                  e.currentTarget.style.backgroundColor = theme.colors.primary
                }
              }}
            >
              {loading ? "Registering..." : "Register for Shift"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
