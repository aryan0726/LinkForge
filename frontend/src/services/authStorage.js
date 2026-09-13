/**
 * Token storage.
 *
 * The original project stored only a bare token in localStorage. The key name
 * and storage mechanism are kept identical so any existing session survives the
 * upgrade. All access goes through this module so there is exactly one place
 * that touches storage — and so the token can never leak into rendered markup.
 */
const TOKEN_KEY = "token";

export const authStorage = {
  getToken() {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      // Private-mode / disabled storage.
      return null;
    }
  },

  setToken(token) {
    try {
      if (token) {
        window.localStorage.setItem(TOKEN_KEY, token);
      } else {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      /* no-op */
    }
  },

  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* no-op */
    }
  },
};

/**
 * Decode a JWT payload without verifying it. Used only to show proactive
 * "your session has expired" messaging and to avoid a pointless API round-trip
 * when a token is already known to be stale. The backend remains the only
 * authority on token validity.
 */
export function decodeTokenPayload(token) {
  if (!token) return null;

  try {
    const segment = token.split(".")[1];
    if (!segment) return null;

    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );

    const json = decodeURIComponent(
      window
        .atob(padded)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Returns true when the token is missing or its `exp` claim is in the past. */
export function isTokenExpired(token) {
  const payload = decodeTokenPayload(token);
  if (!payload?.exp) return false; // No exp claim — let the server decide.
  return payload.exp * 1000 <= Date.now();
}

export default authStorage;
