import { useState } from "react";
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
} from "recharts";

/* ── Data generation ─────────────────────────────────────────── */
function gen(
  base: number,
  noise: number,
  spike?: [number, number, number],
  n = 30,
) {
  return Array.from({ length: n }, (_, i) => ({
    t: `${String(Math.floor((i * 24) / n)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
    v: Math.max(
      0,
      Math.round(
        base +
          Math.random() * noise +
          (spike && i >= spike[0] && i < spike[1] ? spike[2] : 0),
      ),
    ),
    v2: Math.max(
      0,
      Math.round(
        base * 0.85 +
          Math.random() * noise * 0.9 +
          (spike && i >= spike[0] && i < spike[1] ? spike[2] * 0.7 : 0),
      ),
    ),
  }));
}

const INFRA = [
  {
    label: "CPU Usage",
    unit: "%",
    type: "area",
    data: gen(42, 15, [18, 22, 38]),
    color: "var(--accent)",
    gradient: "cpu",
  },
  {
    label: "Memory Usage",
    unit: "GB",
    type: "area",
    data: gen(6.2, 0.8),
    color: "var(--green)",
    gradient: "mem",
  },
  {
    label: "Network I/O",
    unit: "MB/s",
    type: "line",
    data: gen(180, 60, [10, 14, 220]),
    color: "var(--accent)",
    color2: "var(--green)",
  },
  {
    label: "Disk I/O",
    unit: "MB/s",
    type: "line",
    data: gen(45, 20, [20, 23, 120]),
    color: "var(--yellow)",
    color2: "var(--accent)",
  },
];

const APP = [
  {
    label: "Request Rate",
    unit: "req/s",
    type: "bar",
    data: gen(320, 80, [14, 17, 400]),
    color: "var(--accent)",
    gradient: "rr",
  },
  {
    label: "Error Rate",
    unit: "%",
    type: "area",
    data: gen(0.6, 0.4, [14, 17, 8.8]),
    color: "var(--red)",
    gradient: "er",
  },
  {
    label: "Latency P95/P99",
    unit: "ms",
    type: "line",
    data: gen(62, 25, [14, 17, 260]),
    color: "var(--yellow)",
    color2: "var(--red)",
  },
  {
    label: "Active Connections",
    unit: "",
    type: "area",
    data: gen(140, 30, [14, 17, 120]),
    color: "var(--green)",
    gradient: "ac",
  },
];

/* ── Custom tooltip ──────────────────────────────────────────── */
function ChartTip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-3)",
        border: "1px solid var(--border-2)",
        borderRadius: 6,
        padding: "6px 10px",
        fontSize: 11,
        fontFamily: "Geist Mono, monospace",
      }}
    >
      <p style={{ color: "var(--text-4)", margin: "0 0 3px" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p
          key={i}
          style={{
            color: p.color ?? "var(--text-1)",
            fontWeight: 600,
            margin: i === 0 ? 0 : "2px 0 0",
          }}
        >
          {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          {unit}
        </p>
      ))}
    </div>
  );
}

/* ── Single chart card ──────────────────────────────────────── */
function ChartCard({ m, unit }: { m: (typeof INFRA)[0]; unit: string }) {
  const last = m.data[m.data.length - 1];
  const tick = {
    fontSize: 9,
    fill: "var(--text-4)",
    fontFamily: "Geist Mono, monospace",
  };
  const grid = (
    <CartesianGrid
      strokeDasharray="3 3"
      stroke="var(--border)"
      vertical={false}
    />
  );
  const xax = (
    <XAxis
      dataKey="t"
      tick={tick}
      interval={7}
      axisLine={false}
      tickLine={false}
    />
  );
  const yax = (
    <YAxis tick={tick} axisLine={false} tickLine={false} width={32} />
  );
  const tip = (
    <Tooltip
      content={<ChartTip unit={unit} />}
      cursor={{ stroke: "var(--border-2)", strokeWidth: 1 }}
    />
  );

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--border-2)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--border)")
      }
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-2)",
            letterSpacing: "-0.01em",
          }}
        >
          {m.label}
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "Geist Mono, monospace",
            color: "var(--text-1)",
            letterSpacing: "-0.02em",
          }}
        >
          {typeof last.v === "number" ? last.v.toLocaleString() : last.v}
          <span style={{ fontSize: 11, color: "var(--text-4)", marginLeft: 2 }}>
            {unit}
          </span>
        </span>
      </div>
      <div style={{ padding: "12px 4px 8px 0" }}>
        <ResponsiveContainer width="100%" height={110}>
          {m.type === "area" ? (
            <AreaChart
              data={m.data}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={`g-${m.gradient}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={m.color} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={m.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              {grid}
              {xax}
              {yax}
              {tip}
              <Area
                type="monotone"
                dataKey="v"
                stroke={m.color}
                strokeWidth={1.5}
                fill={`url(#g-${m.gradient})`}
                dot={false}
              />
            </AreaChart>
          ) : m.type === "bar" ? (
            <BarChart
              data={m.data}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              {grid}
              {xax}
              {yax}
              {tip}
              <Bar
                dataKey="v"
                fill={m.color}
                radius={[2, 2, 0, 0]}
                maxBarSize={10}
                fillOpacity={0.75}
              />
            </BarChart>
          ) : (
            <LineChart
              data={m.data}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              {grid}
              {xax}
              {yax}
              {tip}
              <Line
                type="monotone"
                dataKey="v"
                stroke={m.color}
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="v2"
                stroke={"color2" in m ? m.color2 : m.color}
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 2"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
const TABS = ["Infrastructure", "Application", "Custom"] as const;
type Tab = (typeof TABS)[number];
const TF = ["15m", "1h", "6h", "24h", "7d"];

export default function Metrics() {
  const [tab, setTab] = useState<Tab>("Infrastructure");
  const [tf, setTf] = useState("1h");

  const charts =
    tab === "Infrastructure" ? INFRA : tab === "Application" ? APP : [];

  return (
    <div
      className="responsive-page-header"
      style={{
        padding: "24px 32px",
        fontFamily: "Geist, sans-serif",
        minHeight: "100%",
      }}
    >
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
            Metrics
          </h1>
          <p
            style={{ fontSize: 13, color: "var(--text-3)", margin: "4px 0 0" }}
          >
            Custom metrics and infrastructure telemetry
          </p>
        </div>
        <button
          style={{
            height: 32,
            padding: "0 14px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--bg-2)",
            color: "var(--text-1)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            letterSpacing: "-0.01em",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--bg-3)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--bg-2)")
          }
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add metric
        </button>
      </div>

      {/* Controls bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 2,
            borderBottom: "1px solid var(--border)",
            width: "fit-content",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                background: "transparent",
                color: tab === t ? "var(--text-1)" : "var(--text-3)",
                borderBottom:
                  tab === t
                    ? "2px solid var(--text-1)"
                    : "2px solid transparent",
                marginBottom: -1,
                transition: "color 0.1s",
                letterSpacing: "-0.01em",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Time range */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: 2,
          }}
        >
          {TF.map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              style={{
                height: 28,
                padding: "0 10px",
                borderRadius: 4,
                fontSize: 12,
                fontFamily: "Geist Mono, monospace",
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                background: tf === t ? "var(--bg-3)" : "transparent",
                color: tf === t ? "var(--text-1)" : "var(--text-3)",
                transition: "all 0.1s",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Charts grid or empty state */}
      {tab === "Custom" ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 0",
            gap: 16,
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-2)",
                margin: "0 0 6px",
              }}
            >
              No custom metrics configured yet
            </p>
            <p style={{ fontSize: 13, color: "var(--text-4)", margin: 0 }}>
              Add a custom metric to start tracking application-specific
              signals.
            </p>
          </div>
          <button
            style={{
              height: 32,
              padding: "0 16px",
              borderRadius: 6,
              border: "none",
              background: "var(--text-1)",
              color: "var(--bg)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Add metric
          </button>
        </div>
      ) : (
        <div
          className="rg-2"
        >
          {charts.map((m) => (
            <ChartCard key={m.label} m={m} unit={m.unit} />
          ))}
        </div>
      )}
    </div>
  );
}
