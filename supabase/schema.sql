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
-- PHASE 1 ENDS  /  PHASE 2 BEGINS (Admin CRM)
-- =====================================================================


-- ---------------------------------------------------------------------
-- Internal client tags (Phase 2 clients manager). Safe to re-run.
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists tags text[] not null default '{}';


-- =====================================================================
-- is_admin() — SECURITY DEFINER helper.
-- Lets the BROWSER client perform admin-wide reads/writes based on the
-- requester's own role, with NO service_role key in the bundle.
-- SECURITY DEFINER + a direct table read avoids RLS recursion (the
-- function is not subject to the policies that call it).
-- =====================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Admins can read & update ANY profile (clients manager).
drop policy if exists "profiles_admin_select_all" on public.profiles;
create policy "profiles_admin_select_all"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "profiles_admin_update_all" on public.profiles;
create policy "profiles_admin_update_all"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());


-- =====================================================================
-- TABLE: pricing — tours/services shown publicly; edited in admin.
-- =====================================================================
create table if not exists public.pricing (
  id uuid primary key default gen_random_uuid(),
  tour_slug text unique,
  name text not null,
  description text,
  price numeric(10, 2) not null default 0,
  price_group numeric(10, 2),
  currency text not null default 'ZAR',
  duration text,
  difficulty int,
  max_participants int,
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pricing enable row level security;

drop policy if exists "pricing_public_read_active" on public.pricing;
create policy "pricing_public_read_active"
  on public.pricing for select
  using (active = true or public.is_admin());

drop policy if exists "pricing_admin_all" on public.pricing;
create policy "pricing_admin_all"
  on public.pricing for all
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists pricing_touch_updated_at on public.pricing;
create trigger pricing_touch_updated_at
  before update on public.pricing
  for each row execute function public.touch_updated_at();


-- =====================================================================
-- TABLE: specials — homepage promotions. Business rule: only ONE active.
-- =====================================================================
create table if not exists public.specials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  discount_percent int,
  valid_from timestamptz default now(),
  valid_until timestamptz,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.specials enable row level security;

drop policy if exists "specials_public_read_active" on public.specials;
create policy "specials_public_read_active"
  on public.specials for select
  using (active = true or public.is_admin());

drop policy if exists "specials_admin_all" on public.specials;
create policy "specials_admin_all"
  on public.specials for all
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists specials_touch_updated_at on public.specials;
create trigger specials_touch_updated_at
  before update on public.specials
  for each row execute function public.touch_updated_at();

-- Activate exactly one special (deactivate the rest) atomically. Admin only.
create or replace function public.set_single_active_special(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  update public.specials set active = false where active = true and id <> target;
  update public.specials set active = true where id = target;
end;
$$;


-- =====================================================================
-- TABLE: guides — guide profiles. Calendar columns are Phase 3 (stub).
-- The refresh token is a server secret: never select it from the client.
-- =====================================================================
create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  display_name text not null,
  bio text,
  photo_url text,
  specialties text[] not null default '{}',
  google_calendar_id text,        -- Phase 3
  google_refresh_token text,      -- Phase 3 — SERVER SECRET, never exposed to client
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.guides enable row level security;

-- Public read of active guides. NOTE: do not select google_refresh_token from
-- the client; for stricter safety, expose a view without that column later.
drop policy if exists "guides_public_read_active" on public.guides;
create policy "guides_public_read_active"
  on public.guides for select
  using (active = true or public.is_admin());

drop policy if exists "guides_admin_all" on public.guides;
create policy "guides_admin_all"
  on public.guides for all
  using (public.is_admin())
  with check (public.is_admin());


-- =====================================================================
-- TABLE: bookings — client reservations.
-- =====================================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_ref text,
  user_id uuid references public.profiles (id) on delete set null,
  pricing_id uuid references public.pricing (id) on delete set null,
  guide_id uuid references public.guides (id) on delete set null,
  booking_date date not null,
  time_slot text,
  participants int not null default 1,
  total_price numeric(10, 2),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  calendar_synced boolean not null default false,  -- Phase 3
  google_cal_event_id text,                        -- Phase 3
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

drop policy if exists "bookings_owner_select" on public.bookings;
create policy "bookings_owner_select"
  on public.bookings for select
  using (auth.uid() = user_id);

drop policy if exists "bookings_admin_select" on public.bookings;
create policy "bookings_admin_select"
  on public.bookings for select
  using (public.is_admin());

drop policy if exists "bookings_owner_insert" on public.bookings;
create policy "bookings_owner_insert"
  on public.bookings for insert
  with check (auth.uid() = user_id);

drop policy if exists "bookings_admin_update" on public.bookings;
create policy "bookings_admin_update"
  on public.bookings for update
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists bookings_touch_updated_at on public.bookings;
create trigger bookings_touch_updated_at
  before update on public.bookings
  for each row execute function public.touch_updated_at();


-- =====================================================================
-- SEED: pricing rows (mirror src/data/routes.ts). Safe to re-run.
-- =====================================================================
insert into public.pricing
  (tour_slug, name, description, price, price_group, duration, difficulty, max_participants, display_order, active)
values
  ('lions-head',   'Lion''s Head Sunrise Summit',            'Beginner-friendly sunrise scramble up Lion''s Head with ladders and chains.', 1200, 1000, '2–4 hours', 3, 10, 1, true),
  ('platteklip',   'Platteklip Gorge (The Stairmaster)',     'Steep, direct ascent of Table Mountain via the iconic stone staircase.',       1500, 1200, '1–3 hours', 3, 8,  2, true),
  ('kasteelspoort','Kasteelspoort to Diving Board',          'Rocky track to the famous Diving Board viewpoint above Camps Bay.',            1500, 1200, '4–6 hours', 3, 8,  3, true),
  ('waterworks',   'Skeleton Gorge / Nursery Ravine Loop',   'Full-day traverse through forest, ladders and dams from Kirstenbosch.',         2000, 1300, '7–8 hours', 3, 6,  4, true),
  ('india-venster','India Venster (The Adventure Route)',    'Exposed scramble up Table Mountain''s face — for confident adventurers.',       1500, 1200, '3–5 hours', 5, 4,  5, true),
  ('west-peak',    'West Peak, Helderberg Reserve',          'Scenic climb up Helderberg Reserve''s iconic peak above Somerset West.',        1200, 1000, '5–7 hours', 4, 8,  6, true)
on conflict (tour_slug) do nothing;

-- NOTE: `on conflict do nothing` means re-running this file will NOT update
-- prices/names on an already-seeded Supabase project. If you've already run
-- this seed against a live database, apply the corrected values with a
-- manual UPDATE (or change this clause to `do update`) to push them live.

-- =====================================================================
-- PHASE 2 ENDS
-- ---------------------------------------------------------------------
-- Phase 3 (planned): Supabase Storage buckets (specials-images,
-- guide-photos); Edge Functions for the new-client webhook, Google
-- Calendar sync, and transactional email. See docs/ + the project plan.
-- =====================================================================
