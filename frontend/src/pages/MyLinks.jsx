import { useMemo, useState } from "react";
import {
  FiFilter,
  FiInfo,
  FiLink2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import LinkTable from "../components/dashboard/LinkTable";
import CreateLinkForm from "../components/dashboard/CreateLinkForm";
import { LinkTableSkeleton } from "../components/ui/Skeleton";
import { useLinks } from "../hooks/useLinks";
import { formatNumber, getHostname } from "../utils/format";

const SORT_OPTIONS = [
  { value: "clicks-desc", label: "Most clicks" },
  { value: "clicks-asc", label: "Fewest clicks" },
  { value: "url-asc", label: "Destination A–Z" },
  { value: "code-asc", label: "Short code A–Z" },
];

/** Filter views, driven entirely by real fields. */
const FILTERS = [
  { value: "all", label: "All links" },
  { value: "clicked", label: "Has clicks" },
  { value: "never", label: "No clicks yet" },
];

/**
 * My Links — full library management.
 *
 * Search and sort run client-side over the single GET /api/links response; the
 * backend exposes no query parameters, pagination or delete endpoint, so the UI
 * does not pretend otherwise.
 */
export default function MyLinks() {
  const { links, loading, error, refresh, prependLink } = useLinks();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("clicks-desc");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  const visibleLinks = useMemo(() => {
    const term = query.trim().toLowerCase();

    let result = links;

    if (term) {
      result = result.filter(
        (link) =>
          link.shortCode.toLowerCase().includes(term) ||
          link.originalUrl.toLowerCase().includes(term) ||
          getHostname(link.originalUrl).toLowerCase().includes(term),
      );
    }

    if (filter === "clicked") {
      result = result.filter((link) => link.clickCount > 0);
    } else if (filter === "never") {
      result = result.filter((link) => link.clickCount === 0);
    }

    const sorted = [...result];
    switch (sort) {
      case "clicks-asc":
        sorted.sort((a, b) => a.clickCount - b.clickCount);
        break;
      case "url-asc":
        sorted.sort((a, b) => a.originalUrl.localeCompare(b.originalUrl));
        break;
      case "code-asc":
        sorted.sort((a, b) => a.shortCode.localeCompare(b.shortCode));
        break;
      case "clicks-desc":
      default:
        sorted.sort((a, b) => b.clickCount - a.clickCount);
        break;
    }

    return sorted;
  }, [links, query, sort, filter]);

  const isFiltering = query.trim() !== "" || filter !== "all";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ---------------- Header ---------------- */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[1.7rem]">
            My links
          </h2>
          <p className="mt-1.5 text-[14px] text-ink-500">
            {loading
              ? "Loading your library…"
              : links.length === 0
                ? "Your library is empty."
                : `${formatNumber(links.length)} ${
                    links.length === 1 ? "link" : "links"
                  } in your library.`}
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
          <Button
            size="md"
            icon={<FiPlus size={16} />}
            onClick={() => setModalOpen(true)}
          >
            New link
          </Button>
        </div>
      </section>

      {/* ---------------- Toolbar ---------------- */}
      <Card>
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
              size={17}
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by short code, domain or destination URL…"
              aria-label="Search links"
              className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-10.5 pr-10 text-sm text-ink-900 placeholder:text-ink-400 transition-all focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              >
                <FiX size={14} />
              </button>
            ) : null}
          </div>

          {/* Filter chips */}
          <div
            className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-ink-50 p-1"
            role="group"
            aria-label="Filter links"
          >
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={filter === option.value}
                className={[
                  "h-9 rounded-lg px-3.5 text-[12.5px] font-semibold transition-all",
                  filter === option.value
                    ? "bg-white text-brand-700 shadow-soft"
                    : "text-ink-500 hover:text-ink-800",
                ].join(" ")}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative lg:w-52">
            <FiFilter
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
              size={15}
              aria-hidden="true"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort links"
              className="h-11 w-full appearance-none rounded-xl border border-ink-200 bg-white pl-10 pr-8 text-[13px] font-medium text-ink-700 transition-all focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M3 4.5 6 7.5l3-3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>

        {isFiltering && !loading ? (
          <p className="mt-3.5 text-[12.5px] text-ink-500">
            Showing {formatNumber(visibleLinks.length)} of{" "}
            {formatNumber(links.length)}{" "}
            {links.length === 1 ? "link" : "links"}
            {query.trim() ? (
              <>
                {" "}
                matching <span className="font-semibold">“{query.trim()}”</span>
              </>
            ) : null}
            .
          </p>
        ) : null}
      </Card>

      {/* ---------------- Table ---------------- */}
      <Card padded={false} className="overflow-hidden">
        {loading ? (
          <LinkTableSkeleton rows={6} />
        ) : error ? (
          <EmptyState
            tone="error"
            icon={FiInfo}
            title="We couldn't load your links"
            description={error.message}
            action={
              <Button variant="secondary" onClick={refresh}>
                Try again
              </Button>
            }
          />
        ) : links.length === 0 ? (
          <EmptyState
            icon={FiLink2}
            title="No links yet"
            description="Once you shorten a URL it will show up here, along with how many clicks it has received."
            action={
              <Button
                icon={<FiPlus size={16} />}
                onClick={() => setModalOpen(true)}
              >
                Create your first link
              </Button>
            }
          />
        ) : visibleLinks.length === 0 ? (
          <EmptyState
            icon={FiSearch}
            title="No matches"
            description="No links match the current search and filter. Try a different term or reset the filters."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <LinkTable links={visibleLinks} />
        )}
      </Card>

      {/* ---------------- Scope note ---------------- */}
      {!loading && !error && links.length > 0 ? (
        <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-400">
          <FiInfo className="mt-0.5 shrink-0" size={13} aria-hidden="true" />
          LinkForge currently records total clicks per link. Referrer, device and
          location breakdowns, as well as per-link creation dates, are not yet
          stored by the API.
        </p>
      ) : null}

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
