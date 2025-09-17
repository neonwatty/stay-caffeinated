/**
 * Unit tests for the Difficulty System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  DifficultyManager,
  getDifficultyManager,
  getDifficultyNames,
  isValidDifficulty,
  DIFFICULTY_LEVELS,
} from '../difficulty';
import type { Difficulty } from '@/types/game';

describe('DifficultyManager', () => {
  let manager: DifficultyManager;

  beforeEach(() => {
    manager = new DifficultyManager();
  });

  describe('initialization', () => {
    it('should initialize with junior difficulty by default', () => {
      expect(manager.getCurrentDifficulty()).toBe('junior');
    });

    it('should initialize with specified difficulty', () => {
      const founderManager = new DifficultyManager('founder');
      expect(founderManager.getCurrentDifficulty()).toBe('founder');
    });

    it('should have correct default configuration', () => {
      const config = manager.getConfig();
      expect(config.name).toBe('Junior Developer');
      expect(config.workdayLength).toBe(480);
      expect(config.optimalZoneSize).toBe(40);
    });
  });

  describe('setDifficulty', () => {
    it('should change difficulty correctly', () => {
      manager.setDifficulty('senior');
      expect(manager.getCurrentDifficulty()).toBe('senior');

      const config = manager.getConfig();
      expect(config.name).toBe('Senior Developer');
      expect(config.workdayLength).toBe(600);
    });

    it('should throw error for invalid difficulty', () => {
      expect(() => {
        manager.setDifficulty('invalid' as Difficulty);
      }).toThrow('Invalid difficulty: invalid');
    });
  });

  describe('getOptimalCaffeineRange', () => {
    it('should calculate correct range for intern', () => {
      manager.setDifficulty('intern');
      const range = manager.getOptimalCaffeineRange();
      expect(range.min).toBe(25);
      expect(range.max).toBe(75);
    });

    it('should calculate correct range for junior', () => {
      manager.setDifficulty('junior');
      const range = manager.getOptimalCaffeineRange();
      expect(range.min).toBe(30);
      expect(range.max).toBe(70);
    });

    it('should calculate correct range for senior', () => {
      manager.setDifficulty('senior');
      const range = manager.getOptimalCaffeineRange();
      expect(range.min).toBe(35);
      expect(range.max).toBe(65);
    });

    it('should calculate correct range for founder', () => {
      manager.setDifficulty('founder');
      const range = manager.getOptimalCaffeineRange();
      expect(range.min).toBe(40);
      expect(range.max).toBe(60);
    });
  });

  describe('depletion rates', () => {
    it('should calculate caffeine depletion rate correctly', () => {
      manager.setDifficulty('intern');
      expect(manager.getCaffeineDepletionRate(1)).toBeCloseTo(0.375); // 0.5 * 0.75

      manager.setDifficulty('founder');
      expect(manager.getCaffeineDepletionRate(1)).toBeCloseTo(2.25); // 1.5 * 1.5
    });

    it('should calculate health depletion rate correctly', () => {
      manager.setDifficulty('intern');
      expect(manager.getHealthDepletionRate(1)).toBe(0.5);

      manager.setDifficulty('founder');
      expect(manager.getHealthDepletionRate(1)).toBe(2);
    });
  });

  describe('adjustDrinkEffectiveness', () => {
    it('should boost effectiveness for intern', () => {
      manager.setDifficulty('intern');
      expect(manager.adjustDrinkEffectiveness(10)).toBe(12.5);
    });

    it('should reduce effectiveness for founder', () => {
      manager.setDifficulty('founder');
      expect(manager.adjustDrinkEffectiveness(10)).toBe(7);
    });

    it('should not change effectiveness for junior', () => {
      manager.setDifficulty('junior');
      expect(manager.adjustDrinkEffectiveness(10)).toBe(10);
    });
  });

  describe('calculateScore', () => {
    it('should apply correct multipliers', () => {
      manager.setDifficulty('intern');
      expect(manager.calculateScore(100)).toBe(100); // 1.0x

      manager.setDifficulty('junior');
      expect(manager.calculateScore(100)).toBe(150); // 1.5x

      manager.setDifficulty('senior');
      expect(manager.calculateScore(100)).toBe(200); // 2.0x

      manager.setDifficulty('founder');
      expect(manager.calculateScore(100)).toBe(300); // 3.0x
    });

    it('should floor the score', () => {
      manager.setDifficulty('junior');
      expect(manager.calculateScore(33.7)).toBe(50); // floor(33.7 * 1.5) = 50
    });
  });

  describe('challenge modifiers', () => {
    it('should return correct modifiers', () => {
      manager.setDifficulty('senior');
      const modifiers = manager.getChallengeModifiers();

      expect(modifiers.caffeineVolatility).toBe(1.25);
      expect(modifiers.focusRequirement).toBeCloseTo(3.33, 1);
      expect(modifiers.multitaskingPenalty).toBeCloseTo(0.3);
      expect(modifiers.timePresssure).toBeCloseTo(0.67, 1);
    });

    it('should apply custom modifiers', () => {
      manager.setCustomModifiers({ caffeineVolatility: 5 });
      const modifiers = manager.getChallengeModifiers();
      expect(modifiers.caffeineVolatility).toBe(5);
    });
  });

  describe('reaction window', () => {
    it('should validate reaction times correctly', () => {
      manager.setDifficulty('intern');
      expect(manager.isWithinReactionWindow(2500)).toBe(true);
      expect(manager.isWithinReactionWindow(3500)).toBe(false);

      manager.setDifficulty('founder');
      expect(manager.isWithinReactionWindow(800)).toBe(true);
      expect(manager.isWithinReactionWindow(1200)).toBe(false);
    });
  });

  describe('difficulty progression', () => {
    it('should return next difficulty correctly', () => {
      manager.setDifficulty('intern');
      expect(manager.getNextDifficulty()).toBe('junior');

      manager.setDifficulty('junior');
      expect(manager.getNextDifficulty()).toBe('senior');

      manager.setDifficulty('senior');
      expect(manager.getNextDifficulty()).toBe('founder');

      manager.setDifficulty('founder');
      expect(manager.getNextDifficulty()).toBeNull();
    });

    it('should return previous difficulty correctly', () => {
      manager.setDifficulty('intern');
      expect(manager.getPreviousDifficulty()).toBeNull();

      manager.setDifficulty('junior');
      expect(manager.getPreviousDifficulty()).toBe('intern');

      manager.setDifficulty('senior');
      expect(manager.getPreviousDifficulty()).toBe('junior');

      manager.setDifficulty('founder');
      expect(manager.getPreviousDifficulty()).toBe('senior');
    });

    it('should identify max/min difficulty', () => {
      manager.setDifficulty('intern');
      expect(manager.isMinDifficulty()).toBe(true);
      expect(manager.isMaxDifficulty()).toBe(false);

      manager.setDifficulty('founder');
      expect(manager.isMinDifficulty()).toBe(false);
      expect(manager.isMaxDifficulty()).toBe(true);
    });
  });

  describe('crash and tolerance', () => {
    it('should return correct crash severity', () => {
      manager.setDifficulty('intern');
      expect(manager.getCrashSeverity()).toBe(0.5);

      manager.setDifficulty('founder');
      expect(manager.getCrashSeverity()).toBe(2.0);
    });

    it('should return correct tolerance buildup', () => {
      manager.setDifficulty('intern');
      expect(manager.getToleranceBuildup()).toBe(0.25);

      manager.setDifficulty('founder');
      expect(manager.getToleranceBuildup()).toBe(1.0);
    });
  });

  describe('workday duration', () => {
    it('should calculate workday duration correctly', () => {
      manager.setDifficulty('junior'); // 8 hours = 480 minutes
      const duration = manager.getWorkdayDuration(3); // 3 real minutes
      expect(duration).toBe(180000); // 3 minutes in ms

      manager.setDifficulty('founder'); // 14 hours = 840 minutes
      const founderDuration = manager.getWorkdayDuration(3);
      expect(founderDuration).toBe(315000); // 840/480 * 180000
    });
  });

  describe('getDifficultyInfo', () => {
    it('should return formatted info for UI', () => {
      manager.setDifficulty('senior');
      const info = manager.getDifficultyInfo();

      expect(info.name).toBe('Senior Developer');
      expect(info.description).toContain('Hard mode');
      expect(info.stats).toHaveLength(5);

      const workdayStat = info.stats.find(s => s.label === 'Workday Length');
      expect(workdayStat?.value).toBe('10 hours');

      const optimalStat = info.stats.find(s => s.label === 'Optimal Zone');
      expect(optimalStat?.value).toBe('35-65%');
    });
  });

  describe('reset', () => {
    it('should reset to junior difficulty', () => {
      manager.setDifficulty('founder');
      manager.setCustomModifiers({ caffeineVolatility: 10 });

      manager.reset();

      expect(manager.getCurrentDifficulty()).toBe('junior');
      const modifiers = manager.getChallengeModifiers();
      expect(modifiers.caffeineVolatility).toBe(1.0); // Back to default
    });
  });
});

describe('Difficulty Helper Functions', () => {
  describe('getDifficultyManager', () => {
    it('should return singleton instance', () => {
      const instance1 = getDifficultyManager();
      const instance2 = getDifficultyManager();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getDifficultyNames', () => {
    it('should return all difficulty options', () => {
      const names = getDifficultyNames();
      expect(names).toHaveLength(4);
      expect(names.map(n => n.value)).toEqual(['intern', 'junior', 'senior', 'founder']);
      expect(names.map(n => n.label)).toEqual([
        'Intern',
        'Junior Developer',
        'Senior Developer',
        'Startup Founder',
      ]);
    });
  });

  describe('isValidDifficulty', () => {
    it('should validate difficulty strings correctly', () => {
      expect(isValidDifficulty('intern')).toBe(true);
      expect(isValidDifficulty('junior')).toBe(true);
      expect(isValidDifficulty('senior')).toBe(true);
      expect(isValidDifficulty('founder')).toBe(true);
      expect(isValidDifficulty('invalid')).toBe(false);
      expect(isValidDifficulty('')).toBe(false);
    });
  });
});

describe('DIFFICULTY_LEVELS', () => {
  it('should have all required difficulties', () => {
    expect(Object.keys(DIFFICULTY_LEVELS)).toEqual(['intern', 'junior', 'senior', 'founder']);
  });

  it('should have increasing workday lengths', () => {
    const workdays = Object.values(DIFFICULTY_LEVELS).map(d => d.workdayLength);
    expect(workdays).toEqual([360, 480, 600, 840]);
  });

  it('should have decreasing optimal zone sizes', () => {
    const zones = Object.values(DIFFICULTY_LEVELS).map(d => d.optimalZoneSize);
    expect(zones).toEqual([50, 40, 30, 20]);
  });

  it('should have increasing caffeine depletion rates', () => {
    const rates = Object.values(DIFFICULTY_LEVELS).map(d => d.caffeineDepletionRate);
    expect(rates).toEqual([0.5, 0.75, 1.0, 1.5]);
  });

  it('should have all required properties', () => {
    Object.values(DIFFICULTY_LEVELS).forEach(config => {
      expect(config).toHaveProperty('id');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('workdayLength');
      expect(config).toHaveProperty('optimalZoneSize');
      expect(config).toHaveProperty('caffeineDepletionRate');
      expect(config).toHaveProperty('description');
      expect(config).toHaveProperty('caffeineDepletionMultiplier');
      expect(config).toHaveProperty('healthDepletionMultiplier');
      expect(config).toHaveProperty('drinkEffectivenessMultiplier');
      expect(config).toHaveProperty('scoreMultiplier');
      expect(config).toHaveProperty('reactionTimeWindow');
      expect(config).toHaveProperty('maxSimultaneousTasks');
      expect(config).toHaveProperty('crashSeverityMultiplier');
      expect(config).toHaveProperty('toleranceBuildup');
    });
  });
});