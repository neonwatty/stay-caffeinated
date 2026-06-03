import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GameHUD } from '@/components/game/play/GameHUD';

describe('GameHUD', () => {
  it('places productivity on the opposite side of the caffeine meter', () => {
    render(
      <GameHUD
        caffeineLevel={55}
        healthLevel={95}
        score={1250}
        streak={90}
        multiplier={2}
        timeProgress={38}
        formattedTime="12:02 PM"
        optimalZone={[30, 70]}
        isActive
      />,
    );

    expect(screen.getByText('Productivity')).toBeInTheDocument();
    expect(screen.getByText('Deep Work')).toBeInTheDocument();
    expect(screen.getByTestId('productivity-graph-panel')).toHaveClass('pointer-events-auto');
  });
});
