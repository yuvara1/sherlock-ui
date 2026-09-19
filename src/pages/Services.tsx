import { useState, useMemo, useCallback } from "react";
import React from "react";
import { Server, AlertTriangle, ChevronRight, Activity, Zap, AlertCircle } from "lucide-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { FadeIn } from "@/components/ui/FadeIn";
import { SherlockGrid } from "@/components/ui/SherlockGrid";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";

const SERVICES = [
  { name: "payment-service",   version: "v2.14.1", env: "production", health: "CRITICAL", rps: 1840,  err: 12.4, lat: 312,  p99: 4532, cpu: 78,  mem: 82,  deps: ["PostgreSQL","HikariCP","redis-cache","order-service","fraud-api","stripe-sdk"],       incidents: ["INC-094","INC-093"], desc: "Handles payment processing, charge validation, and ledger operations",    lang: "Java",    instances: 4  },
  { name: "order-service",     version: "v3.8.0",  env: "production", health: "DEGRADED", rps: 3201,  err: 1.1,  lat: 94,   p99: 842,  cpu: 34,  mem: 61,  deps: ["payment-service","inventory-api","notification-svc","kafka","PostgreSQL"],            incidents: ["INC-092"],          desc: "Manages order lifecycle from creation through fulfillment and returns",  lang: "Node.js", instances: 6  },
  { name: "user-service",      version: "v1.22.4", env: "production", health: "HEALTHY",  rps: 5820,  err: 0.1,  lat: 28,   p99: 88,   cpu: 22,  mem: 48,  deps: ["PostgreSQL","redis-cache","JWKS-endpoint","S3"],                                       incidents: [],                   desc: "Authentication, authorization, profile management, JWT issuance",       lang: "Go",      instances: 8  },
  { name: "notification-svc",  version: "v0.8.1",  env: "production", health: "HEALTHY",  rps: 1240,  err: 0.0,  lat: 15,   p99: 48,   cpu: 12,  mem: 38,  deps: ["AWS SES","AWS SNS","Twilio","order-service","kafka"],                                   incidents: [],                   desc: "Email, SMS, and push notification delivery across all channels",        lang: "Python",  instances: 3  },
  { name: "inventory-api",     version: "v2.3.0",  env: "production", health: "HEALTHY",  rps: 2100,  err: 0.3,  lat: 45,   p99: 148,  cpu: 18,  mem: 55,  deps: ["PostgreSQL","redis-cache","S3","kafka"],                                               incidents: [],                   desc: "Stock management, reservation, allocation, and availability queries",    lang: "Go",      instances: 4  },
  { name: "fraud-detection",   version: "v1.9.2",  env: "production", health: "HEALTHY",  rps: 890,   err: 0.0,  lat: 88,   p99: 280,  cpu: 64,  mem: 71,  deps: ["payment-service","ML-model-server","redis-cache","PostgreSQL"],                        incidents: [],                   desc: "Real-time transaction risk scoring using ML and rule-based engine",     lang: "Python",  instances: 2  },
  { name: "analytics-service", version: "v0.4.1",  env: "production", health: "HEALTHY",  rps: 540,   err: 0.2,  lat: 210,  p99: 680,  cpu: 45,  mem: 79,  deps: ["kafka","ClickHouse","redis-cache","S3"],                                               incidents: [],                   desc: "Event stream processing, aggregation, and real-time analytics",         lang: "Scala",   instances: 2  },
  { name: "api-gateway",       version: "v4.1.0",  env: "production", health: "HEALTHY",  rps: 14832, err: 0.4,  lat: 8,    p99: 22,   cpu: 31,  mem: 44,  deps: ["user-service","payment-service","order-service","nginx","Redis"],                      incidents: [],                   desc: "Edge routing, rate limiting, auth forwarding, and TLS termination",     lang: "Go",      instances: 6  },
];

type Service = typeof SERVICES[0];

