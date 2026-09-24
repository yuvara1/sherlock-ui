import { useState, useCallback } from "react";
import {
  Database, Cpu, HardDrive, Globe, Mail, MessageSquare,
  BarChart3, Shield, Package, Network, Server,
  ChevronUp, ChevronDown, ChevronsUpDown, X, GitBranch,
  AlertTriangle, Zap, Cloud,
} from "lucide-react";

/* ── Keyframes injected once ─────────────────────────────── */
const BLINK_STYLE = `
@keyframes blink-ring {
  0%, 100% { opacity: 1; transform: scale(1);   }
  50%       { opacity: 0.3; transform: scale(1.6); }
}
@keyframes blink-dot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}
`;

/* ── External services data ──────────────────────────────── */
const EXTERNAL = [
  { name: "PostgreSQL (primary)", type: "Database",      icon: Database,       status: "Critical", latency: 4500, callsPerMin: 8420,  errRate: 3.2,  lastCheck: "2s ago",   node: "postgres"  },
  { name: "Redis Cluster",        type: "Cache",          icon: Zap,            status: "Healthy",  latency: 2,    callsPerMin: 32100, errRate: 0.0,  lastCheck: "1s ago",   node: "redis"     },
  { name: "Apache Kafka",         type: "Message Queue",  icon: MessageSquare,  status: "Healthy",  latency: 8,    callsPerMin: 4800,  errRate: 0.1,  lastCheck: "1s ago",   node: "kafka"     },
  { name: "AWS S3",               type: "Object Storage", icon: Cloud,          status: "Healthy",  latency: 48,   callsPerMin: 620,   errRate: 0.0,  lastCheck: "5s ago",   node: "s3"        },
  { name: "Stripe API",           type: "Payment API",    icon: Shield,         status: "Degraded", latency: 2800, callsPerMin: 240,   errRate: 1.8,  lastCheck: "3s ago",   node: "stripe"    },
  { name: "SendGrid",             type: "Email API",      icon: Mail,           status: "Healthy",  latency: 310,  callsPerMin: 85,    errRate: 0.0,  lastCheck: "10s ago",  node: "sendgrid"  },
  { name: "Twilio",               type: "SMS API",        icon: MessageSquare,  status: "Healthy",  latency: 420,  callsPerMin: 32,    errRate: 0.2,  lastCheck: "8s ago",   node: "twilio"    },
  { name: "ClickHouse",           type: "Analytics DB",   icon: BarChart3,      status: "Healthy",  latency: 190,  callsPerMin: 1200,  errRate: 0.0,  lastCheck: "4s ago",   node: "clickhouse"},
  { name: "ML Model Server",      type: "Internal API",   icon: Cpu,            status: "Healthy",  latency: 68,   callsPerMin: 890,   errRate: 0.5,  lastCheck: "2s ago",   node: "mlserver"  },
  { name: "JWKS Endpoint",        type: "Auth API",       icon: Globe,          status: "Healthy",  latency: 22,   callsPerMin: 5200,  errRate: 0.0,  lastCheck: "just now", node: "jwks"      },
];

