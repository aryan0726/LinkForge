import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiAtSign,
  FiCheck,
  FiLock,
  FiMail,
  FiUser,
} from "react-icons/fi";
import AuthLayout from "../components/auth/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { validateRegister } from "../utils/validation";
import { normalizeError } from "../services/errors";

/**
 * Registration page.
 *
 * Contract: POST /api/auth/register { fullName, username, email, password }
 *           -> { token }
 *
 * The backend returns a JWT on successful registration, so the user is signed
 * in directly and sent to the dashboard — no second trip through the login form.
 *
 * Note: a duplicate email or username is answered with HTTP 403 and a
 * completely empty body (verified against the running backend), so the
 * response cannot identify the offending field. `normalizeError` therefore
 * attributes the conflict from the endpoint, and highlights both unique fields
 * rather than pretending to know which one clashed.
 */
export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signUp } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Live password-strength feedback (length + character variety).
  const passwordChecks = [
    { label: "At least 8 characters", met: form.password.length >= 8 },
    { label: "Upper and lowercase", met: /[a-z]/.test(form.password) && /[A-Z]/.test(form.password) },
    { label: "A number or symbol", met: /[\d\W]/.test(form.password) },
  ];

  const updateField = (field) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateRegister(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      // Focus the first invalid field for keyboard users.
      const firstField = Object.keys(validationErrors)[0];
      document.querySelector(`[name="${firstField}"]`)?.focus();
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const { authenticated, profile } = await signUp({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (authenticated) {
        toast.success(
          "Account created",
          `Welcome to LinkForge${profile?.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""}.`,
        );
        navigate("/dashboard", { replace: true });
      } else {
        toast.success(
          "Account created",
          "Please sign in with your new credentials.",
        );
        navigate("/login", { replace: true });
      }
    } catch (error) {
      const normalized = normalizeError(error, "We couldn't create your account.");

      // A duplicate email/username arrives as an empty-bodied 403, so the
      // conflict is reported against the unique fields and the summary message
      // explains what to change. Focus the first flagged input for keyboard users.
      if (normalized.fieldErrors && Object.keys(normalized.fieldErrors).length) {
        setErrors(normalized.fieldErrors);
        setFormError(normalized.message);
        const firstField = Object.keys(normalized.fieldErrors)[0];
        document.querySelector(`[name="${firstField}"]`)?.focus();
      } else {
        setFormError(normalized.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account."
      subtitle="Join LinkForge to shorten links, organise them in one library, and see how many clicks each one earns."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand-600 hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <div className="animate-fade-up">
        <h1 className="text-[1.9rem] font-extrabold tracking-tight text-ink-900">
          Create your LinkForge account
        </h1>
        <p className="mt-2 text-[14.5px] text-ink-500">
          It takes less than a minute. Then you can start forging links.
        </p>

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
          className={`space-y-4.5 ${formError ? "mt-6" : "mt-8"}`}
        >
          <Input
            label="Full name"
            name="fullName"
            icon={FiUser}
            placeholder="Aryan Raj"
            autoComplete="name"
            value={form.fullName}
            onChange={updateField("fullName")}
            error={errors.fullName}
            required
            disabled={loading}
          />

          <Input
            label="Username"
            name="username"
            icon={FiAtSign}
            placeholder="aryan"
            autoComplete="username"
            hint="Letters, numbers, dots, dashes and underscores."
            value={form.username}
            onChange={updateField("username")}
            error={errors.username}
            required
            disabled={loading}
          />

          <Input
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

          <div>
            <Input
              label="Password"
              type="password"
              name="password"
              icon={FiLock}
              placeholder="Create a strong password"
              autoComplete="new-password"
              value={form.password}
              onChange={updateField("password")}
              error={errors.password}
              required
              disabled={loading}
            />

            {form.password ? (
              <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
                {passwordChecks.map((check) => (
                  <li
                    key={check.label}
                    className={`inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors ${
                      check.met ? "text-emerald-600" : "text-ink-400"
                    }`}
                  >
                    <FiCheck
                      size={13}
                      className={check.met ? "opacity-100" : "opacity-40"}
                      aria-hidden="true"
                    />
                    {check.label}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <Input
            label="Confirm password"
            type="password"
            name="confirmPassword"
            icon={FiLock}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={updateField("confirmPassword")}
            error={errors.confirmPassword}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
            iconRight={loading ? null : <FiArrowRight size={17} />}
            className="!mt-6"
          >
            {loading ? "Creating your account…" : "Create free account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-[12px] leading-relaxed text-ink-400">
          Passwords are hashed with BCrypt before storage. Your links are visible
          only to your account.
        </p>
      </div>
    </AuthLayout>
  );
}
