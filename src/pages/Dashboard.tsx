import { useState } from "react";
import { TrendingUp, TrendingDown, CheckCircle, Minus, X, ArrowUpRight, Activity } from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { FadeIn } from "@/components/ui/FadeIn";
import { GlowCard } from "@/components/ui/GlowCard";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { BlurText } from "@/components/ui/BlurText";
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

const errData = Array.from({ length: 24 }, (_, i) => ({ t: `${i.toString().padStart(2, "0")}:00`, v: mkErr(i) }));
const latData = Array.from({ length: 24 }, (_, i) => ({ t: `${i.toString().padStart(2, "0")}:00`, p95: mkLat(62, i, true), p99: mkLat(98, i, true) }));
const rpsData = Array.from({ length: 24 }, (_, i) => ({ t: `${i.toString().padStart(2, "0")}:00`, v: mkRps(i) }));
const satData = Array.from({ length: 24 }, (_, i) => ({ t: `${i.toString().padStart(2, "0")}:00`, cpu: Math.floor(Math.random() * 18 + 28 + (i >= 13 && i <= 15 ? 32 : 0)), mem: Math.floor(Math.random() * 8 + 68) }));

const SERVICES = [
  { name: "payment-service",   health: "critical", err: 12.4, lat: 312,  rps: 1840 },
  { name: "order-service",     health: "degraded", err: 1.1,  lat: 94,   rps: 3201 },
  { name: "user-service",      health: "healthy",  err: 0.1,  lat: 28,   rps: 5820 },
  { name: "notification-svc",  health: "healthy",  err: 0.0,  lat: 15,   rps: 1240 },
  { name: "inventory-api",     health: "healthy",  err: 0.3,  lat: 45,   rps: 2100 },
  { name: "fraud-detection",   health: "healthy",  err: 0.0,  lat: 88,   rps: 890  },
  { name: "analytics-service", health: "healthy",  err: 0.2,  lat: 210,  rps: 540  },
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
  { label: "Requests / min",  value: 14832, delta: "+8.2%",   up: true,  unit: "",   decimals: 0 },
  { label: "Error Rate",      value: 2.3,   delta: "+1.4pp",  up: false, unit: "%",  decimals: 1 },
  { label: "P95 Latency",     value: 183,   delta: "+44ms",   up: false, unit: "ms", decimals: 0 },
  { label: "P99 Latency",     value: 342,   delta: "+112ms",  up: false, unit: "ms", decimals: 0 },
  { label: "Apdex Score",     value: 0.84,  delta: "-0.08",   up: false, unit: "",   decimals: 2 },
  { label: "Active Services", value: 7,     delta: "stable",  up: true,  unit: "",   decimals: 0 },
  { label: "Open Incidents",  value: 3,     delta: "+1",      up: false, unit: "",   decimals: 0 },
  { label: "Deploys Today",   value: 5,     delta: "2 failed",up: false, unit: "",   decimals: 0 },
];

