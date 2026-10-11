import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartNoAxesColumn, GitBranch, Server } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SherlockSelect } from "@/components/ui/SherlockSelect"

interface TraceRecord {
  id: string
  service: string
  op: string
  dur: number
  ts: string
  status: string
}
interface TraceVisualizationProps {
  traces: readonly TraceRecord[]
  onInspect: (traceId: string) => void
}
interface ServiceSummary {
  name: string
  count: number
  total: number
  slowest: TraceRecord
}
const STATUS = {
  success: { label: "Success", color: "var(--green)", badge: "success" },
  error: { label: "Error", color: "var(--red)", badge: "error" },
  timeout: { label: "Timeout", color: "var(--yellow)", badge: "warning" },
} as const
function statusOf(value: string) {
  return (
    STATUS[(value as keyof typeof STATUS)] ?? {
      label: value,
      color: "var(--text-3)",
      badge: "ghost" as const,
    }
  )
}
function duration(value: number) {
  return value >= 1000
    ? `${(value / 1000).toFixed(2)}s`
    : `${Math.round(value)}ms`
}
function timestamp(value: string) {
  const date = new Date(value)
  return Number.isFinite(date.getTime())
    ? `${date.toLocaleTimeString("en-GB", { timeZone: "UTC", hour12: false })} UTC`
    : "Timestamp unavailable"
}
interface TraceTooltipProps {
  active?: boolean
  payload?: readonly { payload?: TraceRecord }[]
}
function TraceTooltip({ active, payload }: TraceTooltipProps) {
  const trace = payload?.[0]?.payload
  if (!active || !trace) return null
  return (
    <Card className="max-w-xs border-border bg-popover p-3 text-popover-foreground shadow-lg">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-medium">{trace.service}</span>
        <Badge variant={statusOf(trace.status).badge}>
          {statusOf(trace.status).label}
        </Badge>
      </div>
      <div className="mb-2 break-all font-mono text-xs text-muted-foreground">
        {trace.op}
      </div>
      <div className="flex items-center justify-between gap-4 font-mono text-xs">
        <span className="text-muted-foreground">{timestamp(trace.ts)}</span>
        <span className="font-semibold">{duration(trace.dur)}</span>
      </div>
    </Card>
  )
}

