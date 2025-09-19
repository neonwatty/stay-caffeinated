'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Error boundary props
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
}

/**
 * Error Boundary Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;

    // Import error handling utilities
    const { GlobalErrorHandler } = await import('@/utils/errorHandling');
    const handler = GlobalErrorHandler.getInstance();

    // Log error details with context
    const context = {
      component: this.constructor.name,
      level: this.props.level || 'component',
      errorCount: this.state.errorCount + 1,
    };

    // Attempt recovery
    const recovered = await handler.handleError(error, errorInfo, context);

    if (!recovered) {
      // Update state with error details
      this.setState(prevState => ({
        errorInfo,
        errorCount: prevState.errorCount + 1,
      }));
    }

    // Call error handler if provided
    onError?.(error, errorInfo);

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
      }
    }
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Here you would send error to tracking service
    // e.g., Sentry, LogRocket, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };
    
    console.log('Error report:', errorReport);
  };

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError && error && errorInfo) {
      // Custom fallback provided
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, errorInfo, this.resetErrorBoundary);
        }
        return fallback;
      }

      // Default error UI based on level
      return <DefaultErrorFallback
        error={error}
        errorInfo={errorInfo}
        level={level}
        errorCount={errorCount}
        onRetry={this.resetErrorBoundary}
      />;
    }

    return children;
  }
}

/**
 * Default error fallback component
 */
interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  level: 'page' | 'section' | 'component';
  errorCount: number;
  onRetry: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  errorInfo,
  level,
  errorCount,
  onRetry,
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const levelStyles = {
    page: 'min-h-screen',
    section: 'min-h-[400px]',
    component: 'min-h-[200px]',
  };

  return (
    <div className={`flex items-center justify-center p-4 ${levelStyles[level]}`}>
      <Card className="max-w-lg w-full">
        <div className="text-center space-y-4">
          {/* Error icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error message */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {level === 'page'
                ? "We're having trouble loading this page."
                : level === 'section'
                ? "This section couldn't be displayed."
                : "This component encountered an error."}
            </p>
          </div>

          {/* Error details in development */}
          {isDevelopment && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Show error details
              </summary>
              <div className="mt-2 space-y-2">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-auto max-h-40">
                  <div className="text-red-600 dark:text-red-400 font-semibold">
                    {error.name}: {error.message}
                  </div>
                  {error.stack && (
                    <pre className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  )}
                </div>
                {errorInfo.componentStack && (
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-auto max-h-40">
                    <div className="text-gray-600 dark:text-gray-400 font-semibold mb-1">
                      Component Stack:
                    </div>
                    <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Error count warning */}
          {errorCount > 2 && (
            <div className="text-sm text-amber-600 dark:text-amber-400">
              This error has occurred {errorCount} times. Consider refreshing the page.
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onRetry}
              variant="primary"
              size="medium"
            >
              Try Again
            </Button>
            {level === 'page' && (
              <Button
                onClick={() => window.location.href = '/'}
                variant="secondary"
                size="medium"
              >
                Go Home
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Error boundary provider for wrapping app or sections
 */
interface ErrorBoundaryProviderProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({
  children,
  onError,
}) => {
  return (
    <ErrorBoundary
      level="page"
      onError={onError}
      fallback={(error, errorInfo, retry) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <DefaultErrorFallback
            error={error}
            errorInfo={errorInfo}
            level="page"
            errorCount={1}
            onRetry={retry}
          />
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Hook to trigger error boundary (for testing)
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}

/**
 * Async error boundary for handling promise rejections
 */
interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  fallback,
}) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <>
        {fallback || (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-amber-800 dark:text-amber-200">
              An unexpected error occurred. Please refresh the page.
            </p>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};
