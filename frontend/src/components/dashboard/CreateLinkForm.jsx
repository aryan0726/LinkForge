import { useRef, useState } from "react";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiLink2,
} from "react-icons/fi";
import Button from "../ui/Button";
import CopyButton from "../ui/CopyButton";
import { useToast } from "../../hooks/useToast";
import linkService from "../../services/linkService";
import { normalizeUrlInput, validateUrl } from "../../utils/validation";
import { getHostname } from "../../utils/format";

/**
 * Create-short-link form.
 *
 * Contract: POST /api/links { originalUrl } -> { originalUrl, shortCode,
 * shortUrl, clickCount }
 *
 * Either renders inline (dashboard card) or inside a modal, depending on
 * `variant`. On success the newly created link is surfaced immediately with its
 * short URL and a copy action, and `onCreated` lets the parent refresh its list.
 */
export default function CreateLinkForm({
  variant = "inline",
  onCreated,
  onCancel,
  autoFocus = true,
}) {
  const toast = useToast();

  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const inputRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const link = await linkService.createLink(normalizeUrlInput(url));
      setResult(link);
      setUrl("");
      toast.success("Short link created", link.shortUrl);
      onCreated?.(link);
      inputRef.current?.focus();
    } catch (err) {
      setError(err?.message || "We couldn't create that short link.");
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => setResult(null);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {variant === "inline" ? (
        <div className="mb-5 flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 text-white shadow-[0_8px_18px_-8px_rgba(79,70,229,0.7)]">
            <FiLink2 size={19} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-bold tracking-tight text-ink-900">
              Create a short link
            </h2>
            <p className="mt-0.5 text-[13px] text-ink-500">
              Paste any http or https URL and LinkForge will generate a short code
              for it.
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <FiLink2
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
            size={17}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            name="url"
            inputMode="url"
            autoFocus={autoFocus}
            placeholder="https://example.com/your-very-long-url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            disabled={loading}
            aria-label="Long URL to shorten"
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? "create-link-error" : undefined}
            className={[
              "h-12 w-full rounded-xl border bg-white pl-10.5 pr-3.5 text-sm text-ink-900",
              "placeholder:text-ink-400 transition-all duration-200",
              "focus:outline-none focus:ring-4 disabled:bg-ink-50",
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-ink-200 hover:border-ink-300 focus:border-brand-400 focus:ring-brand-100",
            ].join(" ")}
          />
        </div>

        <div className="flex shrink-0 gap-2.5">
          <Button
            type="submit"
            size="lg"
            loading={loading}
            iconRight={loading ? null : <FiArrowRight size={16} />}
            className="h-12 flex-1 sm:flex-none"
          >
            {loading ? "Creating…" : "Shorten"}
          </Button>

          {onCancel ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onCancel}
              disabled={loading}
              className="h-12"
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p
          id="create-link-error"
          role="alert"
          className="mt-2.5 flex items-center gap-1.5 text-[13px] font-medium text-red-600"
        >
          <FiAlertCircle className="shrink-0" size={14} aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {/* Success result */}
      {result ? (
        <div className="mt-4 animate-fade-up rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <FiCheckCircle
                className="shrink-0 text-emerald-600"
                size={17}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-emerald-900">
                  Short link ready
                </p>
                <p className="truncate text-[12px] text-emerald-700/80">
                  Pointing to {getHostname(result.originalUrl)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="truncate rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-[12.5px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                title={result.shortUrl}
              >
                {result.shortUrl}
              </a>

              <CopyButton
                value={result.shortUrl}
                variant="inline"
                copiedLabel="Copied"
                label="Copy"
                onCopied={() =>
                  toast.success("Copied to clipboard", result.shortUrl)
                }
                onError={() =>
                  toast.error(
                    "Couldn't copy",
                    "Your browser blocked clipboard access.",
                  )
                }
              />
            </div>
          </div>

          <button
            type="button"
            onClick={clearResult}
            className="mt-3 text-[12px] font-semibold text-emerald-700 underline-offset-2 hover:underline"
          >
            Create another link
          </button>
        </div>
      ) : null}
    </form>
  );
}
