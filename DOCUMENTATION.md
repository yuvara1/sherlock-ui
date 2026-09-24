# Sherlock — Frontend Documentation

**Sherlock** is an AI-powered API debugging & distributed-systems observability platform for SRE and backend teams. It answers one question fast: **"Why did this API request fail?"** — by correlating API requests → traces → services → logs → metrics → dependencies → deployments → incidents → evidence → root-cause analysis → AI investigation.

This document is the single source of truth for the **architecture, conventions, and contribution guidelines** of the frontend. It is written to be read by both humans and AI coding agents. If you change the architecture, update this file in the same change.

> **Backend status:** the backend does not exist yet. The frontend runs entirely on a **mock data layer** behind a repository abstraction, so the UI already behaves like a real product. The mock implementations are designed to be swapped for HTTP calls to a Java Spring Boot backend **without changing any UI code**.

---

## 1. Tech stack (as actually built)

| Concern | Choice |
|---|---|
| Framework | **React 19** + **Vite 8** (SPA, not Next.js) |
| Language | **TypeScript 5.7** (strict; avoid `any`) |
| Routing | **react-router-dom v7** (`BrowserRouter`, lazy routes) |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) + CSS custom-property design tokens in `src/index.css` |
| State | **Zustand** (with `persist`) for global/UI state; local component state otherwise |
| Data access | **axios** client + per-domain repository modules (`src/api/*`) |
| Charts | **Recharts** |
| Data grids | **AG Grid** (`ag-grid-react`) |
| Motion | **motion** (Framer Motion successor) |
| Drawers | **vaul** |
| Icons | **lucide-react**, `@tabler/icons-react`, `react-icons` |
| Validation | **Zod** + hand-rolled form handling |
| Effects/visuals | React Three Fiber, tsparticles (landing page only) |

> **Note on the spec vs. reality:** the original build prompt referenced Next.js, TanStack Query, shadcn/ui, React Flow, and Monaco. This project deliberately targets **Vite SPA + react-router + a custom repository layer + Recharts + AG Grid + custom UI primitives**. When contributing, follow *this* stack, not the prompt.

---

## 2. Setup & installation

```bash
# 1. Install (pnpm is the pinned toolchain — see .mise.toml)
pnpm install

# 2. Configure env (optional; mocks work with no env)
cp .env.example .env.local

# 3. Run — a dev server is typically already running on $PORT (default 8443)
pnpm dev            # vite --host 0.0.0.0

# 4. Production build / preview
pnpm build
pnpm preview

# 5. Format
pnpm format         # oxfmt
```

Requirements are pinned in `.mise.toml` (Node.js + pnpm). No Tailwind config or PostCSS config is needed — Tailwind v4 is driven entirely through the Vite plugin and `src/index.css`.

---

## 3. Folder structure & rationale

```
src/
├── main.tsx              # React entrypoint → mounts <App/> into #root, imports index.css
├── App.tsx               # Router: public routes + /app shell with lazy pages
├── index.css             # Tailwind import, design tokens, @font-face, global CSS
│
├── components/
│   ├── Shell.tsx         # Authenticated app shell: sidebar + topbar + <Outlet/>
│   ├── RouteMeta.tsx     # Per-route <title>/meta side effects
│   └── ui/               # Reusable primitives & effects (design system)
│
├── pages/                # One file per route (route-level screens)
├── api/                  # Repository layer (axios client + per-domain modules)
├── stores/               # Zustand global stores (auth, app/UI)
├── mocks/                # Mock database (data.ts) — imported ONLY by src/api/*
├── schemas/              # Zod schemas (form/input validation)
├── types/                # Domain types & enums (map to future Spring Boot DTOs)
├── lib/                  # utils.ts (cn helper), theme.tsx
├── assets/ , imports/    # Static images and imported design references
```

**Rationale**

- **`pages/` = routes, `components/ui/` = reusables.** Screens compose primitives; primitives never import pages.
- **`api/` is the only boundary that touches data.** Pages/components call repository methods; they never import `mocks/data.ts` directly. This is what makes the mock→HTTP swap a one-line change per module.
- **`types/` mirrors backend DTOs** so the contract is stable before the backend exists.
- **`stores/` holds only cross-cutting state** (auth session, active project/environment, sidebar/theme/time-range). Screen-local state stays local.

