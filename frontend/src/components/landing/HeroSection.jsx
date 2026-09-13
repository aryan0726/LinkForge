import Button from "../ui/Button";
import CopyButton from "../ui/CopyButton";
import { FiArrowRight, FiCheck, FiTrendingUp } from "react-icons/fi";

/**
 * Landing hero.
 *
 * The product preview is a faithful static mock of the real dashboard: it shows
 * only fields the backend actually returns (originalUrl, shortCode, shortUrl,
 * clickCount). No invented metrics, no fake charts.
 */

const PREVIEW_ROWS = [
  {
    label: "Product launch page",
    host: "linkforge.dev/launch",
    code: "lf8aQz",
    clicks: "1,284",
  },
  {
    label: "Spring Boot starter repo",
    host: "github.com/linkforge/backend",
    code: "kR3mPw",
    clicks: "862",
  },
  {
    label: "Documentation site",
    host: "docs.linkforge.dev",
    code: "T9sVcn",
    clicks: "437",
  },
];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-white pb-20 pt-14 sm:pb-28 sm:pt-20"
    >
      {/* Ambient brand wash + grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 surface-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-300/35 via-accent-400/25 to-transparent blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          {/* ---------------- Copy ---------------- */}
          <div className="animate-fade-up text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-[12.5px] font-semibold text-brand-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-600" />
              </span>
              URL shortening &amp; link management
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.4rem]">
              Forge smarter links.
              <br />
              <span className="text-gradient">Share with confidence.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-[15.5px] leading-relaxed text-ink-600 lg:mx-0 sm:text-base">
              LinkForge turns long, unwieldy URLs into clean short links you can
              actually share — then keeps them organised in one account. Create a
              link in seconds, manage your whole library, and see how many clicks
              each one earns.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Button
                to="/register"
                size="lg"
                iconRight={<FiArrowRight size={17} />}
                className="w-full sm:w-auto"
              >
                Get Started
              </Button>
              <Button
                to="/login"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Log In
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[13px] font-medium text-ink-500 lg:justify-start">
              {["Free to use", "No credit card required", "JWT-secured accounts"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <FiCheck className="text-emerald-500" size={14} />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* ---------------- Product preview ---------------- */}
          <div className="animate-fade-up [animation-delay:120ms]">
            <ProductPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Static, non-interactive mock of the dashboard. Labelled as a preview so it is
 * never mistaken for live data.
 */
function ProductPreview() {
  return (
    <div className="relative mx-auto max-w-xl">
      <div
        aria-hidden="true"
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-400/25 via-accent-400/20 to-transparent blur-2xl"
      />

      <div className="relative overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-pop">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/80 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ink-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-300" />
          </div>
          <span className="ml-2 truncate rounded-md bg-white px-2.5 py-1 text-[11px] font-medium text-ink-400 ring-1 ring-ink-200">
            app.linkforge.dev/dashboard
          </span>
          <span className="ml-auto hidden rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-600 sm:block">
            Preview
          </span>
        </div>

        <div className="p-4 sm:p-5">
          {/* Real stat fields only */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Total Links", value: "3" },
              { label: "Total Clicks", value: "2,583" },
              { label: "Clicked Links", value: "3" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-ink-200/80 bg-ink-50/50 p-3"
              >
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-lg font-bold tracking-tight text-ink-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Create-link field */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-ink-200 bg-white p-1.5 pl-3.5">
            <span className="truncate text-[13px] text-ink-400">
              https://your-long-url.com/paste-here
            </span>
            <span className="ml-auto shrink-0 rounded-lg bg-gradient-to-b from-brand-500 to-brand-600 px-3.5 py-2 text-[12.5px] font-semibold text-white">
              Shorten
            </span>
          </div>

          {/* Link list */}
          <div className="mt-4 space-y-1.5">
            {PREVIEW_ROWS.map((row) => (
              <div
                key={row.code}
                className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-3 py-2.5 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-[11px] font-bold text-brand-600 ring-1 ring-brand-100">
                  {row.code.slice(0, 2).toUpperCase()}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-ink-800">
                    {row.host}
                  </p>
                  <p className="truncate text-[11px] text-ink-400">{row.label}</p>
                </div>

                <span className="hidden shrink-0 items-center gap-1 rounded-md bg-ink-50 px-2 py-1 text-[11px] font-semibold text-ink-500 sm:inline-flex">
                  <FiTrendingUp size={11} className="text-brand-500" />
                  {row.clicks}
                </span>

                <CopyButton
                  value={`https://linkforge.dev/${row.code}`}
                  className="h-8 w-8 shrink-0"
                  onError={() => {}}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating accent card */}
      <div className="absolute -bottom-5 -left-3 hidden animate-float items-center gap-3 rounded-xl border border-ink-200 bg-white p-3 shadow-lift sm:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <FiCheck size={16} />
        </span>
        <div>
          <p className="text-[12.5px] font-bold text-ink-900">Link created</p>
          <p className="text-[11px] text-ink-400">Ready to share</p>
        </div>
      </div>
    </div>
  );
}
