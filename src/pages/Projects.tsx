import PageHeading from "@/components/workspace/PageHeading"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react"
import {
  Archive,
  ArrowUpRight,
  Check,
  FolderGit2,
  KeyRound,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { projectsApi, projectForSelector } from "@/api/projects"
import { authErrorMessage } from "@/api/auth"
import type { ProjectRecord } from "@/api/workspace"
import type { Environment } from "@/types"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import ApiKeysPanel from "@/components/workspace/ApiKeysPanel"
import { Button as UiButton } from "@/components/ui/button"
import HoldButton from "@/components/ui/HoldButton"
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

const environments: Environment[] = ["development", "staging", "production"]
const environmentDescriptions: Record<Environment, string> = {
  development: "Local and shared development workloads",
  staging: "Pre-production validation and release checks",
  production: "Customer-facing traffic and production signals",
}
export default function Projects() {
  const resource = useResource(useCallback(() => projectsApi.list(), []))
  const { user } = useAuthStore()
  const setProjects = useAppStore((state) => state.setProjects)
  const setActiveProject = useAppStore((state) => state.setActiveProject)
  const [tab, setTab] = useState("projects")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")
  const [sort, setSort] = useState("newest")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ProjectRecord | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedEnvironments, setSelectedEnvironments] =
    useState<Environment[]>(["production"])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleting, setDeleting] = useState<ProjectRecord | null>(null)
  const [dialogCenter, setDialogCenter] = useState<{
    x: number
    y: number
  }>()
  const writable = user?.role !== "VIEWER"
  const manages = user?.role === "OWNER" || user?.role === "ADMIN"
  useEffect(() => {
    if (resource.data)
      setProjects(
        resource.data
          .filter((project) => project.status === "ACTIVE")
          .map(projectForSelector),
      )
  }, [resource.data, setProjects])
  useEffect(() => {
    if (!open) return
    const main = document.getElementById("main-content")
    if (!main) return
    const updateCenter = () => {
      const bounds = main.getBoundingClientRect()
      setDialogCenter({
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      })
    }
    updateCenter()
    const observer = new ResizeObserver(updateCenter)
    observer.observe(main)
    window.addEventListener("resize", updateCenter)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateCenter)
    }
  }, [open])
  const filtered = useMemo(
    () =>
      (resource.data ?? [])
        .filter(
          (project) =>
            (filter === "ALL" || project.status === filter) &&
            `${project.name} ${project.description ?? ""} ${project.slug}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .sort((first, second) =>
          sort === "name"
            ? first.name.localeCompare(second.name)
            : second.createdAt.localeCompare(first.createdAt),
        ),
    [resource.data, search, filter, sort],
  )

  function begin(project?: ProjectRecord) {
    const main = document.getElementById("main-content")
    if (main) {
      const bounds = main.getBoundingClientRect()
      setDialogCenter({
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      })
    }
    setEditing(project ?? null)
    setName(project?.name ?? "")
    setDescription(project?.description ?? "")
    setSelectedEnvironments(project?.environments ?? ["production"])
    setError("")
    setOpen(true)
  }
  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    setSuccess("")
    try {
      const body = {
        name: name.trim(),
        description: description.trim(),
        environments: selectedEnvironments,
      }
      if (editing) await projectsApi.update(editing.id, body)
      else await projectsApi.create(body)
      setOpen(false)
      setSuccess(
        editing
          ? "Project updated."
          : "Project created. Generate an API key to start sending telemetry.",
      )
      await resource.reload()
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  async function archive(project: ProjectRecord) {
    setBusy(true)
    setError("")
    try {
      await projectsApi.update(project.id, {
        status: project.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE",
      })
      await resource.reload()
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  async function remove() {
    if (!deleting) return
    setBusy(true)
    setError("")
    try {
      await projectsApi.delete(deleting.id)
      setDeleting(null)
      setSuccess("Project and its API keys deleted.")
      await resource.reload()
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-page page-header-region mx-auto max-w-[1600px] space-y-4 p-4 sm:p-5">
      <PageHeading
        className="page-heading-row flex flex-wrap items-center justify-between gap-4"
        actions={
          <>
            <Button
              primary
              disabled={!writable || busy}
              onClick={() => begin()}
            >
              <Plus size={15} />
              New project
            </Button>
          </>
        }
      >
        <div>
          <h1 className="page-title text-lg font-semibold text-[var(--text-1)]">
            Projects
          </h1>
          <p className="mt-1 text-sm text-[var(--text-3)]">
            Monitor monoliths, services, functions, and distributed systems.
          </p>
        </div>
      </PageHeading>
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Total projects", resource.data?.length ?? "—", FolderGit2],
          [
            "Active",
            resource.data?.filter((project) => project.status === "ACTIVE")
              .length ?? "—",
            ArrowUpRight,
          ],
          [
            "Archived",
            resource.data?.filter((project) => project.status === "ARCHIVED")
              .length ?? "—",
            Archive,
          ],
        ].map(([label, count, Icon]) => {
          const MetricIcon = Icon as typeof FolderGit2
          return (
            <div key={String(label)} className={`${panelClass} px-4 py-4`}>
              <div className="flex items-center gap-2 text-xs text-[var(--text-3)]">
                <MetricIcon size={13} />
                {String(label)}
              </div>
              <div className="mt-3 font-mono text-2xl text-[var(--text-1)]">
                {String(count)}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-5 border-b border-[var(--border)]">
        {[
          ["projects", "Projects"],
          ["apikeys", "API Keys"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`border-b-2 px-1 pb-3 text-sm ${
              tab === value
                ? "border-[var(--accent)] text-[var(--text-1)]"
                : "border-transparent text-[var(--text-3)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <Notice message={error || resource.error} />
      <Notice message={success} success />
      {resource.error && (
        <Button onClick={() => void resource.reload()}>Retry</Button>
      )}
      {resource.loading ? (
        <Loading />
      ) : tab === "apikeys" ? (
        <ApiKeysPanel projects={resource.data ?? []} />
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <label className="relative min-w-48 flex-1">
              <Search
                size={14}
                className="absolute left-3 top-3 text-[var(--text-4)]"
              />
              <input
                aria-label="Search projects"
                className={`${inputClass} pl-9`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects…"
              />
            </label>
            <select
              aria-label="Project status"
              className={`${inputClass} !w-auto`}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="ALL">All projects</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <select
              aria-label="Sort projects"
              className={`${inputClass} !w-auto`}
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((project) => (
              <article
                key={project.id}
                className={`${panelClass} flex flex-col p-5`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-3)] text-[var(--accent)]">
                      <FolderGit2 size={17} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-[var(--text-1)]">
                        {project.name}
                      </h2>
                      <p className="mt-1 font-mono text-xs text-[var(--text-4)]">
                        {project.slug}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-md px-2 py-1 font-mono text-[10px] ${
                      project.status === "ACTIVE"
                        ? "bg-[var(--green-bg)] text-[var(--green)]"
                        : "bg-[var(--bg-3)] text-[var(--text-4)]"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="mb-5 mt-4 min-h-10 text-sm leading-relaxed text-[var(--text-3)]">
                  {project.description || "No description yet."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.environments.map((environment) => (
                    <span
                      key={environment}
                      className="rounded-md border border-[var(--border)] px-2 py-1 font-mono text-[10px] text-[var(--text-3)]"
                    >
                      {environment}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
                  <Button
                    disabled={project.status !== "ACTIVE"}
                    onClick={() => {
                      setActiveProject(project.id)
                      setTab("apikeys")
                    }}
                  >
                    <KeyRound size={13} />
                    API keys
                  </Button>
                  {writable && (
                    <>
                      <Button
                        aria-label={`Edit ${project.name}`}
                        disabled={busy}
                        onClick={() => begin(project)}
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        disabled={busy}
                        onClick={() => void archive(project)}
                      >
                        <Archive size={13} />
                        {project.status === "ACTIVE" ? "Archive" : "Restore"}
                      </Button>
                    </>
                  )}
                  {manages && (
                    <Button
                      aria-label={`Delete ${project.name}`}
                      danger
                      disabled={busy}
                      onClick={() => {
                        setError("")
                        setDeleting(project)
                      }}
                    >
                      <Trash2 size={13} />
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
          {!filtered.length && (
            <div className={`${panelClass} p-12 text-center`}>
              <FolderGit2
                className="mx-auto mb-3 text-[var(--text-4)]"
                size={26}
              />
              <p className="text-sm text-[var(--text-2)]">
                {resource.data?.length
                  ? "No projects match these filters."
                  : "Create your first project."}
              </p>
              <p className="mt-2 text-xs text-[var(--text-4)]">
                Project health and telemetry become available when their
                services are connected.
              </p>
            </div>
          )}
        </>
      )}
      <FormDialog
        open={open}
        onOpenChange={(value) => {
          if (!busy) setOpen(value)
        }}
        title={editing ? "Edit project" : "New project"}
        description={
          editing
            ? "Choose the environments that will receive telemetry."
            : "Create an observability boundary for an application, service group, or distributed system."
        }
        contentClassName={
          editing
            ? "animate-none data-[state=closed]:animate-none"
            : "w-[min(600px,calc(100vw-32px))] rounded-lg animate-none data-[state=closed]:animate-none"
        }
        contentStyle={
          dialogCenter
            ? { left: dialogCenter.x, top: dialogCenter.y }
            : undefined
        }
      >
        {editing ? (
          <form onSubmit={save} className="space-y-4">
            <fieldset disabled={busy} className="space-y-4">
              <Field label="Project name">
                <input
                  required
                  maxLength={100}
                  className={inputClass}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Payments API"
                />
              </Field>
              <Field label="Description">
                <textarea
                  maxLength={2000}
                  className={inputClass}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </Field>
              <div>
                <p className="mb-2 text-sm text-[var(--text-2)]">
                  Environments
                </p>
                <div className="flex flex-wrap gap-3">
                  {environments.map((environment) => (
                    <label
                      key={environment}
                      className="flex items-center gap-2 text-xs text-[var(--text-3)]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEnvironments.includes(environment)}
                        onChange={(event) =>
                          setSelectedEnvironments((current) =>
                            event.target.checked
                              ? [...current, environment]
                              : current.filter(
                                  (value) => value !== environment,
                                ),
                          )
                        }
                      />
                      {environment}
                    </label>
                  ))}
                </div>
              </div>
              <Notice message={error} />
              <Button
                type="submit"
                primary
                disabled={busy || !selectedEnvironments.length}
              >
                {busy ? "Saving…" : "Save project"}
              </Button>
            </fieldset>
          </form>
        ) : (
          <form onSubmit={save} className="px-5 pb-5 pt-5">
            <fieldset disabled={busy} className="space-y-5">
              <div>
                <Field
                  label="Project name"
                  hint="Use a stable name for the application or system boundary."
                >
                  <input
                    required
                    autoFocus
                    maxLength={100}
                    className={inputClass}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Payments API"
                  />
                </Field>
              </div>
              <Field
                label="Description"
                hint="Optional context shown to engineers investigating this project."
              >
                <textarea
                  maxLength={2000}
                  rows={3}
                  className={`${inputClass} resize-y`}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Payment application, modules, functions, and external dependencies"
                />
              </Field>
              <div>
                <div className="mb-2">
                  <p className="text-sm font-medium text-[var(--text-2)]">
                    Environments
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-4)]">
                    Select at least one. Production is enabled by default.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {environments.map((environment) => (
                    <UiButton
                      type="button"
                      variant="outline"
                      key={environment}
                      aria-pressed={selectedEnvironments.includes(environment)}
                      onClick={() =>
                        setSelectedEnvironments((current) =>
                          current.includes(environment)
                            ? current.filter((value) => value !== environment)
                            : [...current, environment],
                        )
                      }
                      className={`h-auto min-w-0 justify-start whitespace-normal rounded-lg p-3 text-left ${
                        selectedEnvironments.includes(environment)
                          ? "border-info-border bg-info-surface hover:bg-info-surface"
                          : "bg-background"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${
                          selectedEnvironments.includes(environment)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background"
                        }`}
                      >
                        {selectedEnvironments.includes(environment) && (
                          <Check size={11} strokeWidth={2.5} />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-medium capitalize text-[var(--text-1)]">
                          {environment}
                        </span>
                        <span className="mt-1 block text-[11px] leading-snug text-[var(--text-4)]">
                          {environmentDescriptions[environment]}
                        </span>
                      </span>
                    </UiButton>
                  ))}
                </div>
              </div>
              <Notice message={error} />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                <p className="max-w-xs text-xs leading-relaxed text-[var(--text-4)]">
                  Telemetry remains inactive until an API key is generated and a
                  workload is connected.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    disabled={busy}
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    primary
                    disabled={
                      busy || !name.trim() || !selectedEnvironments.length
                    }
                  >
                    {busy ? "Creating…" : "Create project"}
                  </Button>
                </div>
              </div>
            </fieldset>
          </form>
        )}
      </FormDialog>
      <FormDialog
        open={!!deleting}
        onOpenChange={(value) => {
          if (!busy && !value) setDeleting(null)
        }}
        title="Delete project"
        description={`Permanently delete ${deleting?.name ?? "this project"} and revoke all its API keys. This cannot be undone.`}
      >
        <Notice message={error} />
        <HoldButton
          icon={<Trash2 size={14} />}
          doneLabel="Deleting…"
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
          onHold={() => void remove()}
        >
          Hold to permanently delete
        </HoldButton>
      </FormDialog>
    </div>
  )
}
