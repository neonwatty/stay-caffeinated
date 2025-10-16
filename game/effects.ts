/**
 * Drink Effects System
 * Manages and calculates complex drink effects, combinations, and modifiers
 */

import type { DrinkType, DrinkEffect, ReleaseProfile } from '@/types/drinks';
import { DRINK_DEFINITIONS } from './drinks';

/**
 * Effect modifier types
 */
export interface EffectModifier {
  type: 'multiplier' | 'additive' | 'duration' | 'intensity';
  value: number;
  source: string;
}

/**
 * Combined effect from multiple drinks
 */
export interface CombinedEffect {
  totalCaffeine: number;
  stabilityBonus: number;
  crashRisk: number;
  synergyBonus: number;
  activeCount: number;
}

/**
 * Drink effect calculator with advanced mechanics
 */
export class DrinkEffectCalculator {
  private modifiers: Map<string, EffectModifier> = new Map();

  /**
   * Calculate release curve for a drink based on its profile
   */
  calculateReleaseCurve(
    profile: ReleaseProfile,
    elapsed: number,
    duration: number,
    caffeineAmount: number
  ): number {
    const progress = Math.min(1, elapsed / duration);

    switch (profile) {
      case 'instant':
        // Spike effect - full amount immediately, rapid decay
        if (elapsed < 100) return caffeineAmount;
        if (elapsed < 500) return caffeineAmount * (1 - (elapsed - 100) / 400);
        return 0;

      case 'slow':
        // Gradual linear release
        if (progress <= 0.8) {
          return caffeineAmount * (progress / 0.8);
        } else {
          // Gentle taper off
          return caffeineAmount * (1 - (progress - 0.8) / 0.2);
        }

      case 'moderate':
        // Bell curve using sine wave
        return caffeineAmount * Math.sin(progress * Math.PI);

      default:
        return 0;
    }
  }

  /**
   * Calculate crash effect based on severity
   */
  calculateCrashEffect(
    severity: number,
    elapsed: number,
    peakCaffeine: number
  ): number {
    if (severity === 0) return 0;

    // Crash starts after the main effect ends
    const crashDuration = severity * 200; // Longer crashes for higher severity
    const crashProgress = Math.min(1, elapsed / crashDuration);

    // Exponential crash curve - starts strong, tapers off
    const crashIntensity = Math.exp(-crashProgress * 2) * severity;

    // Crash is proportional to peak caffeine achieved
    return -(crashIntensity * peakCaffeine * 0.1);
  }

  /**
   * Calculate synergy between multiple active drinks
   */
  calculateSynergy(activeDrinks: DrinkType[]): number {
    if (activeDrinks.length <= 1) return 0;

    let synergyBonus = 0;

    // Check for specific combinations
    const hasWater = activeDrinks.includes('water');
    const hasTea = activeDrinks.includes('tea');
    const hasCoffee = activeDrinks.includes('coffee');
    const hasEnergy = activeDrinks.includes('energyDrink');
    const hasEspresso = activeDrinks.includes('espresso');

    // Water reduces crash effects and improves stability
    if (hasWater) {
      synergyBonus += 0.15; // 15% stability bonus
    }

    // Tea + Coffee = balanced boost
    if (hasTea && hasCoffee) {
      synergyBonus += 0.1; // 10% efficiency bonus
    }

    // Multiple high-caffeine drinks = dangerous combo
    if ((hasEnergy && hasEspresso) || (hasEnergy && hasCoffee)) {
      synergyBonus -= 0.2; // 20% penalty for overstimulation
    }

    // Espresso after coffee = enhanced effect
    if (hasEspresso && hasCoffee) {
      synergyBonus += 0.05; // 5% boost
    }

    return synergyBonus;
  }

