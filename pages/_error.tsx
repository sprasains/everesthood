import React from 'react';

// Global error boundary for Next.js pages
class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Log error to console and Sentry (client-side safe)
    console.error('Error caught by boundary:', error, errorInfo);
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return <div>Sorry, something went wrong.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
