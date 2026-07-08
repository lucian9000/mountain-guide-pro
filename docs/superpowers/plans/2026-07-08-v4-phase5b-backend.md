# v4.0 Phase 5b — Booking backend (Edge Functions)

**Branch** `v4/phase-1-a11y`, local only, NEVER push app code. Edge Functions ARE deployed to the live Supabase project (rzcvoyciitclilwwqepk) — they are inert until secrets are set, so production is unaffected.
**Emails (user, 2026-07-08):** booking notifications → `booking@summitfitadventures.com` (alias); actual admin account is `info@summitfitadventures.com`. Fix the ernest@ references.

**Architecture** (Google Appointment Schedules can't call us, so we poll):
1. `calendar-sync` (Deno Edge Function): Google service account (the booking calendar is SHARED with the SA — no domain-wide delegation) → Calendar API `events.list` → mirror appointment events into `public.bookings` (upsert by `google_cal_event_id`; cancelled events → status 'cancelled'; match `user_id` via `profiles.email` = attendee email; `notes='Booked via Google Calendar appointment page'`, `calendar_synced=true`). Uses built-in `SUPABASE_SERVICE_ROLE_KEY`. Guarded by `x-cron-secret` header (`CRON_SECRET`). Scheduled from the Supabase dashboard cron (documented; can also be hit manually).
2. `booking-email` (Deno Edge Function): for NATIVE fallback-form bookings (Google already emails calendar bookings). Called fire-and-forget from the app after a successful insert (user JWT; function verifies the caller owns the booking). Sends via Resend: client confirmation + notification to `BOOKING_NOTIFY_EMAIL`. Missing `RESEND_API_KEY` → logs + returns `{skipped:true}` gracefully.
3. Frontend: `useCreateBooking` fire-and-forgets `supabase.functions.invoke('booking-email', {body:{booking_id}})` after insert (unit test with mocked client). `BookingConfirmed` mailto → booking@. `.env.example` admin email → info@ (+ note to align .env.local/Vercel/DB role).
4. `docs/PHASE5B-SETUP.md` — the exact "connect the Google Workspace calendar" runbook the user asked for (GCP project → enable Calendar API → SA + JSON key → share calendar with SA → calendar ID → Supabase secrets → dashboard cron → Resend DNS → Vercel env).

**Secrets** (set in Supabase dashboard, never in VITE_): `GOOGLE_SA_EMAIL`, `GOOGLE_SA_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID`, `CRON_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `BOOKING_NOTIFY_EMAIL`.

**Done when:** both functions deployed (inert-safe), frontend invoke wired + tested, mailto/env fixed, setup runbook written, suite green, build clean, changelog updated.
