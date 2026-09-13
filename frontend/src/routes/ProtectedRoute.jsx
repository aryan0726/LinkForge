import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PageLoader } from "../components/ui/Spinner";

/**
 * Guards every authenticated route.
 *
 * While the token bootstrap is in flight we render a loader rather than
 * redirecting, so a page refresh on /dashboard does not bounce the user to the
 * login screen for a frame and lose their place.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isBooting } = useAuth();
  const location = useLocation();

  if (isBooting) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-50">
        <PageLoader label="Restoring your session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the intended destination so login can send the user back.
    const from = `${location.pathname}${location.search}`;
    const params = new URLSearchParams();
    if (from && from !== "/") params.set("from", from);

    const query = params.toString();
    return <Navigate to={query ? `/login?${query}` : "/login"} replace />;
  }

  return children ?? <Outlet />;
}

/**
 * Inverse guard for /login and /register: an already-authenticated visitor is
 * sent to the dashboard instead of being shown an auth form.
 */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isBooting } = useAuth();

  if (isBooting) {
    return (
      <div className="grid min-h-screen place-items-center bg-white">
        <PageLoader label="Loading…" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
}
