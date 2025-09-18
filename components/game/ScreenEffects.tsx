'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  calculateCompositeEffect,
  applyScreenShake,
  applyBlurEffect,
  applyVignetteEffect,
  applyGlitchEffect,
  applyContinuousJitter,
  applyChromaticAberration,
  cleanupScreenEffects,
  CompositeEffect,
} from '@/utils/screenEffects';
import anime from '@/lib/anime';

export interface ScreenEffectsProps {
  caffeineLevel: number;
  healthLevel?: number;
  isActive?: boolean;
  children: React.ReactNode;
  className?: string;
  enableBlur?: boolean;
  enableShake?: boolean;
  enableDistortion?: boolean;
  enableVignette?: boolean;
  intensity?: number; // Global intensity multiplier
}

/**
 * ScreenEffects component that applies visual effects based on game state
 */
export const ScreenEffects: React.FC<ScreenEffectsProps> = ({
  caffeineLevel,
  healthLevel,
  isActive = true,
  children,
  className = '',
  enableBlur = true,
  enableShake = true,
  enableDistortion = true,
  enableVignette = true,
  intensity = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [effects, setEffects] = useState<CompositeEffect>(calculateCompositeEffect(caffeineLevel));
  const animationRefs = useRef<{
    shake?: anime.AnimeInstance;
    blur?: anime.AnimeInstance;
    glitch?: anime.AnimeInstance;
    jitter?: anime.AnimeInstance;
  }>({});

  // Calculate composite effects based on caffeine level
  useEffect(() => {
    const newEffects = calculateCompositeEffect(caffeineLevel);
    setEffects(newEffects);
  }, [caffeineLevel]);

  // Apply blur effect
  useEffect(() => {
    if (!contentRef.current || !isActive || !enableBlur) return;

    // Cleanup previous blur animation
    if (animationRefs.current.blur) {
      animationRefs.current.blur.pause();
    }

    const blurIntensity = effects.blur * intensity;
    if (blurIntensity > 0) {
      animationRefs.current.blur = applyBlurEffect(contentRef.current, blurIntensity);
    } else {
      contentRef.current.style.filter = 'none';
    }

    return () => {
      if (animationRefs.current.blur) {
        animationRefs.current.blur.pause();
      }
    };
  }, [effects.blur, isActive, enableBlur, intensity]);

  // Apply screen shake effect
  useEffect(() => {
    if (!containerRef.current || !isActive || !enableShake) return;

    const shakeIntensity = effects.shake * intensity;
    if (shakeIntensity > 0.3) {
      // Only shake if significant
      animationRefs.current.shake = applyScreenShake(containerRef.current, shakeIntensity);
    }

    return () => {
      if (animationRefs.current.shake) {
        animationRefs.current.shake.pause();
        if (containerRef.current) {
          containerRef.current.style.transform = 'none';
        }
      }
    };
  }, [effects.shake, isActive, enableShake, intensity]);

  // Apply vignette effect
  useEffect(() => {
    if (!containerRef.current || !isActive || !enableVignette) return;

    const vignetteIntensity = effects.vignette * intensity;
    applyVignetteEffect(containerRef.current, vignetteIntensity);

    return () => {
      if (containerRef.current) {
        cleanupScreenEffects(containerRef.current);
      }
    };
  }, [effects.vignette, isActive, enableVignette, intensity]);

  // Apply glitch effect for extreme over-caffeination
  useEffect(() => {
    if (!contentRef.current || !isActive || !enableDistortion) return;

    const glitchIntensity = effects.glitch * intensity;
    if (glitchIntensity > 0.3) {
      const glitchInterval = setInterval(() => {
        if (contentRef.current && Math.random() < glitchIntensity) {
          animationRefs.current.glitch = applyGlitchEffect(contentRef.current, glitchIntensity * 10);
        }
      }, 2000);

      return () => {
        clearInterval(glitchInterval);
        if (animationRefs.current.glitch) {
          animationRefs.current.glitch.pause();
        }
      };
    }
  }, [effects.glitch, isActive, enableDistortion, intensity]);

  // Apply continuous jitter for high caffeine
  useEffect(() => {
    if (!contentRef.current || !isActive || !enableDistortion) return;

    const jitterIntensity = effects.jitter * intensity;
    if (jitterIntensity > 0.2) {
      animationRefs.current.jitter = applyContinuousJitter(contentRef.current, jitterIntensity);

      return () => {
        if (animationRefs.current.jitter) {
          animationRefs.current.jitter.pause();
          if (contentRef.current) {
            contentRef.current.style.transform = 'none';
          }
        }
      };
    }
  }, [effects.jitter, isActive, enableDistortion, intensity]);

  // Apply chromatic aberration for distortion
  useEffect(() => {
    if (!contentRef.current || !isActive || !enableDistortion) return;

    const distortionIntensity = effects.distortion * intensity;
    applyChromaticAberration(contentRef.current, distortionIntensity);

    return () => {
      if (contentRef.current) {
        contentRef.current.style.textShadow = 'none';
      }
    };
  }, [effects.distortion, isActive, enableDistortion, intensity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(animationRefs.current).forEach(animation => {
        if (animation) {
          animation.pause();
        }
      });

      if (containerRef.current) {
        cleanupScreenEffects(containerRef.current);
      }
    };
  }, []);

  // Calculate CSS classes based on effects
  const effectClasses = useMemo(() => {
    const classes = [];

    if (effects.blur > 0.5) {
      classes.push('effect-blur-active');
    }
    if (effects.shake > 0.5) {
      classes.push('effect-shake-active');
    }
    if (effects.distortion > 0.3) {
      classes.push('effect-distortion-active');
    }
    if (effects.slowMotion < 0.8) {
      classes.push('effect-slowmotion-active');
    }

    return classes.join(' ');
  }, [effects]);

  // Apply slow motion to animation durations
  const animationStyle = useMemo(() => {
    return {
      animationDuration: `${1 / effects.slowMotion}s`,
      transitionDuration: `${0.3 / effects.slowMotion}s`,
    };
  }, [effects.slowMotion]);

  // Add warning overlay for critical states
  const showWarning = caffeineLevel < 10 || caffeineLevel > 95;
  const warningClass = caffeineLevel < 10 ? 'warning-undercaffeinated' : 'warning-overcaffeinated';

  return (
    <div
      ref={containerRef}
      className={`screen-effects-container relative w-full h-full ${className} ${effectClasses}`}
      data-caffeine-level={caffeineLevel}
    >
      <div
        ref={contentRef}
        className="screen-effects-content w-full h-full"
        style={animationStyle}
      >
        {children}
      </div>

      {/* Warning overlay for critical states */}
      {showWarning && isActive && (
        <div
          className={`warning-overlay fixed inset-0 pointer-events-none ${warningClass}`}
          style={{
            background: caffeineLevel < 10
              ? 'radial-gradient(circle at center, transparent 60%, rgba(59, 130, 246, 0.2) 100%)'
              : 'radial-gradient(circle at center, transparent 60%, rgba(239, 68, 68, 0.2) 100%)',
            animation: 'pulse 2s infinite',
            zIndex: 9998,
          }}
        />
      )}

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="absolute top-2 right-2 text-xs text-gray-500 bg-black bg-opacity-50 p-2 rounded pointer-events-none"
          style={{ zIndex: 10000 }}
        >
          <div>Caffeine: {caffeineLevel}%</div>
          <div>Blur: {(effects.blur * 100).toFixed(0)}%</div>
          <div>Shake: {(effects.shake * 100).toFixed(0)}%</div>
          <div>Distortion: {(effects.distortion * 100).toFixed(0)}%</div>
        </div>
      )}
    </div>
  );
};

