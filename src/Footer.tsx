import { Link } from "react-router-dom"
import { theme } from "./theme"

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: theme.colors.secondary,
        color: "white",
        padding: "3rem 2rem 1.5rem",
        marginTop: "auto",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "3rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* Contact Info */}
          <div>
            <h3
              style={{
                marginBottom: "1rem",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
              }}
            >
              Contact Us
            </h3>
            <p
              style={{
                lineHeight: theme.typography.lineHeight.relaxed,
                opacity: 0.85,
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              <strong>Fort Myers Distribution Center</strong>
              <br />
              3760 Fowler St.
              <br />
              Fort Myers, FL 33901
            </p>
            <p
              style={{
                lineHeight: theme.typography.lineHeight.relaxed,
                opacity: 0.85,
                marginTop: "1rem",
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              <strong>Phone:</strong> (239) 334-7007
              <br />
              <strong>Hours:</strong> Mon-Fri, 8am-4:30pm
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              style={{
                marginBottom: "1rem",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
              }}
            >
              Quick Links
            </h3>
            <ul style={{ listStyle: "none", padding: 0, lineHeight: "2" }}>
              <li>
                <Link
                  to="/"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    opacity: 0.85,
                    fontSize: theme.typography.fontSize.sm,
                    transition: theme.transitions.fast,
                  }}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    opacity: 0.85,
                    fontSize: theme.typography.fontSize.sm,
                    transition: theme.transitions.fast,
                  }}
                >
                  Volunteer Events
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    opacity: 0.85,
                    fontSize: theme.typography.fontSize.sm,
                    transition: theme.transitions.fast,
                  }}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <a
                  href="https://harrychapinfoodbank.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    opacity: 0.85,
                    fontSize: theme.typography.fontSize.sm,
                    transition: theme.transitions.fast,
                  }}
                >
                  Main Website ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Our Impact */}
          <div>
            <h3
              style={{
                marginBottom: "1rem",
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
              }}
            >
              Our Impact
            </h3>
            <p
              style={{
                lineHeight: theme.typography.lineHeight.relaxed,
                opacity: 0.85,
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              Serving <strong>Charlotte, Collier, Glades, Hendry, and Lee counties</strong>
            </p>
            <p
              style={{
                lineHeight: theme.typography.lineHeight.relaxed,
                opacity: 0.85,
                marginTop: "1rem",
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              <strong>250,000+</strong> people fed monthly
              <br />
              <strong>32%</strong> children served
              <br />
              <strong>19%</strong> seniors served
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "1.5rem",
            textAlign: "center",
            opacity: 0.7,
            fontSize: theme.typography.fontSize.sm,
          }}
        >
          <p style={{ marginBottom: "0.5rem" }}>
            © 2025 Harry Chapin Food Bank of SWFL. All Rights Reserved. EIN 59-2332120
          </p>
          <p style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.8 }}>
            This institution is an equal opportunity provider. Registration #CH328
          </p>
          <p
            style={{
              fontSize: theme.typography.fontSize.xs,
              opacity: 0.6,
              marginTop: "0.5rem",
            }}
          >
            <Link
              to="/admin/login"
              style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
            >
              Staff Access
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
