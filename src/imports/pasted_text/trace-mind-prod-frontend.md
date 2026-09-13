# TRACE MIND — PRODUCTION FRONTEND MASTER IMPLEMENTATION PROMPT

## ROLE

You are a senior frontend architect and UI engineer responsible for implementing the production frontend of **TraceMind**, an AI-powered observability, API debugging, incident investigation, and root-cause-analysis platform.

You must implement the application from the approved Figma designs.

The Figma design is the **visual source of truth**.

The backend API contract/OpenAPI specification is the **data contract source of truth**.

The frontend architecture defined in this document is the **engineering source of truth**.

Do not replace the architecture with a simpler toy implementation.

---

# 1. PRODUCT CONTEXT

TraceMind is a developer-focused platform that connects to applications and collects:

* application logs
* distributed traces
* API requests
* API responses
* exceptions
* metrics
* service information
* deployment information
* Git changes
* historical incidents

TraceMind correlates these signals and uses AI to identify probable root causes.

The platform should help developers answer:

> "Why is my application failing or becoming slow?"

The frontend must provide:

* system overview
* incident management
* API debugging
* trace exploration
* log exploration
* metrics
* service health
* deployment visibility
* AI root-cause analysis
* historical incident knowledge
* application integration configuration

The product must feel like a professional developer infrastructure product.

Visual inspiration may come from modern observability platforms, developer tools, and premium AI products, but DO NOT copy another company's UI.

---

# 2. PRIMARY UX PRINCIPLES

The interface must be:

* technical
* clean
* information-dense
* fast
* highly readable
* professional
* accessible
* responsive
* visually polished
* calm rather than excessively animated

Prioritize:

1. Information hierarchy
2. Developer productivity
3. Fast navigation
4. Data readability
5. Clear incident severity
6. Evidence-based AI output
7. Consistent interaction patterns

Do not create a generic SaaS dashboard.

Do not make the application look like a chatbot.

---

# 3. TECHNOLOGY STACK

Use exactly:

* React
* TypeScript
* Vite
* React Router
* TanStack Query
* Zustand
* Tailwind CSS
* shadcn/ui
* Radix UI through shadcn components
* React Bits
* Aceternity UI
* Lucide Icons
* Apache ECharts
* React Hook Form
* Zod
* Storybook
* Vitest
* React Testing Library
* Playwright
* ESLint
* Prettier
* Husky
* lint-staged

Use strict TypeScript.

Do not use JavaScript files for application code.

Avoid `any`.

---

# 4. UI LIBRARY RESPONSIBILITIES

Do not randomly mix UI libraries.

## shadcn/ui

Use shadcn/ui as the PRIMARY UI foundation.

Use it for:

* Button
* Input
* Select
* Combobox
* Dialog
* Drawer
* Sheet
* Dropdown
* Tooltip
* Popover
* Tabs
* Accordion
* Card
* Badge
* Alert
* Table
* Pagination
* Calendar
* Command
* Form
* Toast
* Skeleton
* Progress
* Separator
* Breadcrumb

Customize shadcn components to match the Figma design system.

---

## React Bits

Use React Bits selectively for:

* animated counters
* micro-interactions
* subtle hover interactions
* text animations
* visual transitions
* specialized animated components

Do not use animations everywhere.

---

## Aceternity UI

Use Aceternity UI selectively for:

* marketing landing page
* hero section
* onboarding
* spotlight effects
* grid backgrounds
* premium visual effects
* AI-focused visual moments

Do NOT use Aceternity effects throughout every dashboard screen.

---

# 5. DESIGN SYSTEM

Figma is the visual source of truth.

Before implementing pages:

1. Inspect Figma
2. Identify design tokens
3. Identify component inventory
4. Identify variants
5. Identify responsive states
6. Identify dark/light themes
7. Identify typography
8. Identify spacing
9. Identify shadows
10. Identify component states

Create a token system using CSS variables.

Example:

