/**
 * Unit tests for the Drink System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  DrinkConsumptionManager,
  DRINK_DEFINITIONS,
  getDrinkById,
  getAllDrinks,
  recommendDrink,
} from '../drinks';
import type { DrinkType } from '@/types/drinks';

describe('DrinkConsumptionManager', () => {
  let manager: DrinkConsumptionManager;
  let currentTime: number;

  beforeEach(() => {
    manager = new DrinkConsumptionManager();
    currentTime = Date.now();
  });

  describe('consumeDrink', () => {
    it('should successfully consume a drink when not on cooldown', () => {
      const result = manager.consumeDrink('coffee', currentTime);

      expect(result.success).toBe(true);
      expect(result.caffeineBoost).toBe(0); // Coffee is moderate release, not instant
      expect(result.message).toContain('Coffee');
    });

    it('should provide instant boost for instant-release drinks', () => {
      const result = manager.consumeDrink('energyDrink', currentTime);

      expect(result.success).toBe(true);
      expect(result.caffeineBoost).toBe(50); // Energy drink provides instant boost
      expect(result.message).toContain('Energy Drink');
    });

    it('should prevent consumption when on cooldown', () => {
      // First consumption
      manager.consumeDrink('coffee', currentTime);

      // Attempt immediate second consumption
      const result = manager.consumeDrink('coffee', currentTime + 100);

      expect(result.success).toBe(false);
      expect(result.caffeineBoost).toBe(0);
      expect(result.message).toContain('cooldown');
    });

    it('should allow consumption after cooldown expires', () => {
      // First consumption
      manager.consumeDrink('coffee', currentTime);

      // Attempt after cooldown (coffee has 3000ms cooldown)
      const result = manager.consumeDrink('coffee', currentTime + 3100);

      expect(result.success).toBe(true);
    });

    it('should handle unknown drink types', () => {
      const result = manager.consumeDrink('unknown' as DrinkType, currentTime);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown drink type');
    });
  });

  describe('canConsumeDrink', () => {
    it('should return true when drink is not on cooldown', () => {
      expect(manager.canConsumeDrink('tea', currentTime)).toBe(true);
    });

    it('should return false when drink is on cooldown', () => {
      manager.consumeDrink('tea', currentTime);
      expect(manager.canConsumeDrink('tea', currentTime + 1000)).toBe(false);
    });

    it('should return true after cooldown expires', () => {
      manager.consumeDrink('tea', currentTime);
      // Tea has 2000ms cooldown
      expect(manager.canConsumeDrink('tea', currentTime + 2100)).toBe(true);
    });
  });

  describe('getRemainingCooldown', () => {
    it('should return 0 when not on cooldown', () => {
      expect(manager.getRemainingCooldown('espresso', currentTime)).toBe(0);
    });

    it('should return correct remaining time when on cooldown', () => {
      manager.consumeDrink('espresso', currentTime);
      // Espresso has 4000ms cooldown
      const remaining = manager.getRemainingCooldown('espresso', currentTime + 1000);
      expect(remaining).toBe(3000);
    });
  });

  describe('updateEffects', () => {
    it('should calculate caffeine change for active effects', () => {
      // Consume a slow-release tea
      manager.consumeDrink('tea', currentTime);

      // Update after 1 second
      const result = manager.updateEffects(currentTime + 1000, 100);

      expect(result.caffeineChange).toBeGreaterThan(0);
      expect(result.activeDrinks).toContain('tea');
      expect(result.crashingDrinks).toHaveLength(0);
    });

    it('should detect crashing drinks', () => {
      // Consume energy drink
      manager.consumeDrink('energyDrink', currentTime);

      // Update after release period (500ms) to enter crash phase
      const result = manager.updateEffects(currentTime + 600, 100);

      expect(result.crashingDrinks).toContain('energyDrink');
      expect(result.caffeineChange).toBeLessThan(0); // Negative due to crash
    });

    it('should handle multiple active effects', () => {
      manager.consumeDrink('tea', currentTime);
      manager.consumeDrink('coffee', currentTime + 3000);

      // Update when both are active
      const result = manager.updateEffects(currentTime + 3500, 100);

      expect(result.activeDrinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getConsumptionStats', () => {
    it('should track consumption statistics correctly', () => {
      manager.consumeDrink('coffee', currentTime);
      manager.consumeDrink('tea', currentTime + 3000);
      manager.consumeDrink('water', currentTime + 5000);
      manager.consumeDrink('coffee', currentTime + 8000);

      const stats = manager.getConsumptionStats();

      expect(stats.totalDrinksConsumed).toBe(4);
      expect(stats.drinkBreakdown.coffee).toBe(2);
      expect(stats.drinkBreakdown.tea).toBe(1);
      expect(stats.drinkBreakdown.water).toBe(1);
      expect(stats.totalCaffeine).toBe(30 + 15 + 0 + 30); // 75 total
    });

    it('should calculate average consumption rate', () => {
      manager.consumeDrink('coffee', currentTime);
      manager.consumeDrink('tea', currentTime + 60000); // 1 minute later

      const stats = manager.getConsumptionStats();

      expect(stats.averageConsumptionRate).toBeCloseTo(2, 1); // ~2 drinks per minute
    });
  });

  describe('getDrinkStatuses', () => {
    it('should return status for all drinks', () => {
      const statuses = manager.getDrinkStatuses(currentTime);

      expect(statuses).toHaveLength(5); // All 5 drinks
      expect(statuses.every(s => s.available)).toBe(true); // All available initially
    });

    it('should mark consumed drinks correctly', () => {
      manager.consumeDrink('coffee', currentTime);

      const statuses = manager.getDrinkStatuses(currentTime + 100);
      const coffeeStatus = statuses.find(s => s.drink.id === 'coffee');

      expect(coffeeStatus?.available).toBe(false);
      expect(coffeeStatus?.isActive).toBe(true);
      expect(coffeeStatus?.cooldownRemaining).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    it('should clear all data', () => {
      manager.consumeDrink('coffee', currentTime);
      manager.consumeDrink('tea', currentTime + 3000);

      manager.reset();

      const stats = manager.getConsumptionStats();
      expect(stats.totalDrinksConsumed).toBe(0);
      expect(manager.getActiveEffects()).toHaveLength(0);
      expect(manager.canConsumeDrink('coffee', currentTime)).toBe(true);
    });
  });
});

describe('Drink Helper Functions', () => {
  describe('getDrinkById', () => {
    it('should return correct drink definition', () => {
      const tea = getDrinkById('tea');
      expect(tea?.name).toBe('Tea');
      expect(tea?.caffeineBoost).toBe(15);
    });

    it('should return undefined for invalid id', () => {
      const drink = getDrinkById('invalid' as DrinkType);
      expect(drink).toBeUndefined();
    });
  });

  describe('getAllDrinks', () => {
    it('should return all 5 drinks', () => {
      const drinks = getAllDrinks();
      expect(drinks).toHaveLength(5);
      expect(drinks.map(d => d.id)).toContain('tea');
      expect(drinks.map(d => d.id)).toContain('coffee');
      expect(drinks.map(d => d.id)).toContain('energyDrink');
      expect(drinks.map(d => d.id)).toContain('espresso');
      expect(drinks.map(d => d.id)).toContain('water');
    });
  });

  describe('recommendDrink', () => {
    let manager: DrinkConsumptionManager;
    let currentTime: number;

    beforeEach(() => {
      manager = new DrinkConsumptionManager();
      currentTime = Date.now();
    });

    it('should recommend water when caffeine is at target', () => {
      const recommendation = recommendDrink(50, 50, currentTime, manager);
      expect(recommendation).toBe('water');
    });

    it('should recommend water when caffeine is above target', () => {
      const recommendation = recommendDrink(70, 50, currentTime, manager);
      expect(recommendation).toBe('water');
    });

    it('should recommend appropriate drink for small deficit', () => {
      const recommendation = recommendDrink(35, 50, currentTime, manager);
      // Should recommend tea (15 boost) for 15 deficit
      expect(recommendation).toBe('tea');
    });

    it('should recommend appropriate drink for large deficit', () => {
      const recommendation = recommendDrink(10, 55, currentTime, manager);
      // Should recommend energy drink (50 boost) for 45 deficit
      expect(recommendation).toBe('energyDrink');
    });

    it('should return null when no drinks are available', () => {
      // Consume all drinks to put them on cooldown
      manager.consumeDrink('tea', currentTime);
      manager.consumeDrink('coffee', currentTime);
      manager.consumeDrink('energyDrink', currentTime);
      manager.consumeDrink('espresso', currentTime);
      manager.consumeDrink('water', currentTime);

      const recommendation = recommendDrink(30, 50, currentTime + 100, manager);
      expect(recommendation).toBeNull();
    });
  });
});

describe('Drink Definitions', () => {
  it('should have correct properties for each drink', () => {
    // Tea - gentle, slow release
    expect(DRINK_DEFINITIONS.tea).toMatchObject({
      id: 'tea',
      caffeineBoost: 15,
      releaseProfile: 'slow',
      crashSeverity: 2,
    });

    // Coffee - moderate everything
    expect(DRINK_DEFINITIONS.coffee).toMatchObject({
      id: 'coffee',
      caffeineBoost: 30,
      releaseProfile: 'moderate',
      crashSeverity: 5,
    });

    // Energy Drink - high boost, instant, harsh crash
    expect(DRINK_DEFINITIONS.energyDrink).toMatchObject({
      id: 'energyDrink',
      caffeineBoost: 50,
      releaseProfile: 'instant',
      crashSeverity: 8,
    });

    // Espresso - strong, instant
    expect(DRINK_DEFINITIONS.espresso).toMatchObject({
      id: 'espresso',
      caffeineBoost: 40,
      releaseProfile: 'instant',
      crashSeverity: 6,
    });

    // Water - no caffeine, no crash
    expect(DRINK_DEFINITIONS.water).toMatchObject({
      id: 'water',
      caffeineBoost: 0,
      crashSeverity: 0,
    });
  });

  it('should have unique cooldowns for each drink', () => {
    const cooldowns = Object.values(DRINK_DEFINITIONS).map(d => d.cooldown);
    expect(new Set(cooldowns).size).toBe(5); // All unique
  });

  it('should have visual properties for each drink', () => {
    Object.values(DRINK_DEFINITIONS).forEach(drink => {
      expect(drink.icon).toBeTruthy();
      expect(drink.color).toMatch(/^#[0-9a-f]{6}$/i); // Hex color
      expect(drink.description).toBeTruthy();
    });
  });
});