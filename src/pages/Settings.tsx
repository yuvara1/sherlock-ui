import { useState } from "react";
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
} from "lucide-react";
import { SherlockSelect } from "@/components/ui/SherlockSelect";

/* ─── Constants ─── */
const MONO = "Geist Mono, monospace";
const SANS = "Geist, sans-serif";

/* ─── Nav tabs ─── */
const NAV_TABS = [
  { id: "general", label: "General", icon: Globe },
  { id: "apikeys", label: "API Keys", icon: Key },
  { id: "team", label: "Team", icon: Users },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

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
];

const FULL_KEYS: Record<string, string> = {
  k1: "demo_live_x8aF3kP9nQwR2mLvZ5tY7uB4cD6eHjI0mKpW",
  k2: "demo_test_a1bC2dE3fG4hI5jK6lM7nO8pQ9rS0tUvXy",
  k3: "demo_live_y9zA0bB1cC2dD3eE4fF5gG6hH7iI8jJkLm",
  k4: "demo_test_z0Aa1bB2cC3dD4eE5fF6gG7hH8iI9jKkLl",
};

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
];

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
];

/* ─── Style helpers ─── */
function roleStyle(r: string) {
  if (r === "owner")
    return {
      color: "var(--accent)",
      bg: "var(--accent-bg)",
      border: "var(--accent-border)",
    };
  if (r === "admin")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    };
  if (r === "developer")
    return {
      color: "var(--green)",
      bg: "var(--green-bg)",
      border: "var(--green-border)",
    };
  return { color: "var(--text-3)", bg: "var(--bg-3)", border: "var(--border)" };
}

function severityStyle(s: string) {
  if (s === "critical")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    };
  if (s === "high")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    };
  if (s === "medium")
    return {
      color: "var(--accent)",
      bg: "var(--accent-bg)",
      border: "var(--accent-border)",
    };
  return { color: "var(--text-3)", bg: "var(--bg-3)", border: "var(--border)" };
}

function envStyle(env: string) {
  if (env === "production")
    return {
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
    };
  if (env === "staging")
    return {
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
    };
  return { color: "var(--text-4)", bg: "var(--bg-3)", border: "var(--border)" };
}

/* ─── Atoms ─── */
function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--text-4)",
        padding: 2,
        display: "flex",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-4)")}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        background: on ? "var(--accent)" : "var(--bg-3)",
        padding: 2,
        transition: "background 0.2s",
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transform: `translateX(${on ? 16 : 0}px)`,
          transition: "transform 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "-0.006em",
          color: "var(--text-1)",
          fontFamily: SANS,
        }}
      >
        {title}
      </span>
      {action}
    </div>
  );
}

function TableRow({
  children,
  last,
  isDisabled,
}: {
  children: React.ReactNode;
  last?: boolean;
  isDisabled?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
        height: 44,
        borderBottom: last ? "none" : "1px solid var(--border)",
        transition: "background 0.08s",
        opacity: isDisabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-3)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </div>
  );
}

function Badge({
  label,
  color,
  bg,
  border,
}: {
  label: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 7px",
        borderRadius: 5,
        color,
        background: bg,
        border: `1px solid ${border}`,
        fontFamily: MONO,
        flexShrink: 0,
        textTransform: "capitalize" as const,
      }}
    >
      {label}
    </span>
  );
}

function ActionBtn({
  children,
  primary,
  danger,
}: {
  children: React.ReactNode;
  primary?: boolean;
  danger?: boolean;
}) {
  let bg = "transparent",
    color = "var(--text-2)",
    border = "1px solid var(--border)";
  if (primary) {
    bg = "var(--accent)";
    color = "#fff";
    border = "none";
  }
  if (danger) {
    bg = "transparent";
    color = "var(--red)";
    border = "1px solid var(--red-border)";
  }
  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        borderRadius: 8,
        border,
        background: bg,
        color,
        fontSize: 13,
        fontWeight: primary ? 500 : 400,
        cursor: "pointer",
        fontFamily: SANS,
        transition: "opacity 0.12s, background 0.12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
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
} as React.CSSProperties;

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="responsive-field-row"
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        alignItems: "start",
        gap: 24,
        padding: "14px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-1)",
            margin: "0 0 3px",
            letterSpacing: "-0.004em",
            fontFamily: SANS,
          }}
        >
          {label}
        </p>
        {hint && (
          <p
            style={{
              fontSize: 11,
              color: "var(--text-4)",
              margin: 0,
              lineHeight: 1.5,
              fontFamily: SANS,
            }}
          >
            {hint}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ─── Tab content components ─── */

function GeneralTab() {
  const [region, setRegion] = useState("us-east-1");
  const [defaultEnv, setDefaultEnv] = useState("production");
  const [dataRetention, setDataRetention] = useState("30");

  return (
    <div>
      <div
        style={{
          padding: "0 20px",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--bg-2)",
        }}
      >
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--accent)",
                fontFamily: MONO,
              }}
            >
              Pro
            </span>
            <span
              style={{
                fontSize: 11,
                fontFamily: MONO,
                padding: "2px 7px",
                borderRadius: 5,
                background: "var(--accent-bg)",
                border: "1px solid var(--accent-border)",
                color: "var(--accent)",
              }}
            >
              $99 / mo
            </span>
            <button
              style={{
                fontSize: 12,
                color: "var(--accent)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: SANS,
              }}
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
        <div style={{ padding: "16px 0 4px" }}>
          <ActionBtn primary>Save changes</ActionBtn>
        </div>
      </div>

      {/* Danger zone */}
      <div
        style={{
          marginTop: 24,
          padding: "16px 20px",
          borderRadius: 8,
          background: "var(--red-bg)",
          border: "1px solid var(--red-border)",
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--red)",
            margin: "0 0 8px",
            fontFamily: SANS,
          }}
        >
          Danger zone
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "var(--text-3)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Deleting this workspace is permanent and cannot be undone. All
            telemetry, traces, logs, incidents, API keys, and settings will be
            permanently removed.
          </p>
          <ActionBtn danger>Delete workspace</ActionBtn>
        </div>
      </div>
    </div>
  );
}

function ApiKeysTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 8,
          background: "var(--accent-bg)",
          border: "1px solid var(--accent-border)",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <Key
          size={13}
          style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }}
        />
        <p
          style={{
            fontSize: 12,
            color: "var(--text-3)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          API keys authenticate your services and allow them to send telemetry.
          Keys are shown once when created — store them securely in a secrets
          manager.
        </p>
      </div>

      <div
        className="responsive-data-surface"
        style={{
          border: "1px solid var(--border)",
          borderRadius: 8,
          background: "var(--bg-2)",
        }}
      >
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 160px 100px 100px 100px 80px 80px",
            minWidth: 640,
            padding: "0 16px",
            height: 36,
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-3)",
            alignItems: "center",
            gap: 12,
          }}
        >
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
                fontSize: 11,
                fontFamily: MONO,
                color: "var(--text-4)",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {API_KEYS.map((k, i) => {
          const es = envStyle(k.env);
          return (
            <div
              key={k.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 160px 100px 100px 100px 80px 80px",
            minWidth: 640,
                padding: "0 16px",
                height: 44,
                borderBottom:
                  i < API_KEYS.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
                gap: 12,
                opacity: k.status === "revoked" ? 0.55 : 1,
                transition: "background 0.08s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-3)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-1)",
                    fontFamily: SANS,
                  }}
                >
                  {k.name}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-4)",
                    fontFamily: MONO,
                    marginLeft: 8,
                  }}
                >
                  by {k.creator}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: "var(--text-3)",
                  }}
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
                  fontSize: 11,
                  color: "var(--text-4)",
                }}
              >
                {k.created}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  color: "var(--text-3)",
                }}
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
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {k.status === "active" && (
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-4)",
                      display: "flex",
                      padding: 4,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--red)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--text-4)")
                    }
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeamTab() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("developer");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Invite */}
      <div
        style={{
          padding: 16,
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--bg-2)",
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-1)",
            margin: "0 0 12px",
            fontFamily: SANS,
          }}
        >
          Invite member
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            type="email"
            style={{ ...inp, flex: 1 }}
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
      <div
        className="responsive-data-surface"
        style={{
          border: "1px solid var(--border)",
          borderRadius: 8,
          background: "var(--bg-2)",
        }}
      >
        <SectionHeader title={`Members (${TEAM.length})`} />

        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr 100px 120px 40px",
            minWidth: 640,
            padding: "0 16px",
            height: 36,
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-3)",
            alignItems: "center",
            gap: 12,
          }}
        >
          {["Member", "Email", "Role", "Joined", ""].map((h) => (
            <span
              key={h}
              style={{
                fontSize: 11,
                fontFamily: MONO,
                color: "var(--text-4)",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {TEAM.map((m, i) => {
          const rs = roleStyle(m.role);
          return (
            <div
              key={m.id}
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr 100px 120px 40px",
            minWidth: 640,
                padding: "0 16px",
                height: 44,
                borderBottom:
                  i < TEAM.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
                gap: 12,
                transition: "background 0.08s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-3)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    fontSize: 10,
                    fontWeight: 700,
                    background: "var(--bg-3)",
                    border: "1px solid var(--border-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-1)",
                    fontFamily: MONO,
                    flexShrink: 0,
                  }}
                >
                  {m.avatar}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-1)",
                    fontFamily: SANS,
                  }}
                >
                  {m.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: MONO,
                  color: "var(--text-4)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
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
                  fontSize: 11,
                  fontFamily: MONO,
                  color: "var(--text-4)",
                }}
              >
                {m.joined}
              </span>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {m.role !== "owner" && (
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-4)",
                      display: "flex",
                      padding: 4,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--text-1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--text-4)")
                    }
                  >
                    <MoreHorizontal size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlertsTab() {
  const [alerts, setAlerts] = useState(ALERT_RULES_DEFAULT);
  return (
    <div
      className="responsive-data-surface"
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        background: "var(--bg-2)",
      }}
    >
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 100px 140px 80px 40px",
          minWidth: 640,
          padding: "0 16px",
          height: 36,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-3)",
          alignItems: "center",
          gap: 12,
        }}
      >
        {["Name", "Threshold", "Severity", "Channel", "Enabled", ""].map(
          (h) => (
            <span
              key={h}
              style={{
                fontSize: 11,
                fontFamily: MONO,
                color: "var(--text-4)",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              {h}
            </span>
          ),
        )}
      </div>

      {alerts.map((rule, i) => {
        const ss = severityStyle(rule.severity);
        return (
          <div
            key={rule.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 100px 140px 80px 40px",
          minWidth: 640,
              padding: "0 16px",
              height: 44,
              borderBottom:
                i < alerts.length - 1 ? "1px solid var(--border)" : "none",
              alignItems: "center",
              gap: 12,
              opacity: rule.enabled ? 1 : 0.5,
              transition: "background 0.08s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-3)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-1)",
                fontFamily: SANS,
              }}
            >
              {rule.name}
            </span>
            <span
              style={{ fontFamily: MONO, fontSize: 11, color: "var(--text-3)" }}
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
                fontSize: 12,
                color: "var(--text-3)",
                fontFamily: SANS,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
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
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-4)",
                  display: "flex",
                  padding: 4,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-4)")
                }
              >
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SecurityTab() {
  const [mfa, setMfa] = useState(true);
  const [auditLog, setAuditLog] = useState(true);
  const [saml, setSaml] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("24h");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          padding: "0 20px",
          border: "1px solid var(--border)",
          borderRadius: 8,
          background: "var(--bg-2)",
        }}
      >
        <FieldRow
          label="SAML SSO"
          hint="Single sign-on via your identity provider"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Toggle on={saml} onChange={setSaml} />
            <span
              style={{
                fontSize: 12,
                color: saml ? "var(--green)" : "var(--text-4)",
                fontFamily: SANS,
              }}
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Toggle on={mfa} onChange={setMfa} />
            <span
              style={{
                fontSize: 12,
                color: mfa ? "var(--green)" : "var(--text-4)",
                fontFamily: SANS,
              }}
            >
              {mfa ? "Enforced for all members" : "Optional"}
            </span>
          </div>
        </FieldRow>
        <FieldRow
          label="IP allowlist"
          hint="Restrict access to specific IP ranges (CIDR notation)"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <input placeholder="0.0.0.0/0 (allow all)" style={inp} />
            <p
              style={{
                fontSize: 11,
                color: "var(--text-4)",
                margin: 0,
                fontFamily: SANS,
              }}
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Toggle on={auditLog} onChange={setAuditLog} />
            <span
              style={{
                fontSize: 12,
                color: auditLog ? "var(--green)" : "var(--text-4)",
                fontFamily: SANS,
              }}
            >
              {auditLog ? "Enabled — retained for 90 days" : "Disabled"}
            </span>
            {auditLog && (
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: 7,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-3)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: SANS,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-3)")
                }
              >
                <Download size={11} />
                Export CSV
              </button>
            )}
          </div>
        </FieldRow>
        <div style={{ padding: "16px 0 4px" }}>
          <ActionBtn primary>Save changes</ActionBtn>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        fontFamily: SANS,
        background: "var(--bg)",
      }}
    >
      {/* Page header */}
      <div
        className="responsive-page-header"
        style={{
          padding: "20px 32px 16px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--text-1)",
              margin: "0 0 4px",
            }}
          >
            Settings
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
            Manage your workspace, API keys, team, and preferences
          </p>
        </div>
      </div>

      {/* Two-column: left nav + right content */}
      <div
        style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}
      >
        {/* Left nav (200px fixed) */}
        <nav
          className="settings-nav"
          style={{
            width: 200,
            flexShrink: 0,
            borderRight: "1px solid var(--border)",
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
          }}
        >
          {NAV_TABS.map((t) => {
            const active = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "8px 12px",
                  borderRadius: 7,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  fontFamily: SANS,
                  background: active ? "var(--bg-2)" : "transparent",
                  color: active ? "var(--text-1)" : "var(--text-3)",
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  letterSpacing: "-0.004em",
                  border: active
                    ? "1px solid var(--border)"
                    : "1px solid transparent",
                  transition: "all 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "var(--text-2)";
                    e.currentTarget.style.background = "var(--bg-2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "var(--text-3)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Right scrollable content */}
        <div
          className="responsive-page-content"
          style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}
        >
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "apikeys" && <ApiKeysTab />}
          {activeTab === "team" && <TeamTab />}
          {activeTab === "alerts" && <AlertsTab />}
          {activeTab === "security" && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}