```text
--color-background
--color-surface
--color-surface-elevated
--color-text-primary
--color-text-secondary
--color-text-muted
--color-border
--color-primary
--color-success
--color-warning
--color-error
--color-info

--spacing-1
--spacing-2
--spacing-3
--spacing-4
--spacing-6
--spacing-8
--spacing-12

--radius-sm
--radius-md
--radius-lg
--radius-xl

--shadow-sm
--shadow-md
--shadow-lg
```

Use semantic tokens rather than raw values.

Do NOT hard-code random colors or spacing in components.

---

# 6. FIGMA → CODE MAPPING

Maintain direct mapping between Figma and React.

Examples:

Figma:
`Button`

Code:
`components/ui/button.tsx`

Figma:
`Incident Card`

Code:
`features/incidents/components/IncidentCard.tsx`

Figma:
`Trace Timeline`

Code:
`features/traces/components/TraceTimeline.tsx`

Figma:
`AI Analysis Panel`

Code:
`features/ai-analysis/components/AIAnalysisPanel.tsx`

Component variants in Figma should map to TypeScript props.

Example:

```tsx
<Button
  variant="primary"
  size="md"
  loading={false}
/>
```

---

# 7. PROJECT STRUCTURE

Use:

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   ├── layouts/
│   ├── config/
│   └── App.tsx
│
├── assets/
│
├── components/
│   ├── ui/
│   ├── motion/
│   ├── effects/
│   ├── charts/
│   └── data-display/
│
├── features/
│   ├── authentication/
│   ├── dashboard/
│   ├── incidents/
│   ├── api-debugger/
│   ├── traces/
│   ├── logs/
│   ├── metrics/
│   ├── services/
│   ├── deployments/
│   ├── ai-analysis/
│   ├── knowledge-base/
│   ├── integrations/
│   └── settings/
│
├── hooks/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── formatting/
│   ├── telemetry/
│   └── utils/
│
├── stores/
│
├── types/
│
└── styles/
    ├── globals.css
    ├── tokens.css
    └── themes.css
```

---

# 8. FEATURE ARCHITECTURE

Each feature must be self-contained.

Example:

```text
features/incidents/

├── api/
│   ├── incidentApi.ts
│   └── incidentQueries.ts
│
├── components/
│   ├── IncidentCard.tsx
│   ├── IncidentFilters.tsx
│   ├── IncidentTimeline.tsx
│   ├── IncidentSeverityBadge.tsx
│   └── IncidentStatusBadge.tsx
│
├── hooks/
│
├── schemas/
│   └── incidentSchema.ts
│
├── types/
│   └── incident.types.ts
│
└── pages/
    ├── IncidentsPage.tsx
    └── IncidentDetailsPage.tsx
```

Do not place all components in one global folder.

---

# 9. COMPONENT ARCHITECTURE

Use:

```text
Design Tokens
     ↓
shadcn primitives
     ↓
Shared UI components
     ↓
TraceMind domain components
     ↓
Feature components
     ↓
Pages
```

Component levels:

## Foundation

* typography
* colors
* spacing
* icons
* tokens

## Atoms

* Button
* Input
* Badge
* Avatar
* Icon
* Label
* Spinner
* Tooltip

## Molecules

* SearchBox
* FilterChip
* MetricValue
* StatusBadge
* DateRangePicker
* ServiceSelector

## Organisms

* IncidentCard
* TraceTimeline
* LogViewer
* MetricPanel
* AIAnalysisPanel
* ServiceHealthPanel

## Templates

* DashboardLayout
* IncidentLayout
* DebuggerLayout

## Pages

* DashboardPage
* IncidentsPage
* IncidentDetailsPage
* ApiDebuggerPage
* TraceExplorerPage
* LogExplorerPage
* MetricsPage
* ServicesPage
* DeploymentsPage
* AIAnalysisPage
* SettingsPage

---

# 10. REUSABILITY RULES

Create shared components when:

* used by multiple features
* part of the design system
* accessibility behavior should be standardized
* consistent behavior is required

Do not create abstractions prematurely.

Do not create huge components.

Avoid components with dozens of unrelated props.

Prefer composition.

---

# 11. ROUTING

Implement:

```text
/login

