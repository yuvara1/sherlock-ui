import { useState } from "react"
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
} from "recharts"
/* ── Data generation ─────────────────────────────────────────── */
function gen(
  base: number,
  noise: number,
  spike?: [number, number, number],
  n = 30,
) {
  return Array.from({ length: n }, (_, i) => ({
    t: `${String(Math.floor((i * 24) / n)).padStart(2, "0")}:${
      i % 2 === 0 ? "00" : "30"
    }`,
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
  }))
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
]
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
]
/* ── Custom tooltip ──────────────────────────────────────────── */
function ChartTip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="[background:var(--bg-3)] [border:1px_solid_var(--border-2)] [border-radius:6px] [padding:6px_10px] [font-size:11px] [font-family:Geist_Mono,_monospace]">
      <p className="[color:var(--text-4)] [margin:0_0_3px]">{label}</p>
      {payload.map((p: any, i: number) => (
        <p
          key={i}
          style={{
            color: p.color ?? "var(--text-1)",
          }}
          className={[
            "[font-weight:600]",
            i === 0 ? "[margin:0]" : "[margin:2px_0_0]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          {unit}
        </p>
      ))}
    </div>
  )
}
/* ── Single chart card ──────────────────────────────────────── */
function ChartCard({ m, unit }: { m: typeof INFRA[0] unit: string }) {
  const last = m.data[m.data.length - 1]
  const tick = {
    fontSize: 9,
    fill: "var(--text-4)",
    fontFamily: "Geist Mono, monospace",
  }
  const grid = (
    <CartesianGrid
      strokeDasharray="3 3"
      stroke="var(--border)"
      vertical={false}
    />
  )
  const xax = (
    <XAxis
      dataKey="t"
      tick={tick}
      interval={7}
      axisLine={false}
      tickLine={false}
    />
  )
  const yax = <YAxis tick={tick} axisLine={false} tickLine={false} width={32} />
  const tip = (
    <Tooltip
      content={<ChartTip unit={unit} />}
      cursor={{ stroke: "var(--border-2)", strokeWidth: 1 }}
    />
  )
  return (
    <div className="[background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:8px] [overflow:hidden] [transition:border-color_0.15s] hover:[border-color:var(--border-2)]">
      <div className="[display:flex] [align-items:center] [justify-content:space-between] [padding:10px_14px] [border-bottom:1px_solid_var(--border)]">
        <span className="[font-size:12px] [font-weight:500] [color:var(--text-2)] [letter-spacing:-0.01em]">
          {m.label}
        </span>
        <span className="[font-size:14px] [font-weight:600] [font-family:Geist_Mono,_monospace] [color:var(--text-1)] [letter-spacing:-0.02em]">
          {typeof last.v === "number" ? last.v.toLocaleString() : last.v}
          <span className="[font-size:11px] [color:var(--text-4)] [margin-left:2px]">
            {unit}
          </span>
        </span>
      </div>
      <div className="[padding:12px_4px_8px_0]">
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
  )
}
/* ── Page ────────────────────────────────────────────────────── */
const TABS = ["Infrastructure", "Application", "Custom"] as const
type Tab = typeof TABS[number]
const TF = ["15m", "1h", "6h", "24h", "7d"]
export default function Metrics() {
  const [tab, setTab] = useState<Tab>("Infrastructure")
  const [tf, setTf] = useState("1h")
  const charts =
    tab === "Infrastructure" ? INFRA : tab === "Application" ? APP : []
  return (
    <div className="max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:24px_32px] [font-family:Geist,_sans-serif] [min-height:100%]">
      {/* Page header */}
      <div className="[display:flex] [align-items:center] [justify-content:space-between] [padding-bottom:20px] [border-bottom:1px_solid_var(--border)] [margin-bottom:20px]">
        <div>
          <h1 className="[font-size:18px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)] [margin:0]">
            Metrics
          </h1>
          <p className="[font-size:13px] [color:var(--text-3)] [margin:4px_0_0]">
            Custom metrics and infrastructure telemetry
          </p>
        </div>
        <button className="[height:32px] [padding:0_14px] [border-radius:6px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [color:var(--text-1)] [font-size:13px] [font-weight:500] [cursor:pointer] [display:flex] [align-items:center] [gap:6px] [letter-spacing:-0.01em] hover:[background:var(--bg-3)]">
          <span className="[font-size:16px] [line-height:1]">+</span> Add metric
        </button>
      </div>

      {/* Controls bar */}
      <div className="[display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:20px]">
        {/* Tabs */}
        <div className="[display:flex] [gap:2px] [border-bottom:1px_solid_var(--border)] [width:fit-content]">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "[padding:8px_14px] [font-size:13px] [font-weight:500] [cursor:pointer] [border:none] [background:transparent] [margin-bottom:-1px] [transition:color_0.1s] [letter-spacing:-0.01em]",
                tab === t ? "[color:var(--text-1)]" : "[color:var(--text-3)]",
                tab === t
                  ? "[border-bottom:2px_solid_var(--text-1)]"
                  : "[border-bottom:2px_solid_transparent]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Time range */}
        <div className="[display:flex] [align-items:center] [gap:1px] [background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:6px] [padding:2px]">
          {TF.map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={[
                "[height:28px] [padding:0_10px] [border-radius:4px] [font-size:12px] [font-family:Geist_Mono,_monospace] [font-weight:500] [cursor:pointer] [border:none] [transition:all_0.1s]",
                tf === t
                  ? "[background:var(--bg-3)]"
                  : "[background:transparent]",
                tf === t ? "[color:var(--text-1)]" : "[color:var(--text-3)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Charts grid or empty state */}
      {tab === "Custom" ? (
        <div className="[display:flex] [flex-direction:column] [align-items:center] [justify-content:center] [padding:80px_0] [gap:16px] [background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:8px]">
          <div className="[text-align:center]">
            <p className="[font-size:14px] [font-weight:500] [color:var(--text-2)] [margin:0_0_6px]">
              No custom metrics configured yet
            </p>
            <p className="[font-size:13px] [color:var(--text-4)] [margin:0]">
              Add a custom metric to start tracking application-specific
              signals.
            </p>
          </div>
          <button className="[height:32px] [padding:0_16px] [border-radius:6px] [border:none] [background:var(--text-1)] [color:var(--bg)] [font-size:13px] [font-weight:500] [cursor:pointer] [letter-spacing:-0.01em] hover:[opacity:0.85]">
            Add metric
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[901px]:grid-cols-2 gap-3">
          {charts.map((m) => (
            <ChartCard key={m.label} m={m} unit={m.unit} />
          ))}
        </div>
      )}
    </div>
  )
}
