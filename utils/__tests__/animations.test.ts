import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock must be defined before imports that use it
vi.mock('@/lib/anime');

import {
  GAME_EASINGS,
  DURATIONS,
  animateCaffeineBar,
  animateHealthDamage,
  screenShake,
  animateCharacterState,
  animateDrinkConsumption,
  animatePowerUp,
  animateGameOver,
  animateSuccess,
  createParticleExplosion,
  cleanupAnimation
} from '../animations';

import anime from '@/lib/anime';

// Cast anime to mock functions
const animeMock = anime as unknown as {
  mockImplementation: (fn: () => unknown) => void;
  timeline: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  random: ReturnType<typeof vi.fn>;
  stagger: ReturnType<typeof vi.fn>;
  (options?: unknown): unknown;
  [key: string]: unknown;
};

describe('Animation Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    const mockAnimation = {
      pause: vi.fn(),
      play: vi.fn(),
      restart: vi.fn(),
      animatables: []
    };

    const mockTimeline = {
      add: vi.fn().mockReturnThis(),
      pause: vi.fn(),
      play: vi.fn(),
    };

    animeMock.mockImplementation(() => mockAnimation);
    animeMock.timeline = vi.fn(() => mockTimeline);
    animeMock.remove = vi.fn();
    animeMock.random = vi.fn((min: number, max: number) => Math.random() * (max - min) + min);
    animeMock.stagger = vi.fn((value: unknown) => value);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constants', () => {
    it('should export game easings', () => {
      expect(GAME_EASINGS).toEqual({
        bounce: 'spring(1, 80, 10, 0)',
        smooth: 'easeInOutQuad',
        sharp: 'easeInOutExpo',
        elastic: 'easeOutElastic(1, 0.5)',
        overshoot: 'easeOutBack',
      });
    });

    it('should export durations', () => {
      expect(DURATIONS).toEqual({
        instant: 100,
        fast: 200,
        normal: 400,
        slow: 600,
        verySlow: 1000,
      });
    });
  });

  describe('animateCaffeineBar', () => {
    it('should animate bar with optimal color', () => {
      const target = document.createElement('div');
      animateCaffeineBar(target, 50, true);

      expect(animeMock).toHaveBeenCalledWith({
        targets: target,
        width: '50%',
        backgroundColor: '#10b981',
        duration: DURATIONS.normal,
        easing: GAME_EASINGS.smooth,
      });
    });

    it('should animate bar with warning color for high levels', () => {
      const target = document.createElement('div');
      animateCaffeineBar(target, 85, false);

      expect(animeMock).toHaveBeenCalledWith({
        targets: target,
        width: '85%',
        backgroundColor: '#f59e0b',
        duration: DURATIONS.normal,
        easing: GAME_EASINGS.smooth,
      });
    });

    it('should animate bar with danger color for low levels', () => {
      const target = document.createElement('div');
      animateCaffeineBar(target, 25, false);

      expect(animeMock).toHaveBeenCalledWith({
        targets: target,
        width: '25%',
        backgroundColor: '#ef4444',
        duration: DURATIONS.normal,
        easing: GAME_EASINGS.smooth,
      });
    });
  });

  describe('animateHealthDamage', () => {
    it('should create damage pulse animation', () => {
      const target = document.createElement('div');
      animateHealthDamage(target);

      expect(animeMock).toHaveBeenCalledWith({
        targets: target,
        scale: [1, 0.95, 1],
        backgroundColor: ['#dc2626', '#ef4444', '#dc2626'],
        duration: DURATIONS.fast,
        easing: GAME_EASINGS.sharp,
      });
    });
  });

  describe('screenShake', () => {
    it('should create shake animation with default intensity', () => {
      const target = document.createElement('div');
      screenShake(target);

      expect(animeMock).toHaveBeenCalledWith({
        targets: target,
        translateX: expect.any(Number),
        translateY: expect.any(Number),
        duration: DURATIONS.instant,
        easing: GAME_EASINGS.sharp,
        loop: 3,
        direction: 'alternate',
      });
    });

    it('should create shake animation with custom intensity', () => {
      const target = document.createElement('div');
      screenShake(target, 10);

      expect(animeMock.random).toHaveBeenCalledWith(-10, 10);
      expect(animeMock).toHaveBeenCalledWith({
        targets: target,
        translateX: expect.any(Number),
        translateY: expect.any(Number),
        duration: DURATIONS.instant,
        easing: GAME_EASINGS.sharp,
        loop: 3,
        direction: 'alternate',
      });
    });
  });

  describe('animateCharacterState', () => {
    it('should animate sleepy state', () => {
      const target = document.createElement('div');
      animateCharacterState(target, 'sleepy');

      expect(animeMock).toHaveBeenCalledWith({
        targets: target,
        scale: [1, 0.95],
        opacity: [1, 0.7],
        duration: DURATIONS.verySlow,
        direction: 'alternate',
        loop: true,
        easing: GAME_EASINGS.smooth,
      });
    });

    it('should animate normal state', () => {
      const target = document.createElement('div');
      animateCharacterState(target, 'normal');

      expect(animeMock).toHaveBeenCalledWith({
        targets: target,
        scale: 1,
        opacity: 1,
        duration: DURATIONS.normal,
        easing: GAME_EASINGS.smooth,
      });
    });

    it('should animate hyper state', () => {
      const target = document.createElement('div');
      animateCharacterState(target, 'hyper');

      expect(animeMock.random).toHaveBeenCalledWith(-5, 5);
      expect(animeMock).toHaveBeenCalledWith({
        targets: target,
        rotate: expect.any(Number),
        scale: [1, 1.05],
        duration: DURATIONS.fast,
        direction: 'alternate',
        loop: true,
        easing: GAME_EASINGS.bounce,
      });
    });
  });

  describe('animateDrinkConsumption', () => {
    it('should create timeline animation for drink consumption', () => {
      const mockTimeline = {
        add: vi.fn().mockReturnThis(),
      };
      animeMock.timeline.mockReturnValue(mockTimeline);

      const drinkElement = document.createElement('div');
      const targetElement = document.createElement('div');

      animateDrinkConsumption(drinkElement, targetElement);

      expect(animeMock.timeline).toHaveBeenCalledWith({
        easing: GAME_EASINGS.smooth,
      });

      expect(mockTimeline.add).toHaveBeenCalledWith({
        targets: drinkElement,
        scale: [1, 1.2, 0],
        opacity: [1, 1, 0],
        duration: DURATIONS.normal,
      });

      expect(mockTimeline.add).toHaveBeenCalledWith({
        targets: targetElement,
        scale: [1, 1.1, 1],
        duration: DURATIONS.fast,
      }, '-=200');
    });
  });

  describe('animatePowerUp', () => {
    it('should create power-up collection animation', () => {
      const target = document.createElement('div');
      animatePowerUp(target);

      expect(animeMock).toHaveBeenCalledWith({
        targets: target,
        scale: [0, 1.2, 1],
        rotate: '1turn',
        duration: DURATIONS.normal,
        easing: GAME_EASINGS.elastic,
      });
    });
  });

  describe('animateGameOver', () => {
    it('should create game over timeline animation', () => {
      const mockTimeline = {
        add: vi.fn().mockReturnThis(),
      };
      animeMock.timeline.mockReturnValue(mockTimeline);

      const target = document.createElement('div');

      animateGameOver(target);

      expect(animeMock.timeline).toHaveBeenCalledWith({
        easing: GAME_EASINGS.sharp,
      });

      expect(mockTimeline.add).toHaveBeenCalledWith({
        targets: target,
        scale: [1, 1.1],
        duration: DURATIONS.fast,
      });

      expect(mockTimeline.add).toHaveBeenCalledWith({
        targets: target,
        rotate: expect.any(Number),
        translateY: '100vh',
        duration: DURATIONS.slow,
        easing: GAME_EASINGS.overshoot,
      });
    });
  });

  describe('animateSuccess', () => {
    it('should animate success celebration for multiple targets', () => {
      const targets = [
        document.createElement('div'),
        document.createElement('div'),
      ];

      animateSuccess(targets);

      expect(animeMock).toHaveBeenCalledWith({
        targets,
        translateY: [0, -30, 0],
        scale: [1, 1.2, 1],
        rotate: expect.any(Array),
        delay: expect.any(Number),
        duration: DURATIONS.slow,
        easing: GAME_EASINGS.bounce,
      });

      expect(animeMock.stagger).toHaveBeenCalled();
    });
  });

  describe('createParticleExplosion', () => {
    it('should create particle elements and animate them', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      createParticleExplosion(container, 100, 200, 5);

      const particles = container.querySelectorAll('.absolute');
      expect(particles.length).toBe(5);

      expect(animeMock).toHaveBeenCalledWith({
        targets: expect.any(Array),
        translateX: expect.any(Function),
        translateY: expect.any(Function),
        scale: [1, 0],
        opacity: [1, 0],
        duration: DURATIONS.slow,
        easing: GAME_EASINGS.sharp,
        complete: expect.any(Function),
      });

      document.body.removeChild(container);
    });

    it('should position particles at specified coordinates', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      createParticleExplosion(container, 150, 250, 3);

      const particles = container.querySelectorAll('.absolute');
      particles.forEach(particle => {
        expect((particle as HTMLElement).style.left).toBe('150px');
        expect((particle as HTMLElement).style.top).toBe('250px');
      });

      document.body.removeChild(container);
    });

    it('should cleanup particles on animation complete', async () => {
      const mockAnimation = { complete: vi.fn() };
      animeMock.mockReturnValue(mockAnimation);

      const container = document.createElement('div');
      document.body.appendChild(container);

      createParticleExplosion(container, 100, 200, 3);

      const completeCallback = animeMock.mock.calls[0][0].complete;
      completeCallback();

      // Wait for requestAnimationFrame to complete
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          expect(container.children.length).toBe(0);
          document.body.removeChild(container);
          resolve();
        });
      });
    });

  });

  describe('cleanupAnimation', () => {
    it('should pause and remove animation targets', () => {
      const target1 = document.createElement('div');
      const target2 = document.createElement('div');
      const mockCleanupAnimation = {
        pause: vi.fn(),
        animatables: [
          { target: target1 },
          { target: target2 },
        ],
      };

      cleanupAnimation(mockCleanupAnimation as anime.AnimeInstance);

      expect(mockCleanupAnimation.pause).toHaveBeenCalled();
      expect(animeMock.remove).toHaveBeenCalledWith(target1);
      expect(animeMock.remove).toHaveBeenCalledWith(target2);
    });

    it('should handle null animation gracefully', () => {
      expect(() => cleanupAnimation(null)).not.toThrow();
    });

    it('should handle animation without animatables', () => {
      const mockCleanupAnimation = {
        pause: vi.fn(),
        animatables: undefined,
      };

      expect(() => cleanupAnimation(mockCleanupAnimation as anime.AnimeInstance)).not.toThrow();
      expect(mockCleanupAnimation.pause).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing anime library gracefully', () => {
      animeMock.mockImplementationOnce(() => null);

      const target = document.createElement('div');

      expect(() => animateCaffeineBar(target, 50, true)).not.toThrow();
      expect(() => animateHealthDamage(target)).not.toThrow();
      expect(() => screenShake(target)).not.toThrow();
    });

    it('should handle invalid targets gracefully', () => {
      expect(() => animateCaffeineBar(null as unknown as HTMLElement, 50, true)).not.toThrow();
      expect(() => animateHealthDamage(null as unknown as HTMLElement)).not.toThrow();
      expect(() => screenShake(null as unknown as HTMLElement)).not.toThrow();
    });

    it('should handle extreme values appropriately', () => {
      const target = document.createElement('div');

      expect(() => animateCaffeineBar(target, 0, true)).not.toThrow();
      expect(() => animateCaffeineBar(target, 100, false)).not.toThrow();
      expect(() => animateCaffeineBar(target, 150, false)).not.toThrow();

      expect(() => screenShake(target, 0)).not.toThrow();
      expect(() => screenShake(target, 1000)).not.toThrow();
    });
  });
});