import { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Trash2,
  BellOff,
  BellRing,
  Bell,
  MessageSquare,
  Mail,
  Globe,
  Zap,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { SherlockSelect } from "@/components/ui/SherlockSelect";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

/* ── Types ────────────────────────────────────────────── */
type Severity = "info" | "warning" | "error" | "critical";
type Channel = "slack" | "email" | "webhook" | "pagerduty";

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: string;
  severity: Severity;
  channel: Channel;
  enabled: boolean;
  lastTriggered: string;
}

interface FiringAlert {
  id: string;
  name: string;
  service: string;
  triggered: string;
  triggeredMin: number;
  duration: string;
  severity: Severity;
  assigned: string;
  acked: boolean;
  silenced: boolean;
}

/* ── Data ─────────────────────────────────────────────── */
const SEED_RULES: AlertRule[] = [
  {
    id: "ALR-201",
    name: "Payment error rate spike",
    metric: "error_rate",
    condition: ">",
    threshold: "5%",
    severity: "critical",
    channel: "pagerduty",
    enabled: true,
    lastTriggered: "2m ago",
  },
  {
    id: "ALR-202",
    name: "Checkout P95 latency",
    metric: "p95_latency",
    condition: ">",
    threshold: "1.5s",
    severity: "error",
    channel: "slack",
    enabled: true,
    lastTriggered: "8m ago",
  },
  {
    id: "ALR-203",
    name: "API Gateway 5xx surge",
    metric: "5xx_rate",
    condition: ">",
    threshold: "1%",
    severity: "error",
    channel: "slack",
    enabled: true,
    lastTriggered: "3h ago",
  },
  {
    id: "ALR-204",
    name: "DB connection pool exhausted",
    metric: "db_conns",
    condition: ">=",
    threshold: "95%",
    severity: "critical",
    channel: "pagerduty",
    enabled: true,
    lastTriggered: "1d ago",
  },
  {
    id: "ALR-205",
    name: "Fraud model latency",
    metric: "p99_latency",
    condition: ">",
    threshold: "800ms",
    severity: "warning",
    channel: "slack",
    enabled: true,
    lastTriggered: "6h ago",
  },
  {
    id: "ALR-206",
    name: "Request volume drop",
    metric: "req_rate",
    condition: "<",
    threshold: "500/s",
    severity: "warning",
    channel: "email",
    enabled: false,
    lastTriggered: "—",
  },
  {
    id: "ALR-207",
    name: "Memory pressure",
    metric: "memory_pct",
    condition: ">",
    threshold: "85%",
    severity: "warning",
    channel: "slack",
    enabled: true,
    lastTriggered: "12h ago",
  },
  {
    id: "ALR-208",
    name: "CPU saturation",
    metric: "cpu_pct",
    condition: ">",
    threshold: "90%",
    severity: "error",
    channel: "webhook",
    enabled: true,
    lastTriggered: "2d ago",
  },
  {
    id: "ALR-209",
    name: "Cache hit rate degraded",
    metric: "cache_hits",
    condition: "<",
    threshold: "80%",
    severity: "info",
    channel: "email",
    enabled: false,
    lastTriggered: "—",
  },
  {
    id: "ALR-210",
    name: "External payment timeouts",
    metric: "timeout_rate",
    condition: ">",
    threshold: "2%",
    severity: "critical",
    channel: "pagerduty",
    enabled: true,
    lastTriggered: "5h ago",
  },
  {
    id: "ALR-211",
    name: "Notification queue backlog",
    metric: "queue_depth",
    condition: ">",
    threshold: "10000",
    severity: "warning",
    channel: "slack",
    enabled: true,
    lastTriggered: "1d ago",
  },
  {
    id: "ALR-212",
    name: "Auth failure spike",
    metric: "401_rate",
    condition: ">",
    threshold: "10%",
    severity: "error",
    channel: "slack",
    enabled: true,
    lastTriggered: "9h ago",
  },
];

