import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Activity, Brain, GitBranch, Bell, Zap, Shield, BarChart3,
  Server, ArrowRight, ChevronRight, Check, Layers, Network,
  Rocket, LayoutDashboard, AlertTriangle, XCircle, ScrollText,
  Terminal as TerminalIcon,
} from "lucide-react";
import { Aurora } from "@/components/ui/Aurora";
import { GradientText } from "@/components/ui/GradientText";
import { Typewriter } from "@/components/ui/Typewriter";
import { MovingBorderBtn } from "@/components/ui/MovingBorderBtn";
import { Spotlight } from "@/components/ui/Spotlight";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { Terminal } from "@/components/ui/terminal";
import { WobbleCard } from "@/components/ui/wobble-card";
import {
  Navbar, NavBody, NavItems, NavbarButton, NavbarLogo,
  MobileNav, MobileNavHeader, MobileNavToggle, MobileNavMenu,
} from "@/components/ui/resizable-navbar";

/* ── Terminal CLI demo (real SRE workflow) ── */
const TERMINAL_COMMANDS = [
  "sherlock connect ecommerce --env production",
  "sherlock logs payment-service --tail 50 --level error",
  "sherlock trace --service payment-service --window 5m",
  "sherlock ai analyze INC-094",
  "sherlock incident resolve INC-094 --message 'Canary deployed'",
];
const TERMINAL_OUTPUTS: Record<number, string[]> = {
  0: ["✔ Connected to ecommerce · production", "✔ 8 services · 1 degraded (payment-service)", "⚠  Active P0 incident: INC-094"],
  1: ["[13:48:02] ERROR  HikariPool-1 - timeout 30000ms", "[13:48:02] ERROR  payment-service: DB query timeout 30.1s", "[13:48:03] ERROR  Circuit breaker OPEN", "  … 46 more errors · error rate 12.4%"],
  2: ["→ Trace abc123  P95: 4.53s  status: ERROR", "  ├─ api-gateway      →  payment-service    23ms   ✔", "  ├─ payment-service  →  db-primary        30.1s  ✘", "  └─ payment-service  →  redis-cache        0.3ms  ✔"],
  3: ["✦ AI Root Cause (confidence: 91%)", "  HikariCP pool exhausted (50/50 held).", "  Missing index on orders.user_id in v2.14.1.", "  Recommendation: add index + raise pool to 120."],
  4: ["✔ Incident INC-094 resolved", "✔ PagerDuty all-clear sent", "✔ Post-mortem → sherlock.dev/pm/INC-094"],
};

const NAV_ITEMS = [
  { name: "Modules",      link: "#modules"      },
  { name: "Features",     link: "#features"     },
  { name: "How it works", link: "#how-it-works" },
  { name: "Pricing",      link: "#pricing"      },
];

/* ── All 12 actual app modules ── */
const MODULES = [
  { icon: LayoutDashboard, name: "Overview",     to: "/app/overview",     desc: "System health at a glance — error rates, latency, incidents, and request volume in real time." },
  { icon: AlertTriangle,   name: "Incidents",    to: "/app/incidents",    desc: "AI root cause analysis, severity routing, investigation timeline, and guided resolution." },
  { icon: XCircle,         name: "Errors",       to: "/app/errors",       desc: "Error grouping, stack trace aggregation, and occurrence frequency across all services." },
  { icon: GitBranch,       name: "Traces",       to: "/app/traces",       desc: "Distributed trace waterfall with span timing, service boundaries, and anomaly highlights." },
  { icon: ScrollText,      name: "Logs",         to: "/app/logs",         desc: "Stream, search, and filter structured logs in real time with full-text and field filtering." },
  { icon: BarChart3,       name: "Metrics",      to: "/app/metrics",      desc: "RED metrics, SLOs, custom dashboards, and infrastructure utilization charts." },
  { icon: Server,          name: "Services",     to: "/app/services",     desc: "Service catalog with health status, SLA tracking, and per-endpoint performance data." },
  { icon: Network,         name: "Dependencies", to: "/app/dependencies", desc: "Interactive topology graph — visualize blast radius, upstream and downstream impact." },
  { icon: Rocket,          name: "Deployments",  to: "/app/deployments",  desc: "Track every release. Correlate deployments with performance regressions and incidents." },
  { icon: TerminalIcon,    name: "API Debugger", to: "/app/apis",         desc: "HTTP request builder with response inspection, headers, auth, and timing breakdown." },
  { icon: Brain,           name: "AI Debugger",  to: "/app/ai",           desc: "Conversational root cause analysis. Ask in plain English, get evidence-backed answers." },
  { icon: Layers,          name: "Projects",     to: "/app/projects",     desc: "Manage services, API keys, team members, and environment configurations." },
];

