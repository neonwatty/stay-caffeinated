/**
 * Tests for the Achievements System
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AchievementTracker, createAchievementTracker, ACHIEVEMENT_DEFINITIONS } from '../achievements';
import type { Achievement } from '@/types/achievements';

// Mock the storage manager
vi.mock('@/utils/storage', () => ({
  StorageManager: vi.fn().mockImplementation(() => ({
    getAchievements: vi.fn().mockReturnValue([]),
    saveAchievements: vi.fn(),
    getStatistics: vi.fn().mockReturnValue({ totalDrinksConsumed: 10 }),
  })),
  STORAGE_KEYS: {
    ACHIEVEMENTS: 'stayCaffeinated_achievements',
  },
}));

describe('AchievementTracker', () => {
  let achievementTracker: AchievementTracker;
  let onAchievementUnlocked: ReturnType<typeof vi.fn>;
  let onProgressUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    onAchievementUnlocked = vi.fn();
    onProgressUpdate = vi.fn();

    achievementTracker = new AchievementTracker({
      onAchievementUnlocked,
      onProgressUpdate,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Achievement Definitions', () => {
    it('should have five achievement definitions', () => {
      const achievements = achievementTracker.getAchievements();
      expect(achievements).toHaveLength(5);
    });

    it('should have achievements with different rarities', () => {
      const achievements = achievementTracker.getAchievements();
      const rarities = achievements.map(a => a.rarity);

      expect(rarities).toContain('common');
      expect(rarities).toContain('uncommon');
      expect(rarities).toContain('rare');
      expect(rarities).toContain('epic');
      expect(rarities).toContain('legendary');
    });

    it('should have correct point values for rarities', () => {
      const achievements = achievementTracker.getAchievements();

      const common = achievements.find(a => a.rarity === 'common');
      const legendary = achievements.find(a => a.rarity === 'legendary');

      expect(common?.points).toBe(10);
      expect(legendary?.points).toBe(100);
    });
  });

  describe('Drink Tracking', () => {
    it('should unlock first sip achievement on first drink', () => {
      achievementTracker.trackDrinkConsumed();

      expect(onAchievementUnlocked).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'firstSip',
          unlocked: true,
        })
      );
    });

    it('should update caffeine addict progress', () => {
      // Track multiple drinks
      for (let i = 0; i < 5; i++) {
        achievementTracker.trackDrinkConsumed();
      }

      // Progress should be updated (10 from storage + 5 new = 15)
      expect(onProgressUpdate).toHaveBeenCalledWith('caffeineAddict', 15);
    });

    it('should not unlock same achievement twice', () => {
      achievementTracker.trackDrinkConsumed(); // First drink - unlocks
      onAchievementUnlocked.mockClear();

      achievementTracker.trackDrinkConsumed(); // Second drink - should not unlock again

      expect(onAchievementUnlocked).not.toHaveBeenCalled();
    });
  });

  describe('Score Tracking', () => {
    it('should unlock high achiever at 10000 points', () => {
      achievementTracker.trackScore(10000);

      expect(onAchievementUnlocked).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'highAchiever',
          unlocked: true,
        })
      );
    });

    it('should not unlock high achiever below threshold', () => {
      achievementTracker.trackScore(9999);

      expect(onAchievementUnlocked).not.toHaveBeenCalled();
    });
  });

  describe('Survival Tracking', () => {
    it('should unlock survivor after 10 minutes', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      // Simulate 10 minutes of survival
      const tenMinutes = 600000;
      vi.setSystemTime(startTime + tenMinutes);

      achievementTracker.trackSurvival(startTime + tenMinutes);

      expect(onAchievementUnlocked).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'survivor',
          unlocked: true,
        })
      );
    });

    it('should not unlock survivor before 10 minutes', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      // Simulate 9 minutes of survival
      const nineMinutes = 540000;
      vi.setSystemTime(startTime + nineMinutes);

      achievementTracker.trackSurvival(startTime + nineMinutes);

      expect(onAchievementUnlocked).not.toHaveBeenCalled();
    });
  });

  describe('Optimal Zone Tracking', () => {
    it('should unlock perfect balance after 5 minutes in optimal zone', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      // Enter optimal zone
      achievementTracker.trackOptimalZone(true, startTime);

      // Stay in optimal zone for 5 minutes
      const fiveMinutes = 300000;
      vi.setSystemTime(startTime + fiveMinutes);
      achievementTracker.trackOptimalZone(true, startTime + fiveMinutes);

      expect(onAchievementUnlocked).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'perfectBalance',
          unlocked: true,
        })
      );
    });

    it('should reset streak when leaving optimal zone', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      // Enter optimal zone
      achievementTracker.trackOptimalZone(true, startTime);

      // Stay for 2 minutes
      vi.setSystemTime(startTime + 120000);
      achievementTracker.trackOptimalZone(true, startTime + 120000);

      // Leave optimal zone
      achievementTracker.trackOptimalZone(false, startTime + 120000);

      // Re-enter and stay for 4 minutes (less than 5 minutes required)
      achievementTracker.trackOptimalZone(true, startTime + 130000);
      vi.setSystemTime(startTime + 370000); // 240 seconds after re-entry
      achievementTracker.trackOptimalZone(true, startTime + 370000);

      expect(onAchievementUnlocked).not.toHaveBeenCalled();

      // Continue for 1 more minute to reach 5 minutes from re-entry
      vi.setSystemTime(startTime + 430000); // 300 seconds after re-entry
      achievementTracker.trackOptimalZone(true, startTime + 430000);

      // Now it should unlock as we've been in the zone for 5 minutes straight
      expect(onAchievementUnlocked).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'perfectBalance',
          unlocked: true,
        })
      );
    });
  });

  describe('Achievement Management', () => {
    it('should get all achievements', () => {
      const achievements = achievementTracker.getAchievements();
      expect(achievements).toHaveLength(5);
      expect(achievements[0]).toHaveProperty('id');
      expect(achievements[0]).toHaveProperty('name');
      expect(achievements[0]).toHaveProperty('description');
    });

    it('should get only unlocked achievements', () => {
      // Initially no achievements unlocked
      expect(achievementTracker.getUnlockedAchievements()).toHaveLength(0);

      // Unlock first sip
      achievementTracker.trackDrinkConsumed();

      expect(achievementTracker.getUnlockedAchievements()).toHaveLength(1);
    });

    it('should get achievement by ID', () => {
      const achievement = achievementTracker.getAchievement('firstSip');
      expect(achievement).toBeDefined();
      expect(achievement?.id).toBe('firstSip');
      expect(achievement?.name).toBe('First Sip');
    });

    it('should calculate total points', () => {
      // Initially 0 points
      expect(achievementTracker.getTotalPoints()).toBe(0);

      // Unlock first sip (10 points)
      achievementTracker.trackDrinkConsumed();

      expect(achievementTracker.getTotalPoints()).toBe(10);

      // Unlock high achiever (75 points)
      achievementTracker.trackScore(10000);

      expect(achievementTracker.getTotalPoints()).toBe(85);
    });

    it('should calculate completion percentage', () => {
      // Initially 0%
      expect(achievementTracker.getCompletionPercentage()).toBe(0);

      // Unlock one achievement (1/5 = 20%)
      achievementTracker.trackDrinkConsumed();

      expect(achievementTracker.getCompletionPercentage()).toBe(20);
    });
  });

  describe('Session Management', () => {
    it('should reset session stats', () => {
      // Track some progress
      achievementTracker.trackDrinkConsumed();
      achievementTracker.trackScore(5000);

      // Reset session
      achievementTracker.resetSessionStats();

      // New drink should unlock first sip again (if it wasn't already unlocked)
      // But since it was already unlocked, it shouldn't trigger again
      onAchievementUnlocked.mockClear();
      achievementTracker.trackDrinkConsumed();

      expect(onAchievementUnlocked).not.toHaveBeenCalled();
    });

    it('should reset all achievements', () => {
      // Unlock some achievements
      achievementTracker.trackDrinkConsumed();
      achievementTracker.trackScore(10000);

      expect(achievementTracker.getUnlockedAchievements()).toHaveLength(2);

      // Reset all
      achievementTracker.resetAllAchievements();

      expect(achievementTracker.getUnlockedAchievements()).toHaveLength(0);
    });
  });

  describe('Import/Export', () => {
    it('should export achievements data', () => {
      achievementTracker.trackDrinkConsumed();

      const exported = achievementTracker.exportAchievements();
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveProperty('achievements');
      expect(parsed).toHaveProperty('totalPoints');
      expect(parsed).toHaveProperty('completionPercentage');
      expect(parsed).toHaveProperty('exportDate');
      expect(parsed.totalPoints).toBe(10);
    });

    it('should import achievements data', () => {
      const exportData = {
        achievements: [
          {
            ...ACHIEVEMENT_DEFINITIONS.firstSip,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          },
          {
            ...ACHIEVEMENT_DEFINITIONS.highAchiever,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          },
        ],
      };

      const success = achievementTracker.importAchievements(JSON.stringify(exportData));

      expect(success).toBe(true);
      expect(achievementTracker.getUnlockedAchievements()).toHaveLength(2);
      expect(achievementTracker.getTotalPoints()).toBe(85);
    });

    it('should handle invalid import data', () => {
      const success = achievementTracker.importAchievements('invalid json');
      expect(success).toBe(false);
    });
  });

  describe('Factory Function', () => {
    it('should create achievement tracker with factory function', () => {
      const tracker = createAchievementTracker({
        onAchievementUnlocked: vi.fn(),
      });

      expect(tracker).toBeInstanceOf(AchievementTracker);
      expect(tracker.getAchievements()).toHaveLength(5);
    });
  });
});