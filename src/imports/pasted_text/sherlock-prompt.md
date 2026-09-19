# SHERLOCK — COMPLETE FRONTEND IMPLEMENTATION PROMPT

You are a senior frontend architect, product designer and production React/Next.js engineer.

Your task is to build the **complete production-ready frontend** for a product called:

# Sherlock

**AI-Powered API Debugging & Distributed Systems Observability Platform**

Do NOT build only a visual prototype.

Build a **fully functional frontend application** where every screen, button, form, filter, table, modal, drawer, tab, search, navigation flow, state change, validation, mock API interaction and user workflow works.

The backend does not exist yet.

Therefore, create a clean **mock API/data layer** that behaves like a real backend.

Later, I will replace the mock API implementations with Java Spring Boot APIs without changing the UI architecture.

---

# 1. PRIMARY PRODUCT PURPOSE

Sherlock helps developers investigate:

> "Why did this API request fail?"

Sherlock correlates:

```text
API Requests
      ↓
Distributed Traces
      ↓
Services
      ↓
Logs
      ↓
Metrics
      ↓
Dependencies
      ↓
Deployments
      ↓
Incidents
      ↓
Evidence
      ↓
Root Cause Analysis
      ↓
AI Investigation
```

The frontend must make this investigation process understandable.

The application should feel like a serious developer platform similar in quality to modern observability/developer tools.

Do NOT create a generic admin dashboard.

Do NOT create a simple CRUD application.

Do NOT create only static Figma-like screens.

---

# 2. TECHNOLOGY STACK

Use:

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Radix UI
Lucide React
TanStack Query
Zustand
React Hook Form
Zod
Recharts
React Flow
Monaco Editor or CodeMirror
date-fns
```

Use the current stable versions compatible with each other.

Use strict TypeScript.

Avoid `any` unless absolutely unavoidable.

---

# 3. APPLICATION ARCHITECTURE

Use a scalable feature-based architecture.

Recommended structure:

```text
src/
│
├── app/
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   ├── dashboard/
│   ├── projects/
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── charts/
│   ├── tables/
│   ├── forms/
│   ├── modals/
│   └── common/
│
├── features/
│   ├── auth/
│   ├── organizations/
│   ├── workspaces/
│   ├── projects/
│   ├── services/
│   ├── api-debugger/
│   ├── traces/
│   ├── logs/
│   ├── metrics/
│   ├── incidents/
│   ├── deployments/
│   ├── integrations/
│   ├── alerts/
│   ├── ai-investigation/
│   └── settings/
│
├── lib/
│   ├── api/
│   ├── mock-api/
│   ├── auth/
│   ├── permissions/
│   ├── validation/
│   ├── utils/
│   └── constants/
│
├── hooks/
│
├── stores/
│
├── types/
│
├── config/
│
└── styles/
```

Do not put the entire application into a few large files.

---

# 4. DESIGN SYSTEM

Use a professional dark-first developer-tool interface.

Primary background:

```text
#0B0D10
```

Secondary:

```text
#111418
```

Card:

```text
#15191F
```

Elevated:

```text
#1A1F26
```

Border:

```text
#252B33
```

Primary text:

```text
#F5F7FA
```

Secondary text:

```text
#A7AFBA
```

Muted:

```text
#6F7885
```

Semantic colors:

```text
Success → green
Warning → amber
Error → red
Info → blue
AI → purple
```

Use semantic colors only where they communicate meaning.

Do not make every card colorful.

---

# 5. TYPOGRAPHY

Use:

```text
Inter
```

Technical content:

```text
JetBrains Mono
```

Use monospace for:

* API URLs
* HTTP methods
* Trace IDs
* Span IDs
* Request IDs
* JSON
* logs
* SQL
* stack traces
* error messages
* code

---

# 6. GLOBAL APPLICATION SHELL

Create:

```text
Sidebar
Top Navigation
Breadcrumb
Main Content
Global Search
Command Palette
Notifications
User Menu
```

Sidebar:

```text
Overview
Services
API Debugger
Traces
Logs
Metrics
Incidents
Deployments
Integrations
Alerts
Settings
```

Sidebar must support:

```text
Expanded
Collapsed
Mobile Drawer
```

Persist collapsed state.

---

# 7. TOP NAVIGATION

Include:

```text
Breadcrumb

Global Search

Project Selector

Environment Selector

Time Range Selector

Refresh

Notifications

