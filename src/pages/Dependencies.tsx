import { useState, useRef, useEffect } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { AlertTriangle, Activity, GripVertical } from "lucide-react";

type Node = {
  id: string; label: string;
  type: "service" | "database" | "external" | "gateway";
  health: "healthy" | "degraded" | "critical";
  rps: number; err: number; lat: number;
  x: number; y: number; lang?: string;
};
type Edge = { from: string; to: string; latency?: number; critical?: boolean };

const INITIAL_NODES: Node[] = [
  { id: "gateway",   label: "api-gateway",       type: "gateway",  health: "healthy",  rps: 14832, err: 0.4,  lat: 8,    x: 50, y: 9,  lang: "Go"     },
  { id: "user",      label: "user-service",       type: "service",  health: "healthy",  rps: 5820,  err: 0.1,  lat: 28,   x: 16, y: 30, lang: "Go"     },
  { id: "order",     label: "order-service",      type: "service",  health: "degraded", rps: 3201,  err: 1.1,  lat: 94,   x: 50, y: 30, lang: "Node.js"},
  { id: "payment",   label: "payment-service",    type: "service",  health: "critical", rps: 1840,  err: 12.4, lat: 312,  x: 82, y: 30, lang: "Java"   },
  { id: "inventory", label: "inventory-api",      type: "service",  health: "healthy",  rps: 2100,  err: 0.3,  lat: 45,   x: 33, y: 52, lang: "Go"     },
  { id: "notif",     label: "notification-svc",   type: "service",  health: "healthy",  rps: 1240,  err: 0.0,  lat: 15,   x: 15, y: 52, lang: "Python" },
  { id: "fraud",     label: "fraud-detection",    type: "service",  health: "healthy",  rps: 890,   err: 0.0,  lat: 88,   x: 82, y: 52, lang: "Python" },
  { id: "analytics", label: "analytics-svc",      type: "service",  health: "healthy",  rps: 540,   err: 0.2,  lat: 210,  x: 63, y: 52, lang: "Scala"  },
  { id: "postgres",  label: "PostgreSQL",          type: "database", health: "critical", rps: 0,     err: 0,    lat: 4500, x: 20, y: 76 },
  { id: "redis",     label: "Redis",               type: "database", health: "healthy",  rps: 0,     err: 0,    lat: 2,    x: 50, y: 76 },
  { id: "kafka",     label: "Apache Kafka",        type: "database", health: "healthy",  rps: 0,     err: 0,    lat: 8,    x: 68, y: 76 },
  { id: "stripe",    label: "Stripe API",          type: "external", health: "degraded", rps: 0,     err: 0,    lat: 2800, x: 90, y: 56 },
];

const EDGES: Edge[] = [
  { from: "gateway",   to: "user",      latency: 8    },
  { from: "gateway",   to: "order",     latency: 14   },
  { from: "gateway",   to: "payment",   latency: 12   },
  { from: "order",     to: "inventory", latency: 45   },
  { from: "order",     to: "notif",     latency: 15   },
  { from: "order",     to: "payment",   latency: 312,  critical: true },
  { from: "payment",   to: "fraud",     latency: 88   },
  { from: "payment",   to: "stripe",    latency: 2800, critical: true },
  { from: "user",      to: "postgres",  latency: 4500, critical: true },
  { from: "payment",   to: "postgres",  latency: 4500, critical: true },
  { from: "inventory", to: "redis",     latency: 2    },
  { from: "fraud",     to: "redis",     latency: 2    },
  { from: "order",     to: "kafka",     latency: 8    },
  { from: "analytics", to: "kafka",     latency: 8    },
  { from: "notif",     to: "kafka",     latency: 8    },
  { from: "user",      to: "redis",     latency: 2    },
];

