import { useState } from "react";
import { Search, GitBranch, X, Clock } from "lucide-react";
import { motion } from "motion/react";

const TRACES = [
  { id: "abc123def456", service: "payment-service",   op: "processCharge",       dur: 4532, spans: 8,  errors: 2, ts: "14:35:12", status: "error"   },
  { id: "fed789abc012", service: "order-service",     op: "createOrder",         dur: 842,  spans: 12, errors: 1, ts: "14:34:58", status: "error"   },
  { id: "aab112ccd334", service: "user-service",      op: "validateToken",       dur: 312,  spans: 3,  errors: 0, ts: "14:34:48", status: "slow"    },
  { id: "xyz789uvw456", service: "notification-svc",  op: "sendEmail",           dur: 1820, spans: 5,  errors: 1, ts: "14:34:44", status: "error"   },
  { id: "lmn123opq456", service: "inventory-api",     op: "reserveStock",        dur: 98,   spans: 4,  errors: 0, ts: "14:33:10", status: "ok"      },
  { id: "qqr890stu234", service: "fraud-detection",   op: "evaluateTransaction", dur: 623,  spans: 6,  errors: 0, ts: "14:33:02", status: "ok"      },
  { id: "vvw567xyz890", service: "analytics-service", op: "trackEvent",          dur: 44,   spans: 2,  errors: 0, ts: "14:32:55", status: "ok"      },
  { id: "bbc223dde445", service: "payment-service",   op: "processCharge",       dur: 3912, spans: 8,  errors: 1, ts: "14:32:40", status: "error"   },
  { id: "zzA123bcD456", service: "user-service",      op: "getUserProfile",      dur: 28,   spans: 2,  errors: 0, ts: "14:32:21", status: "ok"      },
  { id: "efG789hiJ012", service: "order-service",     op: "listOrders",          dur: 1240, spans: 7,  errors: 0, ts: "14:32:10", status: "slow"    },
  { id: "klM345noP678", service: "inventory-api",     op: "checkAvailability",   dur: 55,   spans: 3,  errors: 0, ts: "14:31:58", status: "ok"      },
  { id: "qrS901tuV234", service: "payment-service",   op: "refundCharge",        dur: 2100, spans: 9,  errors: 0, ts: "14:31:44", status: "slow"    },
];

const SPANS_BY_TRACE: Record<string, Array<{name:string;service:string;dur:number;slow:boolean;depth:number}>> = {
  "abc123def456": [
    { name: "POST /v1/payments/charge",      service: "api-gateway",     dur: 4532,  slow: true,  depth: 0 },
    { name: "AuthMiddleware.validate",       service: "api-gateway",     dur: 22,    slow: false, depth: 1 },
    { name: "RateLimit.check",              service: "api-gateway",     dur: 6,     slow: false, depth: 1 },
    { name: "PaymentService.processCharge", service: "payment-service", dur: 4505,  slow: true,  depth: 1 },
    { name: "RiskEngine.evaluate",          service: "payment-service", dur: 85,    slow: false, depth: 2 },
    { name: "HikariPool.getConnection",     service: "payment-service", dur: 30000, slow: true,  depth: 2 },
    { name: "PostgreSQL.executeQuery",      service: "payment-service", dur: 4380,  slow: true,  depth: 2 },
    { name: "AuditLog.write",               service: "payment-service", dur: 8,     slow: false, depth: 2 },
  ],
  "fed789abc012": [
    { name: "POST /v1/orders",              service: "api-gateway",      dur: 842, slow: false, depth: 0 },
    { name: "OrderService.createOrder",     service: "order-service",    dur: 820, slow: false, depth: 1 },
    { name: "InventoryAPI.reserveStock",    service: "inventory-api",    dur: 98,  slow: false, depth: 2 },
    { name: "Redis.get sku=PROD-881",       service: "inventory-api",    dur: 2,   slow: false, depth: 3 },
    { name: "PaymentService.processCharge", service: "payment-service",  dur: 503, slow: true,  depth: 2 },
    { name: "NotificationSvc.sendConfirm",  service: "notification-svc", dur: 44,  slow: false, depth: 2 },
    { name: "Kafka.produce order.created",  service: "order-service",    dur: 12,  slow: false, depth: 2 },
    { name: "DB.insertOrder",               service: "order-service",    dur: 38,  slow: false, depth: 2 },
  ],
};

