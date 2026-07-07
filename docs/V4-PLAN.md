# SummitFit v4.0 — Plan & Website Baseline

**Status:** proposed · **From:** v3.1.1 · **Date:** 2026-07-07
**Inputs:** full UI/UX audit against the `ui-ux-pro-max` skill (3-reviewer pass, 40+ verified findings), README feature-status stubs, CHANGELOG v1→v3.

v4.0 = *quality + completion*: bring the existing site up to the new skill standards (accessibility, performance, design-system discipline, motion), finish the stubbed backend, and extract a reusable baseline for future client sites.

**Skill toolkit** (installed at `~/.claude/skills/`, use per phase):

| Skill | Used for |
|---|---|
| `ui-ux-pro-max` | Review checklist (10 priority categories) + design-system queries |
| `ui-styling` / `design-system` | shadcn/Tailwind patterns, token architecture |
| `frontend-design` | Creative direction — keep SummitFit distinctive, not templated |
| `gsap-core/scrolltrigger/react/performance` | Phase 4 motion layer |
| `brand` | Voice/visual consistency when touching copy or assets |

---

## Phase 1 — Accessibility & interaction (CRITICAL, do first)

Checklist source: `ui-ux-pro-max` §1 Accessibility, §2 Touch & Interaction.

1. **Fix the invisible 404 link** — `src/pages/NotFound.tsx:16`: `text-primary` is dark-navy-on-dark (~1.1:1). Use `text-accent` + underline.
2. **Rehab ChatWidget** (`src/components/ChatWidget.tsx`) — one file, six findings:
   - `aria-label` on launcher (L131) and close button (L154); give close button `p-3` (≥44px hit area).
   - Replace emoji icons (📱🏔💪📍⏱⛰⛅) with the already-imported Lucide set.
   - Option/CTA buttons to ≥44px (`py-3`).
   - Wrap the message log in `role="log"` + `aria-live="polite"`.
3. **Booking form a11y** (`src/pages/Booking.tsx`) — add `htmlFor`/`id` to all five labels; stepper buttons `w-9 h-9` → `w-11 h-11`; add required markers to Tour/Date; show "what's missing" hint instead of a mute disabled submit.
4. **Navbar mobile menu** (`src/components/Navbar.tsx`) — closed overlay must use `visibility:hidden` or `inert` (currently focusable while invisible, L143-149); on open, move focus into the menu and trap it.
5. **Skip link + landmarks** — add "Skip to content" link in `App.tsx`/layouts and a `<main>` landmark on Index; fix h1→h3 skip on `/routes`.
6. **Contrast sweep** — remove opacity-diluted text: `text-muted-foreground/40` (Footer L75, ≈2:1), `/60` helper text (Booking L253, RouteDetail L292), `/70` datestamps (UpdateCard L31). Use full `text-muted-foreground` or a new `--muted-strong` token. Verify 4.5:1.
7. **Small targets** — "View Details →" (Expeditions L73), lightbox arrows (RouteDetail L312), hero scroll chevron: pad to ≥44px.
8. **Name the lightbox dialog** — `DialogTitle`/`aria-label` on RouteDetail lightbox (L301).

**Done when:** axe DevTools clean on /, /routes, /routes/:slug, /news, /booking, /404; keyboard-only walkthrough of nav + booking succeeds.

## Phase 2 — Performance

Checklist source: `ui-ux-pro-max` §3 Performance + `--stack react` queries.

1. **Fonts** — replace the CSS `@import` (`src/index.css:1`) with `<link rel="preconnect">` ×2 + stylesheet `<link>` in `index.html` (or self-host with `font-display: swap`); trim to used weights (Montserrat 600/700/800, Inter 400/500/600).
2. **Hero LCP** — `<link rel="preload" as="image">` for `hero-mountain.webp` in `index.html` + `fetchpriority="high"` on the img.
3. **Static images** — resize expedition WebPs to display size (`helderberg-dome.webp` 436KB → ~60KB for an `h-56` card); small logo variant for the navbar (53KB → ~5KB).
4. **CMS images** — use Supabase image transforms to emit `srcset`/`sizes` in `RouteCard`/`RouteDetail` (`src/lib/images.ts` already stores dimensions — extend it).
5. **Third-party** — `loading="lazy"` on both Facebook iframes (SocialFeed, News); `React.lazy` the ChatWidget (render launcher immediately, load body on first open).
6. **Bundle** — add `manualChunks` vendor split in `vite.config.ts` (react/router/query vs app); delete unused `recharts` + `src/components/ui/chart.tsx`.
7. **Viewport units** — `min-h-screen` → `min-h-dvh` sweep; ChatWidget `100vh` → `100dvh`.

