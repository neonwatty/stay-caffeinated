'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useEffect } from 'react';

/**
 * Web Vitals reporting component
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(metric);
    }

    // Send to analytics endpoint
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      timestamp: Date.now(),
    });

    // Example: Send to your analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }).catch((error) => {
        console.error('Failed to send metrics:', error);
      });
    }

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
      (window as unknown as { gtag: Function }).gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }
  });

  return null;
}

/**
 * Performance metrics display component
 */
interface MetricData {
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<Record<string, MetricData>>({});
  const [isVisible, setIsVisible] = useState(false);

  useReportWebVitals((metric) => {
    setMetrics((prev) => ({
      ...prev,
      [metric.name]: {
        value: metric.value,
        rating: metric.rating,
      },
    }));
  });

  // Only show in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Show metrics with keyboard shortcut (Ctrl/Cmd + Shift + P)
      const handleKeyPress = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
          e.preventDefault();
          setIsVisible((prev) => !prev);
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getMetricColor = (rating?: 'good' | 'needs-improvement' | 'poor') => {
    switch (rating) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="text-sm font-semibold mb-2">Performance Metrics</h3>
      <div className="space-y-1 text-xs">
        {Object.entries(metrics).map(([name, data]) => (
          <div key={name} className="flex justify-between">
            <span className="font-medium">{name}:</span>
            <span className={getMetricColor(data.rating)}>
              {typeof data.value === 'number' ? data.value.toFixed(2) : data.value}
              {name === 'CLS' ? '' : 'ms'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Press Ctrl/Cmd + Shift + P to toggle
      </div>
    </div>
  );
}

/**
 * Hook for custom performance marks
 */
export function usePerformanceMark(markName: string) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      // Create start mark
      performance.mark(`${markName}-start`);

      return () => {
        // Create end mark and measure
        performance.mark(`${markName}-end`);
        performance.measure(
          markName,
          `${markName}-start`,
          `${markName}-end`
        );

        // Get the measurement
        const measures = performance.getEntriesByName(markName, 'measure');
        if (measures.length > 0) {
          const measure = measures[measures.length - 1];
          if (process.env.NODE_ENV === 'development') {
            console.log(`Performance: ${markName} took ${measure.duration.toFixed(2)}ms`);
          }
        }

        // Clean up marks and measures
        performance.clearMarks(`${markName}-start`);
        performance.clearMarks(`${markName}-end`);
        performance.clearMeasures(markName);
      };
    }
  }, [markName]);
}

/**
 * Performance budget checker
 */
export const PERFORMANCE_BUDGETS = {
  LCP: 2500, // 2.5s
  FID: 100,  // 100ms
  CLS: 0.1,  // 0.1
  FCP: 1800, // 1.8s
  TTFB: 800, // 800ms
};

export function checkPerformanceBudget(
  metric: { name: string; value: number }
): boolean {
  const budget = PERFORMANCE_BUDGETS[metric.name as keyof typeof PERFORMANCE_BUDGETS];
  if (budget) {
    const isWithinBudget = metric.value <= budget;
    if (!isWithinBudget && process.env.NODE_ENV === 'development') {
      console.warn(
        `⚠️ Performance budget exceeded for ${metric.name}: ${metric.value.toFixed(2)} (budget: ${budget})`
      );
    }
    return isWithinBudget;
  }
  return true;
}

import { useState } from 'react';