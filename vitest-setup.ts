import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { vi, afterAll, beforeAll, afterEach } from 'vitest';
import React from 'react';

// Make React available globally for tests
global.React = React;

// Set NODE_ENV to test for anime.js wrapper
process.env.NODE_ENV = 'test';

// Track all active timers and intervals
const activeTimers = new Set<NodeJS.Timeout>();
const originalSetTimeout = global.setTimeout;
const originalSetInterval = global.setInterval;
const originalClearTimeout = global.clearTimeout;
const originalClearInterval = global.clearInterval;

// Override timer functions to track them
global.setTimeout = function(...args: Parameters<typeof setTimeout>) {
  const timer = originalSetTimeout.apply(this, args);
  activeTimers.add(timer);
  return timer;
};

global.setInterval = function(...args: Parameters<typeof setInterval>) {
  const timer = originalSetInterval.apply(this, args);
  activeTimers.add(timer);
  return timer;
};

global.clearTimeout = function(timer: NodeJS.Timeout | undefined) {
  if (timer) {
    activeTimers.delete(timer);
    originalClearTimeout(timer);
  }
};

global.clearInterval = function(timer: NodeJS.Timeout | undefined) {
  if (timer) {
    activeTimers.delete(timer);
    originalClearInterval(timer);
  }
};

// Global cleanup hooks
beforeAll(() => {
  // Clear any pre-existing timers
  activeTimers.clear();
});

afterEach(() => {
  // Clean up React Testing Library
  cleanup();

  // Clear all timers after each test
  vi.clearAllTimers();

  // Force clear any remaining active timers
  activeTimers.forEach(timer => {
    originalClearTimeout(timer);
    originalClearInterval(timer);
  });
  activeTimers.clear();

  // Reset all mocks
  vi.clearAllMocks();

  // Clear any pending animation frames
  if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
    let id = window.requestAnimationFrame(() => {});
    while (id > 0) {
      window.cancelAnimationFrame(id);
      id--;
    }
  }
});

afterAll(() => {
  // Final cleanup
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.clearAllMocks();

  // Clear any remaining timers
  activeTimers.forEach(timer => {
    originalClearTimeout(timer);
    originalClearInterval(timer);
  });
  activeTimers.clear();

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

// Handle process termination
process.on('exit', () => {
  // Clear all timers on exit
  activeTimers.forEach(timer => {
    originalClearTimeout(timer);
    originalClearInterval(timer);
  });
  activeTimers.clear();
});

// Mock the anime wrapper directly
vi.mock('@/lib/anime', () => {
  const mockAnimation = {
    pause: vi.fn(),
    play: vi.fn(),
    restart: vi.fn(),
    animatables: []
  };

  const animate = vi.fn(() => mockAnimation);
  const timeline = vi.fn(() => ({
    add: vi.fn().mockReturnThis(),
    ...mockAnimation
  }));

  animate.stagger = vi.fn((value) => value);
  animate.random = vi.fn((min, max) => Math.random() * (max - min) + min);
  animate.remove = vi.fn();
  animate.timeline = timeline;

  return {
    default: animate
  };
});

// Also mock animejs module directly in case it's imported
vi.mock('animejs', () => {
  const mockAnimation = {
    pause: vi.fn(),
    play: vi.fn(),
    restart: vi.fn(),
    animatables: []
  };

  const animate = vi.fn(() => mockAnimation);
  const createTimeline = vi.fn(() => ({
    add: vi.fn().mockReturnThis(),
    ...mockAnimation
  }));
  const stagger = vi.fn((value) => value);
  const utils = {
    random: vi.fn((min, max) => Math.random() * (max - min) + min),
    remove: vi.fn()
  };

  return {
    animate,
    createTimeline,
    stagger,
    utils,
    timeline: createTimeline,
    random: utils.random,
    remove: utils.remove,
    default: animate
  };
});