---

## 4. Routing & component hierarchy

Defined in `src/App.tsx`. All page modules are **lazy-loaded** (`React.lazy` + `Suspense`), each with a tailored skeleton fallback from `components/ui/PageSkeleton.tsx`.

```
<BrowserRouter>
 ├─ RouteMeta                       # updates document title per route
 └─ Routes
    ├─ /                 Landing    (public)
    ├─ /login /register /forgot-password /reset-password   (public auth)
    │
    ├─ /app  → <Shell>              # sidebar + topbar + <Outlet/>
    │    ├─ index → redirect /app/overview
    │    ├─ overview      Dashboard
    │    ├─ projects      Projects
    │    ├─ incidents     Incidents
    │    ├─ errors        Errors
    │    ├─ logs          Logs
    │    ├─ traces        Traces
    │    ├─ services      Services
    │    ├─ deployments   Deployments
    │    ├─ dependencies  Dependencies
    │    ├─ metrics       Metrics
    │    ├─ apis          ApiDebugger
    │    ├─ ai            AIAnalysis
    │    └─ settings      Settings
    │
    ├─ legacy redirects (/dashboard → /app/overview, etc.)
    └─ *  → NotFound
```

**Shell (`components/Shell.tsx`)** is the authenticated layout: sidebar (expanded / collapsed / mobile drawer, collapse state persisted via `appStore`), topbar (breadcrumb, global search, project selector, environment selector, time-range selector, refresh, notifications, user menu), and the routed `<Outlet/>`. The **command palette** (`components/ui/CommandPalette.tsx`) is opened with `Cmd/Ctrl+K` and driven by `appStore`.

---

## 5. State management

Two Zustand stores, both using `persist` with a `partialize` allowlist (only safe, UI-relevant slices are persisted to `localStorage`).

**`stores/appStore.ts`** — the product/UI store:
- Active project (`activeProjectId`) and environment (`production | staging | development`)
- Sidebar collapse, theme, command-palette open state
- Global time range (`1h | 6h | 24h | 7d | 30d`)
- `useActiveProject()` convenience selector

**`stores/authStore.ts`** — the session store:
- User + `isAuthenticated`, access/refresh tokens
- Client-side **rate limiting / lockout** (5 attempts → 5-min lockout)
- MFA-pending and email-verification transient flags
- "Remember me" / last email

**Guidelines**
- Put state in a store **only** if multiple routes need it or it must survive navigation. Otherwise use `useState`/`useReducer` in the component.
- Never persist secrets long-term. Tokens live in the store for the demo; in production the backend should issue **httpOnly cookies** (see §8).
- Select narrowly to avoid re-renders (subscribe to the specific fields you use).

---

## 6. API integration pattern (repository layer)

This is the most important architectural rule. **Data flows one direction:**

```
UI (pages/components)
   ↓  call repository method
src/api/<domain>.ts     ← the swap point
   ↓
USE_MOCK ? src/mocks/data.ts : apiClient (HTTP)
```

Each domain module (`api/incidents.ts`, `api/traces.ts`, `api/logs.ts`, `api/services.ts`, `api/projects.ts`, `api/metrics`, `api/ai.ts`, `api/dependencies.ts`, `api/errors.ts`, `api/auth.ts`) exposes REST-style async methods and gates on a local `USE_MOCK` flag:

```ts
const USE_MOCK = true;

export const incidentsApi = {
  list: async (projectId: string): Promise<PaginatedResponse<Incident>> => {
    if (USE_MOCK) return { data: MOCK_INCIDENTS, total: MOCK_INCIDENTS.length, page: 0, pageSize: 50, hasMore: false };
    const { data } = await apiClient.get<PaginatedResponse<Incident>>("/incidents", { params: { projectId } });
    return data;
  },
  // get(id), create(...), update(...), etc.
};
```

