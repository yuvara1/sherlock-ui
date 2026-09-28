import { useState, useMemo } from "react"
import {
  Plus,
  Key,
  Copy,
  Check,
  MoreHorizontal,
  ExternalLink,
  Layers,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
const PROJECTS = [
  {
    id: "proj-001",
    name: "E-Commerce Platform",
    slug: "ecommerce",
    description: "Main storefront, checkout, order management, and payments",
    health: "critical",
    services: 8,
    environments: ["development", "staging", "production"],
    activeEnv: "production",
    requests: "14.8K/min",
    requestsNum: 14800,
    errorRate: 2.4,
    incidents: 2,
    apiKeys: 3,
    lastDeploy: "34m ago",
    lastDeployMin: 34,
    team: ["AK", "SC", "PL"],
    language: "Java",
  },
  {
    id: "proj-002",
    name: "Banking Portal",
    slug: "banking",
    description: "Account management, transactions, and compliance reporting",
    health: "healthy",
    services: 12,
    environments: ["development", "staging", "production"],
    activeEnv: "production",
    requests: "6.2K/min",
    requestsNum: 6200,
    errorRate: 0.1,
    incidents: 0,
    apiKeys: 5,
    lastDeploy: "2h ago",
    lastDeployMin: 120,
    team: ["RJ", "ML", "TN", "SK"],
    language: "Java",
  },
  {
    id: "proj-003",
    name: "Mobile API Gateway",
    slug: "mobile-api",
    description: "iOS and Android API layer with push notifications and sync",
    health: "degraded",
    services: 6,
    environments: ["development", "production"],
    activeEnv: "production",
    requests: "9.1K/min",
    requestsNum: 9100,
    errorRate: 1.1,
    incidents: 1,
    apiKeys: 2,
    lastDeploy: "6h ago",
    lastDeployMin: 360,
    team: ["JW", "RM"],
    language: "Node.js",
  },
  {
    id: "proj-004",
    name: "Internal Tools",
    slug: "internal",
    description: "HR system, ticketing, and internal dashboards",
    health: "healthy",
    services: 4,
    environments: ["development", "staging"],
    activeEnv: "staging",
    requests: "820/min",
    requestsNum: 820,
    errorRate: 0.0,
    incidents: 0,
    apiKeys: 1,
    lastDeploy: "3d ago",
    lastDeployMin: 4320,
    team: ["AK"],
    language: "Python",
  },
]
const API_KEYS = [
  {
    id: "key-001",
    name: "Production Telemetry",
    key: "demo_live_x8aF3kP9nQwR2mLvZ5tY7uB4cD6eHjI",
    env: "production",
    created: "2026-08-01",
    lastUsed: "2 min ago",
    status: "active",
  },
  {
    id: "key-002",
    name: "Staging Integration",
    key: "demo_test_a1bC2dE3fG4hI5jK6lM7nO8pQ9rS0t",
    env: "staging",
    created: "2026-07-15",
    lastUsed: "1h ago",
    status: "active",
  },
  {
    id: "key-003",
    name: "CI/CD Pipeline",
    key: "demo_live_y9zA0bB1cC2dD3eE4fF5gG6hH7iI8j",
    env: "production",
    created: "2026-06-10",
    lastUsed: "12h ago",
    status: "active",
  },
]
type SortDir = "asc" | "desc" | null
type SortCol = "name" | "health" | "services" | "requests" | "errorRate" | "lastDeploy" | null
const HEALTH_ORDER: Record<string, number> = {
  critical: 0,
  degraded: 1,
  healthy: 2,
}
function healthBadge(h: string) {
  if (h === "critical")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
      label: "Critical",
    }
  if (h === "degraded")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
      label: "Degraded",
    }
  return {
    color: "var(--green)",
    bg: "var(--green-bg)",
    border: "var(--green-border)",
    label: "Healthy",
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
function SortIcon({
  col,
  sortCol,
  sortDir,
}: {
  col: SortCol
  sortCol: SortCol
  sortDir: SortDir
}) {
  if (sortCol !== col)
    return <ChevronsUpDown size={10} className="[opacity:0.4]" />
  if (sortDir === "asc") return <ChevronUp size={10} />
  if (sortDir === "desc") return <ChevronDown size={10} />
  return <ChevronsUpDown size={10} className="[opacity:0.4]" />
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
  col: SortCol
  sortCol: SortCol
  sortDir: SortDir
  onSort: (c: SortCol) => void
  align?: "left" | "right"
}) {
  return (
    <th
      onClick={() => onSort(col)}
      style={{
        textAlign: align,
      }}
      className={[
        "[padding:10px_16px] [font-size:11px] [font-weight:500] [letter-spacing:0.04em] [text-transform:uppercase] [border-bottom:1px_solid_var(--border)] [white-space:nowrap] [cursor:pointer] [user-select:none]",
        sortCol === col ? "[color:var(--text-2)]" : "[color:var(--text-4)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="[display:inline-flex] [align-items:center] [gap:4px]">
        {label} <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
      </span>
    </th>
  )
}
function ProjectIcon({ slug }: { slug: string }) {
  const icons: Record<string, string> = {
    ecommerce: "🛒",
    banking: "🏦",
    "mobile-api": "📱",
    internal: "🔧",
  }
  const colors: Record<string, string> = {
    ecommerce: "#1d4ed8",
    banking: "#059669",
    "mobile-api": "#7c3aed",
    internal: "#d97706",
  }
  const icon = icons[slug] ?? "📦"
  const color = colors[slug] ?? "#6366f1"
  return (
    <div
      style={{
        background: `${color}18`,
        border: `1px solid ${color}44`,
      }}
      className="[width:32px] [height:32px] [border-radius:6px] [flex-shrink:0] [display:flex] [align-items:center] [justify-content:center] [font-size:14px]"
    >
      {icon}
    </div>
  )
}
function CopyKey({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard?.writeText(value).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handle}
          className="[background:none] [border:none] [cursor:pointer] [color:var(--text-4)] [padding:2px] [display:flex] hover:[color:var(--text-2)]"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {copied ? "Copied!" : "Copy API key"}
      </TooltipContent>
    </Tooltip>
  )
}
export default function Projects() {
  const [tab, setTab] = useState<"projects" | "apikeys">("projects")
  const [sortCol, setSortCol] = useState<SortCol>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  // New Project dialog state
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [newProjectEnv, setNewProjectEnv] = useState("production")
  // Generate API Key dialog state
  const [genKeyOpen, setGenKeyOpen] = useState(false)
  const [genKeyEnv, setGenKeyEnv] = useState("production")
  const [genKeyExpiry, setGenKeyExpiry] = useState("30 days")
  function handleSort(col: SortCol) {
    if (sortCol !== col) {
      setSortCol(col)
      setSortDir("asc")
      return
    }
    if (sortDir === "asc") {
      setSortDir("desc")
      return
    }
    if (sortDir === "desc") {
      setSortDir(null)
      setSortCol(null)
    }
  }
  const sorted = useMemo(() => {
    if (!sortCol || !sortDir) return PROJECTS
    return [...PROJECTS].sort((a, b) => {
      let av: number | string = 0,
        bv: number | string = 0
      if (sortCol === "name") {
        av = a.name
        bv = b.name
      }
      if (sortCol === "health") {
        av = HEALTH_ORDER[a.health] ?? 99
        bv = HEALTH_ORDER[b.health] ?? 99
      }
      if (sortCol === "services") {
        av = a.services
        bv = b.services
      }
      if (sortCol === "requests") {
        av = a.requestsNum
        bv = b.requestsNum
      }
      if (sortCol === "errorRate") {
        av = a.errorRate
        bv = b.errorRate
      }
      if (sortCol === "lastDeploy") {
        av = a.lastDeployMin
        bv = b.lastDeployMin
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortDir === "asc"
        ? (av as number - bv) as number
        : (bv as number - av) as number
    })
  }, [sortCol, sortDir])
  const sp = { col: sortCol, dir: sortDir, onSort: handleSort }
  return (
    <div className="max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:24px_32px] [display:flex] [flex-direction:column] [gap:0]">
      {/* Page header */}
      <div className="[display:flex] [align-items:center] [justify-content:space-between] [padding-bottom:20px] [border-bottom:1px_solid_var(--border)] [margin-bottom:24px]">
        <div>
          <h1 className="[font-size:18px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)] [margin:0_0_4px]">
            Projects
          </h1>
          <p className="[font-size:13px] [color:var(--text-3)] [margin:0]">
            All monitored projects and their health status
          </p>
        </div>
        <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
          <DialogTrigger asChild>
            <button className="[display:flex] [align-items:center] [gap:6px] [padding:6px_14px] [border-radius:6px] [font-size:13px] [font-weight:500] [background:var(--text-1)] [color:var(--bg)] [border:none] [cursor:pointer] [letter-spacing:-0.01em]">
              <Plus size={13} /> New Project
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Project</DialogTitle>
              <DialogDescription>
                Create a new monitored project.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3.5 px-5 py-4">
              <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
                <label>Project Name</label>
                <input
                  className="h-[34px] w-full box-border rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[13px] text-[var(--text-1)] tracking-[-0.004em] outline-none transition-colors focus:border-[var(--accent)]"
                  placeholder="e.g. checkout-service"
                />
              </div>
              <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
                <label>Environment</label>
                <SherlockSelect
                  value={newProjectEnv}
                  onChange={setNewProjectEnv}
                  options={["production", "staging", "development"]}
                />
              </div>
              <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
                <label>Team</label>
                <input
                  className="h-[34px] w-full box-border rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[13px] text-[var(--text-1)] tracking-[-0.004em] outline-none transition-colors focus:border-[var(--accent)]"
                  placeholder="e.g. payments-team"
                />
              </div>
              <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
                <label>Description</label>
                <textarea
                  className="w-full box-border resize-y rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-2 text-[13px] text-[var(--text-1)] tracking-[-0.004em] outline-none transition-colors focus:border-[var(--accent)]"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button className="h-8 rounded-md border border-[var(--border)] bg-transparent px-3.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--text-2)] cursor-pointer transition-colors hover:border-[var(--border-2)] hover:bg-[var(--bg-3)]">
                  Cancel
                </button>
              </DialogClose>
              <DialogClose asChild>
                <button className="h-8 rounded-md border-0 bg-[var(--text-1)] px-3.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--bg)] cursor-pointer transition-opacity hover:opacity-85">
                  Create Project
                </button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="[display:flex] [gap:0] [border-bottom:1px_solid_var(--border)] [margin-bottom:20px]">
        {(["projects", "apikeys"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              borderBottom: `2px solid ${
                tab === t ? "var(--text-1)" : "transparent"
              }`,
            }}
            className={[
              "[padding:8px_16px] [font-size:13px] [background:none] [border:none] [cursor:pointer] [margin-bottom:-1px] [transition:color_0.1s]",
              tab === t ? "[font-weight:500]" : "[font-weight:400]",
              tab === t ? "[color:var(--text-1)]" : "[color:var(--text-4)]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {t === "projects" ? "Projects" : "API Keys"}
          </button>
        ))}
      </div>

      {/* Projects table */}
      {tab === "projects" && (
        <div className="overflow-x-auto max-w-full [border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)]">
          <table className="[width:100%] [min-width:640px] [border-collapse:collapse]">
            <thead>
              <tr className="[background:var(--bg)]">
                <SortableTH
                  label="Name"
                  col="name"
                  sortCol={sp.col}
                  sortDir={sp.dir}
                  onSort={sp.onSort}
                />
                <SortableTH
                  label="Health"
                  col="health"
                  sortCol={sp.col}
                  sortDir={sp.dir}
                  onSort={sp.onSort}
                />
                <SortableTH
                  label="Services"
                  col="services"
                  sortCol={sp.col}
                  sortDir={sp.dir}
                  onSort={sp.onSort}
                  align="right"
                />
                <SortableTH
                  label="Requests/min"
                  col="requests"
                  sortCol={sp.col}
                  sortDir={sp.dir}
                  onSort={sp.onSort}
                  align="right"
                />
                <SortableTH
                  label="Error Rate"
                  col="errorRate"
                  sortCol={sp.col}
                  sortDir={sp.dir}
                  onSort={sp.onSort}
                  align="right"
                />
                <SortableTH
                  label="Last Deploy"
                  col="lastDeploy"
                  sortCol={sp.col}
                  sortDir={sp.dir}
                  onSort={sp.onSort}
                />
                <th className="[padding:10px_16px] [border-bottom:1px_solid_var(--border)]" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => {
                const hb = healthBadge(p.health)
                return (
                  <tr
                    key={p.id}
                    className={[
                      [
                        "[height:56px] [transition:background_0.1s] [cursor:pointer]",
                        i < sorted.length - 1
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
                    {/* Name */}
                    <td className="[padding:0_16px]">
                      <div className="[display:flex] [align-items:center] [gap:10px]">
                        <ProjectIcon slug={p.slug} />
                        <div>
                          <div className="[display:flex] [align-items:center] [gap:6px]">
                            <Layers
                              size={11}
                              className="[color:var(--text-4)] [flex-shrink:0]"
                            />
                            <p className="[font-size:13px] [font-weight:500] [color:var(--text-1)] [margin:0_0_1px] [letter-spacing:-0.01em]">
                              {p.name}
                            </p>
                          </div>
                          <p className="[font-size:11px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)] [margin:0]">
                            {p.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Health */}
                    <td className="[padding:0_16px]">
                      <div className="[display:flex] [align-items:center] [gap:6px]">
                        {p.health === "critical" && <CriticalDot />}
                        <span
                          style={{
                            background: hb.bg,
                            border: `1px solid ${hb.border}`,
                            color: hb.color,
                          }}
                          className="[font-size:11px] [font-weight:500] [padding:2px_8px] [border-radius:4px]"
                        >
                          {hb.label}
                        </span>
                      </div>
                    </td>

                    {/* Services */}
                    <td className="[padding:0_16px] [text-align:right]">
                      <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-3)]">
                        {p.services}
                      </span>
                    </td>

                    {/* Requests/min */}
                    <td className="[padding:0_16px] [text-align:right]">
                      <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-2)]">
                        {p.requests}
                      </span>
                    </td>

                    {/* Error Rate */}
                    <td className="[padding:0_16px] [text-align:right]">
                      <span
                        style={{
                          color:
                            p.errorRate > 1
                              ? "var(--red)"
                              : p.errorRate > 0.5
                                ? "var(--yellow)"
                                : "var(--text-3)",
                        }}
                        className="[font-size:12px] [font-family:Geist_Mono,_monospace] [font-weight:500]"
                      >
                        {p.errorRate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Last Deploy */}
                    <td className="[padding:0_16px]">
                      <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)]">
                        {p.lastDeploy}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="[padding:0_16px] [text-align:right]">
                      <div className="[display:flex] [align-items:center] [gap:4px] [justify-content:flex-end]">
                        <button className="[width:28px] [height:28px] [border-radius:4px] [display:flex] [align-items:center] [justify-content:center] [background:transparent] [border:1px_solid_var(--border)] [cursor:pointer] [color:var(--text-4)] [transition:all_0.1s] hover:[background:var(--bg-3)] hover:[color:var(--text-2)]">
                          <ExternalLink size={11} />
                        </button>
                        <button className="[width:28px] [height:28px] [border-radius:4px] [display:flex] [align-items:center] [justify-content:center] [background:transparent] [border:1px_solid_var(--border)] [cursor:pointer] [color:var(--text-4)] [transition:all_0.1s] hover:[background:var(--bg-3)] hover:[color:var(--text-2)]">
                          <MoreHorizontal size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* API Keys tab */}
      {tab === "apikeys" && (
        <div className="[display:flex] [flex-direction:column] [gap:16px]">
          {/* Header card */}
          <div className="[display:flex] [align-items:center] [justify-content:space-between] [padding:14px_16px] [border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)]">
            <div className="[display:flex] [align-items:center] [gap:10px]">
              <div className="[width:32px] [height:32px] [border-radius:6px] [background:var(--bg-3)] [border:1px_solid_var(--border)] [display:flex] [align-items:center] [justify-content:center]">
                <Key size={14} className="[color:var(--accent)]" />
              </div>
              <div>
                <p className="[font-size:13px] [font-weight:500] [color:var(--text-1)] [margin:0_0_2px]">
                  API Keys
                </p>
                <p className="[font-size:12px] [color:var(--text-3)] [margin:0]">
                  Authenticate your applications and send telemetry
                </p>
              </div>
            </div>
            <Dialog open={genKeyOpen} onOpenChange={setGenKeyOpen}>
              <DialogTrigger asChild>
                <button className="[display:flex] [align-items:center] [gap:6px] [padding:6px_14px] [border-radius:6px] [font-size:13px] [font-weight:500] [background:var(--text-1)] [color:var(--bg)] [border:none] [cursor:pointer]">
                  <Plus size={13} /> Generate key
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key to authenticate your applications.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3.5 px-5 py-4">
                  <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
                    <label>Key Name</label>
                    <input
                      className="h-[34px] w-full box-border rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[13px] text-[var(--text-1)] tracking-[-0.004em] outline-none transition-colors focus:border-[var(--accent)]"
                      placeholder="e.g. ci-deploy-key"
                    />
                  </div>
                  <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
                    <label>Environment</label>
                    <SherlockSelect
                      value={genKeyEnv}
                      onChange={setGenKeyEnv}
                      options={["production", "staging", "development"]}
                    />
                  </div>
                  <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
                    <label>Expiry</label>
                    <SherlockSelect
                      value={genKeyExpiry}
                      onChange={setGenKeyExpiry}
                      options={["30 days", "90 days", "1 year", "Never"]}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <button className="h-8 rounded-md border border-[var(--border)] bg-transparent px-3.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--text-2)] cursor-pointer transition-colors hover:border-[var(--border-2)] hover:bg-[var(--bg-3)]">
                      Cancel
                    </button>
                  </DialogClose>
                  <DialogClose asChild>
                    <button className="h-8 rounded-md border-0 bg-[var(--text-1)] px-3.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--bg)] cursor-pointer transition-opacity hover:opacity-85">
                      Generate Key
                    </button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Keys table */}
          <div className="overflow-x-auto max-w-full [border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)]">
            <table className="[width:100%] [min-width:640px] [border-collapse:collapse]">
              <thead>
                <tr className="[background:var(--bg)]">
                  {[
                    "Key name",
                    "Environment",
                    "Created",
                    "Last used",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="[padding:10px_16px] [text-align:left] [font-size:11px] [font-weight:500] [color:var(--text-4)] [letter-spacing:0.04em] [text-transform:uppercase] [border-bottom:1px_solid_var(--border)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {API_KEYS.map((k, i) => (
                  <tr
                    key={k.id}
                    className={[
                      [
                        "[height:52px] [transition:background_0.1s]",
                        i < API_KEYS.length - 1
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
                      <p className="[font-size:13px] [font-weight:500] [color:var(--text-1)] [margin:0_0_2px]">
                        {k.name}
                      </p>
                      <div className="[display:flex] [align-items:center] [gap:4px]">
                        <span className="[font-size:11px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)]">
                          {k.key.slice(0, 14)}••••••••••
                        </span>
                        <CopyKey value={k.key} />
                      </div>
                    </td>
                    <td className="[padding:0_16px]">
                      <span
                        className={[
                          "[font-size:11px] [font-family:Geist_Mono,_monospace] [padding:2px_8px] [border-radius:4px] [background:var(--bg-3)] [border:1px_solid_var(--border)]",
                          k.env === "production"
                            ? "[color:var(--red)]"
                            : "[color:var(--yellow)]",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {k.env}
                      </span>
                    </td>
                    <td className="[padding:0_16px]">
                      <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-4)]">
                        {k.created}
                      </span>
                    </td>
                    <td className="[padding:0_16px]">
                      <span className="[font-size:12px] [font-family:Geist_Mono,_monospace] [color:var(--text-3)]">
                        {k.lastUsed}
                      </span>
                    </td>
                    <td className="[padding:0_16px]">
                      <span className="[font-size:11px] [font-weight:500] [padding:2px_8px] [border-radius:4px] [background:var(--green-bg)] [border:1px_solid_var(--green-border)] [color:var(--green)]">
                        {k.status}
                      </span>
                    </td>
                    <td className="[padding:0_16px] [text-align:right]">
                      <button className="[width:28px] [height:28px] [border-radius:4px] [display:flex] [align-items:center] [justify-content:center] [background:transparent] [border:1px_solid_var(--border)] [cursor:pointer] [color:var(--text-4)] hover:[background:var(--bg-3)] hover:[color:var(--text-2)]">
                        <MoreHorizontal size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
