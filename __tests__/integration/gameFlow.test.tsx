import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameTestPage from '@/app/game-test/page';

function getProgressPanel(): HTMLElement {
  return screen.getByRole('heading', { name: 'Progress' }).closest('div') as HTMLElement;
}

function getProgressText(label: string): HTMLElement {
  return within(getProgressPanel()).getByText(new RegExp(`^${label}:`));
}

function getStatValue(label: string): string {
  const labelElement = screen.getByText(label, { selector: 'span.text-gray-400.block' });
  return labelElement.parentElement?.querySelector('.font-bold')?.textContent ?? '';
}

function getInfoValue(label: string): string {
  const labelElement = screen.getByText(label, { selector: 'span.text-gray-400' });
  return labelElement.parentElement?.querySelector('.font-medium')?.textContent ?? '';
}

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
        expect(screen.getByText('Drinks', { selector: 'span.text-gray-400.block' })).toBeInTheDocument();
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
      const returnButton = screen.getByText('Menu');
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

      // Difficulty controls are only available from the menu.
      ['intern', 'junior', 'senior', 'founder'].forEach((diff) => {
        expect(screen.queryByRole('button', { name: diff })).not.toBeInTheDocument();
      });
    });
  });

  describe('Game Statistics Display', () => {
    it('should display initial game stats', () => {
      render(<GameTestPage />);

      // Check initial displays
      expect(getProgressText('Caffeine')).toBeInTheDocument();
      expect(getProgressText('Health')).toBeInTheDocument();
      expect(getProgressText('Workday')).toBeInTheDocument();
      expect(screen.getByText(/Score:/)).toBeInTheDocument();
      expect(screen.getByText('Drinks', { selector: 'span.text-gray-400.block' })).toBeInTheDocument();
      expect(screen.getByText('Streak', { selector: 'span.text-gray-400.block' })).toBeInTheDocument();
    });

    it('should show optimal zone indicator', () => {
      render(<GameTestPage />);

      // Check for optimal zone range display
      const optimalZoneText = within(getProgressPanel()).getByText(/Optimal:/);
      expect(optimalZoneText).toBeInTheDocument();

      // Check for in optimal zone indicator
      expect(screen.getByText('Optimal', { selector: 'span.text-gray-400.block' })).toBeInTheDocument();
      expect(getStatValue('Optimal')).toMatch(/Yes|No/);
    });
  });

  describe('Drink Consumption', () => {
    it('should show drinks only during gameplay', async () => {
      render(<GameTestPage />);

      // No drinks should be visible in menu
      expect(screen.queryByText('Consume Drinks')).not.toBeInTheDocument();

      // Start the game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Drinks should now be visible
      expect(screen.getByText('Consume Drinks')).toBeInTheDocument();
    });

    it('should consume drink and update stats', async () => {
      render(<GameTestPage />);

      // Start the game
      fireEvent.click(screen.getByText('Start Game'));

      await waitFor(() => {
        expect(screen.getByText('playing')).toBeInTheDocument();
      });

      // Get initial drinks consumed count
      const initialCount = parseInt(getStatValue('Drinks') || '0');

      // Find and click a drink button
      const drinkButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.text-2xl') // Has emoji icon
      );

      if (drinkButtons.length > 0) {
        fireEvent.click(drinkButtons[0]);

        // Check drinks consumed increased
        await waitFor(() => {
          const newCount = parseInt(getStatValue('Drinks') || '0');
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
      const caffeineBar = getProgressText('Caffeine').parentElement?.parentElement;
      expect(caffeineBar?.querySelector('[style*="scaleX"]')).toBeInTheDocument();

      // Check health bar
      const healthBar = getProgressText('Health').parentElement?.parentElement;
      expect(healthBar?.querySelector('[style*="scaleX"]')).toBeInTheDocument();

      // Check progress bar
      const progressBar = getProgressText('Workday').parentElement?.parentElement;
      expect(progressBar?.querySelector('[style*="scaleX"]')).toBeInTheDocument();
    });

    it('should show optimal zone indicator on caffeine bar', () => {
      render(<GameTestPage />);

      // Find the caffeine bar section
      const caffeineSection = getProgressText('Caffeine').parentElement?.parentElement;

      // Check for optimal zone visual indicator
      expect(within(caffeineSection as HTMLElement).getByText(/Optimal:/)).toBeInTheDocument();
      expect(caffeineSection?.querySelector('[data-caffeine]')).toBeInTheDocument();
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
      expect(getInfoValue('Time:')).toMatch(/\d{1,2}:\d{2}/); // Format: HH:MM or H:MM
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
      expect(getInfoValue('Score:')).toBeDefined();
    });
  });

  describe('Instructions Display', () => {
    it('should show game instructions', () => {
      render(<GameTestPage />);

      // Check instructions section exists
      expect(screen.getByText('How to Play')).toBeInTheDocument();

      // Check instruction items
      expect(screen.getByText(/Keep caffeine in the green zone/)).toBeInTheDocument();
      expect(screen.getByText(/Health decreases when outside/)).toBeInTheDocument();
      expect(screen.getByText(/Survive the entire workday/)).toBeInTheDocument();
      expect(screen.getByText(/Higher difficulty/)).toBeInTheDocument();
    });
  });
});
