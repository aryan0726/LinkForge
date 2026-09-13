import axios from "axios";
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "./config";
import { authStorage } from "./authStorage";

/**
 * Shared axios instance.
 *
 * Responsibilities kept here (and nowhere else) so that components never deal
 * with tokens, headers, or transport concerns:
 *  - attach the Bearer token to protected requests
 *  - never attach it to the public auth endpoints
 *  - propagate a single "session expired" signal when the API rejects a token
 */

// Endpoints that must never receive an Authorization header.
const PUBLIC_PATHS = ["/auth/login", "/auth/register"];

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const path = config.url || "";
  const isPublic = PUBLIC_PATHS.some((publicPath) => path.includes(publicPath));

  if (!isPublic) {
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

/**
 * A 401 on a protected request means the token is expired, revoked or absent.
 * The interceptor emits an event instead of redirecting directly, because
 * navigation must go through the router (and must not fire for a failed login
 * attempt, which is also a 401 but happens on a public endpoint).
 *
 * Guarded: if dispatching fails for any reason the original error must still
 * reach the caller. Swallowing the real error here would surface as a bogus
 * "couldn't reach the API" message, which hides the true cause from the user.
 */
function emitSessionExpired() {
  try {
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("linkforge:session-expired"));
    }
  } catch {
    /* never let a listener problem mask the API error */
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const path = error?.config?.url || "";
    const isPublic = PUBLIC_PATHS.some((publicPath) => path.includes(publicPath));

    // Only 401 means "the session is no longer usable".
    //
    // The backend used to answer a missing or unparseable token with 403 and an
    // empty body, so both codes had to be treated as expired. It now returns a
    // proper 401 from a dedicated entry point, which makes the distinction
    // meaningful: a 403 means the caller IS authenticated but lacks permission,
    // and signing them out would be both wrong and confusing — re-authenticating
    // would not change the outcome.
    //
    // Public paths are still excluded, because a failed login is also a 401 and
    // must not trigger the global sign-out flow.
    if (status === 401 && !isPublic) {
      emitSessionExpired();
    }

    return Promise.reject(error);
  },
);

export default api;
