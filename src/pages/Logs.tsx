import { useState, useMemo, useCallback } from "react";
import { Search, RefreshCw, AlertCircle, AlertTriangle, Info, Bug } from "lucide-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { FadeIn } from "@/components/ui/FadeIn";
import { SherlockGrid } from "@/components/ui/SherlockGrid";
import { SherlockSelect } from "@/components/ui/SherlockSelect";
import { Badge } from "@/components/ui/badge";

const LOGS = [
  { id: 1,  ts: "14:35:12.441", level: "ERROR", service: "payment-service",   traceId: "abc123def456", message: "HikariPool-1 — Connection is not available, request timed out after 30000ms",              stack: "com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:213)\n  at com.tracemind.payment.PaymentService.processCharge(PaymentService.java:84)\n  at com.tracemind.payment.PaymentController.charge(PaymentController.java:52)" },
  { id: 2,  ts: "14:35:11.221", level: "ERROR", service: "payment-service",   traceId: "abc123def456", message: "Failed to process payment charge: timeout acquiring DB connection after 30000ms",              stack: null },
  { id: 3,  ts: "14:35:10.100", level: "WARN",  service: "payment-service",   traceId: "abc123def456", message: "HikariPool-1 — Pool stats (total=50, active=50, idle=0, waiting=12)",                         stack: null },
  { id: 4,  ts: "14:35:09.002", level: "INFO",  service: "payment-service",   traceId: "abc123def456", message: "Processing charge request: amount=10000 currency=USD customer_id=cust_8a2bc31",               stack: null },
  { id: 5,  ts: "14:35:08.001", level: "DEBUG", service: "payment-service",   traceId: "abc123def456", message: "RiskEngine.evaluate() completed in 85ms — score=0.12 decision=allow",                         stack: null },
  { id: 6,  ts: "14:34:58.881", level: "ERROR", service: "order-service",     traceId: "fed789abc012", message: "Upstream dependency payment-service returned 503 Service Unavailable after 3 retries",         stack: null },
  { id: 7,  ts: "14:34:57.334", level: "WARN",  service: "order-service",     traceId: "fed789abc012", message: "Retry attempt 2/3 for payment-service call — backing off 500ms",                              stack: null },
  { id: 8,  ts: "14:34:56.100", level: "WARN",  service: "order-service",     traceId: "fed789abc012", message: "Retry attempt 1/3 for payment-service call — backing off 200ms",                              stack: null },
  { id: 9,  ts: "14:34:55.010", level: "INFO",  service: "order-service",     traceId: "fed789abc012", message: "Creating order: items=3 total=15990 customer_id=cust_8a2bc31",                                stack: null },
  { id: 10, ts: "14:34:50.100", level: "INFO",  service: "user-service",      traceId: "aab112ccd334", message: "JWT validation completed in 312ms — cache miss for kid: RS256-2026-Q3",                        stack: null },
  { id: 11, ts: "14:34:48.002", level: "DEBUG", service: "user-service",      traceId: "aab112ccd334", message: "Fetching public key from JWKS endpoint: https://auth.internal/.well-known/jwks.json",          stack: null },
  { id: 12, ts: "14:34:47.001", level: "DEBUG", service: "user-service",      traceId: "aab112ccd334", message: "Bearer token parsed — sub=usr_9a1bc24 iat=1724940000 exp=1724943600",                         stack: null },
  { id: 13, ts: "14:34:45.221", level: "INFO",  service: "notification-svc",  traceId: "xyz789uvw456", message: "Email notification queued: recipient=user@example.com template=payment_failed",                stack: null },
  { id: 14, ts: "14:34:44.003", level: "ERROR", service: "notification-svc",  traceId: "xyz789uvw456", message: "SES send failed: Throttling — Maximum sending rate exceeded (14 msg/s limit)",                 stack: "software.amazon.awssdk.services.ses.model.SesException: Throttling\n  at software.amazon.awssdk.services.ses.DefaultSesClient.sendEmail(DefaultSesClient.java:891)\n  at com.tracemind.notification.EmailProvider.send(EmailProvider.java:47)" },
  { id: 15, ts: "14:34:40.001", level: "WARN",  service: "notification-svc",  traceId: "xyz789uvw456", message: "SES sending rate approaching limit — current: 13.2 msg/s throttle: 14 msg/s",                 stack: null },
  { id: 16, ts: "14:34:35.009", level: "INFO",  service: "inventory-api",     traceId: "lmn123opq456", message: "Reserved stock: sku=PROD-881 qty=1 warehouse=US-EAST-1",                                      stack: null },
  { id: 17, ts: "14:34:34.002", level: "DEBUG", service: "inventory-api",     traceId: "lmn123opq456", message: "Redis cache hit for sku=PROD-881 — TTL remaining: 284s",                                      stack: null },
  { id: 18, ts: "14:34:20.881", level: "WARN",  service: "payment-service",   traceId: "ccc000eee111", message: "HikariPool-1 — Pool stats (total=50, active=48, idle=2, waiting=0) — near saturation",        stack: null },
  { id: 19, ts: "14:34:10.002", level: "ERROR", service: "fraud-detection",   traceId: "rrr444sss555", message: "Model inference timeout after 500ms — falling back to rule-based engine",                      stack: null },
  { id: 20, ts: "14:34:05.001", level: "WARN",  service: "fraud-detection",   traceId: "rrr444sss555", message: "ML model load time elevated: 420ms — expected <100ms (cold start?)",                          stack: null },
  { id: 21, ts: "14:33:58.100", level: "INFO",  service: "analytics-service", traceId: "ttt666uuu777", message: "Kafka consumer lag: topic=payment-events partition=0 lag=14821 — alerting threshold=10000",    stack: null },
  { id: 22, ts: "14:33:45.003", level: "INFO",  service: "user-service",      traceId: "vvv888www999", message: "Rate limiter: IP 104.28.x.x throttled — 1200 req/min exceeded limit 1000 req/min",            stack: null },
  { id: 23, ts: "14:33:30.009", level: "DEBUG", service: "order-service",     traceId: "xxx000yyy111", message: "Inventory reservation lock acquired in 12ms for order_id=ord_7b3de99",                         stack: null },
  { id: 24, ts: "14:33:10.442", level: "INFO",  service: "payment-service",   traceId: "zzz222aaa333", message: "Charge processed successfully: amount=4500 currency=USD charge_id=ch_3NxP1qEi",               stack: null },
  { id: 25, ts: "14:33:00.001", level: "DEBUG", service: "payment-service",   traceId: "zzz222aaa333", message: "PostgreSQL query executed in 38ms: SELECT * FROM payment_methods WHERE customer_id=$1 LIMIT 1", stack: null },
];

