import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SpriteCharacter } from '@/components/game/SpriteCharacter';

describe('SpriteCharacter', () => {
  it('renders the current state from a sprite sheet without requiring a canvas renderer', () => {
    render(<SpriteCharacter caffeineLevel={50} width={160} height={160} isActive={false} />);

    const frame = screen.getByTestId('sprite-frame');
    expect(frame).toHaveStyle({ backgroundImage: 'url(/sprites/optimal.png)' });
    expect(frame).toHaveStyle({ backgroundSize: '960px 160px' });
  });

  it('exposes visible feedback when pressure state changes', () => {
    render(
      <SpriteCharacter
        caffeineLevel={50}
        width={160}
        height={160}
        isActive={false}
        pressureState="event"
        activeEventTitle="Code Review"
      />,
    );

    expect(screen.getByRole('img')).toHaveAttribute('data-pressure-state', 'event');
    expect(screen.getByRole('img')).toHaveAccessibleName(/under pressure from Code Review/);
    expect(screen.getByTestId('sprite-feedback')).toBeInTheDocument();
  });
});
