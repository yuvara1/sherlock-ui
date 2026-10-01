# Sherlock — Architecture & Contributor Guide

> AI-powered observability platform for SRE teams. Instant root-cause analysis,
> distributed tracing, noise-free alerting, and unified metrics.
>
> **Stack:** React 19 · Vite 8 · TypeScript 5.7 · Tailwind CSS v4 · React Router v7 ·
> Zustand · Zod · Axios · AG Grid · Recharts · Motion · Aceternity UI / React Bits · Vaul.

This document is the single source of truth for how the codebase is organized and
why. It is written for both human contributors and AI coding agents — see
[§10 Guidelines for AI Agents](#10-guidelines-for-ai-agents).

---

## 1. Project Architecture

Sherlock is a **client-rendered single-page application**. Vite bundles the app;
the client talks to a Sherlock backend over a versioned REST API (`/api/v1`).
There is no server-side rendering — every page is a lazily-loaded route chunk.

```
Browser ──► React SPA (this repo) ──► Axios apiClient ──► Sherlock API (/api/v1)
                 │                          │
                 ├─ Zustand stores          ├─ JWT bearer auth + refresh
                 ├─ Zod validation          └─ X-Correlation-ID per request
                 └─ Mock data (dev/demo)
```

Two route trees:

- **Public** (`/`, `/login`, `/register`, `/forgot-password`, `/reset-password`) —
  the marketing landing page and auth flows. Rendered with a lightweight spinner
  fallback.
- **App shell** (`/app/*`) — the authenticated product, rendered inside
  `components/Shell.tsx`. Each route has a tailored skeleton fallback for a smooth
  loading experience.

Legacy top-level paths (`/dashboard`, `/traces`, …) redirect into `/app/*`.

---

## 2. Folder Structure & Rationale

```
src/
├── main.tsx            # React entrypoint — mounts <App/> inside <ThemeProvider/>
├── App.tsx             # Router: route table + lazy imports + Suspense fallbacks
├── index.css           # Tailwind v4 import, Google Font @import, design tokens
│
├── pages/              # One file per route (Landing, Dashboard, Logs, …)
├── components/
│   ├── Shell.tsx       #   authenticated app frame (nav, breadcrumbs, outlet)
│   ├── RouteMeta.tsx   #   per-route <title>/meta side-effects
│   └── ui/             #   reusable presentational primitives + effects
│                       #   (button, badge, drawer, tooltip, Aurora, Spotlight,
│                       #    BorderBeam, CommandPalette, PageSkeleton, …)
├── api/                # Service layer — one module per domain (auth, logs,
│                       #   traces, incidents, errors, projects, ai, services,
│                       #   dependencies) built on a shared axios client
├── stores/             # Zustand global state (authStore, appStore)
├── schemas/            # Zod schemas + validators (form contracts, strength meter)
├── types/              # Shared TypeScript types (domain models)
├── lib/                # Cross-cutting utilities (utils.ts, theme.tsx)
├── mocks/              # Deterministic mock data for demo / offline dev
├── assets/             # Static design references shipped with the app
└── imports/            # Figma-imported raster assets
```

**Why this shape**

- **`pages/` vs `components/`** — pages are route targets and own data-fetching
  and layout; `components/ui/` holds stateless, reusable building blocks. This
  keeps route code thin and primitives portable.
- **`api/` as the service layer** — every network call goes through a domain
  module that wraps the shared `apiClient`. UI never calls `axios` directly, so
  auth, retries, and error handling live in exactly one place. (This is the
  conventional "services" layer; it is named `api/` because every module here is
  an API client — renaming it would only churn ~40 import paths for no gain.)
- **`schemas/` separate from `types/`** — Zod schemas are runtime validators;
  `types/` are compile-time only. Keeping them apart makes the trust boundary
  (validated input vs. internal types) explicit.
- **`stores/` (Zustand)** over Context for global state — avoids provider
  nesting and unnecessary re-renders; selectors subscribe components to only the
  slices they read.
- **`mocks/`** lets the UI run fully offline for demos and Vercel previews.

---

## 3. Component Hierarchy

```
<React.StrictMode>
  <ThemeProvider>                    lib/theme.tsx — light/dark tokens
    <App>                            App.tsx — BrowserRouter + Routes
      <RouteMeta/>                   document title/meta per route
      ├─ Public routes  → Landing / Login / Register / Forgot / Reset
      └─ <Shell>        → app frame (sidebar nav, breadcrumb, command palette)
           └─ <Outlet>  → Dashboard | Projects | Incidents | Errors | Logs |
                          Traces | Services | Deployments | Dependencies |
                          Metrics | ApiDebugger | AIAnalysis | Settings
```

Every page is code-split via `React.lazy` and wrapped in `<Suspense>` with a
route-appropriate skeleton (`components/ui/PageSkeleton`). Presentational effects
(Aurora, Spotlight, BorderBeam, Sparkles, Typewriter, etc.) live under
`components/ui/` and are composed into pages.

---

## 4. State Management

| Concern                | Mechanism                         | Location            |
| ---------------------- | --------------------------------- | ------------------- |
| Auth / session         | Zustand + `persist`               | `stores/authStore`  |
| App-wide UI state      | Zustand                           | `stores/appStore`   |
| Server data            | `api/*` modules (axios)           | `api/`              |
| Form / input state     | Local component state + Zod       | pages + `schemas/`  |
| Theme (light/dark)     | React Context                     | `lib/theme.tsx`     |

- **`authStore`** holds the user, auth flags, MFA/verification state, and a
  client-side **login lockout** (5 attempts → 5-minute lockout). Its `persist`
  `partialize` deliberately persists only non-sensitive preferences and the
  lockout counters — see [§6 Security](#6-security-measures).
- Prefer **selector subscriptions** (`useAuthStore(s => s.user)`) over pulling
  the whole store, so components re-render only when their slice changes.

---

## 5. API Integration Patterns

All HTTP goes through `src/api/client.ts`:

- **Base URL** from `import.meta.env.VITE_API_BASE_URL`, versioned at `/api/v1`.
- **Request interceptor** attaches the JWT bearer token and a fresh
  `X-Correlation-ID` (`crypto.randomUUID()`) to every request for traceability.
- **Response interceptor** handles `401` globally: it performs a **single**
  token refresh (`_retry` guard) and replays the request; on failure it clears
  tokens and redirects to `/login`.
- **Domain modules** (`api/auth.ts`, `api/logs.ts`, …) expose typed functions;
  pages call these, never `axios` directly.

To add an endpoint: add a typed function to the relevant `api/*` module, define
its request/response types in `types/`, and (for user input) a Zod schema in
`schemas/`.

---

## 6. Security Measures

- **Input validation & XSS** — all user input is validated with **Zod**
  (`schemas/auth.ts`) before use. The app renders through React (auto-escaping);
  there is **no `dangerouslySetInnerHTML`**. Never introduce it without
  sanitizing (e.g. DOMPurify).
- **Auth token handling** — tokens are attached via interceptor and refreshed on
  `401`. `authStore` documents that production should move tokens to **httpOnly,
  Secure, SameSite cookies**; the persisted store deliberately excludes tokens
  from `localStorage` via `partialize`.
- **Brute-force protection** — client-side lockout (5 attempts / 5 min) in
  `authStore`. This is UX defense-in-depth; the **server must enforce** the
  authoritative rate limit.
- **CSRF** — bearer-token auth in headers is not automatically sent by the
  browser (unlike cookies), reducing CSRF exposure. If moving to cookie auth,
  add SameSite=strict + CSRF tokens.
- **CSP & response headers** — `vercel.json` sets a strict
  `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Permissions-Policy`, HSTS, and COOP. Adjust `connect-src`
  if the API moves to a fixed host.
- **Environment management** — secrets live in `.env.local` (git-ignored);
  `.env.example` documents required keys. Only `VITE_`-prefixed vars reach the
  client bundle — never put private keys there.
- **Demo keys** — sample API keys in `pages/Settings.tsx` / `pages/Projects.tsx`
  must use the `demo_live_` / `demo_test_` prefixes so GitHub push protection
  never flags them. Do not use real `sk_` prefixes.
- **Dependency scanning** — run `pnpm audit` before releases; enable Dependabot
  or `npm audit` in CI to track advisories.

---

## 7. Performance Optimizations

- **Route-level code splitting** — every page is `React.lazy` + `<Suspense>`, so
  the initial bundle stays small and each route loads on demand.
- **Tailored skeletons** — per-route fallbacks (`PageSkeleton`) keep perceived
  performance high during chunk load.
- **Memoization** — use `React.memo` for pure presentational components and
  `useMemo`/`useCallback` for expensive derivations and stable callbacks passed
  to memoized children (heavy tables/charts in particular).
- **Selector subscriptions** — Zustand selectors minimize re-renders.
- **Asset caching** — hashed `/assets/*` served `immutable` for a year via
  `vercel.json`.
- **Heavy libs stay in-route** — AG Grid, Recharts, Three.js, and tsParticles
  are imported only by the pages that use them, so they never bloat the shared
  chunk.

---

## 8. Setup & Installation

```bash
# Toolchain versions are pinned in .mise.toml (Node + pnpm)
pnpm install

cp .env.example .env.local   # fill in VITE_API_BASE_URL if you have a backend

pnpm dev        # start Vite dev server (hot reload)
pnpm build      # production build → dist/
pnpm preview    # serve the production build locally
pnpm format     # oxfmt
```

Inside Figma Make the dev server is already running on `$PORT` (default 8443).

---

## 9. Deployment

Deployed on **Vercel**, pushed to `github.com/yuvara1/sherlock-ui`.

- `vercel.json` provides SPA rewrites (all paths → `index.html`) plus the
  security headers in [§6](#6-security-measures).
- The repo has a corrupted git history, so publishing uses an **orphan branch
  force-pushed to `main`** (a fresh single-commit tree). This is intentional —
  do not attempt a normal merge/rebase against the remote history.

---

## 10. Guidelines for AI Agents

Read this before editing.

1. **Extend, don't replace.** This is a real app, not a scaffold. Preserve the
   router, the `/app` shell, providers, styling, and font wiring. Make focused
   edits within existing boundaries.
2. **Respect the layers.** UI → `api/*` → `apiClient`. Add network calls in
   `api/`, types in `types/`, validators in `schemas/`. Don't call `axios` from a
   page.
3. **Design system first.** Reuse `components/ui/*` before building custom UI.
   The landing page is a strict **black-and-white Infranex-style** design with
   **zero color accents** — do not introduce colors there.
4. **Styling.** Tailwind v4 utilities in JSX; global tokens/`@font-face` in
   `src/index.css` (keep `@import` statements first). No unlayered `*` CSS
   resets.
5. **Quotes.** Use double quotes for strings containing apostrophes, or escape
   them — an unescaped `'` in a single-quoted string breaks the build.
6. **Security invariants.** Keep demo keys on `demo_live_`/`demo_test_` prefixes;
   never add `dangerouslySetInnerHTML` without sanitization; never put secrets in
   `VITE_` vars.
7. **Performance.** New routes must be `React.lazy` + `<Suspense>` with a
   skeleton fallback. Memoize expensive/pure components.
8. **Verify proportionally.** Localized edits don't need a full build; broad
   changes should at least `pnpm build`.
9. **Publishing.** Push via an orphan branch force-pushed to `main` (see §9).
