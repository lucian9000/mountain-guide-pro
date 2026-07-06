---
name: verify
description: Build/launch/drive recipe for verifying SummitFit site changes end-to-end in a real browser.
---

# Verifying SummitFit (Vite React SPA)

## Launch

```powershell
Set-Location c:\SummitFit\Main\mountain-guide-pro-main
npm run dev   # http://localhost:8080 — run in background, ~1s startup
```

Real Supabase credentials come from `.env.local` (already present). The
public site works anonymously; admin pages need a Google SSO session
(cannot be driven headlessly — verify admin-gated code by observing its
public surface, e.g. the OAuth URL's scope parameter).

## Drive (browser)

Playwright is a devDependency. **Chromium download fails on this machine
(disk nearly full)** — use system Edge instead:

```js
const { chromium } = require("c:/SummitFit/Main/mountain-guide-pro-main/node_modules/playwright");
const browser = await chromium.launch({ channel: "msedge", headless: true });
```

If the script lives outside the repo, require playwright by absolute path
(as above) — bare `require("playwright")` won't resolve.

## Flows worth driving

- `/` — `#whats-new` (announcements + Facebook iframe), `Meet Ernest
  Carrick`, bottom `Follow Our Adventures` social section
- `/routes` — 8 route cards, `.leaflet-container`, attribution must read
  `© OpenStreetMap contributors, SRTM | © OpenTopoMap (CC-BY-SA)`
- `/routes/lions-head` — h1, difficulty badge, Enquire CTA; `?preview=1`
  is admin-only
- Scroll: bottom of `/routes` → click header link → `window.scrollY === 0`
- `/login` → click "Continue with Google" → wait for accounts.google.com →
  assert `scope` param is `email profile` (calendar only via the admin
  dashboard Connect button)
- `/booking?tour=lions-head` — tour pre-selected

## Gotchas

- Facebook iframe spams console errors (`fburl.com/debugjs`) — not app
  errors; filter them out.
- The FB page plugin renders 500px wide internally; its column must be
  ≥ 520px or posts clip on the right.
- Maps are lazy chunks — wait ~1.5s after navigation before asserting
  `.leaflet-*` selectors.
