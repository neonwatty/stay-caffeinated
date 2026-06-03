import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  ProductivityGraphSVG,
  calculateProductivity,
} from '@/components/game/ui/ProductivityGraphSVG';

describe('calculateProductivity', () => {
  it('rewards the optimal caffeine zone with a strong productivity score', () => {
    const result = calculateProductivity({
      caffeineLevel: 55,
      healthLevel: 95,
      streak: 90,
      multiplier: 2,
      timeProgress: 38,
    });

    expect(result.score).toBe(97);
    expect(result.label).toBe('Deep Work');
  });

  it('shows a crash risk when caffeine is too low', () => {
    const result = calculateProductivity({
      caffeineLevel: 12,
      healthLevel: 80,
      streak: 0,
      multiplier: 1,
      timeProgress: 72,
    });

    expect(result.score).toBeLessThan(45);
    expect(result.label).toBe('Fading');
  });

  it('shows chaos when caffeine is too high', () => {
    const result = calculateProductivity({
      caffeineLevel: 96,
      healthLevel: 80,
      streak: 0,
      multiplier: 1,
      timeProgress: 40,
    });

    expect(result.score).toBeLessThan(55);
    expect(result.label).toBe('Chaos');
  });
});

describe('ProductivityGraphSVG', () => {
  it('renders a day productivity graph with current output and marker', () => {
    render(
      <ProductivityGraphSVG
        caffeineLevel={55}
        healthLevel={95}
        streak={90}
        multiplier={2}
        timeProgress={38}
        isActive
      />,
    );

    expect(screen.getByText('Productivity')).toBeInTheDocument();
    expect(screen.getByText('97%')).toBeInTheDocument();
    expect(screen.getByText('Deep Work')).toBeInTheDocument();
    expect(screen.getByTestId('productivity-curve')).toBeInTheDocument();
    expect(screen.getByTestId('productivity-current-marker')).toBeInTheDocument();
  });
});
