# MASTER PROMPT — Full-Fledged Distributed Observability & AI API Debugger Backend

You are a senior Staff/Principal Java backend engineer and distributed-systems architect.

Build a **production-grade, deployable, multi-tenant SaaS backend** called:

# "TraceMind — Distributed Application Observability & AI Root Cause Analysis Platform"

The platform allows developers to connect their applications and send logs, errors, API events, and distributed tracing information. The platform asynchronously processes these events, groups duplicate errors, correlates distributed requests, builds service dependency relationships, detects incidents, calculates probable root causes using deterministic backend algorithms, and optionally uses an LLM to explain the diagnosis.

IMPORTANT:

* I am primarily a Java/Spring Boot backend developer.
* I do NOT have AI/ML expertise.
* AI must therefore be an optional final layer.
* The core system MUST work completely without an LLM.
* Do NOT use AI to replace deterministic backend engineering.
* The project must be suitable for a serious Java backend portfolio and interview discussion.
* The project must be deployable to the public internet.
* Do NOT create fake implementations, placeholder methods, TODOs, pseudo-code, or "implement later" sections.
* Every generated service must compile.
* Every API must have working implementation.
* Every database operation must have working implementation.
* Every Kafka producer/consumer must be implemented.
* Every important distributed-systems pattern must be implemented rather than merely described.

---

# 1. PRIMARY TECHNOLOGY STACK

Use:

## Backend

* Java 21 LTS
* Spring Boot 3.x
* Spring Web
* Spring Security
* Spring Data JPA
* Hibernate
* Spring Validation
* Spring Actuator
* Spring Cloud Gateway
* Spring Cloud dependencies where appropriate
* Maven

## Messaging

* Apache Kafka
* Spring Kafka

## Databases

* PostgreSQL
* OpenSearch for log/event searching
* Redis

## Resilience

* Resilience4j
* Circuit Breaker
* Retry
* Timeout
* Bulkhead
* Rate limiting

## Security

* OAuth2/JWT
* BCrypt/Argon2 password hashing
* API keys for application ingestion
* RBAC
* Tenant isolation

## Observability

* OpenTelemetry
* Micrometer
* Prometheus
* Grafana
* Distributed tracing
* Correlation IDs

## Infrastructure

* Docker
* Docker Compose
* Kubernetes manifests
* Kubernetes ConfigMaps
* Kubernetes Secrets
* Horizontal Pod Autoscaler
* Health probes

## Testing

* JUnit 5
* Mockito
* Spring Boot Test
* Testcontainers
* Kafka integration tests
* PostgreSQL integration tests

## API Documentation

* OpenAPI
* Swagger UI

---

# 2. HIGH-LEVEL ARCHITECTURE

Build the following services:

1. API Gateway
2. Identity Service
3. Project Service
4. Ingestion Service
5. Processing Service
6. Correlation Service
7. Incident Service
8. Root Cause Service
9. AI Debugger Service
10. Notification Service

Use this architecture:

Internet
|
Cloudflare / Load Balancer
|
API Gateway
|
-

|        |          |          |                |
Auth   Project   Ingestion   Dashboard APIs   Notifications
|
v
Kafka
|
-------------------------
|           |            |
Log Worker Error Worker Trace Worker
|           |            |
-------- Processing -------
|
v
Correlation
|
v
Incident
|
v
Root Cause Engine
|
v
AI Debugger
|
----------------
|              |
Gemini          Groq
|
Explanation

Storage:

PostgreSQL
Redis
OpenSearch

Observability:

OpenTelemetry
Prometheus
Grafana

---

# 3. REPOSITORY STRUCTURE

Create a monorepo:

tracemind/

```
pom.xml

README.md

docker-compose.yml

.env.example

docs/

gateway-service/

identity-service/

project-service/

ingestion-service/

processing-service/

correlation-service/

incident-service/

rootcause-service/

ai-debugger-service/

notification-service/

infrastructure/

    docker/

    kubernetes/

    grafana/

    prometheus/

    opentelemetry/

scripts/

postman/
```

Every service must have its own:

