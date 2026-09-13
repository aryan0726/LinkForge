import Button from "../ui/Button";
import { FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";

/** Final conversion block before the footer. */
export default function FinalCta() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="pb-20 sm:pb-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-600 to-accent-600 px-6 py-14 text-center shadow-lift sm:px-14 sm:py-20">
          {/* Decorative wash */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-accent-400/25 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-[2.6rem]">
              Ready to forge your first link?
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-white/80">
              Create a free LinkForge account and turn your next long URL into a
              short link you'll actually want to share.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {isAuthenticated ? (
                <Button
                  to="/dashboard"
                  size="lg"
                  variant="secondary"
                  iconRight={<FiArrowRight size={17} />}
                  className="w-full !border-transparent !bg-white !text-brand-700 hover:!bg-brand-50 sm:w-auto"
                >
                  Go to dashboard
                </Button>
              ) : (
                <>
                  <Button
                    to="/register"
                    size="lg"
                    iconRight={<FiArrowRight size={17} />}
                    className="w-full !bg-white !from-white !to-white !text-brand-700 shadow-lg hover:!bg-brand-50 hover:!from-brand-50 hover:!to-brand-50 sm:w-auto"
                  >
                    Get Started free
                  </Button>
                  <Button
                    to="/login"
                    size="lg"
                    className="w-full !border !border-white/30 !bg-white/10 !from-transparent !to-transparent !text-white backdrop-blur-sm hover:!bg-white/20 sm:w-auto"
                  >
                    Log In
                  </Button>
                </>
              )}
            </div>

            <p className="mt-7 text-[13px] text-white/60">
              No credit card. No trial period. Just links that work.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
