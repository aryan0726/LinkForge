import { useMemo, useState } from "react";
import {
  FiBarChart2,
  FiInfo,
  FiMousePointer,
  FiRefreshCw,
  FiTrendingUp,
} from "react-icons/fi";
import Card, { CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { PanelSkeleton, StatCardsSkeleton } from "../components/ui/Skeleton";
import { useLinks, deriveLinkStats } from "../hooks/useLinks";
import { formatNumber } from "../utils/format";

/**
 * Analytics.
 *
 * IMPORTANT — scope honesty: the backend tracks only an aggregate click count
 * per link. There is no endpoint returning clicks over time, referrers, devices
 * or geography. Rather than render an invented time-series chart, this page
 * presents the real click ranking and clearly documents what is not collected.
 * The previous version of this project drew a hardcoded 7-day line chart and a
 * fabricated country breakdown; both have been removed.
 */
export default function Analytics() {
  const { links, loading, error, refresh } = useLinks();
  const [showAll, setShowAll] = useState(false);

  const stats = useMemo(() => deriveLinkStats(links), [links]);

  // Ranked by real click counts, highest first.
  const ranked = useMemo(
    () => [...links].sort((a, b) => b.clickCount - a.clickCount),
    [links],
  );

  const visible = showAll ? ranked : ranked.slice(0, 8);
  const maxClicks = ranked.length ? Math.max(...ranked.map((l) => l.clickCount), 1) : 1;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[1.7rem]">
            Analytics
          </h2>
          <p className="mt-1.5 text-[14px] text-ink-500">
            Click totals recorded across your links.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          icon={<FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />}
          onClick={refresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </section>

      {/* ---------------- Headline metrics ---------------- */}
      {loading ? (
        <StatCardsSkeleton count={3} />
      ) : error ? null : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            icon={FiMousePointer}
            label="Total clicks"
            value={formatNumber(stats.totalClicks)}
            tone="from-brand-500 to-accent-600"
          />
          <MetricCard
            icon={FiTrendingUp}
            label="Avg. per link"
            value={stats.totalLinks ? stats.averageClicks.toFixed(2) : "—"}
            tone="from-violet-500 to-fuchsia-500"
          />
          <MetricCard
            icon={FiBarChart2}
            label="Links with clicks"
            value={`${formatNumber(stats.clickedLinks)} / ${formatNumber(stats.totalLinks)}`}
            tone="from-emerald-500 to-teal-600"
          />
        </div>
      )}

      {/* ---------------- Click ranking ---------------- */}
      <Card>
        <CardHeader
          title="Clicks by link"
          subtitle="Ranked by total clicks recorded for each short link."
        />

        <div className="mt-6">
          {loading ? (
            <PanelSkeleton lines={6} />
          ) : error ? (
            <EmptyState
              tone="error"
              icon={FiInfo}
              title="We couldn't load your analytics"
              description={error.message}
              action={
                <Button variant="secondary" onClick={refresh}>
                  Try again
                </Button>
              }
            />
          ) : ranked.length === 0 ? (
            <EmptyState
              compact
              icon={FiBarChart2}
              title="No data to show yet"
              description="Create a short link and share it. As soon as someone visits it, clicks will appear here."
              action={<Button to="/dashboard">Create a link</Button>}
            />
          ) : (
            <>
              <ul className="space-y-4">
                {visible.map((link, index) => {
                  const share = stats.totalClicks
                    ? Math.round((link.clickCount / stats.totalClicks) * 100)
                    : 0;
                  const width = Math.round((link.clickCount / maxClicks) * 100);

                  return (
                    <li key={link.shortCode}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="w-5 shrink-0 font-mono text-[11.5px] font-bold text-ink-300">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <a
                            href={link.shortUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="truncate font-mono text-[13px] font-semibold text-brand-600 hover:underline"
                          >
                            {link.shortCode}
                          </a>
                          <span className="hidden truncate text-[12px] text-ink-400 sm:block">
                            {link.originalUrl.replace(/^https?:\/\//, "").slice(0, 42)}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-[12px] font-medium text-ink-400">
                            {share}%
                          </span>
                          <span className="w-16 text-right text-[13px] font-bold text-ink-900">
                            {formatNumber(link.clickCount)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-[width] duration-700 ease-out"
                          style={{ width: `${Math.max(width, link.clickCount ? 4 : 0)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>

              {ranked.length > 8 ? (
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="mt-6 text-[13px] font-semibold text-brand-600 hover:underline"
                >
                  {showAll ? "Show top 8" : `Show all ${ranked.length} links`}
                </button>
              ) : null}
            </>
          )}
        </div>
      </Card>

      {/* ---------------- Scope documentation ---------------- */}
      <Card className="border-dashed bg-ink-50/50">
        <CardHeader
          title="About these numbers"
          subtitle="What the API records, and what it does not."
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <p className="text-[12.5px] font-bold uppercase tracking-wider text-emerald-700">
              Recorded
            </p>
            <ul className="mt-2.5 space-y-1.5 text-[13px] text-emerald-900/85">
              <li>• A running click count per short link</li>
              <li>• Totals and averages across your library</li>
              <li>• Each click increments when a redirect is served</li>
            </ul>
          </div>

          <div className="rounded-xl border border-dashed border-ink-200 bg-white p-4">
            <p className="text-[12.5px] font-bold uppercase tracking-wider text-ink-400">
              Not recorded
            </p>
            <ul className="mt-2.5 space-y-1.5 text-[13px] text-ink-500">
              <li>• Clicks over time / trends</li>
              <li>• Referrer sources</li>
              <li>• Country, device or browser</li>
              <li>• Unique visitors</li>
            </ul>
          </div>
        </div>

        <p className="mt-5 text-[12.5px] leading-relaxed text-ink-500">
          These views are intentionally left out rather than filled with sample
          data. When the corresponding endpoints exist, they can be added without
          changing how the rest of the page works.
        </p>
      </Card>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  return (
    <article className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-card">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-[0_8px_18px_-10px_rgba(15,23,42,0.5)]`}
      >
        <Icon size={17} aria-hidden="true" />
      </span>
      <p className="mt-4 text-[11.5px] font-bold uppercase tracking-[0.1em] text-ink-400">
        {label}
      </p>
      <p className="mt-1.5 text-[26px] font-extrabold leading-none tracking-tight text-ink-900">
        {value}
      </p>
    </article>
  );
}
