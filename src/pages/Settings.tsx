import { useState } from "react"
import {
  Globe,
  Key,
  Users,
  Bell,
  Shield,
  Copy,
  Check,
  Plus,
  MoreHorizontal,
  Trash2,
  Download,
} from "lucide-react"
import { SherlockSelect } from "@/components/ui/SherlockSelect"
/* ─── Constants ─── */
const MONO = "Geist Mono, monospace"
const SANS = "Geist, sans-serif"
/* ─── Nav tabs ─── */
const NAV_TABS = [
  { id: "general", label: "General", icon: Globe },
  { id: "apikeys", label: "API Keys", icon: Key },
  { id: "team", label: "Team", icon: Users },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
]
/* ─── Data ─── */
const API_KEYS = [
  {
    id: "k1",
    name: "Production Telemetry",
    prefix: "demo_live_x8aF",
    env: "production",
    created: "2026-08-01",
    lastUsed: "2 min ago",
    status: "active",
    creator: "Jane Doe",
  },
  {
    id: "k2",
    name: "Staging Integration",
    prefix: "demo_test_a1bC",
    env: "staging",
    created: "2026-07-15",
    lastUsed: "1h ago",
    status: "active",
    creator: "Alex Kim",
  },
  {
    id: "k3",
    name: "CI/CD Pipeline",
    prefix: "demo_live_y9zA",
    env: "production",
    created: "2026-06-10",
    lastUsed: "12h ago",
    status: "active",
    creator: "Sam Chen",
  },
  {
    id: "k4",
    name: "Dev local testing",
    prefix: "demo_test_z0Aa",
    env: "development",
    created: "2026-05-20",
    lastUsed: "3d ago",
    status: "revoked",
    creator: "Pat Lee",
  },
]
const FULL_KEYS: Record<string, string> = {
  k1: "demo_live_x8aF3kP9nQwR2mLvZ5tY7uB4cD6eHjI0mKpW",
  k2: "demo_test_a1bC2dE3fG4hI5jK6lM7nO8pQ9rS0tUvXy",
  k3: "demo_live_y9zA0bB1cC2dD3eE4fF5gG6hH7iI8jJkLm",
  k4: "demo_test_z0Aa1bB2cC3dD4eE5fF6gG7hH8iI9jKkLl",
}
const TEAM = [
  {
    id: "u1",
    name: "Jane Doe",
    email: "jane@acme.com",
    role: "owner",
    avatar: "JD",
    joined: "2026-01-12",
  },
  {
    id: "u2",
    name: "Alex Kim",
    email: "alex@acme.com",
    role: "admin",
    avatar: "AK",
    joined: "2026-02-03",
  },
  {
    id: "u3",
    name: "Sam Chen",
    email: "sam@acme.com",
    role: "developer",
    avatar: "SC",
    joined: "2026-03-15",
  },
  {
    id: "u4",
    name: "Pat Lee",
    email: "pat@acme.com",
    role: "developer",
    avatar: "PL",
    joined: "2026-04-22",
  },
  {
    id: "u5",
    name: "Jordan Wu",
    email: "jordan@acme.com",
    role: "viewer",
    avatar: "JW",
    joined: "2026-06-01",
  },
]
const ALERT_RULES_DEFAULT = [
  {
    id: "r1",
    name: "Error rate > 5%",
    trigger: "error_rate",
    threshold: "5%",
    severity: "critical",
    channel: "Slack #alerts",
    enabled: true,
  },
  {
    id: "r2",
    name: "P99 latency > 2s",
    trigger: "latency_p99",
    threshold: "2000ms",
    severity: "high",
    channel: "PagerDuty",
    enabled: true,
  },
  {
    id: "r3",
    name: "Service down > 30s",
    trigger: "health_check",
    threshold: "30s",
    severity: "critical",
    channel: "PagerDuty",
    enabled: true,
  },
  {
    id: "r4",
    name: "Kafka lag > 50K",
    trigger: "kafka_lag",
    threshold: "50000",
    severity: "medium",
    channel: "Slack #infra",
    enabled: false,
  },
  {
    id: "r5",
    name: "Deploy failure",
    trigger: "deployment",
    threshold: "any",
    severity: "high",
    channel: "Slack #deploys",
    enabled: true,
  },
]
/* ─── Style helpers ─── */
function roleStyle(r: string) {
  if (r === "owner")
    return {
      color: "var(--accent)",
      bg: "var(--accent-bg)",
      border: "var(--accent-border)",
    }
  if (r === "admin")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    }
  if (r === "developer")
    return {
      color: "var(--green)",
      bg: "var(--green-bg)",
      border: "var(--green-border)",
    }
  return { color: "var(--text-3)", bg: "var(--bg-3)", border: "var(--border)" }
}
function severityStyle(s: string) {
  if (s === "critical")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    }
  if (s === "high")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    }
  if (s === "medium")
    return {
      color: "var(--accent)",
      bg: "var(--accent-bg)",
      border: "var(--accent-border)",
    }
  return { color: "var(--text-3)", bg: "var(--bg-3)", border: "var(--border)" }
}
function envStyle(env: string) {
  if (env === "production")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    }
  if (env === "staging")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    }
  return { color: "var(--text-4)", bg: "var(--bg-3)", border: "var(--border)" }
}
/* ─── Atoms ─── */
function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="[background:none] [border:none] [cursor:pointer] [color:var(--text-4)] [padding:2px] [display:flex] hover:[color:var(--text-2)]"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  )
}
function Toggle({
  on,
  onChange,
}: {
  on: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={[
        "[width:36px] [height:20px] [border-radius:10px] [border:none] [cursor:pointer] [padding:2px] [transition:background_0.2s] [display:flex] [align-items:center] [flex-shrink:0]",
        on ? "[background:var(--accent)]" : "[background:var(--bg-3)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        style={{
          transform: `translateX(${on ? 16 : 0}px)`,
        }}
        className="[width:16px] [height:16px] [border-radius:50%] [background:#fff] [transition:transform_0.2s] [box-shadow:0_1px_3px_rgba(0,0,0,0.2)]"
      />
    </button>
  )
}
function SectionHeader({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="[display:flex] [align-items:center] [justify-content:space-between] [padding:10px_16px] [border-bottom:1px_solid_var(--border)]">
      <span
        style={{
          fontFamily: SANS,
        }}
        className="[font-size:13px] [font-weight:600] [letter-spacing:-0.006em] [color:var(--text-1)]"
      >
        {title}
      </span>
      {action}
    </div>
  )
}
function TableRow({
  children,
  last,
  isDisabled,
}: {
  children: React.ReactNode
  last?: boolean
  isDisabled?: boolean
}) {
  return (
    <div
      className={[
        [
          "[display:flex] [align-items:center] [gap:12px] [padding:0_16px] [height:44px] [transition:background_0.08s]",
          last
            ? "[border-bottom:none]"
            : "[border-bottom:1px_solid_var(--border)]",
          isDisabled ? "[opacity:0.5]" : "[opacity:1]",
        ]
          .filter(Boolean)
          .join(" "),
        "hover:[background:var(--bg-3)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  )
}
function Badge({
  label,
  color,
  bg,
  border,
}: {
  label: string
  color: string
  bg: string
  border: string
}) {
  return (
    <span
      style={{
        color,
        background: bg,
        border: `1px solid ${border}`,
        fontFamily: MONO,
        textTransform: "capitalize" as const,
      }}
      className="[font-size:11px] [font-weight:500] [padding:2px_7px] [border-radius:5px] [flex-shrink:0]"
    >
      {label}
    </span>
  )
}
function ActionBtn({
  children,
  primary,
  danger,
}: {
  children: React.ReactNode
  primary?: boolean
  danger?: boolean
}) {
  let bg = "transparent",
    color = "var(--text-2)",
    border = "1px solid var(--border)"
  if (primary) {
    bg = "var(--accent)"
    color = "#fff"
    border = "none"
  }
  if (danger) {
    bg = "transparent"
    color = "var(--red)"
    border = "1px solid var(--red-border)"
  }
  return (
    <button
      style={{
        border,
        background: bg,
        color,
        fontFamily: SANS,
      }}
      className={[
        [
          "[display:flex] [align-items:center] [gap:6px] [padding:7px_14px] [border-radius:8px] [font-size:13px] [cursor:pointer] [transition:opacity_0.12s,_background_0.12s]",
          primary ? "[font-weight:500]" : "[font-weight:400]",
        ]
          .filter(Boolean)
          .join(" "),
        "hover:[opacity:0.8]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  )
}
const inp = {
  padding: "8px 12px",
  borderRadius: 8,
  fontSize: 13,
  background: "var(--bg)",
  border: "1px solid var(--border-2)",
  color: "var(--text-1)",
  fontFamily: SANS,
  outline: "none",
  width: "100%",
} as React.CSSProperties
function FieldRow({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0 max-[640px]:grid-cols-1 max-[640px]:gap-2 max-[640px]:py-3 max-[640px]:[&>div:last-child]:min-w-0 max-[640px]:[&_button]:w-full max-[640px]:[&_button]:min-w-0 [display:grid] [grid-template-columns:200px_1fr] [align-items:start] [gap:24px] [padding:14px_0] [border-bottom:1px_solid_var(--border)]">
      <div>
        <p
          style={{
            fontFamily: SANS,
          }}
          className="[font-size:13px] [font-weight:500] [color:var(--text-1)] [margin:0_0_3px] [letter-spacing:-0.004em]"
        >
          {label}
        </p>
        {hint && (
          <p
            style={{
              fontFamily: SANS,
            }}
            className="[font-size:11px] [color:var(--text-4)] [margin:0] [line-height:1.5]"
          >
            {hint}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}
/* ─── Tab content components ─── */
function GeneralTab() {
  const [region, setRegion] = useState("us-east-1")
  const [defaultEnv, setDefaultEnv] = useState("production")
  const [dataRetention, setDataRetention] = useState("30")
  return (
    <div>
      <div className="[padding:0_20px] [border-radius:8px] [border:1px_solid_var(--border)] [background:var(--bg-2)]">
        <FieldRow label="Workspace name" hint="Display name for this workspace">
          <input defaultValue="Acme E-Commerce" style={inp} />
        </FieldRow>
        <FieldRow label="Slug" hint="Used in API calls and URL paths">
          <input
            defaultValue="acme-ecommerce"
            style={{ ...inp, fontFamily: MONO }}
          />
        </FieldRow>
        <FieldRow label="Region" hint="Primary data region for this workspace">
          <SherlockSelect
            value={region}
            onChange={setRegion}
            options={[
              { value: "us-east-1", label: "us-east-1 (N. Virginia)" },
              { value: "us-west-2", label: "us-west-2 (Oregon)" },
              { value: "eu-west-1", label: "eu-west-1 (Ireland)" },
              { value: "ap-southeast-1", label: "ap-southeast-1 (Singapore)" },
            ]}
            minWidth={220}
          />
        </FieldRow>
        <FieldRow label="Plan" hint="Current billing plan">
          <div className="[display:flex] [align-items:center] [gap:10px]">
            <span
              style={{
                fontFamily: MONO,
              }}
              className="[font-size:13px] [font-weight:600] [color:var(--accent)]"
            >
              Pro
            </span>
            <span
              style={{
                fontFamily: MONO,
              }}
              className="[font-size:11px] [padding:2px_7px] [border-radius:5px] [background:var(--accent-bg)] [border:1px_solid_var(--accent-border)] [color:var(--accent)]"
            >
              $99 / mo
            </span>
            <button
              style={{
                fontFamily: SANS,
              }}
              className="[font-size:12px] [color:var(--accent)] [background:none] [border:none] [cursor:pointer]"
            >
              Upgrade
            </button>
          </div>
        </FieldRow>
        <FieldRow label="Default environment" hint="Environment shown on login">
          <SherlockSelect
            value={defaultEnv}
            onChange={setDefaultEnv}
            options={[
              { value: "production", label: "production" },
              { value: "staging", label: "staging" },
              { value: "development", label: "development" },
            ]}
            minWidth={160}
          />
        </FieldRow>
        <FieldRow label="Data retention" hint="How long telemetry is stored">
          <SherlockSelect
            value={dataRetention}
            onChange={setDataRetention}
            options={[
              { value: "7", label: "7 days" },
              { value: "14", label: "14 days" },
              { value: "30", label: "30 days" },
              { value: "90", label: "90 days" },
            ]}
            minWidth={120}
          />
        </FieldRow>
        <div className="[padding:16px_0_4px]">
          <ActionBtn primary>Save changes</ActionBtn>
        </div>
      </div>

      {/* Danger zone */}
      <div className="[margin-top:24px] [padding:16px_20px] [border-radius:8px] [background:var(--red-bg)] [border:1px_solid_var(--red-border)]">
        <p
          style={{
            fontFamily: SANS,
          }}
          className="[font-size:13px] [font-weight:600] [color:var(--red)] [margin:0_0_8px]"
        >
          Danger zone
        </p>
        <div className="[display:flex] [align-items:center] [justify-content:space-between] [gap:16px] [flex-wrap:wrap]">
          <p className="[font-size:12px] [color:var(--text-3)] [margin:0] [line-height:1.6]">
            Deleting this workspace is permanent and cannot be undone. All
            telemetry, traces, logs, incidents, API keys, and settings will be
            permanently removed.
          </p>
          <ActionBtn danger>Delete workspace</ActionBtn>
        </div>
      </div>
    </div>
  )
}
function ApiKeysTab() {
  return (
    <div className="[display:flex] [flex-direction:column] [gap:16px]">
      <div className="[padding:12px_16px] [border-radius:8px] [background:var(--accent-bg)] [border:1px_solid_var(--accent-border)] [display:flex] [gap:10px] [align-items:flex-start]">
        <Key
          size={13}
          className="[color:var(--accent)] [flex-shrink:0] [margin-top:1px]"
        />
        <p className="[font-size:12px] [color:var(--text-3)] [margin:0] [line-height:1.6]">
          API keys authenticate your services and allow them to send telemetry.
          Keys are shown once when created — store them securely in a secrets
          manager.
        </p>
      </div>

      <div className="overflow-x-auto max-w-full [border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)]">
        <SectionHeader
          title={`API Keys (${API_KEYS.filter((k) => k.status === "active").length} active)`}
          action={
            <ActionBtn primary>
              <Plus size={12} />
              Create API Key
            </ActionBtn>
          }
        />

        {/* Table header */}
        <div className="[display:grid] [grid-template-columns:1fr_160px_100px_100px_100px_80px_80px] [min-width:640px] [padding:0_16px] [height:36px] [border-bottom:1px_solid_var(--border)] [background:var(--bg-3)] [align-items:center] [gap:12px]">
          {[
            "Name",
            "Prefix",
            "Environment",
            "Created",
            "Last used",
            "Status",
            "",
          ].map((h) => (
            <span
              key={h}
              style={{
                fontFamily: MONO,
              }}
              className="[font-size:11px] [color:var(--text-4)] [font-weight:600] [letter-spacing:0.02em]"
            >
              {h}
            </span>
          ))}
        </div>

        {API_KEYS.map((k, i) => {
          const es = envStyle(k.env)
          return (
            <div
              key={k.id}
              className={[
                [
                  "[display:grid] [grid-template-columns:1fr_160px_100px_100px_100px_80px_80px] [min-width:640px] [padding:0_16px] [height:44px] [align-items:center] [gap:12px] [transition:background_0.08s]",
                  i < API_KEYS.length - 1
                    ? "[border-bottom:1px_solid_var(--border)]"
                    : "[border-bottom:none]",
                  k.status === "revoked" ? "[opacity:0.55]" : "[opacity:1]",
                ]
                  .filter(Boolean)
                  .join(" "),
                "hover:[background:var(--bg-3)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div>
                <span
                  style={{
                    fontFamily: SANS,
                  }}
                  className="[font-size:13px] [font-weight:500] [color:var(--text-1)]"
                >
                  {k.name}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                  }}
                  className="[font-size:11px] [color:var(--text-4)] [margin-left:8px]"
                >
                  by {k.creator}
                </span>
              </div>
              <div className="[display:flex] [align-items:center] [gap:4px]">
                <span
                  style={{
                    fontFamily: MONO,
                  }}
                  className="[font-size:11px] [color:var(--text-3)]"
                >
                  {k.prefix}••••
                </span>
                {k.status === "active" && <CopyBtn value={FULL_KEYS[k.id]} />}
              </div>
              <Badge
                label={k.env}
                color={es.color}
                bg={es.bg}
                border={es.border}
              />
              <span
                style={{
                  fontFamily: MONO,
                }}
                className="[font-size:11px] [color:var(--text-4)]"
              >
                {k.created}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                }}
                className="[font-size:11px] [color:var(--text-3)]"
              >
                {k.lastUsed}
              </span>
              <Badge
                label={k.status}
                color={k.status === "active" ? "var(--green)" : "var(--text-4)"}
                bg={k.status === "active" ? "var(--green-bg)" : "var(--bg-3)"}
                border={
                  k.status === "active"
                    ? "var(--green-border)"
                    : "var(--border)"
                }
              />
              <div className="[display:flex] [justify-content:flex-end]">
                {k.status === "active" && (
                  <button className="[background:none] [border:none] [cursor:pointer] [color:var(--text-4)] [display:flex] [padding:4px] hover:[color:var(--red)]">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
function TeamTab() {
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("developer")
  return (
    <div className="[display:flex] [flex-direction:column] [gap:16px]">
      {/* Invite */}
      <div className="[padding:16px] [border-radius:8px] [border:1px_solid_var(--border)] [background:var(--bg-2)]">
        <p
          style={{
            fontFamily: SANS,
          }}
          className="[font-size:13px] [font-weight:600] [color:var(--text-1)] [margin:0_0_12px]"
        >
          Invite member
        </p>
        <div className="[display:flex] [gap:8px]">
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            type="email"
            style={{
              ...inp,
            }}
            className="[flex:1]"
          />
          <SherlockSelect
            value={inviteRole}
            onChange={setInviteRole}
            options={[
              { value: "developer", label: "Developer" },
              { value: "viewer", label: "Viewer" },
              { value: "admin", label: "Admin" },
            ]}
            minWidth={130}
          />
          <ActionBtn primary>Send invite</ActionBtn>
        </div>
      </div>

      {/* Members */}
      <div className="overflow-x-auto max-w-full [border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)]">
        <SectionHeader title={`Members (${TEAM.length})`} />

        {/* Table header */}
        <div className="[display:grid] [grid-template-columns:200px_1fr_100px_120px_40px] [min-width:640px] [padding:0_16px] [height:36px] [border-bottom:1px_solid_var(--border)] [background:var(--bg-3)] [align-items:center] [gap:12px]">
          {["Member", "Email", "Role", "Joined", ""].map((h) => (
            <span
              key={h}
              style={{
                fontFamily: MONO,
              }}
              className="[font-size:11px] [color:var(--text-4)] [font-weight:600] [letter-spacing:0.02em]"
            >
              {h}
            </span>
          ))}
        </div>

        {TEAM.map((m, i) => {
          const rs = roleStyle(m.role)
          return (
            <div
              key={m.id}
              className={[
                [
                  "[display:grid] [grid-template-columns:200px_1fr_100px_120px_40px] [min-width:640px] [padding:0_16px] [height:44px] [align-items:center] [gap:12px] [transition:background_0.08s]",
                  i < TEAM.length - 1
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
              <div className="[display:flex] [align-items:center] [gap:10px]">
                <div
                  style={{
                    fontFamily: MONO,
                  }}
                  className="[width:28px] [height:28px] [border-radius:50%] [font-size:10px] [font-weight:700] [background:var(--bg-3)] [border:1px_solid_var(--border-2)] [display:flex] [align-items:center] [justify-content:center] [color:var(--text-1)] [flex-shrink:0]"
                >
                  {m.avatar}
                </div>
                <span
                  style={{
                    fontFamily: SANS,
                  }}
                  className="[font-size:13px] [font-weight:500] [color:var(--text-1)]"
                >
                  {m.name}
                </span>
              </div>
              <span
                style={{
                  fontFamily: MONO,
                }}
                className="[font-size:12px] [color:var(--text-4)] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]"
              >
                {m.email}
              </span>
              <Badge
                label={m.role}
                color={rs.color}
                bg={rs.bg}
                border={rs.border}
              />
              <span
                style={{
                  fontFamily: MONO,
                }}
                className="[font-size:11px] [color:var(--text-4)]"
              >
                {m.joined}
              </span>
              <div className="[display:flex] [justify-content:flex-end]">
                {m.role !== "owner" && (
                  <button className="[background:none] [border:none] [cursor:pointer] [color:var(--text-4)] [display:flex] [padding:4px] hover:[color:var(--text-1)]">
                    <MoreHorizontal size={14} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
function AlertsTab() {
  const [alerts, setAlerts] = useState(ALERT_RULES_DEFAULT)
  return (
    <div className="overflow-x-auto max-w-full [border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)]">
      <SectionHeader
        title="Alert rules"
        action={
          <ActionBtn primary>
            <Plus size={12} />
            Add rule
          </ActionBtn>
        }
      />

      {/* Table header */}
      <div className="[display:grid] [grid-template-columns:1fr_120px_100px_140px_80px_40px] [min-width:640px] [padding:0_16px] [height:36px] [border-bottom:1px_solid_var(--border)] [background:var(--bg-3)] [align-items:center] [gap:12px]">
        {["Name", "Threshold", "Severity", "Channel", "Enabled", ""].map(
          (h) => (
            <span
              key={h}
              style={{
                fontFamily: MONO,
              }}
              className="[font-size:11px] [color:var(--text-4)] [font-weight:600] [letter-spacing:0.02em]"
            >
              {h}
            </span>
          ),
        )}
      </div>

      {alerts.map((rule, i) => {
        const ss = severityStyle(rule.severity)
        return (
          <div
            key={rule.id}
            className={[
              [
                "[display:grid] [grid-template-columns:1fr_120px_100px_140px_80px_40px] [min-width:640px] [padding:0_16px] [height:44px] [align-items:center] [gap:12px] [transition:background_0.08s]",
                i < alerts.length - 1
                  ? "[border-bottom:1px_solid_var(--border)]"
                  : "[border-bottom:none]",
                rule.enabled ? "[opacity:1]" : "[opacity:0.5]",
              ]
                .filter(Boolean)
                .join(" "),
              "hover:[background:var(--bg-3)]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span
              style={{
                fontFamily: SANS,
              }}
              className="[font-size:13px] [font-weight:500] [color:var(--text-1)]"
            >
              {rule.name}
            </span>
            <span
              style={{
                fontFamily: MONO,
              }}
              className="[font-size:11px] [color:var(--text-3)]"
            >
              {rule.threshold}
            </span>
            <Badge
              label={rule.severity}
              color={ss.color}
              bg={ss.bg}
              border={ss.border}
            />
            <span
              style={{
                fontFamily: SANS,
              }}
              className="[font-size:12px] [color:var(--text-3)] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]"
            >
              {rule.channel}
            </span>
            <Toggle
              on={rule.enabled}
              onChange={(v) =>
                setAlerts((prev) =>
                  prev.map((r) =>
                    r.id === rule.id ? { ...r, enabled: v } : r,
                  ),
                )
              }
            />
            <div className="[display:flex] [justify-content:flex-end]">
              <button className="[background:none] [border:none] [cursor:pointer] [color:var(--text-4)] [display:flex] [padding:4px] hover:[color:var(--text-1)]">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
function SecurityTab() {
  const [mfa, setMfa] = useState(true)
  const [auditLog, setAuditLog] = useState(true)
  const [saml, setSaml] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState("24h")
  return (
    <div className="[display:flex] [flex-direction:column] [gap:16px]">
      <div className="[padding:0_20px] [border:1px_solid_var(--border)] [border-radius:8px] [background:var(--bg-2)]">
        <FieldRow
          label="SAML SSO"
          hint="Single sign-on via your identity provider"
        >
          <div className="[display:flex] [align-items:center] [gap:10px]">
            <Toggle on={saml} onChange={setSaml} />
            <span
              style={{
                fontFamily: SANS,
              }}
              className={[
                "[font-size:12px]",
                saml ? "[color:var(--green)]" : "[color:var(--text-4)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {saml
                ? "Enabled — configure your IdP metadata below"
                : "Disabled"}
            </span>
          </div>
        </FieldRow>
        <FieldRow
          label="Two-factor authentication"
          hint="Require MFA for all team members"
        >
          <div className="[display:flex] [align-items:center] [gap:10px]">
            <Toggle on={mfa} onChange={setMfa} />
            <span
              style={{
                fontFamily: SANS,
              }}
              className={[
                "[font-size:12px]",
                mfa ? "[color:var(--green)]" : "[color:var(--text-4)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {mfa ? "Enforced for all members" : "Optional"}
            </span>
          </div>
        </FieldRow>
        <FieldRow
          label="IP allowlist"
          hint="Restrict access to specific IP ranges (CIDR notation)"
        >
          <div className="[display:flex] [flex-direction:column] [gap:6px]">
            <input placeholder="0.0.0.0/0 (allow all)" style={inp} />
            <p
              style={{
                fontFamily: SANS,
              }}
              className="[font-size:11px] [color:var(--text-4)] [margin:0]"
            >
              Leave empty to allow all IPs. Add one range per line.
            </p>
          </div>
        </FieldRow>
        <FieldRow label="Session timeout" hint="Auto-logout after inactivity">
          <SherlockSelect
            value={sessionTimeout}
            onChange={setSessionTimeout}
            options={[
              { value: "1h", label: "1 hour" },
              { value: "8h", label: "8 hours" },
              { value: "24h", label: "24 hours" },
              { value: "7d", label: "7 days" },
            ]}
            minWidth={140}
          />
        </FieldRow>
        <FieldRow
          label="Audit log"
          hint="Track all admin actions — retained for 90 days"
        >
          <div className="[display:flex] [align-items:center] [gap:10px]">
            <Toggle on={auditLog} onChange={setAuditLog} />
            <span
              style={{
                fontFamily: SANS,
              }}
              className={[
                "[font-size:12px]",
                auditLog ? "[color:var(--green)]" : "[color:var(--text-4)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {auditLog ? "Enabled — retained for 90 days" : "Disabled"}
            </span>
            {auditLog && (
              <button
                style={{
                  fontFamily: SANS,
                }}
                className="[display:flex] [align-items:center] [gap:5px] [padding:5px_10px] [border-radius:7px] [border:1px_solid_var(--border)] [background:transparent] [color:var(--text-3)] [font-size:12px] [cursor:pointer] hover:[color:var(--text-1)]"
              >
                <Download size={11} />
                Export CSV
              </button>
            )}
          </div>
        </FieldRow>
        <div className="[padding:16px_0_4px]">
          <ActionBtn primary>Save changes</ActionBtn>
        </div>
      </div>
    </div>
  )
}
/* ─── Page ─── */
export default function Settings() {
  const [activeTab, setActiveTab] = useState("general")
  return (
    <div
      style={{
        fontFamily: SANS,
      }}
      className="[display:flex] [flex-direction:column] [height:100%] [overflow:hidden] [background:var(--bg)]"
    >
      {/* Page header */}
      <div className="max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:20px_32px_16px] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [display:flex] [align-items:center] [justify-content:space-between]">
        <div>
          <h1 className="[font-size:18px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)] [margin:0_0_4px]">
            Settings
          </h1>
          <p className="[font-size:13px] [color:var(--text-3)] [margin:0]">
            Manage your workspace, API keys, team, and preferences
          </p>
        </div>
      </div>

      {/* Two-column: left nav + right content */}
      <div className="[flex:1] [display:flex] [overflow:hidden] [min-height:0]">
        {/* Left nav (200px fixed) */}
        <nav className="w-[200px] max-[640px]:w-full max-[640px]:flex-row max-[640px]:overflow-x-auto max-[640px]:overflow-y-hidden max-[640px]:border-r-0 max-[640px]:border-b max-[640px]:border-[var(--border)] max-[640px]:p-2 max-[640px]:[&_button]:min-w-max [width:200px] [flex-shrink:0] [border-right:1px_solid_var(--border)] [padding:16px_12px] [display:flex] [flex-direction:column] [gap:2px] [overflow-y:auto]">
          {NAV_TABS.map((t) => {
            const active = activeTab === t.id
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  fontFamily: SANS,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "var(--text-2)"
                    e.currentTarget.style.background = "var(--bg-2)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "var(--text-3)"
                    e.currentTarget.style.background = "transparent"
                  }
                }}
                className={[
                  "[display:flex] [align-items:center] [gap:9px] [padding:8px_12px] [border-radius:7px] [cursor:pointer] [width:100%] [text-align:left] [font-size:13px] [letter-spacing:-0.004em] [transition:all_0.1s]",
                  active
                    ? "[background:var(--bg-2)]"
                    : "[background:transparent]",
                  active ? "[color:var(--text-1)]" : "[color:var(--text-3)]",
                  active ? "[font-weight:500]" : "[font-weight:400]",
                  active
                    ? "[border:1px_solid_var(--border)]"
                    : "[border:1px_solid_transparent]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Icon size={14} />
                {t.label}
              </button>
            )
          })}
        </nav>

        {/* Right scrollable content */}
        <div className="max-[640px]:px-4 [flex:1] [overflow-y:auto] [padding:24px_32px]">
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "apikeys" && <ApiKeysTab />}
          {activeTab === "team" && <TeamTab />}
          {activeTab === "alerts" && <AlertsTab />}
          {activeTab === "security" && <SecurityTab />}
        </div>
      </div>
    </div>
  )
}
