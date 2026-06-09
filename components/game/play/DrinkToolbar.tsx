'use client';

import { useCallback, useRef, useState } from 'react';
import { DrinkIcon } from '@/components/game/drinks/DrinkIcon';
import { FloatingText } from '@/components/game/play/FloatingText';
import { DRINKS } from '@/game/data/drinks';
import { useDrinkCooldown } from '@/hooks/useDrinkCooldown';
import type { Drink } from '@/types';
import type { DrinkType } from '@/types/drinks';

interface DrinkToolbarProps {
  onConsume: (drinkType: DrinkType) => void;
  onPause: () => void;
  disabled?: boolean;
  drinkRestrictionRemainingSeconds?: number;
  strategyContext?: {
    caffeineLevel: number;
    healthLevel: number;
    nextEventTitle?: string;
    optimalZone: [number, number];
  };
  isActive: boolean;
}

interface FloatingItem {
  id: number;
  drinkType: DrinkType;
}

const TOOLBAR_DRINKS: DrinkType[] = ['tea', 'coffee', 'espresso', 'energyDrink', 'water'];

const DRINK_STRATEGY: Record<DrinkType, { role: string; baseline: string }> = {
  tea: { role: 'Fine tune', baseline: 'Slow lift, soft crash' },
  coffee: { role: 'Steady lift', baseline: 'Partial now, steady tail' },
  espresso: { role: 'Fast spike', baseline: 'Big now, notable crash' },
  energyDrink: { role: 'Emergency', baseline: 'Huge now, harsh crash' },
  water: { role: 'Recover', baseline: 'Heal and stabilize' },
};

function getCaffeineLabel(drinkType: DrinkType): string {
  if (drinkType === 'water') return '+5 HP';
  const drink = DRINKS.find((d) => d.id === drinkType);
  return drink ? `+${drink.caffeineBoost}` : '';
}

function getDrinkStatusText(
  drink: Drink,
  locked: boolean,
  remainingLockSeconds: number,
  onCooldown: boolean,
  remainingCooldownSeconds: number,
  remainingCooldownMs: number,
): string {
  if (locked) {
    return remainingLockSeconds > 0 ? `Locked ${remainingLockSeconds}s` : 'Locked';
  }

  if (onCooldown) {
    return `Cooling down ${remainingCooldownSeconds}s · ${getActiveEffectText(drink, remainingCooldownMs)}`;
  }

  return `Ready · ${getEffectSummary(drink)}`;
}

export function DrinkToolbar({
  onConsume,
  onPause,
  disabled = false,
  drinkRestrictionRemainingSeconds = 0,
  strategyContext,
  isActive,
}: DrinkToolbarProps) {
  const { getCooldownState, getCooldownProgress } = useDrinkCooldown();
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

        const cooldownState = getCooldownState(drinkType);
        const onCooldown = cooldownState.isOnCooldown;
        const progress = getCooldownProgress(drinkType);
        const isDisabled = onCooldown || disabled;
        const state: 'idle' | 'cooldown' = isDisabled ? 'cooldown' : 'idle';
        const isBouncing = bouncingDrink === drinkType;
        const strategy = DRINK_STRATEGY[drinkType];
        const strategyCue = getStrategyCue(drinkType, strategy.baseline, strategyContext);
        const statusId = `drink-${drinkType}-status`;
        const statusText = getDrinkStatusText(
          drink,
          disabled,
          drinkRestrictionRemainingSeconds,
          onCooldown,
          cooldownState.remainingSeconds,
          cooldownState.remainingTime,
        );

        return (
          <div
            key={drinkType}
            className="relative flex w-[78px] flex-col items-center"
            data-testid={`drink-${drinkType}`}
            data-cooldown={drink.cooldown}
            data-disabled={isDisabled}
            data-strategy-role={strategy.role}
            data-effect-tradeoff={getEffectSummary(drink)}
          >
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
                buttonLabel={`Drink ${drink.name}`}
                disabled={isDisabled}
                describedBy={statusId}
                onClick={() => handleClick(drinkType)}
              />
            </div>
            <span className="mt-1 text-[10px] leading-tight text-gray-400">{drink.name}</span>
            <span className="text-[10px] leading-tight text-amber-400">{getCaffeineLabel(drinkType)}</span>
            <span className="max-w-full truncate text-[10px] font-semibold leading-tight text-cyan-200">
              {strategy.role}
            </span>
            <span className="h-3 max-w-full truncate text-[9px] leading-tight text-gray-400">
              {strategyCue}
            </span>
            <span
              id={statusId}
              className="h-3 text-[10px] leading-tight text-gray-300"
              data-testid={`drink-${drinkType}-status`}
              aria-live="polite"
            >
              {statusText}
            </span>

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

function getStrategyCue(
  drinkType: DrinkType,
  baseline: string,
  strategyContext?: DrinkToolbarProps['strategyContext'],
): string {
  if (!strategyContext) return baseline;

  const { caffeineLevel, healthLevel, nextEventTitle, optimalZone } = strategyContext;
  const [minOptimal, maxOptimal] = optimalZone;

  if (drinkType === 'water' && healthLevel < 70) return 'Recover HP';
  if (drinkType === 'tea' && caffeineLevel >= minOptimal && caffeineLevel <= maxOptimal) return 'Hold zone';
  if (drinkType === 'coffee' && caffeineLevel < minOptimal) return 'Enter zone';
  if ((drinkType === 'espresso' || drinkType === 'energyDrink') && nextEventTitle) {
    return `Prep ${nextEventTitle}`;
  }
  if (caffeineLevel > maxOptimal - 8 && drinkType !== 'water') return 'Overheat risk';

  return baseline;
}

function getEffectSummary(drink: Drink): string {
  if (drink.id === 'water') return 'Stabilizes crash';

  return `${drink.releaseProfile} +${drink.caffeineBoost}, crash -${drink.crashSeverity}`;
}

function getActiveEffectText(drink: Drink, remainingCooldownMs: number): string {
  if (drink.id === 'water') return 'stabilizing';

  const elapsedCooldown = Math.max(0, drink.cooldown - remainingCooldownMs);
  if (elapsedCooldown < drink.releaseSpeed) {
    return `releasing, crash -${drink.crashSeverity}`;
  }

  return `crash risk -${drink.crashSeverity}`;
}
