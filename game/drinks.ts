/**
 * Comprehensive Drink System
 * Manages all drink-related functionality including definitions, effects, and consumption
 */

import type { Drink, DrinkType, DrinkEffect, ReleaseProfile } from '@/types/drinks';

/**
 * Complete drink definitions with all properties
 */
export const DRINK_DEFINITIONS: Record<DrinkType, Drink> = {
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
    description: 'Gentle caffeine boost with minimal crash',
    soundEffect: 'tea_sip',
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
    description: 'Reliable caffeine boost with moderate crash',
    soundEffect: 'coffee_sip',
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
    description: 'Massive instant boost but harsh crash',
    soundEffect: 'can_open',
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
    description: 'Quick strong boost with notable crash',
    soundEffect: 'espresso_shot',
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
    description: 'No caffeine but helps stabilize levels',
    soundEffect: 'water_gulp',
  },
};

/**
 * Drink consumption manager class
 */
export class DrinkConsumptionManager {
  private consumptionHistory: Array<{
    drinkType: DrinkType;
    timestamp: number;
    caffeineAmount: number;
  }> = [];

  private activeEffects: Map<string, DrinkEffect> = new Map();
  private drinkCooldowns: Map<DrinkType, number> = new Map();
  private effectCounter = 0;

  /**
   * Consume a drink and track its consumption
   */
  consumeDrink(drinkType: DrinkType, timestamp: number): {
    success: boolean;
    caffeineBoost: number;
    message: string;
  } {
    const drink = DRINK_DEFINITIONS[drinkType];

    if (!drink) {
      return {
        success: false,
        caffeineBoost: 0,
        message: `Unknown drink type: ${drinkType}`,
      };
    }

    // Check cooldown
    if (!this.canConsumeDrink(drinkType, timestamp)) {
      const remainingCooldown = this.getRemainingCooldown(drinkType, timestamp);
      return {
        success: false,
        caffeineBoost: 0,
        message: `${drink.name} is on cooldown for ${Math.ceil(remainingCooldown / 1000)}s`,
      };
    }

    // Set cooldown
    this.drinkCooldowns.set(drinkType, timestamp + drink.cooldown);

    // Record consumption
    this.consumptionHistory.push({
      drinkType,
      timestamp,
      caffeineAmount: drink.caffeineBoost,
    });

    // Create effect
    const effectId = `${drinkType}_${this.effectCounter++}`;
    const effect: DrinkEffect = {
      drinkId: drinkType,
      startTime: timestamp,
      peakTime: timestamp + drink.releaseSpeed / 2,
      endTime: timestamp + drink.releaseSpeed + (drink.crashSeverity * 100), // Crash duration based on severity
      currentBoost: 0,
      isActive: true,
    };

    this.activeEffects.set(effectId, effect);

    // Return immediate boost for instant drinks
    const immediateBoost = drink.releaseProfile === 'instant' ? drink.caffeineBoost : 0;

    return {
      success: true,
      caffeineBoost: immediateBoost,
      message: `Consumed ${drink.name}! ${drink.description}`,
    };
  }

  /**
   * Check if a drink can be consumed
   */
  canConsumeDrink(drinkType: DrinkType, timestamp: number): boolean {
    const cooldownEnd = this.drinkCooldowns.get(drinkType) || 0;
    return timestamp >= cooldownEnd;
  }

  /**
   * Get remaining cooldown for a drink
   */
  getRemainingCooldown(drinkType: DrinkType, timestamp: number): number {
    const cooldownEnd = this.drinkCooldowns.get(drinkType) || 0;
    return Math.max(0, cooldownEnd - timestamp);
  }

  /**
   * Update all active effects and return total caffeine change
   */
  updateEffects(timestamp: number, deltaTime: number): {
    caffeineChange: number;
    activeDrinks: DrinkType[];
    crashingDrinks: DrinkType[];
  } {
    let caffeineChange = 0;
    const activeDrinks: DrinkType[] = [];
    const crashingDrinks: DrinkType[] = [];

    this.activeEffects.forEach((effect, id) => {
      const drink = DRINK_DEFINITIONS[effect.drinkId];
      if (!drink) {
        this.activeEffects.delete(id);
        return;
      }

      const elapsed = timestamp - effect.startTime;
      const duration = effect.endTime - effect.startTime;

      // Remove expired effects
      if (timestamp > effect.endTime) {
        this.activeEffects.delete(id);
        return;
      }

      // Calculate effect based on release profile
      let currentCaffeine = 0;
      let isCrashing = false;

      if (elapsed < drink.releaseSpeed) {
        // Active phase
        currentCaffeine = this.calculateReleaseEffect(drink, elapsed);
        activeDrinks.push(effect.drinkId);
      } else {
        // Crash phase
        const crashElapsed = elapsed - drink.releaseSpeed;
        const crashDuration = drink.crashSeverity * 100;

        if (crashElapsed < crashDuration) {
          const crashProgress = crashElapsed / crashDuration;
          currentCaffeine = -drink.crashSeverity * (1 - crashProgress);
          crashingDrinks.push(effect.drinkId);
          isCrashing = true;
        }
      }

      // Calculate change from previous frame
      const previousBoost = effect.currentBoost;
      effect.currentBoost = currentCaffeine;
      caffeineChange += (currentCaffeine - previousBoost);
    });

    return {
      caffeineChange,
      activeDrinks: [...new Set(activeDrinks)],
      crashingDrinks: [...new Set(crashingDrinks)],
    };
  }

