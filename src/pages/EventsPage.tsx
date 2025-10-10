import { useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"
import { useAuth } from "../hooks/useAuth"
import { theme } from "../theme"
import EventRegistrationModal from "../components/scheduling/EventRegistrationModal"
import VolunteerRecommendations from "../components/ai/VolunteerRecommendations"

interface Event {
  id: string
  title: string
  description: string
  location: string
  start_date: string
  end_date: string
  max_volunteers: number | null
  status: string
  volunteer_count?: number
}

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  
  // Professional stock imagery
  const defaultEventImage = "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=80"

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          shifts(id),
          volunteer_assignments(count)
        `)
        .eq("status", "active")
        .order("start_date", { ascending: true })
        .limit(20)

      if (error) {
        console.error("Error:", error)
        setMessage({ type: 'error', text: 'Failed to load events' })
      } else {
        // Transform data to include volunteer count
        const eventsWithCount = data?.map(event => ({
          ...event,
          volunteer_count: event.volunteer_assignments?.[0]?.count || 0
        })) || []
        setEvents(eventsWithCount)
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage({ type: 'error', text: 'Failed to load events' })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEventRegistration = (event: Event) => {
    setSelectedEvent(event)
    setShowRegistrationModal(true)
  }

  const handleRegistrationSuccess = () => {
    fetchEvents() // Refresh events to update volunteer counts
    setMessage({ type: 'success', text: 'Successfully registered for the event!' })
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '4rem', 
        textAlign: 'center',
        fontFamily: theme.typography.fontFamily,
      }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: `3px solid ${theme.colors.neutral[300]}`,
          borderTop: `3px solid ${theme.colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <p style={{ 
          marginTop: '1rem',
          color: theme.colors.text.secondary,
          fontSize: theme.typography.fontSize.sm,
        }}>Loading events...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 72px)', 
      backgroundColor: theme.colors.background,
      fontFamily: theme.typography.fontFamily,
    }}>
      {/* Hero Section */}
      <div style={{
        background: `linear-gradient(135deg, rgba(230, 57, 70, 0.92) 0%, rgba(29, 53, 87, 0.88) 100%), url(${defaultEventImage}) center/cover`,
        color: 'white',
        padding: '3.5rem 2rem',
        marginBottom: '2rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: theme.typography.fontSize['5xl'], 
            fontWeight: theme.typography.fontWeight.bold, 
            marginBottom: '0.75rem',
            lineHeight: theme.typography.lineHeight.tight,
          }}>
            Volunteer Opportunities
          </h1>
          <p style={{ 
            fontSize: theme.typography.fontSize.xl, 
            opacity: 0.95,
            lineHeight: theme.typography.lineHeight.relaxed,
          }}>
            Join us in the fight to end hunger in Southwest Florida
          </p>
        </div>
      </div>

      <div style={{ padding: '0 2rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {message && (
          <div style={{
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            borderRadius: '8px',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>{message.type === 'success' ? '✓ ' : '⚠️ '}{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'inherit',
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* AI-Powered Volunteer Recommendations */}
        {user && events.length > 0 && (
          <VolunteerRecommendations
            volunteerProfile={user}
            availableEvents={events}
            onEventSelect={(eventId) => {
              const event = events.find(e => e.id === eventId)
              if (event) {
                handleEventRegistration(event)
              }
            }}
          />
        )}

        {events.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '4rem 2rem',
            borderRadius: theme.borderRadius.lg,
            textAlign: 'center',
            boxShadow: theme.shadows.md,
            border: `1px solid ${theme.colors.neutral[200]}`,
          }}>
            <h2 style={{ 
              color: theme.colors.secondary, 
              marginBottom: '1rem',
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.bold,
            }}>
              No Events Available
            </h2>
            <p style={{ 
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.base,
            }}>
              Check back soon for new volunteer opportunities!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
            {events.map(event => (
              <div
                key={event.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{
                  height: '180px',
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  position: 'relative' as const,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    fontSize: theme.typography.fontSize['4xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    opacity: 0.15,
                    position: 'absolute' as const,
                    userSelect: 'none' as const,
                  }}>
                    EVENT
                  </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ 
                    color: theme.colors.secondary, 
                    marginBottom: '0.75rem',
                    fontSize: theme.typography.fontSize['2xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    lineHeight: theme.typography.lineHeight.tight,
                  }}>
                    {event.title}
                  </h3>
                  <p style={{ 
                    color: theme.colors.text.secondary, 
                    marginBottom: '1.25rem',
                    lineHeight: theme.typography.lineHeight.relaxed,
                    fontSize: theme.typography.fontSize.sm,
                  }}>
                    {event.description}
                  </p>
                  <div style={{ 
                    display: 'grid', 
                    gap: '0.75rem', 
                    marginBottom: '1.25rem',
                    padding: '1rem',
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: theme.borderRadius.base,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <span style={{ 
                        color: theme.colors.text.secondary, 
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                        minWidth: '70px',
                      }}>
                        Location:
                      </span>
                      <span style={{ color: theme.colors.text.primary, fontSize: theme.typography.fontSize.sm }}>
                        {event.location}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <span style={{ 
                        color: theme.colors.text.secondary, 
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                        minWidth: '70px',
                      }}>
                        Start:
                      </span>
                      <span style={{ color: theme.colors.text.primary, fontSize: theme.typography.fontSize.sm }}>
                        {formatDate(event.start_date)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <span style={{ 
                        color: theme.colors.text.secondary, 
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                        minWidth: '70px',
                      }}>
                        End:
                      </span>
                      <span style={{ color: theme.colors.text.primary, fontSize: theme.typography.fontSize.sm }}>
                        {formatDate(event.end_date)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <span style={{ 
                        color: theme.colors.text.secondary, 
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                        minWidth: '70px',
                      }}>
                        Capacity:
                      </span>
                      <span style={{ color: theme.colors.text.primary, fontSize: theme.typography.fontSize.sm }}>
                        {event.volunteer_count || 0} / {event.max_volunteers || '∞'} volunteers
                      </span>
                    </div>
                  </div>
                  {user ? (
                    <button
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        backgroundColor: theme.colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: theme.borderRadius.base,
                        cursor: 'pointer',
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                        transition: theme.transitions.base,
                        boxShadow: theme.shadows.sm,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#c72e3a'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.primary
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                      onClick={() => handleEventRegistration(event)}
                    >
                      Register for Event
                    </button>
                  ) : (
                    <button
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        backgroundColor: 'transparent',
                        color: theme.colors.text.primary,
                        border: `2px solid ${theme.colors.neutral[300]}`,
                        borderRadius: theme.borderRadius.base,
                        cursor: 'pointer',
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                        transition: theme.transitions.base,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.neutral[100]}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => setMessage({ type: 'error', text: 'Please log in to register for events' })}
                    >
                      Login to Register
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Registration Modal */}
      {selectedEvent && (
        <EventRegistrationModal
          event={selectedEvent}
          isOpen={showRegistrationModal}
          onClose={() => {
            setShowRegistrationModal(false)
            setSelectedEvent(null)
          }}
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  )
}