  /**
   * Calculate combined effects from all active drinks
   */
  calculateCombinedEffects(activeEffects: DrinkEffect[], timestamp: number): CombinedEffect {
    let totalCaffeine = 0;
    let totalCrash = 0;
    let stabilityBonus = 0;
    const activeDrinkTypes = new Set<DrinkType>();

    activeEffects.forEach(effect => {
      const drink = DRINK_DEFINITIONS[effect.drinkId];
      if (!drink) return;

      const elapsed = timestamp - effect.startTime;

      // Water provides stability whenever active
      if (drink.id === 'water' && effect.isActive) {
        stabilityBonus += 0.2;
        activeDrinkTypes.add(effect.drinkId);
      }
      // Active phase for caffeinated drinks
      else if (elapsed < drink.releaseSpeed || (drink.releaseSpeed === 0 && elapsed === 0)) {
        const caffeine = this.calculateReleaseCurve(
          drink.releaseProfile,
          elapsed,
          drink.releaseSpeed,
          drink.caffeineBoost
        );
        totalCaffeine += this.applyModifiers(caffeine, 'caffeine');
        activeDrinkTypes.add(effect.drinkId);
      }
      // Crash phase
      else if (elapsed < drink.releaseSpeed + drink.crashSeverity * 200) {
        const crashElapsed = elapsed - drink.releaseSpeed;
        const crashEffect = this.calculateCrashEffect(
          drink.crashSeverity,
          crashElapsed,
          drink.caffeineBoost
        );
        totalCrash += crashEffect;
      }
    });

    const synergyBonus = this.calculateSynergy(Array.from(activeDrinkTypes));

    // Apply synergy to total caffeine
    totalCaffeine *= (1 + synergyBonus);

    return {
      totalCaffeine: totalCaffeine + totalCrash,
      stabilityBonus,
      crashRisk: Math.abs(totalCrash),
      synergyBonus,
      activeCount: activeDrinkTypes.size,
    };
  }

  /**
   * Add an effect modifier
   */
  addModifier(id: string, modifier: EffectModifier): void {
    this.modifiers.set(id, modifier);
  }

  /**
   * Remove an effect modifier
   */
  removeModifier(id: string): void {
    this.modifiers.delete(id);
  }

  /**
   * Apply modifiers to a value
   */
  private applyModifiers(value: number, category: string): number {
    let result = value;

    this.modifiers.forEach(modifier => {
      if (modifier.type === 'multiplier') {
        result *= modifier.value;
      } else if (modifier.type === 'additive') {
        result += modifier.value;
      }
    });

    return result;
  }

  /**
   * Calculate tolerance buildup over time
   */
  calculateTolerance(consumptionHistory: Array<{ timestamp: number; drinkType: DrinkType }>, currentTime: number): number {
    // Look at consumption in the last hour
    const oneHourAgo = currentTime - 3600000;
    const recentConsumption = consumptionHistory.filter(c => c.timestamp > oneHourAgo);

    // Tolerance builds with frequency
    const toleranceRate = 0.05; // 5% per drink
    const tolerance = Math.min(0.5, recentConsumption.length * toleranceRate); // Max 50% tolerance

    return 1 - tolerance; // Return effectiveness multiplier
  }

  /**
   * Predict future caffeine levels
   */
  predictCaffeineLevels(
    currentLevel: number,
    activeEffects: DrinkEffect[],
    timestamp: number,
    futureMinutes: number
  ): number[] {
    const predictions: number[] = [];
    let level = currentLevel;

    for (let minute = 0; minute <= futureMinutes; minute++) {
      const futureTime = timestamp + minute * 60000;
      const combined = this.calculateCombinedEffects(activeEffects, futureTime);

      // Natural decay (skip for minute 0)
      const decay = minute === 0 ? 0 : 0.5; // 0.5 caffeine per minute
      level = Math.max(0, level + combined.totalCaffeine - decay);
      predictions.push(level);
    }

    return predictions;
  }

  /**
   * Reset calculator
   */
  reset(): void {
    this.modifiers.clear();
  }
}

