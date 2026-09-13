import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Clock, Copy, Check, ChevronDown, Plus,
  History, FolderOpen, Zap, AlertCircle, CheckCircle,
  Lock, Globe, Code2, AlignLeft, Settings2,
  ChevronRight, ChevronLeft, Loader2,
  ArrowUpRight, ArrowDownLeft, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BorderBeam } from "@/components/ui/BorderBeam";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  usePanelRef,
} from "@/components/ui/resizable";

/* ── Types ─────────────────────────────────────────────── */
interface HistoryItem { method: string; url: string; status: number; ms: number; ts: string }
interface TimelineItem { name: string; ms: number; slow: boolean; category: string }

/* ── Constants ─────────────────────────────────────────── */
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const METHOD_COLOR: Record<string, string> = {
  GET: "var(--green)", POST: "var(--blue)", PUT: "var(--yellow)", PATCH: "var(--yellow)", DELETE: "var(--red)",
};
const METHOD_BG: Record<string, string> = {
  GET: "var(--green-bg)", POST: "var(--blue-bg)", PUT: "var(--yellow-bg)", PATCH: "var(--yellow-bg)", DELETE: "var(--red-bg)",
};
const METHOD_BORDER: Record<string, string> = {
  GET: "var(--green-border)", POST: "var(--blue-border)", PUT: "var(--yellow-border)", PATCH: "var(--yellow-border)", DELETE: "var(--red-border)",
};

const HISTORY: HistoryItem[] = [
  { method: "POST",   url: "/v1/payments/charge",        status: 503, ms: 4532, ts: "14:35" },
  { method: "GET",    url: "/v1/customers/cust_8a2bc31", status: 200, ms: 48,   ts: "14:33" },
  { method: "GET",    url: "/v1/payments?limit=20",       status: 200, ms: 122,  ts: "14:30" },
  { method: "PUT",    url: "/v1/customers/cust_8a2bc31", status: 200, ms: 89,   ts: "14:27" },
  { method: "DELETE", url: "/v1/webhooks/wh_93kd2",       status: 204, ms: 34,   ts: "14:21" },
  { method: "POST",   url: "/v1/refunds",                 status: 422, ms: 67,   ts: "14:18" },
  { method: "GET",    url: "/health",                     status: 200, ms: 3,    ts: "14:15" },
  { method: "PATCH",  url: "/v1/payments/ch_abc/capture", status: 200, ms: 198,  ts: "14:10" },
];

const RESPONSE_JSON = {
  error: "Service Unavailable",
  message: "Failed to acquire database connection",
  traceId: "abc123def456",
  requestId: "req_8a2bc31def",
  timestamp: "2026-08-29T14:35:12.441Z",
  details: { service: "payment-service", timeout: 30000, poolSize: 50, activeConnections: 50 },
};

const TIMELINE: TimelineItem[] = [
  { name: "DNS Resolution",                 ms: 2,    slow: false, category: "network" },
  { name: "TCP Connect",                    ms: 8,    slow: false, category: "network" },
  { name: "TLS Handshake",                  ms: 24,   slow: false, category: "network" },
  { name: "API Gateway",                    ms: 12,   slow: false, category: "server"  },
  { name: "Authentication",                 ms: 24,   slow: false, category: "server"  },
  { name: "payment-service::processCharge", ms: 4468, slow: true,  category: "app"     },
  { name: "PostgreSQL::executeQuery",       ms: 4432, slow: true,  category: "db"      },
];
const TOTAL_MS = TIMELINE.reduce((a, t) => a + t.ms, 0);

