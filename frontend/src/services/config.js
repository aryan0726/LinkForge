/**
 * Single source of truth for backend configuration.
 *
 * Override per environment with a Vite env var (see .env.example):
 *   VITE_API_BASE_URL=https://api.example.com/api
 * The `/api` suffix is part of the base URL because the Spring Boot
 * controllers are mapped under `/api/...`.
 */

// `import.meta.env` is populated by Vite. Guard the access so this module can
// also be imported by plain Node (the unit checks in verify-units.mjs), where
// it is undefined rather than an empty object.
const env = import.meta.env ?? {};

const rawBaseUrl = env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

/** Origin of the backend, derived from the API base (used for absolute short links). */
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

/**
 * Resolve the displayable short URL for a link.
 *
 * The server is authoritative: it builds `shortUrl` from its own
 * `APP_BASE_URL`, which is the address that actually serves the redirect and
 * may sit on a different host from the API (e.g. `https://sho.rt/abc123` while
 * the API lives at `https://api.example.com/api`). Deriving the URL client-side
 * would produce a link pointing at the API host, where nothing redirects.
 *
 * So the server value wins whenever it is present. The derived form is only a
 * fallback for the case where `shortUrl` is absent (an older backend), and it
 * keeps the authoritative `shortCode` from the API either way.
 */
export function resolveShortUrl(link) {
  if (!link) return "";
  if (link.shortUrl) return link.shortUrl;
  if (link.shortCode) return `${API_ORIGIN}/${link.shortCode}`;
  return "";
}

export const REQUEST_TIMEOUT_MS = 15000;