**To connect the real backend:** flip `USE_MOCK` to `false` (or read `import.meta.env.VITE_ENABLE_MOCK_API`) per module. **No UI change required.**

**The axios client (`api/client.ts`)** is production-shaped already:
- Base URL from `VITE_API_BASE_URL`, path prefix `/api/v1`, 30s timeout
- **Request interceptor:** attaches `Authorization: Bearer <token>` and a fresh `X-Correlation-ID` (`crypto.randomUUID()`) per request for distributed tracing
- **Response interceptor:** on `401`, transparently attempts a **refresh-token** rotation once, retries the original request, and on failure clears tokens and redirects to `/login`

**Rules for contributors**
- Pages/components **must not** import from `src/mocks/`. Only `src/api/*` may.
- Keep repository method signatures aligned with the future REST endpoints in §10.
- Return types must come from `src/types` so mock and HTTP paths are interchangeable.

---

## 7. Domain types & mock data

- **`src/types/index.ts`** defines all domain entities (`User`, `Organization`, `Workspace`, `Project`, `ApiKey`, `Service`, `ApiRequest`, `Trace`, `Span`, `Log`, `Metric`, `Incident`/`IncidentDetail`, `Evidence`, `Deployment`, `Integration`, `Alert`, `Notification`, `AuditLog`, `AiInvestigation`, `Comment`) and typed unions/enums (`Role`, `Environment`, `Severity`, `IncidentStatus`, `DeploymentStatus`, `LogLevel`, `HttpMethod`, `ServiceHealth`, …). Timestamps are ISO strings. These are intended to map 1:1 to Spring Boot DTOs.
- **`src/mocks/data.ts`** is the mock database: realistic, **related** records (a trace ties to a service, logs, an incident, and a deployment). The flagship demo incident is **INC-1023 (Checkout API failures, Critical/Investigating)** with the payment-latency root cause (300ms → 2.8s, 142 timeouts, deployment v2.8.1 seven minutes before). Keep relationships consistent when editing.

---

## 8. Security measures

Frontend security is **UX enforcement + hygiene**; real authorization is enforced by the backend later.

- **No real secrets in source or in `VITE_*` env.** `VITE_`-prefixed vars are inlined into the public bundle. Demo API keys use `demo_live_` / `demo_test_` prefixes (never `sk_live_`/`sk_test_`) to satisfy secret-scanning/push protection.
- **Token handling:** access/refresh tokens flow through the axios interceptors; `authStore` persists only non-sensitive slices. Production target is **httpOnly, Secure, SameSite cookies** issued by the backend rather than JS-readable storage.
- **CSRF:** with cookie-based auth, pair with a CSRF token header or `SameSite=strict`; the correlation-ID interceptor is the natural place to add a CSRF header.
- **Input validation & XSS:** validate all forms with **Zod** (`src/schemas/`). Never use `dangerouslySetInnerHTML` with unsanitized data. Render log/trace/JSON content as text in code viewers, not as HTML.
- **Permission-gated UI:** roles `OWNER | ADMIN | DEVELOPER | VIEWER` hide/disable actions. This is UX only — the backend must re-check every action.
- **Destructive actions** always require a confirmation dialog ("This action cannot be undone").
- **Error surfaces:** show human-readable messages; never leak stack traces to end users.
- **Dependency scanning:** run `pnpm audit` (or CI equivalent) before releases; keep unused packages (e.g. the leftover `@assistant-ui/*`, `ai`, `@ai-sdk/*`) pruned to shrink attack surface and bundle size.

---

## 9. Performance strategies

- **Code splitting / lazy loading:** every page is `React.lazy` + `Suspense` with a purpose-built skeleton (`PageSkeleton.tsx`) — no blank screens, smaller initial bundle.
- **Memoization:** use `React.memo` for pure presentational primitives, `useMemo` for derived table/chart data, `useCallback` for stable handlers passed to memoized children. Add these where a real re-render cost exists, not reflexively.
- **Tables:** AG Grid handles virtualization, sorting, filtering, and pagination for large datasets; long log lists should be virtualized.
- **Search:** debounce free-text search inputs; keep filtering case-insensitive.
- **Narrow store selectors** to avoid whole-tree re-renders.
- **Persisted UI state** (sidebar/theme/time-range/active project) avoids re-fetch/re-layout churn on navigation.
- Prefer CSS/token-driven styling over heavy runtime style computation; reserve R3F/particles for the marketing landing page only.

