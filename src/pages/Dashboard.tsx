import { useState, useMemo } from "react"
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
import { SherlockSelect } from "@/components/ui/SherlockSelect"
import {
  CheckCircle,
  Minus,
  Plus,
  AlertCircle,
  Server,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { useTheme } from "@/lib/theme"
function mkErr(i: number) {
  const spike = i >= 13 && i <= 15
  return Math.max(
    0.1,
    parseFloat((Math.random() * 1.5 + (spike ? 11.8 : 0.6)).toFixed(2)),
  )
}
function mkLat(base: number, i: number, spike: boolean) {
  return Math.floor(
    Math.random() * 20 + base + (spike && i >= 13 && i <= 15 ? 130 : 0),
  )
}
function mkRps(i: number) {
  const dayNorm = Math.sin((i / 24) * Math.PI) * 2800 + 2200
  return Math.floor(dayNorm + Math.random() * 400 - 200)
}
const errData = Array.from({ length: 24 }, (_, i) => ({
  t: `${i.toString().padStart(2, "0")}:00`,
  v: mkErr(i),
}))
const latData = Array.from({ length: 24 }, (_, i) => ({
  t: `${i.toString().padStart(2, "0")}:00`,
  p95: mkLat(62, i, true),
  p99: mkLat(98, i, true),
}))
const rpsData = Array.from({ length: 24 }, (_, i) => ({
  t: `${i.toString().padStart(2, "0")}:00`,
  v: mkRps(i),
}))
const SERVICES = [
  {
    name: "payment-service",
    health: "critical",
    err: 12.4,
    lat: 312,
    rps: 1840,
  },
  { name: "order-service", health: "degraded", err: 1.1, lat: 94, rps: 3201 },
  { name: "user-service", health: "healthy", err: 0.1, lat: 28, rps: 5820 },
  { name: "notification-svc", health: "healthy", err: 0.0, lat: 15, rps: 1240 },
  { name: "inventory-api", health: "healthy", err: 0.3, lat: 45, rps: 2100 },
  { name: "fraud-detection", health: "healthy", err: 0.0, lat: 88, rps: 890 },
  {
    name: "analytics-service",
    health: "healthy",
    err: 0.2,
    lat: 210,
    rps: 540,
  },
]
const DEPLOYMENTS = [
  {
    service: "payment-service",
    version: "v2.14.1",
    status: "failed",
    ago: "34m",
    author: "alex.kim",
  },
  {
    service: "order-service",
    version: "v3.8.0",
    status: "success",
    ago: "1h",
    author: "sam.chen",
  },
  {
    service: "user-service",
    version: "v1.22.4",
    status: "in-progress",
    ago: "2h",
    author: "pat.lee",
  },
  {
    service: "inventory-api",
    version: "v2.3.0",
    status: "success",
    ago: "3h",
    author: "jordan.wu",
  },
  {
    service: "fraud-detection",
    version: "v1.9.2",
    status: "success",
    ago: "6h",
    author: "riley.m",
  },
]
const ENDPOINTS = [
  { ep: "POST /v1/payments/charge", rate: "12.4%", rateNum: 12.4, rps: 184 },
  { ep: "GET /v1/orders/:id", rate: "3.1%", rateNum: 3.1, rps: 1205 },
  { ep: "POST /v1/auth/refresh", rate: "1.8%", rateNum: 1.8, rps: 892 },
  { ep: "PUT /v1/inventory/reserve", rate: "0.9%", rateNum: 0.9, rps: 440 },
  { ep: "GET /v1/users/profile", rate: "0.4%", rateNum: 0.4, rps: 2340 },
  { ep: "POST /v1/notifications", rate: "0.2%", rateNum: 0.2, rps: 312 },
]
const KPI_ITEMS = [
  { label: "Requests / min", value: "14,832", delta: "+8.2%", up: true },
  { label: "Error Rate", value: "2.3%", delta: "+1.4pp", up: false },
  { label: "P95 Latency", value: "183ms", delta: "+44ms", up: false },
  { label: "Open Incidents", value: "3", delta: "+1", up: false },
]
const RANGE_OPTIONS = [
  { value: "15m", label: "15m" },
  { value: "1h", label: "1h" },
  { value: "6h", label: "6h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
] as const
type TimeRange = typeof RANGE_OPTIONS[number]["value"]
const RANGE_LABELS: Record<TimeRange, string> = {
  "15m": "the last 15 minutes",
  "1h": "the last hour",
  "6h": "the last 6 hours",
  "24h": "the last 24 hours",
  "7d": "the last 7 days",
}
type SortDir = "asc" | "desc" | null
type SvcSortCol = "name" | "health" | "err" | "lat" | "rps" | null
type EpSortCol = "ep" | "rate" | "rps" | null
const HEALTH_ORDER: Record<string, number> = {
  critical: 0,
  degraded: 1,
  healthy: 2,
}
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="[padding:8px_10px] [border-radius:6px] [font-size:11px] [background:var(--bg-3)] [border:1px_solid_var(--border-2)]">
      <p className="[font-family:Geist_Mono,_monospace] [margin-bottom:4px] [color:var(--text-4)] [font-size:10px] [margin:0_0_4px]">
        {label}
      </p>
      {payload.map((p: any) => (
        <div
          key={p.name}
          className="[display:flex] [gap:8px] [align-items:center]"
        >
          <span
            style={{
              background: p.stroke || p.fill,
            }}
            className="[width:6px] [height:6px] [border-radius:50%] [flex-shrink:0]"
          />
          <span className="[color:var(--text-3)]">{p.name}</span>
          <span className="[font-family:Geist_Mono,_monospace] [font-weight:600] [margin-left:auto] [color:var(--text-1)]">
            {p.value}
          </span>
        </div>
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
function HealthDot({ health }: { health: string }) {
  if (health === "critical") return <CriticalDot />
  const color = health === "degraded" ? "var(--yellow)" : "var(--green)"
  return (
    <span
      style={{
        background: color,
      }}
      className="[width:6px] [height:6px] [border-radius:50%] [flex-shrink:0] [display:inline-block]"
    />
  )
}
function DeployStatusIcon({ status }: { status: string }) {
  if (status === "success")
    return (
      <CheckCircle size={12} className="[color:var(--green)] [flex-shrink:0]" />
    )
  if (status === "failed")
    return (
      <AlertCircle size={12} className="[color:var(--red)] [flex-shrink:0]" />
    )
  return <Minus size={12} className="[color:var(--yellow)] [flex-shrink:0]" />
}
function SortIconEl({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown size={9} className="[opacity:0.4]" />
  if (dir === "asc") return <ChevronUp size={9} />
  if (dir === "desc") return <ChevronDown size={9} />
  return <ChevronsUpDown size={9} className="[opacity:0.4]" />
}
function SortableTH({
  label,
  col,
  sortCol,
  sortDir,
  onSort,
  align = "left",
}: {
  label: string
  col: string
  sortCol: string | null
  sortDir: SortDir
  onSort: (c: any) => void
  align?: "left" | "right"
}) {
  const active = sortCol === col
  return (
    <th
      onClick={() => onSort(col)}
      style={{
        textAlign: align,
      }}
      className={[
        "[padding:8px_16px] [font-size:11px] [font-weight:500] [letter-spacing:0.02em] [border-bottom:1px_solid_var(--border)] [cursor:pointer] [user-select:none] [white-space:nowrap]",
        active ? "[color:var(--text-2)]" : "[color:var(--text-4)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="[display:inline-flex] [align-items:center] [gap:3px]">
        {label} <SortIconEl active={active} dir={sortDir} />
      </span>
    </th>
  )
}
function SvcSortableHeader({
  label,
  col,
  sortCol,
  sortDir,
  onSort,
}: {
  label: string
  col: SvcSortCol
  sortCol: SvcSortCol
  sortDir: SortDir
  onSort: (c: SvcSortCol) => void
}) {
  const active = sortCol === col
  return (
    <div
      onClick={() => onSort(col)}
      style={{
        textTransform: "uppercase" as const,
        userSelect: "none" as const,
      }}
      className={[
        "[font-size:10px] [font-weight:500] [letter-spacing:0.04em] [cursor:pointer] [display:flex] [align-items:center] [gap:3px]",
        active ? "[color:var(--text-2)]" : "[color:var(--text-4)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label} <SortIconEl active={active} dir={sortDir} />
    </div>
  )
}
export default function Dashboard() {
  const { theme } = useTheme()
  const [_unused] = useState(null)
  const [timeRange, setTimeRange] = useState<TimeRange>("1h")
  const [createOpen, setCreateOpen] = useState(false)
  const [createSev, setCreateSev] = useState("critical")
  const [createSvc, setCreateSvc] = useState("api-gateway")
  const rangeData = useMemo(() => {
    if (timeRange === "7d") {
      return {
        errors: errData.filter((_, i) => i % 4 === 0),
        latency: latData.filter((_, i) => i % 4 === 0),
        rps: rpsData.filter((_, i) => i % 4 === 0),
      }
    }
    const points =
      timeRange === "15m"
        ? 2
        : timeRange === "1h"
          ? 6
          : timeRange === "6h"
            ? 6
            : 24
    return {
      errors: errData.slice(-points),
      latency: latData.slice(-points),
      rps: rpsData.slice(-points),
    }
  }, [timeRange])
  // Service health sort
  const [svcSortCol, setSvcSortCol] = useState<SvcSortCol>(null)
  const [svcSortDir, setSvcSortDir] = useState<SortDir>(null)
  // Endpoints sort
  const [epSortCol, setEpSortCol] = useState<EpSortCol>(null)
  const [epSortDir, setEpSortDir] = useState<SortDir>(null)
  function handleSvcSort(col: SvcSortCol) {
    if (svcSortCol !== col) {
      setSvcSortCol(col)
      setSvcSortDir("asc")
      return
    }
    if (svcSortDir === "asc") {
      setSvcSortDir("desc")
      return
    }
    setSvcSortDir(null)
    setSvcSortCol(null)
  }
  function handleEpSort(col: EpSortCol) {
    if (epSortCol !== col) {
      setEpSortCol(col)
      setEpSortDir("asc")
      return
    }
    if (epSortDir === "asc") {
      setEpSortDir("desc")
      return
    }
    setEpSortDir(null)
    setEpSortCol(null)
  }
  const sortedServices = useMemo(() => {
    if (!svcSortCol || !svcSortDir) return SERVICES
    return [...SERVICES].sort((a, b) => {
      let av: string | number = "",
        bv: string | number = ""
      if (svcSortCol === "name") {
        av = a.name
        bv = b.name
      }
      if (svcSortCol === "health") {
        av = HEALTH_ORDER[a.health] ?? 99
        bv = HEALTH_ORDER[b.health] ?? 99
      }
      if (svcSortCol === "err") {
        av = a.err
        bv = b.err
      }
      if (svcSortCol === "lat") {
        av = a.lat
        bv = b.lat
      }
      if (svcSortCol === "rps") {
        av = a.rps
        bv = b.rps
      }
      if (typeof av === "string")
        return svcSortDir === "asc"
          ? av.localeCompare(bv as string)
          : (bv as string).localeCompare(av)
      return svcSortDir === "asc"
        ? (av as number - bv) as number
        : (bv as number - av) as number
    })
  }, [svcSortCol, svcSortDir])
  const sortedEndpoints = useMemo(() => {
    if (!epSortCol || !epSortDir) return ENDPOINTS
    return [...ENDPOINTS].sort((a, b) => {
      let av: string | number = "",
        bv: string | number = ""
      if (epSortCol === "ep") {
        av = a.ep
        bv = b.ep
      }
      if (epSortCol === "rate") {
        av = a.rateNum
        bv = b.rateNum
      }
      if (epSortCol === "rps") {
        av = a.rps
        bv = b.rps
      }
      if (typeof av === "string")
        return epSortDir === "asc"
          ? av.localeCompare(bv as string)
          : (bv as string).localeCompare(av)
      return epSortDir === "asc"
        ? (av as number - bv) as number
        : (bv as number - av) as number
    })
  }, [epSortCol, epSortDir])
  const gridColor = "var(--border)"
  const axisColor = theme === "dark" ? "#444" : "#aaa"
  const stroke2Color = theme === "dark" ? "#555" : "#bbb"
  const errColor = theme === "dark" ? "#f87171" : "#dc2626"
  const latColor = theme === "dark" ? "#60a5fa" : "#2563eb"
  const rpsColor = theme === "dark" ? "#4ade80" : "#16a34a"
  const tickProps = { fontSize: 9, fill: axisColor, fontFamily: "Geist Mono" }
  const commonMargin = { top: 2, right: 4, left: -24, bottom: 0 }
  return (
    <div className="max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:24px_32px] [display:flex] [flex-direction:column] [gap:0]">
      {/* Page header */}
      <div className="[display:flex] [align-items:center] [justify-content:space-between] [padding-bottom:20px] [border-bottom:1px_solid_var(--border)] [margin-bottom:24px]">
        <div>
          <h1 className="[font-size:18px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)] [margin:0_0_4px]">
            Overview
          </h1>
          <p className="[font-size:13px] [color:var(--text-3)] [margin:0]">
            System health and key metrics for {RANGE_LABELS[timeRange]}
          </p>
        </div>
        <div className="[display:flex] [align-items:center] [gap:8px] [flex-wrap:wrap] [justify-content:flex-end]">
          <div
            role="tablist"
            aria-label="Overview time range"
            className="[display:flex] [align-items:center] [gap:1px] [padding:2px] [max-width:100%] [overflow-x:auto] [border:1px_solid_var(--border)] [border-radius:6px] [background:var(--bg-2)]"
          >
            {RANGE_OPTIONS.map((option) => {
              const active = timeRange === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTimeRange(option.value)}
                  className={[
                    "[flex-shrink:0] [height:28px] [padding:0_10px] [border:none] [border-radius:4px] [font-size:12px] [font-family:Geist_Mono,_monospace] [font-weight:500] [cursor:pointer] [white-space:nowrap] [transition:background_0.12s,_color_0.12s]",
                    active
                      ? "[background:var(--bg-3)]"
                      : "[background:transparent]",
                    active ? "[color:var(--text-1)]" : "[color:var(--text-3)]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <button className="[display:flex] [align-items:center] [gap:6px] [padding:6px_14px] [border-radius:6px] [font-size:13px] [font-weight:500] [background:var(--text-1)] [color:var(--bg)] [border:none] [cursor:pointer] [letter-spacing:-0.01em]">
                <Plus size={13} /> Create incident
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
      </div>

      {/* KPI stats row */}
      <div className="grid grid-cols-2 min-[641px]:grid-cols-4 min-[1201px]:grid-cols-8 gap-3 [display:grid] [grid-template-columns:repeat(4,_1fr)] [gap:12px] [margin-bottom:20px]">
        {KPI_ITEMS.map(({ label, value, delta, up }) => (
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
              <span
                className={[
                  "[font-size:11px] [font-weight:500]",
                  up ? "[color:var(--green)]" : "[color:var(--red)]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 2-column grid: charts (left 2/3) + sidebar (right 1/3) */}
      <div className="grid grid-cols-1 min-[901px]:grid-cols-[2fr_1fr] gap-3 [margin-bottom:24px]">
        {/* Left: charts */}
        <div className="[display:flex] [flex-direction:column] [gap:12px]">
          {/* Error Rate area chart */}
          <div className="[border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)] [padding:14px_16px]">
            <div className="[display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:12px]">
              <span className="[font-size:12px] [font-weight:500] [color:var(--text-2)]">
                Error Rate (
                {
                  RANGE_OPTIONS.find((option) => option.value === timeRange)
                    ?.label
                }
                )
              </span>
              <span className="[font-size:11px] [font-family:Geist_Mono,_monospace] [padding:2px_8px] [border-radius:4px] [font-weight:500] [background:var(--red-bg)] [border:1px_solid_var(--red-border)] [color:var(--red)]">
                2.3% avg
              </span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={rangeData.errors} margin={commonMargin}>
                <defs>
                  <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={errColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={errColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="t" tick={tickProps} interval={5} />
                <YAxis tick={tickProps} />
                <Tooltip content={CustomTooltip} />
                <ReferenceLine
                  y={5}
                  stroke={errColor}
                  strokeDasharray="3 3"
                  strokeOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  name="err %"
                  stroke={errColor}
                  strokeWidth={1.5}
                  fill="url(#errGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Latency line chart */}
          <div className="[border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)] [padding:14px_16px]">
            <div className="[display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:12px]">
              <span className="[font-size:12px] [font-weight:500] [color:var(--text-2)]">
                Latency (
                {
                  RANGE_OPTIONS.find((option) => option.value === timeRange)
                    ?.label
                }
                )
              </span>
              <div className="[display:flex] [gap:12px]">
                {[
                  { label: "P95", color: latColor },
                  { label: "P99", color: stroke2Color },
                ].map((l) => (
                  <span
                    key={l.label}
                    className="[display:flex] [align-items:center] [gap:5px] [font-size:11px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)]"
                  >
                    <span
                      style={{
                        background: l.color,
                      }}
                      className="[display:inline-block] [width:14px] [height:1.5px] [border-radius:1px]"
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={rangeData.latency} margin={commonMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="t" tick={tickProps} interval={5} />
                <YAxis tick={tickProps} />
                <Tooltip content={CustomTooltip} />
                <Line
                  type="monotone"
                  dataKey="p95"
                  name="p95 ms"
                  stroke={latColor}
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="p99"
                  name="p99 ms"
                  stroke={stroke2Color}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* RPS bar chart */}
          <div className="[border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)] [padding:14px_16px]">
            <div className="[display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:12px]">
              <span className="[font-size:12px] [font-weight:500] [color:var(--text-2)]">
                Requests / min (
                {
                  RANGE_OPTIONS.find((option) => option.value === timeRange)
                    ?.label
                }
                )
              </span>
              <span className="[font-size:11px] [font-family:Geist_Mono,_monospace] [padding:2px_8px] [border-radius:4px] [font-weight:500] [background:var(--green-bg)] [border:1px_solid_var(--green-border)] [color:var(--green)]">
                14,832 rpm
              </span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={rangeData.rps} margin={commonMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="t" tick={tickProps} interval={5} />
                <YAxis tick={tickProps} />
                <Tooltip content={CustomTooltip} />
                <Bar
                  dataKey="v"
                  name="req/min"
                  fill={rpsColor}
                  opacity={0.8}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: service health + recent deployments */}
        <div className="[display:flex] [flex-direction:column] [gap:12px]">
          {/* Service health */}
          <div className="[border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)] [overflow:hidden] [flex:1]">
            <div className="[padding:10px_16px] [border-bottom:1px_solid_var(--border)] [display:flex] [align-items:center] [justify-content:space-between]">
              <span className="[font-size:12px] [font-weight:500] [color:var(--text-2)]">
                Service Health
              </span>
              <div className="[display:flex] [gap:8px] [font-size:11px] [font-family:Geist_Mono,_monospace]">
                <span className="[color:var(--red)]">1 crit</span>
                <span className="[color:var(--yellow)]">1 deg</span>
                <span className="[color:var(--green)]">5 ok</span>
              </div>
            </div>

            {/* Service table header */}
            <div className="[display:grid] [grid-template-columns:1fr_40px_50px_46px] [padding:6px_16px] [border-bottom:1px_solid_var(--border)] [background:var(--bg)]">
              <SvcSortableHeader
                label="Name"
                col="name"
                sortCol={svcSortCol}
                sortDir={svcSortDir}
                onSort={handleSvcSort}
              />
              <SvcSortableHeader
                label="Err"
                col="err"
                sortCol={svcSortCol}
                sortDir={svcSortDir}
                onSort={handleSvcSort}
              />
              <SvcSortableHeader
                label="Lat"
                col="lat"
                sortCol={svcSortCol}
                sortDir={svcSortDir}
                onSort={handleSvcSort}
              />
              <SvcSortableHeader
                label="Health"
                col="health"
                sortCol={svcSortCol}
                sortDir={svcSortDir}
                onSort={handleSvcSort}
              />
            </div>

            <div>
              {sortedServices.map((s) => (
                <div
                  key={s.name}
                  className="[display:grid] [align-items:center] [grid-template-columns:1fr_40px_50px_46px] [padding:8px_16px] [border-bottom:1px_solid_var(--border)] [transition:background_0.1s] [cursor:pointer] hover:[background:var(--bg-3)]"
                >
                  <div className="[display:flex] [align-items:center] [gap:6px] [overflow:hidden]">
                    <HealthDot health={s.health} />
                    <Server
                      size={10}
                      className="[color:var(--text-4)] [flex-shrink:0]"
                    />
                    <span className="[font-size:11px] [font-family:Geist_Mono,_monospace] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap] [color:var(--text-2)]">
                      {s.name}
                    </span>
                  </div>
                  <span
                    style={{
                      color:
                        s.err > 5
                          ? "var(--red)"
                          : s.err > 0.5
                            ? "var(--yellow)"
                            : "var(--text-4)",
                    }}
                    className="[font-size:11px] [font-family:Geist_Mono,_monospace] [text-align:right]"
                  >
                    {s.err}%
                  </span>
                  <span className="[font-size:11px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)] [text-align:right]">
                    {s.lat}ms
                  </span>
                  <span
                    style={{
                      color:
                        s.health === "critical"
                          ? "var(--red)"
                          : s.health === "degraded"
                            ? "var(--yellow)"
                            : "var(--green)",
                    }}
                    className="[font-size:10px] [font-family:Geist_Mono,_monospace] [text-align:right]"
                  >
                    {s.health}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent deployments */}
          <div className="[border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)] [overflow:hidden]">
            <div className="[padding:12px_16px] [border-bottom:1px_solid_var(--border)]">
              <span className="[font-size:12px] [font-weight:500] [color:var(--text-2)]">
                Recent Deployments
              </span>
            </div>
            <div>
              {DEPLOYMENTS.map((d) => (
                <div
                  key={d.service}
                  className="[display:flex] [align-items:center] [gap:8px] [padding:10px_16px] [border-bottom:1px_solid_var(--border)] [transition:background_0.1s] hover:[background:var(--bg-3)]"
                >
                  <DeployStatusIcon status={d.status} />
                  <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [flex:1] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap] [color:var(--text-2)]">
                    {d.service}
                  </span>
                  <span className="[font-size:11px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)] [flex-shrink:0]">
                    {d.version}
                  </span>
                  <span className="[font-size:11px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)] [flex-shrink:0]">
                    {d.ago}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints table */}
      <div className="[border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)] [overflow:hidden]">
        <div className="[padding:12px_16px] [border-bottom:1px_solid_var(--border)]">
          <span className="[font-size:12px] [font-weight:500] [color:var(--text-2)]">
            Top Endpoints
          </span>
        </div>
        <table className="[width:100%] [border-collapse:collapse]">
          <thead>
            <tr className="[background:var(--bg)]">
              <SortableTH
                label="Endpoint"
                col="ep"
                sortCol={epSortCol}
                sortDir={epSortDir}
                onSort={handleEpSort}
              />
              <SortableTH
                label="Error Rate"
                col="rate"
                sortCol={epSortCol}
                sortDir={epSortDir}
                onSort={handleEpSort}
                align="right"
              />
              <SortableTH
                label="RPS"
                col="rps"
                sortCol={epSortCol}
                sortDir={epSortDir}
                onSort={handleEpSort}
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {sortedEndpoints.map((ep, i) => (
              <tr
                key={ep.ep}
                className={[
                  [
                    "[height:40px] [transition:background_0.1s] [cursor:pointer]",
                    i < sortedEndpoints.length - 1
                      ? "[border-bottom:1px_solid_var(--border)]"
                      : "[border-bottom:none]",
                  ]
                    .filter(Boolean)
                    .join(" "),
                  "hover:[background:var(--bg-3)]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <td className="[padding:0_16px]">
                  <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-2)]">
                    {ep.ep}
                  </span>
                </td>
                <td className="[padding:0_16px] [text-align:right]">
                  <span
                    style={{
                      color:
                        ep.rateNum > 5
                          ? "var(--red)"
                          : ep.rateNum > 1
                            ? "var(--yellow)"
                            : "var(--text-3)",
                    }}
                    className="[font-size:11px] [font-family:Geist_Mono,_monospace] [font-weight:500]"
                  >
                    {ep.rate}
                  </span>
                </td>
                <td className="[padding:0_16px] [text-align:right]">
                  <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)]">
                    {ep.rps.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
