import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Activity, Brain, GitBranch, Bell, Zap, Shield, BarChart3,
  Server, ArrowRight, ChevronRight, Check, Layers, Network,
  Rocket, LayoutDashboard, AlertTriangle, XCircle, ScrollText,
  Terminal as TerminalIcon, Clock, TrendingDown, Users,
  Lock, Globe, Code2,
} from "lucide-react";
import { Aurora } from "@/components/ui/Aurora";
import { GradientText } from "@/components/ui/GradientText";
import { Typewriter } from "@/components/ui/Typewriter";
import { TracingBeam } from "@/components/ui/tracing-beam";
import Counter from "@/components/ui/Counter";
import {
  Navbar, NavBody, NavItems, NavbarButton, NavbarLogo,
  MobileNav, MobileNavHeader, MobileNavToggle, MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { PricingSection, type Plan } from "@/components/ui/pricing";
import { SparklesCore } from "@/components/ui/sparkles";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { Marquee } from "@/components/ui/Marquee";
import { SquigglyText } from "@/components/ui/squiggly-text";
import VerticalMarqueeDemo from "@/components/ui/marquee-03";
import { BentoGrid } from "@/components/ui/bento-grid";
import { BentoCard } from "@/components/ui/bento-grid-utils/bento-card";
import {
  AiRootCauseDemo, MttrDemo, AlertNoiseDemo, TraceWaterfallDemo,
  ComparisonTableDemo, LanguageChipsDemo, StatDemo, DepGraphDemo,
} from "@/components/ui/bento-grid-utils/demo-cards";

/* ─── Nav items ─── */
const NAV_ITEMS = [
  { name: "Features",     link: "#features"     },
  { name: "How it works", link: "#how-it-works" },
  { name: "Why Sherlock", link: "#comparison"   },
  { name: "Pricing",      link: "#pricing"      },
];

/* ─── 12 app modules ─── */
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

const PRICING_PLANS: Plan[] = [
  {
    name: "Hobby",
    info: "For indie developers and side-projects.",
    price: { monthly: 0, yearly: 0 },
    features: [
      { text: "Up to 3 services" },
      { text: "7-day log retention" },
      { text: "10K spans / day" },
      { text: "Basic alerting" },
      { text: "Community support", tooltip: "Get answers on our Discord server" },
    ],
    btn: { text: "Start free", href: "/register" },
  },
  {
    highlighted: true,
    name: "Pro",
    info: "For growing engineering teams.",
    price: { monthly: 49, yearly: Math.round(49 * 12 * 0.83) },
    features: [
      { text: "Unlimited services" },
      { text: "30-day retention" },
      { text: "Unlimited spans" },
      { text: "AI root cause analysis", tooltip: "Correlates traces, logs, and deploys automatically" },
      { text: "On-call routing + PagerDuty" },
      { text: "Slack & webhook integrations" },
      { text: "Priority support", tooltip: "24/7 chat support" },
    ],
    btn: { text: "Start free trial", href: "/register" },
  },
  {
    name: "Enterprise",
    info: "For orgs with compliance and SLA needs.",
    price: { monthly: 199, yearly: Math.round(199 * 12 * 0.83) },
    features: [
      { text: "Everything in Pro" },
      { text: "90-day retention" },
      { text: "SSO / SAML" },
      { text: "Audit logs" },
      { text: "Custom SLA" },
      { text: "Dedicated Slack channel" },
      { text: "Custom integrations" },
    ],
    btn: { text: "Contact sales", href: "/contact" },
  },
];

const HOW_IT_WORKS = [
  {
    step: "01", icon: Zap,
    title: "Connect in minutes",
    desc: "One-line OpenTelemetry instrumentation. Native SDKs for Node, Go, Python, Java, and Ruby. Zero config for Kubernetes.",
    code: `# Install the SDK\nnpm install @sherlock/node\n\n# Instrument your app\nSherlock.init({ projectId: 'ecommerce' });`,
  },
  {
    step: "02", icon: Brain,
    title: "AI detects & correlates",
    desc: "Sherlock continuously correlates traces, logs, metrics, and deploys. Anomalies surface automatically before your users notice.",
    code: `// Automatic correlation\n{\n  "incident": "INC-094",\n  "confidence": 0.91,\n  "rootCause": "HikariCP pool exhausted",\n  "affectedServices": ["payment-service"]\n}`,
  },
  {
    step: "03", icon: Shield,
    title: "Resolve with confidence",
    desc: "Every incident comes with root cause, blast radius, and a suggested fix. Your team acts — Sherlock provides the context.",
    code: `$ sherlock incident resolve INC-094\n✔ Root cause confirmed\n✔ Suggested fix applied\n✔ Post-mortem drafted`,
  },
];

/* ─── Trusted companies ─── */
const TRUSTED_COMPANIES = [
  "Stripe", "Shopify", "Vercel", "Cloudflare", "Linear",
  "Figma", "Notion", "Railway", "Fly.io", "Render",
  "PlanetScale", "Supabase", "Turso", "Neon", "Upstash",
];


/* ─── Shared styles ─── */
const S = {
  pill: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 11, fontWeight: 500, padding: "4px 12px", borderRadius: 99,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.5)", letterSpacing: "0.02em",
  } as const,
  sectionLabel: {
    fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.35)", marginBottom: 16, display: "block",
  },
  h2: {
    fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 700,
    letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 16px", color: "#fff",
  },
  body: {
    fontSize: 15, color: "rgba(255,255,255,0.42)", lineHeight: 1.7,
    letterSpacing: "-0.003em",
  },
  iconBox: (size = 38) => ({
    width: size, height: size, borderRadius: 10, flexShrink: 0,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
    display: "flex", alignItems: "center", justifyContent: "center",
  } as const),
  card: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
  } as const,
  codeBlock: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10, padding: "16px 20px",
    fontFamily: "Geist Mono, monospace", fontSize: 12, lineHeight: 1.9,
  } as const,
};

/* ─── Hero monitor widget ─── */
const CHART_LEN = 48;
const AI_ALERTS = [
  { conf: "91%", svc: "payment-service", msg: "HikariCP pool exhausted — missing index in v2.14.1." },
  { conf: "87%", svc: "auth-service",    msg: "JWT validation spike — Redis TTL drift after deploy v3.2.0." },
  { conf: "94%", svc: "cart-service",    msg: "N+1 query regression introduced in migration 0048." },
  { conf: "89%", svc: "search-service",  msg: "Elasticsearch heap pressure from unbounded aggregation." },
];

function mkLat(prev: number, spike: boolean): number {
  if (spike) return 48 + Math.random() * 40;
  return Math.min(Math.max(prev + (Math.random() - 0.5) * 14, 128), 175);
}

function buildPaths(pts: number[]): { line: string; area: string } {
  const W = 600, H = 220;
  const step = W / (pts.length - 1);
  const coords = pts.map((v, i) => `${(i * step).toFixed(1)},${v.toFixed(1)}`);
  const line = "M " + coords.join(" L ");
  return { line, area: `${line} L ${W},${H} L 0,${H} Z` };
}

