import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Brain,
  Check,
  Clock3,
  Download,
  FileText,
  GitBranch,
  GitCommit,
  History,
  Network,
  Paperclip,
  Plus,
  RefreshCw,
  Save,
  ScrollText,
  Search,
  ThumbsDown,
  ThumbsUp,
  Users,
  XCircle,
} from "lucide-react"
import { aiApi } from "@/api/ai"
import { apiErrorMessage } from "@/api/errorMessage"
import { UI_PREVIEW_ACCESS_TOKEN } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BoltStyleChat } from "@/components/ui/bolt-style-chat"
import PromptBar, { type PromptBarSendDetail } from "@/components/ui/PromptBar"
import LatticeLoader from "@/components/ui/LatticeLoader"
import ThinkingReasoning from "@/components/ui/thinking-reasoning"
import HoldButton from "@/components/ui/HoldButton"
import { Input } from "@/components/ui/input"
import Textarea from "@/components/ui/textarea"
import { SherlockSelect } from "@/components/ui/SherlockSelect"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import PageHeading from "./PageHeading"
import { useAppStore } from "@/stores/appStore"

type InvestigationStatus = "investigating" | "cause-suspected" | "cause-verified" | "mitigating" | "resolved"
type RuntimeState = "ready" | "thinking" | "waiting" | "no-evidence" | "conflicting" | "partial" | "permission-denied" | "model-failure" | "cancelled" | "stale"
type EvidenceState = "verified" | "demo" | "stale"

type Message = {
  id: string
  role: "user" | "ai"
  text: string
  attachments?: string[]
  mode?: string
  steps?: string[]
  elapsed?: number
  stopped?: boolean
  feedback?: "helpful" | "not-helpful"
  feedbackReason?: "incorrect-evidence" | "missing-context"
}

type SavedInvestigation = {
  id: string
  title: string
  incident: string
  service: string
  traceId: string
  updatedAt: string
  status: InvestigationStatus
  messages: Message[]
  notes: string
  findings: string
  reviewed: string[]
}

const STORAGE_KEY = "sherlock-investigations-v1"
const ACTIVE_KEY = "sherlock-active-investigation"

const EVIDENCE = [
  {
    id: "E1",
    type: "Trace",
    icon: GitBranch,
    title: "Database span dominates latency",
    timestamp: "14:13:08 UTC",
    environment: "production",
    state: "demo" as EvidenceState,
    route: "/app/traces",
    detail:
      "Trace abc123def456 • processCharge\nPostgreSQL span: 4,432 ms, 98.5% of request duration.",
    limit: "A slow span does not prove which query or commit caused it.",
  },
  {
    id: "E2",
    type: "Log",
    icon: ScrollText,
    title: "Connection acquisition timeout",
    timestamp: "14:13:11 UTC",
    environment: "production",
    state: "demo" as EvidenceState,
    route: "/app/logs",
    detail:
      "payment-service\nHikariPool-1: Connection is not available, request timed out after 30000ms.",
    limit:
      "Pool exhaustion may result from slow queries, leaked connections, or increased traffic.",
  },
  {
    id: "E3",
    type: "Metric",
    icon: BarChart3,
    title: "Pool utilization reached 50 / 50",
    timestamp: "14:09–14:13 UTC",
    environment: "production",
    state: "demo" as EvidenceState,
    route: "/app/metrics",
    detail:
      "DB latency 40 ms → 4,489 ms\nActive connections: 50. Configured maximum: 50. Error rate: 40%.",
    limit: "Synthetic values; no selected-project metrics were queried.",
  },
  {
    id: "E4",
    type: "Deployment",
    icon: GitCommit,
    title: "v2.14.1 preceded the latency spike",
    timestamp: "14:01:00 UTC",
    environment: "production",
    state: "stale" as EvidenceState,
    route: "/app/deployments",
    detail:
      "payment-service • commit a3f9c21\nDemo deployment: date-range filtering in payment history.",
    limit:
      "Correlation is not causation. This fixture is stale and no repository diff was fetched.",
  },
] as const

const TIMELINE = [
  ["14:01", "Deployment v2.14.1 completed", "Deployment", "E4"],
  ["14:09", "Database latency crossed baseline", "Metric change", "E3"],
  ["14:13", "Pool saturation and timeouts began", "Error", "E2"],
  ["14:21", "Availability threshold breached", "Alert", "E3"],
  ["14:28", "Investigation opened by alex.kim", "User action", "E1"],
] as const

