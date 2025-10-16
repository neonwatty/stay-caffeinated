/**
 * Accessibility hooks for Stay Caffeinated
 * React hooks for managing accessibility features
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  trapFocus,
  announceToScreenReader,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
  handleListKeyboardNavigation,
  KEYS,
  type AriaLive,
} from '@/utils/accessibility';

/**
 * Hook for managing focus trap (useful for modals/dialogs)
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      cleanupRef.current = trapFocus(containerRef.current);
    }

    return () => {
      cleanupRef.current?.();
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for screen reader announcements
 */
export function useScreenReaderAnnounce() {
  const announce = useCallback(
    (message: string, politeness: AriaLive = 'polite', delay: number = 0) => {
      announceToScreenReader(message, politeness, delay);
    },
    []
  );

  return announce;
}

/**
 * Hook for detecting user preferences
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    darkMode: false,
  });

  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        reducedMotion: prefersReducedMotion(),
        highContrast: prefersHighContrast(),
        darkMode: prefersDarkMode(),
      });
    };

    updatePreferences();

    // Listen for changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => updatePreferences();

    reducedMotionQuery.addEventListener('change', handleChange);
    highContrastQuery.addEventListener('change', handleChange);
    darkModeQuery.addEventListener('change', handleChange);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleChange);
      highContrastQuery.removeEventListener('change', handleChange);
      darkModeQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return preferences;
}

/**
 * Hook for keyboard navigation in lists
 */
export function useKeyboardNavigation(
  items: any[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'grid';
    gridColumns?: number;
    onSelect?: (index: number, item: any) => void;
    onActivate?: (index: number, item: any) => void;
    initialIndex?: number;
    wrap?: boolean;
  } = {}
) {
  const {
    orientation = 'vertical',
    gridColumns,
    onSelect,
    onActivate,
    initialIndex = 0,
    wrap = false,
  } = options;

  const [focusedIndex, setFocusedIndex] = useState(initialIndex);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalItems = items.length;
      let newIndex = focusedIndex;

      switch (e.key) {
        case KEYS.ARROW_UP:
          if (orientation === 'vertical') {
            newIndex = focusedIndex - 1;
            if (newIndex < 0) newIndex = wrap ? totalItems - 1 : 0;
          } else if (orientation === 'grid' && gridColumns) {
            newIndex = focusedIndex - gridColumns;
            if (newIndex < 0) newIndex = wrap ? focusedIndex + (totalItems - gridColumns) : focusedIndex;
          }
          e.preventDefault();
          break;

        case KEYS.ARROW_DOWN:
          if (orientation === 'vertical') {
            newIndex = focusedIndex + 1;
            if (newIndex >= totalItems) newIndex = wrap ? 0 : totalItems - 1;
          } else if (orientation === 'grid' && gridColumns) {
            newIndex = focusedIndex + gridColumns;
            if (newIndex >= totalItems) newIndex = wrap ? focusedIndex % gridColumns : focusedIndex;
          }
          e.preventDefault();
          break;

        case KEYS.ARROW_LEFT:
          if (orientation === 'horizontal' || orientation === 'grid') {
            newIndex = focusedIndex - 1;
            if (newIndex < 0) newIndex = wrap ? totalItems - 1 : 0;
          }
          e.preventDefault();
          break;

        case KEYS.ARROW_RIGHT:
          if (orientation === 'horizontal' || orientation === 'grid') {
            newIndex = focusedIndex + 1;
            if (newIndex >= totalItems) newIndex = wrap ? 0 : totalItems - 1;
          }
          e.preventDefault();
          break;

        case KEYS.HOME:
          newIndex = 0;
          e.preventDefault();
          break;

        case KEYS.END:
          newIndex = totalItems - 1;
          e.preventDefault();
          break;

        case KEYS.ENTER:
        case KEYS.SPACE:
          onActivate?.(focusedIndex, items[focusedIndex]);
          e.preventDefault();
          break;

        default:
          return;
      }

      if (newIndex !== focusedIndex && newIndex >= 0 && newIndex < totalItems) {
        setFocusedIndex(newIndex);
        onSelect?.(newIndex, items[newIndex]);

        // Focus the element
        itemRefs.current[newIndex]?.focus();
      }
    },
    [focusedIndex, items, orientation, gridColumns, onSelect, onActivate, wrap]
  );

  const setItemRef = useCallback((index: number, ref: HTMLElement | null) => {
    itemRefs.current[index] = ref;
  }, []);

  return {
    focusedIndex,
    handleKeyDown,
    setItemRef,
    setFocusedIndex,
  };
}

/**
 * Hook for managing focus restoration
 */
export function useFocusRestore() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const storeFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && previousFocusRef.current.focus) {
      previousFocusRef.current.focus();
    }
  }, []);

  useEffect(() => {
    return () => {
      restoreFocus();
    };
  }, [restoreFocus]);

  return { storeFocus, restoreFocus };
}

/**
 * Hook for escape key handler
 */
export function useEscapeKey(handler: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === KEYS.ESCAPE) {
        handler();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handler, isActive]);
}

/**
 * Hook for managing ARIA live regions
 */
export function useLiveRegion(
  initialMessage: string = '',
  politeness: AriaLive = 'polite'
) {
  const [message, setMessage] = useState(initialMessage);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (regionRef.current && message) {
      regionRef.current.textContent = message;

      // Clear after announcement
      const timer = setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = '';
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const announce = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  const LiveRegion = useCallback(() => (
    <div
      ref={regionRef}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    />
  ), [politeness]);

  return { announce, LiveRegion };
}

/**
 * Hook for skip navigation links
 */
export function useSkipLinks(links: { id: string; label: string }[]) {
  const skipToContent = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return { skipToContent };
}

/**
 * Hook for managing tab index
 */
export function useTabIndex(isInteractive: boolean = true, isDisabled: boolean = false) {
  if (isDisabled) return -1;
  if (!isInteractive) return undefined;
  return 0;
}

/**
 * Hook for roving tab index (for composite widgets)
 */
export function useRovingTabIndex(
  items: any[],
  activeIndex: number
) {
  const getTabIndex = useCallback(
    (index: number) => {
      return index === activeIndex ? 0 : -1;
    },
    [activeIndex]
  );

  return { getTabIndex };
}