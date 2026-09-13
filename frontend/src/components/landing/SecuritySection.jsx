import {
  FiActivity,
  FiDatabase,
  FiKey,
  FiShield,
} from "react-icons/fi";
import { SectionHeading } from "./HowItWorks";

/**
 * Security and reliability section.
 * Describes the real stack: Spring Security, JWT, BCrypt, PostgreSQL.
 */

const PILLARS = [
  {
    icon: FiKey,
    title: "Token-based authentication",
    body: "Sessions are stateless. A signed JWT identifies you on every protected request, and the server never keeps a session store.",
  },
  {
    icon: FiShield,
    title: "Hashed passwords",
    body: "Passwords are hashed with BCrypt before they ever reach the database. Plaintext credentials are never stored or returned.",
  },
  {
    icon: FiDatabase,
    title: "Durable storage",
    body: "Link records and click counters live in PostgreSQL with schema management handled by the persistence layer.",
  },
  {
    icon: FiActivity,
    title: "Independently deployed",
    body: "The API and the interface ship as separate containers, so each can be deployed, scaled and updated on its own cadence.",
  },
];

/** Illustrative pipeline — describes the real auth request path. */
const FLOW = [
  { label: "Client request", detail: "Bearer token in the header" },
  { label: "JWT filter", detail: "Signature and expiry verified" },
  { label: "Security context", detail: "Identity bound to the request" },
  { label: "Protected API", detail: "Scoped to your own links" },
];

export default function SecuritySection() {
  return (
    <section id="security" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Security & reliability"
          title="Built on a security model, not an afterthought"
          description="LinkForge uses stateless JWT authentication throughout, so every request stands on its own and nothing is trusted implicitly."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-ink-200/80 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-ink-800 to-ink-900 text-white">
                <pillar.icon size={18} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-[14.5px] font-bold tracking-tight text-ink-900">
                {pillar.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>

        {/* Auth flow strip */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-ink-200 bg-gradient-to-br from-ink-900 to-ink-800 p-6 shadow-lift sm:p-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-brand-300">
            Authenticated request lifecycle
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((step, index) => (
              <div key={step.label} className="relative">
                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-brand-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                  <p className="mt-3 text-[13.5px] font-semibold text-white">
                    {step.label}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
