import { useState } from "react";
import { TrendingUp, TrendingDown, CheckCircle, Minus, AlertTriangle, ChevronRight } from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { motion } from "motion/react";
import { FadeIn } from "@/components/ui/FadeIn";
import { GlowCard } from "@/components/ui/GlowCard";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { BlurText } from "@/components/ui/BlurText";
import { GradientText } from "@/components/ui/GradientText";
import { useTheme } from "@/lib/theme";

const TF = ["15m", "1h", "6h", "24h", "7d"];

function mkErr(i: number) {
  const spike = i >= 13 && i <= 15;
  return Math.max(0.1, parseFloat((Math.random() * 1.5 + (spike ? 11.8 : 0.6)).toFixed(2)));
}
function mkLat(base: number, i: number, spike: boolean) {
  return Math.floor(Math.random() * 20 + base + (spike && i >= 13 && i <= 15 ? 130 : 0));
}
function mkRps(i: number) {
  const dayNorm = Math.sin((i / 24) * Math.PI) * 2800 + 2200;
  return Math.floor(dayNorm + Math.random() * 400 - 200);
}

const errData = Array.from({ length: 24 }, (_, i) => ({ t: `${i.toString().padStart(2,"0")}:00`, v: mkErr(i) }));
const latData = Array.from({ length: 24 }, (_, i) => ({ t: `${i.toString().padStart(2,"0")}:00`, p95: mkLat(62,i,true), p99: mkLat(98,i,true) }));
const rpsData = Array.from({ length: 24 }, (_, i) => ({ t: `${i.toString().padStart(2,"0")}:00`, v: mkRps(i) }));
const satData = Array.from({ length: 24 }, (_, i) => ({ t: `${i.toString().padStart(2,"0")}:00`, cpu: Math.floor(Math.random()*18+28+(i>=13&&i<=15?32:0)), mem: Math.floor(Math.random()*8+68) }));

const SERVICES = [
  { name: "payment-service",   health: "critical", err: 12.4, lat: 312,  rps: 1840 },
  { name: "order-service",     health: "degraded", err: 1.1,  lat: 94,   rps: 3201 },
  { name: "user-service",      health: "healthy",  err: 0.1,  lat: 28,   rps: 5820 },
  { name: "notification-svc",  health: "healthy",  err: 0.0,  lat: 15,   rps: 1240 },
  { name: "inventory-api",     health: "healthy",  err: 0.3,  lat: 45,   rps: 2100 },
  { name: "fraud-detection",   health: "healthy",  err: 0.0,  lat: 88,   rps: 890  },
  { name: "analytics-service", health: "healthy",  err: 0.2,  lat: 210,  rps: 540  },
];

const INCIDENTS = [
  { id: "INC-094", title: "Payment processing timeout spike — P95 latency >4s",      sev: "critical", ago: "12m ago", status: "open"          },
  { id: "INC-093", title: "PostgreSQL connection pool exhaustion on payment-service", sev: "high",     ago: "41m ago", status: "open"          },
  { id: "INC-092", title: "Order service 503s — downstream dependency timeout",       sev: "high",     ago: "2h ago",  status: "investigating"  },
  { id: "INC-091", title: "Auth JWT validation slow — Redis cache miss storm",        sev: "medium",   ago: "4h ago",  status: "resolved"       },
];

const DEPLOYMENTS = [
  { service: "payment-service",  version: "v2.14.1", status: "failed",      ago: "34m",  author: "alex.kim"  },
  { service: "order-service",    version: "v3.8.0",  status: "success",     ago: "1h",   author: "sam.chen"  },
  { service: "user-service",     version: "v1.22.4", status: "in-progress", ago: "2h",   author: "pat.lee"   },
  { service: "inventory-api",    version: "v2.3.0",  status: "success",     ago: "3h",   author: "jordan.wu" },
  { service: "fraud-detection",  version: "v1.9.2",  status: "success",     ago: "6h",   author: "riley.m"   },
];

