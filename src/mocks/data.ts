import type {
  Project, Service, ProjectMetrics, LogEntry, ErrorGroup, ErrorGroupDetail,
  Trace, TraceSummary, Incident, IncidentDetail, DependencyGraph,
  ApiEndpoint, ApiSample, AiMessage, ApiKey, MetricPoint,
} from "@/types";

// ── Helpers ────────────────────────────────────────────────────────────────

function ago(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function series(points: number, base: number, jitter: number): MetricPoint[] {
  return Array.from({ length: points }, (_, i) => ({
    timestamp: new Date(Date.now() - (points - i) * 5 * 60_000).toISOString(),
    value: Math.max(0, base + (Math.random() - 0.5) * jitter),
  }));
}

// ── Projects ───────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Sherlock Payments",
    slug: "elora-payments",
    organizationId: "org-1",
    environments: ["development", "staging", "production"],
    serviceCount: 8,
    lastEventAt: ago(1),
    createdAt: "2024-01-15T09:00:00Z",
    status: "CRITICAL",
  },
  {
    id: "proj-2",
    name: "Analytics API",
    slug: "analytics-api",
    organizationId: "org-1",
    environments: ["development", "staging", "production"],
    serviceCount: 4,
    lastEventAt: ago(3),
    createdAt: "2024-03-01T10:00:00Z",
    status: "HEALTHY",
  },
  {
    id: "proj-3",
    name: "Inventory Service",
    slug: "inventory-service",
    organizationId: "org-1",
    environments: ["development", "production"],
    serviceCount: 3,
    lastEventAt: ago(8),
    createdAt: "2024-05-10T08:00:00Z",
    status: "DEGRADED",
  },
];

// ── Services ───────────────────────────────────────────────────────────────

export const MOCK_SERVICES: Service[] = [
  {
    id: "svc-1",
    name: "api-gateway",
    projectId: "proj-1",
    environment: "production",
    health: "DEGRADED",
    requestCount: 1_243_882,
    errorRate: 3.4,
    p95Latency: 420,
    p99Latency: 890,
    lastSeenAt: ago(0.1),
    language: "Node.js",
    version: "2.4.1",
  },
  {
    id: "svc-2",
    name: "order-service",
    projectId: "proj-1",
    environment: "production",
    health: "DEGRADED",
    requestCount: 421_003,
    errorRate: 5.1,
    p95Latency: 680,
    p99Latency: 1400,
    lastSeenAt: ago(0.1),
    language: "Java",
    version: "1.8.3",
  },
  {
    id: "svc-3",
    name: "payment-service",
    projectId: "proj-1",
    environment: "production",
    health: "CRITICAL",
    requestCount: 389_421,
    errorRate: 12.4,
    p95Latency: 2100,
    p99Latency: 4800,
    lastSeenAt: ago(0.2),
    language: "Java",
    version: "3.1.0",
  },
  {
    id: "svc-4",
    name: "inventory-service",
    projectId: "proj-1",
    environment: "production",
    health: "DEGRADED",
    requestCount: 312_880,
    errorRate: 4.82,
    p95Latency: 780,
    p99Latency: 1900,
    lastSeenAt: ago(0.2),
    language: "Go",
    version: "0.9.2",
  },
  {
    id: "svc-5",
    name: "notification-service",
    projectId: "proj-1",
    environment: "production",
    health: "HEALTHY",
    requestCount: 88_340,
    errorRate: 0.12,
    p95Latency: 95,
    p99Latency: 180,
    lastSeenAt: ago(0.5),
    language: "Python",
    version: "1.2.0",
  },
  {
    id: "svc-6",
    name: "postgresql",
    projectId: "proj-1",
    environment: "production",
    health: "CRITICAL",
    requestCount: 9_823_441,
    errorRate: 18.3,
    p95Latency: 3200,
    p99Latency: 8100,
    lastSeenAt: ago(0.1),
    language: "PostgreSQL",
    version: "15.3",
  },
  {
    id: "svc-7",
    name: "redis",
    projectId: "proj-1",
    environment: "production",
    health: "HEALTHY",
    requestCount: 4_210_882,
    errorRate: 0.03,
    p95Latency: 2,
    p99Latency: 8,
    lastSeenAt: ago(0.1),
    language: "Redis",
    version: "7.0.12",
  },
  {
    id: "svc-8",
    name: "kafka",
    projectId: "proj-1",
    environment: "production",
    health: "HEALTHY",
    requestCount: 2_890_312,
    errorRate: 0.01,
    p95Latency: 12,
    p99Latency: 40,
    lastSeenAt: ago(0.2),
    language: "Kafka",
    version: "3.5.0",
  },
];

