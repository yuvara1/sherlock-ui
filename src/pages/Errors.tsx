import { useState } from "react";
import {
  Search,
  Download,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  AlertCircle,
} from "lucide-react";
import { SherlockSelect } from "@/components/ui/SherlockSelect";

const ERROR_GROUPS = [
  {
    id: "eg-001",
    fingerprint: "a1b2c3d4",
    type: "TimeoutException",
    message:
      "Read timed out after 30000ms waiting for response from payment-provider-api",
    service: "payment-service",
    file: "PaymentClient.java:248",
    count: 4821,
    users: 1240,
    firstSeen: "2026-08-22T08:14:00Z",
    lastSeen: "2026-08-29T14:35:00Z",
    status: "open",
    severity: "critical",
    trend: [12, 18, 14, 22, 85, 312, 480, 392, 418, 502, 467, 389],
    traceId: "abc123def456",
    stack: [
      "com.sherlock.payment.client.PaymentClient.charge(PaymentClient.java:248)",
      "com.sherlock.payment.service.PaymentService.processPayment(PaymentService.java:142)",
      "com.sherlock.payment.controller.PaymentController.charge(PaymentController.java:88)",
      "java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)",
    ],
  },
  {
    id: "eg-002",
    fingerprint: "d4e5f6a7",
    type: "HikariPoolTimeoutException",
    message:
      "Connection is not available, request timed out after 30000ms — pool exhausted (50/50 connections)",
    service: "payment-service",
    file: "HikariPool.java:213",
    count: 1893,
    users: 0,
    firstSeen: "2026-08-29T13:44:00Z",
    lastSeen: "2026-08-29T14:48:00Z",
    status: "open",
    severity: "high",
    trend: [0, 0, 0, 0, 0, 2, 18, 142, 380, 521, 488, 344],
    traceId: "def789abc012",
    stack: [
      "com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:213)",
      "com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:100)",
      "com.sherlock.payment.repository.PaymentRepository.save(PaymentRepository.java:67)",
      "com.sherlock.payment.service.PaymentService.persistPayment(PaymentService.java:189)",
    ],
  },
  {
    id: "eg-003",
    fingerprint: "g7h8i9b2",
    type: "CircuitBreakerOpenException",
    message:
      "Circuit breaker for order-service → payment-service is OPEN. Calls are being rejected.",
    service: "order-service",
    file: "PaymentCircuitBreaker.java:54",
    count: 1122,
    users: 890,
    firstSeen: "2026-08-29T14:24:00Z",
    lastSeen: "2026-08-29T14:49:00Z",
    status: "open",
    severity: "high",
    trend: [0, 0, 0, 0, 0, 0, 0, 0, 4, 122, 489, 507],
    traceId: "fed321cba987",
    stack: [
      "io.github.resilience4j.circuitbreaker.CircuitBreakerStateMachine.acquirePermission(CircuitBreakerStateMachine.java:428)",
      "com.sherlock.order.client.PaymentClient.charge(PaymentClient.java:112)",
      "com.sherlock.order.service.OrderService.processOrder(OrderService.java:254)",
      "com.sherlock.order.controller.OrderController.create(OrderController.java:76)",
    ],
  },
  {
    id: "eg-004",
    fingerprint: "j1k2l3m4",
    type: "NullPointerException",
    message:
      "Cannot invoke method getUserProfile() on null user session — possible expired JWT",
    service: "user-service",
    file: "UserProfileService.java:92",
    count: 341,
    users: 341,
    firstSeen: "2026-08-27T11:00:00Z",
    lastSeen: "2026-08-29T12:18:00Z",
    status: "investigating",
    severity: "medium",
    trend: [8, 12, 9, 14, 11, 18, 22, 28, 31, 24, 19, 27],
    traceId: "aab112ccd334",
    stack: [
      "com.sherlock.user.service.UserProfileService.getUserProfile(UserProfileService.java:92)",
      "com.sherlock.user.service.UserProfileService.enrichRequest(UserProfileService.java:61)",
      "com.sherlock.user.filter.JwtAuthFilter.doFilter(JwtAuthFilter.java:44)",
    ],
  },
  {
    id: "eg-005",
    fingerprint: "m4n5o6p7",
    type: "OutOfMemoryError",
    message:
      "Java heap space — ML model inference consumed all available heap during batch scoring",
    service: "fraud-detection",
    file: "ModelInference.java:188",
    count: 12,
    users: 0,
    firstSeen: "2026-08-28T09:12:00Z",
    lastSeen: "2026-08-28T09:45:00Z",
    status: "resolved",
    severity: "high",
    trend: [0, 0, 0, 2, 6, 4, 0, 0, 0, 0, 0, 0],
    traceId: "qqr890stu234",
    stack: [
      "com.sherlock.fraud.ml.ModelInference.score(ModelInference.java:188)",
      "com.sherlock.fraud.service.FraudScoringService.batchScore(FraudScoringService.java:112)",
      "com.sherlock.fraud.scheduler.BatchScoringJob.run(BatchScoringJob.java:78)",
    ],
  },
  {
    id: "eg-006",
    fingerprint: "p7q8r9s0",
    type: "KafkaTimeoutException",
    message:
      "Timeout expired while fetching topic metadata after 60000ms — broker unavailable",
    service: "analytics-service",
    file: "KafkaConsumer.java:1048",
    count: 89,
    users: 0,
    firstSeen: "2026-08-27T18:42:00Z",
    lastSeen: "2026-08-27T20:57:00Z",
    status: "resolved",
    severity: "medium",
    trend: [0, 0, 0, 14, 28, 31, 16, 0, 0, 0, 0, 0],
    traceId: "vvw567xyz890",
    stack: [
      "org.apache.kafka.clients.consumer.KafkaConsumer.updateFetchPositions(KafkaConsumer.java:1048)",
      "com.sherlock.analytics.consumer.AnalyticsConsumer.poll(AnalyticsConsumer.java:88)",
      "com.sherlock.analytics.stream.StreamProcessor.process(StreamProcessor.java:54)",
    ],
  },
];

