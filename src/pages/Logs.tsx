import { useState, useMemo } from "react";
import {
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  XCircle,
  AlertTriangle,
  Info,
  Bug,
} from "lucide-react";
import { SherlockSelect } from "@/components/ui/SherlockSelect";

const LOGS = [
  {
    id: 1,
    ts: "14:35:12.441",
    level: "ERROR",
    service: "payment-service",
    message:
      "HikariPool-1 — Connection is not available, request timed out after 30000ms",
  },
  {
    id: 2,
    ts: "14:35:11.221",
    level: "ERROR",
    service: "payment-service",
    message:
      "Failed to process payment charge: timeout acquiring DB connection after 30000ms",
  },
  {
    id: 3,
    ts: "14:35:10.100",
    level: "WARN",
    service: "payment-service",
    message:
      "HikariPool-1 — Pool stats (total=50, active=50, idle=0, waiting=12)",
  },
  {
    id: 4,
    ts: "14:35:09.002",
    level: "INFO",
    service: "payment-service",
    message:
      "Processing charge request: amount=10000 currency=USD customer_id=cust_8a2bc31",
  },
  {
    id: 5,
    ts: "14:35:08.001",
    level: "DEBUG",
    service: "payment-service",
    message:
      "RiskEngine.evaluate() completed in 85ms — score=0.12 decision=allow",
  },
  {
    id: 6,
    ts: "14:34:58.881",
    level: "ERROR",
    service: "order-service",
    message:
      "Upstream dependency payment-service returned 503 Service Unavailable after 3 retries",
  },
  {
    id: 7,
    ts: "14:34:57.334",
    level: "WARN",
    service: "order-service",
    message: "Retry attempt 2/3 for payment-service call — backing off 500ms",
  },
  {
    id: 8,
    ts: "14:34:56.100",
    level: "WARN",
    service: "order-service",
    message: "Retry attempt 1/3 for payment-service call — backing off 200ms",
  },
  {
    id: 9,
    ts: "14:34:55.010",
    level: "INFO",
    service: "order-service",
    message: "Creating order: items=3 total=15990 customer_id=cust_8a2bc31",
  },
  {
    id: 10,
    ts: "14:34:50.100",
    level: "INFO",
    service: "user-service",
    message:
      "JWT validation completed in 312ms — cache miss for kid: RS256-2026-Q3",
  },
  {
    id: 11,
    ts: "14:34:48.002",
    level: "DEBUG",
    service: "user-service",
    message:
      "Fetching public key from JWKS endpoint: https://auth.internal/.well-known/jwks.json",
  },
  {
    id: 12,
    ts: "14:34:47.001",
    level: "DEBUG",
    service: "user-service",
    message:
      "Bearer token parsed — sub=usr_9a1bc24 iat=1724940000 exp=1724943600",
  },
  {
    id: 13,
    ts: "14:34:45.221",
    level: "INFO",
    service: "notification-svc",
    message:
      "Email notification queued: recipient=user@example.com template=payment_failed",
  },
  {
    id: 14,
    ts: "14:34:44.003",
    level: "ERROR",
    service: "notification-svc",
    message:
      "SES send failed: Throttling — Maximum sending rate exceeded (14 msg/s limit)",
  },
  {
    id: 15,
    ts: "14:34:40.001",
    level: "WARN",
    service: "notification-svc",
    message:
      "SES sending rate approaching limit — current: 13.2 msg/s throttle: 14 msg/s",
  },
  {
    id: 16,
    ts: "14:34:35.009",
    level: "INFO",
    service: "inventory-api",
    message: "Reserved stock: sku=PROD-881 qty=1 warehouse=US-EAST-1",
  },
  {
    id: 17,
    ts: "14:34:34.002",
    level: "DEBUG",
    service: "inventory-api",
    message: "Redis cache hit for sku=PROD-881 — TTL remaining: 284s",
  },
  {
    id: 18,
    ts: "14:34:20.881",
    level: "WARN",
    service: "payment-service",
    message:
      "HikariPool-1 — Pool stats (total=50, active=48, idle=2, waiting=0) — near saturation",
  },
  {
    id: 19,
    ts: "14:34:10.002",
    level: "ERROR",
    service: "fraud-detection",
    message:
      "Model inference timeout after 500ms — falling back to rule-based engine",
  },
  {
    id: 20,
    ts: "14:34:05.001",
    level: "WARN",
    service: "fraud-detection",
    message:
      "ML model load time elevated: 420ms — expected <100ms (cold start?)",
  },
  {
    id: 21,
    ts: "14:33:58.100",
    level: "INFO",
    service: "analytics-service",
    message:
      "Kafka consumer lag: topic=payment-events partition=0 lag=14821 — alerting threshold=10000",
  },
  {
    id: 22,
    ts: "14:33:45.003",
    level: "INFO",
    service: "user-service",
    message:
      "Rate limiter: IP 104.28.x.x throttled — 1200 req/min exceeded limit 1000 req/min",
  },
  {
    id: 23,
    ts: "14:33:30.009",
    level: "DEBUG",
    service: "order-service",
    message:
      "Inventory reservation lock acquired in 12ms for order_id=ord_7b3de99",
  },
  {
    id: 24,
    ts: "14:33:10.442",
    level: "INFO",
    service: "payment-service",
    message:
      "Charge processed successfully: amount=4500 currency=USD charge_id=ch_3NxP1qEi",
  },
  {
    id: 25,
    ts: "14:33:00.001",
    level: "DEBUG",
    service: "payment-service",
    message:
      "PostgreSQL query executed in 38ms: SELECT * FROM payment_methods WHERE customer_id=$1 LIMIT 1",
  },
  {
    id: 26,
    ts: "14:32:50.112",
    level: "INFO",
    service: "api-gateway",
    message:
      "Request routed: POST /v1/payments/charge → payment-service:8080 in 2ms",
  },
  {
    id: 27,
    ts: "14:32:44.002",
    level: "WARN",
    service: "api-gateway",
    message:
      "Circuit breaker half-open — allowing 1 probe request to payment-service",
  },
  {
    id: 28,
    ts: "14:32:40.771",
    level: "ERROR",
    service: "api-gateway",
    message:
      "Circuit breaker OPEN for payment-service — all requests rejected for 30s window",
  },
  {
    id: 29,
    ts: "14:32:35.009",
    level: "DEBUG",
    service: "inventory-api",
    message: "PostgreSQL pool acquired in 1ms (total=10, active=2, idle=8)",
  },
  {
    id: 30,
    ts: "14:32:20.003",
    level: "INFO",
    service: "auth-service",
    message:
      "Token issued: sub=usr_9a1bc24 scope=read:profile,write:orders ttl=3600s",
  },
];