/* ── Language icons ──────────────────────────────────────── */
function LangIcon({ lang, size = 13 }: { lang: string; size?: number }) {
  const s = size;
  switch (lang) {
    case "Go":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          {/* Go: two gopher eyes in cyan */}
          <ellipse cx="13" cy="20" rx="11" ry="9" fill="#00ACD7"/>
          <ellipse cx="28" cy="20" rx="9"  ry="9" fill="#00ACD7"/>
          <circle cx="10" cy="19" r="3" fill="white"/>
          <circle cx="25" cy="19" r="3" fill="white"/>
          <circle cx="10" cy="19" r="1.2" fill="#00ACD7"/>
          <circle cx="25" cy="19" r="1.2" fill="#00ACD7"/>
        </svg>
      );
    case "Node.js":
      return (
        <svg width={s * 0.87} height={s} viewBox="0 0 35 40" fill="none">
          {/* Node.js: green hexagon */}
          <polygon points="17.5,1 34,10 34,30 17.5,39 1,30 1,10" fill="#5FA04E"/>
          <text x="17.5" y="28" textAnchor="middle" fontSize="17" fontWeight="800" fill="white" fontFamily="system-ui,sans-serif">N</text>
        </svg>
      );
    case "Python":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          {/* Python: two interlocking P shapes */}
          <path d="M20 3C13 3 9 6 9 11v5h11v2H8C5 18 3 20 3 26c0 6 2 9 6 9h3v-5c0-3 2-5 5-5h9c3 0 5-2 5-5v-8c0-6-3-9-11-9zm-1 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" fill="#3776AB"/>
          <path d="M20 37c7 0 11-3 11-8v-5H20v-2h11c3 0 6-2 6-8s-2-9-6-9h-3v5c0 3-2 5-5 5h-9c-3 0-5 2-5 5v8c0 5 3 9 11 9zm1-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="#FFD43B"/>
        </svg>
      );
    case "Java":
      return (
        <svg width={s * 0.75} height={s} viewBox="0 0 30 40" fill="none">
          {/* Java: coffee cup simplified */}
          <path d="M11 2s-5 5 4 8c8 3 6 9 6 9s5-6-4-9c-8-3-6-8-6-8z" fill="#EA2D2E"/>
          <path d="M9 14s-3 3 4 6c10 4 9 10 9 10s0-7-8-10c-7-3-5-6-5-6z" fill="#EA2D2E"/>
          <path d="M5 33c0 0 3 4 11 4 8 0 12-3 12-4" stroke="#EA2D2E" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M3 36h24" stroke="#EA2D2E" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      );
    case "Scala":
      return (
        <svg width={s * 0.75} height={s} viewBox="0 0 30 40" fill="none">
          {/* Scala: three stacked tapered bars */}
          <rect x="0" y="0"  width="30" height="9" rx="1.5" fill="#DC322F" opacity="0.35"/>
          <rect x="0" y="15" width="30" height="9" rx="1.5" fill="#DC322F" opacity="0.65"/>
          <rect x="0" y="31" width="30" height="9" rx="1.5" fill="#DC322F"/>
        </svg>
      );
    default:
      return null;
  }
}

function LangBadge({ lang }: { lang: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <LangIcon lang={lang} size={13} />
      <span style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-3)" }}>{lang}</span>
    </span>
  );
}

/* ── Token helpers ─────────────────────────────────────── */
function healthDot(h: string) {
  if (h === "critical") return "var(--red)";
  if (h === "degraded") return "var(--yellow)";
  return "var(--green)";
}

function nodeTokens(n: Node) {
  if (n.type === "gateway")  return { bg: "rgba(50,145,255,0.08)", border: "rgba(50,145,255,0.35)", text: "var(--accent)" };
  if (n.type === "database") return { bg: "var(--bg-3)", border: "var(--border-2)", text: "var(--text-3)" };
  if (n.type === "external") return n.health === "degraded"
    ? { bg: "var(--yellow-bg)", border: "var(--yellow-border)", text: "var(--yellow)" }
    : { bg: "var(--bg-3)", border: "var(--border-2)", text: "var(--text-3)" };
  if (n.health === "critical") return { bg: "var(--red-bg)",    border: "var(--red-border)",    text: "var(--red)"    };
  if (n.health === "degraded") return { bg: "var(--yellow-bg)", border: "var(--yellow-border)", text: "var(--yellow)" };
  return { bg: "var(--bg-2)", border: "var(--border)", text: "var(--text-2)" };
}

/* Module-level derived constants */
const NODE_MAP = Object.fromEntries(INITIAL_NODES.map(n => [n.id, n]));
const NODE_COUNTS = {
  critical: INITIAL_NODES.filter(n => n.health === "critical").length,
  degraded: INITIAL_NODES.filter(n => n.health === "degraded").length,
  healthy:  INITIAL_NODES.filter(n => n.health === "healthy").length,
};

