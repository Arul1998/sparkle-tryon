import { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 p-6 text-center h-full min-h-[200px]">
          <div className="w-12 h-12 rounded-full border border-destructive/30 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="font-display text-base text-foreground">
            {this.props.fallbackTitle || "Something went wrong"}
          </h3>
          <p className="text-muted-foreground text-xs font-body max-w-xs">
            {this.props.fallbackMessage ||
              "An unexpected error occurred. This might be a WebGL or camera compatibility issue."}
          </p>
          {this.state.error && (
            <p className="text-[10px] font-body text-muted-foreground/60 max-w-xs truncate">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-sm border border-border text-xs font-body text-foreground hover:bg-secondary transition-colors mt-1"
          >
            <RefreshCw className="w-3 h-3" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
