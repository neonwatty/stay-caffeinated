import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CharacterSelect } from '@/components/game/play/CharacterSelect';

const gameMocks = vi.hoisted(() => ({
  setDifficulty: vi.fn(),
  startGame: vi.fn(),
}));

vi.mock('@/contexts/GameContext', () => ({
  useGame: () => ({
    setDifficulty: gameMocks.setDifficulty,
    startGame: gameMocks.startGame,
  }),
}));

vi.mock('@/components/game/SpriteCharacter', () => ({
  SpriteCharacter: ({ caffeineLevel }: { caffeineLevel: number }) => (
    <div data-testid="sprite-office-worker">Sprite worker at {caffeineLevel}%</div>
  ),
}));

describe('CharacterSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the sprite-backed office worker preview', () => {
    render(<CharacterSelect onSelect={vi.fn()} />);

    expect(screen.getByTestId('sprite-office-worker')).toHaveTextContent('50%');
  });

  it('defaults to Office Worker so Start Shift is immediately actionable', () => {
    const onSelect = vi.fn();

    render(<CharacterSelect onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: /Selected character Office Worker/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Start Shift' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Start Shift' }));

    expect(onSelect).toHaveBeenCalledWith('officeWorker');
    expect(gameMocks.setDifficulty).toHaveBeenCalledWith('junior');
    expect(gameMocks.startGame).toHaveBeenCalledTimes(1);
  });
});
