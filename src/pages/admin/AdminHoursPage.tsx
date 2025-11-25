import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../services/supabaseClient"
import { useAdminAuth } from "../../hooks/useAdminAuth"
import { theme } from "../../theme"

interface HourLog {
  id: string
  volunteer_id: string
  hours: number
  log_date: string
  description: string | null
  verified_at: string | null
  created_at: string
  volunteer?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

export default function AdminHoursPage() {
  const { user, isAdmin, signOut } = useAdminAuth()
  const navigate = useNavigate()
  const [hourLogs, setHourLogs] = useState<HourLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified" | "pending">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [showAddHoursModal, setShowAddHoursModal] = useState(false)
  const [editingLog, setEditingLog] = useState<HourLog | null>(null)
  const [volunteerSearch, setVolunteerSearch] = useState("")
  const [volunteerSearchResults, setVolunteerSearchResults] = useState<any[]>([])
  const [selectedVolunteer, setSelectedVolunteer] = useState<any | null>(null)
  const [hoursForm, setHoursForm] = useState({
    hours: "",
    log_date: new Date().toISOString().split('T')[0],
    description: "",
    admin_notes: ""
  })

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
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "0.5rem",
    } as React.CSSProperties,
    subtitle: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.lg,
      marginBottom: "2rem",
    } as React.CSSProperties,
    filters: {
      display: "flex",
      gap: "1rem",
      marginBottom: "2rem",
      flexWrap: "wrap" as const,
      alignItems: "center",
    } as React.CSSProperties,
    searchInput: {
      flex: 1,
      minWidth: "200px",
      padding: "0.75rem",
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily,
    } as React.CSSProperties,
    select: {
      padding: "0.75rem",
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily,
      backgroundColor: theme.colors.white,
      cursor: "pointer",
    } as React.CSSProperties,
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1.5rem",
      marginBottom: "2rem",
    } as React.CSSProperties,
    statCard: {
      backgroundColor: theme.colors.white,
      padding: "1.5rem",
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    statLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginBottom: "0.5rem",
    } as React.CSSProperties,
    statValue: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
    } as React.CSSProperties,
    table: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      overflow: "hidden",
      border: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    tableHeader: {
      backgroundColor: theme.colors.neutral[50],
      padding: "1rem",
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
      gap: "1rem",
      fontWeight: theme.typography.fontWeight.semibold,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    tableRow: {
      padding: "1rem",
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
      gap: "1rem",
      alignItems: "center",
      transition: theme.transitions.base,
    } as React.CSSProperties,
    tableCell: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.primary,
    } as React.CSSProperties,
    badge: {
      padding: "0.25rem 0.75rem",
      borderRadius: theme.borderRadius.full,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      display: "inline-block",
    } as React.CSSProperties,
    badgeVerified: {
      backgroundColor: theme.colors.success + "20",
      color: theme.colors.success,
    } as React.CSSProperties,
    badgePending: {
      backgroundColor: theme.colors.warning + "20",
      color: theme.colors.warning,
    } as React.CSSProperties,
    verifyButton: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: "none",
      padding: "0.5rem 1rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: "pointer",
      transition: theme.transitions.base,
    } as React.CSSProperties,
    unverifyButton: {
      backgroundColor: theme.colors.neutral[300],
      color: theme.colors.text.primary,
      border: "none",
      padding: "0.5rem 1rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: "pointer",
      transition: theme.transitions.base,
    } as React.CSSProperties,
    loadingContainer: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
      gap: "1rem",
    } as React.CSSProperties,
    errorMessage: {
      backgroundColor: theme.colors.error + "20",
      color: theme.colors.error,
      padding: "1rem",
      borderRadius: theme.borderRadius.base,
      marginBottom: "1rem",
    } as React.CSSProperties,
    emptyState: {
      textAlign: "center" as const,
      padding: "3rem",
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
  }

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/admin/login")
      return
    }
    fetchHourLogs()
  }, [user, isAdmin, navigate])

  const fetchHourLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('hour_logs')
        .select(`
          *,
          profiles:volunteer_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('log_date', { ascending: false })

      // Apply date filter
      if (dateFilter !== "all") {
        const now = new Date()
        let startDate: Date
        
        switch (dateFilter) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0))
            break
          case "week":
            startDate = new Date(now.setDate(now.getDate() - 7))
            break
          case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1))
            break
          default:
            startDate = new Date(0)
        }
        
        query = query.gte('log_date', startDate.toISOString().split('T')[0])
      }

      // Apply verification filter
      if (verificationFilter === "verified") {
        query = query.not('verified_at', 'is', null)
      } else if (verificationFilter === "pending") {
        query = query.is('verified_at', null)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching hour logs:', error)
        setError('Failed to load hour logs')
        return
      }

      // Transform data to include volunteer info
      const transformedData = (data || []).map(log => ({
        ...log,
        volunteer: (log as any).profiles || null
      }))

      setHourLogs(transformedData)
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (logId: string, verified: boolean) => {
    try {
      const updateData: any = {
        verified_at: verified ? new Date().toISOString() : null
      }

      const { error } = await supabase
        .from('hour_logs')
        .update(updateData)
        .eq('id', logId)

      if (error) {
        console.error('Error updating hour log:', error)
        setError('Failed to update hour log')
        return
      }

      // Refresh the list
      await fetchHourLogs()
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    }
  }

  const handleSearchVolunteers = async (search: string) => {
    if (search.length < 2) {
      setVolunteerSearchResults([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, volunteer_number')
        .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,volunteer_number.ilike.%${search}%`)
        .eq('status', 'active')
        .limit(10)

      if (error) {
        console.error('Error searching volunteers:', error)
        return
      }

      setVolunteerSearchResults(data || [])
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleAddHours = async () => {
    if (!selectedVolunteer || !hoursForm.hours || !hoursForm.log_date) {
      setError('Please fill in all required fields')
      return
    }

    try {
      const { error } = await supabase
        .from('hour_logs')
        .insert({
          volunteer_id: selectedVolunteer.id,
          hours: parseFloat(hoursForm.hours),
          log_date: hoursForm.log_date,
          description: hoursForm.description || null,
          admin_notes: hoursForm.admin_notes || null,
          added_by_admin: true,
          admin_id: user?.id,
          verified_at: new Date().toISOString() // Auto-verify admin-added hours
        })

      if (error) {
        console.error('Error adding hours:', error)
        setError('Failed to add hours')
        return
      }

      // Reset form and close modal
      setShowAddHoursModal(false)
      setSelectedVolunteer(null)
      setVolunteerSearch("")
      setHoursForm({
        hours: "",
        log_date: new Date().toISOString().split('T')[0],
        description: "",
        admin_notes: ""
      })
      
      // Refresh the list
      await fetchHourLogs()
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    }
  }

  const handleEditHours = async () => {
    if (!editingLog || !hoursForm.hours) {
      setError('Please fill in all required fields')
      return
    }

    try {
      const { error } = await supabase
        .from('hour_logs')
        .update({
          hours: parseFloat(hoursForm.hours),
          log_date: hoursForm.log_date,
          description: hoursForm.description || null,
          admin_notes: hoursForm.admin_notes || null,
          admin_id: user?.id
        })
        .eq('id', editingLog.id)

      if (error) {
        console.error('Error updating hours:', error)
        setError('Failed to update hours')
        return
      }

      // Reset form and close modal
      setEditingLog(null)
      setHoursForm({
        hours: "",
        log_date: new Date().toISOString().split('T')[0],
        description: "",
        admin_notes: ""
      })
      
      // Refresh the list
      await fetchHourLogs()
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    }
  }

  const openEditModal = (log: HourLog) => {
    setEditingLog(log)
    setSelectedVolunteer(log.volunteer || null)
    setHoursForm({
      hours: log.hours.toString(),
      log_date: log.log_date,
      description: log.description || "",
      admin_notes: (log as any).admin_notes || ""
    })
  }

  const handleLogout = async () => {
    await signOut()
    navigate("/admin/login")
  }

  // Filter by search term
  const filteredLogs = hourLogs.filter(log => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    const volunteerName = log.volunteer 
      ? `${log.volunteer.first_name} ${log.volunteer.last_name}`.toLowerCase()
      : ""
    const email = log.volunteer?.email?.toLowerCase() || ""
    const description = log.description?.toLowerCase() || ""
    
    return volunteerName.includes(searchLower) || 
           email.includes(searchLower) || 
           description.includes(searchLower)
  })

  // Calculate statistics
  const stats = {
    totalHours: hourLogs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0),
    verifiedHours: hourLogs.filter(log => log.verified_at).reduce((sum, log) => sum + (Number(log.hours) || 0), 0),
    pendingHours: hourLogs.filter(log => !log.verified_at).reduce((sum, log) => sum + (Number(log.hours) || 0), 0),
    totalLogs: hourLogs.length,
    pendingCount: hourLogs.filter(log => !log.verified_at).length,
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={{ fontSize: "2rem" }}>⏳</div>
          <p style={{ color: theme.colors.text.secondary }}>Loading hour logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>🕐</span>
          <h1 style={styles.headerTitle}>Volunteer Hours Management</h1>
        </div>
        <div style={styles.headerRight}>
          <button
            style={styles.backButton}
            onClick={() => navigate("/admin/dashboard")}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
            }}
          >
            ← Back to Dashboard
          </button>
          <button
            style={styles.logoutButton}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <h2 style={styles.title}>Hour Logs</h2>
        <p style={styles.subtitle}>View and manage volunteer hour submissions</p>

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* Statistics */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Hours</div>
            <div style={styles.statValue}>{stats.totalHours.toFixed(1)}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Verified Hours</div>
            <div style={styles.statValue}>{stats.verifiedHours.toFixed(1)}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Pending Hours</div>
            <div style={styles.statValue}>{stats.pendingHours.toFixed(1)}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Logs</div>
            <div style={styles.statValue}>{stats.totalLogs}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Pending Verification</div>
            <div style={styles.statValue}>{stats.pendingCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Search by volunteer name, email, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value as any)}
            style={styles.select}
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            style={styles.select}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          <button
            onClick={fetchHourLogs}
            style={{
              ...styles.verifyButton,
              backgroundColor: theme.colors.secondary,
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => {
              setShowAddHoursModal(true)
              setEditingLog(null)
              setSelectedVolunteer(null)
              setVolunteerSearch("")
              setHoursForm({
                hours: "",
                log_date: new Date().toISOString().split('T')[0],
                description: "",
                admin_notes: ""
              })
            }}
            style={{
              ...styles.verifyButton,
              backgroundColor: theme.colors.success,
            }}
          >
            + Add Hours Manually
          </button>
        </div>

        {/* Hour Logs Table */}
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <div>Volunteer</div>
            <div>Date</div>
            <div>Hours</div>
            <div>Description</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {filteredLogs.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No hour logs found matching your filters.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} style={styles.tableRow}>
                <div style={styles.tableCell}>
                  {log.volunteer 
                    ? `${log.volunteer.first_name} ${log.volunteer.last_name} (${log.volunteer.email})`
                    : "Unknown Volunteer"
                  }
                </div>
                <div style={styles.tableCell}>
                  {new Date(log.log_date).toLocaleDateString()}
                </div>
                <div style={styles.tableCell}>
                  <strong>{Number(log.hours).toFixed(1)}</strong>
                </div>
                <div style={styles.tableCell}>
                  {log.description || "-"}
                </div>
                <div style={styles.tableCell}>
                  <span
                    style={{
                      ...styles.badge,
                      ...(log.verified_at ? styles.badgeVerified : styles.badgePending),
                    }}
                  >
                    {log.verified_at ? "Verified" : "Pending"}
                  </span>
                </div>
                <div style={styles.tableCell}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      style={{ ...styles.verifyButton, fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                      onClick={() => openEditModal(log)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.info
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.primary
                      }}
                    >
                      Edit
                    </button>
                    {log.verified_at ? (
                      <button
                        style={styles.unverifyButton}
                        onClick={() => handleVerify(log.id, false)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.colors.neutral[400]
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = theme.colors.neutral[300]
                        }}
                      >
                        Unverify
                      </button>
                    ) : (
                      <button
                        style={styles.verifyButton}
                        onClick={() => handleVerify(log.id, true)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#c72e3a"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = theme.colors.primary
                        }}
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add/Edit Hours Modal */}
      {(showAddHoursModal || editingLog) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => {
          setShowAddHoursModal(false)
          setEditingLog(null)
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: theme.borderRadius.lg,
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              marginBottom: '1.5rem',
              color: theme.colors.secondary,
            }}>
              {editingLog ? 'Edit Hours' : 'Add Hours Manually'}
            </h3>

            {/* Volunteer Search */}
            {!editingLog && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  marginBottom: '0.5rem',
                }}>
                  Search Volunteer
                </label>
                <input
                  type="text"
                  value={volunteerSearch}
                  onChange={(e) => {
                    setVolunteerSearch(e.target.value)
                    handleSearchVolunteers(e.target.value)
                  }}
                  placeholder="Search by name, email, or volunteer number..."
                  style={styles.searchInput}
                />
                {volunteerSearchResults.length > 0 && (
                  <div style={{
                    marginTop: '0.5rem',
                    border: `1px solid ${theme.colors.neutral[300]}`,
                    borderRadius: theme.borderRadius.base,
                    maxHeight: '200px',
                    overflow: 'auto',
                  }}>
                    {volunteerSearchResults.map((vol) => (
                      <div
                        key={vol.id}
                        onClick={() => {
                          setSelectedVolunteer(vol)
                          setVolunteerSearch(`${vol.first_name} ${vol.last_name} (${vol.volunteer_number || vol.email})`)
                          setVolunteerSearchResults([])
                        }}
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
                          backgroundColor: selectedVolunteer?.id === vol.id ? theme.colors.primary + '20' : 'white',
                        }}
                        onMouseEnter={(e) => {
                          if (selectedVolunteer?.id !== vol.id) {
                            e.currentTarget.style.backgroundColor = theme.colors.neutral[50]
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedVolunteer?.id !== vol.id) {
                            e.currentTarget.style.backgroundColor = 'white'
                          }
                        }}
                      >
                        <div style={{ fontWeight: theme.typography.fontWeight.semibold }}>
                          {vol.first_name} {vol.last_name}
                        </div>
                        <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                          {vol.email} {vol.volunteer_number && `• ${vol.volunteer_number}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedVolunteer && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: theme.colors.success + '20',
                    borderRadius: theme.borderRadius.base,
                    fontSize: theme.typography.fontSize.sm,
                  }}>
                    Selected: {selectedVolunteer.first_name} {selectedVolunteer.last_name}
                    <button
                      onClick={() => {
                        setSelectedVolunteer(null)
                        setVolunteerSearch("")
                      }}
                      style={{
                        marginLeft: '1rem',
                        color: theme.colors.error,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hours Form */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                marginBottom: '0.5rem',
              }}>
                Hours *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={hoursForm.hours}
                onChange={(e) => setHoursForm({ ...hoursForm, hours: e.target.value })}
                style={styles.searchInput}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                marginBottom: '0.5rem',
              }}>
                Date *
              </label>
              <input
                type="date"
                value={hoursForm.log_date}
                onChange={(e) => setHoursForm({ ...hoursForm, log_date: e.target.value })}
                style={styles.searchInput}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                marginBottom: '0.5rem',
              }}>
                Description
              </label>
              <textarea
                value={hoursForm.description}
                onChange={(e) => setHoursForm({ ...hoursForm, description: e.target.value })}
                style={{ ...styles.searchInput, minHeight: '80px', resize: 'vertical' }}
                placeholder="e.g., Mobile pantry at Community Center"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                marginBottom: '0.5rem',
              }}>
                Admin Notes
              </label>
              <textarea
                value={hoursForm.admin_notes}
                onChange={(e) => setHoursForm({ ...hoursForm, admin_notes: e.target.value })}
                style={{ ...styles.searchInput, minHeight: '80px', resize: 'vertical' }}
                placeholder="Notes about this manual adjustment..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddHoursModal(false)
                  setEditingLog(null)
                  setSelectedVolunteer(null)
                  setVolunteerSearch("")
                  setHoursForm({
                    hours: "",
                    log_date: new Date().toISOString().split('T')[0],
                    description: "",
                    admin_notes: ""
                  })
                }}
                style={{
                  ...styles.unverifyButton,
                  backgroundColor: theme.colors.neutral[200],
                }}
              >
                Cancel
              </button>
              <button
                onClick={editingLog ? handleEditHours : handleAddHours}
                style={styles.verifyButton}
                disabled={!selectedVolunteer && !editingLog}
              >
                {editingLog ? 'Update Hours' : 'Add Hours'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
