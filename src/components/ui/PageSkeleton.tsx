import { useEffect, useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
/* ── Hook: measure container height → derive count ───────── */
function useFillCount(itemHeight: number, min = 3, reserve = 0) {
  const ref = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(min)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const calc = (h: number) =>
      setCount(Math.max(min, Math.floor((h - reserve) / itemHeight)))
    const ro = new ResizeObserver(([entry]) => calc(entry.contentRect.height))
    ro.observe(el)
    calc(el.getBoundingClientRect().height)
    return () => ro.disconnect()
  }, [itemHeight, min, reserve])
  return { ref, count }
}
function useFillGrid(cardH: number, cardW: number, min = 3) {
  const ref = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(min)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const calc = (w: number, h: number) => {
      const cols = Math.max(1, Math.floor(w / cardW))
      const rows = Math.max(1, Math.floor(h / cardH))
      setCount(Math.max(min, cols * rows))
    }
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      calc(width, height)
    })
    ro.observe(el)
    const r = el.getBoundingClientRect()
    calc(r.width, r.height)
    return () => ro.disconnect()
  }, [cardH, cardW, min])
  return { ref, count }
}
/* ── Atoms ──────────────────────────────────────────────── */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="[background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:8px] [padding:16px]">
      {children}
    </div>
  )
}
/* ── Dynamic table skeleton ─────────────────────────────── */
/**
 * When `colWidths` is provided the header/cells are laid out with an exact
 * CSS-grid template that mirrors the real page's table, so the skeleton lines
 * up column-for-column with the loaded content. A bare `cols` count falls back
 * to an evenly-spaced flex layout.
 */
