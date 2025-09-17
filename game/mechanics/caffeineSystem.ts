/**
 * Caffeine System - Manages caffeine mechanics and drink effects
 */

import type { DrinkType, DrinkEffect } from '@/types/drinks';
import { DRINKS } from './drinks';

export class CaffeineSystem {
  private activeEffects: Map<string, DrinkEffect> = new Map();
  private drinkCooldowns: Map<DrinkType, number> = new Map();
  private effectIdCounter: number = 0;

  /**
   * Consume a drink and add its effect
   */
  consumeDrink(drinkType: DrinkType, currentTime: number): number {
    const drink = DRINKS[drinkType];
    if (!drink) return 0;

    // Check cooldown
    const cooldownEnd = this.drinkCooldowns.get(drinkType) || 0;
    if (currentTime < cooldownEnd) {
      return 0; // Drink still on cooldown
    }

    // Set new cooldown
    this.drinkCooldowns.set(drinkType, currentTime + drink.cooldown);

    // Create effect
    const effectId = `${drinkType}_${this.effectIdCounter++}`;
    const effect: DrinkEffect = {
      drinkId: drinkType,
      startTime: currentTime,
      peakTime: currentTime + drink.releaseSpeed / 2,
      endTime: currentTime + drink.releaseSpeed,
      currentBoost: 0,
      isActive: true,
    };

    this.activeEffects.set(effectId, effect);

    // Return immediate caffeine boost for instant drinks
    if (drink.releaseProfile === 'instant') {
      return drink.caffeineBoost;
    }

    return 0;
  }

  /**
   * Update all active drink effects and calculate total caffeine change
   */
  update(currentTime: number, deltaTime: number): number {
    let totalCaffeineChange = 0;

    // Update each active effect
    this.activeEffects.forEach((effect, id) => {
      const drink = DRINKS[effect.drinkId];
      if (!drink) {
        this.activeEffects.delete(id);
        return;
      }

      // Check if effect has expired
      if (currentTime >= effect.endTime) {
        // Apply crash effect
        if (drink.crashSeverity > 0 && effect.isActive) {
          totalCaffeineChange -= drink.crashSeverity * (deltaTime / 1000);
        }
        effect.isActive = false;
        this.activeEffects.delete(id);
        return;
      }

      // Calculate caffeine release based on profile
      const previousBoost = effect.currentBoost;
      let newBoost = 0;

      switch (drink.releaseProfile) {
        case 'instant':
          // Already applied on consumption
          break;

        case 'slow': {
          // Linear release over time
          const progress = (currentTime - effect.startTime) / drink.releaseSpeed;
          newBoost = drink.caffeineBoost * Math.min(1, progress);
          break;
        }

        case 'moderate': {
          // Bell curve release
          const progress = (currentTime - effect.startTime) / drink.releaseSpeed;
          if (progress <= 1) {
            // Smooth bell curve using sine
            newBoost = drink.caffeineBoost * Math.sin(progress * Math.PI);
          }
          break;
        }
      }

      // Calculate the change since last update
      const caffeineChange = newBoost - previousBoost;
      effect.currentBoost = newBoost;
      totalCaffeineChange += caffeineChange;
    });

    return totalCaffeineChange;
  }

  /**
   * Check if a drink is available (not on cooldown)
   */
  isDrinkAvailable(drinkType: DrinkType, currentTime: number): boolean {
    const cooldownEnd = this.drinkCooldowns.get(drinkType) || 0;
    return currentTime >= cooldownEnd;
  }

  /**
   * Get remaining cooldown time for a drink
   */
  getDrinkCooldown(drinkType: DrinkType, currentTime: number): number {
    const cooldownEnd = this.drinkCooldowns.get(drinkType) || 0;
    return Math.max(0, cooldownEnd - currentTime);
  }

  /**
   * Get all active effects
   */
  getActiveEffects(): DrinkEffect[] {
    return Array.from(this.activeEffects.values());
  }

  /**
   * Clear all effects and cooldowns
   */
  reset(): void {
    this.activeEffects.clear();
    this.drinkCooldowns.clear();
    this.effectIdCounter = 0;
  }

  /**
   * Get drink availability status for all drinks
   */
  getDrinkAvailability(currentTime: number): Map<DrinkType, boolean> {
    const availability = new Map<DrinkType, boolean>();
    const drinkTypes: DrinkType[] = ['tea', 'coffee', 'energyDrink', 'espresso', 'water'];

    drinkTypes.forEach(type => {
      availability.set(type, this.isDrinkAvailable(type, currentTime));
    });

    return availability;
  }
}