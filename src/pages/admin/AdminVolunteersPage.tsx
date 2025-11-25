import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../services/supabaseClient"
import { useAdminAuth } from "../../hooks/useAdminAuth"
import { theme } from "../../theme"
import VolunteerDetailsModal from "../../components/admin/VolunteerDetailsModal"
import VolunteerReportModal from "../../components/admin/VolunteerReportModal"
import type { VolunteerDetails } from "../../types/volunteer"

interface Volunteer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  status: string
  created_at: string
  total_hours: number
  events_attended: number
  last_volunteer_date: string | null
  // Additional comprehensive fields
  date_of_birth?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zip_code?: string
    country?: string
  }
  emergency_contact_name?: string
  emergency_contact_phone?: string
  t_shirt_size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  skills?: string[]
  tags?: string[]
  profile_photo_url?: string
  updated_at?: string
  role?: string
  groups?: string[]
  verified_hours?: number
  pending_hours?: number
}

export default function AdminVolunteersPage() {
  const { user, isAdmin, signOut } = useAdminAuth()
  const navigate = useNavigate()
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerDetails | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

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
    filters: {
      display: "flex",
      gap: "1rem",
      marginBottom: "2rem",
      flexWrap: "wrap" as const,
    } as React.CSSProperties,
    searchInput: {
      flex: "1",
      minWidth: "300px",
      padding: "0.75rem",
      fontSize: theme.typography.fontSize.base,
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      fontFamily: theme.typography.fontFamily,
    } as React.CSSProperties,
    statusSelect: {
      padding: "0.75rem",
      fontSize: theme.typography.fontSize.base,
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      fontFamily: theme.typography.fontFamily,
      backgroundColor: theme.colors.white,
    } as React.CSSProperties,
    volunteersTable: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.neutral[200]}`,
      overflow: "hidden",
    } as React.CSSProperties,
    tableHeader: {
      backgroundColor: theme.colors.neutral[50],
      padding: "1rem",
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
      gap: "1rem",
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
    } as React.CSSProperties,
    volunteerRow: {
      padding: "1rem",
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
      gap: "1rem",
      alignItems: "center",
      transition: theme.transitions.base,
    } as React.CSSProperties,
    volunteerInfo: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.25rem",
    } as React.CSSProperties,
    volunteerName: {
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    } as React.CSSProperties,
    volunteerEmail: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    volunteerPhone: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    statValue: {
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    } as React.CSSProperties,
    statLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    } as React.CSSProperties,
    error: {
      backgroundColor: "#fee",
      color: "#c00",
      padding: "1rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      border: "1px solid #fcc",
      textAlign: "center" as const,
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
    actionButton: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: 'pointer',
      transition: theme.transitions.base,
      marginRight: '0.5rem',
    } as React.CSSProperties,
    secondaryButton: {
      backgroundColor: 'transparent',
      color: theme.colors.text.secondary,
      border: `1px solid ${theme.colors.neutral[300]}`,
      padding: '0.5rem 1rem',
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: 'pointer',
      transition: theme.transitions.base,
    } as React.CSSProperties,
    actionButtons: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
    } as React.CSSProperties,
  }

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/admin/login")
      return
    }
    fetchVolunteers()
  }, [user, isAdmin, navigate])

  const fetchVolunteers = async () => {
    try {
      // Start with the original working query as fallback
      let data, error
      
      // Try the enhanced query first
      try {
        const result = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            first_name,
            last_name,
            phone,
            status,
            created_at,
            date_of_birth,
            address,
            emergency_contact_name,
            emergency_contact_phone,
            t_shirt_size,
            skills,
            tags,
            profile_photo_url,
            updated_at,
            role
          `)
          .order('created_at', { ascending: false })
        
        data = result.data
        error = result.error
      } catch (enhancedError) {
        console.log('Enhanced query failed, trying basic query:', enhancedError)
        // Fallback to basic query
        const result = await supabase
          .from('admin_volunteer_summary')
          .select('*')
          .order('created_at', { ascending: false })
        
        data = result.data
        error = result.error
      }

      if (error) {
        console.error('Error fetching volunteers:', error)
        setError('Failed to load volunteers')
        return
      }

      // Transform the data to include calculated fields
      const transformedData = await Promise.all((data || []).map(async (volunteer) => {
        // Initialize with basic data
        let totalHours = volunteer.total_hours || 0
        let eventsAttended = volunteer.events_attended || 0
        let lastVolunteerDate = volunteer.last_volunteer_date || null
        let verifiedHours = 0
        let groups: string[] = []

        // Try to get additional data if not already present
        if (!volunteer.total_hours) {
          try {
            const { data: hourLogsData } = await supabase
              .from('hour_logs')
              .select('hours, verified_at')
              .eq('volunteer_id', volunteer.id)

            if (hourLogsData) {
              totalHours = hourLogsData.reduce((sum, log) => sum + (log.hours || 0), 0)
              verifiedHours = hourLogsData.filter(log => log.verified_at).reduce((sum, log) => sum + (log.hours || 0), 0)
            }
          } catch (hourError) {
            console.log('Error fetching hour logs:', hourError)
          }
        }

        if (!volunteer.events_attended) {
          try {
            const { data: assignmentsData } = await supabase
              .from('volunteer_assignments')
              .select('created_at, shifts!shift_id(events!event_id(id))')
              .eq('volunteer_id', volunteer.id)

            if (assignmentsData) {
              eventsAttended = new Set(assignmentsData.map((assignment: any) => assignment.shifts?.events?.id).filter(Boolean)).size
              const sortedAssignments = assignmentsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              lastVolunteerDate = sortedAssignments[0]?.created_at || null
            }
          } catch (assignmentError) {
            console.log('Error fetching assignments:', assignmentError)
          }
        }

        // Try to get volunteer groups
        try {
          const { data: groupMemberships } = await supabase
            .from('volunteer_group_memberships')
            .select('volunteer_groups(name)')
            .eq('volunteer_id', volunteer.id)
          
          if (groupMemberships) {
            groups = groupMemberships.map((membership: any) => membership.volunteer_groups?.name).filter(Boolean) as string[]
          }
        } catch (groupError) {
          console.log('Error fetching volunteer groups:', groupError)
        }

        return {
          ...volunteer,
          total_hours: totalHours,
          events_attended: eventsAttended,
          last_volunteer_date: lastVolunteerDate,
          verified_hours: verifiedHours,
          pending_hours: totalHours - verifiedHours,
          groups: groups,
          // Ensure all fields have default values
          date_of_birth: volunteer.date_of_birth || null,
          address: volunteer.address || null,
          emergency_contact_name: volunteer.emergency_contact_name || null,
          emergency_contact_phone: volunteer.emergency_contact_phone || null,
          t_shirt_size: volunteer.t_shirt_size || null,
          skills: volunteer.skills || [],
          tags: volunteer.tags || [],
          profile_photo_url: volunteer.profile_photo_url || null,
          updated_at: volunteer.updated_at || volunteer.created_at,
          role: volunteer.role || 'volunteer'
        }
      }))

      setVolunteers(transformedData)
    } catch (error) {
      console.error('Error fetching volunteers:', error)
      setError('Failed to load volunteers')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate("/admin/login")
  }

  const handleViewDetails = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer as VolunteerDetails)
    setShowDetailsModal(true)
  }

  const handleGenerateReport = (volunteer: VolunteerDetails) => {
    setSelectedVolunteer(volunteer)
    setShowDetailsModal(false)
    setShowReportModal(true)
  }

  const handleCloseDetails = () => {
    setShowDetailsModal(false)
    setSelectedVolunteer(null)
  }

  const handleCloseReport = () => {
    setShowReportModal(false)
    setSelectedVolunteer(null)
  }

  const handleStatusUpdate = (volunteerId: string, newStatus: string) => {
    // Update the volunteer status in the local state
    setVolunteers(prevVolunteers => 
      prevVolunteers.map(volunteer => 
        volunteer.id === volunteerId 
          ? { ...volunteer, status: newStatus, updated_at: new Date().toISOString() }
          : volunteer
      )
    )
  }

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = 
      volunteer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || volunteer.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.success
      case 'pending': return theme.colors.warning
      case 'inactive': return theme.colors.error
      default: return theme.colors.text.secondary
    }
  }

  const getStatusBadge = (status: string) => {
    const color = getStatusColor(status)
    return {
      backgroundColor: `${color}20`,
      color: color,
      padding: '0.25rem 0.75rem',
      borderRadius: theme.borderRadius.full,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      textTransform: 'uppercase' as const,
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: theme.colors.text.secondary }}>Loading volunteers...</p>
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
          <h1 style={styles.pageTitle}>Volunteer Management</h1>
          <p style={styles.pageSubtitle}>
            View and manage all volunteers in the system
          </p>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Search volunteers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.statusSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div style={styles.volunteersTable}>
          <div style={styles.tableHeader}>
            <div>Volunteer</div>
            <div>Status</div>
            <div>Total Hours</div>
            <div>Events</div>
            <div>Last Activity</div>
            <div>T-Shirt Size</div>
            <div>Actions</div>
          </div>

          {filteredVolunteers.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No volunteers found matching your criteria.</p>
            </div>
          ) : (
            filteredVolunteers.map((volunteer) => (
              <div key={volunteer.id} style={styles.volunteerRow}>
                <div style={styles.volunteerInfo}>
                  <div style={styles.volunteerName}>
                    {volunteer.first_name} {volunteer.last_name}
                  </div>
                  <div style={styles.volunteerEmail}>{volunteer.email}</div>
                  {volunteer.phone && (
                    <div style={styles.volunteerPhone}>{volunteer.phone}</div>
                  )}
                  {volunteer.groups && volunteer.groups.length > 0 && (
                    <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                      Groups: {volunteer.groups.join(', ')}
                    </div>
                  )}
                </div>
                
                <div>
                  <span style={getStatusBadge(volunteer.status)}>
                    {volunteer.status}
                  </span>
                </div>
                
                <div>
                  <div style={styles.statValue}>{volunteer.total_hours}</div>
                  <div style={styles.statLabel}>hours</div>
                  {volunteer.verified_hours !== undefined && volunteer.pending_hours !== undefined && (
                    <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                      {volunteer.verified_hours} verified, {volunteer.pending_hours} pending
                    </div>
                  )}
                </div>
                
                <div>
                  <div style={styles.statValue}>{volunteer.events_attended}</div>
                  <div style={styles.statLabel}>events</div>
                </div>
                
                <div>
                  <div style={styles.statValue}>
                    {volunteer.last_volunteer_date 
                      ? new Date(volunteer.last_volunteer_date).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                  <div style={styles.statLabel}>
                    {volunteer.last_volunteer_date 
                      ? 'last volunteer'
                      : 'no activity'
                    }
                  </div>
                </div>

                <div>
                  <div style={styles.statValue}>{volunteer.t_shirt_size || 'N/A'}</div>
                  <div style={styles.statLabel}>size</div>
                </div>

                <div style={styles.actionButtons}>
                  <button
                    style={styles.actionButton}
                    onClick={() => handleViewDetails(volunteer)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.secondary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.primary
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedVolunteer && (
        <>
          <VolunteerDetailsModal
            volunteer={selectedVolunteer}
            isOpen={showDetailsModal}
            onClose={handleCloseDetails}
            onGenerateReport={handleGenerateReport}
            onStatusUpdate={handleStatusUpdate}
          />
          <VolunteerReportModal
            volunteer={selectedVolunteer}
            isOpen={showReportModal}
            onClose={handleCloseReport}
          />
        </>
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