const REQ_HEADERS: [string, string][] = [
  ["Content-Type",     "application/json"],
  ["Authorization",    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9•••"],
  ["X-Request-ID",     "req_8a2bc31def"],
  ["X-Trace-ID",       "abc123def456"],
  ["X-Idempotency-Key","idem_7f2c91a4b3"],
  ["Accept",           "application/json"],
  ["Accept-Encoding",  "gzip, deflate, br"],
];

const RES_HEADERS: [string, string][] = [
  ["content-type",          "application/json; charset=utf-8"],
  ["x-trace-id",            "abc123def456"],
  ["x-request-id",          "req_8a2bc31def"],
  ["x-response-time",       "4532ms"],
  ["x-ratelimit-limit",     "1000"],
  ["x-ratelimit-remaining", "847"],
  ["strict-transport-security","max-age=31536000; includeSubDomains"],
  ["content-length",        "284"],
];

const BODY_TEMPLATE = `{
  "amount": 10000,
  "currency": "USD",
  "customer_id": "cust_8a2bc31",
  "payment_method": "pm_card_visa",
  "metadata": {
    "order_id": "ord_9f3k21",
    "description": "Premium subscription"
  }
}`;

const CAT_COLOR: Record<string, string> = {
  network: "var(--blue)",  server: "var(--green)",
  app:     "var(--red)",   db:     "var(--yellow)",
};

/* ── Atoms ─────────────────────────────────────────────── */
function MethodBadge({ method, size = "sm" }: { method: string; size?: "sm" | "xs" }) {
  return (
    <span style={{
      display: "inline-block", flexShrink: 0,
      padding: size === "xs" ? "1px 5px" : "2px 8px",
      fontSize: size === "xs" ? 9 : 10,
      borderRadius: 4, fontFamily: "Geist Mono, monospace", fontWeight: 700,
      letterSpacing: "0.04em", textTransform: "uppercase" as const,
      color: METHOD_COLOR[method] ?? "var(--text-3)",
      background: METHOD_BG[method] ?? "var(--bg-3)",
      border: `1px solid ${METHOD_BORDER[method] ?? "var(--border)"}`,
    }}>
      {method}
    </span>
  );
}

function StatusBadge({ code }: { code: number }) {
  const color  = code < 300 ? "var(--green)" : code < 400 ? "var(--blue)" : code < 500 ? "var(--yellow)" : "var(--red)";
  const bg     = code < 300 ? "var(--green-bg)"  : code < 400 ? "var(--blue-bg)"  : code < 500 ? "var(--yellow-bg)"  : "var(--red-bg)";
  const border = code < 300 ? "var(--green-border)" : code < 400 ? "var(--blue-border)" : code < 500 ? "var(--yellow-border)" : "var(--red-border)";
  return (
    <span style={{
      display: "inline-block", padding: "2px 7px", borderRadius: 4, flexShrink: 0,
      fontFamily: "Geist Mono, monospace", fontSize: 11, fontWeight: 700,
      color, background: bg, border: `1px solid ${border}`,
    }}>
      {code}
    </span>
  );
}

function PanelTag({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <Icon size={10} style={{ color: "var(--text-4)" }} />
      <span style={{
        fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const,
        letterSpacing: "0.06em", fontFamily: "Geist Mono, monospace", color: "var(--text-4)",
      }}>
        {label}
      </span>
    </div>
  );
}

function PanelTab({
  label, active, onClick, icon: Icon,
}: { label: string; active: boolean; onClick: () => void; icon?: React.ElementType }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 5, padding: "8px 12px",
      fontSize: 11, fontWeight: 500, cursor: "pointer", flexShrink: 0,
      color: active ? "var(--text-1)" : "var(--text-4)",
      background: "transparent", border: "none", position: "relative" as const,
      transition: "color 0.1s",
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--text-2)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = active ? "var(--text-1)" : "var(--text-4)"; }}
    >
      {Icon && <Icon size={11} />}
      {label}
      {active && (
        <motion.div layoutId="panel-tab-bar" style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 1.5,
          background: "var(--text-1)", borderRadius: 1,
        }} />
      )}
    </button>
  );
}

