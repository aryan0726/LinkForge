import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../hooks/useAuth";

/** Page titles/subtitles keyed by route, so every page header stays consistent. */
const PAGE_META = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Create short links and see how they're performing.",
  },
  "/links": {
    title: "My Links",
    subtitle: "Search, sort and manage every link in your library.",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Click totals across all of your links.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Your profile, account details and session.",
  },
};

/** Authenticated application shell: sidebar + top bar + routed content. */
export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // The footer is the only thing that changes per route besides the outlet, so
  // the drawer is closed by the Sidebar's own link handlers rather than by an
  // effect watching `pathname`.
  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (!isMobile) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  const meta = PAGE_META[pathname] || { title: "LinkForge", subtitle: "" };

  const handleLogout = () => {
    signOut({ redirect: true, message: "You've been logged out." });
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="lg:pl-[272px]">
        <Topbar
          user={user}
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main id="main" className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>

        <footer className="border-t border-ink-200 px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-[12.5px] text-ink-400">
            LinkForge — URL shortening and link management.
          </p>
        </footer>
      </div>
    </div>
  );
}
