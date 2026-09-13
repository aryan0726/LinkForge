import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import NavProgress from "./components/ui/NavProgress";
import ProtectedRoute, { PublicOnlyRoute } from "./routes/ProtectedRoute";
import DashboardLayout from "./components/dashboard/DashboardLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyLinks from "./pages/MyLinks";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

/**
 * Route table.
 *
 * Static imports are used throughout: the application is small enough that
 * code-splitting adds a loading state without a meaningful bundle saving, and
 * it keeps every route available immediately after the first paint.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <a href="#main" className="skip-link">
              Skip to main content
            </a>

            <NavProgress />

            <Routes>
              {/* ---------- Public ---------- */}
              <Route path="/" element={<Home />} />

              {/* ---------- Auth (redirect away if already signed in) ---------- */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <Register />
                  </PublicOnlyRoute>
                }
              />

              {/* ---------- Protected ---------- */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/links" element={<MyLinks />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* ---------- Fallback ---------- */}
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
