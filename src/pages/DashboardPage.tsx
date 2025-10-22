import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { theme } from "../theme"
import { supabase } from "../services/supabaseClient"
import Calendar from "../components/shared/Calendar"

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [showAddHoursModal, setShowAddHoursModal] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [newHoursData, setNewHoursData] = useState({
    hours: '',
    log_date: new Date().toISOString().split('T')[0],
    description: ''
  })
  const [calendarEvents, setCalendarEvents] = useState<Array<any>>([])
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<{
    totalHours: number
    eventsAttended: number
    upcomingEvents: number
    hoursThisMonth: number
    eventsThisMonth: number
    hoursTarget: number
    recentHours: Array<{
      date: string
      event: string
      hours: number
      status: string
    }>
    upcomingEventList: Array<{
      id: string
      title: string
      start_date: string
      status: string
      location?: string
    }>
  }>({
    totalHours: 0,
    eventsAttended: 0,
    upcomingEvents: 0,
    hoursThisMonth: 0,
    eventsThisMonth: 0,
    hoursTarget: 100,
    recentHours: [],
    upcomingEventList: []
  })

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleAddHours = async () => {
    if (!user || !newHoursData.hours) {
      showNotification('error', 'Please fill in all required fields')
      return
    }

    try {
      const { error } = await supabase
        .from('hour_logs')
        .insert({
          volunteer_id: user.id,
          hours: parseFloat(newHoursData.hours),
          log_date: newHoursData.log_date,
          description: newHoursData.description,
          verified_at: null
        })

      if (error) {
        console.error('Error adding hours:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        showNotification('error', `Failed to add hours: ${error.message || 'Please try again.'}`)
        return
      }

      setNewHoursData({
        hours: '',
        log_date: new Date().toISOString().split('T')[0],
        description: ''
      })
      setShowAddHoursModal(false)
      await fetchDashboardData()
      showNotification('success', 'Hours submitted successfully! Awaiting verification.')
    } catch (error) {
      console.error('Unexpected error:', error)
      showNotification('error', 'An unexpected error occurred')
    }
  }

  const fetchDashboardData = async () => {
    if (!user) return
    
    try {
      const { data: assignments } = await supabase
        .from('volunteer_assignments')
        .select('*')
        .eq('volunteer_id', user.id)

      const { data: hourLogs } = await supabase
        .from('hour_logs')
        .select('*')
        .eq('volunteer_id', user.id)
        .order('log_date', { ascending: false })

      const { data: allAssignments } = await supabase
        .from('volunteer_assignments')
        .select(`
          *,
          events:event_id (
            id,
            title,
            start_date,
            end_date,
            location,
            description
          )
        `)
        .eq('volunteer_id', user.id)

      const upcomingEvents = allAssignments?.filter(assignment => {
        if (!assignment.events?.start_date) return false
        const eventDate = new Date(assignment.events.start_date)
        return eventDate > new Date()
      }) || []

      // Only count verified/approved hours
      const totalHours = hourLogs?.filter(log => log.verified_at).reduce((sum, log) => sum + (log.hours || 0), 0) || 0
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      const hoursThisMonth = hourLogs?.filter(log => {
        if (!log.log_date) return false
        const logDate = new Date(log.log_date)
        return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear && log.verified_at
      }).reduce((sum, log) => sum + (log.hours || 0), 0) || 0

      const eventsAttended = assignments?.filter(assignment => 
        assignment.status === 'checked_in' || assignment.status === 'completed'
      ).length || 0

      const eventsThisMonth = assignments?.filter(assignment => {
        if (!assignment.created_at) return false
        const assignmentDate = new Date(assignment.created_at)
        return assignmentDate.getMonth() === currentMonth && 
               assignmentDate.getFullYear() === currentYear &&
               (assignment.status === 'checked_in' || assignment.status === 'completed')
      }).length || 0

      const recentHours = hourLogs?.slice(0, 5).map(log => ({
        date: log.log_date,
        event: log.description || 'Volunteer Activity',
        hours: log.hours || 0,
        status: log.verified_at ? 'Approved' : 'Pending'
      })) || []

      const upcomingEventList = upcomingEvents?.map(assignment => ({
        id: assignment.events?.id || assignment.event_id,
        title: assignment.events?.title || 'Event',
        start_date: assignment.events?.start_date || '',
        location: assignment.events?.location || '',
        status: assignment.status
      })) || []

      setDashboardData({
        totalHours: Math.round(totalHours * 100) / 100,
        eventsAttended,
        upcomingEvents: upcomingEventList.length,
        hoursThisMonth: Math.round(hoursThisMonth * 100) / 100,
        eventsThisMonth,
        hoursTarget: 100,
        recentHours,
        upcomingEventList
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const fetchCalendarEvents = async () => {
    if (!user) return

    try {
      const { data: events } = await supabase
        .from('events')
        .select('id, title, start_date, end_date, location, status')
        .gte('end_date', new Date().toISOString())
        .eq('status', 'active')
        .order('start_date', { ascending: true })
        .limit(20)

      const { data: assignments } = await supabase
        .from('volunteer_assignments')
        .select(`
          id,
          status,
          created_at,
          events:event_id (
            id,
            title,
            start_date,
            end_date,
            location
          )
        `)
        .eq('volunteer_id', user.id)

      const calendarEventsData: Array<any> = []

      if (events) {
        events.forEach(event => {
          const isRegistered = assignments?.some((a: any) => {
            const assignmentEvents = a.events
            return assignmentEvents?.id === event.id
          })
          calendarEventsData.push({
            id: `event-${event.id}`,
            title: event.title,
            start: new Date(event.start_date),
            end: new Date(event.end_date),
            resource: { type: 'event', ...event },
            color: isRegistered ? theme.colors.success : theme.colors.neutral[400]
          })
        })
      }

      if (assignments) {
        assignments.forEach((assignment: any) => {
          if (assignment.events) {
            const statusColor = 
              assignment.status === 'completed' ? theme.colors.success : 
              assignment.status === 'checked_in' ? theme.colors.warning : 
              theme.colors.info
            
            calendarEventsData.push({
              id: `assignment-${assignment.id}`,
              title: `${assignment.events.title} (${assignment.status})`,
              start: new Date(assignment.events.start_date),
              end: new Date(assignment.events.end_date),
              resource: { 
                type: 'assignment', 
                assignmentStatus: assignment.status,
                ...assignment 
              },
              color: statusColor
            })
          }
        })
      }

      setCalendarEvents(calendarEventsData)
    } catch (error) {
      console.error('Error fetching calendar events:', error)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/login")
    } else {
      setLoading(false)
      fetchDashboardData()
      fetchCalendarEvents()
    }
  }, [user, navigate])

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your dashboard...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  const progressPercentage = Math.min((dashboardData.totalHours / dashboardData.hoursTarget) * 100, 100)
  const monthProgressPercentage = Math.min((dashboardData.hoursThisMonth / 20) * 100, 100)

  return (
    <div style={styles.container}>
      {/* Notification Banner */}
      {notification && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da',
          color: notification.type === 'success' ? '#155724' : '#721c24',
          borderColor: notification.type === 'success' ? '#c3e6cb' : '#f5c6cb',
        }}>
          <div style={styles.notificationContent}>
            <span>{notification.type === 'success' ? '✓' : '⚠'} {notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={styles.notificationClose}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Welcome back, {profile?.first_name || 'Volunteer'}! 👋
          </h1>
          <p style={styles.heroSubtitle}>
            Track your impact and manage your volunteer activities
          </p>
        </div>
        <div style={styles.heroActions}>
          <button
            onClick={() => navigate('/events')}
            style={styles.heroPrimaryButton}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Browse Events
          </button>
          <button
            onClick={() => setShowAddHoursModal(true)}
            style={styles.heroSecondaryButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.neutral[100]}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Log Hours
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div style={{
          ...styles.notificationBanner,
          backgroundColor: notification.type === 'success' ? '#d1fae5' : '#fee2e2',
          borderLeft: `4px solid ${notification.type === 'success' ? theme.colors.success : theme.colors.error}`,
        }}>
          <span style={{ 
            color: notification.type === 'success' ? '#065f46' : '#991b1b',
            fontWeight: theme.typography.fontWeight.medium 
          }}>
            {notification.type === 'success' ? '✓ ' : '⚠️ '}
            {notification.message}
          </span>
          <button 
            onClick={() => setNotification(null)}
            style={styles.notificationClose}
          >
            ×
          </button>
        </div>
      )}

      {/* Pending Hours Info */}
      {dashboardData.recentHours.filter(log => log.status === 'Pending').length > 0 && (
        <div style={styles.pendingHoursInfo}>
          <div style={styles.pendingHoursIcon}>⏱️</div>
          <div>
            <div style={styles.pendingHoursTitle}>
              {dashboardData.recentHours.filter(log => log.status === 'Pending').length} hour log(s) awaiting approval
            </div>
            <div style={styles.pendingHoursText}>
              Your submitted hours are being reviewed by an administrator. Once approved, they'll be added to your total.
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderLeft: `4px solid ${theme.colors.primary}`}}>
          <div style={styles.statIcon}>⏱️</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{dashboardData.totalHours}</div>
            <div style={styles.statLabel}>Total Hours</div>
            <div style={styles.statSubtext}>
              {dashboardData.hoursThisMonth} hrs this month
            </div>
          </div>
        </div>

        <div style={{...styles.statCard, borderLeft: `4px solid ${theme.colors.success}`}}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{dashboardData.eventsAttended}</div>
            <div style={styles.statLabel}>Events Attended</div>
            <div style={styles.statSubtext}>
              {dashboardData.eventsThisMonth} this month
            </div>
          </div>
        </div>

        <div style={{...styles.statCard, borderLeft: `4px solid ${theme.colors.info}`}}>
          <div style={styles.statIcon}>🎯</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{dashboardData.upcomingEvents}</div>
            <div style={styles.statLabel}>Upcoming Events</div>
            <div style={styles.statSubtext}>
              {dashboardData.upcomingEvents > 0 ? 'See details below' : 'Register for events'}
            </div>
          </div>
        </div>

        <div style={{...styles.statCard, borderLeft: `4px solid ${theme.colors.warning}`}}>
          <div style={styles.statIcon}>🏆</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{Math.round(progressPercentage)}%</div>
            <div style={styles.statLabel}>Goal Progress</div>
            <div style={styles.statSubtext}>
              {dashboardData.hoursTarget - dashboardData.totalHours > 0 
                ? `${Math.round(dashboardData.hoursTarget - dashboardData.totalHours)} hrs to goal`
                : 'Goal achieved!'}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div style={styles.progressSection}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Annual Goal Progress</h2>
            <span style={styles.cardBadge}>
              {dashboardData.totalHours} / {dashboardData.hoursTarget} hrs
            </span>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.progressBarContainer}>
              <div 
                style={{
                  ...styles.progressBar,
                  width: `${progressPercentage}%`,
                  backgroundColor: progressPercentage >= 100 ? theme.colors.success : theme.colors.primary
                }}
              />
            </div>
            <div style={styles.progressInfo}>
              <span>{Math.round(progressPercentage)}% Complete</span>
              {progressPercentage < 100 && (
                <span>{Math.round(dashboardData.hoursTarget - dashboardData.totalHours)} hours remaining</span>
              )}
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>This Month</h2>
            <span style={styles.cardBadge}>
              {dashboardData.hoursThisMonth} hrs
            </span>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.progressBarContainer}>
              <div 
                style={{
                  ...styles.progressBar,
                  width: `${monthProgressPercentage}%`,
                  backgroundColor: theme.colors.success
                }}
              />
            </div>
            <div style={styles.progressInfo}>
              <span>{Math.round(monthProgressPercentage)}% of 20 hr goal</span>
              <span>{dashboardData.eventsThisMonth} events attended</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={styles.twoColumnGrid}>
        {/* Upcoming Events */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Upcoming Events</h2>
            <button
              onClick={() => navigate('/events')}
              style={styles.viewAllButton}
            >
              View All →
            </button>
          </div>
          <div style={styles.cardBody}>
            {dashboardData.upcomingEventList.length > 0 ? (
              <div style={styles.eventsList}>
                {dashboardData.upcomingEventList.slice(0, 5).map((event) => {
                  const eventDate = new Date(event.start_date)
                  const isToday = eventDate.toDateString() === new Date().toDateString()
                  const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString()
                  
                  return (
                    <div key={event.id} style={styles.eventItem}>
                      <div style={styles.eventDateBadge}>
                        <div style={styles.eventDay}>
                          {eventDate.getDate()}
                        </div>
                        <div style={styles.eventMonth}>
                          {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>
                      <div style={styles.eventInfo}>
                        <div style={styles.eventTitle}>{event.title}</div>
                        <div style={styles.eventMeta}>
                          <span>{eventDate.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                          {event.location && <span> • {event.location}</span>}
                        </div>
                        {(isToday || isTomorrow) && (
                          <div style={{
                            ...styles.eventBadge,
                            backgroundColor: isToday ? '#fef3c7' : '#dbeafe',
                            color: isToday ? '#92400e' : '#1e40af'
                          }}>
                            {isToday ? 'Today' : 'Tomorrow'}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📅</div>
                <p style={styles.emptyStateText}>No upcoming events</p>
                <button
                  onClick={() => navigate('/events')}
                  style={styles.emptyStateButton}
                >
                  Browse Available Events
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Hours */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Recent Hour Logs</h2>
            <button
              onClick={() => setShowAddHoursModal(true)}
              style={styles.viewAllButton}
            >
              Add Hours +
            </button>
          </div>
          <div style={styles.cardBody}>
            {dashboardData.recentHours.length > 0 ? (
              <div style={styles.hoursList}>
                {dashboardData.recentHours.map((log, index) => (
                  <div key={index} style={styles.hoursItem}>
                    <div style={styles.hoursInfo}>
                      <div style={styles.hoursEvent}>{log.event}</div>
                      <div style={styles.hoursDate}>
                        {new Date(log.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div style={styles.hoursRight}>
                      <div style={styles.hoursValue}>{log.hours} hrs</div>
                      <div style={{
                        ...styles.statusBadge,
                        backgroundColor: log.status === 'Approved' ? '#d1fae5' : '#fef3c7',
                        color: log.status === 'Approved' ? '#065f46' : '#92400e'
                      }}>
                        {log.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>⏱️</div>
                <p style={styles.emptyStateText}>No hours logged yet</p>
                <button
                  onClick={() => setShowAddHoursModal(true)}
                  style={styles.emptyStateButton}
                >
                  Log Your First Hours
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Calendar</h2>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            style={styles.toggleButton}
          >
            {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
          </button>
        </div>
        {showCalendar && (
          <div style={styles.cardBody}>
            <Calendar
              events={calendarEvents}
              onSelectEvent={(event) => {
                if (event.resource?.type === 'event') {
                  navigate('/events')
                }
              }}
              height={600}
              showToolbar={true}
            />
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div style={styles.quickActionsGrid}>
        <button
          onClick={() => navigate('/events')}
          style={styles.quickActionCard}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={styles.quickActionIcon}>🔍</div>
          <div style={styles.quickActionTitle}>Find Events</div>
          <div style={styles.quickActionDesc}>Browse available opportunities</div>
        </button>

        <button
          onClick={() => navigate('/profile')}
          style={styles.quickActionCard}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={styles.quickActionIcon}>👤</div>
          <div style={styles.quickActionTitle}>My Profile</div>
          <div style={styles.quickActionDesc}>Update your information</div>
        </button>

        <button
          onClick={() => setShowAddHoursModal(true)}
          style={styles.quickActionCard}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={styles.quickActionIcon}>📝</div>
          <div style={styles.quickActionTitle}>Log Hours</div>
          <div style={styles.quickActionDesc}>Submit volunteer hours</div>
        </button>

        <button
          onClick={() => window.open('/Volunteer Handbook 2025.pdf', '_blank')}
          style={styles.quickActionCard}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={styles.quickActionIcon}>📚</div>
          <div style={styles.quickActionTitle}>Resources</div>
          <div style={styles.quickActionDesc}>View handbook & guides</div>
        </button>
      </div>

      {/* Add Hours Modal */}
      {showAddHoursModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddHoursModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Log Volunteer Hours</h2>
              <button
                onClick={() => setShowAddHoursModal(false)}
                style={styles.modalCloseButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.neutral[100]}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Hours Worked *</label>
                <input
                  type="number"
                  value={newHoursData.hours}
                  onChange={(e) => setNewHoursData({...newHoursData, hours: e.target.value})}
                  placeholder="0"
                  step="0.5"
                  min="0"
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Date *</label>
                <input
                  type="date"
                  value={newHoursData.log_date}
                  onChange={(e) => setNewHoursData({...newHoursData, log_date: e.target.value})}
                  style={styles.formInput}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Description (Optional)</label>
                <textarea
                  value={newHoursData.description}
                  onChange={(e) => setNewHoursData({...newHoursData, description: e.target.value})}
                  placeholder="Describe your volunteer activities..."
                  rows={3}
                  style={styles.formTextarea}
                />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowAddHoursModal(false)}
                style={styles.modalCancelButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.neutral[200]}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.neutral[100]}
              >
                Cancel
              </button>
              <button
                onClick={handleAddHours}
                style={styles.modalSubmitButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c72e3a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary}
              >
                Submit Hours
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    )
  }

  const styles = {
    container: {
      minHeight: 'calc(100vh - 72px)',
    backgroundColor: '#f8f9fa',
      fontFamily: theme.typography.fontFamily,
      padding: '2rem',
    animation: 'fadeIn 0.5s ease',
    } as React.CSSProperties,
    
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
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

  notification: {
    position: 'fixed' as const,
    top: '90px',
    right: '2rem',
    zIndex: 9999,
    padding: '1rem 1.5rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.lg,
    border: '1px solid',
    animation: 'fadeIn 0.3s ease',
    minWidth: '300px',
  } as React.CSSProperties,

  notificationBanner: {
    padding: '1rem 1.5rem',
    borderRadius: theme.borderRadius.lg,
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    animation: 'fadeIn 0.3s ease',
  } as React.CSSProperties,

  notificationClose: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'inherit',
    opacity: 0.7,
    transition: theme.transitions.fast,
  } as React.CSSProperties,

  pendingHoursInfo: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem 1.5rem',
    backgroundColor: '#fef3c7',
    borderRadius: theme.borderRadius.lg,
    marginBottom: '1.5rem',
    borderLeft: `4px solid ${theme.colors.warning}`,
    animation: 'fadeIn 0.3s ease',
  } as React.CSSProperties,

  pendingHoursIcon: {
    fontSize: '2rem',
    flexShrink: 0,
  } as React.CSSProperties,

  pendingHoursTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#92400e',
    marginBottom: '0.25rem',
  } as React.CSSProperties,

  pendingHoursText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#78350f',
    lineHeight: theme.typography.lineHeight.relaxed,
  } as React.CSSProperties,

  notificationContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  } as React.CSSProperties,

  hero: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: '2.5rem',
      marginBottom: '2rem',
    boxShadow: theme.shadows.sm,
    border: `1px solid ${theme.colors.neutral[200]}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '2rem',
    } as React.CSSProperties,
    
  heroContent: {
    flex: '1',
    minWidth: '250px',
  } as React.CSSProperties,

  heroTitle: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: '0.5rem',
    lineHeight: theme.typography.lineHeight.tight,
    } as React.CSSProperties,
    
  heroSubtitle: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
    } as React.CSSProperties,

  heroActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  heroPrimaryButton: {
    backgroundColor: theme.colors.primary,
    color: 'white',
    padding: '0.875rem 2rem',
    borderRadius: theme.borderRadius.lg,
    border: 'none',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: theme.shadows.sm,
  } as React.CSSProperties,

  heroSecondaryButton: {
    backgroundColor: 'transparent',
    color: theme.colors.primary,
    padding: '0.875rem 2rem',
    borderRadius: theme.borderRadius.lg,
    border: `2px solid ${theme.colors.primary}`,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
    boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.neutral[200]}`,
    display: 'flex',
    gap: '1rem',
      transition: 'all 0.2s ease',
    cursor: 'default',
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
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginTop: '0.25rem',
    } as React.CSSProperties,

  statSubtext: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: '0.5rem',
  } as React.CSSProperties,

  progressSection: {
      display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
    marginBottom: '2rem',
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
    boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.neutral[200]}`,
      overflow: 'hidden',
    } as React.CSSProperties,
    
  cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    padding: '1.5rem',
    borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    
  cardTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
    margin: 0,
    } as React.CSSProperties,
    
  cardBadge: {
    backgroundColor: theme.colors.neutral[100],
    color: theme.colors.text.primary,
    padding: '0.375rem 0.75rem',
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    } as React.CSSProperties,
    
  cardBody: {
    padding: '1.5rem',
  } as React.CSSProperties,

  progressBarContainer: {
      width: '100%',
    height: '12px',
      backgroundColor: theme.colors.neutral[200],
    borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    } as React.CSSProperties,
    
  progressBar: {
      height: '100%',
    borderRadius: theme.borderRadius.full,
    transition: 'width 1s ease',
    } as React.CSSProperties,

  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.75rem',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    } as React.CSSProperties,
    
  viewAllButton: {
    backgroundColor: 'transparent',
    color: theme.colors.primary,
    border: 'none',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    borderRadius: theme.borderRadius.base,
    transition: 'all 0.2s ease',
    } as React.CSSProperties,
    
  toggleButton: {
    backgroundColor: theme.colors.primary,
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: theme.borderRadius.base,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  eventsList: {
      display: 'flex',
    flexDirection: 'column' as const,
      gap: '1rem',
    } as React.CSSProperties,
    
  eventItem: {
      display: 'flex',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.neutral[200]}`,
    transition: 'all 0.2s ease',
    } as React.CSSProperties,
    
  eventDateBadge: {
    minWidth: '60px',
    textAlign: 'center' as const,
      backgroundColor: theme.colors.primary,
    color: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: '0.75rem 0.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    } as React.CSSProperties,
    
  eventDay: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: '1',
    } as React.CSSProperties,

  eventMonth: {
    fontSize: theme.typography.fontSize.xs,
    textTransform: 'uppercase' as const,
    marginTop: '0.25rem',
    opacity: 0.9,
    } as React.CSSProperties,
    
  eventInfo: {
    flex: '1',
    } as React.CSSProperties,
    
  eventTitle: {
    fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    marginBottom: '0.25rem',
    } as React.CSSProperties,
    
  eventMeta: {
      fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    } as React.CSSProperties,
    
  eventBadge: {
    display: 'inline-block',
    marginTop: '0.5rem',
    padding: '0.25rem 0.75rem',
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    } as React.CSSProperties,
    
  hoursList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    } as React.CSSProperties,
    
  hoursItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    
  hoursInfo: {
    flex: '1',
    } as React.CSSProperties,
    
  hoursEvent: {
      fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
      marginBottom: '0.25rem',
    } as React.CSSProperties,
    
  hoursDate: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    
  hoursRight: {
      display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '0.5rem',
    } as React.CSSProperties,
    
  hoursValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    } as React.CSSProperties,
    
  statusBadge: {
      padding: '0.25rem 0.75rem',
    borderRadius: theme.borderRadius.full,
      fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    } as React.CSSProperties,

  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem 1rem',
    } as React.CSSProperties,
    
  emptyStateIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    } as React.CSSProperties,
    
  emptyStateText: {
      fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: '1.5rem',
    } as React.CSSProperties,
    
  emptyStateButton: {
    backgroundColor: theme.colors.primary,
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: theme.borderRadius.lg,
    border: 'none',
      fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    } as React.CSSProperties,

  quickActionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    marginBottom: '2rem',
    } as React.CSSProperties,
    
  quickActionCard: {
      backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: theme.borderRadius.lg,
    border: `2px solid ${theme.colors.neutral[200]}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'center' as const,
    boxShadow: theme.shadows.sm,
    } as React.CSSProperties,

  quickActionIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.75rem',
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

    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
    } as React.CSSProperties,

    modal: {
      backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.xl,
    width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto',
    animation: 'fadeIn 0.2s ease',
    } as React.CSSProperties,

    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem',
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,

    modalTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      margin: 0,
    } as React.CSSProperties,

    modalCloseButton: {
      background: 'none',
      border: 'none',
    fontSize: '2rem',
      cursor: 'pointer',
      color: theme.colors.text.secondary,
      padding: '0.25rem',
      borderRadius: theme.borderRadius.base,
    transition: 'all 0.2s ease',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1',
    } as React.CSSProperties,

    modalBody: {
      padding: '1.5rem',
    } as React.CSSProperties,

    formGroup: {
    marginBottom: '1.25rem',
    } as React.CSSProperties,

    formLabel: {
      display: 'block',
      fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
      marginBottom: '0.5rem',
    } as React.CSSProperties,

    formInput: {
      width: '100%',
      padding: '0.75rem',
    border: `2px solid ${theme.colors.neutral[300]}`,
    borderRadius: theme.borderRadius.lg,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily,
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,

    formTextarea: {
      width: '100%',
      padding: '0.75rem',
    border: `2px solid ${theme.colors.neutral[300]}`,
    borderRadius: theme.borderRadius.lg,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily,
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box' as const,
      resize: 'vertical' as const,
    } as React.CSSProperties,

    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      padding: '1.5rem',
      borderTop: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,

    modalCancelButton: {
      backgroundColor: theme.colors.neutral[100],
      color: theme.colors.text.primary,
      padding: '0.75rem 1.5rem',
    borderRadius: theme.borderRadius.lg,
      border: 'none',
      cursor: 'pointer',
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
    transition: 'all 0.2s ease',
    } as React.CSSProperties,

    modalSubmitButton: {
      backgroundColor: theme.colors.primary,
      color: 'white',
      padding: '0.75rem 1.5rem',
    borderRadius: theme.borderRadius.lg,
      border: 'none',
      cursor: 'pointer',
      fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    transition: 'all 0.2s ease',
    boxShadow: theme.shadows.sm,
    } as React.CSSProperties,
  }
