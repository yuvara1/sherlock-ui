import { useState, useMemo } from "react";
import { Plus, Key, Copy, Check, MoreHorizontal, ExternalLink, Layers, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { SherlockSelect } from "@/components/ui/SherlockSelect";

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
];

const API_KEYS = [
  { id: "key-001", name: "Production Telemetry", key: "demo_live_x8aF3kP9nQwR2mLvZ5tY7uB4cD6eHjI", env: "production", created: "2026-08-01", lastUsed: "2 min ago", status: "active" },
  { id: "key-002", name: "Staging Integration",  key: "demo_test_a1bC2dE3fG4hI5jK6lM7nO8pQ9rS0t", env: "staging",    created: "2026-07-15", lastUsed: "1h ago",   status: "active" },
  { id: "key-003", name: "CI/CD Pipeline",       key: "demo_live_y9zA0bB1cC2dD3eE4fF5gG6hH7iI8j", env: "production", created: "2026-06-10", lastUsed: "12h ago",  status: "active" },
];

type SortDir = "asc" | "desc" | null;
type SortCol = "name" | "health" | "services" | "requests" | "errorRate" | "lastDeploy" | null;

const HEALTH_ORDER: Record<string, number> = { critical: 0, degraded: 1, healthy: 2 };

function healthBadge(h: string) {
  if (h === "critical") return { color: "var(--red)",    bg: "var(--red-bg)",    border: "var(--red-border)",    label: "Critical" };
  if (h === "degraded") return { color: "var(--yellow)", bg: "var(--yellow-bg)", border: "var(--yellow-border)", label: "Degraded" };
  return                       { color: "var(--green)",  bg: "var(--green-bg)",  border: "var(--green-border)",  label: "Healthy"  };
}

function CriticalDot() {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10, flexShrink: 0 }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--red)", opacity: 0.4, animation: "blink-ring 1.4s ease-in-out infinite" }} />
      <span style={{ position: "relative", width: 10, height: 10, borderRadius: "50%", background: "var(--red)", animation: "blink-dot 1.4s ease-in-out infinite" }} />
    </span>
  );
}

function SortIcon({ col, sortCol, sortDir }: { col: SortCol; sortCol: SortCol; sortDir: SortDir }) {
  if (sortCol !== col) return <ChevronsUpDown size={10} style={{ opacity: 0.4 }} />;
  if (sortDir === "asc") return <ChevronUp size={10} />;
  if (sortDir === "desc") return <ChevronDown size={10} />;
  return <ChevronsUpDown size={10} style={{ opacity: 0.4 }} />;
}

