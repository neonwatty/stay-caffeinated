'use client';

import React, { useEffect, useRef, createContext, useContext, useCallback, useState } from 'react';
import { useFocusRestore } from '@/hooks/useAccessibility';

/**
 * Focus context for managing focus across the application
 */
interface FocusContextValue {
  focusHistory: HTMLElement[];
  pushFocus: (element: HTMLElement) => void;
  popFocus: () => void;
  clearFocusHistory: () => void;
  currentFocus: HTMLElement | null;
}

const FocusContext = createContext<FocusContextValue | undefined>(undefined);

/**
 * Focus Manager Provider
 */
export const FocusManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([]);
  const [currentFocus, setCurrentFocus] = useState<HTMLElement | null>(null);

  const pushFocus = useCallback((element: HTMLElement) => {
    const current = document.activeElement as HTMLElement;
    setFocusHistory((prev) => [...prev, current]);
    setCurrentFocus(element);
    element.focus();
  }, []);

  const popFocus = useCallback(() => {
    setFocusHistory((prev) => {
      const newHistory = [...prev];
      const previousElement = newHistory.pop();
      if (previousElement) {
        previousElement.focus();
        setCurrentFocus(previousElement);
      }
      return newHistory;
    });
  }, []);

  const clearFocusHistory = useCallback(() => {
    setFocusHistory([]);
    setCurrentFocus(null);
  }, []);

  return (
    <FocusContext.Provider
      value={{
        focusHistory,
        pushFocus,
        popFocus,
        clearFocusHistory,
        currentFocus,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

/**
 * Hook to use focus manager
 */
export function useFocusManager() {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocusManager must be used within a FocusManagerProvider');
  }
  return context;
}

/**
 * Skip Links Component
 */
export const SkipLinks: React.FC = () => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-0 left-0 z-[9999] bg-blue-600 text-white px-4 py-2 focus:translate-y-0 -translate-y-full transition-transform"
      >
        Skip to main content
      </a>
      <a
        href="#game-controls"
        className="absolute top-0 left-20 z-[9999] bg-blue-600 text-white px-4 py-2 focus:translate-y-0 -translate-y-full transition-transform"
      >
        Skip to game controls
      </a>
      <a
        href="#score-display"
        className="absolute top-0 left-44 z-[9999] bg-blue-600 text-white px-4 py-2 focus:translate-y-0 -translate-y-full transition-transform"
      >
        Skip to score
      </a>
    </div>
  );
};

/**
 * Focus Guard Component (prevents focus from escaping)
 */
interface FocusGuardProps {
  children: React.ReactNode;
  isActive?: boolean;
  returnFocus?: boolean;
  autoFocus?: boolean;
}

export const FocusGuard: React.FC<FocusGuardProps> = ({
  children,
  isActive = true,
  returnFocus = true,
  autoFocus = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { storeFocus, restoreFocus } = useFocusRestore();

  useEffect(() => {
    if (!isActive) return;

    if (returnFocus) {
      storeFocus();
    }

    if (autoFocus && containerRef.current) {
      const firstFocusable = containerRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }

    return () => {
      if (returnFocus) {
        restoreFocus();
      }
    };
  }, [isActive, returnFocus, autoFocus, storeFocus, restoreFocus]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;

      if (!container.contains(target)) {
        e.preventDefault();
        e.stopPropagation();

        const firstFocusable = container.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    };

    // Use capture phase to catch focus before it reaches the target
    document.addEventListener('focusin', handleFocusIn, true);

    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
    };
  }, [isActive]);

  if (!isActive) return <>{children}</>;

  return (
    <div ref={containerRef} data-focus-guard>
      {children}
    </div>
  );
};

/**
 * Roving Tab Index Component (for composite widgets like toolbars)
 */
interface RovingTabIndexProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  wrap?: boolean;
}

export const RovingTabIndex: React.FC<RovingTabIndexProps> = ({
  children,
  orientation = 'horizontal',
  wrap = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      '[data-roving-tabindex]'
    );

    focusableElements.forEach((element, index) => {
      element.tabIndex = index === activeIndex ? 0 : -1;
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      const totalItems = focusableElements.length;
      let newIndex = activeIndex;

      const isHorizontal = orientation === 'horizontal';
      const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
      const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

      switch (e.key) {
        case nextKey:
          newIndex = activeIndex + 1;
          if (newIndex >= totalItems) {
            newIndex = wrap ? 0 : totalItems - 1;
          }
          e.preventDefault();
          break;

        case prevKey:
          newIndex = activeIndex - 1;
          if (newIndex < 0) {
            newIndex = wrap ? totalItems - 1 : 0;
          }
          e.preventDefault();
          break;

        case 'Home':
          newIndex = 0;
          e.preventDefault();
          break;

        case 'End':
          newIndex = totalItems - 1;
          e.preventDefault();
          break;

        default:
          return;
      }

      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
        focusableElements[newIndex]?.focus();
      }
    };

    containerRef.current.addEventListener('keydown', handleKeyDown);

    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, orientation, wrap]);

  return (
    <div ref={containerRef} role="toolbar" aria-orientation={orientation}>
      {children}
    </div>
  );
};

/**
 * Focus Indicator Component (visual focus ring)
 */
interface FocusIndicatorProps {
  children: React.ReactNode;
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  offset?: number;
}

export const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  children,
  color = 'blue-500',
  width = 2,
  style = 'solid',
  offset = 2,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className="relative"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {children}
      {isFocused && (
        <div
          className={`absolute inset-0 pointer-events-none border-${width} border-${color}`}
          style={{
            borderStyle: style,
            margin: `-${offset}px`,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};