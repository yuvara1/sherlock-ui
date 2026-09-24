import { useState, useMemo } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { SherlockSelect } from "@/components/ui/SherlockSelect";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Minus,
  Plus,
  AlertCircle,
  Server,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useTheme } from "@/lib/theme";

function mkErr(i: number) {
  const spike = i >= 13 && i <= 15;
  return Math.max(
    0.1,
    parseFloat((Math.random() * 1.5 + (spike ? 11.8 : 0.6)).toFixed(2)),
  );
}
function mkLat(base: number, i: number, spike: boolean) {
  return Math.floor(
    Math.random() * 20 + base + (spike && i >= 13 && i <= 15 ? 130 : 0),
  );
}
function mkRps(i: number) {
  const dayNorm = Math.sin((i / 24) * Math.PI) * 2800 + 2200;
  return Math.floor(dayNorm + Math.random() * 400 - 200);
}

const errData = Array.from({ length: 24 }, (_, i) => ({
  t: `${i.toString().padStart(2, "0")}:00`,
  v: mkErr(i),
}));
const latData = Array.from({ length: 24 }, (_, i) => ({
  t: `${i.toString().padStart(2, "0")}:00`,
  p95: mkLat(62, i, true),
  p99: mkLat(98, i, true),
}));
const rpsData = Array.from({ length: 24 }, (_, i) => ({
  t: `${i.toString().padStart(2, "0")}:00`,
  v: mkRps(i),
}));

const SERVICES = [
  {
    name: "payment-service",
    health: "critical",
    err: 12.4,
    lat: 312,
    rps: 1840,
  },
  { name: "order-service", health: "degraded", err: 1.1, lat: 94, rps: 3201 },
  { name: "user-service", health: "healthy", err: 0.1, lat: 28, rps: 5820 },
  { name: "notification-svc", health: "healthy", err: 0.0, lat: 15, rps: 1240 },
  { name: "inventory-api", health: "healthy", err: 0.3, lat: 45, rps: 2100 },
  { name: "fraud-detection", health: "healthy", err: 0.0, lat: 88, rps: 890 },
  {
    name: "analytics-service",
    health: "healthy",
    err: 0.2,
    lat: 210,
    rps: 540,
  },
];

const DEPLOYMENTS = [
  {
    service: "payment-service",
    version: "v2.14.1",
    status: "failed",
    ago: "34m",
    author: "alex.kim",
  },
  {
    service: "order-service",
    version: "v3.8.0",
    status: "success",
    ago: "1h",
    author: "sam.chen",
  },
  {
    service: "user-service",
    version: "v1.22.4",
    status: "in-progress",
    ago: "2h",
    author: "pat.lee",
  },
  {
    service: "inventory-api",
    version: "v2.3.0",
    status: "success",
    ago: "3h",
    author: "jordan.wu",
  },
  {
    service: "fraud-detection",
    version: "v1.9.2",
    status: "success",
    ago: "6h",
    author: "riley.m",
  },
];

const ENDPOINTS = [
  { ep: "POST /v1/payments/charge", rate: "12.4%", rateNum: 12.4, rps: 184 },
  { ep: "GET /v1/orders/:id", rate: "3.1%", rateNum: 3.1, rps: 1205 },
  { ep: "POST /v1/auth/refresh", rate: "1.8%", rateNum: 1.8, rps: 892 },
  { ep: "PUT /v1/inventory/reserve", rate: "0.9%", rateNum: 0.9, rps: 440 },
  { ep: "GET /v1/users/profile", rate: "0.4%", rateNum: 0.4, rps: 2340 },
  { ep: "POST /v1/notifications", rate: "0.2%", rateNum: 0.2, rps: 312 },
];

const KPI_ITEMS = [
  { label: "Requests / min", value: "14,832", delta: "+8.2%", up: true },
  { label: "Error Rate", value: "2.3%", delta: "+1.4pp", up: false },
  { label: "P95 Latency", value: "183ms", delta: "+44ms", up: false },
  { label: "Open Incidents", value: "3", delta: "+1", up: false },
];

