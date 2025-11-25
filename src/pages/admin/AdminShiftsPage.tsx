import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../services/supabaseClient"
import { useAdminAuth } from "../../hooks/useAdminAuth"
import { theme } from "../../theme"
import ShiftManagementModal from "../../components/admin/ShiftManagementModal"
import DatePicker from "../../components/shared/DatePicker"
import VolunteerAssignmentsModal from "../../components/admin/VolunteerAssignmentsModal"

interface Event {
  id: string
  title: string
  description: string
  location: string
  start_date: string
  end_date: string
  max_volunteers: number | null
  status: string
  created_at: string
  volunteer_count?: number
}

export default function AdminShiftsPage() {
  const { user, isAdmin, signOut } = useAdminAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    max_volunteers: '',
    is_private: false,
  })

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
    backButton: {
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
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "2rem",
    } as React.CSSProperties,
    pageHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem",
    } as React.CSSProperties,
    pageTitle: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "0.5rem",
    } as React.CSSProperties,
    pageSubtitle: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.lg,
    } as React.CSSProperties,
    createButton: {
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
    eventsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
      gap: "1.5rem",
    } as React.CSSProperties,
    eventCard: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.neutral[200]}`,
      overflow: "hidden",
    } as React.CSSProperties,
    eventHeader: {
      padding: "1.5rem",
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    eventTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "0.5rem",
    } as React.CSSProperties,
    eventDescription: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.relaxed,
    } as React.CSSProperties,
    eventContent: {
      padding: "1.5rem",
    } as React.CSSProperties,
    eventInfo: {
      display: "grid",
      gap: "0.75rem",
      marginBottom: "1.5rem",
    } as React.CSSProperties,
    eventInfoRow: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    } as React.CSSProperties,
    eventInfoLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.secondary,
      minWidth: "80px",
    } as React.CSSProperties,
    eventInfoValue: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.primary,
    } as React.CSSProperties,
    eventActions: {
      display: "flex",
      gap: "0.75rem",
    } as React.CSSProperties,
    actionButton: {
      padding: "0.5rem 1rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: "pointer",
      transition: theme.transitions.base,
      border: "none",
    } as React.CSSProperties,
    editButton: {
      backgroundColor: theme.colors.info,
      color: theme.colors.white,
    } as React.CSSProperties,
    deleteButton: {
      backgroundColor: theme.colors.error,
      color: theme.colors.white,
    } as React.CSSProperties,
    createForm: {
      backgroundColor: theme.colors.white,
      padding: "2rem",
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.lg,
      border: `1px solid ${theme.colors.neutral[200]}`,
      marginBottom: "2rem",
    } as React.CSSProperties,
    formTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "1.5rem",
    } as React.CSSProperties,
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "1rem",
      marginBottom: "1.5rem",
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
      padding: "0.75rem",
      fontSize: theme.typography.fontSize.base,
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      fontFamily: theme.typography.fontFamily,
    } as React.CSSProperties,
    formTextarea: {
      padding: "0.75rem",
      fontSize: theme.typography.fontSize.base,
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      fontFamily: theme.typography.fontFamily,
      minHeight: "100px",
      resize: "vertical" as const,
    } as React.CSSProperties,
    formActions: {
      display: "flex",
      gap: "1rem",
    } as React.CSSProperties,
    submitButton: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: "none",
      padding: "0.75rem 1.5rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: "pointer",
      transition: theme.transitions.base,
    } as React.CSSProperties,
    cancelButton: {
      backgroundColor: "transparent",
      color: theme.colors.text.secondary,
      border: `1px solid ${theme.colors.neutral[300]}`,
      padding: "0.75rem 1.5rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.base,
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
      marginBottom: "1rem",
    } as React.CSSProperties,
    emptyState: {
      textAlign: "center" as const,
      padding: "3rem",
      color: theme.colors.text.secondary,
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
  }

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/admin/login")
      return
    }
    fetchEvents()
  }, [user, isAdmin, navigate])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) {
        console.error('Error fetching events:', error)
        setError('Failed to load events')
        return
      }

      // Fetch volunteer count for each event
      const eventsWithCount = await Promise.all(
        (data || []).map(async (event) => {
          const { count, error: countError } = await supabase
            .from('volunteer_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)

          if (countError) {
            console.error('Error counting assignments:', countError)
          }

          return {
            ...event,
            volunteer_count: count || 0
          }
        })
      )

      setEvents(eventsWithCount)
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: newEvent, error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          start_date: formData.start_date,
          end_date: formData.end_date,
          max_volunteers: formData.max_volunteers ? parseInt(formData.max_volunteers) : null,
          is_private: formData.is_private,
          status: 'active'
        })
        .select()
        .single()

      if (error) {
        setError(error.message)
        return
      }

      setShowCreateForm(false)
      setFormData({
        title: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        max_volunteers: '',
        is_private: false,
      })
      fetchEvents()
    } catch (error) {
      setError('Failed to create event')
      console.error('Error creating event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      start_date: event.start_date.substring(0, 16), // Format for datetime-local input
      end_date: event.end_date.substring(0, 16),
      max_volunteers: event.max_volunteers?.toString() || '',
      is_private: (event as any).is_private || false,
    })
    setShowCreateForm(true)
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!editingEvent) return

      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          start_date: formData.start_date,
          end_date: formData.end_date,
          max_volunteers: formData.max_volunteers ? parseInt(formData.max_volunteers) : null,
          is_private: formData.is_private,
        })
        .eq('id', editingEvent.id)

      if (error) {
        setError(error.message)
        return
      }

      setShowCreateForm(false)
      setEditingEvent(null)
      setFormData({
        title: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        max_volunteers: '',
        is_private: false,
      })
      fetchEvents()
    } catch (error) {
      setError('Failed to update event')
      console.error('Error updating event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This will also delete all associated shifts and volunteer assignments.')) return

    setLoading(true)
    setError(null)

    try {
      const { error, data } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .select()

      if (error) {
        console.error('Delete error:', error)
        setError(`Failed to delete event: ${error.message}. ${error.details || ''}`)
        setLoading(false)
        return
      }

      // Success - refresh the events list
      await fetchEvents()
      setError(null)
    } catch (error: any) {
      console.error('Error deleting event:', error)
      setError(`Failed to delete event: ${error?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate("/admin/login")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.success
      case 'cancelled': return theme.colors.error
      case 'completed': return theme.colors.info
      default: return theme.colors.text.secondary
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: theme.colors.text.secondary }}>Loading events...</p>
      </div>
    )
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
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={styles.backButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.white
              e.currentTarget.style.color = theme.colors.secondary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = theme.colors.white
            }}
          >
            ← Dashboard
          </button>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.white
              e.currentTarget.style.color = theme.colors.secondary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = theme.colors.white
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <main style={styles.main}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Event Management</h1>
            <p style={styles.pageSubtitle}>
              Create and manage volunteer events and shifts
            </p>
          </div>
          <button
            onClick={() => {
              if (showCreateForm) {
                setShowCreateForm(false)
                setEditingEvent(null)
                setFormData({
                  title: '',
                  description: '',
                  location: '',
                  start_date: '',
                  end_date: '',
                  max_volunteers: '',
                  is_private: false,
                })
              } else {
                setShowCreateForm(true)
              }
            }}
            style={styles.createButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c72e3a'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {showCreateForm ? (editingEvent ? 'Cancel Edit' : 'Cancel') : '+ Create Event'}
          </button>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {showCreateForm && (
          <div style={styles.createForm}>
            <h3 style={styles.formTitle}>
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h3>
            <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Event Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    style={styles.formInput}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    style={styles.formInput}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <DatePicker
                    label="Start Date & Time *"
                    value={formData.start_date}
                    onChange={(date) => setFormData({...formData, start_date: date})}
                    placeholder="Select start date and time"
                    showTime={true}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <DatePicker
                    label="End Date & Time *"
                    value={formData.end_date}
                    onChange={(date) => setFormData({...formData, end_date: date})}
                    placeholder="Select end date and time"
                    showTime={true}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Max Volunteers</label>
                  <input
                    type="number"
                    value={formData.max_volunteers}
                    onChange={(e) => setFormData({...formData, max_volunteers: e.target.value})}
                    style={styles.formInput}
                    min="1"
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={styles.formTextarea}
                  placeholder="Describe the event, what volunteers will be doing, etc."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={formData.is_private}
                    onChange={(e) => setFormData({...formData, is_private: e.target.checked})}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={styles.formLabel}>
                    Private Event (only visible to selected volunteers/groups)
                  </span>
                </label>
                {formData.is_private && (
                  <p style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                    marginTop: '0.5rem',
                    fontStyle: 'italic',
                  }}>
                    Note: After creating this event, you can manage which volunteers or groups can see it.
                  </p>
                )}
              </div>
              
              <div style={styles.formActions}>
                <button
                  type="submit"
                  style={styles.submitButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#c72e3a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.primary
                  }}
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingEvent(null)
                    setFormData({
                      title: '',
                      description: '',
                      location: '',
                      start_date: '',
                      end_date: '',
                      max_volunteers: '',
                      is_private: false,
                    })
                  }}
                  style={styles.cancelButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.neutral[100]
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {events.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No events found. Create your first event to get started.</p>
          </div>
        ) : (
          <div style={styles.eventsGrid}>
            {events.map((event) => (
              <div key={event.id} style={styles.eventCard}>
                <div style={styles.eventHeader}>
                  <h3 style={styles.eventTitle}>{event.title}</h3>
                  {event.description && (
                    <p style={styles.eventDescription}>{event.description}</p>
                  )}
                </div>
                
                <div style={styles.eventContent}>
                  <div style={styles.eventInfo}>
                    <div style={styles.eventInfoRow}>
                      <span style={styles.eventInfoLabel}>Location:</span>
                      <span style={styles.eventInfoValue}>{event.location}</span>
                    </div>
                    <div style={styles.eventInfoRow}>
                      <span style={styles.eventInfoLabel}>Start:</span>
                      <span style={styles.eventInfoValue}>{formatDate(event.start_date)}</span>
                    </div>
                    <div style={styles.eventInfoRow}>
                      <span style={styles.eventInfoLabel}>End:</span>
                      <span style={styles.eventInfoValue}>{formatDate(event.end_date)}</span>
                    </div>
                    <div style={styles.eventInfoRow}>
                      <span style={styles.eventInfoLabel}>Volunteers:</span>
                      <span style={styles.eventInfoValue}>
                        {event.volunteer_count} / {event.max_volunteers || '∞'}
                      </span>
                    </div>
                    <div style={styles.eventInfoRow}>
                      <span style={styles.eventInfoLabel}>Status:</span>
                      <span style={{
                        ...styles.eventInfoValue,
                        color: getStatusColor(event.status),
                        fontWeight: theme.typography.fontWeight.semibold
                      }}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                  
                  <div style={styles.eventActions}>
                    <button
                      onClick={() => {
                        setSelectedEvent(event)
                        setShowAssignmentsModal(true)
                      }}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: theme.colors.warning,
                        color: theme.colors.white,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e0a800'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.warning
                      }}
                    >
                      View Volunteers
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEvent(event)
                        setShowShiftModal(true)
                      }}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: theme.colors.success,
                        color: theme.colors.white,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#28a745'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.success
                      }}
                    >
                      Manage Shifts
                    </button>
                    <button
                      onClick={() => handleEditEvent(event)}
                      style={{
                        ...styles.actionButton,
                        ...styles.editButton
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#138496'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.info
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      style={{
                        ...styles.actionButton,
                        ...styles.deleteButton
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#b02a37'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.error
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Shift Management Modal */}
      {selectedEvent && (
        <ShiftManagementModal
          event={selectedEvent}
          isOpen={showShiftModal}
          onClose={() => {
            setShowShiftModal(false)
            setSelectedEvent(null)
          }}
          onShiftUpdate={() => {
            fetchEvents() // Refresh events when shifts are updated
          }}
        />
      )}

      {/* Volunteer Assignments Modal */}
      {selectedEvent && (
        <VolunteerAssignmentsModal
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
          isOpen={showAssignmentsModal}
          onClose={() => {
            setShowAssignmentsModal(false)
            setSelectedEvent(null)
          }}
        />
      )}


      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