function DynamicTable({
  cols = 5,
  colWidths,
  rowH = 40,
  headerH = 40,
  padX = 16,
}: {
  cols?: number
  colWidths?: string[]
  rowH?: number
  headerH?: number
  padX?: number
}) {
  const ROW_H = rowH + 1 // + 1px row border
  const { ref, count } = useFillCount(ROW_H, 3, headerH)
  const template = colWidths?.join(" ")
  const n = colWidths ? colWidths.length : cols
  // per-cell bar width: last-ish narrow cols read as badges/numbers
  const cellWidth = (c: number) => {
    if (colWidths) {
      const w = colWidths[c]
      if (w === "1fr") return "60%"
      const px = parseInt(w, 10)
      if (!Number.isNaN(px))
        return `${Math.min(px - 16, Math.max(10, px - 20))}px`
      return "60%"
    }
    return `${44 + (c % 5) * 16}px`
  }
  const CellRow = ({
    r,
    isHeader = false,
  }: {
    r: number
    isHeader?: boolean
  }) => {
    const cells = Array.from({ length: n }).map((_, c) => (
      <div key={c} className="[min-width:0]">
        <Skeleton
          style={{
            width: isHeader ? "70%" : cellWidth(c),
            opacity: isHeader ? 0.8 : 1 - c * 0.05,
          }}
          className={[
            "[max-width:100%] [border-radius:4px]",
            isHeader ? "[height:9px]" : "[height:10px]",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>
    ))
    return template ? (
      <div
        style={{
          gridTemplateColumns: template,
          padding: `0 ${padX}px`,
          height: isHeader ? headerH : rowH,
          borderBottom: isHeader
            ? "1px solid var(--border)"
            : r < count - 1
              ? "1px solid var(--border)"
              : "none",
        }}
        className="[display:grid] [gap:12px] [align-items:center] [flex-shrink:0]"
      >
        {cells}
      </div>
    ) : (
      <div
        style={{
          padding: `0 ${padX}px`,
          height: isHeader ? headerH : rowH,
          borderBottom: isHeader
            ? "1px solid var(--border)"
            : r < count - 1
              ? "1px solid var(--border)"
              : "none",
        }}
        className="[display:flex] [align-items:center] [gap:16px] [flex-shrink:0]"
      >
        {cells}
      </div>
    )
  }
  return (
    <div
      ref={ref}
      className="[flex:1] [min-height:0] [background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:8px] [overflow:hidden] [display:flex] [flex-direction:column]"
    >
      <CellRow r={-1} isHeader />
      {Array.from({ length: count }).map((_, r) => (
        <CellRow key={r} r={r} />
      ))}
    </div>
  )
}
/* ── Dynamic card grid skeleton ─────────────────────────── */
function DynamicGrid({
  cardMinW = 260,
  cardH = 110,
  children,
}: {
  cardMinW?: number
  cardH?: number
  children?: (i: number) => React.ReactNode
}) {
  const { ref, count } = useFillGrid(cardH + 16, cardMinW + 16, 3)
  return (
    <div
      ref={ref}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${cardMinW}px, 1fr))`,
      }}
      className="[flex:1] [min-height:0] [display:grid] [gap:16px] [align-content:start] [overflow:hidden]"
    >
      {Array.from({ length: count }).map((_, i) =>
        children ? (
          <div key={i}>{children(i)}</div>
        ) : (
          <div
            key={i}
            style={{
              height: cardH,
            }}
            className="[background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:8px] [padding:16px]"
          >
            <Skeleton className="[height:10px] [width:55%] [border-radius:4px] [margin-bottom:12px]" />
            <Skeleton className="[height:10px] [width:85%] [border-radius:4px] [margin-bottom:8px]" />
            <Skeleton className="[height:10px] [width:65%] [border-radius:4px]" />
          </div>
        ),
      )}
    </div>
  )
}
/* ── Page header (shared) ───────────────────────────────── */
function PageHeader({
  titleW = 160,
  actions = 2,
}: {
  titleW?: number
  actions?: number
}) {
  return (
    <div className="[display:flex] [align-items:center] [justify-content:space-between] [padding-bottom:16px] [flex-shrink:0]">
      <div className="[display:flex] [flex-direction:column] [gap:7px]">
        {/* h1 is 18px on real pages */}
        <Skeleton
          style={{
            width: titleW,
          }}
          className="[height:16px] [border-radius:4px]"
        />
        <Skeleton
          style={{
            width: titleW + 60,
          }}
          className="[height:10px] [border-radius:4px]"
        />
      </div>
      {actions > 0 && (
        <div className="[display:flex] [gap:8px]">
          {Array.from({ length: actions }).map((_, i) => (
            <Skeleton
              key={i}
              className={[
                "[height:30px] [border-radius:6px]",
                i === 0 ? "[width:100px]" : "[width:80px]",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  )
}
/* ── Tab row (Metrics, Alerts, etc.) ────────────────────── */
function TabRow({ tabs = 4 }: { tabs?: number }) {
  return (
    <div className="[display:flex] [gap:4px] [margin-bottom:16px] [flex-shrink:0] [border-bottom:1px_solid_var(--border)] [padding-bottom:10px]">
      {Array.from({ length: tabs }).map((_, i) => (
        <Skeleton
          key={i}
          style={{
            width: 80 + (i % 3) * 20,
          }}
          className="[height:26px] [border-radius:6px]"
        />
      ))}
    </div>
  )
}
/* ── Stat cards row ─────────────────────────────────────── */
function StatCards({ count = 4 }: { count?: number }) {
  return (
    <div
      style={{
        gridTemplateColumns: `repeat(${count}, 1fr)`,
      }}
      className="[display:grid] [gap:0] [margin-bottom:16px] [border:1px_solid_var(--border)] [border-radius:8px] [overflow:hidden] [flex-shrink:0]"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={[
            "[padding:12px_16px] [background:var(--bg-2)] [display:flex] [flex-direction:column] [gap:8px]",
            i < count - 1
              ? "[border-right:1px_solid_var(--border)]"
              : "[border-right:none]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Skeleton className="[height:9px] [width:80px] [border-radius:3px]" />
          <Skeleton className="[height:22px] [width:64px] [border-radius:4px]" />
          <Skeleton className="[height:9px] [width:48px] [border-radius:3px]" />
        </div>
      ))}
    </div>
  )
}
/* ── Chart skeleton ─────────────────────────────────────── */
function ChartSkeleton({ height = 160 }: { height?: number }) {
  return (
    <div className="[background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:8px] [padding:16px] [flex-shrink:0]">
      <div className="[display:flex] [justify-content:space-between] [margin-bottom:12px]">
        <Skeleton className="[height:10px] [width:100px] [border-radius:4px]" />
        <Skeleton className="[height:24px] [width:72px] [border-radius:5px]" />
      </div>
      <Skeleton
        style={{
          height,
        }}
        className="[width:100%] [border-radius:6px]"
      />
    </div>
  )
}
/* ── Toolbar row (filters/search bar) ───────────────────── */
function ToolbarSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="[display:flex] [gap:8px] [margin-bottom:12px] [flex-shrink:0]">
      <Skeleton className="[height:30px] [flex:1] [max-width:220px] [border-radius:6px]" />
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton
          key={i}
          style={{
            width: 90 + i * 16,
          }}
          className="[height:30px] [border-radius:6px]"
        />
      ))}
    </div>
  )
}
/* ── Full page wrappers ─────────────────────────────────── */
const PAD: React.CSSProperties = {
  padding: "20px 24px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  overflow: "hidden",
}
export function OverviewSkeleton() {
  return (
    <div className="[padding:20px_24px] [height:100%] [display:flex] [flex-direction:column] [box-sizing:border-box] [overflow:hidden]">
      <PageHeader titleW={140} />
      {/* KPI strip: repeat(4, 1fr) */}
      <StatCards count={4} />
      {/* Charts row: 2fr / 1fr */}
      <div className="[display:grid] [grid-template-columns:2fr_1fr] [gap:12px] [margin-bottom:12px] [flex-shrink:0]">
        <ChartSkeleton height={120} />
        <ChartSkeleton height={120} />
      </div>
      {/* Service list: "1fr 40px 50px 46px" */}
      <DynamicTable colWidths={["1fr", "40px", "50px", "46px"]} />
    </div>
  )
}
/**
 * Generic table page. Pass a `colWidths` template to mirror the exact grid of
 * the page being loaded; otherwise falls back to `cols` even columns.
 */
export function TablePageSkeleton({
  statCount = 0,
  cols = 6,
  colWidths,
  toolbarItems = 3,
  rowH = 40,
  padX = 16,
  titleW = 140,
}: {
  statCount?: number
  cols?: number
  colWidths?: string[]
  toolbarItems?: number
  rowH?: number
  padX?: number
  titleW?: number
}) {
  return (
    <div className="[padding:20px_24px] [height:100%] [display:flex] [flex-direction:column] [box-sizing:border-box] [overflow:hidden]">
      <PageHeader titleW={titleW} />
      {statCount > 0 && <StatCards count={statCount} />}
      <ToolbarSkeleton items={toolbarItems} />
      <DynamicTable cols={cols} colWidths={colWidths} rowH={rowH} padX={padX} />
    </div>
  )
}
/* Logs — 4-stat strip, 3 filters, "116px 92px 160px 1fr" table */
export function LogsSkeleton() {
  return (
    <div className="[padding:20px_24px] [height:100%] [display:flex] [flex-direction:column] [box-sizing:border-box] [overflow:hidden]">
      <PageHeader titleW={80} />
      <StatCards count={4} />
      <ToolbarSkeleton items={3} />
      <DynamicTable colWidths={["116px", "92px", "160px", "1fr"]} />
    </div>
  )
}
/* Traces — 4-stat strip, filters, 8-col table with expand caret */
export function TracesSkeleton() {
  return (
    <div className="[padding:20px_24px] [height:100%] [display:flex] [flex-direction:column] [box-sizing:border-box] [overflow:hidden]">
      <PageHeader titleW={90} />
      <StatCards count={4} />
      <ToolbarSkeleton items={3} />
      <DynamicTable
        colWidths={[
          "28px",
          "180px",
          "1fr",
          "140px",
          "72px",
          "100px",
          "100px",
          "84px",
        ]}
      />
    </div>
  )
}
/* Metrics — fixed 2-column chart-card grid (Recharts ~110px each) */
export function MetricsSkeleton() {
  return (
    <div className="[padding:20px_24px] [height:100%] [display:flex] [flex-direction:column] [box-sizing:border-box] [overflow:hidden]">
      <PageHeader titleW={100} />
      <TabRow tabs={4} />
      <div className="[display:grid] [grid-template-columns:repeat(2,_1fr)] [gap:12px] [align-content:start] [overflow:auto] [flex:1] [min-height:0]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="[background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:8px] [padding:16px]"
          >
            <div className="[display:flex] [justify-content:space-between] [margin-bottom:12px]">
              <Skeleton className="[height:10px] [width:120px] [border-radius:4px]" />
              <Skeleton className="[height:10px] [width:48px] [border-radius:4px]" />
            </div>
            <Skeleton className="[width:100%] [height:110px] [border-radius:6px]" />
          </div>
        ))}
      </div>
    </div>
  )
}
export function AISkeleton() {
  return (
    <div className="[padding:20px_24px] [height:100%] [display:flex] [flex-direction:column] [box-sizing:border-box] [overflow:hidden]">
      <PageHeader />
      <div className="[display:flex] [gap:16px] [flex:1] [min-height:0]">
        <div className="[width:260px] [flex-shrink:0] [display:flex] [flex-direction:column] [gap:10px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="[background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:8px] [padding:12px]"
            >
              <Skeleton className="[height:9px] [width:70%] [border-radius:3px] [margin-bottom:8px]" />
              <Skeleton className="[height:28px] [width:100%] [border-radius:5px]" />
            </div>
          ))}
        </div>
        <div className="[flex:1] [display:flex] [flex-direction:column] [gap:12px]">
          <ChartSkeleton height={180} />
          <DynamicTable cols={4} />
        </div>
      </div>
    </div>
  )
}
/* Settings — 200px nav sidebar + 1fr multi-section panel (44px rows) */
export function ProfileSkeleton() {
  return (
    <div className="[padding:20px_24px] [height:100%] [display:flex] [flex-direction:column] [box-sizing:border-box] [overflow:hidden]">
      <PageHeader titleW={100} actions={1} />
      <div className="[display:grid] [grid-template-columns:200px_1fr] [gap:24px] [flex:1] [min-height:0]">
        {/* Nav sidebar */}
        <div className="[display:flex] [flex-direction:column] [gap:6px] [flex-shrink:0]">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              key={i}
              className={[
                "[height:32px] [width:100%] [border-radius:6px]",
                i === 0 ? "[opacity:1]" : "[opacity:0.6]",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>
        {/* Panel: profile header + a couple of dense tables */}
        <div className="[display:flex] [flex-direction:column] [gap:16px] [min-height:0] [overflow:hidden]">
          <div className="[display:flex] [align-items:center] [gap:14px] [flex-shrink:0]">
            <Skeleton className="[width:48px] [height:48px] [border-radius:50%]" />
            <div className="[display:flex] [flex-direction:column] [gap:6px]">
              <Skeleton className="[height:12px] [width:140px] [border-radius:4px]" />
              <Skeleton className="[height:10px] [width:200px] [border-radius:4px]" />
            </div>
          </div>
          <DynamicTable
            colWidths={[
              "1fr",
              "160px",
              "100px",
              "100px",
              "100px",
              "80px",
              "80px",
            ]}
            rowH={44}
          />
        </div>
      </div>
    </div>
  )
}
export function DefaultPageSkeleton() {
  return (
    <div className="[padding:20px_24px] [height:100%] [display:flex] [flex-direction:column] [box-sizing:border-box] [overflow:hidden]">
      <PageHeader />
      <StatCards count={3} />
      <ChartSkeleton height={140} />
      <div className="[margin-top:12px] [flex:1] [min-height:0] [display:flex] [flex-direction:column]">
        <DynamicTable />
      </div>
    </div>
  )
}
export function DeploymentsSkeleton() {
  return (
    <div className="[padding:20px_24px] [height:100%] [display:flex] [flex-direction:column] [box-sizing:border-box] [overflow:hidden]">
      <PageHeader titleW={130} />
      <ToolbarSkeleton items={3} />
      {/* 8-col table, rows padded 0 32px */}
      <DynamicTable
        colWidths={[
          "96px",
          "160px",
          "1fr",
          "108px",
          "110px",
          "88px",
          "148px",
          "88px",
        ]}
        padX={32}
      />
    </div>
  )
}
export function DependenciesSkeleton() {
  return (
    <div className="[padding:20px_24px] [height:100%] [display:flex] [flex-direction:column] [box-sizing:border-box] [overflow:hidden]">
      <PageHeader />
      <div className="[display:flex] [gap:16px] [flex:1] [min-height:0]">
        <div className="[flex:1] [display:flex] [flex-direction:column]">
          <Skeleton className="[flex:1] [border-radius:8px]" />
        </div>
        <div className="[width:300px] [flex-shrink:0] [display:flex] [flex-direction:column] [gap:12px]">
          <Card>
            <Skeleton className="[height:10px] [width:100px] [border-radius:3px] [margin-bottom:12px]" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="[height:30px] [width:100%] [border-radius:5px] [margin-bottom:6px]"
              />
            ))}
          </Card>
          <Card>
            <Skeleton className="[height:10px] [width:80px] [border-radius:3px] [margin-bottom:12px]" />
            <Skeleton className="[height:60px] [width:100%] [border-radius:5px]" />
          </Card>
        </div>
      </div>
    </div>
  )
}
export function IntegrationsSkeleton() {
  return (
    <div className="[padding:20px_24px] [height:100%] [display:flex] [flex-direction:column] [box-sizing:border-box] [overflow:hidden]">
      <PageHeader titleW={120} />
      {/* card grid: repeat(auto-fill, minmax(300px, 1fr)) — 40px icon */}
      <DynamicGrid cardMinW={300} cardH={124}>
        {() => (
          <div className="[background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:8px] [padding:16px] [height:124px]">
            <div className="[display:flex] [align-items:center] [gap:10px] [margin-bottom:12px]">
              <Skeleton className="[width:40px] [height:40px] [border-radius:8px]" />
              <div className="[display:flex] [flex-direction:column] [gap:6px]">
                <Skeleton className="[height:11px] [width:100px] [border-radius:4px]" />
                <Skeleton className="[height:8px] [width:64px] [border-radius:3px]" />
              </div>
            </div>
            <Skeleton className="[height:9px] [width:90%] [border-radius:3px] [margin-bottom:6px]" />
            <Skeleton className="[height:9px] [width:60%] [border-radius:3px]" />
          </div>
        )}
      </DynamicGrid>
    </div>
  )
}
export function AlertsSkeleton() {
  return (
    <div className="[padding:20px_24px] [height:100%] [display:flex] [flex-direction:column] [box-sizing:border-box] [overflow:hidden]">
      <PageHeader titleW={100} />
      <StatCards count={4} />
      <TabRow tabs={2} />
      <ToolbarSkeleton items={3} />
      <DynamicTable cols={7} />
    </div>
  )
}
export function ApiDebuggerSkeleton() {
  return (
    <div className="[padding:20px_24px] [height:100%] [display:flex] [flex-direction:column] [box-sizing:border-box] [overflow:hidden]">
      <PageHeader titleW={120} actions={0} />
      <div className="[display:flex] [gap:16px] [flex:1] [min-height:0]">
        {/* History sidebar */}
        <div className="[width:240px] [flex-shrink:0] [background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:8px] [padding:12px] [display:flex] [flex-direction:column] [gap:8px]">
          <Skeleton className="[height:30px] [width:100%] [border-radius:6px] [margin-bottom:4px]" />
          <DynamicTableInner cols={1} rowH={40} />
        </div>
        {/* Request/response column */}
        <div className="[flex:1] [display:flex] [flex-direction:column] [gap:12px] [min-width:0]">
          {/* request bar: method + url + send */}
          <div className="[display:flex] [gap:8px] [flex-shrink:0]">
            <Skeleton className="[height:34px] [width:104px] [border-radius:7px]" />
            <Skeleton className="[height:34px] [flex:1] [border-radius:7px]" />
            <Skeleton className="[height:34px] [width:90px] [border-radius:7px]" />
          </div>
          {/* config editor block */}
          <Skeleton className="[height:150px] [width:100%] [border-radius:8px] [flex-shrink:0]" />
          {/* response block */}
          <Skeleton className="[flex:1] [min-height:0] [width:100%] [border-radius:8px]" />
        </div>
      </div>
    </div>
  )
}
/* thin inner table used inside panels */
function DynamicTableInner({
  cols = 2,
  rowH = 36,
}: {
  cols?: number
  rowH?: number
}) {
  const { ref, count } = useFillCount(rowH, 3, 0)
  return (
    <div
      ref={ref}
      className="[flex:1] [min-height:0] [overflow:hidden] [display:flex] [flex-direction:column] [gap:6px]"
    >
      {Array.from({ length: count }).map((_, r) => (
        <div key={r} className="[display:flex] [gap:8px]">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              style={{
                height: rowH - 6,
              }}
              className="[flex:1] [border-radius:5px]"
            />
          ))}
        </div>
      ))}
    </div>
  )
}
export function RouteSkeleton() {
  return (
    <div className="[display:flex] [height:100%] [align-items:center] [justify-content:center] [background:var(--bg)]">
      <div className="[display:flex] [flex-direction:column] [align-items:center] [gap:16px] [width:260px]">
        <Skeleton className="[width:40px] [height:40px] [border-radius:10px]" />
        <Skeleton className="[height:12px] [width:120px] [border-radius:4px]" />
        <Skeleton className="[height:10px] [width:180px] [border-radius:4px]" />
        <Skeleton className="[height:3px] [width:100px] [border-radius:99px]" />
      </div>
    </div>
  )
}
