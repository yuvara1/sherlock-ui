import { useState } from "react";
import { Key, Users, Bell, Shield, Copy, Check, Plus, MoreHorizontal, Trash2, Globe, Lock, ChevronDown } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

const TABS = [
  { id: "general",   label: "General",       icon: Globe  },
  { id: "apikeys",   label: "API Keys",       icon: Key    },
  { id: "team",      label: "Team",           icon: Users  },
  { id: "alerts",    label: "Alerts",         icon: Bell   },
  { id: "security",  label: "Security",       icon: Shield },
];

const API_KEYS = [
  { id: "k1", name: "Production Telemetry", key: "demo_live_x8aF3kP9nQwR2mLvZ5tY7uB4cD6eHjI0mKpW", env: "production", created: "2026-08-01", lastUsed: "2 min ago", status: "active",   creator: "Jane Doe"  },
  { id: "k2", name: "Staging Integration",  key: "demo_test_a1bC2dE3fG4hI5jK6lM7nO8pQ9rS0tUvXy", env: "staging",    created: "2026-07-15", lastUsed: "1h ago",   status: "active",   creator: "Alex Kim"  },
  { id: "k3", name: "CI/CD Pipeline",       key: "demo_live_y9zA0bB1cC2dD3eE4fF5gG6hH7iI8jJkLm", env: "production", created: "2026-06-10", lastUsed: "12h ago",  status: "active",   creator: "Sam Chen"  },
  { id: "k4", name: "Dev local testing",    key: "demo_test_z0Aa1bB2cC3dD4eE5fF6gG7hH8iI9jKkLl", env: "development",created: "2026-05-20", lastUsed: "3d ago",   status: "revoked",  creator: "Pat Lee"   },
];

const TEAM = [
  { id: "u1", name: "Jane Doe",    email: "jane@acme.com",  role: "owner",     avatar: "JD", joined: "2026-01-12" },
  { id: "u2", name: "Alex Kim",    email: "alex@acme.com",  role: "admin",     avatar: "AK", joined: "2026-02-03" },
  { id: "u3", name: "Sam Chen",    email: "sam@acme.com",   role: "developer", avatar: "SC", joined: "2026-03-15" },
  { id: "u4", name: "Pat Lee",     email: "pat@acme.com",   role: "developer", avatar: "PL", joined: "2026-04-22" },
  { id: "u5", name: "Jordan Wu",   email: "jordan@acme.com",role: "viewer",    avatar: "JW", joined: "2026-06-01" },
];

const ALERT_RULES = [
  { id: "r1", name: "Error rate > 5%",       trigger: "error_rate",  threshold: "5%",   severity: "critical", channel: "Slack #alerts",  enabled: true  },
  { id: "r2", name: "P99 latency > 2s",      trigger: "latency_p99", threshold: "2000ms",severity: "high",    channel: "PagerDuty",      enabled: true  },
  { id: "r3", name: "Service down > 30s",    trigger: "health_check",threshold: "30s",  severity: "critical", channel: "PagerDuty",      enabled: true  },
  { id: "r4", name: "Kafka lag > 50K",       trigger: "kafka_lag",   threshold: "50000",severity: "medium",   channel: "Slack #infra",   enabled: false },
  { id: "r5", name: "Deploy failure",        trigger: "deployment",  threshold: "any",  severity: "high",     channel: "Slack #deploys", enabled: true  },
];

function roleStyle(r: string) {
  if (r === "owner")     return { color: "var(--accent)",  bg: "rgba(50,145,255,0.08)",  border: "rgba(50,145,255,0.2)"  };
  if (r === "admin")     return { color: "var(--yellow)",  bg: "var(--yellow-bg)",       border: "var(--yellow-border)"  };
  if (r === "developer") return { color: "var(--green)",   bg: "var(--green-bg)",        border: "var(--green-border)"   };
  return                        { color: "var(--text-3)",  bg: "var(--bg-3)",            border: "var(--border)"         };
}

