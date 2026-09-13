import {
  FiCheckCircle,
  FiCode,
  FiDatabase,
  FiLayers,
  FiMinusCircle,
} from "react-icons/fi";
import { SectionHeading } from "./HowItWorks";

/** "Why LinkForge" — differentiators plus an honest note on current scope. */

const REASONS = [
  {
    icon: FiLayers,
    title: "One place for every link",
    body: "Your short links live in your account, not in a browser tab. Sign in from anywhere and find your full history.",
  },
  {
    icon: FiDatabase,
    title: "Reliable by design",
    body: "Links and click counts persist in PostgreSQL, so your history survives restarts, redeploys and container rebuilds.",
  },
  {
    icon: FiCode,
    title: "Developer-friendly API",
    body: "A small, predictable REST surface with JSON payloads. Straightforward to consume, test and extend.",
  },
  {
    icon: FiCheckCircle,
    title: "Honest interface",
    body: "The UI only shows data that the API actually returns. Where a metric isn't tracked yet, LinkForge says so rather than filling the gap.",
  },
];

const NOT_YET = [
  "Custom aliases",
  "QR code generation",
  "Per-link analytics breakdown",
  "Link expiry and scheduling",
];

export default function WhyLinkForge() {
  return (
    <section id="why-linkforge" className="border-y border-ink-100 bg-ink-50/60 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.92fr] lg:gap-16">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Why LinkForge"
              title="A link manager you can trust with your links"
              description="Built as a genuine full-stack product, not a demo — which means the interface is honest about what it does."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {REASONS.map((reason) => (
                <div
                  key={reason.title}
                  className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft transition-colors hover:border-brand-200"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    <reason.icon size={17} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[14.5px] font-bold tracking-tight text-ink-900">
                    {reason.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
                    {reason.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Roadmap / scope transparency panel */}
          <div className="lg:pt-4">
            <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card sm:p-7">
              <h3 className="text-[15px] font-bold tracking-tight text-ink-900">
                Currently in active development
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
                These capabilities are planned but not yet available through the
                API. They are listed here so nothing in the interface promises
                something it can't deliver.
              </p>

              <ul className="mt-5 space-y-3">
                {NOT_YET.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-dashed border-ink-200 bg-ink-50/60 px-3.5 py-3"
                  >
                    <FiMinusCircle
                      className="shrink-0 text-ink-400"
                      size={15}
                      aria-hidden="true"
                    />
                    <span className="text-[13px] font-medium text-ink-500">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-xl bg-brand-50 p-4 ring-1 ring-brand-100">
                <p className="text-[13px] leading-relaxed text-brand-800">
                  <span className="font-bold">What you can do today:</span> create
                  short links, view all of your links, copy them, open their
                  destinations, and track total clicks per link.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
