import { useState, useMemo, useCallback } from "react";
import {
  BellRing, Bell, BellOff, Plus, Trash2, Zap, Check, X,
  MessageSquare, Mail, Globe, AlertTriangle,
} from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";
import { SherlockSelect } from "@/components/ui/SherlockSelect";
import { Badge } from "@/components/ui/badge";

/* ── Types ────────────────────────────────────────────── */
type Severity = "info" | "warning" | "error" | "critical";
type Channel = "slack" | "email" | "webhook" | "pagerduty";
type Condition = ">" | ">=" | "<" | "<=";

interface Alert {
  id: string;
  name: string;
  metric: string;
  condition: Condition;
  threshold: string;
  duration: string;
  severity: Severity;
  service: string;
  channel: Channel;
  enabled: boolean;
  firing: boolean;
  lastTriggered: string;
  triggers24h: number;
}

/* ── Seed data ────────────────────────────────────────── */
const SEED: Alert[] = [
  { id: "ALR-201", name: "Payment error rate spike",   metric: "Error rate",   condition: ">",  threshold: "5%",    duration: "5m",  severity: "critical", service: "payment-service",   channel: "pagerduty", enabled: true,  firing: true,  lastTriggered: "2m ago",  triggers24h: 4 },
  { id: "ALR-202", name: "Checkout P95 latency",        metric: "P95 latency",  condition: ">",  threshold: "1.5s",  duration: "10m", severity: "error",    service: "order-service",     channel: "slack",     enabled: true,  firing: true,  lastTriggered: "8m ago",  triggers24h: 2 },
  { id: "ALR-203", name: "API Gateway 5xx surge",       metric: "5xx rate",     condition: ">",  threshold: "1%",    duration: "5m",  severity: "error",    service: "api-gateway",       channel: "slack",     enabled: true,  firing: false, lastTriggered: "3h ago",  triggers24h: 1 },
  { id: "ALR-204", name: "DB connection pool exhausted", metric: "DB conns",    condition: ">=", threshold: "95%",   duration: "3m",  severity: "critical", service: "order-service",     channel: "pagerduty", enabled: true,  firing: false, lastTriggered: "1d ago",  triggers24h: 0 },
  { id: "ALR-205", name: "Fraud model latency",         metric: "P99 latency",  condition: ">",  threshold: "800ms", duration: "15m", severity: "warning",  service: "fraud-detection",   channel: "slack",     enabled: true,  firing: false, lastTriggered: "6h ago",  triggers24h: 0 },
  { id: "ALR-206", name: "Request volume drop",         metric: "Req rate",     condition: "<",  threshold: "500/s", duration: "10m", severity: "warning",  service: "api-gateway",       channel: "email",     enabled: false, firing: false, lastTriggered: "—",       triggers24h: 0 },
  { id: "ALR-207", name: "Memory pressure",             metric: "Memory",       condition: ">",  threshold: "85%",   duration: "10m", severity: "warning",  service: "user-service",      channel: "slack",     enabled: true,  firing: false, lastTriggered: "12h ago", triggers24h: 0 },
  { id: "ALR-208", name: "CPU saturation",              metric: "CPU",          condition: ">",  threshold: "90%",   duration: "5m",  severity: "error",    service: "inventory-api",     channel: "webhook",   enabled: true,  firing: false, lastTriggered: "2d ago",  triggers24h: 0 },
  { id: "ALR-209", name: "Cache hit rate degraded",     metric: "Cache hits",   condition: "<",  threshold: "80%",   duration: "15m", severity: "info",     service: "inventory-api",     channel: "email",     enabled: false, firing: false, lastTriggered: "—",       triggers24h: 0 },
  { id: "ALR-210", name: "External payment timeouts",   metric: "Timeout rate", condition: ">",  threshold: "2%",    duration: "5m",  severity: "critical", service: "payment-service",   channel: "pagerduty", enabled: true,  firing: false, lastTriggered: "5h ago",  triggers24h: 1 },
  { id: "ALR-211", name: "Notification queue backlog",  metric: "Queue depth",  condition: ">",  threshold: "10000", duration: "10m", severity: "warning",  service: "notification-svc",  channel: "slack",     enabled: true,  firing: false, lastTriggered: "1d ago",  triggers24h: 0 },
  { id: "ALR-212", name: "Auth failure spike",          metric: "401 rate",     condition: ">",  threshold: "10%",   duration: "5m",  severity: "error",    service: "user-service",      channel: "slack",     enabled: true,  firing: false, lastTriggered: "9h ago",  triggers24h: 0 },
];

