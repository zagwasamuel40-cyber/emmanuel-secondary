import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleClearStorageAndReload = () => {
    if (window.confirm("This will clear cached data and reload the application safely. Continue?")) {
      try {
        sessionStorage.clear();
        // Clear oversized items in localStorage
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) {
            const val = localStorage.getItem(k);
            if (val && val.length > 50000) {
              keysToRemove.push(k);
            }
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch (e) {
        console.warn("Storage cleanup failed:", e);
      }
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert size={32} />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                {this.props.fallbackTitle || "Something went wrong"}
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                An unexpected interface error occurred. You can reload the page or navigate back to the main portal safely.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-100 p-3 rounded-xl text-left overflow-x-auto max-h-32 text-xs font-mono text-slate-800 border border-slate-200">
                <span className="font-bold text-rose-600">Error: </span>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <RefreshCw size={16} />
                Reload Page
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Home size={16} />
                Return to Home
              </button>
            </div>

            <button
              onClick={this.handleClearStorageAndReload}
              className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
            >
              Reset session cache & reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
