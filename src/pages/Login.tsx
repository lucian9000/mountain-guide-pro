import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import AuthLoading from "@/components/auth/AuthLoading";
import logo from "@/assets/logo-small.webp";

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

/** Maps raw Supabase auth errors to copy a hiker can act on. */
const friendlyAuthError = (message: string): string => {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "That email or password doesn't look right.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "That email already has an account — try signing in.";
  if (m.includes("password") && m.includes("6 characters"))
    return "Password must be at least 6 characters.";
  if (m.includes("email not confirmed"))
    return "Check your inbox to confirm your email first.";
  return message;
};

const fieldClass =
  "w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]";
const labelClass =
  "block text-left text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground mb-1.5";

const Login = () => {
  const {
    user,
    loading,
    signInWithGoogle,
    signInWithPassword,
    signUpWithPassword,
    sendPasswordReset,
  } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [formPending, setFormPending] = useState(false);
  const [resetPending, setResetPending] = useState(false);

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

  const showError = (message: string) =>
    toast({
      title: mode === "signup" ? "Sign-up failed" : "Sign-in failed",
      description: friendlyAuthError(message),
      variant: "destructive",
    });

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formPending) return;

    if (password.length < 6) {
      toast({
        title: mode === "signup" ? "Sign-up failed" : "Sign-in failed",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setFormPending(true);
    try {
      if (mode === "signup") {
        const { error, session } = await signUpWithPassword({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          marketingOptIn,
        });
        if (error) {
          showError(error.message);
          return;
        }
        if (session) {
          navigate(redirectTarget, { replace: true });
        } else {
          toast({
            title: "Almost there",
            description: "Check your inbox to confirm your email.",
          });
        }
        return;
      }

      const { error } = await signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        showError(error.message);
        return;
      }
      navigate(redirectTarget, { replace: true });
    } finally {
      setFormPending(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({
        title: "Email needed",
        description: "Enter your email address first, then tap Forgot password.",
      });
      return;
    }
    setResetPending(true);
    try {
      const { error } = await sendPasswordReset(email.trim());
      if (error) {
        toast({
          title: "Couldn't send reset link",
          description: friendlyAuthError(error.message),
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Reset link sent",
        description: "Check your inbox for a link to set a new password.",
      });
    } finally {
      setResetPending(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[image:var(--glow-cyan-top)]" />

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
          className="w-full bg-accent hover:bg-cyan-hover text-accent-foreground px-6 py-3.5 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center gap-3"
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

        {isSupabaseConfigured && (
          <>
            <div className="flex items-center gap-3 my-6" aria-hidden="true">
              <span className="h-px flex-1 bg-border" />
              <span className="text-muted-foreground text-xs uppercase tracking-wider">
                or
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label htmlFor="login-full-name" className={labelClass}>
                    Full Name
                  </label>
                  <input
                    id="login-full-name"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={fieldClass}
                    placeholder="Thabo Mokoena"
                  />
                </div>
              )}

              <div>
                <label htmlFor="login-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldClass}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="login-password" className={labelClass}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${fieldClass} pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-11 w-11 inline-flex items-center justify-center text-muted-foreground hover:text-accent rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div className="flex items-start gap-3 text-left">
                  <input
                    id="login-marketing-opt-in"
                    name="marketingOptIn"
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-border accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  <label
                    htmlFor="login-marketing-opt-in"
                    className="text-muted-foreground text-xs leading-relaxed"
                  >
                    Keep me posted on upcoming hikes and specials
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={formPending}
                className="w-full bg-accent hover:bg-cyan-hover text-accent-foreground px-6 py-3.5 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {formPending && <Loader2 className="w-5 h-5 animate-spin" />}
                {mode === "signup" ? "Create Account" : "Sign In"}
              </button>
            </form>

            {mode === "signin" && (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetPending}
                className="mt-4 text-muted-foreground hover:text-accent text-xs transition-colors disabled:opacity-50 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {resetPending ? "Sending…" : "Forgot password?"}
              </button>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() =>
                  setMode((m) => (m === "signin" ? "signup" : "signin"))
                }
                className="text-accent hover:text-cyan-hover transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {mode === "signin"
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            </p>
          </>
        )}

        <p className="text-muted-foreground text-xs mt-6 leading-relaxed">
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
