import { useCallback, useEffect, useRef, useState } from "react";
import linkService from "../services/linkService";
import { isSessionExpired } from "../services/errors";

/**
 * Single loader for the authenticated user's links.
 *
 * Both the Dashboard and the My Links page read from the same endpoint
 * (GET /api/links), so this hook keeps the fetch/refresh/error logic in one
 * place instead of duplicating it per page.
 */
export function useLinks({ enabled = true } = {}) {
  const [links, setLinks] = useState([]);
  // Start in the loading state only when the request will actually be issued,
  // which avoids a setState-in-effect just to flip the flag.
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    let active = true;

    // The loading/error reset is deferred into a microtask so the effect body
    // itself performs no synchronous state update. This keeps the initial
    // render committed before the request state changes, and avoids the
    // cascading-render warning that a direct call would trigger.
    const request = Promise.resolve()
      .then(() => {
        if (!active || !mountedRef.current) return null;
        setLoading(true);
        setError(null);
        return linkService.getLinks();
      })
      .then((data) => {
        if (!active || !mountedRef.current || data === null) return;
        setLinks(data);
      })
      .catch((err) => {
        if (!active || !mountedRef.current) return;
        // A 401 already triggers the global sign-out flow; don't double-report.
        if (isSessionExpired(err)) return;
        setError(err);
      })
      .finally(() => {
        if (!active || !mountedRef.current) return;
        setLoading(false);
      });

    void request;

    return () => {
      active = false;
    };
  }, [enabled, reloadToken]);

  const refresh = useCallback(() => setReloadToken((t) => t + 1), []);

  /** Optimistically add a freshly created link to the top of the list. */
  const prependLink = useCallback((link) => {
    if (!link) return;
    setLinks((current) => {
      if (current.some((l) => l.shortCode === link.shortCode)) return current;
      return [link, ...current];
    });
  }, []);

  return { links, loading, error, refresh, prependLink };
}

/**
 * Derived metrics computed strictly from real API data.
 * Nothing here is invented — if the backend doesn't send it, it isn't shown.
 */
export function deriveLinkStats(links) {
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, l) => sum + (l.clickCount || 0), 0);
  const clickedLinks = links.filter((l) => (l.clickCount || 0) > 0).length;
  const averageClicks = totalLinks ? totalClicks / totalLinks : 0;

  return {
    totalLinks,
    totalClicks,
    clickedLinks,
    /** Links that have never been visited — the closest real signal to "idle". */
    neverClicked: totalLinks - clickedLinks,
    averageClicks,
  };
}

export default useLinks;
