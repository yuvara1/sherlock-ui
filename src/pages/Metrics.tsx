import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FadeIn } from "@/components/ui/FadeIn";
import { useTheme } from "@/lib/theme";
import { SherlockSelect } from "@/components/ui/SherlockSelect";

const TF = ["15m", "1h", "6h", "24h", "7d"];

function gen(base: number, noise: number, spike?: [number, number, number]) {
  return Array.from({ length: 24 }, (_, i) => ({
    t: `${i}:00`,
    v: Math.max(0, Math.floor(base + Math.random() * noise + (spike && i >= spike[0] && i < spike[1] ? spike[2] : 0))),
  }));
}

const METRICS = [
  { label: "Request Rate",   unit: "req/s", data: gen(180, 40, [13, 16, 120]) },
  { label: "Error Rate",     unit: "%",     data: gen(0.8, 0.5,[13, 16, 8])   },
  { label: "P95 Latency",    unit: "ms",    data: gen(60,  20, [13, 16, 140]) },
  { label: "CPU Usage",      unit: "%",     data: gen(35,  10, [13, 16, 40])  },
  { label: "Memory",         unit: "MB",    data: gen(1200,100)               },
  { label: "DB Connections", unit: "",      data: gen(22,  8,  [13, 16, 28])  },
];

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ borderRadius: 6, padding: "6px 10px", background: "var(--bg-3)", border: "1px solid var(--border-2)", fontSize: 11, fontFamily: "Geist Mono, monospace" }}>
      <p style={{ color: "var(--text-4)", margin: "0 0 2px" }}>{label}</p>
      <p style={{ color: "var(--text-1)", fontWeight: 600, margin: 0 }}>{payload[0]?.value}</p>
    </div>
  );
}

export default function Metrics() {
  const [tf,  setTf]  = useState("1h");
  const [svc, setSvc] = useState("payment-service");
  const { theme } = useTheme();
  const stroke = theme === "dark" ? "#ffffff" : "#000000";
  const gridC  = theme === "dark" ? "#111111" : "#e8e8e8";
  const tickC  = theme === "dark" ? "#333333" : "#aaaaaa";
  const gradId = (label: string) => `g-${label.replace(/\s+/g, "-")}`;

  return (
    <div className="page-pad" style={{ maxWidth: 1600, fontFamily: "Geist, sans-serif", fontSize: 13, letterSpacing: "-0.004em" }}>
      <FadeIn>
        <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-4)", marginBottom: 4 }}>Observability</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Metrics</h2>
          </div>
          <div className="flex items-center gap-2">
            <SherlockSelect
              value={svc}
              onChange={setSvc}
              options={["payment-service","order-service","user-service","notification-svc"]}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 2, borderRadius: 8, padding: 4, background: "var(--bg-2)", border: "1px solid var(--border)" }}>
              {TF.map(t => (
                <button key={t} onClick={() => setTf(t)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: "Geist Mono, monospace",
                    fontWeight: 500,
                    cursor: "pointer",
                    border: "none",
                    background: tf === t ? "var(--bg-inv)" : "transparent",
                    color: tf === t ? "var(--text-inv)" : "var(--text-4)",
                    transition: "background 0.1s, color 0.1s",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {METRICS.map((m) => (
          <div
            key={m.label}
            style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", transition: "border-color 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-2)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            {/* Card header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.004em", color: "var(--text-2)" }}>{m.label}</span>
              <span style={{ fontSize: 13, fontFamily: "Geist Mono, monospace", fontWeight: 600, color: "var(--text-1)" }}>
                {m.data[m.data.length - 1].v}{m.unit}
              </span>
            </div>
            {/* Chart */}
            <div style={{ padding: "12px 4px 8px" }}>
              <ResponsiveContainer width="100%" height={90}>
                <AreaChart data={m.data} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradId(m.label)} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={stroke} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={stroke} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridC} />
                  <XAxis dataKey="t" tick={{ fontSize: 9, fill: tickC, fontFamily: "Geist Mono" }} interval={7} />
                  <YAxis tick={{ fontSize: 9, fill: tickC, fontFamily: "Geist Mono" }} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} fill={`url(#${gradId(m.label)})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
