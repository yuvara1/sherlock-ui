import React, { useState } from "react";
import { Plus, Key, Copy, Check, MoreHorizontal, Layers, Activity, AlertTriangle, GitCommit, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import { FadeIn } from "@/components/ui/FadeIn";
import { GlowCard } from "@/components/ui/GlowCard";
import { BorderBeam } from "@/components/ui/BorderBeam";

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
    errorRate: 2.4,
    incidents: 2,
    apiKeys: 3,
    lastDeploy: "34m ago",
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
    errorRate: 0.1,
    incidents: 0,
    apiKeys: 5,
    lastDeploy: "2h ago",
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
    errorRate: 1.1,
    incidents: 1,
    apiKeys: 2,
    lastDeploy: "6h ago",
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
    errorRate: 0.0,
    incidents: 0,
    apiKeys: 1,
    lastDeploy: "3d ago",
    team: ["AK"],
    language: "Python",
  },
];

const API_KEYS = [
  { id: "key-001", name: "Production Telemetry", key: "demo_live_x8aF3kP9nQwR2mLvZ5tY7uB4cD6eHjI", env: "production", created: "2026-08-01", lastUsed: "2 min ago", status: "active" },
  { id: "key-002", name: "Staging Integration",  key: "demo_test_a1bC2dE3fG4hI5jK6lM7nO8pQ9rS0t", env: "staging",    created: "2026-07-15", lastUsed: "1h ago",   status: "active" },
  { id: "key-003", name: "CI/CD Pipeline",       key: "demo_live_y9zA0bB1cC2dD3eE4fF5gG6hH7iI8j", env: "production", created: "2026-06-10", lastUsed: "12h ago",  status: "active" },
];

function healthMeta(h: string) {
  if (h === "critical") return { color: "var(--red)",    accent: "#e5484d", label: "Critical" };
  if (h === "degraded") return { color: "var(--yellow)", accent: "#d97706", label: "Degraded" };
  return                       { color: "var(--green)",  accent: "#1a7f37", label: "Healthy"  };
}