* pom.xml
* src/main/java
* src/main/resources
* application.yml
* tests

Use a consistent package structure:

com.tracemind.<service>

---

# 4. ARCHITECTURAL PRINCIPLES

Implement:

* Database-per-service logical ownership
* REST for synchronous communication
* Kafka for asynchronous communication
* Event-driven architecture
* Eventual consistency
* Idempotent consumers
* Outbox pattern
* Retry
* Dead Letter Topics
* Circuit breakers
* Distributed tracing
* Correlation IDs
* API versioning
* Pagination
* Validation
* Centralized exception handling
* Structured JSON logging
* Tenant isolation
* Secure secret handling
* Configuration through environment variables

Do NOT create a distributed monolith.

Services must own their own data.

Avoid direct database access between services.

---

# 5. IDENTITY SERVICE

Implement:

## Entities

User

* id
* email
* passwordHash
* firstName
* lastName
* status
* createdAt
* updatedAt

Organization

* id
* name
* slug
* status
* createdAt

Membership

* id
* userId
* organizationId
* role

Role:

* OWNER
* ADMIN
* DEVELOPER
* VIEWER

## APIs

POST /api/v1/auth/register

POST /api/v1/auth/login

POST /api/v1/auth/refresh

GET /api/v1/users/me

POST /api/v1/organizations

GET /api/v1/organizations

POST /api/v1/organizations/{id}/members

DELETE /api/v1/organizations/{id}/members/{userId}

Implement JWT authentication.

Implement refresh tokens.

Implement RBAC.

Implement validation.

Implement global exception handling.

---

# 6. PROJECT SERVICE

A user can create multiple projects.

Entity:

Project

* id
* organizationId
* name
* slug
* description
* status
* createdAt
* updatedAt

Environment:

* DEVELOPMENT
* STAGING
* PRODUCTION

Application:

* id
* projectId
* name
* environment

APIKey:

* id
* projectId
* keyHash
* prefix
* name
* status
* createdAt
* lastUsedAt

IMPORTANT:

Never store the raw API key.

Only store a secure hash.

Show the raw key only once during creation.

Implement API-key authentication for ingestion endpoints.

---

# 7. INGESTION SERVICE

This service must handle high-throughput ingestion.

Endpoints:

POST /api/v1/ingest/logs

POST /api/v1/ingest/errors

POST /api/v1/ingest/traces

POST /api/v1/ingest/events

Support batch ingestion:

POST /api/v1/ingest/batch

Example:

{
"events": [
...
]
}

Requirements:

* API-key authentication
* Project validation
* Environment validation
* Payload validation
* Rate limiting
* Request size limits
* Idempotency
* Correlation ID generation
* Fast response
* Kafka publishing

The ingestion API must NOT perform expensive processing synchronously.

Flow:

Client

↓

Authentication

↓

Validation

↓

Rate limit

↓

Kafka

↓

202 Accepted

---

# 8. EVENT SCHEMA

Create a common event envelope.

Example:

{
"eventId": "UUID",
"eventType": "ERROR",
"projectId": "UUID",
"applicationId": "UUID",
"environment": "PRODUCTION",
"serviceName": "payment-service",
"host": "server-01",
"timestamp": "...",
"traceId": "...",
"spanId": "...",
"requestId": "...",
"severity": "ERROR",
"payload": {}
}

Use event versioning.

Example:

eventVersion: 1

Design schemas for future compatibility.

---

# 9. KAFKA ARCHITECTURE

Create topics:

tracemind.logs.raw

tracemind.errors.raw

tracemind.traces.raw

tracemind.events.raw

tracemind.logs.processed

tracemind.errors.processed

tracemind.traces.processed

tracemind.incidents.created

tracemind.incidents.updated

tracemind.rootcause.detected

tracemind.ai.analysis.completed

tracemind.notifications

tracemind.dead-letter

Use:

* Producer configuration
* Consumer configuration
* JSON serialization
* Consumer groups
* Manual acknowledgement where appropriate
* Retry topics
* Dead Letter Topics
* Error handlers
* Partitioning

Partition primarily by projectId so events for a project have predictable ordering characteristics.

