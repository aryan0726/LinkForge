import { FiLink2, FiMousePointer, FiTrendingUp, FiActivity } from "react-icons/fi";
import { formatNumber } from "../../utils/format";

/**
 * Dashboard statistic cards.
 *
 * Every value is computed from the real GET /api/links response. There are no
 * percentage-change figures because the API returns no historical time series to
 * compare against.
 */
export default function StatsCards({ stats }) {
  const { totalLinks, totalClicks, clickedLinks, neverClicked, averageClicks } =
    stats;

  const cards = [
    {
      key: "links",
      label: "Total links",
      value: formatNumber(totalLinks),
      caption: totalLinks === 0 ? "No links yet" : "In your library",
      icon: FiLink2,
      tone: "from-brand-500 to-accent-600",
    },
    {
      key: "clicks",
      label: "Total clicks",
      value: formatNumber(totalClicks),
      caption: totalClicks === 0 ? "No visits recorded" : "Across all links",
      icon: FiMousePointer,
      tone: "from-violet-500 to-fuchsia-500",
    },
    {
      key: "avg",
      label: "Avg. clicks / link",
      value: averageClicks < 10 ? averageClicks.toFixed(1) : formatNumber(Math.round(averageClicks)),
      caption: totalLinks === 0 ? "—" : "Mean per link",
      icon: FiTrendingUp,
      tone: "from-sky-500 to-indigo-600",
    },
    {
      key: "active",
      label: "Links with clicks",
      value: formatNumber(clickedLinks),
      caption:
        neverClicked === 0
          ? "Every link has been visited"
          : `${formatNumber(neverClicked)} never clicked`,
      icon: FiActivity,
      tone: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.key}
          className="group rounded-2xl border border-ink-200/80 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
        >
          <div className="flex items-start justify-between">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.tone} text-white shadow-[0_8px_18px_-10px_rgba(15,23,42,0.5)]`}
            >
              <card.icon size={17} aria-hidden="true" />
            </span>
          </div>

          <p className="mt-4 text-[11.5px] font-bold uppercase tracking-[0.1em] text-ink-400">
            {card.label}
          </p>

          <p className="mt-1.5 text-[28px] font-extrabold leading-none tracking-tight text-ink-900">
            {card.value}
          </p>

          <p className="mt-2.5 truncate text-[12.5px] text-ink-500">
            {card.caption}
          </p>
        </article>
      ))}
    </div>
  );
}
