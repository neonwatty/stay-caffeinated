/**
 * Accessibility utilities for Stay Caffeinated
 * Provides ARIA helpers, keyboard navigation, and screen reader support
 */

/**
 * Keyboard codes for common navigation keys
 */
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * ARIA live region politeness levels
 */
export type AriaLive = 'off' | 'polite' | 'assertive';

/**
 * Announce message to screen readers using ARIA live region
 */
export function announceToScreenReader(
  message: string,
  politeness: AriaLive = 'polite',
  delay: number = 0
): void {
  setTimeout(() => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', politeness);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, delay);
}

/**
 * Trap focus within a container (for modals, dialogs)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== KEYS.TAB) return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Get accessible label for game elements
 */
export function getAccessibleLabel(
  element: string,
  value?: number | string,
  context?: string
): string {
  const labels: Record<string, string> = {
    caffeineBar: `Caffeine level ${value}%`,
    healthBar: `Health ${value}%`,
    score: `Score: ${value} points`,
    timer: `Time: ${value}`,
    drink: `Select ${value}`,
    powerup: `Activate ${value}`,
    achievement: `Achievement unlocked: ${value}`,
    event: `Event: ${value}`,
    streak: `Streak: ${value} seconds`,
  };

  const baseLabel = labels[element] || element;
  return context ? `${baseLabel}. ${context}` : baseLabel;
}

/**
 * Format time for screen readers
 */
export function formatTimeForScreenReader(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes === 0) {
    return `${secs} second${secs !== 1 ? 's' : ''}`;
  }

  return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${secs} second${secs !== 1 ? 's' : ''}`;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;

  const mediaQuery = window.matchMedia('(prefers-contrast: high)');
  return mediaQuery.matches;
}

/**
 * Check if user prefers dark color scheme
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery.matches;
}

/**
 * Handle keyboard navigation for lists/grids
 */
export function handleListKeyboardNavigation(
  e: React.KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  onSelect: (index: number) => void,
  orientation: 'horizontal' | 'vertical' | 'grid' = 'vertical',
  gridColumns?: number
): void {
  let newIndex = currentIndex;

  switch (e.key) {
    case KEYS.ARROW_UP:
      if (orientation === 'vertical') {
        newIndex = Math.max(0, currentIndex - 1);
      } else if (orientation === 'grid' && gridColumns) {
        newIndex = Math.max(0, currentIndex - gridColumns);
      }
      e.preventDefault();
      break;

    case KEYS.ARROW_DOWN:
      if (orientation === 'vertical') {
        newIndex = Math.min(totalItems - 1, currentIndex + 1);
      } else if (orientation === 'grid' && gridColumns) {
        newIndex = Math.min(totalItems - 1, currentIndex + gridColumns);
      }
      e.preventDefault();
      break;

    case KEYS.ARROW_LEFT:
      if (orientation === 'horizontal' || orientation === 'grid') {
        newIndex = Math.max(0, currentIndex - 1);
      }
      e.preventDefault();
      break;

    case KEYS.ARROW_RIGHT:
      if (orientation === 'horizontal' || orientation === 'grid') {
        newIndex = Math.min(totalItems - 1, currentIndex + 1);
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
      onSelect(currentIndex);
      e.preventDefault();
      break;

    default:
      return;
  }

  if (newIndex !== currentIndex) {
    onSelect(newIndex);
  }
}

/**
 * Generate unique ID for ARIA relationships
 */
let idCounter = 0;
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Check if element is visible in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Scroll element into view if needed
 */
export function ensureVisible(element: HTMLElement, smooth: boolean = true): void {
  if (!isInViewport(element)) {
    element.scrollIntoView({
      behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto',
      block: 'center',
      inline: 'nearest',
    });
  }
}

/**
 * Get contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Convert hex to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  // Calculate relative luminance
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  // Calculate contrast ratio
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance
 */
function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;

  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsWCAGContrast(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  largeText: boolean = false
): boolean {
  if (level === 'AA') {
    return largeText ? ratio >= 3 : ratio >= 4.5;
  }
  return largeText ? ratio >= 4.5 : ratio >= 7;
}