/* ── Token helpers ─────────────────────────────────────────── */
function healthTokens(h: string) {
  const H = h.toUpperCase();
  if (H === "CRITICAL") return { color: "var(--red)",    bg: "var(--red-bg)",    border: "var(--red-border)",    dot: "#ef4444" };
  if (H === "DEGRADED") return { color: "var(--yellow)", bg: "var(--yellow-bg)", border: "var(--yellow-border)", dot: "#eab308" };
  return                       { color: "var(--green)",  bg: "var(--green-bg)",  border: "var(--green-border)",  dot: "#22c55e" };
}

function LangIcon({ lang, size = 13 }: { lang: string; size?: number }) {
  switch (lang) {
    case "Go":
      return (
        <svg width={size} height={size} viewBox="0 0 13 13" fill="none">
          <ellipse cx="4.5" cy="6.5" rx="1.5" ry="2.5" fill="#00ACD7" opacity="0.9" />
          <ellipse cx="8.5" cy="6.5" rx="1.5" ry="2.5" fill="#00ACD7" opacity="0.9" />
          <circle cx="4.2" cy="5.6" r="0.7" fill="white" />
          <circle cx="8.2" cy="5.6" r="0.7" fill="white" />
          <circle cx="4.5" cy="5.7" r="0.35" fill="#111" />
          <circle cx="8.5" cy="5.7" r="0.35" fill="#111" />
        </svg>
      );
    case "Node.js":
      return (
        <svg width={size} height={size} viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1L12 4.25v5.5L6.5 13 1 9.75V4.25z" fill="#539E43" />
          <text x="6.5" y="9" textAnchor="middle" fontSize="5.5" fontWeight="700" fontFamily="sans-serif" fill="white">N</text>
        </svg>
      );
    case "Python":
      return (
        <svg width={size} height={size} viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1C4 1 3.5 2 3.5 3v1.5h3V5H2.5C1.5 5 1 5.8 1 7s.5 2.5 1.5 2.5H3v-1.3c0-1 .5-1.7 1.5-1.7h4c1 0 1.5-.7 1.5-1.5V3c0-.8-.7-2-3.5-2z" fill="#3776AB" />
          <path d="M6.5 12C9 12 9.5 11 9.5 10V8.5h-3V8h4c1 0 1.5-.8 1.5-2s-.5-2.5-1.5-2.5H10v1.3c0 1-.5 1.7-1.5 1.7h-4c-1 0-1.5.7-1.5 1.5V10c0 .8.7 2 3.5 2z" fill="#FFD43B" />
          <circle cx="5.2" cy="3" r="0.6" fill="white" />
          <circle cx="7.8" cy="10" r="0.6" fill="#3776AB" />
        </svg>
      );
    case "Java":
      return (
        <svg width={size} height={size} viewBox="0 0 13 13" fill="none">
          <path d="M5 9.5s-.6.4.4.5c1.2.2 1.9.1 3.2-.1 0 0 .4.2.9.4C6.5 11.2 2.8 10.2 5 9.5z" fill="#E76F00" />
          <path d="M4.5 8.3s-.7.5.7.6c1.8.2 3.2.2 4.4-.3 0 0 .3.3.7.4C7 10 2.4 9.1 4.5 8.3z" fill="#E76F00" />
          <path d="M7.2 5.7c.8 1-.7 1.8-.7 1.8s2-.9 1.1-2.1c-.9-1.1-1.5-1.6 2-3.4 0 0-5.6 1.4-2.4 3.7z" fill="#E76F00" />
          <path d="M10.2 10.6s.5.4-.5.7c-1.8.5-7.3.6-8.9 0-.5-.2.5-.6.8-.6.3-.1.5 0 .5 0-.6-.4-3.6.8-1.6 1.1 5.7.9 10.4-.4 9.7-1.2z" fill="#E76F00" />
        </svg>
      );
    case "Scala":
      return (
        <svg width={size} height={size} viewBox="0 0 13 13" fill="none">
          <rect x="2" y="2" width="9" height="2.5" rx="0.5" fill="#DC322F" />
          <rect x="2" y="5.2" width="9" height="2.5" rx="0.5" fill="#DC322F" opacity="0.7" />
          <rect x="2" y="8.4" width="9" height="2.5" rx="0.5" fill="#DC322F" opacity="0.4" />
        </svg>
      );
    default:
      return null;
  }
}

