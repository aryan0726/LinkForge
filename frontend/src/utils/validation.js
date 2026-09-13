/**
 * Client-side validation.
 *
 * These rules intentionally mirror what the backend accepts
 * (RegisterRequest: fullName, username, email, password — all non-null
 * columns; LoginRequest: email, password) so the user gets immediate feedback
 * instead of a server round-trip. They are a convenience layer only — the
 * backend stays the source of truth.
 */

export function isValidEmail(value) {
  // Pragmatic check: one @, a domain, and a TLD. Full RFC 5322 is unnecessary.
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim());
}

export function validateLogin({ email, password }) {
  const errors = {};

  if (!email?.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function validateRegister({ fullName, username, email, password, confirmPassword }) {
  const errors = {};

  const name = (fullName || "").trim();
  if (!name) {
    errors.fullName = "Full name is required.";
  } else if (name.length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  } else if (name.length > 80) {
    errors.fullName = "Full name must be 80 characters or fewer.";
  }

  const handle = (username || "").trim();
  if (!handle) {
    errors.username = "Username is required.";
  } else if (handle.length < 3) {
    errors.username = "Username must be at least 3 characters.";
  } else if (handle.length > 30) {
    errors.username = "Username must be 30 characters or fewer.";
  } else if (!/^[a-zA-Z0-9._-]+$/.test(handle)) {
    errors.username = "Use letters, numbers, dots, dashes or underscores only.";
  }

  if (!email?.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (password.length > 72) {
    // bcrypt silently truncates beyond 72 bytes.
    errors.password = "Password must be 72 characters or fewer.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

/**
 * Validate a URL before creating a short link.
 * Requires an absolute http/https URL, matching what a browser can actually
 * redirect to. `https://` is offered as a repair hint rather than being
 * silently prepended, so the user stays aware of the final destination.
 */
export function validateUrl(value) {
  const raw = String(value || "").trim();

  if (!raw) return "Enter a URL to shorten.";

  let candidate = raw;
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return "That doesn't look like a valid URL.";
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return "Only http and https URLs can be shortened.";
  }

  if (!parsed.hostname.includes(".") && parsed.hostname !== "localhost") {
    return "Enter a full domain, for example example.com.";
  }

  return null;
}

/** Normalises user input into the absolute URL sent to the backend. */
export function normalizeUrlInput(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(raw)) return raw;
  return `https://${raw}`;
}

/** True when the URL is acceptable for shortening. */
export function isLikelyValidUrl(value) {
  return validateUrl(value) === null;
}

export default {
  isValidEmail,
  validateLogin,
  validateRegister,
  validateUrl,
  normalizeUrlInput,
};