/* Project avatar: initials + hue derived from slug */
function ProjectAvatar({ name, slug, size = 38 }: { name: string; slug: string; size?: number }) {
  const hue = Array.from(slug).reduce((acc, c) => acc + c.charCodeAt(0) * 31, 0) % 360;
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: 9, flexShrink: 0,
      background: `hsl(${hue},55%,14%)`,
      border: `1px solid hsl(${hue},40%,24%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{
        fontSize: size * 0.32, fontWeight: 700, letterSpacing: "-0.01em",
        color: `hsl(${hue},80%,72%)`, fontFamily: "Geist, sans-serif",
      }}>{initials}</span>
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
    <button onClick={handle} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", padding: 2, display: "flex" }}
      onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
      onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

export default function Projects() {
  const [tab, setTab] = useState<"projects" | "apikeys">("projects");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  return (
    <FadeIn>
      <div className="page-pad" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Projects</h2>
            <span style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: 0 }}>Applications being monitored</span>
          </div>
          <button
            onClick={() => setCreating(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer",
              background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 500,
              fontFamily: "Geist, sans-serif", letterSpacing: "-0.004em",
            }}
          >
            <Plus size={12} /> New project
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, padding: 3, borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--border)", width: "fit-content" }}>
          {(["projects", "apikeys"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "4px 14px", borderRadius: 6, fontSize: 12, fontWeight: tab === t ? 500 : 400,
              letterSpacing: "-0.004em", border: "none", cursor: "pointer", fontFamily: "Geist, sans-serif",
              background: tab === t ? "var(--bg)" : "transparent",
              color: tab === t ? "var(--text-1)" : "var(--text-3)",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.15s",
            }}>
              {t === "projects" ? "Projects" : "API Keys"}
            </button>
          ))}
        </div>

        {/* New project inline form */}
        {creating && (
          <div style={{ position: "relative", borderRadius: 10, overflow: "hidden" }}>
            <BorderBeam colorFrom="transparent" colorTo="rgba(0,112,243,0.6)" duration={6} />
          <GlowCard style={{
            padding: "16px 18px", borderRadius: 10,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#3291ff,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Layers size={16} color="#fff" />
            </div>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Project name (e.g. Checkout Service)"
              style={{
                flex: 1, padding: "7px 10px", borderRadius: 7, fontSize: 13,
                background: "var(--bg)", border: "1px solid var(--border-2)",
                color: "var(--text-1)", fontFamily: "Geist, sans-serif",
                outline: "none",
              }}
            />
            <button onClick={() => setCreating(false)} style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-3)", fontSize: 12, cursor: "pointer", fontFamily: "Geist, sans-serif" }}>Cancel</button>
            <button style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Geist, sans-serif" }}>Create</button>
          </GlowCard>
          </div>
        )}

        {/* Projects grid */}
        {tab === "projects" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
            {PROJECTS.map((p, idx) => {
              const hm = healthMeta(p.health);
              const envColor = (e: string) => e === "production" ? "var(--red)" : e === "staging" ? "var(--yellow)" : "var(--text-4)";
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.22 }}
                  style={{ position: "relative", overflow: "hidden", borderRadius: 10 }}
                >
                  {p.health === "critical" && <BorderBeam colorFrom="transparent" colorTo="rgba(229,72,77,0.45)" duration={7} size={90} />}
                  <GlowCard style={{ borderRadius: 10, cursor: "pointer", display: "flex", flexDirection: "column", overflow: "hidden" }}>

                    {/* Health accent strip */}
                    <div style={{ height: 3, background: hm.accent, flexShrink: 0 }} />

                    {/* ── Identity ────────────────────────────── */}
                    <div style={{ padding: "14px 16px 12px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <ProjectAvatar name={p.name} slug={p.slug} size={38} />
                      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                          <p style={{
                            fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em",
                            color: "var(--text-1)", margin: 0, lineHeight: "18px",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>{p.name}</p>
                          {/* health dot + label */}
                          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                            <span className={p.health === "critical" ? "pulse-dot" : ""} style={{
                              width: 6, height: 6, borderRadius: "50%",
                              background: hm.color, flexShrink: 0, display: "inline-block",
                            }} />
                            <span style={{ fontSize: 11, color: hm.color, fontWeight: 500, letterSpacing: 0 }}>{hm.label}</span>
                          </div>
                        </div>
                        {/* slug + language + services inline */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                          <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", letterSpacing: 0 }}>{p.slug}</span>
                          <span style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--border-2)", flexShrink: 0, display: "inline-block" }} />
                          <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", letterSpacing: 0 }}>{p.language}</span>
                          <span style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--border-2)", flexShrink: 0, display: "inline-block" }} />
                          <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", letterSpacing: 0 }}>{p.services} svc</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Description ─────────────────────────── */}
                    <div style={{ padding: "0 16px 13px" }}>
                      <p style={{
                        fontSize: 12, color: "var(--text-3)", margin: 0, lineHeight: 1.55,
                        letterSpacing: "-0.002em", overflow: "hidden",
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      } as React.CSSProperties}>{p.description}</p>
                    </div>

                    {/* ── Stats row ───────────────────────────── */}
                    <div style={{ margin: "0 16px", padding: "11px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "stretch", gap: 0 }}>
                      {[
                        { icon: Activity,      label: "Req/min",   value: p.requests,          alert: false           },
                        { icon: AlertTriangle,  label: "Err rate",  value: `${p.errorRate}%`,   alert: p.errorRate > 1 },
                        { icon: Zap,            label: "Incidents", value: String(p.incidents),  alert: p.incidents > 0 },
                        { icon: GitCommit,      label: "Last deploy", value: p.lastDeploy,       alert: false           },
                      ].map((s, i) => (
                        <div key={s.label} style={{
                          flex: 1, paddingLeft: i === 0 ? 0 : 12,
                          borderLeft: i > 0 ? "1px solid var(--border)" : "none",
                          marginLeft: i > 0 ? 12 : 0,
                          display: "flex", flexDirection: "column", gap: 4,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <s.icon size={9} style={{ color: "var(--text-4)", flexShrink: 0 }} />
                            <span style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.01em", fontWeight: 500, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                              {s.label}
                            </span>
                          </div>
                          <p style={{
                            fontSize: 13, fontWeight: 600, fontFamily: "Geist Mono, monospace",
                            margin: 0, letterSpacing: "-0.02em", lineHeight: 1,
                            color: s.alert ? "var(--red)" : "var(--text-1)",
                          }}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* ── Footer ──────────────────────────────── */}
                    <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>

                      {/* Env dots */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {p.environments.map(env => (
                          <div key={env} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{
                              width: 5, height: 5, borderRadius: "50%", flexShrink: 0, display: "inline-block",
                              background: env === p.activeEnv ? envColor(env) : "var(--border-2)",
                              opacity: env === p.activeEnv ? 1 : 0.5,
                            }} />
                            <span style={{
                              fontSize: 10, fontFamily: "Geist Mono, monospace", letterSpacing: 0,
                              color: env === p.activeEnv ? envColor(env) : "var(--text-4)",
                              fontWeight: env === p.activeEnv ? 500 : 400,
                            }}>{env.slice(0, 3)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Team avatars */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <div style={{ display: "flex" }}>
                          {p.team.slice(0, 4).map((initials, i) => (
                            <div key={i} style={{
                              width: 20, height: 20, borderRadius: "50%",
                              fontSize: 8, fontWeight: 700, letterSpacing: 0,
                              background: "var(--bg-3)", border: "1.5px solid var(--bg-2)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "var(--text-2)", marginLeft: i === 0 ? 0 : -5,
                              fontFamily: "Geist Mono, monospace",
                            }}>
                              {initials}
                            </div>
                          ))}
                        </div>
                        {p.team.length > 4 && (
                          <span style={{ fontSize: 10, color: "var(--text-4)", fontFamily: "Geist Mono, monospace" }}>+{p.team.length - 4}</span>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Users size={9} style={{ color: "var(--text-4)" }} />
                          <span style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", letterSpacing: 0 }}>{p.team.length}</span>
                        </div>
                      </div>
                    </div>

                  </GlowCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* API Keys tab */}
        {tab === "apikeys" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Overview */}
            <GlowCard style={{
              padding: "14px 16px", borderRadius: 10,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--bg-3)", border: "1px solid var(--border-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Key size={16} style={{ color: "var(--accent)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.006em", color: "var(--text-1)", margin: "0 0 2px" }}>API Keys</p>
                <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>Use API keys to authenticate your applications and send telemetry to Sherlock</p>
              </div>
              <button style={{
                padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 500,
                fontFamily: "Geist, sans-serif", display: "flex", alignItems: "center", gap: 6,
                flexShrink: 0,
              }}>
                <Plus size={12} /> Generate key
              </button>
            </GlowCard>

            {/* Keys table */}
            <GlowCard style={{ borderRadius: 10, overflow: "hidden" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 120px 120px 120px 80px 40px",
                padding: "8px 16px", borderBottom: "1px solid var(--border)",
                background: "var(--bg)",
              }}>
                {["Key name", "Environment", "Created", "Last used", "Status", ""].map(h => (
                  <span key={h} style={{ fontSize: 11, color: "var(--text-4)", letterSpacing: "-0.002em", fontWeight: 500 }}>{h}</span>
                ))}
              </div>

              {API_KEYS.map((k, i) => (
                <motion.div key={k.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.07 }}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 120px 120px 120px 80px 40px",
                    alignItems: "center", padding: "12px 16px",
                    borderBottom: i < API_KEYS.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>

                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.004em", color: "var(--text-1)", margin: "0 0 3px" }}>{k.name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", letterSpacing: 0 }}>
                        {k.key.slice(0, 14)}••••••••••••••
                      </span>
                      <CopyKey value={k.key} />
                    </div>
                  </div>

                  <span style={{
                    fontSize: 11, fontFamily: "Geist Mono, monospace", padding: "2px 7px", borderRadius: 5,
                    background: "var(--bg-3)", border: "1px solid var(--border)",
                    color: k.env === "production" ? "var(--red)" : "var(--yellow)", width: "fit-content",
                  }}>
                    {k.env}
                  </span>

                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{k.created}</span>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-3)" }}>{k.lastUsed}</span>

                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 5, width: "fit-content",
                    background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green)",
                  }}>
                    {k.status}
                  </span>

                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", display: "flex", padding: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}>
                    <MoreHorizontal size={14} />
                  </button>
                </motion.div>
              ))}
            </GlowCard>

            {/* Usage guide */}
            <GlowCard style={{ padding: "14px 16px", borderRadius: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)", margin: "0 0 10px" }}>Usage example</p>
              <div style={{
                padding: "12px 14px", borderRadius: 8, background: "var(--bg)",
                border: "1px solid var(--border)", fontFamily: "Geist Mono, monospace", fontSize: 11,
                color: "var(--text-3)", lineHeight: 1.8,
              }}>
                <span style={{ color: "var(--text-4)" }}>POST</span>{" "}
                <span style={{ color: "var(--accent)" }}>https://ingest.sherlock.dev/v1/ingest</span>
                <br />
                <span style={{ color: "var(--text-4)" }}>Authorization:</span>{" "}
                <span style={{ color: "var(--green)" }}>Bearer demo_live_x8aF3kP9...</span>
                <br />
                <span style={{ color: "var(--text-4)" }}>Content-Type:</span>{" "}
                <span>application/json</span>
              </div>
              <div style={{
                marginTop: 8, padding: "12px 14px", borderRadius: 8, background: "var(--bg)",
                border: "1px solid var(--border)", fontFamily: "Geist Mono, monospace", fontSize: 11,
                color: "var(--text-3)", lineHeight: 1.8,
              }}>
                {`{`}<br />
                {`  `}<span style={{ color: "var(--accent)" }}>"projectId"</span>{`: `}<span style={{ color: "var(--green)" }}>"proj-001"</span>,<br />
                {`  `}<span style={{ color: "var(--accent)" }}>"environment"</span>{`: `}<span style={{ color: "var(--green)" }}>"production"</span>,<br />
                {`  `}<span style={{ color: "var(--accent)" }}>"serviceName"</span>{`: `}<span style={{ color: "var(--green)" }}>"payment-service"</span>,<br />
                {`  `}<span style={{ color: "var(--accent)" }}>"traceId"</span>{`: `}<span style={{ color: "var(--green)" }}>"abc123"</span>,<br />
                {`  `}<span style={{ color: "var(--accent)" }}>"eventType"</span>{`: `}<span style={{ color: "var(--green)" }}>"ERROR"</span>,<br />
                {`  `}<span style={{ color: "var(--accent)" }}>"message"</span>{`: `}<span style={{ color: "var(--green)" }}>"Payment provider timeout"</span><br />
                {`}`}
              </div>
            </GlowCard>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