type SortDir = "asc" | "desc" | null;
type SortCol =
  | "type"
  | "service"
  | "count"
  | "users"
  | "lastSeen"
  | "severity"
  | "status"
  | null;

const SEV_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};
const STATUS_ORDER: Record<string, number> = {
  open: 0,
  investigating: 1,
  resolved: 2,
};

function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

function sevColor(s: string) {
  if (s === "critical")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    };
  if (s === "high")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    };
  if (s === "medium")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    };
  return { color: "var(--text-3)", bg: "var(--bg-3)", border: "var(--border)" };
}

function statusColor(s: string) {
  if (s === "open")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    };
  if (s === "investigating")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    };
  return {
    color: "var(--green)",
    bg: "var(--green-bg)",
    border: "var(--green-border)",
  };
}

function SparkBars({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
        height: 20,
        width: 52,
      }}
    >
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderRadius: 1,
            background: color,
            height: `${Math.max(2, (v / max) * 100)}%`,
            opacity: 0.4 + (i / data.length) * 0.6,
          }}
        />
      ))}
    </div>
  );
}

function CriticalDot() {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        width: 10,
        height: 10,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "var(--red)",
          opacity: 0.4,
          animation: "blink-ring 1.4s ease-in-out infinite",
        }}
      />
      <span
        style={{
          position: "relative",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "var(--red)",
          animation: "blink-dot 1.4s ease-in-out infinite",
        }}
      />
    </span>
  );
}

function SortIcon({
  col,
  sortCol,
  sortDir,
}: {
  col: SortCol;
  sortCol: SortCol;
  sortDir: SortDir;
}) {
  if (sortCol !== col || sortDir === null)
    return <ChevronsUpDown size={11} style={{ opacity: 0.35 }} />;
  if (sortDir === "asc") return <ChevronUp size={11} />;
  return <ChevronDown size={11} />;
}

function SortableTH({
  col,
  label,
  sortCol,
  sortDir,
  onSort,
  style,
}: {
  col: SortCol;
  label: string;
  sortCol: SortCol;
  sortDir: SortDir;
  onSort: (col: SortCol) => void;
  style?: React.CSSProperties;
}) {
  return (
    <div
      onClick={() => onSort(col)}
      style={{
        ...COL,
        ...style,
        display: "flex",
        alignItems: "center",
        gap: 4,
        cursor: "pointer",
        userSelect: "none",
        color: sortCol === col ? "var(--text-1)" : "var(--text-3)",
      }}
    >
      {label}
      <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
    </div>
  );
}

