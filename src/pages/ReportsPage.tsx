import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"
import { useAuth } from "../hooks/useAuth"
import { theme } from "../theme"
import DatePicker from "../components/shared/DatePicker"

// Type definitions (moved inline since report.d.ts was removed)
interface EventReport {
  event_id: string
  event_title: string
  event_date: string
  location: string
  total_hours: number
  total_volunteers: number
  total_shifts: number
}

interface VolunteerReport {
  volunteer_id: string
  volunteer_name: string
  volunteer_email: string
  total_hours: number
  total_events: number
  total_shifts: number
  groups: string[]
  recent_activity: string
}

interface GroupReport {
  group_id: string
  group_name: string
  total_volunteers: number
  total_hours: number
  average_hours_per_volunteer: number
  most_active_volunteer: string
}

interface ReportFilters {
  start_date: string
  end_date: string
}

export default function ReportsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'events' | 'volunteers' | 'groups'>('events')
  const [loading, setLoading] = useState(true)
  const [eventReports, setEventReports] = useState<EventReport[]>([])
  const [volunteerReports, setVolunteerReports] = useState<VolunteerReport[]>([])
  const [groupReports, setGroupReports] = useState<GroupReport[]>([])
  
  const [filters, setFilters] = useState<ReportFilters>({
    start_date: "",
    end_date: ""
  })

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login")
    } else if (!authLoading && user && !isAdmin) {
      navigate("/dashboard")
    }
  }, [authLoading, user, isAdmin, navigate])

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h2 style={{ color: theme.colors.text.primary }}>Access Denied</h2>
        <p style={{ color: theme.colors.text.secondary }}>
          You must be an administrator to access reports.
        </p>
      </div>
    )
  }

  useEffect(() => {
    fetchReports()
  }, [activeTab, filters])

  const fetchReports = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'events':
          await fetchEventReports()
          break
        case 'volunteers':
          await fetchVolunteerReports()
          break
        case 'groups':
          await fetchGroupReports()
          break
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEventReports = async () => {
    try {
      let query = supabase
        .from("events")
        .select("id, title, start_date, location")
        .order("start_date", { ascending: false })

      if (filters.start_date) {
        query = query.gte("start_date", filters.start_date)
      }
      if (filters.end_date) {
        query = query.lte("start_date", filters.end_date)
      }

      const { data: events, error } = await query

      if (error) throw error

      const reports: EventReport[] = await Promise.all(
        (events || []).map(async (event) => {
          // Get all shifts for this event
          const { data: shifts } = await supabase
            .from("shifts")
            .select("id")
            .eq("event_id", event.id)

          const shiftIds = shifts?.map(s => s.id) || []

          // Get all assignments for these shifts
          const { data: assignments } = await supabase
            .from("volunteer_assignments")
            .select("volunteer_id, hours_logged")
            .in("shift_id", shiftIds)
            .eq("status", "completed")

          const uniqueVolunteers = new Set(assignments?.map(a => a.volunteer_id) || [])
          const totalHours = assignments?.reduce((sum, a) => sum + (Number(a.hours_logged) || 0), 0) || 0

          return {
            event_id: event.id,
            event_title: event.title,
            event_date: event.start_date,
            location: event.location,
            total_hours: totalHours,
            total_volunteers: uniqueVolunteers.size,
            total_shifts: shiftIds.length
          }
        })
      )

      setEventReports(reports)
    } catch (error) {
      console.error("Error fetching event reports:", error)
    }
  }

  const fetchVolunteerReports = async () => {
    try {
      // First try to get volunteers with role = 'volunteer'
      let { data: volunteers, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("role", "volunteer")

      // If no volunteers found with role, try to get all profiles and filter
      if (!volunteers || volunteers.length === 0) {
        console.log('No volunteers found with role=volunteer, trying fallback query...')
        const { data: allProfiles, error: fallbackError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, role")
        
        if (fallbackError) {
          console.error('Error in fallback query:', fallbackError)
          throw fallbackError
        }
        
        // Filter for volunteers (role = 'volunteer' or null/undefined for existing users)
        volunteers = allProfiles?.filter(profile => 
          !profile.role || profile.role === 'volunteer'
        ) || []
        
        console.log('Found volunteers via fallback:', volunteers)
      }

      if (error) {
        console.error('Error fetching volunteers:', error)
        throw error
      }

      const reports: VolunteerReport[] = await Promise.all(
        (volunteers || []).map(async (volunteer) => {
          // Get total hours from hour_logs (using your schema)
          const { data: hourLogs } = await supabase
            .from("hour_logs")
            .select("hours")
            .eq("volunteer_id", volunteer.id)
            .not("verified_at", "is", null)  // Only verified hours

          const totalHours = hourLogs?.reduce((sum, log) => sum + (Number(log.hours) || 0), 0) || 0

          // Get shift assignments (using your schema with 'registered', 'checked_in', 'completed' statuses)
          const { data: assignments } = await supabase
            .from("volunteer_assignments")
            .select(`
              shift_id,
              shifts!shift_id (
                event_id
              )
            `)
            .eq("volunteer_id", volunteer.id)
            .in("status", ["registered", "checked_in", "completed"])

          const uniqueEvents = new Set(
            assignments?.map((a: any) => a.shifts?.event_id).filter(Boolean) || []
          )

          // Get groups
          const { data: groupMemberships } = await supabase
            .from("volunteer_group_memberships")
            .select(`
              volunteer_groups (
                name
              )
            `)
            .eq("volunteer_id", volunteer.id)

          const groups = groupMemberships?.map((m: any) => m.volunteer_groups?.name).filter(Boolean) || []

          // Get most recent activity
          const { data: recentActivity } = await supabase
            .from("volunteer_assignments")
            .select("created_at")
            .eq("volunteer_id", volunteer.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          return {
            volunteer_id: volunteer.id,
            volunteer_name: `${volunteer.first_name || ''} ${volunteer.last_name || ''}`.trim() || "Unknown",
            volunteer_email: volunteer.email || "",
            total_hours: totalHours,
            total_events: uniqueEvents.size,
            total_shifts: assignments?.length || 0,
            groups: groups,
            recent_activity: recentActivity?.created_at || "Never"
          }
        })
      )

      setVolunteerReports(reports.sort((a, b) => b.total_hours - a.total_hours))
    } catch (error) {
      console.error("Error fetching volunteer reports:", error)
    }
  }

  const fetchGroupReports = async () => {
    try {
      const { data: groups, error } = await supabase
        .from("volunteer_groups")
        .select("id, name")

      if (error) throw error

      const reports: GroupReport[] = await Promise.all(
        (groups || []).map(async (group) => {
          // Get all members
          const { data: members } = await supabase
            .from("volunteer_group_memberships")
            .select("volunteer_id")
            .eq("group_id", group.id)

          const volunteerIds = members?.map(m => m.volunteer_id) || []

          // Get total hours
          let totalHours = 0
          if (volunteerIds.length > 0) {
            const { data: hourLogs } = await supabase
              .from("hour_logs")
              .select("hours, volunteer_id")
              .in("volunteer_id", volunteerIds)
              .not("verified_at", "is", null)

            totalHours = hourLogs?.reduce((sum, log) => sum + (Number(log.hours) || 0), 0) || 0

            // Find most active volunteer
            const hoursByVolunteer: Record<string, number> = {}
            hourLogs?.forEach(log => {
              hoursByVolunteer[log.volunteer_id] = (hoursByVolunteer[log.volunteer_id] || 0) + Number(log.hours)
            })

            const mostActiveId = Object.entries(hoursByVolunteer).sort((a, b) => b[1] - a[1])[0]?.[0]
            
            let mostActiveName = "N/A"
            if (mostActiveId) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("name, email")
                .eq("id", mostActiveId)
                .single()

              mostActiveName = profile?.name || profile?.email || "Unknown"
            }

            return {
              group_id: group.id,
              group_name: group.name,
              total_volunteers: volunteerIds.length,
              total_hours: totalHours,
              average_hours_per_volunteer: volunteerIds.length > 0 ? Math.round(totalHours / volunteerIds.length) : 0,
              most_active_volunteer: volunteerIds.length > 0 ? mostActiveName : "N/A"
            }
          }

          return {
            group_id: group.id,
            group_name: group.name,
            total_volunteers: 0,
            total_hours: 0,
            average_hours_per_volunteer: 0,
            most_active_volunteer: "N/A"
          }
        })
      )

      setGroupReports(reports.sort((a, b) => b.total_hours - a.total_hours))
    } catch (error) {
      console.error("Error fetching group reports:", error)
    }
  }

  const exportToCSV = () => {
    let csvContent = ""
    let filename = ""

    switch (activeTab) {
      case 'events':
        csvContent = "Event,Date,Location,Total Hours,Volunteers,Shifts\n"
        eventReports.forEach(report => {
          csvContent += `"${report.event_title}","${new Date(report.event_date).toLocaleDateString()}","${report.location}",${report.total_hours},${report.total_volunteers},${report.total_shifts}\n`
        })
        filename = "event-reports.csv"
        break

      case 'volunteers':
        csvContent = "Name,Email,Total Hours,Events,Shifts,Groups\n"
        volunteerReports.forEach(report => {
          csvContent += `"${report.volunteer_name}","${report.volunteer_email}",${report.total_hours},${report.total_events},${report.total_shifts},"${report.groups.join(', ')}"\n`
        })
        filename = "volunteer-reports.csv"
        break

      case 'groups':
        csvContent = "Group,Members,Total Hours,Avg Hours/Volunteer,Most Active\n"
        groupReports.forEach(report => {
          csvContent += `"${report.group_name}",${report.total_volunteers},${report.total_hours},${report.average_hours_per_volunteer},"${report.most_active_volunteer}"\n`
        })
        filename = "group-reports.csv"
        break
    }

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  const exportToPDF = () => {
    // For PDF export, we'll create a printable HTML page
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    let content = `
      <html>
        <head>
          <title>Report - ${activeTab}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #4f46e5; color: white; }
            tr:hover { background-color: #f5f5f5; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report</h1>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    `

    switch (activeTab) {
      case 'events':
        content += `
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Location</th>
                <th>Total Hours</th>
                <th>Volunteers</th>
                <th>Shifts</th>
              </tr>
            </thead>
            <tbody>
              ${eventReports.map(r => `
                <tr>
                  <td>${r.event_title}</td>
                  <td>${new Date(r.event_date).toLocaleDateString()}</td>
                  <td>${r.location}</td>
                  <td>${r.total_hours}</td>
                  <td>${r.total_volunteers}</td>
                  <td>${r.total_shifts}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
        break

      case 'volunteers':
        content += `
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Total Hours</th>
                <th>Events</th>
                <th>Shifts</th>
                <th>Groups</th>
              </tr>
            </thead>
            <tbody>
              ${volunteerReports.map(r => `
                <tr>
                  <td>${r.volunteer_name}</td>
                  <td>${r.volunteer_email}</td>
                  <td>${r.total_hours}</td>
                  <td>${r.total_events}</td>
                  <td>${r.total_shifts}</td>
                  <td>${r.groups.join(', ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
        break

      case 'groups':
        content += `
          <table>
            <thead>
              <tr>
                <th>Group</th>
                <th>Members</th>
                <th>Total Hours</th>
                <th>Avg Hours/Volunteer</th>
                <th>Most Active</th>
              </tr>
            </thead>
            <tbody>
              ${groupReports.map(r => `
                <tr>
                  <td>${r.group_name}</td>
                  <td>${r.total_volunteers}</td>
                  <td>${r.total_hours}</td>
                  <td>${r.average_hours_per_volunteer}</td>
                  <td>${r.most_active_volunteer}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
        break
    }

    content += `
          <div class="footer">
            <p>Generated by Harry Chapin Food Bank of SWFL Volunteer Management System</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.print()
  }

  const styles = {
    container: {
      minHeight: "calc(100vh - 80px)",
      backgroundColor: theme.colors.background,
      padding: "2rem"
    } as React.CSSProperties,
    inner: {
      maxWidth: "1400px",
      margin: "0 auto"
    } as React.CSSProperties,
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem"
    } as React.CSSProperties,
    title: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      color: theme.colors.text.primary
    } as React.CSSProperties,
    exportButtons: {
      display: "flex",
      gap: "1rem"
    } as React.CSSProperties,
    button: {
      padding: "0.75rem 1.5rem",
      borderRadius: theme.borderRadius.md,
      fontSize: "1rem",
      fontWeight: "600",
      border: "none",
      cursor: "pointer",
      transition: "all 0.2s"
    } as React.CSSProperties,
    buttonPrimary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white
    } as React.CSSProperties,
    buttonSecondary: {
      backgroundColor: theme.colors.secondary,
      color: theme.colors.white
    } as React.CSSProperties,
    tabs: {
      display: "flex",
      gap: "0.5rem",
      marginBottom: "2rem",
      borderBottom: `2px solid ${theme.colors.border}`
    } as React.CSSProperties,
    tab: {
      padding: "1rem 2rem",
      fontSize: "1rem",
      fontWeight: "600",
      border: "none",
      background: "none",
      cursor: "pointer",
      transition: "all 0.2s",
      borderBottom: "3px solid transparent",
      marginBottom: "-2px"
    } as React.CSSProperties,
    tabActive: {
      color: theme.colors.primary,
      borderBottom: `3px solid ${theme.colors.primary}`
    } as React.CSSProperties,
    filters: {
      backgroundColor: theme.colors.white,
      padding: "1.5rem",
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.sm,
      marginBottom: "2rem",
      display: "flex",
      gap: "1rem",
      alignItems: "end"
    } as React.CSSProperties,
    filterGroup: {
      flex: 1
    } as React.CSSProperties,
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "600",
      color: theme.colors.text.primary,
      fontSize: "0.875rem"
    } as React.CSSProperties,
    input: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: theme.borderRadius.md,
      border: `1px solid ${theme.colors.border}`,
      fontSize: "1rem"
    } as React.CSSProperties,
    table: {
      width: "100%",
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.sm,
      overflow: "hidden"
    } as React.CSSProperties,
    tableHeader: {
      backgroundColor: theme.colors.background,
      padding: "1rem",
      fontWeight: "600",
      textAlign: "left",
      color: theme.colors.text.primary
    } as React.CSSProperties,
    tableCell: {
      padding: "1rem",
      borderTop: `1px solid ${theme.colors.border}`,
      color: theme.colors.text.secondary
    } as React.CSSProperties,
    emptyState: {
      textAlign: "center",
      padding: "4rem",
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.sm
    } as React.CSSProperties
  }

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.header}>
          <h1 style={styles.title}>Reports Dashboard</h1>
          <div style={styles.exportButtons}>
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={exportToCSV}
            >
              📊 Export CSV
            </button>
            <button
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={exportToPDF}
            >
              📄 Export PDF
            </button>
          </div>
        </div>

        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'events' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'volunteers' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('volunteers')}
          >
            Volunteers
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'groups' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </button>
        </div>

        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <DatePicker
              label="Start Date"
              value={filters.start_date}
              onChange={(date) => setFilters({ ...filters, start_date: date })}
              placeholder="Select start date"
            />
          </div>
          <div style={styles.filterGroup}>
            <DatePicker
              label="End Date"
              value={filters.end_date}
              onChange={(date) => setFilters({ ...filters, end_date: date })}
              placeholder="Select end date"
            />
          </div>
          <button
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onClick={() => setFilters({ start_date: "", end_date: "" })}
          >
            Clear Filters
          </button>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading reports...</div>
        ) : (
          <>
            {activeTab === 'events' && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Event</th>
                    <th style={styles.tableHeader}>Date</th>
                    <th style={styles.tableHeader}>Location</th>
                    <th style={styles.tableHeader}>Total Hours</th>
                    <th style={styles.tableHeader}>Volunteers</th>
                    <th style={styles.tableHeader}>Shifts</th>
                  </tr>
                </thead>
                <tbody>
                  {eventReports.map(report => (
                    <tr key={report.event_id}>
                      <td style={styles.tableCell}>{report.event_title}</td>
                      <td style={styles.tableCell}>{new Date(report.event_date).toLocaleDateString()}</td>
                      <td style={styles.tableCell}>{report.location}</td>
                      <td style={styles.tableCell}>{report.total_hours}</td>
                      <td style={styles.tableCell}>{report.total_volunteers}</td>
                      <td style={styles.tableCell}>{report.total_shifts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'volunteers' && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Name</th>
                    <th style={styles.tableHeader}>Email</th>
                    <th style={styles.tableHeader}>Total Hours</th>
                    <th style={styles.tableHeader}>Events</th>
                    <th style={styles.tableHeader}>Shifts</th>
                    <th style={styles.tableHeader}>Groups</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteerReports.map(report => (
                    <tr key={report.volunteer_id}>
                      <td style={styles.tableCell}>{report.volunteer_name}</td>
                      <td style={styles.tableCell}>{report.volunteer_email}</td>
                      <td style={styles.tableCell}>{report.total_hours}</td>
                      <td style={styles.tableCell}>{report.total_events}</td>
                      <td style={styles.tableCell}>{report.total_shifts}</td>
                      <td style={styles.tableCell}>{report.groups.join(', ') || 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'groups' && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Group</th>
                    <th style={styles.tableHeader}>Members</th>
                    <th style={styles.tableHeader}>Total Hours</th>
                    <th style={styles.tableHeader}>Avg Hours/Volunteer</th>
                    <th style={styles.tableHeader}>Most Active</th>
                  </tr>
                </thead>
                <tbody>
                  {groupReports.map(report => (
                    <tr key={report.group_id}>
                      <td style={styles.tableCell}>{report.group_name}</td>
                      <td style={styles.tableCell}>{report.total_volunteers}</td>
                      <td style={styles.tableCell}>{report.total_hours}</td>
                      <td style={styles.tableCell}>{report.average_hours_per_volunteer}</td>
                      <td style={styles.tableCell}>{report.most_active_volunteer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  )
}