User Avatar
```

Environment:

```text
Production
Staging
Development
```

Time ranges:

```text
Last 5 minutes
Last 15 minutes
Last 30 minutes
Last 1 hour
Last 6 hours
Last 12 hours
Last 24 hours
Last 7 days
Custom range
```

---

# 8. GLOBAL SEARCH

Implement a working global search.

Search across:

```text
Projects
Services
Endpoints
Trace IDs
Request IDs
Incident IDs
Deployment IDs
Logs
Errors
```

Example:

```text
Search:
8f4c2e9a12ab
```

Return grouped results:

```text
Traces
Incidents
Logs
API Requests
Deployments
Services
```

Clicking a result must navigate to the correct page.

Add keyboard shortcut:

```text
Cmd/Ctrl + K
```

---

# 9. COMMAND PALETTE

Implement a working command palette.

Actions:

```text
Go to Dashboard
Open API Debugger
Search Traces
Search Logs
View Incidents
Create Incident
Create Project
Switch Project
Switch Environment
Open Settings
Open Integrations
```

Support keyboard navigation.

---

# 10. AUTHENTICATION

Create complete authentication UI.

Screens:

```text
/login
/register
/forgot-password
/reset-password
```

Login fields:

```text
Email
Password
Remember me
```

Validation:

```text
Required
Valid email
Minimum password length
```

Actions:

```text
Login
Forgot Password
Create Account
```

Register:

```text
Full Name
Email
Password
Confirm Password
Organization Name
```

Use React Hook Form + Zod.

The mock authentication layer should simulate:

```text
Login success
Invalid credentials
Account disabled
Network error
Session expiration
```

---

# 11. USER ROLES

Implement frontend permission handling.

Roles:

```text
OWNER
ADMIN
DEVELOPER
VIEWER
```

Example:

```text
OWNER
→ Everything

ADMIN
→ Manage project/settings/integrations

DEVELOPER
→ Debug/investigate/manage technical resources

VIEWER
→ Read-only access
```

Hide or disable actions based on permissions.

IMPORTANT:

Frontend permission checks are only UX controls.

The backend will enforce real authorization later.

---

# 12. ORGANIZATION / WORKSPACE

Support:

```text
Organization
Workspace
Project
Environment
```

Hierarchy:

```text
Organization
    ↓
Workspace
    ↓
Project
    ↓
Environment
    ↓
Services
```

Provide project/workspace selectors.

---

# 13. PROJECT MANAGEMENT

Page:

```text
/projects
```

Features:

```text
Create Project
Edit Project
Delete Project
Archive Project
Search Project
Filter Project
Open Project
```

Create project fields:

```text
Project Name
Description
Environment
Technology
Region
```

Technology options:

```text
Java
Node.js
.NET
Python
Go
Other
```

Environment:

```text
Production
Staging
Development
```

---

# 14. PROJECT API KEYS

Project settings must support API key management.

Fields:

```text
Key Name
Environment
Created At
Last Used
Status
```

Actions:

```text
Create API Key
Copy
Rotate
Revoke
Delete
```

When creating a key:

Show it only once in the UI.

Example:

```text
sk_live_xxxxxxxxx
```

Use mock implementation.

Never store real secrets in frontend source code.

---

# 15. OVERVIEW DASHBOARD

Route:

```text
/projects/:projectId/overview
```

Header:

```text
Project Name
Environment
Time Range
Refresh
Customize Dashboard
```

KPIs:

```text
Total Requests
Error Rate
P50 Latency
P95 Latency
P99 Latency
Active Incidents
```

Each KPI must show:

```text
Current value
Previous-period comparison
Trend
Sparkline
```

Example:

```text
Error Rate

2.84%

↑ 1.2%

Last 1 hour
```

---

# 16. DASHBOARD CHARTS

Implement working charts using Recharts.

Charts:

```text
Request Volume
Error Rate
Latency
Throughput
```

Allow time range changes.

Charts should update when filters/time range change.

---

# 17. SERVICE HEALTH

Dashboard service table:

```text
Service
Health
Requests
Error Rate
P95
Dependencies
```

Example mock data:

```text
API Gateway
Healthy
18,200 req/s
0.4%
120ms

Order Service
Degraded
8,700 req/s
4.8%
620ms

