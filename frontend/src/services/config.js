/**
 * Single source of truth for backend configuration.
 *
 * Override per environment with a Vite env var (see .env.example):
 *   VITE_API_BASE_URL=https://api.example.com/api
 * The `/api` suffix is part of the base URL because the Spring Boot
 * controllers are mapped under `/api/...`.
 */
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

/** Origin of the backend, derived from the API base (used for absolute short links). */
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

/**
 * The backend currently hardcodes `http://localhost:8080/<code>` when building
 * `shortUrl`. In a deployed environment that value is wrong. `resolveShortUrl`
 * keeps the authoritative `shortCode` from the API but rebuilds the displayable
 * URL against the configured origin, so links are always correct and shareable.
 */
export function resolveShortUrl(link) {
  if (!link) return "";
  if (link.shortCode) return `${API_ORIGIN}/${link.shortCode}`;
  return link.shortUrl || "";
}

export const REQUEST_TIMEOUT_MS = 15000;