const SEED_FIRING: FiringAlert[] = [
  {
    id: "FIR-001",
    name: "Payment error rate spike",
    service: "payment-service",
    triggered: "2m ago",
    triggeredMin: 2,
    duration: "2m 14s",
    severity: "critical",
    assigned: "alex.kim",
    acked: false,
    silenced: false,
  },
  {
    id: "FIR-002",
    name: "Checkout P95 latency",
    service: "order-service",
    triggered: "8m ago",
    triggeredMin: 8,
    duration: "8m 33s",
    severity: "error",
    assigned: "sam.chen",
    acked: true,
    silenced: false,
  },
  {
    id: "FIR-003",
    name: "Inventory stock underflow",
    service: "inventory-api",
    triggered: "14m ago",
    triggeredMin: 14,
    duration: "14m 7s",
    severity: "error",
    assigned: "jordan.wu",
    acked: false,
    silenced: false,
  },
  {
    id: "FIR-004",
    name: "ML inference timeout",
    service: "fraud-detection",
    triggered: "31m ago",
    triggeredMin: 31,
    duration: "31m 02s",
    severity: "warning",
    assigned: "riley.morgan",
    acked: true,
    silenced: false,
  },
  {
    id: "FIR-005",
    name: "SES delivery failure rate",
    service: "notification-svc",
    triggered: "52m ago",
    triggeredMin: 52,
    duration: "52m 18s",
    severity: "warning",
    assigned: "alex.kim",
    acked: false,
    silenced: true,
  },
  {
    id: "FIR-006",
    name: "Analytics pipeline lag",
    service: "analytics-service",
    triggered: "1h ago",
    triggeredMin: 60,
    duration: "1h 4m",
    severity: "info",
    assigned: "pat.lee",
    acked: true,
    silenced: false,
  },
];

/* ── Sort types ───────────────────────────────────────── */
type SortDir = "asc" | "desc" | null;
type RuleSortCol = "name" | "metric" | "severity" | "status" | null;
type FireSortCol = "name" | "service" | "triggered" | "severity" | null;

const SEV_ORDER: Record<Severity, number> = {
  critical: 0,
  error: 1,
  warning: 2,
  info: 3,
};

