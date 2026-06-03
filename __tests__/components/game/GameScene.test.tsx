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

vi.mock('@/components/game/OfficeWorkerSVG', () => ({
  OfficeWorkerSVG: ({ caffeineLevel }: { caffeineLevel: number }) => (
    <div data-testid="office-worker">Office worker at {caffeineLevel}%</div>
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
  DrinkToolbar: () => <div data-testid="drink-toolbar" />,
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

  it('shows the tripped-out overlay for extreme caffeine', () => {
    mockGameState.value = {
      ...mockGameState.value,
      caffeinePercentage: 98,
    };

    render(<GameScene character="officeWorker" />);

    expect(screen.getByTestId('tripped-out-overlay')).toBeInTheDocument();
  });

  it('renders the tripped-out effect as a portal treatment', () => {
    mockGameState.value = {
      ...mockGameState.value,
      caffeinePercentage: 98,
    };

    render(<GameScene character="officeWorker" />);

    expect(screen.getByTestId('trippy-portal')).toBeInTheDocument();
    expect(screen.getByTestId('portal-mouth')).toBeInTheDocument();
  });

  it('adds chaotic rifts and orbiting energy to the tripped-out portal', () => {
    mockGameState.value = {
      ...mockGameState.value,
      caffeinePercentage: 98,
    };

    render(<GameScene character="officeWorker" />);

    expect(screen.getByTestId('portal-chaos-field')).toBeInTheDocument();
    expect(screen.getAllByTestId('portal-rift')).toHaveLength(9);
    expect(screen.getAllByTestId('portal-comet')).toHaveLength(8);
  });

  it('pushes the tripped-out portal into reality-breakdown mode', () => {
    mockGameState.value = {
      ...mockGameState.value,
      caffeinePercentage: 98,
    };

    render(<GameScene character="officeWorker" />);

    expect(screen.getAllByTestId('portal-shockwave')).toHaveLength(4);
    expect(screen.getAllByTestId('portal-kaleidoscope-shard')).toHaveLength(12);
    expect(screen.getAllByTestId('portal-glyph')).toHaveLength(10);
    expect(screen.getAllByTestId('portal-tear')).toHaveLength(7);
  });

  it('emphasizes a spiraling tunnel inside the tripped-out portal', () => {
    mockGameState.value = {
      ...mockGameState.value,
      caffeinePercentage: 98,
    };

    render(<GameScene character="officeWorker" />);

    expect(screen.getByTestId('portal-spiral-core')).toBeInTheDocument();
    expect(screen.getAllByTestId('portal-spiral-arm')).toHaveLength(16);
  });

  it('anchors the spiral at the character head while keeping the character visible', () => {
    mockGameState.value = {
      ...mockGameState.value,
      caffeinePercentage: 98,
    };

    render(<GameScene character="officeWorker" />);

    expect(screen.getByTestId('portal-head-origin')).toBeInTheDocument();
    expect(screen.getByTestId('portal-spiral-svg')).toBeInTheDocument();
    expect(screen.getAllByTestId('portal-spiral-path')).toHaveLength(12);
    expect(screen.getByTestId('character-layer')).toHaveClass('z-[6]');
  });

  it('does not show the tripped-out overlay for ordinary over-caffeination', () => {
    mockGameState.value = {
      ...mockGameState.value,
      caffeinePercentage: 90,
    };

    render(<GameScene character="officeWorker" />);

    expect(screen.queryByTestId('tripped-out-overlay')).not.toBeInTheDocument();
  });
});
