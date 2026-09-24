import { useState } from "react";
import {
  Search,
  GitBranch,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  X,
  Clock,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SherlockSelect } from "@/components/ui/SherlockSelect";

const TRACES = [
  {
    id: "abc123def456780a",
    service: "payment-service",
    op: "POST /v1/payments/charge",
    dur: 4532,
    spans: 8,
    errors: 2,
    ts: "2026-09-22T14:35:12Z",
    status: "error",
  },
  {
    id: "fed789abc012345b",
    service: "order-service",
    op: "POST /v1/orders",
    dur: 842,
    spans: 12,
    errors: 1,
    ts: "2026-09-22T14:34:58Z",
    status: "error",
  },
  {
    id: "aab112ccd334556c",
    service: "user-service",
    op: "GET /v1/users/profile",
    dur: 1280,
    spans: 3,
    errors: 0,
    ts: "2026-09-22T14:34:48Z",
    status: "timeout",
  },
  {
    id: "xyz789uvw456123d",
    service: "notification-svc",
    op: "POST /v1/notifications/send",
    dur: 1820,
    spans: 5,
    errors: 1,
    ts: "2026-09-22T14:34:44Z",
    status: "error",
  },
  {
    id: "lmn123opq456789e",
    service: "inventory-api",
    op: "PUT /v1/inventory/reserve",
    dur: 98,
    spans: 4,
    errors: 0,
    ts: "2026-09-22T14:33:10Z",
    status: "success",
  },
  {
    id: "qqr890stu234567f",
    service: "fraud-detection",
    op: "POST /v1/fraud/evaluate",
    dur: 623,
    spans: 6,
    errors: 0,
    ts: "2026-09-22T14:33:02Z",
    status: "success",
  },
  {
    id: "vvw567xyz890123g",
    service: "analytics-service",
    op: "POST /v1/events/track",
    dur: 44,
    spans: 2,
    errors: 0,
    ts: "2026-09-22T14:32:55Z",
    status: "success",
  },
  {
    id: "bbc223dde445678h",
    service: "payment-service",
    op: "POST /v1/payments/charge",
    dur: 3912,
    spans: 8,
    errors: 1,
    ts: "2026-09-22T14:32:40Z",
    status: "error",
  },
  {
    id: "zzA123bcD456789i",
    service: "user-service",
    op: "GET /v1/users/me",
    dur: 28,
    spans: 2,
    errors: 0,
    ts: "2026-09-22T14:32:21Z",
    status: "success",
  },
  {
    id: "efG789hiJ012345j",
    service: "order-service",
    op: "GET /v1/orders?page=1",
    dur: 1240,
    spans: 7,
    errors: 0,
    ts: "2026-09-22T14:32:10Z",
    status: "timeout",
  },
  {
    id: "klM345noP678901k",
    service: "inventory-api",
    op: "GET /v1/inventory/check",
    dur: 55,
    spans: 3,
    errors: 0,
    ts: "2026-09-22T14:31:58Z",
    status: "success",
  },
  {
    id: "qrS901tuV234567l",
    service: "payment-service",
    op: "POST /v1/payments/refund",
    dur: 2100,
    spans: 9,
    errors: 0,
    ts: "2026-09-22T14:31:44Z",
    status: "timeout",
  },
  {
    id: "mno456pqr789012m",
    service: "auth-service",
    op: "POST /v1/auth/token",
    dur: 88,
    spans: 4,
    errors: 0,
    ts: "2026-09-22T14:31:30Z",
    status: "success",
  },
  {
    id: "stu789vwx012345n",
    service: "api-gateway",
    op: "GET /v1/health",
    dur: 12,
    spans: 1,
    errors: 0,
    ts: "2026-09-22T14:31:10Z",
    status: "success",
  },
];

const SPANS_BY_TRACE: Record<
  string,
  Array<{
    name: string;
    service: string;
    dur: number;
    error: boolean;
    offset: number;
  }>
