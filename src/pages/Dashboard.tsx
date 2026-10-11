import PageHeading from "@/components/workspace/PageHeading"
import PageInsights from "@/components/workspace/PageInsights"
import { SherlockGrid } from "@/components/ui/SherlockGrid"
import { Button as SortButton } from "@/components/ui/button"
import { useState, useMemo } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
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
  RefreshCw,
  FlaskConical,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CardTitle } from "@/components/ui/card"
import { useActiveProject, useAppStore } from "@/stores/appStore"
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
  { label: "Total requests", value: "889.9k", delta: "+8.2%", up: true },
  { label: "Error Rate", value: "2.3%", delta: "+1.4pp", up: false },
  { label: "Failed requests", value: "20.4k", delta: "+12.8%", up: false },
  { label: "Median response", value: "48ms", delta: "-6ms", up: true },
  { label: "Active investigations", value: "3", delta: "+1", up: false },
]
const RECENT_REQUESTS = [
  {
    time: "14:35:12.441",
    method: "POST",
    endpoint: "/v1/payments/charge",
    status: 503,
    duration: "30.02s",
    environment: "production",
    trace: "7af9c2e81b0d",
  },
  {
    time: "14:34:58.881",
    method: "GET",
    endpoint: "/v1/orders/ord_8912",
    status: 200,
    duration: "84ms",
    environment: "production",
    trace: "148bf7a03c91",
  },
  {
    time: "14:34:44.020",
    method: "POST",
    endpoint: "/v1/auth/refresh",
    status: 401,
    duration: "31ms",
    environment: "production",
    trace: "2e7f4c8d91aa",
  },
  {
    time: "14:34:31.774",
    method: "PUT",
    endpoint: "/v1/inventory/reserve",
    status: 504,
    duration: "10.00s",
    environment: "staging",
    trace: "9c0aab17d426",
  },
  {
    time: "14:34:18.206",
    method: "GET",
    endpoint: "/v1/users/profile",
    status: 200,
    duration: "27ms",
    environment: "development",
    trace: "56d8fa1c34eb",
  },
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
interface SortIconProps {
  active: boolean
  dir: SortDir
}
function SortIconEl({ active, dir }: SortIconProps) {
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
      aria-sort={
        active && sortDir
          ? sortDir === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
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
      <SortButton
        variant="ghost"
        size="sm"
        className="sort-trigger"
        aria-label={`Sort by ${label}`}
        onClick={() => onSort(col)}
      >
        <span className="[display:inline-flex] [align-items:center] [gap:3px]">
          {label} <SortIconEl active={active} dir={sortDir} />
        </span>
      </SortButton>
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
    <SortButton
      variant="ghost"
      size="sm"
      aria-label={`Sort by ${label}`}
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
    </SortButton>
  )
}
export default function Dashboard() {
  const { theme } = useTheme()
  const activeProject = useActiveProject()
  const activeEnvironment = useAppStore((state) => state.activeEnvironment)
  const [_unused] = useState(null)
  const [timeRange, setTimeRange] = useState<TimeRange>("1h")
  const [lastUpdated, setLastUpdated] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  )
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
        ? Number(av) - Number(bv)
        : Number(bv) - Number(av)
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
        ? Number(av) - Number(bv)
        : Number(bv) - Number(av)
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
    <div className="app-page page-header-region max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:16px_20px] [display:flex] [flex-direction:column] [gap:0]">
      {/* Page header */}
      <PageHeading
        className="page-heading-row flex-wrap gap-3 [display:flex] [align-items:center] [justify-content:space-between] [padding-bottom:14px] [border-bottom:1px_solid_var(--border)] [margin-bottom:16px]"
        actions={
          <>
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
                        active
                          ? "[color:var(--text-1)]"
                          : "[color:var(--text-3)]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setLastUpdated(
                    new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  )
                }
                aria-label="Refresh overview data"
              >
                <RefreshCw size={13} aria-hidden="true" />
                Refresh
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/app/apis">
                  <FlaskConical size={13} aria-hidden="true" />
                  Test API
                </Link>
              </Button>
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
          </>
        }
      >
        <div>
          <h1 className="page-title [font-size:18px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)] [margin:0_0_4px]">
            {activeProject?.name ?? "Project"} overview
          </h1>
          <p className="[font-size:13px] [color:var(--text-3)] [margin:0]">
            {activeEnvironment} · System health for {RANGE_LABELS[timeRange]} ·
            Updated {lastUpdated}
          </p>
        </div>
      </PageHeading>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <AlertCircle
              size={16}
              className="text-primary"
              aria-hidden="true"
            />
            <span className="font-semibold">
              Payment service needs attention
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Demo scenario
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            12.4% error rate · P95 latency 312ms · Latest deployment failed
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/app/incidents">Review incidents</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/app/ai">Open AI debugger</Link>
          </Button>
        </div>
      </div>

      {/* KPI stats row */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
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

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3 text-xs font-medium text-[var(--text-2)]">
          Top Endpoints
        </div>
        <SherlockGrid
          rowData={sortedEndpoints}
          getRowId={({ data }) => data.ep}
          domLayout="autoHeight"
          showPagination={false}
          columnDefs={[
            {
              field: "ep",
              headerName: "Endpoint",
              minWidth: 280,
              flex: 1,
              cellClass: "font-mono text-xs",
            },
            { field: "rate", headerName: "Error rate", minWidth: 120 },
            {
              field: "rps",
              headerName: "RPS",
              minWidth: 100,
              valueFormatter: ({ value }) => value.toLocaleString(),
            },
          ]}
        />
      </div>

      <section className="mb-6 overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div>
            <CardTitle className="text-sm">Recent API activity</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Latest request outcomes across the selected project
            </p>
          </div>
          <Badge variant="ghost">Demo telemetry</Badge>
        </div>
        <SherlockGrid
          rowData={RECENT_REQUESTS}
          getRowId={({ data }) => data.trace}
          domLayout="autoHeight"
          showPagination={false}
          columnDefs={[
            { field: "time", headerName: "Timestamp", minWidth: 130 },
            { field: "method", headerName: "Method", minWidth: 100 },
            { field: "endpoint", headerName: "Endpoint", minWidth: 250, flex: 1 },
            { field: "status", headerName: "Status", minWidth: 100 },
            { field: "duration", headerName: "Duration", minWidth: 110 },
            { field: "environment", headerName: "Environment", minWidth: 130 },
            { field: "trace", headerName: "Trace ID", minWidth: 160 },
          ]}
        />
      </section>

      <PageInsights
        page="overview"
        segments={[
          {
            label: "Healthy",
            count: SERVICES.filter((item) => item.health === "healthy").length,
            tone: "success",
          },
          {
            label: "Degraded",
            count: SERVICES.filter((item) => item.health === "degraded").length,
            tone: "warning",
          },
          {
            label: "Critical",
            count: SERVICES.filter((item) => item.health === "critical").length,
            tone: "danger",
          },
        ]}
      />
    </div>
  )
}
