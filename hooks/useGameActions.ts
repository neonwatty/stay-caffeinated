'use client';

/**
 * useGameActions - Hook for game-specific actions and effects
 */

import { useCallback, useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useGameState } from './useGameState';
import type { DrinkType, EventType } from '@/types';
import { DRINKS } from '@/game/data/drinks';

export interface UseGameActionsReturn {
  // Drink actions
  consumeDrink: (drinkType: DrinkType) => void;
  canConsumeDrink: (drinkType: DrinkType) => boolean;
  getRemainingCooldown: (drinkType: DrinkType) => number;

  // Event actions
  triggerEvent: (eventType: EventType) => void;
  activeEvents: EventType[];

  // Special actions
  activatePowerUp: (powerUpId: string) => void;
  useBoost: () => void;

  // State queries
  isActionAvailable: (actionId: string) => boolean;
  getActionCooldown: (actionId: string) => number;
}

export function useGameActions(): UseGameActionsReturn {
  const game = useGame();
  const { isPlaying, stats } = useGameState();
  const [activeEvents, setActiveEvents] = useState<EventType[]>([]);
  const [actionCooldowns, setActionCooldowns] = useState<Map<string, number>>(new Map());

  // Enhanced drink consumption with type-specific effects
  const consumeDrink = useCallback((drinkType: DrinkType) => {
    if (!isPlaying || !game.canConsumeDrink(drinkType)) {
      console.log(`Cannot consume ${drinkType}: cooldown or not playing`);
      return;
    }

    const drink = DRINKS.find(d => d.id === drinkType);
    if (!drink) {
      console.error(`Unknown drink type: ${drinkType}`);
      return;
    }

    // Consume the drink with its caffeine value
    game.consumeDrink(drink.caffeineBoost, drinkType);

    // Log the action
    console.log(`Consumed ${drink.name}: +${drink.caffeineBoost} caffeine`);
  }, [game, isPlaying]);

  // Check if a drink can be consumed
  const canConsumeDrink = useCallback((drinkType: DrinkType) => {
    return isPlaying && game.canConsumeDrink(drinkType);
  }, [game, isPlaying]);

  // Get remaining cooldown time for a drink
  const getRemainingCooldown = useCallback((drinkType: DrinkType) => {
    const cooldownTime = game.drinkCooldowns.get(drinkType) || 0;
    const remaining = Math.max(0, cooldownTime - Date.now());
    return Math.ceil(remaining / 1000); // Return seconds
  }, [game.drinkCooldowns]);

  // Trigger game events
  const triggerEvent = useCallback((eventType: EventType) => {
    if (!isPlaying) return;

    game.triggerEvent(eventType);
    setActiveEvents(prev => [...prev, eventType]);

    // Auto-remove event after duration (example: 10 seconds)
    setTimeout(() => {
      setActiveEvents(prev => prev.filter(e => e !== eventType));
    }, 10000);
  }, [game, isPlaying]);

  // Activate power-ups
  const activatePowerUp = useCallback((powerUpId: string) => {
    if (!isPlaying) return;

    // Set cooldown for power-up
    setActionCooldowns(prev => {
      const newCooldowns = new Map(prev);
      newCooldowns.set(powerUpId, Date.now() + 30000); // 30 second cooldown
      return newCooldowns;
    });

    console.log(`Power-up activated: ${powerUpId}`);
  }, [isPlaying]);

  // Use boost action
  const useBoost = useCallback(() => {
    if (!isPlaying || !isActionAvailable('boost')) return;

    // Apply boost effect
    game.consumeDrink(20); // Quick 20 caffeine boost

    // Set cooldown
    setActionCooldowns(prev => {
      const newCooldowns = new Map(prev);
      newCooldowns.set('boost', Date.now() + 60000); // 60 second cooldown
      return newCooldowns;
    });

    console.log('Boost activated!');
  }, [game, isPlaying]);

  // Check if an action is available
  const isActionAvailable = useCallback((actionId: string) => {
    const cooldownTime = actionCooldowns.get(actionId) || 0;
    return Date.now() > cooldownTime;
  }, [actionCooldowns]);

  // Get remaining cooldown for an action
  const getActionCooldown = useCallback((actionId: string) => {
    const cooldownTime = actionCooldowns.get(actionId) || 0;
    const remaining = Math.max(0, cooldownTime - Date.now());
    return Math.ceil(remaining / 1000); // Return seconds
  }, [actionCooldowns]);

  // Clean up expired cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      setActionCooldowns(prev => {
        const now = Date.now();
        const newCooldowns = new Map(prev);
        let hasChanges = false;

        for (const [action, cooldownTime] of newCooldowns) {
          if (cooldownTime <= now) {
            newCooldowns.delete(action);
            hasChanges = true;
          }
        }

        return hasChanges ? newCooldowns : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    // Drink actions
    consumeDrink,
    canConsumeDrink,
    getRemainingCooldown,

    // Event actions
    triggerEvent,
    activeEvents,

    // Special actions
    activatePowerUp,
    useBoost,

    // State queries
    isActionAvailable,
    getActionCooldown,
  };
}

// Hook for managing game events
export function useGameEvents() {
  const { triggerEvent, activeEvents } = useGameActions();
  const { stats, isPlaying } = useGameState();

  // Auto-trigger events based on game conditions
  useEffect(() => {
    if (!isPlaying) return;

    // Morning meeting event at 2 minutes
    if (stats.timeElapsed >= 120 && stats.timeElapsed < 121) {
      triggerEvent('morningMeeting' as EventType);
    }

    // Code review event at 5 minutes
    if (stats.timeElapsed >= 300 && stats.timeElapsed < 301) {
      triggerEvent('codeReview' as EventType);
    }

    // Lunch break at 8 minutes
    if (stats.timeElapsed >= 480 && stats.timeElapsed < 481) {
      triggerEvent('lunchBreak' as EventType);
    }
  }, [stats.timeElapsed, isPlaying, triggerEvent]);

  return {
    activeEvents,
    hasActiveEvent: activeEvents.length > 0,
    isEventActive: (eventType: EventType) => activeEvents.includes(eventType),
  };
}

// Hook for managing drink inventory
export function useDrinkInventory() {
  const { canConsumeDrink, getRemainingCooldown, consumeDrink } = useGameActions();
  const [unlockedDrinks, setUnlockedDrinks] = useState<DrinkType[]>(['coffee', 'tea', 'water']);

  // Unlock drinks based on progress
  const { stats } = useGameState();

  useEffect(() => {
    // Unlock energy drink after 100 points
    if (stats.score >= 100 && !unlockedDrinks.includes('energyDrink')) {
      setUnlockedDrinks(prev => [...prev, 'energyDrink']);
      console.log('Energy Drink unlocked!');
    }

    // Unlock espresso after 250 points
    if (stats.score >= 250 && !unlockedDrinks.includes('espresso')) {
      setUnlockedDrinks(prev => [...prev, 'espresso']);
      console.log('Espresso unlocked!');
    }
  }, [stats.score, unlockedDrinks]);

  // Get drink availability info
  const getDrinkStatus = useCallback((drinkType: DrinkType) => {
    return {
      unlocked: unlockedDrinks.includes(drinkType),
      available: canConsumeDrink(drinkType),
      cooldown: getRemainingCooldown(drinkType),
    };
  }, [unlockedDrinks, canConsumeDrink, getRemainingCooldown]);

  return {
    unlockedDrinks,
    consumeDrink,
    getDrinkStatus,
    totalDrinksUnlocked: unlockedDrinks.length,
  };
}