/**
 * Visual effect configurations for drinks
 */
export const DRINK_VISUAL_EFFECTS = {
  tea: {
    particleColor: '#10b981',
    particleCount: 20,
    particleType: 'steam' as const,
    screenEffect: 'subtle-glow',
    duration: 2000,
  },
  coffee: {
    particleColor: '#8b4513',
    particleCount: 30,
    particleType: 'steam' as const,
    screenEffect: 'warm-tint',
    duration: 2500,
  },
  energyDrink: {
    particleColor: '#eab308',
    particleCount: 50,
    particleType: 'sparkles' as const,
    screenEffect: 'electric-pulse',
    duration: 1000,
  },
  espresso: {
    particleColor: '#1e293b',
    particleCount: 40,
    particleType: 'bubbles' as const,
    screenEffect: 'intensity-boost',
    duration: 1500,
  },
  water: {
    particleColor: '#3b82f6',
    particleCount: 25,
    particleType: 'bubbles' as const,
    screenEffect: 'clarity',
    duration: 1000,
  },
};

/**
 * Sound effect configurations
 */
export const DRINK_SOUND_EFFECTS = {
  tea: {
    consume: 'tea_sip.mp3',
    effect: 'calm_ambience.mp3',
    volume: 0.6,
  },
  coffee: {
    consume: 'coffee_sip.mp3',
    effect: 'percolate.mp3',
    volume: 0.7,
  },
  energyDrink: {
    consume: 'can_open.mp3',
    effect: 'fizz.mp3',
    volume: 0.8,
  },
  espresso: {
    consume: 'espresso_shot.mp3',
    effect: 'steam_hiss.mp3',
    volume: 0.7,
  },
  water: {
    consume: 'water_gulp.mp3',
    effect: 'refresh.mp3',
    volume: 0.5,
  },
};

/**
 * Singleton instance
 */
export const effectCalculator = new DrinkEffectCalculator();

/**
 * Helper function to get optimal consumption timing
 */
export function getOptimalConsumptionTiming(
  currentCaffeine: number,
  targetRange: { min: number; max: number },
  availableDrinks: DrinkType[]
): {
  drinkType: DrinkType | null;
  waitTime: number;
  reason: string;
} {
  // If already in optimal range, no need to drink
  if (currentCaffeine >= targetRange.min && currentCaffeine <= targetRange.max) {
    return {
      drinkType: null,
      waitTime: 0,
      reason: 'Already in optimal caffeine range',
    };
  }

  // If below range, need to boost
  if (currentCaffeine < targetRange.min) {
    const deficit = targetRange.min - currentCaffeine;

    // Find best drink for the deficit
    const bestDrink = availableDrinks.reduce<DrinkType | null>((best, drinkType) => {
      const drink = DRINK_DEFINITIONS[drinkType];
      if (!drink || drink.id === 'water') return best;

      if (!best) return drinkType;

      const bestDrinkData = DRINK_DEFINITIONS[best];
      if (!bestDrinkData) return drinkType;

      const bestDiff = Math.abs(deficit - bestDrinkData.caffeineBoost);
      const drinkDiff = Math.abs(deficit - drink.caffeineBoost);

      return drinkDiff < bestDiff ? drinkType : best;
    }, null);

    return {
      drinkType: bestDrink,
      waitTime: 0,
      reason: `Caffeine below optimal (${currentCaffeine} < ${targetRange.min})`,
    };
  }

  // If above range, recommend water or wait
  if (currentCaffeine > targetRange.max) {
    return {
      drinkType: 'water',
      waitTime: 0,
      reason: `Caffeine above optimal (${currentCaffeine} > ${targetRange.max}), water recommended for stability`,
    };
  }

  return {
    drinkType: null,
    waitTime: 60000, // Wait 1 minute
    reason: 'Monitoring caffeine levels',
  };
}