import {
  FiClipboard,
  FiLink2,
  FiShare2,
  FiUserPlus,
} from "react-icons/fi";

/** "How LinkForge works" — describes the real product flow end to end. */

const STEPS = [
  {
    icon: FiUserPlus,
    title: "Create your account",
    body: "Register with your name, username and email. You're signed in immediately over a JWT-secured session.",
  },
  {
    icon: FiClipboard,
    title: "Paste a long URL",
    body: "Drop any http or https link into the shortener. LinkForge generates a unique six-character code for it.",
  },
  {
    icon: FiLink2,
    title: "Get your short link",
    body: "Your short link is ready instantly. Copy it with one click and share it anywhere you like.",
  },
  {
    icon: FiShare2,
    title: "Track every click",
    body: "Each visit is counted automatically. Open your dashboard to see totals across all of your links.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-ink-100 bg-ink-50/60 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From long URL to live link in seconds"
          description="No setup, no configuration files. LinkForge is a single workflow from the moment you sign up."
        />

        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="group relative rounded-2xl border border-ink-200/80 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 text-white shadow-[0_8px_18px_-8px_rgba(79,70,229,0.7)]">
                  <step.icon size={19} aria-hidden="true" />
                </span>
                <span className="font-mono text-2xl font-bold text-ink-200 transition-colors group-hover:text-brand-200">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-5 text-[15px] font-bold tracking-tight text-ink-900">
                {step.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
                {step.body}
              </p>

              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-3 top-1/2 hidden h-px w-6 bg-ink-200 lg:block"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Shared heading block used by every marketing section. */
export function SectionHeading({ eyebrow, title, description, align = "center" }) {
  const alignment =
    align === "center" ? "mx-auto text-center" : "text-left";

  return (
    <div className={`max-w-2xl ${alignment}`}>
      <p className="text-[12.5px] font-bold uppercase tracking-[0.16em] text-brand-600">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[2.4rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-[15.5px] leading-relaxed text-ink-600">
          {description}
        </p>
      ) : null}
    </div>
  );
}
