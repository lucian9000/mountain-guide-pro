import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import AuthLoading from "@/components/auth/AuthLoading";
import logo from "@/assets/logo.jpeg";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
    />
  </svg>
);

const Login = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const [params] = useSearchParams();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const redirectTarget = params.get("redirect") || "/dashboard";

  useEffect(() => {
    if (params.get("error") === "auth_failed") {
      toast({
        title: "Sign-in failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  }, [params, toast]);

  if (loading) return <AuthLoading />;
  if (user) return <Navigate to={redirectTarget} replace />;

  const handleSignIn = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle(params.get("redirect") || undefined);
      // Page redirects to Google on success; no need to reset submitting.
    } catch {
      setSubmitting(false);
      toast({
        title: "Sign-in failed",
        description: "Could not start Google sign-in. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--cyan-glow)/0.08),transparent_60%)]" />

      <div className="relative z-10 w-full max-w-md glass-card glow-border p-8 md:p-10 text-center">
        <Link to="/" className="inline-flex items-center gap-3 mb-8">
          <img
            src={logo}
            alt="SummitFit Adventures"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-accent/30"
          />
          <span className="font-heading font-bold text-foreground text-xl tracking-wider uppercase">
            SummitFit
          </span>
        </Link>

        <h1 className="font-heading text-2xl md:text-3xl font-black text-foreground mb-2 tracking-wider uppercase">
          Sign In
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Sign in to book a guided tour or access your account.
        </p>

        {!isSupabaseConfigured && (
          <p className="mb-6 rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-xs text-gold leading-relaxed">
            Sign-in isn&rsquo;t available yet — authentication hasn&rsquo;t been
            configured for this site. Everything else works.
          </p>
        )}

        <button
          onClick={handleSignIn}
          disabled={submitting || !isSupabaseConfigured}
          className="w-full bg-accent hover:bg-[hsl(193,100%,42%)] text-accent-foreground px-6 py-3.5 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center gap-3"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Connecting…
            </>
          ) : (
            <>
              <span className="bg-white rounded-full p-1 flex items-center justify-center">
                <GoogleIcon />
              </span>
              Continue with Google
            </>
          )}
        </button>

        <p className="text-muted-foreground/70 text-xs mt-6 leading-relaxed">
          Admins sign in with the same Google button — you'll be routed to the
          admin panel automatically.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent text-sm mt-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>
      </div>
    </div>
  );
};

export default Login;
