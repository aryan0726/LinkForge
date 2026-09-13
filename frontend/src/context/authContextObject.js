import { createContext } from "react";

/**
 * Authentication context object.
 *
 * Kept in its own module (not in the provider file) so that React Fast Refresh
 * can hot-reload the provider without invalidating the context identity.
 */
export const AuthContext = createContext(null);

export default AuthContext;
