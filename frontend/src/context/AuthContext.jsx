import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { authStorage, isTokenExpired } from "../services/authStorage";
import { normalizeError, isSessionExpired } from "../services/errors";
import { AuthContext } from "./authContextObject";

/**
 * Owns the whole authentication lifecycle.
 *
 * Bootstrap flow (matches the real backend):
 *   1. read the JWT from storage
 *   2. if it is absent or its exp claim has passed, treat as signed out
 *   3. otherwise call GET /api/user/me to resolve the identity
 *   4. if that call returns 401, clear the token and sign out
 *
 * The token itself is never placed in context state or rendered — only the
 * derived user profile is exposed.
 */
export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | anonymous
  const [sessionMessage, setSessionMessage] = useState(null);

  // Tracks whether a user is currently signed in, for use inside event
  // listeners that are registered once and must not re-subscribe.
  const isSignedInRef = useRef(false);

  useEffect(() => {
    isSignedInRef.current = Boolean(user);
  }, [user]);

  const clearSession = useCallback(() => {
    authStorage.clear();
    setUser(null);
    setStatus("anonymous");
  }, []);

  // --- Initial bootstrap -------------------------------------------------
  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const token = authStorage.getToken();

      if (!token || isTokenExpired(token)) {
        if (token) authStorage.clear();
        if (active) {
          setUser(null);
          setStatus("anonymous");
        }
        return;
      }

      try {
        const profile = await authService.getCurrentUser();
        if (!active) return;
        setUser(profile);
        setStatus("authenticated");
      } catch (error) {
        if (!active) return;

        // An invalid/expired token on bootstrap is an expected state, not a bug.
        if (isSessionExpired(error)) {
          authStorage.clear();
          setUser(null);
          setStatus("anonymous");
          return;
        }

        // Backend unreachable: keep the token, but we cannot confirm identity.
        setUser(null);
        setStatus("anonymous");
        if (!isSessionExpired(error) && error?.status === 0) {
          setSessionMessage(error.message);
        }
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  // --- React to 401s raised anywhere in the app --------------------------
  useEffect(() => {
    const handleExpired = () => {
      // Only react if we believed we were signed in.
      if (!isSignedInRef.current) return;

      clearSession();
      setSessionMessage("Your session has expired. Please sign in again.");

      const { pathname, search } = window.location;
      const from = `${pathname}${search}`;
      const target =
        from && !from.startsWith("/login")
          ? `/login?expired=1&from=${encodeURIComponent(from)}`
          : "/login?expired=1";

      navigate(target, { replace: true });
    };

    window.addEventListener("linkforge:session-expired", handleExpired);
    return () =>
      window.removeEventListener("linkforge:session-expired", handleExpired);
  }, [clearSession, navigate]);

  // --- Actions -----------------------------------------------------------
  const signIn = useCallback(async ({ email, password }) => {
    const { token } = await authService.login({ email, password });

    if (!token) {
      throw normalizeError(
        { response: { status: 500, data: { message: "No token returned by the server." } } },
        "Sign in failed.",
      );
    }

    authStorage.setToken(token);
    setSessionMessage(null);

    // Resolve the profile immediately so protected pages render with the
    // real user instead of a placeholder.
    try {
      const profile = await authService.getCurrentUser();
      setUser(profile);
      setStatus("authenticated");
      return profile;
    } catch (error) {
      authStorage.clear();
      setUser(null);
      setStatus("anonymous");
      throw error;
    }
  }, []);

  const signUp = useCallback(async (payload) => {
    const { token } = await authService.register(payload);

    // Registration issues a token, so the user is signed in straight away.
    if (token) {
      authStorage.setToken(token);
      setSessionMessage(null);

      try {
        const profile = await authService.getCurrentUser();
        setUser(profile);
        setStatus("authenticated");
        return { authenticated: true, profile };
      } catch {
        // Account was created but the profile could not be read; fall back to
        // sending the user through the login screen rather than a broken state.
        authStorage.clear();
        setUser(null);
        setStatus("anonymous");
        return { authenticated: false };
      }
    }

    return { authenticated: false };
  }, []);

  const signOut = useCallback(
    ({ redirect = true, message = null } = {}) => {
      clearSession();
      setSessionMessage(message);
      if (redirect) {
        navigate("/login", { replace: true });
      }
    },
    [clearSession, navigate],
  );

  const refreshUser = useCallback(async () => {
    try {
      const profile = await authService.getCurrentUser();
      setUser(profile);
      return profile;
    } catch (error) {
      if (isSessionExpired(error)) clearSession();
      throw error;
    }
  }, [clearSession]);

  const consumeSessionMessage = useCallback(() => {
    setSessionMessage((current) => {
      if (!current) return current;
      return null;
    });
    return sessionMessage;
  }, [sessionMessage]);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      isBooting: status === "loading",
      sessionMessage,
      setSessionMessage,
      consumeSessionMessage,
      signIn,
      signUp,
      signOut,
      refreshUser,
      clearSession,
    }),
    [
      user,
      status,
      sessionMessage,
      consumeSessionMessage,
      signIn,
      signUp,
      signOut,
      refreshUser,
      clearSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
