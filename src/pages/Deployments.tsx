import { useState, useMemo, useCallback } from "react";
import { CheckCircle, XCircle, Clock, GitCommit, RotateCcw, AlertTriangle } from "lucide-react";
import type { ColDef, ICellRendererParams, RowClassParams } from "ag-grid-community";
import { FadeIn } from "@/components/ui/FadeIn";
import { SherlockGrid } from "@/components/ui/SherlockGrid";
import { SherlockSelect } from "@/components/ui/SherlockSelect";
import { Badge } from "@/components/ui/badge";

const DEPS = [
  { id: "DEP-0284", service: "payment-service",   version: "v2.14.1", env: "production",  status: "failed",      started: "14:14:02", done: "14:17:44", dur: "3m 42s",  author: "alex.kim",     commit: "a3f9c21", branch: "fix/batch-payment-n1", msg: "Add batch payment processing — N+1 query fix",               errDelta: "+11.2pp", latDelta: "+268ms",  incidents: ["INC-094","INC-093"], hot: true,  rollback: false },
  { id: "DEP-0283", service: "order-service",     version: "v3.8.0",  env: "production",  status: "success",     started: "13:01:00", done: "13:09:22", dur: "8m 22s",  author: "sam.chen",     commit: "b7d4e12", branch: "feat/order-search",    msg: "Improve order search query performance with index hints",     errDelta: "-0.3pp",  latDelta: "-12ms",   incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0282", service: "user-service",      version: "v1.22.4", env: "staging",     status: "in-progress", started: "12:00:00", done: "—",         dur: "running", author: "pat.lee",      commit: "c9e1f34", branch: "feat/jwks-rotation",   msg: "Migrate JWKS endpoint to new key rotation policy",            errDelta: "—",       latDelta: "—",       incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0281", service: "inventory-api",     version: "v2.3.0",  env: "production",  status: "success",     started: "10:30:00", done: "10:38:11", dur: "8m 11s",  author: "jordan.wu",    commit: "d2f8a56", branch: "perf/redis-ttl",       msg: "Redis cache TTL optimization — reduced cache miss rate 42%",  errDelta: "0.0pp",   latDelta: "-8ms",    incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0280", service: "fraud-detection",   version: "v1.9.2",  env: "production",  status: "success",     started: "08:15:00", done: "08:22:44", dur: "7m 44s",  author: "riley.morgan", commit: "e1a2b3c", branch: "feat/ml-model-v3",     msg: "Deploy ML model v3.0 — improved F1 score 0.94 → 0.97",      errDelta: "-0.1pp",  latDelta: "+12ms",   incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0279", service: "api-gateway",       version: "v4.1.0",  env: "production",  status: "success",     started: "07:00:00", done: "07:06:32", dur: "6m 32s",  author: "dev.ops",      commit: "f4g5h6i", branch: "chore/nginx-upgrade",  msg: "Upgrade nginx to 1.27.0 — CVE-2024-39144 patch",             errDelta: "0.0pp",   latDelta: "-1ms",    incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0278", service: "notification-svc",  version: "v0.8.1",  env: "production",  status: "rolled-back", started: "22:00:00", done: "22:09:11", dur: "9m 11s",  author: "alex.kim",     commit: "j7k8l9m", branch: "feat/ses-v2",          msg: "Migrate SES API to v2 — broke template rendering, reverted",  errDelta: "+0.5pp",  latDelta: "+8ms",    incidents: ["INC-090"],         hot: false, rollback: true  },
  { id: "DEP-0277", service: "analytics-service", version: "v0.4.1",  env: "production",  status: "success",     started: "18:00:00", done: "18:11:03", dur: "11m 3s",  author: "sam.chen",     commit: "n0o1p2q", branch: "feat/clickhouse",       msg: "Switch aggregation backend from ClickHouse v22 to v24",       errDelta: "-0.2pp",  latDelta: "-90ms",   incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0276", service: "payment-service",   version: "v2.13.0", env: "production",  status: "success",     started: "14:00:00", done: "14:09:55", dur: "9m 55s",  author: "alex.kim",     commit: "r3s4t5u", branch: "fix/idempotency",       msg: "Fix payment idempotency key collision under high concurrency",  errDelta: "-0.8pp",  latDelta: "-24ms",   incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0275", service: "order-service",     version: "v3.7.9",  env: "staging",     status: "failed",      started: "10:00:00", done: "10:04:12", dur: "4m 12s",  author: "pat.lee",      commit: "v6w7x8y", branch: "test/load-test",        msg: "Load test configuration — uncaught OOM in staging",                  errDelta: "+6.1pp",  latDelta: "+1200ms", incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0274", service: "user-service",      version: "v1.22.3", env: "production",  status: "success",     started: "09:10:00", done: "09:17:48", dur: "7m 48s",  author: "jordan.wu",    commit: "a1b2c3d", branch: "fix/session-expiry",    msg: "Fix session token expiry not honoring sliding window",               errDelta: "0.0pp",   latDelta: "-3ms",    incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0273", service: "api-gateway",       version: "v4.0.9",  env: "staging",     status: "success",     started: "08:00:00", done: "08:05:21", dur: "5m 21s",  author: "dev.ops",      commit: "e4f5g6h", branch: "chore/rate-limit-tune", msg: "Tune rate limit thresholds for burst traffic patterns",              errDelta: "0.0pp",   latDelta: "0ms",     incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0272", service: "fraud-detection",   version: "v1.9.1",  env: "production",  status: "rolled-back", started: "23:30:00", done: "23:41:15", dur: "11m 15s", author: "riley.morgan", commit: "i7j8k9l", branch: "feat/rule-engine-v2",   msg: "Rule engine v2 — false positive rate increased 3x, reverted",       errDelta: "+2.4pp",  latDelta: "+34ms",   incidents: ["INC-088"],         hot: false, rollback: true  },
  { id: "DEP-0271", service: "inventory-api",     version: "v2.2.9",  env: "production",  status: "success",     started: "21:00:00", done: "21:08:33", dur: "8m 33s",  author: "sam.chen",     commit: "m0n1o2p", branch: "fix/stock-race",        msg: "Fix stock reservation race condition under concurrent checkout",     errDelta: "-0.1pp",  latDelta: "-5ms",    incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0270", service: "notification-svc",  version: "v0.8.0",  env: "production",  status: "success",     started: "20:00:00", done: "20:06:44", dur: "6m 44s",  author: "alex.kim",     commit: "q3r4s5t", branch: "feat/push-retries",     msg: "Add exponential backoff retry for failed push notifications",        errDelta: "0.0pp",   latDelta: "-2ms",    incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0269", service: "analytics-service", version: "v0.4.0",  env: "staging",     status: "in-progress", started: "19:45:00", done: "—",         dur: "running", author: "pat.lee",      commit: "u6v7w8x", branch: "feat/realtime-agg",     msg: "Implement real-time aggregation pipeline with windowed joins",       errDelta: "—",       latDelta: "—",       incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0268", service: "payment-service",   version: "v2.12.0", env: "production",  status: "success",     started: "16:30:00", done: "16:40:02", dur: "10m 2s",  author: "alex.kim",     commit: "y9z0a1b", branch: "feat/multi-currency",   msg: "Add multi-currency support for EUR, GBP, JPY payment flows",        errDelta: "-0.2pp",  latDelta: "+18ms",   incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0267", service: "order-service",     version: "v3.7.8",  env: "production",  status: "success",     started: "15:00:00", done: "15:09:11", dur: "9m 11s",  author: "jordan.wu",    commit: "c2d3e4f", branch: "perf/db-indexes",       msg: "Add composite indexes on order_items — query time -68%",             errDelta: "-0.4pp",  latDelta: "-41ms",   incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0266", service: "user-service",      version: "v1.22.2", env: "production",  status: "failed",      started: "14:10:00", done: "14:13:55", dur: "3m 55s",  author: "riley.morgan", commit: "g5h6i7j", branch: "feat/mfa-totp",         msg: "TOTP MFA enrollment — migration script failed on replica lag",      errDelta: "+0.3pp",  latDelta: "+9ms",    incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0265", service: "api-gateway",       version: "v4.0.8",  env: "production",  status: "success",     started: "11:00:00", done: "11:04:58", dur: "4m 58s",  author: "dev.ops",      commit: "k8l9m0n", branch: "chore/tls-1.3",        msg: "Enforce TLS 1.3 minimum — drop TLS 1.0 and 1.1 support",            errDelta: "0.0pp",   latDelta: "-1ms",    incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0264", service: "fraud-detection",   version: "v1.9.0",  env: "production",  status: "success",     started: "09:00:00", done: "09:07:22", dur: "7m 22s",  author: "riley.morgan", commit: "o1p2q3r", branch: "feat/velocity-checks",  msg: "Add card velocity checks — block >5 failed auths per 10 min",       errDelta: "-0.3pp",  latDelta: "+6ms",    incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0263", service: "inventory-api",     version: "v2.2.8",  env: "staging",     status: "success",     started: "08:30:00", done: "08:38:14", dur: "8m 14s",  author: "sam.chen",     commit: "s4t5u6v", branch: "feat/bulk-reserve",     msg: "Bulk reservation endpoint for cart checkout optimisation",           errDelta: "0.0pp",   latDelta: "-11ms",   incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0262", service: "notification-svc",  version: "v0.7.9",  env: "production",  status: "rolled-back", started: "07:15:00", done: "07:26:40", dur: "11m 40s", author: "alex.kim",     commit: "w7x8y9z", branch: "feat/twilio-v2",        msg: "Twilio SDK v2 migration — webhook signature validation broken",     errDelta: "+1.1pp",  latDelta: "+14ms",   incidents: ["INC-085"],         hot: false, rollback: true  },
  { id: "DEP-0261", service: "analytics-service", version: "v0.3.9",  env: "production",  status: "success",     started: "06:00:00", done: "06:14:31", dur: "14m 31s", author: "pat.lee",      commit: "a0b1c2d", branch: "feat/dashboard-v2",     msg: "Dashboard v2 — server-side aggregation replaces client-side",       errDelta: "0.0pp",   latDelta: "-120ms",  incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0260", service: "payment-service",   version: "v2.11.0", env: "staging",     status: "failed",      started: "05:00:00", done: "05:02:11", dur: "2m 11s",  author: "jordan.wu",    commit: "e3f4g5h", branch: "test/chaos-db",         msg: "Chaos test: simulate DB failover — payment rollback incomplete",     errDelta: "+8.7pp",  latDelta: "+890ms",  incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0259", service: "user-service",      version: "v1.22.1", env: "production",  status: "success",     started: "04:00:00", done: "04:06:19", dur: "6m 19s",  author: "riley.morgan", commit: "i6j7k8l", branch: "fix/password-hash",     msg: "Upgrade bcrypt cost factor 10 → 12 for new password hashes",        errDelta: "0.0pp",   latDelta: "+22ms",   incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0258", service: "api-gateway",       version: "v4.0.7",  env: "production",  status: "success",     started: "03:00:00", done: "03:05:44", dur: "5m 44s",  author: "dev.ops",      commit: "m9n0o1p", branch: "chore/waf-rules",       msg: "Update WAF ruleset — block OWASP Top 10 pattern set 3.3.5",         errDelta: "0.0pp",   latDelta: "0ms",     incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0257", service: "order-service",     version: "v3.7.7",  env: "production",  status: "success",     started: "01:30:00", done: "01:39:08", dur: "9m 8s",   author: "sam.chen",     commit: "q2r3s4t", branch: "feat/returns-api",      msg: "Returns and refund API — full lifecycle with webhook events",        errDelta: "-0.1pp",  latDelta: "-7ms",    incidents: [],                  hot: false, rollback: false },
  { id: "DEP-0256", service: "fraud-detection",   version: "v1.8.9",  env: "staging",     status: "success",     started: "00:00:00", done: "00:08:55", dur: "8m 55s",  author: "riley.morgan", commit: "u5v6w7x", branch: "chore/model-retrain",   msg: "Scheduled model retrain — updated feature weights Q3 2026",          errDelta: "-0.2pp",  latDelta: "-4ms",    incidents: [],                  hot: false, rollback: false },
];

type Dep = typeof DEPS[0];

/* ── Cell renderers ───────────────────────────────────── */

function StatusCell({ data }: ICellRendererParams<Dep>) {
  if (!data) return null;
  const cfg = {
    "failed":      { Icon: XCircle,     variant: "error"   as const, label: "Failed"      },
    "success":     { Icon: CheckCircle, variant: "success" as const, label: "Success"     },
    "rolled-back": { Icon: RotateCcw,   variant: "warning" as const, label: "Rolled back" },
    "in-progress": { Icon: Clock,       variant: "info"    as const, label: "Running"     },
  }[data.status] ?? { Icon: Clock, variant: "ghost" as const, label: data.status };

  return (
    <Badge variant={cfg.variant}>
      <cfg.Icon size={10} strokeWidth={2.5} />
      {cfg.label}
    </Badge>
  );
}

function ServiceCell({ data }: ICellRendererParams<Dep>) {
  if (!data) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {data.hot && <AlertTriangle size={11} style={{ color: "var(--red)", flexShrink: 0 }} />}
      <span style={{ fontWeight: 500, fontSize: 13, color: "var(--text-1)", whiteSpace: "nowrap" }}>
        {data.service}
      </span>
    </div>
  );
}

function EnvCell({ data }: ICellRendererParams<Dep>) {
  if (!data) return null;
  return (
    <Badge variant={data.env === "production" ? "secondary" : "ghost"}>
      {data.env}
    </Badge>
  );
}

function CommitCell({ data }: ICellRendererParams<Dep>) {
  if (!data) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, justifyContent: "center", height: "100%" }}>
      <span style={{ fontSize: 12, color: "var(--text-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {data.msg}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <GitCommit size={9} style={{ color: "var(--text-4)", flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{data.commit}</span>
        <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {data.branch}
        </span>
      </div>
    </div>
  );
}

function VersionCell({ data }: ICellRendererParams<Dep>) {
  if (!data) return null;
  return (
    <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 12, color: "var(--text-3)" }}>
      {data.version}
    </span>
  );
}

