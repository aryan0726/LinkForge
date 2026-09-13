/**
 * Loading placeholders. Skeletons mirror the real layout dimensions so the
 * page does not shift when data arrives.
 */

export function Skeleton({ className = "", rounded = "rounded-lg" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-shimmer bg-ink-200/70 ${rounded} ${className}`}
    />
  );
}

/** Grid of stat-card skeletons for the dashboard. */
export function StatCardsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-card"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-9" rounded="rounded-xl" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="mt-4 h-7 w-20" />
          <Skeleton className="mt-2.5 h-3.5 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Table skeleton matching the link table column rhythm. */
export function LinkTableSkeleton({ rows = 5 }) {
  return (
    <div className="overflow-hidden" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-ink-100 px-4 py-4 last:border-0"
        >
          <Skeleton className="h-9 w-9 shrink-0" rounded="rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="hidden h-4 w-14 sm:block" />
          <Skeleton className="hidden h-4 w-10 md:block" />
          <Skeleton className="h-8 w-8 shrink-0" rounded="rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** Generic card skeleton for dashboard side panels. */
export function PanelSkeleton({ lines = 4 }) {  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-10" />
          </div>
          <Skeleton className="h-2 w-full" rounded="rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
