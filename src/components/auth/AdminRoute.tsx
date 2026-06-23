import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthLoading from "@/components/auth/AuthLoading";

/**
 * Gate for admin routes (/admin/*). Requires an authenticated user whose
 * profile role is 'admin'. Logged-in non-admins are sent to their dashboard.
 */
const AdminRoute = () => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  if (role !== "admin") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default AdminRoute;
