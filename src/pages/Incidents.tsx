import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SherlockSelect } from "@/components/ui/SherlockSelect";

const INCIDENTS = [
  {
    id: "INC-094",
    title: "Payment processing timeout spike — P95 latency exceeded 4s",
    sev: "critical",
    status: "open",
    service: "payment-service",
    env: "production",
    endpoint: "POST /v1/payments/charge",
    created: "2026-09-22T14:23:00Z",
    errRate: 12.4,
    traceId: "abc123def456",
    duration: "25m",
    assignee: "alex.kim",
  },
  {
    id: "INC-093",
    title: "PostgreSQL connection pool exhaustion on payment-service",
    sev: "high",
    status: "open",
    service: "payment-service",
    env: "production",
    endpoint: "POST /v1/payments/charge",
    created: "2026-09-22T13:45:00Z",
    errRate: 8.1,
    traceId: "def789abc012",
    duration: "1h3m",
    assignee: "sam.chen",
  },
  {
    id: "INC-092",
    title: "Order service 503s — downstream dependency timeout",
    sev: "high",
    status: "acknowledged",
    service: "order-service",
    env: "production",
    endpoint: "GET /v1/orders",
    created: "2026-09-22T12:10:00Z",
    errRate: 3.2,
    traceId: "fed321cba987",
    duration: "2h38m",
    assignee: "pat.lee",
  },
  {
    id: "INC-091",
    title: "Auth service elevated latency — JWT validation slow",
    sev: "medium",
    status: "resolved",
    service: "user-service",
    env: "production",
    endpoint: "POST /v1/auth/validate",
    created: "2026-09-22T10:00:00Z",
    errRate: 0.4,
    traceId: "aab112ccd334",
    duration: "1h12m",
    assignee: "jordan.wu",
  },
  {
    id: "INC-090",
    title: "Notification delivery failures — SES quota exceeded",
    sev: "medium",
    status: "resolved",
    service: "notification-svc",
    env: "production",
    endpoint: "POST /v1/notifications",
    created: "2026-09-21T22:15:00Z",
    errRate: 31.0,
    traceId: "xyz789uvw456",
    duration: "47m",
    assignee: "riley.m",
  },
  {
    id: "INC-089",
    title: "Inventory API read latency spike — Redis cache miss storm",
    sev: "low",
    status: "resolved",
    service: "inventory-api",
    env: "staging",
    endpoint: "GET /v1/inventory/:sku",
    created: "2026-09-21T14:30:00Z",
    errRate: 0.1,
    traceId: "lmn123opq456",
    duration: "18m",
    assignee: "alex.kim",
  },
  {
    id: "INC-088",
    title: "Fraud detection service OOM — memory limit exceeded",
    sev: "high",
    status: "resolved",
    service: "fraud-detection",
    env: "production",
    endpoint: "POST /v1/fraud/evaluate",
    created: "2026-09-21T09:00:00Z",
    errRate: 5.8,
    traceId: "qqr890stu234",
    duration: "34m",
    assignee: "sam.chen",
  },
  {
    id: "INC-087",
    title: "Analytics pipeline stall — Kafka consumer lag >100k",
    sev: "medium",
    status: "resolved",
    service: "analytics-service",
    env: "production",
    endpoint: "GET /v1/analytics/stream",
    created: "2026-09-20T18:45:00Z",
    errRate: 0.0,
    traceId: "vvw567xyz890",
    duration: "2h15m",
    assignee: "pat.lee",
  },
];

const TIMELINE_DATA: Record<
  string,
  { time: string; event: string; type: string }[]
> = {
  "INC-094": [
    {
      time: "14:27",
      event:
        "Incident INC-094 created automatically — error threshold breached",
      type: "alert",
    },
    {
      time: "14:26",
      event: "order-service 503 cascade detected — error rate 18.4%",
      type: "alert",
    },
    {
      time: "14:23",
      event: "On-call engineer paged via PagerDuty",
      type: "page",
    },
    {
      time: "14:20",
      event: "payment-service v2.14.1 deployed to production",
      type: "deploy",
    },
    {
      time: "14:18",
      event: "P95 latency on POST /v1/payments/charge exceeded 4s SLO",
      type: "metric",
    },
  ],
};

type SortDir = "asc" | "desc" | null;

function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 60
    ? `${m}m ago`
    : m < 1440
      ? `${Math.floor(m / 60)}h ago`
      : `${Math.floor(m / 1440)}d ago`;
}

