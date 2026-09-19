import { useState } from "react";
import { Search, ChevronDown, ChevronRight, AlertCircle, TrendingUp, Clock, Hash, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FadeIn } from "@/components/ui/FadeIn";
import { useTheme } from "@/lib/theme";
import { SherlockSelect } from "@/components/ui/SherlockSelect";

const ERROR_GROUPS = [
  {
    id: "eg-001",
    fingerprint: "a1b2c3",
    type: "TimeoutException",
    message: "Read timed out after 30000ms waiting for response from payment-provider-api",
    service: "payment-service",
    file: "PaymentClient.java:248",
    count: 4821,
    users: 1240,
    firstSeen: "2026-08-22T08:14:00Z",
    lastSeen: "2026-08-29T14:35:00Z",
    status: "open",
    severity: "critical",
    trend: [12, 18, 14, 22, 85, 312, 480, 392, 418, 502, 467, 389],
    traceId: "abc123def456",
    stack: [
      "com.sherlock.payment.client.PaymentClient.charge(PaymentClient.java:248)",
      "com.sherlock.payment.service.PaymentService.processPayment(PaymentService.java:142)",
      "com.sherlock.payment.controller.PaymentController.charge(PaymentController.java:88)",
      "java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)",
    ],
  },
  {
    id: "eg-002",
    fingerprint: "d4e5f6",
    type: "HikariPoolTimeoutException",
    message: "Connection is not available, request timed out after 30000ms — pool exhausted (50/50 connections)",
    service: "payment-service",
    file: "HikariPool.java:213",
    count: 1893,
    users: 0,
    firstSeen: "2026-08-29T13:44:00Z",
    lastSeen: "2026-08-29T14:48:00Z",
    status: "open",
    severity: "high",
    trend: [0, 0, 0, 0, 0, 2, 18, 142, 380, 521, 488, 344],
    traceId: "def789abc012",
    stack: [
      "com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:213)",
      "com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:100)",
      "com.sherlock.payment.repository.PaymentRepository.save(PaymentRepository.java:67)",
      "com.sherlock.payment.service.PaymentService.persistPayment(PaymentService.java:189)",
    ],
  },
  {
    id: "eg-003",
    fingerprint: "g7h8i9",
    type: "CircuitBreakerOpenException",
    message: "Circuit breaker for order-service → payment-service is OPEN. Calls are being rejected.",
    service: "order-service",
    file: "PaymentCircuitBreaker.java:54",
    count: 1122,
    users: 890,
    firstSeen: "2026-08-29T14:24:00Z",
    lastSeen: "2026-08-29T14:49:00Z",
    status: "open",
    severity: "high",
    trend: [0, 0, 0, 0, 0, 0, 0, 0, 4, 122, 489, 507],
    traceId: "fed321cba987",
    stack: [
      "io.github.resilience4j.circuitbreaker.CircuitBreakerStateMachine.acquirePermission(CircuitBreakerStateMachine.java:428)",
      "com.sherlock.order.client.PaymentClient.charge(PaymentClient.java:112)",
      "com.sherlock.order.service.OrderService.processOrder(OrderService.java:254)",
      "com.sherlock.order.controller.OrderController.create(OrderController.java:76)",
    ],
  },
  {
    id: "eg-004",
    fingerprint: "j1k2l3",
    type: "NullPointerException",
    message: "Cannot invoke method getUserProfile() on null user session — possible expired JWT",
    service: "user-service",
    file: "UserProfileService.java:92",
    count: 341,
    users: 341,
    firstSeen: "2026-08-27T11:00:00Z",
    lastSeen: "2026-08-29T12:18:00Z",
    status: "investigating",
    severity: "medium",
    trend: [8, 12, 9, 14, 11, 18, 22, 28, 31, 24, 19, 27],
    traceId: "aab112ccd334",
    stack: [
      "com.sherlock.user.service.UserProfileService.getUserProfile(UserProfileService.java:92)",
      "com.sherlock.user.service.UserProfileService.enrichRequest(UserProfileService.java:61)",
      "com.sherlock.user.filter.JwtAuthFilter.doFilter(JwtAuthFilter.java:44)",
    ],
  },
  {
    id: "eg-005",
    fingerprint: "m4n5o6",
    type: "OutOfMemoryError",
    message: "Java heap space — ML model inference consumed all available heap during batch scoring",
    service: "fraud-detection",
    file: "ModelInference.java:188",
    count: 12,
    users: 0,
    firstSeen: "2026-08-28T09:12:00Z",
    lastSeen: "2026-08-28T09:45:00Z",
    status: "resolved",
    severity: "high",
    trend: [0, 0, 0, 2, 6, 4, 0, 0, 0, 0, 0, 0],
    traceId: "qqr890stu234",
    stack: [
      "com.sherlock.fraud.ml.ModelInference.score(ModelInference.java:188)",
      "com.sherlock.fraud.service.FraudScoringService.batchScore(FraudScoringService.java:112)",
      "com.sherlock.fraud.scheduler.BatchScoringJob.run(BatchScoringJob.java:78)",
    ],
  },
  {
    id: "eg-006",
    fingerprint: "p7q8r9",
    type: "KafkaTimeoutException",
    message: "Timeout expired while fetching topic metadata after 60000ms — broker unavailable",
    service: "analytics-service",
    file: "KafkaConsumer.java:1048",
    count: 89,
    users: 0,
    firstSeen: "2026-08-27T18:42:00Z",
    lastSeen: "2026-08-27T20:57:00Z",
    status: "resolved",
    severity: "medium",
    trend: [0, 0, 0, 14, 28, 31, 16, 0, 0, 0, 0, 0],
    traceId: "vvw567xyz890",
    stack: [
      "org.apache.kafka.clients.consumer.KafkaConsumer.updateFetchPositions(KafkaConsumer.java:1048)",
      "com.sherlock.analytics.consumer.AnalyticsConsumer.poll(AnalyticsConsumer.java:88)",
      "com.sherlock.analytics.stream.StreamProcessor.process(StreamProcessor.java:54)",
    ],
  },
];

