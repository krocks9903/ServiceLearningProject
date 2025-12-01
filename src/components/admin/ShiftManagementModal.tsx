import { useState, useEffect } from "react"
import { supabase } from "../../services/supabaseClient"
import { theme } from "../../theme"
import { convertESTToUTC, convertUTCToEST, formatTimeInEST } from "../../utils/formatDate"

interface Event {
  id: string
  title: string
  description: string
  location: string
  start_date: string
  end_date: string
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
  volunteer_count?: number
}

interface ShiftManagementModalProps {
  event: Event
  isOpen: boolean
  onClose: () => void
  onShiftUpdate?: () => void
}

export default function ShiftManagementModal({ 
  event, 
  isOpen, 
  onClose, 
  onShiftUpdate 
}: ShiftManagementModalProps) {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(false)
  const [shiftsLoading, setShiftsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    capacity: '',
    location: '',
  })

  const styles = {
    overlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(86, 164, 34, 0.5)",
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
      maxWidth: "800px",
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
    section: {
      marginBottom: "2rem",
    } as React.CSSProperties,
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
    } as React.CSSProperties,
    button: {
      padding: "0.5rem 1rem",
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
    dangerButton: {
      backgroundColor: theme.colors.error,
      color: theme.colors.white,
    } as React.CSSProperties,
    shiftCard: {
      border: `1px solid ${theme.colors.neutral[200]}`,
      borderRadius: theme.borderRadius.base,
      padding: "1.5rem",
      marginBottom: "1rem",
      backgroundColor: theme.colors.white,
    } as React.CSSProperties,
    shiftHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "0.75rem",
    } as React.CSSProperties,
    shiftTitle: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
    } as React.CSSProperties,
    shiftTime: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    shiftDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginBottom: "0.75rem",
    } as React.CSSProperties,
    shiftMeta: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    shiftActions: {
      display: "flex",
      gap: "0.5rem",
    } as React.CSSProperties,
    createForm: {
      backgroundColor: theme.colors.neutral[50],
      padding: "1.5rem",
      borderRadius: theme.borderRadius.base,
      marginBottom: "1rem",
    } as React.CSSProperties,
    formTitle: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "1rem",
    } as React.CSSProperties,
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1rem",
      marginBottom: "1rem",
    } as React.CSSProperties,
    formGroup: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.5rem",
    } as React.CSSProperties,
    formLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    } as React.CSSProperties,
    formInput: {
      padding: "0.5rem",
      fontSize: theme.typography.fontSize.sm,
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      fontFamily: theme.typography.fontFamily,
    } as React.CSSProperties,
    formTextarea: {
      padding: "0.5rem",
      fontSize: theme.typography.fontSize.sm,
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      fontFamily: theme.typography.fontFamily,
      minHeight: "80px",
      resize: "vertical" as const,
    } as React.CSSProperties,
    formActions: {
      display: "flex",
      gap: "0.5rem",
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
      padding: "2rem",
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
    } as React.CSSProperties,
  }

  const fetchShifts = async () => {
    setShiftsLoading(true)
    try {
      // Fetch shifts
      const { data: shiftsData, error: shiftsError } = await supabase
        .from("shifts")
        .select("*")
        .eq("event_id", event.id)
        .order("start_time")

      if (shiftsError) {
        console.error("Error fetching shifts:", shiftsError)
        setError("Failed to load shifts")
        return
      }

      // Fetch volunteer assignments count for each shift
      const shiftsWithCount = await Promise.all(
        (shiftsData || []).map(async (shift) => {
          const { count, error: countError } = await supabase
            .from("volunteer_assignments")
            .select("*", { count: "exact", head: true })
            .eq("shift_id", shift.id)

          if (countError) {
            console.error("Error counting assignments:", countError)
          }

          return {
            ...shift,
            volunteer_count: count || 0
          }
        })
      )

      setShifts(shiftsWithCount)
    } catch (error) {
      console.error("Error fetching shifts:", error)
      setError("Failed to load shifts")
    } finally {
      setShiftsLoading(false)
    }
  }

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Convert EST datetime strings to UTC ISO format for database storage
      const startTimeISO = formData.start_time 
        ? convertESTToUTC(formData.start_time)
        : formData.start_time
      const endTimeISO = formData.end_time
        ? convertESTToUTC(formData.end_time)
        : formData.end_time

      const { error } = await supabase
        .from("shifts")
        .insert({
          event_id: event.id,
          title: formData.title,
          description: formData.description,
          start_time: startTimeISO,
          end_time: endTimeISO,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          location: formData.location || event.location,
        })

      if (error) {
        console.error("Error creating shift:", error)
        setError("Failed to create shift")
        return
      }

      setSuccess("Shift created successfully!")
      setShowCreateForm(false)
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        capacity: '',
        location: '',
      })
      fetchShifts()
      onShiftUpdate?.()
    } catch (error) {
      console.error("Error creating shift:", error)
      setError("Failed to create shift")
    } finally {
      setLoading(false)
    }
  }

  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift)
    setFormData({
      title: shift.title,
      description: shift.description || '',
      // Convert UTC dates from database to EST for DatePicker
      start_time: convertUTCToEST(shift.start_time),
      end_time: convertUTCToEST(shift.end_time),
      capacity: shift.capacity?.toString() || '',
      location: shift.location || '',
    })
    setShowCreateForm(true)
  }

  const handleUpdateShift = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!editingShift) return

      // Convert EST datetime strings to UTC ISO format for database storage
      const startTimeISO = formData.start_time 
        ? convertESTToUTC(formData.start_time)
        : formData.start_time
      const endTimeISO = formData.end_time
        ? convertESTToUTC(formData.end_time)
        : formData.end_time

      const { error } = await supabase
        .from("shifts")
        .update({
          title: formData.title,
          description: formData.description,
          start_time: startTimeISO,
          end_time: endTimeISO,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          location: formData.location || event.location,
        })
        .eq("id", editingShift.id)

      if (error) {
        console.error("Error updating shift:", error)
        setError("Failed to update shift")
        return
      }

      setSuccess("Shift updated successfully!")
      setShowCreateForm(false)
      setEditingShift(null)
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        capacity: '',
        location: '',
      })
      fetchShifts()
      onShiftUpdate?.()
    } catch (error) {
      console.error("Error updating shift:", error)
      setError("Failed to update shift")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteShift = async (shiftId: string) => {
    if (!confirm('Are you sure you want to delete this shift? This will also remove all volunteer assignments for this shift.')) return

    try {
      const { error } = await supabase
        .from("shifts")
        .delete()
        .eq("id", shiftId)

      if (error) {
        console.error("Error deleting shift:", error)
        setError("Failed to delete shift")
        return
      }

      setSuccess("Shift deleted successfully!")
      fetchShifts()
      onShiftUpdate?.()
    } catch (error) {
      console.error("Error deleting shift:", error)
      setError("Failed to delete shift")
    }
  }

  const formatTime = (dateString: string) => {
    return formatTimeInEST(dateString)
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
          <h2 style={styles.title}>Manage Shifts</h2>
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

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Shifts</h3>
              <button
                style={{
                  ...styles.button,
                  ...styles.primaryButton
                }}
                onClick={() => {
                  setShowCreateForm(!showCreateForm)
                  setEditingShift(null)
                  setFormData({
                    title: '',
                    description: '',
                    start_time: '',
                    end_time: '',
                    capacity: '',
                    location: '',
                  })
                }}
              >
                {showCreateForm ? 'Cancel' : '+ Create Shift'}
              </button>
            </div>

            {showCreateForm && (
              <div style={styles.createForm}>
                <h4 style={styles.formTitle}>
                  {editingShift ? 'Edit Shift' : 'Create New Shift'}
                </h4>
                <form onSubmit={editingShift ? handleUpdateShift : handleCreateShift}>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Shift Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        style={styles.formInput}
                        required
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Start Time *</label>
                      <input
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                        style={styles.formInput}
                        required
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>End Time *</label>
                      <input
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                        style={styles.formInput}
                        required
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Max Volunteers</label>
                      <input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                        style={styles.formInput}
                        min="1"
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        style={styles.formInput}
                        placeholder={event.location}
                      />
                    </div>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      style={styles.formTextarea}
                      placeholder="Describe what volunteers will be doing during this shift..."
                    />
                  </div>
                  
                  <div style={styles.formActions}>
                    <button
                      type="submit"
                      style={{
                        ...styles.button,
                        ...styles.primaryButton
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : (editingShift ? 'Update Shift' : 'Create Shift')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false)
                        setEditingShift(null)
                        setFormData({
                          title: '',
                          description: '',
                          start_time: '',
                          end_time: '',
                          capacity: '',
                          location: '',
                        })
                      }}
                      style={{
                        ...styles.button,
                        ...styles.secondaryButton
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {shiftsLoading ? (
              <div style={styles.loading}>Loading shifts...</div>
            ) : shifts.length === 0 ? (
              <div style={styles.emptyState}>
                No shifts created for this event yet.
              </div>
            ) : (
              shifts.map((shift) => (
                <div key={shift.id} style={styles.shiftCard}>
                  <div style={styles.shiftHeader}>
                    <div style={styles.shiftTitle}>{shift.title}</div>
                    <div style={styles.shiftTime}>
                      {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                    </div>
                  </div>
                  {shift.description && (
                    <div style={styles.shiftDescription}>{shift.description}</div>
                  )}
                  <div style={styles.shiftMeta}>
                    <span>
                      {shift.volunteer_count || 0} / {shift.capacity || '∞'} volunteers
                    </span>
                    <div style={styles.shiftActions}>
                      <button
                        style={{
                          ...styles.button,
                          ...styles.secondaryButton,
                          fontSize: theme.typography.fontSize.xs,
                          padding: "0.25rem 0.5rem"
                        }}
                        onClick={() => handleEditShift(shift)}
                      >
                        Edit
                      </button>
                      <button
                        style={{
                          ...styles.button,
                          ...styles.dangerButton,
                          fontSize: theme.typography.fontSize.xs,
                          padding: "0.25rem 0.5rem"
                        }}
                        onClick={() => handleDeleteShift(shift.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
