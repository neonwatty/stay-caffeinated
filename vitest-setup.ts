import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Set NODE_ENV to test for anime.js wrapper
process.env.NODE_ENV = 'test';

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