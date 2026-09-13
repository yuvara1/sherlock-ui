# MASTER PROMPT — ELORA FRONTEND

You are a senior frontend architect and product designer specializing in modern developer infrastructure, observability, SaaS dashboards, and complex data visualization.

Build the complete production-grade frontend for:

# ELORA

### AI-Powered Distributed Application Debugging & Observability Platform

Elora helps developers understand why their applications fail by collecting logs, errors, API events, and distributed traces, correlating them across microservices, detecting incidents, identifying probable root causes, and providing optional AI-generated explanations.

The frontend must feel like a serious developer infrastructure product comparable in quality and usability to modern observability/developer platforms.

Do NOT create a generic CRUD admin dashboard.

The UI must be:

* Modern
* Premium
* Developer-focused
* Data-dense but readable
* Fast
* Responsive
* Accessible
* Production-ready
* Dark-mode first
* Designed for desktop development workflows
* Responsive on tablets/mobile
* Consistent across the entire application

---

# 1. TECHNOLOGY STACK

Use:

* React
* TypeScript
* Vite
* React Router
* Tailwind CSS
* shadcn/ui
* Aceternity UI
* React Bits
* TanStack Query
* Zustand
* React Hook Form
* Zod
* Axios
* Recharts
* Lucide React
* date-fns

Use modern React patterns.

Avoid unnecessary dependencies.

Use TypeScript strictly.

Do not use `any` unless absolutely unavoidable.

---

# 2. DESIGN DIRECTION

Elora should have a visual identity inspired by modern developer tools and observability platforms.

Design references in terms of UX quality:

* Linear
* Vercel
* Grafana
* Datadog
* Sentry
* GitHub
* Raycast

Do NOT copy their designs.

Create an original Elora identity.

The design should communicate:

"professional developer infrastructure"

rather than:

"AI chatbot."

---

# 3. COLOR SYSTEM

Primary theme:

Dark-first.

Use:

* near-black background
* dark elevated surfaces
* subtle borders
* neutral text
* strong semantic status colors
* restrained accent color

Use semantic colors:

SUCCESS → green

WARNING → yellow/orange

ERROR → red

INFO → blue

CRITICAL → red

Avoid excessive gradients.

Avoid making every component colorful.

Use color primarily to communicate state.

---

# 4. TYPOGRAPHY

Use a modern developer-friendly font.

Prefer:

Inter

or

Geist

For code/log content use:

JetBrains Mono

or

Fira Code

Typography hierarchy:

Large:

Page titles

Medium:

Section headings

Small:

Metadata

Monospace:

Logs

Stack traces

Trace IDs

Request IDs

API responses

Code snippets

---

# 5. GLOBAL APPLICATION STRUCTURE

Create:

/login

/register

/forgot-password

/app

/app/dashboard

/app/projects

/app/projects/:projectId

/app/projects/:projectId/overview

/app/projects/:projectId/logs

/app/projects/:projectId/errors

/app/projects/:projectId/traces

/app/projects/:projectId/incidents

/app/projects/:projectId/services

/app/projects/:projectId/dependencies

/app/projects/:projectId/apis

/app/projects/:projectId/ai

/app/projects/:projectId/settings

/app/settings/profile

/app/settings/organization

/app/settings/api-keys

/app/settings/notifications

---

# 6. LANDING PAGE

Create a professional public landing page.

Route:

/

Sections:

1. Navbar
2. Hero
3. Product preview
4. Problem statement
5. How Elora works
6. Core capabilities
7. Architecture visualization
8. Developer workflow
9. AI explanation example
10. Metrics/observability section
11. Security section
12. CTA
13. Footer

Hero:

ELORA

"Understand why your systems fail."

Supporting text:

"Elora correlates logs, traces, errors, APIs, and service dependencies to help developers identify probable root causes faster."

Buttons:

"Get Started"

"View Demo"

Use subtle Aceternity UI animations.

Do NOT overuse animations.

---

# 7. AUTHENTICATION UI

Create:

Login

Register

Forgot Password

Reset Password

Authentication states.

Login:

Email

Password