const ENDPOINTS = [
  { ep: "POST /v1/payments/charge",  rate: "12.4%", rps: 184  },
  { ep: "GET /v1/orders/:id",        rate: "3.1%",  rps: 1205 },
  { ep: "POST /v1/auth/refresh",     rate: "1.8%",  rps: 892  },
  { ep: "PUT /v1/inventory/reserve", rate: "0.9%",  rps: 440  },
  { ep: "GET /v1/users/profile",     rate: "0.4%",  rps: 2340 },
  { ep: "POST /v1/notifications",    rate: "0.2%",  rps: 312  },
];

const KPI_ITEMS = [
  { label: "Requests / min",  value: 14832, display: "14,832", delta: "+8.2%",   up: true,  unit: "",   decimals: 0 },
  { label: "Error Rate",      value: 2.3,   display: "2.3",    delta: "+1.4pp",  up: false, unit: "%",  decimals: 1 },
  { label: "P95 Latency",     value: 183,   display: "183",    delta: "+44ms",   up: false, unit: "ms", decimals: 0 },
  { label: "P99 Latency",     value: 342,   display: "342",    delta: "+112ms",  up: false, unit: "ms", decimals: 0 },
  { label: "Apdex Score",     value: 0.84,  display: "0.84",   delta: "-0.08",   up: false, unit: "",   decimals: 2 },
  { label: "Active Services", value: 7,     display: "7",      delta: "stable",  up: true,  unit: "",   decimals: 0 },
  { label: "Open Incidents",  value: 3,     display: "3",      delta: "+1",      up: false, unit: "",   decimals: 0 },
  { label: "Deploys Today",   value: 5,     display: "5",      delta: "2 failed",up: false, unit: "",   decimals: 0 },
];

function SevBadge({ s }: { s: string }) {
  const c =
    s === "critical" || s === "high" ? { color: "var(--red)",    border: "var(--red-border)",    bg: "var(--red-bg)"    } :
    s === "medium"                   ? { color: "var(--yellow)", border: "var(--yellow-border)", bg: "var(--yellow-bg)" } :
                                       { color: "var(--blue)",   border: "var(--blue-border)",   bg: "var(--blue-bg)"   };
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, borderRadius: 6, padding: "1px 6px",
      border: `1px solid ${c.border}`, color: c.color, background: c.bg,
      letterSpacing: 0, textTransform: "capitalize",
    }}>{s}</span>
  );
}

function XIcon({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );
}

