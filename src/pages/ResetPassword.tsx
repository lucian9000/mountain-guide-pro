import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AuthLoading from "@/components/auth/AuthLoading";
import logo from "@/assets/logo-small.webp";

const fieldClass =
  "w-full rounded-lg border border-border bg-background/60 px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]";
const labelClass =
  "block text-left text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground mb-1.5";

const ResetPassword = () => {
  // Supabase parses the recovery link on load (detectSessionInUrl), so a
  // valid link leaves us with a session by the time `loading` settles.
  const { session, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const shell = (children: ReactNode) => (
    <main id="main" className="min-h-dvh bg-background flex items-center justify-center px-4 relative overflow-hidden">
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
        {children}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent text-sm mt-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </div>
    </main>
  );

  if (loading) return <AuthLoading />;

  if (!session) {
    return shell(
      <>
        <h1 className="font-heading text-2xl md:text-3xl font-black text-foreground mb-2 tracking-wider uppercase">
          Link Expired
        </h1>
        <p className="text-muted-foreground text-sm">
          This reset link is invalid or has expired. Request a new one from the
          sign-in page.
        </p>
      </>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setError(null);

    setPending(true);
    try {
      const { error: updateError } = await updatePassword(password);
      if (updateError) {
        setError(updateError.message);
        toast({
          title: "Couldn't update password",
          description: updateError.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });
      navigate("/login");
    } finally {
      setPending(false);
    }
  };

  return shell(
    <>
      <h1 className="font-heading text-2xl md:text-3xl font-black text-foreground mb-2 tracking-wider uppercase">
        Set A New Password
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Choose a new password for your SummitFit account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="new-password" className={labelClass}>
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
              placeholder="••••••••"
              aria-invalid={error ? true : undefined}
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

        <div>
          <label htmlFor="confirm-password" className={labelClass}>
            Confirm Password
          </label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={fieldClass}
            placeholder="••••••••"
            aria-invalid={error ? true : undefined}
          />
        </div>

        {error && (
          <p role="alert" className="text-left text-xs text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-accent hover:bg-cyan-hover text-accent-foreground px-6 py-3.5 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {pending && <Loader2 className="w-5 h-5 animate-spin" />}
          Update Password
        </button>
      </form>
    </>
  );
};

export default ResetPassword;