Remember me

Forgot password

Login button

GitHub/Google OAuth placeholders if backend support is added later.

Registration:

Name

Email

Password

Confirm Password

Organization name

Use React Hook Form + Zod.

Display proper validation messages.

---

# 8. APPLICATION SHELL

After authentication:

Desktop layout:

┌────────────────────────────────────────────────────┐
│ Topbar                                             │
├───────────────┬────────────────────────────────────┤
│ Sidebar       │                                    │
│               │        Main Content                │
│ Elora         │                                    │
│               │                                    │
│ Overview      │                                    │
│ Logs          │                                    │
│ Errors        │                                    │
│ Traces        │                                    │
│ Incidents     │                                    │
│ Services      │                                    │
│ Dependencies  │                                    │
│ APIs          │                                    │
│ AI Debugger   │                                    │
│               │                                    │
│ Settings      │                                    │
└───────────────┴────────────────────────────────────┘

Sidebar:

Elora logo

Project selector

Environment selector

Overview

Logs

Errors

Traces

Incidents

Services

Dependencies

APIs

AI Debugger

Settings

User profile

---

# 9. TOP BAR

Include:

Project selector

Environment selector:

Development

Staging

Production

Global search

Time range selector

Notifications

Help

User menu

Example:

[Payment Platform ▼] [Production ▼]

[Search logs, traces, errors...]

[Last 1 hour ▼]

[🔔]

[User ▼]

---

# 10. DASHBOARD

Route:

/app/projects/:projectId/overview

Create a professional observability dashboard.

Top metrics:

Total Requests

Error Rate

P95 Latency

P99 Latency

Active Incidents

Services Down

Example:

Requests

1.24M

+12.4%

Error Rate

1.82%

-0.42%

P95 Latency

342ms

+8%

Active Incidents

3

+1

Use charts.

Charts:

Request volume

Error rate

Latency

Service health

Errors over time

Use Recharts.

Provide:

1h

6h

24h

7d

30d

filters.

---

# 11. SERVICE HEALTH

Create service cards:

Payment Service

● Healthy

Requests:

421K

Error rate:

0.42%

P95:

210ms

Inventory Service

● Degraded

Requests:

389K

Error rate:

4.82%

P95:

780ms

Order Service

● Critical

Error rate:

12.4%

P95:

2.1s

Clicking a service opens its details page.

---

# 12. LOG EXPLORER

Route:

/logs

This is one of the most important screens.

Create a powerful log explorer.

Layout:

┌──────────────────────────────────────────────┐
│ Search logs                                  │
├──────────────────────────────────────────────┤
│ Filters                                      │
│ Service | Environment | Level | Time         │
├──────────────────────────────────────────────┤
│ Timestamp | Level | Service | Message        │
│                                              │
│ 10:32:21  ERROR payment   DB timeout         │
│ 10:32:22  ERROR payment   Connection failed  │
│ 10:32:23  WARN  order     Payment timeout    │
└──────────────────────────────────────────────┘

Features:

* Search
* Filtering
* Sorting
* Pagination
* Infinite scroll option
* Time range
* Service filtering
* Environment filtering
* Severity filtering
* Trace ID search
* Request ID search

Click a log to open a detail drawer.

---

# 13. LOG DETAIL

Display:

Timestamp

Severity

Service

Environment

Host

Trace ID

Span ID

Request ID

Message

Metadata

Stack trace

Related logs

Related trace

Related incident

Actions:

Copy

Open Trace

Open Incident

Create Incident

Ask Elora AI

Use a monospace code viewer.

---

# 14. ERROR GROUPS

Route:

/errors

Display grouped errors rather than individual events.

Example:

NullPointerException

12,843 occurrences

Payment Service

First seen:

10:31

Last seen:

10:42

Severity:

CRITICAL

Fingerprint:

a82f...

Click to open error details.

---

# 15. ERROR DETAIL

Show:

Error type

Message

Occurrences

First seen

Last seen

Affected services

Fingerprint

Stack trace

Error trend

Related traces

Related incident

Root cause

AI explanation

Example:

