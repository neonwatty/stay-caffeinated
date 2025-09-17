/**
 * Tests for Local Storage Management System
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageManager, STORAGE_KEYS, resetStorageManager, getStorageManager } from '../storage';
import type { Achievement, PlayerProfile, PlayerStatistics } from '@/types/achievements';

describe('StorageManager', () => {
  let storageManager: StorageManager;
  let localStorageMock: Storage;

  beforeEach(() => {
    // Reset the storage manager singleton
    resetStorageManager();

    // Create a mock localStorage
    const store: Record<string, string> = {};
    localStorageMock = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
      length: 0,
      key: vi.fn(() => null),
    };

    // Mock localStorage in global scope
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    storageManager = new StorageManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Storage Availability', () => {
    it('should detect when localStorage is available', () => {
      const manager = new StorageManager();
      expect(manager).toBeDefined();
    });

    it('should handle localStorage not being available', () => {
      // Simulate localStorage throwing an error
      Object.defineProperty(window, 'localStorage', {
        get: () => {
          throw new Error('localStorage not available');
        },
        configurable: true,
      });

      resetStorageManager();
      const manager = new StorageManager();
      expect(manager).toBeDefined();
    });
  });

  describe('Player Profile', () => {
    it('should save and retrieve player profile', () => {
      const profile: Partial<PlayerProfile> = {
        id: 'test-user',
        username: 'TestPlayer',
        level: 5,
        experience: 1500,
      };

      const saved = storageManager.savePlayerProfile(profile);
      expect(saved).toBe(true);

      const retrieved = storageManager.getPlayerProfile();
      expect(retrieved).toMatchObject(profile);
    });

    it('should merge updates with existing profile', () => {
      const initial: Partial<PlayerProfile> = {
        id: 'test-user',
        username: 'TestPlayer',
        level: 5,
      };

      storageManager.savePlayerProfile(initial);

      const update: Partial<PlayerProfile> = {
        level: 6,
        experience: 2000,
      };

      storageManager.savePlayerProfile(update);

      const retrieved = storageManager.getPlayerProfile();
      expect(retrieved).toMatchObject({
        id: 'test-user',
        username: 'TestPlayer',
        level: 6,
        experience: 2000,
      });
    });
  });

  describe('High Scores', () => {
    it('should save and retrieve high scores', () => {
      const scores = [
        { score: 1000, difficulty: 'easy', date: '2024-01-01', duration: 180, drinksConsumed: 5 },
        { score: 2000, difficulty: 'hard', date: '2024-01-02', duration: 240, drinksConsumed: 8 },
      ];

      const saved = storageManager.saveHighScores(scores);
      expect(saved).toBe(true);

      const retrieved = storageManager.getHighScores();
      expect(retrieved.easy).toBeDefined();
      expect(retrieved.hard).toBeDefined();
      expect(retrieved.easy[0].score).toBe(1000);
      expect(retrieved.hard[0].score).toBe(2000);
    });

    it('should add new high score and maintain top 10', () => {
      // Add initial scores
      const initialScores = Array.from({ length: 12 }, (_, i) => ({
        score: (i + 1) * 100,
        difficulty: 'normal',
        date: `2024-01-${i + 1}`,
        duration: 180,
        drinksConsumed: 5,
      }));

      storageManager.saveHighScores(initialScores);

      // Add a new high score
      const newScore = {
        score: 1500,
        difficulty: 'normal',
        date: '2024-01-15',
        duration: 200,
        drinksConsumed: 7,
      };

      storageManager.addHighScore(newScore);

      const retrieved = storageManager.getHighScores();
      expect(retrieved.normal).toHaveLength(10); // Should only keep top 10
      expect(retrieved.normal[0].score).toBe(1500); // New high score should be first
    });
  });

  describe('Achievements', () => {
    it('should save and retrieve achievements', () => {
      const achievements: Achievement[] = [
        {
          id: 'first-win',
          name: 'First Victory',
          description: 'Win your first game',
          icon: '🏆',
          category: 'gameplay',
          rarity: 'common',
          points: 10,
          unlocked: false,
          requirement: {
            type: 'special',
            value: 1,
            comparison: 'equal',
          },
        },
      ];

      const saved = storageManager.saveAchievements(achievements);
      expect(saved).toBe(true);

      const retrieved = storageManager.getAchievements();
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('first-win');
    });

    it('should unlock achievement', () => {
      const achievements: Achievement[] = [
        {
          id: 'test-achievement',
          name: 'Test Achievement',
          description: 'Test',
          icon: '🎯',
          category: 'gameplay',
          rarity: 'common',
          points: 10,
          unlocked: false,
          requirement: {
            type: 'score',
            value: 100,
            comparison: 'greater',
          },
        },
      ];

      storageManager.saveAchievements(achievements);

      const unlocked = storageManager.unlockAchievement('test-achievement');
      expect(unlocked).toBe(true);

      const retrieved = storageManager.getAchievements();
      expect(retrieved[0].unlocked).toBe(true);
      expect(retrieved[0].unlockedAt).toBeDefined();
    });

    it('should not unlock already unlocked achievement', () => {
      const achievements: Achievement[] = [
        {
          id: 'test-achievement',
          name: 'Test Achievement',
          description: 'Test',
          icon: '🎯',
          category: 'gameplay',
          rarity: 'common',
          points: 10,
          unlocked: true,
          unlockedAt: new Date('2024-01-01'),
          requirement: {
            type: 'score',
            value: 100,
            comparison: 'greater',
          },
        },
      ];

      storageManager.saveAchievements(achievements);

      const unlocked = storageManager.unlockAchievement('test-achievement');
      expect(unlocked).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should save and retrieve statistics', () => {
      const stats: PlayerStatistics = {
        totalPlayTime: 3600,
        averageScore: 1500,
        highScore: 3000,
        totalDrinksConsumed: 50,
        drinkBreakdown: { coffee: 30, tea: 20 },
        averageCaffeineLevel: 65,
        timeInOptimalZone: 2400,
        perfectDays: 5,
        crashCount: 2,
        explosionCount: 1,
      };

      const saved = storageManager.saveStatistics(stats);
      expect(saved).toBe(true);

      const retrieved = storageManager.getStatistics();
      expect(retrieved).toMatchObject(stats);
    });

    it('should update statistics with partial data', () => {
      const initial: PlayerStatistics = {
        totalPlayTime: 1000,
        averageScore: 500,
        highScore: 1000,
        totalDrinksConsumed: 10,
        drinkBreakdown: { coffee: 10 },
        averageCaffeineLevel: 50,
        timeInOptimalZone: 500,
        perfectDays: 1,
        crashCount: 0,
        explosionCount: 0,
      };

      storageManager.saveStatistics(initial);

      const updated = storageManager.updateStatistics({
        highScore: 2000,
        totalDrinksConsumed: 15,
      });

      expect(updated).toBe(true);

      const retrieved = storageManager.getStatistics();
      expect(retrieved?.highScore).toBe(2000);
      expect(retrieved?.totalDrinksConsumed).toBe(15);
      expect(retrieved?.totalPlayTime).toBe(1000); // Should remain unchanged
    });
  });

  describe('Data Corruption Handling', () => {
    it('should handle corrupted data gracefully', () => {
      // Inject corrupted data directly into localStorage
      localStorageMock.setItem(STORAGE_KEYS.PLAYER_PROFILE, 'corrupted{data}not-json');

      // Should remove corrupted data on validation
      resetStorageManager();
      const manager = new StorageManager();

      const profile = manager.getPlayerProfile();
      expect(profile).toBeNull();
    });

    it('should validate checksum when available', () => {
      const consoleSpy = vi.spyOn(console, 'warn');

      // Create data with incorrect checksum
      const tamperedData = {
        data: { test: 'value' },
        metadata: {
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
          checksum: 'wrong-checksum',
        },
      };

      localStorageMock.setItem(STORAGE_KEYS.GAME_SETTINGS, JSON.stringify(tamperedData));

      const retrieved = storageManager.getSettings();
      expect(retrieved).toMatchObject({ test: 'value' });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Checksum mismatch'));
    });
  });

  describe('Storage Quota Management', () => {
    it('should calculate storage size', () => {
      const data = { test: new Array(100).join('x') }; // ~100 bytes
      storageManager.saveSettings(data);

      const size = storageManager.getStorageSize();
      expect(size).toBeGreaterThan(0);
    });

    it('should handle quota exceeded errors', () => {
      const consoleSpy = vi.spyOn(console, 'error');

      // Simulate quota exceeded error
      localStorageMock.setItem = vi.fn(() => {
        const error = new DOMException('QuotaExceededError');
        throw error;
      });

      const saved = storageManager.saveSettings({ test: 'value' });
      expect(saved).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save'),
        expect.any(DOMException)
      );
    });
  });

  describe('Data Export/Import', () => {
    it('should export all data', () => {
      storageManager.savePlayerProfile({ id: 'test', username: 'TestUser' } as PlayerProfile);
      storageManager.saveSettings({ theme: 'dark' });

      const exported = storageManager.exportData();
      expect(exported.version).toBe('1.0.0');
      expect(exported.exportDate).toBeDefined();
      expect(exported.data).toBeDefined();
    });

    it('should import data from backup', () => {
      const backup = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        data: {
          PLAYER_PROFILE: { id: 'imported', username: 'ImportedUser' },
          GAME_SETTINGS: { theme: 'light' },
        },
      };

      const success = storageManager.importData(backup);
      expect(success).toBe(true);

      const profile = storageManager.getPlayerProfile();
      expect(profile?.username).toBe('ImportedUser');

      const settings = storageManager.getSettings();
      expect(settings.theme).toBe('light');
    });

    it('should handle import errors gracefully', () => {
      const invalidBackup = { invalid: 'data' };

      const success = storageManager.importData(invalidBackup);
      expect(success).toBe(false);
    });
  });

  describe('Clear Storage', () => {
    it('should clear all storage data', () => {
      storageManager.savePlayerProfile({ id: 'test' } as PlayerProfile);
      storageManager.saveSettings({ test: 'value' });

      storageManager.clearAll();

      expect(storageManager.getPlayerProfile()).toBeNull();
      expect(storageManager.getSettings()).toEqual({});
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = getStorageManager();
      const instance2 = getStorageManager();
      expect(instance1).toBe(instance2);
    });

    it('should reset singleton', () => {
      const instance1 = getStorageManager();
      resetStorageManager();
      const instance2 = getStorageManager();
      expect(instance1).not.toBe(instance2);
    });
  });
});