const HOW_IT_WORKS = [
  {
    step: "01", icon: Zap, color: "#0070f3",
    title: "Connect in minutes",
    desc: "One-line OpenTelemetry instrumentation. Native SDKs for Node, Go, Python, Java, and Ruby. Zero config for Kubernetes.",
    code: `# Install the SDK\nnpm install @sherlock/node\n\n# Instrument your app\nSherlock.init({ projectId: 'ecommerce' });`,
  },
  {
    step: "02", icon: Brain, color: "#0070f3",
    title: "AI detects & correlates",
    desc: "Sherlock continuously correlates traces, logs, metrics, and deploys. Anomalies surface automatically before your users notice.",
    code: `// Automatic correlation\n{\n  "incident": "INC-094",\n  "confidence": 0.91,\n  "rootCause": "HikariCP pool exhausted",\n  "affectedServices": ["payment-service"]\n}`,
  },
  {
    step: "03", icon: Shield, color: "#0070f3",
    title: "Resolve with confidence",
    desc: "Every incident comes with root cause, blast radius, and a suggested fix. Your team acts — Sherlock provides the context.",
    code: `$ sherlock incident resolve INC-094\n✔ Root cause confirmed\n✔ Suggested fix applied\n✔ Post-mortem drafted`,
  },
];

