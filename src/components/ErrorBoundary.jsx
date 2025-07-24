// components/ErrorBoundary.jsx
import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-md">
            <h3 className="text-lg font-medium text-red-800">
              Something went wrong
            </h3>
            <p className="mt-2 text-red-700">
              We've encountered an unexpected error. Please try refreshing the
              page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