const RANGE_OPTIONS = [
  { value: "15m", label: "15m" },
  { value: "1h", label: "1h" },
  { value: "6h", label: "6h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
] as const;

type TimeRange = (typeof RANGE_OPTIONS)[number]["value"];

const RANGE_LABELS: Record<TimeRange, string> = {
  "15m": "the last 15 minutes",
  "1h": "the last hour",
  "6h": "the last 6 hours",
  "24h": "the last 24 hours",
  "7d": "the last 7 days",
};

type SortDir = "asc" | "desc" | null;
type SvcSortCol = "name" | "health" | "err" | "lat" | "rps" | null;
type EpSortCol = "ep" | "rate" | "rps" | null;

const HEALTH_ORDER: Record<string, number> = {
  critical: 0,
  degraded: 1,
  healthy: 2,
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: 6,
        fontSize: 11,
        background: "var(--bg-3)",
        border: "1px solid var(--border-2)",
      }}
    >
      <p
        style={{
          fontFamily: "Geist Mono, monospace",
          marginBottom: 4,
          color: "var(--text-4)",
          fontSize: 10,
          margin: "0 0 4px",
        }}
      >
        {label}
      </p>
      {payload.map((p: any) => (
        <div
          key={p.name}
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: p.stroke || p.fill,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "var(--text-3)" }}>{p.name}</span>
          <span
            style={{
              fontFamily: "Geist Mono, monospace",
              fontWeight: 600,
              marginLeft: "auto",
              color: "var(--text-1)",
            }}
          >
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function CriticalDot() {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        width: 10,
        height: 10,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "var(--red)",
          opacity: 0.4,
          animation: "blink-ring 1.4s ease-in-out infinite",
        }}
      />
      <span
        style={{
          position: "relative",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "var(--red)",
          animation: "blink-dot 1.4s ease-in-out infinite",
        }}
      />
    </span>
  );
}

function HealthDot({ health }: { health: string }) {
  if (health === "critical") return <CriticalDot />;
  const color = health === "degraded" ? "var(--yellow)" : "var(--green)";
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        display: "inline-block",
      }}
    />
  );
}

function DeployStatusIcon({ status }: { status: string }) {
  if (status === "success")
    return (
      <CheckCircle size={12} style={{ color: "var(--green)", flexShrink: 0 }} />
    );
  if (status === "failed")
    return (
      <AlertCircle size={12} style={{ color: "var(--red)", flexShrink: 0 }} />
    );
  return <Minus size={12} style={{ color: "var(--yellow)", flexShrink: 0 }} />;
}

