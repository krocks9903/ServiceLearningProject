import { useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { theme } from "../theme"

export default function Home() {
  const { user } = useAuth();
    // --- SUPABASE CONNECTION TEST ---
  useEffect(() => {
    (async () => {
      console.log("🔍 Testing Supabase connection...");

      // Env sanity (don’t print secrets)
      console.log("ENV check:", {
        urlSet: !!import.meta.env.VITE_SUPABASE_URL,
        keySet: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      });

      // Reachability probe (intentionally fake table)
      const { error } = await supabase
        .from("this_table_does_not_exist")
        .select("*")
        .limit(1);

      if (error?.message) {
        console.log(
          "✅ Supabase reachable (expected error due to fake table):",
          error.message
        );
      } else {
        console.log("✅ Supabase reachable with no error (you probably hit a real table).");
      }

      // Auth endpoint check (works even if not logged in)
      const { data: sessionData, error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.warn("Auth check error (SDK still working):", authError.message);
      } else {
        console.log("Auth check OK. Logged in?", !!sessionData.session);
      }
    })();
  }, []);
  // --- END TEST ---

  // Professional stock imagery
  const heroImage = "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&q=80"
  const childrenImage = "/feedingfamilies-scaled1.jpg"
  const familiesImage = "/family.jpg"
  const seniorsImage = "/seniros.jpg"

  const styles = {
    container: {
      minHeight: "calc(100vh - 80px)",
      background: "linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 50%, #81d4fa 100%)",
    } as React.CSSProperties,
    hero: {
      background: `linear-gradient(135deg, rgba(230, 57, 70, 0.92) 0%, rgba(29, 53, 87, 0.88) 100%), url(${heroImage}) center/cover`,
      color: theme.colors.white,
      padding: "5rem 2rem",
      textAlign: "center",
      position: "relative",
      fontFamily: theme.typography.fontFamily,
    } as React.CSSProperties,
    heroTitle: {
      fontSize: theme.typography.fontSize['6xl'],
      fontWeight: theme.typography.fontWeight.bold,
      marginBottom: "1.5rem",
      lineHeight: theme.typography.lineHeight.tight,
      letterSpacing: '-1px',
      maxWidth: '800px',
      margin: '0 auto 1.5rem',
    } as React.CSSProperties,
    heroSubtitle: {
      fontSize: theme.typography.fontSize.xl,
      marginBottom: "2.5rem",
      opacity: 0.95,
      lineHeight: theme.typography.lineHeight.relaxed,
      maxWidth: '600px',
      margin: '0 auto 2.5rem',
      fontWeight: theme.typography.fontWeight.normal,
    } as React.CSSProperties,
    ctaGroup: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginTop: '2.5rem',
    } as React.CSSProperties,
    ctaButtonPrimary: {
      backgroundColor: theme.colors.white,
      color: theme.colors.primary,
      padding: '1rem 2.5rem',
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      border: 'none',
      borderRadius: theme.borderRadius.base,
      cursor: 'pointer',
      transition: theme.transitions.base,
      boxShadow: theme.shadows.lg,
      textDecoration: 'none',
      display: 'inline-block',
    } as React.CSSProperties,
    ctaButtonSecondary: {
      backgroundColor: 'transparent',
      color: theme.colors.white,
      padding: '1rem 2.5rem',
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      border: '2px solid white',
      borderRadius: theme.borderRadius.base,
      cursor: 'pointer',
      transition: theme.transitions.base,
      textDecoration: 'none',
      display: 'inline-block',
    } as React.CSSProperties,
    statsBar: {
      backgroundColor: theme.colors.white,
      padding: '3rem 2rem',
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    statsContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '3rem',
    } as React.CSSProperties,
    stat: {
      textAlign: "center",
    } as React.CSSProperties,
    statNumber: {
      fontSize: theme.typography.fontSize['5xl'],
      fontWeight: theme.typography.fontWeight.bold,
      display: "block",
      color: theme.colors.primary,
      marginBottom: '0.5rem',
      letterSpacing: '-1px',
    } as React.CSSProperties,
    statLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.fontWeight.medium,
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
    } as React.CSSProperties,
    section: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "3rem 2rem",
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: "2rem",
      fontWeight: "bold",
      color: theme.colors.text.primary,
      marginBottom: "2rem",
      textAlign: "center",
    } as React.CSSProperties,
    missionBox: {
      backgroundColor: theme.colors.white,
      borderLeft: `4px solid ${theme.colors.primary}`,
      padding: "2rem",
      borderRadius: theme.borderRadius.md,
      boxShadow: theme.shadows.md,
      marginBottom: "3rem",
    } as React.CSSProperties,
    programsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      gap: "1.5rem",
      marginBottom: "3rem",
    } as React.CSSProperties,
    programCard: {
      backgroundColor: theme.colors.white,
      padding: "0",
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      transition: theme.transitions.base,
      overflow: "hidden",
      border: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    programImage: {
      width: "100%",
      height: "240px",
      objectFit: "cover",
      objectPosition: "center top",
    } as React.CSSProperties,
    programContent: {
      padding: "2rem",
    } as React.CSSProperties,
    programIcon: {
      fontSize: "3rem",
      marginBottom: "1rem",
    } as React.CSSProperties,
    programTitle: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "1rem",
      lineHeight: theme.typography.lineHeight.tight,
    } as React.CSSProperties,
    button: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: "none",
      padding: "1rem 2rem",
      borderRadius: theme.borderRadius.md,
      fontSize: "1.125rem",
      fontWeight: "600",
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-block",
      transition: "all 0.2s",
      boxShadow: theme.shadows.sm,
    } as React.CSSProperties,
    ctaSection: {
      textAlign: "center",
      padding: "3rem 2rem",
      backgroundColor: theme.colors.white,
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Lead the Fight to End Hunger</h1>
        <p style={styles.heroSubtitle}>
          Join Harry Chapin Food Bank of SWFL volunteers making a difference in Southwest Florida
        </p>
        
        <div style={styles.ctaGroup}>
          {user ? (
            <Link to="/events" style={styles.ctaButtonPrimary}>
              View Opportunities
            </Link>
          ) : (
            <>
              <Link to="/signup" style={styles.ctaButtonPrimary}>
                Become a Volunteer
              </Link>
              <Link to="/events" style={styles.ctaButtonSecondary}>
                Browse Events
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Stats Bar */}
      <section style={styles.statsBar}>
        <div style={styles.statsContainer}>
          <div style={styles.stat}>
            <span style={styles.statNumber}>250,000+</span>
            <span style={styles.statLabel}>People Fed Monthly</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNumber}>1,000+</span>
            <span style={styles.statLabel}>Active Volunteers</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNumber}>30,000+</span>
            <span style={styles.statLabel}>Hours of Service</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNumber}>$2.5M</span>
            <span style={styles.statLabel}>In-Kind Service Value</span>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section style={styles.section}>
        <div style={styles.missionBox}>
          <h2 style={{ ...styles.sectionTitle, textAlign: "left", marginBottom: "1rem" }}>
            Our Mission
          </h2>
          <p style={{ 
            fontSize: "1.25rem", 
            lineHeight: "1.8", 
            color: theme.colors.text.secondary,
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontWeight: "400",
            letterSpacing: "0.025em"
          }}>
            Harry Chapin Food Bank of SWFL's mission is to <strong style={{ fontWeight: "600", color: theme.colors.primary }}>lead our community in the fight to end hunger</strong>. 
            We serve Charlotte, Collier, Glades, Hendry, and Lee counties, providing food assistance to those in need 
            through our network of programs and dedicated volunteers.
          </p>
        </div>

        {/* Programs Grid */}
        <h2 style={styles.sectionTitle}>How We Serve Our Community</h2>
        <div style={styles.programsGrid}>
          <div style={styles.programCard}>
            <img src={childrenImage} alt="Children receiving food" style={styles.programImage} />
            <div style={styles.programContent}>
              <h3 style={styles.programTitle}>Feeding Children</h3>
              <p style={{ 
                color: theme.colors.text.secondary, 
                lineHeight: "1.7", 
                marginBottom: "1rem",
                fontSize: "1.1rem",
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontWeight: "400"
              }}>
                About 32% of the people we serve are children. Hungry children have a hard time learning and developing.
              </p>
              <ul style={{ 
                color: theme.colors.text.secondary, 
                lineHeight: "1.8", 
                paddingLeft: "1.5rem",
                fontSize: "1.05rem",
                fontFamily: "'Georgia', 'Times New Roman', serif"
              }}>
                <li><strong style={{ fontWeight: "600", color: theme.colors.primary }}>Harry's Helpings</strong> - Weekend food for children</li>
                <li><strong style={{ fontWeight: "600", color: theme.colors.primary }}>In-School Pantry</strong> - On-site food assistance</li>
              </ul>
            </div>
          </div>

          <div style={styles.programCard}>
            <img src={familiesImage} alt="Families receiving food" style={styles.programImage} />
            <div style={styles.programContent}>
              <h3 style={styles.programTitle}>Feeding Families</h3>
              <p style={{ 
                color: theme.colors.text.secondary, 
                lineHeight: "1.7", 
                marginBottom: "1rem",
                fontSize: "1.1rem",
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontWeight: "400"
              }}>
                Most of our clients are working families, struggling to make ends meet.
              </p>
              <ul style={{ 
                color: theme.colors.text.secondary, 
                lineHeight: "1.8", 
                paddingLeft: "1.5rem",
                fontSize: "1.05rem",
                fontFamily: "'Georgia', 'Times New Roman', serif"
              }}>
                <li><strong style={{ fontWeight: "600", color: theme.colors.primary }}>Fulfill Mobile Pantries</strong> - Food delivered to communities</li>
                <li><strong style={{ fontWeight: "600", color: theme.colors.primary }}>Agency Partner Program</strong> - Supporting local organizations</li>
              </ul>
            </div>
          </div>

          <div style={styles.programCard}>
            <img src={seniorsImage} alt="Seniors receiving food" style={styles.programImage} />
            <div style={styles.programContent}>
              <h3 style={styles.programTitle}>Feeding Seniors</h3>
              <p style={{ 
                color: theme.colors.text.secondary, 
                lineHeight: "1.7", 
                marginBottom: "1rem",
                fontSize: "1.1rem",
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontWeight: "400"
              }}>
                About 19% of the people we serve are seniors. They often choose between buying food and paying for medicine.
              </p>
              <ul style={{ 
                color: theme.colors.text.secondary, 
                lineHeight: "1.8", 
                paddingLeft: "1.5rem",
                fontSize: "1.05rem",
                fontFamily: "'Georgia', 'Times New Roman', serif"
              }}>
                <li><strong style={{ fontWeight: "600", color: theme.colors.primary }}>Care and Share</strong> - Senior feeding program</li>
                <li><strong style={{ fontWeight: "600", color: theme.colors.primary }}>CSFP</strong> - Commodity supplemental food</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Volunteer Information Section */}
        <div style={{ marginTop: "4rem" }}>
          <h2 style={styles.sectionTitle}>Volunteer Information & Resources</h2>
          
          {/* Volunteer Portal Information */}
          <div style={{
            backgroundColor: theme.colors.white,
            padding: "2.5rem",
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.lg,
            marginBottom: "3rem",
            border: `2px solid ${theme.colors.secondary[300]}`,
            position: "relative"
          }}>
            <div style={{
              position: "absolute",
              top: "-15px",
              left: "2rem",
              backgroundColor: theme.colors.secondary,
              color: theme.colors.white,
              padding: "0.75rem 1.5rem",
              borderRadius: theme.borderRadius.md,
              fontSize: "1rem",
              fontWeight: "bold",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              Volunteer Portal
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <h3 style={{ 
                fontSize: "1.5rem", 
                fontWeight: "bold", 
                color: theme.colors.secondary, 
                marginBottom: "1rem"
              }}>
                Welcome to the Volunteer Portal
              </h3>
              <p style={{ 
                color: theme.colors.text.secondary, 
                lineHeight: "1.7", 
                marginBottom: "1.5rem",
                fontSize: "1.1rem",
                fontFamily: "'Georgia', 'Times New Roman', serif"
              }}>
                This online feature gives you an easy way to keep-in-touch with the volunteer program. You can schedule yourself, check your schedule, post your volunteer service, receive messages, and much more: anytime, and from any device.
              </p>
              <div style={{
                backgroundColor: theme.colors.info[50],
                padding: "1.5rem",
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.info[200]}`
              }}>
                <p style={{ 
                  fontSize: "1.1rem", 
                  color: theme.colors.info[800], 
                  margin: 0,
                  fontWeight: "500",
                  fontStyle: "italic"
                }}>
                  Watch this space for the latest volunteer news!
                </p>
              </div>
            </div>
          </div>

          {/* Volunteer Resources Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "2rem",
            marginBottom: "3rem"
          }}>
            {/* Volunteer Handbook */}
            <div style={{
              backgroundColor: theme.colors.white,
              padding: "2rem",
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.md,
              border: `2px solid ${theme.colors.primary[300]}`,
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "1.5rem",
                backgroundColor: theme.colors.primary,
                color: theme.colors.white,
                padding: "0.5rem 1rem",
                borderRadius: theme.borderRadius.md,
                fontSize: "0.875rem",
                fontWeight: "bold"
              }}>
                Volunteer Handbook 2025
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "bold", 
                  color: theme.colors.primary, 
                  marginBottom: "1rem"
                }}>
                  Essential Volunteer Guide
                </h3>
                <p style={{ 
                  color: theme.colors.text.secondary, 
                  lineHeight: "1.6", 
                  marginBottom: "1.5rem",
                  fontSize: "1rem",
                  fontFamily: "'Georgia', 'Times New Roman', serif"
                }}>
                  If you are a new volunteer or have not been through our Orientation, please review this document for more information. The Volunteer Handbook is your extensive guide to volunteering at HCFB!
                </p>
                <a 
                  href="/Volunteer Handbook 2025.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.white,
                    padding: "0.75rem 1.5rem",
                    borderRadius: theme.borderRadius.md,
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    display: "inline-block",
                    transition: "background-color 0.2s ease"
                  }}
                >
                  Download Volunteer Handbook
                </a>
              </div>
            </div>

            {/* Fulfill Mobile Pantry Operations Manual */}
            <div style={{
              backgroundColor: theme.colors.white,
              padding: "2rem",
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.md,
              border: `2px solid ${theme.colors.secondary[300]}`,
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "1.5rem",
                backgroundColor: theme.colors.secondary,
                color: theme.colors.white,
                padding: "0.5rem 1rem",
                borderRadius: theme.borderRadius.md,
                fontSize: "0.875rem",
                fontWeight: "bold"
              }}>
                Fulfill Mobile Pantry Manual
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "bold", 
                  color: theme.colors.secondary, 
                  marginBottom: "1rem"
                }}>
                  Mobile Pantry Operations
                </h3>
                <p style={{ 
                  color: theme.colors.text.secondary, 
                  lineHeight: "1.6", 
                  marginBottom: "1.5rem",
                  fontSize: "1rem",
                  fontFamily: "'Georgia', 'Times New Roman', serif"
                }}>
                  Here is the Operations Manual for our Fulfill Mobile Pantries (FMP). Volunteers that attend FMP should review this manual for complete operating guidelines and procedures.
                </p>
                <a 
                  href="/Fulfill Mobile Pantry Ops Manualv6.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: theme.colors.secondary,
                    color: theme.colors.white,
                    padding: "0.75rem 1.5rem",
                    borderRadius: theme.borderRadius.md,
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    display: "inline-block",
                    transition: "background-color 0.2s ease"
                  }}
                >
                  Download FMP Manual
                </a>
              </div>
            </div>
          </div>

          <h2 style={styles.sectionTitle}>Volunteer Opportunities</h2>
          
          {/* Hero Volunteer Section */}
          <div style={{
            backgroundColor: theme.colors.white,
            padding: "3rem 2rem",
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.lg,
            marginBottom: "3rem",
            border: `1px solid ${theme.colors.neutral[200]}`,
            textAlign: "center"
          }}>
            <h3 style={{ 
              fontSize: "2rem", 
              fontWeight: "bold", 
              color: theme.colors.primary, 
              marginBottom: "1.5rem",
              lineHeight: theme.typography.lineHeight.tight
            }}>
              Volunteers Power the Harry Chapin Food Bank of SWFL
            </h3>
            <p style={{ 
              fontSize: "1.3rem", 
              lineHeight: "1.8", 
              color: theme.colors.text.secondary, 
              marginBottom: "2rem",
              maxWidth: "800px",
              margin: "0 auto 2rem",
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontWeight: "400",
              letterSpacing: "0.025em"
            }}>
              Volunteers make it possible for the food bank to feed a quarter of a million people a month in Southwest Florida. 
              They sort and pack donations, distribute food at mobile pantries, and collect donations at food drives.
            </p>
          </div>
          
          {/* Schedule Cards */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
            gap: "2.5rem", 
            marginBottom: "3rem" 
          }}>
            {/* Fort Myers Schedule */}
            <div style={{ 
              backgroundColor: theme.colors.white, 
              padding: "2rem", 
              borderRadius: theme.borderRadius.lg, 
              border: `2px solid ${theme.colors.primary[200]}`,
              boxShadow: theme.shadows.md,
              transition: "all 0.3s ease",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "2rem",
                backgroundColor: theme.colors.primary,
                color: theme.colors.white,
                padding: "0.5rem 1rem",
                borderRadius: theme.borderRadius.md,
                fontSize: "0.875rem",
                fontWeight: "bold"
              }}>
                Fort Myers
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <h4 style={{ 
                  fontSize: "1.5rem", 
                  fontWeight: "bold", 
                  color: theme.colors.secondary, 
                  marginBottom: "0.75rem",
                  lineHeight: theme.typography.lineHeight.tight
                }}>
                  Distribution Center
                </h4>
                <p style={{ 
                  color: theme.colors.text.secondary, 
                  marginBottom: "1.5rem", 
                  fontSize: "1.15rem",
                  fontWeight: "500",
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  letterSpacing: "0.025em"
                }}>
                  3760 Fowler Street, Fort Myers
                </p>
                <div style={{ 
                  backgroundColor: theme.colors.neutral[50], 
                  padding: "1.25rem", 
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.neutral[200]}`
                }}>
                  <p style={{ 
                    fontSize: "1.25rem", 
                    fontWeight: "bold", 
                    color: theme.colors.text.primary,
                    marginBottom: "0.75rem"
                  }}>
                    Monday-Thursday
                  </p>
                  <div style={{ 
                    fontSize: "1.15rem", 
                    color: theme.colors.text.secondary, 
                    lineHeight: "1.6",
                    fontFamily: "'Georgia', 'Times New Roman', serif"
                  }}>
                    <p style={{ margin: "0.5rem 0" }}>
                      <strong style={{ fontWeight: "600", color: theme.colors.primary }}>8:30 am - 11:30 am</strong>
                    </p>
                    <p style={{ margin: "0.5rem 0" }}>
                      <strong style={{ fontWeight: "600", color: theme.colors.primary }}>12 pm - 3 pm</strong>
                    </p>
                  </div>
                  <p style={{ 
                    fontSize: "1.25rem", 
                    fontWeight: "bold", 
                    color: theme.colors.text.primary,
                    marginBottom: "0.75rem",
                    marginTop: "1rem"
                  }}>
                    Fridays
                  </p>
                  <div style={{ 
                    fontSize: "1.15rem", 
                    color: theme.colors.text.secondary, 
                    lineHeight: "1.6",
                    fontFamily: "'Georgia', 'Times New Roman', serif"
                  }}>
                    <p style={{ margin: "0.5rem 0" }}>
                      <strong style={{ fontWeight: "600", color: theme.colors.primary }}>8:30 am - 11:30 am only</strong>
                    </p>
                  </div>
                  <div style={{ 
                    marginTop: "1rem", 
                    padding: "0.75rem", 
                    backgroundColor: theme.colors.info[50], 
                    borderRadius: theme.borderRadius.sm,
                    border: `1px solid ${theme.colors.info[200]}`
                  }}>
                    <p style={{ 
                      fontSize: "1rem", 
                      color: theme.colors.info[800],
                      margin: 0,
                      fontWeight: "500"
                    }}>
                      Minimum age: 14
                    </p>
                    <p style={{ 
                      fontSize: "1rem", 
                      color: theme.colors.info[800],
                      margin: "0.5rem 0 0 0",
                      fontWeight: "500"
                    }}>
                      All minors must be accompanied by an Adult
                    </p>
                  </div>
                  <div style={{ 
                    marginTop: "1rem", 
                    padding: "0.75rem", 
                    backgroundColor: theme.colors.success[50], 
                    borderRadius: theme.borderRadius.sm,
                    border: `1px solid ${theme.colors.success[200]}`
                  }}>
                    <p style={{ 
                      fontSize: "1rem", 
                      color: theme.colors.success[800],
                      margin: 0,
                      fontWeight: "500"
                    }}>
                      *Special/corporate groups available
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Naples Schedule */}
            <div style={{ 
              backgroundColor: theme.colors.white, 
              padding: "2rem", 
              borderRadius: theme.borderRadius.lg, 
              border: `2px solid ${theme.colors.secondary[200]}`,
              boxShadow: theme.shadows.md,
              transition: "all 0.3s ease",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "2rem",
                backgroundColor: theme.colors.secondary,
                color: theme.colors.white,
                padding: "0.5rem 1rem",
                borderRadius: theme.borderRadius.md,
                fontSize: "0.875rem",
                fontWeight: "bold"
              }}>
                Naples
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <h4 style={{ 
                  fontSize: "1.5rem", 
                  fontWeight: "bold", 
                  color: theme.colors.secondary, 
                  marginBottom: "0.75rem",
                  lineHeight: theme.typography.lineHeight.tight
                }}>
                  Collier County Center
                </h4>
                <p style={{ 
                  color: theme.colors.text.secondary, 
                  marginBottom: "1.5rem", 
                  fontSize: "1.15rem",
                  fontWeight: "500",
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  letterSpacing: "0.025em"
                }}>
                  3940 Prospect Ave. #101, Naples
                </p>
                <div style={{ 
                  backgroundColor: theme.colors.neutral[50], 
                  padding: "1.25rem", 
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.neutral[200]}`
                }}>
                  <p style={{ 
                    fontSize: "1.25rem", 
                    fontWeight: "bold", 
                    color: theme.colors.text.primary,
                    marginBottom: "0.75rem"
                  }}>
                    Monday-Thursday
                  </p>
                  <div style={{ 
                    fontSize: "1.15rem", 
                    color: theme.colors.text.secondary, 
                    lineHeight: "1.6",
                    fontFamily: "'Georgia', 'Times New Roman', serif"
                  }}>
                    <p style={{ margin: "0.5rem 0" }}>
                      <strong style={{ fontWeight: "600", color: theme.colors.primary }}>8:30 am - 11:30 am</strong>
                    </p>
                    <p style={{ margin: "0.5rem 0" }}>
                      <strong style={{ fontWeight: "600", color: theme.colors.primary }}>12 pm - 3 pm</strong>
                    </p>
                  </div>
                  <p style={{ 
                    fontSize: "1.25rem", 
                    fontWeight: "bold", 
                    color: theme.colors.text.primary,
                    marginBottom: "0.75rem",
                    marginTop: "1rem"
                  }}>
                    Fridays
                  </p>
                  <div style={{ 
                    fontSize: "1.15rem", 
                    color: theme.colors.text.secondary, 
                    lineHeight: "1.6",
                    fontFamily: "'Georgia', 'Times New Roman', serif"
                  }}>
                    <p style={{ margin: "0.5rem 0" }}>
                      <strong style={{ fontWeight: "600", color: theme.colors.primary }}>8:30 am - 11:30 am only</strong>
                    </p>
                  </div>
                  <div style={{ 
                    marginTop: "1rem", 
                    padding: "0.75rem", 
                    backgroundColor: theme.colors.info[50], 
                    borderRadius: theme.borderRadius.sm,
                    border: `1px solid ${theme.colors.info[200]}`
                  }}>
                    <p style={{ 
                      fontSize: "1rem", 
                      color: theme.colors.info[800],
                      margin: 0,
                      fontWeight: "500"
                    }}>
                      Minimum age: 14
                    </p>
                    <p style={{ 
                      fontSize: "1rem", 
                      color: theme.colors.info[800],
                      margin: "0.5rem 0 0 0",
                      fontWeight: "500"
                    }}>
                      All minors must be accompanied by an Adult
                    </p>
                  </div>
                  <div style={{ 
                    marginTop: "1rem", 
                    padding: "0.75rem", 
                    backgroundColor: theme.colors.success[50], 
                    borderRadius: theme.borderRadius.sm,
                    border: `1px solid ${theme.colors.success[200]}`
                  }}>
                    <p style={{ 
                      fontSize: "1rem", 
                      color: theme.colors.success[800],
                      margin: 0,
                      fontWeight: "500"
                    }}>
                      *Special/corporate groups available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Contact Information */}
          <div style={{ 
            backgroundColor: "#ffffff", 
            padding: "2.5rem", 
            borderRadius: theme.borderRadius.lg, 
            marginTop: "3rem", 
            border: `2px solid ${theme.colors.primary[300]}`,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            position: "relative"
          }}>
            <div style={{
              position: "absolute",
              top: "-15px",
              left: "2rem",
              backgroundColor: "#1d4ed8",
              color: "#ffffff",
              padding: "0.75rem 1.5rem",
              borderRadius: theme.borderRadius.md,
              fontSize: "1rem",
              fontWeight: "bold",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              Contact Information
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                gap: "2rem"
              }}>
                <div style={{ 
                  backgroundColor: theme.colors.white, 
                  padding: "2rem", 
                  borderRadius: theme.borderRadius.lg,
                  border: `1px solid ${theme.colors.primary[200]}`,
                  textAlign: "center"
                }}>
                  <h4 style={{ 
                    fontSize: "1.5rem", 
                    fontWeight: "bold", 
                    color: theme.colors.primary, 
                    marginBottom: "0.5rem"
                  }}>
                    Angelina Codi
                  </h4>
                  <p style={{ 
                    color: theme.colors.text.secondary, 
                    marginBottom: "1.5rem",
                    fontSize: "1.25rem",
                    fontWeight: "500",
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    letterSpacing: "0.025em"
                  }}>
                    Volunteer Coordinator
                  </p>
                  <div style={{ 
                    backgroundColor: theme.colors.neutral[50], 
                    padding: "1.25rem", 
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.neutral[200]}`
                  }}>
                    <p style={{ 
                      fontSize: "1.25rem", 
                      fontWeight: "bold", 
                      color: theme.colors.text.primary,
                      marginBottom: "0.75rem",
                      textAlign: "center"
                    }}>
                      Phone
                    </p>
                    <p style={{ 
                      color: theme.colors.text.secondary, 
                      margin: 0, 
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      letterSpacing: "0.025em"
                    }}>
                      (239) 334-7007 ext. 159
                    </p>
                  </div>
                </div>
                
                <div style={{ 
                  backgroundColor: theme.colors.white, 
                  padding: "2rem", 
                  borderRadius: theme.borderRadius.lg,
                  border: `1px solid ${theme.colors.primary[200]}`
                }}>
                  <h4 style={{ 
                    fontSize: "1.5rem", 
                    fontWeight: "bold", 
                    color: theme.colors.primary, 
                    marginBottom: "1.5rem"
                  }}>
                    Contact Details
                  </h4>
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "1rem"
                  }}>
                    <div style={{ 
                      backgroundColor: theme.colors.neutral[50], 
                      padding: "1rem", 
                      borderRadius: theme.borderRadius.md,
                      border: `1px solid ${theme.colors.neutral[200]}`
                    }}>
                      <p style={{ 
                        fontSize: "1.125rem", 
                        fontWeight: "bold", 
                        color: theme.colors.text.primary,
                        marginBottom: "0.25rem"
                      }}>
                        Email
                      </p>
                      <p style={{ 
                        color: theme.colors.text.secondary, 
                        margin: 0, 
                        fontSize: "1.15rem",
                        wordBreak: "break-all",
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        letterSpacing: "0.025em"
                      }}>
                        volunteer@harrychapinfoodbank.org
                      </p>
                    </div>
                    
                    <div style={{ 
                      backgroundColor: theme.colors.neutral[50], 
                      padding: "1rem", 
                      borderRadius: theme.borderRadius.md,
                      border: `1px solid ${theme.colors.neutral[200]}`
                    }}>
                      <p style={{ 
                        fontSize: "1.125rem", 
                        fontWeight: "bold", 
                        color: theme.colors.text.primary,
                        marginBottom: "0.25rem"
                      }}>
                        Hours
                      </p>
                      <p style={{ 
                        color: theme.colors.text.secondary, 
                        margin: 0, 
                        fontSize: "1.15rem",
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        letterSpacing: "0.025em"
                      }}>
                        Monday – Friday, 8 a.m. – 4:30 p.m.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        ...styles.ctaSection,
        backgroundColor: theme.colors.neutral[50],
        borderTop: `1px solid ${theme.colors.neutral[200]}`,
        padding: "4rem 2rem"
      }}>
        <div style={{
          backgroundColor: theme.colors.white,
          padding: "3rem 2rem",
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.lg,
          border: `1px solid ${theme.colors.neutral[200]}`,
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center"
        }}>
          <h2 style={{
            ...styles.sectionTitle,
            fontSize: "2.5rem",
            marginBottom: "1.5rem",
            color: theme.colors.primary
          }}>
            Ready to Make a Difference?
          </h2>
          <p style={{ 
            fontSize: "1.3rem", 
            color: theme.colors.text.secondary, 
            marginBottom: "2.5rem",
            lineHeight: "1.7",
            maxWidth: "700px",
            margin: "0 auto 2.5rem",
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontWeight: "400",
            letterSpacing: "0.025em"
          }}>
            {user 
              ? <>Join our community of <strong style={{ fontWeight: '600', color: theme.colors.primary }}>1,000+ volunteers</strong> who contribute <strong style={{ fontWeight: '600', color: theme.colors.primary }}>30,000+ hours annually</strong>. Schedule your volunteer shift today and help us feed <strong style={{ fontWeight: '600', color: theme.colors.primary }}>250,000+ people monthly</strong>.</>
              : <>Join our community of <strong style={{ fontWeight: '600', color: theme.colors.primary }}>1,000+ volunteers</strong> who contribute <strong style={{ fontWeight: '600', color: theme.colors.primary }}>30,000+ hours annually</strong>. Sign up today to schedule your volunteer shift and help us feed <strong style={{ fontWeight: '600', color: theme.colors.primary }}>250,000+ people monthly</strong>.</>
            }
          </p>
          
          <div style={{ 
            display: "flex", 
            gap: "1.5rem", 
            justifyContent: "center", 
            flexWrap: "wrap", 
            marginBottom: "2rem"
          }}>
            {user ? (
              <Link to="/events" style={{
                ...styles.button,
                fontSize: "1.125rem",
                padding: "1.25rem 2.5rem",
                boxShadow: theme.shadows.lg,
                transform: "translateY(-2px)",
                transition: "all 0.3s ease"
              }}>
                View Volunteer Opportunities
              </Link>
            ) : (
              <Link to="/signup" style={{
                ...styles.button,
                fontSize: "1.125rem",
                padding: "1.25rem 2.5rem",
                boxShadow: theme.shadows.lg,
                transform: "translateY(-2px)",
                transition: "all 0.3s ease"
              }}>
                Sign Up to Volunteer
              </Link>
            )}
            <a 
              href="tel:+12393347007" 
              style={{
                ...styles.button,
                backgroundColor: theme.colors.secondary,
                color: theme.colors.white,
                fontSize: "1.125rem",
                padding: "1.25rem 2.5rem",
                boxShadow: theme.shadows.lg,
                transform: "translateY(-2px)",
                transition: "all 0.3s ease"
              }}
              >
                Call (239) 334-7007
              </a>
          </div>
          
          <div style={{
            backgroundColor: theme.colors.info[50],
            padding: "1.5rem",
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.info[200]}`,
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            <p style={{ 
              fontSize: "1rem", 
              color: theme.colors.info[800], 
              margin: 0,
              fontWeight: "500",
              lineHeight: "1.6"
            }}>
              <strong>Important:</strong> All volunteering must be scheduled in advance. 
              Contact Angelina Codi, Volunteer Coordinator, for more information.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
