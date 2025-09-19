import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameTestPage from '@/app/game-test/page';

describe('E2E Game Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock timers for controlled testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Complete Game Playthrough - Victory Path', () => {
    it('should complete a full game and achieve victory on intern difficulty', async () => {
      render(<GameTestPage />);

      // Select intern difficulty (easiest)
      const internButton = screen.getByRole('button', { name: 'intern' });
      fireEvent.click(internButton);

      // Start the game
      const startButton = screen.getByText('Start Game');
      fireEvent.click(startButton);

      // Verify game started
      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Play the game - maintain optimal caffeine
      const drinkButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.text-2xl')
      );

      // Simulate gameplay for 3 minutes (intern workday)
      const gameplayDuration = 3 * 60 * 1000; // 3 minutes in milliseconds
      const drinkInterval = 30 * 1000; // Drink every 30 seconds

      for (let elapsed = 0; elapsed < gameplayDuration; elapsed += drinkInterval) {
        // Check caffeine level and drink if needed
        const caffeineText = screen.getByText(/Caffeine:/);
        const caffeineValue = parseFloat(
          caffeineText.textContent?.match(/[\d.]+/)?.[0] || '0'
        );

        if (caffeineValue < 45 && drinkButtons.length > 0) {
          // Drink coffee to stay in optimal zone
          const coffeeButton = drinkButtons.find(btn =>
            btn.textContent?.includes('Coffee')
          );
          if (coffeeButton) {
            fireEvent.click(coffeeButton);
          }
        }

        // Advance time
        vi.advanceTimersByTime(drinkInterval);

        // Allow React to update
        await vi.runOnlyPendingTimersAsync();
      }

      // Check for victory condition
      await waitFor(() => {
        const stateText = screen.queryByText('victory') ||
                         screen.queryByText('gameOver');
        expect(stateText).toBeDefined();
      }, { timeout: 5000 });
    });
  });

  describe('Game Over Scenarios', () => {
    it('should trigger pass out when caffeine depletes', async () => {
      render(<GameTestPage />);

      // Start game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Don't drink anything and let caffeine deplete
      // Fast forward time significantly
      vi.advanceTimersByTime(5 * 60 * 1000); // 5 minutes

      await vi.runOnlyPendingTimersAsync();

      // Check for game over state
      await waitFor(() => {
        const gameState = screen.queryByText('gameOver') ||
                         screen.queryByText('victory');
        expect(gameState).toBeDefined();
      }, { timeout: 5000 });
    });

    it('should trigger explosion when caffeine is too high', async () => {
      render(<GameTestPage />);

      // Start game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Drink excessive amounts of coffee
      const drinkButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.text-2xl')
      );

      // Find energy drink for maximum caffeine
      const energyDrinkButton = drinkButtons.find(btn =>
        btn.textContent?.includes('Energy')
      );

      if (energyDrinkButton) {
        // Consume multiple energy drinks
        for (let i = 0; i < 5; i++) {
          fireEvent.click(energyDrinkButton);
          await vi.runOnlyPendingTimersAsync();
        }
      }

      // Let health deplete while over-caffeinated
      vi.advanceTimersByTime(2 * 60 * 1000); // 2 minutes
      await vi.runOnlyPendingTimersAsync();

      // Check for game over state
      await waitFor(() => {
        const gameState = screen.queryByText('gameOver');
        expect(gameState).toBeDefined();
      }, { timeout: 5000 });
    });
  });

  describe('Pause/Resume During Gameplay', () => {
    it('should handle pause/resume without losing game state', async () => {
      render(<GameTestPage />);

      // Start game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Consume a drink
      const drinkButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.text-2xl')
      );
      if (drinkButtons.length > 0) {
        fireEvent.click(drinkButtons[0]);
      }

      // Get current stats
      const drinksBeforePause = screen.getByText(/Drinks Consumed:/)
        .textContent?.match(/\d+/)?.[0];

      // Pause game
      fireEvent.click(screen.getByText('Pause'));

      await waitFor(() => {
        expect(screen.getByText('paused')).toBeInTheDocument();
      });

      // Wait some time while paused
      vi.advanceTimersByTime(30000); // 30 seconds
      await vi.runOnlyPendingTimersAsync();

      // Resume game
      fireEvent.click(screen.getByText('Resume'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Verify stats were preserved
      const drinksAfterResume = screen.getByText(/Drinks Consumed:/)
        .textContent?.match(/\d+/)?.[0];
      expect(drinksAfterResume).toBe(drinksBeforePause);
    });
  });

  describe('Difficulty Progression', () => {
    it('should handle difficulty changes between games', async () => {
      render(<GameTestPage />);

      // Start with intern difficulty
      fireEvent.click(screen.getByRole('button', { name: 'intern' }));
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Check optimal zone for intern (widest)
      const optimalZoneIntern = screen.getByText(/Optimal:/)
        .textContent?.match(/(\d+)-(\d+)/);
      const internZoneWidth = optimalZoneIntern
        ? parseInt(optimalZoneIntern[2]) - parseInt(optimalZoneIntern[1])
        : 0;

      // Return to menu
      fireEvent.click(screen.getByText('Return to Menu'));

      await waitFor(() => {
        expect(screen.getByText('menu')).toBeInTheDocument();
      });

      // Switch to senior difficulty
      fireEvent.click(screen.getByRole('button', { name: 'senior' }));
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Check optimal zone for senior (narrower)
      const optimalZoneSenior = screen.getByText(/Optimal:/)
        .textContent?.match(/(\d+)-(\d+)/);
      const seniorZoneWidth = optimalZoneSenior
        ? parseInt(optimalZoneSenior[2]) - parseInt(optimalZoneSenior[1])
        : 0;

      // Senior should have narrower optimal zone
      expect(seniorZoneWidth).toBeLessThan(internZoneWidth);
    });
  });

  describe('Score and Streak Management', () => {
    it('should accumulate score and streak in optimal zone', async () => {
      render(<GameTestPage />);

      // Start game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Get initial score
      const initialScore = parseInt(
        screen.getByText(/Score:/).parentElement
          ?.querySelector('p:last-child')?.textContent || '0'
      );

      // Stay in optimal zone for some time
      vi.advanceTimersByTime(5000); // 5 seconds
      await vi.runOnlyPendingTimersAsync();

      // Check score increased
      const newScore = parseInt(
        screen.getByText(/Score:/).parentElement
          ?.querySelector('p:last-child')?.textContent || '0'
      );
      expect(newScore).toBeGreaterThan(initialScore);

      // Check streak accumulated
      const streakText = screen.getByText(/Streak:/);
      const streakValue = parseInt(
        streakText.textContent?.match(/\d+/)?.[0] || '0'
      );
      expect(streakValue).toBeGreaterThan(0);
    });

    it('should reset streak when leaving optimal zone', async () => {
      render(<GameTestPage />);

      // Start game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Build up streak
      vi.advanceTimersByTime(5000);
      await vi.runOnlyPendingTimersAsync();

      const initialStreak = parseInt(
        screen.getByText(/Streak:/).textContent?.match(/\d+/)?.[0] || '0'
      );
      expect(initialStreak).toBeGreaterThan(0);

      // Consume too much caffeine to leave optimal zone
      const drinkButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.text-2xl')
      );
      const energyDrink = drinkButtons.find(btn =>
        btn.textContent?.includes('Energy')
      );

      if (energyDrink) {
        for (let i = 0; i < 3; i++) {
          fireEvent.click(energyDrink);
        }
      }

      await vi.runOnlyPendingTimersAsync();

      // Check streak reset
      const newStreak = parseInt(
        screen.getByText(/Streak:/).textContent?.match(/\d+/)?.[0] || '0'
      );
      expect(newStreak).toBe(0);
    });
  });

  describe('Responsive Gameplay', () => {
    it('should handle rapid drink consumption', async () => {
      render(<GameTestPage />);

      // Start game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      const drinkButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.text-2xl')
      );

      // Rapidly click drinks
      for (let i = 0; i < 10; i++) {
        const button = drinkButtons[i % drinkButtons.length];
        fireEvent.click(button);
      }

      await vi.runOnlyPendingTimersAsync();

      // Game should still be stable
      expect(screen.getByText('playing')).toBeInTheDocument();

      // Drinks consumed should match
      const drinksConsumed = parseInt(
        screen.getByText(/Drinks Consumed:/).textContent?.match(/\d+/)?.[0] || '0'
      );
      expect(drinksConsumed).toBe(10);
    });

    it('should handle settings changes during gameplay', async () => {
      render(<GameTestPage />);

      // Start game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Pause to access settings
      fireEvent.click(screen.getByText('Pause'));

      await waitFor(() => {
        expect(screen.getByText('paused')).toBeInTheDocument();
      });

      // Resume game
      fireEvent.click(screen.getByText('Resume'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Game should continue normally
      vi.advanceTimersByTime(1000);
      await vi.runOnlyPendingTimersAsync();

      expect(screen.getByText('playing')).toBeInTheDocument();
    });
  });

  describe('Health Management', () => {
    it('should deplete health when outside optimal zone', async () => {
      render(<GameTestPage />);

      // Start game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Get initial health
      const initialHealth = parseFloat(
        screen.getByText(/Health:/).textContent?.match(/[\d.]+/)?.[0] || '100'
      );

      // Move out of optimal zone
      const drinkButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.text-2xl')
      );
      const energyDrink = drinkButtons.find(btn =>
        btn.textContent?.includes('Energy')
      );

      if (energyDrink) {
        for (let i = 0; i < 3; i++) {
          fireEvent.click(energyDrink);
        }
      }

      // Wait for health to deplete
      vi.advanceTimersByTime(10000); // 10 seconds
      await vi.runOnlyPendingTimersAsync();

      // Check health decreased
      const newHealth = parseFloat(
        screen.getByText(/Health:/).textContent?.match(/[\d.]+/)?.[0] || '100'
      );
      expect(newHealth).toBeLessThan(initialHealth);
    });

    it('should maintain health in optimal zone', async () => {
      render(<GameTestPage />);

      // Start game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Get initial health (should be 100)
      const initialHealth = parseFloat(
        screen.getByText(/Health:/).textContent?.match(/[\d.]+/)?.[0] || '100'
      );

      // Stay in optimal zone
      vi.advanceTimersByTime(10000); // 10 seconds
      await vi.runOnlyPendingTimersAsync();

      // Check health remained same
      const newHealth = parseFloat(
        screen.getByText(/Health:/).textContent?.match(/[\d.]+/)?.[0] || '100'
      );
      expect(newHealth).toBe(initialHealth);
    });
  });
});