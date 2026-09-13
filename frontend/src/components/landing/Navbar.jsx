import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import Logo from "../ui/Logo";
import Button from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";

const SECTIONS = [
  { id: "how-it-works", label: "How it works" },
  { id: "features", label: "Features" },
  { id: "why-linkforge", label: "Why LinkForge" },
  { id: "security", label: "Security" },
];

/** Marketing site header. Collapses to a slide-down panel on small screens. */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile panel whenever the route changes. Tracked by comparing
  // against the last-seen pathname rather than with a setState effect.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  // Prevent background scroll while the mobile panel is open.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-ink-200/70 bg-white/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"
      >
        <Logo to="/" size={34} />

        <div className="hidden items-center gap-1 lg:flex">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-ink-600 transition-colors hover:bg-ink-100/70 hover:text-ink-900"
            >
              {section.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 lg:flex">
          {isAuthenticated ? (
            <Button to="/dashboard" size="sm" iconRight={<ArrowIcon />}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">
                Log In
              </Button>
              <Button to="/register" size="sm">
                Get Started
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-700 transition-colors hover:bg-ink-50 lg:hidden"
        >
          {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
        </button>
      </nav>

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="animate-fade-in border-t border-ink-200 bg-white px-5 pb-6 pt-4 lg:hidden"
        >
          <div className="flex flex-col">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
              >
                {section.label}
              </a>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2.5 border-t border-ink-100 pt-5">
            {isAuthenticated ? (
              <Button to="/dashboard" fullWidth>
                Go to dashboard
              </Button>
            ) : (
              <>
                <Button to="/login" variant="secondary" fullWidth>
                  Log In
                </Button>
                <Button to="/register" fullWidth>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* Visually-hidden quick links for keyboard users skipping the marker. */}
      <Link to="/login" className="sr-only">
        Log in to LinkForge
      </Link>
    </header>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
