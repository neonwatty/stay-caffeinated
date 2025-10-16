/**
 * Error recovery hooks for React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GlobalErrorHandler, GameError, ErrorType, ErrorSeverity } from '@/utils/errorHandling';

/**
 * Hook for handling async operations with error recovery
 */
export function useAsyncWithRecovery<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setData(result);
      setRetryCount(0);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);

      // Attempt recovery
      const handler = GlobalErrorHandler.getInstance();
      const recovered = await handler.handleError(error, undefined, {
        hook: 'useAsyncWithRecovery',
        retryCount,
      });

      if (!recovered && retryCount < maxRetries) {
        // Auto-retry after delay
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          execute();
        }, 1000 * (retryCount + 1));
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, retryCount, ...deps]);

  const retry = useCallback(() => {
    setRetryCount(0);
    execute();
  }, [execute]);

  useEffect(() => {
    execute();
  }, deps);

  return { data, error, loading, retry, retryCount };
}

/**
 * Hook for error boundary reset
 */
export function useErrorBoundaryReset() {
  const [resetKey, setResetKey] = useState(0);

  const reset = useCallback(() => {
    setResetKey(prev => prev + 1);
  }, []);

  return { resetKey, reset };
}

/**
 * Hook for handling animation errors gracefully
 */
export function useSafeAnimation() {
  const [animationsDisabled, setAnimationsDisabled] = useState(false);
  const animationRef = useRef<unknown>(null);

  const safeAnimate = useCallback((animateFn: () => unknown) => {
    if (animationsDisabled) {
      console.log('Animations disabled, skipping');
      return null;
    }

    try {
      const animation = animateFn();
      animationRef.current = animation;
      return animation;
    } catch (error) {
      console.error('Animation error:', error);
      setAnimationsDisabled(true);
      
      // Log error
      GlobalErrorHandler.getInstance().handleError(
        new GameError(
          'Animation failed',
          ErrorType.ANIMATION,
          ErrorSeverity.LOW,
          true,
          { error: (error as Error).message }
        )
      );

      // Re-enable after delay
      setTimeout(() => {
        setAnimationsDisabled(false);
      }, 5000);

      return null;
    }
  }, [animationsDisabled]);

  const cleanup = useCallback(() => {
    const animation = animationRef.current as { pause?: () => void } | null;
    if (animation?.pause) {
      animation.pause();
    }
    animationRef.current = null;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { safeAnimate, cleanup, animationsDisabled };
}

/**
 * Hook for handling state corruption
 */
export function useStateRecovery<T>(
  key: string,
  defaultValue: T,
  validator?: (value: unknown) => boolean
) {
  const [value, setValue] = useState<T>(defaultValue);
  const [corrupted, setCorrupted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Validate if validator provided
        if (validator && !validator(parsed)) {
          throw new Error('Validation failed');
        }

        setValue(parsed);
      }
    } catch (error) {
      console.error(`State corruption detected for ${key}:`, error);
      setCorrupted(true);
      
      // Clear corrupted data
      localStorage.removeItem(key);
      
      // Log error
      GlobalErrorHandler.getInstance().handleError(
        new GameError(
          `State corruption: ${key}`,
          ErrorType.STATE_CORRUPTION,
          ErrorSeverity.MEDIUM,
          true,
          { key, error: (error as Error).message }
        )
      );
    }
  }, [key, defaultValue, validator]);

  const safeSetValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const finalValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(value)
        : newValue;

      // Validate before setting
      if (validator && !validator(finalValue)) {
        throw new Error('Invalid state value');
      }

      setValue(finalValue);
      localStorage.setItem(key, JSON.stringify(finalValue));
      setCorrupted(false);
    } catch (error) {
      console.error(`Failed to set state for ${key}:`, error);
      setCorrupted(true);
    }
  }, [key, value, validator]);

  const reset = useCallback(() => {
    setValue(defaultValue);
    localStorage.removeItem(key);
    setCorrupted(false);
  }, [key, defaultValue]);

  return { value, setValue: safeSetValue, corrupted, reset };
}

/**
 * Hook for network error recovery
 */
export function useNetworkRecovery() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? window.navigator.onLine : true
  );
  const [retryQueue, setRetryQueue] = useState<(() => Promise<unknown>)[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      // Process retry queue
      retryQueue.forEach(async (fn) => {
        try {
          await fn();
        } catch (error) {
          console.error('Retry failed:', error);
        }
      });
      setRetryQueue([]);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [retryQueue]);

  const executeWithRetry = useCallback(async <T,>(
    fn: () => Promise<T>
  ): Promise<T> => {
    if (!isOnline) {
      // Add to retry queue
      setRetryQueue(prev => [...prev, fn]);
      throw new GameError(
        'Network unavailable',
        ErrorType.NETWORK,
        ErrorSeverity.MEDIUM,
        true
      );
    }

    try {
      return await fn();
    } catch (error) {
      if ((error as Error).message.includes('network') || 
          (error as Error).message.includes('fetch')) {
        // Add to retry queue
        setRetryQueue(prev => [...prev, fn]);
      }
      throw error;
    }
  }, [isOnline]);

  return { isOnline, executeWithRetry, retryQueue: retryQueue.length };
}

/**
 * Hook for graceful degradation
 */
export function useGracefulDegradation() {
  const [features, setFeatures] = useState({
    animations: true,
    sounds: true,
    particles: true,
    highQualityGraphics: true,
  });

  const [performanceIssues, setPerformanceIssues] = useState(0);

  const reportPerformanceIssue = useCallback(() => {
    setPerformanceIssues(prev => prev + 1);
  }, []);

  useEffect(() => {
    // Progressively disable features based on performance issues
    if (performanceIssues > 5) {
      setFeatures(prev => ({ ...prev, particles: false }));
    }
    if (performanceIssues > 10) {
      setFeatures(prev => ({ ...prev, animations: false }));
    }
    if (performanceIssues > 15) {
      setFeatures(prev => ({ ...prev, highQualityGraphics: false }));
    }
    if (performanceIssues > 20) {
      setFeatures(prev => ({ ...prev, sounds: false }));
    }
  }, [performanceIssues]);

  const reset = useCallback(() => {
    setFeatures({
      animations: true,
      sounds: true,
      particles: true,
      highQualityGraphics: true,
    });
    setPerformanceIssues(0);
  }, []);

  return { features, reportPerformanceIssue, reset, performanceIssues };
}