import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  /** True until the initial session + profile fetch settles. Guards must wait. */
  loading: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  /**
   * Fetch the user's profile row. There's a small race on first sign-in where
   * the handle_new_user() trigger row may not be readable on the very first
   * select — retry once before giving up.
   */
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) return data as Profile;
      if (error && attempt === 0) await sleep(400);
    }
    return null;
  };

  useEffect(() => {
    isMounted.current = true;

    // Initial load: resolve session, then profile, then drop the loading gate.
    // Wrapped so a misconfigured env / network error can never leave the whole
    // app stuck behind the loading spinner.
    (async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        if (!isMounted.current) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const p = await fetchProfile(initialSession.user.id);
          if (!isMounted.current) return;
          setProfile(p);
        }
      } catch (err) {
        console.error("[auth] failed to initialize session", err);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    })();

    // Subsequent transitions (sign-in/out in this or another tab, token refresh).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted.current) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (event === "SIGNED_OUT" || !nextSession?.user) {
        setProfile(null);
        return;
      }
      // Refresh the profile on sign-in; token refreshes keep the existing one.
      // ⚠️ Deferred via setTimeout: auth-js holds its session lock while
      // notifying subscribers, and a Supabase query in the same tick needs
      // that lock to read the access token — awaiting it here deadlocks the
      // whole client (per the onAuthStateChange docs).
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        const userId = nextSession.user.id;
        setTimeout(async () => {
          const p = await fetchProfile(userId);
          if (isMounted.current) setProfile(p);
        }, 0);
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (redirectTo?: string) => {
    const base = import.meta.env.VITE_SITE_URL || window.location.origin;
    const callback = `${base}/auth/callback${
      redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""
    }`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callback,
        // calendar.readonly lets the admin dashboard render the signed-in
        // user's Google Calendar via session.provider_token. Sensitive scope:
        // while the Google OAuth app is unverified/in testing, only test
        // users can grant it.
        scopes: "https://www.googleapis.com/auth/calendar.readonly",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Hard nav clears all in-memory state cleanly.
    window.location.assign("/");
  };

  const value: AuthContextValue = {
    user,
    session,
    profile,
    role: profile?.role ?? null,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default AuthProvider;
