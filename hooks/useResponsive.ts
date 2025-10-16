/**
 * Responsive hooks for Stay Caffeinated
 * Device detection and responsive behavior management
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Breakpoint definitions (matching Tailwind defaults)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Device type detection
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Hook to detect current breakpoint
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<keyof typeof BREAKPOINTS | 'xs'>('xs');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width >= BREAKPOINTS['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= BREAKPOINTS.xl) {
        setBreakpoint('xl');
      } else if (width >= BREAKPOINTS.lg) {
        setBreakpoint('lg');
      } else if (width >= BREAKPOINTS.md) {
        setBreakpoint('md');
      } else if (width >= BREAKPOINTS.sm) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

/**
 * Hook to check if screen is at or above a breakpoint
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
    // Fallback for older browsers
    else {
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [query]);

  return matches;
}

/**
 * Hook to detect device type
 */
export function useDeviceType(): DeviceType {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

/**
 * Hook to detect touch device
 */
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - for older browsers
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouchDevice;
}

/**
 * Hook for responsive values based on breakpoint
 */
export function useResponsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}): T | undefined {
  const breakpoint = useBreakpoint();
  
  const getValue = (): T | undefined => {
    switch (breakpoint) {
      case '2xl':
        return values['2xl'] ?? values.xl ?? values.lg ?? values.md ?? values.sm ?? values.xs;
      case 'xl':
        return values.xl ?? values.lg ?? values.md ?? values.sm ?? values.xs;
      case 'lg':
        return values.lg ?? values.md ?? values.sm ?? values.xs;
      case 'md':
        return values.md ?? values.sm ?? values.xs;
      case 'sm':
        return values.sm ?? values.xs;
      default:
        return values.xs;
    }
  };

  return getValue();
}

/**
 * Hook for screen orientation
 */
export type ScreenOrientation = 'portrait' | 'landscape';

export function useScreenOrientation(): ScreenOrientation {
  const [orientation, setOrientation] = useState<ScreenOrientation>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}

/**
 * Hook for viewport dimensions
 */
export interface ViewportDimensions {
  width: number;
  height: number;
  vw: number;
  vh: number;
}

export function useViewport(): ViewportDimensions {
  const [dimensions, setDimensions] = useState<ViewportDimensions>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    vw: typeof window !== 'undefined' ? window.innerWidth / 100 : 0,
    vh: typeof window !== 'undefined' ? window.innerHeight / 100 : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
        vw: window.innerWidth / 100,
        vh: window.innerHeight / 100,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
}

/**
 * Hook for safe area insets (for devices with notches)
 */
export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function useSafeAreaInsets(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const computedStyle = window.getComputedStyle(document.documentElement);
    
    const getInsetValue = (property: string): number => {
      const value = computedStyle.getPropertyValue(property);
      return value ? parseInt(value, 10) : 0;
    };

    setInsets({
      top: getInsetValue('--sat') || getInsetValue('padding-top'),
      right: getInsetValue('--sar') || getInsetValue('padding-right'),
      bottom: getInsetValue('--sab') || getInsetValue('padding-bottom'),
      left: getInsetValue('--sal') || getInsetValue('padding-left'),
    });
  }, []);

  return insets;
}

/**
 * Hook for mobile keyboard detection
 */
export function useVirtualKeyboard() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const visualViewport = window.visualViewport;
      
      if (visualViewport) {
        const keyboardShowing = visualViewport.height < windowHeight;
        setIsKeyboardVisible(keyboardShowing);
        setKeyboardHeight(keyboardShowing ? windowHeight - visualViewport.height : 0);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }
  }, []);

  return { isKeyboardVisible, keyboardHeight };
}

/**
 * Hook for touch gestures
 */
export interface TouchGesture {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export function useTouchGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: TouchGesture) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;

    // Horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    }
    // Vertical swipe
    else {
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    setTouchStart(null);
  }, [touchStart, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}

/**
 * Hook for responsive font size
 */
export function useResponsiveFontSize(baseSizes: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
}): number {
  const value = useResponsiveValue(baseSizes);
  const viewport = useViewport();
  
  // Apply viewport-based scaling for better readability
  const scaleFactor = Math.min(Math.max(viewport.vw / 375 * 16, 14), 20) / 16;
  
  return (value || 16) * scaleFactor;
}

/**
 * Hook for detecting mobile browser chrome height
 */
export function useMobileChromeHeight() {
  const [chromeHeight, setChromeHeight] = useState(0);

  useEffect(() => {
    const calculateChromeHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      const fullHeight = window.screen.height;
      const viewportHeight = window.innerHeight;
      setChromeHeight(fullHeight - viewportHeight);
    };

    calculateChromeHeight();
    window.addEventListener('resize', calculateChromeHeight);
    window.addEventListener('orientationchange', calculateChromeHeight);

    return () => {
      window.removeEventListener('resize', calculateChromeHeight);
      window.removeEventListener('orientationchange', calculateChromeHeight);
    };
  }, []);

  return chromeHeight;
}