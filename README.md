<div align="center">

# Lynux Profumi — Ultra-Luxury Niche Perfumery E-Commerce

*A full-stack reference implementation of what "enterprise-grade" actually requires under the hood of a luxury storefront — built from first principles, not a plugin marketplace.*

[![CI](https://github.com/davisimoni/lynux-profumi/actions/workflows/ci.yml/badge.svg)](https://github.com/davisimoni/lynux-profumi/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

</div>

---

## Overview & Value Proposition

Independent and niche perfume houses face a real product gap: they need a digital storefront that *feels* like Le Labo or Maison Francis Kurkdjian — bespoke motion, an editorial dark/light identity, olfactory-family-driven discovery — but template e-commerce platforms don't give them the engineering underneath that experience actually depends on: correct concurrent inventory under load, a checkout that survives a flaky payment provider, real observability, and multi-market readiness (currency, language) from day one.

**Lynux Profumi is that engineering layer, built and demonstrated end-to-end.** It's a complete Next.js 16 storefront — catalogue, olfactory quiz, fragrance-layering lab, cart, checkout, order tracking, and an admin back office — where every one of those "hard parts" is implemented explicitly and is inspectable in the source, not hidden behind a SaaS.

The architectural decision that ties it together is what this codebase calls **Fallback Mode**: every external dependency (Stripe, Supabase, Anthropic) is fully optional. `src/lib/env.ts` centralizes a set of `isXConfigured` flags, and every integration point branches on them explicitly — with **no unset key ever surfacing as a crash or a broken UI element**. Without any environment variables set, the app runs as a complete, self-contained simulation: payments confirm instantly, orders persist in-memory, order tracking falls back to a deterministic simulated timeline. Drop in real Stripe and Supabase keys and the exact same call sites, types, and UI switch to the real backend — enabling a feature is a `.env` change, never a rewrite. This is what makes the public demo below runnable with zero infrastructure cost while staying architecturally honest about what a production deployment requires.

---

## Key Architectural Features

### 🧪 Interactive Olfactory Compatibility Engine — `/custom-blend`
The **Layering Lab** (`src/components/blend/BlendLab.tsx`, `src/lib/scent-compatibility.ts`) lets a customer pick any two fragrances and computes a live **Scent Harmony Score**: a symmetric olfactory-family compatibility matrix (modelled on classic perfumery pairing conventions — woods + ambers score near-perfect, citrus + oriental is a bolder contrast) plus a shared-note bonus derived from the two products' actual top/heart/base notes. The result drives an animated SVG gauge, a merged olfactory pyramid, a downloadable text profile, and a discounted "Duo Set" add-to-cart flow — a genuine recommendation algorithm, not a static cross-sell list.

### 🔒 Concurrency & Race Condition Handling — `src/lib/inventory.ts`
The stock reservation engine is the piece most worth reading in this repo. When a shopper reaches checkout, their cart's stock is held for 10 minutes so a second shopper can't buy the last bottle out from under them mid-checkout. Two things make this correct under concurrency:
- **A promise-chain mutex** (`withLock`) serializes every validate-then-write critical section. JavaScript's single-threadedness *alone* is not sufficient here — the critical section awaits a read from the orders repository, so two near-simultaneous requests could otherwise both pass the stock check before either commits its reservation.
- **Lazy expiry**, not a background timer: every read sweeps expired holds inline (`sweepExpired()`) before evaluating availability, so correctness never depends on a `setInterval` actually firing — which matters because it *won't*, reliably, on a serverless platform between invocations.

The in-memory `Map` here is a deliberate **Fallback Mode** stand-in: the code comments spell out exactly how the same critical section maps onto a real Postgres `SERIALIZABLE` transaction or a conditional `UPDATE ... WHERE available >= quantity RETURNING *`, with an unchanged public API (`reserveStock` / `releaseReservation`).

### 🔍 Global Fuzzy Search — ⌘K Command Palette
`src/components/command/CommandPalette.tsx` + `src/lib/search-index.ts` build a weighted [Fuse.js](https://fusejs.io/) index across every product, olfactory note, family, and static page, opened instantly from anywhere via `⌘K`/`Ctrl+K`. The index is rebuilt reactively per active language, so search results and their subtitles are always in the currently selected locale — not just the UI chrome around them.

### 🌍 Multi-Currency & i18n State Management
Two independent, persisted Zustand stores — `src/store/currency.ts` (EUR/USD/GBP, fixed indicative FX table, all business logic computed in EUR and converted only at display time) and `src/store/locale.ts` (IT/EN) — back an instant, no-reload language and currency switch. The i18n layer (`src/lib/i18n/dictionary.ts`) is a single deep-typed dictionary where the English translation's type is structurally derived from the Italian source, so a missing key is a **compile-time TypeScript error**, not a blank string discovered in production. Canonical business values (olfactory family, gender, concentration) are never translated — only their *display label* is — so switching language can never desync a filter, a quiz score, or an admin metric from the data it's matching against.

### 💳 Stripe Elements, Webhooks & Resilience Layer
`src/components/checkout/StripePaymentSection.tsx` embeds a real Stripe `PaymentElement` against a server-created `PaymentIntent`. `src/app/api/webhooks/stripe/route.ts` verifies the webhook signature, then advances order status **idempotently** — a retried delivery is a no-op against an order that's already past the `received` state. `src/lib/orders/repository.ts` exposes a single `OrdersRepository` interface with a Supabase-backed implementation and an in-memory fallback selected by a factory function (`getOrdersRepository()`), so route handlers never know or care which one is active.

### ✅ E2E Testing Suite & Telemetry
Playwright (`tests/e2e/checkout.spec.ts`) drives the full purchase journey — add to cart → Scent Finder quiz → checkout → order tracking — against an actual **production build** (`next build && next start`), not the dev server, so CI timing reflects what ships. `.github/workflows/ci.yml` runs it as a second job gated behind a typecheck/lint/build quality gate, uploading the Playwright HTML report as a build artifact on failure. Every state-changing operation across inventory, checkout, Stripe, and currency is logged through `src/lib/telemetry.ts`, a structured single-line-JSON logger with an in-memory ring buffer — the same sink whether it's running server-side in a Route Handler or client-side in the browser, ready to be pointed at a real log drain without touching a single call site.

---

## Tech Stack & Tools

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack, React Server Components), React 19 |
| **Language** | TypeScript — strict mode |
| **Styling** | Tailwind CSS v4 (CSS-variable design tokens), `next-themes` (dark "Nuit" / light "Jour") |
| **UI Primitives** | base-ui, shadcn-style component layer, Lucide icons |
| **Animation** | Framer Motion |
| **State Management** | Zustand (+ `persist` middleware for cart, currency, locale, admin session) |
| **Search** | Fuse.js — weighted fuzzy search |
| **Payments** | Stripe — Elements, PaymentIntents, signed webhooks |
| **Database** | Supabase (Postgres), with a transparent in-memory fallback |
| **AI Concierge** | Anthropic Claude (`claude-sonnet-5`) via the official SDK, with a local FAQ/catalogue fallback responder |
| **Validation** | Zod (every API route parses and validates its input) |
| **Testing** | Playwright (E2E, against a production build) |
| **CI/CD** | GitHub Actions (typecheck → lint → build → E2E, artifact upload) |
| **Deployment** | Vercel |

---

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── api/                    # Route Handlers
│   │   ├── checkout/, checkout/confirm/     # Order creation (demo + Stripe modes)
│   │   ├── inventory/reserve/, /release/    # Stock reservation engine endpoints
│   │   ├── webhooks/stripe/                 # Signed webhook handler
│   │   ├── orders/, orders/[code]/          # Cross-device order lookup
│   │   ├── reviews/, assistant/, newsletter/, admin/verify/, health/
│   ├── product/[id]/           # Dynamic product detail + OG image generation
│   ├── catalog/, checkout/, scent-finder/, custom-blend/,
│   │   sample-discovery/, track-order/, admin/
│   ├── layout.tsx              # Root layout — font loading, theme/providers
│   └── page.tsx                # Home
├── components/
│   ├── layout/                  # Header, Footer, theme/language/currency toggles
│   ├── home/                    # Hero, BrandStory, Bestsellers, Newsletter, ...
│   ├── product/                 # ProductCard, ProductDetail, OlfactoryPyramid, ...
│   ├── cart/, checkout/, blend/, catalog/, scent-finder/,
│   │   sample-discovery/, reviews/, admin/, assistant/, command/
│   └── ui/                      # base-ui/shadcn primitives (button, dialog, sheet, ...)
├── lib/
│   ├── inventory.ts             # Reservation engine — mutex + lazy expiry
│   ├── scent-compatibility.ts   # Olfactory Harmony Score engine
│   ├── search-index.ts          # Fuse.js index builder (locale-aware)
│   ├── telemetry.ts             # Structured JSON logger
│   ├── env.ts                   # Central "is X configured" flags (Fallback Mode)
│   ├── i18n/                    # Dictionary, product localization helpers
│   ├── orders/, stripe/, supabase/, assistant/, checkout/
│   └── currency.ts, cart-math.ts, order-tracking.ts, order-security.ts
├── store/                      # Zustand stores — cart, locale, currency, order, ...
├── hooks/                      # useMoney, useTranslation, useStockReservation, ...
├── data/                       # Product catalogue (IT canonical + EN overrides), quiz
└── types/                      # Shared domain types
tests/
└── e2e/
    └── checkout.spec.ts         # Full purchase journey against a production build
.github/
└── workflows/
    └── ci.yml                   # Typecheck → Lint → Build, then gated E2E job
```

---

## Getting Started

**Prerequisites:** Node.js 20+, npm.

```bash
# 1. Clone and enter the project
git clone https://github.com/davisimoni/lynux-profumi.git
cd lynux-profumi

# 2. Install dependencies
npm install

# 3. (Optional) configure environment variables — see below
cp .env.example .env.local

# 4. Run the dev server
npm run dev
```

The app is fully functional with **zero configuration** — every variable in `.env.example` is optional, and the app runs entirely in Fallback Mode (see [Overview](#overview--value-proposition)) until you set them.

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start the production server (run `build` first) |
| `npm run typecheck` | `tsc --noEmit` — no build output, type-check only |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright E2E suite — builds and serves the app automatically |

### Environment variables

All optional — set a group to switch that area from Fallback Mode to the real integration, without touching any code.

| Variable | Enables |
|---|---|
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Real Stripe PaymentIntents + Elements (use **test** keys) |
| `STRIPE_WEBHOOK_SECRET` | Signed webhook verification |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Postgres-backed orders instead of the in-memory store |
| `ORDER_HMAC_SECRET` | Signs order numbers so they can't be guessed/enumerated |
| `ADMIN_ACCESS_CODE` | Turns `/admin` from a one-click demo into a real passphrase gate |
| `ANTHROPIC_API_KEY` | Routes the concierge chat through Claude instead of the local FAQ responder |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used for SEO metadata and sitemap generation |

See [`.env.example`](./.env.example) for the full, commented reference.

---

## Live Demo & Contact

- 🔗 **Live Demo:** [lynux-profumi.vercel.app](https://lynux-profumi.vercel.app) — *replace with your deployed URL*
- 💼 **Hire me on Upwork:** `[ Add your Upwork profile link here ]`
- 🐙 **GitHub:** [github.com/davisimoni](https://github.com/davisimoni)

---

<div align="center">

Built as a portfolio case study demonstrating production-grade architecture patterns — concurrency control, resilient third-party integration, observability, and i18n — applied to a luxury e-commerce experience.

</div>
