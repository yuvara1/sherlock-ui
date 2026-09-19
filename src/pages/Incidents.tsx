import { useState } from "react";
import { Search, ChevronRight, ArrowLeft, CheckCircle, Brain, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FadeIn } from "@/components/ui/FadeIn";
import { GlowCard } from "@/components/ui/GlowCard";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { BlurText } from "@/components/ui/BlurText";
import { ConfidenceRing } from "@/components/ui/ConfidenceRing";
import { GradientText } from "@/components/ui/GradientText";
import { SherlockSelect } from "@/components/ui/SherlockSelect";

const INCIDENTS = [
  { id: "INC-094", title: "Payment processing timeout spike — P95 latency exceeded 4s",            sev: "critical", status: "open",          service: "payment-service",   env: "production", endpoint: "POST /v1/payments/charge",  created: "2026-08-29T14:23:00Z", errRate: 12.4, traceId: "abc123def456",  duration: "25m",  confidence: 91 },
  { id: "INC-093", title: "PostgreSQL connection pool exhaustion on payment-service",               sev: "high",     status: "open",          service: "payment-service",   env: "production", endpoint: "POST /v1/payments/charge",  created: "2026-08-29T13:45:00Z", errRate: 8.1,  traceId: "def789abc012",  duration: "1h3m", confidence: 84 },
  { id: "INC-092", title: "Order service 503s — downstream dependency timeout",                    sev: "high",     status: "investigating", service: "order-service",     env: "production", endpoint: "GET /v1/orders",            created: "2026-08-29T12:10:00Z", errRate: 3.2,  traceId: "fed321cba987",  duration: "2h38m",confidence: 76 },
  { id: "INC-091", title: "Auth service elevated latency — JWT validation slow",                   sev: "medium",   status: "resolved",      service: "user-service",      env: "production", endpoint: "POST /v1/auth/validate",    created: "2026-08-29T10:00:00Z", errRate: 0.4,  traceId: "aab112ccd334",  duration: "1h12m",confidence: 68 },
  { id: "INC-090", title: "Notification delivery failures — SES quota exceeded",                   sev: "medium",   status: "resolved",      service: "notification-svc",  env: "production", endpoint: "POST /v1/notifications",    created: "2026-08-28T22:15:00Z", errRate: 31.0, traceId: "xyz789uvw456",  duration: "47m",  confidence: 95 },
  { id: "INC-089", title: "Inventory API read latency spike — Redis cache miss storm",              sev: "low",      status: "resolved",      service: "inventory-api",     env: "staging",    endpoint: "GET /v1/inventory/:sku",    created: "2026-08-28T14:30:00Z", errRate: 0.1,  traceId: "lmn123opq456",  duration: "18m",  confidence: 72 },
  { id: "INC-088", title: "Fraud detection service OOM — memory limit exceeded",                   sev: "high",     status: "resolved",      service: "fraud-detection",   env: "production", endpoint: "POST /v1/fraud/evaluate",   created: "2026-08-28T09:00:00Z", errRate: 5.8,  traceId: "qqr890stu234",  duration: "34m",  confidence: 88 },
  { id: "INC-087", title: "Analytics pipeline stall — Kafka consumer lag >100k",                   sev: "medium",   status: "resolved",      service: "analytics-service", env: "production", endpoint: "GET /v1/analytics/stream",  created: "2026-08-27T18:45:00Z", errRate: 0.0,  traceId: "vvw567xyz890",  duration: "2h15m",confidence: 61 },
];

const EVIDENCE = [
  "PostgreSQL query latency increased from 40ms → 4.5s at 13:48 UTC",
  "Connection pool utilization reached 100% (50/50 connections used)",
  "payment-service v2.14.1 deployed at 13:14 UTC — 34 minutes before incident",
  "HikariPool-1 — Connection is not available, request timed out after 30000ms",
  "P99 span duration in payment-service::processCharge exceeded 4000ms",
  "order-service began 503 cascade at 14:23 UTC when pool exhausted",
];

