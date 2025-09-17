/**
 * Drink definitions and mechanics
 */

import type { Drink } from '@/types/drinks';

export const DRINKS: Record<string, Drink> = {
  tea: {
    id: 'tea',
    name: 'Tea',
    caffeineBoost: 15,
    releaseProfile: 'slow',
    releaseSpeed: 3000,
    crashSeverity: 2,
    cooldown: 2000,
    icon: '🍵',
    color: '#10b981',
    description: 'Gentle caffeine boost with minimal crash'
  },
  coffee: {
    id: 'coffee',
    name: 'Coffee',
    caffeineBoost: 30,
    releaseProfile: 'moderate',
    releaseSpeed: 2000,
    crashSeverity: 5,
    cooldown: 3000,
    icon: '☕',
    color: '#8b4513',
    description: 'Reliable caffeine boost with moderate crash'
  },
  energyDrink: {
    id: 'energyDrink',
    name: 'Energy Drink',
    caffeineBoost: 50,
    releaseProfile: 'instant',
    releaseSpeed: 500,
    crashSeverity: 8,
    cooldown: 5000,
    icon: '⚡',
    color: '#eab308',
    description: 'Massive instant boost but harsh crash'
  },
  espresso: {
    id: 'espresso',
    name: 'Espresso',
    caffeineBoost: 40,
    releaseProfile: 'instant',
    releaseSpeed: 1000,
    crashSeverity: 6,
    cooldown: 4000,
    icon: '☕',
    color: '#1e293b',
    description: 'Quick strong boost with notable crash'
  },
  water: {
    id: 'water',
    name: 'Water',
    caffeineBoost: 0,
    releaseProfile: 'instant',
    releaseSpeed: 0,
    crashSeverity: 0,
    cooldown: 1000,
    icon: '💧',
    color: '#3b82f6',
    description: 'No caffeine but helps stabilize levels'
  }
};

export function calculateDrinkEffect(
  drink: Drink,
  currentTime: number,
  consumeTime: number
): number {
  const elapsed = currentTime - consumeTime;

  if (elapsed < 0) return 0;

  switch (drink.releaseProfile) {
    case 'instant':
      // Immediate full effect
      return elapsed < drink.releaseSpeed ? drink.caffeineBoost : 0;

    case 'slow':
      // Gradual release over time
      if (elapsed > drink.releaseSpeed) return 0;
      return drink.caffeineBoost * (elapsed / drink.releaseSpeed);

    case 'moderate':
      // Bell curve release
      if (elapsed > drink.releaseSpeed) return 0;
      const progress = elapsed / drink.releaseSpeed;
      return drink.caffeineBoost * Math.sin(progress * Math.PI);

    default:
      return 0;
  }
}