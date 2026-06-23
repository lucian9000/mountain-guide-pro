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

if (!url || !anonKey) {
  // Fail loud in dev so a missing .env.local doesn't surface as a cryptic
  // "Invalid API key" later in the OAuth flow.
  console.error(
    "[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
      "Copy .env.example to .env.local and fill in your project values."
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "", {
  auth: {
    flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: "summitfit.auth",
  },
});
