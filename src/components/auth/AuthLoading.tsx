import { Loader2 } from "lucide-react";

interface AuthLoadingProps {
  message?: string;
}

/**
 * Full-screen centered spinner. Shown by route guards and auth pages while the
 * session resolves — prevents the "flash of login page" before auth settles.
 */
const AuthLoading = ({ message }: AuthLoadingProps) => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
    <Loader2 className="w-8 h-8 text-accent animate-spin" />
    {message && (
      <p className="text-muted-foreground text-sm tracking-wide">{message}</p>
    )}
  </div>
);

export default AuthLoading;
