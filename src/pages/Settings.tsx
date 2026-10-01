import { useCallback, useEffect, useState, type FormEvent } from "react"
import { useNavigate, useSearchParams } from "react-router"
import {
  Bell,
  Download,
  Globe,
  KeyRound,
  LogOut,
  Shield,
  Trash2,
  Users,
  UserRound,
} from "lucide-react"
import {
  workspaceApi,
  type Role,
  type SecuritySettings,
  type TeamMember,
} from "@/api/workspace"
import { authApi, authErrorMessage } from "@/api/auth"
import { projectsApi } from "@/api/projects"
import { useAuthStore } from "@/stores/authStore"
import type { Environment } from "@/types"
import ApiKeysPanel from "@/components/workspace/ApiKeysPanel"
import {
  Button,
  Field,
  FormDialog,
  inputClass,
  Loading,
  Notice,
  panelClass,
  useResource,
} from "@/components/workspace/Controls"

function GeneralTab() {
  const role = useAuthStore((state) => state.user?.role)
  const manage = role === "OWNER" || role === "ADMIN"
  const resource = useResource(
    useCallback(async () => {
      const organization = await workspaceApi.get()
      const subscription = manage ? await workspaceApi.subscription() : null
      return { organization, subscription }
    }, [manage]),
  )
  const [name, setName] = useState("")
  const [timezone, setTimezone] = useState("UTC")
  const [region, setRegion] = useState("US_EAST_1")
  const [environment, setEnvironment] = useState<Environment>("production")
  const [retention, setRetention] = useState(30)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const navigate = useNavigate()
  useEffect(() => {
    if (resource.data) {
      const organization = resource.data.organization
      setName(organization.name)
      setTimezone(organization.timezone)
      setRegion(organization.region)
      setEnvironment(organization.defaultEnvironment)
      setRetention(organization.dataRetentionDays)
    }
  }, [resource.data])
  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    setSuccess("")
    try {
      await workspaceApi.update({
        name: name.trim(),
        timezone,
        region,
        defaultEnvironment: environment,
        dataRetentionDays: retention,
      })
      setSuccess("Workspace settings saved.")
      await resource.reload()
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  async function remove() {
    setBusy(true)
    setError("")
    try {
      await workspaceApi.delete()
      useAuthStore.getState().logout()
      navigate("/login", { replace: true })
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  if (resource.loading) return <Loading />
  if (!resource.data)
    return (
      <div className="space-y-3">
        <Notice message={resource.error} />
        <Button onClick={() => void resource.reload()}>Retry</Button>
      </div>
    )
  const { organization, subscription } = resource.data
  return (
    <div className="space-y-6">
      <Notice message={error || resource.error} />
      <Notice message={success} success />
      <form onSubmit={save} className={`${panelClass} space-y-5 p-5`}>
        <fieldset
          disabled={busy || !manage}
          className="grid gap-5 sm:grid-cols-2"
        >
          <Field label="Workspace name">
            <input
              required
              maxLength={100}
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label="Slug" hint="Assigned by the server; not editable.">
            <input
              disabled
              className={`${inputClass} font-mono`}
              value={organization.slug}
              readOnly
            />
          </Field>
          <Field label="Timezone">
            <input
              required
              className={inputClass}
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              placeholder="America/New_York"
            />
          </Field>
          <Field
            label="Primary region"
            hint="Data-residency preference; storage migration is not yet available."
          >
            <select
              className={inputClass}
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              {["US_EAST_1", "US_WEST_2", "EU_WEST_1", "AP_SOUTHEAST_1"].map(
                (value) => (
                  <option key={value}>{value}</option>
                ),
              )}
            </select>
          </Field>
          <Field label="Default environment">
            <select
              className={inputClass}
              value={environment}
              onChange={(event) =>
                setEnvironment(event.target.value as Environment)
              }
            >
              {["production", "staging", "development"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Data retention (days)"
            hint="7–365 days. Applied when telemetry storage services are connected."
          >
            <input
              type="number"
              min={7}
              max={365}
              required
              className={inputClass}
              value={retention}
              onChange={(event) => setRetention(Number(event.target.value))}
            />
          </Field>
        </fieldset>
        <Button primary type="submit" disabled={busy || !manage}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </form>
      <div
        className={`${panelClass} flex flex-wrap items-center justify-between gap-3 p-5`}
      >
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-1)]">
            Subscription
          </h3>
          <p className="mt-2 font-mono text-sm text-[var(--accent)]">
            {subscription?.plan ?? organization.plan}
            {subscription && ` · $${subscription.priceMonthly} / month`}
          </p>
          <p className="mt-1 text-xs text-[var(--text-4)]">
            {subscription?.status ??
              "Only workspace admins can view billing details."}
          </p>
        </div>
        <Button
          disabled={busy || role !== "OWNER"}
          onClick={async () => {
            setBusy(true)
            setError("")
            try {
              const result = await workspaceApi.upgrade("PRO")
              const url = new URL(result.url)
              if (url.protocol !== "https:")
                throw new Error("Invalid checkout URL")
              window.location.assign(url.href)
            } catch (failure) {
              setError(authErrorMessage(failure, "Checkout is not configured."))
            } finally {
              setBusy(false)
            }
          }}
        >
          Upgrade plan
        </Button>
      </div>
      {role === "OWNER" && (
        <div className="rounded-xl border border-[var(--red-border)] bg-[var(--red-bg)] p-5">
          <h3 className="text-sm font-semibold text-[var(--red)]">
            Danger zone
          </h3>
          <p className="mb-4 mt-2 text-xs text-[var(--text-3)]">
            Delete this workspace, its projects, teams, and API keys. Account
            records remain in the auth service.
          </p>
          <Button
            danger
            onClick={() => {
              setConfirmation("")
              setError("")
              setDeleting(true)
            }}
          >
            Delete workspace
          </Button>
        </div>
      )}
      <FormDialog
        open={deleting}
        onOpenChange={(value) => {
          if (!busy) setDeleting(value)
        }}
        title="Delete workspace"
        description={`This cannot be undone. Type ${organization.name} to confirm.`}
      >
        <Field label="Workspace name confirmation">
          <input
            className={inputClass}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </Field>
        <Notice message={error} />
        <Button
          danger
          disabled={busy || confirmation !== organization.name}
          onClick={() => void remove()}
        >
          {busy ? "Deleting…" : "Permanently delete workspace"}
        </Button>
      </FormDialog>
    </div>
  )
}

function KeysTab() {
  const projects = useResource(useCallback(() => projectsApi.list(), []))
  if (projects.loading) return <Loading />
  if (!projects.data)
    return (
      <div className="space-y-3">
        <Notice message={projects.error} />
        <Button onClick={() => void projects.reload()}>Retry</Button>
      </div>
    )
  return <ApiKeysPanel projects={projects.data} />
}

function TeamTab() {
  const resource = useResource(useCallback(() => workspaceApi.team(), []))
  const user = useAuthStore((state) => state.user)
  const manages = user?.role === "OWNER" || user?.role === "ADMIN"
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("DEVELOPER")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [removing, setRemoving] = useState<TeamMember | null>(null)
  async function invite(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    setSuccess("")
    try {
      await workspaceApi.invite(email.trim(), role)
      setEmail("")
      setSuccess("Invitation sent. The link expires in seven days.")
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  async function update(member: TeamMember, nextRole: Role) {
    setBusy(true)
    setError("")
    setSuccess("")
    try {
      await workspaceApi.changeRole(member.id, nextRole)
      setSuccess("Role updated. The member must sign in again.")
      await resource.reload()
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  async function remove() {
    if (!removing) return
    setBusy(true)
    setError("")
    try {
      await workspaceApi.removeMember(removing.id)
      setRemoving(null)
      setSuccess("Member removed and their auth sessions revoked.")
      await resource.reload()
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-5">
      <Notice message={error || resource.error} />
      <Notice message={success} success />
      {manages && (
        <form onSubmit={invite} className={`${panelClass} p-5`}>
          <h3 className="mb-4 text-sm font-semibold text-[var(--text-1)]">
            Invite a teammate
          </h3>
          <fieldset disabled={busy} className="flex flex-wrap items-end gap-3">
            <div className="min-w-48 flex-1">
              <Field label="Email address">
                <input
                  required
                  type="email"
                  maxLength={254}
                  className={inputClass}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="teammate@company.com"
                />
              </Field>
            </div>
            <Field label="Role">
              <select
                className={inputClass}
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
              >
                {(user?.role === "OWNER"
                  ? ["ADMIN", "DEVELOPER", "VIEWER"]
                  : ["DEVELOPER", "VIEWER"]
                ).map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>
            <Button type="submit" primary disabled={busy}>
              {busy ? "Sending…" : "Send invite"}
            </Button>
          </fieldset>
          <p className="mt-3 text-xs text-[var(--text-4)]">
            Invitations require SMTP configuration. The API reports delivery
            failures.
          </p>
        </form>
      )}
      {resource.loading ? (
        <Loading />
      ) : (
        <div className={panelClass}>
          {resource.data?.map((member) => {
            const editable =
              manages &&
              member.userId !== user?.id &&
              member.role !== "OWNER" &&
              (user?.role === "OWNER" || member.role !== "ADMIN")
            return (
              <div
                key={member.id}
                className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] p-4 last:border-0"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-[var(--bg-3)] text-xs text-[var(--text-2)]">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-40 flex-1">
                  <p className="text-sm font-medium text-[var(--text-1)]">
                    {member.name}
                    {member.userId === user?.id && (
                      <span className="ml-2 text-xs text-[var(--text-4)]">
                        you
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-4)]">
                    {member.email}
                  </p>
                </div>
                {editable ? (
                  <>
                    <select
                      aria-label={`Role for ${member.name}`}
                      disabled={busy}
                      value={member.role}
                      className={`${inputClass} !w-auto font-mono text-xs`}
                      onChange={(event) =>
                        void update(member, event.target.value as Role)
                      }
                    >
                      {(user?.role === "OWNER"
                        ? ["ADMIN", "DEVELOPER", "VIEWER"]
                        : ["DEVELOPER", "VIEWER"]
                      ).map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                    <Button
                      danger
                      aria-label={`Remove ${member.name}`}
                      disabled={busy}
                      onClick={() => {
                        setError("")
                        setRemoving(member)
                      }}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </>
                ) : (
                  <span className="font-mono text-xs text-[var(--text-3)]">
                    {member.role}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
      {resource.error && (
        <Button onClick={() => void resource.reload()}>Retry</Button>
      )}
      <FormDialog
        open={!!removing}
        onOpenChange={(value) => {
          if (!busy && !value) setRemoving(null)
        }}
        title="Remove team member"
        description={`Remove ${removing?.name ?? "this member"} from the workspace and revoke their sessions.`}
      >
        <Notice message={error} />
        <Button danger disabled={busy} onClick={() => void remove()}>
          Confirm removal
        </Button>
      </FormDialog>
    </div>
  )
}

function SecurityTab() {
  const resource = useResource(useCallback(() => workspaceApi.security(), []))
  const role = useAuthStore((state) => state.user?.role)
  const [settings, setSettings] = useState<SecuritySettings | null>(null)
  const [allowlist, setAllowlist] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  useEffect(() => {
    if (resource.data) {
      setSettings(resource.data)
      setAllowlist(resource.data.ipAllowlist.join("\n"))
    }
  }, [resource.data])
  async function save(event: FormEvent) {
    event.preventDefault()
    if (!settings) return
    setBusy(true)
    setError("")
    setSuccess("")
    try {
      await workspaceApi.updateSecurity({
        samlSsoEnabled: settings.samlSsoEnabled,
        samlIdpMetadataUrl: settings.samlIdpMetadataUrl,
        mfaEnforced: settings.mfaEnforced,
        ipAllowlist: allowlist
          .split(/\n/)
          .map((value) => value.trim())
          .filter(Boolean),
        sessionTimeout: settings.sessionTimeout,
        auditLogEnabled: settings.auditLogEnabled,
      })
      setSuccess("Security settings saved.")
      await resource.reload()
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  if (resource.loading) return <Loading />
  if (!settings)
    return (
      <div className="space-y-3">
        <Notice message={resource.error} />
        <Button onClick={() => void resource.reload()}>Retry</Button>
      </div>
    )
  return (
    <div className="space-y-5">
      <Notice message={error || resource.error} />
      <Notice message={success} success />
      <form onSubmit={save} className={`${panelClass} space-y-5 p-5`}>
        <fieldset disabled={busy || role !== "OWNER"} className="space-y-5">
          <Field label="SAML SSO">
            <div className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label="Enable SAML SSO"
              checked={settings.samlSsoEnabled}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    samlSsoEnabled: event.target.checked,
                  })
                }
              />
              <span className="text-xs text-[var(--text-3)]">
                Requires an identity-provider integration; not yet configured.
              </span>
            </div>
          </Field>
          <Field label="Identity provider metadata URL">
            <input
              type="url"
              className={inputClass}
              value={settings.samlIdpMetadataUrl ?? ""}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  samlIdpMetadataUrl: event.target.value,
                })
              }
              placeholder="https://idp.example.com/metadata"
            />
          </Field>
          <Field label="Require MFA enrollment">
            <input
              type="checkbox"
              checked={settings.mfaEnforced}
              onChange={(event) =>
                setSettings({ ...settings, mfaEnforced: event.target.checked })
              }
            />
          </Field>
          <Field
            label="IP allowlist"
            hint="One CIDR per line. Leave empty for all IPs. The backend uses the trusted gateway peer IP."
          >
            <textarea
              className={`${inputClass} min-h-24 font-mono text-xs`}
              value={allowlist}
              onChange={(event) => setAllowlist(event.target.value)}
              placeholder="192.0.2.0/24"
            />
          </Field>
          <Field label="Session timeout">
            <select
              className={inputClass}
              value={settings.sessionTimeout}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  sessionTimeout: event.target
                    .value as SecuritySettings["sessionTimeout"],
                })
              }
            >
              {[
                ["H1", "1 hour"],
                ["H8", "8 hours"],
                ["H24", "24 hours"],
                ["D7", "7 days"],
              ].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Workspace audit logging">
            <input
              type="checkbox"
              checked={settings.auditLogEnabled}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  auditLogEnabled: event.target.checked,
                })
              }
            />
          </Field>
        </fieldset>
        <Button primary type="submit" disabled={busy || role !== "OWNER"}>
          {busy ? "Saving…" : "Save security settings"}
        </Button>
      </form>
      <Button
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setError("")
          try {
            const blob = await workspaceApi.auditExport()
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement("a")
            anchor.href = url
            anchor.download = "sherlock-workspace-audit.csv"
            anchor.click()
            setTimeout(() => URL.revokeObjectURL(url), 1000)
          } catch (failure) {
            setError(authErrorMessage(failure))
          } finally {
            setBusy(false)
          }
        }}
      >
        <Download size={14} />
        Export workspace audit (90 days)
      </Button>
      <p className="text-xs text-[var(--text-4)]">
        These workspace policies currently protect project-service APIs. Auth
        audit events are stored separately.
      </p>
    </div>
  )
}

function AccountTab() {
  const resource = useResource(
    useCallback(
      async () => ({
        user: await authApi.me(),
        sessions: await authApi.sessions(),
      }),
      [],
    ),
  )
  const [setup, setSetup] = useState<{
    secret: string
    otpAuthUrl: string
  } | null>(null)
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  async function action(operation: () => Promise<unknown>, message: string) {
    setBusy(true)
    setError("")
    setSuccess("")
    try {
      await operation()
      setSuccess(message)
      if (useAuthStore.getState().isAuthenticated) await resource.reload()
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  if (resource.loading) return <Loading />
  return (
    <div className="space-y-5">
      <Notice message={error || resource.error} />
      <Notice message={success} success />
      {resource.error && (
        <Button onClick={() => void resource.reload()}>Retry</Button>
      )}
      <div className={`${panelClass} space-y-4 p-5`}>
        <h3 className="text-sm font-semibold text-[var(--text-1)]">
          Your account
        </h3>
        <p className="text-sm text-[var(--text-3)]">
          {resource.data?.user.name} · {resource.data?.user.email}
        </p>
        <p className="font-mono text-xs text-[var(--text-4)]">
          {resource.data?.user.role} · MFA{" "}
          {resource.data?.user.mfaEnabled ? "enabled" : "disabled"}
        </p>
        {!resource.data?.user.mfaEnabled && !setup && (
          <Button
            disabled={busy}
            onClick={() =>
              void action(
                async () => setSetup(await authApi.enableMfa()),
                "Add the secret to your authenticator, then verify a code.",
              )
            }
          >
            Set up MFA
          </Button>
        )}
        {setup && (
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-3)]">
              Enter this secret in your authenticator app. Keep it private.
            </p>
            <code className="block break-all rounded-lg bg-[var(--bg)] p-3 text-xs text-[var(--text-1)]">
              {setup.secret}
            </code>
          </div>
        )}
        {(setup || resource.data?.user.mfaEnabled) && (
          <div className="space-y-3">
            <Field label="Authenticator code">
              <input
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                className={inputClass}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, ""))
                }
              />
            </Field>
            {setup ? (
              <Button
                disabled={busy || code.length !== 6}
                onClick={() =>
                  void action(async () => {
                    await authApi.verifyMfa(code)
                    setSetup(null)
                    setCode("")
                  }, "MFA enabled.")
                }
              >
                Verify and enable MFA
              </Button>
            ) : (
              <>
                <Field label="Password to disable MFA">
                  <input
                    type="password"
                    autoComplete="current-password"
                    className={inputClass}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </Field>
                <Button
                  danger
                  disabled={busy || code.length !== 6 || !password}
                  onClick={() =>
                    void action(async () => {
                      await authApi.disableMfa(password, code)
                      useAuthStore.getState().logout()
                      navigate("/login", { replace: true })
                    }, "MFA disabled. Sign in again.")
                  }
                >
                  Disable MFA and sign out
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      <div className={panelClass}>
        <h3 className="border-b border-[var(--border)] p-4 text-sm font-semibold text-[var(--text-1)]">
          Active sessions
        </h3>
        {resource.data?.sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-4 last:border-0"
          >
            <div>
              <p className="text-sm text-[var(--text-2)]">
                {session.deviceInfo || "Unknown device"}
                {session.current ? " · Current session" : ""}
              </p>
              <p className="mt-1 text-xs text-[var(--text-4)]">
                {session.ipAddress} ·{" "}
                {new Date(session.createdAt).toLocaleString()}
              </p>
            </div>
            <Button
              danger
              disabled={busy}
              onClick={() =>
                void action(async () => {
                  await authApi.revokeSession(session.id)
                  if (session.current) {
                    useAuthStore.getState().logout()
                    navigate("/login", { replace: true })
                  }
                }, "Session revoked.")
              }
            >
              Revoke
            </Button>
          </div>
        ))}
      </div>
      <Button
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setError("")
          try {
            await authApi.logout(useAuthStore.getState().refreshToken)
            useAuthStore.getState().logout()
            navigate("/login", { replace: true })
          } catch (failure) {
            setError(authErrorMessage(failure))
          } finally {
            setBusy(false)
          }
        }}
      >
        <LogOut size={14} />
        Sign out
      </Button>
    </div>
  )
}

const tabs = [
  { id: "general", label: "General", icon: Globe },
  { id: "apikeys", label: "API Keys", icon: KeyRound },
  { id: "team", label: "Team", icon: Users },
  { id: "security", label: "Security", icon: Shield },
  { id: "account", label: "Account", icon: UserRound },
  { id: "alerts", label: "Alerts", icon: Bell },
]

export default function Settings() {
  const [params, setParams] = useSearchParams()
  const tab = tabs.some((item) => item.id === params.get("tab"))
    ? params.get("tab")
    : "general"
  return (
    <div className="flex h-full min-h-[600px] flex-col text-[var(--text-1)]">
      <header className="border-b border-[var(--border)] px-6 py-5">
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-[var(--text-3)]">
          Manage your workspace, API keys, team, and security.
        </p>
      </header>
      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <nav
          aria-label="Settings sections"
          className="flex shrink-0 gap-1 overflow-auto border-b border-[var(--border)] p-3 sm:w-48 sm:flex-col sm:border-b-0 sm:border-r"
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setParams({ tab: item.id })}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-left text-sm ${
                item.id === tab
                  ? "border-[var(--border)] bg-[var(--bg-2)] font-medium text-[var(--text-1)]"
                  : "border-transparent text-[var(--text-3)] hover:bg-[var(--bg-2)]"
              }`}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="max-w-5xl">
            {tab === "general" && <GeneralTab />}
            {tab === "apikeys" && <KeysTab />}
            {tab === "team" && <TeamTab />}
            {tab === "security" && <SecurityTab />}
            {tab === "account" && <AccountTab />}
            {tab === "alerts" && (
              <div className={`${panelClass} p-6`}>
                <h2 className="text-sm font-semibold">Alert preferences</h2>
                <p className="mt-2 text-sm text-[var(--text-3)]">
                  Alert-rule persistence requires the alert-service, which is
                  not part of the three running services. No demo changes are
                  saved as real rules.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