┌─────────────────────────────────────┐
│ NullPointerException                │
│                                     │
│ 12,843 occurrences                  │
│                                     │
│ Payment Service                     │
│                                     │
│ Root Cause                          │
│ Database connection failure         │
│                                     │
│ Confidence                          │
│ ████████████████░░ 91%              │
└─────────────────────────────────────┘

---

# 16. TRACE VIEWER

Route:

/traces

This is a core feature.

Create a distributed trace viewer similar conceptually to professional tracing tools.

Example:

TRACE abc123

Total Duration: 1.42s

Gateway

████████████████████████ 1.42s

Order Service

██████████████████ 1.20s

Payment Service

██████████ 800ms

Inventory Service

██████ 500ms

PostgreSQL

████ 300ms

Represent spans visually on a timeline.

Click a span to open details.

Show:

Service

Operation

Duration

Status

HTTP method

URL

Status code

Trace ID

Span ID

Parent span

Attributes

Events

Logs

Errors

---

# 17. SERVICE DEPENDENCY GRAPH

Route:

/dependencies

Create an interactive graph.

Example:

Gateway

↓

Order

↙     ↘

Payment   Inventory

↘     ↙

PostgreSQL

Nodes should show:

Service name

Health

Error rate

Latency

Edges should show:

Request count

Error count

Latency

Use a suitable React graph visualization library if needed.

Allow:

Zoom

Pan

Click node

Highlight dependencies

Filter by environment

Filter by time

---

# 18. INCIDENT MANAGEMENT

Route:

/incidents

Create incident list.

Columns:

Incident

Severity

Status

Affected Services

Started

Duration

Confidence

Example:

CRITICAL

Database Connection Exhaustion

Affected:

Payment

Inventory

Order

Status:

INVESTIGATING

---

# 19. INCIDENT DETAIL

Create a rich incident investigation page.

Header:

INC-10231

Database Connection Exhaustion

CRITICAL

Status:

INVESTIGATING

Sections:

Overview

Timeline

Affected Services

Error Groups

Trace Samples

Root Cause

Evidence

AI Analysis

Recommended Actions

Related Incidents

Activity

---

# 20. INCIDENT TIMELINE

Visualize:

10:30:01

PostgreSQL failure

↓

10:30:02

Inventory errors increase

↓

10:30:03

Payment failures increase

↓

10:30:04

Order failures increase

↓

10:30:05

Gateway 500 errors increase

Make the timeline visually clear.

---

# 21. ROOT CAUSE UI

Create a prominent root-cause section.

Example:

┌──────────────────────────────────────────┐
│ PROBABLE ROOT CAUSE                     │
│                                          │
│ PostgreSQL connection pool exhaustion    │
│                                          │
│ Confidence                               │
│ 91%                                      │
│                                          │
│ Evidence                                 │
│ ✓ DB connection errors appeared first   │
│ ✓ Inventory latency increased            │
│ ✓ Payment failures followed              │
│ ✓ Gateway failures followed downstream   │
└──────────────────────────────────────────┘

Clearly label:

"Probable"

rather than:

"Guaranteed"

---

# 22. AI DEBUGGER PAGE

Route:

/ai

Create a dedicated AI debugging experience.

Header:

"Elora AI"

Subtitle:

"Understand what happened."

Allow the developer to ask:

"What caused this incident?"

"Why is Payment Service failing?"

"Explain this stack trace."

"What changed before the incident?"

"Which service is the likely root cause?"

Display:

Context

Evidence

AI Analysis

Recommended Actions

Important:

AI answers must visually distinguish:

Evidence

Deterministic Analysis

AI Interpretation

Never make AI output look like absolute truth.

---

# 23. AI CHAT UI

Create a developer-focused chat interface.

Example:

Developer:

Why is the payment API failing?

Elora:

The Payment Service is experiencing database connection timeouts.

Evidence:

• 8,423 database errors
• P95 latency increased from 220ms to 1.8s
• Inventory Service began failing first
• Payment errors started 2 seconds later

Likely root cause:

PostgreSQL connection pool exhaustion.

Confidence:

91%

