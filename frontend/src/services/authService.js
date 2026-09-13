import api from "./apiClient";
import { normalizeError } from "./errors";

/**
 * Auth endpoints — mirrors AuthController exactly.
 *
 *   POST /api/auth/register  { fullName, username, email, password } -> { token }
 *   POST /api/auth/login     { email, password }                     -> { token }
 *
 * Both return only a token; the profile is fetched separately from
 * GET /api/user/me because the backend does not embed user data in the
 * auth response.
 */

/** Unwraps axios errors into the shared error shape. */
const unwrap = (error, fallback) => {
  throw normalizeError(error, fallback);
};

export async function login({ email, password }) {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    return { token: data?.token ?? null };
  } catch (error) {
    unwrap(error, "We couldn't sign you in. Please try again.");
  }
}

/**
 * Register.
 *
 * The backend now answers a duplicate account with 409 and a `fieldErrors` map
 * naming the field that clashed, so the form can highlight the right input
 * directly. It previously replied 403 with an empty body, which forced the
 * caller to guess.
 */
export async function register({ fullName, username, email, password }) {
  try {
    const { data } = await api.post("/auth/register", {
      fullName,
      username,
      email,
      password,
    });
    // Register issues a token immediately, so the user lands signed in.
    return { token: data?.token ?? null };
  } catch (error) {
    unwrap(error, "We couldn't create your account. Please try again.");
  }
}

/**
 * GET /api/user/me — returns the authenticated user's public profile.
 *
 * The backend returns a dedicated response DTO, so the password field no longer
 * exists in the payload at all. The field-by-field mapping is kept anyway: it
 * documents which fields this app depends on, and pins the shape so an extra
 * column on the `users` table cannot silently flow into the UI.
 */
export async function getCurrentUser() {
  try {
    const { data } = await api.get("/user/me");
    return {
      id: data?.id ?? null,
      fullName: data?.fullName ?? "",
      username: data?.username ?? "",
      email: data?.email ?? "",
      role: data?.role ?? "USER",
      enabled: data?.enabled ?? true,
      createdAt: data?.createdAt ?? null,
    };
  } catch (error) {
    unwrap(error, "We couldn't load your profile.");
  }
}

const authService = { login, register, getCurrentUser };
export default authService;
