/**
 * Production Monitoring and Error Tracking
 */

// Performance API type definitions
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface ErrorReport {
  message: string;
  stack?: string;
  level: 'error' | 'warning' | 'info';
  context?: Record<string, unknown>;
  timestamp: number;
  userAgent?: string;
  url?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
}

class MonitoringService {
  private queue: ErrorReport[] = [];
  private metricsQueue: PerformanceMetric[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    if (this.isProduction && typeof window !== 'undefined') {
      this.initializeErrorHandling();
      this.initializePerformanceMonitoring();
      this.startFlushInterval();
    }
  }

  private initializeErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        { promise: true }
      );
    });
  }

  private initializePerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.trackMetric('LCP', lastEntry.startTime, 'ms');
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const perfEntry = entry as PerformanceEventTiming;
            this.trackMetric('FID', perfEntry.processingStart - perfEntry.startTime, 'ms');
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutEntry = entry as LayoutShift;
            if (!layoutEntry.hadRecentInput) {
              clsValue += layoutEntry.value;
              this.trackMetric('CLS', clsValue, 'score');
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('Performance monitoring initialization failed:', e);
      }
    }

    // Monitor resource timing
    if (performance && performance.getEntriesByType) {
      window.addEventListener('load', () => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const totalSize = resources.reduce((acc, resource) => {
          return acc + (resource.transferSize || 0);
        }, 0);
        this.trackMetric('TotalResourceSize', totalSize / 1024, 'KB');

        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.trackMetric('DOMContentLoaded', navigation.domContentLoadedEventEnd, 'ms');
          this.trackMetric('LoadComplete', navigation.loadEventEnd, 'ms');
        }
      });
    }
  }

  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // Flush every 30 seconds
  }

  public captureError(
    error: Error | string,
    context?: Record<string, unknown>
  ): void {
    const errorReport: ErrorReport = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      level: 'error',
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.queue.push(errorReport);

    // Immediate flush for critical errors
    if (this.queue.length >= 10) {
      this.flush();
    }

    // Log to console in development
    if (!this.isProduction) {
      console.error('Error captured:', errorReport);
    }
  }

  public captureWarning(message: string, context?: Record<string, unknown>): void {
    const errorReport: ErrorReport = {
      message,
      level: 'warning',
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.queue.push(errorReport);
  }

  public trackMetric(
    name: string,
    value: number,
    unit?: string,
    tags?: Record<string, string>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      tags,
    };

    this.metricsQueue.push(metric);

    // Log metrics in development
    if (!this.isProduction) {
      console.log(`Metric: ${name} = ${value}${unit ? ` ${unit}` : ''}`, tags);
    }
  }

  public trackEvent(
    eventName: string,
    properties?: Record<string, unknown>
  ): void {
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', eventName, properties);
    }

    // Also send to other analytics providers if configured
    if (typeof window !== 'undefined' && (window as unknown as { mixpanel?: { track: (...args: unknown[]) => void } }).mixpanel) {
      (window as unknown as { mixpanel: { track: (...args: unknown[]) => void } }).mixpanel.track(eventName, properties);
    }
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0 && this.metricsQueue.length === 0) {
      return;
    }

    const errors = [...this.queue];
    const metrics = [...this.metricsQueue];

    this.queue = [];
    this.metricsQueue = [];

    // Send to Sentry if configured
    // Sentry integration commented out - install @sentry/nextjs if needed
    // if (process.env.NEXT_PUBLIC_SENTRY_DSN && typeof window !== 'undefined') {
    //   try {
    //     const Sentry = await import('@sentry/nextjs');
    //     errors.forEach(error => {
    //       if (error.level === 'error') {
    //         Sentry.captureException(new Error(error.message), {
    //           contexts: {
    //             custom: error.context || {},
    //           },
    //         });
    //       } else {
    //         Sentry.captureMessage(error.message, error.level);
    //       }
    //     });
    //   } catch (e) {
    //     console.warn('Failed to send errors to Sentry:', e);
    //   }
    // }

    // Send metrics to analytics endpoint if configured
    if (metrics.length > 0 && process.env.NEXT_PUBLIC_API_URL) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metrics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ metrics, timestamp: Date.now() }),
        });
      } catch (e) {
        console.warn('Failed to send metrics:', e);
      }
    }
  }

  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Singleton instance
let monitoringInstance: MonitoringService | null = null;

export function getMonitoring(): MonitoringService {
  if (!monitoringInstance) {
    monitoringInstance = new MonitoringService();
  }
  return monitoringInstance;
}

// Helper functions for easy usage
export function captureError(error: Error | string, context?: Record<string, unknown>): void {
  getMonitoring().captureError(error, context);
}

export function captureWarning(message: string, context?: Record<string, unknown>): void {
  getMonitoring().captureWarning(message, context);
}

export function trackMetric(
  name: string,
  value: number,
  unit?: string,
  tags?: Record<string, string>
): void {
  getMonitoring().trackMetric(name, value, unit, tags);
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  getMonitoring().trackEvent(eventName, properties);
}

// Initialize monitoring on page load
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const monitoring = getMonitoring();
    monitoring.destroy();
  });
}