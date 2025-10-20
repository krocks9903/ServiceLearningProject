import Navbar from "./components/shared/Navbar"
import Footer from "./Footer"
import AppRoutes from "./AppRoutes"
import { useAuth } from "./hooks/useAuth"

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <div style={{ fontSize: "24px", marginBottom: "1rem" }}>⏳ Loading...</div>
        <div style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
          This should only take a few seconds.
        </div>
        <div style={{ fontSize: "12px", color: "#999", marginTop: "10px" }}>
          If stuck, check browser console (F12) for errors.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <AppRoutes />
      </main>
      <Footer />
    </div>
  )
}

export default App