Recommended investigation:

1. Check HikariCP connection pool usage.
2. Inspect long-running queries.
3. Check PostgreSQL max_connections.

Use code blocks for technical output.

---

# 24. API DEBUGGER

Create:

/apis

Display APIs discovered from telemetry.

Example:

POST /api/orders

Requests:

124K

Error rate:

3.2%

P95:

450ms

Status:

DEGRADED

Click API.

Show:

Request volume

Response codes

Latency

Error rate

Recent failures

Request samples

Response samples

Trace samples

Dependencies

---

# 25. API DETAIL

Example:

POST /api/orders

Tabs:

Overview

Requests

Errors

Latency

Traces

Dependencies

Show:

HTTP status distribution

200

400

401

404

500

Latency chart

Error chart

Recent requests

Example request:

POST /api/orders

Headers

Body

Example response:

500

{
"error": "DATABASE_TIMEOUT"
}

---

# 26. PROJECT MANAGEMENT

Create project list:

Project name

Environment

Applications

Status

Last event

Created

Allow:

Create project

Edit project

Delete project

Create API key

Revoke API key

---

# 27. API KEY MANAGEMENT

Create secure UI.

Display:

Key name

Prefix

Created

Last used

Status

Never display full keys after creation.

Creation flow:

Generate API Key

↓

Show full key ONCE

↓

"Copy API Key"

↓

"Store this securely. You won't be able to view it again."

---

# 28. SETTINGS

Create:

Profile

Organization

Members

Roles

API Keys

Notifications

Integrations

Environments

Danger Zone

---

# 29. NOTIFICATION SETTINGS

Allow:

Email

Webhook

Slack

Configure:

Incident created

Critical incident

Root cause detected

Incident resolved

AI analysis completed

Severity threshold

---

# 30. EMPTY STATES

Every page needs a proper empty state.

Example:

No incidents yet.

"Elora hasn't detected any incidents in this project."

Button:

"Send Test Event"

Do NOT leave blank white/black areas.

---

# 31. LOADING STATES

Use skeleton loaders.

Do not show loading text everywhere.

Examples:

Dashboard skeleton

Table skeleton

Trace skeleton

Incident skeleton

Graph skeleton

---

# 32. ERROR STATES

Create reusable error components.

Example:

"Unable to load incidents."

Buttons:

Retry

View Logs

Show technical details

---

# 33. REAL-TIME UPDATES

Design the frontend for future WebSocket/SSE support.

Use:

Server-Sent Events

or

WebSocket

for:

New incidents

New critical errors

Service status changes

Live logs

Do not implement polling everywhere.

Create an abstraction:

useRealtimeEvents()

so transport can be changed later.

---

# 34. STATE MANAGEMENT

Use:

TanStack Query

for server state.

Use Zustand

for client/global UI state.

Do NOT put all API data into Zustand.

TanStack Query handles:

Caching

Refetching

Pagination

Mutation

Loading

Error

Invalidation

Zustand handles:

Sidebar state

Theme

Selected project

Selected environment

UI preferences

---

# 35. API CLIENT ARCHITECTURE

Create:

src/api/

```
client.ts

auth.ts

projects.ts

logs.ts

errors.ts

traces.ts

incidents.ts

services.ts

dependencies.ts

ai.ts

notifications.ts

users.ts
```

Use Axios.

Create Axios interceptors for:

JWT

Refresh token

Correlation ID

Global 401 handling

Do not place API calls directly inside UI components.

---

# 36. TYPES

Create strongly typed interfaces.

Example:

type Severity =
| "INFO"
| "LOW"
| "MEDIUM"
| "HIGH"
| "CRITICAL";

type IncidentStatus =
| "DETECTED"
| "INVESTIGATING"
| "IDENTIFIED"
| "MITIGATING"
| "RESOLVED"
| "CLOSED";

Create types matching backend API contracts.

---

# 37. COMPONENT ARCHITECTURE

Create reusable components:

components/

```
layout/

navigation/

charts/

logs/

traces/

incidents/

services/

dependencies/

ai/

api/

common/

forms/

tables/

dialogs/

drawers/
```

