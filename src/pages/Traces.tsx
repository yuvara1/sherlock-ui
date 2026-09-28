import { useState } from "react"
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
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { SherlockSelect } from "@/components/ui/SherlockSelect"
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
]
const SPANS_BY_TRACE: Record<string, Array<{
  name: string
  service: string
  dur: number
  error: boolean
  offset: number
}>> = {
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
}
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
]
/* ── Service color map ───────────────────────────────────── */
const SVC_COLORS: Record<string, string> = {
  "api-gateway": "#6366f1",
  "payment-service": "#ef4444",
  "order-service": "#3b82f6",
  "inventory-api": "#10b981",
  "notification-svc": "#f59e0b",
  "fraud-detection": "#8b5cf6",
  "auth-service": "#06b6d4",
}
function svcColor(s: string) {
  return SVC_COLORS[s] ?? "#737373"
}
type SortDir = "asc" | "desc" | null
type SortCol = "traceId" | "spans" | "duration" | "status" | "timestamp" | null
const STATUS_ORDER: Record<string, number> = {
  error: 0,
  timeout: 1,
  success: 2,
}
function statusTokens(s: string) {
  if (s === "error")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    }
  if (s === "timeout")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    }
  return {
    color: "var(--green)",
    bg: "var(--green-bg)",
    border: "var(--green-border)",
  }
}
function fmtDur(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`
}
function fmtTs(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}
function CriticalDot() {
  return (
    <span className="[position:relative] [display:inline-flex] [width:10px] [height:10px] [flex-shrink:0]">
      <span className="[position:absolute] [inset:0] [border-radius:50%] [background:var(--red)] [opacity:0.4] [animation:blink-ring_1.4s_ease-in-out_infinite]" />
      <span className="[position:relative] [width:10px] [height:10px] [border-radius:50%] [background:var(--red)] [animation:blink-dot_1.4s_ease-in-out_infinite]" />
    </span>
  )
}
function SortIcon({
  col,
  sortCol,
  sortDir,
}: {
  col: SortCol
  sortCol: SortCol
  sortDir: SortDir
}) {
  if (sortCol !== col || sortDir === null)
    return <ChevronsUpDown size={11} className="[opacity:0.35]" />
  if (sortDir === "asc") return <ChevronUp size={11} />
  return <ChevronDown size={11} />
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
  col: SortCol
  label: string
  sortCol: SortCol
  sortDir: SortDir
  onSort: (col: SortCol) => void
  style?: React.CSSProperties
  children?: React.ReactNode
}) {
  return (
    <div
      onClick={() => onSort(col)}
      style={{
        ...style,
      }}
      className={[
        [
          "[display:flex] [align-items:center] [gap:4px] [cursor:pointer] [user-select:none]",
          sortCol === col ? "[color:var(--text-1)]" : "[color:var(--text-3)]",
        ]
          .filter(Boolean)
          .join(" "),
        "[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-3)] [padding:0_12px] [white-space:nowrap]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
      {label}
      <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
    </div>
  )
}
const COL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "var(--text-3)",
  padding: "0 12px",
  whiteSpace: "nowrap",
}
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
]
const TIME_OPTS = ["Last 1h", "Last 6h", "Last 24h", "Last 7d"]
/* ── Waterfall Modal ─────────────────────────────────────── */
function WaterfallModal({
  traceId,
  onClose,
}: {
  traceId: string
  onClose: () => void
}) {
  const [selectedId, setSelectedId] = useState(traceId)
  const trace = TRACES.find((t) => t.id === selectedId) ?? TRACES[0]
  const spans = SPANS_BY_TRACE[selectedId] ?? DEFAULT_SPANS
  const totalDur = trace.dur
  const services = Array.from(new Set(spans.map((s) => s.service)))
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="[position:fixed] [inset:0] [z-index:200] [background:rgba(0,0,0,0.65)] [display:flex] [align-items:center] [justify-content:center]"
    >
      <div className="[background:var(--bg)] [border:1px_solid_var(--border-2)] [border-radius:12px] [width:min(900px,_95vw)] [max-height:88vh] [display:flex] [flex-direction:column] [overflow:hidden] [box-shadow:0_32px_80px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="[display:flex] [align-items:center] [justify-content:space-between] [padding:16px_20px] [border-bottom:1px_solid_var(--border)] [flex-shrink:0]">
          <div className="[display:flex] [align-items:center] [gap:10px]">
            <GitBranch size={15} className="[color:var(--accent)]" />
            <span className="[font-size:15px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)]">
              Trace Waterfall
            </span>
            <span className="[font-size:11px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)] [background:var(--bg-3)] [padding:2px_8px] [border-radius:4px] [border:1px_solid_var(--border)]">
              {selectedId.slice(0, 16)}
            </span>
          </div>
          <div className="[display:flex] [align-items:center] [gap:8px]">
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
              className="[display:flex] [align-items:center] [justify-content:center] [width:28px] [height:28px] [border-radius:6px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [cursor:pointer] [color:var(--text-3)] hover:[background:var(--bg-3)]"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Trace meta strip */}
        <div className="[display:flex] [gap:0] [border-bottom:1px_solid_var(--border)] [flex-shrink:0]">
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
            const isError = m.label === "Errors" && trace.errors > 0
            const isStatus = m.label === "Status"
            const st = isStatus ? statusTokens(trace.status) : null
            return (
              <div
                key={m.label}
                className={[
                  "[flex:1] [padding:10px_16px]",
                  i > 0
                    ? "[border-left:1px_solid_var(--border)]"
                    : "[border-left:none]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <p className="[font-size:10px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.06em] [color:var(--text-4)] [margin:0_0_4px]">
                  {m.label}
                </p>
                {isStatus ? (
                  <span
                    style={{
                      color: st!.color,
                    }}
                    className="[font-size:12px] [font-weight:500] [font-family:Geist,_sans-serif]"
                  >
                    {m.value}
                  </span>
                ) : (
                  <span
                    className={[
                      "[font-size:12px] [font-family:Geist_Mono,_monospace] [font-weight:600]",
                      isError ? "[color:var(--red)]" : "[color:var(--text-1)]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {m.value}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Service legend */}
        <div className="[display:flex] [gap:12px] [padding:10px_20px] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [flex-wrap:wrap]">
          {services.map((svc) => (
            <span
              key={svc}
              className="[display:flex] [align-items:center] [gap:5px] [font-size:11px] [color:var(--text-3)]"
            >
              <span
                style={{
                  background: svcColor(svc),
                }}
                className="[width:8px] [height:8px] [border-radius:2px] [flex-shrink:0]"
              />
              {svc}
            </span>
          ))}
          {trace.errors > 0 && (
            <span className="[display:flex] [align-items:center] [gap:5px] [font-size:11px] [color:var(--red)] [margin-left:auto]">
              <AlertCircle size={11} />
              Error spans shown in red
            </span>
          )}
        </div>

        {/* Timeline ruler */}
        <div className="min-w-0 max-[640px]:pl-0 [padding:0_20px] [padding-left:260px] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [position:relative]">
          <div className="[position:relative] [height:24px]">
            {[0, 0.25, 0.5, 0.75, 1].map((p) => (
              <span
                key={p}
                style={{
                  left: `${p * 100}%`,
                  transform:
                    p === 1
                      ? "translateX(-100%)"
                      : p > 0.5
                        ? "translateX(-50%)"
                        : undefined,
                }}
                className="[position:absolute] [font-size:10px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)] [top:4px]"
              >
                {fmtDur(Math.round(totalDur * p))}
              </span>
            ))}
          </div>
        </div>

        {/* Waterfall rows */}
        <div className="[flex:1] [overflow-y:auto] [padding:8px_20px_20px]">
          {spans.map((span, i) => {
            const pct = Math.max(
              2,
              (Math.min(span.dur, totalDur) / totalDur) * 100,
            )
            const offPct = Math.min((span.offset / totalDur) * 100, 98 - pct)
            const color = span.error ? "var(--red)" : svcColor(span.service)
            return (
              <div
                key={i}
                className={[
                  "[display:grid] [grid-template-columns:240px_1fr_80px] [align-items:center] [height:34px] [gap:0]",
                  i < spans.length - 1
                    ? "[border-bottom:1px_solid_var(--border)]"
                    : "[border-bottom:none]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* Span name */}
                <div className="[display:flex] [align-items:center] [gap:6px] [padding-right:12px] [min-width:0]">
                  {span.error ? (
                    <CriticalDot />
                  ) : (
                    <span
                      style={{
                        background: svcColor(span.service),
                      }}
                      className="[width:6px] [height:6px] [border-radius:2px] [flex-shrink:0]"
                    />
                  )}
                  <span
                    className={[
                      "[font-size:11px] [font-family:Geist_Mono,_monospace] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]",
                      span.error
                        ? "[color:var(--red)]"
                        : "[color:var(--text-2)]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {span.name}
                  </span>
                </div>

                {/* Bar track */}
                <div className="[position:relative] [height:16px] [background:var(--bg-3)] [border-radius:3px] [overflow:hidden]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.035,
                      ease: "easeOut",
                    }}
                    style={{
                      left: `${offPct}%`,
                      background: color,
                    }}
                    className={[
                      "[position:absolute] [height:100%] [border-radius:3px]",
                      span.error ? "[opacity:1]" : "[opacity:0.75]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                  {/* Tick marks */}
                  {[0.25, 0.5, 0.75].map((p) => (
                    <div
                      key={p}
                      style={{
                        left: `${p * 100}%`,
                      }}
                      className="[position:absolute] [top:0] [bottom:0] [width:1px] [background:var(--border)] [opacity:0.6]"
                    />
                  ))}
                </div>

                {/* Duration */}
                <div className="[text-align:right] [padding-left:12px]">
                  <span
                    style={{
                      color: span.error
                        ? "var(--red)"
                        : span.dur > totalDur * 0.5
                          ? "var(--yellow)"
                          : "var(--text-4)",
                    }}
                    className="[font-size:11px] [font-family:Geist_Mono,_monospace]"
                  >
                    {fmtDur(span.dur)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="[display:flex] [justify-content:space-between] [align-items:center] [padding:12px_20px] [border-top:1px_solid_var(--border)] [flex-shrink:0]">
          <div className="[display:flex] [gap:6px]">
            <span className="[display:flex] [align-items:center] [gap:5px] [font-size:11px] [color:var(--text-4)]">
              <Clock size={11} />
              Total:{" "}
              <strong className="[color:var(--text-2)] [font-family:Geist_Mono,_monospace]">
                {fmtDur(totalDur)}
              </strong>
            </span>
            <span className="[font-size:11px] [color:var(--text-4)]">·</span>
            <span className="[font-size:11px] [color:var(--text-4)]">
              {spans.length} spans across {services.length} service
              {services.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="[display:flex] [gap:8px]">
            {["Copy Trace ID", "Search Logs", "View in Context"].map(
              (label) => (
                <button
                  key={label}
                  className="[height:30px] [padding:0_12px] [border-radius:5px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [color:var(--text-2)] [font-size:12px] [font-family:Geist,_sans-serif] [cursor:pointer] hover:[background:var(--bg-3)]"
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
/* ── Stats ───────────────────────────────────────────────── */
const totalTraces = TRACES.length
const avgDuration = Math.round(
  TRACES.reduce((s, t) => s + t.dur, 0) / TRACES.length,
)
const errorTraces = TRACES.filter((t) => t.status === "error").length
const p99Trace = [...TRACES].sort((a, b) => b.dur - a.dur)[0]
/* ── Page ────────────────────────────────────────────────── */
export default function Traces() {
  const [search, setSearch] = useState("")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [timeRange, setTimeRange] = useState("Last 1h")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [waterfallId, setWaterfallId] = useState<string | null>(null)
  const [sortCol, setSortCol] = useState<SortCol>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  function handleSort(col: SortCol) {
    if (sortCol !== col) {
      setSortCol(col)
      setSortDir("asc")
    } else if (sortDir === "asc") setSortDir("desc")
    else {
      setSortCol(null)
      setSortDir(null)
    }
  }
  const filtered = TRACES.filter((t) => {
    if (serviceFilter !== "all" && t.service !== serviceFilter) return false
    if (statusFilter !== "all" && t.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !t.id.includes(q) &&
        !t.service.includes(q) &&
        !t.op.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })
  const sorted = [...filtered].sort((a, b) => {
    if (!sortCol || !sortDir) return 0
    let cmp = 0
    if (sortCol === "traceId") cmp = a.id.localeCompare(b.id)
    else if (sortCol === "spans") cmp = a.spans - b.spans
    else if (sortCol === "duration") cmp = a.dur - b.dur
    else if (sortCol === "status")
      cmp = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
    else if (sortCol === "timestamp")
      cmp = new Date(a.ts).getTime() - new Date(b.ts).getTime()
    return sortDir === "asc" ? cmp : -cmp
  })
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
  ]
  /* default waterfall = first error trace */
  const defaultWaterfallId =
    TRACES.find((t) => t.status === "error")?.id ?? TRACES[0].id
  return (
    <div className="[height:100%] [display:flex] [flex-direction:column] [overflow:hidden] [font-family:Geist,_sans-serif] [font-size:13px] [color:var(--text-1)]">
      {/* Page header */}
      <div className="max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:24px_32px_0] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [background:var(--bg)]">
        <div className="[display:flex] [align-items:flex-start] [justify-content:space-between] [margin-bottom:20px]">
          <div>
            <h1 className="[font-size:18px] [font-weight:600] [letter-spacing:-0.025em] [margin:0_0_4px] [color:var(--text-1)]">
              Traces
            </h1>
            <p className="[font-size:13px] [color:var(--text-3)] [margin:0]">
              Distributed request traces across all services
            </p>
          </div>
          <button
            onClick={() => setWaterfallId(defaultWaterfallId)}
            className="[display:flex] [align-items:center] [gap:6px] [padding:0_14px] [height:32px] [border-radius:6px] [border:1px_solid_var(--accent-border)] [background:var(--accent-bg)] [color:var(--accent)] [font-size:13px] [font-family:Geist,_sans-serif] [cursor:pointer] [letter-spacing:-0.01em] hover:[background:rgba(50,145,255,0.14)]"
          >
            <GitBranch size={13} />
            View Waterfall
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 min-[641px]:grid-cols-4 min-[1201px]:grid-cols-8 gap-3 [display:grid] [grid-template-columns:repeat(4,_1fr)] [gap:12px] [margin-bottom:20px]">
          {stats.map((s) => (
            <div
              key={s.label}
              className="[background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:8px] [padding:16px_20px]"
            >
              <p className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.06em] [color:var(--text-3)] [margin:0_0_10px]">
                {s.label}
              </p>
              <div className="[display:flex] [align-items:baseline] [gap:10px]">
                <span className="[font-size:24px] [font-weight:600] [letter-spacing:-0.03em] [color:var(--text-1)] [font-family:Geist,_sans-serif]">
                  {s.value}
                </span>
                <span className="[font-size:11px] [font-weight:500] [color:var(--text-4)]">
                  {s.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="[display:flex] [align-items:center] [gap:8px] [padding-bottom:16px]">
          <div className="[position:relative] [flex:1] [min-width:200px] [max-width:300px]">
            <Search
              size={12}
              className="[position:absolute] [left:10px] [top:50%] [transform:translateY(-50%)] [color:var(--text-4)] [pointer-events:none]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by trace ID, service..."
              className="[width:100%] [height:32px] [padding:0_10px_0_30px] [border-radius:6px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [color:var(--text-1)] [font-size:12px] [font-family:Geist_Mono,_monospace] [outline:none] [box-sizing:border-box]"
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
          <span className="[font-size:12px] [color:var(--text-4)] [margin-left:4px]">
            {sorted.length} trace{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-w-full [flex:1] [overflow-y:auto] [background:var(--bg)]">
        {/* Header */}
        <div className="min-w-0 max-[640px]:grid-cols-[130px_1fr_60px] [display:grid] [grid-template-columns:28px_180px_1fr_140px_72px_100px_100px_84px] [min-width:720px] [align-items:center] [height:36px] [border-bottom:1px_solid_var(--border)] [background:var(--bg-2)] [position:sticky] [top:0] [z-index:10]">
          <div />
          <SortableTH
            col="traceId"
            label="Trace ID"
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
          >
            <GitBranch size={11} className="[opacity:0.6] [margin-right:2px]" />
          </SortableTH>
          <div className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-3)] [padding:0_12px] [white-space:nowrap]">
            Root Service / Operation
          </div>
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
            className="[text-align:right] [justify-content:flex-end]"
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
          <div className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-3)] [padding:0_12px] [white-space:nowrap]">
            Errors
          </div>
        </div>

        {sorted.map((t) => {
          const ss = statusTokens(t.status)
          const isExpanded = expanded === t.id
          const isError = t.status === "error"
          const spans = SPANS_BY_TRACE[t.id] ?? DEFAULT_SPANS
          const maxDur = Math.max(...spans.map((s) => s.dur), 1)
          return (
            <div key={t.id} className="[border-bottom:1px_solid_var(--border)]">
              <div
                onClick={() => setExpanded(isExpanded ? null : t.id)}
                onMouseEnter={(e) => {
                  if (!isExpanded)
                    e.currentTarget.style.background = "var(--bg-3)"
                }}
                onMouseLeave={(e) => {
                  if (!isExpanded)
                    e.currentTarget.style.background = "transparent"
                }}
                className={[
                  "[display:grid] [grid-template-columns:28px_180px_1fr_140px_72px_100px_100px_84px] [min-width:720px] [align-items:center] [height:40px] [cursor:pointer] [transition:background_0.1s]",
                  isExpanded
                    ? "[background:var(--bg-2)]"
                    : "[background:transparent]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="[display:flex] [align-items:center] [justify-content:center] [color:var(--text-4)]">
                  {isExpanded ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                </div>
                <div className="[padding:0_12px]">
                  <span className="[font-size:11px] [font-family:Geist_Mono,_monospace] [color:var(--text-3)]">
                    {t.id.slice(0, 16)}
                  </span>
                </div>
                <div className="[padding:0_12px] [min-width:0]">
                  <div className="[display:flex] [align-items:center] [gap:8px]">
                    <span
                      style={{
                        background: svcColor(t.service),
                      }}
                      className="[width:6px] [height:6px] [border-radius:2px] [flex-shrink:0]"
                    />
                    <span className="[font-size:11px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)] [flex-shrink:0]">
                      {t.service}
                    </span>
                    <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-2)] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">
                      {t.op}
                    </span>
                  </div>
                </div>
                <div className="[padding:0_12px]">
                  <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-3)]">
                    {t.spans} spans
                  </span>
                </div>
                <div className="[padding:0_12px] [text-align:right]">
                  <span
                    style={{
                      color:
                        t.dur > 2000
                          ? "var(--red)"
                          : t.dur > 800
                            ? "var(--yellow)"
                            : "var(--text-1)",
                    }}
                    className="[font-size:13px] [font-family:Geist_Mono,_monospace] [font-weight:600] [letter-spacing:-0.02em]"
                  >
                    {fmtDur(t.dur)}
                  </span>
                </div>
                <div className="[padding:0_12px]">
                  <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-3)]">
                    {fmtTs(t.ts)}
                  </span>
                </div>
                <div className="[padding:0_12px]">
                  <span
                    style={{
                      color: ss.color,
                      background: ss.bg,
                      border: `1px solid ${ss.border}`,
                    }}
                    className="[display:inline-flex] [align-items:center] [gap:5px] [font-size:11px] [font-weight:500] [padding:2px_7px] [border-radius:4px] [text-transform:capitalize]"
                  >
                    {isError && <CriticalDot />}
                    {t.status}
                  </span>
                </div>
                <div className="[padding:0_12px]">
                  <span
                    className={[
                      "[font-size:12px] [font-family:Geist_Mono,_monospace]",
                      t.errors > 0
                        ? "[color:var(--red)]"
                        : "[color:var(--text-4)]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
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
                    className="[overflow:hidden]"
                  >
                    <div className="[border-top:1px_solid_var(--border)] [background:var(--bg-2)] [padding:16px_32px_20px]">
                      <div className="[display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:12px]">
                        <p className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-4)] [margin:0]">
                          Span Waterfall
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setWaterfallId(t.id)
                          }}
                          className="[height:26px] [padding:0_10px] [border-radius:5px] [border:1px_solid_var(--accent-border)] [background:var(--accent-bg)] [color:var(--accent)] [font-size:11px] [cursor:pointer] [display:flex] [align-items:center] [gap:5px]"
                        >
                          <GitBranch size={11} /> Open full waterfall
                        </button>
                      </div>
                      <div className="[display:flex] [flex-direction:column] [gap:2px]">
                        {spans.map((span, i) => {
                          const pct = Math.max(
                            3,
                            (Math.min(span.dur, maxDur) / maxDur) * 100,
                          )
                          const offPct = Math.min(
                            (span.offset / maxDur) * 100,
                            97 - pct,
                          )
                          return (
                            <div
                              key={i}
                              className="[display:grid] [grid-template-columns:240px_1fr_72px] [align-items:center] [gap:12px] [height:28px]"
                            >
                              <div className="[display:flex] [align-items:center] [gap:6px] [min-width:0]">
                                {span.error ? (
                                  <CriticalDot />
                                ) : (
                                  <span
                                    style={{
                                      background: svcColor(span.service),
                                    }}
                                    className="[width:5px] [height:5px] [border-radius:2px] [flex-shrink:0]"
                                  />
                                )}
                                <span className="[font-size:11px] [font-family:Geist_Mono,_monospace] [color:var(--text-2)] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">
                                  {span.name}
                                </span>
                              </div>
                              <div className="[position:relative] [height:14px] [background:var(--bg-3)] [border-radius:3px] [overflow:hidden]">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{
                                    duration: 0.35,
                                    delay: i * 0.04,
                                    ease: "easeOut",
                                  }}
                                  style={{
                                    left: `${offPct}%`,
                                    background: span.error
                                      ? "var(--red)"
                                      : svcColor(span.service),
                                  }}
                                  className="[position:absolute] [height:100%] [border-radius:3px] [opacity:0.75]"
                                />
                              </div>
                              <span
                                className={[
                                  "[font-size:11px] [font-family:Geist_Mono,_monospace] [text-align:right]",
                                  span.error
                                    ? "[color:var(--red)]"
                                    : "[color:var(--text-4)]",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                {fmtDur(span.dur)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {sorted.length === 0 && (
          <div className="[padding:64px] [text-align:center] [color:var(--text-4)]">
            <p className="[font-size:13px] [margin:0]">
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
  )
}