function SortIconEl({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown size={9} style={{ opacity: 0.4 }} />;
  if (dir === "asc") return <ChevronUp size={9} />;
  if (dir === "desc") return <ChevronDown size={9} />;
  return <ChevronsUpDown size={9} style={{ opacity: 0.4 }} />;
}

function SortableTH({
  label,
  col,
  sortCol,
  sortDir,
  onSort,
  align = "left",
}: {
  label: string;
  col: string;
  sortCol: string | null;
  sortDir: SortDir;
  onSort: (c: any) => void;
  align?: "left" | "right";
}) {
  const active = sortCol === col;
  return (
    <th
      onClick={() => onSort(col)}
      style={{
        padding: "8px 16px",
        textAlign: align,
        fontSize: 11,
        fontWeight: 500,
        color: active ? "var(--text-2)" : "var(--text-4)",
        letterSpacing: "0.02em",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        {label} <SortIconEl active={active} dir={sortDir} />
      </span>
    </th>
  );
}

function SvcSortableHeader({
  label,
  col,
  sortCol,
  sortDir,
  onSort,
}: {
  label: string;
  col: SvcSortCol;
  sortCol: SvcSortCol;
  sortDir: SortDir;
  onSort: (c: SvcSortCol) => void;
}) {
  const active = sortCol === col;
  return (
    <div
      onClick={() => onSort(col)}
      style={{
        fontSize: 10,
        fontWeight: 500,
        textTransform: "uppercase" as const,
        letterSpacing: "0.04em",
        color: active ? "var(--text-2)" : "var(--text-4)",
        cursor: "pointer",
        userSelect: "none" as const,
        display: "flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      {label} <SortIconEl active={active} dir={sortDir} />
    </div>
  );
}

export default function Dashboard() {
  const { theme } = useTheme();
  const [_unused] = useState(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("1h");
  const [createOpen, setCreateOpen] = useState(false);
  const [createSev, setCreateSev] = useState("critical");
  const [createSvc, setCreateSvc] = useState("api-gateway");

  const rangeData = useMemo(() => {
    if (timeRange === "7d") {
      return {
        errors: errData.filter((_, i) => i % 4 === 0),
        latency: latData.filter((_, i) => i % 4 === 0),
        rps: rpsData.filter((_, i) => i % 4 === 0),
      };
    }

    const points =
      timeRange === "15m"
        ? 2
        : timeRange === "1h"
          ? 6
          : timeRange === "6h"
            ? 6
            : 24;
    return {
      errors: errData.slice(-points),
      latency: latData.slice(-points),
      rps: rpsData.slice(-points),
    };
  }, [timeRange]);

  // Service health sort
  const [svcSortCol, setSvcSortCol] = useState<SvcSortCol>(null);
  const [svcSortDir, setSvcSortDir] = useState<SortDir>(null);

  // Endpoints sort
  const [epSortCol, setEpSortCol] = useState<EpSortCol>(null);
  const [epSortDir, setEpSortDir] = useState<SortDir>(null);

  function handleSvcSort(col: SvcSortCol) {
    if (svcSortCol !== col) {
      setSvcSortCol(col);
      setSvcSortDir("asc");
      return;
    }
    if (svcSortDir === "asc") {
      setSvcSortDir("desc");
      return;
    }
    setSvcSortDir(null);
    setSvcSortCol(null);
  }

  function handleEpSort(col: EpSortCol) {
    if (epSortCol !== col) {
      setEpSortCol(col);
      setEpSortDir("asc");
      return;
    }
    if (epSortDir === "asc") {
      setEpSortDir("desc");
      return;
    }
    setEpSortDir(null);
    setEpSortCol(null);
  }

  const sortedServices = useMemo(() => {
    if (!svcSortCol || !svcSortDir) return SERVICES;
    return [...SERVICES].sort((a, b) => {
      let av: string | number = "",
        bv: string | number = "";
      if (svcSortCol === "name") {
        av = a.name;
        bv = b.name;
      }
      if (svcSortCol === "health") {
        av = HEALTH_ORDER[a.health] ?? 99;
        bv = HEALTH_ORDER[b.health] ?? 99;
      }
      if (svcSortCol === "err") {
        av = a.err;
        bv = b.err;
      }
      if (svcSortCol === "lat") {
        av = a.lat;
        bv = b.lat;
      }
      if (svcSortCol === "rps") {
        av = a.rps;
        bv = b.rps;
      }
      if (typeof av === "string")
        return svcSortDir === "asc"
          ? av.localeCompare(bv as string)
          : (bv as string).localeCompare(av);
      return svcSortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [svcSortCol, svcSortDir]);

  const sortedEndpoints = useMemo(() => {
    if (!epSortCol || !epSortDir) return ENDPOINTS;
    return [...ENDPOINTS].sort((a, b) => {
      let av: string | number = "",
        bv: string | number = "";
      if (epSortCol === "ep") {
        av = a.ep;
        bv = b.ep;
      }
      if (epSortCol === "rate") {
        av = a.rateNum;
        bv = b.rateNum;
      }
      if (epSortCol === "rps") {
        av = a.rps;
        bv = b.rps;
      }
      if (typeof av === "string")
        return epSortDir === "asc"
          ? av.localeCompare(bv as string)
          : (bv as string).localeCompare(av);
      return epSortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [epSortCol, epSortDir]);

  const gridColor = "var(--border)";
  const axisColor = theme === "dark" ? "#444" : "#aaa";
  const stroke2Color = theme === "dark" ? "#555" : "#bbb";
  const errColor = theme === "dark" ? "#f87171" : "#dc2626";
  const latColor = theme === "dark" ? "#60a5fa" : "#2563eb";
  const rpsColor = theme === "dark" ? "#4ade80" : "#16a34a";

  const tickProps = { fontSize: 9, fill: axisColor, fontFamily: "Geist Mono" };
  const commonMargin = { top: 2, right: 4, left: -24, bottom: 0 };

  return (
    <div
      className="responsive-page-header"
      style={{
        padding: "24px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <style>{`
        @keyframes blink-ring { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.6); } }
        @keyframes blink-dot  { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
      `}</style>

      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 20,
          borderBottom: "1px solid var(--border)",
          marginBottom: 24,
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
            Overview
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
            System health and key metrics for {RANGE_LABELS[timeRange]}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <div
            role="tablist"
            aria-label="Overview time range"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              padding: 2,
              maxWidth: "100%",
              overflowX: "auto",
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "var(--bg-2)",
            }}
          >
            {RANGE_OPTIONS.map((option) => {
              const active = timeRange === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTimeRange(option.value)}
                  style={{
                    flexShrink: 0,
                    height: 28,
                    padding: "0 10px",
                    border: "none",
                    borderRadius: 4,
                    background: active ? "var(--bg-3)" : "transparent",
                    color: active ? "var(--text-1)" : "var(--text-3)",
                    fontSize: 12,
                    fontFamily: "Geist Mono, monospace",
                    fontWeight: 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "background 0.12s, color 0.12s",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  background: "var(--text-1)",
                  color: "var(--bg)",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                }}
              >
                <Plus size={13} /> Create incident
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Incident</DialogTitle>
                <DialogDescription>Report a new incident to the team.</DialogDescription>
              </DialogHeader>
              <div className="dialog-body">
                <div className="dialog-field">
                  <label>Title</label>
                  <input className="dialog-input" placeholder="e.g. Payment API timeout" />
                </div>
                <div className="dialog-field">
                  <label>Severity</label>
                  <SherlockSelect value={createSev} onChange={setCreateSev} options={["critical", "high", "medium", "low"]} />
                </div>
                <div className="dialog-field">
                  <label>Service</label>
                  <SherlockSelect value={createSvc} onChange={setCreateSvc} options={["api-gateway", "payment-service", "order-service", "auth-service", "inventory-api"]} />
                </div>
                <div className="dialog-field">
                  <label>Description</label>
                  <textarea className="dialog-textarea" rows={3} placeholder="Describe the incident..." />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><button className="dialog-btn-secondary">Cancel</button></DialogClose>
                <button className="dialog-btn-primary" onClick={() => setCreateOpen(false)}>Create Incident</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI stats row */}
      <div
        className="rg-kpi"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
          marginBottom: 24,
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {KPI_ITEMS.map(({ label, value, delta, up }, i) => (
          <div
            key={label}
            style={{
              padding: "16px 20px",
              borderRight:
                i < KPI_ITEMS.length - 1 ? "1px solid var(--border)" : "none",
              background: "var(--bg-2)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-3)",
                margin: "0 0 8px",
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "var(--text-1)",
                margin: "0 0 8px",
                fontFamily: "Geist Mono, monospace",
              }}
            >
              {value}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {up ? (
                <TrendingUp size={10} style={{ color: "var(--green)" }} />
              ) : (
                <TrendingDown size={10} style={{ color: "var(--red)" }} />
              )}
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "Geist Mono, monospace",
                  color: up ? "var(--green)" : "var(--red)",
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: up ? "var(--green-bg)" : "var(--red-bg)",
                  border: `1px solid ${up ? "var(--green-border)" : "var(--red-border)"}`,
                }}
              >
                {delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 2-column grid: charts (left 2/3) + sidebar (right 1/3) */}
      <div
        className="rg-2-1"
        style={{
          marginBottom: 24,
        }}
      >
        {/* Left: charts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Error Rate area chart */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-2)",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-2)",
                }}
              >
                Error Rate (
                {
                  RANGE_OPTIONS.find((option) => option.value === timeRange)
                    ?.label
                }
                )
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "Geist Mono, monospace",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontWeight: 500,
                  background: "var(--red-bg)",
                  border: "1px solid var(--red-border)",
                  color: "var(--red)",
                }}
              >
                2.3% avg
              </span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={rangeData.errors} margin={commonMargin}>
                <defs>
                  <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={errColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={errColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="t" tick={tickProps} interval={5} />
                <YAxis tick={tickProps} />
                <Tooltip content={CustomTooltip} />
                <ReferenceLine
                  y={5}
                  stroke={errColor}
                  strokeDasharray="3 3"
                  strokeOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  name="err %"
                  stroke={errColor}
                  strokeWidth={1.5}
                  fill="url(#errGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Latency line chart */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-2)",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-2)",
                }}
              >
                Latency (
                {
                  RANGE_OPTIONS.find((option) => option.value === timeRange)
                    ?.label
                }
                )
              </span>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { label: "P95", color: latColor },
                  { label: "P99", color: stroke2Color },
                ].map((l) => (
                  <span
                    key={l.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11,
                      fontFamily: "Geist Mono, monospace",
                      color: "var(--text-4)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 14,
                        height: 1.5,
                        background: l.color,
                        borderRadius: 1,
                      }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={rangeData.latency} margin={commonMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="t" tick={tickProps} interval={5} />
                <YAxis tick={tickProps} />
                <Tooltip content={CustomTooltip} />
                <Line
                  type="monotone"
                  dataKey="p95"
                  name="p95 ms"
                  stroke={latColor}
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="p99"
                  name="p99 ms"
                  stroke={stroke2Color}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* RPS bar chart */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-2)",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-2)",
                }}
              >
                Requests / min (
                {
                  RANGE_OPTIONS.find((option) => option.value === timeRange)
                    ?.label
                }
                )
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "Geist Mono, monospace",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontWeight: 500,
                  background: "var(--green-bg)",
                  border: "1px solid var(--green-border)",
                  color: "var(--green)",
                }}
              >
                14,832 rpm
              </span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={rangeData.rps} margin={commonMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="t" tick={tickProps} interval={5} />
                <YAxis tick={tickProps} />
                <Tooltip content={CustomTooltip} />
                <Bar
                  dataKey="v"
                  name="req/min"
                  fill={rpsColor}
                  opacity={0.8}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: service health + recent deployments */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Service health */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-2)",
              overflow: "hidden",
              flex: 1,
            }}
          >
            <div
              style={{
                padding: "10px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-2)",
                }}
              >
                Service Health
              </span>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  fontSize: 11,
                  fontFamily: "Geist Mono, monospace",
                }}
              >
                <span style={{ color: "var(--red)" }}>1 crit</span>
                <span style={{ color: "var(--yellow)" }}>1 deg</span>
                <span style={{ color: "var(--green)" }}>5 ok</span>
              </div>
            </div>

            {/* Service table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 40px 50px 46px",
                padding: "6px 16px",
                borderBottom: "1px solid var(--border)",
                background: "var(--bg)",
              }}
            >
              <SvcSortableHeader
                label="Name"
                col="name"
                sortCol={svcSortCol}
                sortDir={svcSortDir}
                onSort={handleSvcSort}
              />
              <SvcSortableHeader
                label="Err"
                col="err"
                sortCol={svcSortCol}
                sortDir={svcSortDir}
                onSort={handleSvcSort}
              />
              <SvcSortableHeader
                label="Lat"
                col="lat"
                sortCol={svcSortCol}
                sortDir={svcSortDir}
                onSort={handleSvcSort}
              />
              <SvcSortableHeader
                label="Health"
                col="health"
                sortCol={svcSortCol}
                sortDir={svcSortDir}
                onSort={handleSvcSort}
              />
            </div>

            <div>
              {sortedServices.map((s) => (
                <div
                  key={s.name}
                  style={{
                    display: "grid",
                    alignItems: "center",
                    gridTemplateColumns: "1fr 40px 50px 46px",
                    padding: "8px 16px",
                    borderBottom: "1px solid var(--border)",
                    transition: "background 0.1s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-3)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      overflow: "hidden",
                    }}
                  >
                    <HealthDot health={s.health} />
                    <Server
                      size={10}
                      style={{ color: "var(--text-4)", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "Geist Mono, monospace",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "var(--text-2)",
                      }}
                    >
                      {s.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "Geist Mono, monospace",
                      color:
                        s.err > 5
                          ? "var(--red)"
                          : s.err > 0.5
                            ? "var(--yellow)"
                            : "var(--text-4)",
                      textAlign: "right",
                    }}
                  >
                    {s.err}%
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "Geist Mono, monospace",
                      color: "var(--text-4)",
                      textAlign: "right",
                    }}
                  >
                    {s.lat}ms
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "Geist Mono, monospace",
                      color:
                        s.health === "critical"
                          ? "var(--red)"
                          : s.health === "degraded"
                            ? "var(--yellow)"
                            : "var(--green)",
                      textAlign: "right",
                    }}
                  >
                    {s.health}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent deployments */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-2)",
                }}
              >
                Recent Deployments
              </span>
            </div>
            <div>
              {DEPLOYMENTS.map((d) => (
                <div
                  key={d.service}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--border)",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-3)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <DeployStatusIcon status={d.status} />
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "Geist Mono, monospace",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "var(--text-2)",
                    }}
                  >
                    {d.service}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "Geist Mono, monospace",
                      color: "var(--text-4)",
                      flexShrink: 0,
                    }}
                  >
                    {d.version}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "Geist Mono, monospace",
                      color: "var(--text-4)",
                      flexShrink: 0,
                    }}
                  >
                    {d.ago}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints table */}
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 8,
          background: "var(--bg-2)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}
          >
            Top Endpoints
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg)" }}>
              <SortableTH
                label="Endpoint"
                col="ep"
                sortCol={epSortCol}
                sortDir={epSortDir}
                onSort={handleEpSort}
              />
              <SortableTH
                label="Error Rate"
                col="rate"
                sortCol={epSortCol}
                sortDir={epSortDir}
                onSort={handleEpSort}
                align="right"
              />
              <SortableTH
                label="RPS"
                col="rps"
                sortCol={epSortCol}
                sortDir={epSortDir}
                onSort={handleEpSort}
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {sortedEndpoints.map((ep, i) => (
              <tr
                key={ep.ep}
                style={{
                  height: 40,
                  borderBottom:
                    i < sortedEndpoints.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                  transition: "background 0.1s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-3)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td style={{ padding: "0 16px" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "Geist Mono, monospace",
                      color: "var(--text-2)",
                    }}
                  >
                    {ep.ep}
                  </span>
                </td>
                <td style={{ padding: "0 16px", textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "Geist Mono, monospace",
                      fontWeight: 500,
                      color:
                        ep.rateNum > 5
                          ? "var(--red)"
                          : ep.rateNum > 1
                            ? "var(--yellow)"
                            : "var(--text-3)",
                    }}
                  >
                    {ep.rate}
                  </span>
                </td>
                <td style={{ padding: "0 16px", textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "Geist Mono, monospace",
                      color: "var(--text-4)",
                    }}
                  >
                    {ep.rps.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