// ── Metrics ────────────────────────────────────────────────────────────────

export const MOCK_METRICS: ProjectMetrics = {
  totalRequests: 1_243_882,
  requestsDelta: 12.4,
  errorRate: 3.82,
  errorRateDelta: 1.2,
  p95Latency: 342,
  p95LatencyDelta: 28.4,
  p99Latency: 890,
  p99LatencyDelta: 14.2,
  activeIncidents: 3,
  servicesDown: 2,
  requestSeries: series(48, 26000, 8000),
  errorSeries: series(48, 3.8, 1.5),
  latencySeries: series(48, 340, 80),
};

// ── Logs ──────────────────────────────────────────────────────────────────

export const MOCK_LOGS: LogEntry[] = [
  {
    id: "log-1",
    timestamp: ago(0.2),
    level: "ERROR",
    service: "payment-service",
    environment: "production",
    message: "HikariPool-1 - Connection is not available, request timed out after 30000ms",
    traceId: "abc123def456",
    spanId: "span-001",
    requestId: "req-88821",
    host: "payment-pod-3a",
    metadata: { pool: "HikariPool-1", timeout: 30000, activeConnections: 50 },
    stackTrace: `java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30000ms
    at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:213)
    at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:100)
    at com.elora.payments.repository.PaymentRepository.save(PaymentRepository.java:44)
    at com.elora.payments.service.PaymentService.processPayment(PaymentService.java:88)`,
  },
  {
    id: "log-2",
    timestamp: ago(0.22),
    level: "ERROR",
    service: "payment-service",
    environment: "production",
    message: "Failed to process payment for order ORD-98821: DATABASE_TIMEOUT",
    traceId: "abc123def456",
    spanId: "span-002",
    requestId: "req-88821",
    host: "payment-pod-3a",
    metadata: { orderId: "ORD-98821", amount: 149.99, currency: "USD" },
  },
  {
    id: "log-3",
    timestamp: ago(0.25),
    level: "WARN",
    service: "order-service",
    environment: "production",
    message: "Payment service responded with 500 after 2100ms — retrying (attempt 1/3)",
    traceId: "abc123def456",
    spanId: "span-003",
    requestId: "req-88821",
    host: "order-pod-1b",
    metadata: { retryAttempt: 1, maxRetries: 3 },
  },
  {
    id: "log-4",
    timestamp: ago(0.5),
    level: "ERROR",
    service: "inventory-service",
    environment: "production",
    message: "Database query timeout after 5000ms: SELECT * FROM inventory WHERE sku=?",
    traceId: "def789ghi012",
    spanId: "span-004",
    requestId: "req-77340",
    host: "inventory-pod-2c",
    metadata: { query: "SELECT * FROM inventory WHERE sku=?", timeout: 5000 },
  },
  {
    id: "log-5",
    timestamp: ago(1),
    level: "ERROR",
    service: "postgresql",
    environment: "production",
    message: "FATAL: remaining connection slots are reserved for non-replication superuser connections",
    traceId: "ghi012jkl345",
    spanId: "span-005",
    host: "pg-primary",
    metadata: { maxConnections: 100, activeConnections: 100 },
  },
  {
    id: "log-6",
    timestamp: ago(1.5),
    level: "INFO",
    service: "api-gateway",
    environment: "production",
    message: "Request routed to order-service: POST /api/orders",
    traceId: "jkl345mno678",
    spanId: "span-006",
    requestId: "req-66128",
    host: "gateway-pod-1a",
    metadata: { method: "POST", path: "/api/orders", upstream: "order-service" },
  },
  {
    id: "log-7",
    timestamp: ago(2),
    level: "DEBUG",
    service: "redis",
    environment: "production",
    message: "Cache hit for key session:usr-4821",
    traceId: "mno678pqr901",
    spanId: "span-007",
    host: "redis-pod-1",
    metadata: { key: "session:usr-4821", ttl: 3600 },
  },
  {
    id: "log-8",
    timestamp: ago(3),
    level: "FATAL",
    service: "postgresql",
    environment: "production",
    message: "Out of shared memory: could not resize shared memory segment",
    host: "pg-primary",
    metadata: { sharedMemory: "256MB", required: "512MB" },
  },
];

