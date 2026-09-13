import { useMemo, useState } from "react";
import {
  FiArrowRight,
  FiBarChart2,
  FiInfo,
  FiLink2,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";
import Card, { CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import StatsCards from "../components/dashboard/StatsCards";
import LinkTable from "../components/dashboard/LinkTable";
import CreateLinkForm from "../components/dashboard/CreateLinkForm";
import {
  LinkTableSkeleton,
  StatCardsSkeleton,
} from "../components/ui/Skeleton";
import { useLinks, deriveLinkStats } from "../hooks/useLinks";
import { useAuth } from "../hooks/useAuth";
import { formatNumber } from "../utils/format";

const RECENT_LIMIT = 5;

/** Main authenticated dashboard. */
export default function Dashboard() {
  const { user } = useAuth();
  const { links, loading, error, refresh, prependLink } = useLinks();
  const [modalOpen, setModalOpen] = useState(false);

  const stats = useMemo(() => deriveLinkStats(links), [links]);
  const recentLinks = useMemo(() => links.slice(0, RECENT_LIMIT), [links]);

  const firstName = (user?.fullName || user?.username || "there").split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ---------------- Welcome ---------------- */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[1.7rem]">
            Welcome back, {firstName} 👋
          </h2>
          <p className="mt-1.5 text-[14px] text-ink-500">
            {stats.totalLinks === 0
              ? "Create your first short link to get started."
              : `You have ${stats.totalLinks} ${
                  stats.totalLinks === 1 ? "link" : "links"
                } collecting ${formatNumber(stats.totalClicks)} clicks in total.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            icon={
              <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />
            }
            onClick={refresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </section>

      {/* ---------------- Create link ---------------- */}
      <Card>
        <CreateLinkForm onCreated={prependLink} />
      </Card>

      {/* ---------------- Stats ---------------- */}
      {loading ? <StatCardsSkeleton /> : null}

      {!loading && error ? (
        <Card>
          <EmptyState
            tone="error"
            icon={FiInfo}
            title="We couldn't load your statistics"
            description={error.message}
            action={
              <Button variant="secondary" onClick={refresh}>
                Try again
              </Button>
            }
          />
        </Card>
      ) : null}

      {!loading && !error ? <StatsCards stats={stats} /> : null}

      {/* ---------------- Recent links ---------------- */}
      <Card padded={false}>
        <div className="p-6 pb-4">
          <CardHeader
            title="Recent links"
            subtitle={
              links.length > RECENT_LIMIT
                ? `Your ${RECENT_LIMIT} most recently created links.`
                : "The links in your library."
            }
            action={
              links.length > 0 ? (
                <Button
                  to="/links"
                  variant="ghost"
                  size="sm"
                  iconRight={<FiArrowRight size={15} />}
                >
                  View all
                </Button>
              ) : null
            }
          />
        </div>

        {loading ? (
          <LinkTableSkeleton rows={4} />
        ) : error ? (
          <EmptyState
            compact
            tone="error"
            icon={FiInfo}
            title="Couldn't load your links"
            description={error.message}
            action={
              <Button variant="secondary" size="sm" onClick={refresh}>
                Retry
              </Button>
            }
          />
        ) : recentLinks.length === 0 ? (
          <EmptyState
            compact
            icon={FiLink2}
            title="No links yet"
            description="Shorten your first URL using the form above. It will appear here with its click count."
          />
        ) : (
          <LinkTable links={recentLinks} compact />
        )}
      </Card>

      {/* ---------------- Secondary panels ---------------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Performance summary"
            subtitle="Calculated directly from your link data."
          />

          <div className="mt-6 space-y-4">
            <SummaryRow label="Most clicked link" value={mostClickedLabel(links)} />
            <SummaryRow
              label="Links with zero clicks"
              value={
                stats.totalLinks === 0
                  ? "—"
                  : `${formatNumber(stats.neverClicked)} of ${formatNumber(stats.totalLinks)}`
              }
            />
            <SummaryRow
              label="Average clicks per link"
              value={stats.totalLinks === 0 ? "—" : stats.averageClicks.toFixed(2)}
            />
            <SummaryRow
              label="Total clicks recorded"
              value={formatNumber(stats.totalClicks)}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Analytics" subtitle="What LinkForge records today." />

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="flex items-center gap-2 text-[13px] font-bold text-emerald-900">
                <FiBarChart2 size={15} aria-hidden="true" />
                Now available
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-emerald-800/85">
                Total clicks per link, plus totals across your whole library.
              </p>
            </div>

            <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/60 p-4">
              <p className="flex items-center gap-2 text-[13px] font-bold text-ink-700">
                <FiInfo size={15} aria-hidden="true" />
                Not tracked yet
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500">
                Referrers, countries, devices and clicks over time are not
                recorded by the API, so they are not displayed here.
              </p>
            </div>

            <Button to="/analytics" variant="secondary" fullWidth>
              View click totals
            </Button>
          </div>
        </Card>
      </div>

      {/* Mobile shortcut to the create modal */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lift transition-transform hover:scale-[1.03] lg:hidden"
        aria-label="Open create link dialog"
      >
        <FiPlus size={16} />
        New link
      </button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create a short link"
        description="Paste a long URL and LinkForge will generate a short code for it."
      >
        <CreateLinkForm
          onCreated={prependLink}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

/** Small label/value row used inside the summary panel. */
function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink-100 pb-3.5 last:border-0 last:pb-0">
      <span className="shrink-0 text-[13px] text-ink-500">{label}</span>
      <span className="truncate text-[13.5px] font-bold text-ink-900">
        {value}
      </span>
    </div>
  );
}

/** Highest-clickCount link, or a dash when nothing has been clicked. */
function mostClickedLabel(links) {
  if (!links.length) return "—";

  const top = links.reduce(
    (best, link) => (link.clickCount > best.clickCount ? link : best),
    links[0],
  );

  if (!top.clickCount) return "No clicks recorded";
  return `${top.shortCode} (${formatNumber(top.clickCount)})`;
}
