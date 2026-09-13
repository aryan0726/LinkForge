import { Link } from "react-router-dom";
import { Spinner } from "./Spinner";

const VARIANTS = {
  primary:
    "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_8px_20px_-8px_rgba(79,70,229,0.65)] hover:from-brand-600 hover:to-brand-700 active:from-brand-700 active:to-brand-700",
  secondary:
    "bg-white text-ink-700 border border-ink-200 shadow-soft hover:bg-ink-50 hover:text-ink-900",
  ghost: "bg-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-900",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  danger:
    "bg-white text-red-600 border border-red-200 shadow-soft hover:bg-red-50 hover:border-red-300",
  dark: "bg-ink-900 text-white hover:bg-ink-800 shadow-soft",
};

const SIZES = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-lg",
  md: "h-11 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-xl",
};

/**
 * Shared button. Renders an <a>, a Router <Link> or a <button> depending on
 * the props supplied, so every call site gets identical styling and
 * keyboard/disabled semantics.
 */
export default function Button({
  as,
  to,
  href,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon = null,
  iconRight = null,
  fullWidth = false,
  className = "",
  children,
  ...rest
}) {
  const isDisabled = disabled || loading;

  const classes = [
    "inline-flex items-center justify-center font-semibold whitespace-nowrap",
    "transition-all duration-200 select-none",
    "disabled:opacity-55 disabled:pointer-events-none",
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      {loading ? <Spinner size={16} /> : icon}
      {children}
      {!loading && iconRight}
    </>
  );

  if (to && !isDisabled) {
    return (
      <Link to={to} className={classes} {...rest}>
        {inner}
      </Link>
    );
  }

  if (href && !isDisabled) {
    return (
      <a href={href} className={classes} {...rest}>
        {inner}
      </a>
    );
  }

  const Component = as || "button";

  return (
    <Component
      className={classes}
      disabled={Component === "button" ? isDisabled : undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {inner}
    </Component>
  );
}