  /**
   * Calculate caffeine release based on profile
   */
  private calculateReleaseEffect(drink: Drink, elapsed: number): number {
    const progress = Math.min(1, elapsed / drink.releaseSpeed);

    switch (drink.releaseProfile) {
      case 'instant':
        // Full effect immediately, then nothing
        return elapsed < 100 ? drink.caffeineBoost : 0;

      case 'slow':
        // Linear release over time
        return drink.caffeineBoost * progress;

      case 'moderate':
        // Bell curve release (using sine wave)
        return drink.caffeineBoost * Math.sin(progress * Math.PI);

      default:
        return 0;
    }
  }

  /**
   * Get consumption statistics
   */
  getConsumptionStats(): {
    totalDrinksConsumed: number;
    drinkBreakdown: Record<DrinkType, number>;
    totalCaffeine: number;
    lastDrinkTime?: number;
    averageConsumptionRate: number;
  } {
    const breakdown: Record<DrinkType, number> = {
      tea: 0,
      coffee: 0,
      energyDrink: 0,
      espresso: 0,
      water: 0,
    };

    let totalCaffeine = 0;

    this.consumptionHistory.forEach(record => {
      breakdown[record.drinkType]++;
      totalCaffeine += record.caffeineAmount;
    });

    const lastDrink = this.consumptionHistory[this.consumptionHistory.length - 1];
    const firstDrink = this.consumptionHistory[0];
    const timeSpan = lastDrink && firstDrink ? lastDrink.timestamp - firstDrink.timestamp : 0;
    const averageRate = timeSpan > 0 ? this.consumptionHistory.length / (timeSpan / 1000 / 60) : 0;

    return {
      totalDrinksConsumed: this.consumptionHistory.length,
      drinkBreakdown: breakdown,
      totalCaffeine,
      lastDrinkTime: lastDrink?.timestamp,
      averageConsumptionRate: averageRate, // drinks per minute
    };
  }

  /**
   * Get all drinks with their current status
   */
  getDrinkStatuses(timestamp: number): Array<{
    drink: Drink;
    available: boolean;
    cooldownRemaining: number;
    isActive: boolean;
    isCrashing: boolean;
  }> {
    const statuses: Array<{
      drink: Drink;
      available: boolean;
      cooldownRemaining: number;
      isActive: boolean;
      isCrashing: boolean;
    }> = [];

    // Get active and crashing drinks from current effects
    const activeDrinks = new Set<DrinkType>();
    const crashingDrinks = new Set<DrinkType>();

    this.activeEffects.forEach(effect => {
      const elapsed = timestamp - effect.startTime;
      const drink = DRINK_DEFINITIONS[effect.drinkId];

      if (drink && elapsed < drink.releaseSpeed) {
        activeDrinks.add(effect.drinkId);
      } else if (drink && elapsed < drink.releaseSpeed + drink.crashSeverity * 100) {
        crashingDrinks.add(effect.drinkId);
      }
    });

    // Build status for each drink
    Object.values(DRINK_DEFINITIONS).forEach(drink => {
      statuses.push({
        drink,
        available: this.canConsumeDrink(drink.id, timestamp),
        cooldownRemaining: this.getRemainingCooldown(drink.id, timestamp),
        isActive: activeDrinks.has(drink.id),
        isCrashing: crashingDrinks.has(drink.id),
      });
    });

    return statuses;
  }

  /**
   * Reset the consumption manager
   */
  reset(): void {
    this.consumptionHistory = [];
    this.activeEffects.clear();
    this.drinkCooldowns.clear();
    this.effectCounter = 0;
  }

  /**
   * Get active effects for visualization
   */
  getActiveEffects(): DrinkEffect[] {
    return Array.from(this.activeEffects.values());
  }
}

/**
 * Singleton instance for global access
 */
export const drinkManager = new DrinkConsumptionManager();

/**
 * Helper function to get drink by ID
 */
export function getDrinkById(id: DrinkType): Drink | undefined {
  return DRINK_DEFINITIONS[id];
}

/**
 * Helper function to get all drinks
 */
export function getAllDrinks(): Drink[] {
  return Object.values(DRINK_DEFINITIONS);
}

/**
 * Calculate optimal drink recommendation based on current caffeine level
 */
export function recommendDrink(
  currentCaffeine: number,
  targetCaffeine: number,
  timestamp: number,
  manager: DrinkConsumptionManager = drinkManager
): DrinkType | null {
  const deficit = targetCaffeine - currentCaffeine;

  // Filter available drinks
  const availableDrinks = getAllDrinks().filter(drink =>
    manager.canConsumeDrink(drink.id, timestamp)
  );

  if (availableDrinks.length === 0) return null;

  // If caffeine is too high, recommend water
  if (deficit <= 0) {
    return 'water';
  }

  // Find best matching drink based on deficit
  const bestDrink = availableDrinks.reduce((best, drink) => {
    if (drink.id === 'water') return best; // Skip water for caffeine boost

    const bestDiff = Math.abs(deficit - best.caffeineBoost);
    const drinkDiff = Math.abs(deficit - drink.caffeineBoost);

    return drinkDiff < bestDiff ? drink : best;
  });

  return bestDrink.id;
}