// ── Error Groups ────────────────────────────────────────────────────────────

export const MOCK_ERROR_GROUPS: ErrorGroup[] = [
  {
    id: "err-1",
    fingerprint: "a82f3c91d44e",
    type: "SQLTransientConnectionException",
    message: "HikariPool-1 - Connection is not available, request timed out after 30000ms",
    service: "payment-service",
    environment: "production",
    severity: "CRITICAL",
    occurrences: 12843,
    firstSeenAt: ago(92),
    lastSeenAt: ago(0.2),
    stackTrace: `java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30000ms
    at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:213)
    at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:100)
    at com.elora.payments.repository.PaymentRepository.save(PaymentRepository.java:44)`,
    resolved: false,
  },
  {
    id: "err-2",
    fingerprint: "b91e4d82a11f",
    type: "DatabaseQueryTimeoutException",
    message: "Database query timeout after 5000ms executing prepared statement",
    service: "inventory-service",
    environment: "production",
    severity: "HIGH",
    occurrences: 8412,
    firstSeenAt: ago(88),
    lastSeenAt: ago(0.5),
    stackTrace: `com.elora.inventory.exception.DatabaseQueryTimeoutException: Database query timeout after 5000ms
    at com.elora.inventory.db.InventoryRepository.findBySku(InventoryRepository.java:78)
    at com.elora.inventory.service.InventoryService.checkStock(InventoryService.java:122)`,
    resolved: false,
  },
  {
    id: "err-3",
    fingerprint: "c44f1a92b38d",
    type: "PaymentGatewayException",
    message: "Downstream payment processor timeout — ORDER_PAYMENT_FAILED",
    service: "order-service",
    environment: "production",
    severity: "HIGH",
    occurrences: 5890,
    firstSeenAt: ago(85),
    lastSeenAt: ago(0.3),
    stackTrace: `com.elora.orders.exception.PaymentGatewayException: Downstream payment processor timeout
    at com.elora.orders.client.PaymentClient.charge(PaymentClient.java:55)
    at com.elora.orders.service.OrderService.placeOrder(OrderService.java:201)`,
    resolved: false,
  },
  {
    id: "err-4",
    fingerprint: "d55c2b71e49a",
    type: "NullPointerException",
    message: "Cannot invoke method getId() on null object reference in UserService",
    service: "api-gateway",
    environment: "production",
    severity: "MEDIUM",
    occurrences: 1240,
    firstSeenAt: ago(240),
    lastSeenAt: ago(45),
    stackTrace: `java.lang.NullPointerException: Cannot invoke method getId() on null object reference
    at com.elora.gateway.filter.AuthFilter.extractUser(AuthFilter.java:88)
    at com.elora.gateway.filter.AuthFilter.doFilter(AuthFilter.java:41)`,
    resolved: false,
  },
];