/* ── Shared cell wrapper ────────────────────────────────────── */
const Cell = ({ children, justify = "flex-start" }: { children: React.ReactNode; justify?: string }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: justify, height: "100%", width: "100%" }}>
    {children}
  </div>
);

/* ── Cell renderers ────────────────────────────────────────── */
function ServiceNameCell({ data }: ICellRendererParams<Service>) {
  if (!data) return null;
  const t = healthTokens(data.health);
  return (
    <Cell>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.dot, flexShrink: 0, marginRight: 10, boxShadow: data.health !== "HEALTHY" ? `0 0 6px ${t.dot}` : "none" }} />
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", fontFamily: "Geist Mono, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
        {data.name}
      </span>
      {data.incidents.length > 0 && (
        <span style={{ marginLeft: 8, flexShrink: 0 }}>
          <AlertTriangle size={11} style={{ color: "var(--red)" }} />
        </span>
      )}
    </Cell>
  );
}

function StatusCell({ data }: ICellRendererParams<Service>) {
  if (!data) return null;
  const variant = data.health === "CRITICAL" ? "error" : data.health === "DEGRADED" ? "warning" : "success";
  const Icon = data.health === "CRITICAL" ? AlertCircle : data.health === "DEGRADED" ? Zap : Activity;
  const label = data.health === "HEALTHY" ? "Healthy" : data.health === "DEGRADED" ? "Degraded" : "Critical";
  return (
    <Cell>
      <Badge variant={variant}>
        <Icon size={10} strokeWidth={2.5} />
        {label}
      </Badge>
    </Cell>
  );
}

function LangCell({ data }: ICellRendererParams<Service>) {
  if (!data) return null;
  return (
    <Cell>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        <LangIcon lang={data.lang} size={13} />
        <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-3)" }}>{data.lang}</span>
      </span>
    </Cell>
  );
}

function RpsCell({ value }: ICellRendererParams<Service>) {
  return (
    <Cell justify="flex-end">
      <span style={{ fontSize: 13, fontFamily: "Geist Mono, monospace", color: "var(--text-2)", letterSpacing: "-0.02em" }}>
        {(value as number).toLocaleString()}
      </span>
    </Cell>
  );
}

function ErrCell({ value }: ICellRendererParams<Service>) {
  const v = value as number;
  const color = v > 5 ? "var(--red)" : v > 0.5 ? "var(--yellow)" : "var(--text-4)";
  return (
    <Cell justify="flex-end">
      <span style={{ fontSize: 13, fontFamily: "Geist Mono, monospace", color, letterSpacing: "-0.02em" }}>
        {v.toFixed(1)}%
      </span>
    </Cell>
  );
}

function LatCell({ value, colDef }: ICellRendererParams<Service>) {
  const v = value as number;
  const isP99 = colDef?.field === "p99";
  const color = isP99
    ? v > 1000 ? "var(--red)" : v > 400 ? "var(--yellow)" : "var(--text-3)"
    : v > 500  ? "var(--yellow)" : v > 200 ? "var(--text-2)" : "var(--text-3)";
  return (
    <Cell justify="flex-end">
      <span style={{ fontSize: 13, fontFamily: "Geist Mono, monospace", color, letterSpacing: "-0.02em" }}>
        {v.toLocaleString()}<span style={{ fontSize: 11, color: "var(--text-4)", marginLeft: 2 }}>ms</span>
      </span>
    </Cell>
  );
}