/* ── Packages data ────────────────────────────────────────── */
const PACKAGES = [
  { pkg: "log4j-core",       version: "2.14.1",  lang: "Java",    icon: HardDrive, vulns: 2, severity: "Critical", fix: "2.17.1",  cve: "CVE-2021-44228" },
  { pkg: "spring-webmvc",    version: "5.3.18",  lang: "Java",    icon: HardDrive, vulns: 1, severity: "High",     fix: "5.3.20",  cve: "CVE-2022-22965" },
  { pkg: "lodash",           version: "4.17.19", lang: "Node.js", icon: Package,   vulns: 1, severity: "High",     fix: "4.17.21", cve: "CVE-2021-23337" },
  { pkg: "axios",            version: "0.21.1",  lang: "Node.js", icon: Package,   vulns: 1, severity: "Medium",   fix: "0.21.2",  cve: "CVE-2021-3749"  },
  { pkg: "express",          version: "4.17.1",  lang: "Node.js", icon: Package,   vulns: 0, severity: "None",     fix: null,      cve: null             },
  { pkg: "cryptography",     version: "3.4.6",   lang: "Python",  icon: Shield,    vulns: 1, severity: "High",     fix: "3.4.8",   cve: "CVE-2021-3711"  },
  { pkg: "requests",         version: "2.25.1",  lang: "Python",  icon: Package,   vulns: 0, severity: "None",     fix: null,      cve: null             },
  { pkg: "jackson-databind", version: "2.12.3",  lang: "Java",    icon: HardDrive, vulns: 2, severity: "High",     fix: "2.13.4",  cve: "CVE-2022-42003" },
  { pkg: "netty-codec-http", version: "4.1.65",  lang: "Java",    icon: HardDrive, vulns: 1, severity: "Medium",   fix: "4.1.68",  cve: "CVE-2021-43797" },
  { pkg: "moment",           version: "2.29.1",  lang: "Node.js", icon: Package,   vulns: 1, severity: "High",     fix: "2.29.4",  cve: "CVE-2022-24785" },
  { pkg: "pillow",           version: "8.2.0",   lang: "Python",  icon: Package,   vulns: 2, severity: "High",     fix: "9.0.0",   cve: "CVE-2021-34552" },
  { pkg: "scala-library",    version: "2.13.5",  lang: "Scala",   icon: Package,   vulns: 0, severity: "None",     fix: null,      cve: null             },
  { pkg: "akka-http",        version: "10.2.4",  lang: "Scala",   icon: Package,   vulns: 0, severity: "None",     fix: null,      cve: null             },
];

/* ── Service→Dependency edges for graph ─────────────────── */
const SERVICES_GRAPH = [
  { id: "payment",  label: "payment-service",   icon: Shield,       deps: ["postgres", "redis", "stripe", "kafka"] },
  { id: "order",    label: "order-service",      icon: GitBranch,    deps: ["postgres", "kafka", "redis"]           },
  { id: "user",     label: "user-service",       icon: Server,       deps: ["postgres", "redis", "jwks", "sendgrid"]},
  { id: "notif",    label: "notification-svc",   icon: MessageSquare,deps: ["kafka", "sendgrid", "twilio"]          },
  { id: "inventory",label: "inventory-api",      icon: HardDrive,    deps: ["postgres", "redis", "s3"]             },
  { id: "fraud",    label: "fraud-detection",    icon: AlertTriangle, deps: ["postgres", "mlserver", "kafka"]       },
  { id: "analytics",label: "analytics-service",  icon: BarChart3,    deps: ["clickhouse", "kafka"]                 },
];

/* ── Helpers ─────────────────────────────────────────────── */
function statusColor(s: string) {
  if (s === "Critical") return "var(--red)";
  if (s === "Degraded") return "var(--yellow)";
  return "var(--green)";
}

function statusTokens(s: string) {
  if (s === "Critical") return { color: "var(--red)",    bg: "var(--red-bg)",    border: "var(--red-border)"    };
  if (s === "Degraded") return { color: "var(--yellow)", bg: "var(--yellow-bg)", border: "var(--yellow-border)" };
  return                       { color: "var(--green)",  bg: "var(--green-bg)",  border: "var(--green-border)"  };
}

function severityTokens(s: string) {
  if (s === "Critical") return { color: "var(--red)",    bg: "var(--red-bg)",    border: "var(--red-border)"    };
  if (s === "High")     return { color: "var(--red)",    bg: "var(--red-bg)",    border: "var(--red-border)"    };
  if (s === "Medium")   return { color: "var(--yellow)", bg: "var(--yellow-bg)", border: "var(--yellow-border)" };
  return                       { color: "var(--text-4)", bg: "var(--bg-3)",      border: "var(--border)"        };
}

