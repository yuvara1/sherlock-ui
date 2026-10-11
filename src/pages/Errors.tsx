import PageHeading from "@/components/workspace/PageHeading"
import ExportButton from "@/components/workspace/ExportButton"
import PageInsights from "@/components/workspace/PageInsights"
import { SherlockGrid } from "@/components/ui/SherlockGrid"
import { Button as SortButton } from "@/components/ui/button"
import { useState } from "react"
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  AlertCircle,
} from "lucide-react"
import { SherlockSelect } from "@/components/ui/SherlockSelect"
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
]
type SortDir = "asc" | "desc" | null
type SortCol = "type" | "service" | "count" | "users" | "lastSeen" | "severity" | "status" | null
const SEV_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}
const STATUS_ORDER: Record<string, number> = {
  open: 0,
  investigating: 1,
  resolved: 2,
}
function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}
function sevColor(s: string) {
  if (s === "critical")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    }
  if (s === "high")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    }
  if (s === "medium")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    }
  return { color: "var(--text-3)", bg: "var(--bg-3)", border: "var(--border)" }
}
function statusColor(s: string) {
  if (s === "open")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    }
  if (s === "investigating")
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
interface SparkBarsProps {
  data: number[]
  color: string
}
function SparkBars({ data, color }: SparkBarsProps) {
  const max = Math.max(...data, 1)
  return (
    <div className="[display:flex] [align-items:flex-end] [gap:1px] [height:20px] [width:52px]">
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            background: color,
            height: `${Math.max(2, (v / max) * 100)}%`,
            opacity: 0.4 + (i / data.length) * 0.6,
          }}
          className="[flex:1] [border-radius:1px]"
        />
      ))}
    </div>
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
const SERVICES = [
  "all",
  "payment-service",
  "order-service",
  "user-service",
  "fraud-detection",
  "analytics-service",
]
const COL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "var(--text-3)",
  padding: "0 12px",
  whiteSpace: "nowrap",
}
export default function Errors() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sevFilter, setSevFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [sortCol, setSortCol] = useState<SortCol>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  function handleSort(col: SortCol) {
    if (sortCol !== col) {
      setSortCol(col)
      setSortDir("asc")
    } else if (sortDir === "asc") setSortDir("desc")
    else if (sortDir === "desc") {
      setSortCol(null)
      setSortDir(null)
    } else {
      setSortDir("asc")
    }
  }
  const filtered = ERROR_GROUPS.filter((eg) => {
    if (statusFilter !== "all" && eg.status !== statusFilter) return false
    if (sevFilter !== "all" && eg.severity !== sevFilter) return false
    if (serviceFilter !== "all" && eg.service !== serviceFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !eg.message.toLowerCase().includes(q) &&
        !eg.type.toLowerCase().includes(q) &&
        !eg.service.includes(q) &&
        !eg.fingerprint.includes(q)
      )
        return false
    }
    return true
  })
  const sorted = [...filtered].sort((a, b) => {
    if (!sortCol || !sortDir) return 0
    let cmp = 0
    if (sortCol === "type") cmp = a.type.localeCompare(b.type)
    else if (sortCol === "service") cmp = a.service.localeCompare(b.service)
    else if (sortCol === "count") cmp = a.count - b.count
    else if (sortCol === "users") cmp = a.users - b.users
    else if (sortCol === "lastSeen")
      cmp = new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime()
    else if (sortCol === "severity")
      cmp = (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9)
    else if (sortCol === "status")
      cmp = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
    return sortDir === "asc" ? cmp : -cmp
  })
  const openGroups = ERROR_GROUPS.filter((g) => g.status === "open")
  const totalErrors24h = openGroups.reduce((s, g) => s + g.count, 0)
  const uniqueGroups = openGroups.length
  const affectedUsers = ERROR_GROUPS.reduce((s, g) => s + g.users, 0)
  const servicesImpacted = new Set(openGroups.map((g) => g.service)).size
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
  ]
  return (
    <div className="app-page [height:100%] [display:flex] [flex-direction:column] [overflow-y:auto] [overflow-x:hidden] [font-family:Geist,_sans-serif] [font-size:13px] [color:var(--text-1)]">
      {/* Page header */}
      <div className="page-header-region max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:16px_20px_0] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [background:var(--bg)]">
        <PageHeading
          className="page-heading-row [display:flex] [align-items:flex-start] [justify-content:space-between] [margin-bottom:20px]"
          actions={
            <>
              <ExportButton rows={sorted} name="errors" />
            </>
          }
        >
          <div>
            <h1 className="page-title [font-size:18px] [font-weight:600] [letter-spacing:-0.025em] [margin:0_0_4px] [color:var(--text-1)]">
              Errors
            </h1>
            <p className="[font-size:13px] [color:var(--text-3)] [margin:0]">
              Grouped error events by fingerprint and occurrence count
            </p>
          </div>
        </PageHeading>

        {/* Stats row */}
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
                <span
                  className={[
                    "[font-size:11px] [font-weight:500]",
                    s.deltaUp ? "[color:var(--red)]" : "[color:var(--green)]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
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
              aria-label="Search errors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search errors..."
              className="[width:100%] [height:32px] [padding:0_10px_0_30px] [border-radius:6px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [color:var(--text-1)] [font-size:12px] [font-family:Geist,_sans-serif] [outline:none] [box-sizing:border-box]"
            />
          </div>
          <SherlockSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All statuses" },
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
              { value: "all", label: "All severities" },
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
              label: s === "all" ? "All services" : s,
            }))}
            minWidth={160}
          />
          <span className="[font-size:12px] [color:var(--text-4)] [margin-left:4px]">
            {sorted.length} result{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="incident-grid--inset h-[var(--workspace-panel-max-height)] flex-none overflow-hidden border-y border-border">
        <SherlockGrid
          rowData={sorted}
          getRowId={({ data }) => data.id}
          onRowClicked={({ data }) =>
            data && setExpanded(expanded === data.id ? null : data.id)
          }
          columnDefs={[
            {
              field: "fingerprint",
              headerName: "Fingerprint",
              minWidth: 130,
              cellClass: "font-mono text-xs",
            },
            { field: "type", headerName: "Error", minWidth: 190, flex: 1 },
            { field: "message", headerName: "Message", minWidth: 280, flex: 1.5 },
            { field: "service", headerName: "Service", minWidth: 160 },
            { field: "count", headerName: "Count", minWidth: 90 },
            { field: "users", headerName: "Users", minWidth: 90 },
            {
              field: "lastSeen",
              headerName: "Last seen",
              minWidth: 150,
            },
            {
              field: "severity",
              headerName: "Severity",
              minWidth: 110,
              cellRenderer: ({ value }) => {
                const token = sevColor(value)
                return <span style={{ color: token.color }}>{value}</span>
              },
            },
            {
              field: "status",
              headerName: "Status",
              minWidth: 100,
              cellRenderer: ({ value }) => {
                const token = statusColor(value)
                return <span style={{ color: token.color }}>{value}</span>
              },
            },
          ]}
          overlayNoRowsTemplate="No error groups match your filters."
        />
      </div>

      {expanded &&
        (() => {
          const error = sorted.find((item) => item.id === expanded)
          if (!error) return null
          return (
            <div className="incident-grid--inset border-y border-border bg-card p-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-[var(--text-4)]">
                    {error.fingerprint}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {error.message}
                  </p>
                </div>
                <span className="font-mono text-xs text-[var(--text-3)]">
                  trace {error.traceId}
                </span>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-border bg-background p-3 text-xs leading-relaxed text-foreground">
                {error.stack.join("\n")}
              </pre>
            </div>
          )
        })()}

      <PageInsights
        page="errors"
        segments={[
          {
            label: "Critical",
            count: sorted.filter((item) => item.severity === "critical").length,
            tone: "danger",
          },
          {
            label: "High",
            count: sorted.filter((item) => item.severity === "high").length,
            tone: "warning",
          },
          {
            label: "Medium",
            count: sorted.filter((item) => item.severity === "medium").length,
            tone: "info",
          },
          {
            label: "Low",
            count: sorted.filter((item) => item.severity === "low").length,
            tone: "neutral",
          },
        ]}
      />
    </div>
  )
}
