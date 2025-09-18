import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock anime.js before imports
vi.mock('@/lib/anime', () => {
  const animeMock = vi.fn((options: unknown) => ({
    pause: vi.fn(),
    play: vi.fn(),
    restart: vi.fn(),
    ...options,
  }));

  animeMock.random = vi.fn((min: number, max: number) => min + Math.random() * (max - min));

  return { default: animeMock };
});

import {
  calculateEffectIntensity,
  calculateCompositeEffect,
  applyScreenShake,
  applyBlurEffect,
  applyVignetteEffect,
  applyGlitchEffect,
  applyContinuousJitter,
  applyChromaticAberration,
  applySlowMotionEffect,
  cleanupScreenEffects,
  EFFECT_INTENSITY,
  CAFFEINE_THRESHOLDS,
} from '../screenEffects';

import anime from '@/lib/anime';
const animeMock = anime as jest.MockedFunction<typeof anime>;

describe('Screen Effects Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateEffectIntensity', () => {
    describe('blur effect', () => {
      it('should return extreme intensity for severe under-caffeination', () => {
        const intensity = calculateEffectIntensity(5, 'blur');
        expect(intensity).toBe(EFFECT_INTENSITY.extreme);
      });

      it('should return heavy intensity for moderate under-caffeination', () => {
        const intensity = calculateEffectIntensity(15, 'blur');
        expect(intensity).toBe(EFFECT_INTENSITY.heavy);
      });

      it('should return medium intensity for mild under-caffeination', () => {
        const intensity = calculateEffectIntensity(25, 'blur');
        expect(intensity).toBe(EFFECT_INTENSITY.medium);
      });

      it('should return no intensity for optimal caffeine', () => {
        const intensity = calculateEffectIntensity(50, 'blur');
        expect(intensity).toBe(EFFECT_INTENSITY.none);
      });
    });

    describe('shake effect', () => {
      it('should return extreme intensity for severe over-caffeination', () => {
        const intensity = calculateEffectIntensity(96, 'shake');
        expect(intensity).toBe(EFFECT_INTENSITY.extreme);
      });

      it('should return heavy intensity for moderate over-caffeination', () => {
        const intensity = calculateEffectIntensity(87, 'shake');
        expect(intensity).toBe(EFFECT_INTENSITY.heavy);
      });

      it('should return medium intensity for mild over-caffeination', () => {
        const intensity = calculateEffectIntensity(75, 'shake');
        expect(intensity).toBe(EFFECT_INTENSITY.medium);
      });

      it('should return no intensity for optimal caffeine', () => {
        const intensity = calculateEffectIntensity(50, 'shake');
        expect(intensity).toBe(EFFECT_INTENSITY.none);
      });
    });

    describe('distortion effect', () => {
      it('should calculate distortion for under-caffeination', () => {
        const intensity = calculateEffectIntensity(10, 'distortion');
        expect(intensity).toBeGreaterThan(0);
        expect(intensity).toBeLessThanOrEqual(1);
      });

      it('should calculate distortion for over-caffeination', () => {
        const intensity = calculateEffectIntensity(85, 'distortion');
        expect(intensity).toBeGreaterThan(0);
        expect(intensity).toBeLessThanOrEqual(1);
      });

      it('should return no distortion for optimal caffeine', () => {
        const intensity = calculateEffectIntensity(50, 'distortion');
        expect(intensity).toBe(0);
      });
    });
  });

  describe('calculateCompositeEffect', () => {
    it('should return all effects for extreme under-caffeination', () => {
      const effects = calculateCompositeEffect(5);

      expect(effects.blur).toBeGreaterThan(0);
      expect(effects.shake).toBe(0);
      expect(effects.distortion).toBeGreaterThan(0);
      expect(effects.vignette).toBe(0.5);
      expect(effects.glitch).toBe(0);
      expect(effects.jitter).toBe(0);
      expect(effects.slowMotion).toBeLessThan(1);
    });

    it('should return all effects for extreme over-caffeination', () => {
      const effects = calculateCompositeEffect(95);

      expect(effects.blur).toBe(0);
      expect(effects.shake).toBeGreaterThan(0);
      expect(effects.distortion).toBeGreaterThan(0);
      expect(effects.vignette).toBe(0.5);
      expect(effects.glitch).toBeGreaterThan(0);
      expect(effects.jitter).toBeGreaterThan(0);
      expect(effects.slowMotion).toBe(1);
    });

    it('should return minimal effects for optimal caffeine', () => {
      const effects = calculateCompositeEffect(50);

      expect(effects.blur).toBe(0);
      expect(effects.shake).toBe(0);
      expect(effects.distortion).toBe(0);
      expect(effects.vignette).toBe(0);
      expect(effects.glitch).toBe(0);
      expect(effects.jitter).toBe(0);
      expect(effects.slowMotion).toBe(1);
    });
  });

  describe('applyScreenShake', () => {
    it('should not apply shake for zero intensity', () => {
      const element = document.createElement('div');
      const result = applyScreenShake(element, 0);

      expect(result).toBeUndefined();
      expect(animeMock).not.toHaveBeenCalled();
    });

    it('should apply shake animation for positive intensity', () => {
      const element = document.createElement('div');
      const result = applyScreenShake(element, 0.5, 1000);

      expect(animeMock).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: element,
          easing: 'easeOutElastic(1, 0.5)',
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('applyBlurEffect', () => {
    it('should clear blur for zero intensity', () => {
      const element = document.createElement('div');
      element.style.filter = 'blur(5px)';

      applyBlurEffect(element, 0);

      expect(element.style.filter).toBe('none');
      expect(animeMock).not.toHaveBeenCalled();
    });

    it('should apply blur animation for positive intensity', () => {
      const element = document.createElement('div');
      const result = applyBlurEffect(element, 0.5);

      expect(animeMock).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: element,
          filter: 'blur(2.5px)',
          duration: 300,
          easing: 'easeInOutQuad',
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('applyVignetteEffect', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should remove vignette for zero intensity', () => {
      // Add existing vignette
      const existingVignette = document.createElement('div');
      existingVignette.className = 'vignette-overlay';
      container.appendChild(existingVignette);

      applyVignetteEffect(container, 0);

      expect(container.querySelector('.vignette-overlay')).toBeNull();
    });

    it('should add vignette for positive intensity', () => {
      applyVignetteEffect(container, 0.5);

      const vignette = container.querySelector('.vignette-overlay');
      expect(vignette).not.toBeNull();
      expect(vignette?.style.position).toBe('fixed');
      expect(vignette?.style.pointerEvents).toBe('none');
    });

    it('should update existing vignette intensity', () => {
      applyVignetteEffect(container, 0.3);
      const vignette1 = container.querySelector('.vignette-overlay');

      applyVignetteEffect(container, 0.7);
      const vignette2 = container.querySelector('.vignette-overlay');

      expect(vignette1).toBe(vignette2);
      expect(container.querySelectorAll('.vignette-overlay').length).toBe(1);
    });
  });

  describe('applyChromaticAberration', () => {
    it('should clear chromatic aberration for zero intensity', () => {
      const element = document.createElement('div');
      element.style.textShadow = '2px 0 0 red';

      applyChromaticAberration(element, 0);

      expect(element.style.textShadow).toBe('none');
    });

    it('should apply chromatic aberration for positive intensity', () => {
      const element = document.createElement('div');

      applyChromaticAberration(element, 0.5);

      expect(element.style.textShadow).toContain('rgba(255, 0, 0, 0.5)');
      expect(element.style.textShadow).toContain('rgba(0, 255, 255, 0.5)');
    });
  });

  describe('applyGlitchEffect', () => {
    it('should not apply glitch for zero intensity', () => {
      const element = document.createElement('div');
      const result = applyGlitchEffect(element, 0);

      expect(result).toBeUndefined();
      expect(animeMock).not.toHaveBeenCalled();
    });

    it('should apply glitch animation for positive intensity', () => {
      const element = document.createElement('div');
      const result = applyGlitchEffect(element, 0.5);

      expect(animeMock).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: element,
          easing: 'steps(5)',
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('applyContinuousJitter', () => {
    it('should not apply jitter for zero intensity', () => {
      const element = document.createElement('div');
      const result = applyContinuousJitter(element, 0);

      expect(result).toBeUndefined();
      expect(animeMock).not.toHaveBeenCalled();
    });

    it('should apply continuous jitter for positive intensity', () => {
      const element = document.createElement('div');
      const result = applyContinuousJitter(element, 0.5);

      expect(animeMock).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: element,
          duration: 50,
          easing: 'linear',
          loop: true,
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('applySlowMotionEffect', () => {
    it('should return 1 for normal speed', () => {
      const multiplier = applySlowMotionEffect(1);
      expect(multiplier).toBe(1);
    });

    it('should return slower multiplier for low values', () => {
      const multiplier = applySlowMotionEffect(0.5);
      expect(multiplier).toBe(0.5);
    });

    it('should clamp to minimum value', () => {
      const multiplier = applySlowMotionEffect(0.1);
      expect(multiplier).toBe(0.3);
    });

    it('should clamp to maximum value', () => {
      const multiplier = applySlowMotionEffect(2);
      expect(multiplier).toBe(1);
    });
  });

  describe('cleanupScreenEffects', () => {
    it('should remove vignette overlay', () => {
      const container = document.createElement('div');
      const vignette = document.createElement('div');
      vignette.className = 'vignette-overlay';
      container.appendChild(vignette);

      cleanupScreenEffects(container);

      expect(container.querySelector('.vignette-overlay')).toBeNull();
    });

    it('should reset all style effects', () => {
      const container = document.createElement('div');
      container.style.filter = 'blur(5px)';
      container.style.textShadow = '2px 0 0 red';
      container.style.transform = 'translateX(10px)';

      cleanupScreenEffects(container);

      expect(container.style.filter).toBe('none');
      expect(container.style.textShadow).toBe('none');
      expect(container.style.transform).toBe('none');
    });
  });
});