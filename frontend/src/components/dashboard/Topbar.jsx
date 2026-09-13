import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiBell, FiLogOut, FiMenu, FiSettings, FiUser } from "react-icons/fi";
import { getInitials, avatarTone } from "../../utils/format";

/**
 * Dashboard top bar.
 *
 * Owns the mobile menu toggle, and an account dropdown. The dropdown closes on
 * outside click and on Escape, and reports its state through aria-expanded.
 */
export default function Topbar({ user, onMenuClick, onLogout, title, subtitle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const initials = getInitials(user?.fullName || user?.username, "U");
  const tone = avatarTone(user?.email || user?.username || "linkforge");

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-600 transition-colors hover:bg-ink-50 lg:hidden"
        >
          <FiMenu size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-bold tracking-tight text-ink-900">
            {title}
          </h1>
          {subtitle ? (
            <p className="hidden truncate text-[12.5px] text-ink-500 sm:block">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="relative flex shrink-0 items-center gap-2" ref={menuRef}>
          {/* Session indicator — no token is ever surfaced in the UI. */}
          <span
            className="hidden items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11.5px] font-semibold text-emerald-700 sm:inline-flex"
            title="Your session is active"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Session active
          </span>

          <button
            type="button"
            aria-label="Notifications"
            title="Notifications are not available yet"
            disabled
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-300 sm:flex"
          >
            <FiBell size={17} />
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white p-1 pr-2.5 transition-colors hover:bg-ink-50"
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${tone} text-[12px] font-bold text-white`}
              aria-hidden="true"
            >
              {initials}
            </span>
            <span className="hidden max-w-[120px] truncate text-[13px] font-semibold text-ink-700 sm:block">
              {user?.username || "Account"}
            </span>
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] w-60 animate-fade-up overflow-hidden rounded-xl border border-ink-200 bg-white shadow-pop"
            >
              <div className="border-b border-ink-100 px-4 py-3.5">
                <p className="truncate text-[13px] font-bold text-ink-900">
                  {user?.fullName || "LinkForge user"}
                </p>
                <p className="truncate text-[12px] text-ink-500">
                  {user?.email || "—"}
                </p>
              </div>

              <div className="p-1.5">
                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
                >
                  <FiUser size={15} />
                  Your profile
                </Link>

                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
                >
                  <FiSettings size={15} />
                  Account settings
                </Link>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <FiLogOut size={15} />
                  Log out
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
