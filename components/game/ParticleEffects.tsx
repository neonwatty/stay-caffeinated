'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import anime from '@/lib/anime';

// Particle types
export type ParticleType = 'steam' | 'explosion' | 'confetti' | 'sparkle' | 'bubble';

// Particle configuration
export interface ParticleConfig {
  count?: number;
  size?: number;
  color?: string | string[];
  duration?: number;
  spread?: number;
  gravity?: number;
  wind?: number;
  fadeOut?: boolean;
  loop?: boolean;
}

// Default configs for different particle types
const DEFAULT_CONFIGS: Record<ParticleType, ParticleConfig> = {
  steam: {
    count: 10,
    size: 8,
    color: ['rgba(255, 255, 255, 0.8)', 'rgba(200, 200, 200, 0.6)'],
    duration: 3000,
    spread: 30,
    gravity: -0.5,
    wind: 0.2,
    fadeOut: true,
    loop: true,
  },
  explosion: {
    count: 30,
    size: 6,
    color: ['#FF6B6B', '#FFA500', '#FFD700', '#FF4500'],
    duration: 800,
    spread: 200,
    gravity: 0.8,
    wind: 0,
    fadeOut: true,
    loop: false,
  },
  confetti: {
    count: 50,
    size: 10,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA500', '#98D8C8', '#FFD700'],
    duration: 5000,
    spread: 100,
    gravity: 0.3,
    wind: 0.1,
    fadeOut: true,
    loop: false,
  },
  sparkle: {
    count: 20,
    size: 4,
    color: ['#FFD700', '#FFF8DC', '#FFFACD'],
    duration: 1500,
    spread: 50,
    gravity: 0,
    wind: 0,
    fadeOut: true,
    loop: false,
  },
  bubble: {
    count: 15,
    size: 12,
    color: ['rgba(135, 206, 235, 0.6)', 'rgba(176, 224, 230, 0.4)'],
    duration: 4000,
    spread: 40,
    gravity: -0.3,
    wind: 0.1,
    fadeOut: true,
    loop: true,
  },
};

export interface ParticleEffectsProps {
  type: ParticleType;
  x?: number;
  y?: number;
  active?: boolean;
  config?: Partial<ParticleConfig>;
  onComplete?: () => void;
  className?: string;
  containerRef?: React.RefObject<HTMLElement>;
}

/**
 * ParticleEffects component for creating various particle animations
 */
