import { useMemo, useState } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  BaseEdge,
  getBezierPath,
  useInternalNode,
  useNodesState,
  MarkerType,
  type Node,
  type NodeProps,
  type EdgeProps,
  type InternalNode,
} from "@xyflow/react"
import { Network, Pause, Play, RotateCcw, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import "@xyflow/react/dist/style.css"
import "./dependency-flow.css"

type Service = {
  id: string
  label: string
  icon: LucideIcon
  deps: string[]
}
type Dependency = {
  node: string
  name: string
  type: string
  icon: LucideIcon
  status: string
  latency: number
  callsPerMin: number
}
type Selection = {
  kind: "service" | "dependency"
  id: string
}
type FlowNode = Node<{
  label: string
  subtitle: string
  icon: LucideIcon
  kind: "application" | "service" | "dependency"
  status?: string
}, "dependency">

function DependencyNode({ data, selected }: NodeProps<FlowNode>) {
  const Icon = data.icon
  return (
    <div
      className={`dependency-flow-node flex w-60 items-center gap-3 rounded-lg border bg-card px-3 py-3 shadow-sm ${
        selected ? "border-ring ring-2 ring-ring/20" : "border-border"
      }`}
      data-status={data.status}
    >
      {data.kind !== "application" && (
        <Handle type="target" position={Position.Left} isConnectable={false} />
      )}
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-foreground">
          {data.label}
        </div>
        <div className="mt-1 truncate font-mono text-xs text-muted-foreground">
          {data.subtitle}
        </div>
      </div>
      {data.status && (
        <span
          className="dependency-flow-status size-2 shrink-0 rounded-full"
          title={data.status}
        />
      )}
      {data.kind !== "dependency" && (
        <Handle type="source" position={Position.Right} isConnectable={false} />
      )}
    </div>
  )
}

// Intersect the center-to-center line with each measured rectangle, so edges
// follow the nearest node boundary even when nodes are dragged across columns.
function boundary(node: InternalNode, other: InternalNode) {
  const width = node.measured.width ?? 240
  const height = node.measured.height ?? 66
  const x = node.internals.positionAbsolute.x + width / 2
  const y = node.internals.positionAbsolute.y + height / 2
  const dx =
    other.internals.positionAbsolute.x + (other.measured.width ?? 240) / 2 - x
  const dy =
    other.internals.positionAbsolute.y + (other.measured.height ?? 66) / 2 - y
  const scale =
    1 / Math.max(Math.abs(dx) / (width / 2), Math.abs(dy) / (height / 2), 0.001)
  const horizontal = Math.abs(dx) / width >= Math.abs(dy) / height
  return {
    x: x + dx * scale,
    y: y + dy * scale,
    position: horizontal
      ? dx >= 0
        ? Position.Right
        : Position.Left
      : dy >= 0
        ? Position.Bottom
        : Position.Top,
  }
}

function FloatingEdge({ id, source, target, markerEnd, style }: EdgeProps) {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)
  if (!sourceNode || !targetNode) return null
  const start = boundary(sourceNode, targetNode)
  const end = boundary(targetNode, sourceNode)
  const [path] = getBezierPath({
    sourceX: start.x,
    sourceY: start.y,
    sourcePosition: start.position,
    targetX: end.x,
    targetY: end.y,
    targetPosition: end.position,
  })
  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      style={style}
      interactionWidth={20}
    />
  )
}

export default function DependencyFlow({
  services,
  dependencies,
  selected,
  onSelect,
}: {
  services: Service[]
  dependencies: Dependency[]
  selected: Selection
  onSelect: (selection: Selection) => void
}) {
  // Preserve registry identity for this mounted flow, including during HMR.
  const [nodeTypes] = useState(() => ({ dependency: DependencyNode }))
  const [edgeTypes] = useState(() => ({ floating: FloatingEdge }))
  const initialNodes = useMemo<FlowNode[]>(
    () => [
      {
        id: "application",
        type: "dependency",
        position: { x: 0, y: 380 },
        data: {
          label: "Sherlock API",
          subtitle: "APPLICATION · DEMO",
          icon: Network,
          kind: "application",
        },
      },
      ...services.map(
        (service, index): FlowNode => ({
          id: service.id,
          type: "dependency",
          position: { x: 370, y: 65 + index * 110 },
          data: {
            label: service.label,
            subtitle: `${service.deps.length} outbound connections`,
            icon: service.icon,
            kind: "service",
          },
        }),
      ),
      ...dependencies.map(
        (dependency, index): FlowNode => ({
          id: dependency.node,
          type: "dependency",
          position: { x: 820, y: index * 88 },
          data: {
            label: dependency.name,
            subtitle: `${dependency.latency}ms · ${dependency.callsPerMin.toLocaleString()}/min`,
            icon: dependency.icon,
            kind: "dependency",
            status: dependency.status,
          },
        }),
      ),
    ],
    [services, dependencies],
  )
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [animated, setAnimated] = useState(true)
  const [hovered, setHovered] = useState<string | null>(null)
  const focus = hovered ?? selected.id
  const edges = useMemo(
    () =>
      services.flatMap((service) => [
        {
          id: `application-${service.id}`,
          source: "application",
          target: service.id,
          type: "floating",
          animated,
          className: `dependency-flow-edge ${
            focus === service.id ||
            focus === "application" ||
            service.deps.includes(focus)
              ? "is-related"
              : "is-muted"
          }`,
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        ...service.deps.map((id) => {
          const dependency = dependencies.find((item) => item.node === id)
          return {
            id: `${service.id}-${id}`,
            source: service.id,
            target: id,
            type: "floating",
            animated,
            className: `dependency-flow-edge status-${dependency?.status.toLowerCase()} ${
              focus === service.id || focus === id || focus === "application"
                ? "is-related"
                : "is-muted"
            }`,
            markerEnd: { type: MarkerType.ArrowClosed },
          }
        }),
      ]),
    [services, dependencies, focus, animated],
  )

  return (
    <div className="dependency-flow relative h-148 bg-background">
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          selected: node.id === selected.id,
        }))}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={(_, node) => {
          if (node.data.kind !== "application")
            onSelect({ kind: node.data.kind, id: node.id })
        }}
        onNodeMouseEnter={(_, node) => setHovered(node.id)}
        onNodeMouseLeave={() => setHovered(null)}
        onEdgeClick={(_, edge) => {
          const dependency = dependencies.find(
            (item) => item.node === edge.target,
          )
          onSelect({
            kind: dependency ? "dependency" : "service",
            id: edge.target,
          })
        }}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.25}
        maxZoom={2}
        nodesConnectable={false}
        edgesReconnectable={false}
        deleteKeyCode={null}
        aria-label="Demo service dependency map"
      >
        <Background gap={24} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeClassName="dependency-flow-minimap-node"
        />
        <Panel position="top-left">
          <div className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              7 services · 10 dependencies
            </span>
            <span className="ml-3 hidden sm:inline">
              Drag nodes · Scroll to zoom · Click to inspect
            </span>
          </div>
        </Panel>
        <Panel position="top-right">
          <div className="flex gap-1 rounded-md border border-border bg-card p-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              aria-label={
                animated ? "Pause flow animation" : "Play flow animation"
              }
              aria-pressed={!animated}
              onClick={() => setAnimated((value) => !value)}
            >
              {animated ? (
                <Pause className="size-3.5" />
              ) : (
                <Play className="size-3.5" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              aria-label="Reset node layout"
              onClick={() => setNodes(initialNodes)}
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
