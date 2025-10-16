import anime from '@/lib/anime';

/**
 * Performance monitoring for animations
 * Ensures 60fps animations and tracks performance metrics
 */

interface AnimationMetrics {
  frameRate: number;
  droppedFrames: number;
  totalFrames: number;
  averageDuration: number;
  animationsRunning: number;
}

class AnimationPerformanceMonitor {
  private metrics: AnimationMetrics = {
    frameRate: 60,
    droppedFrames: 0,
    totalFrames: 0,
    averageDuration: 0,
    animationsRunning: 0,
  };

  private frameTimestamps: number[] = [];
  private animationDurations: number[] = [];
  private rafId: number | null = null;
  private lastTime: number = performance.now();
  private isMonitoring: boolean = false;

  /**
   * Start monitoring animation performance
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.monitorFrame();
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isMonitoring = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Monitor frame performance
   */
  private monitorFrame = (): void => {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const delta = now - this.lastTime;

    // Track frame timestamps for FPS calculation
    this.frameTimestamps.push(now);

    // Keep only last second of timestamps
    const oneSecondAgo = now - 1000;
    this.frameTimestamps = this.frameTimestamps.filter(t => t > oneSecondAgo);

    // Calculate FPS
    this.metrics.frameRate = this.frameTimestamps.length;

    // Check for dropped frames (frame took > 16.67ms)
    if (delta > 16.67) {
      this.metrics.droppedFrames++;
    }

    this.metrics.totalFrames++;

    // Count running animations (anime.running is not available in v4)
    // this.metrics.animationsRunning = anime.running.length;
    this.metrics.animationsRunning = 0; // TODO: Track manually if needed

    this.lastTime = now;
    this.rafId = requestAnimationFrame(this.monitorFrame);
  };

  /**
   * Track animation duration
   */
  trackAnimation(animation: { pause: () => void; play?: () => void; restart?: () => void; complete?: (anim: unknown) => void }): void {
    const startTime = performance.now();

    const originalComplete = animation.complete;
    animation.complete = (anim) => {
      const duration = performance.now() - startTime;
      this.animationDurations.push(duration);

      // Keep only last 100 durations
      if (this.animationDurations.length > 100) {
        this.animationDurations.shift();
      }

      // Calculate average
      this.metrics.averageDuration =
        this.animationDurations.reduce((a, b) => a + b, 0) / this.animationDurations.length;

      // Call original complete callback if exists
      if (originalComplete) {
        originalComplete(anim);
      }
    };
  }

  /**
   * Get current metrics
   */
  getMetrics(): AnimationMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if performance is optimal
   */
  isPerformanceOptimal(): boolean {
    return this.metrics.frameRate >= 58 && // Allow slight variance from 60fps
           this.metrics.droppedFrames < this.metrics.totalFrames * 0.05; // Less than 5% dropped frames
  }

  /**
   * Auto-adjust animation settings based on performance
   */
  autoAdjustQuality(): void {
    if (!this.isPerformanceOptimal()) {
      // Reduce animation quality
      // anime.speed = 1.5; // Speed up animations (not available in anime.js v4)
      // TODO: Implement custom speed adjustment if needed
      console.warn('Animation performance degraded. Consider adjusting quality.');
    } else {
      // anime.speed = 1; // Normal speed (not available in anime.js v4)
    }
  }

  /**
   * Log performance report
   */
  logReport(): void {
    const report = {
      ...this.metrics,
      droppedFramePercentage: ((this.metrics.droppedFrames / this.metrics.totalFrames) * 100).toFixed(2) + '%',
      optimal: this.isPerformanceOptimal(),
    };

    console.table(report);
  }
}

// Singleton instance
const performanceMonitor = new AnimationPerformanceMonitor();

/**
 * Create a performance-monitored animation
 * @param targets - The animation target(s)
 * @param params - Animation parameters (without targets)
 */
export function createMonitoredAnimation(
  targets: HTMLElement | string | NodeList | HTMLElement[],
  params: Omit<anime.AnimeParams, 'targets'>
): { pause: () => void; play?: () => void; restart?: () => void } {
  const animation = anime(targets, params);
  performanceMonitor.trackAnimation(animation);
  return animation;
}

/**
 * Hook to use animation performance monitoring in React components
 */
export function useAnimationPerformance() {
  const start = () => performanceMonitor.start();
  const stop = () => performanceMonitor.stop();
  const getMetrics = () => performanceMonitor.getMetrics();
  const isOptimal = () => performanceMonitor.isPerformanceOptimal();
  const logReport = () => performanceMonitor.logReport();

  return {
    start,
    stop,
    getMetrics,
    isOptimal,
    logReport,
  };
}

/**
 * Performance-optimized animation presets
 */
export const PERFORMANCE_PRESETS = {
  // Use GPU-accelerated properties
  fastTransform: {
    easing: 'linear',
    duration: 200,
  },
  smoothTransform: {
    easing: 'easeOutQuad',
    duration: 300,
  },
  // Avoid expensive properties when possible
  safeProperties: ['translateX', 'translateY', 'scale', 'rotate', 'opacity'],
  // Properties that trigger reflow/repaint
  expensiveProperties: ['width', 'height', 'top', 'left', 'margin', 'padding'],
};

/**
 * Check if animation will be performant
 */
export function isAnimationPerformant(params: anime.AnimeParams): boolean {
  const animatedProps = Object.keys(params).filter(key =>
    !['targets', 'duration', 'easing', 'delay', 'complete'].includes(key)
  );

  const hasExpensiveProps = animatedProps.some(prop =>
    PERFORMANCE_PRESETS.expensiveProperties.includes(prop)
  );

  const duration = typeof params.duration === 'number' ? params.duration : 1000;
  return !hasExpensiveProps || duration < 300;
}

/**
 * Optimize animation parameters for performance
 */
export function optimizeAnimation(params: anime.AnimeParams): anime.AnimeParams {
  const optimized = { ...params };

  // Use transform instead of position properties when possible
  if ('left' in optimized || 'x' in optimized) {
    optimized.translateX = optimized.left || optimized.x;
    delete optimized.left;
    delete optimized.x;
  }

  if ('top' in optimized || 'y' in optimized) {
    optimized.translateY = optimized.top || optimized.y;
    delete optimized.top;
    delete optimized.y;
  }

  // Use will-change for better performance
  if (optimized.targets && typeof optimized.targets === 'string') {
    const elements = document.querySelectorAll(optimized.targets);
    elements.forEach(el => {
      (el as HTMLElement).style.willChange = 'transform, opacity';
    });
  }

  return optimized;
}

export default performanceMonitor;