import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
          <p className="font-display text-display-lg text-ink-300 dark:text-ink-700">Oops</p>
          <p className="mt-4 text-ink-600 dark:text-ink-400 font-serif">
            Algo salió mal. Por favor, recarga la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-5 py-2.5 rounded-md bg-ink-900 text-white dark:bg-white dark:text-ink-900 font-sans text-sm font-medium hover:bg-ink-800 dark:hover:bg-ink-100 transition-colors"
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}