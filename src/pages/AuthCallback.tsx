import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthLoading from "@/components/auth/AuthLoading";

/**
 * Landing page after the Google → Supabase OAuth round-trip.
 * supabase-js performs the PKCE code exchange automatically (detectSessionInUrl),
 * so this page only waits for the session to materialize and then routes.
 */
const AuthCallback = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    // Provider-level failure (Supabase appends ?error / ?error_description).
    if (params.get("error") || params.get("error_description")) {
      navigate("/login?error=auth_failed", { replace: true });
      return;
    }

    // Safety net: if nothing resolves in time, bail to login.
    const timeout = setTimeout(() => {
      navigate("/login?error=auth_failed", { replace: true });
    }, 10000);

    return () => clearTimeout(timeout);
  }, [params, navigate]);

  useEffect(() => {
    if (loading) return;
    if (user) {
      const redirect = params.get("redirect") || "/dashboard";
      navigate(redirect, { replace: true });
    }
    // No user yet is NOT failure: the PKCE code exchange
    // (detectSessionInUrl) finishes asynchronously AFTER the initial
    // getSession() resolves null, so bailing here bounced first-time
    // sign-ins to /login. Wait for SIGNED_IN to flip `user`; the 10s
    // safety timeout above handles genuinely failed exchanges.
  }, [loading, user, params, navigate]);

  return <AuthLoading message="Completing sign-in…" />;
};

export default AuthCallback;
