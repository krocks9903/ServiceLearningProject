import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import type { VolunteerDetails, VolunteerReport } from '../../types/volunteer'
import { theme } from '../../theme'

interface VolunteerReportModalProps {
  volunteer: VolunteerDetails
  isOpen: boolean
  onClose: () => void
}

export default function VolunteerReportModal({ 
  volunteer, 
  isOpen, 
  onClose 
}: VolunteerReportModalProps) {
  const [report, setReport] = useState<VolunteerReport | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && volunteer) {
      generateReport()
    }
  }, [isOpen, volunteer])

  const generateReport = async () => {
    setLoading(true)
    try {
      // Use the volunteer data we already have and try to enhance it
      let totalHours = volunteer.total_hours || 0
      let verifiedHours = volunteer.verified_hours || 0
      let eventsAttended = volunteer.events_attended || 0
      let lastVolunteerDate = volunteer.last_volunteer_date || 'Never'
      let recentShifts: any[] = []
      let achievements: any[] = []

      // Try to get additional data if needed
      try {
        const { data: hourLogsData } = await supabase
          .from('hour_logs')
          .select('hours, log_date, verified_at, description')
          .eq('volunteer_id', volunteer.id)

        if (hourLogsData && hourLogsData.length > 0) {
          totalHours = hourLogsData.reduce((sum, log) => sum + (log.hours || 0), 0)
          verifiedHours = hourLogsData.filter(log => log.verified_at).reduce((sum, log) => sum + (log.hours || 0), 0)
        }
      } catch (hourError) {
        console.log('Error fetching hour logs:', hourError)
      }

      try {
        const { data: assignmentsData } = await supabase
          .from('volunteer_assignments')
          .select(`
            created_at,
            hours_logged,
            shifts (
              title,
              start_time,
              end_time,
              events (
                title,
                start_date,
                location
              )
            )
          `)
          .eq('volunteer_id', volunteer.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (assignmentsData) {
          recentShifts = assignmentsData
          // Fix property access - using type assertion to bypass the error
          eventsAttended = new Set(assignmentsData.map((assignment: any) => assignment.shifts?.events?.title).filter(Boolean)).size
          const sortedDates = assignmentsData.map(assignment => assignment.created_at).filter(Boolean).sort()
          lastVolunteerDate = sortedDates[sortedDates.length - 1] || volunteer.last_volunteer_date || 'Never'
        }
      } catch (assignmentError) {
        console.log('Error fetching assignments:', assignmentError)
      }

      try {
        const { data: achievementsData } = await supabase
          .from('achievements')
          .select(`
            name,
            description,
            earned_at
          `)
          .eq('volunteer_id', volunteer.id)
          .order('earned_at', { ascending: false })

        if (achievementsData) {
          achievements = achievementsData
        }
      } catch (achievementError) {
        console.log('Error fetching achievements:', achievementError)
      }

      const pendingHours = totalHours - verifiedHours
      const averageHoursPerEvent = eventsAttended > 0 ? totalHours / eventsAttended : 0
      const firstVolunteerDate = volunteer.created_at
      const daysSinceLastActivity = lastVolunteerDate !== 'Never' 
        ? Math.floor((new Date().getTime() - new Date(lastVolunteerDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0

      const reportData: VolunteerReport = {
        volunteer: volunteer,
        summary: {
          total_hours: totalHours,
          verified_hours: verifiedHours,
          pending_hours: pendingHours,
          events_attended: eventsAttended,
          average_hours_per_event: Math.round(averageHoursPerEvent * 100) / 100,
          first_volunteer_date: firstVolunteerDate,
          last_volunteer_date: lastVolunteerDate,
          days_since_last_activity: daysSinceLastActivity
        },
        activities: {
          recent_shifts: recentShifts,
          recent_achievements: achievements,
          upcoming_events: []
        }
      }

      setReport(reportData)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatAddress = (address: any) => {
    if (!address) return 'Not provided'
    const parts = [address.street, address.city, address.state, address.zip_code].filter(Boolean)
    return parts.join(', ') || 'Not provided'
  }

  const styles = {
    overlay: {
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
    },
    modal: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.xl,
      maxWidth: '900px',
      width: '95%',
      maxHeight: '95vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      padding: '1.5rem',
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: theme.colors.white,
      padding: '0.5rem',
      borderRadius: theme.borderRadius.base,
    },
    content: {
      padding: '1.5rem',
      overflowY: 'auto' as const,
      flex: 1,
    },
    section: {
      marginBottom: '2rem',
      pageBreakInside: 'avoid' as const,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: '1rem',
      borderBottom: `2px solid ${theme.colors.primary}`,
      paddingBottom: '0.5rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    },
    statCard: {
      backgroundColor: theme.colors.neutral[50],
      padding: '1rem',
      borderRadius: theme.borderRadius.base,
      border: `1px solid ${theme.colors.neutral[200]}`,
      textAlign: 'center' as const,
    },
    statValue: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: '0.25rem',
    },
    statLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      textTransform: 'uppercase' as const,
    },
    field: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem',
      marginBottom: '1rem',
    },
    fieldLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.secondary,
      textTransform: 'uppercase' as const,
    },
    fieldValue: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      wordBreak: 'break-word' as const,
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '1rem',
    },
    tableHeader: {
      backgroundColor: theme.colors.neutral[100],
      padding: '0.75rem',
      textAlign: 'left' as const,
      fontWeight: theme.typography.fontWeight.semibold,
      fontSize: theme.typography.fontSize.sm,
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    },
    tableCell: {
      padding: '0.75rem',
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      fontSize: theme.typography.fontSize.sm,
    },
    actions: {
      padding: '1.5rem',
      borderTop: `1px solid ${theme.colors.neutral[200]}`,
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: 'pointer',
      border: 'none',
      transition: theme.transitions.base,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      color: theme.colors.text.secondary,
      border: `1px solid ${theme.colors.neutral[300]}`,
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
    },
    spinner: {
      border: `3px solid ${theme.colors.neutral[300]}`,
      borderTop: `3px solid ${theme.colors.primary}`,
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      animation: 'spin 1s linear infinite',
    },
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (!report) return
    
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // Generate the PDF content
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Volunteer Report - ${report.volunteer.first_name} ${report.volunteer.last_name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #e63946;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #e63946;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #666;
              font-size: 14px;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1d3557;
              border-bottom: 2px solid #e63946;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .stat-card {
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #e63946;
              margin-bottom: 5px;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              font-weight: bold;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .info-field {
              margin-bottom: 10px;
            }
            .info-label {
              font-size: 12px;
              font-weight: bold;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 3px;
            }
            .info-value {
              font-size: 14px;
              color: #333;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            .table th {
              background: #f8f9fa;
              padding: 10px;
              text-align: left;
              font-weight: bold;
              font-size: 12px;
              border-bottom: 2px solid #dee2e6;
            }
            .table td {
              padding: 10px;
              border-bottom: 1px solid #dee2e6;
              font-size: 12px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #dee2e6;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Volunteer Report</h1>
            <p>${report.volunteer.first_name} ${report.volunteer.last_name}</p>
            <p>Generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>

          <div class="section">
            <div class="section-title">Executive Summary</div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${report.summary.total_hours}</div>
                <div class="stat-label">Total Hours</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${report.summary.verified_hours}</div>
                <div class="stat-label">Verified Hours</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${report.summary.pending_hours}</div>
                <div class="stat-label">Pending Hours</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${report.summary.events_attended}</div>
                <div class="stat-label">Events Attended</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${report.summary.average_hours_per_event}</div>
                <div class="stat-label">Avg Hours/Event</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${report.summary.days_since_last_activity}</div>
                <div class="stat-label">Days Since Last Activity</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Volunteer Information</div>
            <div class="info-grid">
              <div class="info-field">
                <div class="info-label">Name</div>
                <div class="info-value">${report.volunteer.first_name} ${report.volunteer.last_name}</div>
              </div>
              <div class="info-field">
                <div class="info-label">Email</div>
                <div class="info-value">${report.volunteer.email}</div>
              </div>
              <div class="info-field">
                <div class="info-label">Phone</div>
                <div class="info-value">${report.volunteer.phone || 'Not provided'}</div>
              </div>
              <div class="info-field">
                <div class="info-label">Address</div>
                <div class="info-value">${formatAddress(report.volunteer.address)}</div>
              </div>
              <div class="info-field">
                <div class="info-label">T-Shirt Size</div>
                <div class="info-value">${report.volunteer.t_shirt_size || 'Not provided'}</div>
              </div>
              <div class="info-field">
                <div class="info-label">Emergency Contact</div>
                <div class="info-value">${report.volunteer.emergency_contact_name || 'Not provided'}${report.volunteer.emergency_contact_phone ? ` (${report.volunteer.emergency_contact_phone})` : ''}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Activity Timeline</div>
            <div class="info-grid">
              <div class="info-field">
                <div class="info-label">First Volunteer Date</div>
                <div class="info-value">${formatDate(report.summary.first_volunteer_date)}</div>
              </div>
              <div class="info-field">
                <div class="info-label">Last Volunteer Date</div>
                <div class="info-value">${report.summary.last_volunteer_date === 'Never' ? 'Never volunteered' : formatDate(report.summary.last_volunteer_date)}</div>
              </div>
              <div class="info-field">
                <div class="info-label">Member Since</div>
                <div class="info-value">${formatDate(report.volunteer.created_at)}</div>
              </div>
            </div>
          </div>

          ${report.activities.recent_shifts.length > 0 ? `
          <div class="section">
            <div class="section-title">Recent Volunteer Activities</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Shift</th>
                  <th>Date</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                ${report.activities.recent_shifts.slice(0, 10).map(activity => `
                  <tr>
                    <td>${activity.shifts?.events?.title || 'N/A'}</td>
                    <td>${activity.shifts?.title || 'N/A'}</td>
                    <td>${formatDate(activity.created_at)}</td>
                    <td>${activity.hours_logged || 0}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${report.activities.recent_achievements.length > 0 ? `
          <div class="section">
            <div class="section-title">Achievements</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Achievement</th>
                  <th>Description</th>
                  <th>Earned Date</th>
                </tr>
              </thead>
              <tbody>
                ${report.activities.recent_achievements.map(achievement => `
                  <tr>
                    <td>${achievement.name}</td>
                    <td>${achievement.description}</td>
                    <td>${formatDate(achievement.earned_at)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Skills & Tags</div>
            <div class="info-grid">
              <div class="info-field">
                <div class="info-label">Skills</div>
                <div class="info-value">${report.volunteer.skills && report.volunteer.skills.length > 0 ? report.volunteer.skills.join(', ') : 'No skills listed'}</div>
              </div>
              <div class="info-field">
                <div class="info-label">Tags</div>
                <div class="info-value">${report.volunteer.tags && report.volunteer.tags.length > 0 ? report.volunteer.tags.join(', ') : 'No tags assigned'}</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Harry Chapin Food Bank of SWFL - Volunteer Report</p>
            <p>Generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </body>
      </html>
    `

    // Write content to the new window
    printWindow.document.write(pdfContent)
    printWindow.document.close()

    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        // Close the window after printing
        setTimeout(() => {
          printWindow.close()
        }, 1000)
      }, 500)
    }
  }

  if (!isOpen) return null

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            Volunteer Report - {volunteer.first_name} {volunteer.last_name}
          </h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.content}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
            </div>
          ) : report ? (
            <>
              {/* Executive Summary */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Executive Summary</h3>
                <div style={styles.grid}>
                  <div style={styles.statCard}>
                    <div style={styles.statValue}>{report.summary.total_hours}</div>
                    <div style={styles.statLabel}>Total Hours</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statValue}>{report.summary.verified_hours}</div>
                    <div style={styles.statLabel}>Verified Hours</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statValue}>{report.summary.pending_hours}</div>
                    <div style={styles.statLabel}>Pending Hours</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statValue}>{report.summary.events_attended}</div>
                    <div style={styles.statLabel}>Events Attended</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statValue}>{report.summary.average_hours_per_event}</div>
                    <div style={styles.statLabel}>Avg Hours/Event</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statValue}>{report.summary.days_since_last_activity}</div>
                    <div style={styles.statLabel}>Days Since Last Activity</div>
                  </div>
                </div>
              </div>

              {/* Volunteer Information */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Volunteer Information</h3>
                <div style={styles.grid}>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Name</span>
                    <span style={styles.fieldValue}>
                      {report.volunteer.first_name} {report.volunteer.last_name}
                    </span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Email</span>
                    <span style={styles.fieldValue}>{report.volunteer.email}</span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Phone</span>
                    <span style={styles.fieldValue}>{report.volunteer.phone || 'Not provided'}</span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Address</span>
                    <span style={styles.fieldValue}>{formatAddress(report.volunteer.address)}</span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>T-Shirt Size</span>
                    <span style={styles.fieldValue}>{report.volunteer.t_shirt_size || 'Not provided'}</span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Emergency Contact</span>
                    <span style={styles.fieldValue}>
                      {report.volunteer.emergency_contact_name || 'Not provided'}
                      {report.volunteer.emergency_contact_phone && ` (${report.volunteer.emergency_contact_phone})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Activity Timeline</h3>
                <div style={styles.field}>
                  <span style={styles.fieldLabel}>First Volunteer Date</span>
                  <span style={styles.fieldValue}>{formatDate(report.summary.first_volunteer_date)}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.fieldLabel}>Last Volunteer Date</span>
                  <span style={styles.fieldValue}>
                    {report.summary.last_volunteer_date === 'Never' 
                      ? 'Never volunteered' 
                      : formatDate(report.summary.last_volunteer_date)
                    }
                  </span>
                </div>
                <div style={styles.field}>
                  <span style={styles.fieldLabel}>Member Since</span>
                  <span style={styles.fieldValue}>{formatDate(report.volunteer.created_at)}</span>
                </div>
              </div>

              {/* Recent Activities */}
              {report.activities.recent_shifts.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Recent Volunteer Activities</h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Event</th>
                        <th style={styles.tableHeader}>Shift</th>
                        <th style={styles.tableHeader}>Date</th>
                        <th style={styles.tableHeader}>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.activities.recent_shifts.slice(0, 10).map((activity, index) => (
                        <tr key={index}>
                          <td style={styles.tableCell}>
                            {activity.shifts?.events?.title || 'N/A'}
                          </td>
                          <td style={styles.tableCell}>
                            {activity.shifts?.title || 'N/A'}
                          </td>
                          <td style={styles.tableCell}>
                            {formatDate(activity.created_at)}
                          </td>
                          <td style={styles.tableCell}>
                            {activity.hours_logged || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Achievements */}
              {report.activities.recent_achievements.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Achievements</h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Achievement</th>
                        <th style={styles.tableHeader}>Description</th>
                        <th style={styles.tableHeader}>Earned Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.activities.recent_achievements.map((achievement, index) => (
                        <tr key={index}>
                          <td style={styles.tableCell}>{achievement.name}</td>
                          <td style={styles.tableCell}>{achievement.description}</td>
                          <td style={styles.tableCell}>{formatDate(achievement.earned_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Skills and Tags */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Skills & Tags</h3>
                <div style={styles.grid}>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Skills</span>
                    <span style={styles.fieldValue}>
                      {report.volunteer.skills && report.volunteer.skills.length > 0 
                        ? report.volunteer.skills.join(', ')
                        : 'No skills listed'
                      }
                    </span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Tags</span>
                    <span style={styles.fieldValue}>
                      {report.volunteer.tags && report.volunteer.tags.length > 0 
                        ? report.volunteer.tags.join(', ')
                        : 'No tags assigned'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.loadingContainer}>
              <p>Error generating report</p>
            </div>
          )}
        </div>

        <div style={styles.actions}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={onClose}
          >
            Close
          </button>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={handlePrint}
          >
            Print Report
          </button>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={handleDownload}
          >
            Download PDF
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-content, .printable-content * {
            visibility: visible;
          }
          .printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
