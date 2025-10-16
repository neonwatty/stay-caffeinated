import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScreenEffects, EffectOverlay, useScreenEffects } from '../ScreenEffects';
import { renderHook, act } from '@testing-library/react';

// Mock anime.js
vi.mock('@/lib/anime', () => ({
  default: vi.fn((options: unknown) => ({
    pause: vi.fn(),
    play: vi.fn(),
    restart: vi.fn(),
    ...options
  })),
  random: vi.fn((min: number, max: number) => min + Math.random() * (max - min)),
}));

describe('ScreenEffects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render children correctly', () => {
      render(
        <ScreenEffects caffeineLevel={50}>
          <div>Test Content</div>
        </ScreenEffects>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should apply screen-effects-container class', () => {
      const { container } = render(
        <ScreenEffects caffeineLevel={50}>
          <div>Test</div>
        </ScreenEffects>
      );

      const effectsContainer = container.querySelector('.screen-effects-container');
      expect(effectsContainer).toBeInTheDocument();
    });

    it('should show warning overlay for critical under-caffeination', () => {
      const { container } = render(
        <ScreenEffects caffeineLevel={5}>
          <div>Test</div>
        </ScreenEffects>
      );

      const warningOverlay = container.querySelector('.warning-undercaffeinated');
      expect(warningOverlay).toBeInTheDocument();
    });

    it('should show warning overlay for critical over-caffeination', () => {
      const { container } = render(
        <ScreenEffects caffeineLevel={96}>
          <div>Test</div>
        </ScreenEffects>
      );

      const warningOverlay = container.querySelector('.warning-overcaffeinated');
      expect(warningOverlay).toBeInTheDocument();
    });

    it('should not show warning overlay for optimal caffeine levels', () => {
      const { container } = render(
        <ScreenEffects caffeineLevel={50}>
          <div>Test</div>
        </ScreenEffects>
      );

      const warningOverlay = container.querySelector('.warning-overlay');
      expect(warningOverlay).not.toBeInTheDocument();
    });
  });

  describe('Effect Classes', () => {
    it('should apply blur effect class for low caffeine', () => {
      const { container } = render(
        <ScreenEffects caffeineLevel={15}>
          <div>Test</div>
        </ScreenEffects>
      );

      const effectsContainer = container.querySelector('.screen-effects-container');
      expect(effectsContainer?.className).toContain('effect-blur-active');
    });

    it('should apply shake effect class for high caffeine', () => {
      const { container } = render(
        <ScreenEffects caffeineLevel={85}>
          <div>Test</div>
        </ScreenEffects>
      );

      const effectsContainer = container.querySelector('.screen-effects-container');
      expect(effectsContainer?.className).toContain('effect-shake-active');
    });

    it('should apply slowmotion effect class for very low caffeine', () => {
      const { container } = render(
        <ScreenEffects caffeineLevel={10}>
          <div>Test</div>
        </ScreenEffects>
      );

      const effectsContainer = container.querySelector('.screen-effects-container');
      expect(effectsContainer?.className).toContain('effect-slowmotion-active');
    });
  });

  describe('Effect Controls', () => {
    it('should disable effects when isActive is false', () => {
      const { container } = render(
        <ScreenEffects caffeineLevel={5} isActive={false}>
          <div>Test</div>
        </ScreenEffects>
      );

      const warningOverlay = container.querySelector('.warning-overlay');
      expect(warningOverlay).not.toBeInTheDocument();
    });

    it('should disable blur when enableBlur is false', () => {
      const { container } = render(
        <ScreenEffects caffeineLevel={15} enableBlur={false}>
          <div>Test</div>
        </ScreenEffects>
      );

      const content = container.querySelector('.screen-effects-content');
      expect(content?.style.filter).not.toContain('blur');
    });

    it('should apply intensity multiplier', () => {
      const { container } = render(
        <ScreenEffects caffeineLevel={15} intensity={2}>
          <div>Test</div>
        </ScreenEffects>
      );

      const effectsContainer = container.querySelector('.screen-effects-container');
      expect(effectsContainer).toBeInTheDocument();
    });
  });

  describe('Debug Info', () => {
    it('should show debug info in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { container } = render(
        <ScreenEffects caffeineLevel={75}>
          <div>Test</div>
        </ScreenEffects>
      );

      const debugInfo = container.querySelector('[style*="z-index: 10000"]');
      expect(debugInfo?.textContent).toContain('Caffeine: 75%');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not show debug info in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const { container } = render(
        <ScreenEffects caffeineLevel={75}>
          <div>Test</div>
        </ScreenEffects>
      );

      const debugInfo = container.querySelector('[style*="z-index: 10000"]');
      expect(debugInfo).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });
});

describe('EffectOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children', () => {
    render(
      <EffectOverlay effectType="blur" intensity={0.5}>
        <div>Overlay Content</div>
      </EffectOverlay>
    );

    expect(screen.getByText('Overlay Content')).toBeInTheDocument();
  });

  it('should apply effect-overlay class', () => {
    const { container } = render(
      <EffectOverlay effectType="shake" intensity={0.5}>
        <div>Test</div>
      </EffectOverlay>
    );

    const overlay = container.querySelector('.effect-overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('should not apply effects when intensity is 0', () => {
    const { container } = render(
      <EffectOverlay effectType="blur" intensity={0}>
        <div>Test</div>
      </EffectOverlay>
    );

    const overlay = container.querySelector('.effect-overlay');
    expect(overlay?.style.filter).not.toContain('blur');
  });

  it('should not apply effects when isActive is false', () => {
    const { container } = render(
      <EffectOverlay effectType="blur" intensity={0.5} isActive={false}>
        <div>Test</div>
      </EffectOverlay>
    );

    const overlay = container.querySelector('.effect-overlay');
    expect(overlay?.style.filter).not.toContain('blur');
  });
});

describe('useScreenEffects', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useScreenEffects(50));

    expect(result.current.isActive).toBe(true);
    expect(result.current.intensity).toBe(1);
    expect(result.current.effects).toBeDefined();
  });

  it('should calculate effects based on caffeine level', () => {
    const { result } = renderHook(() => useScreenEffects(15));

    expect(result.current.effects.blur).toBeGreaterThan(0);
    expect(result.current.effects.shake).toBe(0);
  });

  it('should toggle effects on and off', () => {
    const { result } = renderHook(() => useScreenEffects(50));

    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.toggleEffects();
    });

    expect(result.current.isActive).toBe(false);

    act(() => {
      result.current.toggleEffects();
    });

    expect(result.current.isActive).toBe(true);
  });

  it('should set effect intensity within bounds', () => {
    const { result } = renderHook(() => useScreenEffects(50));

    act(() => {
      result.current.setEffectIntensity(1.5);
    });

    expect(result.current.intensity).toBe(1.5);

    act(() => {
      result.current.setEffectIntensity(3);
    });

    expect(result.current.intensity).toBe(2);

    act(() => {
      result.current.setEffectIntensity(-1);
    });

    expect(result.current.intensity).toBe(0);
  });

  it('should recalculate effects when caffeine level changes', () => {
    const { result, rerender } = renderHook(
      ({ caffeineLevel }) => useScreenEffects(caffeineLevel),
      { initialProps: { caffeineLevel: 50 } }
    );

    const initialBlur = result.current.effects.blur;

    rerender({ caffeineLevel: 15 });

    expect(result.current.effects.blur).not.toBe(initialBlur);
    expect(result.current.effects.blur).toBeGreaterThan(0);
  });
});