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
| Testing | Vitest + Testing Library |

## Getting Started

### Prerequisites

- Node.js 18+ or Bun

### Install & run

```bash
npm install
npm run dev        # starts dev server on http://localhost:8080
```

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
│   └── ui/          # shadcn/ui primitives
├── data/
│   └── routes.ts    # Route definitions + findRoutes() helper
├── hooks/           # use-mobile, use-toast
├── lib/
│   └── utils.ts     # cn() Tailwind merge helper
├── pages/
│   ├── Index.tsx    # Main page — composes all sections
│   └── NotFound.tsx # 404 fallback
└── main.tsx         # App entry point
```

## Contact

- **WhatsApp / Phone:** +27 67 130 1536
- **Email:** ernest@summitfit.co.za
- **Instagram:** [@summitfit_adventures](https://www.instagram.com/summitfit_adventures)
- **Facebook:** [carrickadventures](https://www.facebook.com/carrickadventures)

---

© 2026 SummitFit Adventures. All rights reserved.
