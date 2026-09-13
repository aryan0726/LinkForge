import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import { ToastContext } from "../../context/toastContextObject";


const ICONS = {
  success: FiCheckCircle,
  error: FiAlertTriangle,
  info: FiInfo,
};

const ACCENTS = {
  success: "text-emerald-500",
  error: "text-red-500",
  info: "text-brand-500",
};

function Toast({ toast, onDismiss }) {
  const Icon = ICONS[toast.variant] || FiInfo;
  const [leaving, setLeaving] = useState(false);

  const close = useCallback(() => {
    setLeaving(true);
    window.setTimeout(() => onDismiss(toast.id), 180);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    const timer = window.setTimeout(close, toast.duration);
    return () => window.clearTimeout(timer);
  }, [close, toast.duration]);

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      className={[
        "pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-ink-200 bg-white p-3.5 shadow-pop",
        "transition-all duration-200",
        leaving ? "translate-y-1 opacity-0" : "animate-toast-in",
      ].join(" ")}
    >
      <Icon
        className={`mt-0.5 shrink-0 text-lg ${ACCENTS[toast.variant] || ACCENTS.info}`}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 break-words text-[13px] leading-relaxed text-ink-500">
            {toast.description}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={close}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
      >
        <FiX size={15} />
      </button>
    </div>
  );
}

/**
 * Lightweight toast system. Rendered once at the app root; any component can
 * call `useToast().success(...)` etc. without prop drilling.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((variant, title, description, duration = 4000) => {
    idRef.current += 1;
    const id = idRef.current;
    setToasts((current) => [
      ...current.slice(-3),
      { id, variant, title, description, duration },
    ]);
    return id;
  }, []);

  const toast = useMemo(
    () => ({
      success: (title, description) => push("success", title, description),
      error: (title, description) => push("error", title, description, 5500),
      info: (title, description) => push("info", title, description),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2.5 p-4 sm:inset-x-auto sm:right-0 sm:bottom-0 sm:items-end sm:p-6"
      >
        <div className="flex w-full max-w-sm flex-col gap-2.5">
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
