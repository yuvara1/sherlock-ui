import { useEffect, useRef, useState, type ReactNode } from "react"
import { useLocation, useNavigate } from "react-router"
import { RefreshCw, ShieldCheck, ExternalLink, Send, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SherlockSelect } from "@/components/ui/SherlockSelect"
import Textarea from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  integrationsApi,
  type Connection,
  type Provider,
  type RepositoryActivity,
  type ActivityItem,
} from "@/api/integrations"
import { apiErrorMessage } from "@/api/errorMessage"
import { UI_PREVIEW_ACCESS_TOKEN } from "@/api/client"

interface CatalogEntry {
  name: string
  desc: string
  category: string
  publisher: string
}
// StrictMode can replay the callback effect. Share only the in-flight request, never tokens.
const exchanges = new Map<string, Promise<{ connected: boolean }>>()

export default function IntegrationConsole({
  catalog,
  renderIcon,
}: {
  catalog: CatalogEntry[]
  renderIcon: (name: string) => ReactNode
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [callback] = useState(() => new URLSearchParams(location.search))
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [tab, setTab] = useState<"available" | "connected">("available")
  const [category, setCategory] = useState("All")
  const [open, setOpen] = useState<Provider | null>(null)
  const [remove, setRemove] = useState<Provider | null>(null)
  const [repositories, setRepositories] = useState<string[]>([])
  const [repository, setRepository] = useState("")
  const [activity, setActivity] = useState<RepositoryActivity | null>(null)
  const [message, setMessage] = useState("")
  const actionLock = useRef(false)
  const preview =
    localStorage.getItem("sherlock_access_token") === UI_PREVIEW_ACCESS_TOKEN
  const connected = connections.filter((item) => item.connected)
  const categories = ["All", ...new Set(catalog.map((item) => item.category))]

  async function reload() {
    const result = await integrationsApi.list()
    if (!Array.isArray(result)) throw new Error("Invalid integration response")
    setConnections(result)
  }
  useEffect(() => {
    let active = true
    async function initialize() {
      if (preview) {
        setLoading(false)
        return
      }
      try {
        const provider = callback.get("provider")
        const code = callback.get("code")
        const state = callback.get("state")
        if (callback.has("code") || callback.has("error")) {
          // Remove the authorization code from the address bar and browser history.
          navigate(location.pathname, { replace: true })
          if (callback.has("error"))
            throw new Error(
              "Authorization was declined. Connect again when ready.",
            )
          if (
            (provider !== "github" && provider !== "slack") ||
            !code ||
            !state
          )
            throw new Error(
              "The authorization callback is incomplete. Connect again.",
            )
          const key = `${provider}:${state}`
          let exchange = exchanges.get(key)
          if (!exchange) {
            exchange = integrationsApi.complete(provider, code, state)
            exchanges.set(key, exchange)
            // Keep the result briefly so a remount cannot reuse a one-time code.
            window.setTimeout(() => exchanges.delete(key), 60_000)
          }
          const confirmation = await exchange
          if (confirmation.connected !== true)
            throw new Error(
              "The provider connection was not confirmed. Connect again.",
            )
          if (active) setTab("connected")
          if (active)
            setNotice(
              `${
                provider === "github" ? "GitHub" : "Slack"
              } authorization confirmed.`,
            )
        }
        const result = await integrationsApi.list()
        if (!Array.isArray(result))
          throw new Error("The backend returned an invalid integration list.")
        if (active) setConnections(result)
      } catch (failure) {
        if (active)
          setError(
            failure instanceof Error && !("isAxiosError" in failure)
              ? failure.message
              : apiErrorMessage(failure, "Unable to load integrations."),
          )
      } finally {
        if (active) setLoading(false)
      }
    }
    void initialize()
    return () => {
      active = false
    }
    // The callback snapshot must be consumed only once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function run(action: () => Promise<void>) {
    if (actionLock.current) return
    actionLock.current = true
    setBusy(true)
    setError("")
    setNotice("")
    try {
      await action()
    } catch (failure) {
      setError(
        apiErrorMessage(
          failure,
          "The operation was not confirmed. Please try again.",
        ),
      )
    } finally {
      actionLock.current = false
      setBusy(false)
    }
  }
  async function connect(provider: Provider) {
    const { url } = await integrationsApi.authorize(provider)
    const target = new URL(url)
    if (
      target.protocol !== "https:" ||
      target.hostname !== (provider === "github" ? "github.com" : "slack.com")
    )
      throw new Error("Invalid provider authorization URL")
    window.location.assign(url)
  }
  async function manage(provider: Provider) {
    setOpen(provider)
    setActivity(null)
    setRepositories([])
    if (provider === "github") {
      setRepository(
        connections.find((item) => item.provider === "github")?.repository ??
          "",
      )
      await run(async () => {
        setRepositories(await integrationsApi.repositories())
      })
    }
  }
  const available = catalog.filter(
    (item) =>
      (category === "All" || category === item.category) &&
      !connected.some(
        (connection) =>
          (connection.provider === "github" ? "GitHub" : "Slack") === item.name,
      ),
  )
  const feedback = (
    <>
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-danger-border bg-danger-surface p-3 text-sm text-danger"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="rounded-lg border border-success-border bg-success-surface p-3 text-sm text-success"
        >
          {notice}
        </div>
      )}
    </>
  )
  return (
    <div className="app-page flex h-full flex-col overflow-hidden text-foreground">
      <div className="shrink-0 border-b border-border bg-background px-5 pt-4">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div
              role="heading"
              aria-level={1}
              className="page-title text-lg font-semibold"
            >
              Integrations
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Repository context and channel handoffs, connected to your
              workspace.
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={busy || loading || preview}
            onClick={() => void run(reload)}
          >
            <RefreshCw className="size-3.5" aria-hidden="true" /> Refresh status
          </Button>
        </div>
        <div className="flex gap-2 pb-2">
          <Button
            variant={tab === "available" ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={tab === "available"}
            onClick={() => setTab("available")}
          >
            Available
          </Button>
          <Button
            variant={tab === "connected" ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={tab === "connected"}
            onClick={() => setTab("connected")}
          >
            Connected ({connected.length})
          </Button>
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {!open && feedback}
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
          <ShieldCheck
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="text-xs leading-relaxed text-muted-foreground">
            {preview
              ? "Preview mode: no live connections are loaded. Sign in to a real workspace to authorize GitHub or Slack."
              : "GitHub and Slack use provider authorization. Credentials stay encrypted on the server. Only workspace owners and admins can connect, configure, send, or disconnect."}
            <div className="mt-1">
              GitHub activity is fetched on demand. Slack messages are sent
              manually; automatic alert delivery and webhook correlation are not
              enabled.
            </div>
          </div>
        </div>
        {loading ? (
          <div role="status" className="py-8 text-sm text-muted-foreground">
            Loading workspace connections…
          </div>
        ) : tab === "available" ? (
          <>
            <div className="mx-auto flex w-full max-w-5xl flex-wrap gap-2">
              {categories.map((item) => (
                <Button
                  key={item}
                  variant={category === item ? "secondary" : "outline"}
                  size="sm"
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
            <div className="mx-auto grid w-full max-w-5xl gap-3 md:grid-cols-2">
              {available.map((item) => {
                const provider =
                  item.name === "GitHub"
                    ? "github"
                    : item.name === "Slack"
                      ? "slack"
                      : null
                const status = connections.find(
                  (connection) => connection.provider === provider,
                )
                return (
                  <div
                    key={item.name}
                    className="flex items-start gap-3 rounded-xl border border-border bg-background p-4"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                      {renderIcon(item.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{item.name}</div>
                      <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {item.desc}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        by {item.publisher}
                        {!provider && <span> · Coming soon</span>}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="size-7 rounded-lg"
                      aria-label={`Connect ${item.name}`}
                      title={
                        !provider
                          ? `${item.name} — coming soon`
                          : preview
                            ? "Sign in to connect"
                            : !status
                              ? "Connection status unavailable"
                              : !status.configured
                                ? "Server setup required"
                                : `Connect ${item.name}`
                      }
                      disabled={
                        !provider || preview || !status?.configured || busy
                      }
                      onClick={() =>
                        provider && void run(() => connect(provider))
                      }
                    >
                      <Plus className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </>
        ) : connected.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <div className="text-sm font-medium">
              {error
                ? "Connection status unavailable"
                : "No verified connections"}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {error
                ? "Refresh status when the backend is reachable. Existing connections have not been changed."
                : "Authorize GitHub or Slack from Available to get started."}
            </div>
            <Button
              className="mt-4"
              variant="outline"
              size="sm"
              onClick={() => setTab("available")}
            >
              Browse integrations
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {connected.map((connection) => (
              <div
                key={connection.provider}
                className="flex flex-wrap items-center gap-4 border-b border-border p-4 last:border-b-0"
              >
                {renderIcon(
                  connection.provider === "github" ? "GitHub" : "Slack",
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">
                    {connection.provider === "github" ? "GitHub" : "Slack"}
                  </div>
                  <div className="mt-1 break-all text-xs text-muted-foreground">
                    {connection.account}
                    {connection.repository ? ` / ${connection.repository}` : ""}
                  </div>
                  <div className="mt-2 max-w-prose text-xs leading-relaxed text-muted-foreground">
                    {
                      catalog.find(
                        (item) =>
                          item.name ===
                          (connection.provider === "github"
                            ? "GitHub"
                            : "Slack"),
                      )?.desc
                    }
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Last provider confirmation:{" "}
                    {connection.verifiedAt ?? "Unavailable"}
                  </div>
                </div>
                <Badge variant="success">Authorized</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => void manage(connection.provider)}
                >
                  Configure
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => setRemove(connection.provider)}
                >
                  Disconnect
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Dialog
        open={open !== null}
        onOpenChange={(value) => !value && !busy && setOpen(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {open === "github"
                ? "GitHub repository context"
                : "Slack channel handoffs"}
            </DialogTitle>
            <DialogDescription>
              {open === "github"
                ? "Select a workspace repository and fetch current provider activity. This does not ingest or correlate telemetry."
                : `Messages go to ${connections.find((item) => item.provider === "slack")?.account ?? "your authorized channel"}. Reconnect to choose another channel.`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 space-y-4 overflow-y-auto p-5">
            {feedback}
            {open === "github" ? (
              <>
                <div className="text-xs text-muted-foreground">
                  Up to 1,000 accessible repositories, ordered by recent
                  activity.
                </div>
                <SherlockSelect
                  aria-label="GitHub repository"
                  value={repository}
                  onChange={(value) => {
                    setRepository(value)
                    setActivity(null)
                  }}
                  disabled={busy || !repositories.length}
                  options={repositories}
                  placeholder="Choose a repository"
                  minWidth="100%"
                />
                {!busy && !repositories.length && (
                  <div className="text-xs text-muted-foreground">
                    No repositories loaded. Check access permissions or
                    reconnect.
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={!repository || busy}
                    onClick={() =>
                      void run(async () => {
                        await integrationsApi.selectRepository(repository)
                        await reload()
                        setNotice(
                          "Repository access verified and selection saved.",
                        )
                      })
                    }
                  >
                    Save repository
                  </Button>
                  <Button
                    variant="outline"
                    disabled={
                      busy ||
                      !repository ||
                      repository !==
                        connections.find((item) => item.provider === "github")
                          ?.repository
                    }
                    onClick={() =>
                      void run(async () => {
                        setActivity(null)
                        setActivity(await integrationsApi.activity())
                        await reload()
                      })
                    }
                  >
                    <RefreshCw className="size-3.5" aria-hidden="true" /> Fetch
                    activity
                  </Button>
                </div>
                {activity && (
                  <div className="space-y-4">
                    {([
                      "commits",
                      "pullRequests",
                      "deployments",
                      "workflowRuns",
                    ] as const).map((key) => (
                      <div key={key}>
                        <div className="mb-2 text-sm font-medium">
                          {
                            {
                              commits: "Commits",
                              pullRequests: "Pull requests",
                              deployments: "Deployments",
                              workflowRuns: "Workflow runs",
                            }[key]
                          }
                        </div>
                        {!activity[key].length && (
                          <div className="text-xs text-muted-foreground">
                            No recent activity returned by GitHub.
                          </div>
                        )}
                        {activity[key].map((item, index) => (
                          <div
                            key={item.id ?? item.sha ?? index}
                            className="flex items-center gap-2 border-b border-border py-2 text-xs"
                          >
                            <div className="min-w-0 flex-1 truncate">
                              {activityLabel(item)}
                            </div>
                            {(item.conclusion || item.status) && (
                              <Badge variant="outline">
                                {item.conclusion ?? item.status}
                              </Badge>
                            )}
                            {safeGithubUrl(item.html_url) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label="Open activity on GitHub"
                                onClick={() =>
                                  window.open(
                                    item.html_url,
                                    "_blank",
                                    "noopener,noreferrer",
                                  )
                                }
                              >
                                <ExternalLink
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      const result = await integrationsApi.send(
                        "Sherlock connection test: this channel can receive workspace handoffs.",
                      )
                      if (!result.delivered)
                        throw new Error("Delivery not confirmed")
                      await reload()
                      setNotice("Slack confirmed delivery of the test message.")
                    })
                  }
                >
                  Send test message
                </Button>
                <div id="slack-message-label" className="text-sm font-medium">
                  Investigation handoff
                </div>
                <Textarea
                  aria-labelledby="slack-message-label"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={4000}
                  disabled={busy}
                  placeholder="Paste a reviewed investigation brief. Do not include secrets or private customer data."
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    {message.length}/4,000 characters
                  </div>
                  <Button
                    disabled={busy || !message.trim()}
                    onClick={() =>
                      void run(async () => {
                        const result = await integrationsApi.send(
                          message.trim(),
                        )
                        if (!result.delivered)
                          throw new Error("Delivery not confirmed")
                        setMessage("")
                        await reload()
                        setNotice("Slack confirmed delivery of your handoff.")
                      })
                    }
                  >
                    <Send className="size-3.5" aria-hidden="true" /> Send
                    handoff
                  </Button>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setOpen(null)}
            >
              Close
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => open && void run(() => connect(open))}
            >
              Reconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={remove !== null}
        onOpenChange={(value) => !value && !busy && setRemove(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Disconnect {remove === "github" ? "GitHub" : "Slack"}?
            </DialogTitle>
            <DialogDescription>
              This removes the stored workspace credentials and stops Sherlock
              access. It does not revoke the provider grant; revoke it
              separately in the provider settings if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setRemove(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() =>
                remove &&
                void run(async () => {
                  await integrationsApi.disconnect(remove)
                  await reload()
                  setRemove(null)
                  setNotice("Workspace connection removed.")
                })
              }
            >
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function activityLabel(item: ActivityItem) {
  return (
    item.title ??
    item.commit?.message?.split("\n")[0] ??
    item.name ??
    `${item.environment ?? "Deployment"}: ${item.ref ?? item.sha ?? item.id}`
  )
}
function safeGithubUrl(value?: string) {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.hostname === "github.com"
  } catch {
    return false
  }
}