const SEVERITIES: Severity[] = ["info", "warning", "error", "critical"];
const SEV_BADGE: Record<Severity, "info" | "warning" | "error" | "ghost"> = {
  info: "info", warning: "warning", error: "error", critical: "error",
};
const CHANNELS: { value: Channel; label: string; Icon: typeof Mail }[] = [
  { value: "slack",     label: "Slack",     Icon: MessageSquare },
  { value: "email",     label: "Email",     Icon: Mail },
  { value: "webhook",   label: "Webhook",   Icon: Globe },
  { value: "pagerduty", label: "PagerDuty", Icon: Zap },
];
const SERVICES = Array.from(new Set(SEED.map(a => a.service)));

function channelMeta(c: Channel) {
  return CHANNELS.find(x => x.value === c) ?? CHANNELS[0];
}

/* ── New-alert modal ──────────────────────────────────── */
interface FormState {
  name: string; metric: string; condition: Condition; threshold: string;
  duration: string; severity: Severity; service: string; channel: Channel;
}
const EMPTY_FORM: FormState = {
  name: "", metric: "Error rate", condition: ">", threshold: "",
  duration: "5m", severity: "warning", service: SERVICES[0], channel: "slack",
};

function CreateAlertModal({ onClose, onCreate }: { onClose: () => void; onCreate: (a: Alert) => void }) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.threshold.trim()) e.threshold = "Threshold is required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onCreate({
      id: `ALR-${Math.floor(200 + Math.random() * 800)}`,
      ...form,
      enabled: true,
      firing: false,
      lastTriggered: "—",
      triggers24h: 0,
    });
  };

  const label = { fontSize: 11, fontFamily: "Geist Mono, monospace", textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "var(--text-4)", marginBottom: 6, display: "block" };
  const input = { width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 11px", fontSize: 13, color: "var(--text-1)", outline: "none" };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "8vh 16px 16px", overflowY: "auto" }}
    >
      <div
        onClick={ev => ev.stopPropagation()}
        style={{ width: "100%", maxWidth: 520, background: "var(--surface, var(--bg))", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <BellRing size={15} style={{ color: "var(--accent, var(--blue))" }} />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", margin: 0 }}>New alert rule</h3>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", display: "flex", padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={label}>Alert name</label>
            <input
              autoFocus
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="e.g. Payment error rate spike"
              style={{ ...input, borderColor: errors.name ? "var(--red)" : "var(--border)" }}
            />
            {errors.name && <p style={{ fontSize: 11, color: "var(--red)", margin: "5px 0 0" }}>{errors.name}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.7fr 1fr", gap: 10 }}>
            <div>
              <label style={label}>Metric</label>
              <SherlockSelect value={form.metric} onChange={v => set("metric", v)} minWidth="100%"
                options={["Error rate", "P95 latency", "P99 latency", "5xx rate", "Req rate", "CPU", "Memory", "Timeout rate"]} />
            </div>
            <div>
              <label style={label}>Cond.</label>
              <SherlockSelect value={form.condition} onChange={v => set("condition", v as Condition)} minWidth="100%"
                options={[">", ">=", "<", "<="]} />
            </div>
            <div>
              <label style={label}>Threshold</label>
              <input
                value={form.threshold}
                onChange={e => set("threshold", e.target.value)}
                placeholder="5%"
                style={{ ...input, borderColor: errors.threshold ? "var(--red)" : "var(--border)" }}
              />
            </div>
          </div>
          {errors.threshold && <p style={{ fontSize: 11, color: "var(--red)", margin: "-8px 0 0" }}>{errors.threshold}</p>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={label}>For duration</label>
              <SherlockSelect value={form.duration} onChange={v => set("duration", v)} minWidth="100%"
                options={["1m", "3m", "5m", "10m", "15m", "30m"]} />
            </div>
            <div>
              <label style={label}>Severity</label>
              <SherlockSelect value={form.severity} onChange={v => set("severity", v as Severity)} minWidth="100%"
                options={SEVERITIES} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={label}>Service</label>
              <SherlockSelect value={form.service} onChange={v => set("service", v)} minWidth="100%" options={SERVICES} />
            </div>
            <div>
              <label style={label}>Notify via</label>
              <SherlockSelect value={form.channel} onChange={v => set("channel", v as Channel)} minWidth="100%"
                options={CHANNELS.map(c => ({ value: c.value, label: c.label }))} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", fontSize: 12, color: "var(--text-3)", fontFamily: "Geist Mono, monospace" }}>
            <AlertTriangle size={12} style={{ color: "var(--text-4)", flexShrink: 0 }} />
            {form.metric} {form.condition} {form.threshold || "—"} for {form.duration}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "14px 18px", borderTop: "1px solid var(--border)" }}>
          <button onClick={onClose} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--text-1)", color: "var(--bg)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={13} /> Create alert
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Confirm-delete dialog ────────────────────────────── */
function ConfirmDelete({ alert, onCancel, onConfirm }: { alert: Alert; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 110, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, background: "var(--surface, var(--bg))", border: "1px solid var(--border)", borderRadius: 14, padding: 20, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", margin: "0 0 8px" }}>Delete alert?</h3>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 4px" }}>
          <span style={{ fontFamily: "Geist Mono, monospace", color: "var(--text-2)" }}>{alert.name}</span>
        </p>
        <p style={{ fontSize: 12.5, color: "var(--text-4)", margin: "0 0 18px" }}>This action cannot be undone.</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onCancel} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--red)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Delete alert</button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────── */
