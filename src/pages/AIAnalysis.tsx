import { useState, useRef, useEffect } from "react"
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
} from "lucide-react"
/* ─── Constants ─── */
const MONO = "Geist Mono, monospace"
const SANS = "Geist, sans-serif"
/* ─── Types ─── */
type Role = "user" | "ai"
interface Message {
  role: Role
  text: string
  structured?: StructuredResponse
}
interface StructuredResponse {
  rootCause?: string
  evidence?: string[]
  actions?: string[]
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
]
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
]
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
]
function priorityStyle(p: string) {
  if (p === "critical")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    }
  if (p === "high")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    }
  if (p === "medium")
    return {
      color: "var(--accent)",
      bg: "var(--accent-bg)",
      border: "var(--accent-border)",
    }
  return { color: "var(--text-4)", bg: "var(--bg-3)", border: "var(--border)" }
}
/* ─── AI Message bubble ─── */
function AiMessage({ msg }: { msg: Message }) {
  if (msg.structured) {
    const { rootCause, evidence, actions } = msg.structured
    return (
      <div className="[display:flex] [gap:10px] [justify-content:flex-start]">
        <div className="[width:28px] [height:28px] [border-radius:8px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0] [margin-top:2px]">
          <Brain size={13} className="[color:var(--text-3)]" />
        </div>
        <div className="[max-width:85%] [border-radius:2px_12px_12px_12px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [padding:14px_16px] [display:flex] [flex-direction:column] [gap:14px]">
          {rootCause && (
            <div>
              <p
                style={{
                  fontFamily: MONO,
                  textTransform: "uppercase" as const,
                }}
                className="[font-size:11px] [color:var(--text-4)] [margin:0_0_6px] [letter-spacing:0.05em]"
              >
                Root Cause
              </p>
              <p className="[font-size:13px] [line-height:1.6] [color:var(--text-1)] [margin:0]">
                {rootCause}
              </p>
            </div>
          )}
          {evidence && evidence.length > 0 && (
            <div>
              <p
                style={{
                  fontFamily: MONO,
                  textTransform: "uppercase" as const,
                }}
                className="[font-size:11px] [color:var(--text-4)] [margin:0_0_8px] [letter-spacing:0.05em]"
              >
                Evidence
              </p>
              <div className="[display:flex] [flex-direction:column] [gap:5px]">
                {evidence.map((e, i) => (
                  <div
                    key={i}
                    className="[display:flex] [align-items:flex-start] [gap:8px]"
                  >
                    <span className="[width:4px] [height:4px] [border-radius:50%] [background:var(--text-4)] [flex-shrink:0] [margin-top:6px]" />
                    <p
                      style={{
                        fontFamily: MONO,
                      }}
                      className="[font-size:12px] [color:var(--text-2)] [margin:0] [line-height:1.55]"
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
                  fontFamily: MONO,
                  textTransform: "uppercase" as const,
                }}
                className="[font-size:11px] [color:var(--text-4)] [margin:0_0_8px] [letter-spacing:0.05em]"
              >
                Suggested Actions
              </p>
              <div className="[display:flex] [flex-direction:column] [gap:5px]">
                {actions.map((a, i) => (
                  <div
                    key={i}
                    className="[display:flex] [align-items:flex-start] [gap:8px]"
                  >
                    <ChevronRight
                      size={12}
                      className="[color:var(--accent)] [flex-shrink:0] [margin-top:2px]"
                    />
                    <p className="[font-size:12px] [color:var(--text-2)] [margin:0] [line-height:1.55]">
                      {a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
  return (
    <div className="[display:flex] [gap:10px] [justify-content:flex-start]">
      <div className="[width:28px] [height:28px] [border-radius:8px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0] [margin-top:2px]">
        <Brain size={13} className="[color:var(--text-3)]" />
      </div>
      <div className="[max-width:85%] [border-radius:2px_12px_12px_12px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [padding:10px_14px] [font-size:13px] [line-height:1.6] [color:var(--text-2)]">
        {msg.text}
      </div>
    </div>
  )
}
/* ─── Main ─── */
export default function AIAnalysis() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [checkedActions, setCheckedActions] = useState<Set<string>>(new Set())
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  function handleSend() {
    const text = input.trim()
    if (!text) return
    const reply: Message = {
      role: "ai",
      text: "",
      structured: {
        rootCause: `Analyzing your query about "${text.slice(0, 60)}${
          text.length > 60 ? "..." : ""
        }". Based on the correlated evidence from the current incident (INC-094), all signals point to the database connection pool exhaustion triggered by the inefficient query in commit a3f9c21. Review the distributed trace abc123def456 for the full call chain and consider the rollback action as the immediate remediation path.`,
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
    }
    setMessages((prev) => [...prev, { role: "user", text }, reply])
    setInput("")
  }
  function toggleAction(id: string) {
    setCheckedActions((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  return (
    <div
      style={{
        fontFamily: SANS,
      }}
      className="[display:flex] [flex-direction:column] [height:100%] [overflow:hidden] [background:var(--bg)]"
    >
      {/* Page header */}
      <div className="max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:20px_32px_16px] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [display:flex] [align-items:center] [justify-content:space-between]">
        <div>
          <h1 className="[font-size:18px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)] [margin:0_0_4px]">
            AI Debugger
          </h1>
          <p className="[font-size:13px] [color:var(--text-3)] [margin:0]">
            AI-powered root cause analysis and incident investigation
          </p>
        </div>
        <div className="[display:flex] [align-items:center] [gap:8px] [padding:6px_12px] [border-radius:8px] [border:1px_solid_var(--border)] [background:var(--bg-2)]">
          <Zap size={12} className="[color:var(--accent)]" />
          <span
            style={{
              fontFamily: MONO,
            }}
            className="[font-size:12px] [color:var(--text-3)]"
          >
            Sherlock AI
          </span>
          <span className="[width:6px] [height:6px] [border-radius:50%] [background:var(--green)] [display:inline-block]" />
        </div>
      </div>

      {/* Two-column body */}
      <div className="max-[1100px]:flex-col max-[1100px]:overflow-y-auto [flex:1] [display:flex] [overflow:hidden] [min-height:0]">
        {/* Left: Chat (60%) */}
        <div className="max-[1100px]:flex-auto max-[1100px]:w-full max-[1100px]:min-h-[420px] max-[1100px]:border-r-0 [flex:0_0_60%] [display:flex] [flex-direction:column] [overflow:hidden] [border-right:1px_solid_var(--border)]">
          {/* Messages */}
          <div className="[flex:1] [overflow-y:auto] [padding:20px_24px] [display:flex] [flex-direction:column] [gap:16px]">
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <div
                  key={i}
                  className="[display:flex] [justify-content:flex-end]"
                >
                  <div className="[max-width:80%] [border-radius:12px_12px_2px_12px] [background:var(--accent)] [padding:10px_14px] [font-size:13px] [line-height:1.6] [color:#fff]">
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
          <div className="[padding:12px_24px_16px] [border-top:1px_solid_var(--border)] [flex-shrink:0]">
            <div className="[display:flex] [gap:10px]">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask about this incident..."
                style={{
                  fontFamily: SANS,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-2)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
                className="[flex:1] [padding:10px_14px] [border-radius:8px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [color:var(--text-1)] [font-size:13px] [outline:none]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={[
                  "[width:40px] [height:40px] [border-radius:8px] [border:none] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0] [transition:background_0.12s]",
                  input.trim()
                    ? "[background:var(--accent)]"
                    : "[background:var(--bg-3)]",
                  input.trim() ? "[cursor:pointer]" : "[cursor:default]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Send
                  size={14}
                  className={[
                    input.trim() ? "[color:#fff]" : "[color:var(--text-4)]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              </button>
            </div>
            <p
              style={{
                fontFamily: MONO,
              }}
              className="[font-size:11px] [color:var(--text-4)] [margin:6px_0_0]"
            >
              Enter to send · Shift+Enter for newline
            </p>
          </div>
        </div>

        {/* Right: Context panel (40%) */}
        <div className="max-[1100px]:flex-auto max-[1100px]:w-full max-[1100px]:min-h-[420px] max-[1100px]:border-r-0 max-[1100px]:border-t max-[1100px]:border-[var(--border)] [flex:0_0_40%] [display:flex] [flex-direction:column] [overflow:hidden]">
          <div className="[flex:1] [overflow-y:auto]">
            {/* Incident Context */}
            <div className="[padding:16px_20px] [border-bottom:1px_solid_var(--border)]">
              <p
                style={{
                  fontFamily: MONO,
                  textTransform: "uppercase" as const,
                }}
                className="[font-size:11px] [color:var(--text-4)] [margin:0_0_12px] [letter-spacing:0.05em]"
              >
                Incident Context
              </p>
              <div className="[display:flex] [flex-direction:column] [gap:8px]">
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
                    className="[display:flex] [align-items:baseline] [gap:8px]"
                  >
                    <span className="[font-size:12px] [color:var(--text-4)] [width:90px] [flex-shrink:0]">
                      {f.label}
                    </span>
                    <span
                      style={{
                        fontFamily: f.mono ? MONO : SANS,
                      }}
                      className="[font-size:12px] [color:var(--text-1)] [font-weight:500]"
                    >
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="[margin-top:12px] [display:flex] [align-items:center] [gap:6px] [padding:8px_12px] [border-radius:6px] [background:var(--red-bg)] [border:1px_solid_var(--red-border)]">
                <AlertTriangle
                  size={12}
                  className="[color:var(--red)] [flex-shrink:0]"
                />
                <span
                  style={{
                    fontFamily: MONO,
                  }}
                  className="[font-size:11px] [color:var(--red)]"
                >
                  SLA breach — 99.5% threshold exceeded
                </span>
              </div>
            </div>

            {/* Evidence */}
            <div className="[padding:16px_20px] [border-bottom:1px_solid_var(--border)]">
              <p
                style={{
                  fontFamily: MONO,
                  textTransform: "uppercase" as const,
                }}
                className="[font-size:11px] [color:var(--text-4)] [margin:0_0_12px] [letter-spacing:0.05em]"
              >
                Evidence
              </p>
              <div className="[display:flex] [flex-wrap:wrap] [gap:6px]">
                {EVIDENCE_CHIPS.map((chip, i) => {
                  const Icon = chip.icon
                  return (
                    <button
                      key={i}
                      style={{
                        fontFamily: MONO,
                      }}
                      className="[display:flex] [align-items:center] [gap:5px] [padding:4px_10px] [border-radius:6px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [color:var(--text-2)] [cursor:pointer] [font-size:11px] [transition:border-color_0.1s] hover:[border-color:var(--border-2)] hover:[color:var(--text-1)]"
                    >
                      <Icon
                        size={10}
                        style={{
                          color: chip.color,
                        }}
                        className="[flex-shrink:0]"
                      />
                      {chip.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Suggested Actions */}
            <div className="[padding:16px_20px]">
              <div className="[display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:12px]">
                <p
                  style={{
                    fontFamily: MONO,
                    textTransform: "uppercase" as const,
                  }}
                  className="[font-size:11px] [color:var(--text-4)] [margin:0] [letter-spacing:0.05em]"
                >
                  Suggested Actions
                </p>
                <span
                  style={{
                    fontFamily: MONO,
                  }}
                  className="[font-size:10px] [color:var(--text-4)]"
                >
                  {checkedActions.size}/{SUGGESTED_ACTIONS.length} done
                </span>
              </div>
              <div className="[display:flex] [flex-direction:column] [gap:6px]">
                {SUGGESTED_ACTIONS.map((action) => {
                  const checked = checkedActions.has(action.id)
                  const ps = priorityStyle(action.priority)
                  return (
                    <div
                      key={action.id}
                      onClick={() => toggleAction(action.id)}
                      className={[
                        [
                          "[display:flex] [align-items:flex-start] [gap:10px] [padding:10px_12px] [border-radius:8px] [border:1px_solid_var(--border)] [cursor:pointer] [transition:all_0.1s]",
                          checked
                            ? "[background:var(--bg-3)]"
                            : "[background:var(--bg-2)]",
                          checked ? "[opacity:0.6]" : "[opacity:1]",
                        ]
                          .filter(Boolean)
                          .join(" "),
                        "hover:[border-color:var(--border-2)]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div
                        className={[
                          "[flex-shrink:0] [margin-top:1px]",
                          checked
                            ? "[color:var(--text-4)]"
                            : "[color:var(--text-3)]",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {checked ? (
                          <CheckSquare size={14} />
                        ) : (
                          <Square size={14} />
                        )}
                      </div>
                      <div className="[flex:1]">
                        <p
                          className={[
                            "[font-size:12px] [margin:0_0_5px] [line-height:1.4]",
                            checked
                              ? "[color:var(--text-4)]"
                              : "[color:var(--text-1)]",
                            checked
                              ? "[text-decoration:line-through]"
                              : "[text-decoration:none]",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {action.label}
                        </p>
                        <span
                          style={{
                            fontFamily: MONO,
                            color: ps.color,
                            background: ps.bg,
                            border: `1px solid ${ps.border}`,
                            textTransform: "capitalize" as const,
                          }}
                          className="[font-size:10px] [font-weight:600] [padding:1px_5px] [border-radius:3px]"
                        >
                          {action.priority}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
