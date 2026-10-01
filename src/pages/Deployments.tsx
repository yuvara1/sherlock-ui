import { useState, useMemo } from "react"
import {
  GitBranch,
  GitCommit,
  Zap,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Rocket,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { motion } from "motion/react"
import { SherlockSelect } from "@/components/ui/SherlockSelect"
/* ── Data ─────────────────────────────────────────────── */
const DEPS = [
  {
    id: "a3f9c2b",
    service: "payment-service",
    branch: "fix/batch-payment-n1",
    commit: "a3f9c2b",
    msg: "Add batch payment processing — N+1 query fix",
    env: "production",
    status: "failed",
    dur: "3m 42s",
    author: "alex.kim",
    created: "2m ago",
  },
  {
    id: "b7d4e12",
    service: "order-service",
    branch: "feat/order-search",
    commit: "b7d4e12",
    msg: "Improve order search query performance with index hints",
    env: "production",
    status: "success",
    dur: "8m 22s",
    author: "sam.chen",
    created: "58m ago",
  },
  {
    id: "c9e1f34",
    service: "user-service",
    branch: "feat/jwks-rotation",
    commit: "c9e1f34",
    msg: "Migrate JWKS endpoint to new key rotation policy",
    env: "staging",
    status: "in-progress",
    dur: "running",
    author: "pat.lee",
    created: "1h ago",
  },
  {
    id: "d2f8a56",
    service: "inventory-api",
    branch: "perf/redis-ttl",
    commit: "d2f8a56",
    msg: "Redis cache TTL optimization — reduced cache miss rate 42%",
    env: "production",
    status: "success",
    dur: "8m 11s",
    author: "jordan.wu",
    created: "2h ago",
  },
  {
    id: "e1a2b3c",
    service: "fraud-detection",
    branch: "feat/ml-model-v3",
    commit: "e1a2b3c",
    msg: "Deploy ML model v3.0 — improved F1 score 0.94 → 0.97",
    env: "production",
    status: "success",
    dur: "7m 44s",
    author: "riley.morgan",
    created: "3h ago",
  },
  {
    id: "f4g5h6i",
    service: "api-gateway",
    branch: "chore/nginx-upgrade",
    commit: "f4g5h6i",
    msg: "Upgrade nginx to 1.27.0 — CVE-2024-39144 patch",
    env: "production",
    status: "success",
    dur: "6m 32s",
    author: "dev.ops",
    created: "4h ago",
  },
  {
    id: "j7k8l9m",
    service: "notification-svc",
    branch: "feat/ses-v2",
    commit: "j7k8l9m",
    msg: "Migrate SES API to v2 — broke template rendering, reverted",
    env: "production",
    status: "cancelled",
    dur: "9m 11s",
    author: "alex.kim",
    created: "6h ago",
  },
  {
    id: "n0o1p2q",
    service: "analytics-service",
    branch: "feat/clickhouse",
    commit: "n0o1p2q",
    msg: "Switch aggregation backend from ClickHouse v22 to v24",
    env: "production",
    status: "success",
    dur: "11m 3s",
    author: "sam.chen",
    created: "7h ago",
  },
  {
    id: "r3s4t5u",
    service: "payment-service",
    branch: "fix/idempotency",
    commit: "r3s4t5u",
    msg: "Fix payment idempotency key collision under high concurrency",
    env: "production",
    status: "success",
    dur: "9m 55s",
    author: "alex.kim",
    created: "9h ago",
  },
  {
    id: "v6w7x8y",
    service: "order-service",
    branch: "test/load-test",
    commit: "v6w7x8y",
    msg: "Load test configuration — uncaught OOM in staging",
    env: "staging",
    status: "failed",
    dur: "4m 12s",
    author: "pat.lee",
    created: "11h ago",
  },
  {
    id: "a1b2c3d",
    service: "user-service",
    branch: "fix/session-expiry",
    commit: "a1b2c3d",
    msg: "Fix session token expiry not honoring sliding window",
    env: "production",
    status: "success",
    dur: "7m 48s",
    author: "jordan.wu",
    created: "12h ago",
  },
  {
    id: "e4f5g6h",
    service: "api-gateway",
    branch: "chore/rate-limit-tune",
    commit: "e4f5g6h",
    msg: "Tune rate limit thresholds for burst traffic patterns",
    env: "staging",
    status: "success",
    dur: "5m 21s",
    author: "dev.ops",
    created: "14h ago",
  },
  {
    id: "i7j8k9l",
    service: "fraud-detection",
    branch: "feat/rule-engine-v2",
    commit: "i7j8k9l",
    msg: "Rule engine v2 — false positive rate increased 3x, reverted",
    env: "production",
    status: "cancelled",
    dur: "11m 15s",
    author: "riley.morgan",
    created: "16h ago",
  },
  {
    id: "m0n1o2p",
    service: "inventory-api",
    branch: "fix/stock-race",
    commit: "m0n1o2p",
    msg: "Fix stock reservation race condition under concurrent checkout",
    env: "production",
    status: "success",
    dur: "8m 33s",
    author: "sam.chen",
    created: "18h ago",
  },
  {
    id: "q3r4s5t",
    service: "notification-svc",
    branch: "feat/push-retries",
    commit: "q3r4s5t",
    msg: "Add exponential backoff retry for failed push notifications",
    env: "production",
    status: "success",
    dur: "6m 44s",
    author: "alex.kim",
    created: "20h ago",
  },
  {
    id: "u6v7w8x",
    service: "analytics-service",
    branch: "feat/realtime-agg",
    commit: "u6v7w8x",
    msg: "Implement real-time aggregation pipeline with windowed joins",
    env: "staging",
    status: "in-progress",
    dur: "running",
    author: "pat.lee",
    created: "22h ago",
  },
  {
    id: "y9z0a1b",
    service: "payment-service",
    branch: "feat/multi-currency",
    commit: "y9z0a1b",
    msg: "Add multi-currency support for EUR, GBP, JPY payment flows",
    env: "production",
    status: "success",
    dur: "10m 2s",
    author: "alex.kim",
    created: "1d ago",
  },
  {
    id: "c2d3e4f",
    service: "order-service",
    branch: "perf/db-indexes",
    commit: "c2d3e4f",
    msg: "Add composite indexes on order_items — query time -68%",
    env: "production",
    status: "success",
    dur: "9m 11s",
    author: "jordan.wu",
    created: "1d ago",
  },
  {
    id: "g5h6i7j",
    service: "user-service",
    branch: "feat/mfa-totp",
    commit: "g5h6i7j",
    msg: "TOTP MFA enrollment — migration script failed on replica lag",
    env: "production",
    status: "failed",
    dur: "3m 55s",
    author: "riley.morgan",
    created: "2d ago",
  },
  {
    id: "k8l9m0n",
    service: "api-gateway",
    branch: "chore/tls-1.3",
    commit: "k8l9m0n",
    msg: "Enforce TLS 1.3 minimum — drop TLS 1.0 and 1.1 support",
    env: "production",
    status: "success",
    dur: "4m 58s",
    author: "dev.ops",
    created: "2d ago",
  },
  {
    id: "o1p2q3r",
    service: "fraud-detection",
    branch: "feat/velocity-checks",
    commit: "o1p2q3r",
    msg: "Add card velocity checks — block >5 failed auths per 10 min",
    env: "production",
    status: "success",
    dur: "7m 22s",
    author: "riley.morgan",
    created: "2d ago",
  },
  {
    id: "s4t5u6v",
    service: "inventory-api",
    branch: "feat/bulk-reserve",
    commit: "s4t5u6v",
    msg: "Bulk reservation endpoint for cart checkout optimisation",
    env: "staging",
    status: "success",
    dur: "8m 14s",
    author: "sam.chen",
    created: "3d ago",
  },
  {
    id: "w7x8y9z",
    service: "notification-svc",
    branch: "feat/twilio-v2",
    commit: "w7x8y9z",
    msg: "Twilio SDK v2 migration — webhook signature validation broken",
    env: "production",
    status: "cancelled",
    dur: "11m 40s",
    author: "alex.kim",
    created: "3d ago",
  },
  {
    id: "a0b1c2d",
    service: "analytics-service",
    branch: "feat/dashboard-v2",
    commit: "a0b1c2d",
    msg: "Dashboard v2 — server-side aggregation replaces client-side",
    env: "production",
    status: "success",
    dur: "14m 31s",
    author: "pat.lee",
    created: "4d ago",
  },
  {
    id: "e3f4g5h",
    service: "payment-service",
    branch: "test/chaos-db",
    commit: "e3f4g5h",
    msg: "Chaos test: simulate DB failover — payment rollback incomplete",
    env: "development",
    status: "failed",
    dur: "2m 11s",
    author: "jordan.wu",
    created: "4d ago",
  },
  {
    id: "i6j7k8l",
    service: "user-service",
    branch: "fix/password-hash",
    commit: "i6j7k8l",
    msg: "Upgrade bcrypt cost factor 10 → 12 for new password hashes",
    env: "production",
    status: "success",
    dur: "6m 19s",
    author: "riley.morgan",
    created: "5d ago",
  },
  {
    id: "m9n0o1p",
    service: "api-gateway",
    branch: "chore/waf-rules",
    commit: "m9n0o1p",
    msg: "Update WAF ruleset — block OWASP Top 10 pattern set 3.3.5",
    env: "production",
    status: "success",
    dur: "5m 44s",
    author: "dev.ops",
    created: "5d ago",
  },
  {
    id: "q2r3s4t",
    service: "order-service",
    branch: "feat/returns-api",
    commit: "q2r3s4t",
    msg: "Returns and refund API — full lifecycle with webhook events",
    env: "production",
    status: "success",
    dur: "9m 8s",
    author: "sam.chen",
    created: "6d ago",
  },
  {
    id: "u5v6w7x",
    service: "fraud-detection",
    branch: "chore/model-retrain",
    commit: "u5v6w7x",
    msg: "Scheduled model retrain — updated feature weights Q3 2026",
    env: "staging",
    status: "success",
    dur: "8m 55s",
    author: "riley.morgan",
    created: "7d ago",
  },
]
type Dep = typeof DEPS[0]
type Status = Dep["status"]
type SortDir = "asc" | "desc" | null
const SERVICES = ["all", ...Array.from(new Set(DEPS.map((d) => d.service)))]
const ENVS = ["all", "production", "staging", "development"]
const STATUSES = ["all", "success", "failed", "in-progress", "cancelled"]
function statusConfig(s: Status) {
  return (
    {
      success: {
        label: "Ready",
        color: "var(--green)",
        bg: "var(--green-bg)",
        border: "var(--green-border)",
        dot: "var(--green)",
      },
      failed: {
        label: "Error",
        color: "var(--red)",
        bg: "var(--red-bg)",
        border: "var(--red-border)",
        dot: "var(--red)",
      },
      "in-progress": {
        label: "Building",
        color: "var(--accent)",
        bg: "var(--accent-bg)",
        border: "var(--accent-border)",
        dot: "var(--accent)",
      },
      cancelled: {
        label: "Cancelled",
        color: "var(--text-3)",
        bg: "var(--bg-3)",
        border: "var(--border)",
        dot: "var(--text-4)",
      },
    }[s] ?? {
      label: s,
      color: "var(--text-3)",
      bg: "var(--bg-3)",
      border: "var(--border)",
      dot: "var(--text-4)",
    }
  )
}
function envConfig(e: string) {
  return (
    {
      production: {
        color: "var(--red)",
        bg: "var(--red-bg)",
        border: "var(--red-border)",
      },
      staging: {
        color: "var(--yellow)",
        bg: "var(--yellow-bg)",
        border: "var(--yellow-border)",
      },
      development: {
        color: "var(--text-3)",
        bg: "var(--bg-3)",
        border: "var(--border)",
      },
    }[e] ?? {
      color: "var(--text-3)",
      bg: "var(--bg-3)",
      border: "var(--border)",
    }
  )
}
function avatarColor(name: string) {
  const hue = (name.charCodeAt(0) * 53 + (name.charCodeAt(1) ?? 0) * 19) % 360
  return `hsl(${hue},55%,40%)`
}
function CriticalDot() {
  return (
    <span className="[position:relative] [display:inline-flex] [width:10px] [height:10px] [flex-shrink:0]">
      <span className="[position:absolute] [inset:0] [border-radius:50%] [background:var(--red)] [opacity:0.4] [animation:blink-ring_1.4s_ease-in-out_infinite]" />
      <span className="[position:relative] [width:10px] [height:10px] [border-radius:50%] [background:var(--red)] [animation:blink-dot_1.4s_ease-in-out_infinite]" />
    </span>
  )
}
function StatusIcon({ status }: { status: Status }) {
  if (status === "in-progress")
    return (
      <Rocket size={13} className="[color:var(--accent)] [flex-shrink:0]" />
    )
  if (status === "success")
    return (
      <CheckCircle size={13} className="[color:var(--green)] [flex-shrink:0]" />
    )
  if (status === "failed") return <CriticalDot />
  return <XCircle size={13} className="[color:var(--text-4)] [flex-shrink:0]" />
}
/* ── Sort helpers ─────────────────────────────────────────────── */
function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === "asc") return <ChevronUp size={11} />
  if (dir === "desc") return <ChevronDown size={11} />
  return <ChevronsUpDown size={11} className="[opacity:0.35]" />
}
/* ── Stat card ────────────────────────────────────────── */
function StatCard({
  label,
  value,
  delta,
  deltaColor,
}: {
  label: string
  value: string
  delta?: string
  deltaColor?: string
}) {
  return (
    <div className="[flex:1] [min-width:0] [padding:16px_20px] [border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg)]">
      <p className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.06em] [color:var(--text-3)] [margin:0_0_8px]">
        {label}
      </p>
      <div className="[display:flex] [align-items:baseline] [gap:8px]">
        <span className="[font-size:24px] [font-weight:600] [letter-spacing:-0.03em] [color:var(--text-1)] [font-family:Geist,_sans-serif]">
          {value}
        </span>
        {delta && (
          <span
            style={{
              color: deltaColor ?? "var(--text-3)",
            }}
            className="[font-size:12px] [font-family:Geist_Mono,_monospace]"
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  )
}
const TH_BASE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "var(--text-3)",
  userSelect: "none",
}
/* ── Page ─────────────────────────────────────────────── */
export default function Deployments() {
  const [search, setSearch] = useState("")
  const [service, setService] = useState("all")
  const [status, setStatus] = useState("all")
  const [env, setEnv] = useState("all")
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
  const filtered = useMemo(() => {
    const base = DEPS.filter(
      (d) =>
        (service === "all" || d.service === service) &&
        (status === "all" || d.status === status) &&
        (env === "all" || d.env === env) &&
        (!search ||
          d.msg.toLowerCase().includes(search.toLowerCase()) ||
          d.service.includes(search) ||
          d.commit.includes(search)),
    )
    if (!sortCol || sortDir === null) return base
    return [...base].sort((a: any, b: any) => {
      const av = a[sortCol],
        bv = b[sortCol]
      if (typeof av === "string")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1
    })
  }, [search, service, status, env, sortCol, sortDir])
  const totalDeploys = DEPS.length
  const successCount = DEPS.filter((d) => d.status === "success").length
  const successRate = Math.round((successCount / totalDeploys) * 100)
  const failedToday = DEPS.slice(0, 8).filter(
    (d) => d.status === "failed",
  ).length
  const COL_WIDTHS = [
    "96px",
    "160px",
    "1fr",
    "108px",
    "110px",
    "88px",
    "148px",
    "88px",
  ]
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
      <div
        onClick={() => onSort(col)}
        style={{
          ...style,
        }}
        className={[
          [
            "[cursor:pointer] [display:inline-flex] [align-items:center] [gap:4px]",
            active ? "[color:var(--text-2)]" : "[color:var(--text-3)]",
          ]
            .filter(Boolean)
            .join(" "),
          "[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-3)] [user-select:none]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ChevronUp size={11} />
          ) : sortDir === "desc" ? (
            <ChevronDown size={11} />
          ) : (
            <ChevronsUpDown size={11} className="[opacity:0.35]" />
          )
        ) : (
          <ChevronsUpDown size={11} className="[opacity:0.35]" />
        )}
      </div>
    )
  }
  return (
    <div className="[height:100%] [display:flex] [flex-direction:column] [overflow:hidden] [font-family:Geist,_sans-serif] [font-size:13px] [color:var(--text-1)]">
      {/* Page header */}
      <div className="max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:24px_32px_20px] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [background:var(--bg)]">
        <div className="[display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:20px]">
          <div>
            <h1 className="[font-size:18px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)] [margin:0_0_4px]">
              Deployments
            </h1>
            <p className="[font-size:13px] [color:var(--text-3)] [margin:0]">
              All deployment history across services and environments
            </p>
          </div>
          <button className="[display:flex] [align-items:center] [gap:6px] [height:32px] [padding:0_14px] [border-radius:6px] [border:none] [background:var(--text-1)] [color:var(--bg)] [font-size:13px] [font-weight:500] [cursor:pointer]">
            <Zap size={13} />
            Trigger deploy
          </button>
        </div>

        {/* Stats */}
        <div className="[display:flex] [gap:12px] [margin-bottom:20px]">
          <StatCard
            label="Total Deploys (30d)"
            value={totalDeploys.toString()}
          />
          <StatCard
            label="Success Rate"
            value={`${successRate}%`}
            delta={`${successCount} successful`}
            deltaColor="var(--green)"
          />
          <StatCard label="Avg Deploy Time" value="7m 51s" />
          <StatCard
            label="Failed Today"
            value={failedToday.toString()}
            deltaColor="var(--red)"
          />
        </div>

        {/* Filter bar */}
        <div className="[display:flex] [gap:8px] [align-items:center]">
          <div className="[position:relative] [display:flex] [align-items:center]">
            <Search
              size={13}
              className="[position:absolute] [left:9px] [color:var(--text-4)] [pointer-events:none]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deployments..."
              className="[height:32px] [padding:0_10px_0_30px] [border-radius:6px] [border:1px_solid_var(--border)] [background:var(--bg)] [color:var(--text-1)] [font-size:13px] [outline:none] [width:220px] [font-family:Geist,_sans-serif]"
            />
          </div>
          <SherlockSelect
            value={service}
            onChange={setService}
            options={SERVICES.map((s) => ({
              value: s,
              label: s === "all" ? "All services" : s,
            }))}
            minWidth={160}
          />
          <SherlockSelect
            value={status}
            onChange={setStatus}
            options={STATUSES.map((s) => ({
              value: s,
              label: s === "all" ? "All statuses" : s,
            }))}
            minWidth={130}
          />
          <SherlockSelect
            value={env}
            onChange={setEnv}
            options={ENVS.map((e) => ({
              value: e,
              label: e === "all" ? "All environments" : e,
            }))}
            minWidth={140}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-w-full [flex:1] [overflow-y:auto] [background:var(--bg)]">
        {/* Header */}
        <div
          style={{
            gridTemplateColumns: COL_WIDTHS.join(" "),
          }}
          className="[display:grid] [min-width:800px] [padding:0_32px] [height:36px] [align-items:center] [border-bottom:1px_solid_var(--border)] [position:sticky] [top:0] [background:var(--bg-2)] [z-index:5]"
        >
          <div className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-3)] [user-select:none]">
            Build ID
          </div>
          <SortableTH label="Service" col="service" />
          <div
            className={[
              ["[display:flex] [align-items:center] [gap:4px]"]
                .filter(Boolean)
                .join(" "),
              "[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-3)] [user-select:none]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <GitBranch size={10} className="[opacity:0.5]" /> Branch / Commit
          </div>
          <SortableTH label="Environment" col="env" />
          <SortableTH label="Status" col="status" />
          <SortableTH label="Duration" col="dur" />
          <SortableTH label="Author" col="author" />
          <SortableTH label="Created" col="created" />
        </div>

        {filtered.map((dep, i) => {
          const sc = statusConfig(dep.status)
          const ec = envConfig(dep.env)
          const initials = dep.author
            .split(".")
            .map((p) => p[0]?.toUpperCase())
            .join("")
            .slice(0, 2)
          const running = dep.status === "in-progress"
          return (
            <motion.div
              key={dep.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.015, duration: 0.18 }}
              style={{
                gridTemplateColumns: COL_WIDTHS.join(" "),
              }}
              className="[display:grid] [min-width:800px] [padding:0_32px] [height:40px] [align-items:center] [border-bottom:1px_solid_var(--border)] [cursor:pointer] hover:[background:var(--bg-3)]"
            >
              {/* Build ID */}
              <span className="[font-family:Geist_Mono,_monospace] [font-size:12px] [color:var(--text-2)] [letter-spacing:0.02em]">
                {dep.commit}
              </span>

              {/* Service */}
              <span className="[font-size:13px] [font-weight:500] [color:var(--text-1)] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap] [padding-right:8px]">
                {dep.service}
              </span>

              {/* Branch / Commit */}
              <div className="[min-width:0] [padding-right:16px]">
                <div className="[display:flex] [align-items:center] [gap:5px] [margin-bottom:2px]">
                  <GitBranch
                    size={10}
                    className="[color:var(--text-4)] [flex-shrink:0]"
                  />
                  <span className="[font-size:11px] [font-family:Geist_Mono,_monospace] [color:var(--text-3)] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]">
                    {dep.branch}
                  </span>
                </div>
                <div className="[display:flex] [align-items:center] [gap:5px]">
                  <GitCommit
                    size={10}
                    className="[color:var(--text-4)] [flex-shrink:0]"
                  />
                  <span className="[font-size:11px] [color:var(--text-3)] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]">
                    {dep.msg}
                  </span>
                </div>
              </div>

              {/* Environment */}
              <span
                style={{
                  color: ec.color,
                  background: ec.bg,
                  border: `1px solid ${ec.border}`,
                }}
                className="[display:inline-flex] [align-items:center] [height:20px] [padding:0_7px] [border-radius:4px] [font-size:11px] [font-weight:500] [width:fit-content]"
              >
                {dep.env}
              </span>

              {/* Status */}
              <div className="[display:flex] [align-items:center] [gap:6px]">
                <StatusIcon status={dep.status} />
                <span
                  style={{
                    color: sc.color,
                  }}
                  className="[font-size:12px] [font-weight:500]"
                >
                  {sc.label}
                </span>
              </div>

              {/* Duration */}
              <span
                className={[
                  "[font-family:Geist_Mono,_monospace] [font-size:12px]",
                  running ? "[color:var(--accent)]" : "[color:var(--text-3)]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {dep.dur}
              </span>

              {/* Author */}
              <div className="[display:flex] [align-items:center] [gap:7px]">
                <span
                  style={{
                    background: avatarColor(dep.author),
                  }}
                  className="[width:22px] [height:22px] [border-radius:50%] [flex-shrink:0] [display:flex] [align-items:center] [justify-content:center] [font-size:9px] [font-weight:700] [color:#fff]"
                >
                  {initials}
                </span>
                <span className="[font-size:12px] [color:var(--text-2)] [white-space:nowrap]">
                  {dep.author}
                </span>
              </div>

              {/* Created */}
              <span className="[font-family:Geist_Mono,_monospace] [font-size:12px] [color:var(--text-4)]">
                {dep.created}
              </span>
            </motion.div>
          )
        })}

        {filtered.length === 0 && (
          <div className="[padding:48px_32px] [text-align:center] [color:var(--text-4)] [font-size:13px]">
            No deployments match the current filters.
          </div>
        )}
      </div>
    </div>
  )
}
