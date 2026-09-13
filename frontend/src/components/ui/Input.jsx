import { forwardRef, useId, useState } from "react";
import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";

/**
 * Accessible text input with label, optional leading icon, hint text and
 * inline validation error. Keeps a single visual language across all forms.
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    type = "text",
    id,
    required = false,
    className = "",
    containerClassName = "",
    autoComplete,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id || `field-${generatedId}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && revealed ? "text" : type;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={containerClassName}>
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-[13px] font-semibold text-ink-700"
        >
          {label}
          {required ? (
            <span className="ml-0.5 text-brand-500" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div className="relative">
        {Icon ? (
          <Icon
            className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[17px] ${
              error ? "text-red-400" : "text-ink-400"
            }`}
            aria-hidden="true"
          />
        ) : null}

        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          required={required}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          autoComplete={autoComplete}
          className={[
            "h-11 w-full rounded-xl border bg-white text-sm text-ink-900",
            "placeholder:text-ink-400 transition-all duration-200",
            "focus:outline-none focus:ring-4",
            Icon ? "pl-10.5" : "pl-3.5",
            isPassword ? "pr-11" : "pr-3.5",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-ink-200 hover:border-ink-300 focus:border-brand-400 focus:ring-brand-100",
            "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600"
          >
            {revealed ? <FiEyeOff size={17} /> : <FiEye size={17} />}
          </button>
        ) : null}
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-red-600"
        >
          <FiAlertCircle className="shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-[13px] text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
