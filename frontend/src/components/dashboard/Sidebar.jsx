import { NavLink } from "react-router-dom";
import { FiLogOut, FiX } from "react-icons/fi";
import Logo from "../ui/Logo";
import { NAV_ITEMS } from "../../constants/navigation";
import { getInitials, avatarTone } from "../../utils/format";

/**
 * Dashboard sidebar.
 *
 * A fixed rail on desktop and a slide-in drawer on mobile. The drawer is
 * controlled by `open` / `onClose` from DashboardLayout.
 */
export default function Sidebar({ open, onClose, user, onLogout }) {
  const initials = getInitials(user?.fullName || user?.username, "U");
  const tone = avatarTone(user?.email || user?.username || "linkforge");

  return (
    <>
      {/* Mobile scrim */}
      {open ? (
        <div
          className="fixed inset-0 z-40 animate-fade-in bg-ink-900/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        aria-label="Sidebar navigation"
        aria-hidden={!open ? undefined : false}
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-ink-200 bg-white",
          "transition-transform duration-300 ease-out lg:translate-x-0",
          open ? "translate-x-0 shadow-pop" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand row */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink-100 px-5">
          <Logo to="/dashboard" size={34} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 lg:hidden"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">
            Workspace
          </p>

          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-all duration-200",
                    isActive
                      ? "bg-brand-50 text-brand-700 ring-1 ring-brand-100"
                      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        isActive
                          ? "bg-white text-brand-600 shadow-soft"
                          : "bg-ink-50 text-ink-500 group-hover:bg-white",
                      ].join(" ")}
                    >
                      <item.icon size={16} aria-hidden="true" />
                    </span>

                    <span className="truncate">{item.label}</span>

                    {isActive ? (
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    ) : null}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Account block */}
        <div className="shrink-0 border-t border-ink-100 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-ink-50 p-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-[13px] font-bold text-white shadow-soft`}
              aria-hidden="true"
            >
              {initials}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-ink-900">
                {user?.fullName || user?.username || "Signed in"}
              </p>
              <p className="truncate text-[11.5px] text-ink-500">
                {user?.email || "—"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold text-ink-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
              <FiLogOut size={16} aria-hidden="true" />
            </span>
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