function DurCell({ data }: ICellRendererParams<Dep>) {
  if (!data) return null;
  const running = data.status === "in-progress";
  return (
    <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 12, color: running ? "var(--blue)" : "var(--text-4)" }}>
      {data.dur}
    </span>
  );
}

function DeltaCell({ value }: ICellRendererParams) {
  const v = value as string;
  const color = v === "—" || v === "0.0pp" ? "var(--text-4)"
    : v.startsWith("+") ? "var(--red)" : "var(--green)";
  return (
    <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 12, fontWeight: v !== "—" && v !== "0.0pp" ? 600 : 400, color }}>
      {v}
    </span>
  );
}

function AuthorCell({ data }: ICellRendererParams<Dep>) {
  if (!data) return null;
  const initials = data.author.split(".").map(p => p[0]?.toUpperCase()).join("").slice(0, 2);
  const hue = (data.author.charCodeAt(0) * 53 + data.author.charCodeAt(1) * 19) % 360;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <span style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
        background: `hsl(${hue},55%,40%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontWeight: 700, color: "#fff", fontFamily: "Geist Mono, monospace",
        letterSpacing: "0.02em",
      }}>
        {initials}
      </span>
      <span style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>{data.author}</span>
    </div>
  );
}

/* Module-level derived constants (computed once) */
const DEP_SERVICES = ["all", ...Array.from(new Set(DEPS.map(d => d.service)))];
const DEP_ENVS     = ["all", "production", "staging"];
const DEP_COUNTS = {
  failed:   DEPS.filter(d => d.status === "failed").length,
  inprog:   DEPS.filter(d => d.status === "in-progress").length,
  rollback: DEPS.filter(d => d.status === "rolled-back").length,
  success:  DEPS.filter(d => d.status === "success").length,
};

/* ── Page ─────────────────────────────────────────────── */
export default function Deployments() {
  const [env, setEnv] = useState("all");
  const [svc, setSvc] = useState("all");

  const counts = DEP_COUNTS;
  const services = DEP_SERVICES;
  const envs     = DEP_ENVS;

  const rowData = useMemo(() => DEPS.filter(d =>
    (env === "all" || d.env === env) &&
    (svc === "all" || d.service === svc)
  ), [env, svc]);

  const colDefs = useMemo<ColDef<Dep>[]>(() => [
    {
      field: "status",
      headerName: "Status",
      width: 130, minWidth: 120, maxWidth: 150,
      resizable: false,
      sortable: true,
      cellRenderer: StatusCell,
    },
    {
      field: "service",
      headerName: "Service",
      flex: 1, minWidth: 160, maxWidth: 260,
      sortable: true,
      cellRenderer: ServiceCell,
    },
    {
      field: "env",
      headerName: "Env",
      width: 110, minWidth: 90, maxWidth: 130,
      resizable: false,
      sortable: true,
      cellRenderer: EnvCell,
    },
    {
      field: "msg",
      headerName: "Commit",
      flex: 2, minWidth: 240,
      sortable: false,
      cellRenderer: CommitCell,
    },
    {
      field: "version",
      headerName: "Version",
      width: 90, minWidth: 80,
      sortable: true,
      cellRenderer: VersionCell,
    },
    {
      field: "dur",
      headerName: "Duration",
      width: 90, minWidth: 80,
      sortable: false,
      cellRenderer: DurCell,
    },
    {
      field: "errDelta",
      headerName: "Err Δ",
      width: 82, minWidth: 72,
      sortable: false,
      cellRenderer: DeltaCell,
    },
    {
      field: "latDelta",
      headerName: "Lat Δ",
      width: 90, minWidth: 80,
      sortable: false,
      cellRenderer: DeltaCell,
    },
    {
      field: "author",
      headerName: "Author",
      flex: 1, minWidth: 140,
      sortable: true,
      cellRenderer: AuthorCell,
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    cellStyle: { display: "flex", alignItems: "center" },
  }), []);

  const getRowClass = useCallback(({ data }: RowClassParams<Dep>) => {
    if (!data) return "";
    if (data.hot)      return "ag-row-hot";
    if (data.rollback) return "ag-row-rollback";
    return "";
  }, []);

  const getRowStyle = useCallback(({ data }: { data?: Dep }) => {
    if (data?.hot)      return { borderLeft: "3px solid var(--red)",    background: "var(--red-bg)"    };
    if (data?.rollback) return { borderLeft: "3px solid var(--yellow)", background: "var(--yellow-bg)" };
    return undefined;
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <FadeIn>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--bg)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-4)", marginBottom: 3 }}>Releases</p>
              <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Deployments</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {([
                [`${counts.failed} failed`,       "var(--red)",    "var(--red-bg)",    "var(--red-border)"   ],
                [`${counts.inprog} running`,       "var(--blue)",   "var(--blue-bg)",   "var(--blue-border)"  ],
                [`${counts.rollback} rolled back`, "var(--yellow)", "var(--yellow-bg)", "var(--yellow-border)"],
                [`${counts.success} success`,      "var(--green)",  "var(--green-bg)",  "var(--green-border)" ],
              ] as [string,string,string,string][]).map(([label, color, bg, border]) => (
                <span key={label} style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", padding: "3px 8px", borderRadius: 6, border: `1px solid ${border}`, color, background: bg }}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <SherlockSelect
              value={env}
              onChange={setEnv}
              options={envs.map(o => ({ value: o, label: o === "all" ? "All environments" : o }))}
            />
            <SherlockSelect
              value={svc}
              onChange={setSvc}
              options={services.map(o => ({ value: o, label: o === "all" ? "All services" : o }))}
            />
          </div>
        </div>
      </FadeIn>

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, margin: "16px", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
          <SherlockGrid
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            getRowClass={getRowClass}
            getRowStyle={getRowStyle}
            rowHeight={48}
          />
        </div>
      </div>
    </div>
  );
}