const SERVICES = [
  "all",
  "payment-service",
  "order-service",
  "user-service",
  "notification-svc",
  "inventory-api",
  "fraud-detection",
  "analytics-service",
  "api-gateway",
  "auth-service",
];
const LEVELS = ["all", "ERROR", "WARN", "INFO", "DEBUG"];
const TIME_OPTS = ["Last 1h", "Last 6h", "Last 24h", "Last 7d"];

const LEVEL_ORDER: Record<string, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

type SortDir = "asc" | "desc" | null;
type SortCol = "level" | "service" | "timestamp" | null;

function levelStyle(l: string): { color: string; bg: string; border: string } {
  if (l === "ERROR")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    };
  if (l === "WARN")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    };
  if (l === "INFO")
    return {
      color: "var(--accent)",
      bg: "var(--accent-bg)",
      border: "var(--accent-border)",
    };
  return { color: "var(--text-4)", bg: "var(--bg-3)", border: "var(--border)" };
}

function LevelIcon({ level }: { level: string }) {
  const size = 12;
  const style = levelStyle(level);
  if (level === "ERROR")
    return (
      <XCircle size={size} style={{ color: style.color, flexShrink: 0 }} />
    );
  if (level === "WARN")
    return (
      <AlertTriangle
        size={size}
        style={{ color: style.color, flexShrink: 0 }}
      />
    );
  if (level === "INFO")
    return <Info size={size} style={{ color: style.color, flexShrink: 0 }} />;
  return <Bug size={size} style={{ color: style.color, flexShrink: 0 }} />;
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

const COL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "var(--text-3)",
  padding: "0 12px",
  whiteSpace: "nowrap",
};

