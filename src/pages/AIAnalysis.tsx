import { useState, useRef, useEffect } from "react";
import {
  Brain, BarChart3, ScrollText, GitBranch, GitCommit,
  CheckCircle, ChevronRight, Send, Zap, AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ─── Constants ─── */
const MONO = "Geist Mono, monospace";
const SANS = "Geist, sans-serif";

/* ─── Data ─── */
const ANALYSES = [
  {
    id: "RCA-094", incidentId: "INC-094", ts: "14:35 UTC",
    title: "Database connection pool exhaustion",
    confidence: 91,
    rootCause: "Database connection pool exhaustion caused by a long-running query introduced in deployment v2.14.1. The HikariCP pool reached its configured maximum of 50 connections, blocking all subsequent database operations and causing cascading 503 errors in the payment processing pipeline.",
    evidence: [
      { type: "metric",     text: "PostgreSQL query latency increased from 40ms to 4.5s at 13:48 UTC",          conf: "high"   },
      { type: "metric",     text: "Connection pool utilization reached 100% (50/50 connections active)",         conf: "high"   },
      { type: "deployment", text: "payment-service v2.14.1 deployed 34 minutes before incident began",           conf: "high"   },
      { type: "log",        text: "HikariPool-1: Connection is not available, request timed out after 30000ms",  conf: "high"   },
      { type: "trace",      text: "PostgreSQL span in processCharge increased from 40ms → 4489ms",               conf: "high"   },
      { type: "inference",  text: "New query in v2.14.1 likely performs a full table scan on orders table",      conf: "medium" },
    ],
    affectedServices: ["payment-service", "order-service"],
    recommendations: [
      "Investigate queries introduced in commit a3f9c21 of payment-service v2.14.1",
      "Add EXPLAIN ANALYZE to slow query log for queries > 500ms",
      "Increase connection pool size from 50 to 100 as a short-term mitigation",
      "Add a circuit breaker in order-service for downstream payment-service timeouts",
      "Configure alert for HikariCP pool utilization > 80%",
    ],
    similar: [
      { id: "INC-082", title: "DB pool exhaustion — inventory service", ago: "12 days ago", sim: 87 },
      { id: "INC-071", title: "Slow query after migration v2.11.0",     ago: "28 days ago", sim: 72 },
    ],
  },
  {
    id: "RCA-091", incidentId: "INC-091", ts: "09:18 UTC",
    title: "Kafka consumer lag spike in order-service",
    confidence: 78,
    rootCause: "Order-service Kafka consumer group fell behind by ~120k messages following a pod restart that lost its offset commit. The reprocessing of accumulated events caused elevated CPU and memory pressure across the order processing pipeline.",
    evidence: [
      { type: "metric",    text: "Kafka consumer lag spiked from 0 to 120,432 messages at 09:14 UTC", conf: "high"   },
      { type: "log",       text: "Consumer group order-svc-prod reset offsets to earliest",            conf: "high"   },
      { type: "trace",     text: "order.created handler average latency jumped from 12ms to 890ms",    conf: "high"   },
      { type: "inference", text: "Pod OOMKill likely caused mid-commit offset loss",                   conf: "medium" },
    ],
    affectedServices: ["order-service", "notification-svc"],
    recommendations: [
      "Enable Kafka offset auto-commit with shorter intervals (500ms)",
      "Add Kubernetes resource limits to prevent OOMKill",
      "Implement dead-letter queue for reprocessing failures",
      "Alert on consumer lag > 1,000 messages",
    ],
    similar: [
      { id: "INC-078", title: "Kafka lag — analytics consumer", ago: "19 days ago", sim: 81 },
    ],
  },
];

const EVIDENCE_META: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  metric:     { icon: BarChart3,  label: "Metric",    color: "var(--blue)"   },
  log:        { icon: ScrollText, label: "Log",       color: "var(--text-3)" },
  trace:      { icon: GitBranch,  label: "Trace",     color: "var(--accent)" },
  deployment: { icon: GitCommit,  label: "Deploy",    color: "var(--yellow)" },
  inference:  { icon: Brain,      label: "Inference", color: "var(--text-4)" },
};

