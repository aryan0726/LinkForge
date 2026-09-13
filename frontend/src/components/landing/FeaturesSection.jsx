import {
  FiBarChart2,
  FiCopy,
  FiExternalLink,
  FiFilter,
  FiLink2,
  FiLock,
  FiZap,
} from "react-icons/fi";
import { SectionHeading } from "./HowItWorks";

/**
 * Feature grid.
 *
 * Every card maps to a capability that actually exists in the backend. Claims
 * for custom aliases, QR codes, device/geo analytics and outgoing webhooks were
 * removed from the previous version because no such endpoints exist.
 */

const FEATURES = [
  {
    icon: FiLink2,
    title: "Instant short links",
    body: "Paste a URL and get back a unique six-character short code, generated with a cryptographically secure random source.",
  },
  {
    icon: FiBarChart2,
    title: "Click counting",
    body: "Every redirect increments a per-link click counter, so you always know which links are actually being opened.",
  },
  {
    icon: FiCopy,
    title: "One-click copy",
    body: "Copy any short link straight to the clipboard with inline confirmation — no dialog windows interrupting your flow.",
  },
  {
    icon: FiFilter,
    title: "Search and sort",
    body: "Filter your library by short code or destination, and sort by clicks or recency to find the link you need.",
  },
  {
    icon: FiExternalLink,
    title: "Open in one click",
    body: "Jump straight to any destination URL from the dashboard to verify that a short link resolves correctly.",
  },
  {
    icon: FiZap,
    title: "Fast redirects",
    body: "Redirects are served from a lightweight public endpoint, so visitors reach your destination without an account or a login step.",
  },
  {
    icon: FiLock,
    title: "JWT-secured accounts",
    body: "Your links are scoped to your user account. Every link-management call is authenticated with a signed JSON Web Token.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Key features"
          title="Everything you need to manage a link library"
          description="A focused set of tools, built on real endpoints rather than placeholder buttons."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="group rounded-2xl border border-ink-200/80 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-100">
                <feature.icon size={19} aria-hidden="true" />
              </span>

              <h3 className="mt-5 text-[15px] font-bold tracking-tight text-ink-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
                {feature.body}
              </p>
            </article>
          ))}

          {/* Filler card that keeps the 3-column grid balanced and adds a CTA. */}
          <article className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-600 to-accent-600 p-6 text-white shadow-lift">
            <div
              aria-hidden="true"
              className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl"
            />
            <h3 className="relative text-[15px] font-bold tracking-tight">
              Built on a real REST API
            </h3>
            <p className="relative mt-2 text-[13.5px] leading-relaxed text-white/80">
              LinkForge is a Spring Boot and PostgreSQL service. The interface you
              see talks to genuine endpoints — create, list and redirect.
            </p>
            <p className="relative mt-5 font-mono text-[11.5px] text-white/70">
              POST /api/links · GET /api/links
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
