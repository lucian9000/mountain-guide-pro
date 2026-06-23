# SummitFit Adventures

Professional mountain guiding & elite fitness training based in Cape Town, South Africa.

## Overview

SummitFit Adventures is a single-page marketing website for Ernest Carrick — a CATHSSETA-accredited mountain guide and personal trainer. The site showcases guided routes, fitness programs, and corporate team-building experiences across Cape Town's iconic peaks.

## Features

- **Interactive Chat Widget** — guided conversation flow that recommends routes based on fitness level and connects users to WhatsApp for booking
- **5 Guided Routes** — Lion's Head, Platteklip Gorge, Kasteelspoort, Waterworks/Skeleton Gorge, India Venster
- **Personal Training** — Strength, Trail Fitness, and Custom 4–12 week programs
- **Corporate Events** — Half/full-day team-building experiences
- **Social Feed** — Facebook page embed + Instagram follow link
- **Fully responsive** — mobile-first design with smooth scroll navigation

## Feature status

The **public marketing site works with zero configuration.** Supabase is only needed for
the sign-in, booking, and admin features — and if it isn't configured, those degrade
gracefully (the site still loads; sign-in shows a "not available yet" notice).

| Area | Status | Requires |
|------|--------|----------|
| Marketing site (hero, routes, training, gallery, chat widget, social embeds) | ✅ Works out of the box | nothing |
| Mobile navigation + premium polish | ✅ Works | nothing |
| Google sign-in (SSO) | ⚙️ Built | Supabase + Google OAuth + env vars |
| Client dashboard (`/dashboard` — bookings, account) | ⚙️ Built | Supabase + sign-in |
| Public booking flow (`/booking`) | ⚙️ Built | Supabase (`pricing`/`guides`/`bookings`) |
| Admin CRM (`/admin` — clients, pricing, specials, bookings, guides) | ⚙️ Built | Supabase + `admin` role |
| "Add to Google Calendar" link on confirmation | ✅ Works (no API key) | a saved booking only |
| Live guide availability + calendar sync | 🚧 Stub | Edge Function + Google Calendar API |
| Confirmation / transactional emails | 🚧 Stub | Edge Function + email provider |
| Mailchimp / Loops contact sync | 🚧 Stub | Edge Function + DB webhook |
| Image uploads for specials & guides | 🚧 Stub (paste a URL for now) | Supabase Storage |

