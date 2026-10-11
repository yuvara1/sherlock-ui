import { Link } from "react-router"
import {
  ArrowUpRight,
  Check,
  Circle,
  GitBranch,
  ListChecks,
  ChartNoAxesCombined,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import useLocalList from "@/lib/useLocalList"
import ExportButton from "@/components/workspace/ExportButton"
import InvestigationNotebook, {
  useInvestigationScope,
} from "@/components/workspace/InvestigationNotebook"

export interface InsightSegment {
  label: string
  count: number
  tone: "success" | "warning" | "danger" | "info" | "neutral"
}
const TONES = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-primary",
  neutral: "bg-muted-foreground",
}
const PLAYBOOKS = {
  overview: {
    title: "Service health",
    recommendation: "Start with the customer-facing path",
    description:
      "Use errors, traces, and deployments together to investigate the payment-service demo scenario.",
    links: [
      ["Review incidents", "/app/incidents"],
      ["Compare dependencies", "/app/dependencies"],
    ],
    tasks: [
      "Identify the impacted service",
      "Correlate the latest release",
      "Review the recovery path",
    ],
  },
  incidents: {
    title: "Incident disposition",
    recommendation: "Build an evidence-led response",
    description:
      "Follow the failing request, inspect its logs, then compare recent deployments before choosing a mitigation.",
    links: [
      ["Inspect request traces", "/app/traces"],
      ["Review deployments", "/app/deployments"],
    ],
    tasks: [
      "Confirm scope and severity",
      "Collect trace and log evidence",
      "Document a mitigation",
    ],
  },
  errors: {
    title: "Error severity",
    recommendation: "Connect the fingerprint to a request",
    description:
      "A recurring error is more useful with its upstream trace and downstream log context.",
    links: [
      ["Explore distributed traces", "/app/traces"],
      ["Inspect service logs", "/app/logs"],
    ],
    tasks: [
      "Identify the dominant fingerprint",
      "Check affected service paths",
      "Record the investigation outcome",
    ],
  },
  traces: {
    title: "Request outcomes",
    recommendation: "Find the span that changed the request",
    description:
      "Expand a trace or open its waterfall, then compare slow spans with service health and error groups.",
    links: [
      ["Review service health", "/app/services"],
      ["Compare error groups", "/app/errors"],
    ],
    tasks: [
      "Inspect the root operation",
      "Locate the slowest dependency",
      "Correlate an error fingerprint",
    ],
  },
  logs: {
    title: "Log level distribution",
    recommendation: "Turn log noise into request context",
    description:
      "Narrow the stream by service and level, then correlate the relevant messages with a distributed trace.",
    links: [
      ["Open distributed traces", "/app/traces"],
      ["Review incidents", "/app/incidents"],
    ],
    tasks: [
      "Narrow the service and level",
      "Identify the first failure",
      "Capture the relevant request path",
    ],
  },
  deployments: {
    title: "Release outcomes",
    recommendation: "Validate a release beyond build status",
    description:
      "Compare errors and latency around a release before deciding whether it introduced a regression.",
    links: [
      ["Compare service metrics", "/app/metrics"],
      ["Review error groups", "/app/errors"],
    ],
    tasks: [
      "Identify the changed version",
      "Compare post-release signals",
      "Record the rollback decision",
    ],
  },
  alerts: {
    title: "Alert coverage",
    recommendation: "Prioritize actionable notifications",
    description:
      "Check the metric, severity, and notification channel before adding another rule to the workspace.",
    links: [
      ["Review service metrics", "/app/metrics"],
      ["Inspect active incidents", "/app/incidents"],
    ],
    tasks: [
      "Review firing conditions",
      "Confirm the response channel",
      "Check for duplicate signals",
    ],
  },
  services: {
    title: "Service health",
    recommendation: "Understand the blast radius",
    description:
      "A degraded service rarely operates alone. Compare its dependencies and incoming request traces.",
    links: [
      ["Explore dependencies", "/app/dependencies"],
      ["Inspect request traces", "/app/traces"],
    ],
    tasks: [
      "Identify unhealthy services",
      "Inspect upstream dependencies",
      "Review the latest deployment",
    ],
  },
}
type InsightPage = keyof typeof PLAYBOOKS

