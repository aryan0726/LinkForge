import { Link } from "react-router-dom";
import { FiCompass, FiHome } from "react-icons/fi";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";

/** 404 page for unknown routes. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center px-5 sm:px-8">
        <Logo to="/" size={34} />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="animate-fade-up text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 ring-8 ring-brand-50/60">
            <FiCompass size={28} aria-hidden="true" />
          </span>

          <p className="mt-7 font-mono text-sm font-bold tracking-widest text-brand-500">
            404
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            This link doesn&rsquo;t resolve
          </h1>

          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-500">
            The page you&rsquo;re looking for doesn&rsquo;t exist, or it may have
            been moved. Head back to safety and try again.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/" size="lg" icon={<FiHome size={16} />}>
              Back to home
            </Button>
            <Button to="/dashboard" variant="secondary" size="lg">
              Go to dashboard
            </Button>
          </div>

          <p className="mt-8 text-[13px] text-ink-400">
            Looking for a short link?{" "}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:underline"
            >
              Sign in to manage your links
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