function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

function sevStyle(s: string) {
  if (s === "critical") return { color: "var(--red)",    bg: "var(--red-bg)",    border: "var(--red-border)"    };
  if (s === "high")     return { color: "var(--red)",    bg: "var(--red-bg)",    border: "var(--red-border)"    };
  if (s === "medium")   return { color: "var(--yellow)", bg: "var(--yellow-bg)", border: "var(--yellow-border)" };
  return                       { color: "var(--blue)",   bg: "var(--blue-bg)",   border: "var(--blue-border)"   };
}

function statusStyle(s: string) {
  if (s === "open")          return { color: "var(--red)",    bg: "var(--red-bg)",    border: "var(--red-border)"    };
  if (s === "investigating") return { color: "var(--yellow)", bg: "var(--yellow-bg)", border: "var(--yellow-border)" };
  return                            { color: "var(--green)",  bg: "var(--green-bg)",  border: "var(--green-border)"  };
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 24, width: 60 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, borderRadius: 1, background: color, height: `${max ? (v / max) * 100 : 0}%`, opacity: 0.6 + (i / data.length) * 0.4 }} />
      ))}
    </div>
  );
}

export default function Errors() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sevFilter, setSevFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const { theme } = useTheme();

  const axisColor = theme === "dark" ? "#444" : "#bbb";
  const barColor  = theme === "dark" ? "#f87171" : "#dc2626";

  const filtered = ERROR_GROUPS.filter(eg => {
    if (statusFilter !== "all" && eg.status !== statusFilter) return false;
    if (sevFilter !== "all" && eg.severity !== sevFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!eg.message.toLowerCase().includes(q) && !eg.type.toLowerCase().includes(q) && !eg.service.includes(q)) return false;
    }
    return true;
  });

  const totalErrors = ERROR_GROUPS.filter(g => g.status === "open").reduce((s, g) => s + g.count, 0);
  const totalGroups = ERROR_GROUPS.filter(g => g.status === "open").length;

  return (
    <FadeIn style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Fixed header */}
      <div className="page-pad" style={{ flexShrink: 0, borderBottom: "1px solid var(--border)", background: "var(--bg)", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Error Groups</h2>
            <span style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: 0 }}>Aggregated errors grouped by fingerprint</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {[
              { label: "Open groups", value: String(totalGroups), color: "var(--red)" },
              { label: "Total errors", value: totalErrors.toLocaleString(), color: "var(--red)" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "right" }}>
                <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "Geist Mono, monospace", color: s.color, margin: 0, letterSpacing: "-0.025em" }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "var(--text-4)", margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-4)", pointerEvents: "none" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search errors…"
              style={{
                width: "100%", padding: "7px 12px 7px 30px", borderRadius: 7, fontSize: 12,
                background: "var(--bg-2)", border: "1px solid var(--border)",
                color: "var(--text-1)", fontFamily: "Geist, sans-serif", outline: "none",
              }}
            />
          </div>
          <SherlockSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All status" },
              { value: "open", label: "Open" },
              { value: "investigating", label: "Investigating" },
              { value: "resolved", label: "Resolved" },
            ]}
          />
          <SherlockSelect
            value={sevFilter}
            onChange={setSevFilter}
            options={[
              { value: "all", label: "All severity" },
              { value: "critical", label: "Critical" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]}
          />
        </div>
      </div>

      {/* Scrollable error groups */}
      <div className="page-pad" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingTop: 16 }}>
        {filtered.map(eg => {
            const sv = sevStyle(eg.severity);
            const st = statusStyle(eg.status);
            const isOpen = expanded === eg.id;
            return (
              <div key={eg.id} style={{
                background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10,
                overflow: "hidden", transition: "border-color 0.1s", flexShrink: 0,
              }}>
                {/* Row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : eg.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "24px 1fr auto auto auto 64px",
                    alignItems: "center", gap: 14, padding: "12px 16px",
                    cursor: "pointer", transition: "background 0.1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Chevron */}
                  <div style={{ color: "var(--text-4)" }}>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>

                  {/* Error info */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 11, fontFamily: "Geist Mono, monospace", fontWeight: 600,
                        color: sv.color,
                      }}>
                        {eg.type}
                      </span>
                      <span style={{
                        fontSize: 10, fontFamily: "Geist Mono, monospace", padding: "1px 6px", borderRadius: 4,
                        background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text-4)",
                      }}>
                        {eg.service}
                      </span>
                      <span style={{
                        fontSize: 10, padding: "1px 6px", borderRadius: 4, fontWeight: 500,
                        color: st.color, background: st.bg, border: `1px solid ${st.border}`,
                        textTransform: "capitalize",
                      }}>
                        {eg.status}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-2)", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.004em" }}>{eg.message}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{eg.file}</span>
                      <span style={{ fontSize: 11, color: "var(--text-4)" }}>last {ago(eg.lastSeen)}</span>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <MiniSparkline data={eg.trend} color={sv.color} />

                  {/* Count */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, fontFamily: "Geist Mono, monospace", color: "var(--text-1)", margin: "0 0 1px", letterSpacing: "-0.02em" }}>{eg.count.toLocaleString()}</p>
                    <p style={{ fontSize: 10, color: "var(--text-4)", margin: 0 }}>events</p>
                  </div>

                  {/* Users */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, fontFamily: "Geist Mono, monospace", color: eg.users > 0 ? "var(--red)" : "var(--text-3)", margin: "0 0 1px", letterSpacing: "-0.02em" }}>{eg.users.toLocaleString()}</p>
                    <p style={{ fontSize: 10, color: "var(--text-4)", margin: 0 }}>users</p>
                  </div>

                  {/* Severity badge */}
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 5,
                    color: sv.color, background: sv.bg, border: `1px solid ${sv.border}`,
                    textTransform: "capitalize", textAlign: "center",
                  }}>
                    {eg.severity}
                  </span>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{
                    borderTop: "1px solid var(--border)", padding: "16px",
                    display: "flex", flexDirection: "column", gap: 14,
                  }}>
                    {/* Meta row */}
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                      {[
                        { label: "First seen",  value: ago(eg.firstSeen) },
                        { label: "Last seen",   value: ago(eg.lastSeen)  },
                        { label: "Trace ID",    value: eg.traceId,       mono: true },
                        { label: "Fingerprint", value: eg.fingerprint,   mono: true },
                      ].map(m => (
                        <div key={m.label}>
                          <p style={{ fontSize: 10, color: "var(--text-4)", margin: "0 0 2px", letterSpacing: 0 }}>{m.label}</p>
                          <p style={{ fontSize: 12, fontFamily: m.mono ? "Geist Mono, monospace" : "Geist, sans-serif", color: "var(--text-2)", margin: 0 }}>{m.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Trend chart */}
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-3)", margin: "0 0 8px" }}>Frequency (last 12h)</p>
                      <ResponsiveContainer width="100%" height={60}>
                        <BarChart data={eg.trend.map((v, i) => ({ h: `${i}h`, v }))} margin={{ top: 0, right: 0, left: -26, bottom: 0 }}>
                          <XAxis dataKey="h" tick={{ fontSize: 9, fill: axisColor, fontFamily: "Geist Mono" }} />
                          <YAxis tick={{ fontSize: 9, fill: axisColor, fontFamily: "Geist Mono" }} />
                          <Tooltip contentStyle={{ background: "var(--bg-3)", border: "1px solid var(--border-2)", borderRadius: 6, fontSize: 11, fontFamily: "Geist Mono" }} />
                          <Bar dataKey="v" name="errors" fill={barColor} radius={[2, 2, 0, 0]} fillOpacity={0.85} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Stack trace */}
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-3)", margin: "0 0 8px" }}>Stack trace</p>
                      <div style={{
                        padding: "10px 12px", borderRadius: 8, background: "var(--bg)",
                        border: "1px solid var(--border)", fontFamily: "Geist Mono, monospace",
                        fontSize: 11, color: "var(--text-3)", lineHeight: 1.8,
                      }}>
                        {eg.stack.map((line, i) => (
                          <div key={i} style={{ color: i === 0 ? "var(--red)" : "var(--text-3)" }}>{line}</div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-2)", fontSize: 12, cursor: "pointer", fontFamily: "Geist, sans-serif" }}>
                        View trace
                      </button>
                      <button style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-2)", fontSize: 12, cursor: "pointer", fontFamily: "Geist, sans-serif" }}>
                        Search logs
                      </button>
                      <button style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-2)", fontSize: 12, cursor: "pointer", fontFamily: "Geist, sans-serif" }}>
                        Create incident
                      </button>
                      {eg.status !== "resolved" && (
                        <button style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 7, border: "1px solid var(--green-border)", background: "var(--green-bg)", color: "var(--green)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Geist, sans-serif" }}>
                          Mark resolved
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 48, color: "var(--text-4)" }}>
              <AlertCircle size={24} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ fontSize: 13, margin: 0 }}>No errors match your filters</p>
            </div>
          )}
      </div>
    </FadeIn>
  );
}