**Done when:** Lighthouse mobile ≥90 perf on / and /routes/:slug; main chunk < 400KB; fonts load in ≤2 round trips.

## Phase 3 — Design-system discipline

Checklist source: `ui-ux-pro-max` §4/§6/§7 + `design-system` skill (token layers).

1. **Kill hard-coded colors** — `hover:bg-[hsl(193,100%,42%)]` (~30 sites) → `hover:bg-cyan-hover` via new Tailwind token mapped to existing `--cyan-hover`; same for `--cyan-soft`. Add ESLint rule or grep gate: no `hsl(` literals in TSX.
2. **DifficultyBadge** → semantic tokens (`--success` etc.), not raw emerald palette classes.
3. **Motion timing** — hover transitions `duration-500/700` → `duration-200/300`; replace blanket `transition-all` (~40 sites) with `transition-colors`/`transition-transform`; nav underline: animate `transform: scaleX` not `width`; mobile menu stagger ≤ 400ms total.
4. **Type scale** — route description body `text-sm` → `text-base` on mobile; `text-[10px]` labels → `text-xs`; keep uppercase tracking for short headings only (cap or loosen for dynamic route/news titles).
5. **One header** — unify Navbar/PublicHeader/Booking header into a single `SiteHeader` (full nav everywhere, Book Now always visible, active-state highlighting). This closes the "Training/Contact unreachable from subpages" gap.
6. **Reduced-motion completeness** — add `animate-bounce`, `animate-fade-in-up` to the `prefers-reduced-motion` block.
7. **Focus states** — add `focus-visible:ring-2 ring-accent` to all hand-rolled CTAs (match the existing shadcn button pattern).

**Done when:** grep finds zero `hsl(` / `text-[10px]` / `transition-all` in `src/components` + `src/pages`; one header component; reduced-motion covers every infinite animation.

## Phase 4 — Motion upgrade (GSAP) — optional polish

Skills: `gsap-core`, `gsap-scrolltrigger`, `gsap-react`, `gsap-performance`. Guardrail from `frontend-design`: one orchestrated moment beats scattered effects.

1. Add `gsap` + `@gsap/react` (`useGSAP` hook — see `gsap-react` skill for cleanup-safe patterns).
2. Replace the bespoke IntersectionObserver `Reveal` with ScrollTrigger reveals (batch, stagger 30–50ms) — one system, one rhythm.
3. One signature moment: hero load timeline (headline → subline → CTA → scroll cue) instead of 4 concurrent loops; drop one glow-pulse.
4. Wrap everything in `gsap.matchMedia()` with a `prefers-reduced-motion` branch (built-in support — see `gsap-core`).
5. Keep transforms/opacity only (`gsap-performance`).

**Done when:** motion audit shows ≤2 animated elements per view, all interruptible, reduced-motion = static.

## Phase 5 — Backend / CRM completion (the v3 stubs)

Finishes the README feature-status table. All via Supabase Edge Functions — no new vendors unless noted.