export const MOCK_ERROR_GROUP_DETAIL: ErrorGroupDetail = {
  ...MOCK_ERROR_GROUPS[0],
  trend: series(24, 520, 200),
  affectedServices: ["payment-service", "order-service", "api-gateway"],
  relatedTraces: ["abc123def456", "def789ghi012"],
  incidentId: "INC-10231",
  rootCause: "PostgreSQL connection pool exhaustion — max_connections (100) reached by payment-service",
  confidence: 0.91,
  aiExplanation:
    "Based on the sequence of events, PostgreSQL reached its maximum connection limit (100) at 10:30:01. " +
    "HikariCP connection pool in payment-service began timing out because no connections were available. " +
    "This cascaded upstream: inventory-service (which also uses PostgreSQL) began failing, followed by " +
    "order-service (which depends on both payment and inventory), and finally the API gateway began returning 500s.",
};

// ── Traces ─────────────────────────────────────────────────────────────────

export const MOCK_TRACE_SUMMARIES: TraceSummary[] = [
  {
    traceId: "abc123def456",
    rootService: "api-gateway",
    rootOperation: "POST /api/orders",
    totalDuration: 2840,
    startTime: ago(0.2),
    status: "ERROR",
    spanCount: 12,
    errorCount: 3,
  },
  {
    traceId: "def789ghi012",
    rootService: "api-gateway",
    rootOperation: "GET /api/inventory/check",
    totalDuration: 5210,
    startTime: ago(0.5),
    status: "ERROR",
    spanCount: 8,
    errorCount: 2,
  },
  {
    traceId: "ghi012jkl345",
    rootService: "api-gateway",
    rootOperation: "POST /api/payments",
    totalDuration: 1420,
    startTime: ago(1),
    status: "OK",
    spanCount: 9,
    errorCount: 0,
  },
  {
    traceId: "jkl345mno678",
    rootService: "api-gateway",
    rootOperation: "GET /api/orders/ORD-98001",
    totalDuration: 280,
    startTime: ago(2),
    status: "OK",
    spanCount: 5,
    errorCount: 0,
  },
];

export const MOCK_TRACE: Trace = {
  traceId: "abc123def456",
  rootService: "api-gateway",
  rootOperation: "POST /api/orders",
  totalDuration: 2840,
  startTime: ago(0.2),
  status: "ERROR",
  errorCount: 3,
  spanCount: 5,
  spans: [
    {
      spanId: "span-001",
      traceId: "abc123def456",
      service: "api-gateway",
      operation: "POST /api/orders",
      startTime: ago(0.2),
      duration: 2840,
      status: "ERROR",
      httpMethod: "POST",
      httpUrl: "/api/orders",
      httpStatusCode: 500,
      attributes: { "http.method": "POST", "http.url": "/api/orders", "peer.service": "order-service" },
      events: [],
      logs: [],
    },
    {
      spanId: "span-002",
      parentSpanId: "span-001",
      traceId: "abc123def456",
      service: "order-service",
      operation: "OrderService.placeOrder",
      startTime: ago(0.201),
      duration: 2700,
      status: "ERROR",
      attributes: { "orderId": "ORD-98821", "customerId": "usr-4821" },
      events: [{ timestamp: ago(0.22), name: "payment.retry", attributes: { attempt: 1 } }],
      logs: [],
      error: "PaymentGatewayException: Downstream payment processor timeout",
    },
    {
      spanId: "span-003",
      parentSpanId: "span-002",
      traceId: "abc123def456",
      service: "payment-service",
      operation: "PaymentService.processPayment",
      startTime: ago(0.205),
      duration: 2100,
      status: "ERROR",
      attributes: { "amount": 149.99, "currency": "USD" },
      events: [],
      logs: [],
      error: "SQLTransientConnectionException: HikariPool-1 - Connection is not available",
    },
    {
      spanId: "span-004",
      parentSpanId: "span-003",
      traceId: "abc123def456",
      service: "postgresql",
      operation: "INSERT INTO payments",
      startTime: ago(0.21),
      duration: 30000,
      status: "ERROR",
      attributes: { "db.system": "postgresql", "db.statement": "INSERT INTO payments (id, order_id, amount) VALUES (?, ?, ?)" },
      events: [],
      logs: [],
      error: "Connection timeout after 30000ms",
    },
    {
      spanId: "span-005",
      parentSpanId: "span-002",
      traceId: "abc123def456",
      service: "inventory-service",
      operation: "InventoryService.checkStock",
      startTime: ago(0.202),
      duration: 500,
      status: "OK",
      attributes: { "sku": "SKU-44821" },
      events: [],
      logs: [],
    },
  ],
};

