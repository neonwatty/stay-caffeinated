/**
 * Performance monitoring and optimization utilities
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import React from 'react';

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
    if (typeof requestAnimationFrame !== 'undefined') {
      this.monitor();
    }
  }

  stop() {
    this.isMonitoring = false;
    if (this.animationId !== null && typeof cancelAnimationFrame !== 'undefined') {
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

    if (typeof requestAnimationFrame !== 'undefined') {
      this.animationId = requestAnimationFrame(this.monitor);
    }
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

  getAverageFPS() {
    return this.fps;
  }

  frame() {
    this.frameCount++;
  }

  onFPSDrop(threshold: number, callback: () => void) {
    const checkFPS = (fps: number) => {
      if (fps < threshold) {
        callback();
      }
    };
    this.callbacks.add(checkFPS);
    return () => this.callbacks.delete(checkFPS);
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
      const memory = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
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

  getCurrentUsage(): MemoryInfo {
    if ('memory' in performance) {
      const memory = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        percentUsed: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize
      };
    }
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
      percentUsed: 0,
      heapUsed: 0,
      heapTotal: 0
    };
  }

  onMemoryLeak(threshold: number, callback: () => void) {
    const initialUsage = this.getCurrentUsage();
    const checkLeak = (memory: MemoryInfo) => {
      if (memory.heapUsed - initialUsage.heapUsed > threshold) {
        callback();
      }
    };
    this.callbacks.add(checkLeak);
    return () => this.callbacks.delete(checkLeak);
  }
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  percentUsed: number;
  heapUsed: number;
  heapTotal: number;
}

/**
 * Performance observer for long tasks
 */
export class LongTaskObserver {
  private observer: PerformanceObserver | null = null;
  private callbacks: Set<(entries: PerformanceEntry[]) => void> = new Set();

  start() {
    if (this.observer) return;

    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
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
export function debounce<T extends (...args: unknown[]) => unknown>(
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
export function throttle<T extends (...args: unknown[]) => unknown>(
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
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback to setTimeout
  const start = Date.now();
  return setTimeout(() => {
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
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string) {
  return function decorator<T extends React.ComponentType<unknown>>(
    Component: T
  ): T {
    const MeasuredComponent = (props: unknown) => {
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
 * Performance Monitor - Main class for performance tracking
 */
export class PerformanceMonitor {
  private fpsMonitor: FPSMonitor;
  private memoryMonitor: MemoryMonitor;
  private longTaskObserver: LongTaskObserver;
  private frameCount = 0;
  private frameTimings: number[] = [];
  private lastFrameTime = 0;
  private isMonitoring = false;
  private longTaskCount = 0;

  constructor() {
    this.fpsMonitor = new FPSMonitor();
    this.memoryMonitor = new MemoryMonitor();
    this.longTaskObserver = new LongTaskObserver();

    // Subscribe to long tasks
    this.longTaskObserver.onLongTask(() => {
      this.longTaskCount++;
    });
  }

  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.frameCount = 0;
    this.frameTimings = [];
    this.lastFrameTime = performance.now();
    this.longTaskCount = 0;

    this.fpsMonitor.start();
    this.memoryMonitor.start();
    this.longTaskObserver.start();
  }

  stop() {
    this.isMonitoring = false;
    this.fpsMonitor.stop();
    this.memoryMonitor.stop();
    this.longTaskObserver.stop();
  }

  recordFrame() {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;
    this.frameTimings.push(frameTime);
    this.frameCount++;
    this.lastFrameTime = currentTime;

    // Keep only last 100 frame timings
    if (this.frameTimings.length > 100) {
      this.frameTimings.shift();
    }
  }

  frame() {
    this.fpsMonitor.frame();
  }

  getAverageFPS() {
    return this.fpsMonitor.getAverageFPS();
  }

  getCurrentUsage() {
    return this.memoryMonitor.getCurrentUsage();
  }

  onFPSDrop(threshold: number, callback: () => void) {
    return this.fpsMonitor.onFPSDrop(threshold, callback);
  }

  onMemoryLeak(threshold: number, callback: () => void) {
    return this.memoryMonitor.onMemoryLeak(threshold, callback);
  }

  getMetrics() {
    const avgFrameTime = this.frameTimings.length > 0
      ? this.frameTimings.reduce((a, b) => a + b, 0) / this.frameTimings.length
      : 16.67;

    const currentFPS = this.frameTimings.length > 0
      ? 1000 / avgFrameTime
      : 60;

    const memoryInfo = this.getCurrentUsage();

    return {
      fps: {
        current: currentFPS,
        average: this.frameTimings.length > 0 ? 1000 / avgFrameTime : 60,
        min: this.frameTimings.length > 0 ? 1000 / Math.max(...this.frameTimings) : 60,
        max: this.frameTimings.length > 0 ? 1000 / Math.min(...this.frameTimings) : 60
      },
      memory: memoryInfo,
      longTasks: {
        count: this.longTaskCount,
        total: this.longTaskCount
      },
      frameCount: this.frameCount
    };
  }
}

/**
 * Lazy load with retry logic
 */
export function lazyWithRetry<T extends React.ComponentType<unknown>>(
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