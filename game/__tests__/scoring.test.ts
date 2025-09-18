/**
 * Tests for the Scoring System
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  EnhancedScoringSystem,
  LeaderboardManager,
  createScoringSystem,
  createLeaderboardManager,
} from '../scoring';
import type { LeaderboardEntry } from '../scoring';

// Mock the storage manager
vi.mock('@/utils/storage', () => ({
  StorageManager: vi.fn().mockImplementation(() => ({
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
  })),
}));

describe('EnhancedScoringSystem', () => {
  let scoringSystem: EnhancedScoringSystem;

  beforeEach(() => {
    vi.useFakeTimers();
    scoringSystem = new EnhancedScoringSystem();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Score Calculation', () => {
    it('should calculate base score correctly', () => {
      const frameScore = scoringSystem.updateScore(1000, {
        isInOptimalZone: false,
        streakTime: 0,
        difficulty: 'intern',
        healthLevel: 100,
        caffeineLevel: 50,
      });

      expect(frameScore).toBe(10); // 10 points per second * 1 second
      expect(scoringSystem.getCurrentScore()).toBe(10);
    });

    it('should apply optimal zone multiplier', () => {
      const frameScore = scoringSystem.updateScore(1000, {
        isInOptimalZone: true,
        streakTime: 0,
        difficulty: 'intern',
        healthLevel: 100,
        caffeineLevel: 75,
      });

      expect(frameScore).toBe(20); // 10 * 2 (optimal multiplier)
    });

    it('should apply difficulty multiplier', () => {
      const frameScore = scoringSystem.updateScore(1000, {
        isInOptimalZone: false,
        streakTime: 0,
        difficulty: 'senior',
        healthLevel: 100,
        caffeineLevel: 50,
      });

      expect(frameScore).toBe(20); // 10 * 2 (senior difficulty)
    });

    it('should apply streak bonus', () => {
      const frameScore = scoringSystem.updateScore(1000, {
        isInOptimalZone: false,
        streakTime: 60000, // 60 seconds
        difficulty: 'intern',
        healthLevel: 100,
        caffeineLevel: 50,
      });

      expect(frameScore).toBe(20); // 10 * (1 + 60/60) = 10 * 2
    });

    it('should stack all multipliers', () => {
      const frameScore = scoringSystem.updateScore(1000, {
        isInOptimalZone: true,
        streakTime: 60000,
        difficulty: 'founder',
        healthLevel: 100,
        caffeineLevel: 75,
      });

      // Base: 10
      // Optimal: x2 = 20
      // Streak: x2 = 40
      // Difficulty: x3 = 120
      expect(frameScore).toBe(120);
    });
  });

  describe('Multipliers', () => {
    it('should add and apply multipliers', () => {
      scoringSystem.addMultiplier('powerup', 2);

      const frameScore = scoringSystem.updateScore(1000, {
        isInOptimalZone: false,
        streakTime: 0,
        difficulty: 'intern',
        healthLevel: 100,
        caffeineLevel: 50,
      });

      expect(frameScore).toBe(20); // 10 * 2 (multiplier)
    });

    it('should stack multiple multipliers', () => {
      scoringSystem.addMultiplier('powerup1', 2);
      scoringSystem.addMultiplier('powerup2', 1.5);

      const frameScore = scoringSystem.updateScore(1000, {
        isInOptimalZone: false,
        streakTime: 0,
        difficulty: 'intern',
        healthLevel: 100,
        caffeineLevel: 50,
      });

      expect(frameScore).toBe(30); // 10 * 2 * 1.5
    });

    it('should expire timed multipliers', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      scoringSystem.addMultiplier('timed', 2, 5000);

      // Before expiry
      let frameScore = scoringSystem.updateScore(1000, {
        isInOptimalZone: false,
        streakTime: 0,
        difficulty: 'intern',
        healthLevel: 100,
        caffeineLevel: 50,
      });
      expect(frameScore).toBe(20);

      // After expiry
      vi.setSystemTime(now + 6000);
      frameScore = scoringSystem.updateScore(1000, {
        isInOptimalZone: false,
        streakTime: 0,
        difficulty: 'intern',
        healthLevel: 100,
        caffeineLevel: 50,
      });
      expect(frameScore).toBe(10); // Multiplier expired
    });

    it('should remove multipliers', () => {
      scoringSystem.addMultiplier('test', 2);
      scoringSystem.removeMultiplier('test');

      const frameScore = scoringSystem.updateScore(1000, {
        isInOptimalZone: false,
        streakTime: 0,
        difficulty: 'intern',
        healthLevel: 100,
        caffeineLevel: 50,
      });

      expect(frameScore).toBe(10); // No multiplier
    });
  });

  describe('Bonus System', () => {
    it('should add bonus points for events', () => {
      scoringSystem.addBonus('perfect_timing');

      const frameScore = scoringSystem.updateScore(1000, {
        isInOptimalZone: false,
        streakTime: 0,
        difficulty: 'intern',
        healthLevel: 100,
        caffeineLevel: 50,
      });

      expect(frameScore).toBe(260); // 10 + 250 bonus
    });

    it('should scale bonus with context value', () => {
      const bonus = scoringSystem.addBonus('streak_milestone', 50);

      expect(bonus).toBe(1500); // 1000 * (1 + 50/100)
    });

    it('should track event completions', () => {
      scoringSystem.trackEventComplete();

      const metrics = scoringSystem.getMetrics();
      expect(metrics.eventsCompleted).toBe(1);
      expect(metrics.bonusesEarned).toBe(1000);
    });

    it('should track powerup chains', () => {
      scoringSystem.trackPowerupUsed();
      scoringSystem.trackPowerupUsed();
      scoringSystem.trackPowerupUsed();

      const metrics = scoringSystem.getMetrics();
      expect(metrics.powerupsUsed).toBe(3);
      expect(metrics.bonusesEarned).toBe(300); // Chain bonus
    });

    it('should track perfect actions', () => {
      for (let i = 0; i < 5; i++) {
        scoringSystem.trackPerfectAction();
      }

      const metrics = scoringSystem.getMetrics();
      expect(metrics.perfectActions).toBe(5);
      expect(metrics.bonusesEarned).toBe(250); // Perfect timing bonus
    });
  });

  describe('Milestones', () => {
    it('should trigger milestone bonuses', () => {
      // Accumulate score to reach 1000 milestone
      for (let i = 0; i < 100; i++) {
        scoringSystem.updateScore(1000, {
          isInOptimalZone: false,
          streakTime: 0,
          difficulty: 'intern',
          healthLevel: 100,
          caffeineLevel: 50,
        });
      }

      const metrics = scoringSystem.getMetrics();
      expect(metrics.bonusesEarned).toBeGreaterThan(0);
    });

    it('should not trigger same milestone twice', () => {
      // Reach 1000 milestone
      for (let i = 0; i < 100; i++) {
        scoringSystem.updateScore(1000, {
          isInOptimalZone: false,
          streakTime: 0,
          difficulty: 'intern',
          healthLevel: 100,
          caffeineLevel: 50,
        });
      }

      const metrics1 = scoringSystem.getMetrics();
      const bonuses1 = metrics1.bonusesEarned;

      // Add more score but don't reach next milestone
      scoringSystem.updateScore(1000, {
        isInOptimalZone: false,
        streakTime: 0,
        difficulty: 'intern',
        healthLevel: 100,
        caffeineLevel: 50,
      });

      const metrics2 = scoringSystem.getMetrics();
      expect(metrics2.bonusesEarned).toBe(bonuses1);
    });
  });

  describe('Final Score Calculation', () => {
    it('should calculate detailed breakdown', () => {
      // Setup some gameplay
      scoringSystem.updateScore(10000, {
        isInOptimalZone: true,
        streakTime: 30000,
        difficulty: 'junior',
        healthLevel: 100,
        caffeineLevel: 75,
      });

      scoringSystem.trackEventComplete();
      scoringSystem.trackPowerupUsed();
      scoringSystem.trackPerfectAction();

      const breakdown = scoringSystem.calculateFinalScore(
        {
          score: scoringSystem.getCurrentScore(),
          currentHealthLevel: 80,
          currentCaffeineLevel: 70,
          streak: 30,
        } as any,
        'junior',
        true
      );

      expect(breakdown.baseScore).toBeGreaterThan(0);
      expect(breakdown.timeBonus).toBeGreaterThan(0);
      expect(breakdown.optimalBonus).toBeGreaterThan(0);
      expect(breakdown.eventBonus).toBe(1000);
      expect(breakdown.powerupBonus).toBe(500);
      expect(breakdown.difficultyMultiplier).toBe(1.5);
      expect(breakdown.totalScore).toBeGreaterThan(0);
    });

    it('should apply victory bonus', () => {
      const breakdownWin = scoringSystem.calculateFinalScore(
        { score: 1000, currentHealthLevel: 100, currentCaffeineLevel: 75 } as any,
        'intern',
        true
      );

      const breakdownLoss = scoringSystem.calculateFinalScore(
        { score: 1000, currentHealthLevel: 100, currentCaffeineLevel: 75 } as any,
        'intern',
        false
      );

      expect(breakdownWin.totalScore).toBeGreaterThan(breakdownLoss.totalScore);
    });
  });

  describe('Score Formatting', () => {
    it('should format scores correctly', () => {
      expect(scoringSystem.formatScore(500)).toBe('500');
      expect(scoringSystem.formatScore(1500)).toBe('1.5K');
      expect(scoringSystem.formatScore(1500000)).toBe('1.50M');
    });

    it('should get correct rank', () => {
      const rankF = scoringSystem.getScoreRank(1000);
      expect(rankF.rank).toBe('F');

      const rankS = scoringSystem.getScoreRank(100000);
      expect(rankS.rank).toBe('S+');
      expect(rankS.color).toBe('#FFD700');
      expect(rankS.title).toBe('Legendary');
    });
  });

  describe('Reset', () => {
    it('should reset all values', () => {
      scoringSystem.updateScore(10000, {
        isInOptimalZone: true,
        streakTime: 30000,
        difficulty: 'intern',
        healthLevel: 100,
        caffeineLevel: 75,
      });

      scoringSystem.addMultiplier('test', 2);
      scoringSystem.trackEventComplete();

      scoringSystem.reset();

      expect(scoringSystem.getCurrentScore()).toBe(0);
      const metrics = scoringSystem.getMetrics();
      expect(metrics.eventsCompleted).toBe(0);
      expect(metrics.bonusesEarned).toBe(0);
    });
  });

  describe('Factory Function', () => {
    it('should create scoring system with custom config', () => {
      const system = createScoringSystem({
        baseScoreRate: 20,
        optimalMultiplier: 3,
      });

      const frameScore = system.updateScore(1000, {
        isInOptimalZone: true,
        streakTime: 0,
        difficulty: 'intern',
        healthLevel: 100,
        caffeineLevel: 75,
      });

      expect(frameScore).toBe(60); // 20 * 3
    });
  });
});

describe('LeaderboardManager', () => {
  let leaderboardManager: LeaderboardManager;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    leaderboardManager = new LeaderboardManager();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createTestEntry = (
    score: number,
    playerName: string = 'TestPlayer',
    date: Date = new Date()
  ): Omit<LeaderboardEntry, 'rank'> => ({
    playerName,
    score,
    difficulty: 'junior',
    date,
    stats: {
      survivalTime: 60000,
      optimalTime: 30000,
      drinksConsumed: 5,
      eventsCompleted: 3,
      powerupsUsed: 2,
    },
  });

  describe('Adding Scores', () => {
    it('should add score to all relevant leaderboards', () => {
      leaderboardManager.addScore(createTestEntry(1000));

      const daily = leaderboardManager.getLeaderboard('daily');
      const weekly = leaderboardManager.getLeaderboard('weekly');
      const allTime = leaderboardManager.getLeaderboard('allTime');

      expect(daily).toHaveLength(1);
      expect(weekly).toHaveLength(1);
      expect(allTime).toHaveLength(1);
    });

    it('should sort scores correctly', () => {
      leaderboardManager.addScore(createTestEntry(1000, 'Player1'));
      leaderboardManager.addScore(createTestEntry(2000, 'Player2'));
      leaderboardManager.addScore(createTestEntry(1500, 'Player3'));

      const allTime = leaderboardManager.getLeaderboard('allTime');

      expect(allTime[0].playerName).toBe('Player2');
      expect(allTime[0].rank).toBe(1);
      expect(allTime[1].playerName).toBe('Player3');
      expect(allTime[1].rank).toBe(2);
      expect(allTime[2].playerName).toBe('Player1');
      expect(allTime[2].rank).toBe(3);
    });

    it('should limit entries to max count', () => {
      for (let i = 0; i < 150; i++) {
        leaderboardManager.addScore(createTestEntry(i, `Player${i}`));
      }

      const allTime = leaderboardManager.getLeaderboard('allTime');
      expect(allTime).toHaveLength(100);
    });
  });

  describe('Time-based Leaderboards', () => {
    it('should add to daily only for today', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      leaderboardManager.addScore(createTestEntry(1000, 'Today', today));
      leaderboardManager.addScore(createTestEntry(2000, 'Yesterday', yesterday));

      const daily = leaderboardManager.getLeaderboard('daily');
      expect(daily).toHaveLength(1);
      expect(daily[0].playerName).toBe('Today');
    });

    it('should add to weekly for past week', () => {
      const today = new Date();
      const sixDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      const eightDaysAgo = new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000);

      leaderboardManager.addScore(createTestEntry(1000, 'Recent', sixDaysAgo));
      leaderboardManager.addScore(createTestEntry(2000, 'Old', eightDaysAgo));

      const weekly = leaderboardManager.getLeaderboard('weekly');
      expect(weekly).toHaveLength(1);
      expect(weekly[0].playerName).toBe('Recent');
    });
  });

  describe('Player Rank', () => {
    it('should get player rank correctly', () => {
      leaderboardManager.addScore(createTestEntry(1000, 'Player1'));
      leaderboardManager.addScore(createTestEntry(2000, 'Player2'));
      leaderboardManager.addScore(createTestEntry(1500, 'Player3'));

      expect(leaderboardManager.getPlayerRank('Player2', 'allTime')).toBe(1);
      expect(leaderboardManager.getPlayerRank('Player3', 'allTime')).toBe(2);
      expect(leaderboardManager.getPlayerRank('Player1', 'allTime')).toBe(3);
    });

    it('should return null for unknown player', () => {
      leaderboardManager.addScore(createTestEntry(1000, 'Player1'));

      expect(leaderboardManager.getPlayerRank('Unknown', 'allTime')).toBeNull();
    });
  });

  describe('Statistics', () => {
    it('should calculate leaderboard statistics', () => {
      leaderboardManager.addScore(createTestEntry(1000));
      leaderboardManager.addScore(createTestEntry(2000));
      leaderboardManager.addScore(createTestEntry(3000));

      const stats = leaderboardManager.getStatistics('allTime');

      expect(stats.totalPlayers).toBe(3);
      expect(stats.averageScore).toBe(2000);
      expect(stats.topScore).toBe(3000);
      expect(stats.medianScore).toBe(2000);
    });

    it('should handle empty leaderboard', () => {
      const stats = leaderboardManager.getStatistics('daily');

      expect(stats.totalPlayers).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.topScore).toBe(0);
      expect(stats.medianScore).toBe(0);
    });
  });

  describe('Cleanup', () => {
    it('should clean up old daily entries', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      leaderboardManager.addScore(createTestEntry(1000, 'Today', today));
      leaderboardManager.addScore(createTestEntry(2000, 'Yesterday', yesterday));

      leaderboardManager.cleanupOldEntries();

      const daily = leaderboardManager.getLeaderboard('daily');
      expect(daily).toHaveLength(1);
      expect(daily[0].playerName).toBe('Today');
    });
  });

  describe('Factory Function', () => {
    it('should create leaderboard manager', () => {
      const manager = createLeaderboardManager();
      expect(manager).toBeInstanceOf(LeaderboardManager);
    });
  });
});