function SortableTH({
  label, col, sortCol, sortDir, onSort, align = "left",
}: {
  label: string; col: SortCol; sortCol: SortCol; sortDir: SortDir;
  onSort: (c: SortCol) => void; align?: "left" | "right";
}) {
  return (
    <th
      onClick={() => onSort(col)}
      style={{
        padding: "10px 16px", textAlign: align,
        fontSize: 11, fontWeight: 500, color: sortCol === col ? "var(--text-2)" : "var(--text-4)",
        letterSpacing: "0.04em", textTransform: "uppercase",
        borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
        cursor: "pointer", userSelect: "none",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label} <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
      </span>
    </th>
  );
}

function ProjectIcon({ slug }: { slug: string }) {
  const icons: Record<string, string> = {
    "ecommerce":  "🛒",
    "banking":    "🏦",
    "mobile-api": "📱",
    "internal":   "🔧",
  };
  const colors: Record<string, string> = {
    "ecommerce":  "#1d4ed8",
    "banking":    "#059669",
    "mobile-api": "#7c3aed",
    "internal":   "#d97706",
  };
  const icon = icons[slug] ?? "📦";
  const color = colors[slug] ?? "#6366f1";
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 6, flexShrink: 0,
      background: `${color}18`, border: `1px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14,
    }}>
      {icon}
    </div>
  );
}

function CopyKey({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handle}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", padding: 2, display: "flex" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{copied ? "Copied!" : "Copy API key"}</TooltipContent>
    </Tooltip>
  );
}

export default function Projects() {
  const [tab, setTab] = useState<"projects" | "apikeys">("projects");
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  // New Project dialog state
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectEnv, setNewProjectEnv] = useState("production");

  // Generate API Key dialog state
  const [genKeyOpen, setGenKeyOpen] = useState(false);
  const [genKeyEnv, setGenKeyEnv] = useState("production");
  const [genKeyExpiry, setGenKeyExpiry] = useState("30 days");

  function handleSort(col: SortCol) {
    if (sortCol !== col) { setSortCol(col); setSortDir("asc"); return; }
    if (sortDir === "asc") { setSortDir("desc"); return; }
    if (sortDir === "desc") { setSortDir(null); setSortCol(null); }
  }

  const sorted = useMemo(() => {
    if (!sortCol || !sortDir) return PROJECTS;
    return [...PROJECTS].sort((a, b) => {
      let av: number | string = 0, bv: number | string = 0;
      if (sortCol === "name")      { av = a.name;        bv = b.name; }
      if (sortCol === "health")    { av = HEALTH_ORDER[a.health] ?? 99; bv = HEALTH_ORDER[b.health] ?? 99; }
      if (sortCol === "services")  { av = a.services;    bv = b.services; }
      if (sortCol === "requests")  { av = a.requestsNum; bv = b.requestsNum; }
      if (sortCol === "errorRate") { av = a.errorRate;   bv = b.errorRate; }
      if (sortCol === "lastDeploy"){ av = a.lastDeployMin; bv = b.lastDeployMin; }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [sortCol, sortDir]);

  const sp = { col: sortCol, dir: sortDir, onSort: handleSort };

  return (
    <div className="responsive-page-header" style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 0 }}>
      <style>{`
        @keyframes blink-ring { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.6); } }
        @keyframes blink-dot  { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
      `}</style>

      {/* Page header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingBottom: 20, borderBottom: "1px solid var(--border)", marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-1)", margin: "0 0 4px" }}>
            Projects
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
            All monitored projects and their health status
          </p>
        </div>
        <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
          <DialogTrigger asChild>
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500,
              background: "var(--text-1)", color: "var(--bg)", border: "none",
              cursor: "pointer", letterSpacing: "-0.01em",
            }}>
              <Plus size={13} /> New Project
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Project</DialogTitle>
              <DialogDescription>Create a new monitored project.</DialogDescription>
            </DialogHeader>
            <div className="dialog-body">
              <div className="dialog-field">
                <label>Project Name</label>
                <input className="dialog-input" placeholder="e.g. checkout-service" />
              </div>
              <div className="dialog-field">
                <label>Environment</label>
                <SherlockSelect
                  value={newProjectEnv}
                  onChange={setNewProjectEnv}
                  options={["production", "staging", "development"]}
                />
              </div>
              <div className="dialog-field">
                <label>Team</label>
                <input className="dialog-input" placeholder="e.g. payments-team" />
              </div>
              <div className="dialog-field">
                <label>Description</label>
                <textarea className="dialog-textarea" rows={2} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button className="dialog-btn-secondary">Cancel</button>
              </DialogClose>
              <DialogClose asChild>
                <button className="dialog-btn-primary">Create Project</button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 0, borderBottom: "1px solid var(--border)", marginBottom: 20,
      }}>
        {(["projects", "apikeys"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 16px", fontSize: 13, fontWeight: tab === t ? 500 : 400,
              color: tab === t ? "var(--text-1)" : "var(--text-4)",
              background: "none", border: "none",
              borderBottom: `2px solid ${tab === t ? "var(--text-1)" : "transparent"}`,
              cursor: "pointer", marginBottom: -1, transition: "color 0.1s",
            }}
          >
            {t === "projects" ? "Projects" : "API Keys"}
          </button>
        ))}
      </div>

      {/* Projects table */}
      {tab === "projects" && (
        <div className="responsive-data-surface" style={{ border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-2)" }}>
          <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg)" }}>
                <SortableTH label="Name"         col="name"      sortCol={sp.col} sortDir={sp.dir} onSort={sp.onSort} />
                <SortableTH label="Health"       col="health"    sortCol={sp.col} sortDir={sp.dir} onSort={sp.onSort} />
                <SortableTH label="Services"     col="services"  sortCol={sp.col} sortDir={sp.dir} onSort={sp.onSort} align="right" />
                <SortableTH label="Requests/min" col="requests"  sortCol={sp.col} sortDir={sp.dir} onSort={sp.onSort} align="right" />
                <SortableTH label="Error Rate"   col="errorRate" sortCol={sp.col} sortDir={sp.dir} onSort={sp.onSort} align="right" />
                <SortableTH label="Last Deploy"  col="lastDeploy" sortCol={sp.col} sortDir={sp.dir} onSort={sp.onSort} />
                <th style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => {
                const hb = healthBadge(p.health);
                return (
                  <tr
                    key={p.id}
                    style={{
                      height: 56, borderBottom: i < sorted.length - 1 ? "1px solid var(--border)" : "none",
                      transition: "background 0.1s", cursor: "pointer",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Name */}
                    <td style={{ padding: "0 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <ProjectIcon slug={p.slug} />
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Layers size={11} style={{ color: "var(--text-4)", flexShrink: 0 }} />
                            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", margin: "0 0 1px", letterSpacing: "-0.01em" }}>{p.name}</p>
                          </div>
                          <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: 0 }}>{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Health */}
                    <td style={{ padding: "0 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {p.health === "critical" && <CriticalDot />}
                        <span style={{
                          fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 4,
                          background: hb.bg, border: `1px solid ${hb.border}`, color: hb.color,
                        }}>{hb.label}</span>
                      </div>
                    </td>

                    {/* Services */}
                    <td style={{ padding: "0 16px", textAlign: "right" }}>
                      <span style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color: "var(--text-3)" }}>{p.services}</span>
                    </td>

                    {/* Requests/min */}
                    <td style={{ padding: "0 16px", textAlign: "right" }}>
                      <span style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color: "var(--text-2)" }}>{p.requests}</span>
                    </td>

                    {/* Error Rate */}
                    <td style={{ padding: "0 16px", textAlign: "right" }}>
                      <span style={{
                        fontSize: 12, fontFamily: "Geist Mono, monospace", fontWeight: 500,
                        color: p.errorRate > 1 ? "var(--red)" : p.errorRate > 0.5 ? "var(--yellow)" : "var(--text-3)",
                      }}>{p.errorRate.toFixed(1)}%</span>
                    </td>

                    {/* Last Deploy */}
                    <td style={{ padding: "0 16px" }}>
                      <span style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{p.lastDeploy}</span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "0 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                        <button
                          style={{
                            width: 28, height: 28, borderRadius: 4, display: "flex", alignItems: "center",
                            justifyContent: "center", background: "transparent",
                            border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-4)",
                            transition: "all 0.1s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-3)"; e.currentTarget.style.color = "var(--text-2)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-4)"; }}
                        >
                          <ExternalLink size={11} />
                        </button>
                        <button
                          style={{
                            width: 28, height: 28, borderRadius: 4, display: "flex", alignItems: "center",
                            justifyContent: "center", background: "transparent",
                            border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-4)",
                            transition: "all 0.1s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-3)"; e.currentTarget.style.color = "var(--text-2)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-4)"; }}
                        >
                          <MoreHorizontal size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* API Keys tab */}
      {tab === "apikeys" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Header card */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", border: "1px solid var(--border)", borderRadius: 8,
            background: "var(--bg-2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 6, background: "var(--bg-3)",
                border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Key size={14} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", margin: "0 0 2px" }}>API Keys</p>
                <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>Authenticate your applications and send telemetry</p>
              </div>
            </div>
            <Dialog open={genKeyOpen} onOpenChange={setGenKeyOpen}>
              <DialogTrigger asChild>
                <button style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                  background: "var(--text-1)", color: "var(--bg)", border: "none",
                  cursor: "pointer",
                }}>
                  <Plus size={13} /> Generate key
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate API Key</DialogTitle>
                  <DialogDescription>Create a new API key to authenticate your applications.</DialogDescription>
                </DialogHeader>
                <div className="dialog-body">
                  <div className="dialog-field">
                    <label>Key Name</label>
                    <input className="dialog-input" placeholder="e.g. ci-deploy-key" />
                  </div>
                  <div className="dialog-field">
                    <label>Environment</label>
                    <SherlockSelect
                      value={genKeyEnv}
                      onChange={setGenKeyEnv}
                      options={["production", "staging", "development"]}
                    />
                  </div>
                  <div className="dialog-field">
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
                    <button className="dialog-btn-secondary">Cancel</button>
                  </DialogClose>
                  <DialogClose asChild>
                    <button className="dialog-btn-primary">Generate Key</button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Keys table */}
          <div className="responsive-data-surface" style={{ border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-2)" }}>
            <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  {["Key name", "Environment", "Created", "Last used", "Status", ""].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px", textAlign: "left",
                        fontSize: 11, fontWeight: 500, color: "var(--text-4)",
                        letterSpacing: "0.04em", textTransform: "uppercase",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {API_KEYS.map((k, i) => (
                  <tr
                    key={k.id}
                    style={{
                      height: 52, borderBottom: i < API_KEYS.length - 1 ? "1px solid var(--border)" : "none",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "0 16px" }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", margin: "0 0 2px" }}>{k.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>
                          {k.key.slice(0, 14)}••••••••••
                        </span>
                        <CopyKey value={k.key} />
                      </div>
                    </td>
                    <td style={{ padding: "0 16px" }}>
                      <span style={{
                        fontSize: 11, fontFamily: "Geist Mono, monospace", padding: "2px 8px", borderRadius: 4,
                        background: "var(--bg-3)", border: "1px solid var(--border)",
                        color: k.env === "production" ? "var(--red)" : "var(--yellow)",
                      }}>{k.env}</span>
                    </td>
                    <td style={{ padding: "0 16px" }}>
                      <span style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{k.created}</span>
                    </td>
                    <td style={{ padding: "0 16px" }}>
                      <span style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color: "var(--text-3)" }}>{k.lastUsed}</span>
                    </td>
                    <td style={{ padding: "0 16px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 4,
                        background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green)",
                      }}>{k.status}</span>
                    </td>
                    <td style={{ padding: "0 16px", textAlign: "right" }}>
                      <button
                        style={{
                          width: 28, height: 28, borderRadius: 4, display: "flex", alignItems: "center",
                          justifyContent: "center", background: "transparent",
                          border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-4)",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-3)"; e.currentTarget.style.color = "var(--text-2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-4)"; }}
                      >
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
  );
}