/dashboard

/incidents
/incidents/:incidentId

/debugger

/traces

/logs

/metrics

/services

/deployments

/ai

/knowledge-base

/integrations

/settings
```

Use protected routes for authenticated pages.

Use route-level lazy loading.

Do not load every feature on initial application load.

---

# 12. APPLICATION SHELL

Create a persistent application shell containing:

* sidebar
* top navigation
* project selector
* environment selector
* notifications
* user menu
* breadcrumbs
* command palette

Desktop:

```text
┌────────────┬──────────────────────────────┐
│            │ Header                       │
│  Sidebar   ├──────────────────────────────┤
│            │                              │
│            │ Main content                 │
│            │                              │
└────────────┴──────────────────────────────┘
```

Mobile should use:

* responsive navigation
* drawer/sheet sidebar
* compact header
* horizontally scrollable filters where appropriate

---

# 13. DASHBOARD

Implement:

* request count
* error rate
* P95 latency
* P99 latency
* active incidents
* service health
* recent deployments
* error trends
* latency trends
* top failing endpoints
* top failing services

Time filters:

* 15 minutes
* 1 hour
* 6 hours
* 24 hours
* 7 days

Every dashboard widget must support:

* loading
* empty
* error
* partial-data
* success

Use ECharts for visualization.

---

# 14. INCIDENT MANAGEMENT

Incident list:

* incident ID
* title
* severity
* status
* service
* environment
* endpoint
* created time
* updated time

Features:

* search
* filtering
* sorting
* pagination/infinite scrolling

Incident details:

* severity
* status
* affected service
* endpoint
* detection time
* timeline
* error rate
* latency
* traces
* logs
* metrics
* deployment correlation
* Git correlation
* AI root cause
* confidence
* evidence
* recommendations
* similar incidents

---

# 15. AI ROOT-CAUSE ANALYSIS

The AI interface must NOT look like a generic chatbot.

Primary UI:

```text
AI Root Cause

Root Cause
Database connection pool exhaustion

Confidence
91%

Evidence

✓ PostgreSQL latency increased
✓ Connection pool reached maximum
✓ Deployment occurred 8 minutes earlier

Affected Services

payment-service
order-service

Recommendations

Investigate long-running queries.
Review connection pool configuration.

[View Trace]
[View Logs]
[View Deployment]
```

Clearly distinguish:

* observed evidence
* AI inference
* recommendation
* human-approved action

Do not represent AI inference as guaranteed truth.

Provide optional:

`Ask TraceMind...`

as a secondary interface.

---

# 16. API DEBUGGER

This is a signature TraceMind feature.

Build:

```text
Method
URL
Headers
Query parameters
Request body
Response headers
Response body
Status
Latency
Trace ID
Request ID
```

Display execution timeline:

```text
API Gateway        12ms
Authentication     24ms
Payment Service    120ms
PostgreSQL         4.5s   CRITICAL
```

Allow navigation to:

* trace
* logs
* metrics
* deployment
* AI analysis
* Git diff

Use syntax highlighting for JSON.

Use Monaco or equivalent editor where appropriate.

Lazy-load heavy editor dependencies.

---

# 17. LOG EXPLORER

Support:

* full-text search
* service filtering
* log level
* timestamp
* trace ID
* request ID
* environment
* expandable entries
* stack traces
* JSON logs

Use virtualization.

Never render massive datasets directly into the DOM.

---

# 18. TRACE EXPLORER

Show:

* trace ID
* total duration
* services
* spans
* span duration
* errors
* database operations
* external requests

Use waterfall visualization.

Selecting a span should show:

* attributes
* events
* errors
* related logs
* service
* database information

---

# 19. METRICS

Implement visualizations for:

* request rate
* error rate
* latency
* CPU
* memory
* database connections
* Kafka lag
* Redis metrics

Use Apache ECharts.

Charts must have accessible textual context.

Never communicate important information using color alone.

---

# 20. SERVICES

Service overview:

* service name
* health
* version
* environment
* request rate
* error rate
* latency
* dependencies
* recent incidents
* recent deployments

Service detail should show dependency information.

---

# 21. DEPLOYMENTS

Display:

* deployment ID
* service
* version
* environment
* deployment status
* started time
* completed time
* author
* Git commit
* related incidents
* error-rate change
* latency change

Highlight deployments correlated with incidents.

---

# 22. INTEGRATIONS

TraceMind must eventually integrate with external applications through OpenTelemetry.

Create an integration onboarding interface.

Example:

```text
Connect Application

