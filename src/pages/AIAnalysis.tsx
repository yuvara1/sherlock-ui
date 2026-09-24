import { useState, useRef, useEffect } from "react";
import {
  Brain,
  Send,
  BarChart3,
  ScrollText,
  GitBranch,
  GitCommit,
  CheckSquare,
  Square,
  ChevronRight,
  Zap,
  AlertTriangle,
  Clock,
} from "lucide-react";

/* ─── Constants ─── */
const MONO = "Geist Mono, monospace";
const SANS = "Geist, sans-serif";

/* ─── Types ─── */
type Role = "user" | "ai";
interface Message {
  role: Role;
  text: string;
  structured?: StructuredResponse;
}
interface StructuredResponse {
  rootCause?: string;
  evidence?: string[];
  actions?: string[];
}

/* ─── Pre-seeded conversation ─── */
const INITIAL_MESSAGES: Message[] = [
  {
    role: "user",
    text: "We're getting 503 errors from payment-service in production. Error rate is around 40% over the last 20 minutes. Can you help investigate?",
  },
  {
    role: "ai",
    text: "",
    structured: {
      rootCause:
        "Database connection pool exhaustion in payment-service. The HikariCP pool reached its configured maximum of 50 connections at 14:13 UTC, blocking all subsequent database operations. This was triggered by a long-running query introduced in deployment v2.14.1 (deployed at 14:01 UTC) that performs a full table scan on the orders table without an index.",
      evidence: [
        "PostgreSQL query latency spiked from 40ms → 4,489ms starting at 14:09 UTC",
        "HikariCP pool utilization hit 100% (50/50 connections) at 14:13 UTC",
        "payment-service v2.14.1 deployed 12 minutes before the incident began",
        "Log: HikariPool-1: Connection is not available, request timed out after 30000ms",
        "Distributed trace shows PostgreSQL span in processCharge accounting for 98.5% of total latency",
      ],
      actions: [
        "Roll back payment-service to v2.13.4 immediately to restore service",
        "Add index on orders(customer_id, created_at) before next deploy",
        "Increase HikariCP pool size from 50 → 100 as short-term mitigation",
        "Enable slow query log for queries exceeding 500ms",
      ],
    },
  },
  {
    role: "user",
    text: "Which specific commit introduced the slow query?",
  },
  {
    role: "ai",
    text: "",
    structured: {
      rootCause:
        "Commit a3f9c21 by @dev-sam in payment-service v2.14.1 modified the getPaymentsByCustomer() method. The new implementation removed an .index('customer_id_idx') hint and added a date range filter using a computed column, forcing a sequential scan on the orders table (currently 14.2M rows).",
      evidence: [
        "Commit a3f9c21: 'feat: add date range filter to payment history query'",
        "EXPLAIN ANALYZE shows Seq Scan on orders (cost=0.00..284321.48 rows=14200000)",
        "Previous query used Index Scan on customer_id_idx (cost=0.43..8.45 rows=12)",
        "Query execution time: 4,432ms vs 38ms before the change",
      ],
      actions: [
        "Revert commit a3f9c21 or add index on (customer_id, payment_date::date)",
        "Review PR #847 for the date range filter implementation",
        "Add query performance regression test to CI pipeline",
      ],
    },
  },
  {
    role: "user",
    text: "What is the blast radius? Which other services are affected?",
  },
  {
    role: "ai",
    text: "",
    structured: {
      rootCause:
        "The blast radius extends to 3 downstream services that depend on payment-service synchronously. order-service is experiencing elevated error rates as checkout flows fail. notification-svc is accumulating a backlog of failed payment confirmation emails. The customer-portal is showing payment history load failures for approximately 2,400 active sessions.",
      evidence: [
        "order-service: 503 error rate 38% on POST /v1/orders (depends on payment auth)",
        "notification-svc: 12,847 pending payment.confirmed events in DLQ",
        "customer-portal: /payment-history endpoint timing out for 2,400 sessions",
        "No impact detected on inventory-service or user-service",
        "SLA breach threshold (99.5% availability) exceeded at 14:21 UTC",
      ],
      actions: [
        "Trigger PagerDuty escalation for order-service and notification-svc oncall",
        "Enable circuit breaker in order-service to fail-fast on payment-service timeouts",
        "Drain notification-svc DLQ after payment-service recovers",
        "Post customer-facing status page update within 5 minutes",
      ],
    },
  },
];

/* ─── Evidence chips ─── */
const EVIDENCE_CHIPS = [
  {
    type: "trace",
    label: "Trace abc123def456",
    icon: GitBranch,
    color: "var(--accent)",
  },
  {
    type: "log",
    label: "HikariCP pool exhaustion",
    icon: ScrollText,
    color: "var(--text-3)",
  },
  {
    type: "metric",
    label: "DB latency spike 14:09 UTC",
    icon: BarChart3,
    color: "var(--yellow)",
  },
  {
    type: "deploy",
    label: "v2.14.1 deployment 14:01 UTC",
    icon: GitCommit,
    color: "var(--green)",
  },
  {
    type: "metric",
    label: "Error rate 40%",
    icon: BarChart3,
    color: "var(--red)",
  },
  {
    type: "trace",
    label: "Slow query commit a3f9c21",
    icon: GitBranch,
    color: "var(--accent)",
  },
];

