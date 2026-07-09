# Phase 5b — Connecting Google Workspace to the booking backend

This is the runbook for making the deployed booking backend live. Everything in
code is already deployed and **inert-safe**: until you complete these steps,
`calendar-sync` skips politely and `booking-email` skips emails.

**Accounts recap:** the Google Workspace admin account is
`info@summitfitadventures.com`. `booking@summitfitadventures.com` is an **alias**
of it (not a separate account) — Google Calendar and the appointment schedule
live on the info@ account; mail to booking@ lands in the info@ inbox.

---

## Resolved values for this project (2026-07-09)

- **Booking embed URL** (`VITE_GOOGLE_BOOKING_URL`, already set in `.env.local`):
  `https://calendar.google.com/calendar/appointments/schedules/AcZssZ2CTgbHPkkvfb0mBkY11LMIc1DB7cSo853SMwiHvAQvrz0GP4SznKgtkbDeZ3CJoafwiSawiq3j?gv=true`
  Resolved from the short link `https://calendar.app.google/NU2nTpLhBZXVxbQJ7`.
  ⚠️ The `?gv=true` suffix is REQUIRED — only that variant lacks
  `X-Frame-Options`, so only it embeds in an iframe (verified in-browser:
  Ernest's "Book A Tour" schedule renders). Still add it to **Vercel** env.
- **Service account** (from the JSON key): `GOOGLE_SA_EMAIL` =
  `crm-calendar-sync@white-artwork-501815-g2.iam.gserviceaccount.com`
  (GCP project `white-artwork-501815-g2`). The `GOOGLE_SA_PRIVATE_KEY` is the
  `private_key` field of that JSON — set it as a Supabase secret only, never
  in a VITE_ var or git. **Rotate this key** once sync works (it was shared in
  chat): GCP Console → service account → Keys → delete → add new.
## ✅ Go-live status (2026-07-09) — DONE & verified

The backend is **live**. Completed and confirmed via a manual `net.http_post`
invoke returning `{ ok: true, events: 228 }`:

- [x] `pg_cron` + `pg_net` enabled; cron job `calendar-sync-job` runs every 10 min.
- [x] Google Calendar API enabled in GCP project `white-artwork-501815-g2`.
- [x] Booking calendar shared with the service account ("See all event details").
      Note: org policy blocked per-calendar external "see all details", so it was
      enabled via Admin console → Apps → Google Workspace → Calendar → Sharing
      settings → external option "Share all information, outsiders cannot change".
- [x] All four Supabase secrets set (`GOOGLE_SA_EMAIL`, `GOOGLE_SA_PRIVATE_KEY`,
      `GOOGLE_CALENDAR_ID`, `CRON_SECRET`).
- [x] `calendar-sync` v6 deployed — new bookings insert as `pending` and trigger
      `booking-email`.

**Still outstanding (not blocking, do when ready):**
- [ ] **Rotate the service-account key** — it was shared in chat. GCP Console →
      service account → Keys → delete the exposed key → add new → update
      `GOOGLE_SA_PRIVATE_KEY` in Supabase secrets.
- [ ] **Add `VITE_GOOGLE_BOOKING_URL` to Vercel** env (currently only in
      `.env.local`) so production embeds the calendar.
- [ ] **Resend** — set `RESEND_API_KEY` + verify the `summitfitadventures.com`
      domain so `booking-email` actually sends (until then it skips gracefully).
- [ ] **Deploy the frontend** — the booking UI lives on local branch
      `v4/phase-1-a11y`; push/merge to ship it to production.

## Part A — Client booking page (frontend embed) — 5 minutes

1. Sign in to Google Calendar as **info@summitfitadventures.com**.
2. Open the **appointment schedule** (or create one: Create → Appointment
   schedule → set duration, availability window, buffer, max per day; under
   *Booking form* require name + phone; under *Reminders and follow-ups* keep
   email confirmations ON — this is what emails the client & you, no code).
3. Click the schedule → **Share** → copy the **booking page link**.
4. Put it in the app env as `VITE_GOOGLE_BOOKING_URL`:
   - locally: `.env.local`, then restart `npm run dev`
   - production: Vercel → summitfit-v2 → Settings → Environment Variables
5. Test: signed in on /booking, pick a tour → the calendar should render in
   the iframe. **If Google refuses to embed** (blank/refused frame), tell the
   dev — we flip desktop to the same "open in new tab" button mobile uses.

## Part B — Calendar → Supabase sync (`calendar-sync`) — ~20 minutes

The function polls the calendar with a **service account** that the calendar
is *shared with* (read-only). No domain-wide delegation, no OAuth screens.

1. **Create the service account**
   1. Go to https://console.cloud.google.com (sign in as info@).
   2. Create a project (e.g. `summitfit-booking`).
   3. APIs & Services → **Library** → search "Google Calendar API" → **Enable**.
   4. IAM & Admin → **Service Accounts** → Create (name: `calendar-sync`).
      No roles needed. Create.
   5. Open the account → **Keys** → Add key → **JSON** → download the file.
      Keep it private — it is a credential.
2. **Share the calendar with the service account**
   1. In Google Calendar (info@), find the calendar the appointment schedule
      books onto (usually the primary calendar; check where booked
      appointments appear).
   2. Calendar Settings → **Share with specific people** → add the service
      account's email (`calendar-sync@…iam.gserviceaccount.com`) with
      **"See all event details"**.
   3. Still in settings, copy the **Calendar ID** (Integrate calendar section;
      for the primary calendar it's simply `info@summitfitadventures.com`).
3. **Set the Supabase secrets**
   Supabase Dashboard → project `rzcvoyciitclilwwqepk` → **Edge Functions →
   Secrets** (or `supabase secrets set` via CLI). From the downloaded JSON:
   | Secret | Value |
   |---|---|
   | `GOOGLE_SA_EMAIL` | `client_email` field |
   | `GOOGLE_SA_PRIVATE_KEY` | `private_key` field (paste as-is, `\n` included) |
   | `GOOGLE_CALENDAR_ID` | the Calendar ID from step 2.3 |
   | `CRON_SECRET` | any long random string (e.g. `openssl rand -hex 24`) |
4. **Schedule it**
   Supabase Dashboard → **Integrations → Cron** (enable if needed) → new job:
   - Schedule: `*/10 * * * *` (every 10 min)
   - Type: Edge Function → `calendar-sync`, method POST
   - HTTP header: `x-cron-secret: <your CRON_SECRET>`
5. **Verify**
   ```bash
   curl -s -X POST "https://rzcvoyciitclilwwqepk.supabase.co/functions/v1/calendar-sync" \
        -H "x-cron-secret: <CRON_SECRET>"
   # → {"ok":true,"events":N,"inserted":n,...}
   ```
   Then make a test booking on the booking page and re-run: it should appear
   in Admin → Bookings with the indigo **Via Cal Page** badge (it flips to
   proper `calendar_synced` display since the sync sets the event id), and in
   the client's My Bookings if they booked with their sign-in email.

**Matching notes:** clients are matched to accounts by the email they typed on
Google's booking form vs their site sign-in email (`profiles.email`,
case-insensitive). If they differ, the booking still mirrors but shows no
client link — visible in admin, absent from that client's My Bookings. The
tour is matched when the schedule/event title contains the tour name — naming
the appointment schedule(s) after the tours (or one schedule per tour) makes
this exact.

## Part C — Emails for native form bookings (`booking-email`) — ~15 minutes

Google handles all emails for calendar bookings. This part covers only the
site's fallback "request manually" form, which currently sends nothing.

1. Create a **Resend** account (resend.com, free tier: 100/day).
2. **Verify the domain** `summitfitadventures.com`: Resend → Domains → Add →
   it gives 3 DNS records (SPF TXT, DKIM CNAMEs) → add them wherever the
   domain's DNS lives (registrar/Vercel/Cloudflare) → wait for Verified.
3. Create an API key, then set Supabase secrets:
   | Secret | Value |
   |---|---|
   | `RESEND_API_KEY` | the key |
   | `EMAIL_FROM` | `SummitFit Adventures <booking@summitfitadventures.com>` |
   | `BOOKING_NOTIFY_EMAIL` | `booking@summitfitadventures.com` |
4. Verify: make a booking through the fallback form → client gets "Request
   received", booking@ (→ info@ inbox) gets "New booking request".

## Part D — Housekeeping

- `VITE_ADMIN_EMAIL` should be `info@summitfitadventures.com` (the account the
  admin signs in with) in `.env.local` AND Vercel. If the admin role in the
  `profiles` table was granted to a different email, re-run the promotion SQL
  in `supabase/schema.sql` for info@.
- The `new-client` marketing-sync function is still a stub (separate, optional).

## What's intentionally NOT here

- No client-side Supabase writes from the calendar flow (source of truth is
  Google; the sync mirrors it).
- Appointment Schedules cannot redirect back to the site or pass booking data
  in the URL — that's why polling exists.
