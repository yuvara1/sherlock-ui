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
  const [language, setLanguage] = useState("Java")
  const [selectedEnvironments, setSelectedEnvironments] =
    useState<Environment[]>(["production"])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleting, setDeleting] = useState<ProjectRecord | null>(null)
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
    setEditing(project ?? null)
    setName(project?.name ?? "")
    setDescription(project?.description ?? "")
    setLanguage(project?.language ?? "Java")
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
        language,
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
    <div className="mx-auto max-w-[1500px] space-y-6 p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-1)]">
            Projects
          </h1>
          <p className="mt-1 text-sm text-[var(--text-3)]">
            Manage monitored projects, environments, and ingestion credentials.
          </p>
        </div>
        <Button primary disabled={!writable || busy} onClick={() => begin()}>
          <Plus size={15} />
          New project
        </Button>
      </div>
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
                  {project.language && (
                    <span className="ml-auto font-mono text-xs text-[var(--text-4)]">
                      {project.language}
                    </span>
                  )}
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
        description="Choose the environments that will receive telemetry."
      >
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
            <Field label="Language">
              <select
                className={inputClass}
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                {["Go", "Java", "Node.js", "Python", "Scala"].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>
            <div>
              <p className="mb-2 text-sm text-[var(--text-2)]">Environments</p>
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
                            : current.filter((value) => value !== environment),
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
              {busy ? "Saving…" : editing ? "Save project" : "Create project"}
            </Button>
          </fieldset>
        </form>
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
        <Button danger disabled={busy} onClick={() => void remove()}>
          {busy ? "Deleting…" : "Permanently delete project"}
        </Button>
      </FormDialog>
    </div>
  )
}