const RECOMMENDATIONS = [
  "Investigate long-running queries introduced in payment-service v2.14.1",
  "Increase HikariCP pool size from 50 → 100 connections",
  "Add pool utilization alert trigger at 80% saturation",
  "Deploy circuit breaker on order-service → payment-service path",
];

function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m / 60)}h ago` : `${Math.floor(m / 1440)}d ago`;
}

function sevColor(s: string) {
  if (s === "critical") return { color: "var(--red)",    bg: "var(--red-bg)",    border: "var(--red-border)"    };
  if (s === "high")     return { color: "var(--red)",    bg: "var(--red-bg)",    border: "var(--red-border)"    };
  if (s === "medium")   return { color: "var(--yellow)", bg: "var(--yellow-bg)", border: "var(--yellow-border)" };
  return                       { color: "var(--blue)",   bg: "var(--blue-bg)",   border: "var(--blue-border)"   };
}

function statusColor(s: string) {
  if (s === "open")          return { fg: "var(--red)",    bg: "var(--red-bg)",    bd: "var(--red-border)"    };
  if (s === "investigating")  return { fg: "var(--yellow)", bg: "var(--yellow-bg)", bd: "var(--yellow-border)" };
  return                             { fg: "var(--green)",  bg: "var(--green-bg)",  bd: "var(--green-border)"  };
}

function SevBadge({ s }: { s: string }) {
  const c = sevColor(s);
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, borderRadius: 6, padding: "1px 6px",
      border: `1px solid ${c.border}`, color: c.color, background: c.bg,
      letterSpacing: 0, textTransform: "capitalize",
    }}>{s}</span>
  );
}

function StatusBadge({ s }: { s: string }) {
  const c = statusColor(s);
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, borderRadius: 6, padding: "1px 6px",
      border: `1px solid ${c.bd}`, color: c.fg, background: c.bg,
      letterSpacing: 0, textTransform: "capitalize",
    }}>{s}</span>
  );
}

/* Investigation Timeline — from section 28 */
const TIMELINE = [
  { time: "14:27", event: "Incident INC-094 created automatically — error threshold breached", type: "alert"  },
  { time: "14:26", event: "order-service 503 cascade detected — error rate 18.4%",             type: "alert"  },
  { time: "14:23", event: "On-call engineer paged via PagerDuty",                               type: "page"   },
  { time: "14:20", event: "payment-service v2.14.1 deployed to production",                    type: "deploy" },
  { time: "14:18", event: "P95 latency on POST /v1/payments/charge exceeded 4s SLO",           type: "metric" },
  { time: "14:10", event: "PostgreSQL connection pool utilisation reached 90% (45/50)",        type: "metric" },
  { time: "13:58", event: "Anomaly detected — DB query p99 duration climbing",                 type: "ai"     },
  { time: "13:48", event: "PostgreSQL query latency started climbing from baseline 40ms",       type: "metric" },
];

const SPANS = [
  { span: "API Gateway",                     ms: 12,    slow: false },
  { span: "Authentication middleware",       ms: 24,    slow: false },
  { span: "Rate limiter check",              ms: 6,     slow: false },
  { span: "payment-service::processCharge",  ms: 4532,  slow: true  },
  { span: "RiskEngine::evaluate",            ms: 85,    slow: false },
  { span: "HikariPool::getConnection",       ms: 30000, slow: true  },
  { span: "PostgreSQL::executeQuery",        ms: 4489,  slow: true  },
  { span: "Ledger::debit",                   ms: 0,     slow: false },
];

function TimelineDot({ type }: { type: string }) {
  const color =
    type === "alert"  ? "var(--red)"    :
    type === "deploy" ? "var(--yellow)" :
    type === "ai"     ? "var(--blue)"   :
    type === "page"   ? "var(--accent)" : "var(--border-2)";
  return (
    <div style={{
      position: "absolute", left: -20, top: 4,
      width: 8, height: 8, borderRadius: "50%",
      border: "2px solid var(--bg-2)",
      background: color,
      boxShadow: type === "alert" ? `0 0 0 3px rgba(229,72,77,0.2)` : undefined,
    }} />
  );
}

function Detail({ inc, onBack }: { inc: typeof INCIDENTS[0]; onBack: () => void }) {
  const [tab, setTab] = useState("overview");
  const TABS = ["overview", "traces", "logs", "ai analysis"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="page-pad"
      style={{ height: "100%", overflowY: "auto" }}
    >
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, fontSize: 13,
        fontFamily: "Geist Mono, monospace", marginBottom: 20,
        color: "var(--text-4)", background: "none", border: "none", cursor: "pointer",
        letterSpacing: "-0.004em", transition: "color 0.1s",
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}
      >
        <ArrowLeft size={13} /> Back to incidents
      </button>

      {/* Title row */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{inc.id}</span>
            <SevBadge s={inc.sev} />
            <StatusBadge s={inc.status} />
            <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", display: "flex", alignItems: "center", gap: 4, color: "var(--text-4)" }}>
              <Clock size={10} /> {inc.duration}
            </span>
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.012em", color: "var(--text-1)", margin: 0, lineHeight: 1.4 }}>
            <BlurText text={inc.title} />
          </h2>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
          <button style={{
            padding: "6px 14px", fontSize: 13, borderRadius: 8, fontWeight: 500,
            background: "var(--text-1)", color: "var(--bg)", border: "none", cursor: "pointer",
            letterSpacing: "-0.004em",
          }}>View AI Analysis</button>
          <button style={{
            padding: "6px 14px", fontSize: 13, borderRadius: 8,
            border: "1px solid var(--border)", color: "var(--text-3)", background: "transparent", cursor: "pointer",
            letterSpacing: "-0.004em",
          }}>Mark Resolved</button>
          <button style={{
            padding: "6px 14px", fontSize: 13, borderRadius: 8,
            border: "1px solid var(--red-border)", color: "var(--red)", background: "var(--red-bg)", cursor: "pointer",
            letterSpacing: "-0.004em",
          }}>Escalate</button>
        </div>
      </div>

      {/* Meta KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginBottom: 20 }}>
        {[
          ["Service",     inc.service],
          ["Environment", inc.env],
          ["Endpoint",    inc.endpoint],
          ["Error Rate",  inc.errRate + "%"],
          ["Detected",    ago(inc.created)],
        ].map(([k, v]) => (
          <GlowCard key={k} style={{ borderRadius: 8, padding: "10px 12px" }}>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4, letterSpacing: 0 }}>{k}</p>
            <p style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color: "var(--text-2)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</p>
          </GlowCard>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border)" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 12px", fontSize: 13, fontWeight: 500,
            color: tab === t ? "var(--text-1)" : "var(--text-4)",
            background: "none", border: "none", borderRadius: 0,
            borderBottomWidth: 2, borderBottomStyle: "solid",
            borderBottomColor: tab === t ? "var(--text-1)" : "transparent",
            cursor: "pointer", marginBottom: -1, transition: "color 0.1s",
            textTransform: "capitalize", letterSpacing: "-0.004em",
          }}>{t}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="rg-3"
            style={{ gap: 16 }}
          >
            {/* Left: Timeline + Affected Resources */}
            <div className="rg-span-2" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Timeline — Notion section 28 */}
              <GlowCard style={{ padding: 16, borderRadius: 10 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: "0 0 16px" }}>
                  Investigation Timeline
                </h3>
                <div style={{ position: "relative", paddingLeft: 20 }}>
                  <div style={{ position: "absolute", left: 4, top: 0, bottom: 0, width: 1, background: "var(--border)" }} />
                  {TIMELINE.map((e, i) => (
                    <motion.div
                      key={e.time}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.25 }}
                      style={{ display: "flex", alignItems: "flex-start", gap: 12, position: "relative", marginBottom: 16 }}
                    >
                      <TimelineDot type={e.type} />
                      <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", flexShrink: 0, color: "var(--text-4)", marginTop: 1 }}>{e.time}</span>
                      <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, letterSpacing: "-0.004em", lineHeight: 1.5 }}>{e.event}</p>
                    </motion.div>
                  ))}
                </div>
                {/* Timeline legend */}
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  {[
                    { type: "alert",  label: "Alert" },
                    { type: "deploy", label: "Deployment" },
                    { type: "ai",     label: "AI Signal" },
                    { type: "page",   label: "Notification" },
                    { type: "metric", label: "Metric" },
                  ].map(l => (
                    <div key={l.type} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background:
                        l.type === "alert" ? "var(--red)" : l.type === "deploy" ? "var(--yellow)" : l.type === "ai" ? "var(--blue)" : l.type === "page" ? "var(--accent)" : "var(--border-2)"
                      }} />
                      {l.label}
                    </div>
                  ))}
                </div>
              </GlowCard>

              {/* Affected Resources */}
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: "0 0 12px" }}>
                  Affected Resources
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 8 }}>
                  {[
                    { label: "Traces",    val: "1,284",  color: "var(--blue)"   },
                    { label: "Log lines", val: "48,291", color: "var(--text-2)" },
                    { label: "Errors",    val: "592",    color: "var(--red)"    },
                    { label: "Users hit", val: "~8,400", color: "var(--yellow)" },
                    { label: "Services",  val: "3",      color: "var(--text-2)" },
                    { label: "Endpoints", val: "2",      color: "var(--text-2)" },
                  ].map(({ label, val, color }) => (
                    <GlowCard key={label} style={{ borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                      <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.025em", color, lineHeight: 1, margin: "0 0 4px" }}>{val}</p>
                      <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: 0 }}>{label}</p>
                    </GlowCard>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Root Cause + Evidence — Notion section 28 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Probable Root Cause card — the centrepiece */}
              <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid var(--blue-border)", background: "var(--bg-2)", padding: 16 }}>
                <BorderBeam colorFrom="transparent" colorTo="rgba(0,112,243,0.7)" duration={8} size={120} />

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Brain size={13} style={{ color: "var(--blue)" }} />
                  <span style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: 0 }}>Probable Root Cause</span>
                  <span style={{
                    marginLeft: "auto", fontSize: 11, fontWeight: 500, borderRadius: 6, padding: "1px 6px",
                    border: "1px solid var(--blue-border)", color: "var(--blue)", background: "var(--blue-bg)",
                    fontFamily: "Geist Mono, monospace",
                  }}>Sherlock AI</span>
                </div>

                {/* Confidence ring + root cause name */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <ConfidenceRing value={inc.confidence} size={72} color="var(--blue)" label="conf." />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: "0 0 6px", lineHeight: 1.3 }}>
                      <GradientText from="var(--blue)" via="#60a5fa" to="var(--accent)" animate={false}>
                        Database connection pool exhaustion
                      </GradientText>
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0, letterSpacing: 0 }}>
                      payment-service v2.14.1 → PostgreSQL
                    </p>
                  </div>
                </div>

                {/* Evidence list */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-4)", margin: "0 0 8px" }}>Evidence</p>
                  {EVIDENCE.map((e, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.07, duration: 0.25 }}
                      style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7 }}
                    >
                      <CheckCircle size={10} style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>{e}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Recommendations */}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-4)", margin: "0 0 8px" }}>Recommended Next Steps</p>
                  {RECOMMENDATIONS.map((r, i) => (
                    <div key={r} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7 }}>
                      <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                      <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, letterSpacing: "-0.004em", lineHeight: 1.5 }}>{r}</p>
                    </div>
                  ))}
                </div>

                {/* AI explanation excerpt */}
                <div style={{ background: "var(--bg-3)", borderRadius: 8, padding: 12, marginBottom: 12, border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-4)", margin: "0 0 6px" }}>AI Investigation</p>
                  <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, lineHeight: 1.6, letterSpacing: "-0.004em" }}>
                    "The strongest evidence points to the Payment Service. Its latency increased from approximately 300ms to 2.8s and timeout events increased significantly. Order Service failures correlate with Payment Service degradation, and version v2.14.1 was deployed 34 minutes before the incident."
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {["View Trace", "View Logs", "Full RCA"].map(l => (
                    <button key={l} style={{
                      flex: 1, padding: "6px 0", fontSize: 11, fontFamily: "Geist Mono, monospace",
                      borderRadius: 6, border: "1px solid var(--border)", color: "var(--text-3)",
                      background: "transparent", cursor: "pointer", transition: "border-color 0.1s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--blue-border)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Root Cause Candidates */}
              <GlowCard style={{ padding: 16, borderRadius: 10 }}>
                <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-4)", margin: "0 0 12px" }}>Confidence Candidates</p>
                {[
                  { name: "payment-service DB pool", conf: inc.confidence },
                  { name: "payment-service v2.14.1", conf: 72 },
                  { name: "order-service dependency", conf: 43 },
                ].map(({ name, conf }) => (
                  <div key={name} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "Geist Mono, monospace" }}>{name}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: conf > 80 ? "var(--blue)" : "var(--text-3)", fontFamily: "Geist Mono, monospace" }}>{conf}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: "var(--bg-3)", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${conf}%` }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        style={{ height: "100%", borderRadius: 2, background: conf > 80 ? "var(--blue)" : conf > 60 ? "var(--yellow)" : "var(--border-2)" }}
                      />
                    </div>
                  </div>
                ))}
              </GlowCard>
            </div>
          </motion.div>
        )}

        {tab === "traces" && (
          <motion.div key="traces" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <GlowCard style={{ padding: 16, borderRadius: 10 }}>
              <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", marginBottom: 16 }}>trace_id: {inc.traceId}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {SPANS.map((s, i) => (
                  <motion.div
                    key={s.span}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.22 }}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", width: 240, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: s.slow ? "var(--text-2)" : "var(--text-3)" }}>{s.span}</span>
                    <div style={{ flex: 1, height: 16, borderRadius: 4, overflow: "hidden", background: "var(--bg-3)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(2, (Math.min(s.ms, 4532) / 4532) * 100)}%` }}
                        transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                        style={{ height: "100%", borderRadius: 4, background: s.slow ? "var(--red)" : "var(--blue-muted)" }}
                      />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", width: 56, textAlign: "right", flexShrink: 0, color: s.slow ? "var(--red)" : "var(--text-4)" }}>
                      {s.ms > 0 ? `${s.ms >= 1000 ? (s.ms / 1000).toFixed(1) + "s" : s.ms + "ms"}` : "—"}
                    </span>
                    {s.slow && (
                      <span style={{
                        fontSize: 11, fontWeight: 500, borderRadius: 6, padding: "1px 6px",
                        background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-border)",
                        textTransform: "uppercase", flexShrink: 0,
                      }}>slow</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </GlowCard>
          </motion.div>
        )}

        {tab === "logs" && (
          <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <GlowCard style={{ padding: 16, borderRadius: 10 }}>
              <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", marginBottom: 14 }}>
                Showing logs correlated to trace_id: {inc.traceId}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { ts: "14:20:34.182", lvl: "ERROR", svc: "payment-service", msg: "HikariPool-1 - Connection is not available, request timed out after 30000ms" },
                  { ts: "14:20:31.001", lvl: "WARN",  svc: "payment-service", msg: "Connection pool utilization at 98% — 49/50 connections active" },
                  { ts: "14:20:28.441", lvl: "ERROR", svc: "payment-service", msg: "PostgreSQL::executeQuery exceeded SLO threshold: 4489ms (limit: 500ms)" },
                  { ts: "14:20:21.003", lvl: "WARN",  svc: "order-service",   msg: "Downstream dependency payment-service slow response: 3200ms" },
                  { ts: "14:20:19.555", lvl: "INFO",  svc: "payment-service", msg: "processCharge started — traceId=abc123def456 spanId=span_pay_001" },
                ].map((l, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      display: "flex", gap: 12, padding: "6px 8px", borderRadius: 6,
                      fontFamily: "Geist Mono, monospace", fontSize: 11,
                      background: l.lvl === "ERROR" ? "rgba(229,72,77,0.04)" : "transparent",
                    }}
                  >
                    <span style={{ color: "var(--text-4)", flexShrink: 0 }}>{l.ts}</span>
                    <span style={{ flexShrink: 0, width: 36, color: l.lvl === "ERROR" ? "var(--red)" : l.lvl === "WARN" ? "var(--yellow)" : "var(--text-4)" }}>{l.lvl}</span>
                    <span style={{ color: "var(--text-3)", flexShrink: 0, width: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.svc}</span>
                    <span style={{ color: "var(--text-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.msg}</span>
                  </motion.div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>
                  Open full Log Explorer →
                </button>
              </div>
            </GlowCard>
          </motion.div>
        )}

        {tab === "ai analysis" && (
          <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-2)", padding: 20 }}>
              <BorderBeam colorFrom="transparent" colorTo="rgba(124,58,237,0.5)" duration={10} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Brain size={14} style={{ color: "var(--blue)" }} />
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)" }}>AI Investigation Report</span>
                <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>Evidence-first analysis</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { section: "Probable Root Cause", content: "The strongest evidence points to the Payment Service database connection pool. Its query latency increased from approximately 40ms to 4.5s at 13:48 UTC, and all 50 connection slots were exhausted by 14:20 UTC." },
                  { section: "Supporting Evidence", content: "Payment latency increased from 300ms to 2.8s. Timeout events increased by 1,400%. Order Service failures correlate directly with Payment Service degradation timing. Version v2.14.1 was deployed 34 minutes before the incident." },
                  { section: "Deployment Correlation", content: "payment-service v2.14.1 was deployed at 13:14 UTC — 34 minutes before degradation began. The deployment is a correlated event and warrants investigation of the changeset diff, particularly any new database query patterns or missing indexes." },
                  { section: "Recommended Investigation", content: "1. Review payment-service v2.14.1 changeset for new SQL queries or ORM-generated queries missing indexes. 2. Increase HikariCP pool size from 50 → 100 as a short-term mitigation. 3. Deploy circuit breaker between order-service and payment-service." },
                ].map(({ section, content }) => (
                  <div key={section}>
                    <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-4)", margin: "0 0 6px" }}>{section}</p>
                    <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, lineHeight: 1.65, letterSpacing: "-0.004em" }}>{content}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Incidents() {
  const [search, setSearch]     = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus]     = useState("all");
  const [selected, setSelected] = useState<typeof INCIDENTS[0] | null>(null);

  if (selected) return <Detail inc={selected} onBack={() => setSelected(null)} />;

  const list = INCIDENTS.filter(i =>
    (i.title.toLowerCase().includes(search.toLowerCase()) || i.id.includes(search) || i.service.includes(search)) &&
    (severity === "all" || i.sev === severity) &&
    (status   === "all" || i.status === status)
  );

  const counts = {
    open: INCIDENTS.filter(i => i.status === "open").length,
    investigating: INCIDENTS.filter(i => i.status === "investigating").length,
    resolved: INCIDENTS.filter(i => i.status === "resolved").length,
  };

  return (
    <FadeIn style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Fixed header */}
      <div className="page-pad" style={{ flexShrink: 0, borderBottom: "1px solid var(--border)", background: "var(--bg)", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Title + status counts */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: "0 0 2px" }}>
              Incident Management
            </h2>
            <span style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: 0 }}>Detect, investigate, resolve</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 500, borderRadius: 6, padding: "3px 8px", border: "1px solid var(--red-border)", color: "var(--red)", background: "var(--red-bg)" }}>
              {counts.open} open
            </span>
            <span style={{ fontSize: 11, fontWeight: 500, borderRadius: 6, padding: "3px 8px", border: "1px solid var(--yellow-border)", color: "var(--yellow)", background: "var(--yellow-bg)" }}>
              {counts.investigating} investigating
            </span>
            <span style={{ fontSize: 11, fontWeight: 500, borderRadius: 6, padding: "3px 8px", border: "1px solid var(--green-border)", color: "var(--green)", background: "var(--green-bg)" }}>
              {counts.resolved} resolved
            </span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200,
            borderRadius: 8, padding: "8px 12px",
            border: "1px solid var(--border)", background: "var(--bg-2)",
          }}>
            <Search size={12} style={{ color: "var(--text-4)", flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search incidents, services, IDs…"
              style={{
                flex: 1, background: "transparent", fontSize: 13,
                fontFamily: "Geist Mono, monospace", outline: "none",
                color: "var(--text-2)", border: "none", letterSpacing: "-0.004em",
              }}
            />
          </div>
          <SherlockSelect
            value={severity}
            onChange={setSeverity}
            options={["all","critical","high","medium","low"].map(o => ({ value: o, label: o === "all" ? "All severities" : o }))}
          />
          <SherlockSelect
            value={status}
            onChange={setStatus}
            options={["all","open","investigating","resolved"].map(o => ({ value: o, label: o === "all" ? "All statuses" : o }))}
          />
        </div>
      </div>

      {/* Scrollable incident list */}
      <div className="page-pad" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingTop: 16 }}>
        {list.map((inc, i) => (
          <motion.div
            key={inc.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            <div onClick={() => setSelected(inc)} role="button" tabIndex={0}
              onKeyDown={e => e.key === "Enter" && setSelected(inc)}
              style={{ cursor: "pointer" }}>
            <GlowCard
              style={{ padding: "14px 16px", borderRadius: 10 }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                {/* Left: severity dot */}
                <div style={{ paddingTop: 4 }}>
                  <span className={inc.status === "open" && inc.sev === "critical" ? "pulse-dot" : ""} style={{
                    display: "block", width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: inc.sev === "critical" || inc.sev === "high" ? "var(--red)" : inc.sev === "medium" ? "var(--yellow)" : "var(--text-4)",
                  }} />
                </div>

                {/* Middle: content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{inc.id}</span>
                    <SevBadge s={inc.sev} />
                    <StatusBadge s={inc.status} />
                    <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{inc.service}</span>
                    <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{inc.env}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-2)", margin: "0 0 4px", letterSpacing: "-0.004em", fontWeight: 500 }}>{inc.title}</p>
                  <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: 0 }}>{inc.endpoint}</p>
                </div>

                {/* Right: stats */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontFamily: "Geist Mono, monospace" }}>
                    <span style={{ color: inc.errRate > 5 ? "var(--red)" : inc.errRate > 1 ? "var(--yellow)" : "var(--text-4)", fontWeight: 600 }}>{inc.errRate}% err</span>
                    <span style={{ color: "var(--text-4)" }}>{inc.duration}</span>
                    <span style={{ color: "var(--text-4)" }}>{ago(inc.created)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <ConfidenceRing value={inc.confidence} size={32} stroke={3} color="var(--blue)" />
                    <ChevronRight size={13} style={{ color: "var(--text-4)" }} />
                  </div>
                </div>
              </div>
            </GlowCard>
            </div>
          </motion.div>
        ))}
        {list.length === 0 && (
          <p style={{ padding: "48px 0", textAlign: "center", fontSize: 13, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>
            No incidents match
          </p>
        )}
        <div style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", paddingBottom: 4 }}>
          {list.length} of {INCIDENTS.length} incidents
        </div>
      </div>
    </FadeIn>
  );
}