Examples:

LogRow

LogDetailDrawer

TraceTimeline

TraceSpan

IncidentCard

IncidentTimeline

RootCauseCard

ServiceHealthCard

DependencyGraph

AIMessage

SeverityBadge

StatusBadge

MetricCard

TimeRangeSelector

ProjectSelector

EnvironmentSelector

---

# 38. DESIGN SYSTEM

Build reusable design tokens.

Define:

spacing

radius

typography

shadows

colors

borders

transitions

Use shadcn/ui components consistently.

Customize them for Elora.

Do not leave the default shadcn appearance untouched.

---

# 39. ACETERNITY UI

Use Aceternity UI selectively for:

Landing page

Hero

Background effects

Subtle animations

Feature sections

Do NOT use flashy animations inside the core observability dashboard.

The dashboard must prioritize performance and readability.

---

# 40. REACT BITS

Use React Bits selectively for:

Animated hero elements

Subtle dashboard interactions

Command palette

Micro-interactions

Loading/visual effects

Avoid unnecessary animation.

---

# 41. COMMAND PALETTE

Implement:

Ctrl + K

Search:

Projects

Services

Logs

Errors

Incidents

Traces

APIs

Settings

Example:

> Search "payment timeout"

Results:

Payment Service

Error Group #10231

Incident #182

Trace abc123

---

# 42. GLOBAL SEARCH

Support:

service name

trace ID

request ID

error fingerprint

incident ID

API endpoint

log message

Search results should navigate directly to the appropriate page.

---

# 43. RESPONSIVE DESIGN

Desktop is the primary target.

Mobile should still work.

Mobile:

Sidebar becomes drawer.

Tables become cards where necessary.

Trace timeline becomes horizontally scrollable.

Dependency graph remains zoomable.

---

# 44. ACCESSIBILITY

Implement:

Keyboard navigation

ARIA labels

Focus states

Accessible dialogs

Accessible dropdowns

Color-independent status indicators

Readable contrast

---

# 45. PERFORMANCE

Optimize for large telemetry datasets.

Do NOT render 100,000 log rows simultaneously.

Use:

Virtualized lists

Pagination

Infinite scrolling

Debounced search

Memoization where appropriate

Lazy loading

Code splitting

Route-level lazy imports

Charts should avoid unnecessary re-rendering.

---

# 46. SECURITY

Never store:

Passwords

API keys

Secrets

Sensitive telemetry

in localStorage unless absolutely necessary.

Prefer secure authentication architecture.

Never expose:

GEMINI_API_KEY

GROQ_API_KEY

database credentials

backend secrets

to the frontend.

The frontend communicates with the backend.

The backend communicates with LLM providers.

Architecture:

Frontend

↓

Elora Backend

↓

Gemini/Groq

NEVER:

Frontend

↓

Gemini API directly

---

# 47. MOCK DATA

Initially, the backend may not exist.

Create a mock API layer.

Use realistic mock data for:

* logs
* errors
* traces
* incidents
* services
* dependencies
* metrics
* AI responses

But structure the code so mock APIs can later be replaced by real APIs without changing components.

Create:

src/mocks/

Do not mix mock data directly into components.

---

# 48. BACKEND INTEGRATION

Create environment configuration:

VITE_API_BASE_URL=

Example:

VITE_API_BASE_URL=http://localhost:8080

All API requests must use this.

Never hardcode:

localhost

production URLs

API keys

secrets

---

# 49. ERROR BOUNDARIES

Implement React Error Boundaries.

If one dashboard widget crashes, don't crash the entire application.

Show:

"Something went wrong loading this widget."

with:

Retry

---

# 50. ROUTING PROTECTION

Implement:

Public routes

Protected routes

Organization-aware routes

Project-aware routes

Unauthorized page:

/403

Not found:

/404

---

# 51. TOAST SYSTEM

Use consistent notifications.

Success:

"API key created."

Error:

"Unable to load incidents."

Warning:

"AI analysis unavailable."

Info:

"Live event stream connected."

---

# 52. DARK MODE

Dark mode must be the primary design.