function sevStyle(s: string) {
  if (s === "critical")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    };
  if (s === "high")
    return { color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" };
  if (s === "medium")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    };
  return { color: "var(--text-4)", bg: "var(--bg-3)", border: "var(--border)" };
}

function statusStyle(s: string) {
  if (s === "open")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    };
  if (s === "acknowledged")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    };
  return {
    color: "var(--green)",
    bg: "var(--green-bg)",
    border: "var(--green-border)",
  };
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

function SevBadge({ s }: { s: string }) {
  const c = sevStyle(s);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 500,
        borderRadius: 4,
        padding: "2px 8px",
        border: `1px solid ${c.border}`,
        color: c.color,
        background: c.bg,
        textTransform: "capitalize",
        fontFamily: "Geist Mono, monospace",
      }}
    >
      {s === "critical" && <CriticalDot />}
      {s}
    </span>
  );
}

function StatusBadge({ s }: { s: string }) {
  const c = statusStyle(s);
  const icon =
    s === "open" ? (
      <AlertTriangle size={11} style={{ flexShrink: 0 }} />
    ) : s === "acknowledged" ? (
      <Clock size={11} style={{ flexShrink: 0 }} />
    ) : (
      <CheckCircle size={11} style={{ flexShrink: 0 }} />
    );
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 500,
        borderRadius: 4,
        padding: "2px 8px",
        border: `1px solid ${c.border}`,
        color: c.color,
        background: c.bg,
        textTransform: "capitalize",
        fontFamily: "Geist Mono, monospace",
      }}
    >
      {icon}
      {s}
    </span>
  );
}

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === "asc") return <ChevronUp size={11} />;
  if (dir === "desc") return <ChevronDown size={11} />;
  return <ChevronsUpDown size={11} style={{ opacity: 0.35 }} />;
}

