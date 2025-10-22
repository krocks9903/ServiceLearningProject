import { useEffect, useState } from "react"
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
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function AdminHoursPage() {
  const { user, isAdmin } = useAdminAuth()
  const navigate = useNavigate()
  const [hourLogs, setHourLogs] = useState<HourLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/admin/login')
      return
    }
    if (!isAdmin) {
      navigate('/dashboard')
      return
    }
    fetchHourLogs()
  }, [user, isAdmin, navigate, filter])

  const fetchHourLogs = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('hour_logs')
        .select(`
          *,
          profiles:volunteer_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (filter === 'pending') {
        query = query.is('verified_at', null)
      } else if (filter === 'approved') {
        query = query.not('verified_at', 'is', null)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching hour logs:', error)
        setMessage({ type: 'error', text: 'Failed to load hour logs' })
      } else {
        setHourLogs(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Failed to load hour logs' })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hour_logs')
        .update({ 
          verified_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('Error approving hours:', error)
        setMessage({ type: 'error', text: 'Failed to approve hours' })
        return
      }

      setMessage({ type: 'success', text: 'Hours approved successfully!' })
      fetchHourLogs()
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Failed to approve hours' })
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hour log? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('hour_logs')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error rejecting hours:', error)
        setMessage({ type: 'error', text: 'Failed to reject hours' })
        return
      }

      setMessage({ type: 'success', text: 'Hour log deleted successfully!' })
      fetchHourLogs()
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Failed to reject hours' })
    }
  }

  const styles = {
    container: {
      minHeight: 'calc(100vh - 72px)',
      backgroundColor: theme.colors.background,
      padding: '2rem',
      fontFamily: theme.typography.fontFamily,
    } as React.CSSProperties,
    
    header: {
      marginBottom: '2rem',
    } as React.CSSProperties,
    
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: '0.5rem',
    } as React.CSSProperties,
    
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,

    filterContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap' as const,
    } as React.CSSProperties,

    filterButton: {
      padding: '0.5rem 1rem',
      borderRadius: theme.borderRadius.base,
      border: `2px solid ${theme.colors.neutral[300]}`,
      backgroundColor: 'white',
      color: theme.colors.text.primary,
      cursor: 'pointer',
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      transition: 'all 0.2s ease',
    } as React.CSSProperties,

    filterButtonActive: {
      backgroundColor: theme.colors.primary,
      color: 'white',
      borderColor: theme.colors.primary,
    } as React.CSSProperties,

    message: {
      padding: '1rem 1.5rem',
      marginBottom: '1.5rem',
      borderRadius: theme.borderRadius.lg,
      border: '1px solid',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as React.CSSProperties,

    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: 'inherit',
    } as React.CSSProperties,

    table: {
      width: '100%',
      backgroundColor: 'white',
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      boxShadow: theme.shadows.md,
    } as React.CSSProperties,

    tableHeader: {
      backgroundColor: theme.colors.neutral[50],
      padding: '1rem',
      borderBottom: `2px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,

    tableRow: {
      display: 'grid',
      gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr 2fr',
      gap: '1rem',
      alignItems: 'center',
      padding: '1rem',
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,

    tableHeaderRow: {
      display: 'grid',
      gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr 2fr',
      gap: '1rem',
      padding: '1rem',
      fontWeight: theme.typography.fontWeight.semibold,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    } as React.CSSProperties,

    cell: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.primary,
    } as React.CSSProperties,

    volunteerName: {
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    } as React.CSSProperties,

    statusBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: theme.borderRadius.full,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
    } as React.CSSProperties,

    actionButtons: {
      display: 'flex',
      gap: '0.5rem',
    } as React.CSSProperties,

    approveButton: {
      padding: '0.5rem 1rem',
      backgroundColor: theme.colors.success,
      color: 'white',
      border: 'none',
      borderRadius: theme.borderRadius.base,
      cursor: 'pointer',
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      transition: 'all 0.2s ease',
    } as React.CSSProperties,

    rejectButton: {
      padding: '0.5rem 1rem',
      backgroundColor: theme.colors.error,
      color: 'white',
      border: 'none',
      borderRadius: theme.borderRadius.base,
      cursor: 'pointer',
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      transition: 'all 0.2s ease',
    } as React.CSSProperties,

    emptyState: {
      textAlign: 'center' as const,
      padding: '3rem',
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: `3px solid ${theme.colors.neutral[300]}`,
            borderTop: `3px solid ${theme.colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
          <p style={{ marginTop: '1rem', color: theme.colors.text.secondary }}>Loading hour logs...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Volunteer Hours Management</h1>
        <p style={styles.subtitle}>Review and approve volunteer hour submissions</p>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          borderColor: message.type === 'success' ? '#c3e6cb' : '#f5c6cb',
        }}>
          <span>{message.type === 'success' ? '✓ ' : '⚠️ '}{message.text}</span>
          <button onClick={() => setMessage(null)} style={styles.closeButton}>×</button>
        </div>
      )}

      <div style={styles.filterContainer}>
        <button
          onClick={() => setFilter('pending')}
          style={{
            ...styles.filterButton,
            ...(filter === 'pending' ? styles.filterButtonActive : {})
          }}
        >
          Pending ({hourLogs.filter(log => !log.verified_at).length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          style={{
            ...styles.filterButton,
            ...(filter === 'approved' ? styles.filterButtonActive : {})
          }}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter('all')}
          style={{
            ...styles.filterButton,
            ...(filter === 'all' ? styles.filterButtonActive : {})
          }}
        >
          All Logs
        </button>
      </div>

      <div style={styles.table}>
        <div style={styles.tableHeaderRow}>
          <div>Volunteer</div>
          <div>Description</div>
          <div>Hours</div>
          <div>Date</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {hourLogs.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No hour logs found</p>
          </div>
        ) : (
          hourLogs.map((log) => (
            <div key={log.id} style={styles.tableRow}>
              <div style={styles.volunteerName}>
                {log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : 'Unknown'}
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, fontWeight: 'normal' }}>
                  {log.profiles?.email}
                </div>
              </div>
              <div style={styles.cell}>
                {log.description || 'Volunteer Activity'}
              </div>
              <div style={{ ...styles.cell, fontWeight: theme.typography.fontWeight.semibold }}>
                {log.hours} hrs
              </div>
              <div style={styles.cell}>
                {new Date(log.log_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: log.verified_at ? '#d1fae5' : '#fef3c7',
                  color: log.verified_at ? '#065f46' : '#92400e'
                }}>
                  {log.verified_at ? 'Approved' : 'Pending'}
                </span>
              </div>
              <div style={styles.actionButtons}>
                {!log.verified_at ? (
                  <>
                    <button
                      onClick={() => handleApprove(log.id)}
                      style={styles.approveButton}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.success}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(log.id)}
                      style={styles.rejectButton}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.error}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                    Approved on {new Date(log.verified_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