Payment Service
Critical
7,100 req/s
12.4%
2.8s
```

Click service → service details.

---

# 18. SERVICES

Route:

```text
/projects/:projectId/services
```

Features:

```text
Search
Filter
Sort
Pagination
Service status
Health
Request rate
Error rate
Latency
```

Actions:

```text
Open
Favorite
View traces
View logs
View metrics
```

---

# 19. SERVICE DETAILS

Route:

```text
/projects/:projectId/services/:serviceId
```

Tabs:

```text
Overview
Traces
Logs
Metrics
Dependencies
Deployments
Incidents
```

Overview:

```text
Requests
Error Rate
Latency
Availability
Health
```

Charts must be interactive.

---

# 20. SERVICE DEPENDENCY GRAPH

Use React Flow.

Show:

```text
API Gateway
↓
Order Service
↓
Payment Service
↓
External Payment API
```

Each node should show:

```text
Service Name
Health
Error Rate
Latency
```

Interactions:

```text
Click node
Zoom
Pan
Fit view
Highlight dependencies
Open service
```

Show unhealthy dependencies visually.

---

# 21. API DEBUGGER

This is one of the main Sherlock features.

Route:

```text
/projects/:projectId/debug
```

Build a fully functional API client.

Request fields:

```text
HTTP Method
URL
Query Parameters
Headers
Authorization
Body
```

Methods:

```text
GET
POST
PUT
PATCH
DELETE
HEAD
OPTIONS
```

---

# 22. API REQUEST TABS

```text
Params
Headers
Body
Auth
```

Params:

```text
Key
Value
Enabled
```

Headers:

```text
Key
Value
Enabled
```

Auth:

```text
None
Bearer Token
API Key
Basic Auth
```

Body:

```text
JSON
Text
Form Data
```

---

# 23. API DEBUGGER REQUEST VALIDATION

Validate:

```text
URL required
Valid URL
Required header values
Valid JSON body
Auth values
```

Show inline validation errors.

---

# 24. API DEBUGGER SEND REQUEST

When clicking:

```text
Send Request
```

Show:

```text
Loading
Request started
Response
```

Mock API should simulate realistic responses.

Possible responses:

```text
200
201
400
401
403
404
409
429
500
502
503
504
```

Include realistic latency.

---

# 25. API RESPONSE

Display:

```text
Status
Latency
Response Size
Timestamp
```

Tabs:

```text
Body
Headers
Timeline
Trace
Logs
Dependencies
Metrics
AI Investigation
```

---

# 26. RESPONSE BODY

Use a syntax-highlighted JSON/code viewer.

Features:

```text
Copy
Pretty
Raw
Expand
Collapse
Search
```

---

# 27. API TIMELINE

Show:

```text
Request
API Gateway
Service
Dependency
Database
Response
```

Example:

```text
API Gateway       12ms
Order Service     84ms
Payment Service   2.4s
PostgreSQL        180ms
```

Make the timeline interactive.

Clicking a segment should open its details.

---

# 28. DISTRIBUTED TRACING

Route:

```text
/projects/:projectId/traces
```

Trace list fields:

```text
Trace ID
Root Service
Operation
Duration
Status
Start Time
```

Filters:

```text
Service
Status
Duration
HTTP Method
HTTP Status
Time Range
```

---

# 29. TRACE DETAILS

Route:

```text
/projects/:projectId/traces/:traceId
```

Show:

```text
Trace ID
Duration
Status
Start Time
Root Service
```

Trace waterfall:

```text
API Gateway
████████████████████████ 2.84s

Order Service
██████████████████ 2.7s

Payment Service
████████████████ 2.5s

