import {
  FiExternalLink,
  FiMousePointer,
} from "react-icons/fi";
import CopyButton from "../ui/CopyButton";
import { formatNumber, getHostname, prettifyUrl } from "../../utils/format";
import { useToast } from "../../hooks/useToast";

/**
 * Link table used by both the Dashboard (recent links) and My Links (full list).
 *
 * Columns map strictly to the real LinkResponse fields:
 *   originalUrl, shortCode, shortUrl, clickCount
 *
 * There is deliberately no "Created" column and no delete action — the backend
 * returns no timestamp per link and exposes no DELETE endpoint.
 */
export default function LinkTable({ links, compact = false }) {
  const toast = useToast();

  const handleCopy = () => {
    toast.success("Copied to clipboard", "Your short link is ready to paste.");
  };

  const handleCopyError = () => {
    toast.error(
      "Couldn't copy",
      "Your browser blocked clipboard access. Select the link and copy it manually.",
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse">
        <thead>
          <tr className="border-b border-ink-200">
            <th
              scope="col"
              className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400"
            >
              Destination
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400"
            >
              Short link
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400"
            >
              Clicks
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {links.map((link) => (
            <tr
              key={link.shortCode}
              className="group border-b border-ink-100 transition-colors last:border-0 hover:bg-brand-50/40"
            >
              {/* Destination */}
              <td className="max-w-0 px-4 py-4 align-middle">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-[11px] font-bold uppercase text-ink-500 transition-colors group-hover:bg-white"
                    aria-hidden="true"
                  >
                    {getHostname(link.originalUrl).slice(0, 2)}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-ink-800">
                      {getHostname(link.originalUrl)}
                    </p>
                    <p className="truncate text-[12px] text-ink-400">
                      {prettifyUrl(link.originalUrl)}
                    </p>
                  </div>
                </div>
              </td>

              {/* Short link */}
              <td className="px-4 py-4 align-middle">
                <a
                  href={link.shortUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 font-mono text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
                  title={`Open ${link.shortUrl}`}
                >
                  <span className="truncate">{link.shortUrl.replace(/^https?:\/\//, "")}</span>
                  <FiExternalLink size={12} className="shrink-0" />
                </a>
              </td>

              {/* Clicks */}
              <td className="px-4 py-4 text-right align-middle">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-ink-50 px-2.5 py-1.5 text-[12.5px] font-bold text-ink-700">
                  <FiMousePointer size={12} className="text-brand-500" />
                  {formatNumber(link.clickCount)}
                </span>
              </td>

              {/* Actions */}
              <td className="px-4 py-4 align-middle">
                <div className="flex items-center justify-end gap-1.5">
                  <CopyButton
                    value={link.shortUrl}
                    onCopied={handleCopy}
                    onError={handleCopyError}
                  />

                  <a
                    href={link.shortUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    title="Open short link in a new tab"
                    aria-label={`Open short link ${link.shortCode} in a new tab`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500 transition-all duration-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
                  >
                    <FiExternalLink size={15} />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!compact && links.length > 0 ? (
        <p className="px-4 pt-4 text-[12px] text-ink-400">
          Showing {formatNumber(links.length)}{" "}
          {links.length === 1 ? "link" : "links"}.
        </p>
      ) : null}
    </div>
  );
}