const DEFAULT_SPANS = [
  { name: "GET /",    service: "api-gateway", dur: 100, slow: false, depth: 0 },
  { name: "Handler",  service: "api-gateway", dur: 80,  slow: false, depth: 1 },
  { name: "DB.query", service: "api-gateway", dur: 40,  slow: false, depth: 2 },
];

function statusStyle(s: string) {
  if (s === "error") return { color: "var(--red)",    bg: "var(--red-bg)",    border: "var(--red-border)"    };
  if (s === "slow")  return { color: "var(--yellow)", bg: "var(--yellow-bg)", border: "var(--yellow-border)" };
  return                    { color: "var(--green)",  bg: "var(--green-bg)",  border: "var(--green-border)"  };
}

function fmtDur(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

export default function Traces() {
  const [search, setSearch] = useState("");
  const [trace,  setTrace]  = useState<typeof TRACES[0] | null>(null);
  const [span,   setSpan]   = useState<typeof DEFAULT_SPANS[0] | null>(null);
  const [filter, setFilter] = useState("all");

  const list = TRACES.filter(t =>
    (t.id.includes(search) || t.service.includes(search) || t.op.includes(search)) &&
    (filter === "all" || t.status === filter)
  );

  const spans  = trace ? (SPANS_BY_TRACE[trace.id] ?? DEFAULT_SPANS) : [];
  const maxDur = Math.max(...spans.map(s => Math.min(s.dur, 5000)), 1);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "Geist, sans-serif", fontSize: 13, letterSpacing: "-0.004em" }}>

      {/* Page header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
        background: "var(--bg)",
      }}>
        <div>
          <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 2px", letterSpacing: 0 }}>Observability</p>
          <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Trace Explorer</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[["all","All"], ["error","Errors"], ["slow","Slow"], ["ok","OK"]].map(([v, l]) => {
            const active = filter === v;
            const st = v !== "all" ? statusStyle(v) : null;
            return (
              <button key={v} onClick={() => setFilter(v)} style={{
                fontSize: 12, padding: "4px 10px", borderRadius: 6, cursor: "pointer", border: "1px solid",
                borderColor: active && st ? st.border : active ? "var(--border-2)" : "var(--border)",
                background: active && st ? st.bg : active ? "var(--bg-3)" : "transparent",
                color: active && st ? st.color : active ? "var(--text-1)" : "var(--text-3)",
                transition: "all 0.1s",
              }}>{l}</button>
            );
          })}
        </div>
      </div>

      {/* Split body */}
      <div className="split-layout" style={{ flex: 1 }}>

        {/* Left: trace list */}
        <div className="split-list" style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", overflow: "hidden" }}>
          {/* Search — sticky */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--bg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-2)" }}>
              <Search size={11} style={{ color: "var(--text-4)", flexShrink: 0 }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search traces…"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 12, color: "var(--text-2)", fontFamily: "Geist Mono, monospace" }}
              />
            </div>
            <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: "6px 2px 0" }}>
              {list.length} traces · live
            </p>
          </div>

          {/* List — scrollable */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {list.map(t => {
              const ss = statusStyle(t.status);
              const active = trace?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => { setTrace(t); setSpan(null); }}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border)",
                    background: active ? "var(--accent-bg)" : "transparent",
                    borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-2)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{t.id.slice(0, 14)}</span>
                    <span style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{t.ts}</span>
                  </div>
                  <p style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", fontWeight: 500, color: active ? "var(--accent)" : "var(--text-1)", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.op}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "Geist Mono, monospace" }}>
                    <span style={{ color: "var(--text-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{t.service}</span>
                    <span style={{ padding: "1px 5px", borderRadius: 4, border: `1px solid ${ss.border}`, color: ss.color, background: ss.bg, flexShrink: 0 }}>{t.status}</span>
                    <span style={{ color: t.dur > 1000 ? "var(--yellow)" : "var(--text-3)", flexShrink: 0 }}>{fmtDur(t.dur)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: waterfall / empty state */}
        {trace ? (
          <div className="split-detail" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Trace summary header — sticky */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 20px",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
              background: "var(--bg-2)",
            }}>
              <div>
                <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: "0 0 2px" }}>{trace.id}</p>
                <p style={{ fontSize: 13, fontFamily: "Geist Mono, monospace", fontWeight: 600, color: "var(--text-1)", margin: 0 }}>{trace.op}</p>
                <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: "2px 0 0" }}>{trace.service} · {trace.spans} spans · {trace.ts}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em", color: trace.dur > 1000 ? "var(--yellow)" : "var(--green)", margin: 0, fontFamily: "Geist Mono, monospace" }}>
                    {fmtDur(trace.dur)}
                  </p>
                  <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: 0 }}>total</p>
                </div>
                <button onClick={() => { setTrace(null); setSpan(null); }} style={{ color: "var(--text-4)", background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Waterfall column header — sticky */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px",
              gap: 8,
              padding: "0 20px",
              height: 32,
              alignItems: "center",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
              background: "var(--bg-2)",
              position: "sticky",
              top: 0,
              zIndex: 5,
            }}>
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.02em", color: "var(--text-3)" }}>Span</div>
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.02em", color: "var(--text-3)", textAlign: "right" }}>Duration</div>
            </div>

            {/* Span rows — scrollable */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {spans.map((s, i) => (
                <div
                  key={i}
                  onClick={() => setSpan(span === s ? null : s)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px",
                    gap: 8,
                    padding: "8px 20px",
                    alignItems: "center",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border)",
                    background: span === s ? "var(--bg-3)" : "transparent",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { if (span !== s) e.currentTarget.style.background = "var(--bg-2)"; }}
                  onMouseLeave={e => { if (span !== s) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Name with depth indent */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: `${s.depth * 12}px`, minWidth: 0 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: s.slow ? "var(--red)" : "var(--border-2)" }} />
                    <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.name}
                    </span>
                  </div>
                  {/* Bar */}
                  <div style={{ height: 14, borderRadius: 3, background: "var(--bg-3)", overflow: "hidden", position: "relative" }}>
                    <motion.div
                      style={{ height: "100%", borderRadius: 3, background: s.slow ? "var(--red)" : "var(--blue-muted)", position: "absolute", left: 0 }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(2, (Math.min(s.dur, maxDur) / maxDur) * 100)}%` }}
                      transition={{ duration: 0.4, delay: i * 0.03, ease: "easeOut" }}
                    />
                  </div>
                  {/* Duration */}
                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: s.slow ? "var(--red)" : "var(--text-4)", textAlign: "right" }}>
                    {fmtDur(s.dur)}
                  </span>
                </div>
              ))}
            </div>

            {/* Span detail panel */}
            {span && (
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
                style={{ borderTop: "1px solid var(--border)", flexShrink: 0, background: "var(--bg-2)" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px", borderBottom: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-3)", margin: 0 }}>Span Details</p>
                  <button onClick={() => setSpan(null)} style={{ color: "var(--text-4)", background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                    <X size={12} />
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: "12px 20px" }}>
                  {[
                    ["Operation", span.name,    "var(--text-2)"],
                    ["Service",   span.service, "var(--text-2)"],
                    ["Duration",  fmtDur(span.dur), span.slow ? "var(--red)" : "var(--text-2)"],
                    ["Status",    span.slow ? "slow" : "ok", span.slow ? "var(--yellow)" : "var(--green)"],
                  ].map(([k, v, c]) => (
                    <div key={k} style={{ borderRadius: 6, padding: "8px 10px", border: "1px solid var(--border)", background: "var(--bg-3)" }}>
                      <p style={{ fontSize: 10, color: "var(--text-4)", margin: "0 0 3px" }}>{k}</p>
                      <p style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color: c, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6, padding: "0 20px 12px" }}>
                  {["View Logs", "AI Analysis"].map(l => (
                    <button key={l} style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", padding: "5px 12px", borderRadius: 6, border: "1px solid var(--border)", color: "var(--text-3)", background: "transparent", cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)";   e.currentTarget.style.color = "var(--text-3)"; }}>
                      {l}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="split-detail" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <GitBranch size={18} style={{ color: "var(--border-2)" }} />
            <p style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: 0 }}>Select a trace to view the waterfall</p>
            <p style={{ fontSize: 11, color: "var(--text-4)", margin: 0 }}>Click any trace on the left</p>
          </div>
        )}
      </div>
    </div>
  );
}
