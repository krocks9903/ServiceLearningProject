import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { theme } from "../theme"
import { supabase } from "../services/supabaseClient"

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [showAddHoursModal, setShowAddHoursModal] = useState(false)
  const [newHoursData, setNewHoursData] = useState({
    event_name: '',
    hours: '',
    log_date: new Date().toISOString().split('T')[0],
    description: ''
  })
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    totalHours: 0,
    eventsAttended: 0,
    upcomingEvents: 0,
    achievements: 0,
    hoursThisMonth: 0,
    eventsThisMonth: 0,
    hoursTarget: 100,
    recentHours: [],
    upcomingEventList: [],
    achievementsList: []
  })

  const handleAddHours = async () => {
    if (!user || !newHoursData.event_name || !newHoursData.hours) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const { error } = await supabase
        .from('hour_logs')
        .insert({
          volunteer_id: user.id,
          event_name: newHoursData.event_name,
          hours: parseFloat(newHoursData.hours),
          log_date: newHoursData.log_date,
          description: newHoursData.description,
          verified_at: null // Needs admin verification
        })

      if (error) {
        console.error('Error adding hours:', error)
        alert('Error adding hours: ' + error.message)
        return
      }

      // Reset form and close modal
      setNewHoursData({
        event_name: '',
        hours: '',
        log_date: new Date().toISOString().split('T')[0],
        description: ''
      })
      setShowAddHoursModal(false)

      // Refresh dashboard data
      await fetchDashboardData()
      alert('Hours added successfully! They will be verified by an administrator.')
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Unexpected error occurred')
    }
  }

  const fetchDashboardData = async () => {
    if (!user) return
    
    try {
      // Fetch volunteer assignments for hours calculation
      const { data: assignments, error: assignmentsError } = await supabase
        .from('volunteer_assignments')
        .select(`
          *,
          shift:shifts(*),
          event:events(*)
        `)
        .eq('volunteer_id', user.id)

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError)
      }

      // Fetch hour logs for actual hours calculation
      const { data: hourLogs, error: hourLogsError } = await supabase
        .from('hour_logs')
        .select('*')
        .eq('volunteer_id', user.id)
        .order('log_date', { ascending: false })

      if (hourLogsError) {
        console.error('Error fetching hour logs:', hourLogsError)
      }

      // Fetch upcoming events that the user is registered for
      // First get all assignments for the user
      const { data: allAssignments, error: allAssignmentsError } = await supabase
        .from('volunteer_assignments')
        .select(`
          *,
          event:events(*)
        `)
        .eq('volunteer_id', user.id)
        .eq('status', 'registered')

      // Filter for upcoming events on the client side
      const upcomingEvents = allAssignments?.filter(assignment => {
        if (!assignment.event?.start_date) return false
        const eventDate = new Date(assignment.event.start_date)
        return eventDate > new Date()
      }) || []

      if (allAssignmentsError) {
        console.error('Error fetching upcoming events:', allAssignmentsError)
      }

      // Calculate real statistics
      const totalHours = hourLogs?.reduce((sum, log) => sum + (log.hours || 0), 0) || 0
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      const hoursThisMonth = hourLogs?.filter(log => {
        if (!log.log_date) return false
        const logDate = new Date(log.log_date)
        const logMonth = logDate.getMonth()
        const logYear = logDate.getFullYear()
        return logMonth === currentMonth && logYear === currentYear
      }).reduce((sum, log) => sum + (log.hours || 0), 0) || 0

      const eventsAttended = assignments?.filter(assignment => 
        assignment.status === 'checked_in' || assignment.status === 'completed'
      ).length || 0

      const eventsThisMonth = assignments?.filter(assignment => {
        if (!assignment.event?.start_date) return false
        const eventDate = new Date(assignment.event.start_date)
        return eventDate.getMonth() === currentMonth && 
               eventDate.getFullYear() === currentYear &&
               (assignment.status === 'checked_in' || assignment.status === 'completed')
      }).length || 0

      // Prepare recent hours data from hour logs
      const recentHours = hourLogs?.slice(0, 5).map(log => ({
        date: log.log_date,
        event: log.event_name || 'Volunteer Activity',
        hours: log.hours || 0,
        status: log.verified_at ? 'Approved' : 'Pending'
      })) || []

      // Prepare upcoming events data
      const upcomingEventList = upcomingEvents?.map(assignment => ({
        id: assignment.event?.id || assignment.id,
        title: assignment.event?.title || 'Event',
        start_date: assignment.event?.start_date || '',
        status: assignment.status
      })) || []

      // For now, we'll use a simple achievement system based on hours
      // In the future, this could be a separate achievements table
      const achievementsList = []
      if (totalHours >= 10) {
        achievementsList.push({ id: '1', title: 'First 10 Hours', awardedDate: new Date().toISOString() })
      }
      if (totalHours >= 25) {
        achievementsList.push({ id: '2', title: '25 Hours Milestone', awardedDate: new Date().toISOString() })
      }
      if (totalHours >= 50) {
        achievementsList.push({ id: '3', title: '50 Hours Achievement', awardedDate: new Date().toISOString() })
      }
      if (eventsAttended >= 5) {
        achievementsList.push({ id: '4', title: 'Event Veteran', awardedDate: new Date().toISOString() })
      }
      if (hoursThisMonth >= 20) {
        achievementsList.push({ id: '5', title: 'Monthly Champion', awardedDate: new Date().toISOString() })
      }

      const realData = {
        totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
        eventsAttended,
        upcomingEvents: upcomingEventList.length,
        achievements: achievementsList.length,
        hoursThisMonth: Math.round(hoursThisMonth * 100) / 100,
        eventsThisMonth,
        hoursTarget: 100, // This could be configurable per user
        recentHours,
        upcomingEventList,
        achievementsList
      }

      setDashboardData(realData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/login")
    } else {
      setLoading(false)
      fetchDashboardData()
    }
  }, [user, navigate])

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
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const styles = {
    container: {
      minHeight: 'calc(100vh - 72px)',
      backgroundColor: theme.colors.background,
      fontFamily: theme.typography.fontFamily,
      padding: '2rem',
    } as React.CSSProperties,
    
    header: {
      marginBottom: '2rem',
      textAlign: 'center' as const,
    } as React.CSSProperties,
    
    headerTitle: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: '0.5rem',
    } as React.CSSProperties,
    
    headerSubtitle: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,

    // Top Stats Grid
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    } as React.CSSProperties,
    
    statCard: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.neutral[200]}`,
      textAlign: 'center' as const,
      transition: 'all 0.2s ease',
    } as React.CSSProperties,
    
    statTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.secondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      marginBottom: '0.5rem',
    } as React.CSSProperties,
    
    statValue: {
      fontSize: '2.5rem',
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: '0.25rem',
    } as React.CSSProperties,
    
    statSubtitle: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,

    // Main Grid Layout
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: '1.5rem',
    } as React.CSSProperties,
    
    section: {
      gridColumn: 'span 12',
    } as React.CSSProperties,
    
    sectionTitle: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: '1rem',
    } as React.CSSProperties,
    
    card: {
      backgroundColor: 'white',
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.neutral[200]}`,
      overflow: 'hidden',
    } as React.CSSProperties,
    
    cardContent: {
      padding: '1.5rem',
    } as React.CSSProperties,

    // Hours Tracker Styles
    progressSection: {
      marginBottom: '2rem',
    } as React.CSSProperties,
    
    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem',
    } as React.CSSProperties,
    
    progressLabel: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
    } as React.CSSProperties,
    
    progressValue: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
    } as React.CSSProperties,
    
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: theme.colors.neutral[200],
      borderRadius: '4px',
      overflow: 'hidden',
    } as React.CSSProperties,
    
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      transition: 'width 0.3s ease',
    } as React.CSSProperties,

    // Chart Styles
    chartPlaceholder: {
      marginBottom: '2rem',
    } as React.CSSProperties,
    
    chartTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: '1rem',
    } as React.CSSProperties,
    
    chartBars: {
      display: 'flex',
      alignItems: 'end',
      gap: '1rem',
      height: '120px',
      padding: '1rem 0',
    } as React.CSSProperties,
    
    chartBar: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '0.5rem',
    } as React.CSSProperties,
    
    chartBarFill: {
      width: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: '2px 2px 0 0',
      minHeight: '4px',
    } as React.CSSProperties,
    
    chartBarLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.fontWeight.medium,
    } as React.CSSProperties,

    // Table Styles
    tableSection: {
      marginTop: '1rem',
    } as React.CSSProperties,
    
    tableHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    } as React.CSSProperties,
    
    tableTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      margin: 0,
    } as React.CSSProperties,
    
    addHoursButton: {
      backgroundColor: theme.colors.primary,
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    } as React.CSSProperties,
    
    table: {
      border: `1px solid ${theme.colors.neutral[200]}`,
      borderRadius: theme.borderRadius.base,
      overflow: 'hidden',
    } as React.CSSProperties,
    
    tableRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 1fr 1fr',
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    
    tableHeaderCell: {
      padding: '0.75rem',
      backgroundColor: theme.colors.neutral[50],
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      borderRight: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    
    tableCell: {
      padding: '0.75rem',
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.primary,
      borderRight: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,

    // Event Styles
    eventItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    
    eventInfo: {
      flex: 1,
    } as React.CSSProperties,
    
    eventTitle: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: '0.25rem',
    } as React.CSSProperties,
    
    eventDate: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    
    eventActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    } as React.CSSProperties,
    
    eventStatus: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.success,
      backgroundColor: `${theme.colors.success}20`,
      padding: '0.25rem 0.5rem',
      borderRadius: theme.borderRadius.full,
      textTransform: 'uppercase' as const,
    } as React.CSSProperties,
    
    viewDetailsButton: {
      backgroundColor: 'transparent',
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.primary}`,
      padding: '0.25rem 0.75rem',
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.xs,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as React.CSSProperties,

    // Achievement Styles
    achievementsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    } as React.CSSProperties,
    
    achievementCard: {
      backgroundColor: theme.colors.neutral[50],
      padding: '1rem',
      borderRadius: theme.borderRadius.base,
      border: `1px solid ${theme.colors.neutral[200]}`,
      textAlign: 'center' as const,
    } as React.CSSProperties,
    
    achievementTitle: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: '0.5rem',
    } as React.CSSProperties,
    
    achievementDate: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,

    // Quick Links Styles
    quickLinksGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    } as React.CSSProperties,
    
    quickLinkButton: {
      backgroundColor: 'white',
      color: theme.colors.primary,
      border: `2px solid ${theme.colors.primary}`,
      padding: '1rem',
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'center' as const,
    } as React.CSSProperties,

    // Modal styles
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    } as React.CSSProperties,

    modal: {
      backgroundColor: 'white',
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.lg,
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto',
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
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: theme.colors.text.secondary,
      padding: '0.25rem',
      borderRadius: theme.borderRadius.base,
      transition: 'background-color 0.2s ease',
    } as React.CSSProperties,

    modalBody: {
      padding: '1.5rem',
    } as React.CSSProperties,

    formGroup: {
      marginBottom: '1rem',
    } as React.CSSProperties,

    formLabel: {
      display: 'block',
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.secondary,
      marginBottom: '0.5rem',
    } as React.CSSProperties,

    formInput: {
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily,
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,

    formTextarea: {
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
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
      borderRadius: theme.borderRadius.base,
      border: 'none',
      cursor: 'pointer',
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      transition: 'background-color 0.2s ease',
    } as React.CSSProperties,

    modalSubmitButton: {
      backgroundColor: theme.colors.primary,
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: theme.borderRadius.base,
      border: 'none',
      cursor: 'pointer',
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      transition: 'background-color 0.2s ease',
    } as React.CSSProperties,
  }

  return (
    <div style={styles.container}>
      {/* Welcome Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>
          Welcome back, {profile?.first_name || 'Volunteer'}!
        </h1>
        <p style={styles.headerSubtitle}>
          Here's your volunteer dashboard with all your activities and achievements.
        </p>
      </div>

      {/* Top Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statTitle}>Total Hours Logged</div>
          <div style={styles.statValue}>{dashboardData.totalHours}</div>
          <div style={styles.statSubtitle}>This Month: {dashboardData.hoursThisMonth}</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statTitle}>Events Attended</div>
          <div style={styles.statValue}>{dashboardData.eventsAttended}</div>
          <div style={styles.statSubtitle}>This Month: {dashboardData.eventsThisMonth || 0}</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statTitle}>Upcoming Events</div>
          <div style={styles.statValue}>{dashboardData.upcomingEvents}</div>
          <div style={styles.statSubtitle}>Registered</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statTitle}>Achievements Earned</div>
          <div style={styles.statValue}>{dashboardData.achievements}</div>
          <div style={styles.statSubtitle}>Total Badges</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={styles.mainGrid}>
        {/* My Hours Tracker Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>My Hours Tracker</h2>
          <div style={styles.card}>
            <div style={styles.cardContent}>
              {/* Progress Bar */}
              <div style={styles.progressSection}>
                <div style={styles.progressHeader}>
                  <span style={styles.progressLabel}>Total Progress</span>
                  <span style={styles.progressValue}>
                    {dashboardData.totalHours} / {dashboardData.hoursTarget} hrs
                  </span>
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${(dashboardData.totalHours / dashboardData.hoursTarget) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Hours Chart Placeholder */}
              <div style={styles.chartPlaceholder}>
                <div style={styles.chartTitle}>Hours by Month</div>
                <div style={styles.chartBars}>
                  {[8, 12, 15, 7, 10].map((height, index) => (
                    <div key={index} style={styles.chartBar}>
                      <div 
                        style={{
                          ...styles.chartBarFill,
                          height: `${height * 10}px`
                        }}
                      ></div>
                      <div style={styles.chartBarLabel}>
                        {['Oct', 'Nov', 'Dec', 'Jan', 'Feb'][index]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hours Table */}
              <div style={styles.tableSection}>
                <div style={styles.tableHeader}>
                  <h3 style={styles.tableTitle}>Recent Hours</h3>
                  <button 
                    style={styles.addHoursButton}
                    onClick={() => setShowAddHoursModal(true)}
                  >
                    Add Hours
                  </button>
                </div>
                <div style={styles.table}>
                  <div style={styles.tableRow}>
                    <div style={styles.tableHeaderCell}>Date</div>
                    <div style={styles.tableHeaderCell}>Event</div>
                    <div style={styles.tableHeaderCell}>Hours</div>
                    <div style={styles.tableHeaderCell}>Status</div>
                  </div>
                  {dashboardData.recentHours.map((entry, index) => (
                    <div key={index} style={styles.tableRow}>
                      <div style={styles.tableCell}>{new Date(entry.date).toLocaleDateString()}</div>
                      <div style={styles.tableCell}>{entry.event}</div>
                      <div style={styles.tableCell}>{entry.hours}</div>
                      <div style={{
                        ...styles.tableCell,
                        color: entry.status === 'Approved' ? theme.colors.success : theme.colors.warning
                      }}>
                        {entry.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Upcoming Events</h2>
          <div style={styles.card}>
            <div style={styles.cardContent}>
              {dashboardData.upcomingEventList.map((event, index) => (
                <div key={index} style={styles.eventItem}>
                  <div style={styles.eventInfo}>
                    <div style={styles.eventTitle}>{event.title}</div>
                    <div style={styles.eventDate}>
                      {new Date(event.start_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div style={styles.eventActions}>
                    <span style={styles.eventStatus}>{event.status}</span>
                    <button style={styles.viewDetailsButton}>View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Achievements</h2>
          <div style={styles.card}>
            <div style={styles.cardContent}>
              <div style={styles.achievementsGrid}>
                {dashboardData.achievementsList.map((achievement, index) => (
                  <div key={index} style={styles.achievementCard}>
                    <div style={styles.achievementTitle}>{achievement.title}</div>
                    <div style={styles.achievementDate}>
                      {new Date(achievement.awardedDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick Links</h2>
          <div style={styles.card}>
            <div style={styles.cardContent}>
              <div style={styles.quickLinksGrid}>
                <button 
                  style={styles.quickLinkButton}
                  onClick={() => navigate('/events')}
                >
                  Register for New Events
                </button>
                <button 
                  style={styles.quickLinkButton}
                  onClick={() => navigate('/profile')}
                >
                  View Profile
                </button>
                <button 
                  style={styles.quickLinkButton}
                  onClick={() => navigate('/documents')}
                >
                  Upload Forms
                </button>
                <button 
                  style={styles.quickLinkButton}
                  onClick={() => {/* TODO: Export functionality */}}
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Hours Modal */}
      {showAddHoursModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add Volunteer Hours</h3>
              <button 
                style={styles.modalCloseButton}
                onClick={() => setShowAddHoursModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Event Name *</label>
                <input
                  type="text"
                  style={styles.formInput}
                  value={newHoursData.event_name}
                  onChange={(e) => setNewHoursData(prev => ({ ...prev, event_name: e.target.value }))}
                  placeholder="e.g., Food Bank Distribution"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Hours *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  style={styles.formInput}
                  value={newHoursData.hours}
                  onChange={(e) => setNewHoursData(prev => ({ ...prev, hours: e.target.value }))}
                  placeholder="e.g., 4.5"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Date</label>
                <input
                  type="date"
                  style={styles.formInput}
                  value={newHoursData.log_date}
                  onChange={(e) => setNewHoursData(prev => ({ ...prev, log_date: e.target.value }))}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Description (Optional)</label>
                <textarea
                  style={styles.formTextarea}
                  value={newHoursData.description}
                  onChange={(e) => setNewHoursData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what you did during this volunteer session..."
                  rows={3}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                style={styles.modalCancelButton}
                onClick={() => setShowAddHoursModal(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.modalSubmitButton}
                onClick={handleAddHours}
              >
                Add Hours
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}