const ACTIONS = [
  {
    id: "query-plan",
    title: "Compare query plans before and after v2.14.1",
    priority: "P0",
    risk: "Low",
    destructive: false,
  },
  {
    id: "connection-leaks",
    title: "Check active transactions and connection leaks",
    priority: "P0",
    risk: "Low",
    destructive: false,
  },
  {
    id: "rollback",
    title: "Roll back payment-service to v2.14.0",
    priority: "P1",
    risk: "High",
    destructive: true,
  },
  {
    id: "validate",
    title: "Validate recovery using error rate and pool metrics",
    priority: "P1",
    risk: "Low",
    destructive: false,
  },
] as const

const SUMMARY =
  "The available sample signals are consistent with database connection-pool saturation in payment-service. A query regression after v2.14.1 is plausible, but deployment timing alone does not establish causality."

const STEPS = [
  "Loaded evidence in the selected project and time window.",
  "Compared deployment timing with latency and connection-pool signals.",
  "Separated supporting, contradicting, and missing evidence.",
]

const STATUS_OPTIONS = [
  { value: "investigating", label: "Investigating" },
  { value: "cause-suspected", label: "Cause suspected" },
  { value: "cause-verified", label: "Cause verified" },
  { value: "mitigating", label: "Mitigating" },
  { value: "resolved", label: "Resolved" },
]

const RUNTIME_COPY: Record<RuntimeState, {
  title: string
  detail: string
  variant: "info" | "warning" | "error" | "success"
}> = {
  ready: {
    title: "Evidence loaded",
    detail: "The current scope is ready for analysis.",
    variant: "success",
  },
  thinking: {
    title: "Analyzing signals",
    detail: "Sherlock is correlating the selected telemetry.",
    variant: "info",
  },
  waiting: {
    title: "Waiting for telemetry",
    detail: "No signals have arrived for the selected scope yet.",
    variant: "info",
  },
  "no-evidence": {
    title: "No evidence found",
    detail: "Expand the time range or attach a trace, log, or deployment.",
    variant: "warning",
  },
  conflicting: {
    title: "Conflicting evidence",
    detail:
      "Signals support multiple explanations. Review contradictions before verification.",
    variant: "warning",
  },
  partial: {
    title: "Partial telemetry coverage",
    detail:
      "Trace and metric samples are present; repository and caller evidence are missing.",
    variant: "warning",
  },
  "permission-denied": {
    title: "Permission denied",
    detail: "Your role cannot access one or more evidence sources.",
    variant: "error",
  },
  "model-failure": {
    title: "Analysis service unavailable",
    detail:
      "The evidence remains available. Retry when the model API is reachable.",
    variant: "error",
  },
  cancelled: {
    title: "Analysis stopped",
    detail: "The partial response was retained and no action was executed.",
    variant: "warning",
  },
  stale: {
    title: "Stale evidence",
    detail:
      "One or more sources fall outside the current investigation window.",
    variant: "warning",
  },
}

function demoResponse(text: string) {
  if (/no evidence/i.test(text))
    return "No matching sample evidence was found. Expand the time range or attach a trace, log, deployment, or stack trace before drawing a conclusion."
  if (/contradict|alternative|compare/i.test(text))
    return "Two hypotheses fit the sample pool saturation: slow queries holding connections [E1, E3], or leaked connections exhausting the pool [E2, E3]. Stable request volume weakens a traffic-spike explanation. Neither hypothesis is verified."
  if (/handoff|summary|summarize/i.test(text))
    return `${SUMMARY}\n\nVerified findings: none. Unresolved: query plan, connection lifecycle, and repository diff. No remediation has been executed.`
  if (/blast|downstream|affected/i.test(text))
    return "order-service and customer-portal may be affected by synchronous payment calls. The current fixtures do not verify downstream impact. Inspect caller traces and service-level error rates before expanding the incident scope."
  if (/commit|deploy|change/i.test(text))
    return "Deployment v2.14.1 precedes the latency spike [E4, E3], but this is correlation, not proof. E4 is stale and no GitHub diff has been retrieved. Compare the actual diff and query plans before verification."
  return `${SUMMARY}\n\nSupporting evidence: E1, E2, E3. Contradicting evidence: request volume remained near baseline. Missing evidence: query plans, active transactions, caller traces, and the repository diff.`
}

