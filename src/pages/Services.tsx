import { useState, useMemo } from "react";
import {
  Server,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { SherlockSelect } from "@/components/ui/SherlockSelect";

/* ── Data ────────────────────────────────────────────────────── */
const SERVICES = [
  {
    name: "payment-service",
    lang: "Java",
    health: "Critical",
    rpm: 1840,
    errRate: 12.4,
    p95: 312,
    instances: 4,
    lastSeen: "2s ago",
  },
  {
    name: "order-service",
    lang: "Node.js",
    health: "Degraded",
    rpm: 3201,
    errRate: 1.1,
    p95: 94,
    instances: 6,
    lastSeen: "1s ago",
  },
  {
    name: "user-service",
    lang: "Go",
    health: "Healthy",
    rpm: 5820,
    errRate: 0.1,
    p95: 28,
    instances: 8,
    lastSeen: "just now",
  },
  {
    name: "notification-svc",
    lang: "Python",
    health: "Healthy",
    rpm: 1240,
    errRate: 0.0,
    p95: 15,
    instances: 3,
    lastSeen: "3s ago",
  },
  {
    name: "inventory-api",
    lang: "Go",
    health: "Healthy",
    rpm: 2100,
    errRate: 0.3,
    p95: 45,
    instances: 4,
    lastSeen: "1s ago",
  },
  {
    name: "fraud-detection",
    lang: "Python",
    health: "Healthy",
    rpm: 890,
    errRate: 0.0,
    p95: 88,
    instances: 2,
    lastSeen: "4s ago",
  },
  {
    name: "analytics-service",
    lang: "Scala",
    health: "Healthy",
    rpm: 540,
    errRate: 0.2,
    p95: 210,
    instances: 2,
    lastSeen: "5s ago",
  },
  {
    name: "api-gateway",
    lang: "Go",
    health: "Healthy",
    rpm: 14832,
    errRate: 0.4,
    p95: 8,
    instances: 6,
    lastSeen: "just now",
  },
];

type Service = (typeof SERVICES)[0];
type SortDir = "asc" | "desc" | null;

/* ── Helpers ─────────────────────────────────────────────────── */
function healthColor(h: string) {
  if (h === "Critical")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    };
  if (h === "Degraded")
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

function HealthBadge({ health }: { health: string }) {
  const t = healthColor(health);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        fontFamily: "Geist, sans-serif",
        color: t.color,
        background: t.bg,
        border: `1px solid ${t.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {health === "Critical" ? (
        <CriticalDot />
      ) : (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: t.color,
            flexShrink: 0,
          }}
        />
      )}
      {health}
    </span>
  );
}

const LANG_COLORS: Record<string, { bg: string; color: string }> = {
  Go: { bg: "rgba(0,172,215,0.1)", color: "#00ACD7" },
  "Node.js": { bg: "rgba(83,158,67,0.1)", color: "#539E43" },
  Python: { bg: "rgba(55,118,171,0.1)", color: "#3776AB" },
  Java: { bg: "rgba(234,45,46,0.1)", color: "#EA2D2E" },
  Scala: { bg: "rgba(220,50,47,0.1)", color: "#DC322F" },
};

function LangBadge({ lang }: { lang: string }) {
  const c = LANG_COLORS[lang] ?? { bg: "var(--bg-3)", color: "var(--text-3)" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 7px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        color: c.color,
        background: c.bg,
        fontFamily: "Geist Mono, monospace",
        letterSpacing: "-0.01em",
      }}
    >
      {lang}
    </span>
  );
}

const TH_BASE: React.CSSProperties = {
  padding: "0 16px",
  height: 36,
  textAlign: "left",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.02em",
  whiteSpace: "nowrap",
  borderBottom: "1px solid var(--border)",
  background: "var(--bg)",
};

const TD_STYLE: React.CSSProperties = {
  padding: "0 16px",
  height: 40,
  fontSize: 13,
  borderBottom: "1px solid var(--border)",
  whiteSpace: "nowrap",
};

/* ── Sort helpers ─────────────────────────────────────────────── */
function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === "asc") return <ChevronUp size={11} />;
  if (dir === "desc") return <ChevronDown size={11} />;
  return <ChevronsUpDown size={11} style={{ opacity: 0.35 }} />;
}

function SortableTH({
  label,
  col,
  align = "left",
  sortCol,
  sortDir,
  onSort,
}: {
  label: string;
  col: string;
  align?: "left" | "right";
  sortCol: string;
  sortDir: SortDir;
  onSort: (col: string) => void;
}) {
  const active = sortCol === col;
  return (
    <th
      onClick={() => onSort(col)}
      style={{
        ...TH_BASE,
        cursor: "pointer",
        userSelect: "none",
        textAlign: align,
        color: active ? "var(--text-2)" : "var(--text-4)",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label} <SortIcon dir={active ? sortDir : null} />
      </span>
    </th>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
const HEALTH_FILTERS = ["All", "Healthy", "Degraded", "Critical"];
const LANG_FILTERS = ["All", "Go", "Java", "Node.js", "Python", "Scala"];

export default function Services() {
  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState("All");
  const [langFilter, setLangFilter] = useState("All");
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

  const counts = useMemo(
    () => ({
      total: SERVICES.length,
      healthy: SERVICES.filter((s) => s.health === "Healthy").length,
      degraded: SERVICES.filter((s) => s.health === "Degraded").length,
      critical: SERVICES.filter((s) => s.health === "Critical").length,
    }),
    [],
  );

  const filtered = useMemo(() => {
    const base = SERVICES.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (healthFilter !== "All" && s.health !== healthFilter) return false;
      if (langFilter !== "All" && s.lang !== langFilter) return false;
      return true;
    });
    if (!sortCol || sortDir === null) return base;
    return [...base].sort((a: any, b: any) => {
      const av = a[sortCol],
        bv = b[sortCol];
      if (typeof av === "string")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });
  }, [search, healthFilter, langFilter, sortCol, sortDir]);

  const kpis = [
    { label: "Total Services", value: counts.total, delta: null },
    {
      label: "Healthy",
      value: counts.healthy,
      delta: { text: "operational", color: "var(--green)" },
    },
    {
      label: "Degraded",
      value: counts.degraded,
      delta:
        counts.degraded > 0
          ? { text: "needs attention", color: "var(--yellow)" }
          : null,
    },
    {
      label: "Critical",
      value: counts.critical,
      delta:
        counts.critical > 0
          ? { text: "action required", color: "var(--red)" }
          : null,
    },
  ];

  const inputStyle: React.CSSProperties = {
    height: 32,
    padding: "0 10px",
    borderRadius: 6,
    border: "1px solid var(--border)",
    background: "var(--bg-2)",
    color: "var(--text-1)",
    fontSize: 12,
    fontFamily: "Geist, sans-serif",
    outline: "none",
    letterSpacing: "-0.01em",
  };

  return (
    <div
      className="responsive-page-header"
      style={{
        padding: "24px 32px",
        fontFamily: "Geist, sans-serif",
        minHeight: "100%",
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
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 20,
          borderBottom: "1px solid var(--border)",
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
              margin: 0,
            }}
          >
            Services
          </h1>
          <p
            style={{ fontSize: 13, color: "var(--text-3)", margin: "4px 0 0" }}
          >
            All instrumented services and their real-time health
          </p>
        </div>
        <button
          style={{
            height: 32,
            padding: "0 14px",
            borderRadius: 6,
            border: "none",
            background: "var(--text-1)",
            color: "var(--bg)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            letterSpacing: "-0.01em",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Register service
        </button>
      </div>

      {/* KPI row */}
      <div
        className="rg-kpi"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {kpis.map((k) => (
          <div
            key={k.label}
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "16px 20px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-3)",
                margin: "0 0 10px",
              }}
            >
              {k.label}
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: "var(--text-1)",
                  fontFamily: "Geist, sans-serif",
                }}
              >
                {k.value}
              </span>
              {k.delta && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: k.delta.color,
                  }}
                >
                  {k.delta.text}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div style={{ position: "relative", flex: "0 0 240px" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 13,
              color: "var(--text-4)",
              pointerEvents: "none",
            }}
          >
            <Search size={13} />
          </span>
          <input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...inputStyle,
              paddingLeft: 30,
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>
        <SherlockSelect
          value={healthFilter}
          onChange={setHealthFilter}
          options={HEALTH_FILTERS.map((f) => ({ value: f, label: f }))}
          minWidth={120}
        />
        <SherlockSelect
          value={langFilter}
          onChange={setLangFilter}
          options={LANG_FILTERS.map((f) => ({ value: f, label: f }))}
          minWidth={120}
        />
        <span style={{ fontSize: 12, color: "var(--text-4)", marginLeft: 4 }}>
          {filtered.length} service{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <SortableTH
                  label="Name"
                  col="name"
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
                <SortableTH
                  label="Language"
                  col="lang"
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
                <SortableTH
                  label="Health"
                  col="health"
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
                <SortableTH
                  label="Requests/min"
                  col="rpm"
                  align="right"
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
                <SortableTH
                  label="Error Rate"
                  col="errRate"
                  align="right"
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
                <SortableTH
                  label="P95 Latency"
                  col="p95"
                  align="right"
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
                <SortableTH
                  label="Instances"
                  col="instances"
                  align="right"
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
                <th style={{ ...TH_BASE, color: "var(--text-4)" }}>
                  Last Seen
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <ServiceRow
                  key={s.name}
                  s={s}
                  isLast={i === filtered.length - 1}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      ...TD_STYLE,
                      textAlign: "center",
                      color: "var(--text-4)",
                      height: 80,
                    }}
                  >
                    No services match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ServiceRow({ s, isLast }: { s: Service; isLast: boolean }) {
  const [hovered, setHovered] = useState(false);
  const errColor =
    s.errRate > 5
      ? "var(--red)"
      : s.errRate > 0.5
        ? "var(--yellow)"
        : "var(--text-3)";
  const latColor =
    s.p95 > 200
      ? "var(--yellow)"
      : s.p95 > 500
        ? "var(--red)"
        : "var(--text-3)";

  const td: React.CSSProperties = {
    ...TD_STYLE,
    borderBottom: isLast ? "none" : "1px solid var(--border)",
    background: hovered ? "var(--bg-3)" : "transparent",
    transition: "background 0.1s",
  };

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "default" }}
    >
      <td
        style={{
          ...td,
          fontFamily: "Geist Mono, monospace",
          fontSize: 12,
          fontWeight: 500,
          color: "var(--text-1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Server
            size={13}
            style={{
              color:
                s.health === "Critical"
                  ? "var(--red)"
                  : s.health === "Degraded"
                    ? "var(--yellow)"
                    : "var(--green)",
              flexShrink: 0,
            }}
          />
          {s.name}
        </div>
      </td>
      <td style={td}>
        <LangBadge lang={s.lang} />
      </td>
      <td style={td}>
        <HealthBadge health={s.health} />
      </td>
      <td
        style={{
          ...td,
          textAlign: "right",
          fontFamily: "Geist Mono, monospace",
          color: "var(--text-2)",
        }}
      >
        {s.rpm.toLocaleString()}
      </td>
      <td
        style={{
          ...td,
          textAlign: "right",
          fontFamily: "Geist Mono, monospace",
          color: errColor,
        }}
      >
        {s.errRate.toFixed(1)}%
      </td>
      <td
        style={{
          ...td,
          textAlign: "right",
          fontFamily: "Geist Mono, monospace",
          color: latColor,
        }}
      >
        {s.p95}
        <span style={{ fontSize: 11, color: "var(--text-4)", marginLeft: 2 }}>
          ms
        </span>
      </td>
      <td
        style={{
          ...td,
          textAlign: "right",
          fontFamily: "Geist Mono, monospace",
          color: "var(--text-3)",
        }}
      >
        {s.instances}
      </td>
      <td style={{ ...td, color: "var(--text-4)", fontSize: 12 }}>
        {s.lastSeen}
      </td>
    </tr>
  );
}