> = {
  abc123def456780a: [
    {
      name: "POST /v1/payments/charge",
      service: "api-gateway",
      dur: 4532,
      error: false,
      offset: 0,
    },
    {
      name: "AuthMiddleware.validate",
      service: "api-gateway",
      dur: 22,
      error: false,
      offset: 0,
    },
    {
      name: "RateLimit.check",
      service: "api-gateway",
      dur: 6,
      error: false,
      offset: 22,
    },
    {
      name: "PaymentService.processCharge",
      service: "payment-service",
      dur: 4505,
      error: false,
      offset: 30,
    },
    {
      name: "RiskEngine.evaluate",
      service: "payment-service",
      dur: 85,
      error: false,
      offset: 30,
    },
    {
      name: "HikariPool.getConnection",
      service: "payment-service",
      dur: 30000,
      error: true,
      offset: 120,
    },
    {
      name: "PostgreSQL.executeQuery",
      service: "payment-service",
      dur: 4380,
      error: true,
      offset: 120,
    },
    {
      name: "AuditLog.write",
      service: "payment-service",
      dur: 8,
      error: false,
      offset: 4520,
    },
  ],
  fed789abc012345b: [
    {
      name: "POST /v1/orders",
      service: "api-gateway",
      dur: 842,
      error: false,
      offset: 0,
    },
    {
      name: "OrderService.createOrder",
      service: "order-service",
      dur: 820,
      error: false,
      offset: 10,
    },
    {
      name: "InventoryAPI.reserveStock",
      service: "inventory-api",
      dur: 98,
      error: false,
      offset: 20,
    },
    {
      name: "Redis.get sku=PROD-881",
      service: "inventory-api",
      dur: 2,
      error: false,
      offset: 22,
    },
    {
      name: "PaymentService.processCharge",
      service: "payment-service",
      dur: 503,
      error: true,
      offset: 120,
    },
    {
      name: "NotificationSvc.sendConfirm",
      service: "notification-svc",
      dur: 44,
      error: false,
      offset: 640,
    },
    {
      name: "Kafka.produce order.created",
      service: "order-service",
      dur: 12,
      error: false,
      offset: 690,
    },
    {
      name: "DB.insertOrder",
      service: "order-service",
      dur: 38,
      error: false,
      offset: 705,
    },
  ],
  bbc223dde445678h: [
    {
      name: "POST /v1/payments/charge",
      service: "api-gateway",
      dur: 3912,
      error: false,
      offset: 0,
    },
    {
      name: "AuthMiddleware.validate",
      service: "api-gateway",
      dur: 18,
      error: false,
      offset: 0,
    },
    {
      name: "PaymentService.processCharge",
      service: "payment-service",
      dur: 3890,
      error: false,
      offset: 24,
    },
    {
      name: "Redis.get session:u882",
      service: "payment-service",
      dur: 3,
      error: false,
      offset: 28,
    },
    {
      name: "StripeAPI.chargeCard",
      service: "payment-service",
      dur: 2800,
      error: false,
      offset: 35,
    },
    {
      name: "PostgreSQL.insertPayment",
      service: "payment-service",
      dur: 890,
      error: true,
      offset: 2840,
    },
    {
      name: "Kafka.produce payment.failed",
      service: "payment-service",
      dur: 11,
      error: false,
      offset: 3800,
    },
    {
      name: "AuditLog.write",
      service: "payment-service",
      dur: 6,
      error: false,
      offset: 3900,
    },
  ],
};

const DEFAULT_SPANS = [
  {
    name: "HTTP Handler",
    service: "api-gateway",
    dur: 100,
    error: false,
    offset: 0,
  },
  {
    name: "Middleware",
    service: "api-gateway",
    dur: 80,
    error: false,
    offset: 5,
  },
  {
    name: "DB.query",
    service: "api-gateway",
    dur: 40,
    error: false,
    offset: 55,
  },
];

/* ── Service color map ───────────────────────────────────── */
const SVC_COLORS: Record<string, string> = {
  "api-gateway": "#6366f1",
  "payment-service": "#ef4444",
  "order-service": "#3b82f6",
  "inventory-api": "#10b981",
  "notification-svc": "#f59e0b",
  "fraud-detection": "#8b5cf6",
  "auth-service": "#06b6d4",
};
function svcColor(s: string) {
  return SVC_COLORS[s] ?? "#737373";
}

type SortDir = "asc" | "desc" | null;
type SortCol = "traceId" | "spans" | "duration" | "status" | "timestamp" | null;

