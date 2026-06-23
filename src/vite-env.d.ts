/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL (anon-safe). e.g. https://xxxx.supabase.co */
  readonly VITE_SUPABASE_URL: string;
  /** Supabase anon public key. RLS-protected — safe to ship in the client bundle. */
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Public origin used to build the OAuth redirect, e.g. http://localhost:8080 */
  readonly VITE_SITE_URL: string;
  /** Email that should be promoted to the 'admin' role (informational only). */
  readonly VITE_ADMIN_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
