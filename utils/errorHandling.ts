/**
 * Comprehensive error handling utilities
 */

import { ErrorInfo } from 'react';

/**
 * Error types for categorization
 */
export enum ErrorType {
  RENDERING = 'RENDERING',
  NETWORK = 'NETWORK',
  ANIMATION = 'ANIMATION',
  STATE_CORRUPTION = 'STATE_CORRUPTION',
  RESOURCE_LOADING = 'RESOURCE_LOADING',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Extended error class with additional context
 */
export class GameError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly recoverable: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    recoverable = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GameError';
    this.type = type;
    this.severity = severity;
    this.recoverable = recoverable;
    this.context = context;
    this.timestamp = new Date();

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GameError);
    }
  }
}

/**
 * Error recovery strategies
 */
export interface RecoveryStrategy {
  canRecover: (error: Error) => boolean;
  recover: (error: Error) => Promise<void>;
  maxRetries?: number;
}

/**
 * Animation error recovery
 */
export const animationErrorRecovery: RecoveryStrategy = {
  canRecover: (error) => {
    return error.message.includes('anime') || 
           error.message.includes('animation') ||
           error.message.includes('transition');
  },
  recover: async (error) => {
    console.warn('Animation error detected, falling back to no animation:', error);
    // Disable animations globally
    if (typeof document !== 'undefined') {
      document.body.classList.add('disable-animations');
    }
  },
  maxRetries: 1,
};

/**
 * State corruption recovery
 */
export const stateCorruptionRecovery: RecoveryStrategy = {
  canRecover: (error) => {
    return error instanceof GameError && 
           error.type === ErrorType.STATE_CORRUPTION;
  },
  recover: async () => {
    console.warn('State corruption detected, resetting to default state');
    // Clear corrupted state from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('stayCaffeinated_')) {
          localStorage.removeItem(key);
        }
      });
    }
    // Reload the page to reset state
    window.location.reload();
  },
  maxRetries: 1,
};

/**
 * Resource loading error recovery
 */
export const resourceLoadingRecovery: RecoveryStrategy = {
  canRecover: (error) => {
    return error.message.includes('Failed to fetch') ||
           error.message.includes('Network') ||
           error.message.includes('load');
  },
  recover: async (error) => {
    console.warn('Resource loading error, retrying:', error);
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, 1000));
  },
  maxRetries: 3,
};

/**
 * Error recovery manager
 */
export class ErrorRecoveryManager {
  private strategies: RecoveryStrategy[] = [];
  private retryCount: Map<string, number> = new Map();

  constructor() {
    // Register default strategies
    this.registerStrategy(animationErrorRecovery);
    this.registerStrategy(stateCorruptionRecovery);
    this.registerStrategy(resourceLoadingRecovery);
  }

  registerStrategy(strategy: RecoveryStrategy) {
    this.strategies.push(strategy);
  }

  async attemptRecovery(error: Error): Promise<boolean> {
    const errorKey = `${error.name}_${error.message}`;
    const currentRetries = this.retryCount.get(errorKey) || 0;

    for (const strategy of this.strategies) {
      if (strategy.canRecover(error)) {
        const maxRetries = strategy.maxRetries || 1;
        
        if (currentRetries >= maxRetries) {
          console.error(`Max retries (${maxRetries}) exceeded for error:`, error);
          return false;
        }

        try {
          this.retryCount.set(errorKey, currentRetries + 1);
          await strategy.recover(error);
          return true;
        } catch (recoveryError) {
          console.error('Recovery strategy failed:', recoveryError);
        }
      }
    }

    return false;
  }

  resetRetryCount() {
    this.retryCount.clear();
  }
}

/**
 * Error logger with different providers
 */
export interface ErrorLogger {
  logError(error: Error, errorInfo?: ErrorInfo, context?: Record<string, unknown>): void;
  logWarning(message: string, context?: Record<string, unknown>): void;
  logInfo(message: string, context?: Record<string, unknown>): void;
}

/**
 * Console error logger (development)
 */
export class ConsoleErrorLogger implements ErrorLogger {
  logError(error: Error, errorInfo?: ErrorInfo, context?: Record<string, unknown>) {
    console.group(`🔴 Error: ${error.name}`);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    if (errorInfo) {
      console.error('Component Stack:', errorInfo.componentStack);
    }
    if (context) {
      console.error('Context:', context);
    }
    console.groupEnd();
  }