function severityStyle(s: string) {
  if (s === "critical") return { color: "var(--red)",    bg: "var(--red-bg)",    border: "var(--red-border)"    };
  if (s === "high")     return { color: "var(--red)",    bg: "var(--red-bg)",    border: "var(--red-border)"    };
  if (s === "medium")   return { color: "var(--yellow)", bg: "var(--yellow-bg)", border: "var(--yellow-border)" };
  return                       { color: "var(--text-3)",  bg: "var(--bg-3)",     border: "var(--border)"        };
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(value).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", padding: 2, display: "flex" }}
      onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
      onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 34, height: 18, borderRadius: 9, border: "none", cursor: "pointer",
      background: on ? "var(--accent)" : "var(--bg-3)", padding: 2,
      transition: "background 0.2s", display: "flex", alignItems: "center",
    }}>
      <span style={{
        width: 14, height: 14, borderRadius: "50%", background: "#fff",
        transform: `translateX(${on ? 16 : 0}px)`, transition: "transform 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [alerts, setAlerts] = useState(ALERT_RULES);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("developer");

  const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, ...style }}>{children}</div>
  );

  const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 24, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ width: 200, flexShrink: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", margin: "0 0 3px", letterSpacing: "-0.004em" }}>{label}</p>
        {hint && <p style={{ fontSize: 11, color: "var(--text-4)", margin: 0, lineHeight: 1.5 }}>{hint}</p>}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );

  const inp = {
    width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 13,
    background: "var(--bg)", border: "1px solid var(--border-2)",
    color: "var(--text-1)", fontFamily: "Geist, sans-serif", outline: "none",
  } as React.CSSProperties;

  return (
    <FadeIn>
      <div className="page-pad" style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Settings</h2>
          <span style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: 0 }}>Manage your project, team, and integrations</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 24 }}>
          {/* Sidebar nav */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 7,
                cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "Geist, sans-serif",
                background: activeTab === t.id ? "var(--bg-2)" : "transparent",
                color: activeTab === t.id ? "var(--text-1)" : "var(--text-3)",
                fontSize: 13, fontWeight: activeTab === t.id ? 500 : 400, letterSpacing: "-0.004em",
                border: activeTab === t.id ? "1px solid var(--border)" : "1px solid transparent",
                transition: "all 0.1s",
              } as React.CSSProperties}>
                <t.icon size={13} />
                {t.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* General */}
            {activeTab === "general" && (
              <Card style={{ padding: "0 20px" }}>
                <Field label="Project name" hint="Display name for this project">
                  <input defaultValue="E-Commerce Platform" style={inp} />
                </Field>
                <Field label="Slug" hint="Used in API calls and URL paths">
                  <input defaultValue="ecommerce" style={{ ...inp, fontFamily: "Geist Mono, monospace" }} />
                </Field>
                <Field label="Description" hint="Short description of this project">
                  <textarea defaultValue="Main storefront, checkout, order management, and payments" rows={2} style={{ ...inp, resize: "vertical" }} />
                </Field>
                <Field label="Default environment" hint="Environment shown on login">
                  <select defaultValue="production" style={{ ...inp, width: "auto" }}>
                    <option value="production">production</option>
                    <option value="staging">staging</option>
                    <option value="development">development</option>
                  </select>
                </Field>
                <Field label="Data retention" hint="How long telemetry is stored">
                  <select defaultValue="30" style={{ ...inp, width: "auto" }}>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                  </select>
                </Field>
                <div style={{ paddingTop: 16, paddingBottom: 4 }}>
                  <button style={{ padding: "8px 16px", borderRadius: 7, border: "none", background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "Geist, sans-serif" }}>
                    Save changes
                  </button>
                </div>
              </Card>
            )}

            {/* API Keys */}
            {activeTab === "apikeys" && (
              <>
                <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(50,145,255,0.04)", border: "1px solid rgba(50,145,255,0.15)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Key size={13} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0, lineHeight: 1.6 }}>
                    API keys authenticate your applications and allow them to send telemetry to Sherlock. Keys are only shown once when created — store them securely. Sherlock never stores raw key values.
                  </p>
                </div>

                <Card>
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.006em", color: "var(--text-1)" }}>API Keys ({API_KEYS.filter(k => k.status === "active").length} active)</span>
                    <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 7, border: "none", background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Geist, sans-serif" }}>
                      <Plus size={11} /> Generate key
                    </button>
                  </div>

                  {API_KEYS.map((k, i) => (
                    <div key={k.id} style={{
                      padding: "12px 16px", borderBottom: i < API_KEYS.length - 1 ? "1px solid var(--border)" : "none",
                      opacity: k.status === "revoked" ? 0.5 : 1,
                      transition: "background 0.1s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.004em", color: "var(--text-1)" }}>{k.name}</span>
                            <span style={{
                              fontSize: 10, padding: "1px 6px", borderRadius: 4,
                              background: k.status === "active" ? "var(--green-bg)" : "var(--bg-3)",
                              border: `1px solid ${k.status === "active" ? "var(--green-border)" : "var(--border)"}`,
                              color: k.status === "active" ? "var(--green)" : "var(--text-4)",
                              fontWeight: 500,
                            }}>
                              {k.status}
                            </span>
                            <span style={{
                              fontSize: 10, fontFamily: "Geist Mono, monospace", padding: "1px 6px", borderRadius: 4,
                              background: "var(--bg-3)", border: "1px solid var(--border)",
                              color: k.env === "production" ? "var(--red)" : k.env === "staging" ? "var(--yellow)" : "var(--text-4)",
                            }}>
                              {k.env}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", letterSpacing: 0 }}>
                              {k.key.slice(0, 16)}••••••••••••••••••••
                            </span>
                            {k.status === "active" && <CopyBtn value={k.key} />}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", padding: 3, display: "flex" }}
                              onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>last used {k.lastUsed}</span>
                        </div>
                      </div>
                      <div style={{ marginTop: 6, display: "flex", gap: 12 }}>
                        <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>Created {k.created}</span>
                        <span style={{ fontSize: 11, color: "var(--text-4)" }}>by {k.creator}</span>
                      </div>
                    </div>
                  ))}
                </Card>
              </>
            )}

            {/* Team */}
            {activeTab === "team" && (
              <>
                {/* Invite */}
                <Card style={{ padding: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.006em", color: "var(--text-1)", margin: "0 0 12px" }}>Invite member</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" type="email" style={{ ...inp, flex: 1 }} />
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ ...inp, width: 130 }}>
                      <option value="developer">Developer</option>
                      <option value="viewer">Viewer</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "Geist, sans-serif", flexShrink: 0 }}>
                      Send invite
                    </button>
                  </div>
                </Card>

                {/* Members list */}
                <Card>
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.006em", color: "var(--text-1)" }}>Members ({TEAM.length})</span>
                  </div>
                  {TEAM.map((m, i) => {
                    const rs = roleStyle(m.role);
                    return (
                      <div key={m.id} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                        borderBottom: i < TEAM.length - 1 ? "1px solid var(--border)" : "none",
                        transition: "background 0.1s",
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", fontSize: 11, fontWeight: 600,
                          background: "var(--bg-3)", border: "1px solid var(--border-2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "var(--text-1)", fontFamily: "Geist Mono, monospace", flexShrink: 0,
                        }}>
                          {m.avatar}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.004em", color: "var(--text-1)", margin: "0 0 1px" }}>{m.name}</p>
                          <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: 0 }}>{m.email}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>joined {m.joined}</span>
                          <span style={{
                            fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 5,
                            color: rs.color, background: rs.bg, border: `1px solid ${rs.border}`, textTransform: "capitalize",
                          }}>
                            {m.role}
                          </span>
                          {m.role !== "owner" && (
                            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", display: "flex", padding: 2 }}
                              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
                              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}>
                              <MoreHorizontal size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </Card>
              </>
            )}

            {/* Alerts */}
            {activeTab === "alerts" && (
              <Card>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.006em", color: "var(--text-1)" }}>Alert rules</span>
                  <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 7, border: "none", background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Geist, sans-serif" }}>
                    <Plus size={11} /> Add rule
                  </button>
                </div>
                {alerts.map((rule, i) => {
                  const ss = severityStyle(rule.severity);
                  return (
                    <div key={rule.id} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                      borderBottom: i < alerts.length - 1 ? "1px solid var(--border)" : "none",
                      opacity: rule.enabled ? 1 : 0.5, transition: "background 0.1s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <Toggle on={rule.enabled} onChange={v => setAlerts(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: v } : r))} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.004em", color: "var(--text-1)", margin: "0 0 3px" }}>{rule.name}</p>
                        <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: 0 }}>
                          threshold: {rule.threshold} · channel: {rule.channel}
                        </p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 5, color: ss.color, background: ss.bg, border: `1px solid ${ss.border}`, textTransform: "capitalize", flexShrink: 0 }}>
                        {rule.severity}
                      </span>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", display: "flex", padding: 2 }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}>
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  );
                })}
              </Card>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <Card style={{ padding: "0 20px" }}>
                <Field label="Two-factor authentication" hint="Require MFA for all team members">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Toggle on={true} onChange={() => {}} />
                    <span style={{ fontSize: 12, color: "var(--green)" }}>Enforced for all members</span>
                  </div>
                </Field>
                <Field label="Session timeout" hint="Auto-logout after inactivity">
                  <select defaultValue="24h" style={{ ...inp, width: "auto" }}>
                    <option value="1h">1 hour</option>
                    <option value="8h">8 hours</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                  </select>
                </Field>
                <Field label="IP allowlist" hint="Restrict access to specific IPs">
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <input placeholder="0.0.0.0/0 (all IPs)" style={inp} />
                    <p style={{ fontSize: 11, color: "var(--text-4)", margin: 0 }}>Leave blank to allow all IPs. Use CIDR notation for ranges.</p>
                  </div>
                </Field>
                <Field label="Audit log" hint="Track all admin actions">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Toggle on={true} onChange={() => {}} />
                    <span style={{ fontSize: 12, color: "var(--text-3)" }}>Enabled — retained for 90 days</span>
                  </div>
                </Field>
                <div style={{ paddingTop: 16, paddingBottom: 4 }}>
                  <button style={{ padding: "8px 16px", borderRadius: 7, border: "none", background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "Geist, sans-serif" }}>
                    Save changes
                  </button>
                </div>
              </Card>
            )}

          </div>
        </div>

        {/* Danger zone */}
        <div style={{ padding: "16px 20px", borderRadius: 10, background: "var(--red-bg)", border: "1px solid var(--red-border)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--red)", margin: "0 0 4px", letterSpacing: "-0.004em" }}>Danger zone</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>Deleting this project is permanent and cannot be undone. All telemetry, traces, logs, incidents, and settings will be removed.</p>
            <button style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid var(--red-border)", background: "transparent", color: "var(--red)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Geist, sans-serif", flexShrink: 0 }}>
              Delete project
            </button>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
