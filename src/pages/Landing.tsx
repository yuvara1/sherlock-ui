import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import {
  Activity,
  Brain,
  GitBranch,
  Bell,
  Zap,
  Shield,
  BarChart3,
  Server,
  ArrowRight,
  ChevronRight,
  Check,
  Layers,
  Network,
  Rocket,
  LayoutDashboard,
  AlertTriangle,
  XCircle,
  ScrollText,
  Terminal as TerminalIcon,
  Clock,
  TrendingDown,
  Users,
  Lock,
  Globe,
  Code2,
} from "lucide-react"
import { Aurora } from "@/components/ui/Aurora"
import { GradientText } from "@/components/ui/GradientText"
import { Typewriter } from "@/components/ui/Typewriter"
import { TracingBeam } from "@/components/ui/tracing-beam"
import Counter from "@/components/ui/Counter"
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarButton,
  NavbarLogo,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar"
import { PricingSection, type Plan } from "@/components/ui/pricing"
import { SparklesCore } from "@/components/ui/sparkles"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { BorderBeam } from "@/components/ui/BorderBeam"
import { Marquee } from "@/components/ui/Marquee"
import { SquigglyText } from "@/components/ui/squiggly-text"
import VerticalMarqueeDemo from "@/components/ui/marquee-03"
import { BentoGrid } from "@/components/ui/bento-grid"
import { BentoCard } from "@/components/ui/bento-grid-utils/bento-card"
import {
  AiRootCauseDemo,
  MttrDemo,
  AlertNoiseDemo,
  TraceWaterfallDemo,
  ComparisonTableDemo,
  LanguageChipsDemo,
  StatDemo,
  DepGraphDemo,
} from "@/components/ui/bento-grid-utils/demo-cards"
/* ─── Nav items ─── */
const NAV_ITEMS = [
  { name: "Features", link: "#features" },
  { name: "How it works", link: "#how-it-works" },
  { name: "Why Sherlock", link: "#comparison" },
  { name: "Pricing", link: "#pricing" },
]
/* ─── 12 app modules ─── */
const MODULES = [
  {
    icon: LayoutDashboard,
    name: "Overview",
    to: "/app/overview",
    desc: "System health at a glance — error rates, latency, incidents, and request volume in real time.",
  },
  {
    icon: AlertTriangle,
    name: "Incidents",
    to: "/app/incidents",
    desc: "AI root cause analysis, severity routing, investigation timeline, and guided resolution.",
  },
  {
    icon: XCircle,
    name: "Errors",
    to: "/app/errors",
    desc: "Error grouping, stack trace aggregation, and occurrence frequency across all services.",
  },
  {
    icon: GitBranch,
    name: "Traces",
    to: "/app/traces",
    desc: "Distributed trace waterfall with span timing, service boundaries, and anomaly highlights.",
  },
  {
    icon: ScrollText,
    name: "Logs",
    to: "/app/logs",
    desc: "Stream, search, and filter structured logs in real time with full-text and field filtering.",
  },
  {
    icon: BarChart3,
    name: "Metrics",
    to: "/app/metrics",
    desc: "RED metrics, SLOs, custom dashboards, and infrastructure utilization charts.",
  },
  {
    icon: Server,
    name: "Services",
    to: "/app/services",
    desc: "Service catalog with health status, SLA tracking, and per-endpoint performance data.",
  },
  {
    icon: Network,
    name: "Dependencies",
    to: "/app/dependencies",
    desc: "Interactive topology graph — visualize blast radius, upstream and downstream impact.",
  },
  {
    icon: Rocket,
    name: "Deployments",
    to: "/app/deployments",
    desc: "Track every release. Correlate deployments with performance regressions and incidents.",
  },
  {
    icon: TerminalIcon,
    name: "API Debugger",
    to: "/app/apis",
    desc: "HTTP request builder with response inspection, headers, auth, and timing breakdown.",
  },
  {
    icon: Brain,
    name: "AI Debugger",
    to: "/app/ai",
    desc: "Conversational root cause analysis. Ask in plain English, get evidence-backed answers.",
  },
  {
    icon: Layers,
    name: "Projects",
    to: "/app/projects",
    desc: "Manage services, API keys, team members, and environment configurations.",
  },
]
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
      {
        text: "Community support",
        tooltip: "Get answers on our Discord server",
      },
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
      {
        text: "AI root cause analysis",
        tooltip: "Correlates traces, logs, and deploys automatically",
      },
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
]
const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Zap,
    title: "Connect in minutes",
    desc: "One-line OpenTelemetry instrumentation. Native SDKs for Node, Go, Python, Java, and Ruby. Zero config for Kubernetes.",
    code: `# Install the SDK\nnpm install @sherlock/node\n\n# Instrument your app\nSherlock.init({ projectId: 'ecommerce' });`,
  },
  {
    step: "02",
    icon: Brain,
    title: "AI detects & correlates",
    desc: "Sherlock continuously correlates traces, logs, metrics, and deploys. Anomalies surface automatically before your users notice.",
    code: `// Automatic correlation\n{\n  "incident": "INC-094",\n  "confidence": 0.91,\n  "rootCause": "HikariCP pool exhausted",\n  "affectedServices": ["payment-service"]\n}`,
  },
  {
    step: "03",
    icon: Shield,
    title: "Resolve with confidence",
    desc: "Every incident comes with root cause, blast radius, and a suggested fix. Your team acts — Sherlock provides the context.",
    code: `$ sherlock incident resolve INC-094\n✔ Root cause confirmed\n✔ Suggested fix applied\n✔ Post-mortem drafted`,
  },
]
/* ─── Trusted companies ─── */
const TRUSTED_COMPANIES = [
  "Stripe",
  "Shopify",
  "Vercel",
  "Cloudflare",
  "Linear",
  "Figma",
  "Notion",
  "Railway",
  "Fly.io",
  "Render",
  "PlanetScale",
  "Supabase",
  "Turso",
  "Neon",
  "Upstash",
]
/* ─── Shared styles ─── */
const S = {
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    fontWeight: 500,
    padding: "4px 12px",
    borderRadius: 99,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "0.02em",
  } as const,
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.35)",
    marginBottom: 16,
    display: "block",
  },
  h2: {
    fontSize: "clamp(28px, 3.5vw, 46px)",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    margin: "0 0 16px",
    color: "#fff",
  },
  body: {
    fontSize: 15,
    color: "rgba(255,255,255,0.42)",
    lineHeight: 1.7,
    letterSpacing: "-0.003em",
  },
  iconBox: (size = 38) =>
    ({
      width: size,
      height: size,
      borderRadius: 10,
      flexShrink: 0,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.09)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }) as const,
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
  } as const,
  codeBlock: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "16px 20px",
    fontFamily: "Geist Mono, monospace",
    fontSize: 12,
    lineHeight: 1.9,
  } as const,
}
/* ─── Hero monitor widget ─── */
const CHART_LEN = 48
const AI_ALERTS = [
  {
    conf: "91%",
    svc: "payment-service",
    msg: "HikariCP pool exhausted — missing index in v2.14.1.",
  },
  {
    conf: "87%",
    svc: "auth-service",
    msg: "JWT validation spike — Redis TTL drift after deploy v3.2.0.",
  },
  {
    conf: "94%",
    svc: "cart-service",
    msg: "N+1 query regression introduced in migration 0048.",
  },
  {
    conf: "89%",
    svc: "search-service",
    msg: "Elasticsearch heap pressure from unbounded aggregation.",
  },
]
function mkLat(prev: number, spike: boolean): number {
  if (spike) return 48 + Math.random() * 40
  return Math.min(Math.max(prev + (Math.random() - 0.5) * 14, 128), 175)
}
function buildPaths(
  pts: number[],
): {
  line: string
  area: string
} {
  const W = 600,
    H = 220
  const step = W / (pts.length - 1)
  const coords = pts.map((v, i) => `${(i * step).toFixed(1)},${v.toFixed(1)}`)
  const line = "M " + coords.join(" L ")
  return { line, area: `${line} L ${W},${H} L 0,${H} Z` }
}
function HeroMonitor() {
  const initLat = Array.from({ length: CHART_LEN }, (_, i) =>
    i === 36 || i === 37 ? 52 + i * 0.5 : 140 + (Math.random() - 0.5) * 18,
  )
  const [latPts, setLatPts] = useState(initLat)
  const [spikeIdx, setSpikeIdx] = useState(36)
  const [alertIdx, setAlertIdx] = useState(0)
  const [alertKey, setAlertKey] = useState(0)
  const [alertPaused, setAlertPaused] = useState(false)
  const [hoveredStat, setHoveredStat] = useState<number | null>(null)
  const [cursor, setCursor] = useState<{
    svgX: number
    idx: number
    val: number
  } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const alertPausedRef = useRef(false)
  alertPausedRef.current = alertPaused
  const [stats, setStats] = useState({
    rpm: 128.4,
    lat: 214,
    err: 0.12,
    uptime: 99.98,
    bars: {
      rpm: [40, 55, 48, 62, 58, 70, 66],
      lat: [30, 34, 32, 38, 44, 80, 52],
      err: [20, 22, 21, 24, 26, 60, 30],
      uptime: [90, 92, 91, 93, 92, 94, 95],
    },
  })
  const tickRef = useRef(0)
  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1
      const tick = tickRef.current
      const inSpike = tick % 40 >= 34 && tick % 40 <= 37
      setLatPts((prev) => {
        const next = [...prev.slice(1), mkLat(prev[prev.length - 1], inSpike)]
        setSpikeIdx(next.reduce((mi, v, i) => (v < next[mi] ? i : mi), 0))
        return next
      })
      setStats((prev) => ({
        rpm: +(prev.rpm + (Math.random() - 0.48) * 1.2).toFixed(1),
        lat: Math.round(
          prev.lat + (Math.random() - 0.5) * 8 + (inSpike ? 12 : 0),
        ),
        err: +Math.max(
          0,
          prev.err + (Math.random() - 0.5) * 0.03 + (inSpike ? 0.04 : 0),
        ).toFixed(2),
        uptime: +Math.min(
          100,
          Math.max(99.9, prev.uptime + (Math.random() - 0.5) * 0.005),
        ).toFixed(2),
        bars: {
          rpm: [...prev.bars.rpm.slice(1), Math.round(40 + Math.random() * 55)],
          lat: [
            ...prev.bars.lat.slice(1),
            Math.round(28 + Math.random() * (inSpike ? 70 : 30)),
          ],
          err: [
            ...prev.bars.err.slice(1),
            Math.round(18 + Math.random() * (inSpike ? 55 : 20)),
          ],
          uptime: [
            ...prev.bars.uptime.slice(1),
            Math.round(88 + Math.random() * 10),
          ],
        },
      }))
      if (tick % 28 === 0 && !alertPausedRef.current) {
        setAlertIdx((a) => (a + 1) % AI_ALERTS.length)
        setAlertKey((k) => k + 1)
      }
    }, 800)
    return () => clearInterval(id)
  }, [])
  const { line: LINE_PATH, area: AREA_PATH } = buildPaths(latPts)
  const W = 600
  const spkX = (spikeIdx / (CHART_LEN - 1)) * W
  const spkY = latPts[spikeIdx]
  const alert = AI_ALERTS[alertIdx]
  const STAT_ROWS: {
    label: string
    val: number
    suffix: string
    places: (number | ".")[]
    bars: number[]
  }[] = [
    {
      label: "Requests / min",
      val: stats.rpm,
      suffix: "K",
      places: [10, 1, ".", 0.1],
      bars: stats.bars.rpm,
    },
    {
      label: "P95 latency",
      val: stats.lat,
      suffix: "ms",
      places: [100, 10, 1],
      bars: stats.bars.lat,
    },
    {
      label: "Error rate",
      val: stats.err,
      suffix: "%",
      places: [1, ".", 0.1, 0.01],
      bars: stats.bars.err,
    },
    {
      label: "Uptime",
      val: stats.uptime,
      suffix: "%",
      places: [10, 1, ".", 0.1, 0.01],
      bars: stats.bars.uptime,
    },
  ]
  return (
    <div className="[border-radius:16px] [overflow:hidden] [background:rgba(255,255,255,0.03)] [border:1px_solid_rgba(255,255,255,0.1)] [box-shadow:0_48px_120px_-32px_rgba(0,0,0,0.9),_inset_0_1px_0_rgba(255,255,255,0.05)]">
      {/* window chrome */}
      <div className="[display:flex] [align-items:center] [justify-content:space-between] [padding:12px_18px] [border-bottom:1px_solid_rgba(255,255,255,0.06)]">
        <div className="[display:flex] [align-items:center] [gap:10px]">
          <div className="[display:flex] [gap:5px]">
            {[0.25, 0.15, 0.1].map((o, i) => (
              <div
                key={i}
                style={{
                  background: `rgba(255,255,255,${o})`,
                }}
                className="[width:9px] [height:9px] [border-radius:50%]"
              />
            ))}
          </div>
          <span className="[font-family:Geist_Mono,_monospace] [font-size:11px] [color:rgba(255,255,255,0.35)] [margin-left:6px]">
            sherlock · ecommerce / production
          </span>
        </div>
        <div className="[display:flex] [align-items:center] [gap:6px]">
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="[width:6px] [height:6px] [border-radius:50%] [background:#fff]"
          />
          <span className="[font-family:Geist_Mono,_monospace] [font-size:10px] [letter-spacing:0.14em] [color:rgba(255,255,255,0.4)] [text-transform:uppercase]">
            Live
          </span>
        </div>
      </div>

      {/* chart area */}
      <div className="[position:relative] [padding:20px_20px_10px]">
        <span className="[position:absolute] [top:20px] [left:20px] [font-family:Geist_Mono,_monospace] [font-size:10px] [letter-spacing:0.08em] [text-transform:uppercase] [color:rgba(255,255,255,0.28)] [z-index:2]">
          P95 latency · last 60s
        </span>

        <svg
          ref={svgRef}
          viewBox="0 0 600 220"
          preserveAspectRatio="none"
          onMouseMove={(e) => {
            const svg = svgRef.current
            if (!svg) return
            const rect = svg.getBoundingClientRect()
            const fracX = Math.max(
              0,
              Math.min(1, (e.clientX - rect.left) / rect.width),
            )
            const idx = Math.round(fracX * (CHART_LEN - 1))
            setCursor({ svgX: fracX * W, idx, val: latPts[idx] })
          }}
          onMouseLeave={() => setCursor(null)}
          className="[width:100%] [height:clamp(160px,_24vw,_220px)] [display:block] [cursor:crosshair]"
        >
          <defs>
            <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          {[44, 88, 132, 176].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="600"
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />
          ))}
          <path
            d={AREA_PATH}
            fill="url(#hero-area)"
            className="[transition:d_0.7s_ease]"
          />
          <path
            d={LINE_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="[transition:d_0.7s_ease]"
          />
          <circle
            cx={spkX}
            cy={spkY}
            r="4"
            fill="#fff"
            className="[transition:cx_0.7s_ease,_cy_0.7s_ease]"
          />
          <motion.circle
            cx={spkX}
            cy={spkY}
            r="4"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            animate={{ r: [4, 18], opacity: [0.7, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          />
          {cursor && (
            <g>
              <line
                x1={cursor.svgX}
                y1="0"
                x2={cursor.svgX}
                y2="220"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <circle
                cx={cursor.svgX}
                cy={cursor.val}
                r="4"
                fill="#000"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <g
                transform={`translate(${
                  cursor.svgX > 470 ? cursor.svgX - 110 : cursor.svgX + 10
                },${Math.max(6, cursor.val - 36)})`}
              >
                <rect
                  width="100"
                  height="28"
                  rx="5"
                  fill="rgba(8,8,10,0.96)"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                />
                <text
                  x="9"
                  y="11"
                  fill="rgba(255,255,255,0.35)"
                  fontSize="8"
                  fontFamily="Geist Mono, monospace"
                  letterSpacing="0.07em"
                >
                  P95 LATENCY
                </text>
                <text
                  x="9"
                  y="23"
                  fill="#fff"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="Geist Mono, monospace"
                >
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
            border: `1px solid ${
              alertPaused ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"
            }`,
          }}
          className="[position:absolute] [right:20px] [top:16px] [max-width:220px] [background:rgba(8,8,10,0.95)] [backdrop-filter:blur(12px)] [border-radius:10px] [padding:11px_13px] [cursor:default] [transition:border-color_0.2s_ease]"
        >
          <div className="[display:flex] [align-items:center] [gap:6px] [margin-bottom:6px]">
            <Brain size={12} className="[color:rgba(255,255,255,0.8)]" />
            <span className="[font-size:11px] [font-weight:600] [color:#fff] [letter-spacing:-0.005em]">
              AI root cause
            </span>
            <span className="[margin-left:auto] [font-family:Geist_Mono,_monospace] [font-size:10px] [color:rgba(255,255,255,0.4)]">
              {alert.conf}
            </span>
          </div>
          <p className="[font-size:11px] [color:rgba(255,255,255,0.5)] [line-height:1.6] [margin:0]">
            {alert.msg.split(alert.svc).map((part, pi) =>
              pi === 0 ? (
                <span key={pi}>
                  {part}
                  <span className="[color:rgba(255,255,255,0.85)]">
                    {alert.svc}
                  </span>
                </span>
              ) : (
                <span key={pi}>{part}</span>
              ),
            )}
          </p>
        </motion.div>
      </div>

      {/* stat tiles */}
      <div className="grid grid-cols-2 min-[621px]:grid-cols-4 max-[620px]:[&>div:nth-child(2)]:border-r-0 max-[620px]:[&>div:nth-child(-n+2)]:border-b max-[620px]:[&>div:nth-child(-n+2)]:border-white/[0.07] [border-top:1px_solid_rgba(255,255,255,0.06)]">
        {STAT_ROWS.map((s, i) => {
          const hov = hoveredStat === i
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
              onMouseEnter={() => setHoveredStat(i)}
              onMouseLeave={() => setHoveredStat(null)}
              className={[
                "[padding:16px_18px] [cursor:default] [transition:background_0.15s_ease]",
                i < 3
                  ? "[border-right:1px_solid_rgba(255,255,255,0.06)]"
                  : "[border-right:none]",
                hov
                  ? "[background:rgba(255,255,255,0.03)]"
                  : "[background:transparent]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div
                className={[
                  "[font-size:10px] [letter-spacing:0.06em] [text-transform:uppercase] [margin-bottom:10px] [white-space:nowrap] [transition:color_0.15s]",
                  hov
                    ? "[color:rgba(255,255,255,0.55)]"
                    : "[color:rgba(255,255,255,0.3)]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {s.label}
              </div>
              <div className="[display:flex] [align-items:flex-end] [justify-content:space-between] [gap:8px]">
                <div className="[display:flex] [align-items:flex-end] [line-height:1] [font-family:Geist_Mono,_monospace]">
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
                  <span className="[font-size:13px] [color:rgba(255,255,255,0.5)] [margin-left:2px] [padding-bottom:1px]">
                    {s.suffix}
                  </span>
                </div>
                <div className="[display:flex] [gap:2px] [align-items:flex-end] [height:24px]">
                  {s.bars.map((h, j) => (
                    <div
                      key={j}
                      style={{
                        height: `${h}%`,
                      }}
                      className={[
                        "[width:3px] [border-radius:2px] [transition:height_0.5s_ease]",
                        j === s.bars.length - 1
                          ? "[background:rgba(255,255,255,0.85)]"
                          : "[background:rgba(255,255,255,0.18)]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
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
        { k: "incident", v: '"INC-094"', c: "rgba(255,255,255,0.55)" },
        { k: "confidence", v: '"91%"', c: "#fff" },
        { k: "rootCause", v: '"HikariCP pool exhausted"', c: "#fff" },
        {
          k: "deploy",
          v: '"payment-service v2.14.1"',
          c: "rgba(255,255,255,0.6)",
        },
        { k: "fix", v: '"add index + pool ×2.4"', c: "rgba(255,255,255,0.5)" },
        { k: "blast", v: '["checkout", "cart"]', c: "rgba(255,255,255,0.4)" },
      ]
      return (
        <div className="[font-family:Geist_Mono,_monospace] [font-size:12.5px] [line-height:2] [padding:4px_0]">
          <div className="[font-size:9px] [letter-spacing:0.08em] [text-transform:uppercase] [color:rgba(255,255,255,0.22)] [margin-bottom:12px]">
            AI ANALYSIS · INC-094
          </div>
          {lines.map(({ k, v, c }, i) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.25 }}
              className="[display:flex] [gap:8px]"
            >
              <span className="[color:rgba(255,255,255,0.32)] [min-width:90px]">
                {k}
              </span>
              <span className="[color:rgba(255,255,255,0.18)]">:</span>
              <span style={{ color: c }}>{v}</span>
            </motion.div>
          ))}
        </div>
      )
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
        { svc: "api-gateway", pct: 12, ms: "18ms", ok: true },
        { svc: "payment-svc", pct: 94, ms: "28.4s", ok: false },
        { svc: "redis-cache", pct: 4, ms: "0.3ms", ok: true },
        { svc: "db-primary", pct: 88, ms: "26.1s", ok: false },
        { svc: "notification", pct: 6, ms: "9ms", ok: true },
      ]
      return (
        <div className="[font-family:Geist_Mono,_monospace] [font-size:11px]">
          <div className="[font-size:9px] [letter-spacing:0.08em] [text-transform:uppercase] [color:rgba(255,255,255,0.22)] [margin-bottom:14px]">
            TRACE · T-7f3a92 · 28.4s total
          </div>
          {spans.map((s, i) => (
            <motion.div
              key={s.svc}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.25 }}
              className="[display:flex] [align-items:center] [gap:10px] [margin-bottom:10px]"
            >
              <span className="[color:rgba(255,255,255,0.28)] [width:92px] [flex-shrink:0] [font-size:10px]">
                {s.svc}
              </span>
              <div className="[flex:1] [height:5px] [background:rgba(255,255,255,0.06)] [border-radius:3px] [overflow:hidden]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{
                    delay: 0.15 + i * 0.08,
                    duration: 0.7,
                    ease: "easeOut",
                  }}
                  className={[
                    "[height:100%] [border-radius:3px]",
                    s.ok
                      ? "[background:rgba(255,255,255,0.5)]"
                      : "[background:rgba(239,68,68,0.65)]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              </div>
              <span
                className={[
                  "[width:38px] [text-align:right] [flex-shrink:0] [font-size:10px]",
                  s.ok ? "[color:rgba(255,255,255,0.28)]" : "[color:#f87171]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {s.ms}
              </span>
            </motion.div>
          ))}
        </div>
      )
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
        {
          sev: "P0",
          label: "DB connection pool exhausted",
          svc: "payment-service",
          active: true,
        },
        {
          sev: "P3",
          label: "CPU spike on worker node",
          svc: "k8s-worker-02",
          active: false,
        },
        {
          sev: "P3",
          label: "Memory warning threshold hit",
          svc: "cart-service",
          active: false,
        },
        {
          sev: "P2",
          label: "Error rate > 5%",
          svc: "checkout-api",
          active: false,
        },
        {
          sev: "P3",
          label: "Disk I/O above baseline",
          svc: "db-primary",
          active: false,
        },
      ]
      return (
        <div className="[font-family:Geist_Mono,_monospace] [font-size:11px]">
          <div className="[font-size:9px] [letter-spacing:0.08em] [text-transform:uppercase] [color:rgba(255,255,255,0.22)] [margin-bottom:14px]">
            ALERT FEED · 400 → 12 ACTIONABLE
          </div>
          {alerts.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: a.active ? 1 : 0.28, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.25 }}
              className={[
                "[display:flex] [align-items:center] [gap:9px] [margin-bottom:9px]",
                a.active ? "[opacity:1]" : "[opacity:0.28]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {a.active ? (
                <motion.div
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                  className="[width:5px] [height:5px] [border-radius:50%] [background:#fff] [flex-shrink:0]"
                />
              ) : (
                <div className="[width:5px] [height:5px] [border-radius:50%] [background:rgba(255,255,255,0.2)] [flex-shrink:0]" />
              )}
              <span
                className={[
                  "[font-size:9px] [width:18px] [flex-shrink:0]",
                  a.active
                    ? "[color:rgba(255,255,255,0.5)]"
                    : "[color:rgba(255,255,255,0.3)]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {a.sev}
              </span>
              <span
                className={[
                  "[flex:1] [font-size:11px]",
                  a.active ? "[color:#fff]" : "[color:rgba(255,255,255,0.35)]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {a.label}
              </span>
              {!a.active && (
                <span className="[font-size:9px] [color:rgba(255,255,255,0.18)] [letter-spacing:0.04em]">
                  suppressed
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )
    },
  },
  {
    id: "metrics",
    icon: BarChart3,
    label: "Metrics & SLOs",
    heading: "Your RED metrics, all in one view.",
    body: "Request rate, error rate, duration — plus SLO burn rate, infrastructure saturation, and custom dashboards. No tab switching between tools.",
    demo: () => {
      const bars = [28, 36, 31, 44, 38, 52, 45, 66, 50, 74, 58, 82]
      const slos = [
        { label: "Availability SLO", val: 99.94, target: 99.9, ok: true },
        { label: "Latency SLO (p95)", val: 98.1, target: 99.0, ok: false },
        {
          label: "Error budget",
          val: 72,
          target: 0,
          ok: true,
          suffix: "% remaining",
        },
      ]
      return (
        <div>
          <div className="[font-size:9px] [letter-spacing:0.08em] [text-transform:uppercase] [color:rgba(255,255,255,0.22)] [margin-bottom:12px] [font-family:Geist_Mono,_monospace]">
            REQUEST RATE · LAST 12H
          </div>
          <div className="[display:flex] [gap:3px] [align-items:flex-end] [height:52px] [margin-bottom:16px]">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{
                  delay: 0.05 + i * 0.04,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                className={[
                  "[flex:1] [border-radius:3px_3px_0_0]",
                  i === 11
                    ? "[background:rgba(255,255,255,0.85)]"
                    : "[background:rgba(255,255,255,0.14)]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            ))}
          </div>
          <div className="[display:flex] [justify-content:space-between] [font-family:Geist_Mono,_monospace] [font-size:9px] [color:rgba(255,255,255,0.2)] [margin-bottom:16px]">
            <span>p50 48ms</span>
            <span>p95 210ms</span>
            <span>p99 430ms</span>
          </div>
          {slos.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="[display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:8px] [font-size:11px] [font-family:Geist_Mono,_monospace]"
            >
              <span className="[color:rgba(255,255,255,0.38)]">{s.label}</span>
              <span
                className={[
                  "[font-weight:700]",
                  s.ok ? "[color:rgba(255,255,255,0.75)]" : "[color:#f87171]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {s.val}
                {s.suffix ?? "%"}
              </span>
            </motion.div>
          ))}
        </div>
      )
    },
  },
  {
    id: "anomaly",
    icon: Shield,
    label: "Anomaly Detection",
    heading: "Catch issues before your users do.",
    body: "Adaptive baselines learn your system's normal behavior automatically. Deviations surface instantly — no threshold tuning, no false positives from routine traffic spikes.",
    demo: () => {
      const vals = [20, 22, 19, 21, 23, 20, 22, 21, 20, 68, 76, 71]
      return (
        <div>
          <div className="[font-size:9px] [letter-spacing:0.08em] [text-transform:uppercase] [color:rgba(255,255,255,0.22)] [margin-bottom:12px] [font-family:Geist_Mono,_monospace]">
            ANOMALY DETECTION · ADAPTIVE BASELINE
          </div>
          <div className="[position:relative]">
            <div className="[display:flex] [gap:3px] [align-items:flex-end] [height:64px]">
              {vals.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{
                    delay: 0.05 + i * 0.05,
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                  className={[
                    "[flex:1] [border-radius:3px_3px_0_0]",
                    i >= 9
                      ? "[background:rgba(239,68,68,0.65)]"
                      : "[background:rgba(255,255,255,0.13)]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.75 }}
              className="[position:absolute] [right:0] [top:-28px] [background:rgba(239,68,68,0.1)] [border:1px_solid_rgba(239,68,68,0.4)] [border-radius:5px] [padding:3px_9px] [font-family:Geist_Mono,_monospace] [font-size:10px] [color:#f87171]"
            >
              ↑ anomaly detected
            </motion.div>
          </div>
          <div className="[display:flex] [justify-content:space-between] [font-family:Geist_Mono,_monospace] [font-size:9px] [color:rgba(255,255,255,0.2)] [margin-top:10px]">
            <span>baseline: 18–24</span>
            <span>current: 71</span>
            <span>+3.2σ deviation</span>
          </div>
        </div>
      )
    },
  },
]
/* ─── Feature showcase component ─── */
function FeaturesShowcase() {
  const [active, setActive] = useState("ai")
  const tab = FEATURE_TABS.find((t) => t.id === active)!
  const Demo = tab.demo
  return (
    <div className="relative isolate rounded-[14px] bg-white/[0.025] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[14px] before:p-px before:bg-[linear-gradient(180deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.06)_40%,rgba(255,255,255,0.03)_100%)] before:[mask-composite:exclude] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [display:grid] [grid-template-columns:220px_1fr] [overflow:hidden]">
      {/* left nav */}
      <div className="[border-right:1px_solid_rgba(255,255,255,0.06)] [padding:8px] [display:flex] [flex-direction:column] [background:rgba(255,255,255,0.015)]">
        {FEATURE_TABS.map((t) => (
          <button
            key={t.id}
            className={`flex w-full cursor-pointer items-center gap-2.5 rounded-[9px] border border-transparent bg-transparent px-3.5 py-[11px] text-left transition-all duration-150 hover:border-white/[0.06] hover:bg-white/[0.05] [&.active]:border-white/[0.12] [&.active]:bg-white/[0.07]${
              active === t.id ? " active" : ""
            }`}
            onClick={() => setActive(t.id)}
          >
            <t.icon
              size={14}
              className={[
                "[flex-shrink:0]",
                active === t.id
                  ? "[color:#fff]"
                  : "[color:rgba(255,255,255,0.35)]",
              ]
                .filter(Boolean)
                .join(" ")}
            />
            <span
              className={[
                "[font-size:12.5px] [font-weight:500] [letter-spacing:-0.005em]",
                active === t.id
                  ? "[color:#fff]"
                  : "[color:rgba(255,255,255,0.38)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
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
        className="[padding:36px_40px] [display:flex] [flex-direction:column] [gap:0]"
      >
        {/* heading block */}
        <div className="[margin-bottom:28px]">
          <div
            style={{
              ...S.iconBox(38),
            }}
            className="[margin-bottom:18px]"
          >
            <tab.icon size={17} className="[color:rgba(255,255,255,0.7)]" />
          </div>
          <h3 className="[font-size:clamp(18px,_2vw,_22px)] [font-weight:700] [color:#fff] [letter-spacing:-0.018em] [margin:0_0_10px] [line-height:1.25]">
            {tab.heading}
          </h3>
          <p
            style={{
              ...S.body,
            }}
            className="[font-size:13.5px] [margin:0] [max-width:480px]"
          >
            {tab.body}
          </p>
        </div>

        {/* live demo panel */}
        <div className="relative isolate rounded-[14px] bg-white/[0.025] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[14px] before:p-px before:bg-[linear-gradient(145deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.05)_35%,rgba(255,255,255,0.02)_55%,rgba(255,255,255,0.1)_100%)] before:[mask-composite:exclude] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] hover:before:bg-[linear-gradient(145deg,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0.1)_35%,rgba(255,255,255,0.05)_55%,rgba(255,255,255,0.22)_100%)] [padding:22px_24px] [flex:1]">
          <Demo />
        </div>
      </motion.div>
    </div>
  )
}
/* ─── Section wrapper ─── */
function Section({
  id,
  children,
  style,
}: {
  id?: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <section
      id={id}
      style={{
        ...style,
      }}
      className="[padding:100px_24px] [border-top:1px_solid_rgba(255,255,255,0.06)]"
    >
      <div className="[max-width:1160px] [margin:0_auto]">{children}</div>
    </section>
  )
}
/* ─── Section header ─── */
function SectionHead({
  label,
  heading,
  sub,
  center = true,
}: {
  label: string
  heading: React.ReactNode
  sub: string
  center?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55 }}
      className={[
        "[margin-bottom:56px]",
        center ? "[text-align:center]" : "[text-align:left]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span style={S.sectionLabel}>{label}</span>
      <h2 style={S.h2}>{heading}</h2>
      <p
        style={{
          ...S.body,
        }}
        className={[
          "[max-width:480px]",
          center ? "[margin:0_auto]" : "[margin:0]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {sub}
      </p>
    </motion.div>
  )
}
export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterStatus, setNewsletterStatus] =
    useState<"idle" | "success" | "error">("idle")
  const navigate = useNavigate()
  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail.trim())
    if (!valid) {
      setNewsletterStatus("error")
      return
    }
    setNewsletterStatus("success")
    setNewsletterEmail("")
  }
  return (
    <div className="dark [background:#000] [color:#fff] [min-height:100vh] [font-family:Geist,_sans-serif]">
      {/* ── Nav ── */}
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={NAV_ITEMS} />
          <div className="flex items-center gap-3">
            <NavbarButton href="/login" as="a" variant="secondary">
              Sign in
            </NavbarButton>
            <NavbarButton
              onClick={() => navigate("/register")}
              variant="primary"
            >
              Get started free
            </NavbarButton>
          </div>
        </NavBody>
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu
            isOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
          >
            {NAV_ITEMS.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                onClick={() => setMobileOpen(false)}
                className="relative text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-3">
              <NavbarButton
                href="/login"
                as="a"
                variant="secondary"
                className="w-full"
              >
                Sign in
              </NavbarButton>
              <NavbarButton
                onClick={() => {
                  navigate("/register")
                  setMobileOpen(false)
                }}
                variant="primary"
                className="w-full"
              >
                Get started free
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="[position:relative] [overflow:hidden]">
        <Aurora className="absolute inset-0" intensity="medium" />
        {/* dot grid */}
        <div className="[position:absolute] [inset:0] [z-index:0] [background-image:radial-gradient(circle,_rgba(255,255,255,0.055)_1px,_transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_90%_65%_at_50%_25%,_#000_30%,_transparent_80%)] [-webkit-mask-image:radial-gradient(ellipse_90%_65%_at_50%_25%,_#000_30%,_transparent_80%)]" />
        {/* perspective grid floor */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[420px] origin-bottom bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_top,rgba(0,0,0,0.55)_0%,transparent_70%)] [transform:perspective(600px)_rotateX(72deg)_scaleX(1.8)]" />

        {/* headline area */}
        <div className="[max-width:860px] [margin:0_auto] [padding:160px_24px_48px] [position:relative] [z-index:10] [text-align:center]">
          {/* badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="[display:flex] [justify-content:center] [margin-bottom:32px]"
          >
            <span
              style={{
                ...S.pill,
              }}
              className="[gap:8px] [padding:5px_14px]"
            >
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
                className="[width:6px] [height:6px] [border-radius:50%] [background:#fff] [flex-shrink:0]"
              />
              AI-powered observability · Now GA
            </span>
          </motion.div>

          {/* headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="[font-size:clamp(44px,_8vw,_96px)] [font-weight:800] [letter-spacing:-0.048em] [line-height:0.96] [margin:0_0_28px]"
          >
            Stop debugging
            <br />
            <GradientText from="#ffffff" via="#6b6b6b" to="#ffffff">
              in the dark.
            </GradientText>
          </motion.h1>

          {/* subcopy */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            style={{
              ...S.body,
            }}
            className="[max-width:540px] [margin:0_auto_16px] [font-size:clamp(15px,_1.8vw,_18px)]"
          >
            Sherlock connects your traces, logs, metrics, and deployments — then
            uses AI to find the root cause before your users notice anything is
            wrong.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="[font-size:clamp(14px,_1.6vw,_17px)] [font-weight:500] [color:rgba(255,255,255,0.55)] [letter-spacing:-0.005em] [margin-bottom:40px] [min-height:1.6em]"
          >
            Built for SRE teams who need{" "}
            <Typewriter
              phrases={[
                "instant root cause analysis.",
                "noise-free alerting.",
                "end-to-end tracing.",
                "AI-driven insights.",
                "faster incident resolution.",
              ]}
            />
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.45 }}
            className="[display:flex] [gap:10px] [flex-wrap:wrap] [justify-content:center] [margin-bottom:28px]"
          >
            <Link to="/register" className="[text-decoration:none]">
              <button
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.opacity = "0.82"
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.opacity = "1"
                }}
                className="[display:inline-flex] [align-items:center] [gap:7px] [font-size:14px] [font-weight:600] [letter-spacing:-0.003em] [color:#000] [background:#fff] [border:none] [border-radius:10px] [padding:12px_24px] [cursor:pointer] [transition:opacity_0.15s]"
              >
                Start for free <ArrowRight size={14} />
              </button>
            </Link>
            <a href="#modules" className="[text-decoration:none]">
              <button
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = "rgba(255,255,255,0.09)"
                  el.style.color = "#fff"
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = "rgba(255,255,255,0.05)"
                  el.style.color = "rgba(255,255,255,0.65)"
                }}
                className="[display:inline-flex] [align-items:center] [gap:6px] [font-size:14px] [font-weight:500] [letter-spacing:-0.003em] [color:rgba(255,255,255,0.65)] [background:rgba(255,255,255,0.05)] [border:1px_solid_rgba(255,255,255,0.1)] [border-radius:10px] [padding:11px_22px] [cursor:pointer] [transition:all_0.15s]"
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
            className="[display:flex] [align-items:center] [justify-content:center] [gap:24px] [flex-wrap:wrap]"
          >
            {[
              "No credit card",
              "Free for 3 services",
              "OpenTelemetry native",
            ].map((t) => (
              <div
                key={t}
                className="[display:flex] [align-items:center] [gap:5px] [font-size:12px] [color:rgba(255,255,255,0.3)]"
              >
                <Check
                  size={11}
                  className="[color:rgba(255,255,255,0.4)] [flex-shrink:0]"
                />
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
          className="[max-width:1080px] [margin:0_auto] [padding:0_24px_120px] [position:relative] [z-index:10]"
        >
          <HeroMonitor />
        </motion.div>
      </section>

      {/* ══════════════════ TRUSTED BY ══════════════════ */}
      <section className="[padding:0_24px_0] [border-top:1px_solid_rgba(255,255,255,0.06)] [overflow:hidden]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="[max-width:1160px] [margin:0_auto] [padding:40px_0]"
        >
          <p className="[text-align:center] [font-size:11px] [font-weight:600] [letter-spacing:0.12em] [text-transform:uppercase] [color:rgba(255,255,255,0.22)] [margin-bottom:28px]">
            Trusted by engineering teams at
          </p>
          <Marquee gap={48} pauseOnHover speed={28}>
            {TRUSTED_COMPANIES.map((name) => (
              <span
                key={name}
                className="[font-size:13px] [font-weight:600] [letter-spacing:-0.01em] [color:rgba(255,255,255,0.22)] [white-space:nowrap] [transition:color_0.2s] hover:[color:rgba(255,255,255,0.7)]"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </motion.div>
      </section>

      {/* ══════════════════ MODULES ══════════════════ */}
      <Section id="modules" className="[background:rgba(255,255,255,0.008)]">
        <SectionHead
          label="Everything in one place"
          heading="12 modules. One unified platform."
          sub="Every tool your on-call team needs — logs, traces, metrics, incidents, and AI — connected in one place. No tab switching between 5 different tools."
        />
        <div className="grid grid-cols-1 min-[421px]:grid-cols-2 min-[701px]:grid-cols-3 min-[1101px]:grid-cols-4 gap-3">
          {MODULES.map((mod, i) => (
            <motion.div
              key={mod.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.035, duration: 0.38 }}
              className="[height:100%]"
            >
              <Link
                to={mod.to}
                className="[text-decoration:none] [display:block] [height:100%]"
              >
                <CardSpotlight className="h-full overflow-hidden [padding:20px]">
                  <div className="[position:relative] [z-index:10] [height:100%] [display:flex] [flex-direction:column]">
                    <div className="[display:flex] [align-items:flex-start] [justify-content:space-between] [margin-bottom:14px]">
                      <div style={S.iconBox(34)}>
                        <mod.icon
                          size={15}
                          className="[color:rgba(255,255,255,0.6)]"
                        />
                      </div>
                      <ChevronRight
                        size={12}
                        className="[color:rgba(255,255,255,0.2)] [margin-top:3px]"
                      />
                    </div>
                    <p className="[font-size:13px] [font-weight:600] [color:#fff] [letter-spacing:-0.008em] [margin:0_0_6px]">
                      {mod.name}
                    </p>
                    <p className="[font-size:11.5px] [color:rgba(255,255,255,0.34)] [line-height:1.6] [margin:0]">
                      {mod.desc}
                    </p>
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
        <div className="[display:none]">
          {/* AI root cause — 2 col */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="[grid-column:span_2]"
          >
            <CardSpotlight className="relative overflow-hidden [padding:28px] [min-height:300px] [display:flex] [flex-direction:column] [justify-content:space-between]">
              <BorderBeam
                size={300}
                duration={9}
                colorFrom="transparent"
                colorTo="rgba(255,255,255,0.35)"
              />
              <div className="[position:relative] [z-index:10]">
                <div
                  style={{
                    ...S.iconBox(40),
                  }}
                  className="[margin-bottom:20px]"
                >
                  <Brain size={18} className="[color:rgba(255,255,255,0.7)]" />
                </div>
                <h3 className="[font-size:20px] [font-weight:700] [color:#fff] [letter-spacing:-0.015em] [margin:0_0_10px] [line-height:1.2]">
                  AI Root Cause Analysis
                </h3>
                <p
                  style={{
                    ...S.body,
                  }}
                  className="[max-width:360px] [font-size:13px]"
                >
                  Pinpoint the exact cause in seconds. Sherlock correlates
                  traces, logs, and deploys — no manual log diving.
                </p>
              </div>
              <motion.div
                style={{
                  ...S.codeBlock,
                }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.45 }}
                className="[position:relative] [z-index:10] [margin-top:24px]"
              >
                <div className="[font-size:9px] [letter-spacing:0.07em] [text-transform:uppercase] [color:rgba(255,255,255,0.28)] [margin-bottom:8px]">
                  AI analysis · INC-094
                </div>
                {[
                  { k: "confidence", v: '"91%"', c: "#fff" },
                  { k: "rootCause", v: '"HikariCP pool exhausted"', c: "#fff" },
                  {
                    k: "fix",
                    v: '"add index + pool ×2.4"',
                    c: "rgba(255,255,255,0.5)",
                  },
                  {
                    k: "blast",
                    v: '"payment-service"',
                    c: "rgba(255,255,255,0.5)",
                  },
                ].map(({ k, v, c }, idx) => (
                  <motion.div
                    key={k}
                    initial={{ opacity: 0, x: -6 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + idx * 0.1, duration: 0.3 }}
                    className="[display:flex] [gap:6px]"
                  >
                    <span className="[color:rgba(255,255,255,0.4)]">{k}</span>
                    <span className="[color:rgba(255,255,255,0.18)]">:</span>
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
            <CardSpotlight className="[padding:28px] [min-height:300px] [display:flex] [flex-direction:column] [justify-content:space-between]">
              <div className="[position:relative] [z-index:10]">
                <div
                  style={{
                    ...S.iconBox(40),
                  }}
                  className="[margin-bottom:18px]"
                >
                  <GitBranch
                    size={17}
                    className="[color:rgba(255,255,255,0.7)]"
                  />
                </div>
                <h3 className="[font-size:16px] [font-weight:700] [color:#fff] [letter-spacing:-0.012em] [margin:0_0_8px]">
                  Distributed Tracing
                </h3>
                <p
                  style={{
                    ...S.body,
                  }}
                  className="[font-size:12.5px]"
                >
                  Follow every request across service boundaries with waterfall
                  views.
                </p>
              </div>
              <div className="[position:relative] [z-index:10] [font-family:Geist_Mono,_monospace] [font-size:10px] [line-height:1.6] [margin-top:20px]">
                {[
                  { svc: "api-gateway", pct: 15, ms: "23ms", ok: true },
                  { svc: "payment-svc", pct: 95, ms: "30.1s", ok: false },
                  { svc: "redis-cache", pct: 5, ms: "0.3ms", ok: true },
                ].map((r, i) => (
                  <div
                    key={r.svc}
                    className="[display:flex] [align-items:center] [gap:8px] [margin-bottom:8px]"
                  >
                    <span className="[color:rgba(255,255,255,0.28)] [width:70px] [flex-shrink:0] [font-size:9px]">
                      {r.svc}
                    </span>
                    <div className="[flex:1] [height:4px] [background:rgba(255,255,255,0.06)] [border-radius:2px] [overflow:hidden]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${r.pct}%` }}
                        viewport={{ once: true }}
                        transition={{
                          delay: 0.25 + i * 0.15,
                          duration: 0.65,
                          ease: "easeOut",
                        }}
                        className={[
                          "[height:100%] [border-radius:2px]",
                          r.ok
                            ? "[background:rgba(255,255,255,0.5)]"
                            : "[background:rgba(255,80,80,0.6)]",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />
                    </div>
                    <span
                      className={[
                        "[width:32px] [text-align:right] [flex-shrink:0] [font-size:9px]",
                        r.ok
                          ? "[color:rgba(255,255,255,0.3)]"
                          : "[color:#ff8080]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {r.ms}
                    </span>
                  </div>
                ))}
              </div>
            </CardSpotlight>
          </motion.div>

          {/* Row 2: 3 equal cards */}
          {[
            {
              icon: Bell,
              title: "Noise-Free Alerting",
              desc: "ML-powered alert correlation suppresses duplicates and noise automatically.",
              delay: 0,
              content: (
                <div className="[font-family:Geist_Mono,_monospace] [font-size:10px] [margin-top:18px]">
                  {[
                    { label: "P0 · DB timeout", on: true },
                    { label: "P3 · CPU spike", on: false },
                    { label: "P3 · Mem warn", on: false },
                  ].map((a, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.18 + i * 0.12, duration: 0.3 }}
                      className={[
                        "[display:flex] [align-items:center] [gap:7px] [margin-bottom:8px]",
                        a.on ? "[opacity:1]" : "[opacity:0.3]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {a.on ? (
                        <motion.div
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ repeat: Infinity, duration: 1.4 }}
                          className="[width:5px] [height:5px] [border-radius:50%] [background:#fff] [flex-shrink:0]"
                        />
                      ) : (
                        <div className="[width:5px] [height:5px] [border-radius:50%] [background:rgba(255,255,255,0.2)] [flex-shrink:0]" />
                      )}
                      <span
                        className={[
                          "[flex:1] [font-size:11px]",
                          a.on
                            ? "[color:#fff]"
                            : "[color:rgba(255,255,255,0.45)]",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {a.label}
                      </span>
                      {!a.on && (
                        <span className="[font-size:9px] [color:rgba(255,255,255,0.2)] [letter-spacing:0.04em]">
                          suppressed
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              ),
            },
            {
              icon: BarChart3,
              title: "Unified Metrics",
              desc: "RED metrics, SLOs, and dashboards — one place, no tab switching.",
              delay: 0.08,
              content: (
                <div className="[margin-top:18px]">
                  <div className="[display:flex] [gap:2px] [align-items:flex-end] [height:40px]">
                    {[30, 45, 38, 52, 41, 60, 48, 72, 55, 80, 62, 78].map(
                      (h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{
                            delay: 0.12 + i * 0.04,
                            duration: 0.45,
                            ease: "easeOut",
                          }}
                          className={[
                            "[flex:1] [border-radius:2px_2px_0_0]",
                            i === 11
                              ? "[background:rgba(255,255,255,0.85)]"
                              : "[background:rgba(255,255,255,0.13)]",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        />
                      ),
                    )}
                  </div>
                  <div className="[display:flex] [justify-content:space-between] [margin-top:8px] [font-family:Geist_Mono,_monospace] [font-size:9px] [color:rgba(255,255,255,0.2)]">
                    <span>p50 48ms</span>
                    <span>p95 210ms</span>
                    <span>p99 430ms</span>
                  </div>
                </div>
              ),
            },
            {
              icon: Shield,
              title: "Anomaly Detection",
              desc: "Adaptive baselines surface anomalies faster than static thresholds.",
              delay: 0.16,
              content: (
                <div className="[margin-top:18px] [position:relative]">
                  <div className="[display:flex] [gap:2px] [align-items:flex-end] [height:40px]">
                    {[20, 22, 19, 21, 23, 20, 22, 21, 20, 68, 72, 65].map(
                      (h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{
                            delay: 0.12 + i * 0.04,
                            duration: 0.45,
                            ease: "easeOut",
                          }}
                          className={[
                            "[flex:1] [border-radius:2px_2px_0_0]",
                            i >= 9
                              ? "[background:rgba(255,80,80,0.7)]"
                              : "[background:rgba(255,255,255,0.12)]",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        />
                      ),
                    )}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.75, duration: 0.3 }}
                    className="[position:absolute] [right:0] [top:-20px] [background:rgba(255,50,50,0.1)] [border:1px_solid_rgba(255,50,50,0.35)] [border-radius:4px] [padding:2px_7px] [font-family:Geist_Mono,_monospace] [font-size:9px] [color:#ff7070]"
                  >
                    ↑ anomaly detected
                  </motion.div>
                  <div className="[font-family:Geist_Mono,_monospace] [font-size:9px] [color:rgba(255,255,255,0.2)] [margin-top:8px]">
                    adaptive baseline · last 24h
                  </div>
                </div>
              ),
            },
          ].map(({ icon: Icon, title, desc, delay, content }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay, duration: 0.5 }}
            >
              <CardSpotlight className="[padding:24px] [min-height:240px] [display:flex] [flex-direction:column]">
                <div className="[position:relative] [z-index:10] [display:flex] [flex-direction:column] [height:100%]">
                  <div
                    style={{
                      ...S.iconBox(36),
                    }}
                    className="[margin-bottom:16px]"
                  >
                    <Icon
                      size={15}
                      className="[color:rgba(255,255,255,0.65)]"
                    />
                  </div>
                  <h3 className="[font-size:14px] [font-weight:700] [color:#fff] [letter-spacing:-0.01em] [margin:0_0_6px]">
                    {title}
                  </h3>
                  <p
                    style={{
                      ...S.body,
                    }}
                    className="[font-size:12px] [margin:0]"
                  >
                    {desc}
                  </p>
                  <div className="[flex:1]">{content}</div>
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
            <CardSpotlight className="[padding:24px] [min-height:220px] [display:flex] [flex-direction:column]">
              <div className="[position:relative] [z-index:10]">
                <div
                  style={{
                    ...S.iconBox(36),
                  }}
                  className="[margin-bottom:16px]"
                >
                  <Server
                    size={15}
                    className="[color:rgba(255,255,255,0.65)]"
                  />
                </div>
                <h3 className="[font-size:14px] [font-weight:700] [color:#fff] [letter-spacing:-0.01em] [margin:0_0_6px]">
                  Dependency Graph
                </h3>
                <p
                  style={{
                    ...S.body,
                  }}
                  className="[font-size:12px] [margin:0_0_16px]"
                >
                  Real-time topology — understand blast radius instantly.
                </p>
                <div className="[font-family:Geist_Mono,_monospace] [font-size:10px]">
                  {[
                    { from: "api-gateway", to: "payment-svc", ok: false },
                    { from: "payment-svc", to: "db-primary", ok: false },
                    { from: "api-gateway", to: "auth-svc", ok: true },
                  ].map((edge, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.12 + i * 0.1, duration: 0.3 }}
                      className="[display:flex] [align-items:center] [gap:5px] [margin-bottom:7px]"
                    >
                      <span
                        className={[
                          edge.ok
                            ? "[color:rgba(255,255,255,0.2)]"
                            : "[color:rgba(255,255,255,0.65)]",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {edge.from}
                      </span>
                      <motion.span
                        animate={edge.ok ? {} : { opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.6 }}
                        className={[
                          edge.ok
                            ? "[color:rgba(255,255,255,0.12)]"
                            : "[color:rgba(255,255,255,0.5)]",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        →
                      </motion.span>
                      <span
                        className={[
                          edge.ok
                            ? "[color:rgba(255,255,255,0.2)]"
                            : "[color:rgba(255,255,255,0.65)]",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {edge.to}
                      </span>
                      <span
                        className={[
                          "[margin-left:auto]",
                          edge.ok
                            ? "[color:rgba(255,255,255,0.3)]"
                            : "[color:#ff8080]",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {edge.ok ? "✔" : "✘"}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardSpotlight>
          </motion.div>

          {/* Integrations — 2 col */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="[grid-column:span_2]"
          >
            <CardSpotlight className="[padding:24px] [min-height:220px] [display:flex] [flex-direction:column] [justify-content:space-between]">
              <div className="[position:relative] [z-index:10]">
                <div
                  style={{
                    ...S.iconBox(36),
                  }}
                  className="[margin-bottom:16px]"
                >
                  <Activity
                    size={15}
                    className="[color:rgba(255,255,255,0.65)]"
                  />
                </div>
                <h3 className="[font-size:16px] [font-weight:700] [color:#fff] [letter-spacing:-0.012em] [margin:0_0_8px]">
                  Native Integrations
                </h3>
                <p
                  style={{
                    ...S.body,
                  }}
                  className="[font-size:13px] [margin:0_0_24px]"
                >
                  PagerDuty, Slack, OpsGenie, Prometheus, Grafana, and the major
                  cloud providers — connected out of the box.
                </p>
              </div>
              <div className="[position:relative] [z-index:10]">
                <Marquee gap={10} pauseOnHover>
                  {[
                    "PagerDuty",
                    "Slack",
                    "OpsGenie",
                    "Prometheus",
                    "Grafana",
                    "AWS",
                    "GCP",
                    "Azure",
                    "Datadog",
                    "OpenTelemetry",
                    "Kubernetes",
                  ].map((name) => (
                    <span
                      key={name}
                      className="[font-size:11px] [font-weight:500] [padding:4px_12px] [border-radius:99px] [background:rgba(255,255,255,0.04)] [border:1px_solid_rgba(255,255,255,0.09)] [color:rgba(255,255,255,0.45)] [white-space:nowrap] [display:inline-block]"
                    >
                      {name}
                    </span>
                  ))}
                </Marquee>
              </div>
            </CardSpotlight>
          </motion.div>
        </div>
        {/* end dead zone */}
      </Section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <Section id="how-it-works">
        <SectionHead
          label="How it works"
          heading={
            <>
              Three steps to full{" "}
              <GradientText from="#fff" via="#888" to="#fff">
                observability.
              </GradientText>
            </>
          }
          sub="Connect your first service in under 20 minutes. No complex configuration, no vendor lock-in — just clear visibility into what your system is doing."
        />

        <TracingBeam>
          <div className="[display:flex] [flex-direction:column] [gap:64px]">
            {HOW_IT_WORKS.map((step) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: 0.1,
                  duration: 0.55,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="grid grid-cols-1 min-[701px]:grid-cols-2 gap-6 min-[701px]:gap-12 items-center pl-4 min-[701px]:pl-12"
              >
                <div>
                  <div className="[display:flex] [align-items:center] [gap:14px] [margin-bottom:20px]">
                    <div
                      style={{
                        ...S.iconBox(44),
                      }}
                      className="[border-radius:12px]"
                    >
                      <step.icon
                        size={18}
                        className="[color:rgba(255,255,255,0.7)]"
                      />
                    </div>
                    <span className="[font-size:40px] [font-weight:800] [color:rgba(255,255,255,0.14)] [letter-spacing:-0.04em] [font-family:Geist_Mono,_monospace]">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="[font-size:19px] [font-weight:600] [color:#fff] [letter-spacing:-0.012em] [margin:0_0_12px]">
                    {step.title}
                  </h3>
                  <p
                    style={{
                      ...S.body,
                    }}
                    className="[font-size:14px] [margin:0]"
                  >
                    {step.desc}
                  </p>
                </div>

                <div
                  style={{
                    ...S.codeBlock,
                  }}
                  className="[color:rgba(255,255,255,0.55)] [overflow-x:auto]"
                >
                  {step.code.split("\n").map((line, j) => {
                    const isComment =
                      line.startsWith("#") || line.startsWith("//")
                    const hasColon =
                      line.includes(":") &&
                      !line.startsWith("$") &&
                      !line.startsWith("✔")
                    return (
                      <div
                        key={j}
                        className="[white-space:pre] [line-height:1.8]"
                      >
                        {isComment ? (
                          <span className="[color:rgba(255,255,255,0.28)]">
                            {line}
                          </span>
                        ) : hasColon ? (
                          <>
                            <span className="[color:rgba(255,255,255,0.55)]">
                              {line.split(":")[0]}
                            </span>
                            <span className="[color:rgba(255,255,255,0.25)]">
                              :
                            </span>
                            <span className="[color:rgba(255,255,255,0.38)]">
                              {line.split(":").slice(1).join(":")}
                            </span>
                          </>
                        ) : (
                          <span className="[color:rgba(255,255,255,0.65)]">
                            {line}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </TracingBeam>
      </Section>

      {/* ══════════════════ PLATFORM FACTS ══════════════════ */}
      <section className="[padding:72px_24px] [border-top:1px_solid_rgba(255,255,255,0.06)] [background:rgba(255,255,255,0.01)]">
        <div className="[max-width:960px] [margin:0_auto]">
          <p className="[text-align:center] [font-size:11px] [font-weight:600] [letter-spacing:0.12em] [text-transform:uppercase] [color:rgba(255,255,255,0.22)] [margin-bottom:48px]">
            By the numbers
          </p>
          <div className="[display:flex] [align-items:center] [justify-content:center] [gap:40px_80px] [flex-wrap:wrap]">
            {[
              { value: "6×", label: "Faster mean time to resolution" },
              { value: "<2 min", label: "Median AI diagnosis time" },
              { value: "97%", label: "On-call engineer satisfaction" },
              { value: "20 min", label: "Time to full observability" },
            ].map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="[text-align:center]"
              >
                <div className="[font-size:clamp(36px,_4vw,_56px)] [font-weight:800] [letter-spacing:-0.04em] [color:#fff] [line-height:1] [font-family:Geist_Mono,_monospace] [margin-bottom:10px]">
                  {value}
                </div>
                <p className="[font-size:12.5px] [color:rgba(255,255,255,0.3)] [margin:0] [max-width:140px]">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ WHY SHERLOCK — BENTO ══════════════════ */}
      <Section id="comparison" className="[background:rgba(255,255,255,0.008)]">
        <SectionHead
          label="Why Sherlock"
          heading={
            <>
              Not just another{" "}
              <GradientText from="#fff" via="#666" to="#fff">
                monitoring tool.
              </GradientText>
            </>
          }
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
          heading={
            <>
              Real results from{" "}
              <GradientText from="#fff" via="#888" to="#fff">
                real SRE teams.
              </GradientText>
            </>
          }
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
      <Section
        id="incident-flow"
        className="[background:rgba(255,255,255,0.005)]"
      >
        <SectionHead
          label="See it in action"
          heading="A real P0 incident, resolved in 9 minutes."
          sub="This is an actual incident flow showing exactly what happens from the moment Sherlock detects an anomaly to the post-mortem being drafted — automatically."
        />

        <div className="[max-width:680px] [margin:0_auto]">
          {[
            {
              t: "00:00",
              title: "Anomaly detected",
              detail:
                "P95 latency spike — payment-service — 1,240ms (baseline 212ms)",
              icon: Bell,
              tag: "AUTO-DETECTED",
            },
            {
              t: "00:14",
              title: "Traces correlated",
              detail:
                "23 affected traces linked. Span breakdown shows DB bottleneck in checkout flow.",
              icon: GitBranch,
              tag: "AI CORRELATION",
            },
            {
              t: "00:31",
              title: "Root cause identified",
              detail:
                "Missing index on orders.user_id introduced in migration 0048 — deployed 38 min ago.",
              icon: Brain,
              tag: "91% CONFIDENCE",
            },
            {
              t: "01:05",
              title: "On-call notified",
              detail:
                "PagerDuty alert with full context: blast radius, rootCause, suggested fix, and Slack thread.",
              icon: Bell,
              tag: "PAGERDUTY",
            },
            {
              t: "08:42",
              title: "Incident resolved",
              detail:
                "Index applied. p95 returned to 198ms. Post-mortem auto-drafted.",
              icon: Check,
              tag: "RESOLVED",
            },
          ].map((item, i) => (
            <motion.div
              key={item.t}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                delay: i * 0.12,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={[
                "[display:flex] [gap:20px]",
                i < 4 ? "[margin-bottom:0]" : "[margin-bottom:0]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* timeline stem */}
              <div className="[display:flex] [flex-direction:column] [align-items:center] [flex-shrink:0] [width:36px]">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.1 + i * 0.12,
                    duration: 0.3,
                    type: "spring",
                    stiffness: 280,
                  }}
                  style={{
                    border: `1px solid ${
                      i === 4
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(255,255,255,0.1)"
                    }`,
                  }}
                  className={[
                    "[width:36px] [height:36px] [border-radius:50%] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0]",
                    i === 4
                      ? "[background:rgba(255,255,255,0.08)]"
                      : "[background:rgba(255,255,255,0.04)]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <item.icon
                    size={14}
                    className={[
                      i === 4
                        ? "[color:#fff]"
                        : "[color:rgba(255,255,255,0.5)]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                </motion.div>
                {i < 4 && (
                  <motion.div
                    initial={{ scaleY: 0, originY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
                    className="[width:1px] [flex:1] [min-height:32px] [background:rgba(255,255,255,0.06)] [margin:6px_0]"
                  />
                )}
              </div>

              {/* content */}
              <div
                className={[
                  "[flex:1]",
                  i < 4 ? "[padding-bottom:24px]" : "[padding-bottom:0]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="[display:flex] [align-items:center] [gap:10px] [margin-bottom:6px]">
                  <span className="[font-family:Geist_Mono,_monospace] [font-size:10px] [font-weight:700] [color:rgba(255,255,255,0.25)] [letter-spacing:0.06em]">
                    {item.t}
                  </span>
                  <span className="[font-size:9px] [font-weight:600] [letter-spacing:0.08em] [text-transform:uppercase] [padding:2px_7px] [border-radius:4px] [background:rgba(255,255,255,0.04)] [border:1px_solid_rgba(255,255,255,0.08)] [color:rgba(255,255,255,0.3)]">
                    {item.tag}
                  </span>
                </div>
                <h4 className="[font-size:14px] [font-weight:700] [color:#fff] [letter-spacing:-0.01em] [margin:0_0_5px]">
                  {item.title}
                </h4>
                <p className="[font-size:12.5px] [color:rgba(255,255,255,0.4)] [line-height:1.65] [margin:0]">
                  {item.detail}
                </p>
              </div>
            </motion.div>
          ))}

          {/* total time badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.45 }}
            className="[text-align:center] [margin-top:36px]"
          >
            <div className="[display:inline-flex] [align-items:center] [gap:10px] [padding:10px_20px] [background:rgba(255,255,255,0.04)] [border:1px_solid_rgba(255,255,255,0.1)] [border-radius:10px]">
              <Clock size={13} className="[color:rgba(255,255,255,0.5)]" />
              <span className="[font-family:Geist_Mono,_monospace] [font-size:12px] [color:#fff] [font-weight:700]">
                8:42
              </span>
              <span className="[font-size:12px] [color:rgba(255,255,255,0.4)]">
                total time to resolution
              </span>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ══════════════════ SECURITY STRIP ══════════════════ */}
      <section className="[border-top:1px_solid_rgba(255,255,255,0.06)] [padding:56px_24px]">
        <p className="[text-align:center] [font-size:11px] [font-weight:600] [letter-spacing:0.12em] [text-transform:uppercase] [color:rgba(255,255,255,0.22)] [margin-bottom:32px]">
          Enterprise-ready security &amp; compliance
        </p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="[max-width:1000px] [margin:0_auto] [display:flex] [align-items:center] [gap:32px_64px] [flex-wrap:wrap] [justify-content:center]"
        >
          {[
            { icon: Lock, label: "SOC 2 Type II certified" },
            { icon: Globe, label: "GDPR compliant" },
            { icon: Shield, label: "End-to-end encryption" },
            { icon: Server, label: "99.99% uptime SLA" },
            { icon: Users, label: "RBAC & SSO support" },
          ].map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="[display:flex] [align-items:center] [gap:8px] [font-size:12.5px] [color:rgba(255,255,255,0.35)]"
            >
              <Icon
                size={13}
                className="[color:rgba(255,255,255,0.4)] [flex-shrink:0]"
              />
              {label}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════ PRICING ══════════════════ */}
      <Section id="pricing">
        <PricingSection
          plans={PRICING_PLANS.map((p) => ({
            ...p,
            btn: {
              ...p.btn,
              onClick: () =>
                navigate(p.name === "Enterprise" ? "/contact" : "/register"),
            },
          }))}
          heading="Simple, transparent pricing"
          description="Start free. Scale as your team grows. No surprise bills."
        />
      </Section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section className="[position:relative] [overflow:hidden] [border-top:1px_solid_rgba(255,255,255,0.06)]">
        <div className="[position:absolute] [inset:0] [z-index:0]">
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
        <div className="[position:absolute] [inset:0] [z-index:1] [background:radial-gradient(ellipse_80%_60%_at_50%_50%,_transparent_25%,_#000_95%)]" />

        <div className="[max-width:640px] [margin:0_auto] [text-align:center] [position:relative] [z-index:10] [padding:130px_24px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="[font-size:clamp(34px,_5vw,_64px)] [font-weight:700] [letter-spacing:-0.04em] [margin:0_0_18px] [line-height:1.05] [color:#fff]">
              Your next incident
              <br />
              <SquigglyText
                scale={[5, 8]}
                stepDuration={75}
                className="text-white"
              >
                resolved in minutes.
              </SquigglyText>
            </h2>
            <p
              style={{
                ...S.body,
              }}
              className="[font-size:16px] [max-width:460px] [margin:0_auto_36px]"
            >
              Connect your first service in 20 minutes and get AI-powered root
              cause analysis, real-time alerts, and full distributed tracing —
              all for free.
            </p>
            <Link to="/register" className="[text-decoration:none]">
              <button
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.opacity = "0.82"
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.opacity = "1"
                }}
                className="[display:inline-flex] [align-items:center] [gap:8px] [font-size:14px] [font-weight:600] [color:#000] [background:#fff] [border:none] [border-radius:10px] [padding:13px_26px] [cursor:pointer] [transition:opacity_0.15s]"
              >
                Start for free <ArrowRight size={14} />
              </button>
            </Link>
            <div className="[display:flex] [align-items:center] [justify-content:center] [gap:24px] [margin-top:28px] [flex-wrap:wrap]">
              {[
                { icon: Check, text: "No credit card required" },
                { icon: Shield, text: "Free for up to 3 services" },
                { icon: Zap, text: "Live in under 20 minutes" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="[display:flex] [align-items:center] [gap:5px] [font-size:12px] [color:rgba(255,255,255,0.28)]"
                >
                  <Icon size={11} className="[color:rgba(255,255,255,0.38)]" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="[border-top:1px_solid_rgba(255,255,255,0.06)] [position:relative]">
        <div className="[max-width:1160px] [margin:0_auto] [padding:64px_24px_0] [position:relative] [z-index:10]">
          <div className="grid grid-cols-1 min-[481px]:grid-cols-2 min-[901px]:grid-cols-[2fr_1fr_1fr_1fr] gap-y-10 gap-x-8 min-[901px]:gap-12">
            {/* brand */}
            <div>
              <Link
                to="/"
                className="[display:inline-flex] [align-items:center] [gap:9px] [margin-bottom:16px] [text-decoration:none]"
              >
                <div
                  style={{
                    ...S.iconBox(30),
                  }}
                  className="[border-radius:8px]"
                >
                  <Activity size={14} className="[color:#fff]" />
                </div>
                <span className="[font-size:16px] [font-weight:700] [color:#fff] [letter-spacing:-0.02em]">
                  Sherlock
                </span>
              </Link>
              <p className="[font-size:13px] [color:rgba(255,255,255,0.38)] [line-height:1.65] [margin:0_0_28px] [max-width:280px]">
                AI-powered observability for SRE teams. Stop debugging in the
                dark.
              </p>

              {/* newsletter */}
              <p className="[font-size:10px] [font-weight:600] [letter-spacing:0.09em] [text-transform:uppercase] [color:rgba(255,255,255,0.28)] [margin:0_0_10px]">
                Ship notes, monthly
              </p>
              {newsletterStatus === "success" ? (
                <div className="[display:flex] [align-items:center] [gap:8px] [max-width:300px] [margin-bottom:24px] [font-size:13px] [color:rgba(255,255,255,0.7)] [padding:9px_13px] [background:rgba(255,255,255,0.04)] [border:1px_solid_rgba(255,255,255,0.12)] [border-radius:9px]">
                  <Check size={13} className="[color:#fff] [flex-shrink:0]" />
                  You're subscribed — watch your inbox.
                </div>
              ) : (
                <div className="[margin-bottom:24px]">
                  <form
                    onSubmit={handleNewsletter}
                    noValidate
                    className="[display:flex] [gap:8px] [max-width:300px]"
                  >
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => {
                        setNewsletterEmail(e.target.value)
                        if (newsletterStatus === "error")
                          setNewsletterStatus("idle")
                      }}
                      placeholder="you@company.com"
                      aria-label="Email address"
                      style={{
                        border: `1px solid ${
                          newsletterStatus === "error"
                            ? "rgba(239,68,68,0.55)"
                            : "rgba(255,255,255,0.1)"
                        }`,
                      }}
                      onFocus={(e) => {
                        if (newsletterStatus !== "error")
                          e.currentTarget.style.borderColor =
                            "rgba(255,255,255,0.3)"
                      }}
                      onBlur={(e) => {
                        if (newsletterStatus !== "error")
                          e.currentTarget.style.borderColor =
                            "rgba(255,255,255,0.1)"
                      }}
                      className="[flex:1] [font-size:13px] [color:#fff] [padding:9px_12px] [background:rgba(255,255,255,0.04)] [border-radius:9px] [outline:none] [transition:border-color_0.15s]"
                    />
                    <button
                      type="submit"
                      className="[display:inline-flex] [align-items:center] [gap:5px] [flex-shrink:0] [font-size:13px] [font-weight:600] [color:#000] [background:#fff] [border:none] [border-radius:9px] [padding:9px_14px] [cursor:pointer] [transition:opacity_0.15s] hover:[opacity:0.82]"
                    >
                      Subscribe <ArrowRight size={12} />
                    </button>
                  </form>
                  {newsletterStatus === "error" && (
                    <p className="[font-size:11px] [color:#ef4444] [margin:7px_0_0] [display:flex] [align-items:center] [gap:4px]">
                      <XCircle size={10} /> Please enter a valid email.
                    </p>
                  )}
                </div>
              )}

              <a
                href="#"
                style={{
                  ...S.pill,
                }}
                className="[text-decoration:none] [gap:7px] [transition:border-color_0.15s] hover:[border-color:rgba(255,255,255,0.28)]"
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="[width:6px] [height:6px] [border-radius:50%] [background:#fff] [flex-shrink:0]"
                />
                All systems operational
              </a>
            </div>

            {/* link columns */}
            {[
              {
                title: "Product",
                links: [
                  "Overview",
                  "Incidents",
                  "Traces",
                  "Metrics",
                  "Pricing",
                  "Changelog",
                ],
              },
              {
                title: "Developers",
                links: [
                  "Documentation",
                  "API reference",
                  "OpenTelemetry",
                  "SDKs",
                  "Status",
                ],
              },
              {
                title: "Company",
                links: [
                  "About",
                  "Careers",
                  "Blog",
                  "Customers",
                  "Security",
                  "Contact",
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="[font-size:10px] [font-weight:600] [letter-spacing:0.09em] [text-transform:uppercase] [color:rgba(255,255,255,0.28)] [margin:0_0_16px]">
                  {col.title}
                </p>
                <ul className="[list-style:none] [margin:0] [padding:0] [display:flex] [flex-direction:column] [gap:12px]">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="[font-size:13px] [color:rgba(255,255,255,0.38)] [text-decoration:none] [transition:color_0.15s] hover:[color:#fff]"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* oversized wordmark */}
          <div className="[margin-top:64px] [overflow:hidden]">
            <div className="[font-size:clamp(60px,_14vw,_190px)] [font-weight:800] [letter-spacing:-0.05em] [line-height:0.88] [color:transparent] [-webkit-text-stroke:1px_rgba(255,255,255,0.07)] [user-select:none] [white-space:nowrap]">
              SHERLOCK
            </div>
          </div>

          {/* bottom bar */}
          <div className="[border-top:1px_solid_rgba(255,255,255,0.06)] [padding:22px_0_28px] [display:flex] [align-items:center] [justify-content:space-between] [flex-wrap:wrap] [gap:14px]">
            <div className="[display:flex] [align-items:center] [gap:20px] [flex-wrap:wrap]">
              <span className="[font-size:12px] [color:rgba(255,255,255,0.25)]">
                © 2026 Sherlock, Inc.
              </span>
              {["Privacy", "Terms", "Cookies"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="[font-size:12px] [color:rgba(255,255,255,0.25)] [text-decoration:none] [transition:color_0.15s] hover:[color:rgba(255,255,255,0.6)]"
                >
                  {link}
                </a>
              ))}
            </div>
            <div className="[display:flex] [align-items:center] [gap:8px]">
              {[
                { Icon: GitBranch, label: "GitHub" },
                { Icon: Network, label: "X" },
                { Icon: TerminalIcon, label: "Discord" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = "#fff"
                    el.style.background = "rgba(255,255,255,0.09)"
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = "rgba(255,255,255,0.4)"
                    el.style.background = "rgba(255,255,255,0.04)"
                  }}
                  className="[width:30px] [height:30px] [border-radius:7px] [display:flex] [align-items:center] [justify-content:center] [background:rgba(255,255,255,0.04)] [border:1px_solid_rgba(255,255,255,0.09)] [color:rgba(255,255,255,0.4)] [transition:all_0.15s]"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