Do not claim Kafka provides global ordering.

---

# 10. PROCESSING SERVICE

Consume:

logs.raw

errors.raw

traces.raw

events.raw

Implement:

## Log normalization

Normalize:

* timestamp
* severity
* service name
* environment
* host
* message
* trace ID
* span ID

## Error fingerprinting

For exceptions calculate:

fingerprint = SHA-256(
exceptionType +
className +
methodName +
normalizedStackTrace
)

Normalize dynamic values such as:

* UUIDs
* timestamps
* request IDs
* numeric IDs

Group identical errors.

Example:

10,000 identical NullPointerExceptions

must become:

1 error group

with count = 10,000.

---

# 11. SENSITIVE DATA REDACTION

Implement a redaction engine.

Detect fields such as:

password

passwd

token

access_token

refresh_token

authorization

api_key

secret

client_secret

credit_card

card_number

ssn

Replace values with:

[REDACTED]

The redaction must happen BEFORE any event is sent to an external LLM.

Make the rules configurable.

---

# 12. OPENSEARCH

Store searchable telemetry in OpenSearch.

Create indices:

tracemind-logs

tracemind-errors

tracemind-traces

tracemind-events

Use index mappings.

Support:

* full-text search
* filtering
* time range queries
* service filtering
* environment filtering
* severity filtering
* trace ID search
* error fingerprint search

Implement pagination.

Do not use PostgreSQL as the primary log-search engine.

---

# 13. CORRELATION SERVICE

Correlate events using:

* traceId
* spanId
* requestId
* event timestamp
* service name
* parent span ID
* Kafka event relationship

Build request timelines.

Example:

Gateway

↓

Order Service

↓

Payment Service

↓

Inventory Service

Generate a trace tree.

Implement:

GET /api/v1/traces/{traceId}

Return:

* duration
* services
* spans
* errors
* latency
* timeline

---

# 14. SERVICE DEPENDENCY GRAPH

Dynamically calculate:

sourceService

targetService

requestCount

errorCount

averageLatency

p95Latency

lastSeen

Store dependency relationships.

Example:

gateway → order

order → payment

order → inventory

payment → postgres

inventory → postgres

Provide:

GET /api/v1/projects/{projectId}/dependencies

Calculate health information for each dependency.

---

# 15. INCIDENT SERVICE

An incident represents a collection of correlated failures.

Entity:

Incident

* id
* projectId
* title
* description
* severity
* status
* startedAt
* detectedAt
* resolvedAt
* rootCause
* confidenceScore

Statuses:

DETECTED

INVESTIGATING

IDENTIFIED

MITIGATING

RESOLVED

CLOSED

Severity:

INFO

LOW

MEDIUM

HIGH

CRITICAL

Implement incident deduplication.

Do not create a new incident for every error.

Correlate errors into incidents.

---

# 16. ROOT CAUSE ENGINE

This MUST be deterministic.

Do not use an LLM for root-cause calculation.

Input:

* error groups
* traces
* service dependency graph
* latency
* service health
* temporal relationships
* failure propagation

Calculate candidates.

Example score:

rootCauseScore =

0.30 * errorFrequencyScore

*

0.25 * dependencyImpactScore

*

0.20 * temporalCorrelationScore

*

0.15 * failurePropagationScore

*

0.10 * serviceHealthScore

Normalize scores between 0 and 1.

Return:

{
"candidate": "postgresql",
"confidence": 0.91,
"evidence": [...]
}

Implement explainable evidence.

Example:

Root cause:

POSTGRES_CONNECTION_POOL_EXHAUSTION

Evidence:

* HikariCP pool exhausted
* PostgreSQL connection timeout
* Inventory latency increased
* Order errors followed Inventory failures
* Gateway errors occurred afterward

---

# 17. AI DEBUGGER SERVICE

AI is OPTIONAL.

The platform must work if the AI provider is unavailable.

Create:

public interface LlmProvider {

```
DebugExplanation analyze(
    RootCauseEvidence evidence
);
```

}

Implement:

GeminiProvider

GroqProvider

Optional:

OllamaProvider

