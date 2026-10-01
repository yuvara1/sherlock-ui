import { useState, useMemo, useCallback } from "react"
import {
  Plus,
  Trash2,
  BellOff,
  BellRing,
  Bell,
  MessageSquare,
  Mail,
  Globe,
  Zap,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  X,
} from "lucide-react"
import { motion } from "motion/react"
import { SherlockSelect } from "@/components/ui/SherlockSelect"
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
/* ── Types ────────────────────────────────────────────── */
type Severity = "info" | "warning" | "error" | "critical"
type Channel = "slack" | "email" | "webhook" | "pagerduty"
interface AlertRule {
  id: string
  name: string
  metric: string
  condition: string
  threshold: string
  severity: Severity
  channel: Channel
  enabled: boolean
  lastTriggered: string
}
interface FiringAlert {
  id: string
  name: string
  service: string
  triggered: string
  triggeredMin: number
  duration: string
  severity: Severity
  assigned: string
  acked: boolean
  silenced: boolean
}
/* ── Data ─────────────────────────────────────────────── */
const SEED_RULES: AlertRule[] = [
  {
    id: "ALR-201",
    name: "Payment error rate spike",
    metric: "error_rate",
    condition: ">",
    threshold: "5%",
    severity: "critical",
    channel: "pagerduty",
    enabled: true,
    lastTriggered: "2m ago",
  },
  {
    id: "ALR-202",
    name: "Checkout P95 latency",
    metric: "p95_latency",
    condition: ">",
    threshold: "1.5s",
    severity: "error",
    channel: "slack",
    enabled: true,
    lastTriggered: "8m ago",
  },
  {
    id: "ALR-203",
    name: "API Gateway 5xx surge",
    metric: "5xx_rate",
    condition: ">",
    threshold: "1%",
    severity: "error",
    channel: "slack",
    enabled: true,
    lastTriggered: "3h ago",
  },
  {
    id: "ALR-204",
    name: "DB connection pool exhausted",
    metric: "db_conns",
    condition: ">=",
    threshold: "95%",
    severity: "critical",
    channel: "pagerduty",
    enabled: true,
    lastTriggered: "1d ago",
  },
  {
    id: "ALR-205",
    name: "Fraud model latency",
    metric: "p99_latency",
    condition: ">",
    threshold: "800ms",
    severity: "warning",
    channel: "slack",
    enabled: true,
    lastTriggered: "6h ago",
  },
  {
    id: "ALR-206",
    name: "Request volume drop",
    metric: "req_rate",
    condition: "<",
    threshold: "500/s",
    severity: "warning",
    channel: "email",
    enabled: false,
    lastTriggered: "—",
  },
  {
    id: "ALR-207",
    name: "Memory pressure",
    metric: "memory_pct",
    condition: ">",
    threshold: "85%",
    severity: "warning",
    channel: "slack",
    enabled: true,
    lastTriggered: "12h ago",
  },
  {
    id: "ALR-208",
    name: "CPU saturation",
    metric: "cpu_pct",
    condition: ">",
    threshold: "90%",
    severity: "error",
    channel: "webhook",
    enabled: true,
    lastTriggered: "2d ago",
  },
  {
    id: "ALR-209",
    name: "Cache hit rate degraded",
    metric: "cache_hits",
    condition: "<",
    threshold: "80%",
    severity: "info",
    channel: "email",
    enabled: false,
    lastTriggered: "—",
  },
  {
    id: "ALR-210",
    name: "External payment timeouts",
    metric: "timeout_rate",
    condition: ">",
    threshold: "2%",
    severity: "critical",
    channel: "pagerduty",
    enabled: true,
    lastTriggered: "5h ago",
  },
  {
    id: "ALR-211",
    name: "Notification queue backlog",
    metric: "queue_depth",
    condition: ">",
    threshold: "10000",
    severity: "warning",
    channel: "slack",
    enabled: true,
    lastTriggered: "1d ago",
  },
  {
    id: "ALR-212",
    name: "Auth failure spike",
    metric: "401_rate",
    condition: ">",
    threshold: "10%",
    severity: "error",
    channel: "slack",
    enabled: true,
    lastTriggered: "9h ago",
  },
]
const SEED_FIRING: FiringAlert[] = [
  {
    id: "FIR-001",
    name: "Payment error rate spike",
    service: "payment-service",
    triggered: "2m ago",
    triggeredMin: 2,
    duration: "2m 14s",
    severity: "critical",
    assigned: "alex.kim",
    acked: false,
    silenced: false,
  },
  {
    id: "FIR-002",
    name: "Checkout P95 latency",
    service: "order-service",
    triggered: "8m ago",
    triggeredMin: 8,
    duration: "8m 33s",
    severity: "error",
    assigned: "sam.chen",
    acked: true,
    silenced: false,
  },
  {
    id: "FIR-003",
    name: "Inventory stock underflow",
    service: "inventory-api",
    triggered: "14m ago",
    triggeredMin: 14,
    duration: "14m 7s",
    severity: "error",
    assigned: "jordan.wu",
    acked: false,
    silenced: false,
  },
  {
    id: "FIR-004",
    name: "ML inference timeout",
    service: "fraud-detection",
    triggered: "31m ago",
    triggeredMin: 31,
    duration: "31m 02s",
    severity: "warning",
    assigned: "riley.morgan",
    acked: true,
    silenced: false,
  },
  {
    id: "FIR-005",
    name: "SES delivery failure rate",
    service: "notification-svc",
    triggered: "52m ago",
    triggeredMin: 52,
    duration: "52m 18s",
    severity: "warning",
    assigned: "alex.kim",
    acked: false,
    silenced: true,
  },
  {
    id: "FIR-006",
    name: "Analytics pipeline lag",
    service: "analytics-service",
    triggered: "1h ago",
    triggeredMin: 60,
    duration: "1h 4m",
    severity: "info",
    assigned: "pat.lee",
    acked: true,
    silenced: false,
  },
]
/* ── Sort types ───────────────────────────────────────── */
type SortDir = "asc" | "desc" | null
type RuleSortCol = "name" | "metric" | "severity" | "status" | null
type FireSortCol = "name" | "service" | "triggered" | "severity" | null
const SEV_ORDER: Record<Severity, number> = {
  critical: 0,
  error: 1,
  warning: 2,
  info: 3,
}
/* ── Helpers ──────────────────────────────────────────── */
function sevConfig(s: Severity) {
  return {
    critical: {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    },
    error: {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    },
    warning: {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    },
    info: {
      color: "var(--accent)",
      bg: "var(--accent-bg)",
      border: "var(--accent-border)",
    },
  }[s]
}
function CriticalDot() {
  return (
    <span className="[position:relative] [display:inline-flex] [width:10px] [height:10px] [flex-shrink:0]">
      <span className="[position:absolute] [inset:0] [border-radius:50%] [background:var(--red)] [opacity:0.4] [animation:blink-ring_1.4s_ease-in-out_infinite]" />
      <span className="[position:relative] [width:10px] [height:10px] [border-radius:50%] [background:var(--red)] [animation:blink-dot_1.4s_ease-in-out_infinite]" />
    </span>
  )
}
function SortIconEl({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown size={10} className="[opacity:0.4]" />
  if (dir === "asc") return <ChevronUp size={10} />
  if (dir === "desc") return <ChevronDown size={10} />
  return <ChevronsUpDown size={10} className="[opacity:0.4]" />
}
function SortableGridHeader({
  label,
  col,
  sortCol,
  sortDir,
  onSort,
}: {
  label: string
  col: string
  sortCol: string | null
  sortDir: SortDir
  onSort: (c: any) => void
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
        "[font-size:11px] [font-weight:500] [letter-spacing:0.04em] [cursor:pointer] [display:flex] [align-items:center] [gap:4px]",
        active ? "[color:var(--text-2)]" : "[color:var(--text-3)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label} <SortIconEl active={active} dir={sortDir} />
    </div>
  )
}
function SevBadge({ severity }: { severity: Severity }) {
  const c = sevConfig(severity)
  return (
    <span
      style={{
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.border}`,
      }}
      className="[display:inline-flex] [align-items:center] [justify-self:start] [height:20px] [padding:0_7px] [border-radius:4px] [font-size:11px] [font-weight:500]"
    >
      {severity}
    </span>
  )
}
function ChannelIcon({ ch }: { ch: Channel }) {
  const map = {
    slack: { Icon: MessageSquare, label: "Slack" },
    email: { Icon: Mail, label: "Email" },
    webhook: { Icon: Globe, label: "Webhook" },
    pagerduty: { Icon: Zap, label: "PagerDuty" },
  }
  const { Icon, label } = map[ch]
  return (
    <div className="[display:flex] [align-items:center] [gap:5px] [color:var(--text-3)]">
      <Icon size={12} className="[flex-shrink:0]" />
      <span className="[font-size:12px]">{label}</span>
    </div>
  )
}
function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: () => void
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={[
        "[position:relative] [width:32px] [height:18px] [border-radius:999px] [border:none] [cursor:pointer] [transition:background_0.15s] [flex-shrink:0]",
        enabled ? "[background:var(--green)]" : "[background:var(--border)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "[position:absolute] [top:2px] [width:14px] [height:14px] [border-radius:50%] [background:#fff] [transition:left_0.15s]",
          enabled ? "[left:16px]" : "[left:2px]",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </button>
  )
}
function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="[flex:1] [min-width:0] [padding:16px_20px] [border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg)]">
      <p className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.06em] [color:var(--text-3)] [margin:0_0_8px]">
        {label}
      </p>
      <span
        style={{
          color: color ?? "var(--text-1)",
        }}
        className="[font-size:24px] [font-weight:600] [letter-spacing:-0.03em]"
      >
        {value}
      </span>
    </div>
  )
}
/* ── Create Alert Rule Dialog ─────────────────────────── */
function CreateAlertRuleDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (r: AlertRule) => void
}) {
  const [name, setName] = useState("")
  const [metric, setMetric] = useState("error_rate")
  const [condition, setCondition] = useState("greater_than")
  const [threshold, setThreshold] = useState("")
  const [severity, setSeverity] = useState("critical")
  const [notifyVia, setNotifyVia] = useState("slack")
  function submit() {
    if (!name.trim() || !threshold.trim()) return
    onCreate({
      id: `ALR-${200 + Math.floor(Math.random() * 800)}`,
      name,
      metric,
      condition,
      threshold,
      severity: severity as Severity,
      channel: notifyVia as Channel,
      enabled: true,
      lastTriggered: "—",
    })
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Alert Rule</DialogTitle>
          <DialogDescription>
            Configure a new alert rule to monitor your services.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3.5 px-5 py-4">
          <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
            <label>Rule Name</label>
            <input
              className="h-[34px] w-full box-border rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[13px] text-[var(--text-1)] tracking-[-0.004em] outline-none transition-colors focus:border-[var(--accent)]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. High error rate"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
            <label>Metric</label>
            <SherlockSelect
              value={metric}
              onChange={setMetric}
              options={[
                "error_rate",
                "latency_p95",
                "requests_per_min",
                "cpu_usage",
                "memory_usage",
              ]}
              minWidth="100%"
            />
          </div>

          <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
            <label>Condition</label>
            <SherlockSelect
              value={condition}
              onChange={setCondition}
              options={["greater_than", "less_than", "equals"]}
              minWidth="100%"
            />
          </div>

          <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
            <label>Threshold</label>
            <input
              className="h-[34px] w-full box-border rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[13px] text-[var(--text-1)] tracking-[-0.004em] outline-none transition-colors focus:border-[var(--accent)]"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="e.g. 5"
            />
          </div>

          <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
            <label>Severity</label>
            <SherlockSelect
              value={severity}
              onChange={setSeverity}
              options={["critical", "high", "medium", "low"]}
              minWidth="100%"
            />
          </div>

          <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
            <label>Notify via</label>
            <SherlockSelect
              value={notifyVia}
              onChange={setNotifyVia}
              options={["slack", "pagerduty", "email", "webhook"]}
              minWidth="100%"
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
            onClick={submit}
            disabled={!name || !threshold}
          >
            <Plus size={13} /> Create Rule
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
/* ── Page ─────────────────────────────────────────────── */
export default function Alerts() {
  const [tab, setTab] = useState<"rules" | "firing">("rules")
  const [rules, setRules] = useState<AlertRule[]>(SEED_RULES)
  const [firing, setFiring] = useState<FiringAlert[]>(SEED_FIRING)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [sevFilter, setSevFilter] = useState("all")
  // Rules sort
  const [ruleSortCol, setRuleSortCol] = useState<RuleSortCol>(null)
  const [ruleSortDir, setRuleSortDir] = useState<SortDir>(null)
  // Firing sort
  const [fireSortCol, setFireSortCol] = useState<FireSortCol>(null)
  const [fireSortDir, setFireSortDir] = useState<SortDir>(null)
  function handleRuleSort(col: RuleSortCol) {
    if (ruleSortCol !== col) {
      setRuleSortCol(col)
      setRuleSortDir("asc")
      return
    }
    if (ruleSortDir === "asc") {
      setRuleSortDir("desc")
      return
    }
    setRuleSortDir(null)
    setRuleSortCol(null)
  }
  function handleFireSort(col: FireSortCol) {
    if (fireSortCol !== col) {
      setFireSortCol(col)
      setFireSortDir("asc")
      return
    }
    if (fireSortDir === "asc") {
      setFireSortDir("desc")
      return
    }
    setFireSortDir(null)
    setFireSortCol(null)
  }
  const stats = useMemo(
    () => ({
      active: rules.filter((r) => r.enabled).length,
      firingNow: firing.filter((f) => !f.silenced).length,
      silenced: firing.filter((f) => f.silenced).length,
      channels: new Set(rules.map((r) => r.channel)).size,
    }),
    [rules, firing],
  )
  const filteredRules = useMemo(() => {
    let list = rules.filter(
      (r) =>
        (!search ||
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.metric.includes(search)) &&
        (sevFilter === "all" || r.severity === sevFilter),
    )
    if (ruleSortCol && ruleSortDir) {
      list = [...list].sort((a, b) => {
        let av: string | number = "",
          bv: string | number = ""
        if (ruleSortCol === "name") {
          av = a.name
          bv = b.name
        }
        if (ruleSortCol === "metric") {
          av = a.metric
          bv = b.metric
        }
        if (ruleSortCol === "severity") {
          av = SEV_ORDER[a.severity]
          bv = SEV_ORDER[b.severity]
        }
        if (ruleSortCol === "status") {
          av = a.enabled ? 0 : 1
          bv = b.enabled ? 0 : 1
        }
        if (typeof av === "string")
          return ruleSortDir === "asc"
            ? av.localeCompare(bv as string)
            : (bv as string).localeCompare(av)
        return ruleSortDir === "asc"
          ? (av as number - bv) as number
          : (bv as number - av) as number
      })
    }
    return list
  }, [rules, search, sevFilter, ruleSortCol, ruleSortDir])
  const sortedFiring = useMemo(() => {
    if (!fireSortCol || !fireSortDir) return firing
    return [...firing].sort((a, b) => {
      let av: string | number = "",
        bv: string | number = ""
      if (fireSortCol === "name") {
        av = a.name
        bv = b.name
      }
      if (fireSortCol === "service") {
        av = a.service
        bv = b.service
      }
      if (fireSortCol === "triggered") {
        av = a.triggeredMin
        bv = b.triggeredMin
      }
      if (fireSortCol === "severity") {
        av = SEV_ORDER[a.severity]
        bv = SEV_ORDER[b.severity]
      }
      if (typeof av === "string")
        return fireSortDir === "asc"
          ? av.localeCompare(bv as string)
          : (bv as string).localeCompare(av)
      return fireSortDir === "asc"
        ? (av as number - bv) as number
        : (bv as number - av) as number
    })
  }, [firing, fireSortCol, fireSortDir])
  const toggle = useCallback((id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    )
  }, [])
  const deleteRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }, [])
  const ack = useCallback((id: string) => {
    setFiring((prev) =>
      prev.map((f) => (f.id === id ? { ...f, acked: true } : f)),
    )
  }, [])
  const silence = useCallback((id: string) => {
    setFiring((prev) =>
      prev.map((f) => (f.id === id ? { ...f, silenced: true } : f)),
    )
  }, [])
  const RULE_WIDTHS = [
    "1fr",
    "130px",
    "80px",
    "90px",
    "90px",
    "110px",
    "80px",
    "110px",
    "88px",
  ]
  const FIRE_WIDTHS = ["1fr", "160px", "96px", "96px", "90px", "140px", "160px"]
  return (
    <div className="[height:100%] [display:flex] [flex-direction:column] [overflow:hidden] [font-family:Geist,_sans-serif] [font-size:13px] [color:var(--text-1)]">
      {/* Page header */}
      <div className="max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:24px_32px_0] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [background:var(--bg)]">
        <div className="[display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:20px]">
          <div>
            <h1 className="[font-size:18px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)] [margin:0_0_4px]">
              Alerts
            </h1>
            <p className="[font-size:13px] [color:var(--text-3)] [margin:0]">
              Alert rules, notification channels, and firing alerts
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="[display:flex] [align-items:center] [gap:6px] [height:32px] [padding:0_14px] [border-radius:6px] [border:none] [background:var(--text-1)] [color:var(--bg)] [font-size:13px] [font-weight:500] [cursor:pointer]"
          >
            <Plus size={13} /> New rule
          </button>
        </div>

        {/* Stats */}
        <div className="[display:flex] [gap:12px] [margin-bottom:20px]">
          <StatCard label="Active Rules" value={stats.active.toString()} />
          <StatCard
            label="Firing Now"
            value={stats.firingNow.toString()}
            color={stats.firingNow > 0 ? "var(--red)" : "var(--text-1)"}
          />
          <StatCard
            label="Silenced"
            value={stats.silenced.toString()}
            color="var(--yellow)"
          />
          <StatCard label="Channels" value={stats.channels.toString()} />
        </div>

        {/* Tabs */}
        <div className="[display:flex] [gap:0]">
          {([
            ["rules", `Rules (${rules.length})`],
            ["firing", `Firing (${stats.firingNow})`],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                "[font-size:13px] [padding:8px_16px] [cursor:pointer] [border:none] [background:transparent] [border-bottom:2px_solid] [margin-bottom:-1px] [transition:color_0.1s]",
                tab === id
                  ? "[border-bottom-color:var(--text-1)]"
                  : "[border-bottom-color:transparent]",
                tab === id ? "[color:var(--text-1)]" : "[color:var(--text-3)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {label}
              {id === "firing" && stats.firingNow > 0 && (
                <span className="[margin-left:6px] [display:inline-flex] [align-items:center] [justify-content:center] [width:16px] [height:16px] [border-radius:50%] [background:var(--red)] [color:#fff] [font-size:10px] [font-weight:700]">
                  {stats.firingNow}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="[flex:1] [overflow-y:auto] [background:var(--bg)]">
        {/* Rules tab */}
        {tab === "rules" && (
          <>
            {/* Filter bar */}
            <div className="[display:flex] [gap:8px] [padding:16px_32px] [border-bottom:1px_solid_var(--border)]">
              <div className="[position:relative] [display:flex] [align-items:center]">
                <Search
                  size={13}
                  className="[position:absolute] [left:9px] [color:var(--text-4)] [pointer-events:none]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search rules..."
                  className="[height:32px] [padding:0_10px_0_30px] [border-radius:6px] [border:1px_solid_var(--border)] [background:var(--bg)] [color:var(--text-1)] [font-size:13px] [outline:none] [width:200px] [font-family:Geist,_sans-serif]"
                />
              </div>
              <SherlockSelect
                value={sevFilter}
                onChange={setSevFilter}
                options={[
                  { value: "all", label: "All severities" },
                  { value: "critical", label: "Critical" },
                  { value: "error", label: "Error" },
                  { value: "warning", label: "Warning" },
                  { value: "info", label: "Info" },
                ]}
                minWidth={140}
              />
            </div>

            {/* Rules table */}
            <div className="[min-width:900px] [overflow-x:auto]">
              {/* Header */}
              <div
                style={{
                  gridTemplateColumns: RULE_WIDTHS.join(" "),
                }}
                className="[display:grid] [padding:0_32px] [height:36px] [align-items:center] [border-bottom:1px_solid_var(--border)] [background:var(--bg-2)] [position:sticky] [top:0] [z-index:5]"
              >
                <SortableGridHeader
                  label="Name"
                  col="name"
                  sortCol={ruleSortCol}
                  sortDir={ruleSortDir}
                  onSort={handleRuleSort}
                />
                <SortableGridHeader
                  label="Metric"
                  col="metric"
                  sortCol={ruleSortCol}
                  sortDir={ruleSortDir}
                  onSort={handleRuleSort}
                />
                <div className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-3)]">
                  Cond.
                </div>
                <div className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-3)]">
                  Threshold
                </div>
                <SortableGridHeader
                  label="Severity"
                  col="severity"
                  sortCol={ruleSortCol}
                  sortDir={ruleSortDir}
                  onSort={handleRuleSort}
                />
                <div className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-3)]">
                  Channel
                </div>
                <SortableGridHeader
                  label="Status"
                  col="status"
                  sortCol={ruleSortCol}
                  sortDir={ruleSortDir}
                  onSort={handleRuleSort}
                />
                <div className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-3)]">
                  Last triggered
                </div>
                <div />
              </div>

              {filteredRules.map((rule, i) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.015, duration: 0.15 }}
                  style={{
                    gridTemplateColumns: RULE_WIDTHS.join(" "),
                  }}
                  className={[
                    [
                      "[display:grid] [padding:0_32px] [height:40px] [align-items:center] [border-bottom:1px_solid_var(--border)] [cursor:pointer] [transition:background_0.1s]",
                      rule.enabled ? "[opacity:1]" : "[opacity:0.55]",
                    ]
                      .filter(Boolean)
                      .join(" "),
                    "hover:[background:var(--bg-3)]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="[display:flex] [align-items:center] [gap:7px] [overflow:hidden] [padding-right:16px]">
                    <Bell
                      size={12}
                      className="[color:var(--text-4)] [flex-shrink:0]"
                    />
                    <span className="[font-size:13px] [font-weight:500] [color:var(--text-1)] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">
                      {rule.name}
                    </span>
                  </div>
                  <span className="[font-family:Geist_Mono,_monospace] [font-size:12px] [color:var(--text-3)]">
                    {rule.metric}
                  </span>
                  <span className="[font-family:Geist_Mono,_monospace] [font-size:12px] [color:var(--text-2)]">
                    {rule.condition}
                  </span>
                  <span className="[font-family:Geist_Mono,_monospace] [font-size:12px] [color:var(--text-2)] [font-weight:600]">
                    {rule.threshold}
                  </span>
                  <SevBadge severity={rule.severity} />
                  <ChannelIcon ch={rule.channel} />
                  <Toggle
                    enabled={rule.enabled}
                    onChange={() => toggle(rule.id)}
                  />
                  <span className="[font-family:Geist_Mono,_monospace] [font-size:12px] [color:var(--text-4)]">
                    {rule.lastTriggered}
                  </span>
                  <div className="[display:flex] [gap:4px] [justify-content:flex-end]">
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="[display:flex] [padding:4px_6px] [border-radius:5px] [border:1px_solid_var(--border)] [background:transparent] [color:var(--text-4)] [cursor:pointer]"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {filteredRules.length === 0 && (
                <div className="[padding:48px_32px] [display:flex] [flex-direction:column] [align-items:center] [gap:12px] [color:var(--text-4)]">
                  <BellOff size={24} strokeWidth={1.5} />
                  <p className="[font-size:13px] [margin:0]">
                    No rules match these filters.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Firing tab */}
        {tab === "firing" && (
          <div className="[min-width:900px] [overflow-x:auto]">
            {/* Header */}
            <div
              style={{
                gridTemplateColumns: FIRE_WIDTHS.join(" "),
              }}
              className="[display:grid] [padding:0_32px] [height:36px] [align-items:center] [border-bottom:1px_solid_var(--border)] [background:var(--bg-2)] [position:sticky] [top:0] [z-index:5]"
            >
              <SortableGridHeader
                label="Alert"
                col="name"
                sortCol={fireSortCol}
                sortDir={fireSortDir}
                onSort={handleFireSort}
              />
              <SortableGridHeader
                label="Service"
                col="service"
                sortCol={fireSortCol}
                sortDir={fireSortDir}
                onSort={handleFireSort}
              />
              <SortableGridHeader
                label="Triggered"
                col="triggered"
                sortCol={fireSortCol}
                sortDir={fireSortDir}
                onSort={handleFireSort}
              />
              <div className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-3)]">
                Duration
              </div>
              <SortableGridHeader
                label="Severity"
                col="severity"
                sortCol={fireSortCol}
                sortDir={fireSortDir}
                onSort={handleFireSort}
              />
              <div className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-3)]">
                Assigned
              </div>
              <div className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-3)]">
                Actions
              </div>
            </div>

            {sortedFiring.map((f, i) => {
              const sc = sevConfig(f.severity)
              const initials = f.assigned
                .split(".")
                .map((p) => p[0]?.toUpperCase())
                .join("")
                .slice(0, 2)
              const hue =
                (f.assigned.charCodeAt(0) * 53 +
                  (f.assigned.charCodeAt(1) ?? 0) * 19) %
                360
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.15 }}
                  style={{
                    gridTemplateColumns: FIRE_WIDTHS.join(" "),
                    background: f.silenced
                      ? "transparent"
                      : f.severity === "critical"
                        ? "var(--red-bg)"
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!f.silenced)
                      (e.currentTarget as HTMLDivElement).style.background =
                        "var(--bg-3)"
                  }}
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      f.silenced
                        ? "transparent"
                        : f.severity === "critical"
                          ? "var(--red-bg)"
                          : "transparent")
                  }
                  className={[
                    "[display:grid] [padding:0_32px] [height:48px] [align-items:center] [border-bottom:1px_solid_var(--border)] [transition:background_0.1s]",
                    f.silenced ? "[opacity:0.5]" : "[opacity:1]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {/* Alert name */}
                  <div className="[display:flex] [align-items:center] [gap:8px] [overflow:hidden] [padding-right:16px]">
                    {!f.silenced && f.severity === "critical" ? (
                      <CriticalDot />
                    ) : (
                      !f.silenced && (
                        <span
                          style={{
                            background: sc.color,
                          }}
                          className="[width:6px] [height:6px] [border-radius:50%] [flex-shrink:0] [animation:pulse_1.5s_ease-in-out_infinite]"
                        />
                      )
                    )}
                    <BellRing
                      size={12}
                      style={{
                        color: sc.color,
                      }}
                      className="[flex-shrink:0]"
                    />
                    <span className="[font-size:13px] [font-weight:500] [color:var(--text-1)] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">
                      {f.name}
                    </span>
                    {f.acked && (
                      <span className="[font-size:10px] [padding:1px_6px] [border-radius:3px] [background:var(--bg-3)] [color:var(--text-4)] [border:1px_solid_var(--border)] [flex-shrink:0]">
                        acked
                      </span>
                    )}
                  </div>

                  <span className="[font-size:12px] [color:var(--text-2)] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">
                    {f.service}
                  </span>
                  <span className="[font-family:Geist_Mono,_monospace] [font-size:12px] [color:var(--text-3)]">
                    {f.triggered}
                  </span>
                  <span
                    style={{
                      color: sc.color,
                    }}
                    className="[font-family:Geist_Mono,_monospace] [font-size:12px]"
                  >
                    {f.duration}
                  </span>
                  <SevBadge severity={f.severity} />

                  {/* Assigned */}
                  <div className="[display:flex] [align-items:center] [gap:7px]">
                    <span
                      style={{
                        background: `hsl(${hue},55%,40%)`,
                      }}
                      className="[width:22px] [height:22px] [border-radius:50%] [flex-shrink:0] [display:flex] [align-items:center] [justify-content:center] [font-size:9px] [font-weight:700] [color:#fff]"
                    >
                      {initials}
                    </span>
                    <span className="[font-size:12px] [color:var(--text-2)]">
                      {f.assigned}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="[display:flex] [gap:6px]">
                    {!f.acked && (
                      <button
                        onClick={() => ack(f.id)}
                        className="[display:flex] [align-items:center] [gap:5px] [height:26px] [padding:0_10px] [border-radius:5px] [border:1px_solid_var(--border)] [background:transparent] [color:var(--text-2)] [font-size:11px] [font-weight:500] [cursor:pointer]"
                      >
                        <Check size={11} /> Acknowledge
                      </button>
                    )}
                    {!f.silenced && (
                      <button
                        onClick={() => silence(f.id)}
                        className="[display:flex] [align-items:center] [gap:5px] [height:26px] [padding:0_10px] [border-radius:5px] [border:1px_solid_var(--border)] [background:transparent] [color:var(--text-2)] [font-size:11px] [cursor:pointer]"
                      >
                        <BellOff size={11} /> Silence
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <CreateAlertRuleDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={(r) => {
          setRules((prev) => [r, ...prev])
        }}
      />
    </div>
  )
}
