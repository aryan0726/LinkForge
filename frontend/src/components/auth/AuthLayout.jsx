import { Link } from "react-router-dom";
import {
  FiBarChart2,
  FiCheck,
  FiLink2,
  FiShield,
} from "react-icons/fi";
import Logo from "../ui/Logo";

/**
 * Split-screen shell shared by the login and register pages.
 *
 * Keeping this in one component means the two auth pages stay visually
 * identical and the marketing panel is only written once.
 */
export default function AuthLayout({ children, title, subtitle, footer }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* ---------------- Brand panel (desktop) ---------------- */}
      <aside className="relative hidden overflow-hidden bg-ink-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 surface-grid opacity-[0.07]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-accent-600/25 blur-3xl"
        />

        <div className="relative">
          <Logo
            to="/"
            size={38}
            textClassName="text-xl !text-white"
            className="[&_span:last-child]:text-white"
          />
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[2.6rem] font-extrabold leading-[1.12] tracking-tight text-white">
            {title}
          </h2>

          {subtitle ? (
            <p className="mt-5 text-[15px] leading-relaxed text-white/60">
              {subtitle}
            </p>
          ) : null}

          <ul className="mt-10 space-y-4">
            {[
              {
                icon: FiLink2,
                title: "Instant short links",
                body: "Six-character codes generated for every URL you add.",
              },
              {
                icon: FiBarChart2,
                title: "Click tracking",
                body: "See how many visits each link collects over time.",
              },
              {
                icon: FiShield,
                title: "JWT-secured sessions",
                body: "Your links stay scoped to your own account.",
              },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-300 ring-1 ring-white/10">
                  <item.icon size={16} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-white/50">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-[12.5px] text-white/40">
          <FiCheck className="text-emerald-400" size={14} />
          URL shortening and link management, built end to end.
        </p>
      </aside>

      {/* ---------------- Form panel ---------------- */}
      <main
        id="main"
        className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10 lg:min-h-0 lg:py-12"
      >
        <div className="mx-auto w-full max-w-md">
          {/* Logo for mobile, where the brand panel is hidden */}
          <div className="mb-9 lg:hidden">
            <Logo to="/" size={36} />
          </div>

          {children}

          {footer ? (
            <div className="mt-8 text-center text-[13.5px] text-ink-500">
              {footer}
            </div>
          ) : null}

          <p className="mt-8 text-center text-[12px] text-ink-400">
            <Link to="/" className="font-medium hover:text-brand-600">
              ← Back to linkforge.com
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