function XIcon({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "critical" ? "var(--red)" :
    status === "degraded" || status === "failed" ? "var(--yellow)" :
    status === "in-progress" ? "var(--blue)" :
    "var(--green)";
  return (
    <span className={status === "critical" ? "pulse-dot" : ""} style={{
      width: 6, height: 6, borderRadius: "50%", flexShrink: 0, display: "inline-block",
      background: color,
    }} />
  );
}

function ChartCard({
  title,
  badge,
  legend,
  children,
  beamed,
  span,
}: {
  title: string;
  badge?: { label: string; variant: "green" | "red" | "yellow" | "blue" };
  legend?: { label: string; color: string }[];
  children: React.ReactNode;
  beamed?: boolean;
  span?: 2 | 1;
}) {
  const variantColors = {
    green:  { bg: "var(--green-bg)",  border: "var(--green-border)",  color: "var(--green)"  },
    red:    { bg: "var(--red-bg)",    border: "var(--red-border)",    color: "var(--red)"    },
    yellow: { bg: "var(--yellow-bg)", border: "var(--yellow-border)", color: "var(--yellow)" },
    blue:   { bg: "var(--blue-bg)",   border: "var(--blue-border)",   color: "var(--blue)"   },
  };
  const v = badge ? variantColors[badge.variant] : null;

  return (
    <div style={{
      position: "relative",
      background: "var(--bg-2)", border: "1px solid var(--border)",
      borderRadius: 10, overflow: "hidden", padding: 16,
      gridColumn: span === 2 ? "span 2" : undefined,
    }}>
      {beamed && <BorderBeam colorFrom="transparent" colorTo="rgba(0,112,243,0.4)" duration={10} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-3)", letterSpacing: "-0.004em" }}>{title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {legend && legend.map(l => (
            <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>
              <span style={{ display: "inline-block", width: 14, height: 1.5, background: l.color, borderRadius: 1 }} />
              {l.label}
            </span>
          ))}
          {badge && v && (
            <span style={{
              fontSize: 11, fontWeight: 500, borderRadius: 6, padding: "2px 8px",
              background: v.bg, border: `1px solid ${v.border}`, color: v.color,
              fontFamily: "Geist Mono, monospace",
            }}>{badge.label}</span>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

type Service = typeof SERVICES[0];

function ServiceDetail({
  service,
  onClose,
  errColor,
  rpsColor,
  latColor,
  theme,
}: {
  service: Service;
  onClose: () => void;
  errColor: string;
  rpsColor: string;
  latColor: string;
  theme: string;
}) {
  const gridColor = "var(--border)";
  const axisColor = theme === "dark" ? "#444" : "#aaa";
  const tickProps = { fontSize: 9, fill: axisColor, fontFamily: "Geist Mono" };

  const svcErrData = Array.from({ length: 12 }, (_, i) => ({
    t: `${(i * 2).toString().padStart(2, "0")}:00`,
    v: parseFloat((Math.random() * 1.2 + service.err * 0.7).toFixed(2)),
  }));
  const svcLatData = Array.from({ length: 12 }, (_, i) => ({
    t: `${(i * 2).toString().padStart(2, "0")}:00`,
    p95: Math.floor(Math.random() * 20 + service.lat * 0.9),
  }));

  const statusColor =
    service.health === "critical" ? "var(--red)" :
    service.health === "degraded" ? "var(--yellow)" : "var(--green)";
  const statusBg =
    service.health === "critical" ? "var(--red-bg)" :
    service.health === "degraded" ? "var(--yellow-bg)" : "var(--green-bg)";
  const statusBorder =
    service.health === "critical" ? "var(--red-border)" :
    service.health === "degraded" ? "var(--yellow-border)" : "var(--green-border)";

  const relatedEndpoints = ENDPOINTS.filter(e =>
    e.ep.toLowerCase().includes(service.name.split("-")[0])
  ).slice(0, 3);
  const relatedDeploys = DEPLOYMENTS.filter(d => d.service === service.name);

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{
        background: "var(--bg-2)", border: "1px solid var(--border)",
        borderRadius: 10, overflow: "hidden",
        display: "flex", flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "14px 16px 12px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", gap: 10,
        flexShrink: 0,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <StatusDot status={service.health} />
            <span style={{
              fontSize: 13, fontWeight: 600, letterSpacing: "-0.007em",
              color: "var(--text-1)", fontFamily: "Geist, sans-serif",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {service.name}
            </span>
          </div>
          <span style={{
            fontSize: 10, fontFamily: "Geist Mono, monospace",
            padding: "2px 7px", borderRadius: 4,
            background: statusBg, border: `1px solid ${statusBorder}`,
            color: statusColor, textTransform: "capitalize",
          }}>
            {service.health}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 26, height: 26, borderRadius: 6, flexShrink: 0,
            border: "1px solid var(--border)", background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--text-4)", transition: "all 0.12s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-3)"; e.currentTarget.style.color = "var(--text-2)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-4)"; }}
        >
          <X size={11} />
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Error rate", value: `${service.err}%`, color: service.err > 5 ? "var(--red)" : service.err > 0.5 ? "var(--yellow)" : "var(--green)" },
            { label: "P95 latency", value: `${service.lat}ms`, color: service.lat > 200 ? "var(--yellow)" : "var(--text-1)" },
            { label: "Throughput",  value: `${service.rps.toLocaleString()}/m`, color: "var(--text-1)" },
          ].map(k => (
            <div key={k.label} style={{
              padding: "10px 12px", borderRadius: 7,
              border: "1px solid var(--border)", background: "var(--bg)",
            }}>
              <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: "0 0 5px" }}>{k.label}</p>
              <p style={{ fontSize: 16, fontWeight: 700, fontFamily: "Geist Mono, monospace", letterSpacing: "-0.02em", color: k.color, margin: 0 }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Error rate sparkline */}
        <div>
          <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Error rate · 24h
          </p>
          <ResponsiveContainer width="100%" height={72}>
            <AreaChart data={svcErrData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id={`sg-${service.name}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={errColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={errColor} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="t" tick={tickProps} interval={3} />
              <YAxis tick={tickProps} />
              <Area type="monotone" dataKey="v" name="err %" stroke={errColor} strokeWidth={1.5} fill={`url(#sg-${service.name})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Latency sparkline */}
        <div>
          <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Latency P95 · 24h
          </p>
          <ResponsiveContainer width="100%" height={72}>
            <AreaChart data={svcLatData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id={`lg-${service.name}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={latColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={latColor} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="t" tick={tickProps} interval={3} />
              <YAxis tick={tickProps} />
              <Area type="monotone" dataKey="p95" name="p95 ms" stroke={latColor} strokeWidth={1.5} fill={`url(#lg-${service.name})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Related endpoints */}
        {relatedEndpoints.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Endpoints
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {relatedEndpoints.map(ep => (
                <div key={ep.ep} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 8px", borderRadius: 5,
                  transition: "background 0.1s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Activity size={10} style={{ color: "var(--text-4)", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ep.ep}</span>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--red)", flexShrink: 0 }}>{ep.rate}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related deployments */}
        {relatedDeploys.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Deployments
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {relatedDeploys.map(d => (
                <div key={d.version} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 8px", borderRadius: 5,
                }}
                >
                  <StatusDot status={d.status} />
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-3)", flex: 1 }}>{d.version}</span>
                  <span style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{d.author}</span>
                  <span style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{d.ago}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View full details link */}
        <button style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          padding: "8px", borderRadius: 7,
          border: "1px solid var(--border)", background: "transparent",
          fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-3)",
          cursor: "pointer", marginTop: "auto", transition: "all 0.12s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-1)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-3)"; }}
        >
          View full details
          <ArrowUpRight size={11} />
        </button>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [tf, setTf] = useState("1h");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
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

  const tickProps = { fontSize: 9, fill: axisColor, fontFamily: "Geist Mono" };
  const commonMargin = { top: 0, right: 0, left: -24, bottom: 0 };

  return (
    <FadeIn>
      <div className="page-pad" style={{ maxWidth: 1600, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-1)", margin: "0 0 2px" }}>
              <BlurText text="System Health" className="inline" />
            </h1>
            <span style={{ fontSize: 12, color: "var(--text-4)", fontFamily: "Geist Mono, monospace" }}>
              ecommerce-platform · production
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="hide-mobile" style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 11, fontFamily: "Geist Mono, monospace",
              padding: "5px 10px", borderRadius: 6,
              border: "1px solid var(--green-border)",
              background: "var(--green-bg)", color: "var(--green)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} className="pulse-dot" />
              Live · {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 2,
              padding: 4, borderRadius: 8,
              background: "var(--bg-2)", border: "1px solid var(--border)",
            }}>
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

        {/* ── KPI tiles ── */}
        <div className="rg-kpi">
          {KPI_ITEMS.map(({ label, value, delta, up, unit, decimals }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3, ease: "easeOut" }}
            >
              <GlowCard style={{ padding: "14px 16px", height: "100%" }}>
                <p style={{ fontSize: 11, color: "var(--text-4)", marginBottom: 10, letterSpacing: "-0.002em", fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.025em", color: "var(--text-1)", lineHeight: 1, marginBottom: 8 }}>
                  <AnimatedCounter value={value} decimals={decimals} />
                  {unit && <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-4)", marginLeft: 2 }}>{unit}</span>}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: up ? "var(--green)" : "var(--red)" }}>
                  {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  <span style={{ fontFamily: "Geist Mono, monospace" }}>{delta}</span>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>

        {/* ── Charts row 1: request volume (2fr) + error rate (1fr) ── */}
        <div className="rg-2-1">
          <ChartCard
            title="Request Volume"
            badge={{ label: "14,832 rpm", variant: "green" }}
            span={2}
          >
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={rpsData} margin={commonMargin}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={rpsColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={rpsColor} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="t" tick={tickProps} interval={5} />
                <YAxis tick={tickProps} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="v" name="req/min" stroke={rpsColor} strokeWidth={1.5} fill="url(#rg)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Error Rate"
            badge={{ label: "2.3% avg", variant: "red" }}
            beamed
          >
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={errData} margin={{ ...commonMargin, left: -28 }}>
                <defs>
                  <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={errColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={errColor} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="t" tick={tickProps} interval={5} />
                <YAxis tick={tickProps} />
                <Tooltip content={<Tip />} />
                <ReferenceLine y={5} stroke={errColor} strokeDasharray="3 3" strokeOpacity={0.4} />
                <Area type="monotone" dataKey="v" name="err %" stroke={errColor} strokeWidth={1.5} fill="url(#eg)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Charts row 2: latency + infrastructure ── */}
        <div className="rg-2">
          <ChartCard
            title="Latency (ms)"
            legend={[{ label: "P95", color: latColor }, { label: "P99", color: stroke2Color }]}
          >
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={latData} margin={commonMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="t" tick={tickProps} interval={5} />
                <YAxis tick={tickProps} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="p95" name="p95" stroke={latColor}     strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="p99" name="p99" stroke={stroke2Color} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Infrastructure"
            legend={[{ label: "CPU", color: cpuColor }, { label: "Mem", color: memColor }]}
          >
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={satData} margin={commonMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="t" tick={tickProps} interval={5} />
                <YAxis tick={tickProps} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="cpu" name="cpu %" stroke={cpuColor} strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="mem" name="mem %" stroke={memColor} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Bottom row: service health + detail / endpoints+deployments ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "stretch" }}>

          {/* Service health */}
          <GlowCard style={{ padding: 16, borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Service Health</h2>
              <div style={{ display: "flex", gap: 10, fontSize: 11, fontFamily: "Geist Mono, monospace" }}>
                <span style={{ color: "var(--red)" }}>1 crit</span>
                <span style={{ color: "var(--text-4)" }}>·</span>
                <span style={{ color: "var(--yellow)" }}>1 deg</span>
                <span style={{ color: "var(--text-4)" }}>·</span>
                <span style={{ color: "var(--green)" }}>5 ok</span>
              </div>
            </div>
            <div>
              {SERVICES.map((s, i) => {
                const isActive = selectedService?.name === s.name;
                return (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.05, duration: 0.22 }}
                    onClick={() => setSelectedService(isActive ? null : s)}
                    style={{
                      display: "flex", alignItems: "center", gap: 9,
                      padding: "9px 8px", borderRadius: 6, cursor: "pointer",
                      background: isActive ? "var(--bg-3)" : "transparent",
                      borderLeft: `2px solid ${isActive ? "var(--text-1)" : "transparent"}`,
                      paddingLeft: isActive ? 10 : 8,
                      transition: "all 0.1s",
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg-3)"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    <StatusDot status={s.health} />
                    <span style={{
                      fontSize: 12, fontFamily: "Geist Mono, monospace", flex: 1,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      color: isActive ? "var(--text-1)" : "var(--text-2)", letterSpacing: "-0.004em",
                      fontWeight: isActive ? 600 : 400,
                    }}>{s.name}</span>
                    <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", width: 56, textAlign: "right", color: "var(--text-4)" }}>
                      {s.rps.toLocaleString()}/m
                    </span>
                    <span style={{
                      fontSize: 11, fontFamily: "Geist Mono, monospace", width: 38, textAlign: "right",
                      color: s.err > 5 ? "var(--red)" : s.err > 0.5 ? "var(--yellow)" : "var(--text-4)",
                    }}>{s.err}%</span>
                    <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", width: 44, textAlign: "right", color: "var(--text-4)" }}>
                      {s.lat}ms
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </GlowCard>

          {/* Right column: service detail OR endpoints+deployments */}
          <AnimatePresence mode="wait">
            {selectedService ? (
              <ServiceDetail
                key={selectedService.name}
                service={selectedService}
                onClose={() => setSelectedService(null)}
                errColor={errColor}
                rpsColor={rpsColor}
                latColor={latColor}
                theme={theme}
              />
            ) : (
              <motion.div
                key="default-right"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <GlowCard style={{ padding: 16, borderRadius: 10, display: "flex", flexDirection: "column", height: "100%" }}>
                  <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: "0 0 12px" }}>
                    Top Failing Endpoints
                  </h2>
                  <div>
                    {ENDPOINTS.map((ep, i) => (
                      <div
                        key={ep.ep}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "8px 8px", borderRadius: 6, cursor: "pointer",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <span style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", width: 14, color: "var(--text-4)", flexShrink: 0 }}>{i + 1}</span>
                        <span style={{
                          fontSize: 11, fontFamily: "Geist Mono, monospace", flex: 1,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          color: "var(--text-3)",
                        }}>{ep.ep}</span>
                        <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", flexShrink: 0 }}>{ep.rps}/m</span>
                        <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", fontWeight: 600, color: "var(--red)", flexShrink: 0, width: 36, textAlign: "right" }}>{ep.rate}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 14 }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: "0 0 10px" }}>
                      Recent Deployments
                    </h2>
                    <div>
                      {DEPLOYMENTS.map(d => (
                        <div
                          key={d.service}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "7px 0", borderBottom: "1px solid var(--border)",
                          }}
                        >
                          {d.status === "success"
                            ? <CheckCircle size={12} style={{ color: "var(--green)", flexShrink: 0 }} />
                            : d.status === "failed"
                            ? <XIcon size={12} style={{ color: "var(--red)", flexShrink: 0 }} />
                            : <Minus size={12} style={{ color: "var(--blue)", flexShrink: 0 }} />}
                          <span style={{
                            fontSize: 12, fontFamily: "Geist Mono, monospace", flex: 1,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            color: "var(--text-3)",
                          }}>{d.service}</span>
                          <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", flexShrink: 0 }}>{d.version}</span>
                          <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", flexShrink: 0 }}>{d.ago}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </FadeIn>
  );
}
