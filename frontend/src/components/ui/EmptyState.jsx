/**
 * Empty / error placeholder panels. Keeps every "nothing here" state
 * consistent instead of leaving bare text on the page.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action = null,
  tone = "neutral",
  compact = false,
}) {
  const toneStyles =
    tone === "error"
      ? "bg-red-50 text-red-500 ring-red-100"
      : "bg-brand-50 text-brand-500 ring-brand-100";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "px-4 py-10" : "px-6 py-16"
      }`}
    >
      {Icon ? (
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ring-8 ${toneStyles}`}
        >
          <Icon className="text-2xl" aria-hidden="true" />
        </span>
      ) : null}

      <h3 className="mt-5 text-[15px] font-bold text-ink-900">{title}</h3>

      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-500">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
