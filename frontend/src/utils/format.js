/** Presentation helpers shared across pages. */

/** 12847 -> "12,847" */
export function formatNumber(value) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("en-US");
}

/** 1284 -> "1.3K", 2400000 -> "2.4M". Used where space is tight. */
export function formatCompact(value) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0";
  if (Math.abs(n) < 1000) return String(n);

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Shorten a long URL for display while keeping the readable host + path. */
export function prettifyUrl(url, maxLength = 58) {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    const withoutProtocol = `${parsed.host}${parsed.pathname}${parsed.search}`;
    const cleaned = withoutProtocol.replace(/\/$/, "");
    return cleaned.length > maxLength
      ? `${cleaned.slice(0, maxLength)}…`
      : cleaned;
  } catch {
    return url.length > maxLength ? `${url.slice(0, maxLength)}…` : url;
  }
}

/** Only the hostname, for compact table cells. */
export function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url || "";
  }
}

/** ISO/local datetime string -> "12 Sep 2026". */
export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Deterministic 1-2 letter initials for avatars. */
export function getInitials(name, fallback = "?") {
  if (!name) return fallback;

  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Stable colour pairing for an avatar based on a string, so the same user
 * always gets the same swatch without storing anything.
 */
export function avatarTone(seed) {
  const tones = [
    "from-brand-500 to-accent-600",
    "from-violet-500 to-fuchsia-500",
    "from-sky-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
  ];

  const key = String(seed || "");
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % 997;
  }

  return tones[hash % tones.length];
}

/** Pluralise a noun without pulling in a library. */
export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural || `${singular}s`;
}