  logWarning(message: string, context?: Record<string, unknown>) {
    console.warn(`⚠️ Warning: ${message}`, context);
  }

  logInfo(message: string, context?: Record<string, unknown>) {
    console.info(`ℹ️ Info: ${message}`, context);
  }
}

/**
 * Remote error logger (production)
 */
export class RemoteErrorLogger implements ErrorLogger {
  private endpoint: string;
  private apiKey?: string;

  constructor(endpoint: string, apiKey?: string) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  async logError(error: Error, errorInfo?: ErrorInfo, context?: Record<string, unknown>) {
    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        },
        body: JSON.stringify(errorData),
      });
    } catch (loggingError) {
      console.error('Failed to log error remotely:', loggingError);
    }
  }

  logWarning(message: string, context?: Record<string, unknown>) {
    this.logError(new Error(message), undefined, { ...context, level: 'warning' });
  }

  logInfo(message: string, context?: Record<string, unknown>) {
    // Don't log info messages remotely to reduce noise
    if (process.env.NODE_ENV === 'development') {
      console.info(message, context);
    }
  }
}

/**
 * Error logging manager
 */
export class ErrorLoggingManager {
  private loggers: ErrorLogger[] = [];

  constructor() {
    // Add console logger in development
    if (process.env.NODE_ENV === 'development') {
      this.addLogger(new ConsoleErrorLogger());
    }

    // Add remote logger in production
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ERROR_ENDPOINT) {
      this.addLogger(
        new RemoteErrorLogger(
          process.env.NEXT_PUBLIC_ERROR_ENDPOINT,
          process.env.NEXT_PUBLIC_ERROR_API_KEY
        )
      );
    }
  }

  addLogger(logger: ErrorLogger) {
    this.loggers.push(logger);
  }

  logError(error: Error, errorInfo?: ErrorInfo, context?: Record<string, unknown>) {
    this.loggers.forEach(logger => logger.logError(error, errorInfo, context));
  }

  logWarning(message: string, context?: Record<string, unknown>) {
    this.loggers.forEach(logger => logger.logWarning(message, context));
  }

  logInfo(message: string, context?: Record<string, unknown>) {
    this.loggers.forEach(logger => logger.logInfo(message, context));
  }
}

/**
 * Global error handler
 */
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private recoveryManager: ErrorRecoveryManager;
  private loggingManager: ErrorLoggingManager;

  private constructor() {
    this.recoveryManager = new ErrorRecoveryManager();
    this.loggingManager = new ErrorLoggingManager();
    this.setupGlobalHandlers();
  }

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  private setupGlobalHandlers() {
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(new Error(event.reason));
        event.preventDefault();
      });

      // Handle global errors
      window.addEventListener('error', (event) => {
        this.handleError(event.error || new Error(event.message));
        event.preventDefault();
      });
    }
  }

  async handleError(error: Error, errorInfo?: ErrorInfo, context?: Record<string, unknown>) {
    // Log the error
    this.loggingManager.logError(error, errorInfo, context);

    // Attempt recovery
    const recovered = await this.recoveryManager.attemptRecovery(error);
    
    if (!recovered && error instanceof GameError && !error.recoverable) {
      // Non-recoverable error, show user message
      this.showUserErrorMessage(error);
    }

    return recovered;
  }

  private showUserErrorMessage(error: GameError) {
    // Create a toast or modal to show error to user
    if (typeof document !== 'undefined') {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50';
      errorDiv.textContent = `Error: ${error.message}`;
      document.body.appendChild(errorDiv);

      setTimeout(() => {
        errorDiv.remove();
      }, 5000);
    }
  }

  getRecoveryManager() {
    return this.recoveryManager;
  }

  getLoggingManager() {
    return this.loggingManager;
  }
}

/**
 * Utility function to safely execute async operations
 */
export async function safeAsyncExecute<T>(
  operation: () => Promise<T>,
  fallback: T,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const handler = GlobalErrorHandler.getInstance();
    await handler.handleError(error as Error, undefined, context);
    return fallback;
  }
}

/**
 * Utility function to safely execute sync operations
 */
export function safeSyncExecute<T>(
  operation: () => T,
  fallback: T,
  context?: Record<string, unknown>
): T {
  try {
    return operation();
  } catch (error) {
    const handler = GlobalErrorHandler.getInstance();
    handler.handleError(error as Error, undefined, context);
    return fallback;
  }
}