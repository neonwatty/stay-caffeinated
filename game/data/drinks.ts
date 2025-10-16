/**
 * Drink data and configurations
 */

import type { Drink, DrinkType } from '@/types';

export const DRINKS: Drink[] = [
  {
    id: 'tea' as DrinkType,
    name: 'Tea',
    caffeineBoost: 15,
    releaseProfile: 'slow',
    releaseSpeed: 3000,
    crashSeverity: 2,
    cooldown: 2000,
    icon: '🍵',
    color: '#10b981',
    description: 'Gentle caffeine boost with minimal crash',
  },
  {
    id: 'coffee' as DrinkType,
    name: 'Coffee',
    caffeineBoost: 30,
    releaseProfile: 'moderate',
    releaseSpeed: 2000,
    crashSeverity: 5,
    cooldown: 3000,
    icon: '☕',
    color: '#8b4513',
    description: 'Reliable caffeine boost with moderate crash',
  },
  {
    id: 'energyDrink' as DrinkType,
    name: 'Energy Drink',
    caffeineBoost: 50,
    releaseProfile: 'instant',
    releaseSpeed: 500,
    crashSeverity: 8,
    cooldown: 5000,
    icon: '⚡',
    color: '#eab308',
    description: 'Massive instant boost but harsh crash',
  },
  {
    id: 'espresso' as DrinkType,
    name: 'Espresso',
    caffeineBoost: 40,
    releaseProfile: 'instant',
    releaseSpeed: 1000,
    crashSeverity: 6,
    cooldown: 4000,
    icon: '☕',
    color: '#1e293b',
    description: 'Quick strong boost with notable crash',
  },
  {
    id: 'water' as DrinkType,
    name: 'Water',
    caffeineBoost: 0,
    releaseProfile: 'instant',
    releaseSpeed: 0,
    crashSeverity: 0,
    cooldown: 1000,
    icon: '💧',
    color: '#3b82f6',
    description: 'No caffeine but helps stabilize levels',
  },
];

export const DRINK_MAP: Record<DrinkType, Drink> = DRINKS.reduce((acc, drink) => {
  acc[drink.id] = drink;
  return acc;
}, {} as Record<DrinkType, Drink>);

export function getDrinkById(id: DrinkType): Drink | undefined {
  return DRINK_MAP[id];
}

export function getDrinkCooldown(id: DrinkType): number {
  const drink = getDrinkById(id);
  return drink?.cooldown || 5000;
}

export function getDrinkCaffeineBoost(id: DrinkType): number {
  const drink = getDrinkById(id);
  return drink?.caffeineBoost || 0;
}