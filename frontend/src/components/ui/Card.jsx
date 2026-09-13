/**
 * Surface container used for every panel in the product.
 * `as` lets it render as section/article/etc. without losing styling.
 */
export default function Card({
  as: Component = "div",
  padded = true,
  hover = false,
  className = "",
  children,
  ...rest
}) {
  return (
    <Component
      className={[
        "rounded-2xl border border-ink-200/80 bg-white shadow-card",
        padded ? "p-6" : "",
        hover
          ? "transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Component>
  );
}

/** Small section heading used inside cards. */
export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-3 ${className}`}
    >
      <div className="min-w-0">
        <h2 className="text-base font-bold tracking-tight text-ink-900">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-[13px] text-ink-500">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
