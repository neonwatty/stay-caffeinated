/**
 * Drink-related types and interfaces
 */

export type DrinkType = 'tea' | 'coffee' | 'energyDrink' | 'espresso' | 'water';

export type ReleaseProfile = 'instant' | 'slow' | 'moderate';

export interface Drink {
  id: DrinkType;
  name: string;
  caffeineBoost: number; // Amount of caffeine added (0-50)
  releaseProfile: ReleaseProfile;
  releaseSpeed: number; // How fast the caffeine is released (ms)
  crashSeverity: number; // 0-10, affects subsequent depletion rate
  cooldown: number; // Time before drink can be consumed again (ms)
  icon: string; // Emoji or icon identifier
  color: string; // Hex color for visual representation
  description: string;
  soundEffect?: string; // Optional sound file reference
}

export interface DrinkEffect {
  drinkId: DrinkType;
  startTime: number;
  peakTime: number;
  endTime: number;
  currentBoost: number;
  isActive: boolean;
}

export interface DrinkInventory {
  available: DrinkType[];
  cooldowns: Map<DrinkType, number>;
  lastConsumed?: DrinkType;
}