/**
 * Hook to manage screen effects state
 */
export function useScreenEffects(
  caffeineLevel: number,
  options: {
    enableBlur?: boolean;
    enableShake?: boolean;
    enableDistortion?: boolean;
    enableVignette?: boolean;
    intensity?: number;
  } = {}
) {
  const [isActive, setIsActive] = useState(true);
  const [intensity, setIntensity] = useState(options.intensity || 1);

  const effects = useMemo(() => {
    return calculateCompositeEffect(caffeineLevel);
  }, [caffeineLevel]);

  const toggleEffects = () => setIsActive(!isActive);
  const setEffectIntensity = (newIntensity: number) => {
    setIntensity(Math.max(0, Math.min(2, newIntensity)));
  };

  return {
    effects,
    isActive,
    intensity,
    toggleEffects,
    setEffectIntensity,
  };
}

/**
 * Simplified effect overlay for specific UI elements
 */
export interface EffectOverlayProps {
  effectType: 'blur' | 'shake' | 'glitch';
  intensity: number;
  isActive?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const EffectOverlay: React.FC<EffectOverlayProps> = ({
  effectType,
  intensity,
  isActive = true,
  children,
  className = '',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current || !isActive || intensity === 0) return;

    let animation: anime.AnimeInstance | undefined;

    switch (effectType) {
      case 'blur':
        animation = applyBlurEffect(overlayRef.current, intensity);
        break;
      case 'shake':
        animation = applyScreenShake(overlayRef.current, intensity);
        break;
      case 'glitch':
        animation = applyGlitchEffect(overlayRef.current, intensity * 10);
        break;
    }

    return () => {
      if (animation) {
        animation.pause();
      }
      if (overlayRef.current) {
        overlayRef.current.style.transform = 'none';
        overlayRef.current.style.filter = 'none';
      }
    };
  }, [effectType, intensity, isActive]);

  return (
    <div ref={overlayRef} className={`effect-overlay ${className}`}>
      {children}
    </div>
  );
};