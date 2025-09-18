/**
 * Performance monitoring and optimization utilities
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Frame rate (FPS) monitor
 */
export class FPSMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private callbacks: Set<(fps: number) => void> = new Set();
  private animationId: number | null = null;
  private isMonitoring = false;

  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.monitor();
  }

  stop() {
    this.isMonitoring = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private monitor = () => {
    if (!this.isMonitoring) return;

    this.frameCount++;
    const currentTime = performance.now();
    const delta = currentTime - this.lastTime;

    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastTime = currentTime;
      this.notifyCallbacks();
    }

    this.animationId = requestAnimationFrame(this.monitor);
  };

  private notifyCallbacks() {
    this.callbacks.forEach(callback => callback(this.fps));
  }

  onFPSUpdate(callback: (fps: number) => void) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  getCurrentFPS() {
    return this.fps;
  }
}

/**
 * Memory usage monitor
 */
export class MemoryMonitor {
  private callbacks: Set<(memory: MemoryInfo) => void> = new Set();
  private intervalId: NodeJS.Timeout | null = null;

  start(intervalMs = 5000) {
    if (this.intervalId) return;
    
    // Check if performance.memory is available (Chrome only)
    if ('memory' in performance) {
      this.intervalId = setInterval(() => {
        this.checkMemory();
      }, intervalMs);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private checkMemory() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const info: MemoryInfo = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        percentUsed: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
      this.notifyCallbacks(info);
    }
  }

  private notifyCallbacks(memory: MemoryInfo) {
    this.callbacks.forEach(callback => callback(memory));
  }

  onMemoryUpdate(callback: (memory: MemoryInfo) => void) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  percentUsed: number;
}

/**
 * Performance observer for long tasks
 */
export class LongTaskObserver {
  private observer: PerformanceObserver | null = null;
  private callbacks: Set<(entries: PerformanceEntry[]) => void> = new Set();

  start() {
    if (this.observer) return;

    if ('PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          this.notifyCallbacks(entries);
        });
        
        this.observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Long task observer not supported:', error);
      }
    }
  }

  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private notifyCallbacks(entries: PerformanceEntry[]) {
    this.callbacks.forEach(callback => callback(entries));
  }

  onLongTask(callback: (entries: PerformanceEntry[]) => void) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }
}

/**
 * Hook for monitoring FPS
 */
export function useFPSMonitor() {
  const [fps, setFPS] = useState(60);
  const monitorRef = useRef<FPSMonitor | null>(null);

  useEffect(() => {
    if (!monitorRef.current) {
      monitorRef.current = new FPSMonitor();
    }

    const monitor = monitorRef.current;
    const unsubscribe = monitor.onFPSUpdate(setFPS);
    monitor.start();

    return () => {
      unsubscribe();
      monitor.stop();
    };
  }, []);

  return fps;
}

/**
 * Hook for detecting performance issues
 */
export function usePerformanceWarnings() {
  const [warnings, setWarnings] = useState<string[]>([]);
  const fpsMonitorRef = useRef<FPSMonitor | null>(null);
  const memoryMonitorRef = useRef<MemoryMonitor | null>(null);

  useEffect(() => {
    const newWarnings: string[] = [];

    // Monitor FPS
    if (!fpsMonitorRef.current) {
      fpsMonitorRef.current = new FPSMonitor();
    }
    const fpsMonitor = fpsMonitorRef.current;
    const unsubscribeFPS = fpsMonitor.onFPSUpdate((fps) => {
      if (fps < 30) {
        newWarnings.push(`Low FPS detected: ${fps} fps`);
      }
    });
    fpsMonitor.start();

    // Monitor Memory (Chrome only)
    if (!memoryMonitorRef.current) {
      memoryMonitorRef.current = new MemoryMonitor();
    }
    const memoryMonitor = memoryMonitorRef.current;
    const unsubscribeMemory = memoryMonitor.onMemoryUpdate((memory) => {
      if (memory.percentUsed > 90) {
        newWarnings.push(`High memory usage: ${memory.percentUsed.toFixed(1)}%`);
      }
    });
    memoryMonitor.start();

    setWarnings(newWarnings);

    return () => {
      unsubscribeFPS();
      unsubscribeMemory();
      fpsMonitor.stop();
      memoryMonitor.stop();
    };
  }, []);

  return warnings;
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Request idle callback with fallback
 */
export function requestIdleCallbackShim(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback to setTimeout
  const start = Date.now();
  return window.setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    } as IdleDeadline);
  }, 1);
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallbackShim(id: number): void {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string) {
  return function decorator<T extends React.ComponentType<any>>(
    Component: T
  ): T {
    const MeasuredComponent = (props: any) => {
      const renderStartRef = useRef(performance.now());

      useEffect(() => {
        const renderTime = performance.now() - renderStartRef.current;
        if (renderTime > 16) { // More than 1 frame (60fps)
          console.warn(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
        }
      });

      renderStartRef.current = performance.now();
      return React.createElement(Component, props);
    };

    MeasuredComponent.displayName = `Measured(${componentName})`;
    return MeasuredComponent as T;
  };
}

/**
 * Lazy load with retry logic
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3,
  delay = 1000
): React.LazyExoticComponent<T> {
  return React.lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = (attemptsLeft: number) => {
        componentImport()
          .then(resolve)
          .catch((error) => {
            if (attemptsLeft === 0) {
              reject(error);
            } else {
              setTimeout(() => {
                attemptImport(attemptsLeft - 1);
              }, delay);
            }
          });
      };
      attemptImport(retries);
    });
  });
}

/**
 * Batch DOM updates
 */
export function batchDOMUpdates(updates: (() => void)[]) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

/**
 * Virtual scroll hook for large lists
 */
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
}

import { useState } from 'react';
import React from 'react';