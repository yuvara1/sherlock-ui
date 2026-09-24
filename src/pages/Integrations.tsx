import { useState } from "react";
import { Plus, CheckCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "motion/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  siPagerduty, siGithub, siGitlab, siJenkins, siDatadog,
  siGrafana, siPrometheus, siSentry, siJira, siLinear, siOpsgenie,
} from "simple-icons";

/* ── Inline SVG paths for icons not in simple-icons ─────── */
const EXTRA_ICONS: Record<string, { path: string; hex: string }> = {
  slack: {
    hex: "4A154B",
    path: "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.123 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.166 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.123a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.166 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z",
  },
  microsoftteams: {
    hex: "6264A7",
    path: "M19.19 8.215h-4.893V5.277a2.638 2.638 0 1 0-1.978 0v2.938H7.426a.623.623 0 0 0-.623.623v5.486a6.799 6.799 0 0 0 5.815 6.728 6.787 6.787 0 0 0 7.195-6.728V8.838a.623.623 0 0 0-.623-.623zm-3.92 6.109a3.59 3.59 0 1 1-3.59-3.59 3.59 3.59 0 0 1 3.59 3.59zm5.56-8.79a2.262 2.262 0 1 0-2.262-2.262 2.262 2.262 0 0 0 2.262 2.262z",
  },
  victorops: {
    hex: "7B36BF",
    path: "M12.065 0L0 6.935l3.273 1.89L12.065 3.78l8.792 5.044L24 6.935zm0 4.933l-8.792 5.045 3.273 1.889 5.52-3.167 5.518 3.167 3.273-1.89zm0 4.933L3.273 14.91 12.065 24l8.792-9.09-3.274-1.889-5.518 5.7-5.519-5.7z",
  },
  amazoncloudwatch: {
    hex: "FF9900",
    path: "M13.197 15.967l-1.201.687v-2.378l1.201.687.801-.463-2.003-1.148-2.003 1.148.803.463 1.203-.688v2.378l-1.203-.687-.803.463 2.003 1.148 2.003-1.148zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.804 17.695H6.198v-1.5h11.606v1.5zm0-3H6.198v-1.5h11.606v1.5zm0-3H6.198v-1.5h11.606v1.5zm0-3H6.198v-1.5h11.606v1.5z",
  },
  servicenow: {
    hex: "62D84E",
    path: "M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm-.041 18.137c-3.384 0-6.129-2.745-6.129-6.129S8.575 5.879 11.959 5.879a6.126 6.126 0 0 1 4.775 2.289l-1.574 1.42a3.954 3.954 0 0 0-3.201-1.632c-2.189 0-3.966 1.777-3.966 3.966s1.777 3.966 3.966 3.966c1.489 0 2.787-.824 3.466-2.04H11.96v-2.023h5.148c.059.327.09.664.09 1.01 0 3.384-2.745 6.302-6.239 6.302z",
  },
};

/* ── Icon registry ───────────────────────────────────────── */
type IconDef = { path: string; hex: string };

const ICON_MAP: Record<string, IconDef> = {
  "PagerDuty":      siPagerduty,
  "OpsGenie":       siOpsgenie,
  "VictorOps":      EXTRA_ICONS.victorops,
  "Slack":          EXTRA_ICONS.slack,
  "Microsoft Teams":EXTRA_ICONS.microsoftteams,
  "GitHub":         siGithub,
  "GitLab":         siGitlab,
  "Jenkins":        siJenkins,
  "Datadog":        siDatadog,
  "Grafana":        siGrafana,
  "Prometheus":     siPrometheus,
  "Sentry":         siSentry,
  "AWS CloudWatch": EXTRA_ICONS.amazoncloudwatch,
  "Jira":           siJira,
  "Linear":         siLinear,
  "ServiceNow":     EXTRA_ICONS.servicenow,
};

/* ── Brand icon component ────────────────────────────────── */
function BrandIcon({ name, size = 20 }: { name: string; size?: number }) {
  const icon = ICON_MAP[name];
  if (!icon) return null;
  const color = `#${icon.hex}`;
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      aria-label={name}
      style={{ flexShrink: 0 }}
    >
      <path d={icon.path} />
    </svg>
  );
}

