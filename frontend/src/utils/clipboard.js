/**
 * Clipboard helper.
 *
 * `navigator.clipboard` requires a secure context (https or localhost), which
 * is not guaranteed when the SPA is served over plain http from an EC2
 * instance. Falling back to a hidden textarea + execCommand keeps copy working
 * in that case instead of failing silently.
 */
export async function copyToClipboard(text) {
  if (text == null) return false;

  const value = String(text);

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall through to the legacy path.
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, value.length);

    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);

    return ok;
  } catch {
    return false;
  }
}
