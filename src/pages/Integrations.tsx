import { useState } from "react";
import { CheckCircle, Copy, Check, RefreshCw, Plus, ExternalLink, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  SiPagerduty, SiOpsgenie,
  SiGithub, SiGitlab, SiBitbucket,
  SiGrafana, SiDatadog, SiPrometheus, SiJaeger,
  SiJirasoftware, SiLinear, SiNotion,
} from "react-icons/si";

/* ── Data ─────────────────────────────────────────────── */
const CONNECTED_APPS = [
  { name: "payment-service", lang: "Java",    env: "production", version: "v2.14.1", traces: 12840, logs: 89210,  errors: 34,  lastSeen: "2s ago"  },
  { name: "order-service",   lang: "Node.js", env: "production", version: "v3.8.0",  traces: 31204, logs: 204901, errors: 12,  lastSeen: "1s ago"  },
  { name: "user-service",    lang: "Go",      env: "production", version: "v1.22.4", traces: 9820,  logs: 44100,  errors: 2,   lastSeen: "3s ago"  },
  { name: "fraud-detection", lang: "Python",  env: "staging",    version: "v1.9.2",  traces: 1204,  logs: 8901,   errors: 0,   lastSeen: "12s ago" },
];

type IntegrationStatus = "connected" | "available" | "soon";

const INTEGRATIONS: { category: string; items: { name: string; desc: string; status: IntegrationStatus; logo: string }[] }[] = [
  {
    category: "Alerting",
    items: [
      { name: "PagerDuty",  desc: "Incident management and on-call routing",     status: "connected", logo: "PD" },
      { name: "Slack",      desc: "Real-time alert notifications to channels",    status: "connected", logo: "SL" },
      { name: "OpsGenie",   desc: "Alert routing with escalation policies",       status: "available", logo: "OG" },
      { name: "VictorOps",  desc: "Incident collaboration and scheduling",        status: "soon",      logo: "VO" },
    ],
  },
  {
    category: "Source Control",
    items: [
      { name: "GitHub",     desc: "Link traces and incidents to commits and PRs", status: "connected", logo: "GH" },
      { name: "GitLab",     desc: "Merge request and pipeline integration",        status: "available", logo: "GL" },
      { name: "Bitbucket",  desc: "Attach incidents to Jira and commits",          status: "available", logo: "BB" },
    ],
  },
  {
    category: "Observability",
    items: [
      { name: "Grafana",    desc: "Embed dashboards and annotate deployments",    status: "connected", logo: "GF" },
      { name: "Datadog",    desc: "Sync metrics, traces, and log correlation",    status: "available", logo: "DD" },
      { name: "Prometheus", desc: "Scrape and forward Prometheus metrics",        status: "available", logo: "PR" },
      { name: "Jaeger",     desc: "Export traces to Jaeger UI",                  status: "available", logo: "JA" },
    ],
  },
  {
    category: "Issue Tracking",
    items: [
      { name: "Jira",       desc: "Auto-create tickets from incidents",           status: "connected", logo: "JR" },
      { name: "Linear",     desc: "Push issues directly to Linear projects",      status: "available", logo: "LN" },
      { name: "Notion",     desc: "Sync incident reports to Notion pages",        status: "soon",      logo: "NO" },
    ],
  },
];

const LANGS  = ["Java", "Node.js", "Python", "Go", "Ruby", "PHP", ".NET", "Rust"];
const ENVS   = ["production", "staging", "development"];
const FRAMEWORKS: Record<string, string[]> = {
  "Java":    ["Spring Boot", "Quarkus", "Micronaut"],
  "Node.js": ["Express", "Fastify", "NestJS"],
  "Python":  ["FastAPI", "Flask", "Django"],
  "Go":      ["net/http", "Gin", "Echo"],
  "Ruby":    ["Rails", "Sinatra"],
  "PHP":     ["Laravel", "Symfony"],
  ".NET":    ["ASP.NET Core", "Minimal API"],
  "Rust":    ["Axum", "Actix"],
};

function statusBadge(s: IntegrationStatus) {
  if (s === "connected") return { label: "Connected", color: "var(--green)",  bg: "var(--green-bg)",  border: "var(--green-border)"  };
  if (s === "soon")      return { label: "Soon",      color: "var(--text-4)", bg: "var(--bg-3)",      border: "var(--border)"        };
  return                        { label: "Connect",   color: "var(--accent)", bg: "var(--accent-bg)", border: "var(--accent-border)" };
}

