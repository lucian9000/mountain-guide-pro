-- =====================================================================
-- PHASE 6 — Group events, group pricing, email-signup profile fields
-- =====================================================================
-- Additive and idempotent: safe to run more than once. Does NOT modify
-- schema.sql history. Applied to the live project as migration
-- `phase6_events_and_group_pricing`.
--
-- ⚠️ Written against the REAL schema, which differs from the Phase 6 brief:
--   * bookings uses `participants` (NOT `participant_count`).
--   * pricing ALREADY has `price_group` (populated for 6 tours) — that IS the
--     group rate, so we reuse it instead of adding a duplicate `group_price`.
--     Phase 6 only adds `group_min_size` (the threshold it kicks in at).
--   * `start_time` is `time`, not `timetz` (a time with no date has no
--     meaningful zone; the business is single-timezone SAST).
--   * bookings gets a PERMISSIVE "not both" constraint rather than a strict
--     XOR: one existing row has neither pricing_id nor event_id (calendar-sync
--     inserts a null pricing_id when an event title matches no tour), so an
--     exactly-one constraint could not be applied.
-- =====================================================================


-- =====================================================================
-- 1. GROUP PRICING on existing tours
-- =====================================================================
-- `price_group` (already present) = per-person rate for groups.
-- `group_min_size` = party size at which the group rate starts applying.
alter table public.pricing
  add column if not exists group_min_size int not null default 4;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pricing_group_min_size_check'
  ) then
    alter table public.pricing
      add constraint pricing_group_min_size_check check (group_min_size >= 2);
  end if;
end $$;

comment on column public.pricing.price_group is
  'Per-person price for groups of at least group_min_size. NULL = no group rate.';
comment on column public.pricing.group_min_size is
  'Party size from which price_group applies instead of price.';


-- =====================================================================
-- 2. EVENTS — one-off dated group adventures
-- =====================================================================
create table if not exists public.events (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 2 and 120),
  description      text check (description is null or char_length(description) <= 4000),
  location         text check (location is null or char_length(location) <= 200),
  event_date       date not null,
  start_time       time,
  duration_hours   int check (duration_hours is null or duration_hours between 1 and 24),
  capacity         int not null default 10 check (capacity > 0),
  price_per_person numeric(10,2) not null check (price_per_person >= 0),
  image_url        text,
  is_published     boolean not null default false,
  guide_id         uuid references public.guides (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists events_date_idx on public.events (event_date);
create index if not exists events_published_date_idx
  on public.events (is_published, event_date);

drop trigger if exists events_touch_updated_at on public.events;
create trigger events_touch_updated_at
  before update on public.events
  for each row execute function public.touch_updated_at();

alter table public.events enable row level security;

-- Public (anon + signed-in) may read ONLY published, not-yet-past events.
drop policy if exists "events: public reads published upcoming" on public.events;
create policy "events: public reads published upcoming"
  on public.events for select
  using (is_published and event_date >= current_date);

-- Admins do everything.
drop policy if exists "events: admin full access" on public.events;
create policy "events: admin full access"
  on public.events for all
  using (public.is_admin())
  with check (public.is_admin());


-- =====================================================================
-- 3. BOOKINGS → EVENTS link
-- =====================================================================
alter table public.bookings
  add column if not exists event_id uuid references public.events (id) on delete set null;

create index if not exists bookings_event_id_idx on public.bookings (event_id);

-- A booking is for a private tour (pricing_id) OR a group event (event_id) —
-- never both. Deliberately permissive about neither: calendar-synced bookings
-- can have no matched tour.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookings_single_subject'
  ) then
    alter table public.bookings
      add constraint bookings_single_subject
      check (not (pricing_id is not null and event_id is not null));
  end if;
end $$;


-- =====================================================================
-- 4. SPOTS-REMAINING view
-- =====================================================================
-- NOTE ON SECURITY: this view intentionally runs with the *definer's* rights
-- (the Postgres default) rather than security_invoker. With security_invoker
-- the bookings join would be filtered by the caller's RLS — anon cannot read
-- bookings, so every event would report spots_left = capacity, which defeats
-- the purpose. Instead the view itself hard-filters to published, upcoming
-- events, so the only rows it can ever expose are the ones already public via
-- the events RLS policy. Only aggregate counts leak — never booking rows.
-- Admin screens compute per-event counts from `bookings` directly (they have
-- full read access), so drafts/past events are covered there.
create or replace view public.event_availability as
  select
    e.id,
    e.capacity,
    greatest(
      e.capacity - coalesce(
        sum(b.participants) filter (where b.status in ('pending', 'confirmed')),
        0
      ),
      0
    )::int as spots_left
  from public.events e
  left join public.bookings b on b.event_id = e.id
  where e.is_published
    and e.event_date >= current_date
  group by e.id, e.capacity;

grant select on public.event_availability to anon, authenticated;


-- =====================================================================
-- 5. OVERBOOKING GUARD
-- =====================================================================
-- Raises 'EVENT_FULL: …' so the UI can show a friendly "this event just filled
-- up" message. Locks the events row (FOR UPDATE) so two people booking the
-- last spots at the same moment cannot both succeed.
create or replace function public.check_event_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity int;
  v_taken    int;
begin
  -- Only group-event bookings consume capacity.
  if new.event_id is null then
    return new;
  end if;

  -- Cancelled / completed bookings don't hold a spot.
  if new.status not in ('pending', 'confirmed') then
    return new;
  end if;

  select capacity into v_capacity
  from public.events
  where id = new.event_id
  for update;                       -- serialise concurrent bookings per event

  if v_capacity is null then
    raise exception 'EVENT_NOT_FOUND: event % does not exist', new.event_id
      using errcode = 'P0001';
  end if;

  select coalesce(sum(participants), 0) into v_taken
  from public.bookings
  where event_id = new.event_id
    and status in ('pending', 'confirmed')
    and id <> new.id;               -- exclude self (no-op on INSERT)

  if v_taken + new.participants > v_capacity then
    raise exception 'EVENT_FULL: only % spot(s) left for this event',
      greatest(v_capacity - v_taken, 0)
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_check_event_capacity on public.bookings;
create trigger bookings_check_event_capacity
  before insert or update of participants, event_id, status on public.bookings
  for each row execute function public.check_event_capacity();


-- =====================================================================
-- 6. handle_new_user — carry marketing_opt_in from email sign-ups
-- =====================================================================
-- The email/password sign-up form passes full_name + marketing_opt_in through
-- auth metadata. Reading it here means the preference is stored even when
-- email confirmation is ON (no client session exists at that point to write
-- the profile row itself). Google SSO simply omits the key → defaults false.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, marketing_opt_in)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce((new.raw_user_meta_data ->> 'marketing_opt_in')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- (trigger on_auth_user_created already exists from schema.sql and is unchanged)
