import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Hook: measure container height → derive count ───────── */
function useFillCount(itemHeight: number, min = 3, reserve = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(min);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const calc = (h: number) =>
      setCount(Math.max(min, Math.floor((h - reserve) / itemHeight)));
    const ro = new ResizeObserver(([entry]) =>
      calc(entry.contentRect.height),
    );
    ro.observe(el);
    calc(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, [itemHeight, min, reserve]);

  return { ref, count };
}

function useFillGrid(cardH: number, cardW: number, min = 3) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(min);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const calc = (w: number, h: number) => {
      const cols = Math.max(1, Math.floor(w / cardW));
      const rows = Math.max(1, Math.floor(h / cardH));
      setCount(Math.max(min, cols * rows));
    };
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      calc(width, height);
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    calc(r.width, r.height);
    return () => ro.disconnect();
  }, [cardH, cardW, min]);

  return { ref, count };
}

/* ── Atoms ──────────────────────────────────────────────── */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 16,
      }}
    >
      {children}
    </div>
  );
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
  cols?: number;
  colWidths?: string[];
  rowH?: number;
  headerH?: number;
  padX?: number;
}) {
  const ROW_H = rowH + 1; // + 1px row border
  const { ref, count } = useFillCount(ROW_H, 3, headerH);
  const template = colWidths?.join(" ");
  const n = colWidths ? colWidths.length : cols;

  // per-cell bar width: last-ish narrow cols read as badges/numbers
  const cellWidth = (c: number) => {
    if (colWidths) {
      const w = colWidths[c];
      if (w === "1fr") return "60%";
      const px = parseInt(w, 10);
      if (!Number.isNaN(px)) return `${Math.min(px - 16, Math.max(10, px - 20))}px`;
      return "60%";
    }
    return `${44 + (c % 5) * 16}px`;
  };

  const CellRow = ({
    r,
    isHeader = false,
  }: {
    r: number;
    isHeader?: boolean;
  }) => {
    const cells = Array.from({ length: n }).map((_, c) => (
      <div key={c} style={{ minWidth: 0 }}>
        <Skeleton
          style={{
            height: isHeader ? 9 : 10,
            width: isHeader ? "70%" : cellWidth(c),
            maxWidth: "100%",
            borderRadius: 4,
            opacity: isHeader ? 0.8 : 1 - c * 0.05,
          }}
        />
      </div>
    ));
    return template ? (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: template,
          gap: 12,
          alignItems: "center",
          padding: `0 ${padX}px`,
          height: isHeader ? headerH : rowH,
          borderBottom: isHeader
            ? "1px solid var(--border)"
            : r < count - 1
              ? "1px solid var(--border)"
              : "none",
          flexShrink: 0,
        }}
      >
        {cells}
      </div>
    ) : (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: `0 ${padX}px`,
          height: isHeader ? headerH : rowH,
          borderBottom: isHeader
            ? "1px solid var(--border)"
            : r < count - 1
              ? "1px solid var(--border)"
              : "none",
          flexShrink: 0,
        }}
      >
        {cells}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        minHeight: 0,
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CellRow r={-1} isHeader />
      {Array.from({ length: count }).map((_, r) => (
        <CellRow key={r} r={r} />
      ))}
    </div>
  );
}