Application Name
[ payment-service ]

Language
[ Java ]

Environment
[ Production ]

Integration
[ OpenTelemetry ]

[ Generate Configuration ]
```

After connection:

```text
Application Connected

Services: 3
Traces: 1,284
Logs: 8,921
Errors: 34
```

The UI must support:

* integration status
* API key management
* environment
* OpenTelemetry configuration
* installation instructions
* connection verification

Never expose sensitive secrets unnecessarily.

---

# 23. STATE MANAGEMENT

Use TanStack Query for server state.

Examples:

* incidents
* logs
* traces
* metrics
* services
* deployments
* AI analysis
* projects
* integrations

Use Zustand for UI/client state.

Examples:

* theme
* sidebar state
* selected project
* selected environment
* command palette
* UI preferences
* debugger state

Do not duplicate server state into Zustand without a strong reason.

---

# 24. API LAYER

Never make direct API calls inside visual components.

Use:

```text
lib/api/

client.ts
incidents.ts
traces.ts
logs.ts
metrics.ts
services.ts
deployments.ts
ai.ts
integrations.ts
```

Create TanStack Query hooks above these APIs.

If an OpenAPI specification exists, generate TypeScript models from it.

Maintain strict API typing.

---

# 25. FORMS

Use:

* React Hook Form
* Zod

Forms requiring validation include:

* login
* project creation
* integration configuration
* API keys
* alert configuration
* settings

Validate on frontend and backend.

---

# 26. DARK/LIGHT THEMING

Support:

* light
* dark
* system

Dark mode is a first-class experience.

Use semantic tokens.

Do not simply invert colors.

Ensure charts, code blocks, tables, dialogs, and logs are designed for both themes.

---

# 27. RESPONSIVE DESIGN

Support:

* mobile
* tablet
* desktop
* wide desktop

Use Figma-defined breakpoints.

Design around content behavior rather than device names.

Large tables and log viewers need intentional responsive behavior.

---

# 28. ACCESSIBILITY

Minimum:

**WCAG 2.1 AA**

Requirements:

* keyboard navigation
* visible focus
* semantic HTML
* accessible labels
* accessible forms
* accessible dialogs
* accessible tables
* accessible menus
* accessible charts
* sufficient contrast
* reduced-motion support
* screen-reader support

Never communicate critical status through color alone.

Example:

Bad:

`🔴`

Better:

`🔴 Critical`

Respect:

`prefers-reduced-motion`.

---

# 29. ANIMATION RULES

TraceMind is a developer tool.

Animations must be subtle.

### Micro interaction

100–150ms

### UI transition

150–250ms

### Showcase

300–700ms

Use React Bits and Aceternity selectively.

Never animate large log datasets.

Never animate critical monitoring information excessively.

Never sacrifice performance for visual effects.

---

# 30. PERFORMANCE

Target:

* LCP < 2.5 seconds
* INP < 200ms
* CLS < 0.1

Use:

* route-level code splitting
* dynamic imports
* lazy loading
* virtualized lists
* optimized assets
* TanStack Query caching
* CDN caching
* memoization where justified
* efficient rendering
* lazy-loaded charts
* lazy-loaded editors

Target initial JavaScript around:

`≤ 200–250 KB gzip`

where practical.

Avoid unnecessary dependencies.

---

# 31. REAL-TIME DATA

Support WebSocket or SSE for:

* new incidents
* incident updates
* incident resolution
* deployment events
* AI analysis completion

Integrate events with TanStack Query invalidation/update patterns.

Do not create uncontrolled global event state.

---

# 32. TESTING

Use:

## Unit/component

Vitest + React Testing Library

Test:

* components
* hooks
* utilities
* formatters
* schemas
* state transitions

## Integration

Test:

* component + query
* API states
* loading
* error
* empty
* success

## E2E

Playwright.

Critical flows:

1. Login
2. Select project
3. Open dashboard
4. Open incidents
5. Open incident details
6. Inspect trace
7. Inspect logs
8. Open AI analysis
9. Open API debugger
10. Configure application integration

---

# 33. VISUAL REGRESSION

Use Playwright screenshots.

Compare implementation against approved Figma designs.

Test:

* desktop
* tablet
* mobile
* light mode
* dark mode

Important screens:

* Dashboard
* Incidents
* Incident Details
* API Debugger
* Trace Explorer
* Log Explorer
* AI Analysis
* Integration Setup

Any significant visual change should be reviewed.

---

# 34. STORYBOOK

Create Storybook stories for every important shared component.

Example:

```text
Button
├── Primary
├── Secondary
├── Destructive
├── Loading
├── Disabled
└── With Icon

