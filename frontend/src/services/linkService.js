import api from "./apiClient";
import { normalizeError } from "./errors";
import { resolveShortUrl } from "./config";

/**
 * Link endpoints — mirrors LinkController exactly.
 *
 *   POST /api/links          { originalUrl } -> LinkResponse   (auth required)
 *   GET  /api/links                           -> LinkResponse[] (auth required)
 *   GET  /api/links/{code}                    -> 302 redirect   (public)
 *
 * LinkResponse = { originalUrl, shortCode, shortUrl, clickCount }
 *
 * NOTE ON SCOPE: the backend exposes no update/delete endpoint, no per-link
 * createdAt, and no analytics beyond the aggregate clickCount. This module
 * deliberately exposes only what the API supports so the UI cannot display
 * data that does not exist.
 */

/** Normalise a raw LinkResponse into a stable shape for the UI. */
function toLink(raw) {
  return {
    originalUrl: raw?.originalUrl ?? "",
    shortCode: raw?.shortCode ?? "",
    // The server's value is authoritative (it may redirect from another host);
    // see resolveShortUrl for why this is not rebuilt client-side.
    shortUrl: resolveShortUrl(raw),
    clickCount: Number(raw?.clickCount ?? 0),
  };
}

export async function getLinks() {
  try {
    const { data } = await api.get("/links");
    return Array.isArray(data) ? data.map(toLink) : [];
  } catch (error) {
    throw normalizeError(error, "We couldn't load your links.");
  }
}

export async function createLink(originalUrl) {
  try {
    const { data } = await api.post("/links", { originalUrl });
    return toLink(data);
  } catch (error) {
    throw normalizeError(error, "We couldn't create that short link.");
  }
}

const linkService = { getLinks, createLink };
export default linkService;