/* ── Main component ────────────────────────────────────── */
export default function Dependencies() {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() =>
    Object.fromEntries(INITIAL_NODES.map(n => [n.id, { x: n.x, y: n.y }]))
  );
  const [hovered,  setHovered]  = useState<string | null>(null);
  const [selected, setSelected] = useState<Node | null>(null);

  const canvasRef   = useRef<HTMLDivElement>(null);
  const dragState   = useRef<{ id: string; offX: number; offY: number } | null>(null);
  const didDrag     = useRef(false);

  const nodeMap = NODE_MAP;

  /* ── Global drag handlers ─────────────────────────────── */
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragState.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width)  * 100;
      const yPct = ((e.clientY - rect.top)  / rect.height) * 100;
      const newX = Math.max(4, Math.min(96, xPct - dragState.current.offX));
      const newY = Math.max(4, Math.min(96, yPct - dragState.current.offY));
      didDrag.current = true;
      const nodeId = dragState.current.id;
      setPositions(p => ({ ...p, [nodeId]: { x: newX, y: newY } }));
    }
    function onUp() { dragState.current = null; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  function onNodeMouseDown(e: React.MouseEvent, nodeId: string) {
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pos  = positions[nodeId];
    didDrag.current = false;
    dragState.current = {
      id:   nodeId,
      offX: ((e.clientX - rect.left) / rect.width)  * 100 - pos.x,
      offY: ((e.clientY - rect.top)  / rect.height) * 100 - pos.y,
    };
  }

  function onNodeClick(n: Node) {
    if (didDrag.current) return; // ignore clicks that were actually drags
    setSelected(prev => prev?.id === n.id ? null : n);
  }

  /* ── Computed sets ────────────────────────────────────── */
  const connectedTo = hovered
    ? new Set(EDGES.filter(e => e.from === hovered || e.to === hovered).flatMap(e => [e.from, e.to]))
    : null;

  const connectedEdges = selected
    ? EDGES.filter(e => e.from === selected.id || e.to === selected.id)
    : [];

  const statusCounts = NODE_COUNTS;

  return (
    <FadeIn>
      <div className="page-pad" style={{ maxWidth: 1400, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-4)", margin: "0 0 3px" }}>Infrastructure</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Service Dependency Graph</h2>
            <p style={{ fontSize: 12, color: "var(--text-4)", margin: "3px 0 0", display: "flex", alignItems: "center", gap: 5 }}>
              <GripVertical size={11} style={{ color: "var(--text-4)" }} />
              Drag nodes to rearrange · Click to inspect
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {([
              [statusCounts.critical, "critical", "var(--red)",    "var(--red-bg)",    "var(--red-border)"   ],
              [statusCounts.degraded, "degraded", "var(--yellow)", "var(--yellow-bg)", "var(--yellow-border)"],
              [statusCounts.healthy,  "healthy",  "var(--green)",  "var(--green-bg)",  "var(--green-border)" ],
            ] as [number,string,string,string,string][]).map(([n, label, color, bg, border]) => (
              <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "Geist Mono, monospace", padding: "3px 9px", borderRadius: 5, border: `1px solid ${border}`, color, background: bg }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
                {n} {label}
              </span>
            ))}
          </div>
        </div>

        {/* Graph + detail panel */}
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 300px" : "1fr", gap: 16, alignItems: "stretch" }}>

          {/* Canvas — fills full grid-cell height via flex */}
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 480 }}>
            <div style={{ flex: 1, position: "relative", minHeight: 480 }}>
              <div ref={canvasRef} style={{ position: "absolute", inset: 0, userSelect: "none" }}>

                {/* Layer band guides */}
                {[
                  { label: "Edge",     top: "6%",  height: "16%" },
                  { label: "Services", top: "22%", height: "26%" },
                  { label: "Data",     top: "48%", height: "20%" },
                  { label: "Storage",  top: "68%", height: "24%" },
                ].map(band => (
                  <div key={band.label} style={{ position: "absolute", left: 0, right: 0, top: band.top, height: band.height, borderTop: "1px dashed var(--border)", pointerEvents: "none" }}>
                    <span style={{ position: "absolute", left: 10, top: 6, fontSize: 9, fontFamily: "Geist Mono, monospace", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-4)" }}>
                      {band.label}
                    </span>
                  </div>
                ))}

                {/* SVG edges */}
                <svg
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <marker id="arrow-normal" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
                      <path d="M0,0 L4,2 L0,4 Z" fill="var(--border-2)" opacity="0.7" />
                    </marker>
                    <marker id="arrow-critical" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
                      <path d="M0,0 L4,2 L0,4 Z" fill="var(--red)" opacity="0.8" />
                    </marker>
                    <marker id="arrow-selected" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
                      <path d="M0,0 L4,2 L0,4 Z" fill="var(--accent)" opacity="0.9" />
                    </marker>
                  </defs>
                  {EDGES.map((edge, i) => {
                    const from = positions[edge.from];
                    const to   = positions[edge.to];
                    if (!from || !to) return null;
                    const isHighlighted = hovered && (edge.from === hovered || edge.to === hovered);
                    const isSelectedEdge = selected && (edge.from === selected.id || edge.to === selected.id);
                    const faded = hovered ? !isHighlighted : false;
                    const color  = edge.critical ? "var(--red)" : isSelectedEdge ? "var(--accent)" : "var(--border-2)";
                    const opacity = faded ? 0.06 : edge.critical ? 0.7 : isSelectedEdge ? 0.9 : 0.35;
                    const sw = edge.critical ? 0.4 : isSelectedEdge ? 0.35 : 0.22;
                    const mx = (from.x + to.x) / 2;
                    const my = (from.y + to.y) / 2 - 5;
                    const marker = edge.critical ? "url(#arrow-critical)" : isSelectedEdge ? "url(#arrow-selected)" : "url(#arrow-normal)";
                    return (
                      <path
                        key={i}
                        d={`M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`}
                        fill="none"
                        stroke={color}
                        strokeWidth={sw}
                        strokeOpacity={opacity}
                        strokeDasharray={edge.critical ? "0.9 0.6" : undefined}
                        markerEnd={marker}
                      />
                    );
                  })}
                </svg>

                {/* Nodes */}
                {INITIAL_NODES.map(n => {
                  const pos  = positions[n.id];
                  const tok  = nodeTokens(n);
                  const faded = hovered ? !connectedTo?.has(n.id) : false;
                  const isSel = selected?.id === n.id;
                  const isDraggingThis = dragState.current?.id === n.id;
                  return (
                    <div
                      key={n.id}
                      onMouseDown={e => onNodeMouseDown(e, n.id)}
                      onMouseUp={() => onNodeClick(n)}
                      onMouseEnter={() => setHovered(n.id)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        position: "absolute",
                        left: `${pos.x}%`,
                        top:  `${pos.y}%`,
                        transform: `translate(-50%, -50%) scale(${isSel ? 1.05 : 1})`,
                        padding: n.type === "database" || n.type === "external" ? "5px 10px" : "6px 12px",
                        borderRadius: n.type === "database" ? 6 : 8,
                        border: `${isSel ? 2 : 1}px solid ${isSel ? "var(--accent)" : tok.border}`,
                        background: tok.bg,
                        cursor: isDraggingThis ? "grabbing" : "grab",
                        whiteSpace: "nowrap",
                        transition: isDraggingThis ? "none" : "opacity 0.15s, transform 0.15s, box-shadow 0.15s",
                        opacity: faded ? 0.15 : 1,
                        boxShadow: isSel
                          ? "0 0 0 3px rgba(50,145,255,0.18), 0 4px 16px rgba(0,0,0,0.12)"
                          : hovered === n.id
                          ? "0 4px 12px rgba(0,0,0,0.1)"
                          : "none",
                        zIndex: isSel ? 20 : isDraggingThis ? 30 : 1,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {n.type !== "database" && (
                          <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: healthDot(n.health) }} />
                        )}
                        <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: tok.text, fontWeight: 500 }}>
                          {n.label}
                        </span>
                        {n.lang && <LangIcon lang={n.lang} size={11} />}
                      </div>
                      {n.type === "service" && (
                        <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                          <span style={{ fontSize: 9, fontFamily: "Geist Mono, monospace", color: n.err > 5 ? "var(--red)" : "var(--text-4)" }}>
                            err {n.err}%
                          </span>
                          <span style={{ fontSize: 9, fontFamily: "Geist Mono, monospace", color: n.lat > 300 ? "var(--red)" : n.lat > 100 ? "var(--yellow)" : "var(--text-4)" }}>
                            {n.lat}ms
                          </span>
                        </div>
                      )}
                      {n.type === "database" && (
                        <div style={{ marginTop: 2 }}>
                          <span style={{ fontSize: 9, fontFamily: "Geist Mono, monospace", color: n.lat > 1000 ? "var(--red)" : "var(--text-4)" }}>
                            {n.lat > 999 ? `${(n.lat/1000).toFixed(1)}s avg` : `${n.lat}ms avg`}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detail panel — stretches to match graph height */}
          {selected && (
            <div style={{
              background: "var(--bg-2)", border: "1px solid var(--border)",
              borderRadius: 10, overflow: "hidden",
              display: "flex", flexDirection: "column",
              /* height is driven by the grid's alignItems:stretch */
            }}>

              {/* Fixed header */}
              <div style={{
                padding: "13px 14px 11px",
                borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between", gap: 8,
                flexShrink: 0,
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: healthDot(selected.health), flexShrink: 0 }} />
                    <p style={{
                      fontSize: 12, fontWeight: 600, fontFamily: "Geist Mono, monospace",
                      color: "var(--text-1)", margin: 0,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {selected.label}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {selected.lang && <LangBadge lang={selected.lang} />}
                    <span style={{
                      fontSize: 10, fontFamily: "Geist Mono, monospace",
                      color: "var(--text-4)", textTransform: "capitalize",
                    }}>
                      {selected.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                    border: "1px solid var(--border)", background: "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "var(--text-4)", fontSize: 14,
                    lineHeight: 1, transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-3)"; e.currentTarget.style.color = "var(--text-2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-4)"; }}
                >
                  ✕
                </button>
              </div>

              {/* Scrollable body fills remaining height */}
              <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Metrics */}
                {(selected.type === "service" || selected.type === "gateway") && (
                  <div>
                    <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Metrics
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                      {([
                        ["Throughput", selected.rps.toLocaleString() + "/m", false],
                        ["Error rate", `${selected.err}%`,                   selected.err > 1],
                        ["P95 lat",   `${selected.lat}ms`,                   selected.lat > 200],
                        ["Status",    selected.health,                        selected.health !== "healthy"],
                      ] as [string, string, boolean][]).map(([k, v, alert]) => (
                        <div key={k} style={{
                          padding: "9px 11px", borderRadius: 7,
                          border: `1px solid ${alert ? (selected.health === "critical" ? "var(--red-border)" : "var(--yellow-border)") : "var(--border)"}`,
                          background: alert ? (selected.health === "critical" ? "var(--red-bg)" : "var(--yellow-bg)") : "var(--bg)",
                        }}>
                          <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: "0 0 4px" }}>{k}</p>
                          <p style={{
                            fontSize: 14, fontWeight: 700, fontFamily: "Geist Mono, monospace",
                            margin: 0, letterSpacing: "-0.02em", textTransform: "capitalize",
                            color: alert ? (selected.health === "critical" ? "var(--red)" : "var(--yellow)") : "var(--text-1)",
                          }}>
                            {v}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Database metrics */}
                {selected.type === "database" && (
                  <div>
                    <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Metrics
                    </p>
                    <div style={{
                      padding: "10px 12px", borderRadius: 7,
                      border: `1px solid ${selected.lat > 1000 ? "var(--red-border)" : "var(--border)"}`,
                      background: selected.lat > 1000 ? "var(--red-bg)" : "var(--bg)",
                    }}>
                      <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: "0 0 4px" }}>Avg latency</p>
                      <p style={{
                        fontSize: 18, fontWeight: 700, fontFamily: "Geist Mono, monospace",
                        margin: 0, letterSpacing: "-0.025em",
                        color: selected.lat > 1000 ? "var(--red)" : "var(--text-1)",
                      }}>
                        {selected.lat >= 1000 ? `${(selected.lat / 1000).toFixed(1)}s` : `${selected.lat}ms`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Connections */}
                <div>
                  <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Connections ({connectedEdges.length})
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {connectedEdges.length === 0 && (
                      <p style={{ fontSize: 12, color: "var(--text-4)", margin: 0 }}>No connections</p>
                    )}
                    {connectedEdges.map((e, i) => {
                      const other = e.from === selected.id ? nodeMap[e.to] : nodeMap[e.from];
                      if (!other) return null;
                      const isOut = e.from === selected.id;
                      return (
                        <div
                          key={i}
                          onClick={() => { didDrag.current = false; setSelected(other); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 10px", borderRadius: 7, cursor: "pointer",
                            background: "var(--bg)",
                            border: `1px solid ${e.critical ? "var(--red-border)" : "var(--border)"}`,
                            transition: "border-color 0.1s, background 0.1s",
                          }}
                          onMouseEnter={ev => { ev.currentTarget.style.borderColor = e.critical ? "var(--red)" : "var(--border-2)"; ev.currentTarget.style.background = "var(--bg-3)"; }}
                          onMouseLeave={ev => { ev.currentTarget.style.borderColor = e.critical ? "var(--red-border)" : "var(--border)"; ev.currentTarget.style.background = "var(--bg)"; }}
                        >
                          <span style={{
                            fontSize: 10, fontFamily: "Geist Mono, monospace",
                            color: e.critical ? "var(--red)" : isOut ? "var(--text-3)" : "var(--text-4)",
                            width: 14, flexShrink: 0, textAlign: "center",
                          }}>
                            {isOut ? "→" : "←"}
                          </span>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: healthDot(other.health), flexShrink: 0 }} />
                          <span style={{
                            fontSize: 11, fontFamily: "Geist Mono, monospace",
                            color: "var(--text-2)", flex: 1,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {other.label}
                          </span>
                          {e.latency && (
                            <span style={{
                              fontSize: 10, fontFamily: "Geist Mono, monospace",
                              color: e.critical ? "var(--red)" : "var(--text-4)",
                              flexShrink: 0,
                            }}>
                              {e.latency >= 1000 ? `${(e.latency / 1000).toFixed(1)}s` : `${e.latency}ms`}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Critical alert — pinned at bottom of scroll */}
                {selected.health === "critical" && (
                  <div style={{
                    marginTop: "auto",
                    padding: "10px 12px", borderRadius: 8,
                    background: "var(--red-bg)", border: "1px solid var(--red-border)",
                    display: "flex", gap: 8, alignItems: "flex-start",
                  }}>
                    <AlertTriangle size={11} style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 11, color: "var(--red)", margin: 0, lineHeight: 1.55 }}>
                      Critical state detected. Check active incidents for root cause.
                    </p>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

        {/* Summary table */}
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.006em", color: "var(--text-1)" }}>Service Summary</span>
            <Activity size={13} style={{ color: "var(--text-4)" }} />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  {["Service", "Status", "RPS", "Error %", "P95", "Language", "Upstream", "Downstream"].map(h => (
                    <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-4)", whiteSpace: "nowrap", borderBottom: "1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INITIAL_NODES.filter(n => n.type === "service" || n.type === "gateway").map(n => {
                  const tok = nodeTokens(n);
                  const ups   = EDGES.filter(e => e.to   === n.id).map(e => nodeMap[e.from]?.label).filter(Boolean);
                  const downs = EDGES.filter(e => e.from === n.id).map(e => nodeMap[e.to]?.label).filter(Boolean);
                  const isSel = selected?.id === n.id;
                  return (
                    <tr key={n.id}
                      onClick={() => setSelected(prev => prev?.id === n.id ? null : n)}
                      style={{ borderTop: "1px solid var(--border)", cursor: "pointer", background: isSel ? "var(--accent-bg)" : "transparent", transition: "background 0.1s" }}
                      onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "var(--bg-3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isSel ? "var(--accent-bg)" : "transparent"; }}
                    >
                      <td style={{ padding: "9px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: healthDot(n.health), flexShrink: 0 }} />
                          <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 12, color: "var(--text-2)", whiteSpace: "nowrap" }}>{n.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: "9px 14px" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.04em", padding: "2px 7px", borderRadius: 4, color: tok.text, background: tok.bg, border: `1px solid ${tok.border}`, whiteSpace: "nowrap" }}>
                          {n.health}
                        </span>
                      </td>
                      <td style={{ padding: "9px 14px", fontFamily: "Geist Mono, monospace", color: "var(--text-3)", fontSize: 12 }}>{n.rps.toLocaleString()}</td>
                      <td style={{ padding: "9px 14px", fontFamily: "Geist Mono, monospace", fontSize: 12, color: n.err > 5 ? "var(--red)" : n.err > 0.5 ? "var(--yellow)" : "var(--text-4)" }}>{n.err.toFixed(1)}%</td>
                      <td style={{ padding: "9px 14px", fontFamily: "Geist Mono, monospace", fontSize: 12, color: n.lat > 300 ? "var(--red)" : n.lat > 100 ? "var(--yellow)" : "var(--text-4)" }}>{n.lat}ms</td>
                      <td style={{ padding: "9px 14px" }}>
                        {n.lang ? <LangBadge lang={n.lang} /> : <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>—</span>}
                      </td>
                      <td style={{ padding: "9px 14px", fontSize: 11, color: "var(--text-4)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ups.length  ? ups.join(", ")  : "—"}</td>
                      <td style={{ padding: "9px 14px", fontSize: 11, color: "var(--text-4)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{downs.length ? downs.join(", ") : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
