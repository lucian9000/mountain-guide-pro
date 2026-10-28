# Live-site audit fixes implementation plan

**Goal:** Fix the five verified audit findings, verify locally, and create a local commit.
**Architecture:** Retain React Router, Supabase and the existing visual system. Share managed route discovery between catalogue, featured cards and quick booking; explicitly constrain public events; add centralized browser metadata and real footer links.
**Tech stack:** React 18, TypeScript, React Query, Vite, Vitest.

## Global constraints

- Work on fix/live-site-audit-2026-10-28 in the production-source checkout.
- Preserve existing route IDs, pricing matches, enquiry-only actions, booking query parameters and admin editing.
- No deployment, push, backend writes, schema edits, credentials or destructive operations.
- Preserve the incumbent layout and static homepage editorial text outside managed route cards.

## Tasks

1. Route content: regression fixtures for a newly published route and changed facts; use published routes in QuickBookMenu and Expeditions; retain offline-only static fallback, managed empty/error handling, pricing and direct detail URLs. Run focused tests.
2. Events: reproduce privileged public browsing of drafts/past events; filter public single-event queries, keep admin hooks intact, guard stale ended-event UI. Run future/full/ended tests.
3. Navigation: replace footer scroll-only controls with /#about and /#fitness links. Regression-test destinations from a subpage.
4. Metadata: add a centralized component inside the Router with static public-page and dynamic route/event titles, descriptions, canonical and Open Graph/Twitter URL/image metadata. Strip query/hash from canonical URLs, enforce the production origin, avoid draft data, reset metadata on navigation. Test DOM changes across navigation. This SPA metadata improves browser-rendered pages; retain /e/:id server metadata and do not claim search/social crawlers execute JavaScript.
5. Integration: run all tests, typecheck, targeted lint and build; inspect local desktop/mobile states with safe fixtures; request independent review; resolve significant findings; update verification notes and commit only scoped files locally.

## Progress

- Baseline clean, branch created from 39f225f2a37a861d4c7cb9ab32b0836a69466571.
- Tasks 1 and 2 delegated in disjoint files. Parent handles 3–5.
- Tasks 1–3 implemented and independently reviewed without significant findings.
- Full integration run: 116 tests passed, typecheck/build passed. Existing lint/build warnings documented.
- Metadata review identified malformed-image and failed-refetch edge cases; both fixed with focused regressions. Final full suite: 137 tests passed, typecheck/build passed. Independent final re-review approved with no important findings remaining. All five tasks complete for local commit; no push or deployment.