type Log = typeof LOGS[0];

const SERVICES = ["all","payment-service","order-service","user-service","notification-svc","inventory-api","fraud-detection","analytics-service"];
const LEVELS   = ["all","ERROR","WARN","INFO","DEBUG"];

const LEVEL_COUNTS: Record<string, number> = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0 };
for (const l of LOGS) LEVEL_COUNTS[l.level] = (LEVEL_COUNTS[l.level] ?? 0) + 1;

function levelColor(l: string) {
  if (l === "ERROR") return "var(--red)";
  if (l === "WARN")  return "var(--yellow)";
  if (l === "INFO")  return "var(--blue)";
  return "var(--text-4)";
}
function levelBg(l: string) {
  if (l === "ERROR") return "var(--red-bg)";
  if (l === "WARN")  return "var(--yellow-bg)";
  if (l === "INFO")  return "var(--blue-bg)";
  return "var(--bg-3)";
}
function levelBorder(l: string) {
  if (l === "ERROR") return "var(--red-border)";
  if (l === "WARN")  return "var(--yellow-border)";
  if (l === "INFO")  return "var(--blue-border)";
  return "var(--border)";
}

function LevelCell({ value }: ICellRendererParams<Log>) {
  const l = value as string;
  const variant = l === "ERROR" ? "error" : l === "WARN" ? "warning" : l === "INFO" ? "info" : "ghost";
  const Icon = l === "ERROR" ? AlertCircle : l === "WARN" ? AlertTriangle : l === "INFO" ? Info : Bug;
  return (
    <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Badge variant={variant}>
        <Icon size={10} strokeWidth={2.5} />
        {l}
      </Badge>
    </div>
  );
}

