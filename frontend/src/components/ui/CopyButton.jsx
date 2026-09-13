import { useCallback, useEffect, useRef, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { copyToClipboard } from "../../utils/clipboard";

/**
 * Copy-to-clipboard button with inline "Copied" confirmation.
 *
 * `variant="icon"` renders a compact square button for table rows;
 * `variant="inline"` renders a labelled pill for headers.
 */
export default function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  variant = "icon",
  className = "",
  onCopied,
  onError,
  title,
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const handleCopy = useCallback(
    async (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      const ok = await copyToClipboard(value);

      if (!ok) {
        onError?.();
        return;
      }

      setCopied(true);
      onCopied?.();

      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1800);
    },
    [value, onCopied, onError],
  );

  const base =
    "inline-flex items-center justify-center font-semibold transition-all duration-200";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={title || "Copy short URL"}
        aria-label={copied ? copiedLabel : "Copy short URL"}
        className={[
          base,
          "h-9 w-9 rounded-lg border",
          copied
            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
            : "border-ink-200 bg-white text-ink-500 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600",
          className,
        ].join(" ")}
      >
        {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title || "Copy to clipboard"}
      className={[
        base,
        "h-10 gap-2 rounded-xl border px-4 text-[13px]",
        copied
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-ink-200 bg-white text-ink-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700",
        className,
      ].join(" ")}
    >
      {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
      {copied ? copiedLabel : label}
    </button>
  );
}