const SERVICES = [
  "all",
  "payment-service",
  "order-service",
  "user-service",
  "fraud-detection",
  "analytics-service",
];

const COL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "var(--text-3)",
  padding: "0 12px",
  whiteSpace: "nowrap",
};

export default function Errors() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sevFilter, setSevFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  function handleSort(col: SortCol) {
    if (sortCol !== col) {
      setSortCol(col);
      setSortDir("asc");
    } else if (sortDir === "asc") setSortDir("desc");
    else if (sortDir === "desc") {
      setSortCol(null);
      setSortDir(null);
    } else {
      setSortDir("asc");
    }
  }

  const filtered = ERROR_GROUPS.filter((eg) => {
    if (statusFilter !== "all" && eg.status !== statusFilter) return false;
    if (sevFilter !== "all" && eg.severity !== sevFilter) return false;
    if (serviceFilter !== "all" && eg.service !== serviceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !eg.message.toLowerCase().includes(q) &&
        !eg.type.toLowerCase().includes(q) &&
        !eg.service.includes(q) &&
        !eg.fingerprint.includes(q)
      )
        return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortCol || !sortDir) return 0;
    let cmp = 0;
    if (sortCol === "type") cmp = a.type.localeCompare(b.type);
    else if (sortCol === "service") cmp = a.service.localeCompare(b.service);
    else if (sortCol === "count") cmp = a.count - b.count;
    else if (sortCol === "users") cmp = a.users - b.users;
    else if (sortCol === "lastSeen")
      cmp = new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime();
    else if (sortCol === "severity")
      cmp = (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9);
    else if (sortCol === "status")
      cmp = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const openGroups = ERROR_GROUPS.filter((g) => g.status === "open");
  const totalErrors24h = openGroups.reduce((s, g) => s + g.count, 0);
  const uniqueGroups = openGroups.length;
  const affectedUsers = ERROR_GROUPS.reduce((s, g) => s + g.users, 0);
  const servicesImpacted = new Set(openGroups.map((g) => g.service)).size;

  const stats = [
    {
      label: "Total Errors (24h)",
      value: totalErrors24h.toLocaleString(),
      delta: "+12%",
      deltaUp: true,
    },
    {
      label: "Unique Groups",
      value: String(uniqueGroups),
      delta: "+2",
      deltaUp: true,
    },
    {
      label: "Affected Users",
      value: affectedUsers.toLocaleString(),
      delta: "-8%",
      deltaUp: false,
    },
    {
      label: "Services Impacted",
      value: String(servicesImpacted),
      delta: "0",
      deltaUp: false,
    },
  ];

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "Geist, sans-serif",
        fontSize: 13,
        color: "var(--text-1)",
      }}
    >
      <style>{`
        @keyframes blink-ring { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.6); } }
        @keyframes blink-dot  { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
      `}</style>

      {/* Page header */}
      <div
        className="responsive-page-header"
        style={{
          padding: "24px 32px 0",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          background: "var(--bg)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "-0.025em",
                margin: "0 0 4px",
                color: "var(--text-1)",
              }}
            >
              Errors
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
              Grouped error events by fingerprint and occurrence count
            </p>
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 14px",
              height: 32,
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text-2)",
              fontSize: 13,
              fontFamily: "Geist, sans-serif",
              cursor: "pointer",
              letterSpacing: "-0.01em",
            }}
          >
            <Download size={13} />
            Export
          </button>
        </div>

        {/* Stats row */}
        <div
          className="rg-kpi"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
            marginBottom: 20,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: "16px 20px",
                borderLeft: i > 0 ? "1px solid var(--border)" : "none",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-3)",
                  margin: "0 0 6px",
                }}
              >
                {s.label}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    fontFamily: "Geist Mono, monospace",
                    letterSpacing: "-0.04em",
                    color: "var(--text-1)",
                  }}
                >
                  {s.value}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "Geist Mono, monospace",
                    color: s.deltaUp ? "var(--red)" : "var(--green)",
                  }}
                >
                  {s.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingBottom: 16,
          }}
        >
          <div
            style={{
              position: "relative",
              flex: 1,
              minWidth: 200,
              maxWidth: 320,
            }}
          >
            <Search
              size={12}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-4)",
                pointerEvents: "none",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search errors..."
              style={{
                width: "100%",
                height: 32,
                padding: "0 10px 0 30px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-2)",
                color: "var(--text-1)",
                fontSize: 12,
                fontFamily: "Geist, sans-serif",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <SherlockSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All Status" },
              { value: "open", label: "Open" },
              { value: "investigating", label: "Investigating" },
              { value: "resolved", label: "Resolved" },
            ]}
            minWidth={130}
          />
          <SherlockSelect
            value={sevFilter}
            onChange={setSevFilter}
            options={[
              { value: "all", label: "All Severity" },
              { value: "critical", label: "Critical" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
            ]}
            minWidth={130}
          />
          <SherlockSelect
            value={serviceFilter}
            onChange={setServiceFilter}
            options={SERVICES.map((s) => ({
              value: s,
              label: s === "all" ? "All Services" : s,
            }))}
            minWidth={160}
          />
          <span style={{ fontSize: 12, color: "var(--text-4)", marginLeft: 4 }}>
            {sorted.length} result{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="responsive-data-surface" style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "28px 120px 1fr 140px 72px 64px 100px 84px 84px",
            minWidth: 720,
            alignItems: "center",
            height: 36,
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-2)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div />
          <div style={COL}>Fingerprint</div>
          <SortableTH
            col="type"
            label="Error"
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
          />
          <SortableTH
            col="service"
            label="Service"
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
          />
          <div style={{ ...COL, textAlign: "right" }}>Trend</div>
          <SortableTH
            col="count"
            label="Count"
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
            style={{ textAlign: "right", justifyContent: "flex-end" }}
          />
          <SortableTH
            col="users"
            label="Users"
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
            style={{ textAlign: "right", justifyContent: "flex-end" }}
          />
          <SortableTH
            col="lastSeen"
            label="Last Seen"
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
          />
          <SortableTH
            col="status"
            label="Status"
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
          />
        </div>

        {sorted.map((eg) => {
          const sv = sevColor(eg.severity);
          const st = statusColor(eg.status);
          const isExpanded = expanded === eg.id;
          const isCritical = eg.severity === "critical";
          return (
            <div
              key={eg.id}
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              {/* Row */}
              <div
                onClick={() => setExpanded(isExpanded ? null : eg.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "28px 120px 1fr 140px 72px 64px 100px 84px 84px",
                  minWidth: 720,
                  alignItems: "center",
                  height: 40,
                  cursor: "pointer",
                  background: isExpanded ? "var(--bg-2)" : "transparent",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!isExpanded)
                    e.currentTarget.style.background = "var(--bg-3)";
                }}
                onMouseLeave={(e) => {
                  if (!isExpanded)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Chevron */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-4)",
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                </div>

                {/* Fingerprint */}
                <div style={{ padding: "0 12px" }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "Geist Mono, monospace",
                      color: "var(--text-3)",
                    }}
                  >
                    {eg.fingerprint}
                  </span>
                </div>

                {/* Error type + message */}
                <div style={{ padding: "0 12px", minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      minWidth: 0,
                    }}
                  >
                    {isCritical ? (
                      <CriticalDot />
                    ) : (
                      <AlertCircle
                        size={12}
                        style={{ color: sv.color, flexShrink: 0 }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "Geist Mono, monospace",
                        fontWeight: 600,
                        color: sv.color,
                        flexShrink: 0,
                      }}
                    >
                      {eg.type}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-2)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {eg.message}
                    </span>
                  </div>
                </div>

                {/* Service */}
                <div style={{ padding: "0 12px" }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "Geist Mono, monospace",
                      color: "var(--text-3)",
                    }}
                  >
                    {eg.service}
                  </span>
                </div>

                {/* Trend spark */}
                <div
                  style={{
                    padding: "0 12px",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <SparkBars data={eg.trend} color={sv.color} />
                </div>

                {/* Count */}
                <div style={{ padding: "0 12px", textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: "Geist Mono, monospace",
                      fontWeight: 600,
                      color: "var(--text-1)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {eg.count.toLocaleString()}
                  </span>
                </div>

                {/* Users */}
                <div style={{ padding: "0 12px", textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: "Geist Mono, monospace",
                      color: eg.users > 0 ? "var(--red)" : "var(--text-4)",
                    }}
                  >
                    {eg.users.toLocaleString()}
                  </span>
                </div>

                {/* Last Seen */}
                <div style={{ padding: "0 12px" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "Geist Mono, monospace",
                      color: "var(--text-3)",
                    }}
                  >
                    {ago(eg.lastSeen)}
                  </span>
                </div>

                {/* Status badge */}
                <div style={{ padding: "0 12px" }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: "2px 7px",
                      borderRadius: 4,
                      color: st.color,
                      background: st.bg,
                      border: `1px solid ${st.border}`,
                      textTransform: "capitalize",
                    }}
                  >
                    {eg.status}
                  </span>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    background: "var(--bg-2)",
                    padding: "16px 32px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {/* Meta */}
                  <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                    {[
                      {
                        label: "Fingerprint",
                        value: eg.fingerprint,
                        mono: true,
                      },
                      { label: "Trace ID", value: eg.traceId, mono: true },
                      {
                        label: "First Seen",
                        value: ago(eg.firstSeen),
                        mono: false,
                      },
                      {
                        label: "Last Seen",
                        value: ago(eg.lastSeen),
                        mono: false,
                      },
                      { label: "Source", value: eg.file, mono: true },
                      {
                        label: "Severity",
                        value: eg.severity,
                        mono: false,
                        badge: sevColor(eg.severity),
                      },
                    ].map((m) => (
                      <div key={m.label}>
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--text-4)",
                            margin: "0 0 3px",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            fontWeight: 500,
                          }}
                        >
                          {m.label}
                        </p>
                        {m.badge ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 11,
                              fontWeight: 500,
                              padding: "2px 7px",
                              borderRadius: 4,
                              color: m.badge.color,
                              background: m.badge.bg,
                              border: `1px solid ${m.badge.border}`,
                              textTransform: "capitalize",
                            }}
                          >
                            {m.value === "critical" && <CriticalDot />}
                            {m.value}
                          </span>
                        ) : (
                          <p
                            style={{
                              fontSize: 12,
                              fontFamily: m.mono
                                ? "Geist Mono, monospace"
                                : "Geist, sans-serif",
                              color: "var(--text-2)",
                              margin: 0,
                            }}
                          >
                            {m.value}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Stack trace */}
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "var(--text-4)",
                        margin: "0 0 8px",
                      }}
                    >
                      Stack Trace
                    </p>
                    <div
                      style={{
                        padding: "12px 16px",
                        borderRadius: 8,
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        fontFamily: "Geist Mono, monospace",
                        fontSize: 12,
                        lineHeight: 1.8,
                      }}
                    >
                      {eg.stack.map((line, i) => (
                        <div
                          key={i}
                          style={{
                            color: i === 0 ? "var(--red)" : "var(--text-3)",
                          }}
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {["View Trace", "Search Logs", "Create Incident"].map(
                      (label) => (
                        <button
                          key={label}
                          style={{
                            height: 32,
                            padding: "0 14px",
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                            background: "var(--bg)",
                            color: "var(--text-2)",
                            fontSize: 13,
                            fontFamily: "Geist, sans-serif",
                            cursor: "pointer",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {label}
                        </button>
                      ),
                    )}
                    {eg.status !== "resolved" && (
                      <button
                        style={{
                          height: 32,
                          padding: "0 14px",
                          borderRadius: 6,
                          border: "1px solid var(--green-border)",
                          background: "var(--green-bg)",
                          color: "var(--green)",
                          fontSize: 13,
                          fontFamily: "Geist, sans-serif",
                          fontWeight: 500,
                          cursor: "pointer",
                          marginLeft: "auto",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div
            style={{ padding: 64, textAlign: "center", color: "var(--text-4)" }}
          >
            <p style={{ fontSize: 13, margin: 0 }}>
              No errors match your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
