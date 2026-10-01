import { useState } from "react"
import { Plus, CheckCircle, RefreshCw, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { motion, AnimatePresence } from "motion/react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  siPagerduty,
  siGithub,
  siGitlab,
  siJenkins,
  siDatadog,
  siGrafana,
  siPrometheus,
  siSentry,
  siJira,
  siLinear,
  siOpsgenie,
} from "simple-icons"
/* ── Inline SVG paths for icons not in simple-icons ─────── */
const EXTRA_ICONS: Record<string, {
  path: string
  hex: string
}> = {
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
}
/* ── Icon registry ───────────────────────────────────────── */
type IconDef = {
  path: string
  hex: string
}
const ICON_MAP: Record<string, IconDef> = {
  PagerDuty: siPagerduty,
  OpsGenie: siOpsgenie,
  VictorOps: EXTRA_ICONS.victorops,
  Slack: EXTRA_ICONS.slack,
  "Microsoft Teams": EXTRA_ICONS.microsoftteams,
  GitHub: siGithub,
  GitLab: siGitlab,
  Jenkins: siJenkins,
  Datadog: siDatadog,
  Grafana: siGrafana,
  Prometheus: siPrometheus,
  Sentry: siSentry,
  "AWS CloudWatch": EXTRA_ICONS.amazoncloudwatch,
  Jira: siJira,
  Linear: siLinear,
  ServiceNow: EXTRA_ICONS.servicenow,
}
/* ── Brand icon component ────────────────────────────────── */
function BrandIcon({ name, size = 20 }: { name: string; size?: number }) {
  const icon = ICON_MAP[name]
  if (!icon) return null
  const color = `#${icon.hex}`
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      aria-label={name}
      className="[flex-shrink:0]"
    >
      <path d={icon.path} />
    </svg>
  )
}
/* ── Logo box using real brand icon ─────────────────────── */
function LogoBox({
  name,
  color,
  bg,
}: {
  name: string
  color: string
  bg: string
}) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${color}30`,
      }}
      className="[width:40px] [height:40px] [border-radius:8px] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0]"
    >
      <BrandIcon name={name} size={22} />
    </div>
  )
}
/* ── Data ─────────────────────────────────────────────────── */
type Category = "Alerting" | "CI/CD" | "Logging" | "APM" | "Communication" | "Ticketing"
interface Integration {
  name: string
  desc: string
  category: Category
  color: string
  bg: string
}
const INTEGRATIONS: Integration[] = [
  {
    name: "PagerDuty",
    desc: "Incident management and on-call scheduling with escalation policies.",
    category: "Alerting",
    color: "#06AC38",
    bg: "#06AC3818",
  },
  {
    name: "OpsGenie",
    desc: "Alert routing with on-call schedules and escalation chains.",
    category: "Alerting",
    color: "#0052CC",
    bg: "#0052CC18",
  },
  {
    name: "VictorOps",
    desc: "DevOps incident collaboration and on-call scheduling.",
    category: "Alerting",
    color: "#7B36BF",
    bg: "#7B36BF18",
  },
  {
    name: "Slack",
    desc: "Real-time alert notifications and incident updates to channels.",
    category: "Communication",
    color: "#4A154B",
    bg: "#4A154B18",
  },
  {
    name: "Microsoft Teams",
    desc: "Post alerts and incident summaries to Teams channels.",
    category: "Communication",
    color: "#6264A7",
    bg: "#6264A718",
  },
  {
    name: "GitHub",
    desc: "Link deployments and incidents to commits, branches, and pull requests.",
    category: "CI/CD",
    color: "#181717",
    bg: "#18171718",
  },
  {
    name: "GitLab",
    desc: "Merge request and pipeline integration for deployment tracking.",
    category: "CI/CD",
    color: "#FC6D26",
    bg: "#FC6D2618",
  },
  {
    name: "Jenkins",
    desc: "Trigger and track Jenkins pipeline builds from incidents.",
    category: "CI/CD",
    color: "#D24939",
    bg: "#D2493918",
  },
  {
    name: "Datadog",
    desc: "Sync metrics, traces, and log correlation with Datadog dashboards.",
    category: "APM",
    color: "#632CA6",
    bg: "#632CA618",
  },
  {
    name: "Grafana",
    desc: "Embed dashboards, annotate deployments, and link panels to incidents.",
    category: "APM",
    color: "#F46800",
    bg: "#F4680018",
  },
  {
    name: "Prometheus",
    desc: "Scrape and forward Prometheus metrics for alert rule evaluation.",
    category: "APM",
    color: "#E6522C",
    bg: "#E6522C18",
  },
  {
    name: "Sentry",
    desc: "Automatically create incidents from Sentry error groups and releases.",
    category: "Logging",
    color: "#362D59",
    bg: "#362D5918",
  },
  {
    name: "AWS CloudWatch",
    desc: "Forward CloudWatch alarms and log anomalies to Sherlock.",
    category: "Logging",
    color: "#FF9900",
    bg: "#FF990018",
  },
  {
    name: "Jira",
    desc: "Auto-create Jira tickets from incidents with full context and timeline.",
    category: "Ticketing",
    color: "#0052CC",
    bg: "#0052CC18",
  },
  {
    name: "Linear",
    desc: "Push incidents directly to Linear projects and assign to engineers.",
    category: "Ticketing",
    color: "#5E6AD2",
    bg: "#5E6AD218",
  },
  {
    name: "ServiceNow",
    desc: "Bidirectional sync with ServiceNow ITSM for enterprise change management.",
    category: "Ticketing",
    color: "#62D84E",
    bg: "#62D84E18",
  },
]
interface InstalledIntegration extends Integration {
  status: "connected" | "error" | "syncing"
  lastSync: string
  account: string
}
const INSTALLED: InstalledIntegration[] = [
  {
    name: "PagerDuty",
    category: "Alerting",
    color: "#06AC38",
    bg: "#06AC3818",
    status: "connected",
    lastSync: "1m ago",
    account: "acme-corp",
    desc: "",
  },
  {
    name: "Slack",
    category: "Communication",
    color: "#4A154B",
    bg: "#4A154B18",
    status: "connected",
    lastSync: "2m ago",
    account: "#incidents",
    desc: "",
  },
  {
    name: "GitHub",
    category: "CI/CD",
    color: "#181717",
    bg: "#18171718",
    status: "connected",
    lastSync: "5m ago",
    account: "acme-org",
    desc: "",
  },
  {
    name: "Grafana",
    category: "APM",
    color: "#F46800",
    bg: "#F4680018",
    status: "syncing",
    lastSync: "syncing",
    account: "grafana.acme.io",
    desc: "",
  },
  {
    name: "Jira",
    category: "Ticketing",
    color: "#0052CC",
    bg: "#0052CC18",
    status: "connected",
    lastSync: "12m ago",
    account: "acme.atlassian.net",
    desc: "",
  },
  {
    name: "Datadog",
    category: "APM",
    color: "#632CA6",
    bg: "#632CA618",
    status: "error",
    lastSync: "3h ago",
    account: "acme",
    desc: "",
  },
]
const CATEGORIES: Array<"All" | Category> = [
  "All",
  "Alerting",
  "CI/CD",
  "APM",
  "Logging",
  "Communication",
  "Ticketing",
]
function categoryBadge(c: Category) {
  const map: Record<Category, {
    color: string
    bg: string
  }> = {
    Alerting: { color: "var(--red)", bg: "var(--red-bg)" },
    "CI/CD": { color: "var(--accent)", bg: "var(--accent-bg)" },
    Logging: { color: "var(--yellow)", bg: "var(--yellow-bg)" },
    APM: { color: "var(--green)", bg: "var(--green-bg)" },
    Communication: { color: "var(--text-2)", bg: "var(--bg-3)" },
    Ticketing: { color: "var(--text-2)", bg: "var(--bg-3)" },
  }
  return map[c] ?? { color: "var(--text-3)", bg: "var(--bg-3)" }
}
function statusInfo(s: InstalledIntegration["status"]) {
  return {
    connected: { color: "var(--green)", label: "Connected" },
    error: { color: "var(--red)", label: "Error" },
    syncing: { color: "var(--yellow)", label: "Syncing" },
  }[s]
}
/* ── Page ─────────────────────────────────────────────────── */
export default function Integrations() {
  const [tab, setTab] = useState<"available" | "installed">("available")
  const [catFilter, setCat] = useState<"All" | Category>("All")
  const [installed, setInstalled] = useState<Set<string>>(
    new Set(INSTALLED.map((i) => i.name)),
  )
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)
  const displayed = INTEGRATIONS.filter(
    (i) => catFilter === "All" || i.category === catFilter,
  ).filter((i) => !installed.has(i.name))
  const COLS = ["Integration", "Category", "Account", "Status", "Last Sync", ""]
  const COLS_W = ["220px", "120px", "1fr", "110px", "100px", "80px"]
  return (
    <div className="[height:100%] [display:flex] [flex-direction:column] [overflow:hidden] [font-family:Geist,_sans-serif] [font-size:13px] [color:var(--text-1)]">
      {/* Page header */}
      <div className="max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:24px_32px_0] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [background:var(--bg)]">
        <div className="[display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:20px]">
          <div>
            <h1 className="[font-size:18px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)] [margin:0_0_4px]">
              Integrations
            </h1>
            <p className="[font-size:13px] [color:var(--text-3)] [margin:0]">
              Connect Sherlock with your existing tools and workflows
            </p>
          </div>
          <button className="[display:flex] [align-items:center] [gap:6px] [height:32px] [padding:0_14px] [border-radius:6px] [border:1px_solid_var(--border)] [background:var(--bg)] [color:var(--text-1)] [font-size:13px] [font-weight:500] [cursor:pointer] hover:[background:var(--bg-2)]">
            <ExternalLink size={12} /> Browse marketplace
          </button>
        </div>

        {/* Tabs */}
        <div className="[display:flex]">
          {([
            [
              "available",
              `Available (${INTEGRATIONS.length - installed.size})`,
            ],
            ["installed", `Installed (${installed.size})`],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                "[font-size:13px] [padding:8px_16px] [cursor:pointer] [border:none] [background:transparent] [border-bottom:2px_solid] [margin-bottom:-1px] [transition:color_0.1s]",
                tab === id
                  ? "[border-bottom-color:var(--text-1)]"
                  : "[border-bottom-color:transparent]",
                tab === id ? "[color:var(--text-1)]" : "[color:var(--text-3)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="[flex:1] [overflow-y:auto]">
        {/* ── Available tab ── */}
        {tab === "available" && (
          <div className="[padding:24px_32px]">
            {/* Category filter pills */}
            <div className="[display:flex] [gap:6px] [margin-bottom:24px] [flex-wrap:wrap]">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={[
                    "[height:28px] [padding:0_12px] [border-radius:99px] [font-size:12px] [border:1px_solid] [cursor:pointer] [transition:all_0.1s]",
                    catFilter === c
                      ? "[border-color:var(--text-1)]"
                      : "[border-color:var(--border)]",
                    catFilter === c
                      ? "[background:var(--text-1)]"
                      : "[background:transparent]",
                    catFilter === c
                      ? "[color:var(--bg)]"
                      : "[color:var(--text-3)]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Integration grid */}
            <AnimatePresence mode="popLayout">
              <div className="[display:grid] [grid-template-columns:repeat(auto-fill,_minmax(300px,_1fr))] [gap:12px]">
                {displayed.map((item, i) => {
                  const cb = categoryBadge(item.category)
                  return (
                    <motion.div
                      key={item.name}
                      layout
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: i * 0.02, duration: 0.15 }}
                      className="[padding:16px] [border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)] [cursor:pointer] [transition:border-color_0.15s] hover:[border-color:var(--border-2)]"
                    >
                      <div className="[display:flex] [align-items:flex-start] [gap:12px]">
                        <LogoBox
                          name={item.name}
                          color={item.color}
                          bg={item.bg}
                        />
                        <div className="[flex:1] [min-width:0]">
                          <div className="[display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:4px]">
                            <span className="[font-size:14px] [font-weight:600] [color:var(--text-1)]">
                              {item.name}
                            </span>
                            <span
                              style={{
                                color: cb.color,
                                background: cb.bg,
                              }}
                              className="[font-size:10px] [font-weight:500] [padding:2px_7px] [border-radius:4px]"
                            >
                              {item.category}
                            </span>
                          </div>
                          <p className="[font-size:12px] [color:var(--text-3)] [margin:0_0_12px] [line-height:1.5]">
                            {item.desc}
                          </p>
                          <button
                            onClick={() =>
                              setInstalled((s) => new Set([...s, item.name]))
                            }
                            className="[display:flex] [align-items:center] [gap:5px] [height:28px] [padding:0_12px] [border-radius:6px] [border:1px_solid_var(--border)] [background:var(--bg)] [color:var(--text-1)] [font-size:12px] [font-weight:500] [cursor:pointer] hover:[background:var(--bg-3)]"
                          >
                            <Plus size={11} /> Install
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </AnimatePresence>

            {displayed.length === 0 && (
              <div className="[padding:48px_0] [text-align:center] [color:var(--text-4)] [font-size:13px]">
                All integrations in this category are already installed.
              </div>
            )}

            {installed.size > 0 && (
              <div className="[margin-top:24px] [display:flex] [align-items:center] [gap:6px]">
                <CheckCircle size={13} className="[color:var(--green)]" />
                <span className="[font-size:12px] [color:var(--text-3)]">
                  {installed.size} integration{installed.size !== 1 ? "s" : ""}{" "}
                  installed
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Installed tab ── */}
        {tab === "installed" && (
          <div className="[padding:24px_32px]">
            <div className="overflow-x-auto max-w-full [border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)]">
              {/* Header */}
              <div
                style={{
                  gridTemplateColumns: COLS_W.join(" "),
                }}
                className="[display:grid] [min-width:640px] [padding:0_20px] [height:36px] [align-items:center] [border-bottom:1px_solid_var(--border)]"
              >
                {COLS.map((h) => (
                  <div
                    key={h}
                    className="[font-size:11px] [font-weight:500] [text-transform:uppercase] [letter-spacing:0.04em] [color:var(--text-4)]"
                  >
                    {h}
                  </div>
                ))}
              </div>

              {INSTALLED.filter((i) => installed.has(i.name)).map(
                (item, idx, arr) => {
                  const sd = statusInfo(item.status)
                  const cb = categoryBadge(item.category)
                  return (
                    <div
                      key={item.name}
                      style={{
                        gridTemplateColumns: COLS_W.join(" "),
                      }}
                      className={[
                        [
                          "[display:grid] [min-width:640px] [padding:0_20px] [height:56px] [align-items:center] [cursor:pointer] [transition:background_0.1s]",
                          idx < arr.length - 1
                            ? "[border-bottom:1px_solid_var(--border)]"
                            : "[border-bottom:none]",
                        ]
                          .filter(Boolean)
                          .join(" "),
                        "hover:[background:var(--bg-3)]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {/* Name + icon */}
                      <div className="[display:flex] [align-items:center] [gap:10px]">
                        <div
                          style={{
                            background: item.bg,
                            border: `1px solid ${item.color}30`,
                          }}
                          className="[width:32px] [height:32px] [border-radius:6px] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0]"
                        >
                          <BrandIcon name={item.name} size={18} />
                        </div>
                        <span className="[font-size:13px] [font-weight:500] [color:var(--text-1)]">
                          {item.name}
                        </span>
                      </div>

                      {/* Category */}
                      <span
                        style={{
                          color: cb.color,
                          background: cb.bg,
                        }}
                        className="[display:inline-flex] [align-items:center] [height:20px] [padding:0_7px] [border-radius:4px] [font-size:11px] [font-weight:500] [width:fit-content]"
                      >
                        {item.category}
                      </span>

                      {/* Account */}
                      <span className="[font-family:Geist_Mono,_monospace] [font-size:12px] [color:var(--text-3)] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">
                        {item.account}
                      </span>

                      {/* Status */}
                      <div className="[display:flex] [align-items:center] [gap:6px]">
                        <span
                          style={{
                            background: sd.color,
                          }}
                          className="[width:6px] [height:6px] [border-radius:50%] [flex-shrink:0]"
                        />
                        <span
                          style={{
                            color: sd.color,
                          }}
                          className="[font-size:12px]"
                        >
                          {sd.label}
                        </span>
                      </div>

                      {/* Last sync */}
                      <span className="[font-family:Geist_Mono,_monospace] [font-size:12px] [color:var(--text-4)]">
                        {item.lastSync}
                      </span>

                      {/* Actions */}
                      <div className="[display:flex] [gap:4px] [justify-content:flex-end]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="[display:flex] [padding:6px] [border-radius:5px] [border:1px_solid_var(--border)] [background:transparent] [color:var(--text-4)] [cursor:pointer] hover:[color:var(--text-2)]">
                              <RefreshCw size={12} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Sync now</TooltipContent>
                        </Tooltip>
                        <button
                          onClick={() => setPendingRemove(item.name)}
                          className="[display:flex] [align-items:center] [padding:0_8px] [height:28px] [border-radius:5px] [border:1px_solid_var(--border)] [background:transparent] [color:var(--text-4)] [cursor:pointer] [font-size:11px] hover:[color:var(--red)] hover:[border-color:var(--red-border)]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={pendingRemove !== null}
        onOpenChange={(open) => !open && setPendingRemove(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Remove {pendingRemove}</DialogTitle>
            <DialogDescription>
              This will disconnect {pendingRemove} from Sherlock. You can
              reconnect it at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className="h-8 rounded-md border border-[var(--border)] bg-transparent px-3.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--text-2)] cursor-pointer transition-colors hover:border-[var(--border-2)] hover:bg-[var(--bg-3)]"
              onClick={() => setPendingRemove(null)}
            >
              Cancel
            </button>
            <button
              className="h-8 rounded-md border-0 bg-[var(--red)] px-3.5 text-[13px] font-medium tracking-[-0.01em] text-white cursor-pointer transition-opacity hover:opacity-85"
              onClick={() => {
                if (pendingRemove)
                  setInstalled((s) => {
                    const n = new Set(s)
                    n.delete(pendingRemove)
                    return n
                  })
                setPendingRemove(null)
              }}
            >
              Remove
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
