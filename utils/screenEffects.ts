import anime from '@/lib/anime';

/**
 * Screen Effects utilities for visual feedback based on caffeine levels
 */

// Effect intensity presets
export const EFFECT_INTENSITY = {
  none: 0,
  light: 0.3,
  medium: 0.6,
  heavy: 1.0,
  extreme: 1.5,
} as const;

// Effect thresholds based on caffeine levels
export const CAFFEINE_THRESHOLDS = {
  underCaffeinated: {
    severe: 10,    // < 10% - severe under-caffeination
    moderate: 20,  // 10-20% - moderate under-caffeination
    mild: 30,      // 20-30% - mild under-caffeination
  },
  overCaffeinated: {
    mild: 70,      // 70-80% - mild over-caffeination
    moderate: 85,  // 80-85% - moderate over-caffeination
    severe: 95,    // > 95% - severe over-caffeination
  },
  optimal: {
    min: 30,
    max: 70,
  },
} as const;

/**
 * Calculate effect intensity based on caffeine level
 */
export function calculateEffectIntensity(
  caffeineLevel: number,
  effectType: 'blur' | 'shake' | 'distortion'
): number {
  // Under-caffeinated effects (blur, slowness)
  if (effectType === 'blur') {
    if (caffeineLevel < CAFFEINE_THRESHOLDS.underCaffeinated.severe) {
      return EFFECT_INTENSITY.extreme;
    } else if (caffeineLevel < CAFFEINE_THRESHOLDS.underCaffeinated.moderate) {
      return EFFECT_INTENSITY.heavy;
    } else if (caffeineLevel < CAFFEINE_THRESHOLDS.underCaffeinated.mild) {
      return EFFECT_INTENSITY.medium;
    }
    return EFFECT_INTENSITY.none;
  }

  // Over-caffeinated effects (shake, jitter)
  if (effectType === 'shake') {
    if (caffeineLevel > CAFFEINE_THRESHOLDS.overCaffeinated.severe) {
      return EFFECT_INTENSITY.extreme;
    } else if (caffeineLevel > CAFFEINE_THRESHOLDS.overCaffeinated.moderate) {
      return EFFECT_INTENSITY.heavy;
    } else if (caffeineLevel > CAFFEINE_THRESHOLDS.overCaffeinated.mild) {
      return EFFECT_INTENSITY.medium;
    }
    return EFFECT_INTENSITY.none;
  }

  // Distortion effects (both extremes)
  if (effectType === 'distortion') {
    const underIntensity = caffeineLevel < CAFFEINE_THRESHOLDS.underCaffeinated.mild
      ? (CAFFEINE_THRESHOLDS.underCaffeinated.mild - caffeineLevel) / CAFFEINE_THRESHOLDS.underCaffeinated.mild
      : 0;

    const overIntensity = caffeineLevel > CAFFEINE_THRESHOLDS.overCaffeinated.mild
      ? (caffeineLevel - CAFFEINE_THRESHOLDS.overCaffeinated.mild) / (100 - CAFFEINE_THRESHOLDS.overCaffeinated.mild)
      : 0;

    return Math.max(underIntensity, overIntensity);
  }

  return EFFECT_INTENSITY.none;
}

/**
 * Enhanced screen shake effect with configurable parameters
 */
export function applyScreenShake(
  target: HTMLElement,
  intensity: number,
  duration: number = 500
): anime.AnimeInstance | undefined {
  if (!anime || intensity === 0) return;

  const shakeIntensity = intensity * 10; // Scale for visible effect

  return anime({
    targets: target,
    translateX: [
      { value: shakeIntensity, duration: duration * 0.1 },
      { value: -shakeIntensity * 0.8, duration: duration * 0.1 },
      { value: shakeIntensity * 0.6, duration: duration * 0.1 },
      { value: -shakeIntensity * 0.4, duration: duration * 0.1 },
      { value: shakeIntensity * 0.2, duration: duration * 0.1 },
      { value: 0, duration: duration * 0.5 },
    ],
    translateY: [
      { value: -shakeIntensity * 0.5, duration: duration * 0.1 },
      { value: shakeIntensity * 0.7, duration: duration * 0.1 },
      { value: -shakeIntensity * 0.4, duration: duration * 0.1 },
      { value: shakeIntensity * 0.3, duration: duration * 0.1 },
      { value: -shakeIntensity * 0.1, duration: duration * 0.1 },
      { value: 0, duration: duration * 0.5 },
    ],
    easing: 'easeOutElastic(1, 0.5)',
  });
}

/**
 * Apply blur filter effect
 */
