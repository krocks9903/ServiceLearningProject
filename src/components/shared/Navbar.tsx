import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth.tsx"
import { theme } from "../../theme"

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActivePath = (path: string) => location.pathname === path

  const styles = {
    nav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "72px",
      padding: "0 2rem",
      backgroundColor: theme.colors.white,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      position: "sticky" as const,
      top: 0,
      zIndex: 1000,
      fontFamily: theme.typography.fontFamily,
    } as React.CSSProperties,
    brand: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      textDecoration: "none",
      color: theme.colors.secondary,
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      transition: theme.transitions.base,
      letterSpacing: '-0.5px',
    } as React.CSSProperties,
    brandLogo: {
      fontSize: '1.75rem',
    } as React.CSSProperties,
    navCenter: {
      display: "flex",
      gap: "2rem",
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
    } as React.CSSProperties,
    navRight: {
      display: "flex",
      gap: "1rem",
      alignItems: "center",
    } as React.CSSProperties,
    link: {
      textDecoration: "none",
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      padding: "0.5rem 0",
      position: "relative" as const,
      transition: theme.transitions.base,
      cursor: "pointer",
      borderBottom: "3px solid transparent",
    } as React.CSSProperties,
    linkActive: {
      color: theme.colors.primary,
      borderBottom: `3px solid ${theme.colors.primary}`,
    } as React.CSSProperties,
    button: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: "none",
      padding: "0.75rem 1.5rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: "pointer",
      transition: theme.transitions.base,
      boxShadow: theme.shadows.sm,
      whiteSpace: "nowrap" as const,
    } as React.CSSProperties,
    buttonSecondary: {
      backgroundColor: "transparent",
      color: theme.colors.text.secondary,
      border: `2px solid ${theme.colors.neutral[300]}`,
      boxShadow: "none",
    } as React.CSSProperties,
    userMenu: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.5rem 1rem",
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.neutral[50],
      cursor: "pointer",
      transition: theme.transitions.base,
    } as React.CSSProperties,
    avatar: {
      width: "32px",
      height: "32px",
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
    } as React.CSSProperties,
  };

  const getLinkStyle = (path: string) => ({
    ...styles.link,
    ...(isActivePath(path) ? styles.linkActive : {}),
  });

  return (
    <nav style={styles.nav}>
      {/* Brand */}
      <Link to="/" style={styles.brand}>
        <span style={styles.brandLogo}>🍽</span>
        <span>Harry Chapin Food Bank of SWFL</span>
      </Link>

      {/* Center Navigation */}
      {user && (
        <div style={styles.navCenter}>
          <Link to="/dashboard" style={getLinkStyle('/dashboard')}>
            Dashboard
          </Link>
          <Link to="/events" style={getLinkStyle('/events')}>
            Events
          </Link>
          <Link to="/profile" style={getLinkStyle('/profile')}>
            Profile
          </Link>
          {isAdmin && (
            <>
              <Link to="/admin/dashboard" style={getLinkStyle('/admin/dashboard')}>
                Admin
              </Link>
              <Link to="/reports" style={getLinkStyle('/reports')}>
                Reports
              </Link>
            </>
          )}
        </div>
      )}

      {!user && (
        <div style={styles.navCenter}>
          <Link to="/" style={getLinkStyle('/')}>
            Home
          </Link>
          <Link to="/events" style={getLinkStyle('/events')}>
            Opportunities
          </Link>
        </div>
      )}

      {/* Right Actions */}
      <div style={styles.navRight}>
        {user ? (
          <>
            <div style={styles.userMenu}>
              <div style={styles.avatar}>
                {user.email?.[0].toUpperCase() || 'U'}
              </div>
              <span style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
              }}>
                {user.email?.split('@')[0] || 'User'}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              style={{...styles.button, ...styles.buttonSecondary}}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.neutral[100]
                e.currentTarget.style.borderColor = theme.colors.neutral[400]
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = theme.colors.neutral[300]
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button 
                style={{...styles.button, ...styles.buttonSecondary}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.neutral[100]
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button 
                style={styles.button}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c72e3a'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = theme.shadows.md
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = theme.shadows.sm
                }}
              >
                Sign Up
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