function ChartCard({ children, style, className, beamed }: { children: React.ReactNode; style?: React.CSSProperties; className?: string; beamed?: boolean }) {
  return (
    <div
      className={className}
      style={{ position: "relative", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", ...style }}
    >
      {beamed && <BorderBeam colorFrom="transparent" colorTo="rgba(0,112,243,0.5)" duration={10} />}
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [tf, setTf] = useState("1h");
  const { theme } = useTheme();
  const gridColor    = "var(--border)";
  const axisColor    = theme === "dark" ? "#444" : "#aaa";
  const stroke2Color = theme === "dark" ? "#555" : "#bbb";
  const errColor     = theme === "dark" ? "#f87171" : "#dc2626";
  const latColor     = theme === "dark" ? "#60a5fa" : "#2563eb";
  const rpsColor     = theme === "dark" ? "#4ade80" : "#16a34a";
  const cpuColor     = theme === "dark" ? "#fbbf24" : "#d97706";
  const memColor     = theme === "dark" ? "#a78bfa" : "#7c3aed";

  const Tip = ({ active, payload, label }: any) =>
    active && payload?.length ? (
      <div style={{
        padding: "8px 10px", borderRadius: 8, fontSize: 11,
        background: "var(--bg-3)", border: "1px solid var(--border-2)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      }}>
        <p style={{ fontFamily: "Geist Mono, monospace", marginBottom: 4, color: "var(--text-4)", fontSize: 10 }}>{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.stroke || p.fill, flexShrink: 0 }} />
            <span style={{ color: "var(--text-3)" }}>{p.name}</span>
            <span style={{ fontFamily: "Geist Mono, monospace", fontWeight: 600, marginLeft: "auto", color: "var(--text-1)" }}>{p.value}</span>
          </div>
        ))}
      </div>
    ) : null;

  return (
    <FadeIn>
      <div className="page-pad" style={{ maxWidth: 1600, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>
              <BlurText text="System Health" className="inline" />
            </h2>
            <span style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: 0 }}>E-Commerce Platform · production</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div className="hide-mobile" style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "Geist Mono, monospace",
              padding: "5px 10px", borderRadius: 6,
              border: "1px solid var(--green-border)", background: "var(--green-bg)", color: "var(--green)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} className="pulse-dot" />
              Live · {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 2, padding: 4, borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--border)" }}>
              {TF.map(t => (
                <button key={t} onClick={() => setTf(t)} style={{
                  padding: "3px 10px", borderRadius: 6, fontSize: 11,
                  fontFamily: "Geist Mono, monospace", fontWeight: 500,
                  background: tf === t ? "var(--text-1)" : "transparent",
                  color: tf === t ? "var(--bg)" : "var(--text-3)",
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI tiles — GlowCard + AnimatedCounter */}
        <div className="rg-kpi">
          {KPI_ITEMS.map(({ label, value, delta, up, unit, decimals }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.35, ease: "easeOut" }}
            >
              <GlowCard style={{ padding: "12px 14px" }}>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 8, letterSpacing: 0 }}>{label}</p>
                <p style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.025em", color: "var(--text-1)", lineHeight: 1, marginBottom: 6 }}>
                  <AnimatedCounter value={value} decimals={decimals} />
                  {unit && <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-3)", marginLeft: 2 }}>{unit}</span>}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: up ? "var(--green)" : "var(--red)" }}>
                  {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  <span style={{ fontFamily: "Geist Mono, monospace" }}>{delta}</span>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="rg-2-1">
          <ChartCard style={{ padding: 16 }} className="rg-span-2">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: 0 }}>Request Volume</span>
              <span style={{
                fontSize: 11, fontWeight: 500, borderRadius: 6, padding: "2px 8px",
                background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green)",
                fontFamily: "Geist Mono, monospace",
              }}>14,832 rpm</span>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={rpsData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={rpsColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={rpsColor} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: axisColor, fontFamily: "Geist Mono" }} interval={5} />
                <YAxis tick={{ fontSize: 9, fill: axisColor, fontFamily: "Geist Mono" }} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="v" name="req/min" stroke={rpsColor} strokeWidth={1.5} fill="url(#rg)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard style={{ padding: 16 }} beamed>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: 0 }}>Error Rate</span>
              <span style={{
                fontSize: 11, fontWeight: 500, borderRadius: 6, padding: "2px 8px",
                background: "var(--red-bg)", border: "1px solid var(--red-border)", color: "var(--red)",
                fontFamily: "Geist Mono, monospace",
              }}>2.3% avg</span>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={errData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={errColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={errColor} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: axisColor, fontFamily: "Geist Mono" }} interval={5} />
                <YAxis tick={{ fontSize: 9, fill: axisColor, fontFamily: "Geist Mono" }} />
                <Tooltip content={<Tip />} />
                <ReferenceLine y={5} stroke={errColor} strokeDasharray="3 3" strokeOpacity={0.4} />
                <Area type="monotone" dataKey="v" name="err %" stroke={errColor} strokeWidth={1.5} fill="url(#eg)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts row 2 */}
        <div className="rg-2">
          <ChartCard style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: 0 }}>Latency (ms)</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 16, height: 1, background: latColor }} />P95
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 16, height: 1, background: stroke2Color }} />P99
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={latData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: axisColor, fontFamily: "Geist Mono" }} interval={5} />
                <YAxis tick={{ fontSize: 9, fill: axisColor, fontFamily: "Geist Mono" }} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="p95" name="p95" stroke={latColor}     strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="p99" name="p99" stroke={stroke2Color} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: 0 }}>Infrastructure</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 16, height: 1, background: cpuColor }} />CPU
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 16, height: 1, background: memColor }} />Mem
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={satData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: axisColor, fontFamily: "Geist Mono" }} interval={5} />
                <YAxis tick={{ fontSize: 9, fill: axisColor, fontFamily: "Geist Mono" }} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="cpu" name="cpu %" stroke={cpuColor} strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="mem" name="mem %" stroke={memColor} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Bottom row */}
        <div className="rg-3">

          {/* Service Health */}
          <GlowCard style={{ padding: 16, borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Service Health</h2>
              <div style={{ display: "flex", gap: 8, fontSize: 11, fontFamily: "Geist Mono, monospace" }}>
                <span style={{ color: "var(--red)" }}>1 crit</span>
                <span style={{ color: "var(--text-4)" }}>·</span>
                <span style={{ color: "var(--yellow)" }}>1 deg</span>
                <span style={{ color: "var(--text-4)" }}>·</span>
                <span style={{ color: "var(--green)" }}>5 ok</span>
              </div>
            </div>
            <div>
              {SERVICES.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.25 }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 8px", borderRadius: 6, cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span className={s.health === "critical" ? "pulse-dot" : ""} style={{
                    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                    background: s.health === "critical" ? "var(--red)" : s.health === "degraded" ? "var(--yellow)" : "var(--green)",
                  }} />
                  <span style={{ fontSize: 13, fontFamily: "Geist Mono, monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-2)", letterSpacing: "-0.004em" }}>{s.name}</span>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", width: 56, textAlign: "right", color: "var(--text-4)" }}>{s.rps.toLocaleString()}/m</span>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", width: 36, textAlign: "right", color: s.err > 5 ? "var(--red)" : s.err > 0.5 ? "var(--yellow)" : "var(--text-4)" }}>{s.err}%</span>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", width: 44, textAlign: "right", color: "var(--text-4)" }}>{s.lat}ms</span>
                </motion.div>
              ))}
            </div>
          </GlowCard>

          {/* Active Incidents */}
          <div style={{ position: "relative", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", padding: 16 }}>
            <BorderBeam colorFrom="transparent" colorTo="rgba(229,72,77,0.5)" duration={8} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Active Incidents</h2>
              <span style={{
                fontSize: 11, fontWeight: 500, borderRadius: 6, padding: "2px 8px",
                background: "var(--red-bg)", border: "1px solid var(--red-border)", color: "var(--red)",
                fontFamily: "Geist Mono, monospace",
              }}>3 open</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {INCIDENTS.map((inc, i) => (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.3 }}
                  style={{
                    padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                    border: "1px solid var(--border)", transition: "border-color 0.15s, background 0.15s",
                    background: inc.status === "open" ? "var(--red-bg)" : "transparent",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-2)";
                    (e.currentTarget as HTMLDivElement).style.background = "var(--bg-3)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLDivElement).style.background = inc.status === "open" ? "var(--red-bg)" : "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{inc.id}</span>
                    <SevBadge s={inc.sev} />
                    <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>
                      {inc.status === "open" && <AlertTriangle size={10} style={{ color: "var(--red)" }} />}
                      {inc.ago}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-2)", letterSpacing: "-0.004em", margin: 0 }}>{inc.title}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Endpoints + Deployments */}
          <GlowCard style={{ padding: 16, borderRadius: 10 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: "0 0 12px" }}>
              Top Failing Endpoints
            </h2>
            <div style={{ marginBottom: 16 }}>
              {ENDPOINTS.map((ep, i) => (
                <div key={ep.ep} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 8px",
                  borderRadius: 6, cursor: "pointer", transition: "background 0.1s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", width: 14, color: "var(--text-4)" }}>{i + 1}</span>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-3)" }}>{ep.ep}</span>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{ep.rps}/m</span>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", fontWeight: 600, color: "var(--red)" }}>{ep.rate}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: "0 0 8px" }}>
                Recent Deployments
              </h2>
              {DEPLOYMENTS.map(d => (
                <div key={d.service} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0" }}>
                  {d.status === "success"
                    ? <CheckCircle size={12} style={{ color: "var(--green)", flexShrink: 0 }} />
                    : d.status === "failed"
                    ? <XIcon size={12} style={{ color: "var(--red)", flexShrink: 0 }} />
                    : <Minus size={12} style={{ color: "var(--blue)", flexShrink: 0 }} />}
                  <span style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-3)" }}>{d.service}</span>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{d.version}</span>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{d.ago}</span>
                </div>
              ))}
            </div>
          </GlowCard>

        </div>
      </div>
    </FadeIn>
  );
}