function HeroMonitor() {
  const initLat = Array.from({ length: CHART_LEN }, (_, i) =>
    i === 36 || i === 37 ? 52 + i * 0.5 : 140 + (Math.random() - 0.5) * 18
  );
  const [latPts, setLatPts] = useState(initLat);
  const [spikeIdx, setSpikeIdx] = useState(36);
  const [alertIdx, setAlertIdx] = useState(0);
  const [alertKey, setAlertKey] = useState(0);
  const [alertPaused, setAlertPaused] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [cursor, setCursor] = useState<{ svgX: number; idx: number; val: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const alertPausedRef = useRef(false);
  alertPausedRef.current = alertPaused;
  const [stats, setStats] = useState({
    rpm: 128.4, lat: 214, err: 0.12, uptime: 99.98,
    bars: {
      rpm:    [40, 55, 48, 62, 58, 70, 66],
      lat:    [30, 34, 32, 38, 44, 80, 52],
      err:    [20, 22, 21, 24, 26, 60, 30],
      uptime: [90, 92, 91, 93, 92, 94, 95],
    },
  });
  const tickRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      const inSpike = tick % 40 >= 34 && tick % 40 <= 37;
      setLatPts(prev => {
        const next = [...prev.slice(1), mkLat(prev[prev.length - 1], inSpike)];
        setSpikeIdx(next.reduce((mi, v, i) => (v < next[mi] ? i : mi), 0));
        return next;
      });
      setStats(prev => ({
        rpm:    +(prev.rpm + (Math.random() - 0.48) * 1.2).toFixed(1),
        lat:    Math.round(prev.lat + (Math.random() - 0.5) * 8 + (inSpike ? 12 : 0)),
        err:    +Math.max(0, prev.err + (Math.random() - 0.5) * 0.03 + (inSpike ? 0.04 : 0)).toFixed(2),
        uptime: +Math.min(100, Math.max(99.9, prev.uptime + (Math.random() - 0.5) * 0.005)).toFixed(2),
        bars: {
          rpm:    [...prev.bars.rpm.slice(1),    Math.round(40 + Math.random() * 55)],
          lat:    [...prev.bars.lat.slice(1),    Math.round(28 + Math.random() * (inSpike ? 70 : 30))],
          err:    [...prev.bars.err.slice(1),    Math.round(18 + Math.random() * (inSpike ? 55 : 20))],
          uptime: [...prev.bars.uptime.slice(1), Math.round(88 + Math.random() * 10)],
        },
      }));
      if (tick % 28 === 0 && !alertPausedRef.current) {
        setAlertIdx(a => (a + 1) % AI_ALERTS.length);
        setAlertKey(k => k + 1);
      }
    }, 800);
    return () => clearInterval(id);
  }, []);

  const { line: LINE_PATH, area: AREA_PATH } = buildPaths(latPts);
  const W = 600;
  const spkX = (spikeIdx / (CHART_LEN - 1)) * W;
  const spkY = latPts[spikeIdx];
  const alert = AI_ALERTS[alertIdx];

  const STAT_ROWS: {
    label: string; val: number; suffix: string;
    places: (number | ".")[]; bars: number[];
  }[] = [
    { label: "Requests / min", val: stats.rpm,    suffix: "K", places: [10, 1, ".", 0.1],      bars: stats.bars.rpm    },
    { label: "P95 latency",    val: stats.lat,    suffix: "ms", places: [100, 10, 1],           bars: stats.bars.lat    },
    { label: "Error rate",     val: stats.err,    suffix: "%", places: [1, ".", 0.1, 0.01],     bars: stats.bars.err    },
    { label: "Uptime",         val: stats.uptime, suffix: "%", places: [10, 1, ".", 0.1, 0.01], bars: stats.bars.uptime },
  ];

  return (
    <div style={{
      borderRadius: 16, overflow: "hidden",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 48px 120px -32px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)",
    }}>
      {/* window chrome */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {[0.25, 0.15, 0.1].map((o, i) => (
              <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: `rgba(255,255,255,${o})` }} />
            ))}
          </div>
          <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 6 }}>
            sherlock · ecommerce / production
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }}
          />
          <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Live</span>
        </div>
      </div>

      {/* chart area */}
      <div style={{ position: "relative", padding: "20px 20px 10px" }}>
        <span style={{ position: "absolute", top: 20, left: 20, fontFamily: "Geist Mono, monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", zIndex: 2 }}>
          P95 latency · last 60s
        </span>

        <svg
          ref={svgRef}
          viewBox="0 0 600 220"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "clamp(160px, 24vw, 220px)", display: "block", cursor: "crosshair" }}
          onMouseMove={e => {
            const svg = svgRef.current;
            if (!svg) return;
            const rect = svg.getBoundingClientRect();
            const fracX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const idx = Math.round(fracX * (CHART_LEN - 1));
            setCursor({ svgX: fracX * W, idx, val: latPts[idx] });
          }}
          onMouseLeave={() => setCursor(null)}
        >
          <defs>
            <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
            </linearGradient>
          </defs>
          {[44, 88, 132, 176].map(y => (
            <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}
          <path d={AREA_PATH} fill="url(#hero-area)" style={{ transition: "d 0.7s ease" }} />
          <path d={LINE_PATH} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" style={{ transition: "d 0.7s ease" }} />
          <circle cx={spkX} cy={spkY} r="4" fill="#fff" style={{ transition: "cx 0.7s ease, cy 0.7s ease" }} />
          <motion.circle cx={spkX} cy={spkY} r="4" fill="none" stroke="rgba(255,255,255,0.5)"
            animate={{ r: [4, 18], opacity: [0.7, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          />
          {cursor && (
            <g>
              <line x1={cursor.svgX} y1="0" x2={cursor.svgX} y2="220" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={cursor.svgX} cy={cursor.val} r="4" fill="#000" stroke="#fff" strokeWidth="1.5" />
              <g transform={`translate(${cursor.svgX > 470 ? cursor.svgX - 110 : cursor.svgX + 10},${Math.max(6, cursor.val - 36)})`}>
                <rect width="100" height="28" rx="5" fill="rgba(8,8,10,0.96)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <text x="9" y="11" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="Geist Mono, monospace" letterSpacing="0.07em">P95 LATENCY</text>
                <text x="9" y="23" fill="#fff" fontSize="11" fontWeight="700" fontFamily="Geist Mono, monospace">
                  {Math.round(80 + ((175 - cursor.val) / (175 - 48)) * 260)} ms
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* AI alert card */}
        <motion.div
          key={alertKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setAlertPaused(true)}
          onMouseLeave={() => setAlertPaused(false)}
          style={{
            position: "absolute", right: 20, top: 16, maxWidth: 220,
            background: "rgba(8,8,10,0.95)", backdropFilter: "blur(12px)",
            border: `1px solid ${alertPaused ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 10, padding: "11px 13px", cursor: "default",
            transition: "border-color 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Brain size={12} style={{ color: "rgba(255,255,255,0.8)" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", letterSpacing: "-0.005em" }}>AI root cause</span>
            <span style={{ marginLeft: "auto", fontFamily: "Geist Mono, monospace", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{alert.conf}</span>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
            {alert.msg.split(alert.svc).map((part, pi) =>
              pi === 0
                ? <span key={pi}>{part}<span style={{ color: "rgba(255,255,255,0.85)" }}>{alert.svc}</span></span>
                : <span key={pi}>{part}</span>
            )}
          </p>
        </motion.div>
      </div>

      {/* stat tiles */}
      <div className="hero-stats-grid" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {STAT_ROWS.map((s, i) => {
          const hov = hoveredStat === i;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
              onMouseEnter={() => setHoveredStat(i)}
              onMouseLeave={() => setHoveredStat(null)}
              style={{
                padding: "16px 18px", cursor: "default",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                background: hov ? "rgba(255,255,255,0.03)" : "transparent",
                transition: "background 0.15s ease",
              }}
            >
              <div style={{
                fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase",
                color: hov ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)",
                marginBottom: 10, whiteSpace: "nowrap", transition: "color 0.15s",
              }}>
                {s.label}
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-end", lineHeight: 1, fontFamily: "Geist Mono, monospace" }}>
                  <Counter
                    value={s.val}
                    places={s.places}
                    fontSize={20}
                    gap={0}
                    horizontalPadding={0}
                    borderRadius={0}
                    gradientHeight={0}
                    textColor="#fff"
                    fontWeight={700}
                  />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginLeft: 2, paddingBottom: 1 }}>{s.suffix}</span>
                </div>
                <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 24 }}>
                  {s.bars.map((h, j) => (
                    <div key={j} style={{
                      width: 3, height: `${h}%`, borderRadius: 2,
                      background: j === s.bars.length - 1
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(255,255,255,0.18)",
                      transition: "height 0.5s ease",
                    }} />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Feature tabs data ─── */
const FEATURE_TABS = [
  {
    id: "ai",
    icon: Brain,
    label: "AI Root Cause",
    heading: "Know exactly what broke — and why.",
    body: "Sherlock reads your stacktraces, deploy diffs, and log patterns simultaneously. It delivers a root cause with 91%+ confidence in under 2 minutes — no manual log diving.",
    demo: () => {
      const lines = [
        { k: "incident",   v: '"INC-094"',                    c: "rgba(255,255,255,0.55)" },
        { k: "confidence", v: '"91%"',                         c: "#fff"                  },
        { k: "rootCause",  v: '"HikariCP pool exhausted"',    c: "#fff"                  },
        { k: "deploy",     v: '"payment-service v2.14.1"',    c: "rgba(255,255,255,0.6)" },
        { k: "fix",        v: '"add index + pool ×2.4"',      c: "rgba(255,255,255,0.5)" },
        { k: "blast",      v: '["checkout", "cart"]',          c: "rgba(255,255,255,0.4)" },
      ];
      return (
        <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 12.5, lineHeight: 2, padding: "4px 0" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 12 }}>AI ANALYSIS · INC-094</div>
          {lines.map(({ k, v, c }, i) => (
            <motion.div key={k} style={{ display: "flex", gap: 8 }}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.25 }}>
              <span style={{ color: "rgba(255,255,255,0.32)", minWidth: 90 }}>{k}</span>
              <span style={{ color: "rgba(255,255,255,0.18)" }}>:</span>
              <span style={{ color: c }}>{v}</span>
            </motion.div>
          ))}
        </div>
      );
    },
  },
  {
    id: "tracing",
    icon: GitBranch,
    label: "Distributed Tracing",
    heading: "Follow every request, end to end.",
    body: "Waterfall views show you exactly where latency crept in or a service failed — across every microservice and every hop, with one-click span inspection.",
    demo: () => {
      const spans = [
        { svc: "api-gateway",  pct: 12,  ms: "18ms",  ok: true  },
        { svc: "payment-svc",  pct: 94,  ms: "28.4s", ok: false },
        { svc: "redis-cache",  pct: 4,   ms: "0.3ms", ok: true  },
        { svc: "db-primary",   pct: 88,  ms: "26.1s", ok: false },
        { svc: "notification", pct: 6,   ms: "9ms",   ok: true  },
      ];
      return (
        <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 11 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 14 }}>TRACE · T-7f3a92 · 28.4s total</div>
          {spans.map((s, i) => (
            <motion.div key={s.svc} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.25 }}>
              <span style={{ color: "rgba(255,255,255,0.28)", width: 92, flexShrink: 0, fontSize: 10 }}>{s.svc}</span>
              <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                <motion.div style={{ height: "100%", borderRadius: 3, background: s.ok ? "rgba(255,255,255,0.5)" : "rgba(239,68,68,0.65)" }}
                  initial={{ width: 0 }} animate={{ width: `${s.pct}%` }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.7, ease: "easeOut" }} />
              </div>
              <span style={{ color: s.ok ? "rgba(255,255,255,0.28)" : "#f87171", width: 38, textAlign: "right", flexShrink: 0, fontSize: 10 }}>{s.ms}</span>
            </motion.div>
          ))}
        </div>
      );
    },
  },
  {
    id: "alerts",
    icon: Bell,
    label: "Smart Alerting",
    heading: "Only get paged when it actually matters.",
    body: "ML correlation groups related signals and suppresses noise automatically. Your team gets 12 actionable alerts instead of 400. Every page is a real problem.",
    demo: () => {
      const alerts = [
        { sev: "P0", label: "DB connection pool exhausted",   svc: "payment-service", active: true  },
        { sev: "P3", label: "CPU spike on worker node",        svc: "k8s-worker-02",   active: false },
        { sev: "P3", label: "Memory warning threshold hit",    svc: "cart-service",    active: false },
        { sev: "P2", label: "Error rate > 5%",                 svc: "checkout-api",    active: false },
        { sev: "P3", label: "Disk I/O above baseline",         svc: "db-primary",      active: false },
      ];
      return (
        <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 11 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 14 }}>ALERT FEED · 400 → 12 ACTIONABLE</div>
          {alerts.map((a, i) => (
            <motion.div key={a.label} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9, opacity: a.active ? 1 : 0.28 }}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: a.active ? 1 : 0.28, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.25 }}>
              {a.active
                ? <motion.div animate={{ opacity: [1, 0.25, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
                    style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", flexShrink: 0 }} />
                : <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.2)", flexShrink: 0 }} />}
              <span style={{ color: a.active ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)", fontSize: 9, width: 18, flexShrink: 0 }}>{a.sev}</span>
              <span style={{ color: a.active ? "#fff" : "rgba(255,255,255,0.35)", flex: 1, fontSize: 11 }}>{a.label}</span>
              {!a.active && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", letterSpacing: "0.04em" }}>suppressed</span>}
            </motion.div>
          ))}
        </div>
      );
    },
  },
  {
    id: "metrics",
    icon: BarChart3,
    label: "Metrics & SLOs",
    heading: "Your RED metrics, all in one view.",
    body: "Request rate, error rate, duration — plus SLO burn rate, infrastructure saturation, and custom dashboards. No tab switching between tools.",
    demo: () => {
      const bars = [28, 36, 31, 44, 38, 52, 45, 66, 50, 74, 58, 82];
      const slos = [
        { label: "Availability SLO",  val: 99.94, target: 99.9,  ok: true  },
        { label: "Latency SLO (p95)", val: 98.1,  target: 99.0,  ok: false },
        { label: "Error budget",      val: 72,    target: 0,     ok: true, suffix: "% remaining" },
      ];
      return (
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 12, fontFamily: "Geist Mono, monospace" }}>REQUEST RATE · LAST 12H</div>
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 52, marginBottom: 16 }}>
            {bars.map((h, i) => (
              <motion.div key={i} style={{ flex: 1, background: i === 11 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.14)", borderRadius: "3px 3px 0 0" }}
                initial={{ height: 0 }} animate={{ height: `${h}%` }}
                transition={{ delay: 0.05 + i * 0.04, duration: 0.5, ease: "easeOut" }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Geist Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", marginBottom: 16 }}>
            <span>p50 48ms</span><span>p95 210ms</span><span>p99 430ms</span>
          </div>
          {slos.map((s, i) => (
            <motion.div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 11, fontFamily: "Geist Mono, monospace" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.08 }}>
              <span style={{ color: "rgba(255,255,255,0.38)" }}>{s.label}</span>
              <span style={{ color: s.ok ? "rgba(255,255,255,0.75)" : "#f87171", fontWeight: 700 }}>{s.val}{s.suffix ?? "%"}</span>
            </motion.div>
          ))}
        </div>
      );
    },
  },
  {
    id: "anomaly",
    icon: Shield,
    label: "Anomaly Detection",
    heading: "Catch issues before your users do.",
    body: "Adaptive baselines learn your system's normal behavior automatically. Deviations surface instantly — no threshold tuning, no false positives from routine traffic spikes.",
    demo: () => {
      const vals = [20, 22, 19, 21, 23, 20, 22, 21, 20, 68, 76, 71];
      return (
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 12, fontFamily: "Geist Mono, monospace" }}>ANOMALY DETECTION · ADAPTIVE BASELINE</div>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 64 }}>
              {vals.map((h, i) => (
                <motion.div key={i} style={{ flex: 1, background: i >= 9 ? "rgba(239,68,68,0.65)" : "rgba(255,255,255,0.13)", borderRadius: "3px 3px 0 0" }}
                  initial={{ height: 0 }} animate={{ height: `${h}%` }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: "easeOut" }} />
              ))}
            </div>
            <motion.div style={{
              position: "absolute", right: 0, top: -28,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: 5, padding: "3px 9px",
              fontFamily: "Geist Mono, monospace", fontSize: 10, color: "#f87171",
            }} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.75 }}>
              ↑ anomaly detected
            </motion.div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Geist Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 10 }}>
            <span>baseline: 18–24</span><span>current: 71</span><span>+3.2σ deviation</span>
          </div>
        </div>
      );
    },
  },
];

/* ─── Feature showcase component ─── */
function FeaturesShowcase() {
  const [active, setActive] = useState("ai");
  const tab = FEATURE_TABS.find(t => t.id === active)!;
  const Demo = tab.demo;

  return (
    <div className="vcard-top" style={{ display: "grid", gridTemplateColumns: "220px 1fr", overflow: "hidden" }}>
      {/* left nav */}
      <div style={{
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "8px",
        display: "flex", flexDirection: "column",
        background: "rgba(255,255,255,0.015)",
      }}>
        {FEATURE_TABS.map(t => (
          <button
            key={t.id}
            className={`ftab-btn${active === t.id ? " active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            <t.icon size={14} style={{ color: active === t.id ? "#fff" : "rgba(255,255,255,0.35)", flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, fontWeight: 500, color: active === t.id ? "#fff" : "rgba(255,255,255,0.38)", letterSpacing: "-0.005em" }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* right panel */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{ padding: "36px 40px", display: "flex", flexDirection: "column", gap: 0 }}
      >
        {/* heading block */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ ...S.iconBox(38), marginBottom: 18 }}>
            <tab.icon size={17} style={{ color: "rgba(255,255,255,0.7)" }} />
          </div>
          <h3 style={{ fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.018em", margin: "0 0 10px", lineHeight: 1.25 }}>
            {tab.heading}
          </h3>
          <p style={{ ...S.body, fontSize: 13.5, margin: 0, maxWidth: 480 }}>{tab.body}</p>
        </div>

        {/* live demo panel */}
        <div className="vcard" style={{ padding: "22px 24px", flex: 1 }}>
          <Demo />
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Section wrapper ─── */
function Section({ id, children, style }: {
  id?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section
      id={id}
      style={{
        padding: "100px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        ...style,
      }}
    >
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        {children}
      </div>
    </section>
  );
}

/* ─── Section header ─── */
function SectionHead({ label, heading, sub, center = true }: {
  label: string;
  heading: React.ReactNode;
  sub: string;
  center?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55 }}
      style={{ textAlign: center ? "center" : "left", marginBottom: 56 }}
    >
      <span style={S.sectionLabel}>{label}</span>
      <h2 style={S.h2}>{heading}</h2>
      <p style={{ ...S.body, maxWidth: 480, margin: center ? "0 auto" : "0" }}>{sub}</p>
    </motion.div>
  );
}

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "success" | "error">("idle");
  const navigate = useNavigate();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail.trim());
    if (!valid) { setNewsletterStatus("error"); return; }
    setNewsletterStatus("success");
    setNewsletterEmail("");
  };

  return (
    <div className="dark" style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "Geist, sans-serif" }}>

      {/* ── Nav ── */}
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={NAV_ITEMS} />
          <div className="flex items-center gap-3">
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
              <a key={idx} href={item.link} onClick={() => setMobileOpen(false)} className="relative text-neutral-300">
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-3">
              <NavbarButton href="/login" as="a" variant="secondary" className="w-full">Sign in</NavbarButton>
              <NavbarButton onClick={() => { navigate("/register"); setMobileOpen(false); }} variant="primary" className="w-full">
                Get started free
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* ══════════════════ HERO ══════════════════ */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <Aurora className="absolute inset-0" intensity="medium" />
        {/* dot grid */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 90% 65% at 50% 25%, #000 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 65% at 50% 25%, #000 30%, transparent 80%)",
        }} />
        {/* perspective grid floor */}
        <div className="hero-grid-floor" />

        {/* headline area */}
        <div style={{
          maxWidth: 860, margin: "0 auto",
          padding: "160px 24px 48px",
          position: "relative", zIndex: 10, textAlign: "center",
        }}>

          {/* badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}
          >
            <span style={{ ...S.pill, gap: 8, padding: "5px 14px" }}>
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", flexShrink: 0 }}
              />
              AI-powered observability · Now GA
            </span>
          </motion.div>

          {/* headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(44px, 8vw, 96px)", fontWeight: 800,
              letterSpacing: "-0.048em", lineHeight: 0.96, margin: "0 0 28px",
            }}
          >
            Stop debugging<br />
            <GradientText from="#ffffff" via="#6b6b6b" to="#ffffff">in the dark.</GradientText>
          </motion.h1>

          {/* subcopy */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            style={{ ...S.body, maxWidth: 540, margin: "0 auto 16px", fontSize: "clamp(15px, 1.8vw, 18px)" }}
          >
            Sherlock connects your traces, logs, metrics, and deployments — then uses AI to find the root cause before your users notice anything is wrong.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              fontSize: "clamp(14px, 1.6vw, 17px)", fontWeight: 500,
              color: "rgba(255,255,255,0.55)", letterSpacing: "-0.005em", marginBottom: 40,
              minHeight: "1.6em",
            }}
          >
            Built for SRE teams who need{" "}
            <Typewriter phrases={["instant root cause analysis.", "noise-free alerting.", "end-to-end tracing.", "AI-driven insights.", "faster incident resolution."]} />
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.45 }}
            style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}
          >
            <Link to="/register" style={{ textDecoration: "none" }}>
              <button
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  fontSize: 14, fontWeight: 600, letterSpacing: "-0.003em",
                  color: "#000", background: "#fff", border: "none",
                  borderRadius: 10, padding: "12px 24px",
                  cursor: "pointer", transition: "opacity 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.82"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                Start for free <ArrowRight size={14} />
              </button>
            </Link>
            <a href="#modules" style={{ textDecoration: "none" }}>
              <button
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 14, fontWeight: 500, letterSpacing: "-0.003em",
                  color: "rgba(255,255,255,0.65)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, padding: "11px 22px",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.09)"; el.style.color = "#fff"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.05)"; el.style.color = "rgba(255,255,255,0.65)"; }}
              >
                Explore modules <ChevronRight size={13} />
              </button>
            </a>
          </motion.div>

          {/* trust */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}
          >
            {["No credit card", "Free for 3 services", "OpenTelemetry native"].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                <Check size={11} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
                {t}
              </div>
            ))}
          </motion.div>
        </div>

        {/* hero monitor */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 120px", position: "relative", zIndex: 10 }}
        >
          <HeroMonitor />
        </motion.div>
      </section>

      {/* ══════════════════ TRUSTED BY ══════════════════ */}
      <section style={{ padding: "0 24px 0", borderTop: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 0" }}
        >
          <p style={{
            textAlign: "center", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 28,
          }}>
            Trusted by engineering teams at
          </p>
          <Marquee gap={48} pauseOnHover speed={28}>
            {TRUSTED_COMPANIES.map(name => (
              <span key={name} style={{
                fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em",
                color: "rgba(255,255,255,0.22)", whiteSpace: "nowrap",
                transition: "color 0.2s",
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.22)")}
              >
                {name}
              </span>
            ))}
          </Marquee>
        </motion.div>
      </section>

      {/* ══════════════════ MODULES ══════════════════ */}
      <Section id="modules" style={{ background: "rgba(255,255,255,0.008)" }}>
        <SectionHead
          label="Everything in one place"
          heading="12 modules. One unified platform."
          sub="Every tool your on-call team needs — logs, traces, metrics, incidents, and AI — connected in one place. No tab switching between 5 different tools."
        />
        <div className="modules-grid">
          {MODULES.map((mod, i) => (
            <motion.div
              key={mod.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.035, duration: 0.38 }}
              style={{ height: "100%" }}
            >
              <Link to={mod.to} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <CardSpotlight className="h-full overflow-hidden" style={{ padding: "20px" }}>
                  <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={S.iconBox(34)}>
                        <mod.icon size={15} style={{ color: "rgba(255,255,255,0.6)" }} />
                      </div>
                      <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.2)", marginTop: 3 }} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", letterSpacing: "-0.008em", margin: "0 0 6px" }}>{mod.name}</p>
                    <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.34)", lineHeight: 1.6, margin: 0 }}>{mod.desc}</p>
                  </div>
                </CardSpotlight>
              </Link>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <Section id="features">
        <SectionHead
          label="Core capabilities"
          heading="Powerful tools, simple workflow."
          sub="From AI-powered root cause analysis to noise-free alerts — each feature is designed to cut the time between 'something is wrong' and 'problem solved.'"
        />

        <FeaturesShowcase />

        {/* DEAD ZONE START - old feature grid removed */}
        <div style={{ display: "none" }}>

          {/* AI root cause — 2 col */}
          <motion.div
            style={{ gridColumn: "span 2" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
          >
            <CardSpotlight className="relative overflow-hidden" style={{ padding: "28px", minHeight: 300, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <BorderBeam size={300} duration={9} colorFrom="transparent" colorTo="rgba(255,255,255,0.35)" />
              <div style={{ position: "relative", zIndex: 10 }}>
                <div style={{ ...S.iconBox(40), marginBottom: 20 }}>
                  <Brain size={18} style={{ color: "rgba(255,255,255,0.7)" }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.015em", margin: "0 0 10px", lineHeight: 1.2 }}>
                  AI Root Cause Analysis
                </h3>
                <p style={{ ...S.body, maxWidth: 360, fontSize: 13 }}>
                  Pinpoint the exact cause in seconds. Sherlock correlates traces, logs, and deploys — no manual log diving.
                </p>
              </div>
              <motion.div
                style={{ ...S.codeBlock, position: "relative", zIndex: 10, marginTop: 24 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.45 }}
              >
                <div style={{ fontSize: 9, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 8 }}>
                  AI analysis · INC-094
                </div>
                {[
                  { k: "confidence", v: '"91%"',                        c: "#fff" },
                  { k: "rootCause",  v: '"HikariCP pool exhausted"',    c: "#fff" },
                  { k: "fix",        v: '"add index + pool ×2.4"',      c: "rgba(255,255,255,0.5)" },
                  { k: "blast",      v: '"payment-service"',             c: "rgba(255,255,255,0.5)" },
                ].map(({ k, v, c }, idx) => (
                  <motion.div key={k}
                    initial={{ opacity: 0, x: -6 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + idx * 0.1, duration: 0.3 }}
                    style={{ display: "flex", gap: 6 }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>{k}</span>
                    <span style={{ color: "rgba(255,255,255,0.18)" }}>:</span>
                    <span style={{ color: c }}>{v}</span>
                  </motion.div>
                ))}
              </motion.div>
            </CardSpotlight>
          </motion.div>

          {/* Distributed Tracing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <CardSpotlight style={{ padding: "28px", minHeight: 300, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ position: "relative", zIndex: 10 }}>
                <div style={{ ...S.iconBox(40), marginBottom: 18 }}>
                  <GitBranch size={17} style={{ color: "rgba(255,255,255,0.7)" }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.012em", margin: "0 0 8px" }}>Distributed Tracing</h3>
                <p style={{ ...S.body, fontSize: 12.5 }}>Follow every request across service boundaries with waterfall views.</p>
              </div>
              <div style={{ position: "relative", zIndex: 10, fontFamily: "Geist Mono, monospace", fontSize: 10, lineHeight: 1.6, marginTop: 20 }}>
                {[
                  { svc: "api-gateway", pct: 15,  ms: "23ms",  ok: true  },
                  { svc: "payment-svc", pct: 95,  ms: "30.1s", ok: false },
                  { svc: "redis-cache", pct: 5,   ms: "0.3ms", ok: true  },
                ].map((r, i) => (
                  <div key={r.svc} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: "rgba(255,255,255,0.28)", width: 70, flexShrink: 0, fontSize: 9 }}>{r.svc}</span>
                    <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                      <motion.div
                        style={{ height: "100%", background: r.ok ? "rgba(255,255,255,0.5)" : "rgba(255,80,80,0.6)", borderRadius: 2 }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${r.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25 + i * 0.15, duration: 0.65, ease: "easeOut" }}
                      />
                    </div>
                    <span style={{ color: r.ok ? "rgba(255,255,255,0.3)" : "#ff8080", width: 32, textAlign: "right", flexShrink: 0, fontSize: 9 }}>{r.ms}</span>
                  </div>
                ))}
              </div>
            </CardSpotlight>
          </motion.div>

          {/* Row 2: 3 equal cards */}
          {[
            {
              icon: Bell, title: "Noise-Free Alerting",
              desc: "ML-powered alert correlation suppresses duplicates and noise automatically.",
              delay: 0,
              content: (
                <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 10, marginTop: 18 }}>
                  {[
                    { label: "P0 · DB timeout", on: true  },
                    { label: "P3 · CPU spike",  on: false },
                    { label: "P3 · Mem warn",   on: false },
                  ].map((a, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.18 + i * 0.12, duration: 0.3 }}
                      style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, opacity: a.on ? 1 : 0.3 }}
                    >
                      {a.on
                        ? <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
                            style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", flexShrink: 0 }} />
                        : <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.2)", flexShrink: 0 }} />}
                      <span style={{ color: a.on ? "#fff" : "rgba(255,255,255,0.45)", flex: 1, fontSize: 11 }}>{a.label}</span>
                      {!a.on && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.04em" }}>suppressed</span>}
                    </motion.div>
                  ))}
                </div>
              ),
            },
            {
              icon: BarChart3, title: "Unified Metrics",
              desc: "RED metrics, SLOs, and dashboards — one place, no tab switching.",
              delay: 0.08,
              content: (
                <div style={{ marginTop: 18 }}>
                  <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 40 }}>
                    {[30, 45, 38, 52, 41, 60, 48, 72, 55, 80, 62, 78].map((h, i) => (
                      <motion.div key={i}
                        style={{ flex: 1, background: i === 11 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.13)", borderRadius: "2px 2px 0 0" }}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.12 + i * 0.04, duration: 0.45, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "Geist Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
                    <span>p50 48ms</span><span>p95 210ms</span><span>p99 430ms</span>
                  </div>
                </div>
              ),
            },
            {
              icon: Shield, title: "Anomaly Detection",
              desc: "Adaptive baselines surface anomalies faster than static thresholds.",
              delay: 0.16,
              content: (
                <div style={{ marginTop: 18, position: "relative" }}>
                  <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 40 }}>
                    {[20, 22, 19, 21, 23, 20, 22, 21, 20, 68, 72, 65].map((h, i) => (
                      <motion.div key={i}
                        style={{ flex: 1, background: i >= 9 ? "rgba(255,80,80,0.7)" : "rgba(255,255,255,0.12)", borderRadius: "2px 2px 0 0" }}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.12 + i * 0.04, duration: 0.45, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.75, duration: 0.3 }}
                    style={{
                      position: "absolute", right: 0, top: -20,
                      background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.35)",
                      borderRadius: 4, padding: "2px 7px",
                      fontFamily: "Geist Mono, monospace", fontSize: 9, color: "#ff7070",
                    }}
                  >
                    ↑ anomaly detected
                  </motion.div>
                  <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>adaptive baseline · last 24h</div>
                </div>
              ),
            },
          ].map(({ icon: Icon, title, desc, delay, content }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay, duration: 0.5 }}
            >
              <CardSpotlight style={{ padding: "24px", minHeight: 240, display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ ...S.iconBox(36), marginBottom: 16 }}>
                    <Icon size={15} style={{ color: "rgba(255,255,255,0.65)" }} />
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", margin: "0 0 6px" }}>{title}</h3>
                  <p style={{ ...S.body, fontSize: 12, margin: 0 }}>{desc}</p>
                  <div style={{ flex: 1 }}>{content}</div>
                </div>
              </CardSpotlight>
            </motion.div>
          ))}

          {/* Dep graph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
          >
            <CardSpotlight style={{ padding: "24px", minHeight: 220, display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", zIndex: 10 }}>
                <div style={{ ...S.iconBox(36), marginBottom: 16 }}>
                  <Server size={15} style={{ color: "rgba(255,255,255,0.65)" }} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", margin: "0 0 6px" }}>Dependency Graph</h3>
                <p style={{ ...S.body, fontSize: 12, margin: "0 0 16px" }}>Real-time topology — understand blast radius instantly.</p>
                <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 10 }}>
                  {[
                    { from: "api-gateway", to: "payment-svc", ok: false },
                    { from: "payment-svc", to: "db-primary",  ok: false },
                    { from: "api-gateway", to: "auth-svc",    ok: true  },
                  ].map((edge, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -6 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.12 + i * 0.1, duration: 0.3 }}
                      style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}
                    >
                      <span style={{ color: edge.ok ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.65)" }}>{edge.from}</span>
                      <motion.span
                        animate={edge.ok ? {} : { opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.6 }}
                        style={{ color: edge.ok ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.5)" }}
                      >→</motion.span>
                      <span style={{ color: edge.ok ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.65)" }}>{edge.to}</span>
                      <span style={{ marginLeft: "auto", color: edge.ok ? "rgba(255,255,255,0.3)" : "#ff8080" }}>{edge.ok ? "✔" : "✘"}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardSpotlight>
          </motion.div>

          {/* Integrations — 2 col */}
          <motion.div
            style={{ gridColumn: "span 2" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <CardSpotlight style={{ padding: "24px", minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ position: "relative", zIndex: 10 }}>
                <div style={{ ...S.iconBox(36), marginBottom: 16 }}>
                  <Activity size={15} style={{ color: "rgba(255,255,255,0.65)" }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.012em", margin: "0 0 8px" }}>Native Integrations</h3>
                <p style={{ ...S.body, fontSize: 13, margin: "0 0 24px" }}>
                  PagerDuty, Slack, OpsGenie, Prometheus, Grafana, and the major cloud providers — connected out of the box.
                </p>
              </div>
              <div style={{ position: "relative", zIndex: 10 }}>
                <Marquee gap={10} pauseOnHover>
                  {["PagerDuty", "Slack", "OpsGenie", "Prometheus", "Grafana", "AWS", "GCP", "Azure", "Datadog", "OpenTelemetry", "Kubernetes"].map(name => (
                    <span key={name} style={{
                      fontSize: 11, fontWeight: 500, padding: "4px 12px", borderRadius: 99,
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                      color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap", display: "inline-block",
                    }}>{name}</span>
                  ))}
                </Marquee>
              </div>
            </CardSpotlight>
          </motion.div>

        </div>{/* end dead zone */}
      </Section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <Section id="how-it-works">
        <SectionHead
          label="How it works"
          heading={<>Three steps to full{" "}<GradientText from="#fff" via="#888" to="#fff">observability.</GradientText></>}
          sub="Connect your first service in under 20 minutes. No complex configuration, no vendor lock-in — just clear visibility into what your system is doing."
        />

        <TracingBeam>
          <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            {HOW_IT_WORKS.map(step => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="how-step-grid"
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                    <div style={{ ...S.iconBox(44), borderRadius: 12 }}>
                      <step.icon size={18} style={{ color: "rgba(255,255,255,0.7)" }} />
                    </div>
                    <span style={{
                      fontSize: 40, fontWeight: 800, color: "rgba(255,255,255,0.14)",
                      letterSpacing: "-0.04em", fontFamily: "Geist Mono, monospace",
                    }}>
                      {step.step}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 19, fontWeight: 600, color: "#fff", letterSpacing: "-0.012em", margin: "0 0 12px" }}>{step.title}</h3>
                  <p style={{ ...S.body, fontSize: 14, margin: 0 }}>{step.desc}</p>
                </div>

                <div style={{ ...S.codeBlock, color: "rgba(255,255,255,0.55)", overflowX: "auto" }}>
                  {step.code.split("\n").map((line, j) => {
                    const isComment = line.startsWith("#") || line.startsWith("//");
                    const hasColon  = line.includes(":") && !line.startsWith("$") && !line.startsWith("✔");
                    return (
                      <div key={j} style={{ whiteSpace: "pre", lineHeight: 1.8 }}>
                        {isComment ? (
                          <span style={{ color: "rgba(255,255,255,0.28)" }}>{line}</span>
                        ) : hasColon ? (
                          <>
                            <span style={{ color: "rgba(255,255,255,0.55)" }}>{line.split(":")[0]}</span>
                            <span style={{ color: "rgba(255,255,255,0.25)" }}>:</span>
                            <span style={{ color: "rgba(255,255,255,0.38)" }}>{line.split(":").slice(1).join(":")}</span>
                          </>
                        ) : (
                          <span style={{ color: "rgba(255,255,255,0.65)" }}>{line}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </TracingBeam>
      </Section>

      {/* ══════════════════ PLATFORM FACTS ══════════════════ */}
      <section style={{ padding: "72px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 48 }}>
            By the numbers
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "40px 80px", flexWrap: "wrap" }}>
            {[
              { value: "6×",     label: "Faster mean time to resolution" },
              { value: "<2 min", label: "Median AI diagnosis time"        },
              { value: "97%",    label: "On-call engineer satisfaction"   },
              { value: "20 min", label: "Time to full observability"      },
            ].map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                style={{ textAlign: "center" }}
              >
                <div style={{
                  fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800,
                  letterSpacing: "-0.04em", color: "#fff", lineHeight: 1,
                  fontFamily: "Geist Mono, monospace", marginBottom: 10,
                }}>
                  {value}
                </div>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.3)", margin: 0, maxWidth: 140 }}>{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ WHY SHERLOCK — BENTO ══════════════════ */}
      <Section id="comparison" style={{ background: "rgba(255,255,255,0.008)" }}>
        <SectionHead
          label="Why Sherlock"
          heading={<>Not just another{" "}<GradientText from="#fff" via="#666" to="#fff">monitoring tool.</GradientText></>}
          sub="Most APM tools show you what broke. Sherlock tells you why — automatically, with evidence, in under 2 minutes."
        />
        <BentoGrid className="lg:grid-cols-4">
          {/* AI Root Cause — 2 col */}
          <BentoCard
            title="AI finds the root cause — not just symptoms"
            description="Sherlock reads the stacktrace, checks the deploy history, and cross-references logs to tell you exactly what broke and why."
            icon={<Brain size={15} />}
            colSpan={2}
          >
            <AiRootCauseDemo />
          </BentoCard>

          {/* MTTR — 1 col */}
          <BentoCard
            title="6× faster incident resolution"
            description="Teams go from 48-minute average resolution to under 8 minutes — without hiring more engineers."
            icon={<TrendingDown size={15} />}
          >
            <MttrDemo />
          </BentoCard>

          {/* Alert noise — 1 col */}
          <BentoCard
            title="Stop drowning in alerts"
            description="Sherlock's ML groups related alerts and suppresses noise, so every page means something."
            icon={<Bell size={15} />}
          >
            <AlertNoiseDemo />
          </BentoCard>

          {/* Dep graph — 1 col */}
          <BentoCard
            title="Know what else will break"
            description="The dependency graph shows every service affected by an incident — instantly — so you can act before users notice."
            icon={<Network size={15} />}
          >
            <DepGraphDemo />
          </BentoCard>

          {/* Comparison table — 2 col */}
          <BentoCard
            title="What Sherlock does that others don't"
            description="Most APM tools were built before AI existed. Sherlock was built around it."
            icon={<BarChart3 size={15} />}
            colSpan={2}
          >
            <ComparisonTableDemo />
          </BentoCard>

          {/* Stat — 1 col */}
          <BentoCard
            title="Answers in under 2 minutes"
            description="From alert to AI diagnosis — not hours of manual log searching."
            icon={<Clock size={15} />}
          >
            <StatDemo stat="<2 min" sub="median time to AI root cause" />
          </BentoCard>

          {/* Trace waterfall — 2 col */}
          <BentoCard
            title="Follow every request, end to end"
            description="See exactly where a request slowed down or failed — across every service, every hop."
            icon={<GitBranch size={15} />}
            colSpan={2}
          >
            <TraceWaterfallDemo />
          </BentoCard>

          {/* Stat — 1 col */}
          <BentoCard
            title="On-call teams love it"
            description="97% of engineers say Sherlock makes on-call less stressful."
            icon={<Users size={15} />}
          >
            <StatDemo stat="97%" sub="on-call engineers satisfied" />
          </BentoCard>

          {/* Language chips — 2 col */}
          <BentoCard
            title="Works with the stack you already use"
            description="One line of code. Eight languages. Zero config required for Kubernetes and Docker."
            icon={<Code2 size={15} />}
            colSpan={2}
          >
            <LanguageChipsDemo />
          </BentoCard>
        </BentoGrid>
      </Section>

      {/* ══════════════════ TESTIMONIALS ══════════════════ */}
      <Section id="testimonials">
        <SectionHead
          label="What engineering teams say"
          heading={<>Real results from{" "}<GradientText from="#fff" via="#888" to="#fff">real SRE teams.</GradientText></>}
          sub="These are the people who get paged at 3am. Here's what they say about Sherlock after using it in production."
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <VerticalMarqueeDemo />
        </motion.div>
      </Section>

      {/* ══════════════════ INCIDENT TIMELINE ══════════════════ */}
      <Section id="incident-flow" style={{ background: "rgba(255,255,255,0.005)" }}>
        <SectionHead
          label="See it in action"
          heading="A real P0 incident, resolved in 9 minutes."
          sub="This is an actual incident flow showing exactly what happens from the moment Sherlock detects an anomaly to the post-mortem being drafted — automatically."
        />

        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {[
            {
              t: "00:00",
              title: "Anomaly detected",
              detail: "P95 latency spike — payment-service — 1,240ms (baseline 212ms)",
              icon: Bell,
              tag: "AUTO-DETECTED",
            },
            {
              t: "00:14",
              title: "Traces correlated",
              detail: "23 affected traces linked. Span breakdown shows DB bottleneck in checkout flow.",
              icon: GitBranch,
              tag: "AI CORRELATION",
            },
            {
              t: "00:31",
              title: "Root cause identified",
              detail: "Missing index on orders.user_id introduced in migration 0048 — deployed 38 min ago.",
              icon: Brain,
              tag: "91% CONFIDENCE",
            },
            {
              t: "01:05",
              title: "On-call notified",
              detail: "PagerDuty alert with full context: blast radius, rootCause, suggested fix, and Slack thread.",
              icon: Bell,
              tag: "PAGERDUTY",
            },
            {
              t: "08:42",
              title: "Incident resolved",
              detail: "Index applied. p95 returned to 198ms. Post-mortem auto-drafted.",
              icon: Check,
              tag: "RESOLVED",
            },
          ].map((item, i) => (
            <motion.div
              key={item.t}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", gap: 20, marginBottom: i < 4 ? 0 : 0 }}
            >
              {/* timeline stem */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 36 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.12, duration: 0.3, type: "spring", stiffness: 280 }}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: i === 4 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${i === 4 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
                  <item.icon size={14} style={{ color: i === 4 ? "#fff" : "rgba(255,255,255,0.5)" }} />
                </motion.div>
                {i < 4 && (
                  <motion.div
                    style={{ width: 1, flex: 1, minHeight: 32, background: "rgba(255,255,255,0.06)", margin: "6px 0" }}
                    initial={{ scaleY: 0, originY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
                  />
                )}
              </div>

              {/* content */}
              <div style={{ flex: 1, paddingBottom: i < 4 ? 24 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{
                    fontFamily: "Geist Mono, monospace", fontSize: 10, fontWeight: 700,
                    color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em",
                  }}>{item.t}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "2px 7px", borderRadius: 4,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.3)",
                  }}>{item.tag}</span>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", margin: "0 0 5px" }}>{item.title}</h4>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: 0 }}>{item.detail}</p>
              </div>
            </motion.div>
          ))}

          {/* total time badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.45 }}
            style={{ textAlign: "center", marginTop: 36 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 20px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
            }}>
              <Clock size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
              <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 12, color: "#fff", fontWeight: 700 }}>8:42</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>total time to resolution</span>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ══════════════════ SECURITY STRIP ══════════════════ */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "56px 24px" }}>
        <p style={{ textAlign: "center", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 32 }}>
          Enterprise-ready security &amp; compliance
        </p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", gap: "32px 64px", flexWrap: "wrap", justifyContent: "center" }}
        >
          {[
            { icon: Lock,   label: "SOC 2 Type II certified" },
            { icon: Globe,  label: "GDPR compliant" },
            { icon: Shield, label: "End-to-end encryption" },
            { icon: Server, label: "99.99% uptime SLA" },
            { icon: Users,  label: "RBAC & SSO support" },
          ].map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "rgba(255,255,255,0.35)" }}
            >
              <Icon size={13} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
              {label}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════ PRICING ══════════════════ */}
      <Section id="pricing">
        <PricingSection
          plans={PRICING_PLANS.map(p => ({
            ...p,
            btn: { ...p.btn, onClick: () => navigate(p.name === "Enterprise" ? "/contact" : "/register") },
          }))}
          heading="Simple, transparent pricing"
          description="Start free. Scale as your team grows. No surprise bills."
        />
      </Section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <SparklesCore
            id="cta-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.1}
            particleDensity={70}
            particleColor="#ffffff"
            speed={1.4}
            className="w-full h-full"
          />
        </div>
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 25%, #000 95%)",
        }} />

        <div style={{
          maxWidth: 640, margin: "0 auto", textAlign: "center",
          position: "relative", zIndex: 10, padding: "130px 24px",
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 style={{ fontSize: "clamp(34px, 5vw, 64px)", fontWeight: 700, letterSpacing: "-0.04em", margin: "0 0 18px", lineHeight: 1.05, color: "#fff" }}>
              Your next incident<br />
              <SquigglyText scale={[5, 8]} stepDuration={75} className="text-white">resolved in minutes.</SquigglyText>
            </h2>
            <p style={{ ...S.body, fontSize: 16, maxWidth: 460, margin: "0 auto 36px" }}>
              Connect your first service in 20 minutes and get AI-powered root cause analysis, real-time alerts, and full distributed tracing — all for free.
            </p>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <button
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontSize: 14, fontWeight: 600, color: "#000", background: "#fff",
                  border: "none", borderRadius: 10, padding: "13px 26px",
                  cursor: "pointer", transition: "opacity 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.82"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                Start for free <ArrowRight size={14} />
              </button>
            </Link>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
              {[
                { icon: Check,  text: "No credit card required" },
                { icon: Shield, text: "Free for up to 3 services" },
                { icon: Zap,    text: "Live in under 20 minutes"  },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.28)" }}>
                  <Icon size={11} style={{ color: "rgba(255,255,255,0.38)" }} />{text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "64px 24px 0", position: "relative", zIndex: 10 }}>

          <div className="footer-top-grid">
            {/* brand */}
            <div>
              <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 16, textDecoration: "none" }}>
                <div style={{ ...S.iconBox(30), borderRadius: 8 }}>
                  <Activity size={14} style={{ color: "#fff" }} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Sherlock</span>
              </Link>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 280 }}>
                AI-powered observability for SRE teams. Stop debugging in the dark.
              </p>

              {/* newsletter */}
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: "0 0 10px" }}>
                Ship notes, monthly
              </p>
              {newsletterStatus === "success" ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, maxWidth: 300, marginBottom: 24,
                  fontSize: 13, color: "rgba(255,255,255,0.7)", padding: "9px 13px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9,
                }}>
                  <Check size={13} style={{ color: "#fff", flexShrink: 0 }} />
                  You're subscribed — watch your inbox.
                </div>
              ) : (
                <div style={{ marginBottom: 24 }}>
                  <form onSubmit={handleNewsletter} noValidate style={{ display: "flex", gap: 8, maxWidth: 300 }}>
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={e => { setNewsletterEmail(e.target.value); if (newsletterStatus === "error") setNewsletterStatus("idle"); }}
                      placeholder="you@company.com"
                      aria-label="Email address"
                      style={{
                        flex: 1, fontSize: 13, color: "#fff", padding: "9px 12px",
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${newsletterStatus === "error" ? "rgba(239,68,68,0.55)" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: 9, outline: "none", transition: "border-color 0.15s",
                      }}
                      onFocus={e => { if (newsletterStatus !== "error") e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
                      onBlur={e => { if (newsletterStatus !== "error") e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    />
                    <button type="submit" style={{
                      display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
                      fontSize: 13, fontWeight: 600, color: "#000", background: "#fff",
                      border: "none", borderRadius: 9, padding: "9px 14px",
                      cursor: "pointer", transition: "opacity 0.15s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
                      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                    >
                      Subscribe <ArrowRight size={12} />
                    </button>
                  </form>
                  {newsletterStatus === "error" && (
                    <p style={{ fontSize: 11, color: "#ef4444", margin: "7px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                      <XCircle size={10} /> Please enter a valid email.
                    </p>
                  )}
                </div>
              )}

              <a href="#" style={{
                ...S.pill, textDecoration: "none", gap: 7,
                transition: "border-color 0.15s",
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.28)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)")}
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", flexShrink: 0 }}
                />
                All systems operational
              </a>
            </div>

            {/* link columns */}
            {[
              { title: "Product",     links: ["Overview", "Incidents", "Traces", "Metrics", "Pricing", "Changelog"] },
              { title: "Developers",  links: ["Documentation", "API reference", "OpenTelemetry", "SDKs", "Status"] },
              { title: "Company",     links: ["About", "Careers", "Blog", "Customers", "Security", "Contact"] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: "0 0 16px" }}>
                  {col.title}
                </p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", textDecoration: "none", transition: "color 0.15s" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.38)")}
                      >{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* oversized wordmark */}
          <div style={{ marginTop: 64, overflow: "hidden" }}>
            <div style={{
              fontSize: "clamp(60px, 14vw, 190px)", fontWeight: 800,
              letterSpacing: "-0.05em", lineHeight: 0.88,
              color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.07)",
              userSelect: "none", whiteSpace: "nowrap",
            }}>
              SHERLOCK
            </div>
          </div>

          {/* bottom bar */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "22px 0 28px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 Sherlock, Inc.</span>
              {["Privacy", "Terms", "Cookies"].map(link => (
                <a key={link} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)")}
                >{link}</a>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {[
                { Icon: GitBranch, label: "GitHub"  },
                { Icon: Network,   label: "X"       },
                { Icon: TerminalIcon, label: "Discord" },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={label} style={{
                  width: 30, height: 30, borderRadius: 7,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(255,255,255,0.4)", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#fff"; el.style.background = "rgba(255,255,255,0.09)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "rgba(255,255,255,0.4)"; el.style.background = "rgba(255,255,255,0.04)"; }}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
