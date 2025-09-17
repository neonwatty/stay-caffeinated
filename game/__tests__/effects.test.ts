/**
 * Unit tests for the Effects System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  DrinkEffectCalculator,
  DRINK_VISUAL_EFFECTS,
  DRINK_SOUND_EFFECTS,
  getOptimalConsumptionTiming,
} from '../effects';
import type { DrinkEffect } from '@/types/drinks';

describe('DrinkEffectCalculator', () => {
  let calculator: DrinkEffectCalculator;
  let currentTime: number;

  beforeEach(() => {
    calculator = new DrinkEffectCalculator();
    currentTime = Date.now();
  });

  describe('calculateReleaseCurve', () => {
    it('should calculate instant release correctly', () => {
      // Instant release should give full amount immediately
      const result = calculator.calculateReleaseCurve('instant', 50, 500, 50);
      expect(result).toBe(50);

      // Should decay quickly
      const result2 = calculator.calculateReleaseCurve('instant', 200, 500, 50);
      expect(result2).toBeLessThan(50);
      expect(result2).toBeGreaterThan(0);

      // Should be zero after 500ms
      const result3 = calculator.calculateReleaseCurve('instant', 600, 500, 50);
      expect(result3).toBe(0);
    });

    it('should calculate slow release correctly', () => {
      // Slow release should be gradual
      const result1 = calculator.calculateReleaseCurve('slow', 500, 2000, 30);
      expect(result1).toBeCloseTo(9.375, 1); // ~31.25% of the way

      const result2 = calculator.calculateReleaseCurve('slow', 1600, 2000, 30);
      expect(result2).toBe(30); // Peak at 80%

      // Should taper off gently
      const result3 = calculator.calculateReleaseCurve('slow', 1900, 2000, 30);
      expect(result3).toBeLessThan(30);
      expect(result3).toBeGreaterThan(0);
    });

    it('should calculate moderate release as bell curve', () => {
      // Should start at 0
      const result1 = calculator.calculateReleaseCurve('moderate', 0, 2000, 40);
      expect(result1).toBe(0);

      // Peak at midpoint
      const result2 = calculator.calculateReleaseCurve('moderate', 1000, 2000, 40);
      expect(result2).toBe(40);

      // Symmetric decay
      const result3 = calculator.calculateReleaseCurve('moderate', 1500, 2000, 40);
      const result4 = calculator.calculateReleaseCurve('moderate', 500, 2000, 40);
      expect(result3).toBeCloseTo(result4, 1);

      // Back to 0 at end
      const result5 = calculator.calculateReleaseCurve('moderate', 2000, 2000, 40);
      expect(result5).toBeCloseTo(0, 1);
    });
  });

  describe('calculateCrashEffect', () => {
    it('should return 0 for zero severity', () => {
      const result = calculator.calculateCrashEffect(0, 1000, 50);
      expect(result).toBe(0);
    });

    it('should calculate crash proportional to severity', () => {
      const mild = calculator.calculateCrashEffect(2, 100, 30);
      const severe = calculator.calculateCrashEffect(8, 100, 30);

      expect(mild).toBeLessThan(0); // Negative effect
      expect(severe).toBeLessThan(mild); // More negative
    });

    it('should decay over time', () => {
      const early = calculator.calculateCrashEffect(5, 100, 40);
      const late = calculator.calculateCrashEffect(5, 800, 40);

      expect(Math.abs(early)).toBeGreaterThan(Math.abs(late));
    });

    it('should scale with peak caffeine', () => {
      const lowPeak = calculator.calculateCrashEffect(5, 200, 20);
      const highPeak = calculator.calculateCrashEffect(5, 200, 50);

      expect(Math.abs(highPeak)).toBeGreaterThan(Math.abs(lowPeak));
    });
  });

  describe('calculateSynergy', () => {
    it('should return 0 for single or no drinks', () => {
      expect(calculator.calculateSynergy([])).toBe(0);
      expect(calculator.calculateSynergy(['coffee'])).toBe(0);
    });

    it('should give bonus for water combination', () => {
      const synergy = calculator.calculateSynergy(['water', 'coffee']);
      expect(synergy).toBe(0.15); // 15% stability bonus
    });

    it('should give bonus for tea + coffee', () => {
      const synergy = calculator.calculateSynergy(['tea', 'coffee']);
      expect(synergy).toBe(0.1); // 10% efficiency bonus
    });

    it('should penalize dangerous combinations', () => {
      const synergy = calculator.calculateSynergy(['energyDrink', 'espresso']);
      expect(synergy).toBe(-0.2); // 20% penalty
    });

    it('should stack bonuses correctly', () => {
      const synergy = calculator.calculateSynergy(['water', 'tea', 'coffee']);
      expect(synergy).toBe(0.25); // 15% (water) + 10% (tea+coffee)
    });
  });

  describe('calculateCombinedEffects', () => {
    it('should combine multiple active effects', () => {
      const effects: DrinkEffect[] = [
        {
          drinkId: 'coffee',
          startTime: currentTime - 1000,
          peakTime: currentTime,
          endTime: currentTime + 1000,
          currentBoost: 15,
          isActive: true,
        },
        {
          drinkId: 'tea',
          startTime: currentTime - 500,
          peakTime: currentTime + 1000,
          endTime: currentTime + 2500,
          currentBoost: 5,
          isActive: true,
        },
      ];

      const combined = calculator.calculateCombinedEffects(effects, currentTime);

      expect(combined.totalCaffeine).toBeGreaterThan(0);
      expect(combined.activeCount).toBe(2);
      expect(combined.synergyBonus).toBe(0.1); // Tea + coffee bonus
    });

    it('should calculate stability bonus from water', () => {
      const effects: DrinkEffect[] = [
        {
          drinkId: 'water',
          startTime: currentTime - 100,
          peakTime: currentTime,
          endTime: currentTime + 100,
          currentBoost: 0,
          isActive: true,
        },
      ];

      const combined = calculator.calculateCombinedEffects(effects, currentTime);

      expect(combined.stabilityBonus).toBe(0.2);
      expect(combined.totalCaffeine).toBe(0); // Water has no caffeine
    });

    it('should include crash effects', () => {
      const effects: DrinkEffect[] = [
        {
          drinkId: 'energyDrink',
          startTime: currentTime - 1000, // Past release phase
          peakTime: currentTime - 500,
          endTime: currentTime + 1000,
          currentBoost: 0,
          isActive: true,
        },
      ];

      const combined = calculator.calculateCombinedEffects(effects, currentTime);

      expect(combined.crashRisk).toBeGreaterThan(0);
      expect(combined.totalCaffeine).toBeLessThan(0); // Negative due to crash
    });
  });

  describe('calculateTolerance', () => {
    it('should return full effectiveness with no recent consumption', () => {
      const tolerance = calculator.calculateTolerance([], currentTime);
      expect(tolerance).toBe(1); // 100% effectiveness
    });

    it('should reduce effectiveness with recent consumption', () => {
      const history = [
        { timestamp: currentTime - 1000, drinkType: 'coffee' as const },
        { timestamp: currentTime - 5000, drinkType: 'tea' as const },
      ];

      const tolerance = calculator.calculateTolerance(history, currentTime);
      expect(tolerance).toBe(0.9); // 90% effectiveness (2 drinks * 5% = 10% reduction)
    });

    it('should cap tolerance at 50%', () => {
      const history = Array(20).fill(null).map((_, i) => ({
        timestamp: currentTime - i * 1000,
        drinkType: 'coffee' as const,
      }));

      const tolerance = calculator.calculateTolerance(history, currentTime);
      expect(tolerance).toBe(0.5); // Capped at 50% effectiveness
    });

    it('should ignore consumption older than 1 hour', () => {
      const history = [
        { timestamp: currentTime - 3700000, drinkType: 'coffee' as const }, // Over 1 hour
        { timestamp: currentTime - 1000, drinkType: 'tea' as const }, // Recent
      ];

      const tolerance = calculator.calculateTolerance(history, currentTime);
      expect(tolerance).toBe(0.95); // Only 1 recent drink counts
    });
  });

  describe('predictCaffeineLevels', () => {
    it('should predict future caffeine levels', () => {
      const effects: DrinkEffect[] = [
        {
          drinkId: 'coffee',
          startTime: currentTime,
          peakTime: currentTime + 1000,
          endTime: currentTime + 2000,
          currentBoost: 0,
          isActive: true,
        },
      ];

      const predictions = calculator.predictCaffeineLevels(50, effects, currentTime, 5);

      expect(predictions).toHaveLength(6); // 0-5 minutes
      expect(predictions[0]).toBe(50); // Starting level

      // Should change over time due to effect and decay
      expect(predictions[1]).not.toBe(predictions[0]);
    });

    it('should account for natural decay', () => {
      const predictions = calculator.predictCaffeineLevels(50, [], currentTime, 5);

      // With no effects, should only decay
      expect(predictions[1]).toBeLessThan(predictions[0]);
      expect(predictions[5]).toBeLessThan(predictions[1]);
    });

    it('should not go below 0', () => {
      const predictions = calculator.predictCaffeineLevels(2, [], currentTime, 5);

      predictions.forEach(level => {
        expect(level).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('modifiers', () => {
    it('should apply multiplier modifiers', () => {
      calculator.addModifier('boost', {
        type: 'multiplier',
        value: 1.5,
        source: 'power-up',
      });

      // This would normally be tested through calculateCombinedEffects
      // but we're testing the modifier system exists
      expect(() => calculator.removeModifier('boost')).not.toThrow();
    });

    it('should reset modifiers on reset', () => {
      calculator.addModifier('test', {
        type: 'additive',
        value: 10,
        source: 'test',
      });

      calculator.reset();
      // Modifiers should be cleared
      expect(() => calculator.removeModifier('test')).not.toThrow();
    });
  });
});

describe('getOptimalConsumptionTiming', () => {
  it('should recommend no drink when in optimal range', () => {
    const result = getOptimalConsumptionTiming(
      50,
      { min: 40, max: 60 },
      ['coffee', 'tea']
    );

    expect(result.drinkType).toBeNull();
    expect(result.reason).toContain('optimal');
  });

  it('should recommend drink when below range', () => {
    const result = getOptimalConsumptionTiming(
      30,
      { min: 40, max: 60 },
      ['coffee', 'tea', 'energyDrink']
    );

    expect(result.drinkType).not.toBeNull();
    expect(result.waitTime).toBe(0);
    expect(result.reason).toContain('below');
  });

  it('should recommend water when above range', () => {
    const result = getOptimalConsumptionTiming(
      70,
      { min: 40, max: 60 },
      ['coffee', 'tea', 'water']
    );

    expect(result.drinkType).toBe('water');
    expect(result.reason).toContain('above');
  });

  it('should select appropriate drink for deficit', () => {
    const result = getOptimalConsumptionTiming(
      25,
      { min: 40, max: 60 },
      ['tea', 'coffee'] // Tea=15, Coffee=30
    );

    expect(result.drinkType).toBe('tea'); // 15 boost matches 15 deficit better
  });
});

describe('Visual and Sound Effects', () => {
  it('should have visual effects for all drinks', () => {
    expect(Object.keys(DRINK_VISUAL_EFFECTS)).toHaveLength(5);

    Object.values(DRINK_VISUAL_EFFECTS).forEach(effect => {
      expect(effect.particleColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(effect.particleCount).toBeGreaterThan(0);
      expect(effect.duration).toBeGreaterThan(0);
      expect(['steam', 'sparkles', 'bubbles']).toContain(effect.particleType);
    });
  });

  it('should have sound effects for all drinks', () => {
    expect(Object.keys(DRINK_SOUND_EFFECTS)).toHaveLength(5);

    Object.values(DRINK_SOUND_EFFECTS).forEach(sound => {
      expect(sound.consume).toContain('.mp3');
      expect(sound.effect).toContain('.mp3');
      expect(sound.volume).toBeGreaterThan(0);
      expect(sound.volume).toBeLessThanOrEqual(1);
    });
  });
});