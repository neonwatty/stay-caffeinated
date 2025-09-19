/**
 * Tests for End Game Animations
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EndGameAnimations, EndGameModal } from '../EndGameAnimations';

// Mock anime.js
vi.mock('@/lib/anime', () => {
  const mockTimeline = {
    add: vi.fn().mockReturnThis(),
    pause: vi.fn(),
  };

  const mockAnime = vi.fn((options: any) => ({
    pause: vi.fn(),
    play: vi.fn(),
    restart: vi.fn(),
    finished: Promise.resolve(),
  }));

  mockAnime.timeline = vi.fn(() => mockTimeline);
  mockAnime.stagger = vi.fn(() => 0);
  mockAnime.random = vi.fn((min: number, max: number) => (min + max) / 2);

  return {
    default: mockAnime,
  };
});

describe('EndGameAnimations', () => {
  let onAnimationComplete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    onAnimationComplete = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should not render when outcome is null', () => {
      const { container } = render(
        <EndGameAnimations
          outcome={null}
          onAnimationComplete={onAnimationComplete}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render victory animation when outcome is victory', async () => {
      await act(async () => {
        const { container } = render(
          <EndGameAnimations
            outcome="victory"
            finalStats={{
              score: 10000,
              timeElapsed: 300,
              drinksConsumed: 5,
              streak: 60,
            }}
            onAnimationComplete={onAnimationComplete}
          />
        );
      });

      expect(screen.getByText('VICTORY!')).toBeInTheDocument();
      expect(screen.getByText('You survived the workday!')).toBeInTheDocument();
    });

    it('should render pass out animation when outcome is passOut', async () => {
      await act(async () => {
        render(
          <EndGameAnimations
            outcome="passOut"
            onAnimationComplete={onAnimationComplete}
          />
        );
      });

      expect(screen.getByText('YOU PASSED OUT')).toBeInTheDocument();
      expect(screen.getByText('Too little caffeine...')).toBeInTheDocument();
    });

    it('should render explosion animation when outcome is explosion', async () => {
      await act(async () => {
        render(
          <EndGameAnimations
            outcome="explosion"
            onAnimationComplete={onAnimationComplete}
          />
        );
      });

      expect(screen.getByText('BOOM!')).toBeInTheDocument();
      expect(screen.getByText('Too much caffeine!')).toBeInTheDocument();
    });
  });

  describe('Victory Animation', () => {
    it('should display final stats', async () => {
      const stats = {
        score: 12345,
        timeElapsed: 180,
        drinksConsumed: 8,
        streak: 45,
      };

      await act(async () => {
        render(
          <EndGameAnimations
            outcome="victory"
            finalStats={stats}
            onAnimationComplete={onAnimationComplete}
          />
        );
      });

      expect(screen.getByText('12,345')).toBeInTheDocument();
      expect(screen.getByText('3:00')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('45s')).toBeInTheDocument();
    });

    it('should create confetti particles', async () => {
      const { container } = render(
        <EndGameAnimations
          outcome="victory"
          onAnimationComplete={onAnimationComplete}
        />
      );

      // Check for confetti elements (they're created dynamically)
      await act(async () => {
        vi.advanceTimersByTime(100);
      });
      const confetti = container.querySelectorAll('.absolute.w-2.h-3.rounded-sm');
      expect(confetti.length).toBeGreaterThan(0);
    });
  });

  describe('Animation Callbacks', () => {
    it('should call onAnimationComplete after animation', async () => {
      await act(async () => {
        render(
          <EndGameAnimations
            outcome="victory"
            onAnimationComplete={onAnimationComplete}
          />
        );
      });

      // Advance timers to trigger completion
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(onAnimationComplete).toHaveBeenCalled();
    });

    it('should handle outcome changes', async () => {
      const { rerender } = render(
        <EndGameAnimations
          outcome={null}
          onAnimationComplete={onAnimationComplete}
        />
      );

      // Change to victory
      await act(async () => {
        rerender(
          <EndGameAnimations
            outcome="victory"
            onAnimationComplete={onAnimationComplete}
          />
        );
      });

      expect(screen.getByText('VICTORY!')).toBeInTheDocument();

      // Clean up the DOM to test a fresh render with explosion
      let unmount: () => void;
      await act(async () => {
        const result = render(
          <EndGameAnimations
            outcome="explosion"
            onAnimationComplete={onAnimationComplete}
          />
        );
        unmount = result.unmount;
      });

      // Should render explosion animation
      expect(screen.getByText('BOOM!')).toBeInTheDocument();

      unmount!();
    });
  });

  describe('Pass Out Animation', () => {
    it('should create eyelid elements', async () => {
      let container: HTMLElement;
      await act(async () => {
        const result = render(
          <EndGameAnimations
            outcome="passOut"
            onAnimationComplete={onAnimationComplete}
          />
        );
        container = result.container;
      });

      const eyelids = container!.querySelectorAll('.absolute.bg-black');
      expect(eyelids.length).toBeGreaterThanOrEqual(2);
    });

    it('should have blur overlay', async () => {
      let container: HTMLElement;
      await act(async () => {
        const result = render(
          <EndGameAnimations
            outcome="passOut"
            onAnimationComplete={onAnimationComplete}
          />
        );
        container = result.container;
      });

      const blurOverlay = container!.querySelector('.backdrop-blur-md');
      expect(blurOverlay).toBeInTheDocument();
    });
  });

  describe('Explosion Animation', () => {
    it('should create explosion particles', async () => {
      let container: HTMLElement;
      await act(async () => {
        const result = render(
          <EndGameAnimations
            outcome="explosion"
            onAnimationComplete={onAnimationComplete}
          />
        );
        container = result.container;
      });

      // Advance timer to allow particle creation
      await act(async () => {
        vi.advanceTimersByTime(100);
      });
      const particles = container!.querySelectorAll('.absolute.w-4.h-4.rounded-full');
      expect(particles.length).toBeGreaterThan(0);
    });

    it('should have flash overlay', async () => {
      let container: HTMLElement;
      await act(async () => {
        const result = render(
          <EndGameAnimations
            outcome="explosion"
            onAnimationComplete={onAnimationComplete}
          />
        );
        container = result.container;
      });

      const flashOverlay = container!.querySelector('.absolute.inset-0.bg-white');
      expect(flashOverlay).toBeInTheDocument();
    });
  });
});

describe('EndGameModal', () => {
  let onRestart: ReturnType<typeof vi.fn>;
  let onMainMenu: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onRestart = vi.fn();
    onMainMenu = vi.fn();
  });

  const defaultStats = {
    score: 5000,
    timeElapsed: 240,
    drinksConsumed: 6,
    streak: 30,
  };

  describe('Modal Display', () => {
    it('should not render when closed', () => {
      const { container } = render(
        <EndGameModal
          isOpen={false}
          outcome="victory"
          stats={defaultStats}
          onRestart={onRestart}
          onMainMenu={onMainMenu}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when open', () => {
      render(
        <EndGameModal
          isOpen={true}
          outcome="victory"
          stats={defaultStats}
          onRestart={onRestart}
          onMainMenu={onMainMenu}
        />
      );

      expect(screen.getByText('Victory!')).toBeInTheDocument();
    });
  });

  describe('Outcome Messages', () => {
    it('should show victory message', () => {
      render(
        <EndGameModal
          isOpen={true}
          outcome="victory"
          stats={defaultStats}
          onRestart={onRestart}
          onMainMenu={onMainMenu}
        />
      );

      expect(screen.getByText('Victory!')).toBeInTheDocument();
      expect(screen.getByText('Congratulations! You made it through the day!')).toBeInTheDocument();
    });

    it('should show pass out message', () => {
      render(
        <EndGameModal
          isOpen={true}
          outcome="passOut"
          stats={defaultStats}
          onRestart={onRestart}
          onMainMenu={onMainMenu}
        />
      );

      expect(screen.getByText('Game Over')).toBeInTheDocument();
      expect(screen.getByText('You ran out of energy and passed out.')).toBeInTheDocument();
    });

    it('should show explosion message', () => {
      render(
        <EndGameModal
          isOpen={true}
          outcome="explosion"
          stats={defaultStats}
          onRestart={onRestart}
          onMainMenu={onMainMenu}
        />
      );

      expect(screen.getByText('Game Over')).toBeInTheDocument();
      expect(screen.getByText('You had way too much caffeine!')).toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    it('should display all stats correctly', () => {
      render(
        <EndGameModal
          isOpen={true}
          outcome="victory"
          stats={defaultStats}
          onRestart={onRestart}
          onMainMenu={onMainMenu}
        />
      );

      expect(screen.getByText('5,000')).toBeInTheDocument(); // Score
      expect(screen.getByText('4:00')).toBeInTheDocument(); // Time (240 seconds)
      expect(screen.getByText('6')).toBeInTheDocument(); // Drinks
      expect(screen.getByText('30s')).toBeInTheDocument(); // Streak
    });
  });

  describe('Button Interactions', () => {
    it('should call onRestart when Try Again is clicked', () => {
      render(
        <EndGameModal
          isOpen={true}
          outcome="victory"
          stats={defaultStats}
          onRestart={onRestart}
          onMainMenu={onMainMenu}
        />
      );

      fireEvent.click(screen.getByText('Try Again'));
      expect(onRestart).toHaveBeenCalledTimes(1);
    });

    it('should call onMainMenu when Main Menu is clicked', () => {
      render(
        <EndGameModal
          isOpen={true}
          outcome="victory"
          stats={defaultStats}
          onRestart={onRestart}
          onMainMenu={onMainMenu}
        />
      );

      fireEvent.click(screen.getByText('Main Menu'));
      expect(onMainMenu).toHaveBeenCalledTimes(1);
    });
  });

  describe('Styling', () => {
    it('should apply correct color for victory', () => {
      render(
        <EndGameModal
          isOpen={true}
          outcome="victory"
          stats={defaultStats}
          onRestart={onRestart}
          onMainMenu={onMainMenu}
        />
      );

      const title = screen.getByText('Victory!');
      expect(title).toHaveClass('text-green-400');
    });

    it('should apply correct color for pass out', () => {
      render(
        <EndGameModal
          isOpen={true}
          outcome="passOut"
          stats={defaultStats}
          onRestart={onRestart}
          onMainMenu={onMainMenu}
        />
      );

      const title = screen.getByText('Game Over');
      expect(title).toHaveClass('text-gray-400');
    });

    it('should apply correct color for explosion', () => {
      render(
        <EndGameModal
          isOpen={true}
          outcome="explosion"
          stats={defaultStats}
          onRestart={onRestart}
          onMainMenu={onMainMenu}
        />
      );

      const title = screen.getByText('Game Over');
      expect(title).toHaveClass('text-red-400');
    });
  });
});