/* ── Helpers ──────────────────────────────────────────── */
function sevConfig(s: Severity) {
  return {
    critical: {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    },
    error: {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    },
    warning: {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    },
    info: {
      color: "var(--accent)",
      bg: "var(--accent-bg)",
      border: "var(--accent-border)",
    },
  }[s];
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

function SortIconEl({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown size={10} style={{ opacity: 0.4 }} />;
  if (dir === "asc") return <ChevronUp size={10} />;
  if (dir === "desc") return <ChevronDown size={10} />;
  return <ChevronsUpDown size={10} style={{ opacity: 0.4 }} />;
}

function SortableGridHeader({
  label,
  col,
  sortCol,
  sortDir,
  onSort,
}: {
  label: string;
  col: string;
  sortCol: string | null;
  sortDir: SortDir;
  onSort: (c: any) => void;
}) {
  const active = sortCol === col;
  return (
    <div
      onClick={() => onSort(col)}
      style={{
        fontSize: 11,
        fontWeight: 500,
        textTransform: "uppercase" as const,
        letterSpacing: "0.04em",
        color: active ? "var(--text-2)" : "var(--text-3)",
        cursor: "pointer",
        userSelect: "none" as const,
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {label} <SortIconEl active={active} dir={sortDir} />
    </div>
  );
}

function SevBadge({ severity }: { severity: Severity }) {
  const c = sevConfig(severity);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifySelf: "start",
        height: 20,
        padding: "0 7px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.border}`,
      }}
    >
      {severity}
    </span>
  );
}

function ChannelIcon({ ch }: { ch: Channel }) {
  const map = {
    slack: { Icon: MessageSquare, label: "Slack" },
    email: { Icon: Mail, label: "Email" },
    webhook: { Icon: Globe, label: "Webhook" },
    pagerduty: { Icon: Zap, label: "PagerDuty" },
  };
  const { Icon, label } = map[ch];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        color: "var(--text-3)",
      }}
    >
      <Icon size={12} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 12 }}>{label}</span>
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      style={{
        position: "relative",
        width: 32,
        height: 18,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: enabled ? "var(--green)" : "var(--border)",
        transition: "background 0.15s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: enabled ? 16 : 2,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.15s",
        }}
      />
    </button>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: "16px 20px",
        border: "1px solid var(--border)",
        borderRadius: 8,
        background: "var(--bg)",
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
      <span
        style={{
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: color ?? "var(--text-1)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Create Alert Rule Dialog ─────────────────────────── */
function CreateAlertRuleDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (r: AlertRule) => void;
}) {
  const [name, setName] = useState("");
  const [metric, setMetric] = useState("error_rate");
  const [condition, setCondition] = useState("greater_than");
  const [threshold, setThreshold] = useState("");
  const [severity, setSeverity] = useState("critical");
  const [notifyVia, setNotifyVia] = useState("slack");

  function submit() {
    if (!name.trim() || !threshold.trim()) return;
    onCreate({
      id: `ALR-${200 + Math.floor(Math.random() * 800)}`,
      name,
      metric,
      condition,
      threshold,
      severity: severity as Severity,
      channel: notifyVia as Channel,
      enabled: true,
      lastTriggered: "—",
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Alert Rule</DialogTitle>
          <DialogDescription>
            Configure a new alert rule to monitor your services.
          </DialogDescription>
        </DialogHeader>

        <div className="dialog-body">
          <div className="dialog-field">
            <label>Rule Name</label>
            <input
              className="dialog-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. High error rate"
              autoFocus
            />
          </div>

          <div className="dialog-field">
            <label>Metric</label>
            <SherlockSelect
              value={metric}
              onChange={setMetric}
              options={[
                "error_rate",
                "latency_p95",
                "requests_per_min",
                "cpu_usage",
                "memory_usage",
              ]}
              minWidth="100%"
            />
          </div>

          <div className="dialog-field">
            <label>Condition</label>
            <SherlockSelect
              value={condition}
              onChange={setCondition}
              options={["greater_than", "less_than", "equals"]}
              minWidth="100%"
            />
          </div>

          <div className="dialog-field">
            <label>Threshold</label>
            <input
              className="dialog-input"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="e.g. 5"
            />
          </div>

          <div className="dialog-field">
            <label>Severity</label>
            <SherlockSelect
              value={severity}
              onChange={setSeverity}
              options={["critical", "high", "medium", "low"]}
              minWidth="100%"
            />
          </div>

          <div className="dialog-field">
            <label>Notify via</label>
            <SherlockSelect
              value={notifyVia}
              onChange={setNotifyVia}
              options={["slack", "pagerduty", "email", "webhook"]}
              minWidth="100%"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <button className="dialog-btn-secondary">Cancel</button>
          </DialogClose>
          <button
            className="dialog-btn-primary"
            onClick={submit}
            disabled={!name || !threshold}
          >
            <Plus size={13} /> Create Rule
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Page ─────────────────────────────────────────────── */
export default function Alerts() {
  const [tab, setTab] = useState<"rules" | "firing">("rules");
  const [rules, setRules] = useState<AlertRule[]>(SEED_RULES);
  const [firing, setFiring] = useState<FiringAlert[]>(SEED_FIRING);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("all");

  // Rules sort
  const [ruleSortCol, setRuleSortCol] = useState<RuleSortCol>(null);
  const [ruleSortDir, setRuleSortDir] = useState<SortDir>(null);

  // Firing sort
  const [fireSortCol, setFireSortCol] = useState<FireSortCol>(null);
  const [fireSortDir, setFireSortDir] = useState<SortDir>(null);

  function handleRuleSort(col: RuleSortCol) {
    if (ruleSortCol !== col) {
      setRuleSortCol(col);
      setRuleSortDir("asc");
      return;
    }
    if (ruleSortDir === "asc") {
      setRuleSortDir("desc");
      return;
    }
    setRuleSortDir(null);
    setRuleSortCol(null);
  }

  function handleFireSort(col: FireSortCol) {
    if (fireSortCol !== col) {
      setFireSortCol(col);
      setFireSortDir("asc");
      return;
    }
    if (fireSortDir === "asc") {
      setFireSortDir("desc");
      return;
    }
    setFireSortDir(null);
    setFireSortCol(null);
  }

  const stats = useMemo(
    () => ({
      active: rules.filter((r) => r.enabled).length,
      firingNow: firing.filter((f) => !f.silenced).length,
      silenced: firing.filter((f) => f.silenced).length,
      channels: new Set(rules.map((r) => r.channel)).size,
    }),
    [rules, firing],
  );

  const filteredRules = useMemo(() => {
    let list = rules.filter(
      (r) =>
        (!search ||
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.metric.includes(search)) &&
        (sevFilter === "all" || r.severity === sevFilter),
    );
    if (ruleSortCol && ruleSortDir) {
      list = [...list].sort((a, b) => {
        let av: string | number = "",
          bv: string | number = "";
        if (ruleSortCol === "name") {
          av = a.name;
          bv = b.name;
        }
        if (ruleSortCol === "metric") {
          av = a.metric;
          bv = b.metric;
        }
        if (ruleSortCol === "severity") {
          av = SEV_ORDER[a.severity];
          bv = SEV_ORDER[b.severity];
        }
        if (ruleSortCol === "status") {
          av = a.enabled ? 0 : 1;
          bv = b.enabled ? 0 : 1;
        }
        if (typeof av === "string")
          return ruleSortDir === "asc"
            ? av.localeCompare(bv as string)
            : (bv as string).localeCompare(av);
        return ruleSortDir === "asc"
          ? (av as number) - (bv as number)
          : (bv as number) - (av as number);
      });
    }
    return list;
  }, [rules, search, sevFilter, ruleSortCol, ruleSortDir]);

  const sortedFiring = useMemo(() => {
    if (!fireSortCol || !fireSortDir) return firing;
    return [...firing].sort((a, b) => {
      let av: string | number = "",
        bv: string | number = "";
      if (fireSortCol === "name") {
        av = a.name;
        bv = b.name;
      }
      if (fireSortCol === "service") {
        av = a.service;
        bv = b.service;
      }
      if (fireSortCol === "triggered") {
        av = a.triggeredMin;
        bv = b.triggeredMin;
      }
      if (fireSortCol === "severity") {
        av = SEV_ORDER[a.severity];
        bv = SEV_ORDER[b.severity];
      }
      if (typeof av === "string")
        return fireSortDir === "asc"
          ? av.localeCompare(bv as string)
          : (bv as string).localeCompare(av);
      return fireSortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [firing, fireSortCol, fireSortDir]);

  const toggle = useCallback((id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  }, []);

  const deleteRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const ack = useCallback((id: string) => {
    setFiring((prev) =>
      prev.map((f) => (f.id === id ? { ...f, acked: true } : f)),
    );
  }, []);

  const silence = useCallback((id: string) => {
    setFiring((prev) =>
      prev.map((f) => (f.id === id ? { ...f, silenced: true } : f)),
    );
  }, []);

  const RULE_WIDTHS = [
    "1fr",
    "130px",
    "80px",
    "90px",
    "90px",
    "110px",
    "80px",
    "110px",
    "88px",
  ];
  const FIRE_WIDTHS = [
    "1fr",
    "160px",
    "96px",
    "96px",
    "90px",
    "140px",
    "160px",
  ];

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "Geist, sans-serif",
        fontSize: 13,
        color: "var(--text-1)",
      }}
    >
      <style>{`
        @keyframes blink-ring { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.6); } }
        @keyframes blink-dot  { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
      `}</style>

      {/* Page header */}
      <div
        className="responsive-page-header"
        style={{
          padding: "24px 32px 0",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          background: "var(--bg)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
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
              Alerts
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
              Alert rules, notification channels, and firing alerts
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 32,
              padding: "0 14px",
              borderRadius: 6,
              border: "none",
              background: "var(--text-1)",
              color: "var(--bg)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Plus size={13} /> New rule
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <StatCard label="Active Rules" value={stats.active.toString()} />
          <StatCard
            label="Firing Now"
            value={stats.firingNow.toString()}
            color={stats.firingNow > 0 ? "var(--red)" : "var(--text-1)"}
          />
          <StatCard
            label="Silenced"
            value={stats.silenced.toString()}
            color="var(--yellow)"
          />
          <StatCard label="Channels" value={stats.channels.toString()} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {(
            [
              ["rules", `Rules (${rules.length})`],
              ["firing", `Firing (${stats.firingNow})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                fontSize: 13,
                padding: "8px 16px",
                cursor: "pointer",
                border: "none",
                background: "transparent",
                borderBottom: "2px solid",
                borderBottomColor: tab === id ? "var(--text-1)" : "transparent",
                color: tab === id ? "var(--text-1)" : "var(--text-3)",
                marginBottom: -1,
                transition: "color 0.1s",
              }}
            >
              {label}
              {id === "firing" && stats.firingNow > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "var(--red)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {stats.firingNow}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>
        {/* Rules tab */}
        {tab === "rules" && (
          <>
            {/* Filter bar */}
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "16px 32px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Search
                  size={13}
                  style={{
                    position: "absolute",
                    left: 9,
                    color: "var(--text-4)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search rules..."
                  style={{
                    height: 32,
                    padding: "0 10px 0 30px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    background: "var(--bg)",
                    color: "var(--text-1)",
                    fontSize: 13,
                    outline: "none",
                    width: 200,
                    fontFamily: "Geist, sans-serif",
                  }}
                />
              </div>
              <SherlockSelect
                value={sevFilter}
                onChange={setSevFilter}
                options={[
                  { value: "all", label: "All severities" },
                  { value: "critical", label: "Critical" },
                  { value: "error", label: "Error" },
                  { value: "warning", label: "Warning" },
                  { value: "info", label: "Info" },
                ]}
                minWidth={140}
              />
            </div>

            {/* Rules table */}
            <div style={{ minWidth: 900, overflowX: "auto" }}>
              {/* Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: RULE_WIDTHS.join(" "),
                  padding: "0 32px",
                  height: 36,
                  alignItems: "center",
                  borderBottom: "1px solid var(--border)",
                  background: "var(--bg-2)",
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                }}
              >
                <SortableGridHeader
                  label="Name"
                  col="name"
                  sortCol={ruleSortCol}
                  sortDir={ruleSortDir}
                  onSort={handleRuleSort}
                />
                <SortableGridHeader
                  label="Metric"
                  col="metric"
                  sortCol={ruleSortCol}
                  sortDir={ruleSortDir}
                  onSort={handleRuleSort}
                />
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "var(--text-3)",
                  }}
                >
                  Cond.
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "var(--text-3)",
                  }}
                >
                  Threshold
                </div>
                <SortableGridHeader
                  label="Severity"
                  col="severity"
                  sortCol={ruleSortCol}
                  sortDir={ruleSortDir}
                  onSort={handleRuleSort}
                />
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "var(--text-3)",
                  }}
                >
                  Channel
                </div>
                <SortableGridHeader
                  label="Status"
                  col="status"
                  sortCol={ruleSortCol}
                  sortDir={ruleSortDir}
                  onSort={handleRuleSort}
                />
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "var(--text-3)",
                  }}
                >
                  Last triggered
                </div>
                <div />
              </div>

              {filteredRules.map((rule, i) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.015, duration: 0.15 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: RULE_WIDTHS.join(" "),
                    padding: "0 32px",
                    height: 40,
                    alignItems: "center",
                    borderBottom: "1px solid var(--border)",
                    opacity: rule.enabled ? 1 : 0.55,
                    cursor: "pointer",
                    transition: "background 0.1s",
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
                      gap: 7,
                      overflow: "hidden",
                      paddingRight: 16,
                    }}
                  >
                    <Bell
                      size={12}
                      style={{ color: "var(--text-4)", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text-1)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rule.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "Geist Mono, monospace",
                      fontSize: 12,
                      color: "var(--text-3)",
                    }}
                  >
                    {rule.metric}
                  </span>
                  <span
                    style={{
                      fontFamily: "Geist Mono, monospace",
                      fontSize: 12,
                      color: "var(--text-2)",
                    }}
                  >
                    {rule.condition}
                  </span>
                  <span
                    style={{
                      fontFamily: "Geist Mono, monospace",
                      fontSize: 12,
                      color: "var(--text-2)",
                      fontWeight: 600,
                    }}
                  >
                    {rule.threshold}
                  </span>
                  <SevBadge severity={rule.severity} />
                  <ChannelIcon ch={rule.channel} />
                  <Toggle
                    enabled={rule.enabled}
                    onChange={() => toggle(rule.id)}
                  />
                  <span
                    style={{
                      fontFamily: "Geist Mono, monospace",
                      fontSize: 12,
                      color: "var(--text-4)",
                    }}
                  >
                    {rule.lastTriggered}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={() => deleteRule(rule.id)}
                      style={{
                        display: "flex",
                        padding: "4px 6px",
                        borderRadius: 5,
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--text-4)",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {filteredRules.length === 0 && (
                <div
                  style={{
                    padding: "48px 32px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    color: "var(--text-4)",
                  }}
                >
                  <BellOff size={24} strokeWidth={1.5} />
                  <p style={{ fontSize: 13, margin: 0 }}>
                    No rules match these filters.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Firing tab */}
        {tab === "firing" && (
          <div style={{ minWidth: 900, overflowX: "auto" }}>
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: FIRE_WIDTHS.join(" "),
                padding: "0 32px",
                height: 36,
                alignItems: "center",
                borderBottom: "1px solid var(--border)",
                background: "var(--bg-2)",
                position: "sticky",
                top: 0,
                zIndex: 5,
              }}
            >
              <SortableGridHeader
                label="Alert"
                col="name"
                sortCol={fireSortCol}
                sortDir={fireSortDir}
                onSort={handleFireSort}
              />
              <SortableGridHeader
                label="Service"
                col="service"
                sortCol={fireSortCol}
                sortDir={fireSortDir}
                onSort={handleFireSort}
              />
              <SortableGridHeader
                label="Triggered"
                col="triggered"
                sortCol={fireSortCol}
                sortDir={fireSortDir}
                onSort={handleFireSort}
              />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--text-3)",
                }}
              >
                Duration
              </div>
              <SortableGridHeader
                label="Severity"
                col="severity"
                sortCol={fireSortCol}
                sortDir={fireSortDir}
                onSort={handleFireSort}
              />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--text-3)",
                }}
              >
                Assigned
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--text-3)",
                }}
              >
                Actions
              </div>
            </div>

            {sortedFiring.map((f, i) => {
              const sc = sevConfig(f.severity);
              const initials = f.assigned
                .split(".")
                .map((p) => p[0]?.toUpperCase())
                .join("")
                .slice(0, 2);
              const hue =
                (f.assigned.charCodeAt(0) * 53 +
                  (f.assigned.charCodeAt(1) ?? 0) * 19) %
                360;

              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.15 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: FIRE_WIDTHS.join(" "),
                    padding: "0 32px",
                    height: 48,
                    alignItems: "center",
                    borderBottom: "1px solid var(--border)",
                    background: f.silenced
                      ? "transparent"
                      : f.severity === "critical"
                        ? "var(--red-bg)"
                        : "transparent",
                    opacity: f.silenced ? 0.5 : 1,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!f.silenced)
                      (e.currentTarget as HTMLDivElement).style.background =
                        "var(--bg-3)";
                  }}
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      f.silenced
                        ? "transparent"
                        : f.severity === "critical"
                          ? "var(--red-bg)"
                          : "transparent")
                  }
                >
                  {/* Alert name */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      overflow: "hidden",
                      paddingRight: 16,
                    }}
                  >
                    {!f.silenced && f.severity === "critical" ? (
                      <CriticalDot />
                    ) : (
                      !f.silenced && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: sc.color,
                            animation: "pulse 1.5s ease-in-out infinite",
                          }}
                        />
                      )
                    )}
                    <BellRing
                      size={12}
                      style={{ color: sc.color, flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text-1)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.name}
                    </span>
                    {f.acked && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "1px 6px",
                          borderRadius: 3,
                          background: "var(--bg-3)",
                          color: "var(--text-4)",
                          border: "1px solid var(--border)",
                          flexShrink: 0,
                        }}
                      >
                        acked
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-2)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.service}
                  </span>
                  <span
                    style={{
                      fontFamily: "Geist Mono, monospace",
                      fontSize: 12,
                      color: "var(--text-3)",
                    }}
                  >
                    {f.triggered}
                  </span>
                  <span
                    style={{
                      fontFamily: "Geist Mono, monospace",
                      fontSize: 12,
                      color: sc.color,
                    }}
                  >
                    {f.duration}
                  </span>
                  <SevBadge severity={f.severity} />

                  {/* Assigned */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: `hsl(${hue},55%,40%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {initials}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-2)" }}>
                      {f.assigned}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6 }}>
                    {!f.acked && (
                      <button
                        onClick={() => ack(f.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          height: 26,
                          padding: "0 10px",
                          borderRadius: 5,
                          border: "1px solid var(--border)",
                          background: "transparent",
                          color: "var(--text-2)",
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <Check size={11} /> Acknowledge
                      </button>
                    )}
                    {!f.silenced && (
                      <button
                        onClick={() => silence(f.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          height: 26,
                          padding: "0 10px",
                          borderRadius: 5,
                          border: "1px solid var(--border)",
                          background: "transparent",
                          color: "var(--text-2)",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        <BellOff size={11} /> Silence
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <CreateAlertRuleDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={(r) => {
          setRules((prev) => [r, ...prev]);
        }}
      />

      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.35 } }`}</style>
    </div>
  );
}

