import PageHeading from "@/components/workspace/PageHeading"
import ExportButton from "@/components/workspace/ExportButton"
import PageInsights from "@/components/workspace/PageInsights"
import { SherlockGrid } from "@/components/ui/SherlockGrid"
import { Button as SortButton } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useMemo } from "react"
import { Link } from "react-router"
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  XCircle,
  AlertTriangle,
  Info,
  Bug,
  Copy,
  ExternalLink,
} from "lucide-react"
import { SherlockSelect } from "@/components/ui/SherlockSelect"
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
]
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
]
const LEVELS = ["all", "ERROR", "WARN", "INFO", "DEBUG"]
const TIME_OPTS = ["Last 1h", "Last 6h", "Last 24h", "Last 7d"]
const LEVEL_ORDER: Record<string, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
}
type SortDir = "asc" | "desc" | null
type SortCol = "level" | "service" | "timestamp" | null
function levelStyle(
  l: string,
): {
  color: string
  bg: string
  border: string
} {
  if (l === "ERROR")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    }
  if (l === "WARN")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    }
  if (l === "INFO")
    return {
      color: "var(--accent)",
      bg: "var(--accent-bg)",
      border: "var(--accent-border)",
    }
  return { color: "var(--text-4)", bg: "var(--bg-3)", border: "var(--border)" }
}
function LevelIcon({ level }: { level: string }) {
  const size = 12
  const style = levelStyle(level)
  if (level === "ERROR")
    return (
      <XCircle
        size={size}
        style={{
          color: style.color,
        }}
        className="[flex-shrink:0]"
      />
    )
  if (level === "WARN")
    return (
      <AlertTriangle
        size={size}
        style={{
          color: style.color,
        }}
        className="[flex-shrink:0]"
      />
    )
  if (level === "INFO")
    return (
      <Info
        size={size}
        style={{
          color: style.color,
        }}
        className="[flex-shrink:0]"
      />
    )
  return (
    <Bug
      size={size}
      style={{
        color: style.color,
      }}
      className="[flex-shrink:0]"
    />
  )
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
}: {
  col: SortCol
  label: string
  sortCol: SortCol
  sortDir: SortDir
  onSort: (col: SortCol) => void
  style?: React.CSSProperties
}) {
  return (
    <SortButton
      variant="ghost"
      size="sm"
      aria-label={`Sort by ${label}`}
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
      {label}
      <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
    </SortButton>
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
export default function Logs() {
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [timeRange, setTimeRange] = useState("Last 1h")
  const [sortCol, setSortCol] = useState<SortCol>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null)
  const [copiedLogId, setCopiedLogId] = useState<number | null>(null)
  async function copyLog(log: typeof LOGS[number]) {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          {
            timestamp: log.ts,
            level: log.level,
            service: log.service,
            message: log.message,
            traceId: `trace_${String(log.id).padStart(8, "0")}`,
          },
          null,
          2,
        ),
      )
      setCopiedLogId(log.id)
      window.setTimeout(() => setCopiedLogId(null), 1600)
    } catch {
      setCopiedLogId(null)
    }
  }
  function handleSort(col: SortCol) {
    if (sortCol !== col) {
      setSortCol(col)
      setSortDir("asc")
    } else if (sortDir === "asc") setSortDir("desc")
    else if (sortDir === "desc") {
      setSortCol(null)
      setSortDir(null)
    } else setSortDir("asc")
  }
  const filtered = useMemo(
    () =>
      LOGS.filter((l) => {
        if (levelFilter !== "all" && l.level !== levelFilter) return false
        if (serviceFilter !== "all" && l.service !== serviceFilter) return false
        if (search) {
          const q = search.toLowerCase()
          if (
            !l.message.toLowerCase().includes(q) &&
            !l.service.includes(q) &&
            !l.ts.includes(q)
          )
            return false
        }
        return true
      }),
    [search, levelFilter, serviceFilter],
  )
  const sorted = useMemo(() => {
    if (!sortCol || !sortDir) return filtered
    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortCol === "level")
        cmp = (LEVEL_ORDER[a.level] ?? 9) - (LEVEL_ORDER[b.level] ?? 9)
      else if (sortCol === "service") cmp = a.service.localeCompare(b.service)
      else if (sortCol === "timestamp") cmp = a.ts.localeCompare(b.ts)
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [filtered, sortCol, sortDir])
  const errorCount = LOGS.filter((l) => l.level === "ERROR").length
  const warnCount = LOGS.filter((l) => l.level === "WARN").length
  const infoCount = LOGS.filter((l) => l.level === "INFO").length
  const services = new Set(LOGS.map((l) => l.service)).size
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
  ]
  return (
    <div className="app-page [height:100%] [display:flex] [flex-direction:column] [overflow-y:auto] [overflow-x:hidden] [font-family:Geist,_sans-serif] [font-size:13px] [color:var(--text-1)]">
      {/* Page header */}
      <div className="page-header-region max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:16px_20px_0] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [background:var(--bg)]">
        <PageHeading
          className="page-heading-row [display:flex] [align-items:flex-start] [justify-content:space-between] [margin-bottom:20px]"
          actions={
            <>
              <ExportButton rows={sorted} name="logs" />
            </>
          }
        >
          <div>
            <h1 className="page-title [font-size:18px] [font-weight:600] [letter-spacing:-0.025em] [margin:0_0_4px] [color:var(--text-1)]">
              Logs
            </h1>
            <p className="[font-size:13px] [color:var(--text-3)] [margin:0]">
              Real-time log stream from all services
            </p>
          </div>
        </PageHeading>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                  {s.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="[display:flex] [align-items:center] [gap:8px] [padding-bottom:16px]">
          <div className="[position:relative] [flex:1] [min-width:200px] [max-width:320px]">
            <Search
              size={12}
              className="[position:absolute] [left:10px] [top:50%] [transform:translateY(-50%)] [color:var(--text-4)] [pointer-events:none]"
            />
            <input
              aria-label="Search logs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="[width:100%] [height:32px] [padding:0_10px_0_30px] [border-radius:6px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [color:var(--text-1)] [font-size:12px] [font-family:Geist_Mono,_monospace] [outline:none] [box-sizing:border-box]"
            />
          </div>
          <SherlockSelect
            value={levelFilter}
            onChange={setLevelFilter}
            options={LEVELS.map((l) => ({
              value: l,
              label: l === "all" ? "All levels" : l,
            }))}
            minWidth={120}
          />
          <SherlockSelect
            value={serviceFilter}
            onChange={setServiceFilter}
            options={SERVICES.map((s) => ({
              value: s,
              label: s === "all" ? "All services" : s,
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
          <div className="[display:flex] [gap:4px] [margin-left:8px]">
            {["ERROR", "WARN", "INFO", "DEBUG"].map((l) => {
              const ls = levelStyle(l)
              const active = levelFilter === l
              return (
                <button
                  key={l}
                  onClick={() => setLevelFilter(active ? "all" : l)}
                  style={{
                    border: `1px solid ${active ? ls.border : "var(--border)"}`,
                    background: active ? ls.bg : "transparent",
                    color: active ? ls.color : "var(--text-4)",
                  }}
                  className="[height:28px] [padding:0_10px] [border-radius:4px] [font-size:11px] [font-family:Geist_Mono,_monospace] [cursor:pointer] [transition:all_0.1s]"
                >
                  {l}
                </button>
              )
            })}
          </div>

          <span className="[font-size:12px] [color:var(--text-4)] [margin-left:4px]">
            {sorted.length} entries
          </span>
        </div>
      </div>

      <div className="incident-grid--inset h-[var(--workspace-panel-max-height)] flex-none overflow-hidden border-y border-border">
        <SherlockGrid
          rowData={sorted}
          getRowId={({ data }) => String(data.id)}
          onRowClicked={({ data }) =>
            data && setExpandedLogId(expandedLogId === data.id ? null : data.id)
          }
          columnDefs={[
            {
              field: "ts",
              headerName: "Timestamp",
              width: 130,
              cellClass: "font-mono text-xs text-[var(--text-4)]",
            },
            {
              field: "level",
              headerName: "Level",
              width: 110,
              cellRenderer: ({ value }) => {
                const token = levelStyle(value)
                return (
                  <span style={{ color: token.color }} className="font-mono text-xs font-semibold">
                    {value}
                  </span>
                )
              },
            },
            {
              field: "service",
              headerName: "Service",
              minWidth: 170,
              cellClass: "font-mono text-xs",
            },
            {
              field: "message",
              headerName: "Message",
              minWidth: 360,
              flex: 1,
              cellClass: "font-mono text-xs",
            },
          ]}
          overlayNoRowsTemplate="No logs match your filters."
        />
      </div>

      {expandedLogId &&
        (() => {
          const log = sorted.find((item) => item.id === expandedLogId)
          if (!log) return null
          const traceId = `trace_${String(log.id).padStart(8, "0")}`
          return (
            <div className="incident-grid--inset grid gap-4 border-y border-border bg-card px-4 py-4 lg:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{log.service}</span>
                  <span aria-hidden="true">/</span>
                  <span className="font-mono">{traceId}</span>
                  <Badge variant="ghost">Demo log detail</Badge>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-border bg-background p-3 text-xs leading-relaxed text-foreground">
                  {JSON.stringify(
                    {
                      timestamp: `2025-05-14T${log.ts}Z`,
                      level: log.level,
                      service: log.service,
                      environment: "production",
                      message: log.message,
                      traceId,
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
              <div className="flex items-start gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void copyLog(log)}
                >
                  <Copy size={13} aria-hidden="true" />
                  {copiedLogId === log.id ? "Copied" : "Copy log"}
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/app/traces">
                    <ExternalLink size={13} aria-hidden="true" />
                    Related trace
                  </Link>
                </Button>
              </div>
            </div>
          )
        })()}

      <PageInsights
        page="logs"
        segments={[
          {
            label: "Error",
            count: sorted.filter((item) => item.level === "ERROR").length,
            tone: "danger",
          },
          {
            label: "Warning",
            count: sorted.filter((item) => item.level === "WARN").length,
            tone: "warning",
          },
          {
            label: "Info",
            count: sorted.filter((item) => item.level === "INFO").length,
            tone: "info",
          },
          {
            label: "Debug",
            count: sorted.filter((item) => item.level === "DEBUG").length,
            tone: "neutral",
          },
        ]}
      />
    </div>
  )
}
