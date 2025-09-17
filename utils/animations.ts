import anime from '@/lib/anime';

/**
 * Game-specific animation presets and utilities
 */

// Easing functions for game feel
export const GAME_EASINGS = {
  bounce: 'spring(1, 80, 10, 0)',
  smooth: 'easeInOutQuad',
  sharp: 'easeInOutExpo',
  elastic: 'easeOutElastic(1, 0.5)',
  overshoot: 'easeOutBack',
} as const;

// Animation durations
export const DURATIONS = {
  instant: 100,
  fast: 200,
  normal: 400,
  slow: 600,
  verySlow: 1000,
} as const;

/**
 * Caffeine bar animation based on level
 */
export function animateCaffeineBar(
  target: HTMLElement,
  level: number,
  isOptimal: boolean
) {
  const color = isOptimal ? '#10b981' : level > 70 ? '#f59e0b' : '#ef4444';

  if (!anime) return;
  return anime({
    targets: target,
    width: `${level}%`,
    backgroundColor: color,
    duration: DURATIONS.normal,
    easing: GAME_EASINGS.smooth,
  });
}

/**
 * Health bar pulse animation when taking damage
 */
export function animateHealthDamage(target: HTMLElement) {
  if (!anime) return;
  return anime({
    targets: target,
    scale: [1, 0.95, 1],
    backgroundColor: ['#dc2626', '#ef4444', '#dc2626'],
    duration: DURATIONS.fast,
    easing: GAME_EASINGS.sharp,
  });
}

/**
 * Screen shake effect for over-caffeination
 */
export function screenShake(target: HTMLElement, intensity: number = 5) {
  if (!anime) return;
  return anime({
    targets: target,
    translateX: anime?.random ? anime.random(-intensity, intensity) : Math.random() * intensity * 2 - intensity,
    translateY: anime?.random ? anime.random(-intensity, intensity) : Math.random() * intensity * 2 - intensity,
    duration: DURATIONS.instant,
    easing: GAME_EASINGS.sharp,
    loop: 3,
    direction: 'alternate',
  });
}

/**
 * Character state transitions
 */
export function animateCharacterState(
  target: HTMLElement,
  state: 'sleepy' | 'normal' | 'hyper'
) {
  const animations = {
    sleepy: {
      scale: [1, 0.95],
      opacity: [1, 0.7],
      duration: DURATIONS.verySlow,
      direction: 'alternate',
      loop: true,
      easing: GAME_EASINGS.smooth,
    },
    normal: {
      scale: 1,
      opacity: 1,
      duration: DURATIONS.normal,
      easing: GAME_EASINGS.smooth,
    },
    hyper: {
      rotate: anime?.random ? anime.random(-5, 5) : Math.random() * 10 - 5,
      scale: [1, 1.05],
      duration: DURATIONS.fast,
      direction: 'alternate',
      loop: true,
      easing: GAME_EASINGS.bounce,
    },
  };

  if (!anime) return;
  return anime({
    targets: target,
    ...animations[state],
  });
}

/**
 * Drink consumption animation
 */
export function animateDrinkConsumption(
  drinkElement: HTMLElement,
  targetElement: HTMLElement
) {
  if (!anime || !anime.timeline) return;
  const timeline = anime.timeline({
    easing: GAME_EASINGS.smooth,
  });

  timeline
    .add({
      targets: drinkElement,
      scale: [1, 1.2, 0],
      opacity: [1, 1, 0],
      duration: DURATIONS.normal,
    })
    .add({
      targets: targetElement,
      scale: [1, 1.1, 1],
      duration: DURATIONS.fast,
    }, '-=200');

  return timeline;
}

/**
 * Power-up collection animation
 */
export function animatePowerUp(target: HTMLElement) {
  if (!anime) return;
  return anime({
    targets: target,
    scale: [0, 1.2, 1],
    rotate: '1turn',
    duration: DURATIONS.normal,
    easing: GAME_EASINGS.elastic,
  });
}

/**
 * Game over animation
 */
export function animateGameOver(target: HTMLElement) {
  if (!anime || !anime.timeline) return;
  const timeline = anime.timeline({
    easing: GAME_EASINGS.sharp,
  });

  timeline
    .add({
      targets: target,
      scale: [1, 1.1],
      duration: DURATIONS.fast,
    })
    .add({
      targets: target,
      rotate: anime?.random ? anime.random(-45, 45) : Math.random() * 90 - 45,
      translateY: '100vh',
      duration: DURATIONS.slow,
      easing: GAME_EASINGS.overshoot,
    });

  return timeline;
}

/**
 * Success celebration animation
 */
export function animateSuccess(targets: NodeListOf<HTMLElement> | HTMLElement[]) {
  if (!anime) return;
  return anime({
    targets,
    translateY: [0, -30, 0],
    scale: [1, 1.2, 1],
    rotate: anime?.stagger ? anime.stagger([0, 360]) : 180,
    delay: anime?.stagger ? anime.stagger(100) : 100,
    duration: DURATIONS.slow,
    easing: GAME_EASINGS.bounce,
  });
}

/**
 * Particle effect for explosions
 */
export function createParticleExplosion(
  container: HTMLElement,
  x: number,
  y: number,
  particleCount: number = 20
) {
  const particles: HTMLElement[] = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'absolute w-2 h-2 bg-yellow-400 rounded-full';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    container.appendChild(particle);
    particles.push(particle);
  }

  if (!anime) {
    particles.forEach(p => p.remove());
    return;
  }
  const animation = anime({
    targets: particles,
    translateX: () => anime?.random ? anime.random(-200, 200) : Math.random() * 400 - 200,
    translateY: () => anime?.random ? anime.random(-200, 200) : Math.random() * 400 - 200,
    scale: [1, 0],
    opacity: [1, 0],
    duration: DURATIONS.slow,
    easing: GAME_EASINGS.sharp,
    complete: () => {
      particles.forEach(p => p.remove());
    },
  });

  return animation;
}

/**
 * Cleanup utility for animations
 */
export function cleanupAnimation(animation: anime.AnimeInstance | null) {
  if (animation) {
    animation.pause();
    if (animation.animatables) {
      animation.animatables.forEach(animatable => {
        anime?.remove(animatable.target);
      });
    }
  }
}