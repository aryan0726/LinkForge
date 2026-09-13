import { Link } from "react-router-dom";

/**
 * Brand wordmark. The mark is a "link" glyph set inside a forged-badge shape,
 * hinting at the LinkForge identity without using external image assets.
 */
export function LogoMark({ size = 36, className = "" }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 text-white shadow-[0_6px_16px_-6px_rgba(79,70,229,0.7)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.5 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7l-1.2 1.2" />
        <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7l1.2-1.2" />
      </svg>
    </span>
  );
}

/**
 * Full logo lockup. Renders as a Router link when `to` is provided,
 * otherwise as a plain inline element.
 */
export default function Logo({
  to,
  size = 36,
  textClassName = "text-lg",
  className = "",
  subtitle,
}) {
  const content = (
    <>
      <LogoMark size={size} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-bold tracking-tight text-ink-900 ${textClassName}`}
        >
          Link<span className="text-gradient">Forge</span>
        </span>
        {subtitle ? (
          <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-400">
            {subtitle}
          </span>
        ) : null}
      </span>
    </>
  );

  const base = `inline-flex items-center gap-2.5 rounded-xl ${className}`;

  if (to) {
    return (
      <Link to={to} className={`${base} transition-opacity hover:opacity-90`}>
        {content}
      </Link>
    );
  }

  return <span className={base}>{content}</span>;
}
