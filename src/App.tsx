import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/shared/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";
import EventsPage from "./pages/EventsPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import ReportsPage from "./pages/ReportsPage";

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminVolunteersPage from "./pages/admin/AdminVolunteersPage";
import AdminShiftsPage from "./pages/admin/AdminShiftsPage";

import { useAuth } from "./hooks/useAuth";
import { AdminAuthProvider } from "./hooks/useAdminAuth";
import { theme } from "./theme";
import HoursPage from "./pages/HoursPage";



function App() {
  const { loading } = useAuth();

  // Debug: Log loading state
  console.log("App loading state:", loading);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <div style={{ fontSize: "24px", marginBottom: "1rem" }}>⏳ Loading...</div>
        <div style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
          This should only take a few seconds.
        </div>
        <div style={{ fontSize: "12px", color: "#999", marginTop: "10px" }}>
          If stuck, check browser console (F12) for errors
        </div>
      </div>
    );
  }

  console.log("App loaded successfully!");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>
          {/* Volunteer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/hours" element={<HoursPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/reports" element={<ReportsPage />} />

          {/* Admin Routes - Protected (keep as-is for now) */}
          <Route
            path="/admin/login"
            element={
              <AdminAuthProvider>
                <AdminLoginPage />
              </AdminAuthProvider>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminAuthProvider>
                <AdminDashboardPage />
              </AdminAuthProvider>
            }
          />
          <Route
            path="/admin/volunteers"
            element={
              <AdminAuthProvider>
                <AdminVolunteersPage />
              </AdminAuthProvider>
            }
          />
          <Route
            path="/admin/shifts"
            element={
              <AdminAuthProvider>
                <AdminShiftsPage />
              </AdminAuthProvider>
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: theme?.colors?.secondary ?? "#2a2a2a",
          color: "white",
          padding: "3rem 2rem 1.5rem",
          marginTop: "auto",
          fontFamily: theme?.typography?.fontFamily ?? "system-ui, sans-serif",
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
                  fontSize: theme?.typography?.fontSize?.base ?? "1rem",
                  fontWeight: theme?.typography?.fontWeight?.semibold ?? 600,
                }}
              >
                Contact Us
              </h3>
              <p
                style={{
                  lineHeight: theme?.typography?.lineHeight?.relaxed ?? 1.6,
                  opacity: 0.85,
                  fontSize: theme?.typography?.fontSize?.sm ?? "0.9rem",
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
                  lineHeight: theme?.typography?.lineHeight?.relaxed ?? 1.6,
                  opacity: 0.85,
                  marginTop: "1rem",
                  fontSize: theme?.typography?.fontSize?.sm ?? "0.9rem",
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
                  fontSize: theme?.typography?.fontSize?.base ?? "1rem",
                  fontWeight: theme?.typography?.fontWeight?.semibold ?? 600,
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
                      fontSize: theme?.typography?.fontSize?.sm ?? "0.9rem",
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
                      fontSize: theme?.typography?.fontSize?.sm ?? "0.9rem",
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
                      fontSize: theme?.typography?.fontSize?.sm ?? "0.9rem",
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
                      fontSize: theme?.typography?.fontSize?.sm ?? "0.9rem",
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
                  fontSize: theme?.typography?.fontSize?.base ?? "1rem",
                  fontWeight: theme?.typography?.fontWeight?.semibold ?? 600,
                }}
              >
                Our Impact
              </h3>
              <p
                style={{
                  lineHeight: theme?.typography?.lineHeight?.relaxed ?? 1.6,
                  opacity: 0.85,
                  fontSize: theme?.typography?.fontSize?.sm ?? "0.9rem",
                }}
              >
                Serving <strong>Charlotte, Collier, Glades, Hendry, and Lee counties</strong>
              </p>
              <p
                style={{
                  lineHeight: theme?.typography?.lineHeight?.relaxed ?? 1.6,
                  opacity: 0.85,
                  marginTop: "1rem",
                  fontSize: theme?.typography?.fontSize?.sm ?? "0.9rem",
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
              fontSize: theme?.typography?.fontSize?.sm ?? "0.9rem",
            }}
          >
            <p style={{ marginBottom: "0.5rem" }}>
              © 2025 Harry Chapin Food Bank of SWFL. All Rights Reserved. EIN 59-2332120
            </p>
            <p style={{ fontSize: theme?.typography?.fontSize?.xs ?? "0.8rem", opacity: 0.8 }}>
              This institution is an equal opportunity provider. Registration #CH328
            </p>
            <p
              style={{
                fontSize: theme?.typography?.fontSize?.xs ?? "0.8rem",
                opacity: 0.6,
                marginTop: "0.5rem",
              }}
            >
              <Link to="/admin/login" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                Staff Access
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