**Legend:** ✅ works now · ⚙️ code complete, needs a one-time Supabase setup · 🚧 stubbed,
needs a backend (Supabase Edge Functions). See [Roadmap / next steps](#roadmap--next-steps).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Routing | React Router v6 |
| State / data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Auth & data | Supabase (Google OAuth, Postgres + RLS) |
| Testing | Vitest + Testing Library |

## Getting Started

### Prerequisites

- Node.js 18+ or Bun

### Install & run

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values (see Authentication)
npm run dev        # starts dev server on http://localhost:8080
```

> The site runs without Supabase configured — only the sign-in / account features
> need it. Until `.env.local` is filled in, the navbar shows a "Sign In" link that
> can't complete the OAuth round-trip.

### Build for production

```bash
npm run build      # outputs to /dist
npm run preview    # preview the production build locally
```

### Lint & test

```bash
npm run lint       # ESLint
npm run test       # Vitest (single run)
npm run test:watch # Vitest watch mode
```

## Project Structure

```
src/
├── assets/          # Images (hero, expeditions, guide portrait, logo)
├── components/      # Page sections & chat widget
│   ├── auth/        # ProtectedRoute, AdminRoute, UserMenu, AuthLoading
│   └── ui/          # shadcn/ui primitives
├── contexts/
│   └── AuthContext.tsx  # Supabase session + profile + role provider
├── data/
│   └── routes.ts    # Route definitions + findRoutes() helper
├── hooks/           # use-mobile, use-toast
├── lib/
│   ├── supabase/client.ts  # the single Supabase browser client (PKCE)
│   └── utils.ts     # cn() Tailwind merge helper
├── pages/
│   ├── admin/       # Admin shell (Phase 2 CRM lands here)
│   ├── dashboard/   # Signed-in client area (bookings, account)
│   ├── Index.tsx    # Main marketing page — composes all sections
│   ├── Login.tsx    # Google sign-in
│   ├── AuthCallback.tsx  # OAuth redirect handler
│   └── NotFound.tsx # 404 fallback
├── types/auth.ts    # Profile / UserRole types
└── main.tsx         # App entry point

supabase/
└── schema.sql       # Run in the Supabase SQL editor (profiles + RLS + trigger)
```

## Authentication (Supabase + Google OAuth)

Sign-in is Google-only via Supabase Auth, fully client-side (PKCE flow). Routes under
`/dashboard/*` require a signed-in user; `/admin/*` additionally requires the `admin` role.

### One-time setup

1. **Create a Supabase project** → copy **Project URL** and the **anon public** key
   (Settings → API). Never use the `service_role` key in this app — it would ship in the
   client bundle.
2. **Run the schema:** paste `supabase/schema.sql` into the Supabase SQL Editor and run it
   (creates `profiles`, RLS policies, and the auto-profile trigger).
3. **Google Cloud Console** → OAuth consent screen (External; add yourself as a test user)
   → Credentials → OAuth client ID (Web):
   - Authorized JavaScript origin: `http://localhost:8080`
   - Authorized redirect URI: **the Supabase one** —
     `https://YOUR-PROJECT-ref.supabase.co/auth/v1/callback`
4. **Supabase → Auth → Providers → Google:** enable, paste the Client ID + secret.
5. **Supabase → Auth → URL Configuration:** Site URL `http://localhost:8080`; add
   `http://localhost:8080/auth/callback` to Additional Redirect URLs (plus prod equivalents).
6. **Fill `.env.local`** with the values below, then restart `npm run dev`.
7. **Promote your admin:** after signing in once, run in the SQL editor:
   `update public.profiles set role='admin' where email='<your VITE_ADMIN_EMAIL>';`

> Two redirect URIs are involved and easily confused: **Google → Supabase**
> (`/auth/v1/callback`); **Supabase → your app** (`/auth/callback`).

### Environment variables (`.env.local`)

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key (RLS-protected, safe in client) |
| `VITE_SITE_URL` | Public origin for the OAuth redirect (must match dev port `8080`) |
| `VITE_ADMIN_EMAIL` | Email to promote to `admin` (informational) |

Only `VITE_`-prefixed values are exposed to the browser. **Never** put the `service_role`
key or any server secret in a `VITE_` variable.

## Admin CRM (Phase 2)

Signed-in admins get a CRM at `/admin` (sidebar layout, mobile drawer):

- **Dashboard** — client / booking / specials stat cards + recent activity
- **Clients** — searchable table, slide-out detail with marketing opt-in toggle and
  tags, CSV export for email marketing
- **Pricing** — inline-editable tour table (price, duration, order, active)
- **Specials** — promo cards with a single-active rule (atomic `set_single_active_special` RPC)
- **Bookings** — Upcoming / Past / Pending / Cancelled tabs with status control
- **Guides** — guide profiles with specialties

Admin access uses an `is_admin()` Postgres helper + RLS, so the browser client performs
cross-user reads/writes **without** the `service_role` key. Apply the Phase 2 section of
`supabase/schema.sql` (it also seeds the `pricing` table from the routes above).

Some actions are intentionally stubbed until a backend (Supabase Edge Functions) is added:
Mailchimp/Loops sync, Google Calendar, and confirmation emails
(`src/lib/marketing-sync.ts`, `src/lib/email.ts`, `src/lib/google-calendar.ts`).

## Public booking (Phase 3)

`/booking` is a public page (linked from the navbar "Book Now"): pick a tour and guide
(from the live `pricing` / `guides` tables), choose a date, set participant count, and see
a running total. "Book Now" requires sign-in (redirects to `/login?redirect=/booking`),
then inserts a `bookings` row via owner RLS. The confirmation screen shows a booking
reference and an **"Add to Google Calendar"** link (a plain calendar URL — works with no
API key). The booked tour then appears under `/dashboard/bookings`.

### Phase 3 scaffolding (needs a backend to finish)

- `src/lib/google-calendar.ts` — live availability + event create/delete are **stubs**
  (time slots are mocked); real sync needs an Edge Function holding the OAuth refresh token.
- `supabase/functions/new-client/index.ts` — Deno Edge Function **stub** for the
  new-client → Mailchimp/Loops webhook (verifies `WEBHOOK_SECRET`); deploy + wire the
  Supabase Database Webhook to enable.
- `docs/supabase-storage-setup.md` — buckets + RLS for swapping the admin image-URL
  fields for real uploads.

Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_*`, `WEBHOOK_SECRET`,
`MAILCHIMP_API_KEY` / `LOOPS_API_KEY`, `RESEND_API_KEY`) belong in Edge Function config —
**never** in a `VITE_` variable.

## Deployment (Vercel)

The repo ships a `vercel.json` with the SPA catch-all rewrite, so direct hits and refreshes
on `/booking`, `/login`, `/auth/callback`, `/dashboard`, and `/admin` resolve to the app
instead of returning a 404 (the OAuth callback in particular must resolve).

1. **Import the repo** into Vercel. Framework preset **Vite**; build command `npm run build`;
   output directory `dist` (Vercel detects these automatically).
2. **Add environment variables** → Project → Settings → Environment Variables. Without these
   the site still loads, but sign-in / booking / admin are disabled by design:

   | Variable | Value |
   |----------|-------|
   | `VITE_SUPABASE_URL` | your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | the anon **public** key (never the `service_role` key) |
   | `VITE_SITE_URL` | your deployed origin, e.g. `https://summitfit.vercel.app` |
   | `VITE_ADMIN_EMAIL` | the email to promote to `admin` |

3. **Redeploy after adding the vars.** Vite inlines `VITE_*` at **build time**, so they only
   take effect on a fresh build — saving them is not enough; trigger a new deployment.
4. **Point OAuth at the production domain:**
   - **Supabase → Auth → URL Configuration:** set **Site URL** to your domain and add
     `https://YOUR-DOMAIN/auth/callback` to **Additional Redirect URLs**.
   - **Google Cloud Console:** add `https://YOUR-DOMAIN` as an **Authorized JavaScript origin**.
     The **Authorized redirect URI** stays the *Supabase* one
     (`https://YOUR-REF.supabase.co/auth/v1/callback`) — it does not change per deployment.

> **Note on the blank-screen fix:** the app no longer crashes when the `VITE_SUPABASE_*` vars
> are missing — it degrades to the public site only. The earlier blue screen on Vercel was
> `createClient` throwing `"supabaseUrl is required."` on an empty URL at module load (before
> React renders, so the error boundary couldn't catch it). That is now resolved.

**Other hosts:** any static host works with an equivalent catch-all rewrite to `/index.html`
(Netlify `/* /index.html 200`, Nginx `try_files $uri /index.html`), plus the same `VITE_*` vars.

## Roadmap / next steps

In rough priority order:

1. **Go live with auth + data — no code required.** Create the Supabase project, run
   `supabase/schema.sql` (both the Phase 1 and Phase 2 sections), enable Google OAuth, fill the
   env vars, and run the admin-promotion `UPDATE` after your first sign-in. This single setup
   lights up Google sign-in, the client dashboard, the public booking flow, **and** the full
   admin CRM. See [Authentication](#authentication-supabase--google-oauth) for the step-by-step.
2. **Phase 4 — backend (Supabase Edge Functions, Deno)** to finish the stubs:
   - **Confirmation emails** — wire `src/lib/email.ts` to an Edge Function calling Resend (or similar).
   - **Mailchimp / Loops sync** — deploy `supabase/functions/new-client/` and attach it as a
     Supabase Database Webhook on `profiles` insert (it already verifies `WEBHOOK_SECRET`).
   - **Google Calendar** — implement real availability + event create/delete in
     `src/lib/google-calendar.ts`, backed by an Edge Function holding the OAuth refresh token
     (a server-only secret — never a `VITE_` var).
   - **Image uploads** — create the Storage buckets per `docs/supabase-storage-setup.md`, then
     swap the image-URL text fields in the admin forms for file uploads.
3. **Nice-to-haves** — let clients cancel a booking from `/dashboard`, add email/WhatsApp
   reminders, collect a deposit/payment at booking, and opt into the React Router v7 future
   flags to clear the console warnings.

## Contact

- **WhatsApp / Phone:** +27 67 130 1536
- **Email:** ernest@summitfit.co.za
- **Instagram:** [@summitfit_adventures](https://www.instagram.com/summitfit_adventures)
- **Facebook:** [carrickadventures](https://www.facebook.com/carrickadventures)

---

© 2026 SummitFit Adventures. All rights reserved.
