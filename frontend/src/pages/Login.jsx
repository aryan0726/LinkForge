import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiArrowRight, FiLock, FiMail, FiX } from "react-icons/fi";
import AuthLayout from "../components/auth/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { validateLogin } from "../utils/validation";
import { normalizeError } from "../services/errors";

/**
 * Login page.
 *
 * Contract: POST /api/auth/login { email, password } -> { token }
 * The backend authenticates by email (the JWT subject is the email address),
 * so this is an email field rather than a username field.
 */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, sessionMessage, setSessionMessage } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const emailRef = useRef(null);

  // Populated by ProtectedRoute when it bounces an unauthenticated visitor,
  // or by the ?expired=1 redirect from the session-expiry handler.
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("from") || "/dashboard";
  const expired = params.get("expired") === "1";

  /**
   * The notice is derived during render rather than synced in an effect:
   * a session-expiry redirect always wins over a message passed via context.
   */
  const [dismissedNotice, setDismissedNotice] = useState(false);
  const notice = dismissedNotice
    ? null
    : expired
      ? "Your session has expired. Please sign in again."
      : sessionMessage;

  // Clear the context-held message once it has been surfaced, so it does not
  // reappear on a later visit to this page.
  useEffect(() => {
    if (expired || !sessionMessage) return;
    setSessionMessage(null);
  }, [expired, sessionMessage, setSessionMessage]);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const updateField = (field) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateLogin(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      await signIn({ email: form.email.trim(), password: form.password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const normalized = normalizeError(error, "We couldn't sign you in.");
      setFormError(normalized.message);
      setErrors(normalized.fieldErrors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Sign in to create short links, manage your library, and keep track of clicks."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-brand-600 hover:underline"
          >
            Create one free
          </Link>
        </>
      }
    >
      <div className="animate-fade-up">
        <h1 className="text-[1.9rem] font-extrabold tracking-tight text-ink-900">
          Log in to LinkForge
        </h1>
        <p className="mt-2 text-[14.5px] text-ink-500">
          Use the email address you registered with.
        </p>

        {notice ? (
          <div
            role="status"
            className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5"
          >
            <FiAlertTriangle
              className="mt-0.5 shrink-0 text-amber-500"
              size={16}
              aria-hidden="true"
            />
            <p className="flex-1 text-[13px] leading-relaxed text-amber-800">
              {notice}
            </p>
            <button
              type="button"
              onClick={() => setDismissedNotice(true)}
              aria-label="Dismiss notice"
              className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-amber-500 transition-colors hover:bg-amber-100 hover:text-amber-700"
            >
              <FiX size={14} />
            </button>
          </div>
        ) : null}

        {formError ? (
          <div
            role="alert"
            className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5"
          >
            <FiAlertTriangle
              className="mt-0.5 shrink-0 text-red-500"
              size={16}
              aria-hidden="true"
            />
            <p className="text-[13px] leading-relaxed text-red-700">{formError}</p>
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          noValidate
          className={`space-y-5 ${notice || formError ? "mt-6" : "mt-8"}`}
        >
          <Input
            ref={emailRef}
            label="Email address"
            type="email"
            name="email"
            icon={FiMail}
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={updateField("email")}
            error={errors.email}
            required
            disabled={loading}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            icon={FiLock}
            placeholder="Enter your password"
            autoComplete="current-password"
            value={form.password}
            onChange={updateField("password")}
            error={errors.password}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
            iconRight={loading ? null : <FiArrowRight size={17} />}
          >
            {loading ? "Signing in…" : "Log In"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
