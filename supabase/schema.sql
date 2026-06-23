-- =====================================================================
-- SummitFit Adventures — Supabase schema
-- =====================================================================
-- This file is DOCUMENTATION / version control. It is NOT run by the app.
-- Paste it into the Supabase SQL Editor (Dashboard → SQL Editor) and run it.
--
-- Phase 1 (auth foundation) is everything down to the "PHASE 1 ENDS" marker.
-- Phases 2 & 3 tables/policies are planned and will be appended later.
-- =====================================================================


-- =====================================================================
-- TABLE: profiles  — extends auth.users with app fields
-- Auto-populated by the handle_new_user() trigger on first sign-in.
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'client' check (role in ('client', 'admin')),
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- RLS: a user can read and update ONLY their own row.
-- (No INSERT policy needed — the trigger below runs as SECURITY DEFINER.)
-- NOTE: do not expose a way for clients to change their own `role` from the
-- client app. Role changes are made via SQL / a future admin policy only.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- =====================================================================
-- TRIGGER: auto-create a profile row when a new auth user is created
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =====================================================================
-- TRIGGER: keep updated_at fresh on profile updates
-- =====================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();


-- =====================================================================
-- ADMIN PROMOTION — run ONCE, after the admin's first Google sign-in.
-- Replace the email with the value of VITE_ADMIN_EMAIL.
-- =====================================================================
-- update public.profiles set role = 'admin'
-- where email = 'ernest@summitfitadventures.com';

-- =====================================================================
-- PHASE 1 ENDS
-- ---------------------------------------------------------------------
-- Phase 2/3 (planned): add `tags text[]` to profiles; create pricing,
-- specials, guides, bookings; add an is_admin() SECURITY DEFINER helper
-- and admin-all RLS policies (so the browser client can do admin reads
-- without the service-role key); add set_single_active_special() RPC.
-- See the project plan for details.
-- =====================================================================
