export type UserRole = "client" | "admin";

/** Row in the public.profiles table (see supabase/schema.sql). */
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
}