PostgreSQL
███ 180ms
```

---

# 30. TRACE SPANS

Each span must support:

```text
Service
Operation
Duration
Status
Start Time
Attributes
Events
Logs
```

Clicking a span opens a detail drawer.

---

# 31. SPAN ATTRIBUTES

Example:

```text
http.method = POST
http.route = /api/orders
http.status_code = 500
db.system = postgresql
db.operation = SELECT
```

Support:

```text
Search
Copy
Expand
Collapse
```

---

# 32. LOGS

Route:

```text
/projects/:projectId/logs
```

Implement a functional log explorer.

Search:

```text
Free-text search
```

Filters:

```text
Level
Service
Environment
Trace ID
Span ID
Status
Time Range
```

Levels:

```text
DEBUG
INFO
WARN
ERROR
FATAL
```

---

# 33. LOG DETAILS

Click log → side drawer.

Show:

```text
Timestamp
Level
Service
Message
Trace ID
Span ID
Request ID
Attributes
Stack Trace
```

Actions:

```text
Copy
Open Trace
Open Incident
Search Similar Logs
```

---

# 34. METRICS

Route:

```text
/projects/:projectId/metrics
```

Metric categories:

```text
Request Rate
Error Rate
Latency
CPU
Memory
Database
External API
```

Charts:

```text
P50
P90
P95
P99
```

Filters:

```text
Service
Metric
Environment
Time Range
```

---

# 35. INCIDENT MANAGEMENT

Route:

```text
/projects/:projectId/incidents
```

Incident fields:

```text
Incident ID
Title
Severity
Status
Service
Started At
Duration
Affected Requests
Created By
```

Severity:

```text
INFO
WARNING
ERROR
CRITICAL
```

Status:

```text
OPEN
INVESTIGATING
MITIGATED
RESOLVED
CLOSED
```

---

# 36. CREATE INCIDENT

Create modal.

Fields:

```text
Title
Description
Severity
Service
Environment
Tags
Assignee
```

Actions:

```text
Create
Cancel
```

Validate all fields.

After creation:

Navigate to incident details.

---

# 37. INCIDENT DETAILS

Route:

```text
/projects/:projectId/incidents/:incidentId
```

Display:

```text
Incident Header
Status
Severity
Service
Timeline
Impact
Evidence
Related Traces
Related Logs
Related Deployments
AI Investigation
```

Actions:

```text
Acknowledge
Assign
Change Severity
Change Status
Add Comment
Resolve
Reopen
Create Jira Issue
Send Slack Notification
```

---

# 38. INCIDENT COMMENTS

Allow users to add investigation comments.

Fields:

```text
Comment
```

Show:

```text
User
Timestamp
Comment
```

Support:

```text
Edit
Delete
```

---

# 39. INCIDENT TIMELINE

Timeline events:

```text
Incident Created
Deployment
Latency Spike
Error Spike
Investigation Started
Comment
Severity Changed
Incident Resolved
```

Each event should contain:

```text
Timestamp
Actor/System
Description
```

---

# 40. EVIDENCE ENGINE UI

Create evidence cards.

Evidence types:

```text
Metric Evidence
Trace Evidence
Log Evidence
Deployment Evidence
Dependency Evidence
Historical Evidence
```

Example:

```text
Payment Service latency

Normal: 300ms
Current: 2.8s

Deviation: 9.3x

Source:
Metrics
```

Each evidence card:

```text
Title
Description
Value
Source
Timestamp
Confidence
Open Source
```

---

# 41. ROOT CAUSE ANALYSIS UI

Display:

```text
Probable Root Cause
Confidence
Supporting Evidence
Alternative Causes
Recommended Checks
```

Example:

```text
Probable Cause

Payment dependency latency increased significantly.

Confidence

87%

Supporting Evidence

✓ Latency increased 9.3x
✓ 142 timeouts
✓ Order failures correlated
✓ Incident started after deployment
```

---

# 42. AI INVESTIGATION

Create contextual AI panel.

Do NOT make a generic chatbot.

Actions:

```text
Investigate Incident
Explain Failure
Explain Trace
Summarize Logs
Compare Previous Incident
What Changed?
Suggest Next Checks
```

AI result:

```text
Summary

Probable Cause

Evidence

Confidence

Recommended Checks

Related Resources
```

---

# 43. AI MOCK ENGINE

Until backend exists, create a deterministic mock AI service.

Example:

Input:

```text
incidentId
```

Output:

```text
summary
probableCause
confidence
evidence[]
recommendations[]
relatedTraces[]
```

Use structured TypeScript types.

Do not hardcode AI responses directly inside components.

---

# 44. DEPLOYMENTS

Route:

```text
/projects/:projectId/deployments
```

Fields:

```text
Deployment ID
Version
Service
Environment
Commit
Author
Branch
Status
Started At
Completed At
```

Statuses:

```text
SUCCESS
FAILED
IN_PROGRESS
ROLLED_BACK
```

---

# 45. DEPLOYMENT DETAILS

Show:

```text
Version
Commit
Author
Changes
Deployment Timeline
Affected Services
Related Incidents
Metrics Before
Metrics After
```

Important feature:

```text
Deployment Correlation
```

Example:

```text
Deployment v2.8.1
        ↓
7 minutes
        ↓
Latency +833%
        ↓
Error Rate +17%
        ↓