export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(SEED);
  const [sev, setSev] = useState("all");
  const [status, setStatus] = useState("all");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Alert | null>(null);
  const [tested, setTested] = useState<Record<string, boolean>>({});

  const counts = useMemo(() => ({
    firing:   alerts.filter(a => a.firing && a.enabled).length,
    enabled:  alerts.filter(a => a.enabled).length,
    disabled: alerts.filter(a => !a.enabled).length,
    total:    alerts.length,
  }), [alerts]);

  const rows = useMemo(() => alerts.filter(a =>
    (sev === "all" || a.severity === sev) &&
    (status === "all"
      || (status === "firing" && a.firing && a.enabled)
      || (status === "enabled" && a.enabled)
      || (status === "disabled" && !a.enabled))
  ), [alerts, sev, status]);

  const toggle = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled, firing: a.enabled ? false : a.firing } : a));
  }, []);

  const test = useCallback((id: string) => {
    setTested(t => ({ ...t, [id]: true }));
    setTimeout(() => setTested(t => ({ ...t, [id]: false })), 1800);
  }, []);

  const create = useCallback((a: Alert) => {
    setAlerts(prev => [a, ...prev]);
    setCreating(false);
  }, []);

  const remove = useCallback(() => {
    if (!deleting) return;
    setAlerts(prev => prev.filter(a => a.id !== deleting.id));
    setDeleting(null);
  }, [deleting]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <FadeIn>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--bg)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-4)", marginBottom: 3 }}>Monitoring</p>
              <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)", margin: 0 }}>Alerts</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {([
                [`${counts.firing} firing`,     "var(--red)",    "var(--red-bg)",    "var(--red-border)"   ],
                [`${counts.enabled} enabled`,   "var(--green)",  "var(--green-bg)",  "var(--green-border)" ],
                [`${counts.disabled} disabled`, "var(--text-4)", "var(--surface-2, transparent)", "var(--border)"],
                [`${counts.total} total`,       "var(--text-3)", "transparent",      "var(--border)"       ],
              ] as [string,string,string,string][]).map(([lbl, color, bg, border]) => (
                <span key={lbl} style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", padding: "3px 8px", borderRadius: 6, border: `1px solid ${border}`, color, background: bg }}>{lbl}</span>
              ))}
              <button onClick={() => setCreating(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 7, border: "none", background: "var(--text-1)", color: "var(--bg)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", marginLeft: 4 }}>
                <Plus size={13} /> New alert
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <SherlockSelect value={sev} onChange={setSev}
              options={["all", ...SEVERITIES].map(o => ({ value: o, label: o === "all" ? "All severities" : o }))} />
            <SherlockSelect value={status} onChange={setStatus}
              options={[
                { value: "all", label: "All statuses" },
                { value: "firing", label: "Firing" },
                { value: "enabled", label: "Enabled" },
                { value: "disabled", label: "Disabled" },
              ]} />
          </div>
        </div>
      </FadeIn>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {rows.length === 0 ? (
          <div style={{ height: "100%", minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-4)" }}>
            <BellOff size={28} strokeWidth={1.5} />
            <p style={{ fontSize: 13, margin: 0 }}>No alerts match these filters.</p>
            <button onClick={() => { setSev("all"); setStatus("all"); }} style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: 12.5, cursor: "pointer" }}>Clear filters</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map(a => {
              const ch = channelMeta(a.channel);
              return (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                  padding: "14px 16px", borderRadius: 10,
                  border: `1px solid ${a.firing && a.enabled ? "var(--red-border)" : "var(--border)"}`,
                  background: a.firing && a.enabled ? "var(--red-bg)" : "var(--bg)",
                  opacity: a.enabled ? 1 : 0.6,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 240px", minWidth: 0 }}>
                    {a.firing && a.enabled
                      ? <BellRing size={15} style={{ color: "var(--red)", flexShrink: 0 }} />
                      : <Bell size={15} style={{ color: "var(--text-4)", flexShrink: 0 }} />}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</span>
                        {a.firing && a.enabled && <Badge variant="error">Firing</Badge>}
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)" }}>{a.id} · {a.service}</span>
                    </div>
                  </div>

                  <div style={{ flex: "1 1 180px", fontFamily: "Geist Mono, monospace", fontSize: 12, color: "var(--text-3)" }}>
                    {a.metric} <span style={{ color: "var(--text-4)" }}>{a.condition}</span> <span style={{ color: "var(--text-1)" }}>{a.threshold}</span> <span style={{ color: "var(--text-4)" }}>for {a.duration}</span>
                  </div>

                  <Badge variant={SEV_BADGE[a.severity]}>{a.severity}</Badge>

                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-3)", width: 96 }}>
                    <ch.Icon size={12} style={{ flexShrink: 0 }} /> {ch.label}
                  </div>

                  <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "var(--text-4)", width: 84, textAlign: "right" }}>{a.lastTriggered}</span>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={() => test(a.id)}
                      title="Send test notification"
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 9px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: tested[a.id] ? "var(--green)" : "var(--text-3)", fontSize: 11.5, cursor: "pointer" }}
                    >
                      {tested[a.id] ? <><Check size={12} /> Sent</> : <><Zap size={12} /> Test</>}
                    </button>

                    <button
                      onClick={() => toggle(a.id)}
                      role="switch"
                      aria-checked={a.enabled}
                      aria-label={a.enabled ? "Disable alert" : "Enable alert"}
                      title={a.enabled ? "Disable" : "Enable"}
                      style={{ position: "relative", width: 34, height: 19, borderRadius: 999, border: "none", cursor: "pointer", background: a.enabled ? "var(--green)" : "var(--border)", transition: "background 0.15s", flexShrink: 0 }}
                    >
                      <span style={{ position: "absolute", top: 2, left: a.enabled ? 17 : 2, width: 15, height: 15, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
                    </button>

                    <button
                      onClick={() => setDeleting(a)}
                      title="Delete alert"
                      aria-label="Delete alert"
                      style={{ display: "flex", padding: 6, borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text-4)", cursor: "pointer" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {creating && <CreateAlertModal onClose={() => setCreating(false)} onCreate={create} />}
      {deleting && <ConfirmDelete alert={deleting} onCancel={() => setDeleting(null)} onConfirm={remove} />}
    </div>
  );
}