---

## 10. Future backend endpoints (contract preparation)

Repository modules are shaped for these REST resources (prefix `/api/v1`):

```
/auth        /users          /organizations   /workspaces   /projects
/environments /api-keys       /services        /api-requests /traces
/spans        /logs           /metrics         /incidents    /evidence
/deployments  /integrations   /alerts          /notifications /audit-logs
/ai/investigations
```

When the Spring Boot backend lands: implement HTTP branches in each `src/api/*` module (they already exist behind `USE_MOCK`), point `VITE_API_BASE_URL` at the gateway, and set `VITE_ENABLE_MOCK_API=false`.

---

## 11. Design system & conventions

- **Tokens live in `src/index.css`** as CSS custom properties (`--bg`, `--border`, `--accent`, `--green`, etc.). Reference tokens; do not scatter raw hex values across components. Dark-first developer-tool aesthetic.
- **Typography:** Inter for UI; **JetBrains Mono** for technical content (URLs, HTTP methods, trace/span/request IDs, JSON, logs, SQL, stack traces). Wire fonts in `src/index.css` only (imports first, then `@font-face`).
- **Semantic color = meaning only:** success/green, warning/amber, error/red, info/blue, AI/purple. Don't make every card colorful. Always pair color with a text/icon indicator (color-independent status).
- **Reusable primitives** in `components/ui/` (badges, skeletons, drawers, command palette, selects, charts helpers, effects). Prefer reusing/extending these before writing bespoke UI.
- **Code quality:** double-quote strings containing apostrophes; keep JSX balanced; components are **default exports**; run `oxfmt`.

---

## 12. Guidelines for AI agents contributing to this codebase

Read this before editing. These rules keep the architecture intact.

1. **Respect the data boundary.** UI never imports `src/mocks/`. Add/needed data access → add a method to the relevant `src/api/*` module and return a type from `src/types`.
2. **Extend, don't replace.** This is a working app. Edit the existing route/page in place. Do not create a parallel app root, swap the entrypoint, or make routes unreachable.
3. **New screen?** Add the page in `src/pages/`, lazy-import it in `App.tsx` under the `/app` shell with an appropriate skeleton fallback, and add the sidebar entry in `Shell.tsx`.
4. **New entity?** Add its type + enums to `src/types`, its mock records (with real relationships) to `src/mocks/data.ts`, and a repository module in `src/api/` following the `USE_MOCK` pattern.
5. **Forms** validate with Zod schemas in `src/schemas/`. **Destructive actions** get a confirm dialog. **Async ops** get loading + empty + error states.
6. **State:** reach for a Zustand store only for cross-route/persistent state; otherwise local state. Persist only safe slices.
7. **Never** hardcode real secrets; keep demo keys on the `demo_live_`/`demo_test_` prefixes; don't put secrets in `VITE_*`.
8. **No dead UI.** Every button, filter, tab, and drawer must do something. A filter that doesn't change data is incomplete.
9. **Styling** via Tailwind utilities + tokens from `index.css`. Don't add unlayered global CSS resets. Keep responsive behavior (sidebar → drawer, tables → scroll/stack) working down to 375px.
10. Keep this document current when you change architecture, routes, stores, or the API layer.

---

## 13. Primary product journey (must always work end-to-end)

```
Login → select project → Dashboard → API Debugger → send failing request
→ 500 response → Timeline → Trace → Payment Service → related Logs
→ Incident → Evidence → Deployment correlation → AI Investigation
→ probable root cause + recommended checks → Resolve Incident
```

Any change that breaks this flow, or the secondary (Services → Metrics → Traces → Incident) and deployment-correlation (Deployments → v2.8.1 → Incident) flows, is a regression.