interface ChecklistProps {
  page: InsightPage
  scope: string
  tasks: readonly string[]
}
function Checklist({ scope, tasks }: ChecklistProps) {
  const { items, toggle, persistent } = useLocalList(
    `${scope}-checklist`,
    tasks,
  )
  return (
    <section className="min-w-0 border-t border-border p-3 lg:border-l lg:border-t-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-xs font-semibold">
          <ListChecks size={14} aria-hidden="true" /> Handoff checklist
        </h3>
        <Badge variant="ghost">
          {items.length}/{tasks.length}
        </Badge>
      </div>
      <div className="space-y-0.5">
        {tasks.map((task) => (
          <Button
            key={task}
            variant="ghost"
            size="sm"
            aria-pressed={items.includes(task)}
            onClick={() => toggle(task)}
            className="h-auto min-h-7 w-full justify-start whitespace-normal px-1.5 py-1 text-left text-xs"
          >
            {items.includes(task) ? (
              <Check
                size={14}
                className="shrink-0 text-success"
                aria-hidden="true"
              />
            ) : (
              <Circle
                size={14}
                className="shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            <span
              className={
                items.includes(task) ? "text-muted-foreground line-through" : ""
              }
            >
              {task}
            </span>
          </Button>
        ))}
        <div
          role="status"
          className="px-1.5 pt-1 text-[11px] text-muted-foreground"
        >
          {persistent ? "Saved in this browser" : "Saved for this session"}
        </div>
      </div>
    </section>
  )
}

interface PageInsightsProps {
  page: InsightPage
  segments: InsightSegment[]
  exportRows?: readonly object[]
}
export default function PageInsights({
  page,
  segments,
  exportRows,
}: PageInsightsProps) {
  const playbook = PLAYBOOKS[page]
  const scope = useInvestigationScope(page)
  const total = segments.reduce((sum, segment) => sum + segment.count, 0)
  return (
    <div
      className="page-insights overflow-hidden rounded-lg border border-border bg-card"
      role="region"
      aria-label="Investigation handoff"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-xs font-semibold">Investigation handoff</span>
          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            Signals, next action, and browser-local progress in one brief
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="ghost">{total.toLocaleString()} signals</Badge>
          <InvestigationNotebook
            key={scope}
            scope={scope}
            page={page}
            tasks={playbook.tasks}
            segments={segments}
          />
          {exportRows && <ExportButton rows={exportRows} name={page} />}
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="min-w-0 p-3">
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold">
            <ChartNoAxesCombined size={14} aria-hidden="true" />
            {playbook.title}
          </h3>
          <div
            role="img"
            aria-label={segments
              .map((item) => `${item.label}: ${item.count}`)
              .join(", ")}
            className="mb-2.5 flex h-1.5 gap-px overflow-hidden rounded-full bg-muted"
          >
            {segments
              .filter((item) => item.count > 0)
              .map((item) => (
                <div
                  key={item.label}
                  style={{ flexGrow: item.count }}
                  className={TONES[item.tone]}
                />
              ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {segments.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1.5 text-[11px]"
              >
                <span
                  className={`size-1.5 rounded-full ${TONES[item.tone]}`}
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-mono tabular-nums">{item.count}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="min-w-0 border-t border-border p-3 lg:border-l lg:border-t-0">
          <h3 className="mb-1.5 flex items-center gap-2 text-xs font-semibold">
            <GitBranch size={14} aria-hidden="true" /> Next best action
          </h3>
          <p className="text-xs font-medium">{playbook.recommendation}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {playbook.description}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-x-3">
            {playbook.links.map(([label, to]) => (
              <Button
                key={to}
                asChild
                variant="link"
                size="sm"
                className="h-7 px-0 text-xs"
              >
                <Link to={to}>
                  {label}
                  <ArrowUpRight size={12} aria-hidden="true" />
                </Link>
              </Button>
            ))}
          </div>
        </section>
        <Checklist
          key={scope}
          page={page}
          scope={scope}
          tasks={playbook.tasks}
        />
      </div>
    </div>
  )
}