function BarCell({ value }: ICellRendererParams<Service>) {
  const v = value as number;
  const color = v > 70 ? "var(--red)" : v > 50 ? "var(--yellow)" : "var(--blue-muted)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: "100%", width: "100%", paddingRight: 8, paddingLeft: 4 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 99, background: "var(--bg-3)", overflow: "hidden" }}>
        <div style={{ width: `${v}%`, height: "100%", borderRadius: 99, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color, width: 36, textAlign: "right", flexShrink: 0, letterSpacing: "-0.02em" }}>{v}%</span>
    </div>
  );
}

function IncidentsCell({ data }: ICellRendererParams<Service>) {
  if (!data) return null;
  const count = data.incidents.length;
  return (
    <Cell>
      {count > 0 ? (
        <Badge variant="error">
          <AlertTriangle size={10} strokeWidth={2.5} />
          {count} open
        </Badge>
      ) : (
        <span style={{ fontSize: 13, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>—</span>
      )}
    </Cell>
  );
}

/* ── Service Detail Drawer ─────────────────────────────────── */
function ServiceDrawer({ service, open, onClose }: { service: Service | null; open: boolean; onClose: () => void }) {
  if (!service) return null;
  const t = healthTokens(service.health);

  return (
    <Drawer open={open} onOpenChange={o => { if (!o) onClose(); }} direction="right">
      <DrawerContent
        hideHandle
        className="!inset-y-0 !right-0 !left-auto !bottom-auto !rounded-none !border-l !border-t-0 !border-b-0 !border-r-0 !h-full !w-[380px] flex flex-col mt-0"
        style={{ background: "var(--bg)", borderColor: "var(--border)", maxWidth: "90vw", overflow: "hidden" }}
      >
        {/* Drag handle hidden for side drawer */}

        {/* Header */}
        <DrawerHeader className="border-b px-5 py-4 flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Server size={15} style={{ color: "var(--text-3)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <DrawerTitle className="text-sm font-semibold" style={{ fontFamily: "Geist Mono, monospace", color: "var(--text-1)", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                {service.name}
              </DrawerTitle>
              <DrawerDescription className="text-xs mt-0.5" style={{ color: "var(--text-4)", fontFamily: "Geist, sans-serif" }}>
                {service.lang} · {service.env} · {service.instances} instances · {service.version}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <button
                style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-4)", flexShrink: 0, fontSize: 16 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-4)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                ×
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Scrollable body — block layout so sections never shrink */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 20px" }}>
          {/* Status badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Badge variant={service.health === "CRITICAL" ? "error" : service.health === "DEGRADED" ? "warning" : "success"}>
              {service.health === "CRITICAL" ? <AlertCircle size={10} /> : service.health === "DEGRADED" ? <Zap size={10} /> : <Activity size={10} />}
              {service.health === "HEALTHY" ? "Healthy" : service.health === "DEGRADED" ? "Degraded" : "Critical"}
            </Badge>
            {service.incidents.length > 0 && (
              <Badge variant="error">
                <AlertTriangle size={10} />
                {service.incidents.length} active incident{service.incidents.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p style={{ fontSize: 12, lineHeight: 1.7, color: "var(--text-3)", margin: "0 0 16px" }}>{service.desc}</p>

          {/* KPI grid */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-4)", margin: "0 0 8px" }}>Performance</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {([
                ["RPS",    service.rps.toLocaleString(), "var(--text-1)"],
                ["P95",    service.lat + " ms",          service.lat > 500  ? "var(--yellow)" : "var(--text-1)"],
                ["P99",    service.p99 + " ms",          service.p99 > 1000 ? "var(--red)"    : "var(--text-1)"],
                ["Errors", service.err.toFixed(1) + "%", service.err > 5    ? "var(--red)"    : service.err > 0.5 ? "var(--yellow)" : "var(--green)"],
                ["CPU",    service.cpu + "%",            service.cpu > 70   ? "var(--red)"    : service.cpu > 50 ? "var(--yellow)" : "var(--text-1)"],
                ["Memory", service.mem + "%",            service.mem > 80   ? "var(--red)"    : service.mem > 65 ? "var(--yellow)" : "var(--text-1)"],
              ] as [string,string,string][]).map(([k, v, c]) => (
                <div key={k} style={{ borderRadius: 8, padding: "10px 8px", textAlign: "center", border: "1px solid var(--border)", background: "var(--bg-2)" }}>
                  <p style={{ fontSize: 15, fontFamily: "Geist Mono, monospace", fontWeight: 700, color: c, margin: "0 0 3px", letterSpacing: "-0.025em" }}>{v}</p>
                  <p style={{ fontSize: 10, color: "var(--text-4)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>{k}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Utilization bars */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 9, background: "var(--bg-2)", marginBottom: 16 }}>
            <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--border)", borderRadius: "9px 9px 0 0" }}>
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-4)", margin: 0 }}>Utilization</p>
            </div>
            <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 12 }}>
              {([
                ["CPU",    service.cpu, service.cpu > 70 ? "var(--red)" : service.cpu > 50 ? "var(--yellow)" : "var(--blue)"],
                ["Memory", service.mem, service.mem > 80 ? "var(--red)" : service.mem > 65 ? "var(--yellow)" : "var(--blue)"],
              ] as [string,number,string][]).map(([label, val, color]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--text-3)", width: 48, flexShrink: 0 }}>{label}</span>
                  <div style={{ flex: 1, height: 5, borderRadius: 99, background: "var(--bg-3)", overflow: "hidden" }}>
                    <div style={{ width: `${val}%`, height: "100%", borderRadius: 99, background: color, transition: "width 0.4s ease" }} />
                  </div>
                  <span style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color, width: 38, textAlign: "right", letterSpacing: "-0.02em" }}>{val}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active incidents */}
          {service.incidents.length > 0 && (
            <div style={{ border: `1px solid ${t.border}`, borderRadius: 9, background: t.bg, marginBottom: 16 }}>
              <div style={{ padding: "8px 14px", borderBottom: `1px solid ${t.border}`, borderRadius: "9px 9px 0 0" }}>
                <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: t.color, margin: 0 }}>Active Incidents</p>
              </div>
              {service.incidents.map(id => (
                <div key={id} style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${t.border}` }}>
                  <AlertTriangle size={12} style={{ color: t.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontFamily: "Geist Mono, monospace", fontWeight: 600, color: t.color, letterSpacing: "-0.01em", flex: 1 }}>{id}</span>
                  <ChevronRight size={12} style={{ color: t.color, opacity: 0.5 }} />
                </div>
              ))}
            </div>
          )}

          {/* Dependencies */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 9, background: "var(--bg-2)", marginBottom: 8 }}>
            <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "9px 9px 0 0" }}>
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-4)", margin: 0 }}>Dependencies</p>
              <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{service.deps.length}</span>
            </div>
            {service.deps.map((d, i) => (
              <div key={d} style={{ padding: "9px 14px", borderBottom: i < service.deps.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--border-2)", flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontFamily: "Geist Mono, monospace", color: "var(--text-3)", flex: 1 }}>{d}</span>
                <ChevronRight size={11} style={{ color: "var(--text-4)" }} />
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function Services() {
  const [sel, setSel] = useState<Service | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const counts = {
    critical: SERVICES.filter(s => s.health === "CRITICAL").length,
    degraded: SERVICES.filter(s => s.health === "DEGRADED").length,
    healthy:  SERVICES.filter(s => s.health === "HEALTHY").length,
  };

  const colDefs = useMemo<ColDef<Service>[]>(() => [
    {
      field: "name",
      headerName: "Service",
      cellRenderer: ServiceNameCell,
      flex: 2, minWidth: 190, maxWidth: 320,
      sortable: true, resizable: true,
    },
    {
      field: "health",
      headerName: "Status",
      cellRenderer: StatusCell,
      width: 115, minWidth: 100, maxWidth: 135,
      sortable: true, resizable: false,
      comparator: (a: string, b: string) => {
        const order: Record<string, number> = { CRITICAL: 0, DEGRADED: 1, HEALTHY: 2 };
        return (order[a] ?? 3) - (order[b] ?? 3);
      },
    },
    {
      field: "lang",
      headerName: "Runtime",
      cellRenderer: LangCell,
      width: 100, minWidth: 90, maxWidth: 120,
      sortable: true, resizable: false,
    },
    {
      field: "rps",
      headerName: "RPS",
      cellRenderer: RpsCell,
      headerClass: "ag-right-aligned-header",
      width: 90, minWidth: 76, maxWidth: 110,
      sortable: true, resizable: false,
    },
    {
      field: "err",
      headerName: "Errors",
      cellRenderer: ErrCell,
      headerClass: "ag-right-aligned-header",
      width: 82, minWidth: 72, maxWidth: 100,
      sortable: true, resizable: false,
    },
    {
      field: "lat",
      headerName: "P95",
      cellRenderer: LatCell,
      headerClass: "ag-right-aligned-header",
      width: 96, minWidth: 84, maxWidth: 120,
      sortable: true, resizable: false,
    },
    {
      field: "p99",
      headerName: "P99",
      cellRenderer: LatCell,
      headerClass: "ag-right-aligned-header",
      width: 96, minWidth: 84, maxWidth: 120,
      sortable: true, resizable: false,
    },
    {
      field: "cpu",
      headerName: "CPU",
      cellRenderer: BarCell,
      width: 140, minWidth: 110, maxWidth: 170,
      sortable: true, resizable: false,
    },
    {
      field: "mem",
      headerName: "Memory",
      cellRenderer: BarCell,
      width: 140, minWidth: 110, maxWidth: 170,
      sortable: true, resizable: false,
    },
    {
      field: "incidents",
      headerName: "Incidents",
      cellRenderer: IncidentsCell,
      width: 100, minWidth: 88, maxWidth: 120,
      sortable: true, resizable: false,
      valueFormatter: () => "",
      comparator: (a: string[], b: string[]) => b.length - a.length,
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: false,
    suppressMovable: true,
    cellStyle: { display: "flex", alignItems: "center", padding: "0 12px" },
  }), []);

  const onRowClicked = useCallback(({ data }: { data: Service }) => {
    setSel(data);
    setDrawerOpen(true);
  }, []);

  const getRowStyle = useCallback(({ data }: { data?: Service }) => {
    if (data?.health === "CRITICAL") return { borderLeft: "2px solid var(--red)" };
    if (data?.health === "DEGRADED") return { borderLeft: "2px solid var(--yellow)" };
    return { borderLeft: "2px solid transparent" };
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <FadeIn>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--bg)" }}>
          <div>
            <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-4)", margin: "0 0 3px" }}>Infrastructure</p>
            <h2 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.012em", color: "var(--text-1)", margin: 0 }}>Services</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {([
              [counts.critical, "Critical", "#ef4444", "rgba(239,68,68,0.08)",  "rgba(239,68,68,0.2)" ],
              [counts.degraded, "Degraded", "#eab308", "rgba(234,179,8,0.08)",  "rgba(234,179,8,0.2)" ],
              [counts.healthy,  "Healthy",  "#22c55e", "rgba(34,197,94,0.08)",  "rgba(34,197,94,0.2)" ],
            ] as [number,string,string,string,string][]).map(([n, label, color, bg, border]) => (
              <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontFamily: "Geist, sans-serif", fontWeight: 500, padding: "4px 10px", borderRadius: 6, border: `1px solid ${border}`, color, background: bg, letterSpacing: "-0.004em" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
                {n} {label}
              </span>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Full-width grid section */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: 1,
            margin: "16px",
            border: "1px solid var(--border)",
            borderRadius: 10,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "var(--bg)",
          }}
        >
          <SherlockGrid
            rowData={SERVICES}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            onRowClicked={onRowClicked}
            getRowStyle={getRowStyle}
          />
        </div>
      </div>

      {/* Drawer */}
      <ServiceDrawer service={sel} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