function PanelChrome({
  tabs, activeTab, onTab, left, right,
}: {
  tabs: { id: string; label: string; icon?: React.ElementType }[];
  activeTab: string;
  onTab: (id: string) => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "stretch", flexShrink: 0,
      borderBottom: "1px solid var(--border)", background: "var(--bg-2)", minHeight: 36,
    }}>
      {left && (
        <div style={{ display: "flex", alignItems: "center", padding: "0 10px", borderRight: "1px solid var(--border)", flexShrink: 0 }}>
          {left}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "stretch", flex: 1, overflow: "hidden" }}>
        {tabs.map(t => (
          <PanelTab key={t.id} label={t.label} active={activeTab === t.id} onClick={() => onTab(t.id)} icon={t.icon} />
        ))}
      </div>
      {right && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", borderLeft: "1px solid var(--border)", flexShrink: 0 }}>
          {right}
        </div>
      )}
    </div>
  );
}

function HeadersTable({ rows, addLabel }: { rows: [string, string][]; addLabel?: string }) {
  return (
    <div>
      <div style={{
        display: "grid", gridTemplateColumns: "38% 1fr",
        padding: "5px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-2)",
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>Key</span>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>Value</span>
      </div>
      {rows.map(([k, v], i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "38% 1fr",
          padding: "7px 16px", borderBottom: "1px solid var(--border)", cursor: "default",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 11, color: "var(--blue)", paddingRight: 12 }}>{k}</span>
          <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 11, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
        </div>
      ))}
      {addLabel && (
        <div style={{ padding: "7px 16px" }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)",
            background: "none", border: "none", cursor: "pointer",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}
          >
            <Plus size={10} />{addLabel}
          </button>
        </div>
      )}
    </div>
  );
}

function tokenizeJson(json: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(true|false|null)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],:])/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(json)) !== null) {
    if (m.index > last) nodes.push(<span key={`t${last}`}>{json.slice(last, m.index)}</span>);
    const [full, key, str, kw, num, punc] = m;
    const i = m.index;
    if (key)       nodes.push(<span key={i} style={{ color: "var(--text-2)" }}>{full}</span>);
    else if (str)  nodes.push(<span key={i} style={{ color: "var(--green)" }}>{full}</span>);
    else if (kw)   nodes.push(<span key={i} style={{ color: "var(--blue)" }}>{full}</span>);
    else if (num)  nodes.push(<span key={i} style={{ color: "var(--yellow)" }}>{full}</span>);
    else if (punc) nodes.push(<span key={i} style={{ color: "var(--text-4)" }}>{full}</span>);
    last = i + full.length;
  }
  if (last < json.length) nodes.push(<span key={`t${last}`}>{json.slice(last)}</span>);
  return nodes;
}