export default function TraceVisualization({
  traces,
  onInspect,
}: TraceVisualizationProps) {
  const [selectedId, setSelectedId] = useState("")
  const ranked = useMemo(
    () => [...traces].sort((a, b) => b.dur - a.dur),
    [traces],
  )
  const selected = ranked.find((trace) => trace.id === selectedId) ?? ranked[0]
  const services = useMemo(() => {
    const groups = new Map<string, ServiceSummary>()
    for (const trace of traces) {
      const group = groups.get(trace.service) ?? {
        name: trace.service,
        count: 0,
        total: 0,
        slowest: trace,
      }
      group.count += 1
      group.total += trace.dur
      if (trace.dur > group.slowest.dur) group.slowest = trace
      groups.set(trace.service, group)
    }
    return [...groups.values()]
      .map((group) => ({
        ...group,
        mean: Math.round(group.total / group.count),
      }))
      .sort((a, b) => b.mean - a.mean)
      .slice(0, 5)
  }, [traces])
  const maxMean = Math.max(...services.map((service) => service.mean), 1)

  return (
    <div
      className="page-insights trace-visualization"
      role="region"
      aria-label="Trace visualizations"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <ChartNoAxesColumn size={15} aria-hidden="true" /> Trace performance
        </span>
        <Badge variant="ghost">
          Filtered demo data · {traces.length} requests
        </Badge>
      </div>
      {!selected ? (
        <Card className="p-6 text-center shadow-none">
          <CardTitle className="mb-2 text-sm">No traces to visualize</CardTitle>
          <CardDescription className="text-xs">
            Adjust the search, service, or status filters to see request
            durations.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <Card className="min-w-0 shadow-none xl:col-span-2">
            <CardHeader className="space-y-2 p-4">
              <CardTitle className="text-sm">Trace duration</CardTitle>
              <CardDescription className="text-xs">
                Each bar is one request, ranked from slowest to fastest. Select
                a bar to inspect it.
              </CardDescription>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS).map(([key, value]) => (
                  <Badge key={key} variant={value.badge}>
                    {value.label} ·{" "}
                    {traces.filter((trace) => trace.status === key).length}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-4 pt-0">
              <div
                className="h-64 min-w-0"
                aria-label="Request durations; equivalent values are available in the trace table and trace picker"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ranked}
                    margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                    accessibilityLayer
                  >
                    <CartesianGrid
                      stroke="var(--border)"
                      vertical={false}
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="id"
                      tickFormatter={(value: string) => value.slice(0, 6)}
                      tick={{ fill: "var(--text-3)" }}
                      tickLine={false}
                      axisLine={{ stroke: "var(--border)" }}
                      interval="preserveStartEnd"
                      minTickGap={16}
                    />
                    <YAxis
                      tickFormatter={duration}
                      tick={{ fill: "var(--text-3)" }}
                      tickLine={false}
                      axisLine={false}
                      width={56}
                      domain={[0, "auto"]}
                    />
                    <Tooltip
                      content={<TraceTooltip />}
                      cursor={{ fill: "var(--bg-3)" }}
                    />
                    <Bar
                      dataKey="dur"
                      name="Duration"
                      maxBarSize={36}
                      radius={[3, 3, 0, 0]}
                      isAnimationActive={false}
                      onClick={(point) => {
                        if (typeof point.payload?.id === "string")
                          setSelectedId(point.payload.id)
                      }}
                    >
                      {ranked.map((trace) => (
                        <Cell
                          key={trace.id}
                          fill={statusOf(trace.status).color}
                          fillOpacity={trace.id === selected.id ? 1 : 0.6}
                          stroke={
                            trace.id === selected.id ? "var(--text-1)" : "none"
                          }
                          strokeWidth={trace.id === selected.id ? 1 : 0}
                          cursor="pointer"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mb-3 text-center text-xs text-muted-foreground">
                Trace ID (short) · elapsed request duration
              </div>
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <SherlockSelect
                    aria-label="Trace to inspect"
                    value={selected.id}
                    onChange={setSelectedId}
                    minWidth="100%"
                    options={ranked.map((trace) => ({
                      value: trace.id,
                      label: `${trace.id.slice(0, 8)} · ${trace.service} · ${duration(trace.dur)}`,
                    }))}
                  />
                  <div
                    role="status"
                    className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Badge variant={statusOf(selected.status).badge}>
                      {statusOf(selected.status).label}
                    </Badge>
                    <span className="min-w-0 break-all font-mono">
                      {selected.op}
                    </span>
                    <span>{timestamp(selected.ts)}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onInspect(selected.id)}
                >
                  <GitBranch size={13} aria-hidden="true" /> Inspect waterfall
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-0 shadow-none">
            <CardHeader className="space-y-2 p-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Server size={14} aria-hidden="true" /> Slowest services
              </CardTitle>
              <CardDescription className="text-xs">
                Top five by mean request duration in the current filtered
                sample.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-4 pt-0">
              {services.map((service) => (
                <Button
                  key={service.name}
                  variant="ghost"
                  aria-label={`Select slowest trace for ${service.name}, mean duration ${duration(service.mean)}`}
                  onClick={() => setSelectedId(service.slowest.id)}
                  className="h-auto w-full flex-col items-stretch gap-2 whitespace-normal p-3 text-left"
                >
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <span className="min-w-0 break-all font-mono">
                      {service.name}
                    </span>
                    <span className="shrink-0 font-mono font-semibold">
                      {duration(service.mean)}
                    </span>
                  </div>
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(service.mean / maxMean) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      {service.count} request{service.count === 1 ? "" : "s"}
                    </span>
                    <span>
                      {selected.service === service.name
                        ? "Selected service"
                        : "Select trace"}
                    </span>
                  </div>
                </Button>
              ))}
              <div className="border-t border-border px-3 pt-3 text-xs leading-relaxed text-muted-foreground">
                Select a service to highlight its slowest request, then inspect
                the waterfall. These are observed sample durations, not SLO
                targets.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