export function applyBlurEffect(
  target: HTMLElement,
  intensity: number,
  duration: number = 300
): anime.AnimeInstance | undefined {
  if (!anime || intensity === 0) {
    target.style.filter = 'none';
    return;
  }

  const blurAmount = intensity * 5; // Convert to pixels

  return anime({
    targets: target,
    filter: `blur(${blurAmount}px)`,
    duration: duration,
    easing: 'easeInOutQuad',
  });
}

/**
 * Apply chromatic aberration effect (color distortion)
 */
export function applyChromaticAberration(
  target: HTMLElement,
  intensity: number
): void {
  if (intensity === 0) {
    target.style.textShadow = 'none';
    return;
  }

  const offset = intensity * 2;
  target.style.textShadow = `
    ${offset}px 0 0 rgba(255, 0, 0, 0.5),
    ${-offset}px 0 0 rgba(0, 255, 255, 0.5)
  `;
}

/**
 * Apply vignette effect (darkened edges)
 */
export function applyVignetteEffect(
  container: HTMLElement,
  intensity: number
): void {
  const existingVignette = container.querySelector('.vignette-overlay');

  if (intensity === 0) {
    if (existingVignette) {
      existingVignette.remove();
    }
    return;
  }

  let vignette = existingVignette as HTMLDivElement;

  if (!vignette) {
    vignette = document.createElement('div');
    vignette.className = 'vignette-overlay';
    vignette.style.position = 'fixed';
    vignette.style.top = '0';
    vignette.style.left = '0';
    vignette.style.right = '0';
    vignette.style.bottom = '0';
    vignette.style.pointerEvents = 'none';
    vignette.style.zIndex = '9999';
    vignette.style.transition = 'opacity 0.3s ease-in-out';
    container.appendChild(vignette);
  }

  const opacity = Math.min(intensity * 0.6, 0.8);
  vignette.style.background = `radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, ${opacity}) 100%)`;
}

/**
 * Apply visual glitch effect
 */
export function applyGlitchEffect(
  target: HTMLElement,
  intensity: number,
  duration: number = 100
): anime.AnimeInstance | undefined {
  if (!anime || intensity === 0) return;

  return anime({
    targets: target,
    keyframes: [
      { translateX: intensity * 5, translateY: intensity * 2, duration: duration * 0.2 },
      { translateX: -intensity * 3, translateY: -intensity * 4, duration: duration * 0.2 },
      { translateX: intensity * 2, translateY: intensity * 3, duration: duration * 0.2 },
      { translateX: 0, translateY: 0, duration: duration * 0.4 },
    ],
    easing: 'steps(5)',
  });
}

/**
 * Continuous jitter effect for extreme over-caffeination
 */
export function applyContinuousJitter(
  target: HTMLElement,
  intensity: number
): anime.AnimeInstance | undefined {
  if (!anime || intensity === 0) return;

  const jitterAmount = intensity * 2;

  return anime({
    targets: target,
    translateX: () => anime.random(-jitterAmount, jitterAmount),
    translateY: () => anime.random(-jitterAmount, jitterAmount),
    duration: 50,
    easing: 'linear',
    loop: true,
  });
}

/**
 * Apply slow motion effect for under-caffeination
 */
export function applySlowMotionEffect(
  animationSpeed: number = 1
): number {
  // Returns a multiplier for animation speeds
  // Lower caffeine = slower animations
  return Math.max(0.3, Math.min(1, animationSpeed));
}

/**
 * Cleanup all screen effects
 */
export function cleanupScreenEffects(container: HTMLElement): void {
  // Remove vignette overlay
  const vignette = container.querySelector('.vignette-overlay');
  if (vignette) {
    vignette.remove();
  }

  // Reset filters
  container.style.filter = 'none';
  container.style.textShadow = 'none';
  container.style.transform = 'none';
}

/**
 * Create a composite effect based on caffeine level
 */
export interface CompositeEffect {
  blur: number;
  shake: number;
  distortion: number;
  vignette: number;
  glitch: number;
  jitter: number;
  slowMotion: number;
}

export function calculateCompositeEffect(caffeineLevel: number): CompositeEffect {
  return {
    blur: calculateEffectIntensity(caffeineLevel, 'blur'),
    shake: calculateEffectIntensity(caffeineLevel, 'shake'),
    distortion: calculateEffectIntensity(caffeineLevel, 'distortion'),
    vignette: caffeineLevel < 20 || caffeineLevel > 80 ? 0.5 : 0,
    glitch: caffeineLevel > 90 ? (caffeineLevel - 90) / 10 : 0,
    jitter: caffeineLevel > 85 ? (caffeineLevel - 85) / 15 : 0,
    slowMotion: caffeineLevel < 30 ? caffeineLevel / 30 : 1,
  };
}