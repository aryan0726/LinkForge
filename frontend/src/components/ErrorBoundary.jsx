import { Component } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

/**
 * Top-level error boundary.
 *
 * Without this, any render-time exception leaves the user staring at a blank
 * white page. Here they get a recoverable state instead, and the error is
 * logged for debugging without being shown in full to the user.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface the failure for developers; never render a stack trace to users.
    console.error("LinkForge UI error:", error, info?.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  handleHome = () => {
    this.setState({ error: null });
    window.location.assign("/");
  };

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <div className="grid min-h-screen place-items-center bg-ink-50 px-5">
        <div className="w-full max-w-md rounded-2xl border border-ink-200 bg-white p-8 text-center shadow-card">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-8 ring-red-50/70">
            <FiAlertTriangle size={24} aria-hidden="true" />
          </span>

          <h1 className="mt-6 text-xl font-bold tracking-tight text-ink-900">
            Something went wrong
          </h1>

          <p className="mt-2.5 text-sm leading-relaxed text-ink-500">
            An unexpected error interrupted this page. Reloading usually clears
            it — your links are safe on the server.
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <FiRefreshCw size={15} />
              Reload page
            </button>
            <button
              type="button"
              onClick={this.handleHome}
              className="h-11 rounded-xl border border-ink-200 bg-white px-5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
