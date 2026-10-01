import { useState, useMemo } from "react"
import {
  Server,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react"
import { SherlockSelect } from "@/components/ui/SherlockSelect"
/* ── Data ────────────────────────────────────────────────────── */
const SERVICES = [
  {
    name: "payment-service",
    lang: "Java",
    health: "Critical",
    rpm: 1840,
    errRate: 12.4,
    p95: 312,
    instances: 4,
    lastSeen: "2s ago",
  },
  {
    name: "order-service",
    lang: "Node.js",
    health: "Degraded",
    rpm: 3201,
    errRate: 1.1,
    p95: 94,
    instances: 6,
    lastSeen: "1s ago",
  },
  {
    name: "user-service",
    lang: "Go",
    health: "Healthy",
    rpm: 5820,
    errRate: 0.1,
    p95: 28,
    instances: 8,
    lastSeen: "just now",
  },
  {
    name: "notification-svc",
    lang: "Python",
    health: "Healthy",
    rpm: 1240,
    errRate: 0.0,
    p95: 15,
    instances: 3,
    lastSeen: "3s ago",
  },
  {
    name: "inventory-api",
    lang: "Go",
    health: "Healthy",
    rpm: 2100,
    errRate: 0.3,
    p95: 45,
    instances: 4,
    lastSeen: "1s ago",
  },
  {
    name: "fraud-detection",
    lang: "Python",
    health: "Healthy",
    rpm: 890,
    errRate: 0.0,
    p95: 88,
    instances: 2,
    lastSeen: "4s ago",
  },
  {
    name: "analytics-service",
    lang: "Scala",
    health: "Healthy",
    rpm: 540,
    errRate: 0.2,
    p95: 210,
    instances: 2,
    lastSeen: "5s ago",
  },
  {
    name: "api-gateway",
    lang: "Go",
    health: "Healthy",
    rpm: 14832,
    errRate: 0.4,
    p95: 8,
    instances: 6,
    lastSeen: "just now",
  },
]
type Service = typeof SERVICES[0]
type SortDir = "asc" | "desc" | null
/* ── Helpers ─────────────────────────────────────────────────── */
function healthColor(h: string) {
  if (h === "Critical")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    }
  if (h === "Degraded")
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
function HealthBadge({ health }: { health: string }) {
  const t = healthColor(health)
  return (
    <span
      style={{
        color: t.color,
        background: t.bg,
        border: `1px solid ${t.border}`,
      }}
      className="[display:inline-flex] [align-items:center] [gap:5px] [padding:2px_8px] [border-radius:4px] [font-size:11px] [font-weight:500] [font-family:Geist,_sans-serif] [white-space:nowrap]"
    >
      {health === "Critical" ? (
        <CriticalDot />
      ) : (
        <span
          style={{
            background: t.color,
          }}
          className="[width:5px] [height:5px] [border-radius:50%] [flex-shrink:0]"
        />
      )}
      {health}
    </span>
  )
}
const LANG_COLORS: Record<string, {
  bg: string
  color: string
}> = {
  Go: { bg: "rgba(0,172,215,0.1)", color: "#00ACD7" },
  "Node.js": { bg: "rgba(83,158,67,0.1)", color: "#539E43" },
  Python: { bg: "rgba(55,118,171,0.1)", color: "#3776AB" },
  Java: { bg: "rgba(234,45,46,0.1)", color: "#EA2D2E" },
  Scala: { bg: "rgba(220,50,47,0.1)", color: "#DC322F" },
}
function LangBadge({ lang }: { lang: string }) {
  const c = LANG_COLORS[lang] ?? { bg: "var(--bg-3)", color: "var(--text-3)" }
  return (
    <span
      style={{
        color: c.color,
        background: c.bg,
      }}
      className="[display:inline-block] [padding:2px_7px] [border-radius:4px] [font-size:11px] [font-weight:500] [font-family:Geist_Mono,_monospace] [letter-spacing:-0.01em]"
    >
      {lang}
    </span>
  )
}
const TH_BASE: React.CSSProperties = {
  padding: "0 16px",
  height: 36,
  textAlign: "left",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.02em",
  whiteSpace: "nowrap",
  borderBottom: "1px solid var(--border)",
  background: "var(--bg)",
}
const TD_STYLE: React.CSSProperties = {
  padding: "0 16px",
  height: 40,
  fontSize: 13,
  borderBottom: "1px solid var(--border)",
  whiteSpace: "nowrap",
}
/* ── Sort helpers ─────────────────────────────────────────────── */
function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === "asc") return <ChevronUp size={11} />
  if (dir === "desc") return <ChevronDown size={11} />
  return <ChevronsUpDown size={11} className="[opacity:0.35]" />
}
function SortableTH({
  label,
  col,
  align = "left",
  sortCol,
  sortDir,
  onSort,
}: {
  label: string
  col: string
  align?: "left" | "right"
  sortCol: string
  sortDir: SortDir
  onSort: (col: string) => void
}) {
  const active = sortCol === col
  return (
    <th
      onClick={() => onSort(col)}
      style={{
        textAlign: align,
      }}
      className={[
        [
          "[cursor:pointer] [user-select:none]",
          active ? "[color:var(--text-2)]" : "[color:var(--text-4)]",
        ]
          .filter(Boolean)
          .join(" "),
        "[padding:0_16px] [height:36px] [text-align:left] [font-size:11px] [font-weight:500] [letter-spacing:0.02em] [white-space:nowrap] [border-bottom:1px_solid_var(--border)] [background:var(--bg)]",
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
/* ── Page ────────────────────────────────────────────────────── */
const HEALTH_FILTERS = ["All", "Healthy", "Degraded", "Critical"]
const LANG_FILTERS = ["All", "Go", "Java", "Node.js", "Python", "Scala"]
export default function Services() {
  const [search, setSearch] = useState("")
  const [healthFilter, setHealthFilter] = useState("All")
  const [langFilter, setLangFilter] = useState("All")
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
  const counts = useMemo(
    () => ({
      total: SERVICES.length,
      healthy: SERVICES.filter((s) => s.health === "Healthy").length,
      degraded: SERVICES.filter((s) => s.health === "Degraded").length,
      critical: SERVICES.filter((s) => s.health === "Critical").length,
    }),
    [],
  )
  const filtered = useMemo(() => {
    const base = SERVICES.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()))
        return false
      if (healthFilter !== "All" && s.health !== healthFilter) return false
      if (langFilter !== "All" && s.lang !== langFilter) return false
      return true
    })
    if (!sortCol || sortDir === null) return base
    return [...base].sort((a: any, b: any) => {
      const av = a[sortCol],
        bv = b[sortCol]
      if (typeof av === "string")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1
    })
  }, [search, healthFilter, langFilter, sortCol, sortDir])
  const kpis = [
    { label: "Total Services", value: counts.total, delta: null },
    {
      label: "Healthy",
      value: counts.healthy,
      delta: { text: "operational", color: "var(--green)" },
    },
    {
      label: "Degraded",
      value: counts.degraded,
      delta:
        counts.degraded > 0
          ? { text: "needs attention", color: "var(--yellow)" }
          : null,
    },
    {
      label: "Critical",
      value: counts.critical,
      delta:
        counts.critical > 0
          ? { text: "action required", color: "var(--red)" }
          : null,
    },
  ]
  const inputStyle: React.CSSProperties = {
    height: 32,
    padding: "0 10px",
    borderRadius: 6,
    border: "1px solid var(--border)",
    background: "var(--bg-2)",
    color: "var(--text-1)",
    fontSize: 12,
    fontFamily: "Geist, sans-serif",
    outline: "none",
    letterSpacing: "-0.01em",
  }
  return (
    <div className="max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:24px_32px] [font-family:Geist,_sans-serif] [min-height:100%]">
      {/* Page header */}
      <div className="[display:flex] [align-items:center] [justify-content:space-between] [padding-bottom:20px] [border-bottom:1px_solid_var(--border)] [margin-bottom:20px]">
        <div>
          <h1 className="[font-size:18px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)] [margin:0]">
            Services
          </h1>
          <p className="[font-size:13px] [color:var(--text-3)] [margin:4px_0_0]">
            All instrumented services and their real-time health
          </p>
        </div>
        <button className="[height:32px] [padding:0_14px] [border-radius:6px] [border:none] [background:var(--text-1)] [color:var(--bg)] [font-size:13px] [font-weight:500] [cursor:pointer] [display:flex] [align-items:center] [gap:6px] [letter-spacing:-0.01em] hover:[opacity:0.85]">
          Register service
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 min-[641px]:grid-cols-4 min-[1201px]:grid-cols-8 gap-3 [display:grid] [grid-template-columns:repeat(4,_1fr)] [gap:12px] [margin-bottom:20px]">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="[background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:8px] [padding:16px_20px]"
          >
            <p className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.06em] [color:var(--text-3)] [margin:0_0_10px]">
              {k.label}
            </p>
            <div className="[display:flex] [align-items:baseline] [gap:10px]">
              <span className="[font-size:24px] [font-weight:600] [letter-spacing:-0.03em] [color:var(--text-1)] [font-family:Geist,_sans-serif]">
                {k.value}
              </span>
              {k.delta && (
                <span
                  style={{
                    color: k.delta.color,
                  }}
                  className="[font-size:11px] [font-weight:500]"
                >
                  {k.delta.text}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="[display:flex] [align-items:center] [gap:8px] [margin-bottom:12px]">
        <div className="[position:relative] [flex:0_0_240px]">
          <span className="[position:absolute] [left:10px] [top:50%] [transform:translateY(-50%)] [font-size:13px] [color:var(--text-4)] [pointer-events:none]">
            <Search size={13} />
          </span>
          <input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={[
              ["[padding-left:30px] [width:100%] [box-sizing:border-box]"]
                .filter(Boolean)
                .join(" "),
              "[height:32px] [padding:0_10px] [border-radius:6px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [color:var(--text-1)] [font-size:12px] [font-family:Geist,_sans-serif] [outline:none] [letter-spacing:-0.01em]",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        </div>
        <SherlockSelect
          value={healthFilter}
          onChange={setHealthFilter}
          options={HEALTH_FILTERS.map((f) => ({ value: f, label: f }))}
          minWidth={120}
        />
        <SherlockSelect
          value={langFilter}
          onChange={setLangFilter}
          options={LANG_FILTERS.map((f) => ({ value: f, label: f }))}
          minWidth={120}
        />
        <span className="[font-size:12px] [color:var(--text-4)] [margin-left:4px]">
          {filtered.length} service{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="[background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:8px] [overflow:hidden]">
        <div className="[overflow-x:auto]">
          <table className="[width:100%] [border-collapse:collapse]">
            <thead>
              <tr>
                <SortableTH
                  label="Name"
                  col="name"
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
                <SortableTH
                  label="Language"
                  col="lang"
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
                <SortableTH
                  label="Health"
                  col="health"
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
                <SortableTH
                  label="Requests/min"
                  col="rpm"
                  align="right"
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
                <SortableTH
                  label="Error Rate"
                  col="errRate"
                  align="right"
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
                <SortableTH
                  label="P95 Latency"
                  col="p95"
                  align="right"
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
                <SortableTH
                  label="Instances"
                  col="instances"
                  align="right"
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
                <th
                  className={[
                    ["[color:var(--text-4)]"].filter(Boolean).join(" "),
                    "[padding:0_16px] [height:36px] [text-align:left] [font-size:11px] [font-weight:500] [letter-spacing:0.02em] [white-space:nowrap] [border-bottom:1px_solid_var(--border)] [background:var(--bg)]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  Last Seen
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <ServiceRow
                  key={s.name}
                  s={s}
                  isLast={i === filtered.length - 1}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className={[
                      [
                        "[text-align:center] [color:var(--text-4)] [height:80px]",
                      ]
                        .filter(Boolean)
                        .join(" "),
                      "[padding:0_16px] [height:40px] [font-size:13px] [border-bottom:1px_solid_var(--border)] [white-space:nowrap]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    No services match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
function ServiceRow({ s, isLast }: { s: Service; isLast: boolean }) {
  const [hovered, setHovered] = useState(false)
  const errColor =
    s.errRate > 5
      ? "var(--red)"
      : s.errRate > 0.5
        ? "var(--yellow)"
        : "var(--text-3)"
  const latColor =
    s.p95 > 200 ? "var(--yellow)" : s.p95 > 500 ? "var(--red)" : "var(--text-3)"
  const td: React.CSSProperties = {
    ...TD_STYLE,
    borderBottom: isLast ? "none" : "1px solid var(--border)",
    background: hovered ? "var(--bg-3)" : "transparent",
    transition: "background 0.1s",
  }
  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="[cursor:default]"
    >
      <td
        style={{
          ...td,
        }}
        className="[font-family:Geist_Mono,_monospace] [font-size:12px] [font-weight:500] [color:var(--text-1)]"
      >
        <div className="[display:flex] [align-items:center] [gap:8px]">
          <Server
            size={13}
            style={{
              color:
                s.health === "Critical"
                  ? "var(--red)"
                  : s.health === "Degraded"
                    ? "var(--yellow)"
                    : "var(--green)",
            }}
            className="[flex-shrink:0]"
          />
          {s.name}
        </div>
      </td>
      <td
        className={[
          "[padding:0_16px] [height:40px] [font-size:13px] [border-bottom:1px_solid_var(--border)] [white-space:nowrap] [transition:background_0.1s]",
          isLast
            ? "[border-bottom:none]"
            : "[border-bottom:1px_solid_var(--border)]",
          hovered ? "[background:var(--bg-3)]" : "[background:transparent]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <LangBadge lang={s.lang} />
      </td>
      <td
        className={[
          "[padding:0_16px] [height:40px] [font-size:13px] [border-bottom:1px_solid_var(--border)] [white-space:nowrap] [transition:background_0.1s]",
          isLast
            ? "[border-bottom:none]"
            : "[border-bottom:1px_solid_var(--border)]",
          hovered ? "[background:var(--bg-3)]" : "[background:transparent]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <HealthBadge health={s.health} />
      </td>
      <td
        style={{
          ...td,
        }}
        className="[text-align:right] [font-family:Geist_Mono,_monospace] [color:var(--text-2)]"
      >
        {s.rpm.toLocaleString()}
      </td>
      <td
        style={{
          ...td,
          color: errColor,
        }}
        className="[text-align:right] [font-family:Geist_Mono,_monospace]"
      >
        {s.errRate.toFixed(1)}%
      </td>
      <td
        style={{
          ...td,
          color: latColor,
        }}
        className="[text-align:right] [font-family:Geist_Mono,_monospace]"
      >
        {s.p95}
        <span className="[font-size:11px] [color:var(--text-4)] [margin-left:2px]">
          ms
        </span>
      </td>
      <td
        style={{
          ...td,
        }}
        className="[text-align:right] [font-family:Geist_Mono,_monospace] [color:var(--text-3)]"
      >
        {s.instances}
      </td>
      <td
        style={{
          ...td,
        }}
        className="[color:var(--text-4)] [font-size:12px]"
      >
        {s.lastSeen}
      </td>
    </tr>
  )
}
