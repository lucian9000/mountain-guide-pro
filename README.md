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

### Deployment note

This is an SPA using `BrowserRouter`. On a static host, add a catch-all rewrite to
`/index.html` (Netlify `/* /index.html 200`, Vercel `rewrites`, Nginx `try_files`) or
deep links like `/auth/callback` will 404. Add `VITE_*` vars to your host, and add the
production `/auth/callback` URL to both Google and Supabase redirect settings.

## Contact

- **WhatsApp / Phone:** +27 67 130 1536
- **Email:** ernest@summitfit.co.za
- **Instagram:** [@summitfit_adventures](https://www.instagram.com/summitfit_adventures)
- **Facebook:** [carrickadventures](https://www.facebook.com/carrickadventures)

---

© 2026 SummitFit Adventures. All rights reserved.
