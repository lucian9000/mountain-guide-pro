# Phase 6 — Email auth · Events & group pricing · Admin redesign · Public booking

**Branch:** `v4/phase-6` (local only — NO push until user approves).
**Spec:** user-supplied Phase 6 brief (Tasks 1–4). **Recon done first** — the spec
was written against an assumed schema; five mismatches are corrected below.
**Gates:** `npm run build` + `npm test` clean; axe stays 0 serious/critical;
marketing site must keep working with NO Supabase env vars.

---

## ⚠️ Spec vs. reality — corrections (verified against the live DB)

| # | Spec says | Reality | Decision |
|---|---|---|---|
| 1 | `bookings.participant_count` (view 2d, trigger 2e) | Column is **`bookings.participants`** (int, default 1) | Use `participants`. The spec's SQL would error out. |
| 2 | ADD COLUMN `group_price` to pricing | **`pricing.price_group` already exists AND is populated** (6 tours: 1000/1200/1300 vs price 1200/1500/2000) | **Reuse `price_group`.** Adding `group_price` would leave the real data orphaned in a duplicate column. Only add the new `group_min_size`. |
| 3 | `start_time TIMETZ` | — | Use **`time`** (plain). Postgres docs discourage `timetz`; a time without a date has no meaningful zone. Site is single-TZ (SAST). |
| 4 | booking has EITHER pricing_id OR event_id (implies XOR check) | 8 existing bookings, **1 has neither** (calendar-sync inserts `pricing_id: null` when the event title matches no tour) | Permissive constraint: **NOT both set**. A strict XOR would fail to apply and would break calendar-sync inserts. |
| 5 | 4e: match `src/data/routes.ts` to pricing | `src/data/routes.ts` is imported **only by ChatPanel.tsx** (chat recommendation data). The public route cards on `/routes` are **DB-driven** (`routes` table, `RouteCard.tsx`) | Show prices on the **DB-driven RouteCard** (what visitors actually see), matched by `tour_slug` then case-insensitive name. Also wire the homepage Expeditions cards if a clean match exists. |

Additional notes: `guides` table is **empty** (0 rows) — the wizard's "default to
first active guide" must degrade to "no guide / unassigned", not crash.
`specials` has `active` + `valid_from`/`valid_until` — the banner fallback should
respect the date window, not just `active`.

---

## Task 2 — SQL (foundation; do first) → `supabase/schema-phase6.sql`

Idempotent (`if not exists` / `create or replace`). Applied via
`apply_migration` as `phase6_events_and_group_pricing`.

1. `pricing`: `add column if not exists group_min_size int not null default 4`
   (+ check > 1). **Do not** add `group_price` — `price_group` is the group rate.
2. `events` table: id uuid pk default gen_random_uuid(), title text not null,
   description text, location text, event_date date not null, `start_time time`,
   duration_hours int, capacity int not null default 10 (check > 0),
   price_per_person numeric(10,2) not null (check >= 0), image_url text,
   is_published bool not null default false, guide_id uuid refs guides(id) on
   delete set null, created_at/updated_at timestamptz default now().
   Indexes on (event_date), (is_published, event_date). `touch_updated_at` trigger.
3. RLS on events: public/anon SELECT where `is_published and event_date >= current_date`;
   `is_admin()` for ALL.