Incident
```

---

# 46. INTEGRATIONS

Route:

```text
/projects/:projectId/integrations
```

Categories:

```text
Observability
Source Control
CI/CD
Cloud
Communication
Incident Management
Databases
```

Initial integrations:

```text
OpenTelemetry
GitHub
GitLab
Prometheus
Grafana
Kubernetes
Docker
Slack
Microsoft Teams
Jira
PagerDuty
AWS
Azure
GCP
PostgreSQL
MySQL
Redis
```

Do not implement real OAuth yet.

Implement complete UI workflows using mock connection state.

---

# 47. INTEGRATION CARD

Each card:

```text
Logo
Name
Description
Category
Connection Status
```

Actions:

```text
Connect
Configure
Test Connection
Disconnect
```

---

# 48. INTEGRATION CONFIGURATION

Different integrations should have different configuration forms.

Examples:

GitHub:

```text
Organization
Repository
Access Token
Webhook
```

Slack:

```text
Workspace
Webhook URL
Channel
```

Kubernetes:

```text
Cluster Name
API Server
Namespace
Authentication
```

AWS:

```text
Account ID
Region
Access Configuration
```

Validate configuration forms.

---

# 49. ALERTS

Create:

```text
/projects/:projectId/alerts
```

Features:

```text
Create Alert
Edit Alert
Enable/Disable
Delete
Test Alert
View History
```

Alert fields:

```text
Name
Metric
Condition
Threshold
Duration
Severity
Services
Notification Channel
Enabled
```

Example:

```text
Error Rate
>
5%
for
5 minutes
```

---

# 50. NOTIFICATION CHANNELS

Support UI for:

```text
Slack
Email
Microsoft Teams
PagerDuty
Webhook
```

Configuration must include:

```text
Channel
Target
Enabled
```

---

# 51. SETTINGS

Create:

```text
/settings
```

Sections:

```text
Profile
Organization
Workspace
Project
Members
Roles
API Keys
Security
Notifications
Integrations
Audit Logs
```

---

# 52. TEAM MEMBERS

Member fields:

```text
Name
Email
Role
Status
Joined At
Last Active
```

Actions:

```text
Invite
Change Role
Remove
Resend Invitation
```

Invite modal:

```text
Email
Role
```

---

# 53. AUDIT LOG

Display:

```text
Timestamp
User
Action
Resource
IP
Status
```

Example:

```text
10:42
Yuvaraj
Updated integration
GitHub
Success
```

Filters:

```text
User
Action
Resource
Date
```

---

# 54. DATA TABLE SYSTEM

Create a reusable DataTable component.

Features:

```text
Sorting
Filtering
Pagination
Column visibility
Search
Row selection
Bulk actions
Loading
Empty
Error
```

Use it across:

```text
Services
Traces
Logs
Incidents
Deployments
Members
Audit Logs
Integrations
```

---

# 55. FILTER SYSTEM

Create reusable filter components.

Support:

```text
Select
Multi-select
Date range
Search
Number range
Status
Severity
Service
Environment
```

Every filter should update the displayed data.

Provide:

```text
Clear Filters
Reset Filters
```

---

# 56. URL STATE

Important filters should be reflected in URL query parameters.

Example:

```text
/logs?service=payment&level=error&range=1h
```

This allows:

```text
Shareable URLs
Browser Back/Forward
Bookmarking
```

---

# 57. PAGINATION

Implement reusable pagination.

Support:

```text
10
25
50
100
```

Show:

```text
Showing 1–25 of 248
```

---

# 58. MODALS AND DRAWERS

Use shadcn/Radix.

Use modal for:

```text
Create
Edit
Delete confirmation
Invite
Integration configuration
```

Use drawer for:

```text
Log details
Trace span details
Service details
Incident evidence
```

---

# 59. DELETE CONFIRMATION

Every destructive action must require confirmation.

Example:

```text
Delete Project?

This action cannot be undone.

[Cancel] [Delete Project]
```

---

# 60. TOAST SYSTEM

Implement global toast notifications.

Examples:

```text
Project created successfully
API key copied
Incident resolved
Integration connected
Failed to save settings
```

---

# 61. LOADING STATES

Every asynchronous operation must have a loading state.

Use:

```text
Skeleton
Spinner
Progress
Disabled button
```

Never leave blank screens.

---

# 62. EMPTY STATES

Every page must have an intentional empty state.

Examples:

```text
No incidents
No traces
No logs
No deployments
No integrations
No services
No alerts
```

Include an appropriate CTA where applicable.

---

# 63. ERROR STATES

Every API/data operation must support:

```text
Network Error
Unauthorized
Forbidden
Not Found
Server Error
Timeout
```

Display human-readable messages.

Do not expose stack traces to users.

---

# 64. MOCK API ARCHITECTURE

This is extremely important.

Create:

```text
lib/mock-api/
```

Example:

```text
mock-api/
├── auth.ts
├── projects.ts
├── services.ts
├── traces.ts
├── logs.ts
├── metrics.ts
├── incidents.ts
├── deployments.ts
├── integrations.ts
├── alerts.ts
├── members.ts
└── ai.ts
```

The UI must NOT directly import mock data.

Bad:

```text
component → mockData.ts
```

Good:

```text
component
    ↓
TanStack Query
    ↓
API Repository
    ↓
Mock API
```

Later:

```text
component
    ↓
TanStack Query
    ↓
API Repository
    ↓
