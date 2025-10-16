'use client';

/**
 * useDrinkCooldown - Hook for managing drink cooldowns with visual feedback
 */

import { useCallback, useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import type { DrinkType } from '@/types';
import { DRINKS } from '@/game/data/drinks';

export interface DrinkCooldownState {
  drinkType: DrinkType;
  isOnCooldown: boolean;
  remainingTime: number; // in milliseconds
  remainingSeconds: number; // in seconds (rounded up)
  cooldownProgress: number; // 0-100 percentage
  totalCooldown: number; // total cooldown duration in ms
}

export interface UseDrinkCooldownReturn {
  // Cooldown states for all drinks
  cooldownStates: Map<DrinkType, DrinkCooldownState>;

  // Individual drink queries
  getCooldownState: (drinkType: DrinkType) => DrinkCooldownState;
  isOnCooldown: (drinkType: DrinkType) => boolean;
  getRemainingTime: (drinkType: DrinkType) => number;
  getCooldownProgress: (drinkType: DrinkType) => number;

  // Actions
  startCooldown: (drinkType: DrinkType, duration?: number) => void;
  resetCooldown: (drinkType: DrinkType) => void;
  resetAllCooldowns: () => void;

  // Utilities
  formatRemainingTime: (drinkType: DrinkType) => string;
  getNextAvailableDrink: () => DrinkType | null;
}

export function useDrinkCooldown(): UseDrinkCooldownReturn {
  const { drinkCooldowns } = useGame();
  const [cooldownStates, setCooldownStates] = useState<Map<DrinkType, DrinkCooldownState>>(new Map());

  // Update cooldown states based on game context
  useEffect(() => {
    const updateStates = () => {
      const now = Date.now();
      const newStates = new Map<DrinkType, DrinkCooldownState>();

      // Check each drink type
      DRINKS.forEach(drink => {
        const cooldownEndTime = drinkCooldowns.get(drink.id) || 0;
        const isOnCooldown = cooldownEndTime > now;
        const remainingTime = Math.max(0, cooldownEndTime - now);
        const totalCooldown = drink.cooldown || 5000;

        newStates.set(drink.id, {
          drinkType: drink.id,
          isOnCooldown,
          remainingTime,
          remainingSeconds: Math.ceil(remainingTime / 1000),
          cooldownProgress: isOnCooldown ? ((totalCooldown - remainingTime) / totalCooldown) * 100 : 100,
          totalCooldown,
        });
      });

      setCooldownStates(newStates);
    };

    // Update immediately and then every 100ms
    updateStates();
    const interval = setInterval(updateStates, 100);

    return () => clearInterval(interval);
  }, [drinkCooldowns]);

  // Get cooldown state for a specific drink
  const getCooldownState = useCallback((drinkType: DrinkType): DrinkCooldownState => {
    return cooldownStates.get(drinkType) || {
      drinkType,
      isOnCooldown: false,
      remainingTime: 0,
      remainingSeconds: 0,
      cooldownProgress: 100,
      totalCooldown: 5000,
    };
  }, [cooldownStates]);

  // Check if a drink is on cooldown
  const isOnCooldown = useCallback((drinkType: DrinkType): boolean => {
    return getCooldownState(drinkType).isOnCooldown;
  }, [getCooldownState]);

  // Get remaining cooldown time in milliseconds
  const getRemainingTime = useCallback((drinkType: DrinkType): number => {
    return getCooldownState(drinkType).remainingTime;
  }, [getCooldownState]);

  // Get cooldown progress (0-100)
  const getCooldownProgress = useCallback((drinkType: DrinkType): number => {
    return getCooldownState(drinkType).cooldownProgress;
  }, [getCooldownState]);

  // Start a cooldown for a drink
  const startCooldown = useCallback((drinkType: DrinkType, duration?: number) => {
    const drink = DRINKS.find(d => d.id === drinkType);
    const cooldownDuration = duration || drink?.cooldown || 5000;

    // This would typically update through the game context
    // For now, we'll just log it
    console.log(`Starting ${cooldownDuration}ms cooldown for ${drinkType}`);
  }, []);

  // Reset a specific cooldown
  const resetCooldown = useCallback((drinkType: DrinkType) => {
    console.log(`Resetting cooldown for ${drinkType}`);
  }, []);

  // Reset all cooldowns
  const resetAllCooldowns = useCallback(() => {
    console.log('Resetting all drink cooldowns');
  }, []);

  // Format remaining time as a string
  const formatRemainingTime = useCallback((drinkType: DrinkType): string => {
    const state = getCooldownState(drinkType);

    if (!state.isOnCooldown) {
      return 'Ready';
    }

    const seconds = state.remainingSeconds;

    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    return `${seconds}s`;
  }, [getCooldownState]);

  // Get the next available drink (not on cooldown)
  const getNextAvailableDrink = useCallback((): DrinkType | null => {
    for (const [drinkType, state] of cooldownStates) {
      if (!state.isOnCooldown) {
        return drinkType;
      }
    }
    return null;
  }, [cooldownStates]);

  return {
    cooldownStates,
    getCooldownState,
    isOnCooldown,
    getRemainingTime,
    getCooldownProgress,
    startCooldown,
    resetCooldown,
    resetAllCooldowns,
    formatRemainingTime,
    getNextAvailableDrink,
  };
}

// Hook for animating cooldown progress
export function useCooldownAnimation(drinkType: DrinkType) {
  const { getCooldownState } = useDrinkCooldown();
  const [animatedProgress, setAnimatedProgress] = useState(100);

  const state = getCooldownState(drinkType);

  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      setAnimatedProgress(prev => {
        const diff = state.cooldownProgress - prev;
        const step = diff * 0.1; // Smooth animation

        if (Math.abs(diff) < 0.5) {
          return state.cooldownProgress;
        }

        return prev + step;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [state.cooldownProgress]);

  return {
    ...state,
    animatedProgress,
    displayText: state.isOnCooldown ? `${state.remainingSeconds}s` : 'Ready',
  };
}

// Hook for managing multiple drink cooldowns with shortcuts
export function useDrinkShortcuts() {
  const { consumeDrink, canConsumeDrink } = useGame();
  const { isOnCooldown } = useDrinkCooldown();

  // Map keyboard shortcuts to drinks
  const shortcuts: Record<string, DrinkType> = {
    '1': 'coffee',
    '2': 'tea',
    '3': 'energyDrink',
    '4': 'espresso',
    '5': 'water',
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const drinkType = shortcuts[event.key];

      if (drinkType && canConsumeDrink(drinkType) && !isOnCooldown(drinkType)) {
        const drink = DRINKS.find(d => d.id === drinkType);
        if (drink) {
          consumeDrink(drink.caffeineBoost, drinkType);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canConsumeDrink, consumeDrink, isOnCooldown]);

  return {
    shortcuts,
    isShortcutAvailable: (key: string) => {
      const drinkType = shortcuts[key];
      return drinkType ? !isOnCooldown(drinkType) : false;
    },
  };
}