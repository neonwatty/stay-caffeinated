'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GameError, ErrorType, ErrorSeverity, GlobalErrorHandler } from '@/utils/errorHandling';

/**
 * Game-specific error boundary for handling game errors gracefully
 */
interface GameErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
  retryCount: number;
}

interface GameErrorBoundaryProps {
  children: ReactNode;
  onGameReset?: () => void;
  maxRetries?: number;
}

export class GameErrorBoundary extends Component<GameErrorBoundaryProps, GameErrorBoundaryState> {
  constructor(props: GameErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<GameErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const handler = GlobalErrorHandler.getInstance();

    // Check if it's a game-specific error
    const isGameError = error instanceof GameError;
    const context = {
      component: 'GameErrorBoundary',
      isGameError,
      retryCount: this.state.retryCount,
    };

    // Log the error
    await handler.handleError(error, errorInfo, context);

    // Update state
    this.setState({
      errorInfo,
      retryCount: this.state.retryCount + 1,
    });

    // Auto-recover for certain error types
    if (isGameError && error.recoverable) {
      await this.attemptAutoRecovery(error);
    }
  }

  async attemptAutoRecovery(error: GameError) {
    const maxRetries = this.props.maxRetries || 3;
    
    if (this.state.retryCount >= maxRetries) {
      console.error('Max retries reached, cannot auto-recover');
      return;
    }

    this.setState({ isRecovering: true });

    // Different recovery strategies based on error type
    switch (error.type) {
      case ErrorType.ANIMATION:
        // Disable animations and retry
        await this.recoverFromAnimationError();
        break;
      case ErrorType.STATE_CORRUPTION:
        // Reset game state
        await this.recoverFromStateCorruption();
        break;
      case ErrorType.RESOURCE_LOADING:
        // Retry loading resources
        await this.recoverFromResourceError();
        break;
      default:
        // Generic recovery
        await this.genericRecovery();
    }

    this.setState({ isRecovering: false });
  }

  async recoverFromAnimationError() {
    console.log('Recovering from animation error...');
    // Disable animations
    document.body.classList.add('disable-animations');
    // Reset after delay
    setTimeout(() => {
      this.resetErrorBoundary();
    }, 500);
  }

  async recoverFromStateCorruption() {
    console.log('Recovering from state corruption...');
    // Clear corrupted state
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('stayCaffeinated_')) {
          localStorage.removeItem(key);
        }
      });
    }
    // Reset game
    this.props.onGameReset?.();
    this.resetErrorBoundary();
  }

  async recoverFromResourceError() {
    console.log('Recovering from resource error...');
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.resetErrorBoundary();
  }

  async genericRecovery() {
    console.log('Attempting generic recovery...');
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.resetErrorBoundary();
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
    });
  };

  render() {
    const { hasError, error, isRecovering, retryCount } = this.state;
    const { children } = this.props;

    if (hasError && error) {
      if (isRecovering) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <Card className="max-w-md w-full">
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">
                  Recovering from error...
                </h2>
                <p className="text-gray-400">
                  Please wait while we fix the issue
                </p>
              </div>
            </Card>
          </div>
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <Card className="max-w-md w-full">
            <div className="text-center p-8">
              {/* Error icon */}
              <div className="mx-auto w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              {/* Error message */}
              <h2 className="text-xl font-semibold text-white mb-2">
                Game Error Occurred
              </h2>
              <p className="text-gray-400 mb-6">
                {error.message || 'An unexpected error occurred in the game'}
              </p>

              {/* Retry count */}
              {retryCount > 1 && (
                <p className="text-sm text-amber-400 mb-4">
                  Retry attempt {retryCount}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.resetErrorBoundary}
                  variant="primary"
                  size="md"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    this.props.onGameReset?.();
                    this.resetErrorBoundary();
                  }}
                  variant="secondary"
                  size="md"
                >
                  Reset Game
                </Button>
              </div>

              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">
                    Show error details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-800 rounded text-xs font-mono overflow-auto max-h-40">
                    <pre className="text-red-400">
                      {error.stack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return children;
  }
}

/**
 * Animation-specific error boundary
 */
export class AnimationErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Animation error caught, disabling animations:', error);
    
    // Disable animations globally
    if (typeof document !== 'undefined') {
      document.body.classList.add('disable-animations');
    }

    // Log to error handler
    GlobalErrorHandler.getInstance().handleError(
      new GameError(
        error.message,
        ErrorType.ANIMATION,
        ErrorSeverity.LOW,
        true
      ),
      errorInfo
    );

    // Auto-reset after a delay
    setTimeout(() => {
      this.setState({ hasError: false });
    }, 100);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="animate-none">{this.props.children}</div>;
    }

    return this.props.children;
  }
}

/**
 * Network error boundary for API calls
 */
export function NetworkErrorBoundary({ 
  children, 
  onRetry 
}: { 
  children: ReactNode; 
  onRetry?: () => void;
}) {
  const [hasError, setHasError] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    const handleOnline = () => {
      if (hasError) {
        console.log('Network restored, retrying...');
        setHasError(false);
        setRetryCount(0);
        onRetry?.();
      }
    };

    const handleOffline = () => {
      console.warn('Network connection lost');
      setHasError(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasError, onRetry]);

  if (hasError) {
    return (
      <div className="p-4 bg-amber-900/20 border border-amber-800 rounded-lg">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-amber-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-amber-400 font-medium">
              Network Connection Issue
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Please check your internet connection
            </p>
          </div>
          <Button
            onClick={() => {
              setRetryCount(prev => prev + 1);
              setHasError(false);
              onRetry?.();
            }}
            variant="secondary"
            size="sm"
          >
            Retry {retryCount > 0 && `(${retryCount})`}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}