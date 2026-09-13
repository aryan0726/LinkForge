import { useLocation } from "react-router-dom";

/**
 * Thin gradient progress bar at the top of the viewport, shown briefly on
 * every route change.
 *
 * The animation is driven entirely by CSS keyframes and the component is
 * remounted per route via a `key`, so there is no state to synchronise and no
 * effect needed — the bar simply plays its animation and fades out.
 */
export default function NavProgress() {
  const { pathname } = useLocation();

  return (
    <>
      <style>{`
        @keyframes linkforge-nav-progress {
          0%   { width: 0%;   opacity: 1; }
          12%  { width: 28%;  opacity: 1; }
          45%  { width: 68%;  opacity: 1; }
          80%  { width: 92%;  opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
      `}</style>

      <div
        key={pathname}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[95] h-0.5"
      >
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-brand-500 via-accent-500 to-brand-400 shadow-[0_0_8px_rgba(99,102,241,0.7)]"
          style={{
            animation:
              "linkforge-nav-progress 620ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        />
      </div>
    </>
  );
}