export const ParticleEffects: React.FC<ParticleEffectsProps> = ({
  type,
  x,
  y,
  active = true,
  config = {},
  onComplete,
  className = '',
  containerRef,
}) => {
  const particlesRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<{ pause: () => void; play?: () => void; restart?: () => void } | null>(null);
  const particleElementsRef = useRef<HTMLElement[]>([]);

  // Merge default config with custom config
  const particleConfig = { ...DEFAULT_CONFIGS[type], ...config };

  // Create particles
  const createParticles = useCallback(() => {
    if (!particlesRef.current) return;

    // Clear existing particles
    particleElementsRef.current.forEach(p => p.remove());
    particleElementsRef.current = [];

    const container = containerRef?.current || particlesRef.current;
    const rect = container.getBoundingClientRect();
    const centerX = x !== undefined ? x : rect.width / 2;
    const centerY = y !== undefined ? y : rect.height / 2;

    // Create particle elements
    for (let i = 0; i < (particleConfig.count || 10); i++) {
      const particle = document.createElement('div');
      particle.className = `particle particle-${type}`;

      // Set particle styles
      const size = particleConfig.size || 8;
      const colors = Array.isArray(particleConfig.color) ? particleConfig.color : [particleConfig.color || '#FFF'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.cssText = `
        position: absolute;
        left: ${centerX}px;
        top: ${centerY}px;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        pointer-events: none;
        z-index: 9999;
        ${type === 'confetti' ? `transform: rotate(${Math.random() * 360}deg);` : 'border-radius: 50%;'}
        ${type === 'sparkle' ? 'clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);' : ''}
      `;

      container.appendChild(particle);
      particleElementsRef.current.push(particle);
    }

    return particleElementsRef.current;
  }, [type, x, y, particleConfig, containerRef]);

  // Animate particles based on type
  const animateParticles = useCallback((particles: HTMLElement[]) => {
    if (!particles || particles.length === 0) return;

    // Clean up previous animation
    if (animationRef.current) {
      animationRef.current.pause();
    }

    const spread = particleConfig.spread || 100;
    const duration = particleConfig.duration || 1000;
    const gravity = particleConfig.gravity || 0;
    const wind = particleConfig.wind || 0;

    // Create animation timeline
    const timeline = anime.timeline({
      easing: 'easeOutQuad',
      complete: () => {
        if (particleConfig.loop && active) {
          // Recreate particles for loop
          const newParticles = createParticles();
          if (newParticles) {
            animateParticles(newParticles);
          }
        } else {
          particles.forEach(p => p.remove());
          particleElementsRef.current = [];
        }
        if (!particleConfig.loop) {
          onComplete?.();
        }
      },
    });

    // Type-specific animations
    switch (type) {
      case 'steam':
        timeline.add({
          targets: particles,
          translateX: () => anime.random(-spread / 2, spread / 2) + wind * duration,
          translateY: () => anime.random(-spread * 2, -spread) + gravity * duration,
          scale: [0.5, 1.5],
          opacity: [0.8, 0],
          duration: duration,
          delay: anime.stagger(200),
          easing: 'linear',
        });
        break;

      case 'explosion':
        timeline.add({
          targets: particles,
          translateX: () => anime.random(-spread, spread),
          translateY: () => anime.random(-spread, spread / 2),
          scale: [0, 1, 0],
          opacity: [1, 0],
          duration: duration,
          delay: anime.stagger(10),
          easing: 'easeOutExpo',
        });
        break;

      case 'confetti':
        timeline.add({
          targets: particles,
          translateX: () => anime.random(-spread, spread),
          translateY: [
            { value: () => anime.random(-spread / 2, 0), duration: duration * 0.3, easing: 'easeOutQuad' },
            { value: () => anime.random(spread, spread * 2), duration: duration * 0.7, easing: 'easeInQuad' }
          ],
          rotate: () => anime.random(0, 720),
          scale: [1, 0.8],
          opacity: [1, 0],
          duration: duration,
          delay: anime.stagger(50),
        });
        break;

      case 'sparkle':
        timeline.add({
          targets: particles,
          translateX: () => anime.random(-spread, spread),
          translateY: () => anime.random(-spread, spread),
          scale: [0, 1.2, 0],
          opacity: [0, 1, 0],
          rotate: 360,
          duration: duration,
          delay: anime.stagger(100),
          easing: 'easeInOutQuad',
        });
        break;

      case 'bubble':
        timeline.add({
          targets: particles,
          translateX: () => anime.random(-spread / 2, spread / 2),
          translateY: () => anime.random(-spread * 2, -spread),
          scale: [0.5, 1.2, 1],
          opacity: [0.6, 0.8, 0],
          duration: duration,
          delay: anime.stagger(300),
          easing: 'easeOutSine',
        });
        break;
    }

    animationRef.current = timeline;

    // Note: Loop handling is done through the timeline complete callback above
  }, [type, particleConfig, active, onComplete, createParticles]);

  // Initialize particles
  useEffect(() => {
    if (active) {
      const particles = createParticles();
      if (particles) {
        animateParticles(particles);
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
      particleElementsRef.current.forEach(p => p.remove());
      particleElementsRef.current = [];
    };
  }, [active, createParticles, animateParticles]);

  return (
    <div
      ref={particlesRef}
      className={`particle-effects-container ${className}`}
      style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
};

/**
 * Steam effect component for coffee cups
 */
export interface SteamEffectProps {
  active?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const SteamEffect: React.FC<SteamEffectProps> = ({
  active = true,
  intensity = 'medium',
  className = '',
}) => {
  const intensityConfig = {
    low: { count: 5, duration: 4000, spread: 20 },
    medium: { count: 10, duration: 3000, spread: 30 },
    high: { count: 15, duration: 2000, spread: 40 },
  };

  return (
    <ParticleEffects
      type="steam"
      active={active}
      config={intensityConfig[intensity]}
      className={className}
    />
  );
};

/**
 * Explosion effect component
 */
export interface ExplosionEffectProps {
  x: number;
  y: number;
  trigger?: boolean;
  intensity?: 'small' | 'medium' | 'large';
  onComplete?: () => void;
  className?: string;
}

export const ExplosionEffect: React.FC<ExplosionEffectProps> = ({
  x,
  y,
  trigger = false,
  intensity = 'medium',
  onComplete,
  className = '',
}) => {
  const [isActive, setIsActive] = useState(false);

  const intensityConfig = {
    small: { count: 15, size: 4, spread: 100, duration: 600 },
    medium: { count: 30, size: 6, spread: 200, duration: 800 },
    large: { count: 50, size: 8, spread: 300, duration: 1000 },
  };

  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      setTimeout(() => setIsActive(false), intensityConfig[intensity].duration);
    }
  }, [trigger, intensity, intensityConfig]);

  return (
    <ParticleEffects
      type="explosion"
      x={x}
      y={y}
      active={isActive}
      config={intensityConfig[intensity]}
      onComplete={onComplete}
      className={className}
    />
  );
};

/**
 * Confetti celebration effect
 */
export interface ConfettiEffectProps {
  trigger?: boolean;
  onComplete?: () => void;
  className?: string;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  trigger = false,
  onComplete,
  className = '',
}) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, 5000);
    }
  }, [trigger, onComplete]);

  return (
    <ParticleEffects
      type="confetti"
      active={isActive}
      className={className}
    />
  );
};

/**
 * Hook to manage particle effects
 */
export function useParticleEffect(type: ParticleType, config?: Partial<ParticleConfig>) {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const trigger = useCallback((x?: number, y?: number) => {
    if (x !== undefined && y !== undefined) {
      setPosition({ x, y });
    }
    setIsActive(true);

    // Auto-deactivate for non-looping effects
    if (!config?.loop && !DEFAULT_CONFIGS[type].loop) {
      setTimeout(() => {
        setIsActive(false);
      }, config?.duration || DEFAULT_CONFIGS[type].duration || 1000);
    }
  }, [type, config]);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    position,
    trigger,
    stop,
  };
}