// ── Incidents ──────────────────────────────────────────────────────────────

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: "inc-1",
    shortId: "INC-10231",
    title: "PostgreSQL Connection Pool Exhaustion",
    severity: "CRITICAL",
    status: "INVESTIGATING",
    affectedServices: ["postgresql", "payment-service", "inventory-service", "order-service", "api-gateway"],
    startedAt: ago(92),
    confidence: 0.91,
    rootCause: {
      description: "PostgreSQL connection pool exhaustion — max_connections (100) reached",
      confidence: 0.91,
      evidence: [
        "DB connection errors appeared 2 minutes before application errors",
        "HikariCP pool timeouts spiked across all services simultaneously",
        "PostgreSQL logs show max_connections limit reached at 10:30:01",
        "Payment service p95 latency increased from 220ms to 2.1s",
        "Error cascade followed DB → Inventory → Payment → Order → Gateway",
      ],
    },
    projectId: "proj-1",
    duration: 92 * 60,
  },
  {
    id: "inc-2",
    shortId: "INC-10230",
    title: "Order Service Memory Leak",
    severity: "HIGH",
    status: "IDENTIFIED",
    affectedServices: ["order-service"],
    startedAt: ago(240),
    resolvedAt: ago(120),
    confidence: 0.84,
    rootCause: {
      description: "Memory leak in order session cache — unclosed iterators",
      confidence: 0.84,
      evidence: [
        "JVM heap usage increased linearly over 4 hours",
        "GC pause times increased from 20ms to 800ms",
        "Order session cache grew unbounded",
      ],
    },
    projectId: "proj-1",
    duration: 120 * 60,
  },
  {
    id: "inc-3",
    shortId: "INC-10229",
    title: "Notification Service Latency Spike",
    severity: "MEDIUM",
    status: "RESOLVED",
    affectedServices: ["notification-service"],
    startedAt: ago(480),
    resolvedAt: ago(420),
    confidence: 0.78,
    projectId: "proj-1",
    duration: 60 * 60,
  },
];

export const MOCK_INCIDENT_DETAIL: IncidentDetail = {
  ...MOCK_INCIDENTS[0],
  timeline: [
    {
      id: "ev-1",
      timestamp: ago(92),
      type: "DETECTED",
      title: "Incident detected",
      description: "Sherlock detected anomalous error rate increase in postgresql",
      service: "postgresql",
    },
    {
      id: "ev-2",
      timestamp: ago(91.5),
      type: "EVIDENCE",
      title: "PostgreSQL max_connections reached",
      description: "FATAL: remaining connection slots are reserved for non-replication superuser connections",
      service: "postgresql",
    },
    {
      id: "ev-3",
      timestamp: ago(91),
      type: "EVIDENCE",
      title: "Inventory Service errors increase",
      description: "inventory-service error rate jumped from 0.2% to 4.8%",
      service: "inventory-service",
    },
    {
      id: "ev-4",
      timestamp: ago(90.5),
      type: "EVIDENCE",
      title: "Payment Service failures increase",
      description: "payment-service error rate jumped from 0.4% to 12.4%",
      service: "payment-service",
    },
    {
      id: "ev-5",
      timestamp: ago(90),
      type: "EVIDENCE",
      title: "Order Service failures increase",
      description: "order-service error rate jumped from 0.8% to 5.1%",
      service: "order-service",
    },
    {
      id: "ev-6",
      timestamp: ago(89.5),
      type: "EVIDENCE",
      title: "API Gateway 500 errors increase",
      description: "api-gateway 5xx rate jumped from 0.3% to 3.4%",
      service: "api-gateway",
    },
    {
      id: "ev-7",
      timestamp: ago(88),
      type: "STATUS_CHANGE",
      title: "Status changed to INVESTIGATING",
      description: "Root cause analysis initiated",
    },
  ],
  errorGroups: MOCK_ERROR_GROUPS.slice(0, 3),
  traceIds: ["abc123def456", "def789ghi012"],
  aiAnalysis:
    "The incident was caused by PostgreSQL connection pool exhaustion. At 10:30:01, the database reached its " +
    "maximum connection limit of 100. Services using HikariCP began experiencing connection timeouts as the pool " +
    "was saturated. The failure propagated upstream through the service dependency chain: PostgreSQL → Inventory → " +
    "Payment → Order → API Gateway. The likely trigger was an increase in long-running queries that held connections " +
    "for extended periods, preventing other services from acquiring connections.",
  recommendedActions: [
    "Immediately increase PostgreSQL max_connections or add a PgBouncer connection pooler",
    "Identify and terminate long-running queries using pg_stat_activity",
    "Review HikariCP minimumIdle and maximumPoolSize settings across services",
    "Add circuit breakers to prevent cascade failures",
    "Implement connection pool monitoring with alerting",
  ],
  relatedIncidents: ["INC-10228", "INC-10225"],
};