Badge
├── Success
├── Warning
├── Error
├── Info
└── Neutral

Card
├── Default
├── Interactive
├── Loading
└── Error
```

Include dark-mode stories where applicable.

Storybook should act as the living component documentation.

---

# 35. CODE QUALITY

Configure:

* ESLint
* Prettier
* strict TypeScript
* Husky
* lint-staged

Pre-commit:

```text
lint
format check
type check
```

CI:

```text
lint
type check
unit tests
build
E2E
visual regression
```

---

# 36. SECURITY

Never expose:

* database credentials
* private backend secrets
* JWT signing secrets
* private API keys

Only public frontend configuration may be exposed through Vite environment variables.

Implement:

* authenticated routes
* permission-aware UI
* safe rendering
* sensitive data masking
* XSS-safe rendering

Logs may contain secrets, so the UI must support masking/redaction.

Examples:

```text
password=******
token=******
authorization=******
```

---

# 37. ERROR STATES

Every API-driven screen must support:

* loading
* success
* empty
* error
* unauthorized
* forbidden
* network failure
* partial data

Provide recovery actions.

Avoid generic error messages when actionable information is available.

---

# 38. DOCUMENTATION

Create:

```text
docs/

architecture/
design-system/
development/
testing/
decisions/
```

Create ADRs for major decisions.

README must explain:

* prerequisites
* installation
* environment configuration
* development commands
* Storybook
* tests
* production build
* deployment
* architecture
* contribution guidelines

---

# 39. CI/CD

Use GitHub Actions.

Pull request:

```text
Install
 ↓
Lint
 ↓
Type Check
 ↓
Unit Tests
 ↓
Build
 ↓
E2E
 ↓
Visual Regression
 ↓
Preview Deployment
```

Main branch:

```text
Build
 ↓
Smoke Tests
 ↓
Production Deployment
 ↓