Spring Boot API
```

---

# 65. API ABSTRACTION

Create interfaces such as:

```typescript
interface ProjectRepository {
    getProjects(): Promise<Project[]>;
    getProject(id: string): Promise<Project>;
    createProject(input: CreateProjectInput): Promise<Project>;
    updateProject(id: string, input: UpdateProjectInput): Promise<Project>;
    deleteProject(id: string): Promise<void>;
}
```

Implement:

```text
MockProjectRepository
```

Later backend implementation:

```text
HttpProjectRepository
```

This allows replacing mock backend without redesigning UI.

---

# 66. MOCK DATABASE

Use realistic datasets.

Create at least:

```text
10 projects
20 services
100 traces
300 logs
50 incidents
50 deployments
100 API requests
20 alerts
10 integrations
```

Do not use identical repeated dummy records.

Data should have realistic relationships.

Example:

```text
Trace
→ Service
→ Logs
→ Incident
→ Deployment
```

---

# 67. DATA RELATIONSHIPS

Mock data must represent real relationships.

Example:

```text
Incident INC-1023
    ↓
Payment Service
    ↓
Trace 8f4c...
    ↓
Logs
    ↓
Deployment v2.8.1
```

When opening the incident, related records should actually match.

---

# 68. REALISTIC API DEBUGGER

Mock requests should produce deterministic scenarios.

Example:

```text
POST /api/orders
```

can return:

```text
500
```

and generate:

```text
Trace
Logs
Metrics
Dependency failure
Incident
AI Investigation
```

Therefore:

```text
API Debugger
→ Send Request
→ Response
→ Open Trace
→ Open Logs
→ View Incident
→ AI Investigation
```

must feel like one connected system.

---

# 69. INVESTIGATION SCENARIO

Create at least these scenarios:

### Scenario 1 — Payment Timeout

```text
Order API
→ Payment Service
→ External Payment Provider
```

Payment latency increases.

Result:

```text
500
```

### Scenario 2 — Database Slow Query

```text
Order Service
→ PostgreSQL
```

Database latency increases.

Result:

```text
504
```

### Scenario 3 — Deployment Regression

Deployment happens.

Shortly afterward:

```text
Error Rate ↑
Latency ↑
```

### Scenario 4 — Authentication Failure

```text
401
```

### Scenario 5 — Rate Limit

```text
429
```

---

# 70. DEMO MODE

Create a demo environment that works immediately after installation.

The user should be able to open Sherlock and explore without a backend.

Include:

```text
Demo Organization
Demo Workspace
Demo Project
Demo Services
Demo Incidents
Demo Traces
Demo Logs
Demo Deployments
```

---

# 71. DEMO INVESTIGATION

Create one polished demo incident:

```text
INC-1023

Checkout API failures

Critical
Investigating
```

Evidence:

```text
Payment latency:
300ms → 2.8s

Timeouts:
142

Error rate:
1.2% → 18.4%

Deployment:
v2.8.1
7 minutes before incident
```

AI:

```text
Probable Cause:
Payment dependency latency.

Confidence:
87%
```

This should be fully navigable.

---

# 72. RESPONSIVE DESIGN

Support:

```text
1440+
1280
1024
768
375
```

Desktop:

```text
Sidebar
Main content
```

Tablet:

```text
Collapsed sidebar
```

Mobile:

```text
Navigation drawer
Stacked cards
Scrollable tables
Responsive charts
```

Do not simply shrink desktop UI.

Actually adapt layouts.

---

# 73. ACCESSIBILITY

Implement:

```text
Keyboard navigation
Focus states
ARIA labels
Accessible dialogs
Accessible dropdowns
Accessible tables
Color-independent status indicators
```

Keyboard:

```text
Ctrl/Cmd + K
Esc
Enter
Arrow keys
```

---

# 74. PERFORMANCE

Optimize for production.

Implement:

```text
Lazy loading
Code splitting
Memoization where useful
Virtualized long log lists
Debounced search
Paginated tables
Cached queries
```

Avoid unnecessary re-renders.

---

# 75. SECURITY FRONTEND REQUIREMENTS

Never expose:

```text
Real API secrets
Database credentials
LLM keys
Cloud credentials
Private tokens
```

Use environment variables for frontend-safe configuration.

Do not place secret credentials in `NEXT_PUBLIC_*`.

---

# 76. ENVIRONMENT CONFIGURATION

Create:

```text
.env.example
```

Example:

```text
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
NEXT_PUBLIC_ENABLE_MOCK_API=true
```

Never commit `.env`.

---

# 77. ERROR BOUNDARIES

Create:

```text
Global Error Boundary
Route Error Boundary
Component-level Error Boundary
```

Show useful recovery actions.

Example:

```text
Something went wrong.

