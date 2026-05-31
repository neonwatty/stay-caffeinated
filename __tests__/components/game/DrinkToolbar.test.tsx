import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DrinkToolbar } from '@/components/game/play/DrinkToolbar';
import type { DrinkType } from '@/types/drinks';

const cooldownMocks = vi.hoisted(() => ({
  cooldowns: new Map<DrinkType, { isOnCooldown: boolean; remainingSeconds: number }>(),
}));

vi.mock('@/hooks/useDrinkCooldown', () => ({
  useDrinkCooldown: () => ({
    getCooldownState: (drinkType: DrinkType) => {
      const state = cooldownMocks.cooldowns.get(drinkType);

      return {
        drinkType,
        isOnCooldown: state?.isOnCooldown ?? false,
        remainingTime: (state?.remainingSeconds ?? 0) * 1000,
        remainingSeconds: state?.remainingSeconds ?? 0,
        cooldownProgress: state?.isOnCooldown ? 50 : 100,
        totalCooldown: 5000,
      };
    },
    getCooldownProgress: (drinkType: DrinkType) => {
      return cooldownMocks.cooldowns.get(drinkType)?.isOnCooldown ? 50 : 100;
    },
  }),
}));

function renderToolbar(overrides: Partial<React.ComponentProps<typeof DrinkToolbar>> = {}) {
  return render(
    <DrinkToolbar
      onConsume={vi.fn()}
      onPause={vi.fn()}
      isActive
      strategyContext={{
        caffeineLevel: 45,
        healthLevel: 100,
        nextEventTitle: 'Code Review',
        optimalZone: [40, 70],
      }}
      {...overrides}
    />,
  );
}

describe('DrinkToolbar', () => {
  beforeEach(() => {
    cooldownMocks.cooldowns.clear();
  });

  it('exposes every drink as a named semantic button', () => {
    renderToolbar();

    for (const name of ['Tea', 'Coffee', 'Espresso', 'Energy Drink', 'Water']) {
      expect(screen.getByRole('button', { name: `Drink ${name}` })).toBeEnabled();
    }
  });

  it('calls onConsume from accessible drink buttons', () => {
    const onConsume = vi.fn();
    renderToolbar({ onConsume });

    fireEvent.click(screen.getByRole('button', { name: 'Drink Coffee' }));

    expect(onConsume).toHaveBeenCalledWith('coffee');
  });

  it('keeps cooldown drinks as named disabled buttons with status text', () => {
    cooldownMocks.cooldowns.set('coffee', { isOnCooldown: true, remainingSeconds: 3 });
    renderToolbar();

    expect(screen.getByRole('button', { name: 'Drink Coffee' })).toBeDisabled();
    expect(screen.getByTestId('drink-coffee-status')).toHaveTextContent('Cooling down 3s');
  });

  it('keeps event-locked drinks as named disabled buttons with lockout status', () => {
    renderToolbar({ disabled: true, drinkRestrictionRemainingSeconds: 12 });

    expect(screen.getByRole('button', { name: 'Drink Water' })).toBeDisabled();
    expect(screen.getByTestId('drink-water-status')).toHaveTextContent('Locked 12s');
  });
});
