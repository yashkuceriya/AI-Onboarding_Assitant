import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={28} className="text-amber-500" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              We hit an unexpected error. Try refreshing the page or going back to the dashboard.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.reset}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00aed9] to-[#0090b3] text-white font-semibold rounded-xl shadow-lg shadow-[#00aed9]/20 hover:shadow-xl transition-all btn-press text-sm"
              >
                <RotateCcw size={15} />
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all btn-press text-sm"
              >
                <RotateCcw size={15} />
                Refresh Page
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all btn-press text-sm"
              >
                <Home size={15} />
                Dashboard
              </button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition">
                  Technical details
                </summary>
                <pre className="mt-2 text-xs text-gray-400 bg-gray-50 dark:bg-slate-800 rounded-lg p-3 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
