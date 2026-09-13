import { useState } from "react";
import { Brain, CheckCircle, GitCommit, BarChart3, ScrollText, GitBranch, Zap, ChevronRight, AlertTriangle, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ── Data ─────────────────────────────────────────────── */
const ANALYSES = [
  {
    id: "RCA-094", incidentId: "INC-094", ts: "14:35:45",
    title: "Database connection pool exhaustion",
    confidence: 91,
    rootCause: "Database connection pool exhaustion caused by a long-running query introduced in deployment v2.14.1. The HikariCP pool reached its configured maximum of 50 connections, blocking all subsequent database operations and causing cascading 503 errors in the payment processing pipeline.",
    evidence: [
      { type: "metric",     text: "PostgreSQL query latency increased from 40ms to 4.5s at 13:48 UTC",         conf: "high"   },
      { type: "metric",     text: "Connection pool utilization reached 100% (50/50 connections active)",        conf: "high"   },
      { type: "deployment", text: "payment-service v2.14.1 deployed 34 minutes before incident began",          conf: "high"   },
      { type: "log",        text: "HikariPool-1: Connection is not available, request timed out after 30000ms", conf: "high"   },
      { type: "trace",      text: "PostgreSQL span in processCharge increased from 40ms → 4489ms",              conf: "high"   },
      { type: "inference",  text: "New query in v2.14.1 likely performs a full table scan on orders table",     conf: "medium" },
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
    id: "RCA-091", incidentId: "INC-091", ts: "09:18:22",
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
      "Alert on consumer lag > 1000 messages",
    ],
    similar: [
      { id: "INC-078", title: "Kafka lag — analytics consumer", ago: "19 days ago", sim: 81 },
    ],
  },
];

const TYPE_META: Record<string, { icon: any; label: string; color: string }> = {
  metric:     { icon: BarChart3,  label: "Metric",     color: "var(--blue)"   },
  log:        { icon: ScrollText, label: "Log",        color: "var(--text-3)" },
  trace:      { icon: GitBranch,  label: "Trace",      color: "var(--accent)" },
  deployment: { icon: GitCommit,  label: "Deploy",     color: "var(--yellow)" },
  inference:  { icon: Brain,      label: "Inference",  color: "var(--text-4)" },
};

const CHAT_STARTERS = [
  "Why did the connection pool exhaust so quickly?",
  "Which commit introduced the slow query?",
  "What is the blast radius of this incident?",
];

/* ── Main ─────────────────────────────────────────────── */
export default function AIAnalysis() {
  const [sel,      setSel]      = useState(ANALYSES[0]);
  const [query,    setQuery]    = useState("");
  const [messages, setMessages] = useState<{role:"user"|"ai";text:string}[]>([]);
  const [activeTab, setActiveTab] = useState<"evidence"|"recommendations"|"similar">("evidence");

  const conf  = sel.confidence;
  const r     = 15.9;
  const circ  = 2 * Math.PI * r;
  const dash  = (conf / 100) * circ;

  function sendMessage(text: string) {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: "user", text }, { role: "ai", text: `Analyzing ${sel.id}: ${text} — Based on the evidence, this appears to be related to the ${sel.title.toLowerCase()}. Review the correlated traces in span abc123def456 for more detail.` }]);
    setQuery("");
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "Geist, sans-serif", fontSize: 13, letterSpacing: "-0.004em" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
        background: "var(--bg)",
      }}>
        <div>
          <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 2px", letterSpacing: 0 }}>AI-Powered</p>
          <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Root Cause Analysis</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-2)" }}>
          <Zap size={11} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color: "var(--text-3)" }}>Sherlock AI</span>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
        </div>
      </div>

      {/* 3-column layout */}
      <div className="ai-3col" style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Col 1: Analysis list ── */}
        <div className="ai-col-list" style={{ width: 240, flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-3)", margin: 0 }}>Recent Analyses</p>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {ANALYSES.map(a => (
              <div key={a.id} onClick={() => setSel(a)} style={{
                padding: "12px 12px",
                cursor: "pointer",
                borderBottom: "1px solid var(--border)",
                background: sel.id === a.id ? "var(--accent-bg)" : "transparent",
                borderLeft: sel.id === a.id ? "2px solid var(--accent)" : "2px solid transparent",
                transition: "background 0.1s",
              }}
                onMouseEnter={e => { if (sel.id !== a.id) (e.currentTarget as HTMLDivElement).style.background = "var(--bg-2)"; }}
                onMouseLeave={e => { if (sel.id !== a.id) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: sel.id === a.id ? "var(--accent)" : "var(--text-4)" }}>{a.id}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 24, height: 24, position: "relative" }}>
                      <svg width="24" height="24" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke={sel.id === a.id ? "var(--accent)" : "var(--text-3)"} strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${(a.confidence / 100) * (2 * Math.PI * 15.9)} ${2 * Math.PI * 15.9}`}
                        />
                      </svg>
                      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 6, fontFamily: "Geist Mono, monospace", fontWeight: 700, color: sel.id === a.id ? "var(--accent)" : "var(--text-3)" }}>{a.confidence}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.4, color: "var(--text-2)", margin: "0 0 4px" }}>{a.title}</p>
                <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: 0 }}>{a.incidentId} · {a.ts}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Col 2: Detail ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Root cause card */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Brain size={13} style={{ color: "var(--text-3)" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: "0 0 1px" }}>Root Cause · {sel.id}</p>
                    <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>{sel.title}</h3>
                  </div>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-2)", margin: 0 }}>{sel.rootCause}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  {sel.affectedServices.map(s => (
                    <span key={s} style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", padding: "2px 8px", borderRadius: 4, border: "1px solid var(--red-border)", color: "var(--red)", background: "var(--red-bg)" }}>
                      {s}
                    </span>
                  ))}
                  <span style={{ fontSize: 11, color: "var(--text-4)", marginLeft: "auto" }}>
                    <AlertTriangle size={11} style={{ display: "inline", marginRight: 3, verticalAlign: "middle" }} />
                    Verify before action
                  </span>
                </div>
              </div>

              {/* Confidence ring */}
              <div style={{ textAlign: "center", flexShrink: 0, width: 80 }}>
                <svg width="80" height="80" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", display: "block", margin: "0 auto" }}>
                  <circle cx="18" cy="18" r={r} fill="none" stroke="var(--border)" strokeWidth="2.5" />
                  <motion.circle
                    cx="18" cy="18" r={r} fill="none"
                    stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${circ}` }}
                    animate={{ strokeDasharray: `${dash} ${circ - dash}` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  />
                </svg>
                <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em", color: "var(--accent)", margin: "-58px 0 0", fontFamily: "Geist Mono, monospace" }}>{conf}%</p>
                <p style={{ fontSize: 10, color: "var(--text-4)", margin: "42px 0 0" }}>confidence</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", padding: "0 20px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            {([["evidence", `Evidence (${sel.evidence.length})`], ["recommendations", "Recommendations"], ["similar", "Similar"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                fontSize: 12, padding: "8px 12px", cursor: "pointer",
                background: "transparent", border: "none", borderBottom: "2px solid",
                borderBottomColor: activeTab === id ? "var(--text-1)" : "transparent",
                color: activeTab === id ? "var(--text-1)" : "var(--text-3)",
                marginBottom: -1, transition: "color 0.1s",
              }}>{label}</button>
            ))}
          </div>

          {/* Tab content — scrollable */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <AnimatePresence mode="wait">
              {activeTab === "evidence" && (
                <motion.div key="ev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                  {sel.evidence.map((e, i) => {
                    const meta = TYPE_META[e.type] ?? TYPE_META.inference;
                    const Icon = meta.icon;
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        padding: "10px 20px",
                        borderBottom: "1px solid var(--border)",
                        cursor: "default",
                        transition: "background 0.1s",
                      }}
                        onMouseEnter={ev => (ev.currentTarget.style.background = "var(--bg-2)")}
                        onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}
                      >
                        <div style={{ width: 24, height: 24, borderRadius: 5, border: "1px solid var(--border)", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          <Icon size={11} style={{ color: meta.color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-1)", margin: "0 0 4px" }}>{e.text}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: meta.color, padding: "1px 5px", borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg-3)" }}>{meta.label}</span>
                            <span style={{ fontSize: 11, color: e.conf === "high" ? "var(--green)" : "var(--yellow)" }}>
                              <CheckCircle size={10} style={{ display: "inline", marginRight: 3, verticalAlign: "middle" }} />
                              {e.conf} confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {activeTab === "recommendations" && (
                <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                  {sel.recommendations.map((rec, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "12px 20px", borderBottom: "1px solid var(--border)",
                      cursor: "pointer", transition: "background 0.1s",
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-2)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                    >
                      <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", width: 20, flexShrink: 0, paddingTop: 1 }}>{i + 1}.</span>
                      <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-2)", margin: 0, flex: 1 }}>{rec}</p>
                      <ChevronRight size={12} style={{ color: "var(--text-4)", flexShrink: 0, marginTop: 3 }} />
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === "similar" && (
                <motion.div key="sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                  {sel.similar.map(s => (
                    <div key={s.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 20px", borderBottom: "1px solid var(--border)",
                      cursor: "pointer", transition: "background 0.1s",
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-2)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{s.id}</span>
                          <span style={{ fontSize: 11, color: "var(--text-4)" }}>·</span>
                          <span style={{ fontSize: 11, color: "var(--text-4)" }}>{s.ago}</span>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>{s.title}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: s.sim > 80 ? "var(--red)" : "var(--yellow)", margin: 0, fontFamily: "Geist Mono, monospace" }}>{s.sim}%</p>
                        <p style={{ fontSize: 10, color: "var(--text-4)", margin: 0 }}>similarity</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Col 3: AI Chat ── */}
        <div className="ai-col-chat" style={{ width: 320, flexShrink: 0, borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Brain size={12} style={{ color: "var(--accent)" }} />
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)", margin: 0 }}>Ask Sherlock</p>
          </div>

          {/* Message list */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 12, color: "var(--text-4)", margin: "0 0 8px" }}>Try asking:</p>
                {CHAT_STARTERS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    style={{ textAlign: "left", fontSize: 12, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-2)", color: "var(--text-2)", cursor: "pointer", lineHeight: 1.4 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-2)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-1)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";   (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)"; }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "85%", fontSize: 12, lineHeight: 1.5, padding: "8px 12px", borderRadius: 8,
                  background: m.role === "user" ? "var(--text-1)" : "var(--bg-2)",
                  color: m.role === "user" ? "var(--bg)" : "var(--text-2)",
                  border: m.role === "ai" ? "1px solid var(--border)" : "none",
                }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: 12, borderTop: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-2)" }}>
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(query); } }}
                placeholder="Ask about this incident…"
                rows={2}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 12, color: "var(--text-1)", fontFamily: "Geist, sans-serif", lineHeight: 1.5 }}
              />
              <button onClick={() => sendMessage(query)} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: query.trim() ? "var(--text-1)" : "var(--bg-3)" }}>
                <Send size={12} style={{ color: query.trim() ? "var(--bg)" : "var(--text-4)" }} />
              </button>
            </div>
            <p style={{ fontSize: 10, color: "var(--text-4)", margin: "6px 2px 0" }}>Enter to send · Shift+Enter for newline</p>
          </div>
        </div>
      </div>
    </div>
  );
}
