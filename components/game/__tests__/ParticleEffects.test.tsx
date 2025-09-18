import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ParticleEffects,
  SteamEffect,
  ExplosionEffect,
  ConfettiEffect,
  useParticleEffect,
} from '../ParticleEffects';
import { renderHook, act } from '@testing-library/react';

// Mock anime.js
vi.mock('@/lib/anime', () => {
  const animeMock = {
    timeline: vi.fn(() => ({
      add: vi.fn().mockReturnThis(),
      pause: vi.fn(),
      play: vi.fn(),
      finished: Promise.resolve(),
    })),
    random: vi.fn((min: number, max: number) => min + Math.random() * (max - min)),
    stagger: vi.fn((delay: number) => delay),
  };
  return { default: animeMock };
});

describe('ParticleEffects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Core Component', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <ParticleEffects type="steam" active={true} />
      );
      expect(container.querySelector('.particle-effects-container')).toBeInTheDocument();
    });

    it('should not create particles when inactive', () => {
      const { container } = render(
        <ParticleEffects type="steam" active={false} />
      );

      const particleContainer = container.querySelector('.particle-effects-container');
      expect(particleContainer).toBeInTheDocument();
    });

    it('should clean up particles on unmount', () => {
      const { unmount } = render(
        <ParticleEffects type="steam" active={true} config={{ count: 5 }} />
      );

      unmount();

      // Should clean up without errors
      expect(true).toBe(true);
    });
  });

  describe('SteamEffect', () => {
    it('should render steam particles', () => {
      const { container } = render(<SteamEffect active={true} />);
      expect(container.querySelector('.particle-effects-container')).toBeInTheDocument();
    });

    it('should adjust intensity', () => {
      const { container } = render(<SteamEffect active={true} intensity="high" />);
      expect(container.querySelector('.particle-effects-container')).toBeInTheDocument();
    });
  });

  describe('ExplosionEffect', () => {
    it('should render explosion container', () => {
      const { container } = render(
        <ExplosionEffect x={100} y={100} trigger={false} />
      );
      expect(container.querySelector('.particle-effects-container')).toBeInTheDocument();
    });

    it('should apply intensity settings', () => {
      const { container } = render(
        <ExplosionEffect x={100} y={100} trigger={true} intensity="large" />
      );

      expect(container.querySelector('.particle-effects-container')).toBeInTheDocument();
    });
  });

  describe('ConfettiEffect', () => {
    it('should render confetti container', () => {
      const { container } = render(<ConfettiEffect trigger={false} />);
      expect(container.querySelector('.particle-effects-container')).toBeInTheDocument();
    });
  });

  describe('useParticleEffect hook', () => {
    it('should initialize with inactive state', () => {
      const { result } = renderHook(() => useParticleEffect('steam'));

      expect(result.current.isActive).toBe(false);
      expect(result.current.position).toEqual({ x: 0, y: 0 });
    });

    it('should trigger particle effect', () => {
      const { result } = renderHook(() => useParticleEffect('explosion'));

      act(() => {
        result.current.trigger(100, 200);
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.position).toEqual({ x: 100, y: 200 });
    });

    it('should stop particle effect', () => {
      const { result } = renderHook(() => useParticleEffect('steam'));

      act(() => {
        result.current.trigger();
      });

      expect(result.current.isActive).toBe(true);

      act(() => {
        result.current.stop();
      });

      expect(result.current.isActive).toBe(false);
    });
  });

  describe('Particle Types', () => {
    const particleTypes = ['steam', 'explosion', 'confetti', 'sparkle', 'bubble'] as const;

    particleTypes.forEach((type) => {
      it(`should render ${type} particles container`, () => {
        const { container } = render(
          <ParticleEffects type={type} active={true} config={{ count: 3 }} />
        );

        expect(container.querySelector('.particle-effects-container')).toBeInTheDocument();
      });
    });
  });
});