const LANG_COLORS: Record<string, string> = {
  "Java":    "#EA2D2E",
  "Node.js": "#539E43",
  "Python":  "#3776AB",
  "Scala":   "#DC322F",
};

/* ── Blinking critical dot ───────────────────────────────── */
function CriticalDot() {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10, flexShrink: 0 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "var(--red)", opacity: 0.4,
        animation: "blink-ring 1.4s ease-in-out infinite",
      }} />
      <span style={{
        position: "relative", width: 10, height: 10, borderRadius: "50%",
        background: "var(--red)",
        animation: "blink-dot 1.4s ease-in-out infinite",
      }} />
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const t = statusTokens(status);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500,
      color: t.color, background: t.bg, border: `1px solid ${t.border}`,
      whiteSpace: "nowrap",
    }}>
      {status === "Critical" ? <CriticalDot /> : <span style={{ width: 5, height: 5, borderRadius: "50%", background: t.color, flexShrink: 0 }} />}
      {status}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const t = severityTokens(severity);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500,
      color: t.color, background: t.bg, border: `1px solid ${t.border}`,
    }}>
      {severity !== "None" && (
        severity === "Critical"
          ? <CriticalDot />
          : <span style={{ width: 5, height: 5, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
      )}
      {severity}
    </span>
  );
}

function LangBadge({ lang }: { lang: string }) {
  const color = LANG_COLORS[lang] ?? "var(--text-3)";
  return (
    <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", fontWeight: 500, color, background: `${color}18`, padding: "2px 7px", borderRadius: 4 }}>
      {lang}
    </span>
  );
}

const TH_BASE: React.CSSProperties = {
  padding: "0 16px", height: 36,
  textAlign: "left", fontSize: 11, fontWeight: 500,
  color: "var(--text-4)", letterSpacing: "0.04em", textTransform: "uppercase",
  whiteSpace: "nowrap", borderBottom: "1px solid var(--border)",
  background: "var(--bg)",
};

const TD: React.CSSProperties = {
  padding: "0 16px", height: 40,
  fontSize: 13, borderBottom: "1px solid var(--border)",
  whiteSpace: "nowrap",
};

/* ── Sort icon ───────────────────────────────────────────── */
type SortDir = "asc" | "desc" | null;

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === "asc")  return <ChevronUp  size={11} style={{ flexShrink: 0 }} />;
  if (dir === "desc") return <ChevronDown size={11} style={{ flexShrink: 0 }} />;
  return <ChevronsUpDown size={11} style={{ flexShrink: 0, opacity: 0.35 }} />;
}

function SortableTH({
  label, col, align = "left", sortCol, sortDir, onSort,
}: {
  label: string; col: string; align?: "left" | "right";
  sortCol: string; sortDir: SortDir;
  onSort: (col: string) => void;
}) {
  const active = sortCol === col;
  return (
    <th
      onClick={() => onSort(col)}
      style={{
        ...TH_BASE, textAlign: align, cursor: "pointer", userSelect: "none",
        color: active ? "var(--text-2)" : "var(--text-4)",
        transition: "color 0.1s",
      }}
      onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
      onMouseLeave={e => (e.currentTarget.style.color = active ? "var(--text-2)" : "var(--text-4)")}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label}
        <SortIcon dir={active ? sortDir : null} />
      </span>
    </th>
  );
}