[Try Again]
```

---

# 78. NOT FOUND

Create:

```text
404
```

with:

```text
Page not found

[Go to Dashboard]
```

---

# 79. API CONTRACT PREPARATION

Although backend does not exist, create TypeScript types that map directly to future Spring Boot DTOs.

Example:

```typescript
interface Incident {
    id: string;
    projectId: string;
    title: string;
    description: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    serviceId: string;
    environment: string;
    startedAt: string;
    resolvedAt?: string;
    createdAt: string;
    updatedAt: string;
}
```

Do this for all major entities.

---

# 80. DOMAIN TYPES

Create types for:

```text
User
Organization
Workspace
Project
Environment
ApiKey
Service
ApiRequest
Trace
Span
Log
Metric
Incident
Evidence
Deployment
Integration
Alert
Notification
AuditLog
AiInvestigation
Comment
```

---

# 81. ENUMS

Use typed enums/unions for:

```text
Role
Environment
Severity
IncidentStatus
DeploymentStatus
IntegrationStatus
LogLevel
HttpMethod
HttpStatus
ServiceHealth
AlertStatus
```

---

# 82. DATE/TIME

Store timestamps as ISO strings.

Display according to user locale.

Support:

```text
Relative time
Absolute time
Timezone
```

Example:

```text
2 minutes ago

18 Sep 2026, 22:41:03 IST
```

---

# 83. SEARCH

Search should be:

```text
Debounced
Case-insensitive
Fast
```

Highlight matching text where useful.

---

# 84. TABLE UX

Every major table should support:

```text
Sort
Filter
Search
Pagination
Column visibility
Row click
```

Do not create tables with impossible-to-read dense layouts.

---

# 85. CHART UX

Charts should support:

```text
Tooltip
Legend
Hover values
Time range
Zoom where appropriate
```

Do not overload charts with unnecessary information.

---

# 86. DESIGN CONSISTENCY

Create reusable:

```text
PageHeader
SectionHeader
MetricCard
StatusBadge
SeverityBadge
DataTable
FilterBar
SearchInput
TimeRangePicker
EmptyState
ErrorState
LoadingState
ConfirmDialog
DetailDrawer
CodeViewer
JsonViewer
Timeline
EvidenceCard
AIInvestigationPanel
```

Use them everywhere.

---

# 87. COMPONENT DOCUMENTATION

For reusable components, document:

```text
Purpose
Props
States
Usage
```

Use TypeScript interfaces.

---

# 88. TESTING

Implement frontend tests.

Use:

```text
Jest
React Testing Library
Playwright
```

Test:

```text
Login
Project creation
Navigation
Filters
API debugger
Incident creation
Incident resolution
Integration connection
Search
Command palette
Permission-based UI
```

---

# 89. END-TO-END DEMO FLOW

This exact flow must work:

```text
Login
 ↓
Select Organization
 ↓
Select Project
 ↓
Dashboard
 ↓
Open API Debugger
 ↓
Send failing request
 ↓
View 500 response
 ↓
Open Timeline
 ↓
Open Trace
 ↓
Open Payment Service
 ↓
Open Related Logs
 ↓
Open Incident
 ↓
View Evidence
 ↓
View Deployment
 ↓
Open AI Investigation
 ↓
See Probable Root Cause
 ↓
View Recommended Checks
 ↓
Resolve Incident
```

This is the primary Sherlock product journey.

---

# 90. SECONDARY FLOW

```text
Dashboard
 ↓
Services
 ↓
Payment Service
 ↓
Metrics
 ↓
Latency spike
 ↓
Traces
 ↓
Related incident
 ↓
Investigation
```

---

# 91. THIRD FLOW

```text
Dashboard
 ↓
Deployments
 ↓
Deployment v2.8.1
 ↓
Related incident
 ↓
Compare metrics
 ↓