1. **Booking emails** — Edge Function `send-booking-email` (Resend free tier) triggered by `bookings` insert/status webhook: client confirmation + admin notification. Templates follow `brand` skill voice.
2. **Guide availability** — Edge Function wrapping Google Calendar FreeBusy (admin's calendar OAuth is already scoped, v3.1.0); Booking date picker greys unavailable dates.
3. **Image uploads for specials & guides** — reuse the v2 route-images upload path (client-side WebP compression → Storage bucket); replace the paste-a-URL stubs.
4. **Marketing sync** — DB webhook → Edge Function → Mailchimp/Loops on new client profile (double-opt-in flag).
5. **CRM upgrades** (small, high value): booking status pipeline on AdminBookings (pending → confirmed → completed → cancelled with timestamps), per-client notes + booking history on AdminClients, CSV export.

**Done when:** README table shows no 🚧 rows; a test booking produces email + calendar-aware dates end-to-end.

## Phase 6 — Verify & ship

1. Playwright drive (the repo's `verify` skill): booking flow, chat widget keyboard-only, mobile menu, maps, 404.
2. Run `ui-ux-pro-max` pre-delivery checklist (§1–§3 CRITICAL/HIGH) as the release gate.
3. Test 375px, landscape, reduced-motion, dark-only theme contrast.
4. Bump `package.json` → 4.0.0, changelog entry, deploy via existing GitHub → Vercel pipeline.

**Suggested order & sizing:** P1 (M) → P2 (M) → P3 (M) → P5 (L) → P4 (S, optional) → P6 (S). Phases 1–3 are pure frontend and can ship as 3.2.x patches if you want value earlier; P5 is the 4.0.0 headline.

---

# Baseline — core structure for future websites

Reusable template distilled from SummitFit: a marketing site + booking/CRM backend. Copy this structure, then apply the skills workflow below.

## Frontend core

```
src/
├── main.tsx / App.tsx          # Router; React.lazy every page except landing + 404
├── index.css                   # ALL design tokens live here (see token contract)
├── components/
│   ├── SiteHeader.tsx          # ONE header, all pages, active states, mobile menu (inert when closed)
│   ├── Footer.tsx
│   ├── Reveal / motion layer   # GSAP useGSAP + ScrollTrigger, matchMedia reduced-motion branch
│   ├── ErrorBoundary.tsx
│   ├── ui/                     # shadcn primitives (focus-visible ring pattern)
│   └── <sections>/             # Hero, Services, Gallery, CTA, TrustBar, lead widget
├── pages/                      # Index, <content>Index, <content>Detail, Booking, Login, News, NotFound
│   ├── admin/                  # CRM (below)
│   └── dashboard/              # client self-service: Home, Bookings, Account
├── contexts/                   # Auth (Supabase session + role)
├── hooks/ lib/ types/          # supabase client, images.ts (upload+compress+dimensions), utils
└── test/
```

**Stack:** Vite + React + TS + Tailwind + shadcn/ui + react-query + react-router + Supabase JS. Vercel deploy from GitHub.

**Token contract** (`index.css` → `tailwind.config.ts`, per `design-system` skill):
- Semantic HSL variables only: `--background/foreground/card/primary/secondary/muted/accent/destructive/border/ring` + brand extras (`--brand-hover`, `--brand-soft`, `--gold`, `--success`, `--warning`), shadow + gradient tokens.
- **Every** variable gets a Tailwind color mapping — no `hsl(...)` literals in components, ever.
- Component classes for the signature surface (e.g. `.glass-card`, `.glow-border`).
- One `prefers-reduced-motion` block that names every infinite/entrance animation.

**Non-negotiables** (the `ui-ux-pro-max` §1–§3 floor):
skip link + `<main>` landmark · labels with `htmlFor` · `aria-label` on every icon-only button · 44px touch targets · 4.5:1 text contrast (no opacity-diluted text) · `focus-visible` rings on all CTAs · fonts via preconnect+link (≤6 weights) · hero image preloaded, `fetchpriority="high"` · CMS images via `srcset` from stored dimensions · third-party embeds lazy · vendor `manualChunks` · `min-h-dvh` · SVG icons only (Lucide), no emoji.

## Backend / CRM core (Supabase)

**Schema modules** (each = table(s) + RLS + admin page):

| Module | Tables | Notes |
|---|---|---|
| Identity | `profiles` (role: client/admin) | Google SSO PKCE, basic scopes only; sensitive scopes admin-side |
| Catalog | `<content>` + `<content>_images`, `price_items` | slug, publish/schedule/hide, geo columns if mapped |
| Versioning | `content_versions` | audit + restore triggers on every content table |
| Commerce | `bookings`, `guides`/`staff`, `specials` | status pipeline: pending → confirmed → completed → cancelled |
| Storage | public-read buckets, admin-only write | client-side WebP compression + stored width/height |

**RLS pattern:** public reads published-only; writes via `is_admin()`; clients read/write own rows only.

**Edge Functions** (the standard four): `send-transactional-email` (Resend) · `calendar-availability` (Google FreeBusy) · `marketing-sync` (Mailchimp/Loops webhook) · `<domain-specific>`.

**Admin CRM pages:** Dashboard (KPIs) · Bookings (pipeline) · Clients (notes, history, CSV export) · Content manager (editor, upload, versions, preview) · Pricing · Specials · Staff/Guides. Client dashboard mirrors read-side.

## New-site kickoff workflow (skills-driven)

1. **Brief** — apply `frontend-design`: name the subject, audience, the page's one job; pick the signature element.
2. **Design system** — `python ~/.claude/skills/ui-ux-pro-max/scripts/search.py "<product industry tone>" --design-system --persist -p "<Project>"` → commits `design-system/MASTER.md` to the repo as source of truth.
3. **Style** — if the brief commits to an aesthetic, pull ONE style skill (e.g. `glassmorphism`, `editorial`) and merge its tokens into the MASTER.
4. **Scaffold** — copy this baseline; wire tokens from MASTER into `index.css`.
5. **Build** — sections first, then booking/CRM modules as needed; `gsap-*` for motion.
6. **Gate** — `ui-ux-pro-max` pre-delivery checklist + Playwright drive before every release.
