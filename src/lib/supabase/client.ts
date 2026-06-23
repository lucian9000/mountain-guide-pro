import { createClient } from "@supabase/supabase-js";

/**
 * The ONE place a Supabase client is created. Import `supabase` from here —
 * never call createClient() anywhere else.
 *
 * Browser/SPA client using the PKCE flow (supabase-js v2 default), which is the
 * correct choice for a public single-page app: the anon key is public and RLS
 * protects the data. The session is persisted in localStorage and auto-refreshed.
 *
 * ⚠️ Only anon-safe values belong here. The service_role key must NEVER be
 * referenced in client code — it would be inlined into the public bundle.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Whether real Supabase credentials are present. When false, the public
 * marketing site still loads — only auth/account features are unavailable.
 * Consumers (e.g. the Login page) can read this to show a clear notice
 * instead of a dead button.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // Warn (not error) so it's visible in the console without implying a crash.
  // Locally: copy .env.example → .env.local. On a host (Vercel/Netlify): set
  // the VITE_* env vars in the project settings and redeploy.
  console.warn(
    "[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — " +
      "auth/account features are disabled. The rest of the site works. " +
      "Set these env vars (locally in .env.local, or in your host's settings)."
  );
}

/**
 * createClient() throws "supabaseUrl is required." if given an empty string,
 * which would crash the entire app at module load — before React renders, so
 * the ErrorBoundary can't catch it (you'd see a blank screen). Fall back to a
 * syntactically valid placeholder so the bundle always evaluates; any auth
 * call against it simply fails gracefully (and is gated by isSupabaseConfigured).
 */
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
  {
    auth: {
      flowType: "pkce",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: "summitfit.auth",
    },
  }
);
