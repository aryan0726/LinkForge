/**
 * Normalises every failure shape this backend can produce into one object:
 *   { status, code, message, fieldErrors }
 *
 * The backend now has a @RestControllerAdvice, so errors come back in exactly
 * one shape:
 *
 *   {
 *     "timestamp": "...",
 *     "status": 400,
 *     "error": "VALIDATION_ERROR",     // stable, machine-readable
 *     "message": "Please correct the highlighted fields",
 *     "path": "/api/auth/register",
 *     "fieldErrors": { "email": "Email must be a valid address" }
 *   }
 *
 * `fieldErrors` is omitted entirely when there is nothing to report.
 *
 * This module still handles the cases that never reach that advice:
 *
 *  - 401 from the security filter chain (the entry point writes JSON, so
 *    `message` is populated)
 *  - Network / DNS / TLS failure — no `response` at all
 *  - Timeout — axios code ECONNABORTED
 *  - A malformed response body from a proxy or gateway
 *
 * The UI must never show a raw stack trace or "Request failed with status code
 * 500" to a user, so every case maps to human copy here.
 */

const NETWORK_MESSAGE =
  "We couldn't reach the LinkForge API. Check that the backend is running and try again.";

const TIMEOUT_MESSAGE =
  "The server took too long to respond. Please try again in a moment.";

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

/** Pull the most useful human-readable string out of any response body. */
function extractServerMessage(data) {
  if (!data) return null;

  if (typeof data === "string") {
    const trimmed = data.trim();
    // Guard against HTML error pages from a proxy being rendered as a "message".
    if (!trimmed || trimmed.startsWith("<")) return null;
    return trimmed.length > 200 ? null : trimmed;
  }

  if (typeof data === "object") {
    return (
      data.message ||
      data.detail ||
      data.error ||
      data.title ||
      // Fallback for a body that only contains a field map.
      Object.values(data).find((v) => typeof v === "string") ||
      null
    );
  }

  return null;
}

/** Status code to a fallback message, when the body carries nothing usable. */
function messageForStatus(status, serverMessage, fallback) {
  switch (status) {
    case 400:
      return serverMessage || "The submitted data is not valid. Please check the form.";
    case 401:
      return serverMessage || "Your session has expired. Please sign in again.";
    case 403:
      return serverMessage || "You don't have permission to perform this action.";
    case 404:
      return serverMessage || "We couldn't find what you were looking for.";
    case 409:
      return serverMessage || "That value is already in use.";
    case 500:
      return serverMessage || fallback;
    default:
      return serverMessage || fallback;
  }
}

/**
 * Extracts and sanitises the per-field messages.
 *
 * The backend sends `{ fieldName: message }`. Every value must be a string
 * before it reaches the form, because a non-string would be rendered as
 * "[object Object]" in an input's error slot.
 */
function extractFieldErrors(data) {
  const source = data?.fieldErrors;
  if (!source || typeof source !== "object") return {};

  const clean = {};
  for (const [field, message] of Object.entries(source)) {
    if (typeof message === "string" && message.trim()) {
      clean[field] = message;
    }
  }
  return clean;
}

/** True when a value is already the output of normalizeError(). */
export function isNormalized(error) {
  return Boolean(
    error &&
      typeof error === "object" &&
      !error.response &&
      typeof error.status === "number" &&
      typeof error.message === "string" &&
      "fieldErrors" in error,
  );
}

export function normalizeError(error, fallback = DEFAULT_MESSAGE) {
  // Services already normalize before throwing, and pages normalize again when
  // they catch. Without this guard the second pass sees an object with no
  // `response` and rewrites a specific, actionable error into a generic
  // "couldn't reach the API" message — silently discarding fieldErrors.
  if (isNormalized(error)) return error;

  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return { status: 0, code: error.code, message: TIMEOUT_MESSAGE, fieldErrors: {} };
  }

  if (!error?.response) {
    // A cancelled request is not a failure the user needs to hear about.
    if (error?.message === "canceled") {
      return { status: 0, code: "canceled", message: "", fieldErrors: {} };
    }
    return {
      status: 0,
      code: error?.code || "NETWORK_ERROR",
      message: NETWORK_MESSAGE,
      fieldErrors: {},
    };
  }

  const { status, data } = error.response;
  const serverMessage = extractServerMessage(data);

  return {
    status,
    // `error` is the backend's stable code (e.g. "VALIDATION_ERROR"); fall back
    // to the numeric status so callers always have something to switch on.
    code: (typeof data === "object" && data?.error) || status,
    message: messageForStatus(status, serverMessage, fallback),
    fieldErrors: extractFieldErrors(data),
  };
}

/**
 * True when the failure means "your session is no longer valid".
 *
 * Only 401. The backend previously answered a missing token with 403, which
 * made 401 and 403 indistinguishable from the client's point of view and led to
 * treating every permission error as an expired session. Now:
 *
 *   401 — not authenticated, or the token is expired/invalid → sign in again
 *   403 — authenticated, but not permitted                  → show the error
 *
 * Conflating them would sign a user out for an authorization failure they
 * cannot fix by signing in.
 */
export function isSessionExpired(error) {
  return error?.status === 401;
}

export default normalizeError;