// ── Dependency Graph ────────────────────────────────────────────────────────

export const MOCK_DEPENDENCY_GRAPH: DependencyGraph = {
  nodes: MOCK_SERVICES,
  edges: [
    { source: "api-gateway", target: "order-service", requestCount: 421003, errorCount: 21471, avgLatency: 680 },
    { source: "order-service", target: "payment-service", requestCount: 389421, errorCount: 48289, avgLatency: 2100 },
    { source: "order-service", target: "inventory-service", requestCount: 312880, errorCount: 15071, avgLatency: 780 },
    { source: "order-service", target: "notification-service", requestCount: 88340, errorCount: 106, avgLatency: 95 },
    { source: "payment-service", target: "postgresql", requestCount: 9823441, errorCount: 1797610, avgLatency: 3200 },
    { source: "inventory-service", target: "postgresql", requestCount: 4210882, errorCount: 203163, avgLatency: 780 },
    { source: "order-service", target: "redis", requestCount: 4210882, errorCount: 1263, avgLatency: 2 },
    { source: "api-gateway", target: "redis", requestCount: 2890312, errorCount: 289, avgLatency: 2 },
    { source: "order-service", target: "kafka", requestCount: 2890312, errorCount: 289, avgLatency: 12 },
  ],
};

// ── API Endpoints ───────────────────────────────────────────────────────────

export const MOCK_API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: "api-1",
    method: "POST",
    path: "/api/orders",
    service: "order-service",
    environment: "production",
    requestCount: 124000,
    errorRate: 5.2,
    p95Latency: 2840,
    status: "CRITICAL",
    lastSeenAt: ago(0.1),
  },
  {
    id: "api-2",
    method: "POST",
    path: "/api/payments",
    service: "payment-service",
    environment: "production",
    requestCount: 98400,
    errorRate: 12.4,
    p95Latency: 2100,
    status: "CRITICAL",
    lastSeenAt: ago(0.1),
  },
  {
    id: "api-3",
    method: "GET",
    path: "/api/inventory/check",
    service: "inventory-service",
    environment: "production",
    requestCount: 312880,
    errorRate: 4.82,
    p95Latency: 780,
    status: "DEGRADED",
    lastSeenAt: ago(0.2),
  },
  {
    id: "api-4",
    method: "GET",
    path: "/api/orders/:id",
    service: "order-service",
    environment: "production",
    requestCount: 421003,
    errorRate: 0.42,
    p95Latency: 180,
    status: "HEALTHY",
    lastSeenAt: ago(0.5),
  },
  {
    id: "api-5",
    method: "GET",
    path: "/api/users/me",
    service: "api-gateway",
    environment: "production",
    requestCount: 882031,
    errorRate: 0.18,
    p95Latency: 95,
    status: "HEALTHY",
    lastSeenAt: ago(0.1),
  },
];