const STATUS_ORDER: Record<string, number> = {
  error: 0,
  timeout: 1,
  success: 2,
};

function statusTokens(s: string) {
  if (s === "error")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    };
  if (s === "timeout")
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

function fmtDur(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}
function fmtTs(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
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
  children,
}: {
  col: SortCol;
  label: string;
  sortCol: SortCol;
  sortDir: SortDir;
  onSort: (col: SortCol) => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
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
      {children}
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

const SERVICES_OPTS = [
  { value: "all", label: "All Services" },
  "payment-service",
  "order-service",
  "user-service",
  "notification-svc",
  "inventory-api",
  "fraud-detection",
  "analytics-service",
  "auth-service",
  "api-gateway",
];
const TIME_OPTS = ["Last 1h", "Last 6h", "Last 24h", "Last 7d"];

/* ── Waterfall Modal ─────────────────────────────────────── */
function WaterfallModal({
  traceId,
  onClose,
}: {
  traceId: string;
  onClose: () => void;
}) {
  const [selectedId, setSelectedId] = useState(traceId);
  const trace = TRACES.find((t) => t.id === selectedId) ?? TRACES[0];
  const spans = SPANS_BY_TRACE[selectedId] ?? DEFAULT_SPANS;
  const totalDur = trace.dur;

  const services = Array.from(new Set(spans.map((s) => s.service)));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border-2)",
          borderRadius: 12,
          width: "min(900px, 95vw)",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <GitBranch size={15} style={{ color: "var(--accent)" }} />
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "var(--text-1)",
              }}
            >
              Trace Waterfall
            </span>
            <span
              style={{
                fontSize: 11,
                fontFamily: "Geist Mono, monospace",
                color: "var(--text-4)",
                background: "var(--bg-3)",
                padding: "2px 8px",
                borderRadius: 4,
                border: "1px solid var(--border)",
              }}
            >
              {selectedId.slice(0, 16)}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Trace picker */}
            <SherlockSelect
              value={selectedId}
              onChange={setSelectedId}
              options={TRACES.map((t) => ({
                value: t.id,
                label: `${t.service} — ${t.op.slice(0, 28)}`,
              }))}
              minWidth={280}
              placeholder="Select trace…"
            />
            <button
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-2)",
                cursor: "pointer",
                color: "var(--text-3)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-3)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--bg-2)")
              }
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Trace meta strip */}
        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          {[
            { label: "Root Service", value: trace.service },
            { label: "Total Duration", value: fmtDur(trace.dur) },
            { label: "Spans", value: String(trace.spans) },
            {
              label: "Errors",
              value: trace.errors > 0 ? String(trace.errors) : "None",
            },
            { label: "Status", value: trace.status },
            { label: "Timestamp", value: fmtTs(trace.ts) },
          ].map((m, i) => {
            const isError = m.label === "Errors" && trace.errors > 0;
            const isStatus = m.label === "Status";
            const st = isStatus ? statusTokens(trace.status) : null;
            return (
              <div
                key={m.label}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderLeft: i > 0 ? "1px solid var(--border)" : "none",
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-4)",
                    margin: "0 0 4px",
                  }}
                >
                  {m.label}
                </p>
                {isStatus ? (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: st!.color,
                      fontFamily: "Geist, sans-serif",
                    }}
                  >
                    {m.value}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "Geist Mono, monospace",
                      fontWeight: 600,
                      color: isError ? "var(--red)" : "var(--text-1)",
                    }}
                  >
                    {m.value}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Service legend */}
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "10px 20px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          {services.map((svc) => (
            <span
              key={svc}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: "var(--text-3)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: svcColor(svc),
                  flexShrink: 0,
                }}
              />
              {svc}
            </span>
          ))}
          {trace.errors > 0 && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: "var(--red)",
                marginLeft: "auto",
              }}
            >
              <AlertCircle size={11} />
              Error spans shown in red
            </span>
          )}
        </div>

        {/* Timeline ruler */}
        <div
          className="trace-ruler"
          style={{
            padding: "0 20px",
            paddingLeft: 260,
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <div style={{ position: "relative", height: 24 }}>
            {[0, 0.25, 0.5, 0.75, 1].map((p) => (
              <span
                key={p}
                style={{
                  position: "absolute",
                  left: `${p * 100}%`,
                  fontSize: 10,
                  fontFamily: "Geist Mono, monospace",
                  color: "var(--text-4)",
                  transform:
                    p === 1
                      ? "translateX(-100%)"
                      : p > 0.5
                        ? "translateX(-50%)"
                        : undefined,
                  top: 4,
                }}
              >
                {fmtDur(Math.round(totalDur * p))}
              </span>
            ))}
          </div>
        </div>

        {/* Waterfall rows */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 20px" }}>
          {spans.map((span, i) => {
            const pct = Math.max(
              2,
              (Math.min(span.dur, totalDur) / totalDur) * 100,
            );
            const offPct = Math.min((span.offset / totalDur) * 100, 98 - pct);
            const color = span.error ? "var(--red)" : svcColor(span.service);

            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "240px 1fr 80px",
                  alignItems: "center",
                  height: 34,
                  gap: 0,
                  borderBottom:
                    i < spans.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                {/* Span name */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    paddingRight: 12,
                    minWidth: 0,
                  }}
                >
                  {span.error ? (
                    <CriticalDot />
                  ) : (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 2,
                        background: svcColor(span.service),
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "Geist Mono, monospace",
                      color: span.error ? "var(--red)" : "var(--text-2)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {span.name}
                  </span>
                </div>

                {/* Bar track */}
                <div
                  style={{
                    position: "relative",
                    height: 16,
                    background: "var(--bg-3)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.035,
                      ease: "easeOut",
                    }}
                    style={{
                      position: "absolute",
                      left: `${offPct}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: color,
                      opacity: span.error ? 1 : 0.75,
                    }}
                  />
                  {/* Tick marks */}
                  {[0.25, 0.5, 0.75].map((p) => (
                    <div
                      key={p}
                      style={{
                        position: "absolute",
                        left: `${p * 100}%`,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        background: "var(--border)",
                        opacity: 0.6,
                      }}
                    />
                  ))}
                </div>

                {/* Duration */}
                <div style={{ textAlign: "right", paddingLeft: 12 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "Geist Mono, monospace",
                      color: span.error
                        ? "var(--red)"
                        : span.dur > totalDur * 0.5
                          ? "var(--yellow)"
                          : "var(--text-4)",
                    }}
                  >
                    {fmtDur(span.dur)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 20px",
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: "var(--text-4)",
              }}
            >
              <Clock size={11} />
              Total:{" "}
              <strong
                style={{
                  color: "var(--text-2)",
                  fontFamily: "Geist Mono, monospace",
                }}
              >
                {fmtDur(totalDur)}
              </strong>
            </span>
            <span style={{ fontSize: 11, color: "var(--text-4)" }}>·</span>
            <span style={{ fontSize: 11, color: "var(--text-4)" }}>
              {spans.length} spans across {services.length} service
              {services.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Copy Trace ID", "Search Logs", "View in Context"].map(
              (label) => (
                <button
                  key={label}
                  style={{
                    height: 30,
                    padding: "0 12px",
                    borderRadius: 5,
                    border: "1px solid var(--border)",
                    background: "var(--bg-2)",
                    color: "var(--text-2)",
                    fontSize: 12,
                    fontFamily: "Geist, sans-serif",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-3)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--bg-2)")
                  }
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Stats ───────────────────────────────────────────────── */
const totalTraces = TRACES.length;
const avgDuration = Math.round(
  TRACES.reduce((s, t) => s + t.dur, 0) / TRACES.length,
);
const errorTraces = TRACES.filter((t) => t.status === "error").length;
const p99Trace = [...TRACES].sort((a, b) => b.dur - a.dur)[0];

/* ── Page ────────────────────────────────────────────────── */
export default function Traces() {
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("Last 1h");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [waterfallId, setWaterfallId] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  function handleSort(col: SortCol) {
    if (sortCol !== col) {
      setSortCol(col);
      setSortDir("asc");
    } else if (sortDir === "asc") setSortDir("desc");
    else {
      setSortCol(null);
      setSortDir(null);
    }
  }

  const filtered = TRACES.filter((t) => {
    if (serviceFilter !== "all" && t.service !== serviceFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !t.id.includes(q) &&
        !t.service.includes(q) &&
        !t.op.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortCol || !sortDir) return 0;
    let cmp = 0;
    if (sortCol === "traceId") cmp = a.id.localeCompare(b.id);
    else if (sortCol === "spans") cmp = a.spans - b.spans;
    else if (sortCol === "duration") cmp = a.dur - b.dur;
    else if (sortCol === "status")
      cmp = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
    else if (sortCol === "timestamp")
      cmp = new Date(a.ts).getTime() - new Date(b.ts).getTime();
    return sortDir === "asc" ? cmp : -cmp;
  });

  const stats = [
    {
      label: "Total Traces",
      value: totalTraces.toLocaleString(),
      sub: "last 1h",
    },
    { label: "Avg Duration", value: fmtDur(avgDuration), sub: "mean" },
    {
      label: "Error Traces",
      value: String(errorTraces),
      sub: `${Math.round((errorTraces / totalTraces) * 100)}% error rate`,
    },
    {
      label: "P99 Duration",
      value: fmtDur(p99Trace?.dur ?? 0),
      sub: "99th percentile",
    },
  ];

  /* default waterfall = first error trace */
  const defaultWaterfallId =
    TRACES.find((t) => t.status === "error")?.id ?? TRACES[0].id;

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
              Traces
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
              Distributed request traces across all services
            </p>
          </div>
          <button
            onClick={() => setWaterfallId(defaultWaterfallId)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 14px",
              height: 32,
              borderRadius: 6,
              border: "1px solid var(--accent-border)",
              background: "var(--accent-bg)",
              color: "var(--accent)",
              fontSize: 13,
              fontFamily: "Geist, sans-serif",
              cursor: "pointer",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(50,145,255,0.14)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--accent-bg)")
            }
          >
            <GitBranch size={13} />
            View Waterfall
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
                  {s.sub}
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
              maxWidth: 300,
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
              placeholder="Search by trace ID, service..."
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
            value={serviceFilter}
            onChange={setServiceFilter}
            options={SERVICES_OPTS}
            minWidth={160}
          />
          <SherlockSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All Status" },
              { value: "success", label: "Success" },
              { value: "error", label: "Error" },
              { value: "timeout", label: "Timeout" },
            ]}
            minWidth={120}
          />
          <SherlockSelect
            value={timeRange}
            onChange={setTimeRange}
            options={TIME_OPTS}
            minWidth={110}
          />
          <span style={{ fontSize: 12, color: "var(--text-4)", marginLeft: 4 }}>
            {sorted.length} trace{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="responsive-data-surface" style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>
        {/* Header */}
        <div
          className="trace-waterfall-row"
          style={{
            display: "grid",
            gridTemplateColumns: "28px 180px 1fr 140px 72px 100px 100px 84px",
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
          <SortableTH
            col="traceId"
            label="Trace ID"
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
          >
            <GitBranch size={11} style={{ opacity: 0.6, marginRight: 2 }} />
          </SortableTH>
          <div style={COL}>Root Service / Operation</div>
          <SortableTH
            col="spans"
            label="Spans"
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
          />
          <SortableTH
            col="duration"
            label="Duration"
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
            style={{ textAlign: "right", justifyContent: "flex-end" }}
          />
          <SortableTH
            col="timestamp"
            label="Timestamp"
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
          <div style={COL}>Errors</div>
        </div>

        {sorted.map((t) => {
          const ss = statusTokens(t.status);
          const isExpanded = expanded === t.id;
          const isError = t.status === "error";
          const spans = SPANS_BY_TRACE[t.id] ?? DEFAULT_SPANS;
          const maxDur = Math.max(...spans.map((s) => s.dur), 1);

          return (
            <div key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <div
                onClick={() => setExpanded(isExpanded ? null : t.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "28px 180px 1fr 140px 72px 100px 100px 84px",
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
                <div style={{ padding: "0 12px" }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "Geist Mono, monospace",
                      color: "var(--text-3)",
                    }}
                  >
                    {t.id.slice(0, 16)}
                  </span>
                </div>
                <div style={{ padding: "0 12px", minWidth: 0 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 2,
                        background: svcColor(t.service),
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "Geist Mono, monospace",
                        color: "var(--text-4)",
                        flexShrink: 0,
                      }}
                    >
                      {t.service}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: "Geist Mono, monospace",
                        color: "var(--text-2)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.op}
                    </span>
                  </div>
                </div>
                <div style={{ padding: "0 12px" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "Geist Mono, monospace",
                      color: "var(--text-3)",
                    }}
                  >
                    {t.spans} spans
                  </span>
                </div>
                <div style={{ padding: "0 12px", textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: "Geist Mono, monospace",
                      fontWeight: 600,
                      color:
                        t.dur > 2000
                          ? "var(--red)"
                          : t.dur > 800
                            ? "var(--yellow)"
                            : "var(--text-1)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {fmtDur(t.dur)}
                  </span>
                </div>
                <div style={{ padding: "0 12px" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "Geist Mono, monospace",
                      color: "var(--text-3)",
                    }}
                  >
                    {fmtTs(t.ts)}
                  </span>
                </div>
                <div style={{ padding: "0 12px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11,
                      fontWeight: 500,
                      padding: "2px 7px",
                      borderRadius: 4,
                      color: ss.color,
                      background: ss.bg,
                      border: `1px solid ${ss.border}`,
                      textTransform: "capitalize",
                    }}
                  >
                    {isError && <CriticalDot />}
                    {t.status}
                  </span>
                </div>
                <div style={{ padding: "0 12px" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "Geist Mono, monospace",
                      color: t.errors > 0 ? "var(--red)" : "var(--text-4)",
                    }}
                  >
                    {t.errors > 0
                      ? `${t.errors} error${t.errors > 1 ? "s" : ""}`
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Inline mini-waterfall on expand */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        borderTop: "1px solid var(--border)",
                        background: "var(--bg-2)",
                        padding: "16px 32px 20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            color: "var(--text-4)",
                            margin: 0,
                          }}
                        >
                          Span Waterfall
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setWaterfallId(t.id);
                          }}
                          style={{
                            height: 26,
                            padding: "0 10px",
                            borderRadius: 5,
                            border: "1px solid var(--accent-border)",
                            background: "var(--accent-bg)",
                            color: "var(--accent)",
                            fontSize: 11,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <GitBranch size={11} /> Open full waterfall
                        </button>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {spans.map((span, i) => {
                          const pct = Math.max(
                            3,
                            (Math.min(span.dur, maxDur) / maxDur) * 100,
                          );
                          const offPct = Math.min(
                            (span.offset / maxDur) * 100,
                            97 - pct,
                          );
                          return (
                            <div
                              key={i}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "240px 1fr 72px",
                                alignItems: "center",
                                gap: 12,
                                height: 28,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  minWidth: 0,
                                }}
                              >
                                {span.error ? (
                                  <CriticalDot />
                                ) : (
                                  <span
                                    style={{
                                      width: 5,
                                      height: 5,
                                      borderRadius: 2,
                                      flexShrink: 0,
                                      background: svcColor(span.service),
                                    }}
                                  />
                                )}
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontFamily: "Geist Mono, monospace",
                                    color: "var(--text-2)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {span.name}
                                </span>
                              </div>
                              <div
                                style={{
                                  position: "relative",
                                  height: 14,
                                  background: "var(--bg-3)",
                                  borderRadius: 3,
                                  overflow: "hidden",
                                }}
                              >
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{
                                    duration: 0.35,
                                    delay: i * 0.04,
                                    ease: "easeOut",
                                  }}
                                  style={{
                                    position: "absolute",
                                    left: `${offPct}%`,
                                    height: "100%",
                                    borderRadius: 3,
                                    background: span.error
                                      ? "var(--red)"
                                      : svcColor(span.service),
                                    opacity: 0.75,
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontFamily: "Geist Mono, monospace",
                                  color: span.error
                                    ? "var(--red)"
                                    : "var(--text-4)",
                                  textAlign: "right",
                                }}
                              >
                                {fmtDur(span.dur)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div
            style={{ padding: 64, textAlign: "center", color: "var(--text-4)" }}
          >
            <p style={{ fontSize: 13, margin: 0 }}>
              No traces match your filters
            </p>
          </div>
        )}
      </div>

      {/* Waterfall modal */}
      {waterfallId && (
        <WaterfallModal
          traceId={waterfallId}
          onClose={() => setWaterfallId(null)}
        />
      )}
    </div>
  );
}