function ExpandedRow({ inc }: { inc: (typeof INCIDENTS)[0] }) {
  const timeline = TIMELINE_DATA[inc.id] ?? [];
  const timelineTypeColor = (t: string) =>
    t === "alert"
      ? "var(--red)"
      : t === "deploy"
        ? "var(--yellow)"
        : t === "page"
          ? "var(--accent)"
          : "var(--border-2)";

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <td
        colSpan={9}
        style={{ padding: 0, borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="incident-detail"
          className="rg-3"
          style={{
            padding: "16px 20px 16px 56px",
            background: "var(--bg)",
          }}
        >
          {/* Meta */}
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-4)",
                margin: "0 0 10px",
              }}
            >
              Details
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["Service", inc.service],
                ["Endpoint", inc.endpoint],
                ["Env", inc.env],
                ["Error rate", `${inc.errRate}%`],
                ["Trace ID", inc.traceId],
                ["Detected", ago(inc.created)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "Geist Mono, monospace",
                      color: "var(--text-4)",
                      width: 72,
                      flexShrink: 0,
                    }}
                  >
                    {k}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "Geist Mono, monospace",
                      color: "var(--text-2)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Affected resources */}
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-4)",
                margin: "0 0 10px",
              }}
            >
              Affected Resources
            </p>
            <div
              className="rg-2"
            >
              {[
                { label: "Traces", val: "1,284", color: "var(--accent)" },
                { label: "Errors", val: "592", color: "var(--red)" },
                { label: "Users hit", val: "~8,400", color: "var(--yellow)" },
                { label: "Services", val: "3", color: "var(--text-2)" },
              ].map(({ label, val, color }) => (
                <div
                  key={label}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    background: "var(--bg-2)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      fontFamily: "Geist Mono, monospace",
                      color,
                      margin: "0 0 2px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {val}
                  </p>
                  <p
                    style={{ fontSize: 11, color: "var(--text-4)", margin: 0 }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-4)",
                margin: "0 0 10px",
              }}
            >
              {timeline.length > 0 ? "Timeline" : "Actions"}
            </p>
            {timeline.length > 0 ? (
              <div style={{ position: "relative", paddingLeft: 16 }}>
                <div
                  style={{
                    position: "absolute",
                    left: 3,
                    top: 4,
                    bottom: 4,
                    width: 1,
                    background: "var(--border)",
                  }}
                />
                {timeline.map((e) => (
                  <div
                    key={e.time}
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 10,
                      position: "relative",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: -16,
                        top: 4,
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: timelineTypeColor(e.type),
                        border: "2px solid var(--bg)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "Geist Mono, monospace",
                        color: "var(--text-4)",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {e.time}
                    </span>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-3)",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {e.event}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  "Mark Resolved",
                  "Acknowledge",
                  "View Trace",
                  "View Logs",
                ].map((action) => (
                  <button
                    key={action}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      textAlign: "left",
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: "var(--text-3)",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg-2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
    </motion.tr>
  );
}

export default function Incidents() {
  const [createOpen, setCreateOpen] = useState(false);
  const [createSev, setCreateSev] = useState("critical");
  const [createSvc, setCreateSvc] = useState("api-gateway");
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [timeRange, setTimeRange] = useState("24h");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const onSort = (c: string) => {
    if (sortCol === c)
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
    else {
      setSortCol(c);
      setSortDir("asc");
    }
  };

  const counts = {
    open: INCIDENTS.filter((i) => i.status === "open").length,
    acknowledged: INCIDENTS.filter((i) => i.status === "acknowledged").length,
    resolved: INCIDENTS.filter((i) => i.status === "resolved").length,
  };

  const totalDuration = INCIDENTS.filter((i) => i.status === "resolved").reduce(
    (acc, i) => {
      const m = parseInt(i.duration.replace(/[^0-9]/g, ""));
      return acc + m;
    },
    0,
  );
  const mttr = `${Math.floor(totalDuration / counts.resolved)}m`;

  const baseList = INCIDENTS.filter(
    (i) =>
      (i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.id.includes(search) ||
        i.service.includes(search)) &&
      (severity === "all" || i.sev === severity) &&
      (status === "all" || i.status === status),
  );

  const list = (() => {
    if (!sortCol || sortDir === null) return baseList;
    return [...baseList].sort((a: any, b: any) => {
      const av = a[sortCol],
        bv = b[sortCol];
      if (typeof av === "string")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });
  })();

  function SortableTH({
    label,
    col,
    style,
  }: {
    label: string;
    col: string;
    style?: React.CSSProperties;
  }) {
    const active = sortCol === col;
    return (
      <th
        onClick={() => onSort(col)}
        style={{
          ...thStyle,
          cursor: "pointer",
          userSelect: "none",
          color: active ? "var(--text-2)" : "var(--text-4)",
          ...style,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {label} <SortIcon dir={active ? sortDir : null} />
        </span>
      </th>
    );
  }

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
        @keyframes blink-ring {
          0%, 100% { opacity: 1; transform: scale(1);   }
          50%       { opacity: 0.3; transform: scale(1.6); }
        }
        @keyframes blink-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
      `}</style>

      {/* Page header */}
      <div
        className="rg-kpi"
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
            Incidents
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
            Active and resolved incidents across all services
          </p>
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
              <Plus size={13} /> New Incident
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

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Open",
            value: counts.open,
            icon: <AlertCircle size={14} style={{ color: "var(--red)" }} />,
            color: "var(--red)",
          },
          {
            label: "Acknowledged",
            value: counts.acknowledged,
            icon: <Clock size={14} style={{ color: "var(--yellow)" }} />,
            color: "var(--yellow)",
          },
          {
            label: "Resolved",
            value: counts.resolved,
            icon: <CheckCircle size={14} style={{ color: "var(--green)" }} />,
            color: "var(--green)",
          },
          {
            label: "MTTR",
            value: mttr,
            icon: <Activity size={14} style={{ color: "var(--text-4)" }} />,
            color: "var(--text-1)",
          },
        ].map(({ label, value, icon, color }, i) => (
          <div
            key={label}
            style={{
              padding: "16px 20px",
              background: "var(--bg-2)",
              borderRight: i < 3 ? "1px solid var(--border)" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              }}
            >
              {icon}
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-3)",
                  margin: 0,
                }}
              >
                {label}
              </p>
            </div>
            <p
              style={{
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color,
                margin: 0,
                fontFamily: "Geist Mono, monospace",
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: 1,
            minWidth: 200,
            height: 32,
            padding: "0 10px",
            border: "1px solid var(--border)",
            borderRadius: 6,
            background: "var(--bg-2)",
          }}
        >
          <Search size={12} style={{ color: "var(--text-4)", flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incidents, services, IDs…"
            style={{
              flex: 1,
              background: "transparent",
              fontSize: 12,
              fontFamily: "Geist Mono, monospace",
              outline: "none",
              color: "var(--text-2)",
              border: "none",
            }}
          />
        </div>

        {/* Selects */}
        <SherlockSelect
          value={severity}
          onChange={setSeverity}
          options={["all", "critical", "high", "medium", "low"].map((o) => ({
            value: o,
            label:
              o === "all"
                ? "All severities"
                : o.charAt(0).toUpperCase() + o.slice(1),
          }))}
          minWidth={130}
        />
        <SherlockSelect
          value={status}
          onChange={setStatus}
          options={["all", "open", "acknowledged", "resolved"].map((o) => ({
            value: o,
            label:
              o === "all"
                ? "All statuses"
                : o.charAt(0).toUpperCase() + o.slice(1),
          }))}
          minWidth={130}
        />
        <SherlockSelect
          value={timeRange}
          onChange={setTimeRange}
          options={["1h", "6h", "24h", "7d", "30d"]}
          minWidth={80}
        />

        <span
          style={{
            fontSize: 12,
            fontFamily: "Geist Mono, monospace",
            color: "var(--text-4)",
            flexShrink: 0,
          }}
        >
          {list.length} of {INCIDENTS.length}
        </span>
      </div>

      {/* Table */}
      <div
        className="responsive-data-surface"
        style={{
          border: "1px solid var(--border)",
          borderRadius: 8,
          background: "var(--bg-2)",
        }}
      >
        <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg)" }}>
              <th
                style={{
                  width: 32,
                  padding: "10px 8px 10px 16px",
                  borderBottom: "1px solid var(--border)",
                }}
              />
              <SortableTH label="ID" col="id" />
              <SortableTH label="Title" col="title" style={{ width: "40%" }} />
              <SortableTH label="Service" col="service" />
              <SortableTH label="Severity" col="sev" />
              <SortableTH label="Status" col="status" />
              <SortableTH
                label="Duration"
                col="duration"
                style={{ textAlign: "right" }}
              />
              <SortableTH
                label="Assignee"
                col="assignee"
                style={{ textAlign: "right" }}
              />
              <SortableTH
                label="Created"
                col="created"
                style={{ textAlign: "right" }}
              />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    padding: "48px 0",
                    textAlign: "center",
                    fontSize: 13,
                    fontFamily: "Geist Mono, monospace",
                    color: "var(--text-4)",
                  }}
                >
                  No incidents match
                </td>
              </tr>
            )}
            {list.map((inc) => {
              const isExpanded = expanded === inc.id;
              return (
                <React.Fragment key={inc.id}>
                  <tr
                    onClick={() => setExpanded(isExpanded ? null : inc.id)}
                    style={{
                      height: 40,
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.1s",
                      cursor: "pointer",
                      background: isExpanded ? "var(--bg-3)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded)
                        e.currentTarget.style.background = "var(--bg-3)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Expand chevron */}
                    <td style={{ padding: "0 8px 0 16px", width: 32 }}>
                      <motion.span
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          display: "inline-flex",
                          color: "var(--text-4)",
                        }}
                      >
                        <ChevronRight size={13} />
                      </motion.span>
                    </td>

                    {/* ID */}
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "Geist Mono, monospace",
                          color: "var(--text-4)",
                        }}
                      >
                        {inc.id}
                      </span>
                    </td>

                    {/* Title */}
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--text-2)",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                          maxWidth: 360,
                        }}
                      >
                        {inc.title}
                      </span>
                    </td>

                    {/* Service */}
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "Geist Mono, monospace",
                          color: "var(--text-3)",
                        }}
                      >
                        {inc.service}
                      </span>
                    </td>

                    {/* Severity */}
                    <td style={tdStyle}>
                      <SevBadge s={inc.sev} />
                    </td>

                    {/* Status */}
                    <td style={tdStyle}>
                      <StatusBadge s={inc.status} />
                    </td>

                    {/* Duration */}
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "Geist Mono, monospace",
                          color: "var(--text-4)",
                        }}
                      >
                        {inc.duration}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "Geist Mono, monospace",
                          color: "var(--text-4)",
                        }}
                      >
                        {inc.assignee}
                      </span>
                    </td>

                    {/* Created */}
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "Geist Mono, monospace",
                          color: "var(--text-4)",
                        }}
                      >
                        {ago(inc.created)}
                      </span>
                    </td>
                  </tr>

                  <AnimatePresence>
                    {isExpanded && (
                      <ExpandedRow key={`${inc.id}-expanded`} inc={inc} />
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--text-4)",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  borderBottom: "1px solid var(--border)",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "0 12px",
};