function MessageCell({ value, data }: ICellRendererParams<Log>) {
  return (
    <div style={{ display: "flex", alignItems: "center", height: "100%", gap: 6 }}>
      {data?.stack && <span style={{ fontSize: 9, color: "var(--text-4)", flexShrink: 0 }}>▶</span>}
      <span style={{ color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value as string}
      </span>
    </div>
  );
}

export default function Logs() {
  const [search, setSearch]   = useState("");
  const [service, setService] = useState("all");
  const [level, setLevel]     = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const rowData = useMemo(() => LOGS.filter(l =>
    (l.message.toLowerCase().includes(search.toLowerCase()) || l.traceId.includes(search) || l.service.includes(search)) &&
    (service === "all" || l.service === service) &&
    (level   === "all" || l.level   === level)
  ), [search, service, level]);

  const colDefs = useMemo<ColDef<Log>[]>(() => [
    { field: "ts",      headerName: "Timestamp", width: 130, sortable: true },
    { field: "level",   headerName: "Level",     width: 76,  cellRenderer: LevelCell, sortable: true },
    { field: "service", headerName: "Service",   width: 160, sortable: true },
    { field: "message", headerName: "Message",   flex: 1, minWidth: 200, cellRenderer: MessageCell, sortable: false },
    { field: "traceId", headerName: "Trace ID",  width: 130, minWidth: 100, maxWidth: 160, sortable: false, resizable: false },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({ resizable: true }), []);

  const getRowStyle = useCallback(({ data }: { data?: Log }) => {
    if (data?.level === "ERROR") return { background: "rgba(229,72,77,0.04)" };
    return undefined;
  }, []);

  const onRowClicked = useCallback(({ data }: { data: Log }) => {
    if (!data.stack) { setExpandedId(null); return; }
    setExpandedId(prev => prev === data.id ? null : data.id);
  }, []);

  const expandedLog = expandedId !== null ? LOGS.find(l => l.id === expandedId) : null;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <FadeIn>
        <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--bg)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 2 }}>Observability</p>
              <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Log Explorer</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {["ERROR","WARN","INFO","DEBUG"].map(l => (
                <span key={l} onClick={() => setLevel(level === l ? "all" : l)}
                  style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", padding: "3px 8px", borderRadius: 6, cursor: "pointer",
                    border: `1px solid ${levelBorder(l)}`, color: levelColor(l),
                    background: level === l ? levelBg(l) : "transparent" }}>
                  {LEVEL_COUNTS[l]} {l}
                </span>
              ))}
              <button style={{ borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-4)", padding: 6, cursor: "pointer", display: "flex" }}>
                <RefreshCw size={12} />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200, padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-2)" }}>
              <Search size={12} style={{ color: "var(--text-4)", flexShrink: 0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages, trace IDs, services…"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 12, fontFamily: "Geist Mono, monospace", color: "var(--text-2)" }} />
            </div>
            <SherlockSelect
              value={service}
              onChange={setService}
              options={SERVICES.map(o => ({ value: o, label: o === "all" ? "All services" : o }))}
            />
            <SherlockSelect
              value={level}
              onChange={setLevel}
              options={LEVELS.map(o => ({ value: o, label: o === "all" ? "All levels" : o }))}
              minWidth={120}
            />
          </div>
        </div>
      </FadeIn>

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, margin: "16px 16px 0", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
          <SherlockGrid
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            getRowStyle={getRowStyle}
            onRowClicked={onRowClicked}
          />
        </div>

        {expandedLog?.stack && (
          <div style={{ flexShrink: 0, margin: "0 16px 16px", borderRadius: "0 0 10px 10px", border: "1px solid var(--border)", borderTop: "none", background: "var(--bg-3)", padding: "10px 20px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-4)", margin: 0 }}>
                Stack Trace — {expandedLog.service}
              </p>
              <button onClick={() => setExpandedId(null)} style={{ fontSize: 10, color: "var(--text-4)", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}>×</button>
            </div>
            <pre style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-3)", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.7, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", maxHeight: 140, overflow: "auto" }}>
              {expandedLog.stack}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
}
