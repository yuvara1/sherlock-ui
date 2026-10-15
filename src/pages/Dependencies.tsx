import DependencyFlow from "@/components/workspace/DependencyFlow"
import PageHeading from "@/components/workspace/PageHeading"
import { SherlockGrid } from "@/components/ui/SherlockGrid"
import { Button as SortButton } from "@/components/ui/button"
import { useState, useCallback } from "react"
import {
  Database,
  Cpu,
  HardDrive,
  Globe,
  Mail,
  MessageSquare,
  BarChart3,
  Shield,
  Package,
  Network,
  Server,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  GitBranch,
  AlertTriangle,
  Zap,
  Cloud,
  ArrowRight,
} from "lucide-react"
/* ── Keyframes injected once ─────────────────────────────── */
/* ── External services data ──────────────────────────────── */
const EXTERNAL = [
  {
    name: "PostgreSQL (primary)",
    type: "Database",
    icon: Database,
    status: "Critical",
    latency: 4500,
    callsPerMin: 8420,
    errRate: 3.2,
    lastCheck: "2s ago",
    node: "postgres",
  },
  {
    name: "Redis Cluster",
    type: "Cache",
    icon: Zap,
    status: "Healthy",
    latency: 2,
    callsPerMin: 32100,
    errRate: 0.0,
    lastCheck: "1s ago",
    node: "redis",
  },
  {
    name: "Apache Kafka",
    type: "Message Queue",
    icon: MessageSquare,
    status: "Healthy",
    latency: 8,
    callsPerMin: 4800,
    errRate: 0.1,
    lastCheck: "1s ago",
    node: "kafka",
  },
  {
    name: "AWS S3",
    type: "Object Storage",
    icon: Cloud,
    status: "Healthy",
    latency: 48,
    callsPerMin: 620,
    errRate: 0.0,
    lastCheck: "5s ago",
    node: "s3",
  },
  {
    name: "Stripe API",
    type: "Payment API",
    icon: Shield,
    status: "Degraded",
    latency: 2800,
    callsPerMin: 240,
    errRate: 1.8,
    lastCheck: "3s ago",
    node: "stripe",
  },
  {
    name: "SendGrid",
    type: "Email API",
    icon: Mail,
    status: "Healthy",
    latency: 310,
    callsPerMin: 85,
    errRate: 0.0,
    lastCheck: "10s ago",
    node: "sendgrid",
  },
  {
    name: "Twilio",
    type: "SMS API",
    icon: MessageSquare,
    status: "Healthy",
    latency: 420,
    callsPerMin: 32,
    errRate: 0.2,
    lastCheck: "8s ago",
    node: "twilio",
  },
  {
    name: "ClickHouse",
    type: "Analytics DB",
    icon: BarChart3,
    status: "Healthy",
    latency: 190,
    callsPerMin: 1200,
    errRate: 0.0,
    lastCheck: "4s ago",
    node: "clickhouse",
  },
  {
    name: "ML Model Server",
    type: "Internal API",
    icon: Cpu,
    status: "Healthy",
    latency: 68,
    callsPerMin: 890,
    errRate: 0.5,
    lastCheck: "2s ago",
    node: "mlserver",
  },
  {
    name: "JWKS Endpoint",
    type: "Auth API",
    icon: Globe,
    status: "Healthy",
    latency: 22,
    callsPerMin: 5200,
    errRate: 0.0,
    lastCheck: "just now",
    node: "jwks",
  },
]
/* ── Packages data ────────────────────────────────────────── */
const PACKAGES = [
  {
    pkg: "log4j-core",
    version: "2.14.1",
    lang: "Java",
    icon: HardDrive,
    vulns: 2,
    severity: "Critical",
    fix: "2.17.1",
    cve: "CVE-2021-44228",
  },
  {
    pkg: "spring-webmvc",
    version: "5.3.18",
    lang: "Java",
    icon: HardDrive,
    vulns: 1,
    severity: "High",
    fix: "5.3.20",
    cve: "CVE-2022-22965",
  },
  {
    pkg: "lodash",
    version: "4.17.19",
    lang: "Node.js",
    icon: Package,
    vulns: 1,
    severity: "High",
    fix: "4.17.21",
    cve: "CVE-2021-23337",
  },
  {
    pkg: "axios",
    version: "0.21.1",
    lang: "Node.js",
    icon: Package,
    vulns: 1,
    severity: "Medium",
    fix: "0.21.2",
    cve: "CVE-2021-3749",
  },
  {
    pkg: "express",
    version: "4.17.1",
    lang: "Node.js",
    icon: Package,
    vulns: 0,
    severity: "None",
    fix: null,
    cve: null,
  },
  {
    pkg: "cryptography",
    version: "3.4.6",
    lang: "Python",
    icon: Shield,
    vulns: 1,
    severity: "High",
    fix: "3.4.8",
    cve: "CVE-2021-3711",
  },
  {
    pkg: "requests",
    version: "2.25.1",
    lang: "Python",
    icon: Package,
    vulns: 0,
    severity: "None",
    fix: null,
    cve: null,
  },
  {
    pkg: "jackson-databind",
    version: "2.12.3",
    lang: "Java",
    icon: HardDrive,
    vulns: 2,
    severity: "High",
    fix: "2.13.4",
    cve: "CVE-2022-42003",
  },
  {
    pkg: "netty-codec-http",
    version: "4.1.65",
    lang: "Java",
    icon: HardDrive,
    vulns: 1,
    severity: "Medium",
    fix: "4.1.68",
    cve: "CVE-2021-43797",
  },
  {
    pkg: "moment",
    version: "2.29.1",
    lang: "Node.js",
    icon: Package,
    vulns: 1,
    severity: "High",
    fix: "2.29.4",
    cve: "CVE-2022-24785",
  },
  {
    pkg: "pillow",
    version: "8.2.0",
    lang: "Python",
    icon: Package,
    vulns: 2,
    severity: "High",
    fix: "9.0.0",
    cve: "CVE-2021-34552",
  },
  {
    pkg: "scala-library",
    version: "2.13.5",
    lang: "Scala",
    icon: Package,
    vulns: 0,
    severity: "None",
    fix: null,
    cve: null,
  },
  {
    pkg: "akka-http",
    version: "10.2.4",
    lang: "Scala",
    icon: Package,
    vulns: 0,
    severity: "None",
    fix: null,
    cve: null,
  },
]
/* ── Service→Dependency edges for graph ─────────────────── */
const SERVICES_GRAPH = [
  {
    id: "payment",
    label: "payment-service",
    icon: Shield,
    deps: ["postgres", "redis", "stripe", "kafka"],
  },
  {
    id: "order",
    label: "order-service",
    icon: GitBranch,
    deps: ["postgres", "kafka", "redis"],
  },
  {
    id: "user",
    label: "user-service",
    icon: Server,
    deps: ["postgres", "redis", "jwks", "sendgrid"],
  },
  {
    id: "notif",
    label: "notification-svc",
    icon: MessageSquare,
    deps: ["kafka", "sendgrid", "twilio"],
  },
  {
    id: "inventory",
    label: "inventory-api",
    icon: HardDrive,
    deps: ["postgres", "redis", "s3"],
  },
  {
    id: "fraud",
    label: "fraud-detection",
    icon: AlertTriangle,
    deps: ["postgres", "mlserver", "kafka"],
  },
  {
    id: "analytics",
    label: "analytics-service",
    icon: BarChart3,
    deps: ["clickhouse", "kafka"],
  },
]
/* ── Helpers ─────────────────────────────────────────────── */
function statusColor(s: string) {
  if (s === "Critical") return "var(--red)"
  if (s === "Degraded") return "var(--yellow)"
  return "var(--green)"
}
function statusTokens(s: string) {
  if (s === "Critical")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    }
  if (s === "Degraded")
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
function severityTokens(s: string) {
  if (s === "Critical")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    }
  if (s === "High")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    }
  if (s === "Medium")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    }
  return { color: "var(--text-4)", bg: "var(--bg-3)", border: "var(--border)" }
}
const LANG_COLORS: Record<string, string> = {
  Java: "#EA2D2E",
  "Node.js": "#539E43",
  Python: "#3776AB",
  Scala: "#DC322F",
}
/* ── Blinking critical dot ───────────────────────────────── */
function CriticalDot() {
  return (
    <span className="[position:relative] [display:inline-flex] [width:10px] [height:10px] [flex-shrink:0]">
      <span className="[position:absolute] [inset:0] [border-radius:50%] [background:var(--red)] [opacity:0.4] [animation:blink-ring_1.4s_ease-in-out_infinite]" />
      <span className="[position:relative] [width:10px] [height:10px] [border-radius:50%] [background:var(--red)] [animation:blink-dot_1.4s_ease-in-out_infinite]" />
    </span>
  )
}
function StatusBadge({ status }: { status: string }) {
  const t = statusTokens(status)
  return (
    <span
      style={{
        color: t.color,
        background: t.bg,
        border: `1px solid ${t.border}`,
      }}
      className="sherlock-grid-chip [display:inline-flex] [align-items:center] [gap:6px] [padding:2px_8px] [border-radius:4px] [font-size:11px] [font-weight:500] [white-space:nowrap]"
    >
      {status === "Critical" ? (
        <CriticalDot />
      ) : (
        <span
          style={{
            background: t.color,
          }}
          className="[width:5px] [height:5px] [border-radius:50%] [flex-shrink:0]"
        />
      )}
      {status}
    </span>
  )
}
function SeverityBadge({ severity }: { severity: string }) {
  const t = severityTokens(severity)
  return (
    <span
      style={{
        color: t.color,
        background: t.bg,
        border: `1px solid ${t.border}`,
      }}
      className="sherlock-grid-chip [display:inline-flex] [align-items:center] [gap:5px] [padding:2px_8px] [border-radius:4px] [font-size:11px] [font-weight:500]"
    >
      {severity !== "None" &&
        (severity === "Critical" ? (
          <CriticalDot />
        ) : (
          <span
            style={{
              background: t.color,
            }}
            className="[width:5px] [height:5px] [border-radius:50%] [flex-shrink:0]"
          />
        ))}
      {severity}
    </span>
  )
}
function LangBadge({ lang }: { lang: string }) {
  const color = LANG_COLORS[lang] ?? "var(--text-3)"
  return (
    <span
      style={{
        color,
        background: `${color}18`,
      }}
      className="sherlock-grid-chip [font-size:11px] [font-family:Geist_Mono,_monospace] [font-weight:500] [padding:2px_7px] [border-radius:4px]"
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
  color: "var(--text-4)",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  borderBottom: "1px solid var(--border)",
  background: "var(--bg)",
}
const TD: React.CSSProperties = {
  padding: "0 16px",
  height: 40,
  fontSize: 13,
  borderBottom: "1px solid var(--border)",
  whiteSpace: "nowrap",
}
/* ── Sort icon ───────────────────────────────────────────── */
type SortDir = "asc" | "desc" | null
function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === "asc") return <ChevronUp size={11} className="[flex-shrink:0]" />
  if (dir === "desc")
    return <ChevronDown size={11} className="[flex-shrink:0]" />
  return <ChevronsUpDown size={11} className="[flex-shrink:0] [opacity:0.35]" />
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
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-2)")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = active
          ? "var(--text-2)"
          : "var(--text-4)")
      }
      className={[
        [
          "[cursor:pointer] [user-select:none] [transition:color_0.1s]",
          active ? "[color:var(--text-2)]" : "[color:var(--text-4)]",
        ]
          .filter(Boolean)
          .join(" "),
        "[padding:0_16px] [height:36px] [text-align:left] [font-size:11px] [font-weight:500] [color:var(--text-4)] [letter-spacing:0.04em] [text-transform:uppercase] [white-space:nowrap] [border-bottom:1px_solid_var(--border)] [background:var(--bg)]",
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
        <span className="[display:inline-flex] [align-items:center] [gap:4px]">
          {label}
          <SortIcon dir={active ? sortDir : null} />
        </span>
      </SortButton>
    </th>
  )
}
/* ── Dependency workflow map ─────────────────────────────── */
function DependencyMap() {
  const [selected, setSelected] = useState<{
    kind: "service" | "dependency"
    id: string
  }>({ kind: "dependency", id: "postgres" })
  const [detailsOpen, setDetailsOpen] = useState(false)
  const selectedService =
    selected.kind === "service"
      ? SERVICES_GRAPH.find((service) => service.id === selected.id)
      : null
  const selectedDependency =
    selected.kind === "dependency"
      ? EXTERNAL.find((dependency) => dependency.node === selected.id)
      : null
  const connectedDependencies = selectedService
    ? EXTERNAL.filter((dependency) =>
        selectedService.deps.includes(dependency.node),
      )
    : []
  const connectedServices = selectedDependency
    ? SERVICES_GRAPH.filter((service) =>
        service.deps.includes(selectedDependency.node),
      )
    : []
  const inspectSelection = (selection: {
    kind: "service" | "dependency"
    id: string
  }) => {
    setSelected(selection)
    setDetailsOpen(true)
  }

  return (
    <div className="flex h-[calc(100dvh-2.875rem)] min-h-[calc(100dvh-2.875rem)] flex-col overflow-hidden bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md border border-info-border bg-info-surface text-info">
            <Network className="size-4" aria-hidden="true" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              Service dependency map
            </div>
            <div className="text-xs text-muted-foreground">
              Explore relationships · Select a node or connection to inspect
              demo traffic
            </div>
          </div>
        </div>
        <span className="rounded border border-warning-border bg-warning-surface px-2 py-1 text-xs font-medium text-warning">
          Demo data · Not production evidence
        </span>
      </div>
      <div className="min-h-0 flex-1 [&_.dependency-flow]:h-full">
        <DependencyFlow
          services={SERVICES_GRAPH}
          dependencies={EXTERNAL}
          selected={selected}
          onSelect={inspectSelection}
        />
      </div>

      <div className="[display:none] max-[640px]:[display:flex] [gap:14px] [padding:10px_14px] [border-top:1px_solid_var(--border)] [background:var(--bg)] [font-size:11px] [color:var(--text-3)]">
        <span className="[color:var(--green)]">● Healthy</span>
        <span className="[color:var(--yellow)]">● Degraded</span>
        <span className="[color:var(--red)]">● Critical</span>
      </div>

      {detailsOpen && (selectedDependency || selectedService) && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setDetailsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dependency-detail-title"
            className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded border border-warning-border bg-warning-surface px-2 py-1 text-xs font-medium text-warning">
                    Demo data
                  </span>
                  {selectedDependency && (
                    <StatusBadge status={selectedDependency.status} />
                  )}
                </div>
                <div
                  id="dependency-detail-title"
                  className="truncate text-base font-semibold text-foreground"
                >
                  {selectedDependency?.name ?? selectedService?.label}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {selectedDependency
                    ? `${selectedDependency.type} · Last checked ${selectedDependency.lastCheck}`
                    : `Internal service · ${selectedService?.deps.length ?? 0} outbound connections`}
                </div>
              </div>
              <SortButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDetailsOpen(false)}
              >
                Close
              </SortButton>
            </div>

            {selectedDependency ? (
              <div className="space-y-5 p-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    [
                      "Latency",
                      selectedDependency.latency >= 1000
                        ? `${(selectedDependency.latency / 1000).toFixed(1)}s`
                        : `${selectedDependency.latency}ms`,
                    ],
                    [
                      "Calls / min",
                      selectedDependency.callsPerMin.toLocaleString(),
                    ],
                    [
                      "Error rate",
                      `${selectedDependency.errRate.toFixed(1)}%`,
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                      </div>
                      <div className="mt-2 font-mono text-lg font-semibold text-foreground">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Connected internal services
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {connectedServices.map((service) => (
                      <span
                        key={service.id}
                        className="rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
                      >
                        {service.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  External dependencies
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {connectedDependencies.map((dependency) => (
                    <div
                      key={dependency.node}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">
                          {dependency.name}
                        </div>
                        <div className="mt-1 font-mono text-xs text-muted-foreground">
                          {dependency.latency}ms ·{" "}
                          {dependency.callsPerMin.toLocaleString()}/min
                        </div>
                      </div>
                      <StatusBadge status={dependency.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
/* ── Sort state hook ─────────────────────────────────────── */
function useSort<T>(data: T[]) {
  const [col, setCol] = useState<string>("")
  const [dir, setDir] = useState<SortDir>(null)
  const onSort = useCallback((c: string) => {
    setCol((prev) => {
      if (prev === c) {
        setDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"))
      } else {
        setDir("asc")
      }
      return c
    })
  }, [])
  const sorted = [...data].sort((a: any, b: any) => {
    if (!col || dir === null) return 0
    const av = a[col],
      bv = b[col]
    if (typeof av === "string" && typeof bv === "string")
      return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
    return dir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1
  })
  return { sorted, col, dir, onSort }
}
/* ── Page ────────────────────────────────────────────────── */
export default function Dependencies({
  view = "map",
}: {
  view?: "map" | "packages"
}) {
  const pkgSort = useSort(PACKAGES)
  const vulnCount = PACKAGES.filter((p) => p.vulns > 0).length
  const criticalVulns = PACKAGES.filter(
    (p) => p.severity === "Critical" || p.severity === "High",
  ).length
  if (view === "map") return <DependencyMap />

  return (
    <div className="app-page page-header-region max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:16px_20px] [font-family:Geist,_sans-serif] [min-height:100%]">
      <PageHeading
        className="page-heading-row [display:flex] [align-items:center] [justify-content:space-between] [padding-bottom:20px] [border-bottom:1px_solid_var(--border)] [margin-bottom:20px]"
        actions={
          <SortButton variant="outline" size="sm">
            Scan packages
          </SortButton>
        }
      >
        <div>
          <h1 className="page-title [font-size:18px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)] [margin:0]">
            Packages
          </h1>
          <p className="[font-size:13px] [color:var(--text-3)] [margin:4px_0_0]">
            Third-party package inventory and known vulnerabilities
          </p>
        </div>
      </PageHeading>

      <div className="[display:flex] [gap:8px] [margin-bottom:16px]">
        {vulnCount > 0 && (
          <span className="[display:inline-flex] [align-items:center] [gap:6px] [padding:4px_10px] [border-radius:6px] [font-size:12px] [font-weight:500] [color:var(--yellow)] [background:var(--yellow-bg)] [border:1px_solid_var(--yellow-border)]">
            <AlertTriangle size={11} className="[flex-shrink:0]" />
            {criticalVulns} packages with high/critical CVEs
          </span>
        )}
        <span className="[display:inline-flex] [align-items:center] [gap:6px] [padding:4px_10px] [border-radius:6px] [font-size:12px] [font-weight:500] [color:var(--text-3)] [background:var(--bg-2)] [border:1px_solid_var(--border)]">
          {PACKAGES.length} packages tracked
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <SherlockGrid
          rowData={pkgSort.sorted}
          getRowId={({ data }) => data.pkg}
          domLayout="autoHeight"
          showPagination={false}
          columnDefs={[
            { field: "pkg", headerName: "Package", minWidth: 210, flex: 1 },
            { field: "version", headerName: "Version", minWidth: 110 },
            {
              field: "lang",
              headerName: "Language",
              minWidth: 120,
              cellRenderer: ({ value }) => <LangBadge lang={value} />,
            },
            { field: "vulns", headerName: "Vulnerabilities", minWidth: 130 },
            {
              field: "severity",
              headerName: "Severity",
              minWidth: 110,
              cellRenderer: ({ value }) => <SeverityBadge severity={value} />,
            },
            {
              field: "fix",
              headerName: "Fix available",
              minWidth: 130,
              valueFormatter: ({ value }) => value || "Up to date",
            },
            {
              field: "cve",
              headerName: "CVE",
              minWidth: 150,
              valueFormatter: ({ value }) => value || "—",
            },
          ]}
        />
      </div>
    </div>
  )
}