function readSaved(): SavedInvestigation[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export default function InvestigationWorkspace() {
  const navigate = useNavigate()
  const environment = useAppStore((state) => state.activeEnvironment)
  const timeRange = useAppStore((state) => state.timeRange)
  const projectId = useAppStore((state) => state.activeProjectId)
  const project = useAppStore(
    (state) =>
      state.projects.find((item) => item.id === state.activeProjectId)?.name ??
      "No project selected",
  )
  const [started, setStarted] = useState(false)
  const [investigationId, setInvestigationId] = useState(
    () => localStorage.getItem(ACTIVE_KEY) ?? crypto.randomUUID(),
  )
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [busy, setBusy] = useState(false)
  const [activity, setActivity] = useState<string[]>([])
  const [selected, setSelected] = useState<typeof EVIDENCE[number] | null>(null)
  const [reviewed, setReviewed] = useState<string[]>([])
  const [status, setStatus] = useState<InvestigationStatus>("investigating")
  const [runtimeState, setRuntimeState] = useState<RuntimeState>("partial")
  const [notes, setNotes] = useState("")
  const [findings, setFindings] = useState("")
  const [nextStep, setNextStep] = useState(
    "Compare query plans before and after v2.14.1",
  )
  const [feedback, setFeedback] = useState("")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyQuery, setHistoryQuery] = useState("")
  const [history, setHistory] = useState<SavedInvestigation[]>(readSaved)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const sending = useRef(false)
  const bottom = useRef<HTMLDivElement>(null)
  const preview =
    localStorage.getItem("sherlock_access_token") === UI_PREVIEW_ACCESS_TOKEN

  const filteredHistory = useMemo(() => {
    const query = historyQuery.trim().toLowerCase()
    if (!query) return history
    return history.filter((item) =>
      [item.title, item.incident, item.service, item.traceId].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [history, historyQuery])

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current)
    },
    [],
  )

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "auto", block: "nearest" })
  }, [messages, activity])

  useEffect(() => {
    if (!started) return
    const snapshot: SavedInvestigation = {
      id: investigationId,
      title:
        messages
          .find((message) => message.role === "user")
          ?.text.slice(0, 70) ?? "New investigation",
      incident: "INC-094",
      service: "payment-service",
      traceId: "abc123def456",
      updatedAt: new Date().toISOString(),
      status,
      messages,
      notes,
      findings,
      reviewed,
    }
    setHistory((current) => {
      const next = [
        snapshot,
        ...current.filter((item) => item.id !== snapshot.id),
      ]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 25)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    localStorage.setItem(ACTIVE_KEY, investigationId)
  }, [findings, investigationId, messages, notes, reviewed, started, status])

  function streamResponse(response: string, finalState: RuntimeState) {
    const start = performance.now()
    let count = 0
    timer.current = setInterval(() => {
      count = Math.min(response.length, count + 18)
      const steps = STEPS.slice(0, Math.min(3, 1 + Math.floor(count / 110)))
      setActivity(steps)
      setMessages((current) =>
        current.map((message, index) =>
          index === current.length - 1
            ? {
                ...message,
                text: response.slice(0, count),
                steps,
                elapsed: (performance.now() - start) / 1000,
              }
            : message,
        ),
      )
      if (count >= response.length) {
        if (timer.current) clearInterval(timer.current)
        timer.current = null
        sending.current = false
        setBusy(false)
        setRuntimeState(finalState)
      }
    }, 55)
  }

  async function send(text: string, detail?: PromptBarSendDetail) {
    if (sending.current || (!text.trim() && !detail?.attachments.length)) return
    const prompt = text.trim() || "Review the attached filenames"
    sending.current = true
    setStarted(true)
    setBusy(true)
    setRuntimeState("thinking")
    setDraft("")
    setActivity([STEPS[0]])
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        text: prompt,
        attachments: detail?.attachments,
        mode: detail?.model?.name,
      },
      { id: crypto.randomUUID(), role: "ai", text: "" },
    ])

    if (preview || import.meta.env.VITE_USE_MOCK_AI === "true") {
      const finalState: RuntimeState = /no evidence/i.test(prompt)
        ? "no-evidence"
        : /stale|old evidence/i.test(prompt)
          ? "stale"
          : /contradict|alternative|compare/i.test(prompt)
            ? "conflicting"
            : "partial"
      streamResponse(
        demoResponse(prompt) +
          (detail?.attachments.length
            ? "\n\nAttachments are local filename references only; their contents were not uploaded or analyzed."
            : ""),
        finalState,
      )
      return
    }

    if (!projectId) {
      setRuntimeState("waiting")
      setMessages((current) =>
        current.map((message, index) =>
          index === current.length - 1
            ? {
                ...message,
                text: "Select a project before starting production analysis. Your prompt and attachments were preserved.",
              }
            : message,
        ),
      )
      sending.current = false
      setBusy(false)
      return
    }

    try {
      const result = await aiApi.chat(
        projectId,
        prompt,
        messages.map((message) => ({
          id: message.id,
          role: message.role === "ai" ? "assistant" : "user",
          content: message.text,
          timestamp: new Date().toISOString(),
        })),
      )
      setMessages((current) =>
        current.map((message, index) =>
          index === current.length - 1
            ? {
                ...message,
                text: result.content,
                steps: STEPS,
                elapsed: 0,
              }
            : message,
        ),
      )
      setRuntimeState(result.evidence?.length ? "partial" : "no-evidence")
    } catch (error) {
      const denied =
        axios.isAxiosError(error) &&
        [401, 403].includes(error.response?.status ?? 0)
      setRuntimeState(denied ? "permission-denied" : "model-failure")
      setMessages((current) =>
        current.map((message, index) =>
          index === current.length - 1
            ? {
                ...message,
                text: apiErrorMessage(
                  error,
                  "Sherlock could not complete this analysis. Existing evidence and notes were preserved.",
                ),
              }
            : message,
        ),
      )
    } finally {
      sending.current = false
      setBusy(false)
    }
  }

  function stop() {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
    sending.current = false
    setBusy(false)
    setRuntimeState("cancelled")
    setMessages((current) =>
      current.map((message, index) =>
        index === current.length - 1 ? { ...message, stopped: true } : message,
      ),
    )
  }

  function regenerate() {
    const lastPrompt = [...messages]
      .reverse()
      .find((message) => message.role === "user")
    if (lastPrompt) send(lastPrompt.text)
  }

  function pickFiles(): Promise<string[]> {
    return new Promise((resolve) => {
      const input = document.createElement("input")
      input.type = "file"
      input.multiple = true
      input.accept = ".txt,.log,.json,.png,.jpg,.jpeg,.md"
      input.onchange = () =>
        resolve(Array.from(input.files ?? []).map((file) => file.name))
      input.oncancel = () => resolve([])
      input.click()
    })
  }

  function updateMessage(
    id: string,
    patch: Pick<Message, "feedback" | "feedbackReason">,
  ) {
    setMessages((current) =>
      current.map((message) =>
        message.id === id ? { ...message, ...patch } : message,
      ),
    )
    setFeedback("Feedback saved. The hypothesis remains unverified.")
  }

  function startNew() {
    if (timer.current) clearInterval(timer.current)
    const id = crypto.randomUUID()
    setInvestigationId(id)
    setMessages([])
    setReviewed([])
    setNotes("")
    setFindings("")
    setStatus("investigating")
    setRuntimeState("partial")
    setDraft("")
    setStarted(true)
    setHistoryOpen(false)
  }

  function resume(item: SavedInvestigation) {
    setInvestigationId(item.id)
    setMessages(item.messages)
    setNotes(item.notes)
    setFindings(item.findings)
    setReviewed(item.reviewed)
    setStatus(item.status)
    setStarted(true)
    setHistoryOpen(false)
  }

  function exportBrief() {
    const verifiedEvidence = EVIDENCE.filter(
      (item) => item.state === "verified",
    )
    const unresolved = [
      "Actual query plan before and after v2.14.1",
      "Connection lifecycle under representative load",
      "Repository diff and downstream caller traces",
    ]
    const brief = [
      `# Sherlock investigation — ${preview ? "DEMO / UNVERIFIED" : status}`,
      `Scope: ${project} / ${environment} / ${timeRange}`,
      `Status: ${STATUS_OPTIONS.find((item) => item.value === status)?.label}`,
      "## Timeline summary",
      ...TIMELINE.map(([time, event]) => `- ${time} UTC — ${event}`),
      "## Verified findings",
      ...(verifiedEvidence.length
        ? verifiedEvidence.map((item) => `- [${item.id}] ${item.title}`)
        : ["- None."]),
      "## Working hypothesis",
      SUMMARY,
      "## Unresolved questions",
      ...unresolved.map((item) => `- ${item}`),
      "## Completed actions",
      ...ACTIONS.filter((item) => reviewed.includes(item.id)).map(
        (item) => `- [x] ${item.title}`,
      ),
      "## Pending actions",
      ...ACTIONS.filter((item) => !reviewed.includes(item.id)).map(
        (item) => `- [ ] ${item.title}`,
      ),
      "## Notes",
      notes || "No notes recorded.",
      "## Findings",
      findings || "No findings recorded.",
      "## Next validation step",
      nextStep,
      "## Conversation",
      ...messages.map(
        (message) =>
          `### ${
            message.role === "ai" ? "Sherlock" : "Investigator"
          }\n${message.text}`,
      ),
      preview
        ? "No production evidence verified. No remediation executed."
        : "AI output must not be treated as verified without investigator confirmation.",
    ].join("\n\n")
    const url = URL.createObjectURL(
      new Blob([brief], { type: "text/markdown" }),
    )
    const link = document.createElement("a")
    link.href = url
    link.download = `sherlock-${investigationId}.md`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setFeedback("Handoff downloaded.")
  }

  const runtime = RUNTIME_COPY[runtimeState]

  if (!started)
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-border bg-warning-surface px-4 py-2 text-xs text-warning">
          <Badge variant="warning">
            {preview ? "Demo workspace" : "Investigation"}
          </Badge>
          <span>
            {preview
              ? "Local simulated responses. No production telemetry or repository content is queried."
              : "AI findings remain hypotheses until an investigator verifies the evidence."}
          </span>
        </div>
        <BoltStyleChat
          title="What will you"
          subtitle="Start with an incident, trace, error, deployment, or a question."
          announcementText="Sherlock investigations"
          placeholder="Describe an incident or paste a trace ID…"
          onSend={(text) => send(text)}
          onImport={(source) => {
            setDraft(
              source === "trace"
                ? "Investigate trace abc123def456"
                : "Compare the deployment with the latency spike",
            )
            setStarted(true)
          }}
        />
        <div className="mx-auto flex gap-2 pb-8">
          <Button variant="outline" onClick={() => setHistoryOpen(true)}>
            <History className="size-4" />
            Resume investigation
          </Button>
          <Button variant="outline" onClick={startNew}>
            <Plus className="size-4" />
            New investigation
          </Button>
        </div>
        <HistoryDialog
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          query={historyQuery}
          onQueryChange={setHistoryQuery}
          items={filteredHistory}
          onResume={resume}
        />
      </div>
    )

  return (
    <div className="app-page flex h-full min-h-0 flex-col bg-background font-sans text-foreground">
      <PageHeading
        className="shrink-0 border-b border-border px-5 py-4"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={preview ? "warning" : "info"}>
              {preview ? "Demo · No live AI" : "AI-assisted"}
            </Badge>
            <SherlockSelect
              value={status}
              onChange={(value) => setStatus(value as InvestigationStatus)}
              options={STATUS_OPTIONS}
              minWidth={150}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setHistoryOpen(true)}
            >
              <History className="size-3.5" />
              History
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={exportBrief}
              disabled={busy}
            >
              <Download className="size-3.5" />
              Export
            </Button>
          </div>
        }
      >
        <div className="text-lg font-semibold tracking-tight">
          Investigation{" "}
          <span className="font-mono text-xs font-normal text-muted-foreground">
            / INC-094
          </span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Correlate evidence, challenge hypotheses, and preserve a verifiable
          handoff.
        </div>
      </PageHeading>

      <div
        role="status"
        className={`flex shrink-0 items-center gap-2 border-b px-5 py-2 text-xs ${
          runtime.variant === "error"
            ? "border-danger-border bg-danger-surface text-danger"
            : runtime.variant === "warning"
              ? "border-warning-border bg-warning-surface text-warning"
              : runtime.variant === "success"
                ? "border-success-border bg-success-surface text-success"
                : "border-info-border bg-info-surface text-info"
        }`}
      >
        {runtime.variant === "error" ? (
          <XCircle className="size-4 shrink-0" />
        ) : runtime.variant === "warning" ? (
          <AlertTriangle className="size-4 shrink-0" />
        ) : (
          <Activity className="size-4 shrink-0" />
        )}
        <span className="font-medium">{runtime.title}</span>
        <span className="text-foreground/70">{runtime.detail}</span>
        {runtimeState === "model-failure" && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto h-7"
            onClick={regenerate}
          >
            <RefreshCw className="size-3" />
            Retry
          </Button>
        )}
      </div>

      <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-3 lg:overflow-hidden">
        <div className="flex min-h-0 flex-col lg:col-span-2 lg:border-r lg:border-border">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3 text-xs">
            <Brain className="size-4 text-muted-foreground" />
            <span className="font-medium">Investigation thread</span>
            <Badge variant="outline">payment-service</Badge>
            <span className="ml-auto text-muted-foreground">
              {messages.length} messages
            </span>
          </div>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
            {!messages.length && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Start with the strongest signal
                  </CardTitle>
                  <CardDescription>
                    Ask what changed, compare hypotheses, or inspect
                    contradicting evidence.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-prose rounded-lg bg-secondary p-3 text-sm"
                    : "space-y-3"
                }
              >
                {message.role === "ai" && (
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <Brain className="size-4" />
                    Sherlock
                    <Badge variant="warning">Hypothesis · Unverified</Badge>
                  </div>
                )}
                {message.role === "user" && message.mode && (
                  <div className="mb-2 text-xs text-muted-foreground">
                    {message.mode}
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.text}
                </div>
                {message.attachments?.map((name) => (
                  <Badge key={name} variant="outline" className="mr-1">
                    <Paperclip className="size-3" />
                    {name} · Filename only
                  </Badge>
                ))}
                {message.role === "ai" && (
                  <>
                    <ThinkingReasoning
                      steps={
                        busy && index === messages.length - 1
                          ? activity
                          : (message.steps ?? [])
                      }
                      busy={busy && index === messages.length - 1}
                    />
                    <LatticeLoader
                      status={
                        busy && index === messages.length - 1
                          ? "working"
                          : message.stopped
                            ? "error"
                            : "done"
                      }
                      label="Analyzing evidence"
                      doneLabel="Analysis completed in"
                      errorLabel="Stopped after"
                      elapsed={message.elapsed ?? 0}
                      fontSize={12}
                      cellSize={4}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {EVIDENCE.map((evidence) => (
                        <Button
                          key={evidence.id}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setSelected(evidence)}
                        >
                          [{evidence.id}] {evidence.type}
                          <ArrowUpRight className="size-3" />
                        </Button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="mr-1 text-xs text-muted-foreground">
                        Was this useful?
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Mark response helpful"
                        aria-pressed={message.feedback === "helpful"}
                        className="h-7 px-2"
                        onClick={() =>
                          updateMessage(message.id, { feedback: "helpful" })
                        }
                      >
                        <ThumbsUp className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Mark response not helpful"
                        aria-pressed={message.feedback === "not-helpful"}
                        className="h-7 px-2"
                        onClick={() =>
                          updateMessage(message.id, { feedback: "not-helpful" })
                        }
                      >
                        <ThumbsDown className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          updateMessage(message.id, {
                            feedback: "not-helpful",
                            feedbackReason: "incorrect-evidence",
                          })
                        }
                      >
                        Incorrect evidence
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          updateMessage(message.id, {
                            feedback: "not-helpful",
                            feedbackReason: "missing-context",
                          })
                        }
                      >
                        Missing context
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={bottom} />
          </div>

          <div className="shrink-0 space-y-3 border-t border-border p-4">
            <div className="flex flex-wrap gap-2">
              {[
                "What changed before this started?",
                "Which services are affected?",
                "Show contradicting evidence.",
                "Compare against the previous deployment.",
              ].map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={busy}
                  onClick={() => setDraft(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
            <PromptBar
              className="!w-full rounded-2xl border border-border"
              placeholder="Ask about this investigation… (@ sources, / commands)"
              draftValue={draft}
              onDraftChange={setDraft}
              sources={[
                {
                  key: "files",
                  name: "Trace, logs, stack trace, screenshot, or deployment",
                  description: "Attach local investigation context",
                  icon: <Paperclip className="size-4" />,
                  attach: true,
                },
                {
                  key: "trace",
                  name: "Current trace",
                  description: "Trace abc123def456",
                  icon: <GitBranch className="size-4" />,
                },
                {
                  key: "logs",
                  name: "Related logs",
                  description: "HikariCP timeout records",
                  icon: <ScrollText className="size-4" />,
                },
              ]}
              commands={[
                {
                  key: "summarize",
                  name: "/summarize",
                  description: "Prepare a handoff",
                },
                {
                  key: "compare",
                  name: "/compare",
                  description: "Compare alternative hypotheses",
                },
              ]}
              models={[
                { key: "auto", name: "Auto", tag: "Recommended" },
                { key: "fast", name: "Fast triage", tag: "Fast" },
                { key: "deep", name: "Deep analysis", tag: "Thorough" },
              ]}
              defaultModel="auto"
              efforts={[]}
              busy={busy}
              onSend={send}
              onStop={stop}
              onAttach={pickFiles}
              background="var(--bg-2)"
              color="var(--text-1)"
              menuBackground="var(--bg-2)"
              sparkColor="var(--accent)"
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Enter to send · Shift+Enter for newline</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-7 text-xs"
                disabled={
                  busy || !messages.some((message) => message.role === "ai")
                }
                onClick={regenerate}
              >
                <RefreshCw className="size-3" />
                Regenerate
              </Button>
            </div>
          </div>
        </div>

        <div className="min-h-0 space-y-4 overflow-y-auto p-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Investigation scope</CardTitle>
              <CardDescription>
                Selected scope and telemetry-derived services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4 text-xs">
              {[
                ["Project", project],
                ["Environment", environment],
                ["Window", timeRange],
                ["Derived services", "payment-service, order-service"],
                ["Incident", "INC-094"],
                ["Trace", "abc123def456"],
                ["Deployment", "v2.14.1 / a3f9c21"],
              ].map(([label, value]) => (
                <div className="flex justify-between gap-3" key={label}>
                  <span className="text-muted-foreground">{label}</span>
                  <span className="truncate text-right font-mono">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">Incident context</CardTitle>
                <Badge variant="error">SEV-1</Badge>
              </div>
              <CardDescription>
                Active · 38 minutes · owner alex.kim
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 px-4 pb-4 text-xs">
              {[
                ["Error rate", "40%", "12× baseline"],
                ["P95 latency", "4.49 s", "20× baseline"],
                ["Affected users", "1,284", "Estimated"],
                ["Signal volume", "8.4k", "Traces + logs"],
              ].map(([label, value, comparison]) => (
                <div
                  key={label}
                  className="rounded-md border border-border p-2"
                >
                  <div className="text-muted-foreground">{label}</div>
                  <div className="mt-1 font-mono font-medium">{value}</div>
                  <div className="mt-0.5 text-muted-foreground">
                    {comparison}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Root-cause hypothesis</CardTitle>
                <Badge variant="warning">72% · Unverified</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4 text-xs leading-relaxed">
              <div>
                Slow database queries may be holding connections until the pool
                saturates.
              </div>
              <div>
                <span className="font-medium text-success">Supporting:</span>{" "}
                E1, E2, E3 and deployment timing in E4.
              </div>
              <div>
                <span className="font-medium text-warning">Contradicting:</span>{" "}
                request volume remained near baseline.
              </div>
              <div className="text-muted-foreground">
                Missing: query plans, active transactions, repository diff, and
                caller traces.
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                disabled={busy}
                onClick={() => setDraft("Compare alternative hypotheses")}
              >
                Test an alternative hypothesis
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">
                Service dependency impact
              </CardTitle>
              <CardDescription>
                Suspected blast radius · 64% confidence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4 text-xs">
              <div className="flex items-center gap-2">
                <Network className="size-3.5 text-muted-foreground" />
                <span>order-service</span>
                <Badge variant="warning" className="ml-auto">
                  Upstream
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-3.5 text-muted-foreground" />
                <span>customer-portal</span>
                <Badge variant="warning" className="ml-auto">
                  Downstream
                </Badge>
              </div>
              <div className="text-muted-foreground">
                Source: inferred synchronous calls in E1. Caller traces are
                missing.
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => setDraft("What is the blast radius?")}
              >
                Validate blast radius
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">
                Evidence sources{" "}
                <span className="text-muted-foreground">/ 4</span>
              </CardTitle>
              <CardDescription>
                Freshness and verification are explicit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4">
              {EVIDENCE.map((evidence) => (
                <Button
                  key={evidence.id}
                  variant="ghost"
                  className="h-auto w-full justify-start whitespace-normal border border-border p-2 text-left text-xs"
                  onClick={() => setSelected(evidence)}
                >
                  <evidence.icon className="size-3.5 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="mr-2 font-mono text-muted-foreground">
                      {evidence.id}
                    </span>
                    {evidence.title}
                  </span>
                  <Badge
                    variant={
                      evidence.state === "verified"
                        ? "success"
                        : evidence.state === "stale"
                          ? "warning"
                          : "info"
                    }
                  >
                    {evidence.state}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Investigation timeline</CardTitle>
              <CardDescription>Correlated sequence · UTC</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {TIMELINE.map(([time, event, type, evidenceId]) => (
                <div
                  key={`${time}-${event}`}
                  className="flex items-start gap-3 text-xs"
                >
                  <span className="font-mono text-muted-foreground">
                    {time}
                  </span>
                  <div className="min-w-0">
                    <div className="text-muted-foreground">{type}</div>
                    <Button
                      variant="link"
                      className="h-auto whitespace-normal p-0 text-left text-xs"
                      onClick={() =>
                        setSelected(
                          EVIDENCE.find((item) => item.id === evidenceId)!,
                        )
                      }
                    >
                      {event}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Suggested actions</CardTitle>
              <CardDescription>
                {reviewed.length}/{ACTIONS.length} completed · explicit
                confirmation required for destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4">
              {ACTIONS.map((action) =>
                action.destructive ? (
                  <div
                    key={action.id}
                    className="space-y-2 rounded-md border border-danger-border bg-danger-surface p-2"
                  >
                    <div className="flex items-start gap-2 text-xs">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-danger" />
                      <div className="flex-1">
                        <div className="font-medium">{action.title}</div>
                        <div className="mt-1 text-muted-foreground">
                          {action.priority} · {action.risk} risk · requires
                          owner approval
                        </div>
                      </div>
                    </div>
                    <HoldButton
                      size="sm"
                      holdTime={1800}
                      disabled={preview || reviewed.includes(action.id)}
                      backgroundColor="var(--bg-3)"
                      fillColor="var(--red)"
                      textColor="var(--text-1)"
                      fillTextColor="var(--text-inv)"
                      doneLabel="Rollback recorded"
                      onHold={() => {
                        setReviewed((current) => [...current, action.id])
                        setFeedback(
                          "Rollback approval recorded. Execution requires a connected deployment service.",
                        )
                      }}
                      className="w-full"
                    >
                      {preview
                        ? "Unavailable in demo"
                        : "Hold to approve rollback"}
                    </HoldButton>
                  </div>
                ) : (
                  <Button
                    key={action.id}
                    variant="outline"
                    aria-pressed={reviewed.includes(action.id)}
                    className="h-auto w-full justify-start whitespace-normal p-2 text-left text-xs"
                    onClick={() =>
                      setReviewed((current) =>
                        current.includes(action.id)
                          ? current.filter((id) => id !== action.id)
                          : [...current, action.id],
                      )
                    }
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center rounded border border-border">
                      {reviewed.includes(action.id) && (
                        <Check className="size-3" />
                      )}
                    </span>
                    <span className="flex-1">{action.title}</span>
                    <Badge variant="outline">{action.priority}</Badge>
                    <Badge variant="ghost">{action.risk}</Badge>
                  </Button>
                ),
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Notes and findings</CardTitle>
              <CardDescription>
                Record observations separately from AI hypotheses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Observed evidence and investigator notes…"
                className="min-h-20 text-xs"
              />
              <Textarea
                value={findings}
                onChange={(event) => setFindings(event.target.value)}
                placeholder="Verified findings and decisions…"
                className="min-h-20 text-xs"
              />
              <Input
                value={nextStep}
                onChange={(event) => setNextStep(event.target.value)}
                aria-label="Next validation step"
                placeholder="Next validation step"
                className="text-xs"
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Save className="size-3.5" />
                Saved locally with this investigation
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Handoff summary</CardTitle>
              <CardDescription>
                Timeline, verified findings, open questions, and actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4 text-xs leading-relaxed">
              <div>{SUMMARY}</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border border-border p-2">
                  <div className="font-medium">Verified findings</div>
                  <div className="mt-1 text-muted-foreground">0 confirmed</div>
                </div>
                <div className="rounded-md border border-border p-2">
                  <div className="font-medium">Open questions</div>
                  <div className="mt-1 text-muted-foreground">3 unresolved</div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={exportBrief}
                disabled={busy}
              >
                <FileText className="size-3.5" />
                Download Markdown brief
              </Button>
              <div role="status" className="text-muted-foreground">
                {feedback}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selected?.id} · {selected?.title}
            </DialogTitle>
            <DialogDescription>
              Evidence provenance, freshness, and limitations
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                selected?.state === "verified"
                  ? "success"
                  : selected?.state === "stale"
                    ? "warning"
                    : "info"
              }
            >
              {selected?.state === "demo"
                ? "Demo · Not verified"
                : selected?.state}
            </Badge>
            <Badge variant="outline">{selected?.environment}</Badge>
            <Badge variant="outline">
              <Clock3 className="size-3" />
              {selected?.timestamp}
            </Badge>
          </div>
          <div className="whitespace-pre-wrap rounded-lg border border-border bg-secondary p-4 font-mono text-xs leading-relaxed">
            {selected?.detail}
          </div>
          <div className="text-sm text-muted-foreground">{selected?.limit}</div>
          <Button
            variant="outline"
            onClick={() => selected && navigate(selected.route)}
          >
            Open original signal
            <ArrowUpRight className="size-4" />
          </Button>
        </DialogContent>
      </Dialog>

      <HistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        query={historyQuery}
        onQueryChange={setHistoryQuery}
        items={filteredHistory}
        onResume={resume}
      />
    </div>
  )
}

function HistoryDialog({
  open,
  onOpenChange,
  query,
  onQueryChange,
  items,
  onResume,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  query: string
  onQueryChange: (query: string) => void
  items: SavedInvestigation[]
  onResume: (item: SavedInvestigation) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conversation history</DialogTitle>
          <DialogDescription>
            Search saved investigations by incident, service, or trace ID.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search INC-094, payment-service, or trace ID…"
            className="pl-9"
          />
        </div>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {!items.length && (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No saved investigations match this search.
            </div>
          )}
          {items.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="h-auto w-full justify-start whitespace-normal border border-border p-3 text-left"
              onClick={() => onResume(item)}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{item.title}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">
                  {item.incident} · {item.service} · {item.traceId}
                </div>
              </div>
              <Badge variant="outline">
                {
                  STATUS_OPTIONS.find((status) => status.value === item.status)
                    ?.label
                }
              </Badge>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