export default function Logs() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("Last 1h");
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
    } else setSortDir("asc");
  }

  const filtered = useMemo(
    () =>
      LOGS.filter((l) => {
        if (levelFilter !== "all" && l.level !== levelFilter) return false;
        if (serviceFilter !== "all" && l.service !== serviceFilter)
          return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !l.message.toLowerCase().includes(q) &&
            !l.service.includes(q) &&
            !l.ts.includes(q)
          )
            return false;
        }
        return true;
      }),
    [search, levelFilter, serviceFilter],
  );

  const sorted = useMemo(() => {
    if (!sortCol || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortCol === "level")
        cmp = (LEVEL_ORDER[a.level] ?? 9) - (LEVEL_ORDER[b.level] ?? 9);
      else if (sortCol === "service") cmp = a.service.localeCompare(b.service);
      else if (sortCol === "timestamp") cmp = a.ts.localeCompare(b.ts);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const errorCount = LOGS.filter((l) => l.level === "ERROR").length;
  const warnCount = LOGS.filter((l) => l.level === "WARN").length;
  const infoCount = LOGS.filter((l) => l.level === "INFO").length;
  const services = new Set(LOGS.map((l) => l.service)).size;

  const stats = [
    {
      label: "Total Logs (24h)",
      value: LOGS.length.toLocaleString(),
      delta: "+4.2k/h",
    },
    {
      label: "Error Logs",
      value: String(errorCount),
      delta: `${Math.round((errorCount / LOGS.length) * 100)}%`,
    },
    {
      label: "Warning Logs",
      value: String(warnCount),
      delta: `${Math.round((warnCount / LOGS.length) * 100)}%`,
    },
    { label: "Services", value: String(services), delta: "active" },
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
              Logs
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
              Real-time log stream from all services
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

        {/* Stats */}
        <div
          className="rg-kpi"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
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
                <span style={{ fontSize: 12, color: "var(--text-4)" }}>
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
              placeholder="Search logs..."
              style={{
                width: "100%",
                height: 32,
                padding: "0 10px 0 30px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-2)",
                color: "var(--text-1)",
                fontSize: 12,
                fontFamily: "Geist Mono, monospace",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <SherlockSelect
            value={levelFilter}
            onChange={setLevelFilter}
            options={LEVELS.map((l) => ({
              value: l,
              label: l === "all" ? "All Levels" : l,
            }))}
            minWidth={120}
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
          <SherlockSelect
            value={timeRange}
            onChange={setTimeRange}
            options={TIME_OPTS.map((t) => ({ value: t, label: t }))}
            minWidth={110}
          />

          {/* Level pills */}
          <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
            {["ERROR", "WARN", "INFO", "DEBUG"].map((l) => {
              const ls = levelStyle(l);
              const active = levelFilter === l;
              return (
                <button
                  key={l}
                  onClick={() => setLevelFilter(active ? "all" : l)}
                  style={{
                    height: 28,
                    padding: "0 10px",
                    borderRadius: 4,
                    border: `1px solid ${active ? ls.border : "var(--border)"}`,
                    background: active ? ls.bg : "transparent",
                    color: active ? ls.color : "var(--text-4)",
                    fontSize: 11,
                    fontFamily: "Geist Mono, monospace",
                    cursor: "pointer",
                    transition: "all 0.1s",
                  }}
                >
                  {l}
                </button>
              );
            })}
          </div>

          <span style={{ fontSize: 12, color: "var(--text-4)", marginLeft: 4 }}>
            {sorted.length} entries
          </span>
        </div>
      </div>

      {/* Log stream */}
      <div className="responsive-data-surface" style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "116px 92px 160px 1fr",
            minWidth: 640,
            alignItems: "center",
            height: 36,
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-2)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <SortableTH
            col="timestamp"
            label="Timestamp"
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
          />
          <SortableTH
            col="level"
            label="Level"
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
          <div style={COL}>Message</div>
        </div>

        {sorted.map((log, i) => {
          const ls = levelStyle(log.level);
          const isError = log.level === "ERROR";
          return (
            <div
              key={log.id}
              style={{
                display: "grid",
                gridTemplateColumns: "116px 92px 160px 1fr",
                minWidth: 640,
                alignItems: "center",
                height: 36,
                borderBottom: "1px solid var(--border)",
                background: isError
                  ? "rgba(var(--red-rgb, 239,68,68), 0.04)"
                  : i % 2 === 0
                    ? "transparent"
                    : "transparent",
                transition: "background 0.08s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-3)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = isError
                  ? "rgba(239,68,68,0.04)"
                  : "transparent")
              }
            >
              {/* Timestamp */}
              <div style={{ padding: "0 12px" }}>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "Geist Mono, monospace",
                    color: "var(--text-4)",
                  }}
                >
                  {log.ts}
                </span>
              </div>

              {/* Level badge + icon */}
              <div
                style={{
                  padding: "0 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <LevelIcon level={log.level} />
                {isError ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 10,
                      fontWeight: 600,
                      fontFamily: "Geist Mono, monospace",
                      letterSpacing: "0.04em",
                      padding: "2px 6px",
                      borderRadius: 4,
                      color: ls.color,
                      background: ls.bg,
                      border: `1px solid ${ls.border}`,
                    }}
                  >
                    <CriticalDot />
                    {log.level}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      fontFamily: "Geist Mono, monospace",
                      letterSpacing: "0.04em",
                      padding: "2px 6px",
                      borderRadius: 4,
                      color: ls.color,
                      background: ls.bg,
                      border: `1px solid ${ls.border}`,
                    }}
                  >
                    {log.level}
                  </span>
                )}
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
                  {log.service}
                </span>
              </div>

              {/* Message */}
              <div style={{ padding: "0 12px", minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "Geist Mono, monospace",
                    color: isError ? "var(--red)" : "var(--text-2)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {log.message}
                </span>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div
            style={{ padding: 64, textAlign: "center", color: "var(--text-4)" }}
          >
            <p style={{ fontSize: 13, margin: 0 }}>
              No logs match your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
