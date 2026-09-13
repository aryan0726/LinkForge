/**
 * Inline spinner. Uses currentColor so it inherits from any button variant.
 */
export function Spinner({ size = 18, className = "", strokeWidth = 2.4 }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth={strokeWidth}
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Full-panel loading state for route-level suspense. */
export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-ink-500">
      <Spinner size={26} className="text-brand-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export default Spinner;