/* ── Reusable badge style ── */
const pill = {
  display: "inline-flex", alignItems: "center", gap: 6,
  fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 99,
  background: "rgba(0,112,243,0.1)", border: "1px solid rgba(0,112,243,0.28)", color: "#60a5fa",
} as const;

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="dark" style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "Geist, sans-serif" }}>

      {/* ── Nav ── */}
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={NAV_ITEMS} />
          <div className="flex items-center gap-4">
            <NavbarButton href="/login" as="a" variant="secondary">Sign in</NavbarButton>
            <NavbarButton onClick={() => navigate("/register")} variant="primary">Get started free</NavbarButton>
          </div>
        </NavBody>
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle isOpen={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
          </MobileNavHeader>
          <MobileNavMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
            {NAV_ITEMS.map((item, idx) => (
              <a key={`mobile-${idx}`} href={item.link} onClick={() => setMobileOpen(false)} className="relative text-neutral-300">
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton href="/login" as="a" variant="secondary" className="w-full">Sign in</NavbarButton>
              <NavbarButton onClick={() => { navigate("/register"); setMobileOpen(false); }} variant="primary" className="w-full">
                Get started free
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* ── Hero ── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <Aurora className="absolute inset-0" intensity="medium" />
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "140px 24px 100px", width: "100%", position: "relative", zIndex: 10 }}
          className="hero-grid">

          {/* Left — copy */}
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <span style={{ ...pill, marginBottom: 28 }}>
                <Zap size={10} />AI-powered observability · Now GA
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: "clamp(36px, 5vw, 68px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.06, margin: "0 0 24px" }}
            >
              Stop debugging<br />
              <GradientText from="#60a5fa" via="#3291ff" to="#ffffff">in the dark.</GradientText>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.6 }}
              style={{ fontSize: "clamp(15px, 1.8vw, 18px)", color: "rgba(255,255,255,0.45)", letterSpacing: "-0.004em", lineHeight: 1.6, margin: "0 0 36px", maxWidth: 480 }}
            >
              Sherlock gives your SRE team{" "}
              <span style={{ color: "rgba(255,255,255,0.8)" }}>
                <Typewriter phrases={["instant root cause analysis.", "noise-free alerting.", "end-to-end tracing.", "AI-driven insights."]} />
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.5 }}
              style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 28 }}
            >
              <Link to="/register" style={{ textDecoration: "none" }}>
                <MovingBorderBtn innerClassName="px-6 py-3" duration={3.5}>
                  Start for free <ArrowRight size={14} />
                </MovingBorderBtn>
              </Link>
              <a href="#modules" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500,
                    color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 20px",
                    cursor: "pointer", letterSpacing: "-0.003em", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"; }}
                >
                  Explore modules <ChevronRight size={13} />
                </button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.62, duration: 0.5 }}
              style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}
            >
              {["No credit card", "Free for 3 services", "OpenTelemetry native"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.28)" }}>
                  <Check size={11} style={{ color: "#3291ff", flexShrink: 0 }} />{t}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — terminal */}
          <motion.div
            initial={{ opacity: 0, x: 32, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "relative", borderRadius: 14 }}
          >
            <Terminal
              commands={TERMINAL_COMMANDS}
              outputs={TERMINAL_OUTPUTS}
              username="sherlock-cli"
              typingSpeed={36}
              delayBetweenCommands={900}
              initialDelay={1200}
              enableSound={false}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Platform Modules ── */}
      <section id="modules" style={{ padding: "100px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.008)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 56 }}
          >
            <span style={{ ...pill, marginBottom: 20, display: "inline-flex" }}>
              <BarChart3 size={10} />Platform
            </span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px", lineHeight: 1.1 }}>
              12 modules. One unified platform.
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
              Everything from raw logs to AI root cause — connected, correlated, actionable.
            </p>
          </motion.div>

          <div className="modules-grid">
            {MODULES.map((mod, i) => (
              <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
              >
                <Link to={mod.to} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                  <div
                    style={{
                      padding: "20px", borderRadius: 12, height: "100%",
                      border: "1px solid rgba(255,255,255,0.07)",
                      background: "rgba(255,255,255,0.02)",
                      cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,112,243,0.35)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(0,112,243,0.04)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                        background: "rgba(0,112,243,0.1)", border: "1px solid rgba(0,112,243,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <mod.icon size={16} style={{ color: "#60a5fa" }} />
                      </div>
                      <ChevronRight size={13} style={{ color: "rgba(255,255,255,0.2)", marginTop: 4, flexShrink: 0 }} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", letterSpacing: "-0.008em", margin: "0 0 8px" }}>{mod.name}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.36)", lineHeight: 1.65, margin: 0 }}>{mod.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — WobbleCard bento ── */}
      <section id="features" style={{ padding: "120px 24px", position: "relative" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 64 }}
          >
            <span style={{ ...pill, marginBottom: 20, display: "inline-flex" }}>
              <BarChart3 size={10} />Capabilities
            </span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px", lineHeight: 1.1 }}>
              Everything your SRE team needs
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", maxWidth: 480, margin: "0 auto", letterSpacing: "-0.003em", lineHeight: 1.6 }}>
              Built for modern distributed systems. Works with your existing stack from day one.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Row 1 — wide + narrow */}
            <WobbleCard containerClassName="md:col-span-2 bg-[#060d1f] border border-white/[0.07] min-h-[280px]" className="py-10">
              <div className="max-w-sm relative z-10">
                <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(0,112,243,0.12)", border: "1px solid rgba(0,112,243,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Brain size={18} style={{ color: "#60a5fa" }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.014em", margin: "0 0 10px", lineHeight: 1.2 }}>AI Root Cause Analysis</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.42)", lineHeight: 1.65, margin: 0 }}>
                  Pinpoint the exact cause of every incident with high confidence. No manual log diving — Sherlock correlates traces, logs, and deploys automatically.
                </p>
              </div>
              <div style={{ position: "absolute", right: 28, bottom: 28, fontFamily: "Geist Mono, monospace", fontSize: 11, lineHeight: 1.8, color: "#c4c4c8", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 16px", minWidth: 240 }}>
                <div style={{ color: "#6b7280", marginBottom: 2 }}>{"// AI analysis"}</div>
                <div><span style={{ color: "#60a5fa" }}>confidence</span><span style={{ color: "#e4e4e7" }}>: </span><span style={{ color: "#93c5fd" }}>91%</span></div>
                <div><span style={{ color: "#60a5fa" }}>rootCause</span><span style={{ color: "#e4e4e7" }}>: </span><span style={{ color: "#fff" }}>"HikariCP exhausted"</span></div>
                <div><span style={{ color: "#60a5fa" }}>fix</span><span style={{ color: "#e4e4e7" }}>: </span><span style={{ color: "#93c5fd" }}>"index + pool ×2.4"</span></div>
              </div>
            </WobbleCard>

            <WobbleCard containerClassName="bg-[#0a1020] border border-white/[0.07] min-h-[280px]" className="py-10">
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(0,112,243,0.12)", border: "1px solid rgba(0,112,243,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <GitBranch size={17} style={{ color: "#60a5fa" }} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.012em", margin: "0 0 10px" }}>Distributed Tracing</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: "0 0 20px" }}>
                Follow every request across service boundaries with waterfall views.
              </p>
              <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 10, lineHeight: 1.6 }}>
                {[
                  { svc: "api-gateway", ms: 23,    w: "15%", ok: true  },
                  { svc: "payment-svc", ms: 30100, w: "95%", ok: false },
                  { svc: "redis-cache", ms: 0.3,   w: "5%",  ok: true  },
                ].map(r => (
                  <div key={r.svc} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ color: "rgba(255,255,255,0.3)", width: 78, flexShrink: 0 }}>{r.svc}</span>
                    <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: r.w, height: "100%", background: r.ok ? "#3291ff" : "rgba(255,80,80,0.6)", borderRadius: 3 }} />
                    </div>
                    <span style={{ color: r.ok ? "rgba(255,255,255,0.35)" : "#ff8080", width: 36, textAlign: "right", flexShrink: 0, fontSize: 9 }}>
                      {r.ms < 1 ? `${r.ms}ms` : r.ms > 999 ? `${(r.ms / 1000).toFixed(1)}s` : `${r.ms}ms`}
                    </span>
                  </div>
                ))}
              </div>
            </WobbleCard>

            {/* Row 2 — three equal */}
            <WobbleCard containerClassName="bg-[#080e1c] border border-white/[0.07] min-h-[240px]" className="py-8">
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(0,112,243,0.12)", border: "1px solid rgba(0,112,243,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Bell size={17} style={{ color: "#60a5fa" }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.012em", margin: "0 0 8px" }}>Noise-Free Alerting</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.6, margin: "0 0 16px" }}>
                ML-powered alert correlation suppresses duplicates and noise automatically.
              </p>
              <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 10 }}>
                {[
                  { label: "P0 · DB timeout", on: true  },
                  { label: "P3 · CPU spike",  on: false },
                  { label: "P3 · Mem warn",   on: false },
                ].map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, opacity: a.on ? 1 : 0.32 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: a.on ? "#3291ff" : "rgba(255,255,255,0.2)" }} />
                    <span style={{ color: a.on ? "#fff" : "rgba(255,255,255,0.5)" }}>{a.label}</span>
                    {!a.on && <span style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.2)" }}>suppressed</span>}
                  </div>
                ))}
              </div>
            </WobbleCard>

            <WobbleCard containerClassName="bg-[#040b18] border border-white/[0.07] min-h-[240px]" className="py-8">
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(0,112,243,0.12)", border: "1px solid rgba(0,112,243,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <BarChart3 size={17} style={{ color: "#60a5fa" }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.012em", margin: "0 0 8px" }}>Unified Metrics</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.6, margin: "0 0 16px" }}>RED metrics, SLOs, and dashboards — no more tab switching.</p>
              <div>
                <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 36 }}>
                  {[30, 45, 38, 52, 41, 60, 48, 72, 55, 80, 62, 78].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 11 ? "#3291ff" : "rgba(50,145,255,0.2)", borderRadius: "2px 2px 0 0" }} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "Geist Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.22)" }}>
                  <span>p50 48ms</span><span>p95 210ms</span><span>p99 430ms</span>
                </div>
              </div>
            </WobbleCard>

            <WobbleCard containerClassName="bg-[#060b17] border border-white/[0.07] min-h-[240px]" className="py-8">
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(0,112,243,0.12)", border: "1px solid rgba(0,112,243,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Shield size={17} style={{ color: "#60a5fa" }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.012em", margin: "0 0 8px" }}>Anomaly Detection</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.6, margin: "0 0 16px" }}>Adaptive baselines surface anomalies faster than static threshold alerts.</p>
              <div>
                <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 36, position: "relative" }}>
                  {[20, 22, 19, 21, 23, 20, 22, 21, 20, 68, 72, 65].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: i >= 9 ? "rgba(255,80,80,0.7)" : "rgba(50,145,255,0.25)", borderRadius: "2px 2px 0 0" }} />
                  ))}
                  <div style={{ position: "absolute", right: 0, top: -4, background: "rgba(255,60,60,0.15)", border: "1px solid rgba(255,60,60,0.4)", borderRadius: 4, padding: "1px 5px", fontFamily: "Geist Mono, monospace", fontSize: 8, color: "#ff8080", whiteSpace: "nowrap" }}>
                    ↑ anomaly
                  </div>
                </div>
                <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.22)", marginTop: 6 }}>baseline · last 24h</div>
              </div>
            </WobbleCard>

            {/* Row 3 — narrow + wide */}
            <WobbleCard containerClassName="bg-[#07101e] border border-white/[0.07] min-h-[240px]" className="py-8">
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(0,112,243,0.12)", border: "1px solid rgba(0,112,243,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Server size={17} style={{ color: "#60a5fa" }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.012em", margin: "0 0 8px" }}>Dependency Graph</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.6, margin: "0 0 16px" }}>Real-time topology of every service. Understand blast radius instantly.</p>
              <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                {[
                  { from: "api-gateway", to: "payment-svc", ok: false },
                  { from: "payment-svc", to: "db-primary",  ok: false },
                  { from: "api-gateway", to: "auth-svc",    ok: true  },
                ].map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <span style={{ color: e.ok ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.65)" }}>{e.from}</span>
                    <span style={{ color: e.ok ? "rgba(255,255,255,0.12)" : "#3291ff" }}>→</span>
                    <span style={{ color: e.ok ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.65)" }}>{e.to}</span>
                    <span style={{ marginLeft: "auto" }}>{e.ok ? "✔" : "✘"}</span>
                  </div>
                ))}
              </div>
            </WobbleCard>

            <WobbleCard containerClassName="md:col-span-2 bg-[#03080f] border border-white/[0.07] min-h-[240px]" className="py-8">
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(0,112,243,0.12)", border: "1px solid rgba(0,112,243,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Activity size={17} style={{ color: "#60a5fa" }} />
              </div>
              <div className="wobble-integrations-grid">
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.012em", margin: "0 0 10px" }}>Native Integrations</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.6, margin: 0 }}>
                    PagerDuty, Slack, OpsGenie, Prometheus, Grafana, and the major cloud providers — connected out of the box.
                  </p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignContent: "flex-start" }}>
                  {["PagerDuty", "Slack", "OpsGenie", "Prometheus", "Grafana", "AWS", "GCP", "Azure"].map(name => (
                    <span key={name} style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </WobbleCard>

          </div>
        </div>
      </section>

      {/* ── How it works — TracingBeam ── */}
      <section id="how-it-works" style={{ padding: "100px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>

          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 80 }}
          >
            <span style={{ ...pill, marginBottom: 20, display: "inline-flex" }}>
              <Zap size={10} />How it works
            </span>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>
              From incident to resolution{" "}
              <GradientText from="#60a5fa" via="#3291ff" to="#ffffff">in minutes.</GradientText>
            </h2>
          </motion.div>

          <TracingBeam>
            <div style={{ display: "flex", flexDirection: "column", gap: 72 }}>
              {HOW_IT_WORKS.map(step => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="how-step-grid"
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: `${step.color}15`, border: `1px solid ${step.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <step.icon size={19} style={{ color: step.color }} />
                      </div>
                      <span style={{ fontSize: 36, fontWeight: 800, color: "rgba(255,255,255,0.22)", letterSpacing: "-0.04em", fontFamily: "Geist Mono, monospace" }}>
                        {step.step}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: "#fff", letterSpacing: "-0.012em", margin: "0 0 12px" }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0, letterSpacing: "-0.002em" }}>{step.desc}</p>
                  </div>

                  <div style={{
                    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12, padding: "18px 20px", overflowX: "auto",
                    fontFamily: "Geist Mono, monospace", fontSize: 12, lineHeight: 1.8, color: "#c4c4c8",
                  }}>
                    {step.code.split("\n").map((line, j) => {
                      const isComment = line.startsWith("#") || line.startsWith("//");
                      const isKey = line.includes(":");
                      return (
                        <div key={j} style={{ color: isComment ? "#6b7280" : "#e4e4e7", whiteSpace: "pre" }}>
                          {isKey
                            ? <><span style={{ color: "#60a5fa" }}>{line.split(":")[0]}</span>:<span style={{ color: "#93c5fd" }}>{line.split(":").slice(1).join(":")}</span></>
                            : line
                          }
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </TracingBeam>
        </div>
      </section>

      {/* ── Platform facts ── */}
      <section style={{ padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.012)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="platform-facts-grid">
            {[
              { value: "12",   label: "Observability modules"  },
              { value: "3",    label: "Environments supported" },
              { value: "OTel", label: "Native instrumentation" },
              { value: "Zero", label: "Config files required"  },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1, fontFamily: "Geist Mono, monospace", marginBottom: 10 }}>
                  {value}
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0, letterSpacing: "-0.002em" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: "100px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 64 }}
          >
            <span style={{ ...pill, marginBottom: 20, display: "inline-flex" }}>
              <Layers size={10} />Pricing
            </span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px", lineHeight: 1.1 }}>
              Simple, transparent pricing
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
              Start free. Scale as your team grows. No surprise bills.
            </p>
          </motion.div>

          <div className="landing-pricing-grid">
            {[
              {
                name: "Hobby", price: "Free", period: "forever",
                desc: "For indie developers and small side-projects.",
                features: ["Up to 3 services", "7-day log retention", "10K spans / day", "Community support", "Basic alerting"],
                cta: "Start free", highlight: false,
              },
              {
                name: "Pro", price: "$49", period: "/ mo per seat",
                desc: "For growing engineering teams that need full observability.",
                features: ["Unlimited services", "30-day retention", "Unlimited spans", "AI root cause analysis", "On-call routing + PagerDuty", "Slack & webhook integrations", "Priority support"],
                cta: "Start free trial", highlight: true,
              },
              {
                name: "Enterprise", price: "Custom", period: "",
                desc: "For large orgs with compliance, SLA, and SSO requirements.",
                features: ["Everything in Pro", "90-day retention", "SSO / SAML", "Audit logs", "Custom SLA", "Dedicated Slack channel", "Custom integrations"],
                cta: "Contact sales", highlight: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{
                  borderRadius: 16,
                  border: plan.highlight ? "1px solid rgba(0,112,243,0.5)" : "1px solid rgba(255,255,255,0.07)",
                  background: plan.highlight ? "rgba(0,112,243,0.07)" : "rgba(255,255,255,0.02)",
                  padding: "32px 28px", display: "flex", flexDirection: "column",
                  position: "relative", overflow: "hidden",
                }}
              >
                {plan.highlight && (
                  <div style={{ position: "absolute", top: 16, right: 16, fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: "#0070f3", borderRadius: 99, padding: "3px 10px" }}>
                    Most popular
                  </div>
                )}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em", textTransform: "uppercase", margin: "0 0 10px" }}>{plan.name}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>{plan.price}</span>
                    {plan.period && <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{plan.period}</span>}
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.5 }}>{plan.desc}</p>
                </div>
                <div style={{ flex: 1, marginBottom: 28 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <Check size={13} style={{ color: plan.highlight ? "#60a5fa" : "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate(plan.name === "Enterprise" ? "/contact" : "/register")}
                  style={{
                    width: "100%", padding: "11px 0", borderRadius: 10, fontSize: 14, fontWeight: 600,
                    cursor: "pointer", letterSpacing: "-0.003em", transition: "opacity 0.15s",
                    background: plan.highlight ? "#0070f3" : "rgba(255,255,255,0.06)",
                    color: "#fff", border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >{plan.cta}</button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "120px 24px", position: "relative", overflow: "hidden" }}>
        <Spotlight className="top-0 left-1/2 -translate-x-1/2" fill="rgba(0,112,243,0.4)" />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{ ...pill, marginBottom: 28, display: "inline-flex" }}>
              <Layers size={10} />Free to start
            </span>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 700, letterSpacing: "-0.04em", margin: "0 0 20px", lineHeight: 1.06 }}>
              Ready to see<br />
              <GradientText from="#60a5fa" via="#3291ff" to="#ffffff">in the dark?</GradientText>
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", letterSpacing: "-0.003em", lineHeight: 1.55, maxWidth: 480, margin: "0 auto 40px" }}>
              Connect your first service and get full observability in minutes. No credit card required.
            </p>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <MovingBorderBtn duration={2.5} innerClassName="px-8 py-3.5 text-base">
                Start for free
                <ArrowRight size={15} />
              </MovingBorderBtn>
            </Link>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, marginTop: 32, flexWrap: "wrap" }}>
              {[
                { icon: Check, text: "No credit card" },
                { icon: Shield, text: "Free for 3 services" },
                { icon: Server, text: "OpenTelemetry native" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.28)" }}>
                  <Icon size={11} style={{ color: "#3291ff" }} />{text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={11} style={{ color: "#fff" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "-0.006em" }}>Sherlock</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", marginLeft: 8 }}>© 2026 Sherlock, Inc.</span>
          </div>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {["Privacy", "Terms", "Security", "Status", "Docs"].map(link => (
              <a key={link} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              >{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