/* ── Slack SVG (not in react-icons v5) ───────────────── */
function SlackIcon({ size = 18, color = "#4A154B" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
    </svg>
  );
}

/* ── Brand icon registry ──────────────────────────────── */
const BRAND: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  PD: { icon: SiPagerduty,    color: "#06AC38", bg: "#06AC3815" },
  SL: { icon: SlackIcon,      color: "#4A154B", bg: "#4A154B15" },
  OG: { icon: SiOpsgenie,     color: "#0081E1", bg: "#0081E115" },
  VO: { icon: SiOpsgenie,     color: "#7B36BF", bg: "#7B36BF15" },
  GH: { icon: SiGithub,       color: "#8b949e", bg: "#8b949e15" },
  GL: { icon: SiGitlab,       color: "#E24329", bg: "#E2432915" },
  BB: { icon: SiBitbucket,    color: "#0052CC", bg: "#0052CC15" },
  GF: { icon: SiGrafana,      color: "#F46800", bg: "#F4680015" },
  DD: { icon: SiDatadog,      color: "#632CA6", bg: "#632CA615" },
  PR: { icon: SiPrometheus,   color: "#E6522C", bg: "#E6522C15" },
  JA: { icon: SiJaeger,       color: "#60A5FA", bg: "#60A5FA15" },
  JR: { icon: SiJirasoftware, color: "#0052CC", bg: "#0052CC15" },
  LN: { icon: SiLinear,       color: "#5E6AD2", bg: "#5E6AD215" },
  NO: { icon: SiNotion,       color: "#6b7280", bg: "#6b728015" },
};