const STARTERS = [
  "Why did the connection pool exhaust so quickly?",
  "Which commit introduced the slow query?",
  "What is the blast radius of this incident?",
];

type Tab = "evidence" | "recommendations" | "similar";
type Message = { role: "user" | "ai"; text: string };

/* ─── Confidence ring ─── */
function ConfidenceRing({ value, size = 64 }: { value: number; size?: number }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
        <motion.circle
          cx="18" cy="18" r={r} fill="none"
          stroke="var(--text-2)" strokeWidth="3" strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ - dash}` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: "var(--text-1)", lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 8, fontFamily: MONO, color: "var(--text-4)", marginTop: 1 }}>%</span>
      </div>
    </div>
  );
}

/* ─── Service badge ─── */
function ServiceBadge({ name }: { name: string }) {
  return (
    <span style={{
      fontSize: 10, fontFamily: MONO,
      padding: "2px 7px", borderRadius: 4,
      border: "1px solid var(--red-border)",
      color: "var(--red)", background: "var(--red-bg)",
    }}>
      {name}
    </span>
  );
}

/* ─── Tab strip ─── */
function TabStrip({ tabs, active, onChange }: {
  tabs: { id: Tab; label: string }[];
  active: Tab;
  onChange: (id: Tab) => void;
}) {
  return (
    <div style={{
      display: "flex", gap: 0,
      padding: "0 20px",
      borderBottom: "1px solid var(--border)",
      flexShrink: 0,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            position: "relative",
            padding: "9px 14px",
            fontSize: 11, fontFamily: SANS, fontWeight: 500,
            color: active === t.id ? "var(--text-1)" : "var(--text-4)",
            background: "transparent", border: "none",
            cursor: "pointer", transition: "color 0.12s",
          }}
        >
          {t.label}
          {active === t.id && (
            <motion.div
              layoutId="tab-indicator"
              style={{
                position: "absolute", bottom: -1, left: 0, right: 0,
                height: 2, background: "var(--text-1)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Evidence row ─── */
function EvidenceRow({ ev }: { ev: typeof ANALYSES[0]["evidence"][0] }) {
  const meta = EVIDENCE_META[ev.type] ?? EVIDENCE_META.inference;
  const Icon = meta.icon;
  return (
    <div
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "11px 20px", borderBottom: "1px solid var(--border)",
        transition: "background 0.1s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-2)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{
        width: 26, height: 26, borderRadius: 5,
        border: "1px solid var(--border)", background: "var(--bg-2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1,
      }}>
        <Icon size={11} style={{ color: meta.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, lineHeight: 1.55, color: "var(--text-1)", margin: "0 0 5px" }}>{ev.text}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 10, fontFamily: MONO,
            padding: "1px 5px", borderRadius: 3,
            border: "1px solid var(--border)", background: "var(--bg-3)",
            color: meta.color,
          }}>
            {meta.label}
          </span>
          <span style={{
            fontSize: 10, fontFamily: MONO,
            color: ev.conf === "high" ? "var(--green)" : "var(--yellow)",
            display: "flex", alignItems: "center", gap: 3,
          }}>
            <CheckCircle size={9} />
            {ev.conf}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Chat panel ─── */
function ChatPanel({ analysis }: { analysis: typeof ANALYSES[0] }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(text: string) {
    if (!text.trim()) return;
    const reply = `Analyzing ${analysis.id}: Based on the correlated evidence, the ${analysis.title.toLowerCase()} was triggered by the conditions described in the root cause. Review span abc123def456 in the distributed traces for the full call chain.`;
    setMessages(m => [...m, { role: "user", text }, { role: "ai", text: reply }]);
    setQuery("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "0 16px", height: 40,
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 7,
        flexShrink: 0,
      }}>
        <Brain size={12} style={{ color: "var(--text-3)" }} />
        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: SANS, color: "var(--text-2)", letterSpacing: "-0.005em" }}>
          Ask Sherlock
        </span>
        <span style={{
          marginLeft: "auto",
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--green)", display: "inline-block",
        }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 4px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 8 }}>
            <div style={{ textAlign: "center", paddingTop: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--bg-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 10px",
              }}>
                <Brain size={16} style={{ color: "var(--text-4)" }} />
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", margin: "0 0 3px", fontFamily: SANS }}>Ask about this incident</p>
              <p style={{ fontSize: 11, fontFamily: MONO, color: "var(--text-4)", margin: 0, lineHeight: 1.5 }}>
                Correlates traces, logs,<br />and deployments for you.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <p style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-4)", margin: "0 0 2px 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Suggestions
              </p>
              {STARTERS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    textAlign: "left", fontSize: 11, lineHeight: 1.45,
                    padding: "8px 10px", borderRadius: 6,
                    border: "1px solid var(--border)", background: "var(--bg-2)",
                    color: "var(--text-2)", cursor: "pointer",
                    fontFamily: SANS, transition: "all 0.12s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--border-2)";
                    e.currentTarget.style.color = "var(--text-1)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-2)";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "88%", fontSize: 11, lineHeight: 1.6,
                padding: "7px 10px", borderRadius: m.role === "user" ? "10px 10px 2px 10px" : "2px 10px 10px 10px",
                background: m.role === "user" ? "var(--text-1)" : "var(--bg-2)",
                color: m.role === "user" ? "var(--bg)" : "var(--text-2)",
                border: m.role === "ai" ? "1px solid var(--border)" : "none",
                fontFamily: SANS,
              }}>
                {m.text}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "10px 12px 12px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 8,
          padding: "7px 10px",
          borderRadius: 7, border: "1px solid var(--border)",
          background: "var(--bg-2)", transition: "border-color 0.12s",
        }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
          onBlurCapture={e => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(query); } }}
            placeholder="Ask about this incident…"
            rows={2}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              resize: "none", fontSize: 11, lineHeight: 1.55,
              color: "var(--text-1)", fontFamily: SANS,
            }}
          />
          <button
            onClick={() => send(query)}
            disabled={!query.trim()}
            style={{
              flexShrink: 0, width: 26, height: 26, borderRadius: 5,
              border: "none", cursor: query.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: query.trim() ? "var(--text-1)" : "var(--bg-3)",
              transition: "all 0.12s",
            }}
          >
            <Send size={11} style={{ color: query.trim() ? "var(--bg)" : "var(--text-4)" }} />
          </button>
        </div>
        <p style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-4)", margin: "5px 2px 0" }}>
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function AIAnalysis() {
  const [sel, setSel] = useState(ANALYSES[0]);
  const [activeTab, setActiveTab] = useState<Tab>("evidence");

  const TABS: { id: Tab; label: string }[] = [
    { id: "evidence",        label: `Evidence (${sel.evidence.length})` },
    { id: "recommendations", label: `Recommendations (${sel.recommendations.length})` },
    { id: "similar",         label: `Similar (${sel.similar.length})` },
  ];

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      overflow: "hidden", fontFamily: SANS, fontSize: 13,
    }}>

      {/* ── Page header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 48,
        borderBottom: "1px solid var(--border)", flexShrink: 0,
        background: "var(--bg)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Brain size={14} style={{ color: "var(--text-3)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.007em", color: "var(--text-1)" }}>
            Root Cause Analysis
          </span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "4px 10px", borderRadius: 5,
          border: "1px solid var(--border)", background: "var(--bg-2)",
        }}>
          <Zap size={10} style={{ color: "var(--text-3)" }} />
          <span style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-3)" }}>Sherlock AI</span>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
        </div>
      </div>

      {/* ── 3-column body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Col 1: Analysis list ── */}
        <div style={{
          width: 232, flexShrink: 0,
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          background: "var(--bg)",
        }}>
          <div style={{
            padding: "0 14px", height: 36,
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Analyses
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {ANALYSES.map(a => {
              const active = sel.id === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => { setSel(a); setActiveTab("evidence"); }}
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--border)",
                    borderLeft: `2px solid ${active ? "var(--text-1)" : "transparent"}`,
                    background: active ? "var(--bg-2)" : "transparent",
                    cursor: "pointer", transition: "all 0.1s",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-2)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontFamily: MONO, color: active ? "var(--text-2)" : "var(--text-4)" }}>
                      {a.id}
                    </span>
                    <ConfidenceRing value={a.confidence} size={36} />
                  </div>
                  <p style={{ fontSize: 12, lineHeight: 1.4, color: active ? "var(--text-1)" : "var(--text-2)", margin: "0 0 5px", fontWeight: active ? 500 : 400 }}>
                    {a.title}
                  </p>
                  <p style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-4)", margin: 0 }}>
                    {a.incidentId} · {a.ts}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Col 2: Detail ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Root cause header */}
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}>
            {/* Title row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 10 }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-4)", margin: "0 0 4px" }}>
                  Root Cause · {sel.id}
                </p>
                <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0, lineHeight: 1.3 }}>
                  {sel.title}
                </h3>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <ConfidenceRing value={sel.confidence} size={56} />
                <p style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-4)", margin: "4px 0 0", textAlign: "center" }}>confidence</p>
              </div>
            </div>

            {/* Root cause text */}
            <p style={{ fontSize: 12, lineHeight: 1.65, color: "var(--text-2)", margin: "0 0 12px" }}>
              {sel.rootCause}
            </p>

            {/* Footer row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                {sel.affectedServices.map(s => <ServiceBadge key={s} name={s} />)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <AlertTriangle size={10} style={{ color: "var(--text-4)" }} />
                <span style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-4)" }}>Verify before action</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <TabStrip tabs={TABS} active={activeTab} onChange={setActiveTab} />

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <AnimatePresence mode="wait">

              {activeTab === "evidence" && (
                <motion.div key="evidence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
                  {sel.evidence.map((ev, i) => <EvidenceRow key={i} ev={ev} />)}
                </motion.div>
              )}

              {activeTab === "recommendations" && (
                <motion.div key="recs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
                  {sel.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 14,
                        padding: "12px 20px", borderBottom: "1px solid var(--border)",
                        cursor: "pointer", transition: "background 0.1s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-2)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontSize: 11, fontFamily: MONO, color: "var(--text-4)", width: 18, flexShrink: 0, paddingTop: 1, textAlign: "right" }}>
                        {i + 1}.
                      </span>
                      <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--text-2)", margin: 0, flex: 1 }}>{rec}</p>
                      <ChevronRight size={12} style={{ color: "var(--text-4)", flexShrink: 0, marginTop: 2 }} />
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === "similar" && (
                <motion.div key="similar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
                  {sel.similar.map(s => (
                    <div
                      key={s.id}
                      style={{
                        display: "flex", alignItems: "center", gap: 16,
                        padding: "14px 20px", borderBottom: "1px solid var(--border)",
                        cursor: "pointer", transition: "background 0.1s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-2)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-3)" }}>{s.id}</span>
                          <span style={{ fontSize: 10, color: "var(--border-2)" }}>·</span>
                          <span style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-4)" }}>{s.ago}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0, lineHeight: 1.4 }}>{s.title}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{
                          fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 2px",
                          fontFamily: MONO,
                          color: s.sim >= 80 ? "var(--red)" : "var(--yellow)",
                        }}>
                          {s.sim}%
                        </p>
                        <p style={{ fontSize: 9, fontFamily: MONO, color: "var(--text-4)", margin: 0 }}>similarity</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* ── Col 3: Chat ── */}
        <div style={{
          width: 300, flexShrink: 0,
          borderLeft: "1px solid var(--border)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          background: "var(--bg)",
        }}>
          <ChatPanel key={sel.id} analysis={sel} />
        </div>

      </div>
    </div>
  );
}