/* ─── Suggested actions ─── */
const SUGGESTED_ACTIONS = [
  {
    id: "a1",
    label: "Roll back payment-service to v2.13.4",
    priority: "critical",
  },
  {
    id: "a2",
    label: "Add index on orders(customer_id, created_at)",
    priority: "high",
  },
  { id: "a3", label: "Increase HikariCP pool size to 100", priority: "high" },
  {
    id: "a4",
    label: "Enable circuit breaker in order-service",
    priority: "medium",
  },
  { id: "a5", label: "Drain notification-svc DLQ", priority: "medium" },
  { id: "a6", label: "Post status page update", priority: "low" },
];

function priorityStyle(p: string) {
  if (p === "critical")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    };
  if (p === "high")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    };
  if (p === "medium")
    return {
      color: "var(--accent)",
      bg: "var(--accent-bg)",
      border: "var(--accent-border)",
    };
  return { color: "var(--text-4)", bg: "var(--bg-3)", border: "var(--border)" };
}

/* ─── AI Message bubble ─── */
function AiMessage({ msg }: { msg: Message }) {
  if (msg.structured) {
    const { rootCause, evidence, actions } = msg.structured;
    return (
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-start" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--bg-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          <Brain size={13} style={{ color: "var(--text-3)" }} />
        </div>
        <div
          style={{
            maxWidth: "85%",
            borderRadius: "2px 12px 12px 12px",
            border: "1px solid var(--border)",
            background: "var(--bg-2)",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {rootCause && (
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontFamily: MONO,
                  color: "var(--text-4)",
                  margin: "0 0 6px",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                }}
              >
                Root Cause
              </p>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--text-1)",
                  margin: 0,
                }}
              >
                {rootCause}
              </p>
            </div>
          )}
          {evidence && evidence.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontFamily: MONO,
                  color: "var(--text-4)",
                  margin: "0 0 8px",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                }}
              >
                Evidence
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {evidence.map((e, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "var(--text-4)",
                        flexShrink: 0,
                        marginTop: 6,
                      }}
                    />
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-2)",
                        margin: 0,
                        lineHeight: 1.55,
                        fontFamily: MONO,
                      }}
                    >
                      {e}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {actions && actions.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontFamily: MONO,
                  color: "var(--text-4)",
                  margin: "0 0 8px",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                }}
              >
                Suggested Actions
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {actions.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <ChevronRight
                      size={12}
                      style={{
                        color: "var(--accent)",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-2)",
                        margin: 0,
                        lineHeight: 1.55,
                      }}
                    >
                      {a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-start" }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--bg-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <Brain size={13} style={{ color: "var(--text-3)" }} />
      </div>
      <div
        style={{
          maxWidth: "85%",
          borderRadius: "2px 12px 12px 12px",
          border: "1px solid var(--border)",
          background: "var(--bg-2)",
          padding: "10px 14px",
          fontSize: 13,
          lineHeight: 1.6,
          color: "var(--text-2)",
        }}
      >
        {msg.text}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function AIAnalysis() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [checkedActions, setCheckedActions] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    const reply: Message = {
      role: "ai",
      text: "",
      structured: {
        rootCause: `Analyzing your query about "${text.slice(0, 60)}${text.length > 60 ? "..." : ""}". Based on the correlated evidence from the current incident (INC-094), all signals point to the database connection pool exhaustion triggered by the inefficient query in commit a3f9c21. Review the distributed trace abc123def456 for the full call chain and consider the rollback action as the immediate remediation path.`,
        evidence: [
          "Trace abc123def456 shows 98.5% of latency in PostgreSQL span",
          "HikariCP pool at 50/50 active connections for 22+ minutes",
          "payment-service error rate remains elevated at 38%",
        ],
        actions: [
          "Prioritize rollback to v2.13.4 as immediate action",
          "Verify orders table has index on customer_id before re-deploying v2.14.1",
        ],
      },
    };
    setMessages((prev) => [...prev, { role: "user", text }, reply]);
    setInput("");
  }

  function toggleAction(id: string) {
    setCheckedActions((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        fontFamily: SANS,
        background: "var(--bg)",
      }}
    >
      {/* Page header */}
      <div
        className="responsive-page-header"
        style={{
          padding: "20px 32px 16px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--text-1)",
              margin: "0 0 4px",
            }}
          >
            AI Debugger
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
            AI-powered root cause analysis and incident investigation
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--bg-2)",
          }}
        >
          <Zap size={12} style={{ color: "var(--accent)" }} />
          <span
            style={{ fontSize: 12, fontFamily: MONO, color: "var(--text-3)" }}
          >
            Sherlock AI
          </span>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--green)",
              display: "inline-block",
            }}
          />
        </div>
      </div>

      {/* Two-column body */}
      <div
        className="ai-layout"
        style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}
      >
        {/* Left: Chat (60%) */}
        <div
          className="ai-chat"
          style={{
            flex: "0 0 60%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRight: "1px solid var(--border)",
          }}
        >
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <div
                  key={i}
                  style={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      borderRadius: "12px 12px 2px 12px",
                      background: "var(--accent)",
                      padding: "10px 14px",
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "#fff",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ) : (
                <AiMessage key={i} msg={msg} />
              ),
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 24px 16px",
              borderTop: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about this incident..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--bg-2)",
                  color: "var(--text-1)",
                  fontSize: 13,
                  fontFamily: SANS,
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-2)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: "none",
                  background: input.trim() ? "var(--accent)" : "var(--bg-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() ? "pointer" : "default",
                  flexShrink: 0,
                  transition: "background 0.12s",
                }}
              >
                <Send
                  size={14}
                  style={{ color: input.trim() ? "#fff" : "var(--text-4)" }}
                />
              </button>
            </div>
            <p
              style={{
                fontSize: 11,
                fontFamily: MONO,
                color: "var(--text-4)",
                margin: "6px 0 0",
              }}
            >
              Enter to send · Shift+Enter for newline
            </p>
          </div>
        </div>

        {/* Right: Context panel (40%) */}
        <div
          className="ai-context"
          style={{
            flex: "0 0 40%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ flex: 1, overflowY: "auto" }}>
            {/* Incident Context */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontFamily: MONO,
                  color: "var(--text-4)",
                  margin: "0 0 12px",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                }}
              >
                Incident Context
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Incident", value: "INC-094", mono: true },
                  { label: "Service", value: "payment-service", mono: true },
                  { label: "Severity", value: "Critical", mono: false },
                  { label: "Started", value: "14:13 UTC today", mono: true },
                  { label: "Duration", value: "22+ minutes", mono: true },
                  { label: "Error rate", value: "38%", mono: true },
                  {
                    label: "Deployment",
                    value: "v2.14.1 at 14:01 UTC",
                    mono: true,
                  },
                ].map((f) => (
                  <div
                    key={f.label}
                    style={{ display: "flex", alignItems: "baseline", gap: 8 }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-4)",
                        width: 90,
                        flexShrink: 0,
                      }}
                    >
                      {f.label}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-1)",
                        fontFamily: f.mono ? MONO : SANS,
                        fontWeight: 500,
                      }}
                    >
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 6,
                  background: "var(--red-bg)",
                  border: "1px solid var(--red-border)",
                }}
              >
                <AlertTriangle
                  size={12}
                  style={{ color: "var(--red)", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--red)",
                    fontFamily: MONO,
                  }}
                >
                  SLA breach — 99.5% threshold exceeded
                </span>
              </div>
            </div>

            {/* Evidence */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontFamily: MONO,
                  color: "var(--text-4)",
                  margin: "0 0 12px",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                }}
              >
                Evidence
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {EVIDENCE_CHIPS.map((chip, i) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 10px",
                        borderRadius: 6,
                        border: "1px solid var(--border)",
                        background: "var(--bg-2)",
                        color: "var(--text-2)",
                        cursor: "pointer",
                        fontFamily: MONO,
                        fontSize: 11,
                        transition: "border-color 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--border-2)";
                        e.currentTarget.style.color = "var(--text-1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text-2)";
                      }}
                    >
                      <Icon
                        size={10}
                        style={{ color: chip.color, flexShrink: 0 }}
                      />
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Suggested Actions */}
            <div style={{ padding: "16px 20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontFamily: MONO,
                    color: "var(--text-4)",
                    margin: 0,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.05em",
                  }}
                >
                  Suggested Actions
                </p>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: MONO,
                    color: "var(--text-4)",
                  }}
                >
                  {checkedActions.size}/{SUGGESTED_ACTIONS.length} done
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {SUGGESTED_ACTIONS.map((action) => {
                  const checked = checkedActions.has(action.id);
                  const ps = priorityStyle(action.priority);
                  return (
                    <div
                      key={action.id}
                      onClick={() => toggleAction(action.id)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: checked ? "var(--bg-3)" : "var(--bg-2)",
                        cursor: "pointer",
                        transition: "all 0.1s",
                        opacity: checked ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--border-2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                      }}
                    >
                      <div
                        style={{
                          flexShrink: 0,
                          marginTop: 1,
                          color: checked ? "var(--text-4)" : "var(--text-3)",
                        }}
                      >
                        {checked ? (
                          <CheckSquare size={14} />
                        ) : (
                          <Square size={14} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: 12,
                            color: checked ? "var(--text-4)" : "var(--text-1)",
                            margin: "0 0 5px",
                            lineHeight: 1.4,
                            textDecoration: checked ? "line-through" : "none",
                          }}
                        >
                          {action.label}
                        </p>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: MONO,
                            fontWeight: 600,
                            padding: "1px 5px",
                            borderRadius: 3,
                            color: ps.color,
                            background: ps.bg,
                            border: `1px solid ${ps.border}`,
                            textTransform: "capitalize" as const,
                          }}
                        >
                          {action.priority}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