Post-deployment Verification
```

Use Vercel for frontend deployment unless project infrastructure requires another platform.

Every PR should receive a preview deployment.

---

# 40. FIGMA HANDOFF REQUIREMENTS

Before implementing a page:

1. Inspect the corresponding Figma page.
2. Identify reusable components.
3. Identify component variants.
4. Identify spacing.
5. Identify typography.
6. Identify colors.
7. Identify responsive behavior.
8. Identify loading states.
9. Identify empty states.
10. Identify error states.
11. Identify dark mode.
12. Identify interactions.

Do not invent visual patterns when the Figma specification exists.

If Figma does not define a required state, create a consistent state using the existing TraceMind design system.

---

# 41. IMPLEMENTATION ORDER

Implement in this order.

## Phase 1 — Foundation

* Vite
* React
* TypeScript
* Tailwind
* shadcn
* tokens
* themes
* ESLint
* Prettier
* Storybook

## Phase 2 — Application shell

* sidebar
* header
* project selector
* environment selector
* command palette
* notifications
* user menu

## Phase 3 — Dashboard

* metrics
* charts
* health
* incidents
* deployments

## Phase 4 — Incidents

* incident list
* filters
* details
* timeline
* evidence

## Phase 5 — Observability

* logs
* traces
* metrics
* services

## Phase 6 — API Debugger

* request editor
* response
* timeline
* trace correlation
* log correlation

## Phase 7 — AI

* root-cause analysis
* confidence
* evidence
* recommendations
* similar incidents

## Phase 8 — Integrations

* application connection
* OpenTelemetry setup
* API keys
* connection verification

## Phase 9 — Production hardening

* accessibility
* performance
* visual regression
* E2E
* error monitoring
* CI/CD
* documentation

---

# 42. DEFINITION OF DONE

A feature is NOT complete simply because it renders.

A feature is complete only when:

* Figma design is implemented
* responsive behavior works
* dark mode works
* loading state exists
* empty state exists
* error state exists
* accessibility is implemented
* TypeScript passes
* lint passes
* tests exist
* Storybook exists for reusable components
* visual regression passes
* performance is acceptable
* API integration is typed
* documentation is updated

---

# 43. IMPORTANT DEVELOPMENT RULES

Do not:

* create giant components
* use arbitrary colors
* use arbitrary spacing
* duplicate UI components
* put server state in Zustand unnecessarily
* make API calls directly from visual components
* load heavy libraries globally
* use animations excessively
* ignore mobile
* ignore dark mode
* ignore accessibility
* use `any` unnecessarily
* expose secrets
* create fake production architecture

Do:

* reuse shadcn components
* customize shadcn to match Figma
* use React Bits selectively
* use Aceternity selectively
* create TraceMind-specific domain components
* use semantic design tokens
* use feature-based architecture
* use TanStack Query for server state
* use Zustand for UI state
* lazy-load heavy features
* virtualize large datasets
* test critical flows
* document architectural decisions

---

# 44. VISUAL QUALITY BAR

The final UI should feel like a serious developer platform.

Target characteristics:

* sophisticated dark mode
* strong typography
* clean spacing
* high information density
* clear severity hierarchy
* excellent tables
* readable logs
* technically meaningful charts
* polished AI presentation
* subtle animations
* excellent empty states
* excellent loading states
* excellent error states
* consistent interaction patterns

The application should feel cohesive even though shadcn, React Bits, and Aceternity UI are being used.

The user should NOT feel like multiple UI libraries were combined.

---

# 45. FINAL ARCHITECTURAL PRINCIPLE

Use this hierarchy:

```text
                 FIGMA
                   ↓
            Design Tokens
                   ↓
             Tailwind CSS
                   ↓
              shadcn/ui
                   ↓
        TraceMind UI Components
                   ↓
       Feature Components
                   ↓
                 Pages
                   ↓
          TanStack Query
                   ↓
              API Layer
                   ↓
          TraceMind Backend
```

Use:

```text
shadcn/ui       → production UI foundation
React Bits      → subtle animation/micro-interaction
Aceternity UI   → premium visual effects
Tailwind        → styling
CSS Variables   → design tokens
ECharts         → observability visualization
TanStack Query  → server state
Zustand         → client/UI state
Playwright      → E2E + visual regression
Storybook       → component documentation
```

Build the system incrementally.

Keep every milestone runnable.

Do not implement the entire application as one giant change.

Start with the foundation and application shell, verify it against Figma, then progressively implement each feature.

The final result must be production-ready, maintainable, accessible, responsive, performant, and visually consistent with the approved TraceMind Figma design system.
