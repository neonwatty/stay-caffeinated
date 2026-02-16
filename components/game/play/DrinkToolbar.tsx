'use client';

import { useCallback, useRef, useState } from 'react';
import { DrinkIcon } from '@/components/game/drinks/DrinkIcon';
import { FloatingText } from '@/components/game/play/FloatingText';
import { DRINKS } from '@/game/data/drinks';
import { useDrinkCooldown } from '@/hooks/useDrinkCooldown';
import type { DrinkType } from '@/types/drinks';

interface DrinkToolbarProps {
  onConsume: (drinkType: DrinkType) => void;
  onPause: () => void;
  disabled?: boolean;
  isActive: boolean;
}

interface FloatingItem {
  id: number;
  drinkType: DrinkType;
}

const TOOLBAR_DRINKS: DrinkType[] = ['tea', 'coffee', 'espresso', 'energyDrink', 'water'];

function getCaffeineLabel(drinkType: DrinkType): string {
  if (drinkType === 'water') return '+5 HP';
  const drink = DRINKS.find((d) => d.id === drinkType);
  return drink ? `+${drink.caffeineBoost}` : '';
}

export function DrinkToolbar({ onConsume, onPause, disabled = false, isActive }: DrinkToolbarProps) {
  const { isOnCooldown, getCooldownProgress } = useDrinkCooldown();
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);
  const [bouncingDrink, setBouncingDrink] = useState<DrinkType | null>(null);
  const nextIdRef = useRef(0);

  const handleClick = useCallback(
    (drinkType: DrinkType) => {
      onConsume(drinkType);

      const id = ++nextIdRef.current;
      setFloatingItems((prev) => [...prev, { id, drinkType }]);

      setBouncingDrink(drinkType);
      setTimeout(() => setBouncingDrink(null), 200);
    },
    [onConsume],
  );

  const removeFloating = useCallback((id: number) => {
    setFloatingItems((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 bg-black/60 p-3 backdrop-blur-sm">
      {TOOLBAR_DRINKS.map((drinkType) => {
        const drink = DRINKS.find((d) => d.id === drinkType);
        if (!drink) return null;

        const onCooldown = isOnCooldown(drinkType);
        const progress = getCooldownProgress(drinkType);
        const isDisabled = onCooldown || disabled;
        const state: 'idle' | 'cooldown' = onCooldown ? 'cooldown' : 'idle';
        const isBouncing = bouncingDrink === drinkType;

        return (
          <div key={drinkType} className="relative flex flex-col items-center">
            <div
              style={{
                transform: isBouncing ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 200ms ease-out',
              }}
            >
              <DrinkIcon
                drinkType={drinkType}
                state={state}
                cooldownProgress={progress}
                size={64}
                isActive={isActive}
                onClick={isDisabled ? undefined : () => handleClick(drinkType)}
              />
            </div>
            <span className="mt-1 text-[10px] leading-tight text-gray-400">{drink.name}</span>
            <span className="text-[10px] leading-tight text-amber-400">{getCaffeineLabel(drinkType)}</span>

            {floatingItems
              .filter((f) => f.drinkType === drinkType)
              .map((f) => (
                <FloatingText
                  key={f.id}
                  text={getCaffeineLabel(drinkType)}
                  color={drinkType === 'water' ? '#22C55E' : '#D97706'}
                  onComplete={() => removeFloating(f.id)}
                />
              ))}
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
