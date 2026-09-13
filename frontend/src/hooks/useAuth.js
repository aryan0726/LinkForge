import { useContext } from "react";
import { AuthContext } from "../context/authContextObject";

/**
 * Access the authentication state and actions.
 *
 * Exposes:
 *   user, status, isAuthenticated, isBooting, sessionMessage
 *   signIn({ email, password }), signUp(payload), signOut(), refreshUser()
 *
 * The JWT itself is deliberately not exposed — it is managed entirely inside
 * the auth layer and never rendered or logged.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
}

export default useAuth;