/* ── Sidebar ───────────────────────────────────────────── */
function SidebarContent({
  onSelect,
}: { onSelect: (item: HistoryItem) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0,
      }}>
        <History size={12} style={{ color: "var(--text-4)" }} />
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "-0.003em", color: "var(--text-2)" }}>History</span>
        <span style={{
          marginLeft: "auto", fontSize: 10, fontFamily: "Geist Mono, monospace",
          padding: "1px 6px", borderRadius: 4, background: "var(--bg-3)",
          color: "var(--text-4)", border: "1px solid var(--border)",
        }}>
          {HISTORY.length}
        </span>
      </div>

      {/* list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {HISTORY.map((item, i) => {
          const slow = item.ms > 500;
          return (
            <button key={i} onClick={() => onSelect(item)} style={{
              width: "100%", display: "flex", flexDirection: "column", gap: 5,
              padding: "9px 12px", textAlign: "left", background: "transparent",
              border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer",
              transition: "background 0.08s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MethodBadge method={item.method} size="xs" />
                <span style={{
                  fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-2)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                }}>
                  {item.url}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <StatusBadge code={item.status} />
                <span style={{
                  fontSize: 10, fontFamily: "Geist Mono, monospace",
                  color: slow ? "var(--red)" : "var(--text-4)",
                }}>
                  {item.ms >= 1000 ? `${(item.ms / 1000).toFixed(2)}s` : `${item.ms}ms`}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>
                  {item.ts}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* footer */}
      <div style={{ borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <button style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "9px 12px", fontSize: 12, color: "var(--text-4)",
          background: "none", border: "none", cursor: "pointer", transition: "color 0.1s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}
        >
          <FolderOpen size={12} />Collections
        </button>
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────── */
export default function ApiDebugger() {
  const [method,         setMethod]         = useState("POST");
  const [url,            setUrl]            = useState("https://api.acme.com/v1/payments/charge");
  const [showMethodDrop, setShowMethodDrop] = useState(false);
  const [reqTab,         setReqTab]         = useState("body");
  const [resTab,         setResTab]         = useState("body");
  const [traceTab,       setTraceTab]       = useState("waterfall");
  const [sent,           setSent]           = useState(true);
  const [sending,        setSending]        = useState(false);
  const [copied,         setCopied]         = useState(false);
  const [activeEnv,      setActiveEnv]      = useState("production");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile,       setIsMobile]       = useState(false);

  const urlRef       = useRef<HTMLInputElement>(null);
  const sidebarRef   = usePanelRef();

  useEffect(() => {
    urlRef.current?.focus();
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleSidebar = useCallback(() => {
    const panel = sidebarRef.current;
    if (!panel) return;
    if (sidebarCollapsed) {
      panel.expand();
    } else {
      panel.collapse();
    }
  }, [sidebarCollapsed, sidebarRef]);

  function handleSend() {
    setSending(true); setSent(false);
    setTimeout(() => { setSending(false); setSent(true); }, 1200);
  }
  function copy() {
    navigator.clipboard.writeText(JSON.stringify(RESPONSE_JSON, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg)", overflow: "hidden" }}>

      {/* ── Toolbar (outside resizable, always full width) ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
        borderBottom: "1px solid var(--border)", background: "var(--bg-2)",
        flexShrink: 0, zIndex: 10,
      }}>
        {/* sidebar toggle */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand history sidebar" : "Collapse history sidebar"}
          aria-expanded={!sidebarCollapsed}
          title={sidebarCollapsed ? "Show history" : "Hide history"}
          style={{
            width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 6, flexShrink: 0, cursor: "pointer", transition: "all 0.1s",
            background: sidebarCollapsed ? "transparent" : "var(--bg-3)",
            color: sidebarCollapsed ? "var(--text-4)" : "var(--text-2)",
            border: `1px solid ${sidebarCollapsed ? "transparent" : "var(--border-2)"}`,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
          onMouseLeave={e => (e.currentTarget.style.color = sidebarCollapsed ? "var(--text-4)" : "var(--text-2)")}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
        </button>

        <div style={{ width: 1, height: 16, background: "var(--border)", flexShrink: 0 }} />

        {/* method selector */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button onClick={() => setShowMethodDrop(v => !v)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "5px 10px",
            borderRadius: 6, cursor: "pointer",
            fontFamily: "Geist Mono, monospace", fontSize: 12, fontWeight: 700,
            color: METHOD_COLOR[method], background: METHOD_BG[method],
            border: `1px solid ${METHOD_BORDER[method]}`, transition: "opacity 0.1s",
          }}>
            {method}<ChevronDown size={10} style={{ opacity: 0.6 }} />
          </button>
          <AnimatePresence>
            {showMethodDrop && (
              <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}
                style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 100,
                  background: "var(--bg-2)", border: "1px solid var(--border-2)",
                  borderRadius: 8, padding: 4, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", minWidth: 110,
                }}
              >
                {METHODS.map(m => (
                  <button key={m} onClick={() => { setMethod(m); setShowMethodDrop(false); }} style={{
                    display: "flex", alignItems: "center", gap: 8, width: "100%",
                    padding: "6px 10px", borderRadius: 5, background: "transparent",
                    border: "none", cursor: "pointer", transition: "background 0.08s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: METHOD_COLOR[m], flexShrink: 0 }} />
                    <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 11, fontWeight: 700, color: METHOD_COLOR[m] }}>{m}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* URL input */}
        <input ref={urlRef} value={url} onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="https://api.example.com/endpoint"
          style={{
            flex: 1, padding: "6px 12px", borderRadius: 6,
            fontFamily: "Geist Mono, monospace", fontSize: 12, outline: "none",
            background: "var(--bg)", color: "var(--text-1)",
            border: "1px solid var(--border)", transition: "border-color 0.1s",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
        />

        {/* env toggle */}
        <button onClick={() => setActiveEnv(e => e === "production" ? "staging" : "production")} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", flexShrink: 0,
          borderRadius: 6, cursor: "pointer", fontFamily: "Geist Mono, monospace", fontSize: 11,
          border: "1px solid var(--border)", background: "var(--bg)",
          color: activeEnv === "production" ? "var(--green)" : "var(--yellow)",
          transition: "border-color 0.1s",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: activeEnv === "production" ? "var(--green)" : "var(--yellow)" }} />
          {activeEnv}
          <ChevronDown size={9} style={{ color: "var(--text-4)" }} />
        </button>

        {/* Send */}
        <button onClick={handleSend} disabled={sending} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "6px 16px",
          borderRadius: 6, flexShrink: 0, fontWeight: 600, fontSize: 12,
          cursor: sending ? "default" : "pointer", transition: "opacity 0.1s",
          background: sending ? "var(--bg-3)" : "var(--text-1)",
          color: sending ? "var(--text-3)" : "var(--bg)",
          border: `1px solid ${sending ? "var(--border)" : "var(--text-1)"}`,
          opacity: sending ? 0.65 : 1,
        }}>
          {sending
            ? <><Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} />Sending…</>
            : <><Play size={11} fill="currentColor" />Send</>
          }
        </button>
      </div>

      {/* ── Resizable body ─────────────────────────────── */}
      {/* The outer Group's height:100% fills this flex:1 wrapper */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <ResizablePanelGroup orientation={isMobile ? "vertical" : "horizontal"}>

          {/* ── Sidebar panel ── */}
          <ResizablePanel
            panelRef={sidebarRef}
            id="sidebar"
            order={1}
            defaultSize={isMobile ? "35%" : "20%"}
            minSize={isMobile ? "15%" : "12%"}
            maxSize={isMobile ? "50%" : "32%"}
            collapsible={true}
            collapsedSize="0%"
            onResize={(size) => setSidebarCollapsed(size.asPercentage === 0)}
            style={{ overflow: "hidden" }}
          >
            <SidebarContent
              onSelect={item => {
                setMethod(item.method);
                setUrl(`https://api.acme.com${item.url}`);
              }}
            />
          </ResizablePanel>

          <ResizableHandle
            orientation={isMobile ? "vertical" : "horizontal"}
            aria-label="Drag to resize history sidebar"
          />

          {/* ── Main panel: directly contains vertical group, no div wrapper ── */}
          <ResizablePanel id="main" order={2} defaultSize={isMobile ? "65%" : "80%"} minSize="40%"
            style={{ overflow: "hidden" }}
          >
            {/* Vertical split: [request|response] / [trace] */}
            <ResizablePanelGroup orientation="vertical">

                {/* Request + Response row */}
                <ResizablePanel id="req-res" order={1} defaultSize="65%" minSize="25%"
                  style={{ overflow: "hidden" }}
                >
                  {/* Horizontal split: request | response */}
                  <ResizablePanelGroup orientation={isMobile ? "vertical" : "horizontal"}>

                    {/* ── Request panel ── */}
                    <ResizablePanel id="request" order={1} defaultSize="45%" minSize="20%" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <PanelChrome
                        tabs={[
                          { id: "body",    label: "Body",    icon: Code2     },
                          { id: "headers", label: "Headers", icon: AlignLeft },
                          { id: "params",  label: "Params",  icon: Globe     },
                          { id: "auth",    label: "Auth",    icon: Lock      },
                        ]}
                        activeTab={reqTab} onTab={setReqTab}
                        left={<PanelTag icon={ArrowUpRight} label="Request" />}
                      />
                      <div style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
                        {reqTab === "body" && (
                          <div style={{ display: "flex", height: "100%", minHeight: 160 }}>
                            <div style={{
                              flexShrink: 0, padding: "14px 10px 14px 14px", background: "var(--bg-2)",
                              borderRight: "1px solid var(--border)",
                              fontFamily: "Geist Mono, monospace", fontSize: 11, lineHeight: "1.75rem",
                              color: "var(--text-4)", textAlign: "right", userSelect: "none" as const,
                            }}>
                              {BODY_TEMPLATE.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
                            </div>
                            <textarea defaultValue={BODY_TEMPLATE} style={{
                              flex: 1, padding: "14px 14px", resize: "none", outline: "none",
                              fontFamily: "Geist Mono, monospace", fontSize: 11, lineHeight: "1.75rem",
                              background: "var(--bg)", color: "var(--text-2)",
                              caretColor: "var(--text-1)", border: "none",
                            }} spellCheck={false} />
                          </div>
                        )}
                        {reqTab === "headers" && <HeadersTable rows={REQ_HEADERS} addLabel="Add header" />}
                        {reqTab === "params" && (
                          <div style={{ padding: 14 }}>
                            <div style={{
                              display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                              borderRadius: 8, marginBottom: 12,
                              background: "var(--blue-bg)", border: "1px solid var(--blue-border)",
                            }}>
                              <Globe size={11} style={{ color: "var(--blue)", flexShrink: 0 }} />
                              <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 11, color: "var(--blue)" }}>
                                No query params — embed in the URL or add below
                              </span>
                            </div>
                            <button style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", background: "none", border: "none", cursor: "pointer" }}
                              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
                              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}
                            >
                              <Plus size={11} />Add parameter
                            </button>
                          </div>
                        )}
                        {reqTab === "auth" && (
                          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Lock size={12} style={{ color: "var(--green)" }} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>Bearer Token</span>
                              <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: "Geist Mono, monospace", padding: "2px 7px", borderRadius: 4, background: "var(--green-bg)", color: "var(--green)", border: "1px solid var(--green-border)" }}>Active</span>
                            </div>
                            <div style={{ borderRadius: 8, padding: "10px 12px", background: "var(--bg-2)", border: "1px solid var(--border)" }}>
                              <p style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", marginBottom: 4 }}>TOKEN</p>
                              <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-3)", wordBreak: "break-all" }}>
                                eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOGEyYmMzMSJ9•••
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ResizablePanel>

                    <ResizableHandle
                      orientation={isMobile ? "vertical" : "horizontal"}
                      aria-label="Drag to resize request and response panels"
                    />

                    {/* ── Response panel ── */}
                    <ResizablePanel id="response" order={2} defaultSize="55%" minSize="20%" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <PanelChrome
                        tabs={sent ? [
                          { id: "body",    label: "Body",    icon: Code2     },
                          { id: "headers", label: "Headers", icon: AlignLeft },
                        ] : []}
                        activeTab={resTab} onTab={setResTab}
                        left={<PanelTag icon={ArrowDownLeft} label="Response" />}
                        right={sent ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <StatusBadge code={503} />
                            <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "Geist Mono, monospace", fontSize: 11, color: "var(--red)" }}>
                              <Clock size={10} />4.53s
                            </span>
                            <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 11, color: "var(--text-4)" }}>
                              {JSON.stringify(RESPONSE_JSON, null, 2).length} B
                            </span>
                            <button onClick={copy} style={{
                              display: "flex", alignItems: "center", gap: 4, padding: "3px 8px",
                              borderRadius: 5, fontFamily: "Geist Mono, monospace", fontSize: 10,
                              border: "1px solid var(--border)", background: "transparent",
                              color: copied ? "var(--green)" : "var(--text-4)", cursor: "pointer", transition: "color 0.1s",
                            }}>
                              {copied ? <Check size={10} /> : <Copy size={10} />}
                              {copied ? "Copied" : "Copy"}
                            </button>
                          </div>
                        ) : undefined}
                      />
                      <div style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
                        {!sent && !sending && (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-3)", border: "1px solid var(--border)" }}>
                              <Play size={16} style={{ color: "var(--text-4)" }} />
                            </div>
                            <p style={{ fontFamily: "Geist Mono, monospace", fontSize: 12, color: "var(--text-4)" }}>Send a request to see the response</p>
                          </div>
                        )}
                        {sending && (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }}>
                            <Loader2 size={20} style={{ color: "var(--text-3)", animation: "spin 0.8s linear infinite" }} />
                            <p style={{ fontFamily: "Geist Mono, monospace", fontSize: 12, color: "var(--text-4)" }}>Waiting for response…</p>
                          </div>
                        )}
                        {sent && resTab === "body" && (
                          <div style={{ position: "relative" }}>
                            <BorderBeam duration={12} />
                            <div style={{
                              display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
                              background: "var(--red-bg)", borderBottom: "1px solid var(--red-border)",
                            }}>
                              <AlertCircle size={11} style={{ color: "var(--red)", flexShrink: 0 }} />
                              <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 11, color: "var(--red)" }}>
                                503 — database connection pool exhausted
                              </span>
                            </div>
                            <pre style={{ fontFamily: "Geist Mono, monospace", fontSize: 11, lineHeight: 1.75, padding: 14, margin: 0 }}>
                              {tokenizeJson(JSON.stringify(RESPONSE_JSON, null, 2))}
                            </pre>
                          </div>
                        )}
                        {sent && resTab === "headers" && <HeadersTable rows={RES_HEADERS} />}
                      </div>
                    </ResizablePanel>

                  </ResizablePanelGroup>
                </ResizablePanel>

                {/* Handle between req/res row and trace row */}
                <ResizableHandle
                  orientation="vertical"
                  aria-label="Drag to resize trace panel"
                />

                {/* ── Trace panel ── */}
                <ResizablePanel
                  id="trace"
                  order={2}
                  defaultSize="35%"
                  minSize="8%"
                  maxSize="60%"
                  collapsible={true}
                  collapsedSize="4%"
                  style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
                >
                  <PanelChrome
                    tabs={[
                      { id: "waterfall", label: "Waterfall", icon: Zap       },
                      { id: "console",   label: "Console",   icon: Code2     },
                      { id: "settings",  label: "Settings",  icon: Settings2 },
                    ]}
                    activeTab={traceTab} onTab={setTraceTab}
                    right={sent ? (
                      <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 10, color: "var(--text-4)" }}>
                        7 spans · <span style={{ color: "var(--red)", fontWeight: 700 }}>4.58s</span>
                      </span>
                    ) : undefined}
                  />

                  <div style={{ flex: 1, overflow: "auto" }}>
                    {traceTab === "waterfall" && sent && (
                      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
                        {/* legend */}
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 2 }}>
                          {(["Network","Server","App","Database"] as const).map((lbl, i) => {
                            const cat = (["network","server","app","db"] as const)[i];
                            return (
                              <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: CAT_COLOR[cat] }} />
                                <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 10, color: "var(--text-4)" }}>{lbl}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* bars */}
                        {TIMELINE.map((item, i) => {
                          const wPct = Math.max(0.4, (item.ms / TOTAL_MS) * 100);
                          const oPct = TIMELINE.slice(0, i).reduce((a, t) => a + (t.ms / TOTAL_MS) * 100, 0);
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{
                                fontFamily: "Geist Mono, monospace", fontSize: 10, color: "var(--text-3)",
                                width: 220, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}>
                                {item.name}
                              </span>
                              <div style={{ flex: 1, height: 16, borderRadius: 4, background: "var(--bg-3)", position: "relative", overflow: "hidden" }}>
                                <motion.div
                                  initial={{ width: 0, left: `${oPct}%` }}
                                  animate={{ width: `${wPct}%`, left: `${oPct}%` }}
                                  transition={{ duration: 0.35, delay: 0.04 + i * 0.04, ease: "easeOut" }}
                                  style={{ position: "absolute", top: 0, height: "100%", borderRadius: 3, background: CAT_COLOR[item.category], opacity: 0.85 }}
                                />
                              </div>
                              <span style={{
                                fontFamily: "Geist Mono, monospace", fontSize: 10, width: 52,
                                textAlign: "right", flexShrink: 0, fontWeight: item.slow ? 700 : 400,
                                color: item.slow ? "var(--red)" : "var(--text-4)",
                              }}>
                                {item.ms >= 1000 ? `${(item.ms / 1000).toFixed(2)}s` : `${item.ms}ms`}
                              </span>
                              <div style={{ width: 40, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                                {item.slow
                                  ? <span style={{ fontSize: 9, fontFamily: "Geist Mono, monospace", fontWeight: 700, padding: "1px 5px", borderRadius: 3, textTransform: "uppercase" as const, background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-border)" }}>slow</span>
                                  : <CheckCircle size={11} style={{ color: "var(--green)" }} />
                                }
                              </div>
                            </div>
                          );
                        })}

                        {/* actions */}
                        <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid var(--border)", marginTop: 2 }}>
                          {[
                            { label: "View Full Trace", color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)" },
                            { label: "View Logs",       color: "var(--text-3)", bg: "transparent", border: "var(--border)" },
                            { label: "AI Root Cause",   color: "var(--text-3)", bg: "transparent", border: "var(--border)" },
                          ].map(({ label, color, bg, border }) => (
                            <button key={label} style={{
                              display: "flex", alignItems: "center", gap: 5, padding: "5px 11px",
                              borderRadius: 6, fontSize: 11, fontFamily: "Geist Mono, monospace",
                              cursor: "pointer", transition: "opacity 0.1s",
                              color, background: bg, border: `1px solid ${border}`,
                            }}
                              onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                            >
                              <ChevronRight size={10} />{label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {traceTab === "console" && (
                      <div style={{ padding: "10px 14px", fontFamily: "Geist Mono, monospace", fontSize: 11, lineHeight: 1.9, display: "flex", flexDirection: "column", gap: 1 }}>
                        {[
                          { ts: "14:35:12.398", dir: "→", dirColor: "var(--blue)",  text: "POST https://api.acme.com/v1/payments/charge",           msgColor: "var(--text-3)" },
                          { ts: "14:35:12.441", dir: "",  dirColor: "transparent",  text: "Request body: 187 bytes",                                msgColor: "var(--text-4)" },
                          { ts: "14:35:16.930", dir: "←", dirColor: "var(--red)",   text: "503 Service Unavailable (4532ms)",                        msgColor: "var(--red)"    },
                          { ts: "14:35:16.931", dir: "✕", dirColor: "var(--red)",   text: "payment-service::processCharge timed out after 4468ms",   msgColor: "var(--red)"    },
                          { ts: "14:35:16.931", dir: "✕", dirColor: "var(--red)",   text: "PostgreSQL connection pool exhausted (50/50 active)",     msgColor: "var(--red)"    },
                        ].map((row, i) => (
                          <div key={i} style={{ display: "flex", gap: 12 }}>
                            <span style={{ color: "var(--text-4)", flexShrink: 0 }}>{row.ts}</span>
                            <span style={{ color: row.dirColor, flexShrink: 0, width: 12 }}>{row.dir}</span>
                            <span style={{ color: row.msgColor }}>{row.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {traceTab === "settings" && (
                      <div style={{ padding: "10px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[["Timeout","30 000 ms"],["Follow redirects","Yes"],["SSL verification","Enabled"],["Proxy","None"]].map(([k,v]) => (
                          <div key={k} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "8px 12px", borderRadius: 7,
                            background: "var(--bg-2)", border: "1px solid var(--border)",
                          }}>
                            <span style={{ fontSize: 12, color: "var(--text-3)" }}>{k}</span>
                            <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ResizablePanel>

            </ResizablePanelGroup>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
