import { useMemo, useRef, useState, useCallback, useEffect } from "react"
import type React from "react"
import { AgGridReact, type AgGridReactProps } from "ag-grid-react"
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community"
import type { GridApi } from "ag-grid-community"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { useTheme } from "@/lib/theme"
import { useReducedMotion } from "motion/react"
ModuleRegistry.registerModules([AllCommunityModule])
const LIGHT = {
  backgroundColor: "var(--bg-2)",
  foregroundColor: "var(--text-1)",
  borderColor: "var(--border)",
  columnHeaderBackgroundColor: "var(--bg-3)",
  columnHeaderTextColor: "var(--text-3)",
  rowHoverColor: "var(--bg-3)",
  selectedRowBackgroundColor: "var(--accent-bg)",
  oddRowBackgroundColor:
    "color-mix(in srgb, var(--bg-3) 55%, var(--bg-2))",
  fontFamily: '"Geist", sans-serif',
  fontSize: 13,
  cellTextColor: "var(--text-1)",
  headerColumnSeparatorColor: "var(--border)",
  rowBorderColor: "var(--border)",
  wrapperBorderRadius: "0px",
}
const DARK = {
  backgroundColor: "var(--bg-2)",
  foregroundColor: "var(--text-1)",
  borderColor: "var(--border)",
  columnHeaderBackgroundColor: "var(--bg-3)",
  columnHeaderTextColor: "var(--text-3)",
  rowHoverColor: "var(--bg-3)",
  selectedRowBackgroundColor: "var(--accent-bg)",
  oddRowBackgroundColor:
    "color-mix(in srgb, var(--bg-3) 55%, var(--bg-2))",
  fontFamily: '"Geist", sans-serif',
  fontSize: 13,
  cellTextColor: "var(--text-1)",
  headerColumnSeparatorColor: "var(--border)",
  rowBorderColor: "var(--border)",
  wrapperBorderRadius: "0px",
}
const PAGE_SIZES = [10, 25, 50]
function PaginationBar({
  api,
  pageSize,
  onPageSizeChange,
}: {
  api: GridApi
  pageSize: number
  onPageSizeChange: (n: number) => void
}) {
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const refresh = useCallback(() => {
    setPage(api.paginationGetCurrentPage())
    setTotal(api.paginationGetTotalPages())
  }, [api])
  useEffect(() => {
    api.addEventListener("paginationChanged", refresh)
    refresh()
    return () => {
      if (!api.isDestroyed()) {
        api.removeEventListener("paginationChanged", refresh)
      }
    }
  }, [api, refresh])
  const rowCount = api.paginationGetRowCount()
  const start = page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, rowCount)
  const isFirst = page === 0
  const isLast = page >= total - 1
  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 6,
    border: "1px solid var(--border)",
    background: "transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    color: disabled ? "var(--text-4)" : "var(--text-2)",
    opacity: disabled ? 0.4 : 1,
    transition: "all 0.15s",
  })
  return (
    <div className="flex-wrap gap-3 [display:flex] [align-items:center] [justify-content:space-between] [padding:8px_16px] [border-top:1px_solid_var(--border)] [background:var(--bg)] [flex-shrink:0]">
      <div className="[display:flex] [align-items:center] [gap:8px]">
        <span className="[font-size:12px] [color:var(--text-4)] [font-family:Geist,_sans-serif]">
          Rows per page
        </span>
        <div className="[display:flex] [gap:4px]">
          {PAGE_SIZES.map((n) => (
            <button
              key={n}
              aria-label={`${n} rows per page`}
              aria-pressed={pageSize === n}
              onClick={() => onPageSizeChange(n)}
              className={[
                "[height:28px] [padding:0_10px] [border-radius:6px] [border:1px_solid_var(--border)] [cursor:pointer] [font-size:12px] [font-family:Geist,_sans-serif] [transition:all_0.15s]",
                pageSize === n
                  ? "[background:var(--bg-3)]"
                  : "[background:transparent]",
                pageSize === n
                  ? "[color:var(--text-1)]"
                  : "[color:var(--text-4)]",
                pageSize === n ? "[font-weight:600]" : "[font-weight:400]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="[display:flex] [align-items:center] [gap:10px]">
        <span className="[font-size:12px] [color:var(--text-4)] [font-family:Geist_Mono,_monospace] [letter-spacing:-0.01em]">
          {rowCount === 0 ? "0 results" : `${start}–${end} of ${rowCount}`}
        </span>
        <div className="[display:flex] [gap:4px]">
          <button
            aria-label="First page"
            style={btnStyle(isFirst)}
            disabled={isFirst}
            onClick={() => {
              api.paginationGoToFirstPage()
              refresh()
            }}
            onMouseEnter={(e) => {
              if (!isFirst)
                (e.currentTarget as HTMLElement).style.background =
                  "var(--bg-3)"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.background = "transparent"
            }}
          >
            <ChevronsLeft size={13} />
          </button>
          <button
            aria-label="Previous page"
            style={btnStyle(isFirst)}
            disabled={isFirst}
            onClick={() => {
              api.paginationGoToPreviousPage()
              refresh()
            }}
            onMouseEnter={(e) => {
              if (!isFirst)
                (e.currentTarget as HTMLElement).style.background =
                  "var(--bg-3)"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.background = "transparent"
            }}
          >
            <ChevronLeft size={13} />
          </button>
          <div className="[display:flex] [align-items:center] [gap:3px]">
            {Array.from({ length: Math.min(total, 7) }, (_, i) => {
              const p =
                total <= 7
                  ? i
                  : page < 4
                    ? i
                    : page > total - 4
                      ? total - 7 + i
                      : page - 3 + i
              const active = p === page
              return (
                <button
                  key={p}
                  aria-label={`Page ${p + 1}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => {
                    api.paginationGoToPage(p)
                    refresh()
                  }}
                  className={[
                    "[width:28px] [height:28px] [border-radius:6px] [cursor:pointer] [font-size:12px] [font-family:Geist_Mono,_monospace] [transition:all_0.15s]",
                    active
                      ? "[border:1px_solid_var(--border-2)]"
                      : "[border:1px_solid_transparent]",
                    active
                      ? "[background:var(--bg-3)]"
                      : "[background:transparent]",
                    active ? "[color:var(--text-1)]" : "[color:var(--text-4)]",
                    active ? "[font-weight:600]" : "[font-weight:400]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {p + 1}
                </button>
              )
            })}
          </div>
          <button
            aria-label="Next page"
            style={btnStyle(isLast)}
            disabled={isLast}
            onClick={() => {
              api.paginationGoToNextPage()
              refresh()
            }}
            onMouseEnter={(e) => {
              if (!isLast)
                (e.currentTarget as HTMLElement).style.background =
                  "var(--bg-3)"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.background = "transparent"
            }}
          >
            <ChevronRight size={13} />
          </button>
          <button
            aria-label="Last page"
            style={btnStyle(isLast)}
            disabled={isLast}
            onClick={() => {
              api.paginationGoToLastPage()
              refresh()
            }}
            onMouseEnter={(e) => {
              if (!isLast)
                (e.currentTarget as HTMLElement).style.background =
                  "var(--bg-3)"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.background = "transparent"
            }}
          >
            <ChevronsRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
interface SherlockGridProps extends AgGridReactProps {
  containerStyle?: React.CSSProperties
  defaultPageSize?: number
  showPagination?: boolean
}
export function SherlockGrid({
  containerStyle,
  defaultPageSize = 10,
  defaultColDef,
  showPagination = true,
  domLayout,
  ...props
}: SherlockGridProps) {
  const { theme } = useTheme()
  const reducedMotion = useReducedMotion()
  const apiRef = useRef<GridApi | null>(null)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [ready, setReady] = useState(false)
  const gridTheme = useMemo(
    () => themeQuartz.withParams(theme === "dark" ? DARK : LIGHT),
    [theme],
  )
  const handlePageSizeChange = useCallback((n: number) => {
    setPageSize(n)
    apiRef.current?.paginationGoToFirstPage()
  }, [])
  return (
    <div
      style={{
        ...containerStyle,
      }}
      className={[
        "[width:100%] [display:flex] [flex-direction:column]",
        domLayout === "autoHeight"
          ? ""
          : "[height:100%] [min-height:var(--workspace-panel-max-height)]",
      ].join(" ")}
    >
      <div
        className={
          domLayout === "autoHeight"
            ? "[overflow:hidden]"
            : "[flex:1] [overflow:hidden]"
        }
      >
        <AgGridReact
          theme={gridTheme}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
            minWidth: 48,
            maxWidth: 640,
            ...defaultColDef,
          }}
          suppressCellFocus
          animateRows={!reducedMotion}
          rowHeight={44}
          headerHeight={38}
          suppressRowHoverHighlight={false}
          pagination={showPagination}
          paginationPageSize={pageSize}
          paginationPageSizeSelector={false}
          suppressPaginationPanel={true}
          domLayout={domLayout}
          onGridReady={(e) => {
            apiRef.current = e.api
            setReady(true)
            props.onGridReady?.(e)
          }}
          {...props}
        />
      </div>
      {showPagination && ready && apiRef.current && (
        <PaginationBar
          api={apiRef.current}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  )
}
