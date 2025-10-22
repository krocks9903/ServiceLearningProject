import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../../hooks/useAuth.tsx"
import { theme } from "../../theme"

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActivePath = (path: string) => location.pathname === path
  
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  const styles = {
    nav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: "72px",
      padding: "1rem 2rem",
      backgroundColor: theme.colors.white,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      position: "sticky" as const,
      top: 0,
      zIndex: 1000,
      fontFamily: theme.typography.fontFamily,
      flexWrap: "wrap" as const,
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
    hamburger: {
      display: "none",
      flexDirection: "column" as const,
      gap: "4px",
      cursor: "pointer",
      padding: "0.5rem",
      backgroundColor: "transparent",
      border: "none",
      zIndex: 1001,
    } as React.CSSProperties,
    hamburgerLine: {
      width: "28px",
      height: "3px",
      backgroundColor: theme.colors.secondary,
      borderRadius: "3px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      transformOrigin: "center",
    } as React.CSSProperties,
    hamburgerLineOpen1: {
      transform: "translateY(7px) rotate(45deg)",
    } as React.CSSProperties,
    hamburgerLineOpen2: {
      opacity: 0,
      transform: "scaleX(0)",
    } as React.CSSProperties,
    hamburgerLineOpen3: {
      transform: "translateY(-7px) rotate(-45deg)",
    } as React.CSSProperties,
    navCenter: {
      display: "flex",
      gap: "2rem",
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
    } as React.CSSProperties,
    navCenterMobile: {
      display: "none",
      flexDirection: "column" as const,
      width: "100%",
      gap: "0.5rem",
      padding: "1rem 0",
      borderTop: `1px solid ${theme.colors.neutral[200]}`,
      animation: "slideDown 0.3s ease-out",
    } as React.CSSProperties,
    navRight: {
      display: "flex",
      gap: "1rem",
      alignItems: "center",
    } as React.CSSProperties,
    navRightMobile: {
      display: "none",
      flexDirection: "column" as const,
      width: "100%",
      gap: "0.5rem",
      padding: "1rem 0",
      borderTop: `1px solid ${theme.colors.neutral[200]}`,
      animation: "slideDown 0.3s ease-out",
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
    <>
      <nav style={styles.nav}>
        {/* Brand */}
        <Link to="/" style={styles.brand}>
          <img
            src="/harrychaplin.png"
            alt="Harry Chapin Food Bank of SWFL"
            style={{ height: 56, display: 'block' }}
          />
        </Link>

        {/* Hamburger Menu */}
        <button 
          style={styles.hamburger} 
          onClick={toggleMobileMenu}
          className="mobile-hamburger"
          aria-label="Toggle menu"
        >
          <span style={{
            ...styles.hamburgerLine,
            ...(mobileMenuOpen ? styles.hamburgerLineOpen1 : {})
          }}></span>
          <span style={{
            ...styles.hamburgerLine,
            ...(mobileMenuOpen ? styles.hamburgerLineOpen2 : {})
          }}></span>
          <span style={{
            ...styles.hamburgerLine,
            ...(mobileMenuOpen ? styles.hamburgerLineOpen3 : {})
          }}></span>
        </button>

        {/* Center Navigation - Desktop */}
        {user && (
          <div style={styles.navCenter} className="nav-center-desktop">
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
          <div style={styles.navCenter} className="nav-center-desktop">
            <Link to="/" style={getLinkStyle('/')}>
              Home
            </Link>
            <Link to="/events" style={getLinkStyle('/events')}>
              Opportunities
            </Link>
          </div>
        )}

        {/* Right Actions - Desktop */}
        <div style={styles.navRight} className="nav-right-desktop">
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            {/* Center Navigation - Mobile */}
            {user && (
              <div style={{...styles.navCenterMobile, display: 'flex'}} className="nav-center-mobile">
                <Link to="/dashboard" style={getLinkStyle('/dashboard')} onClick={toggleMobileMenu}>
                  Dashboard
                </Link>
                <Link to="/events" style={getLinkStyle('/events')} onClick={toggleMobileMenu}>
                  Events
                </Link>
                <Link to="/profile" style={getLinkStyle('/profile')} onClick={toggleMobileMenu}>
                  Profile
                </Link>
                {isAdmin && (
                  <>
                    <Link to="/admin/dashboard" style={getLinkStyle('/admin/dashboard')} onClick={toggleMobileMenu}>
                      Admin
                    </Link>
                    <Link to="/reports" style={getLinkStyle('/reports')} onClick={toggleMobileMenu}>
                      Reports
                    </Link>
                  </>
                )}
              </div>
            )}

            {!user && (
              <div style={{...styles.navCenterMobile, display: 'flex'}} className="nav-center-mobile">
                <Link to="/" style={getLinkStyle('/')} onClick={toggleMobileMenu}>
                  Home
                </Link>
                <Link to="/events" style={getLinkStyle('/events')} onClick={toggleMobileMenu}>
                  Opportunities
                </Link>
              </div>
            )}

            {/* Right Actions - Mobile */}
            <div style={{...styles.navRightMobile, display: 'flex'}} className="nav-right-mobile">
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
                    onClick={() => { handleLogout(); toggleMobileMenu(); }}
                    style={{...styles.button, ...styles.buttonSecondary, width: '100%'}}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" style={{width: '100%'}} onClick={toggleMobileMenu}>
                    <button 
                      style={{...styles.button, ...styles.buttonSecondary, width: '100%'}}
                    >
                      Login
                    </button>
                  </Link>
                  <Link to="/signup" style={{width: '100%'}} onClick={toggleMobileMenu}>
                    <button 
                      style={{...styles.button, width: '100%'}}
                    >
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </nav>

      {/* Mobile-specific styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .mobile-hamburger {
          transition: transform 0.3s ease;
        }

        .mobile-hamburger:hover {
          transform: scale(1.1);
        }

        .mobile-hamburger:active {
          transform: scale(0.95);
        }

        @media (max-width: 768px) {
          .mobile-hamburger {
            display: flex !important;
          }
          .nav-center-desktop,
          .nav-right-desktop {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-hamburger {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}
