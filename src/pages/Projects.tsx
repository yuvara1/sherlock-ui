import React, { useState } from "react";
import { Plus, Key, Copy, Check, MoreHorizontal, Activity, AlertTriangle, GitCommit, Users, Zap, Layers } from "lucide-react";
import { motion } from "motion/react";
import { FadeIn } from "@/components/ui/FadeIn";
import { GlowCard } from "@/components/ui/GlowCard";
import { BorderBeam } from "@/components/ui/BorderBeam";
import {
  Modal, ModalTrigger, ModalBody, ModalContent, ModalFooter, useModal,
} from "@/components/ui/animated-modal";

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

/* Project avatar: icon image from Iconify CDN */
function ProjectAvatar({ slug, size = 40 }: { name: string; slug: string; size?: number }) {
  const ic = Math.round(size * 0.52);
  const configs: Record<string, { bg: string; border: string; url: string }> = {
    "ecommerce": {
      bg: "linear-gradient(135deg,#1e3a5f,#0f2744)",
      border: "#1d4ed8",
      url: `https://api.iconify.design/ph/shopping-cart-simple-bold.svg?color=%2360a5fa&width=${ic}&height=${ic}`,
    },
    "banking": {
      bg: "linear-gradient(135deg,#1a3028,#0d1f18)",
      border: "#059669",
      url: `https://api.iconify.design/ph/bank-bold.svg?color=%2334d399&width=${ic}&height=${ic}`,
    },
    "mobile-api": {
      bg: "linear-gradient(135deg,#2d1b4e,#1a0f2e)",
      border: "#7C3AED",
      url: `https://api.iconify.design/ph/device-mobile-bold.svg?color=%23a78bfa&width=${ic}&height=${ic}`,
    },
    "internal": {
      bg: "linear-gradient(135deg,#2a1f0e,#1c1408)",
      border: "#D97706",
      url: `https://api.iconify.design/ph/wrench-bold.svg?color=%23fbbf24&width=${ic}&height=${ic}`,
    },
  };
  const fallback = {
    bg: "linear-gradient(135deg,#1e1e2e,#12121f)",
    border: "#6366F1",
    url: `https://api.iconify.design/ph/cube-bold.svg?color=%23818cf8&width=${ic}&height=${ic}`,
  };
  const cfg = configs[slug] ?? fallback;

  return (
    <div style={{
      width: size, height: size, borderRadius: 10, flexShrink: 0,
      background: cfg.bg, border: `1.5px solid ${cfg.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <img src={cfg.url} width={ic} height={ic} alt="" style={{ display: "block" }} />
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

/* ── Create Project Modal form ───────────────────────────── */
function CreateProjectModal() {
  const { setOpen } = useModal();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    language: "Node.js",
    environments: ["development", "staging", "production"] as string[],
    type: "ecommerce",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleNameChange = (v: string) => {
    setForm(f => ({ ...f, name: v, slug: autoSlug(v) }));
  };
  const toggleEnv = (env: string) => {
    setForm(f => ({
      ...f,
      environments: f.environments.includes(env)
        ? f.environments.filter(e => e !== env)
        : [...f.environments, env],
    }));
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 11px", borderRadius: 8, fontSize: 13,
    background: "var(--bg)", border: "1px solid var(--border)",
    color: "var(--text-1)", fontFamily: "Geist, sans-serif",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
    color: "var(--text-4)", marginBottom: 6, display: "block",
  };

  return (
    <>
      <ModalContent>
        {/* Modal header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#3291ff,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Layers size={15} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", margin: 0, letterSpacing: "-0.012em" }}>Create new project</h3>
              <p style={{ fontSize: 12, color: "var(--text-4)", margin: 0 }}>Add a new application to Sherlock monitoring</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 28 }}>
          {/* Project name */}
          <div>
            <label style={labelStyle}>Project name <span style={{ color: "var(--red)" }}>*</span></label>
            <input
              autoFocus
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Payment Service"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Slug */}
          <div>
            <label style={labelStyle}>Identifier / slug</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-4)", fontFamily: "Geist Mono, monospace", pointerEvents: "none" }}>sherlock/</span>
              <input
                value={form.slug}
                onChange={e => set("slug", e.target.value)}
                placeholder="payment-service"
                style={{ ...inputStyle, paddingLeft: 80, fontFamily: "Geist Mono, monospace", fontSize: 12 }}
                onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="What does this project do?"
              rows={3}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Language + Type row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Primary language</label>
              <select
                value={form.language}
                onChange={e => set("language", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {["Go", "Java", "Node.js", "Python", "Scala", "TypeScript", "Rust", "Ruby"].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Project type</label>
              <select
                value={form.type}
                onChange={e => set("type", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {[
                  { value: "ecommerce", label: "E-Commerce" },
                  { value: "banking", label: "Banking / Finance" },
                  { value: "mobile-api", label: "Mobile / API" },
                  { value: "internal", label: "Internal Tools" },
                  { value: "data", label: "Data Platform" },
                  { value: "ml", label: "ML / AI" },
                  { value: "infrastructure", label: "Infrastructure" },
                ].map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Environments */}
          <div>
            <label style={labelStyle}>Environments</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["development", "staging", "production"].map(env => {
                const active = form.environments.includes(env);
                const color = env === "production" ? "var(--red)" : env === "staging" ? "var(--yellow)" : "var(--green)";
                return (
                  <button
                    key={env}
                    type="button"
                    onClick={() => toggleEnv(env)}
                    style={{
                      flex: 1, padding: "7px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                      fontFamily: "Geist Mono, monospace", cursor: "pointer", transition: "all 0.15s",
                      border: `1px solid ${active ? color : "var(--border)"}`,
                      background: active ? `${color}18` : "var(--bg)",
                      color: active ? color : "var(--text-4)",
                    }}
                  >
                    {env.slice(0, 3).toUpperCase()}
                    <span style={{ display: "block", fontSize: 9, marginTop: 1, opacity: 0.7 }}>{env}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <button
          onClick={() => setOpen(false)}
          style={{
            padding: "7px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer",
            border: "1px solid var(--border)", background: "transparent",
            color: "var(--text-3)", fontFamily: "Geist, sans-serif",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          Cancel
        </button>
        <button
          style={{
            padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
            border: "none", background: "var(--accent)", color: "#fff",
            fontFamily: "Geist, sans-serif", letterSpacing: "-0.004em",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <Plus size={12} /> Create project
        </button>
      </ModalFooter>
    </>
  );
}

export default function Projects() {
  const [tab, setTab] = useState<"projects" | "apikeys">("projects");

  return (
    <FadeIn>
      <div className="page-pad" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Projects</h2>
            <span style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: 0 }}>Applications being monitored</span>
          </div>
          <Modal>
            <ModalTrigger className="new-project-btn">
              <span style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 7,
                background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 500,
                fontFamily: "Geist, sans-serif", letterSpacing: "-0.004em",
              }}>
                <Plus size={12} /> New project
              </span>
            </ModalTrigger>
            <ModalBody>
              <CreateProjectModal />
            </ModalBody>
          </Modal>
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

        {/* Projects grid */}
        {tab === "projects" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
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
                  <GlowCard style={{ borderRadius: 10, cursor: "pointer", display: "flex", flexDirection: "column" }}>

                    {/* Health accent strip */}
                    <div style={{ height: 3, background: hm.accent, flexShrink: 0, borderRadius: "10px 10px 0 0" }} />

                    {/* ── Identity ────────────────────────────── */}
                    <div style={{ padding: "16px 18px 12px", display: "flex", alignItems: "flex-start", gap: 12, flexShrink: 0 }}>
                      <ProjectAvatar name={p.name} slug={p.slug} size={40} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                          <p style={{
                            fontSize: 13, fontWeight: 600, letterSpacing: "-0.012em",
                            color: "var(--text-1)", margin: 0, lineHeight: "18px",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>{p.name}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                            <span className={p.health === "critical" ? "pulse-dot" : ""} style={{
                              width: 6, height: 6, borderRadius: "50%",
                              background: hm.color, flexShrink: 0,
                            }} />
                            <span style={{ fontSize: 11, color: hm.color, fontWeight: 500 }}>{hm.label}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{p.slug}</span>
                          <span style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--border-2)", flexShrink: 0 }} />
                          <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{p.language}</span>
                          <span style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--border-2)", flexShrink: 0 }} />
                          <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{p.services} services</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Description ─────────────────────────── */}
                    <div style={{ padding: "0 18px 14px", flexShrink: 0 }}>
                      <p style={{
                        fontSize: 12, color: "var(--text-3)", margin: 0, lineHeight: 1.6,
                        letterSpacing: "-0.002em", overflow: "hidden",
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      } as React.CSSProperties}>{p.description}</p>
                    </div>

                    {/* ── Stats 2×2 grid ──────────────────────── */}
                    <div style={{ margin: "0 18px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "12px 0", flexShrink: 0 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 0" }}>
                        {[
                          { icon: Activity,      label: "Req / min",  value: p.requests,          alert: false           },
                          { icon: AlertTriangle,  label: "Error rate", value: `${p.errorRate}%`,   alert: p.errorRate > 1 },
                          { icon: Zap,            label: "Incidents",  value: String(p.incidents),  alert: p.incidents > 0 },
                          { icon: GitCommit,      label: "Last deploy", value: p.lastDeploy,        alert: false           },
                        ].map((s, i) => (
                          <div key={s.label} style={{
                            display: "flex", flexDirection: "column", gap: 3,
                            paddingLeft: i % 2 === 1 ? 16 : 0,
                            borderLeft: i % 2 === 1 ? "1px solid var(--border)" : "none",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <s.icon size={9} style={{ color: "var(--text-4)", flexShrink: 0 }} />
                              <span style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.04em", fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                                {s.label}
                              </span>
                            </div>
                            <p style={{
                              fontSize: 14, fontWeight: 700, fontFamily: "Geist Mono, monospace",
                              margin: 0, letterSpacing: "-0.025em", lineHeight: 1,
                              color: s.alert ? "var(--red)" : "var(--text-1)",
                            }}>{s.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── Footer ──────────────────────────────── */}
                    <div style={{ padding: "11px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexShrink: 0 }}>

                      {/* Env pills */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {p.environments.map(env => (
                          <div key={env} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{
                              width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                              background: env === p.activeEnv ? envColor(env) : "var(--border-2)",
                              opacity: env === p.activeEnv ? 1 : 0.45,
                            }} />
                            <span style={{
                              fontSize: 10, fontFamily: "Geist Mono, monospace",
                              color: env === p.activeEnv ? envColor(env) : "var(--text-4)",
                              fontWeight: env === p.activeEnv ? 500 : 400,
                            }}>{env.slice(0, 3)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Team avatars */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <div style={{ display: "flex" }}>
                          {p.team.slice(0, 4).map((initials, i) => (
                            <div key={i} style={{
                              width: 22, height: 22, borderRadius: "50%",
                              fontSize: 8, fontWeight: 700,
                              background: "var(--bg-3)", border: "2px solid var(--bg)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "var(--text-2)", marginLeft: i === 0 ? 0 : -6,
                              fontFamily: "Geist Mono, monospace", letterSpacing: 0,
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
                          <span style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{p.team.length}</span>
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