/* ── Dynamic card grid skeleton ─────────────────────────── */
function DynamicGrid({
  cardMinW = 260,
  cardH = 110,
  children,
}: {
  cardMinW?: number;
  cardH?: number;
  children?: (i: number) => React.ReactNode;
}) {
  const { ref, count } = useFillGrid(cardH + 16, cardMinW + 16, 3);

  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${cardMinW}px, 1fr))`,
        gap: 16,
        alignContent: "start",
        overflow: "hidden",
      }}
    >
      {Array.from({ length: count }).map((_, i) =>
        children ? (
          <div key={i}>{children(i)}</div>
        ) : (
          <div
            key={i}
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 16,
              height: cardH,
            }}
          >
            <Skeleton style={{ height: 10, width: "55%", borderRadius: 4, marginBottom: 12 }} />
            <Skeleton style={{ height: 10, width: "85%", borderRadius: 4, marginBottom: 8 }} />
            <Skeleton style={{ height: 10, width: "65%", borderRadius: 4 }} />
          </div>
        ),
      )}
    </div>
  );
}

/* ── Page header (shared) ───────────────────────────────── */
function PageHeader({
  titleW = 160,
  actions = 2,
}: {
  titleW?: number;
  actions?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 16,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {/* h1 is 18px on real pages */}
        <Skeleton style={{ height: 16, width: titleW, borderRadius: 4 }} />
        <Skeleton style={{ height: 10, width: titleW + 60, borderRadius: 4 }} />
      </div>
      {actions > 0 && (
        <div style={{ display: "flex", gap: 8 }}>
          {Array.from({ length: actions }).map((_, i) => (
            <Skeleton
              key={i}
              style={{ height: 30, width: i === 0 ? 100 : 80, borderRadius: 6 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Tab row (Metrics, Alerts, etc.) ────────────────────── */
function TabRow({ tabs = 4 }: { tabs?: number }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        marginBottom: 16,
        flexShrink: 0,
        borderBottom: "1px solid var(--border)",
        paddingBottom: 10,
      }}
    >
      {Array.from({ length: tabs }).map((_, i) => (
        <Skeleton
          key={i}
          style={{ height: 26, width: 80 + (i % 3) * 20, borderRadius: 6 }}
        />
      ))}
    </div>
  );
}

/* ── Stat cards row ─────────────────────────────────────── */
function StatCards({ count = 4 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        gap: 0,
        marginBottom: 16,
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: "12px 16px",
            background: "var(--bg-2)",
            borderRight: i < count - 1 ? "1px solid var(--border)" : "none",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Skeleton style={{ height: 9, width: 80, borderRadius: 3 }} />
          <Skeleton style={{ height: 22, width: 64, borderRadius: 4 }} />
          <Skeleton style={{ height: 9, width: 48, borderRadius: 3 }} />
        </div>
      ))}
    </div>
  );
}

/* ── Chart skeleton ─────────────────────────────────────── */
function ChartSkeleton({ height = 160 }: { height?: number }) {
  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 16,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <Skeleton style={{ height: 10, width: 100, borderRadius: 4 }} />
        <Skeleton style={{ height: 24, width: 72, borderRadius: 5 }} />
      </div>
      <Skeleton style={{ width: "100%", height, borderRadius: 6 }} />
    </div>
  );
}

/* ── Toolbar row (filters/search bar) ───────────────────── */
function ToolbarSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12, flexShrink: 0 }}>
      <Skeleton style={{ height: 30, flex: 1, maxWidth: 220, borderRadius: 6 }} />
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} style={{ height: 30, width: 90 + i * 16, borderRadius: 6 }} />
      ))}
    </div>
  );
}

/* ── Full page wrappers ─────────────────────────────────── */
const PAD: React.CSSProperties = {
  padding: "20px 24px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  overflow: "hidden",
};

export function OverviewSkeleton() {
  return (
    <div style={PAD}>
      <PageHeader titleW={140} />
      {/* KPI strip: repeat(4, 1fr) */}
      <StatCards count={4} />
      {/* Charts row: 2fr / 1fr */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12, flexShrink: 0 }}>
        <ChartSkeleton height={120} />
        <ChartSkeleton height={120} />
      </div>
      {/* Service list: "1fr 40px 50px 46px" */}
      <DynamicTable colWidths={["1fr", "40px", "50px", "46px"]} />
    </div>
  );
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
  statCount?: number;
  cols?: number;
  colWidths?: string[];
  toolbarItems?: number;
  rowH?: number;
  padX?: number;
  titleW?: number;
}) {
  return (
    <div style={PAD}>
      <PageHeader titleW={titleW} />
      {statCount > 0 && <StatCards count={statCount} />}
      <ToolbarSkeleton items={toolbarItems} />
      <DynamicTable cols={cols} colWidths={colWidths} rowH={rowH} padX={padX} />
    </div>
  );
}

/* Logs — 4-stat strip, 3 filters, "116px 92px 160px 1fr" table */
export function LogsSkeleton() {
  return (
    <div style={PAD}>
      <PageHeader titleW={80} />
      <StatCards count={4} />
      <ToolbarSkeleton items={3} />
      <DynamicTable colWidths={["116px", "92px", "160px", "1fr"]} />
    </div>
  );
}

/* Traces — 4-stat strip, filters, 8-col table with expand caret */
export function TracesSkeleton() {
  return (
    <div style={PAD}>
      <PageHeader titleW={90} />
      <StatCards count={4} />
      <ToolbarSkeleton items={3} />
      <DynamicTable
        colWidths={["28px", "180px", "1fr", "140px", "72px", "100px", "100px", "84px"]}
      />
    </div>
  );
}

/* Metrics — fixed 2-column chart-card grid (Recharts ~110px each) */
export function MetricsSkeleton() {
  return (
    <div style={PAD}>
      <PageHeader titleW={100} />
      <TabRow tabs={4} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
          alignContent: "start",
          overflow: "auto",
          flex: 1,
          minHeight: 0,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Skeleton style={{ height: 10, width: 120, borderRadius: 4 }} />
              <Skeleton style={{ height: 10, width: 48, borderRadius: 4 }} />
            </div>
            <Skeleton style={{ width: "100%", height: 110, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AISkeleton() {
  return (
    <div style={PAD}>
      <PageHeader />
      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
        <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}
            >
              <Skeleton style={{ height: 9, width: "70%", borderRadius: 3, marginBottom: 8 }} />
              <Skeleton style={{ height: 28, width: "100%", borderRadius: 5 }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <ChartSkeleton height={180} />
          <DynamicTable cols={4} />
        </div>
      </div>
    </div>
  );
}

/* Settings — 200px nav sidebar + 1fr multi-section panel (44px rows) */
export function ProfileSkeleton() {
  return (
    <div style={PAD}>
      <PageHeader titleW={100} actions={1} />
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24, flex: 1, minHeight: 0 }}>
        {/* Nav sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              key={i}
              style={{ height: 32, width: "100%", borderRadius: 6, opacity: i === 0 ? 1 : 0.6 }}
            />
          ))}
        </div>
        {/* Panel: profile header + a couple of dense tables */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <Skeleton style={{ width: 48, height: 48, borderRadius: "50%" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton style={{ height: 12, width: 140, borderRadius: 4 }} />
              <Skeleton style={{ height: 10, width: 200, borderRadius: 4 }} />
            </div>
          </div>
          <DynamicTable
            colWidths={["1fr", "160px", "100px", "100px", "100px", "80px", "80px"]}
            rowH={44}
          />
        </div>
      </div>
    </div>
  );
}

export function DefaultPageSkeleton() {
  return (
    <div style={PAD}>
      <PageHeader />
      <StatCards count={3} />
      <ChartSkeleton height={140} />
      <div style={{ marginTop: 12, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <DynamicTable />
      </div>
    </div>
  );
}

export function DeploymentsSkeleton() {
  return (
    <div style={PAD}>
      <PageHeader titleW={130} />
      <ToolbarSkeleton items={3} />
      {/* 8-col table, rows padded 0 32px */}
      <DynamicTable
        colWidths={["96px", "160px", "1fr", "108px", "110px", "88px", "148px", "88px"]}
        padX={32}
      />
    </div>
  );
}

export function DependenciesSkeleton() {
  return (
    <div style={PAD}>
      <PageHeader />
      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Skeleton style={{ flex: 1, borderRadius: 8 }} />
        </div>
        <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <Skeleton style={{ height: 10, width: 100, borderRadius: 3, marginBottom: 12 }} />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} style={{ height: 30, width: "100%", borderRadius: 5, marginBottom: 6 }} />
            ))}
          </Card>
          <Card>
            <Skeleton style={{ height: 10, width: 80, borderRadius: 3, marginBottom: 12 }} />
            <Skeleton style={{ height: 60, width: "100%", borderRadius: 5 }} />
          </Card>
        </div>
      </div>
    </div>
  );
}

export function IntegrationsSkeleton() {
  return (
    <div style={PAD}>
      <PageHeader titleW={120} />
      {/* card grid: repeat(auto-fill, minmax(300px, 1fr)) — 40px icon */}
      <DynamicGrid cardMinW={300} cardH={124}>
        {() => (
          <div
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 16,
              height: 124,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Skeleton style={{ width: 40, height: 40, borderRadius: 8 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Skeleton style={{ height: 11, width: 100, borderRadius: 4 }} />
                <Skeleton style={{ height: 8, width: 64, borderRadius: 3 }} />
              </div>
            </div>
            <Skeleton style={{ height: 9, width: "90%", borderRadius: 3, marginBottom: 6 }} />
            <Skeleton style={{ height: 9, width: "60%", borderRadius: 3 }} />
          </div>
        )}
      </DynamicGrid>
    </div>
  );
}

export function AlertsSkeleton() {
  return (
    <div style={PAD}>
      <PageHeader titleW={100} />
      <StatCards count={4} />
      <TabRow tabs={2} />
      <ToolbarSkeleton items={3} />
      <DynamicTable cols={7} />
    </div>
  );
}

export function ApiDebuggerSkeleton() {
  return (
    <div style={PAD}>
      <PageHeader titleW={120} actions={0} />
      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
        {/* History sidebar */}
        <div
          style={{
            width: 240,
            flexShrink: 0,
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Skeleton style={{ height: 30, width: "100%", borderRadius: 6, marginBottom: 4 }} />
          <DynamicTableInner cols={1} rowH={40} />
        </div>
        {/* Request/response column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          {/* request bar: method + url + send */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Skeleton style={{ height: 34, width: 104, borderRadius: 7 }} />
            <Skeleton style={{ height: 34, flex: 1, borderRadius: 7 }} />
            <Skeleton style={{ height: 34, width: 90, borderRadius: 7 }} />
          </div>
          {/* config editor block */}
          <Skeleton style={{ height: 150, width: "100%", borderRadius: 8, flexShrink: 0 }} />
          {/* response block */}
          <Skeleton style={{ flex: 1, minHeight: 0, width: "100%", borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}

/* thin inner table used inside panels */
function DynamicTableInner({ cols = 2, rowH = 36 }: { cols?: number; rowH?: number }) {
  const { ref, count } = useFillCount(rowH, 3, 0);
  return (
    <div ref={ref} style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", gap: 6 }}>
      {Array.from({ length: count }).map((_, r) => (
        <div key={r} style={{ display: "flex", gap: 8 }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} style={{ height: rowH - 6, flex: 1, borderRadius: 5 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function RouteSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: 260 }}>
        <Skeleton style={{ width: 40, height: 40, borderRadius: 10 }} />
        <Skeleton style={{ height: 12, width: 120, borderRadius: 4 }} />
        <Skeleton style={{ height: 10, width: 180, borderRadius: 4 }} />
        <Skeleton style={{ height: 3, width: 100, borderRadius: 99 }} />
      </div>
    </div>
  );
}
