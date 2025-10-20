import { Routes, Route } from "react-router-dom"
import { AdminAuthProvider } from "./hooks/useAdminAuth"

// Volunteer pages
import Home from "./pages/Home"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import ProfilePage from "./pages/ProfilePage"
import EventsPage from "./pages/EventsPage"
import DashboardPage from "./pages/DashboardPage"
import ReportsPage from "./pages/ReportsPage"
import AdminPage from "./pages/AdminPage"

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage"
import AdminDashboardPage from "./pages/admin/AdminDashboardPage"
import AdminVolunteersPage from "./pages/admin/AdminVolunteersPage"
import AdminShiftsPage from "./pages/admin/AdminShiftsPage"

export default function AppRoutes() {
  return (
    <Routes>
      {/* Volunteer Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/reports" element={<ReportsPage />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={
        <AdminAuthProvider><AdminLoginPage /></AdminAuthProvider>
      } />
      <Route path="/admin/dashboard" element={
        <AdminAuthProvider><AdminDashboardPage /></AdminAuthProvider>
      } />
      <Route path="/admin/volunteers" element={
        <AdminAuthProvider><AdminVolunteersPage /></AdminAuthProvider>
      } />
      <Route path="/admin/shifts" element={
        <AdminAuthProvider><AdminShiftsPage /></AdminAuthProvider>
      } />
    </Routes>
  )
}
