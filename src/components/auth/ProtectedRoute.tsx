import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthLoading from "@/components/auth/AuthLoading";

/**
 * Gate for any authenticated route (/dashboard/*). Never redirects while the
 * session is still resolving — that flicker is the #1 SPA auth bug.
 */
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