4. `bookings`: `add column if not exists event_id uuid references events(id) on
   delete set null` + index; constraint `bookings_single_subject`:
   `check (not (pricing_id is not null and event_id is not null))` (see #4).
5. `event_availability` view: `capacity - coalesce(sum(participants) filter
   (where status in ('pending','confirmed')), 0) as spots_left`, joined on
   `b.event_id = e.id`, grouped by e.id, e.capacity. Grant SELECT to anon +
   authenticated. **`security_invoker = true`** so the view can't leak
   unpublished events past RLS.
6. Overbooking guard: `before insert or update of participants, event_id, status`
   on bookings → if `NEW.event_id is not null` and requested > spots_left
   (excluding the row being updated), `raise exception ... errcode 'P0001'` with a
   recognisable message (`EVENT_FULL`) so the UI can show a friendly toast.
   Guard must ignore cancelled/completed rows (they don't hold spots).

## Task 1 — Email/password auth (parallel to Google SSO; keep SSO as-is)

- `AuthContext`: add `signUpWithPassword({email,password,fullName,marketingOptIn})`,
  `signInWithPassword`, `sendPasswordReset(email)`, `updatePassword(pw)`. Keep
  `signInWithGoogle` untouched.
- `Login.tsx`: keep the Google button, add an "or" divider + email/password form
  with sign-in / sign-up modes, Full Name + "Keep me posted…" checkbox (default
  checked) on sign-up, "Forgot password?" → `resetPasswordForEmail` with
  `redirectTo: ${VITE_SITE_URL}/reset-password`. Map Supabase errors to friendly
  toasts (invalid credentials / already registered / weak password ≥6 /
  email not confirmed).
- `marketing_opt_in`: `handle_new_user` only writes id/email/full_name/avatar, so
  after `signUp` succeeds, update `profiles.marketing_opt_in` (best-effort; if
  email confirmation is ON there's no session yet — then store the intent and
  apply on first authenticated load. Simplest correct approach: pass it in
  `options.data` too and have a Phase-6 SQL tweak read it — **decision:** extend
  `handle_new_user` in schema-phase6.sql to also read
  `raw_user_meta_data->>'marketing_opt_in'`, so it works with confirmation on or off).
- `ResetPassword.tsx` + `/reset-password` route (public): new + confirm password →
  `updateUser({password})` → toast → `/login`. Handle "no recovery session".
- TDD: tests for mode toggle, validation, and the reset flow shape.

## Task 3 — Admin redesign (mobile-first, non-technical user)

- `AdminDashboard.tsx`: three big action cards (Change a price / Create an event /
  View bookings) → compact stat row (upcoming bookings, next event + spots left,
  active special) → existing activity lists inside a collapsed `Accordion`.
  Use lucide icons (not emoji — house rule from Phase 1).
- `AdminPricing.tsx`: card grid (name, big price, group price, active badge, Edit)
  + Dialog with Price / Group price / "Group applies from N people" / Active,
  everything else behind an Advanced accordion. Optimistic update, toast
  "Price updated ✓". Keep the old table file on disk but unrendered.
- `AdminEvents.tsx` (`/admin/events`): event cards with image, title, date,
  "X of Y spots booked" progress bar, Published/Draft badge, Edit / Duplicate /
  Delete (AlertDialog). Past events in a collapsed section.
- `AdminEventEditor.tsx` (`/admin/events/new`, `/admin/events/:id`): 3-step wizard
  (basics → spots & price → look good + live preview card + "Save as draft" /
  "Publish now"). Duplicate = prefill with cleared date (`?duplicate=<id>`).
- `AdminBookings.tsx`: new "Events" tab grouping bookings by event with a
  participant register (name, email, participants) + per-event "Download list"
  CSV.
- Nav: add Events to `AdminLayout` sidebar.

## Task 4 — Public site

- **Book Now FAB**: `ChatWidget`'s floating launcher becomes a Book Now FAB
  (calendar icon + label ≥sm, icon-only below) linking to `/booking`. **Keep
  ChatWidget/ChatPanel files** — the recommendation flow is reused in 4d.
  WhatsApp link already lives in the Footer (verified) — no move needed.
- `EventBanner.tsx`: bottom slide-in after 5s; next upcoming published event
  (title, date, spots left, "Book your spot →" → `/booking?event=<id>`), else
  active in-window special, else nothing. Dismiss → `sessionStorage`. Offset so
  it never covers the FAB. Respect `prefers-reduced-motion` (house rule).
- `UpcomingAdventures.tsx`: homepage section after Expeditions — up to 3 events,
  spots-left badge (amber ≤5, "Fully booked" grey + disabled at 0). Renders
  nothing when empty.
- `Booking.tsx`: mode toggle "Join a group event" | "Book a private tour";
  `?event=<id>` preselects group mode + that event; group pricing applied when
  `participants >= group_min_size && price_group` (show "Group rate applied ✓",
  strike the single-person rate); event bookings insert `event_id` with
  `pricing_id: null`; catch the `EVENT_FULL` trigger error → "This event just
  filled up" toast + refetch spots. Collapsible "Not sure which hike? Get a
  recommendation" hosting the ChatPanel recommendation flow in private mode.
- `RouteCard.tsx`: "From R{price} pp" from pricing matched by slug/name; silent
  when Supabase unconfigured or unmatched.

## Graceful-degradation gate (must verify)

With `VITE_SUPABASE_*` unset: home, /routes, /news, /privacy all render; FAB
works; EventBanner + UpcomingAdventures render nothing; no console errors.

## Deliverables
`supabase/schema-phase6.sql`, README "Phase 6" section (enable Email provider in
Supabase → Auth → Providers; confirmation OFF recommended initially; run the SQL),
CHANGELOG entry, all tests green.
