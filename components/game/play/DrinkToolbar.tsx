'use client';

import { DrinkIcon } from '@/components/game/drinks/DrinkIcon';
import { DRINKS } from '@/game/data/drinks';
import { useDrinkCooldown } from '@/hooks/useDrinkCooldown';
import type { DrinkType } from '@/types/drinks';

interface DrinkToolbarProps {
  onConsume: (drinkType: DrinkType) => void;
  onPause: () => void;
  disabled?: boolean;
  isActive: boolean;
}

/** Ordered list of drinks displayed in the toolbar. */
const TOOLBAR_DRINKS: DrinkType[] = ['tea', 'coffee', 'espresso', 'energyDrink', 'water'];

function getCaffeineLabel(drinkType: DrinkType): string {
  if (drinkType === 'water') return '+5 HP';
  const drink = DRINKS.find((d) => d.id === drinkType);
  return drink ? `+${drink.caffeineBoost}` : '';
}

export function DrinkToolbar({ onConsume, onPause, disabled = false, isActive }: DrinkToolbarProps) {
  const { isOnCooldown, getCooldownProgress } = useDrinkCooldown();

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 bg-black/60 p-3 backdrop-blur-sm">
      {TOOLBAR_DRINKS.map((drinkType) => {
        const drink = DRINKS.find((d) => d.id === drinkType);
        if (!drink) return null;

        const onCooldown = isOnCooldown(drinkType);
        const progress = getCooldownProgress(drinkType);
        const isDisabled = onCooldown || disabled;

        const state: 'idle' | 'cooldown' = onCooldown ? 'cooldown' : 'idle';

        return (
          <div key={drinkType} className="flex flex-col items-center">
            <DrinkIcon
              drinkType={drinkType}
              state={state}
              cooldownProgress={progress}
              size={48}
              isActive={isActive}
              onClick={isDisabled ? undefined : () => onConsume(drinkType)}
            />
            <span className="mt-1 text-[10px] leading-tight text-gray-400">{drink.name}</span>
            <span className="text-[10px] leading-tight text-amber-400">{getCaffeineLabel(drinkType)}</span>
          </div>
        );
      })}

      {/* Pause button */}
      <button
        type="button"
        onClick={onPause}
        className="ml-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700 transition-colors hover:bg-gray-600"
        aria-label="Pause"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-gray-200">
          <rect x="2" y="1" width="4" height="14" rx="1" />
          <rect x="10" y="1" width="4" height="14" rx="1" />
        </svg>
      </button>
    </div>
  );
}