Do NOT hardcode an API provider throughout the application.

Use configuration:

LLM_PROVIDER=gemini

GEMINI_API_KEY=...

GROQ_API_KEY=...

Implement:

* timeout
* retry
* circuit breaker
* fallback
* token limits
* prompt size limits
* sensitive-data protection
* structured response validation

Only send:

* root cause
* confidence
* relevant logs
* relevant trace data
* evidence
* service information

Never send millions of raw logs to the LLM.

---

# 18. AI RESPONSE FORMAT

Force structured JSON.

Example:

{
"summary": "...",
"probableRootCause": "...",
"confidence": 0.91,
"evidence": [
"...",
"..."
],
"affectedServices": [
"inventory-service",
"order-service"
],
"recommendedActions": [
"...",
"..."
]
}

Validate the response before storing it.

If the LLM returns invalid JSON, retry or fallback safely.

The UI must clearly distinguish:

DETERMINISTIC ROOT CAUSE

from

AI EXPLANATION

Never present an AI suggestion as guaranteed truth.

---

# 19. RESILIENCE4J

Implement resilience around:

* AI service
* notification service
* project validation
* internal REST calls

Use:

CircuitBreaker

Retry

TimeLimiter

Bulkhead

Fallback

Example:

If Gemini fails repeatedly:

Gemini

↓

Circuit OPEN

↓

Fallback provider

↓

Groq

If all AI providers fail:

return deterministic root cause without AI explanation.

The application must continue working.

---

# 20. OUTBOX PATTERN

Implement the Outbox Pattern in services that publish important domain events.

Example:

Incident creation:

Database transaction:

incident INSERT

outbox_event INSERT

Then:

Outbox Publisher

↓

Kafka

Guarantee that a committed incident eventually produces its event.

Implement:

* polling
* event status
* retry
* failure handling
* publishedAt
* attempt count

Do not use distributed two-phase transactions.

---

# 21. IDEMPOTENCY

Implement event idempotency.

Every event has:

eventId

Create a processed_events table.

Before processing:

Check eventId.

If already processed:

ignore safely.

The consumer must be safe under duplicate Kafka delivery.

---

# 22. REDIS

Use Redis for:

* API rate limiting
* caching project metadata
* caching service metadata
* idempotency where appropriate
* short-lived incident state
* distributed locks only where genuinely required

Do not use Redis as the permanent source of truth.

---

# 23. RATE LIMITING

Implement per-project rate limiting.

Example:

Free tier:

1000 events/minute

Pro tier:

10000 events/minute

Store counters in Redis.

Return:

HTTP 429

when limits are exceeded.

Support:

Retry-After

headers.

---

# 24. NOTIFICATION SERVICE

Implement:

* Email notification abstraction
* Webhook notification
* Slack-style webhook integration if practical

Events:

IncidentCreated

IncidentSeverityChanged

IncidentResolved

RootCauseDetected

AIAnalysisCompleted

Implement notification retry.

Use Kafka.

Do not block incident processing while sending notifications.

---

# 25. API GATEWAY

Use Spring Cloud Gateway.

Responsibilities:

* routing
* JWT validation
* rate limiting where appropriate
* CORS
* correlation ID
* request logging
* security headers

Routes:

