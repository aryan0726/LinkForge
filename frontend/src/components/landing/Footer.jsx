import { FiGithub, FiLinkedin } from "react-icons/fi";
import Logo from "../ui/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Why LinkForge", href: "#why-linkforge" },
      { label: "Security", href: "#security" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", to: "/login" },
      { label: "Create account", to: "/register" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "My links", to: "/links" },
    ],
  },
  {
    title: "Technology",
    links: [
      { label: "React", href: "#features" },
      { label: "Spring Boot", href: "#security" },
      { label: "PostgreSQL", href: "#why-linkforge" },
      { label: "Docker", href: "#security" },
    ],
  },
];

/**
 * Site footer.
 * Internal destinations use Router links; in-page anchors scroll to sections.
 * External profile links are marked rel="noreferrer noopener".
 */
export default function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-ink-50/70">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo to="/" size={34} />
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink-500">
              A URL shortener and link management platform built with React,
              Spring Boot and PostgreSQL. Forge smarter links, and share them
              with confidence.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              <SocialLink
                href="https://github.com/aryan0726"
                label="GitHub profile"
                icon={FiGithub}
              />
              <SocialLink
                href="https://www.linkedin.com/"
                label="LinkedIn profile"
                icon={FiLinkedin}
              />
            </div>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-400">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.to || link.href}
                      className="text-[13.5px] font-medium text-ink-600 transition-colors hover:text-brand-600"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-200 pt-7 sm:flex-row">
          <p className="text-[13px] text-ink-500">
            © {new Date().getFullYear()} LinkForge. All rights reserved.
          </p>

          <p className="flex items-center gap-2 text-[12.5px] text-ink-400">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Short links, click tracking, and account security — all in one place.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, icon: Icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-500 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
    >
      <Icon size={16} />
    </a>
  );
}
