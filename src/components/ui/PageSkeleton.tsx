import { Skeleton } from "@/components/ui/skeleton";

/* ── Reusable atoms ───────────────────────────────────── */
function Row({ w = "full", h = 4 }: { w?: string | number; h?: number }) {
  return <Skeleton className={`h-${h} rounded`} style={{ width: typeof w === "number" ? w : w === "full" ? "100%" : w }} />;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}
    >
      {children}
    </div>
  );
}

/* ── Page header (shared by most pages) ──────────────── */
function PageHeader() {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-4 w-36 rounded" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

/* ── Stat card row (Overview / Dashboard) ─────────────── */
function StatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${count}, 1fr)`, marginBottom: 20 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <Skeleton className="h-3 w-20 rounded mb-3" />
          <Skeleton className="h-8 w-16 rounded mb-2" />
          <Skeleton className="h-3 w-24 rounded" />
        </Card>
      ))}
    </div>
  );
}

/* ── Table skeleton (grid pages) ─────────────────────── */
function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Card>
      {/* Header */}
      <div className="flex gap-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 rounded" style={{ width: `${60 + (i % 3) * 20}px` }} />
        ))}
      </div>
      {/* Rows */}
      <div className="space-y-0">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="flex items-center gap-4"
            style={{ padding: "10px 0", borderBottom: r < rows - 1 ? "1px solid var(--border)" : "none" }}
          >
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className="h-3 rounded"
                style={{ width: `${50 + ((r + c) % 4) * 18}px`, opacity: 1 - c * 0.06 }}
              />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Chart skeleton ───────────────────────────────────── */
function ChartSkeleton({ height = 180 }: { height?: number }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>
      <Skeleton className="w-full rounded" style={{ height }} />
    </Card>
  );
}

/* ── Avatar + text row (user/profile cells) ───────────── */
function AvatarRow() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px] rounded" />
        <Skeleton className="h-4 w-[200px] rounded" />
      </div>
    </div>
  );
}

/* ── Sidebar + content (AI / split layouts) ────────────── */
function SplitSkeleton() {
  return (
    <div className="flex gap-4" style={{ height: "100%" }}>
      <div className="space-y-3" style={{ width: 280, flexShrink: 0 }}>
        {[60, 48, 72, 48, 56].map((h, i) => (
          <Card key={i}>
            <Skeleton className="h-3 w-3/4 rounded mb-2" />
            <Skeleton className={`h-${h > 60 ? 10 : 8} w-full rounded`} />
          </Card>
        ))}
      </div>
      <div className="flex-1 space-y-4">
        <ChartSkeleton height={220} />
        <TableSkeleton rows={5} cols={4} />
      </div>
    </div>
  );
}

/* ── Named exports for each page type ─────────────────── */

export function OverviewSkeleton() {
  return (
    <div className="page-pad" style={{ maxWidth: 1600 }}>
      <PageHeader />
      <StatCards count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartSkeleton height={160} />
        <ChartSkeleton height={160} />
      </div>
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}

export function TablePageSkeleton({ statCount = 0 }: { statCount?: number }) {
  return (
    <div className="page-pad" style={{ maxWidth: 1600 }}>
      <PageHeader />
      {statCount > 0 && <StatCards count={statCount} />}
      <TableSkeleton rows={9} cols={6} />
    </div>
  );
}

export function MetricsSkeleton() {
  return (
    <div className="page-pad" style={{ maxWidth: 1600 }}>
      <PageHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ChartSkeleton key={i} height={90} />
        ))}
      </div>
    </div>
  );
}

export function AISkeleton() {
  return (
    <div className="page-pad" style={{ maxWidth: 1600 }}>
      <PageHeader />
      <SplitSkeleton />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="page-pad space-y-6" style={{ maxWidth: 800 }}>
      <PageHeader />
      <AvatarRow />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-3 w-24 rounded mb-2" />
            <Skeleton className="h-8 w-full rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ── Default full-page fallback ───────────────────────── */
export function DefaultPageSkeleton() {
  return (
    <div className="page-pad" style={{ maxWidth: 1600 }}>
      <PageHeader />
      <StatCards count={3} />
      <div className="space-y-4">
        <ChartSkeleton />
        <TableSkeleton />
      </div>
    </div>
  );
}
