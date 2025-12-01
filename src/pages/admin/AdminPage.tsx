import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to the new admin dashboard
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (!isAdmin) {
        navigate("/dashboard");
      } else {
        navigate("/admin/dashboard");
      }
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <div style={{ fontSize: "24px", marginBottom: "1rem" }}>
          ⏳ Loading...
        </div>
        <div style={{ fontSize: "14px", color: "#666" }}>
          Redirecting to admin dashboard...
        </div>
      </div>
    );
  }

  // This should not be reached due to the redirect above
  return null;
}
