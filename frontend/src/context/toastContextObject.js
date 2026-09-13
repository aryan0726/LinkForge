import { createContext } from "react";

/**
 * Toast context object.
 *
 * Lives outside the provider component so React Fast Refresh can reload
 * <ToastProvider> without changing the context identity.
 */
export const ToastContext = createContext(null);

export default ToastContext;