export const MOCK_API_SAMPLES: ApiSample[] = [
  {
    id: "sample-1",
    timestamp: ago(0.2),
    method: "POST",
    path: "/api/orders",
    statusCode: 500,
    duration: 2840,
    requestHeaders: {
      "Content-Type": "application/json",
      "Authorization": "Bearer eyJ...",
      "X-Request-ID": "req-88821",
      "X-Trace-ID": "abc123def456",
    },
    requestBody: JSON.stringify({ customerId: "usr-4821", items: [{ sku: "SKU-44821", qty: 2 }] }, null, 2),
    responseBody: JSON.stringify({ error: "DATABASE_TIMEOUT", message: "Unable to process order at this time" }, null, 2),
    traceId: "abc123def456",
  },
  {
    id: "sample-2",
    timestamp: ago(0.5),
    method: "POST",
    path: "/api/orders",
    statusCode: 200,
    duration: 280,
    requestHeaders: { "Content-Type": "application/json", "Authorization": "Bearer eyJ..." },
    requestBody: JSON.stringify({ customerId: "usr-3310", items: [{ sku: "SKU-21001", qty: 1 }] }, null, 2),
    responseBody: JSON.stringify({ orderId: "ORD-98820", status: "CONFIRMED", estimatedDelivery: "2024-12-15" }, null, 2),
    traceId: "jkl345mno678",
  },
];

// ── AI Chat ─────────────────────────────────────────────────────────────────

export const MOCK_AI_CONVERSATION: AiMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "Why is the payment API failing?",
    timestamp: ago(5),
  },
  {
    id: "msg-2",
    role: "assistant",
    content:
      "The Payment Service is experiencing **database connection timeouts** caused by PostgreSQL connection pool exhaustion.\n\n" +
      "**Likely root cause:** PostgreSQL `max_connections` (100) has been reached. HikariCP connection pools in payment-service " +
      "are unable to acquire new connections, causing request timeouts.\n\n" +
      "**Confidence:** 91%\n\n" +
      "**Recommended investigation:**\n" +
      "1. Check HikariCP connection pool usage: `SELECT count(*) FROM pg_stat_activity WHERE application_name = 'payment-service'`\n" +
      "2. Inspect long-running queries: `SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE state != 'idle' ORDER BY duration DESC`\n" +
      "3. Review `max_connections` setting in `postgresql.conf`",
    timestamp: ago(4.9),
    evidence: [
      "8,423 HikariCP connection timeout errors in last 90 minutes",
      "P95 latency increased from 220ms to 2.1s at 10:30:04",
      "PostgreSQL connection count at 100/100 (max_connections limit)",
      "Inventory service began failing 2 seconds before payment service",
    ],
    confidence: 0.91,
    recommendedActions: [
      "Add PgBouncer connection pooler",
      "Increase PostgreSQL max_connections to 200",
      "Kill long-running idle queries",
    ],
  },
];

// ── API Keys ────────────────────────────────────────────────────────────────

export const MOCK_API_KEYS: ApiKey[] = [
  {
    id: "key-1",
    name: "Production Ingest",
    prefix: "elr_prod_",
    createdAt: "2024-01-15T09:00:00Z",
    lastUsedAt: ago(0.5),
    status: "ACTIVE",
    projectId: "proj-1",
  },
  {
    id: "key-2",
    name: "Staging Ingest",
    prefix: "elr_stg_",
    createdAt: "2024-03-01T10:00:00Z",
    lastUsedAt: ago(12),
    status: "ACTIVE",
    projectId: "proj-1",
  },
  {
    id: "key-3",
    name: "CI/CD Pipeline",
    prefix: "elr_ci_",
    createdAt: "2024-06-10T08:00:00Z",
    lastUsedAt: ago(48),
    status: "REVOKED",
    projectId: "proj-1",
  },
];
