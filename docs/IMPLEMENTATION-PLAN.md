# SummitFit Experience Implementation Plan

**Goal:** Deliver the approved cinematic redesign locally, preserving production functionality and connecting route discovery to managed content.

**Architecture:** Retain React Router, Supabase queries, existing booking/admin pages and Vercel share endpoint. Add scoped experience components and styles. Public content uses existing published queries; fixed editorial content uses bundled assets.

**Tech stack:** React 18, TypeScript, Vite, Tailwind, GSAP/useGSAP/ScrollTrigger, Framer Motion, Supabase, Vercel.

## Global constraints

- Work only in C:/SummitFit/SummitFit_Experience.
- Homepage editorial photographs and text remain fixed in the application.
- No production writes, deployment, schema reset, copied secrets or new CMS.
- Preserve routes, booking query parameters, auth, admin, events and /e/:id sharing.
- Native scrolling, reduced-motion support and accessible keyboard/mobile controls.

## Task 1: Foundation and managed-content reliability

- [x] Copy the production application excluding secrets, generated files and git metadata.
- [x] Install locked dependencies and GSAP/Framer Motion; run baseline tests/typecheck.
- [x] Connect quick booking to usePublishedRoutes; retain static fallback only when backend is unconfigured.
- [x] Improve public query invalidation and explicit event publish filters.
- [x] Add focused regressions for managed route discovery and admin/public visibility.

Files: package.json, vite.config.ts, src/components/QuickBookMenu.tsx, src/lib/queries/content.ts, events.ts, admin.ts, relevant src/test files.

## Task 2: Cinematic public experience

- [x] Build scoped shell/navigation with existing auth access and mobile menu.
- [x] Build fixed photographic hero, native-scroll GSAP reveal/parallax, route explorer, guide story, 13 Peaks, training, events/specials and contact.
- [x] Reuse published route/image/price queries for searchable difficulty-filtered discovery on homepage and /routes.
- [x] Carry the visual language into route and event detail while preserving their booking actions, previews and galleries.
- [x] Use Framer Motion for interactive state transitions; GSAP for scroll sequences; clean up both on navigation.

Files: src/components/experience/*, src/pages/Index.tsx, RoutesIndex.tsx, src/components/SiteHeader.tsx, Footer.tsx, src/styles/experience.css, src/main.tsx.

Visual system: midnight #061B2D, blue-black #08151D, cyan #00C8FF, mist #E9EEF0, stone #A6B4BA, gold #DDAB2C. Display: Barlow Condensed; body: Manrope; utility: monospace. Signature: giant mountain title over local photography, followed by an illustrated 13 Peaks elevation profile.

## Task 3: Integration and handoff

- [x] Build and run tests/type checks; fix regressions.
- [x] Run desktop/mobile checks of the offline preview for filters, navigation, route details and booking access; use component fixtures for managed content and gallery behaviour. Live/staging and full reduced-motion browser checks remain release gates.
- [x] Request independent code review and resolve important findings.
- [x] Review screenshots and save verification notes; provide local preview and setup instructions.
- [x] Keep production untouched; document separate Vercel preview/cutover procedure.

Verification commands: npm run test; npm run build; npx tsc --noEmit -p tsconfig.app.json; browser smoke checks at localhost:8086. Use isolated fixtures for data writes; never test bookings against production.
