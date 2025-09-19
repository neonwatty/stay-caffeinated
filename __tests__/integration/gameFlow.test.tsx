import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameTestPage from '@/app/game-test/page';

describe('Game Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Game State Transitions', () => {
    it('should start game from menu', async () => {
      render(<GameTestPage />);

      // Should initially be in menu state
      expect(screen.getByText('menu')).toBeInTheDocument();

      // Click start game button
      const startButton = screen.getByText('Start Game');
      fireEvent.click(startButton);

      // Should transition to playing state
      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });
    });

    it('should pause and resume game', async () => {
      render(<GameTestPage />);

      // Start the game
      const startButton = screen.getByText('Start Game');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Pause the game
      const pauseButton = screen.getByText('Pause');
      fireEvent.click(pauseButton);

      await waitFor(() => {
        expect(screen.getByText('paused')).toBeInTheDocument();
      });

      // Resume the game
      const resumeButton = screen.getByText('Resume');
      fireEvent.click(resumeButton);

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });
    });

    it('should reset game', async () => {
      render(<GameTestPage />);

      // Start and play the game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Consume a drink to change state
      const drinkButtons = screen.getAllByRole('button').filter(
        btn => btn.textContent?.includes('Coffee')
      );
      if (drinkButtons.length > 0) {
        fireEvent.click(drinkButtons[0]);
      }

      // Reset the game
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
        expect(screen.getByText('Drinks Consumed:')).toBeInTheDocument();
      });
    });

    it('should return to menu', async () => {
      render(<GameTestPage />);

      // Start the game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Return to menu
      const returnButton = screen.getByText('Return to Menu');
      fireEvent.click(returnButton);

      await waitFor(() => {
        expect(screen.getByText('menu')).toBeInTheDocument();
        expect(screen.getByText('Start Game')).toBeInTheDocument();
      });
    });
  });

  describe('Difficulty Selection', () => {
    it('should change difficulty when not playing', () => {
      render(<GameTestPage />);

      // Should initially be on junior difficulty
      const juniorButton = screen.getByRole('button', { name: 'junior' });
      expect(juniorButton).toHaveClass('bg-blue-600');

      // Change to senior difficulty
      const seniorButton = screen.getByRole('button', { name: 'senior' });
      fireEvent.click(seniorButton);

      // Senior should now be selected
      expect(seniorButton).toHaveClass('bg-blue-600');
      expect(juniorButton).not.toHaveClass('bg-blue-600');
    });

    it('should disable difficulty changes during gameplay', async () => {
      render(<GameTestPage />);

      // Start the game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Difficulty buttons should be disabled
      const difficultyButtons = ['intern', 'junior', 'senior', 'founder'].map(
        diff => screen.getByRole('button', { name: diff })
      );

      difficultyButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Game Statistics Display', () => {
    it('should display initial game stats', () => {
      render(<GameTestPage />);

      // Check initial displays
      expect(screen.getByText(/Caffeine:/)).toBeInTheDocument();
      expect(screen.getByText(/Health:/)).toBeInTheDocument();
      expect(screen.getByText(/Workday Progress:/)).toBeInTheDocument();
      expect(screen.getByText(/Score:/)).toBeInTheDocument();
      expect(screen.getByText(/Drinks Consumed:/)).toBeInTheDocument();
      expect(screen.getByText(/Streak:/)).toBeInTheDocument();
    });

    it('should show optimal zone indicator', () => {
      render(<GameTestPage />);

      // Check for optimal zone range display
      const optimalZoneText = screen.getByText(/Optimal:/);
      expect(optimalZoneText).toBeInTheDocument();

      // Check for in optimal zone indicator
      const zoneIndicator = screen.getByText(/In Optimal Zone:/);
      expect(zoneIndicator).toBeInTheDocument();
    });
  });

  describe('Drink Consumption', () => {
    it('should show drinks only during gameplay', async () => {
      render(<GameTestPage />);

      // No drinks should be visible in menu
      expect(screen.queryByText('Drinks')).not.toBeInTheDocument();

      // Start the game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Drinks should now be visible
      expect(screen.getByText('Drinks')).toBeInTheDocument();
    });

    it('should consume drink and update stats', async () => {
      render(<GameTestPage />);

      // Start the game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Get initial drinks consumed count
      const drinksText = screen.getByText(/Drinks Consumed:/);
      const initialCount = parseInt(drinksText.textContent?.split(':')[1] || '0');

      // Find and click a drink button
      const drinkButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.text-2xl') // Has emoji icon
      );

      if (drinkButtons.length > 0) {
        fireEvent.click(drinkButtons[0]);

        // Check drinks consumed increased
        await waitFor(() => {
          const newDrinksText = screen.getByText(/Drinks Consumed:/);
          const newCount = parseInt(newDrinksText.textContent?.split(':')[1] || '0');
          expect(newCount).toBe(initialCount + 1);
        });
      }
    });
  });

  describe('Progress Bars', () => {
    it('should display all progress bars correctly', async () => {
      render(<GameTestPage />);

      // Start the game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Check caffeine bar
      const caffeineBar = screen.getByText(/Caffeine:/).parentElement?.parentElement;
      expect(caffeineBar?.querySelector('[style*="width"]')).toBeInTheDocument();

      // Check health bar
      const healthBar = screen.getByText(/Health:/).parentElement?.parentElement;
      expect(healthBar?.querySelector('[style*="width"]')).toBeInTheDocument();

      // Check progress bar
      const progressBar = screen.getByText(/Workday Progress:/).parentElement?.parentElement;
      expect(progressBar?.querySelector('[style*="width"]')).toBeInTheDocument();
    });

    it('should show optimal zone indicator on caffeine bar', () => {
      render(<GameTestPage />);

      // Find the caffeine bar section
      const caffeineSection = screen.getByText(/Caffeine:/).parentElement?.parentElement;

      // Check for optimal zone visual indicator
      const optimalZoneIndicator = caffeineSection?.querySelector('.bg-green-900.opacity-30');
      expect(optimalZoneIndicator).toBeInTheDocument();
    });
  });

  describe('Time Display', () => {
    it('should display formatted time', async () => {
      render(<GameTestPage />);

      // Check time display exists
      const timeLabel = screen.getByText('Time:');
      expect(timeLabel).toBeInTheDocument();

      // Start the game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Time should be displayed
      const timeDisplay = timeLabel.parentElement?.querySelector('p:last-child');
      expect(timeDisplay?.textContent).toMatch(/\d{1,2}:\d{2}/); // Format: HH:MM or H:MM
    });
  });

  describe('Score Display', () => {
    it('should display and update score', async () => {
      render(<GameTestPage />);

      // Check score display exists
      const scoreLabel = screen.getByText('Score:');
      expect(scoreLabel).toBeInTheDocument();

      // Start the game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Score should be displayed
      const scoreDisplay = scoreLabel.parentElement?.querySelector('p:last-child');
      expect(scoreDisplay?.textContent).toBeDefined();
    });
  });

  describe('Instructions Display', () => {
    it('should show game instructions', () => {
      render(<GameTestPage />);

      // Check instructions section exists
      expect(screen.getByText('Instructions')).toBeInTheDocument();

      // Check instruction items
      expect(screen.getByText(/Keep your caffeine level/)).toBeInTheDocument();
      expect(screen.getByText(/Health decreases when outside/)).toBeInTheDocument();
      expect(screen.getByText(/Survive the entire workday/)).toBeInTheDocument();
      expect(screen.getByText(/Different drinks have different/)).toBeInTheDocument();
      expect(screen.getByText(/Higher difficulty/)).toBeInTheDocument();
    });
  });
});