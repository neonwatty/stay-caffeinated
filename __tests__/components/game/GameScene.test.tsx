import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameScene } from '@/components/game/play/GameScene';

const mockGameState = vi.hoisted(() => ({
  value: {
    caffeinePercentage: 55,
    healthPercentage: 80,
    stats: {
      score: 1200,
      streak: 4,
      drinksConsumed: 2,
      isInOptimalZone: true,
    },
    timeProgress: 25,
    formattedTime: '10:00 AM',
    optimalZoneRange: { min: 30, max: 70 },
    isPlaying: true,
  },
}));

vi.mock('@/contexts/GameContext', () => ({
  useGame: () => ({
    consumeDrink: vi.fn(),
    healHealth: vi.fn(),
    pauseGame: vi.fn(),
  }),
}));

vi.mock('@/hooks/useGameState', () => ({
  useGameState: () => mockGameState.value,
}));

vi.mock('@/hooks/useDrinkCooldown', () => ({
  useDrinkCooldown: () => ({
    startCooldown: vi.fn(),
  }),
}));

vi.mock('@/components/game/environment/WorkspaceBackgroundSVG', () => ({
  WorkspaceBackgroundSVG: () => <div data-testid="workspace-background" />,
}));

vi.mock('@/components/game/SpriteCharacter', () => ({
  SpriteCharacter: ({ caffeineLevel }: { caffeineLevel: number }) => (
    <div data-testid="sprite-office-worker">Sprite worker at {caffeineLevel}%</div>
  ),
}));

vi.mock('@/components/game/CoffeeCupSVG', () => ({
  CoffeeCupSVG: () => <div data-testid="coffee-cup" />,
}));

vi.mock('@/components/game/screens/EventBannerSVG', () => ({
  EventBannerSVG: () => <div data-testid="event-banner" />,
}));

vi.mock('@/components/game/play/GameHUD', () => ({
  GameHUD: () => <div data-testid="game-hud" />,
}));

vi.mock('@/components/game/play/DrinkToolbar', () => ({
  DrinkToolbar: ({ strategyContext }: { strategyContext: { nextEventTitle?: string } }) => (
    <div data-testid="drink-toolbar">Toolbar for {strategyContext.nextEventTitle}</div>
  ),
}));

describe('GameScene', () => {
  beforeEach(() => {
    mockGameState.value = {
      caffeinePercentage: 55,
      healthPercentage: 80,
      stats: {
        score: 1200,
        streak: 4,
        drinksConsumed: 2,
        isInOptimalZone: true,
      },
      timeProgress: 25,
      formattedTime: '10:00 AM',
      optimalZoneRange: { min: 30, max: 70 },
      isPlaying: true,
    };
  });

  it('uses the sprite-backed office worker during play', () => {
    render(<GameScene character="officeWorker" />);

    expect(screen.getByTestId('sprite-office-worker')).toHaveTextContent('55%');
  });

  it('shows upcoming-event strategy context before an event fires', () => {
    mockGameState.value = {
      ...mockGameState.value,
      timeProgress: 10,
    };

    render(<GameScene character="officeWorker" />);

    expect(screen.getByTestId('strategy-panel')).toBeVisible();
    expect(screen.getByTestId('shift-status')).toHaveTextContent('10:00 AM');
    expect(screen.getByTestId('caffeine-status')).toHaveTextContent('Green zone');
    expect(screen.getByTestId('caffeine-status')).toHaveTextContent('Health 80%');
    expect(screen.getByTestId('upcoming-event')).toHaveTextContent('Code Review');
    expect(screen.getByTestId('upcoming-event')).toHaveTextContent('Pre-load caffeine');
    expect(screen.getByTestId('active-event-status')).toHaveTextContent('Morning Meeting');
    expect(screen.getByTestId('active-event-status')).toHaveTextContent('Checkpoint active');
    expect(screen.getByTestId('drink-toolbar')).toHaveTextContent('Code Review');
  });
});