Investigation
```

---

# 92. MOBILE FLOW

At minimum these must work on mobile:

```text
Login
Dashboard
Incidents
Incident Details
Trace Details
Logs
API Debugger
```

---

# 93. FRONTEND QUALITY REQUIREMENT

Before considering the frontend complete, verify:

```text
[ ] No dead buttons
[ ] No fake navigation
[ ] No broken links
[ ] No missing loading states
[ ] No missing empty states
[ ] No missing error states
[ ] All forms validate
[ ] All modals work
[ ] All drawers work
[ ] All tabs work
[ ] All filters work
[ ] Search works
[ ] Sorting works
[ ] Pagination works
[ ] URL state works
[ ] Responsive layout works
[ ] Keyboard navigation works
[ ] Demo mode works
[ ] Mock API works
[ ] Related data is connected
[ ] AI investigation works with mock data
[ ] Incident lifecycle works
[ ] API debugger works
[ ] Trace navigation works
[ ] Log navigation works
[ ] Deployment correlation works
[ ] Integration workflows work
```

---

# 94. IMPORTANT — DO NOT STOP AT UI

The implementation is NOT complete if:

```text
Button exists
but does nothing.
```

The implementation is NOT complete if:

```text
Filter exists
but doesn't change data.
```

The implementation is NOT complete if:

```text
Table exists
but pagination is fake.
```

The implementation is NOT complete if:

```text
Incident exists
but status cannot change.
```

The implementation is NOT complete if:

```text
API debugger exists
but request flow doesn't work.
```

The implementation is NOT complete if:

```text
Trace exists
but related logs cannot be opened.
```

The implementation is NOT complete if:

```text
AI panel exists
but has no structured investigation data.
```

Every visible interaction must have a working frontend behavior.

---

# 95. BACKEND-READY ARCHITECTURE

The final frontend must be designed so that the mock API can later be replaced with:

```text
Next.js
      ↓
API Gateway
      ↓
Spring Boot Backend
      ↓
Microservices
```

Do not couple UI components to mock data.

Use:

```text
UI
 ↓
Hooks
 ↓
Repository/API Layer
 ↓
Mock Implementation
```

Later:

```text
UI
 ↓
Hooks
 ↓
Repository/API Layer
 ↓
HTTP
 ↓
Spring Boot
```

The UI should not require major rewriting when the backend is introduced.

---

# 96. FUTURE BACKEND ENDPOINT PREPARATION

Prepare frontend API modules for:

```text
/auth
/users
/organizations
/workspaces
/projects
/environments
/api-keys
/services
/api-requests
/traces
/spans
/logs
/metrics
/incidents
/evidence
/deployments
/integrations
/alerts
/notifications
/audit-logs
/ai/investigations
```

Use REST-style repository methods.

---

# 97. FINAL DEVELOPMENT ORDER

Build in this order:

## Phase 1

```text
Project Setup
Design System
Theme
Layout
Sidebar
Topbar
Routing
```

## Phase 2

```text
Authentication
Organization
Workspace
Project
Environment
```

## Phase 3

```text
Dashboard
Services
Metrics
Charts
```

## Phase 4

```text
API Debugger
Request Builder
Response Viewer
Timeline
```

## Phase 5

```text
Traces
Spans
Trace Waterfall
```

## Phase 6

```text
Logs
Search
Filters
Log Details
```

## Phase 7

```text
Incidents
Evidence
Timeline
Comments
Status Lifecycle
```

## Phase 8

```text
AI Investigation
Root Cause
Confidence
Recommendations
```

## Phase 9

```text
Deployments
Deployment Correlation
```

## Phase 10

```text
Integrations
Alerts
Notifications
```

## Phase 11

```text
Settings
Members
Roles
API Keys
Audit Logs
```

## Phase 12

```text
Testing
Performance
Accessibility
Responsive Design
Error Handling
Production Cleanup
```

---

# 98. FINAL ACCEPTANCE CRITERIA

The frontend is considered complete only when a new user can:

```text
Register
Login
Create a project
Switch environment
Explore dashboard
View services
View metrics
Search traces
Open a trace
Inspect spans
Search logs
Inspect logs
Open API debugger
Send a request
Inspect response
Inspect timeline
Inspect dependencies
Create incident
Investigate incident
View evidence
View deployment correlation
Use AI investigation
Add comments
Assign incident
Change severity
Resolve incident
Configure integrations
Create alerts
Manage team members
Manage API keys
View audit logs
```

without requiring a backend.

The entire experience should work using realistic mock data.

---

# 99. FINAL PRODUCT STANDARD

The result must look and behave like a real developer SaaS product that could later connect to production Spring Boot microservices.

Prioritize:

```text
Consistency
Performance
Accessibility
Maintainability
Type Safety
Reusable Components
Realistic Data
Correct UX States
Clear Information Architecture
Backend Compatibility
```

Do not optimize only for visual appearance.

Optimize for:

> **A developer investigating a real production incident at 2 AM.**

The developer should be able to quickly answer:

```text
What failed?

Where did it fail?

When did it start?

Which service is affected?

Which dependency caused the problem?

What changed before the failure?

What evidence supports this?

What should I investigate next?

Can I resolve the incident?
```

That is the core frontend experience of Sherlock.