/* ── Logo box using real brand icon ─────────────────────── */
function LogoBox({ name, color, bg }: { name: string; color: string; bg: string }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 8,
      background: bg, border: `1px solid ${color}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <BrandIcon name={name} size={22} />
    </div>
  );
}

/* ── Data ─────────────────────────────────────────────────── */
type Category = "Alerting" | "CI/CD" | "Logging" | "APM" | "Communication" | "Ticketing";

interface Integration {
  name: string;
  desc: string;
  category: Category;
  color: string;
  bg: string;
}

const INTEGRATIONS: Integration[] = [
  { name: "PagerDuty",      desc: "Incident management and on-call scheduling with escalation policies.",        category: "Alerting",      color: "#06AC38", bg: "#06AC3818" },
  { name: "OpsGenie",       desc: "Alert routing with on-call schedules and escalation chains.",                 category: "Alerting",      color: "#0052CC", bg: "#0052CC18" },
  { name: "VictorOps",      desc: "DevOps incident collaboration and on-call scheduling.",                       category: "Alerting",      color: "#7B36BF", bg: "#7B36BF18" },
  { name: "Slack",          desc: "Real-time alert notifications and incident updates to channels.",              category: "Communication", color: "#4A154B", bg: "#4A154B18" },
  { name: "Microsoft Teams",desc: "Post alerts and incident summaries to Teams channels.",                       category: "Communication", color: "#6264A7", bg: "#6264A718" },
  { name: "GitHub",         desc: "Link deployments and incidents to commits, branches, and pull requests.",     category: "CI/CD",         color: "#181717", bg: "#18171718" },
  { name: "GitLab",         desc: "Merge request and pipeline integration for deployment tracking.",             category: "CI/CD",         color: "#FC6D26", bg: "#FC6D2618" },
  { name: "Jenkins",        desc: "Trigger and track Jenkins pipeline builds from incidents.",                   category: "CI/CD",         color: "#D24939", bg: "#D2493918" },
  { name: "Datadog",        desc: "Sync metrics, traces, and log correlation with Datadog dashboards.",          category: "APM",           color: "#632CA6", bg: "#632CA618" },
  { name: "Grafana",        desc: "Embed dashboards, annotate deployments, and link panels to incidents.",      category: "APM",           color: "#F46800", bg: "#F4680018" },
  { name: "Prometheus",     desc: "Scrape and forward Prometheus metrics for alert rule evaluation.",            category: "APM",           color: "#E6522C", bg: "#E6522C18" },
  { name: "Sentry",         desc: "Automatically create incidents from Sentry error groups and releases.",       category: "Logging",       color: "#362D59", bg: "#362D5918" },
  { name: "AWS CloudWatch", desc: "Forward CloudWatch alarms and log anomalies to Sherlock.",                   category: "Logging",       color: "#FF9900", bg: "#FF990018" },
  { name: "Jira",           desc: "Auto-create Jira tickets from incidents with full context and timeline.",     category: "Ticketing",     color: "#0052CC", bg: "#0052CC18" },
  { name: "Linear",         desc: "Push incidents directly to Linear projects and assign to engineers.",         category: "Ticketing",     color: "#5E6AD2", bg: "#5E6AD218" },
  { name: "ServiceNow",     desc: "Bidirectional sync with ServiceNow ITSM for enterprise change management.",  category: "Ticketing",     color: "#62D84E", bg: "#62D84E18" },
];

interface InstalledIntegration extends Integration {
  status: "connected" | "error" | "syncing";
  lastSync: string;
  account: string;
}

const INSTALLED: InstalledIntegration[] = [
  { name: "PagerDuty",  category: "Alerting",      color: "#06AC38", bg: "#06AC3818", status: "connected", lastSync: "1m ago",  account: "acme-corp",          desc: "" },
  { name: "Slack",      category: "Communication", color: "#4A154B", bg: "#4A154B18", status: "connected", lastSync: "2m ago",  account: "#incidents",          desc: "" },
  { name: "GitHub",     category: "CI/CD",         color: "#181717", bg: "#18171718", status: "connected", lastSync: "5m ago",  account: "acme-org",            desc: "" },
  { name: "Grafana",    category: "APM",           color: "#F46800", bg: "#F4680018", status: "syncing",   lastSync: "syncing", account: "grafana.acme.io",     desc: "" },
  { name: "Jira",       category: "Ticketing",     color: "#0052CC", bg: "#0052CC18", status: "connected", lastSync: "12m ago", account: "acme.atlassian.net",  desc: "" },
  { name: "Datadog",    category: "APM",           color: "#632CA6", bg: "#632CA618", status: "error",     lastSync: "3h ago",  account: "acme",                desc: "" },
];

const CATEGORIES: Array<"All" | Category> = ["All", "Alerting", "CI/CD", "APM", "Logging", "Communication", "Ticketing"];

function categoryBadge(c: Category) {
  const map: Record<Category, { color: string; bg: string }> = {
    "Alerting":      { color: "var(--red)",    bg: "var(--red-bg)"    },
    "CI/CD":         { color: "var(--accent)", bg: "var(--accent-bg)" },
    "Logging":       { color: "var(--yellow)", bg: "var(--yellow-bg)" },
    "APM":           { color: "var(--green)",  bg: "var(--green-bg)"  },
    "Communication": { color: "var(--text-2)", bg: "var(--bg-3)"      },
    "Ticketing":     { color: "var(--text-2)", bg: "var(--bg-3)"      },
  };
  return map[c] ?? { color: "var(--text-3)", bg: "var(--bg-3)" };
}

function statusInfo(s: InstalledIntegration["status"]) {
  return {
    connected: { color: "var(--green)",  label: "Connected" },
    error:     { color: "var(--red)",    label: "Error"     },
    syncing:   { color: "var(--yellow)", label: "Syncing"   },
  }[s];
}

/* ── Page ─────────────────────────────────────────────────── */
export default function Integrations() {
  const [tab, setTab]       = useState<"available" | "installed">("available");
  const [catFilter, setCat] = useState<"All" | Category>("All");
  const [installed, setInstalled] = useState<Set<string>>(new Set(INSTALLED.map(i => i.name)));
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  const displayed = INTEGRATIONS
    .filter(i => catFilter === "All" || i.category === catFilter)
    .filter(i => !installed.has(i.name));

  const COLS = ["Integration", "Category", "Account", "Status", "Last Sync", ""];
  const COLS_W = ["220px", "120px", "1fr", "110px", "100px", "80px"];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "Geist, sans-serif", fontSize: 13, color: "var(--text-1)" }}>

      {/* Page header */}
      <div className="responsive-page-header" style={{ padding: "24px 32px 0", borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--bg)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-1)", margin: "0 0 4px" }}>Integrations</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Connect Sherlock with your existing tools and workflows</p>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, height: 32, padding: "0 14px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-1)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-2)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--bg)")}
          >
            <ExternalLink size={12} /> Browse marketplace
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {([["available", `Available (${INTEGRATIONS.length - installed.size})`], ["installed", `Installed (${installed.size})`]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              fontSize: 13, padding: "8px 16px", cursor: "pointer", border: "none",
              background: "transparent", borderBottom: "2px solid",
              borderBottomColor: tab === id ? "var(--text-1)" : "transparent",
              color: tab === id ? "var(--text-1)" : "var(--text-3)",
              marginBottom: -1, transition: "color 0.1s",
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Available tab ── */}
        {tab === "available" && (
          <div style={{ padding: "24px 32px" }}>
            {/* Category filter pills */}
            <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCat(c)} style={{
                  height: 28, padding: "0 12px", borderRadius: 99, fontSize: 12,
                  border: "1px solid", cursor: "pointer", transition: "all 0.1s",
                  borderColor: catFilter === c ? "var(--text-1)" : "var(--border)",
                  background: catFilter === c ? "var(--text-1)" : "transparent",
                  color: catFilter === c ? "var(--bg)" : "var(--text-3)",
                }}>
                  {c}
                </button>
              ))}
            </div>

            {/* Integration grid */}
            <AnimatePresence mode="popLayout">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                {displayed.map((item, i) => {
                  const cb = categoryBadge(item.category);
                  return (
                    <motion.div
                      key={item.name} layout
                      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: i * 0.02, duration: 0.15 }}
                      style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-2)", cursor: "pointer", transition: "border-color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <LogoBox name={item.name} color={item.color} bg={item.bg} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{item.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 4, color: cb.color, background: cb.bg }}>
                              {item.category}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: "var(--text-3)", margin: "0 0 12px", lineHeight: 1.5 }}>{item.desc}</p>
                          <button
                            onClick={() => setInstalled(s => new Set([...s, item.name]))}
                            style={{ display: "flex", alignItems: "center", gap: 5, height: 28, padding: "0 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-1)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "var(--bg)")}
                          >
                            <Plus size={11} /> Install
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>

            {displayed.length === 0 && (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-4)", fontSize: 13 }}>
                All integrations in this category are already installed.
              </div>
            )}

            {installed.size > 0 && (
              <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={13} style={{ color: "var(--green)" }} />
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>{installed.size} integration{installed.size !== 1 ? "s" : ""} installed</span>
              </div>
            )}
          </div>
        )}

        {/* ── Installed tab ── */}
        {tab === "installed" && (
          <div style={{ padding: "24px 32px" }}>
            <div className="responsive-data-surface" style={{ border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-2)" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: COLS_W.join(" "), minWidth: 640, padding: "0 20px", height: 36, alignItems: "center", borderBottom: "1px solid var(--border)" }}>
                {COLS.map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-4)" }}>{h}</div>
                ))}
              </div>

              {INSTALLED.filter(i => installed.has(i.name)).map((item, idx, arr) => {
                const sd = statusInfo(item.status);
                const cb = categoryBadge(item.category);
                return (
                  <div key={item.name}
                    style={{ display: "grid", gridTemplateColumns: COLS_W.join(" "), minWidth: 640, padding: "0 20px", height: 56, alignItems: "center", borderBottom: idx < arr.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Name + icon */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: item.bg, border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <BrandIcon name={item.name} size={18} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{item.name}</span>
                    </div>

                    {/* Category */}
                    <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 7px", borderRadius: 4, fontSize: 11, fontWeight: 500, color: cb.color, background: cb.bg, width: "fit-content" }}>
                      {item.category}
                    </span>

                    {/* Account */}
                    <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.account}
                    </span>

                    {/* Status */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: sd.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: sd.color }}>{sd.label}</span>
                    </div>

                    {/* Last sync */}
                    <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 12, color: "var(--text-4)" }}>{item.lastSync}</span>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button style={{ display: "flex", padding: 6, borderRadius: 5, border: "1px solid var(--border)", background: "transparent", color: "var(--text-4)", cursor: "pointer" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
                            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}
                          >
                            <RefreshCw size={12} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Sync now</TooltipContent>
                      </Tooltip>
                      <button
                        onClick={() => setPendingRemove(item.name)}
                        style={{ display: "flex", alignItems: "center", padding: "0 8px", height: 28, borderRadius: 5, border: "1px solid var(--border)", background: "transparent", color: "var(--text-4)", cursor: "pointer", fontSize: 11 }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.borderColor = "var(--red-border)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-4)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Dialog open={pendingRemove !== null} onOpenChange={open => !open && setPendingRemove(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Remove {pendingRemove}</DialogTitle>
            <DialogDescription>This will disconnect {pendingRemove} from Sherlock. You can reconnect it at any time.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button className="dialog-btn-secondary" onClick={() => setPendingRemove(null)}>Cancel</button>
            <button className="dialog-btn-danger" onClick={() => {
              if (pendingRemove) setInstalled(s => { const n = new Set(s); n.delete(pendingRemove); return n; });
              setPendingRemove(null);
            }}>Remove</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
