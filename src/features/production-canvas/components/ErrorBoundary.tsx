import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class CanvasErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      "[CanvasErrorBoundary]",
      error.message,
      "\nComponent stack:",
      info.componentStack,
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleClearAndReload = () => {
    // Clear saved state for current project
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("canvas-"));
    keys.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-background">
          <div className="text-center space-y-4 max-w-md px-6">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-lg font-bold text-foreground">
              {this.props.fallbackTitle ?? "Something went wrong"}
            </h2>
            <p className="text-sm text-muted-foreground">
              The canvas encountered an error. You can try again or reset the
              canvas to its default state.
            </p>
            {this.state.error && (
              <pre className="text-xs text-destructive/80 bg-destructive/5 p-3 rounded-lg overflow-auto max-h-32 text-left">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={this.handleReset}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Try Again
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={this.handleClearAndReload}
              >
                Reset Canvas
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}