Also implement light mode.

Persist preference.

Use semantic design tokens rather than hardcoded colors throughout components.

---

# 53. PROJECT SELECTOR

The user may have:

Organization A

Projects:

Payment API

Inventory API

Analytics API

The project selector should be globally available.

Changing project should update:

Dashboard

Logs

Errors

Traces

Incidents

Services

Dependencies

APIs

AI context

---

# 54. ENVIRONMENT SELECTOR

Support:

Development

Staging

Production

Changing environment updates all relevant queries.

Make Production visually distinct but subtle.

---

# 55. DATA VISUALIZATION

Create charts for:

Requests

Errors

Latency

Throughput

Status codes

Service health

Incident frequency

Error groups

Use:

Recharts

Charts must include:

Tooltips

Legends

Empty states

Loading states

Time range selection

Responsive behavior

---

# 56. DEMO MODE

Create:

/demo

Provide a realistic demonstration without backend.

Demo scenario:

Payment platform experiences database failure.

Show:

Gateway

↓

Order Service

↓

Payment Service

↓

Inventory Service

↓

PostgreSQL

Then simulate:

PostgreSQL failure

Elora detects:

Database errors

↓

Inventory errors

↓

Payment errors

↓

Order errors

↓

Gateway errors

Dashboard automatically updates.

This should make the project impressive when demonstrated.

---

# 57. LANDING PAGE DEMO

The landing page should contain an animated but lightweight visualization:

Request

↓

Gateway

↓

Order

↓

Payment

↓

Inventory

↓

Database

Then show a failure propagating backward.

Use this to visually explain Elora's core value.

---

# 58. FRONTEND FOLDER STRUCTURE

Use:

src/

```
app/

assets/

components/

    ui/

    layout/

    navigation/

    dashboard/

    logs/

    errors/

    traces/

    incidents/

    services/

    dependencies/

    apis/

    ai/

    settings/

pages/

    landing/

    auth/

    dashboard/

    logs/

    errors/

    traces/

    incidents/

    services/

    dependencies/

    apis/

    ai/

    settings/

api/

hooks/

stores/

types/

schemas/

utils/

lib/

mocks/

routes/

constants/

styles/
```

---

# 59. CODE QUALITY

Use:

* Clean component architecture
* Reusable components
* TypeScript strict mode
* No unnecessary duplication
* No giant components
* No API logic inside components
* No business logic inside JSX
* Proper error handling
* Proper loading states
* Proper empty states
* Proper accessibility

Use composition instead of deeply nested conditional components.

---

# 60. TESTING

Use:

Vitest

React Testing Library

Test:

* Login form
* Registration
* Project creation
* Log search
* Log filtering
* Incident rendering
* Root cause display
* API key creation
* Protected routes
* Permission handling
* Loading states
* Error states

---

# 61. BUILD QUALITY

The application must work with:

npm install

npm run dev

npm run build

npm run test

npm run lint

No TypeScript errors.

No ESLint errors.

No broken routes.

No missing imports.

No fake dependencies.

---

# 62. PRODUCTION BUILD

Configure:

Vite production build

Environment variables

Asset optimization

Code splitting

Lazy routes

Error handling

Security-conscious headers where applicable

---

# 63. DOCKER

Create:

Dockerfile

nginx.conf

docker-compose integration

Use multi-stage Docker build.

Example:

Node build stage

↓

Nginx production stage

The frontend must be deployable as a static application.

---

# 64. DEPLOYMENT

Prepare for:

Vercel

or

Cloudflare Pages

or

Netlify

The frontend should communicate with the deployed Elora backend using:

VITE_API_BASE_URL

Do not hardcode deployment URLs.

---

# 65. IMPORTANT API CONTRACT

Assume the backend exposes:

POST /api/v1/auth/login

POST /api/v1/auth/register

GET /api/v1/projects

GET /api/v1/projects/{id}

GET /api/v1/logs

GET /api/v1/errors

GET /api/v1/traces/{traceId}

GET /api/v1/incidents

GET /api/v1/incidents/{id}

GET /api/v1/services

