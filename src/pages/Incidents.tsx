import React, { useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { SherlockSelect } from "@/components/ui/SherlockSelect"
const INCIDENTS = [
  {
    id: "INC-094",
    title: "Payment processing timeout spike — P95 latency exceeded 4s",
    sev: "critical",
    status: "open",
    service: "payment-service",
    env: "production",
    endpoint: "POST /v1/payments/charge",
    created: "2026-09-22T14:23:00Z",
    errRate: 12.4,
    traceId: "abc123def456",
    duration: "25m",
    assignee: "alex.kim",
  },
  {
    id: "INC-093",
    title: "PostgreSQL connection pool exhaustion on payment-service",
    sev: "high",
    status: "open",
    service: "payment-service",
    env: "production",
    endpoint: "POST /v1/payments/charge",
    created: "2026-09-22T13:45:00Z",
    errRate: 8.1,
    traceId: "def789abc012",
    duration: "1h3m",
    assignee: "sam.chen",
  },
  {
    id: "INC-092",
    title: "Order service 503s — downstream dependency timeout",
    sev: "high",
    status: "acknowledged",
    service: "order-service",
    env: "production",
    endpoint: "GET /v1/orders",
    created: "2026-09-22T12:10:00Z",
    errRate: 3.2,
    traceId: "fed321cba987",
    duration: "2h38m",
    assignee: "pat.lee",
  },
  {
    id: "INC-091",
    title: "Auth service elevated latency — JWT validation slow",
    sev: "medium",
    status: "resolved",
    service: "user-service",
    env: "production",
    endpoint: "POST /v1/auth/validate",
    created: "2026-09-22T10:00:00Z",
    errRate: 0.4,
    traceId: "aab112ccd334",
    duration: "1h12m",
    assignee: "jordan.wu",
  },
  {
    id: "INC-090",
    title: "Notification delivery failures — SES quota exceeded",
    sev: "medium",
    status: "resolved",
    service: "notification-svc",
    env: "production",
    endpoint: "POST /v1/notifications",
    created: "2026-09-21T22:15:00Z",
    errRate: 31.0,
    traceId: "xyz789uvw456",
    duration: "47m",
    assignee: "riley.m",
  },
  {
    id: "INC-089",
    title: "Inventory API read latency spike — Redis cache miss storm",
    sev: "low",
    status: "resolved",
    service: "inventory-api",
    env: "staging",
    endpoint: "GET /v1/inventory/:sku",
    created: "2026-09-21T14:30:00Z",
    errRate: 0.1,
    traceId: "lmn123opq456",
    duration: "18m",
    assignee: "alex.kim",
  },
  {
    id: "INC-088",
    title: "Fraud detection service OOM — memory limit exceeded",
    sev: "high",
    status: "resolved",
    service: "fraud-detection",
    env: "production",
    endpoint: "POST /v1/fraud/evaluate",
    created: "2026-09-21T09:00:00Z",
    errRate: 5.8,
    traceId: "qqr890stu234",
    duration: "34m",
    assignee: "sam.chen",
  },
  {
    id: "INC-087",
    title: "Analytics pipeline stall — Kafka consumer lag >100k",
    sev: "medium",
    status: "resolved",
    service: "analytics-service",
    env: "production",
    endpoint: "GET /v1/analytics/stream",
    created: "2026-09-20T18:45:00Z",
    errRate: 0.0,
    traceId: "vvw567xyz890",
    duration: "2h15m",
    assignee: "pat.lee",
  },
]
const TIMELINE_DATA: Record<string, {
  time: string
  event: string
  type: string
}[]> = {
  "INC-094": [
    {
      time: "14:27",
      event:
        "Incident INC-094 created automatically — error threshold breached",
      type: "alert",
    },
    {
      time: "14:26",
      event: "order-service 503 cascade detected — error rate 18.4%",
      type: "alert",
    },
    {
      time: "14:23",
      event: "On-call engineer paged via PagerDuty",
      type: "page",
    },
    {
      time: "14:20",
      event: "payment-service v2.14.1 deployed to production",
      type: "deploy",
    },
    {
      time: "14:18",
      event: "P95 latency on POST /v1/payments/charge exceeded 4s SLO",
      type: "metric",
    },
  ],
}
type SortDir = "asc" | "desc" | null
function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  return m < 60
    ? `${m}m ago`
    : m < 1440
      ? `${Math.floor(m / 60)}h ago`
      : `${Math.floor(m / 1440)}d ago`
}
function sevStyle(s: string) {
  if (s === "critical")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    }
  if (s === "high")
    return { color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" }
  if (s === "medium")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    }
  return { color: "var(--text-4)", bg: "var(--bg-3)", border: "var(--border)" }
}
function statusStyle(s: string) {
  if (s === "open")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    }
  if (s === "acknowledged")
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
function CriticalDot() {
  return (
    <span className="[position:relative] [display:inline-flex] [width:10px] [height:10px] [flex-shrink:0]">
      <span className="[position:absolute] [inset:0] [border-radius:50%] [background:var(--red)] [opacity:0.4] [animation:blink-ring_1.4s_ease-in-out_infinite]" />
      <span className="[position:relative] [width:10px] [height:10px] [border-radius:50%] [background:var(--red)] [animation:blink-dot_1.4s_ease-in-out_infinite]" />
    </span>
  )
}
function SevBadge({ s }: { s: string }) {
  const c = sevStyle(s)
  return (
    <span
      style={{
        border: `1px solid ${c.border}`,
        color: c.color,
        background: c.bg,
      }}
      className="[display:inline-flex] [align-items:center] [gap:5px] [font-size:11px] [font-weight:500] [border-radius:4px] [padding:2px_8px] [text-transform:capitalize] [font-family:Geist_Mono,_monospace]"
    >
      {s === "critical" && <CriticalDot />}
      {s}
    </span>
  )
}
function StatusBadge({ s }: { s: string }) {
  const c = statusStyle(s)
  const icon =
    s === "open" ? (
      <AlertTriangle size={11} className="[flex-shrink:0]" />
    ) : s === "acknowledged" ? (
      <Clock size={11} className="[flex-shrink:0]" />
    ) : (
      <CheckCircle size={11} className="[flex-shrink:0]" />
    )
  return (
    <span
      style={{
        border: `1px solid ${c.border}`,
        color: c.color,
        background: c.bg,
      }}
      className="[display:inline-flex] [align-items:center] [gap:5px] [font-size:11px] [font-weight:500] [border-radius:4px] [padding:2px_8px] [text-transform:capitalize] [font-family:Geist_Mono,_monospace]"
    >
      {icon}
      {s}
    </span>
  )
}
function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === "asc") return <ChevronUp size={11} />
  if (dir === "desc") return <ChevronDown size={11} />
  return <ChevronsUpDown size={11} className="[opacity:0.35]" />
}
function ExpandedRow({ inc }: { inc: typeof INCIDENTS[0] }) {
  const timeline = TIMELINE_DATA[inc.id] ?? []
  const timelineTypeColor = (t: string) =>
    t === "alert"
      ? "var(--red)"
      : t === "deploy"
        ? "var(--yellow)"
        : t === "page"
          ? "var(--accent)"
          : "var(--border-2)"
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <td
        colSpan={9}
        className="[padding:0] [border-bottom:1px_solid_var(--border)]"
      >
        <div className="grid grid-cols-1 min-[901px]:grid-cols-2 min-[1201px]:grid-cols-3 gap-3 min-w-0 max-[640px]:grid-cols-1 max-[640px]:px-4 max-[640px]:gap-4 [padding:16px_20px_16px_56px] [background:var(--bg)]">
          {/* Meta */}
          <div>
            <p className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.06em] [color:var(--text-4)] [margin:0_0_10px]">
              Details
            </p>
            <div className="[display:flex] [flex-direction:column] [gap:6px]">
              {[
                ["Service", inc.service],
                ["Endpoint", inc.endpoint],
                ["Env", inc.env],
                ["Error rate", `${inc.errRate}%`],
                ["Trace ID", inc.traceId],
                ["Detected", ago(inc.created)],
              ].map(([k, v]) => (
                <div key={k} className="[display:flex] [gap:8px]">
                  <span className="[font-size:11px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)] [width:72px] [flex-shrink:0]">
                    {k}
                  </span>
                  <span className="[font-size:11px] [font-family:Geist_Mono,_monospace] [color:var(--text-2)] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Affected resources */}
          <div>
            <p className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.06em] [color:var(--text-4)] [margin:0_0_10px]">
              Affected Resources
            </p>
            <div className="grid grid-cols-1 min-[901px]:grid-cols-2 gap-3">
              {[
                { label: "Traces", val: "1,284", color: "var(--accent)" },
                { label: "Errors", val: "592", color: "var(--red)" },
                { label: "Users hit", val: "~8,400", color: "var(--yellow)" },
                { label: "Services", val: "3", color: "var(--text-2)" },
              ].map(({ label, val, color }) => (
                <div
                  key={label}
                  className="[padding:10px_12px] [border-radius:6px] [border:1px_solid_var(--border)] [background:var(--bg-2)]"
                >
                  <p
                    style={{
                      color,
                    }}
                    className="[font-size:18px] [font-weight:600] [font-family:Geist_Mono,_monospace] [margin:0_0_2px] [letter-spacing:-0.02em]"
                  >
                    {val}
                  </p>
                  <p className="[font-size:11px] [color:var(--text-4)] [margin:0]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.06em] [color:var(--text-4)] [margin:0_0_10px]">
              {timeline.length > 0 ? "Timeline" : "Actions"}
            </p>
            {timeline.length > 0 ? (
              <div className="[position:relative] [padding-left:16px]">
                <div className="[position:absolute] [left:3px] [top:4px] [bottom:4px] [width:1px] [background:var(--border)]" />
                {timeline.map((e) => (
                  <div
                    key={e.time}
                    className="[display:flex] [gap:8px] [margin-bottom:10px] [position:relative] [align-items:flex-start]"
                  >
                    <span
                      style={{
                        background: timelineTypeColor(e.type),
                      }}
                      className="[position:absolute] [left:-16px] [top:4px] [width:7px] [height:7px] [border-radius:50%] [border:2px_solid_var(--bg)]"
                    />
                    <span className="[font-size:10px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)] [flex-shrink:0] [margin-top:1px]">
                      {e.time}
                    </span>
                    <p className="[font-size:11px] [color:var(--text-3)] [margin:0] [line-height:1.5]">
                      {e.event}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="[display:flex] [flex-direction:column] [gap:6px]">
                {[
                  "Mark Resolved",
                  "Acknowledge",
                  "View Trace",
                  "View Logs",
                ].map((action) => (
                  <button
                    key={action}
                    className="[padding:6px_12px] [border-radius:6px] [font-size:12px] [text-align:left] [border:1px_solid_var(--border)] [background:transparent] [color:var(--text-3)] [cursor:pointer] [transition:background_0.1s] hover:[background:var(--bg-2)]"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
    </motion.tr>
  )
}
export default function Incidents() {
  const [createOpen, setCreateOpen] = useState(false)
  const [createSev, setCreateSev] = useState("critical")
  const [createSvc, setCreateSvc] = useState("api-gateway")
  const [search, setSearch] = useState("")
  const [severity, setSeverity] = useState("all")
  const [status, setStatus] = useState("all")
  const [timeRange, setTimeRange] = useState("24h")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [sortCol, setSortCol] = useState("")
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const onSort = (c: string) => {
    if (sortCol === c)
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"))
    else {
      setSortCol(c)
      setSortDir("asc")
    }
  }
  const counts = {
    open: INCIDENTS.filter((i) => i.status === "open").length,
    acknowledged: INCIDENTS.filter((i) => i.status === "acknowledged").length,
    resolved: INCIDENTS.filter((i) => i.status === "resolved").length,
  }
  const totalDuration = INCIDENTS.filter((i) => i.status === "resolved").reduce(
    (acc, i) => {
      const m = parseInt(i.duration.replace(/[^0-9]/g, ""))
      return acc + m
    },
    0,
  )
  const mttr = `${Math.floor(totalDuration / counts.resolved)}m`
  const baseList = INCIDENTS.filter(
    (i) =>
      (i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.id.includes(search) ||
        i.service.includes(search)) &&
      (severity === "all" || i.sev === severity) &&
      (status === "all" || i.status === status),
  )
  const list = (() => {
    if (!sortCol || sortDir === null) return baseList
    return [...baseList].sort((a: any, b: any) => {
      const av = a[sortCol],
        bv = b[sortCol]
      if (typeof av === "string")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1
    })
  })()
  function SortableTH({
    label,
    col,
    style,
  }: {
    label: string
    col: string
    style?: React.CSSProperties
  }) {
    const active = sortCol === col
    return (
      <th
        onClick={() => onSort(col)}
        style={{
          ...style,
        }}
        className={[
          [
            "[cursor:pointer] [user-select:none]",
            active ? "[color:var(--text-2)]" : "[color:var(--text-4)]",
          ]
            .filter(Boolean)
            .join(" "),
          "[padding:10px_12px] [text-align:left] [font-size:11px] [font-weight:500] [color:var(--text-4)] [letter-spacing:0.04em] [text-transform:uppercase] [border-bottom:1px_solid_var(--border)] [white-space:nowrap]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="[display:inline-flex] [align-items:center] [gap:4px]">
          {label} <SortIcon dir={active ? sortDir : null} />
        </span>
      </th>
    )
  }
  return (
    <div className="max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:24px_32px] [display:flex] [flex-direction:column] [gap:0]">
      {/* Page header */}
      <div className="grid grid-cols-2 min-[641px]:grid-cols-4 min-[1201px]:grid-cols-8 gap-3 [display:flex] [align-items:center] [justify-content:space-between] [padding-bottom:20px] [border-bottom:1px_solid_var(--border)] [margin-bottom:24px]">
        <div>
          <h1 className="[font-size:18px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)] [margin:0_0_4px]">
            Incidents
          </h1>
          <p className="[font-size:13px] [color:var(--text-3)] [margin:0]">
            Active and resolved incidents across all services
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <button className="[display:flex] [align-items:center] [gap:6px] [padding:6px_14px] [border-radius:6px] [font-size:13px] [font-weight:500] [background:var(--text-1)] [color:var(--bg)] [border:none] [cursor:pointer] [letter-spacing:-0.01em]">
              <Plus size={13} /> New Incident
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Incident</DialogTitle>
              <DialogDescription>
                Report a new incident to the team.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3.5 px-5 py-4">
              <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
                <label>Title</label>
                <input
                  className="h-[34px] w-full box-border rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[13px] text-[var(--text-1)] tracking-[-0.004em] outline-none transition-colors focus:border-[var(--accent)]"
                  placeholder="e.g. Payment API timeout"
                />
              </div>
              <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
                <label>Severity</label>
                <SherlockSelect
                  value={createSev}
                  onChange={setCreateSev}
                  options={["critical", "high", "medium", "low"]}
                />
              </div>
              <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
                <label>Service</label>
                <SherlockSelect
                  value={createSvc}
                  onChange={setCreateSvc}
                  options={[
                    "api-gateway",
                    "payment-service",
                    "order-service",
                    "auth-service",
                    "inventory-api",
                  ]}
                />
              </div>
              <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
                <label>Description</label>
                <textarea
                  className="w-full box-border resize-y rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-2 text-[13px] text-[var(--text-1)] tracking-[-0.004em] outline-none transition-colors focus:border-[var(--accent)]"
                  rows={3}
                  placeholder="Describe the incident..."
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button className="h-8 rounded-md border border-[var(--border)] bg-transparent px-3.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--text-2)] cursor-pointer transition-colors hover:border-[var(--border-2)] hover:bg-[var(--bg-3)]">
                  Cancel
                </button>
              </DialogClose>
              <button
                className="h-8 rounded-md border-0 bg-[var(--text-1)] px-3.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--bg)] cursor-pointer transition-opacity hover:opacity-85"
                onClick={() => setCreateOpen(false)}
              >
                Create Incident
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 min-[641px]:grid-cols-4 min-[1201px]:grid-cols-8 gap-3 [display:grid] [grid-template-columns:repeat(4,_1fr)] [gap:12px] [margin-bottom:20px]">
        {[
          {
            label: "Open",
            value: counts.open,
          },
          {
            label: "Acknowledged",
            value: counts.acknowledged,
          },
          {
            label: "Resolved",
            value: counts.resolved,
          },
          {
            label: "MTTR",
            value: mttr,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="[background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:8px] [padding:16px_20px]"
          >
            <p className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.06em] [color:var(--text-3)] [margin:0_0_10px]">
              {label}
            </p>
            <div className="[display:flex] [align-items:baseline] [gap:10px]">
              <span className="[font-size:24px] [font-weight:600] [letter-spacing:-0.03em] [color:var(--text-1)] [font-family:Geist,_sans-serif]">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="[display:flex] [gap:8px] [margin-bottom:16px] [align-items:center]">
        {/* Search */}
        <div className="[display:flex] [align-items:center] [gap:8px] [flex:1] [min-width:200px] [height:32px] [padding:0_10px] [border:1px_solid_var(--border)] [border-radius:6px] [background:var(--bg-2)]">
          <Search size={12} className="[color:var(--text-4)] [flex-shrink:0]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incidents, services, IDs…"
            className="[flex:1] [background:transparent] [font-size:12px] [font-family:Geist_Mono,_monospace] [outline:none] [color:var(--text-2)] [border:none]"
          />
        </div>

        {/* Selects */}
        <SherlockSelect
          value={severity}
          onChange={setSeverity}
          options={["all", "critical", "high", "medium", "low"].map((o) => ({
            value: o,
            label:
              o === "all"
                ? "All severities"
                : o.charAt(0).toUpperCase() + o.slice(1),
          }))}
          minWidth={130}
        />
        <SherlockSelect
          value={status}
          onChange={setStatus}
          options={["all", "open", "acknowledged", "resolved"].map((o) => ({
            value: o,
            label:
              o === "all"
                ? "All statuses"
                : o.charAt(0).toUpperCase() + o.slice(1),
          }))}
          minWidth={130}
        />
        <SherlockSelect
          value={timeRange}
          onChange={setTimeRange}
          options={["1h", "6h", "24h", "7d", "30d"]}
          minWidth={80}
        />

        <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)] [flex-shrink:0]">
          {list.length} of {INCIDENTS.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-w-full [border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)]">
        <table className="[width:100%] [min-width:640px] [border-collapse:collapse]">
          <thead>
            <tr className="[background:var(--bg)]">
              <th className="[width:32px] [padding:10px_8px_10px_16px] [border-bottom:1px_solid_var(--border)]" />
              <SortableTH label="ID" col="id" />
              <SortableTH label="Title" col="title" className="[width:40%]" />
              <SortableTH label="Service" col="service" />
              <SortableTH label="Severity" col="sev" />
              <SortableTH label="Status" col="status" />
              <SortableTH
                label="Duration"
                col="duration"
                className="[text-align:right]"
              />
              <SortableTH
                label="Assignee"
                col="assignee"
                className="[text-align:right]"
              />
              <SortableTH
                label="Created"
                col="created"
                className="[text-align:right]"
              />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="[padding:48px_0] [text-align:center] [font-size:13px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)]"
                >
                  No incidents match
                </td>
              </tr>
            )}
            {list.map((inc) => {
              const isExpanded = expanded === inc.id
              return (
                <React.Fragment key={inc.id}>
                  <tr
                    onClick={() => setExpanded(isExpanded ? null : inc.id)}
                    onMouseEnter={(e) => {
                      if (!isExpanded)
                        e.currentTarget.style.background = "var(--bg-3)"
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded)
                        e.currentTarget.style.background = "transparent"
                    }}
                    className={[
                      "[height:40px] [border-bottom:1px_solid_var(--border)] [transition:background_0.1s] [cursor:pointer]",
                      isExpanded
                        ? "[background:var(--bg-3)]"
                        : "[background:transparent]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {/* Expand chevron */}
                    <td className="[padding:0_8px_0_16px] [width:32px]">
                      <motion.span
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.15 }}
                        className="[display:inline-flex] [color:var(--text-4)]"
                      >
                        <ChevronRight size={13} />
                      </motion.span>
                    </td>

                    {/* ID */}
                    <td className="[padding:0_12px]">
                      <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)]">
                        {inc.id}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="[padding:0_12px]">
                      <span className="[font-size:13px] [color:var(--text-2)] [font-weight:500] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap] [display:block] [max-width:360px]">
                        {inc.title}
                      </span>
                    </td>

                    {/* Service */}
                    <td className="[padding:0_12px]">
                      <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-3)]">
                        {inc.service}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="[padding:0_12px]">
                      <SevBadge s={inc.sev} />
                    </td>

                    {/* Status */}
                    <td className="[padding:0_12px]">
                      <StatusBadge s={inc.status} />
                    </td>

                    {/* Duration */}
                    <td
                      className={[
                        ["[text-align:right]"].filter(Boolean).join(" "),
                        "[padding:0_12px]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)]">
                        {inc.duration}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td
                      className={[
                        ["[text-align:right]"].filter(Boolean).join(" "),
                        "[padding:0_12px]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)]">
                        {inc.assignee}
                      </span>
                    </td>

                    {/* Created */}
                    <td
                      className={[
                        ["[text-align:right]"].filter(Boolean).join(" "),
                        "[padding:0_12px]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)]">
                        {ago(inc.created)}
                      </span>
                    </td>
                  </tr>

                  <AnimatePresence>
                    {isExpanded && (
                      <ExpandedRow key={`${inc.id}-expanded`} inc={inc} />
                    )}
                  </AnimatePresence>
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--text-4)",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  borderBottom: "1px solid var(--border)",
  whiteSpace: "nowrap",
}
const tdStyle: React.CSSProperties = {
  padding: "0 12px",
}
