import { useCallback, useState, type FormEvent } from "react"
import { Copy, KeyRound, Plus, Trash2 } from "lucide-react"
import { SherlockGrid } from "@/components/ui/SherlockGrid"
import HoldButton from "@/components/ui/HoldButton"
import {
  workspaceApi,
  type CreatedKey,
  type ProjectRecord,
} from "@/api/workspace"
import { authErrorMessage } from "@/api/auth"
import { useAuthStore } from "@/stores/authStore"
import type { Environment } from "@/types"
import {
  Button,
  Field,
  FormDialog,
  inputClass,
  Loading,
  Notice,
  panelClass,
  useResource,
} from "./Controls"

export default function ApiKeysPanel({
  projects,
}: {
  projects: ProjectRecord[]
}) {
  const { user } = useAuthStore()
  const writable = user?.role !== "VIEWER"
  const loader = useCallback(() => workspaceApi.keys(), [])
  const resource = useResource(loader)
  const [open, setOpen] = useState(false)
  const [projectId, setProjectId] = useState("")
  const [name, setName] = useState("")
  const [environment, setEnvironment] = useState<Environment>("production")
  const [expiry, setExpiry] = useState("30")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [created, setCreated] = useState<CreatedKey | null>(null)
  const [revoke, setRevoke] = useState<{
    projectId: string
    id: string
    name: string
  } | null>(null)
  const selected = projects.find((project) => project.id === projectId)
  const active = projects.filter((project) => project.status === "ACTIVE")

  function begin() {
    const project = active[0]
    setProjectId(project?.id ?? "")
    setEnvironment(project?.environments[0] ?? "production")
    setName("")
    setError("")
    setOpen(true)
  }
  async function generate(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    setSuccess("")
    try {
      const result = await workspaceApi.createKey(projectId, {
        name: name.trim(),
        environment,
        ...(expiry === "never"
          ? {}
          : {
              expiresAt: new Date(
                Date.now() + Number(expiry) * 86400000,
              ).toISOString(),
            }),
      })
      setCreated(result)
      setOpen(false)
      await resource.reload()
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  async function revokeKey() {
    if (!revoke) return
    setBusy(true)
    setError("")
    try {
      await workspaceApi.revokeKey(revoke.projectId, revoke.id)
      setRevoke(null)
      setSuccess("API key revoked. SDK requests using it will be rejected.")
      await resource.reload()
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-1)]">
            Workspace API keys
          </h2>
          <p className="mt-1 text-xs text-[var(--text-3)]">
            Project-scoped credentials for telemetry ingestion.
          </p>
        </div>
        <Button
          primary
          disabled={!writable || !active.length || busy || !!created}
          onClick={begin}
        >
          <Plus size={14} />
          Generate API key
        </Button>
      </div>
      <Notice message={error || resource.error} />
      <Notice message={success} success />
      {resource.error && (
        <Button onClick={() => void resource.reload()}>Retry</Button>
      )}
      {resource.loading ? (
        <Loading />
      ) : (
        <div className={`${panelClass} overflow-hidden`}>
          <SherlockGrid
            rowData={(resource.data ?? []).map((key) => ({
              ...key,
              projectName:
                projects.find((project) => project.id === key.projectId)?.name ??
                key.projectId,
              lastUsed: key.lastUsedAt
                ? new Date(key.lastUsedAt).toLocaleString()
                : "Never",
              displayStatus:
                key.status === "ACTIVE" &&
                key.expiresAt &&
                new Date(key.expiresAt).getTime() <= Date.now()
                  ? "EXPIRED"
                  : key.status,
            }))}
            getRowId={({ data }) => data.id}
            domLayout="autoHeight"
            showPagination={false}
            columnDefs={[
              {
                field: "name",
                headerName: "Name / project",
                minWidth: 190,
                flex: 1,
                cellRenderer: ({ data }) => (
                  <div className="flex h-full flex-col justify-center">
                    <span className="font-medium">{data.name}</span>
                    <span className="text-xs text-[var(--text-4)]">
                      {data.projectName}
                    </span>
                  </div>
                ),
              },
              {
                field: "prefix",
                headerName: "Key prefix",
                minWidth: 150,
                cellClass: "font-mono text-xs",
                valueFormatter: ({ value }) => `${value}••••••••`,
              },
              {
                field: "environment",
                headerName: "Environment",
                minWidth: 130,
                cellClass: "font-mono text-xs",
              },
              { field: "lastUsed", headerName: "Last used", minWidth: 180 },
              { field: "displayStatus", headerName: "Status", minWidth: 110 },
              {
                headerName: "Actions",
                width: 90,
                sortable: false,
                filter: false,
                cellRenderer: ({ data }) =>
                  data.status === "ACTIVE" && writable ? (
                    <Button
                      aria-label={`Revoke ${data.name}`}
                      danger
                      disabled={busy}
                      onClick={() => {
                        setError("")
                        setRevoke(data)
                      }}
                    >
                      <Trash2 size={13} />
                    </Button>
                  ) : null,
              },
            ]}
            overlayNoRowsTemplate="No API keys yet. Create a project, then generate a key."
          />
        </div>
      )}
      <p className="text-xs text-[var(--text-4)]">
        Keys are shown once at creation. Existing keys cannot be revealed or
        copied.
      </p>
      <FormDialog
        open={open}
        onOpenChange={(value) => {
          if (!busy) setOpen(value)
        }}
        title="Generate API key"
        description="Save this credential securely. It will not be displayed again."
      >
        <form onSubmit={generate} className="space-y-4">
          <fieldset disabled={busy} className="space-y-4">
            <Field label="Project">
              <select
                required
                className={inputClass}
                value={projectId}
                onChange={(event) => {
                  const project = active.find(
                    (item) => item.id === event.target.value,
                  )
                  setProjectId(event.target.value)
                  setEnvironment(project?.environments[0] ?? "production")
                }}
              >
                {active.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Key name">
              <input
                required
                maxLength={100}
                className={inputClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Production telemetry"
              />
            </Field>
            <Field label="Environment">
              <select
                className={inputClass}
                value={environment}
                onChange={(event) =>
                  setEnvironment(event.target.value as Environment)
                }
              >
                {selected?.environments.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>
            <Field label="Expiration">
              <select
                className={inputClass}
                value={expiry}
                onChange={(event) => setExpiry(event.target.value)}
              >
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="never">Never</option>
              </select>
            </Field>
            <Notice message={error} />
            <Button primary type="submit" disabled={busy}>
              {busy ? "Generating…" : "Generate key"}
            </Button>
          </fieldset>
        </form>
      </FormDialog>
      <FormDialog
        open={!!created}
        onOpenChange={(value) => {
          if (!value) {
            setCreated(null)
            setError("")
          }
        }}
        title="Save your API key"
        description="This is the only time the full key is available. Store it in your secret manager."
      >
        <div className="space-y-4">
          <div
            className="break-all rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 font-mono text-xs"
            data-testid="created-api-key"
          >
            {created?.plaintext}
          </div>
          <Notice message={error} />
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(created?.plaintext ?? "")
                  setSuccess("API key copied to clipboard.")
                } catch {
                  setError(
                    "Clipboard unavailable. Select and copy the key before closing.",
                  )
                }
              }}
            >
              <Copy size={14} />
              Copy key
            </Button>
            <Button primary onClick={() => setCreated(null)}>
              I have saved this key
            </Button>
          </div>
        </div>
      </FormDialog>
      <FormDialog
        open={!!revoke}
        onOpenChange={(value) => {
          if (!busy && !value) setRevoke(null)
        }}
        title="Revoke API key"
        description={`SDK requests using ${revoke?.name ?? "this key"} will stop working immediately.`}
      >
        <Notice message={error} />
        <HoldButton
          icon={<Trash2 size={14} />}
          doneLabel="Revoking…"
          backgroundColor="var(--red-bg)"
          fillColor="var(--red-muted)"
          textColor="var(--red)"
          fillTextColor="var(--primary-foreground)"
          size="sm"
          radius={6}
          holdTime={1500}
          releaseTime={180}
          resetAfter={0}
          disabled={busy}
          className="w-full"
          onHold={() => void revokeKey()}
        >
          Hold to revoke API key
        </HoldButton>
      </FormDialog>
    </div>
  )
}