/* ── Dependency Graph Modal ──────────────────────────────── */
function GraphModal({ onClose }: { onClose: () => void }) {
  const W = 820, H = 480;
  const svcX = 80,  svcStartY = 40, svcGap = (H - 80) / (SERVICES_GRAPH.length - 1);
  const depX = 660, depStartY = 30, depGap = (H - 60) / (EXTERNAL.length - 1);

  const svcNodes = SERVICES_GRAPH.map((s, i) => ({ ...s, x: svcX, y: svcStartY + i * svcGap }));
  const depNodes = EXTERNAL.map((d, i)        => ({ ...d, x: depX, y: depStartY + i * depGap }));
  const depByNode = Object.fromEntries(depNodes.map(d => [d.node, d]));

  const [hovSvc, setHovSvc] = useState<string | null>(null);
  const [hovDep, setHovDep] = useState<string | null>(null);

  const activeEdges = hovSvc
    ? svcNodes.find(s => s.id === hovSvc)?.deps ?? []
    : hovDep
    ? svcNodes.filter(s => s.deps.includes(hovDep)).map(s => s.id)
    : null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--bg)", border: "1px solid var(--border-2)",
        borderRadius: 12, width: W + 80, maxWidth: "95vw", maxHeight: "90vh",
        overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
      }}>
        {/* Modal header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Network size={16} style={{ color: "var(--accent)" }} />
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-1)" }}>Dependency Graph</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 12, color: "var(--text-4)" }}>Hover a node to highlight edges</span>
            <button
              onClick={onClose}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-2)", cursor: "pointer", color: "var(--text-3)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-2)")}
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Graph */}
        <div style={{ padding: "24px 32px", overflow: "auto" }}>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
            {/* Edges */}
            {svcNodes.map(svc =>
              svc.deps.map(dep => {
                const dNode = depByNode[dep];
                if (!dNode) return null;
                const isHighlighted = activeEdges === null || (
                  hovSvc ? activeEdges.includes(dep) : activeEdges.includes(svc.id)
                );
                const dColor = statusColor(dNode.status);
                return (
                  <path
                    key={`${svc.id}-${dep}`}
                    d={`M ${svc.x + 60} ${svc.y} C ${(svc.x + dNode.x) / 2} ${svc.y}, ${(svc.x + dNode.x) / 2} ${dNode.y}, ${dNode.x - 60} ${dNode.y}`}
                    stroke={isHighlighted ? dColor : "var(--border-2)"}
                    strokeWidth={isHighlighted ? 1.5 : 1}
                    strokeDasharray={dNode.status === "Critical" ? "4 3" : undefined}
                    fill="none"
                    opacity={isHighlighted ? 0.7 : 0.25}
                    style={{ transition: "opacity 0.15s, stroke 0.15s" }}
                  />
                );
              })
            )}

            {/* Service nodes (left) */}
            {svcNodes.map(svc => {
              const Icon = svc.icon;
              const isHighlighted = hovSvc === svc.id || (hovDep !== null && (activeEdges as string[] | null)?.includes(svc.id));
              return (
                <g
                  key={svc.id}
                  transform={`translate(${svc.x}, ${svc.y})`}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovSvc(svc.id)}
                  onMouseLeave={() => setHovSvc(null)}
                >
                  <rect x={-60} y={-16} width={120} height={32} rx={6}
                    fill={isHighlighted ? "var(--accent-bg)" : "var(--bg-2)"}
                    stroke={isHighlighted ? "var(--accent-border)" : "var(--border)"}
                    strokeWidth={1}
                    style={{ transition: "fill 0.15s, stroke 0.15s" }}
                  />
                  <foreignObject x={-54} y={-9} width={16} height={16}>
                    <Icon size={13} color={isHighlighted ? "var(--accent)" : "var(--text-3)"} />
                  </foreignObject>
                  <text x={-34} y={5} fontSize={11} fontFamily="Geist, sans-serif" fontWeight={500}
                    fill={isHighlighted ? "var(--accent)" : "var(--text-2)"}
                    style={{ transition: "fill 0.15s" }}
                  >
                    {svc.label.length > 14 ? svc.label.slice(0, 13) + "…" : svc.label}
                  </text>
                </g>
              );
            })}

            {/* Dep nodes (right) */}
            {depNodes.map(dep => {
              const Icon = dep.icon;
              const color = statusColor(dep.status);
              const isHighlighted = hovDep === dep.node || (hovSvc !== null && (activeEdges as string[] | null)?.includes(dep.node));
              return (
                <g
                  key={dep.node}
                  transform={`translate(${dep.x}, ${dep.y})`}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovDep(dep.node)}
                  onMouseLeave={() => setHovDep(null)}
                >
                  <rect x={-60} y={-15} width={122} height={30} rx={6}
                    fill={isHighlighted ? `${color}18` : "var(--bg-2)"}
                    stroke={isHighlighted ? color : "var(--border)"}
                    strokeWidth={1}
                    style={{ transition: "fill 0.15s, stroke 0.15s" }}
                  />
                  <foreignObject x={-52} y={-8} width={14} height={14}>
                    <Icon size={12} color={isHighlighted ? color : "var(--text-3)"} />
                  </foreignObject>
                  <text x={-34} y={4} fontSize={10} fontFamily="Geist Mono, monospace" fontWeight={500}
                    fill={isHighlighted ? color : "var(--text-3)"}
                    style={{ transition: "fill 0.15s" }}
                  >
                    {dep.name.length > 16 ? dep.name.slice(0, 15) + "…" : dep.name}
                  </text>
                  {dep.status !== "Healthy" && (
                    <circle cx={52} cy={-9} r={4}
                      fill={color}
                      opacity={isHighlighted ? 1 : 0.6}
                    />
                  )}
                </g>
              );
            })}

            {/* Column labels */}
            <text x={svcX} y={-14} fontSize={10} fontFamily="Geist, sans-serif" fontWeight={500}
              fill="var(--text-4)" textAnchor="middle" letterSpacing="0.06em">
              SERVICES
            </text>
            <text x={depX} y={-14} fontSize={10} fontFamily="Geist, sans-serif" fontWeight={500}
              fill="var(--text-4)" textAnchor="middle" letterSpacing="0.06em">
              DEPENDENCIES
            </text>
          </svg>

          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            {[
              { color: "var(--green)",  label: "Healthy"  },
              { color: "var(--yellow)", label: "Degraded" },
              { color: "var(--red)",    label: "Critical — dashed edges" },
            ].map(l => (
              <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-3)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sort state hook ─────────────────────────────────────── */
function useSort<T>(data: T[]) {
  const [col, setCol] = useState<string>("");
  const [dir, setDir] = useState<SortDir>(null);

  const onSort = useCallback((c: string) => {
    setCol(prev => {
      if (prev === c) {
        setDir(d => d === "asc" ? "desc" : d === "desc" ? null : "asc");
      } else {
        setDir("asc");
      }
      return c;
    });
  }, []);

  const sorted = [...data].sort((a: any, b: any) => {
    if (!col || dir === null) return 0;
    const av = a[col], bv = b[col];
    if (typeof av === "string" && typeof bv === "string")
      return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return dir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  return { sorted, col, dir, onSort };
}

/* ── Page ────────────────────────────────────────────────── */
const TABS = ["External Services", "Packages"] as const;
type Tab = typeof TABS[number];

export default function Dependencies() {
  const [tab, setTab]         = useState<Tab>("External Services");
  const [graphOpen, setGraph] = useState(false);
  const [hovRow, setHovRow]   = useState<string | null>(null);

  const extSort = useSort(EXTERNAL);
  const pkgSort = useSort(PACKAGES);

  const criticalCount = EXTERNAL.filter(d => d.status === "Critical").length;
  const vulnCount     = PACKAGES.filter(p => p.vulns > 0).length;
  const criticalVulns = PACKAGES.filter(p => p.severity === "Critical" || p.severity === "High").length;

  const tdStyle = (key: string): React.CSSProperties => ({
    ...TD,
    background: hovRow === key ? "var(--bg-3)" : "transparent",
    transition: "background 0.1s",
  });

  return (
    <div className="responsive-page-header" style={{ padding: "24px 32px", fontFamily: "Geist, sans-serif", minHeight: "100%" }}>
      <style>{BLINK_STYLE}</style>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 20, borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-1)", margin: 0 }}>Dependencies</h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: "4px 0 0" }}>External services and package dependencies</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setGraph(true)}
            style={{ height: 32, padding: "0 14px", borderRadius: 6, border: "1px solid var(--accent-border)", background: "var(--accent-bg)", color: "var(--accent)", fontSize: 13, fontWeight: 500, cursor: "pointer", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 6 }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(50,145,255,0.14)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--accent-bg)")}
          >
            <Network size={13} />
            View dependency graph
          </button>
          <button
            style={{ height: 32, padding: "0 14px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-2)", color: "var(--text-1)", fontSize: 13, fontWeight: 500, cursor: "pointer", letterSpacing: "-0.01em" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-2)")}
          >
            Scan dependencies
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {criticalCount > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "var(--red)", background: "var(--red-bg)", border: "1px solid var(--red-border)" }}>
            <CriticalDot />
            {criticalCount} external service{criticalCount !== 1 ? "s" : ""} critical
          </span>
        )}
        {vulnCount > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "var(--yellow)", background: "var(--yellow-bg)", border: "1px solid var(--yellow-border)" }}>
            <AlertTriangle size={11} style={{ flexShrink: 0 }} />
            {criticalVulns} packages with high/critical CVEs
          </span>
        )}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "var(--text-3)", background: "var(--bg-2)", border: "1px solid var(--border)" }}>
          {EXTERNAL.length} external services · {PACKAGES.length} packages tracked
        </span>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", marginBottom: 16, display: "flex" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 14px", fontSize: 13, fontWeight: 500,
            cursor: "pointer", border: "none", background: "transparent",
            color: tab === t ? "var(--text-1)" : "var(--text-3)",
            borderBottom: tab === t ? "2px solid var(--text-1)" : "2px solid transparent",
            marginBottom: -1, transition: "color 0.1s", letterSpacing: "-0.01em",
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* External services table */}
      {tab === "External Services" && (
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <SortableTH label="Name"       col="name"        align="left"  sortCol={extSort.col} sortDir={extSort.dir} onSort={extSort.onSort} />
                  <SortableTH label="Type"        col="type"        align="left"  sortCol={extSort.col} sortDir={extSort.dir} onSort={extSort.onSort} />
                  <SortableTH label="Status"      col="status"      align="left"  sortCol={extSort.col} sortDir={extSort.dir} onSort={extSort.onSort} />
                  <SortableTH label="Latency"     col="latency"     align="right" sortCol={extSort.col} sortDir={extSort.dir} onSort={extSort.onSort} />
                  <SortableTH label="Calls/min"   col="callsPerMin" align="right" sortCol={extSort.col} sortDir={extSort.dir} onSort={extSort.onSort} />
                  <SortableTH label="Error Rate"  col="errRate"     align="right" sortCol={extSort.col} sortDir={extSort.dir} onSort={extSort.onSort} />
                  <SortableTH label="Last Check"  col="lastCheck"   align="left"  sortCol={extSort.col} sortDir={extSort.dir} onSort={extSort.onSort} />
                </tr>
              </thead>
              <tbody>
                {extSort.sorted.map((d, i) => {
                  const Icon = d.icon;
                  const latColor = d.latency > 1000 ? "var(--red)" : d.latency > 300 ? "var(--yellow)" : "var(--text-2)";
                  const errColor = d.errRate > 2 ? "var(--red)" : d.errRate > 0.5 ? "var(--yellow)" : "var(--text-3)";
                  const isLast = i === extSort.sorted.length - 1;
                  const td: React.CSSProperties = { ...tdStyle(d.name), borderBottom: isLast ? "none" : "1px solid var(--border)" };
                  return (
                    <tr key={d.name} onMouseEnter={() => setHovRow(d.name)} onMouseLeave={() => setHovRow(null)}>
                      <td style={{ ...td, color: "var(--text-1)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Icon size={13} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                          <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 12, fontWeight: 500 }}>{d.name}</span>
                        </span>
                      </td>
                      <td style={{ ...td, color: "var(--text-3)", fontSize: 12 }}>{d.type}</td>
                      <td style={td}><StatusBadge status={d.status} /></td>
                      <td style={{ ...td, textAlign: "right", fontFamily: "Geist Mono, monospace", color: latColor }}>
                        {d.latency >= 1000 ? `${(d.latency / 1000).toFixed(1)}s` : `${d.latency}ms`}
                      </td>
                      <td style={{ ...td, textAlign: "right", fontFamily: "Geist Mono, monospace", color: "var(--text-2)" }}>{d.callsPerMin.toLocaleString()}</td>
                      <td style={{ ...td, textAlign: "right", fontFamily: "Geist Mono, monospace", color: errColor }}>{d.errRate.toFixed(1)}%</td>
                      <td style={{ ...td, color: "var(--text-4)", fontSize: 12 }}>{d.lastCheck}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Packages table */}
      {tab === "Packages" && (
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <SortableTH label="Package"         col="pkg"      align="left"  sortCol={pkgSort.col} sortDir={pkgSort.dir} onSort={pkgSort.onSort} />
                  <SortableTH label="Version"         col="version"  align="left"  sortCol={pkgSort.col} sortDir={pkgSort.dir} onSort={pkgSort.onSort} />
                  <SortableTH label="Language"        col="lang"     align="left"  sortCol={pkgSort.col} sortDir={pkgSort.dir} onSort={pkgSort.onSort} />
                  <SortableTH label="Vulnerabilities" col="vulns"    align="right" sortCol={pkgSort.col} sortDir={pkgSort.dir} onSort={pkgSort.onSort} />
                  <SortableTH label="Severity"        col="severity" align="left"  sortCol={pkgSort.col} sortDir={pkgSort.dir} onSort={pkgSort.onSort} />
                  <SortableTH label="Fix Available"   col="fix"      align="left"  sortCol={pkgSort.col} sortDir={pkgSort.dir} onSort={pkgSort.onSort} />
                  <SortableTH label="CVE"             col="cve"      align="left"  sortCol={pkgSort.col} sortDir={pkgSort.dir} onSort={pkgSort.onSort} />
                </tr>
              </thead>
              <tbody>
                {pkgSort.sorted.map((p, i) => {
                  const Icon = p.icon;
                  const isLast = i === pkgSort.sorted.length - 1;
                  const td: React.CSSProperties = { ...tdStyle(p.pkg), borderBottom: isLast ? "none" : "1px solid var(--border)" };
                  return (
                    <tr key={p.pkg} onMouseEnter={() => setHovRow(p.pkg)} onMouseLeave={() => setHovRow(null)}>
                      <td style={{ ...td, color: "var(--text-1)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Icon size={13} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                          <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 12, fontWeight: 500 }}>{p.pkg}</span>
                        </span>
                      </td>
                      <td style={{ ...td, fontFamily: "Geist Mono, monospace", fontSize: 11, color: "var(--text-4)" }}>{p.version}</td>
                      <td style={td}><LangBadge lang={p.lang} /></td>
                      <td style={{ ...td, textAlign: "right", fontFamily: "Geist Mono, monospace", color: p.vulns > 0 ? "var(--red)" : "var(--text-4)" }}>
                        {p.vulns > 0 ? p.vulns : "—"}
                      </td>
                      <td style={td}><SeverityBadge severity={p.severity} /></td>
                      <td style={{ ...td, fontFamily: "Geist Mono, monospace", fontSize: 11 }}>
                        {p.fix
                          ? <span style={{ color: "var(--green)" }}>{p.fix}</span>
                          : <span style={{ color: "var(--text-4)" }}>Up to date</span>
                        }
                      </td>
                      <td style={{ ...td, fontFamily: "Geist Mono, monospace", fontSize: 10, color: "var(--text-4)" }}>{p.cve ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Graph modal */}
      {graphOpen && <GraphModal onClose={() => setGraph(false)} />}
    </div>
  );
}