/api/v1/auth/**

/api/v1/users/**

/api/v1/organizations/**

/api/v1/projects/**

/api/v1/ingest/**

/api/v1/incidents/**

/api/v1/traces/**

/api/v1/dependencies/**

/api/v1/ai/**

---

# 26. SECURITY

Implement:

* JWT
* refresh tokens
* RBAC
* API keys
* secure API-key hashing
* tenant isolation
* password hashing
* validation
* CORS
* security headers
* request size limits
* rate limiting

Every tenant-scoped query MUST verify:

organizationId

and/or

projectId.

Prevent IDOR vulnerabilities.

Never trust organizationId/projectId directly from the client without authorization checks.

---

# 27. DATABASE DESIGN

Create proper normalized relational schemas.

Use:

* UUID primary keys
* indexes
* foreign keys where appropriate
* unique constraints
* createdAt
* updatedAt
* optimistic locking where appropriate

Use Flyway migrations.

Never use:

spring.jpa.hibernate.ddl-auto=create

for production.

Use:

validate

or migration-controlled schema management.

---

# 28. ERROR HANDLING

Every service must have:

GlobalExceptionHandler

Standard API error format:

{
"timestamp": "...",
"status": 400,
"error": "VALIDATION_ERROR",
"message": "...",
"path": "...",
"correlationId": "..."
}

Handle:

400

401

403

404

409

422

429

500

503

Do not expose stack traces to clients.

---

# 29. API DESIGN

Use:

/api/v1/

Use DTOs.

Do NOT expose JPA entities directly.

Use:

Controller

↓

DTO

↓

Service

↓

Repository

Use pagination:

?page=0&size=20&sort=createdAt,desc

Use validation annotations.

Generate OpenAPI documentation.

---

# 30. OBSERVABILITY

Every service must expose:

/actuator/health

/actuator/info

/actuator/metrics

Integrate:

Micrometer

OpenTelemetry

Prometheus

Grafana

Add metrics:

http_requests_total

http_request_duration

kafka_messages_consumed

kafka_messages_failed

kafka_consumer_lag

events_ingested_total

errors_detected_total

incidents_created_total

ai_requests_total

ai_requests_failed_total

ai_latency

rootcause_analysis_duration

Add distributed tracing.

Propagate:

traceId

spanId

correlationId

across:

Gateway

↓

Service

↓

Kafka

↓

Consumer

↓

Database/external call

---

# 31. STRUCTURED LOGGING

Use JSON logging.

Example:

{
"timestamp": "...",
"level": "ERROR",
"service": "incident-service",
"traceId": "...",
"spanId": "...",
"correlationId": "...",
"message": "Incident creation failed"
}

Never log:

passwords

JWTs

API keys

secrets

authorization headers

---

# 32. TESTING

Every service must contain:

Unit tests

Controller tests

Repository tests

Integration tests

Kafka tests where relevant

Security tests

Testcontainers tests

Test:

* successful processing
* duplicate events
* Kafka failure
* PostgreSQL failure
* Redis failure
* OpenSearch failure
* invalid payload
* unauthorized access
* tenant isolation
* rate limit
* circuit breaker
* retry
* DLQ
* outbox publishing

Create end-to-end integration tests for:

Application

↓

Gateway

↓

Ingestion

↓

Kafka

↓

Processing

↓

Correlation

↓

Incident

↓

Root Cause

---

# 33. DOCKER COMPOSE

Create a complete docker-compose.yml containing:

* PostgreSQL
* Redis
* Kafka
* OpenSearch
* Prometheus
* Grafana
* all backend services

Configure health checks.

Use environment variables.

Do not hardcode production secrets.

Make:

docker compose up

start the complete development environment.

---

# 34. KUBERNETES

Create Kubernetes manifests for every service.

Include:

Deployment

Service

ConfigMap

Secret template

HorizontalPodAutoscaler

Liveness probe

Readiness probe

Resource requests

Resource limits

Use environment variables.

Do not hardcode credentials.

Create:

infrastructure/kubernetes/

with separate YAML files.

---

# 35. CONFIGURATION

Use profiles:

application.yml

application-dev.yml

application-test.yml

application-prod.yml

Environment variables:

DATABASE_URL

DATABASE_USERNAME

DATABASE_PASSWORD

KAFKA_BOOTSTRAP_SERVERS

REDIS_HOST

REDIS_PORT

OPENSEARCH_URL

JWT_SECRET

GEMINI_API_KEY

GROQ_API_KEY

etc.

Create:

.env.example

Never commit actual secrets.

---

# 36. FREE LLM DESIGN

Assume the initial deployment uses a free-tier hosted LLM.

Prefer:

Gemini

and support:

Groq

Make the provider configurable.

If no LLM API key exists:

AI functionality should gracefully disable itself.

The deterministic Root Cause Engine must continue functioning.

---

# 37. SAMPLE CUSTOMER SDK/API

Provide example Java code showing how a customer's Spring Boot application sends an error:

POST /api/v1/ingest/errors

Include:

API key

project ID

service name

environment

trace ID

stack trace

timestamp

Also provide curl examples.

---

# 38. DEMO APPLICATION

Create a separate demo application:

demo-payment-system/

with:

* API Gateway
* Order Service
* Payment Service
* Inventory Service

Intentionally provide an endpoint that can generate failures.

Example:

POST /demo/orders

Then demonstrate:

Gateway

↓

Order

↓

Payment

↓

Inventory

↓

PostgreSQL

Introduce a database connection failure.

The TraceMind platform should detect:

PostgreSQL

↓

Inventory

↓

Order

↓

Gateway

and create one incident.

This demo is essential for demonstrating the project during interviews.

---

# 39. SAMPLE DATA GENERATOR

Create a Java-based event generator capable of generating:

* normal logs
* errors
* exceptions
* latency spikes
* database failures
* downstream timeouts
* Kafka failures
* cascading failures

Support configurable rates.

Example:

100 events/sec

1000 events/sec

10000 events/sec

Use this to test Kafka throughput.

---

# 40. PERFORMANCE REQUIREMENTS

Design the ingestion service for asynchronous high-throughput processing.

Target development benchmark:

At least 1,000 events/sec on a normal developer machine.

Do NOT claim production performance without benchmarks.

Create a load-testing script using:

k6

or

JMeter

Measure:

* throughput
* latency
* Kafka lag
* CPU
* memory
* error rate

Document actual benchmark results only after tests are executed.

---

# 41. IMPORTANT DISTRIBUTED SYSTEM CONSTRAINTS

Explicitly handle:

* eventual consistency
* duplicate events
* out-of-order events
* Kafka consumer failure
* database failure
* Redis failure
* OpenSearch failure
* LLM failure
* network timeout
* partial service outage
* retry storms
* cascading failures

Do not assume:

"network calls always succeed."

Do not assume:

"Kafka delivers exactly once."

Design for at-least-once processing plus idempotency.

---

# 42. FAILURE SCENARIO

Implement a complete example:

PostgreSQL becomes unavailable.

Expected flow:

PostgreSQL failure

↓

Inventory Service DB errors

↓

Inventory Service latency increases

↓

Kafka records errors

↓

Processing Service groups errors

↓

Correlation Service detects propagation

↓

Incident Service creates incident

↓

Root Cause Engine identifies PostgreSQL

↓

AI Debugger optionally explains

↓

Notification Service sends alert

↓

Dashboard displays incident

This must actually work in the implementation.

---

# 43. API DOCUMENTATION

Generate complete OpenAPI documentation.

Document:

* Authentication
* Request schemas
* Response schemas
* Error responses
* Pagination
* Rate limits
* API key usage
* Ingestion APIs
* Incident APIs
* Trace APIs
* Dependency APIs
* AI APIs

---

# 44. README

Create a professional README containing:

Project overview

Architecture diagram

Service descriptions

Technology stack

Local setup

Docker setup

Environment variables

Database setup

Kafka topics

API examples

Testing

Observability

Deployment

Kubernetes

AI configuration

Security

Failure scenarios

Architecture decisions

Trade-offs

Future improvements

---

# 45. ARCHITECTURE DOCUMENTATION

Create:

docs/architecture.md

Explain:

* synchronous vs asynchronous communication
* Kafka architecture
* database ownership
* outbox pattern
* idempotency
* eventual consistency
* circuit breaker
* rate limiting
* root-cause algorithm
* AI architecture
* security
* observability
* deployment

Also create:

docs/adr/

with Architecture Decision Records for:

ADR-001 Microservices

ADR-002 Kafka

ADR-003 Database-per-service

ADR-004 Outbox Pattern

ADR-005 Idempotent Consumers

ADR-006 OpenSearch

ADR-007 LLM abstraction

ADR-008 Kubernetes

---

# 46. CODING STANDARDS

Use:

* SOLID
* clean architecture principles
* meaningful class names
* meaningful method names
* constructor injection
* immutable DTOs where practical
* Java records where appropriate
* enums instead of magic strings
* centralized constants
* no unnecessary abstractions
* no god classes
* no giant controllers
* no business logic in controllers
* no database logic in controllers

Prefer:

Controller

↓

Application Service

↓

Domain/Business Logic

↓

Repository

---

# 47. IMPORTANT: DO NOT OVERENGINEER

The system should be advanced but understandable.

Do NOT introduce:

* unnecessary service mesh complexity initially
* unnecessary databases
* unnecessary frameworks
* unnecessary event types
* distributed transactions everywhere

Every technology must have a reason.

---

# 48. CODE GENERATION PROCESS

Do NOT attempt to dump the entire repository into one response.

Generate the project incrementally.

Follow this exact order:

PHASE 1:
Parent Maven project + common configuration

PHASE 2:
Identity Service

PHASE 3:
Project Service

PHASE 4:
API Gateway

PHASE 5:
Ingestion Service

PHASE 6:
Kafka infrastructure

PHASE 7:
Processing Service

PHASE 8:
OpenSearch

PHASE 9:
Correlation Service

PHASE 10:
Incident Service

PHASE 11:
Root Cause Engine

PHASE 12:
AI Debugger

PHASE 13:
Notification Service

PHASE 14:
Outbox + Idempotency + DLQ hardening

PHASE 15:
Observability

PHASE 16:
Docker Compose

PHASE 17:
Demo application

PHASE 18:
Integration testing

PHASE 19:
Kubernetes

PHASE 20:
Production deployment documentation

---

# 49. STRICT OUTPUT RULE

For each phase:

1. Explain the architecture briefly.
2. Show the directory structure.
3. Generate every required file.
4. Give complete file contents.
5. Do not omit imports.
6. Do not use pseudo-code.
7. Do not write "same as above".
8. Do not write "implement this yourself".
9. Do not leave TODOs.
10. Do not leave placeholder methods.
11. Include tests.
12. Include Maven dependencies.
13. Include application configuration.
14. Include database migrations.
15. Include Kafka configuration where relevant.
16. Include Docker configuration where relevant.
17. Include exact commands to run.
18. Verify compile-level consistency between classes.
19. Keep package names consistent.
20. Do not change previously established APIs without explaining the migration.

At the end of each phase provide:

BUILD COMMAND

TEST COMMAND

RUN COMMAND

EXPECTED RESULT

COMMON ERRORS AND FIXES

Then STOP.

Wait for me to say:

"CONTINUE"

before generating the next phase.

---

# 50. CRITICAL QUALITY REQUIREMENT

Treat this as software that will be deployed publicly.

Before declaring each phase complete, mentally verify:

* imports
* package names
* Maven dependencies
* bean names
* constructor injection
* configuration properties
* database table names
* repository queries
* Kafka topic names
* JSON serialization
* DTO mappings
* exception handling
* security configuration
* API paths
* service-to-service URLs
* environment variables
* Docker networking
* test configuration

Do not optimize for number of lines of code.

Optimize for:

CORRECTNESS

MAINTAINABILITY

SECURITY

OBSERVABILITY

SCALABILITY

RELIABILITY

---

# 51. FINAL PRODUCT REQUIREMENT

At the end, the completed project must support this complete flow:

Developer registers

↓

Creates organization

↓

Creates project

↓

Creates production environment

↓

Creates API key

↓

Connects their application

↓

Application sends logs/errors/traces

↓

Ingestion API accepts events

↓

Kafka buffers events

↓

Processing service normalizes events

↓

Errors are fingerprinted

↓

Logs are indexed in OpenSearch

↓

Trace correlation builds request paths

↓

Service dependency graph is updated

↓

Incident engine groups related failures

↓

Root Cause Engine determines probable root cause

↓

AI Debugger optionally explains it

↓

Notification Service sends notification

↓

Dashboard displays:

* live errors
* error groups
* incidents
* traces
* service dependencies
* root cause
* AI explanation
* metrics

The final system must be capable of being deployed publicly using Docker and later Kubernetes.

Start with PHASE 1 only.

Do NOT generate Phase 2 until I explicitly say:

CONTINUE.