/* ── Components ───────────────────────────────────────── */
function LogoBox({ code }: { code: string }) {
  const brand = BRAND[code];
  if (!brand) return null;
  const Icon = brand.icon;
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 8,
      background: brand.bg,
      border: `1px solid ${brand.color}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={18} color={brand.color} />
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────── */
export default function Integrations() {
  const [tab,       setTab]       = useState<"apps" | "catalog" | "connect">("apps");
  const [appName,   setAppName]   = useState("");
  const [lang,      setLang]      = useState("Java");
  const [env,       setEnv]       = useState("production");
  const [framework, setFramework] = useState("Spring Boot");
  const [generated, setGenerated] = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [catFilter, setCatFilter] = useState("All");

  const config = `# Sherlock OpenTelemetry — ${appName || "your-service"}
# Environment: ${env} · Framework: ${framework}

OTEL_SERVICE_NAME=${appName || "your-service"}
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest.tracemind.io
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer tm_live_pk_••••••••••••
OTEL_TRACES_EXPORTER=otlp
OTEL_LOGS_EXPORTER=otlp
OTEL_METRICS_EXPORTER=otlp
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=${env},service.version=1.0.0
OTEL_PROPAGATORS=tracecontext,baggage`;

  function copy() { navigator.clipboard.writeText(config); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  const allCats = ["All", ...INTEGRATIONS.map(g => g.category)];
  const filteredGroups = catFilter === "All" ? INTEGRATIONS : INTEGRATIONS.filter(g => g.category === catFilter);
  const connectedCount = INTEGRATIONS.flatMap(g => g.items).filter(i => i.status === "connected").length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "Geist, sans-serif", fontSize: 13, letterSpacing: "-0.004em" }}>

      {/* Page header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px 0",
        flexShrink: 0,
        background: "var(--bg)",
      }}>
        <div>
          <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 2px", letterSpacing: 0 }}>Configuration</p>
          <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Integrations</h2>
        </div>
        <button
          onClick={() => setTab("connect")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", background: "var(--text-1)", color: "var(--bg)", border: "none" }}
        >
          <Plus size={12} />Connect App
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", padding: "0 24px", borderBottom: "1px solid var(--border)", flexShrink: 0, gap: 0, marginTop: 12 }}>
        {([["apps", `Apps (${CONNECTED_APPS.length})`], ["catalog", `Catalog (${connectedCount} connected)`], ["connect", "Connect New"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            fontSize: 13, fontWeight: 400, padding: "8px 16px", cursor: "pointer",
            background: "transparent", border: "none", borderBottom: "2px solid",
            borderBottomColor: tab === id ? "var(--text-1)" : "transparent",
            color: tab === id ? "var(--text-1)" : "var(--text-3)",
            marginBottom: -1,
            transition: "color 0.1s",
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Connected Apps tab ── */}
        {tab === "apps" && (
          <div className="page-pad">
            {/* Stats row */}
            <div className="rg-kpi" style={{ marginBottom: 20 }}>
              {[
                ["Connected Apps", CONNECTED_APPS.length.toString(), "var(--text-1)"],
                ["Total Traces",   "55,068",                          "var(--blue)"  ],
                ["Log Entries",    "347,112",                         "var(--text-1)"],
                ["Total Errors",   "48",                              "var(--red)"   ],
              ].map(([label, value, color]) => (
                <div key={label} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px", background: "var(--bg-2)" }}>
                  <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em", color, margin: "0 0 3px", fontFamily: "Geist Mono, monospace" }}>{value}</p>
                  <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* App list table */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-2)", overflowX: "auto" }}>
              {/* Sticky header */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 80px 90px 90px 70px 80px 100px",
                padding: "0 16px", height: 36, alignItems: "center",
                background: "var(--bg-2)", borderBottom: "1px solid var(--border)",
                position: "sticky", top: 0, zIndex: 5,
              }}>
                {["Service", "Lang", "Env", "Traces", "Errors", "Last Seen", ""].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.02em", color: "var(--text-3)", textAlign: h === "" ? "right" : "left" }}>
                    {h}
                  </div>
                ))}
              </div>
              {CONNECTED_APPS.map((app, i) => (
                <div key={app.name} style={{
                  display: "grid", gridTemplateColumns: "1fr 80px 90px 90px 70px 80px 100px",
                  padding: "10px 16px", alignItems: "center",
                  borderBottom: i < CONNECTED_APPS.length - 1 ? "1px solid var(--border)" : "none",
                  cursor: "pointer", transition: "background 0.1s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontFamily: "Geist Mono, monospace", fontWeight: 500, color: "var(--text-1)" }}>{app.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color: "var(--text-3)" }}>{app.lang}</span>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-3)" }}>{app.env}</span>
                  <span style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color: "var(--text-2)" }}>{app.traces.toLocaleString()}</span>
                  <span style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color: app.errors > 0 ? "var(--red)" : "var(--text-4)" }}>{app.errors}</span>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{app.lastSeen}</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                    <button style={{ color: "var(--text-4)", background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}>
                      <RefreshCw size={12} />
                    </button>
                    <button style={{ color: "var(--text-4)", background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Catalog tab ── */}
        {tab === "catalog" && (
          <div className="page-pad">
            {/* Category filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
              {allCats.map(c => (
                <button key={c} onClick={() => setCatFilter(c)} style={{
                  fontSize: 12, padding: "4px 12px", borderRadius: 99, cursor: "pointer", border: "1px solid",
                  borderColor: catFilter === c ? "var(--text-1)" : "var(--border)",
                  background: catFilter === c ? "var(--text-1)" : "transparent",
                  color: catFilter === c ? "var(--bg)" : "var(--text-3)",
                  transition: "all 0.1s",
                }}>{c}</button>
              ))}
            </div>

            {filteredGroups.map(group => (
              <div key={group.category} style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-3)", margin: "0 0 10px" }}>{group.category}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                  {group.items.map(item => {
                    const sb = statusBadge(item.status);
                    return (
                      <div key={item.name}
                        style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-2)", cursor: item.status !== "soon" ? "pointer" : "default", transition: "border-color 0.1s" }}
                        onMouseEnter={e => { if (item.status !== "soon") (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-2)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
                      >
                        <LogoBox code={item.logo} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{item.name}</span>
                            {item.status === "connected"
                              ? <CheckCircle size={13} style={{ color: "var(--green)", flexShrink: 0 }} />
                              : <span style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", padding: "2px 6px", borderRadius: 4, border: `1px solid ${sb.border}`, color: sb.color, background: sb.bg, flexShrink: 0 }}>{sb.label}</span>
                            }
                          </div>
                          <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Connect New tab ── */}
        {tab === "connect" && (
          <div className="rg-2 page-pad" style={{ gap: 20, maxWidth: 900 }}>
            {/* Form */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-2)", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>New Connection</p>
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Application Name", el: (
                    <input value={appName} onChange={e => setAppName(e.target.value)} placeholder="my-service"
                      style={{ width: "100%", borderRadius: 6, padding: "6px 10px", fontSize: 13, fontFamily: "Geist Mono, monospace", border: "1px solid var(--border)", background: "var(--bg-3)", color: "var(--text-1)", outline: "none", boxSizing: "border-box" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  )},
                  { label: "Language / Runtime", el: (
                    <select value={lang} onChange={e => { setLang(e.target.value); setFramework(FRAMEWORKS[e.target.value][0]); }}
                      style={{ width: "100%", borderRadius: 6, padding: "6px 10px", fontSize: 13, fontFamily: "Geist Mono, monospace", border: "1px solid var(--border)", background: "var(--bg-3)", color: "var(--text-1)", outline: "none", cursor: "pointer" }}>
                      {LANGS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  )},
                  { label: "Framework", el: (
                    <select value={framework} onChange={e => setFramework(e.target.value)}
                      style={{ width: "100%", borderRadius: 6, padding: "6px 10px", fontSize: 13, fontFamily: "Geist Mono, monospace", border: "1px solid var(--border)", background: "var(--bg-3)", color: "var(--text-1)", outline: "none", cursor: "pointer" }}>
                      {(FRAMEWORKS[lang] ?? []).map(f => <option key={f}>{f}</option>)}
                    </select>
                  )},
                  { label: "Environment", el: (
                    <select value={env} onChange={e => setEnv(e.target.value)}
                      style={{ width: "100%", borderRadius: 6, padding: "6px 10px", fontSize: 13, fontFamily: "Geist Mono, monospace", border: "1px solid var(--border)", background: "var(--bg-3)", color: "var(--text-1)", outline: "none", cursor: "pointer" }}>
                      {ENVS.map(ev => <option key={ev}>{ev}</option>)}
                    </select>
                  )},
                ].map(({ label, el }) => (
                  <div key={label}>
                    <label style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 5, letterSpacing: 0 }}>{label}</label>
                    {el}
                  </div>
                ))}

                {/* Protocol */}
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 5 }}>Protocol</label>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--accent-border)", background: "var(--accent-bg)" }}>
                    <span style={{ fontSize: 13, fontFamily: "Geist Mono, monospace", color: "var(--accent)" }}>OpenTelemetry OTLP</span>
                    <span style={{ fontSize: 10, color: "var(--accent)", fontFamily: "Geist Mono, monospace" }}>Recommended</span>
                  </div>
                </div>

                <button
                  onClick={() => { setGenerated(true); }}
                  disabled={!appName}
                  style={{
                    padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: appName ? "pointer" : "not-allowed",
                    background: appName ? "var(--text-1)" : "var(--bg-3)",
                    color: appName ? "var(--bg)" : "var(--text-4)",
                    border: "none", width: "100%",
                  }}
                >
                  Generate Config
                </button>
              </div>
            </div>

            {/* Config output */}
            <div>
              <AnimatePresence mode="wait">
                {generated ? (
                  <motion.div key="config" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                    style={{ border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-2)", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)", margin: 0 }}>
                        {appName || "your-service"} · {lang} · {env}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={copy} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "Geist Mono, monospace", color: copied ? "var(--green)" : "var(--text-4)", background: "none", border: "none", cursor: "pointer" }}
                          onMouseEnter={e => { if (!copied) (e.currentTarget as HTMLButtonElement).style.color = "var(--text-1)"; }}
                          onMouseLeave={e => { if (!copied) (e.currentTarget as HTMLButtonElement).style.color = "var(--text-4)"; }}>
                          {copied ? <Check size={11} /> : <Copy size={11} />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                        <button style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", background: "none", border: "none", cursor: "pointer" }}>
                          <ExternalLink size={11} />Docs
                        </button>
                      </div>
                    </div>
                    <pre style={{ margin: 0, padding: 16, fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-3)", background: "var(--bg-3)", overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                      {config}
                    </pre>
                    <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--yellow)", display: "inline-block" }} />
                      <p style={{ fontSize: 11, color: "var(--text-4)", margin: 0 }}>Never commit your API key to version control.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Copy size={14} style={{ color: "var(--text-4)" }} />
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Fill the form to generate config</p>
                    <p style={{ fontSize: 12, color: "var(--text-4)", margin: 0 }}>OpenTelemetry environment variables</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