GET /api/v1/dependencies

GET /api/v1/apis

POST /api/v1/ai/analyze

GET /api/v1/metrics

GET /api/v1/notifications

GET /api/v1/users/me

Adapt API clients to these contracts.

Keep API client functions centralized so endpoint changes are easy.

---

# 66. REALISTIC MOCK DATA

Generate realistic telemetry.

Example:

Project:

Elora Payments

Services:

api-gateway

order-service

payment-service

inventory-service

notification-service

postgresql

Redis

Kafka

Example incident:

INC-10231

Title:

PostgreSQL Connection Pool Exhaustion

Severity:

CRITICAL

Affected:

payment-service

inventory-service

order-service

gateway

Confidence:

0.91

Do not use meaningless random lorem ipsum data.

---

# 67. UX PRINCIPLES

Follow these principles:

1. Developers should understand system health within 5 seconds.

2. Every incident should answer:

"What happened?"

"When did it start?"

"What services are affected?"

"Where did it start?"

"Why do we think that?"

"What should I investigate?"

3. Every error should be traceable to:

Log

Trace

Service

Incident

Root cause

4. AI should enhance understanding, not hide evidence.

5. Important information should require minimal clicks.

---

# 68. FINAL DELIVERABLE

Generate a complete frontend repository.

It must contain:

* package.json
* Vite configuration
* TypeScript configuration
* Tailwind configuration
* shadcn configuration
* routing
* pages
* components
* API layer
* state management
* mock API layer
* validation
* charts
* trace visualization
* dependency graph
* incident management
* AI debugger
* authentication
* project management
* settings
* tests
* Dockerfile
* nginx configuration
* README
* environment example

---

# 69. DEVELOPMENT PROCESS

Do NOT generate the entire frontend in one massive response.

Build it in phases.

PHASE 1

Project setup

Design system

Routing

Application shell

Authentication pages

Landing page

Mock data architecture

PHASE 2

Dashboard

Project selector

Environment selector

Metrics

Charts

Service health

PHASE 3

Logs

Error groups

Log detail

Error detail

Search/filtering

PHASE 4

Trace viewer

Service dependencies

Dependency graph

PHASE 5

Incidents

Incident detail

Timeline

Root cause UI

PHASE 6

API explorer

API detail

Request/response inspection

PHASE 7

Elora AI

AI debugger

AI chat

AI explanation

PHASE 8

Settings

Organizations

Members

API keys

Notifications

Integrations

PHASE 9

Realtime events

SSE/WebSocket abstraction

Live incident updates

Live logs

PHASE 10

Testing

Performance

Accessibility

Error boundaries

Final UX polish

PHASE 11

Docker

Production build

Deployment configuration

README

---

# 70. STRICT GENERATION RULE

For every phase:

1. Explain what is being built.
2. Show the folder structure.
3. Generate complete files.
4. Never omit important code.
5. Never use pseudo-code.
6. Never use TODOs for required functionality.
7. Never say "implement this later."
8. Include all imports.
9. Ensure TypeScript compiles.
10. Ensure components actually connect together.
11. Use mock APIs where backend functionality isn't available.
12. Keep the architecture compatible with the Elora Spring Boot backend.
13. Do not randomly rename existing API contracts.
14. Do not introduce unnecessary dependencies.
15. Provide exact commands to run.
16. Provide expected result.
17. Fix compilation inconsistencies before moving forward.

At the end of each phase:

RUN:

npm install

npm run dev

npm run build

npm run test

npm run lint

Then STOP.

Wait for:

CONTINUE

before starting the next phase.

---

# 71. MOST IMPORTANT REQUIREMENT

This is NOT a generic AI dashboard.

Elora is a:

"Developer Observability + Distributed Debugging Platform"

The UI should make these concepts visually obvious:

Logs

↓

Errors

↓

Traces

↓

Services

↓

Dependencies

↓

Incidents

↓

Root Cause

↓

AI Explanation

The product should feel like something a professional engineering team could actually use.

Start with PHASE 1 only.

Do NOT generate PHASE 2 until I explicitly say:

CONTINUE.
