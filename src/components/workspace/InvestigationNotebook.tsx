import { useState } from "react"
import {
  Download,
  NotebookPen,
  Save,
  ScanSearch,
  FlaskConical,
  ArrowRight,
  LockKeyhole,
  FileText,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useAppStore } from "@/stores/appStore"
import { useAuthStore } from "@/stores/authStore"

interface Notes {
  evidence: string
  hypothesis: string
  nextAction: string
}
const EMPTY: Notes = { evidence: "", hypothesis: "", nextAction: "" }
const FIELDS = [
  [
    "evidence",
    "Observed evidence",
    "Record signal IDs, timestamps, and source links. Demo signals are not production evidence.",
  ],
  [
    "hypothesis",
    "Unverified hypotheses",
    "Keep suspected causes separate from observed evidence.",
  ],
  [
    "nextAction",
    "Next action",
    "Record the next validation step and response owner.",
  ],
] as const

interface Props {
  page: string
  scope: string
  tasks: readonly string[]
  segments: readonly { label: string count: number }[]
}

export default function InvestigationNotebook({
  page,
  scope,
  tasks,
  segments,
}: Props) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState<Notes>(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(`${scope}-notes`) ?? "null",
      )
      return Object.fromEntries(
        Object.keys(EMPTY).map((key) => [
          key,
          typeof stored?.[key] === "string" ? stored[key].slice(0, 8000) : "",
        ]),
      ) as unknown as Notes
    } catch {
      return EMPTY
    }
  })
  const [feedback, setFeedback] = useState("")
  const [dirty, setDirty] = useState(false)
  const projectId = useAppStore((state) => state.activeProjectId)
  const projectName = useAppStore(
    (state) =>
      state.projects.find((project) => project.id === projectId)?.name ??
      "No project selected",
  )
  const environment = useAppStore((state) => state.activeEnvironment)
  const timeRange = useAppStore((state) => state.timeRange)
  const [exported, setExported] = useState(false)

  function save() {
    try {
      localStorage.setItem(`${scope}-notes`, JSON.stringify(notes))
      setDirty(false)
      setFeedback("Notes saved in this browser.")
    } catch {
      setFeedback(
        "Browser storage unavailable. Notes remain in this session; download a brief to keep them.",
      )
    }
  }

  function download() {
    let completed: string[] = []
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem(`${scope}-checklist`) ?? "[]",
      )
      if (Array.isArray(stored))
        completed = stored.filter(
          (item): item is string => typeof item === "string",
        )
    } catch {
      /* An unavailable checklist must not prevent exporting notes. */
    }
    const brief = [
      `# Sherlock investigation: ${page}`,
      `Project: ${projectName}`,
      `Environment: ${environment} | Selected range: ${timeRange}`,
      `Exported: ${new Date().toISOString()}`,
      "",
      "> Demo signal summary. Not verified production behavior. Notes are user-authored and browser-local.",
      "",
      "## Signal summary",
      ...segments.map((segment) => `- ${segment.label}: ${segment.count}`),
      ...FIELDS.flatMap(([key, label]) => [
        "",
        `## ${label}`,
        notes[key] || "Not recorded.",
      ]),
      "",
      "## Handoff checklist",
      ...tasks.map(
        (task) => `- [${completed.includes(task) ? "x" : " "}] ${task}`,
      ),
    ].join("\n")
    const url = URL.createObjectURL(
      new Blob([brief], { type: "text/markdown;charset=utf-8" }),
    )
    const link = document.createElement("a")
    link.href = url
    link.download = `sherlock-${page}-handoff.md`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setExported(true)
    setFeedback("Brief downloaded with current notes, including unsaved edits.")
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <NotebookPen size={13} aria-hidden="true" /> Notes & brief
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex w-11/12 max-w-3xl flex-col overflow-hidden">
          <DialogHeader className="gap-2 border-b border-border px-5 pb-4 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                <NotebookPen size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <DialogTitle>Notes & brief</DialogTitle>
                <DialogDescription>
                  Capture evidence. Test a hypothesis. Leave a clear handoff.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid min-h-0 overflow-y-auto md:grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)]">
            <aside
              className="space-y-5 border-b border-border bg-muted/30 p-5 md:border-b-0 md:border-r"
              aria-label="Investigation context"
            >
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Investigation context
                </div>
                <div className="break-words text-sm font-semibold">
                  {projectName}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{environment}</Badge>
                  <Badge variant="ghost">{timeRange}</Badge>
                </div>
                <div className="text-xs capitalize text-muted-foreground">
                  {page}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">Signal snapshot</span>
                  <Badge variant="warning">Demo</Badge>
                </div>
                <div className="divide-y divide-border">
                  {segments.map((segment) => (
                    <div
                      key={segment.label}
                      className="flex items-center justify-between gap-2 py-2 text-xs"
                    >
                      <span className="text-muted-foreground">
                        {segment.label}
                      </span>
                      <span className="font-mono tabular-nums">
                        {segment.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-xs leading-relaxed text-muted-foreground">
                  Demo signals are not verified production behavior.
                </div>
              </div>
              <div className="flex items-start gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                <LockKeyhole
                  size={14}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Browser-local notes. Not shared with your team. Avoid secrets
                  and personal data.
                </span>
              </div>
            </aside>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium">Investigation notes</div>
                <Badge variant={dirty ? "warning" : "ghost"}>
                  {dirty ? "Unsaved edits" : "Browser-local"}
                </Badge>
              </div>
              {FIELDS.map(([key, label, hint]) => (
                <NoteField
                  key={key}
                  id={`investigation-${key}`}
                  label={label}
                  hint={hint}
                  kind={key}
                  value={notes[key]}
                  onChange={(value) => {
                    setNotes((current) => ({ ...current, [key]: value }))
                    setDirty(true)
                    setFeedback("")
                    setExported(false)
                  }}
                />
              ))}
              <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                <FileText
                  size={14}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Your Markdown brief includes these notes, the signal snapshot,
                  and handoff checklist progress.
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-background px-5 py-3">
            <div
              role="status"
              className="flex-1 text-xs leading-relaxed text-muted-foreground"
            >
              {feedback ||
                (dirty
                  ? "Save to keep edits after reload."
                  : "Notes stay in this browser.")}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={download}>
                <Download size={14} aria-hidden="true" />{" "}
                {exported ? "Download again" : "Download brief"}
              </Button>
              <Button size="sm" onClick={save}>
                {feedback === "Notes saved in this browser." && !dirty ? (
                  <Check size={14} aria-hidden="true" />
                ) : (
                  <Save size={14} aria-hidden="true" />
                )}{" "}
                Save notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Small token-based form primitive: the existing kit has no multiline input.
function NoteField({
  id,
  label,
  hint,
  kind,
  value,
  onChange,
}: {
  id: string
  label: string
  hint: string
  kind: keyof Notes
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-xs font-medium"
      >
        {kind === "evidence" ? (
          <ScanSearch size={14} className="text-primary" aria-hidden="true" />
        ) : kind === "hypothesis" ? (
          <FlaskConical size={14} className="text-warning" aria-hidden="true" />
        ) : (
          <ArrowRight
            size={14}
            className="text-muted-foreground"
            aria-hidden="true"
          />
        )}
        {label}
        {kind === "hypothesis" && (
          <span className="ml-auto text-xs font-normal text-warning">
            Requires validation
          </span>
        )}
      </label>
      <textarea
        id={id}
        value={value}
        maxLength={8000}
        rows={3}
        placeholder={
          kind === "evidence"
            ? "e.g. Trace abc123 shows a timeout in the database span…"
            : kind === "hypothesis"
              ? "e.g. Connection pool saturation may explain the timeouts…"
              : "e.g. Check pool utilization before considering a rollback. Owner: …"
        }
        aria-describedby={`${id}-hint`}
        onChange={(event) => onChange(event.target.value)}
        className="block min-h-20 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div id={`${id}-hint`} className="text-xs text-muted-foreground">
        {hint}
      </div>
    </div>
  )
}

export function useInvestigationScope(page: string) {
  const userId = useAuthStore((state) => state.user?.id ?? "anonymous")
  const projectId = useAppStore(
    (state) => state.activeProjectId || "no-project",
  )
  const environment = useAppStore((state) => state.activeEnvironment)
  return `sherlock-investigation-v1-${JSON.stringify([userId, projectId, environment, page])}`
}
