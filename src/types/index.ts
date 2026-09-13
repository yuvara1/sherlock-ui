// ── Core enumerations ──────────────────────────────────────────────────────

export type Severity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentStatus =
  | "DETECTED"
  | "INVESTIGATING"
  | "IDENTIFIED"
  | "MITIGATING"
  | "RESOLVED"
  | "CLOSED";

export type ServiceHealth = "HEALTHY" | "DEGRADED" | "CRITICAL" | "UNKNOWN";

export type LogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export type Environment = "development" | "staging" | "production";

export type SpanStatus = "OK" | "ERROR" | "UNSET";

// ── User & Auth ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  avatarUrl?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ── Project ────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  environments: Environment[];
  serviceCount: number;
  lastEventAt: string;
  createdAt: string;
  status: ServiceHealth;
}

// ── Service ────────────────────────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  projectId: string;
  environment: Environment;
  health: ServiceHealth;
  requestCount: number;
  errorRate: number;
  p95Latency: number;
  p99Latency: number;
  lastSeenAt: string;
  language?: string;
  version?: string;
}

// ── Metrics ────────────────────────────────────────────────────────────────

export interface MetricPoint {
  timestamp: string;
  value: number;
}

export interface ProjectMetrics {
  totalRequests: number;
  requestsDelta: number;
  errorRate: number;
  errorRateDelta: number;
  p95Latency: number;
  p95LatencyDelta: number;
  p99Latency: number;
  p99LatencyDelta: number;
  activeIncidents: number;
  servicesDown: number;
  requestSeries: MetricPoint[];
  errorSeries: MetricPoint[];
  latencySeries: MetricPoint[];
}

// ── Logs ──────────────────────────────────────────────────────────────────

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  environment: Environment;
  message: string;
  traceId?: string;
  spanId?: string;
  requestId?: string;
  host?: string;
  metadata?: Record<string, unknown>;
  stackTrace?: string;
}

export interface LogFilters {
  search?: string;
  level?: LogLevel[];
  service?: string[];
  environment?: Environment;
  traceId?: string;
  requestId?: string;
  from?: string;
  to?: string;
}

// ── Error Groups ────────────────────────────────────────────────────────────

export interface ErrorGroup {
  id: string;
  fingerprint: string;
  type: string;
  message: string;
  service: string;
  environment: Environment;
  severity: Severity;
  occurrences: number;
  firstSeenAt: string;
  lastSeenAt: string;
  stackTrace: string;
  resolved: boolean;
  assignee?: string;
}

export interface ErrorGroupDetail extends ErrorGroup {
  trend: MetricPoint[];
  affectedServices: string[];
  relatedTraces: string[];
  incidentId?: string;
  rootCause?: string;
  confidence?: number;
  aiExplanation?: string;
}

// ── Traces ─────────────────────────────────────────────────────────────────

export interface Span {
  spanId: string;
  parentSpanId?: string;
  traceId: string;
  service: string;
  operation: string;
  startTime: string;
  duration: number;
  status: SpanStatus;
  httpMethod?: string;
  httpUrl?: string;
  httpStatusCode?: number;
  attributes: Record<string, string | number | boolean>;
  events: SpanEvent[];
  logs: string[];
  error?: string;
}

export interface SpanEvent {
  timestamp: string;
  name: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface Trace {
  traceId: string;
  rootService: string;
  rootOperation: string;
  totalDuration: number;
  startTime: string;
  status: SpanStatus;
  spans: Span[];
  errorCount: number;
  spanCount: number;
}

export interface TraceSummary {
  traceId: string;
  rootService: string;
  rootOperation: string;
  totalDuration: number;
  startTime: string;
  status: SpanStatus;
  spanCount: number;
  errorCount: number;
}

// ── Incidents ──────────────────────────────────────────────────────────────

export interface IncidentEvent {
  id: string;
  timestamp: string;
  type: "DETECTED" | "STATUS_CHANGE" | "COMMENT" | "EVIDENCE" | "RESOLVED";
  title: string;
  description: string;
  service?: string;
  author?: string;
}

export interface RootCause {
  description: string;
  confidence: number;
  evidence: string[];
}

export interface Incident {
  id: string;
  shortId: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  affectedServices: string[];
  startedAt: string;
  resolvedAt?: string;
  duration?: number;
  confidence: number;
  rootCause?: RootCause;
  projectId: string;
}

export interface IncidentDetail extends Incident {
  timeline: IncidentEvent[];
  errorGroups: ErrorGroup[];
  traceIds: string[];
  aiAnalysis?: string;
  recommendedActions?: string[];
  relatedIncidents?: string[];
}

// ── Dependencies ───────────────────────────────────────────────────────────

export interface DependencyEdge {
  source: string;
  target: string;
  requestCount: number;
  errorCount: number;
  avgLatency: number;
}

export interface DependencyGraph {
  nodes: Service[];
  edges: DependencyEdge[];
}

// ── APIs ───────────────────────────────────────────────────────────────────

export interface ApiEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  service: string;
  environment: Environment;
  requestCount: number;
  errorRate: number;
  p95Latency: number;
  status: ServiceHealth;
  lastSeenAt: string;
}

export interface ApiSample {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  traceId?: string;
}

// ── AI ─────────────────────────────────────────────────────────────────────

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  evidence?: string[];
  confidence?: number;
  recommendedActions?: string[];
}

export interface AiAnalysis {
  summary: string;
  evidence: string[];
  rootCause: string;
  confidence: number;
  recommendedActions: string[];
  disclaimer: string;
}

// ── API Keys ───────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
  status: "ACTIVE" | "REVOKED";
  projectId?: string;
}

// ── Pagination ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ── Notification settings ──────────────────────────────────────────────────

export interface NotificationChannel {
  type: "EMAIL" | "WEBHOOK" | "SLACK";
  enabled: boolean;
  config: Record<string, string>;
}

export interface NotificationRule {
  id: string;
  event: "INCIDENT_CREATED" | "CRITICAL_INCIDENT" | "ROOT_CAUSE_DETECTED" | "INCIDENT_RESOLVED" | "AI_ANALYSIS_COMPLETED";
  channels: NotificationChannel[];
  severityThreshold: Severity;
  enabled: boolean;
}
