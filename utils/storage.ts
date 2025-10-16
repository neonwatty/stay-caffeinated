/**
 * Local Storage Management System
 * Provides a robust persistence layer for game data with error handling and fallbacks
 */

import type { Achievement, PlayerProfile, PlayerStatistics } from '@/types/achievements';

/**
 * Storage keys for different data types
 */
export const STORAGE_KEYS = {
  PLAYER_PROFILE: 'stayCaffeinated_playerProfile',
  HIGH_SCORES: 'stayCaffeinated_highScores',
  ACHIEVEMENTS: 'stayCaffeinated_achievements',
  GAME_SETTINGS: 'stayCaffeinated_settings',
  STATISTICS: 'stayCaffeinated_statistics',
  LAST_SESSION: 'stayCaffeinated_lastSession',
  UNLOCKED_CONTENT: 'stayCaffeinated_unlockedContent',
} as const;

/**
 * Storage version for migration support
 */
const STORAGE_VERSION = '1.0.0';

/**
 * Storage metadata
 */
interface StorageMetadata {
  version: string;
  lastUpdated: string;
  checksum?: string;
}

/**
 * Storage item wrapper
 */
interface StorageItem<T> {
  data: T;
  metadata: StorageMetadata;
}

/**
 * High score entry
 */
export interface HighScoreEntry {
  score: number;
  difficulty: string;
  date: string;
  duration: number;
  drinksConsumed: number;
}

/**
 * Session data
 */
export interface SessionData {
  startTime: string;
  endTime?: string;
  totalPlayTime: number;
  gamesPlayed: number;
  highScore: number;
  achievements: string[];
}

/**
 * Storage Manager Class
 * Handles all localStorage operations with error handling and data validation
 */
export class StorageManager {
  private isAvailable: boolean;
  private cache: Map<string, unknown> = new Map();

  constructor() {
    this.isAvailable = this.checkStorageAvailability();
    if (this.isAvailable) {
      this.validateStorageIntegrity();
    }
  }

  /**
   * Check if localStorage is available
   */
  private checkStorageAvailability(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage is not available:', e);
      return false;
    }
  }

  /**
   * Validate storage integrity and handle corrupted data
   */
  private validateStorageIntegrity(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          JSON.parse(item);
        }
      } catch (e) {
        console.error(`Corrupted data detected for key ${key}, removing...`, e);
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Generate checksum for data integrity
   */
  private generateChecksum(data: unknown): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Set item in storage with metadata
   */
  public setItem<T>(key: string, data: T): boolean {
    if (!this.isAvailable) {
      this.cache.set(key, data);
      return true;
    }

    try {
      const item: StorageItem<T> = {
        data,
        metadata: {
          version: STORAGE_VERSION,
          lastUpdated: new Date().toISOString(),
          checksum: this.generateChecksum(data),
        },
      };

      localStorage.setItem(key, JSON.stringify(item));
      this.cache.set(key, data);
      return true;
    } catch (e) {
      console.error(`Failed to save ${key}:`, e);
      if (e instanceof DOMException && e.code === 22) {
        this.handleStorageQuotaExceeded();
      }
      return false;
    }
  }

  /**
   * Get item from storage with validation
   */
  public getItem<T>(key: string): T | null {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }

    if (!this.isAvailable) {
      return null;
    }

    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const item = JSON.parse(raw) as StorageItem<T>;

      // Validate checksum if present
      if (item.metadata?.checksum) {
        const currentChecksum = this.generateChecksum(item.data);
        if (currentChecksum !== item.metadata.checksum) {
          console.warn(`Checksum mismatch for ${key}, data may be corrupted`);
        }
      }

      this.cache.set(key, item.data);
      return item.data;
    } catch (e) {
      console.error(`Failed to retrieve ${key}:`, e);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  private removeItem(key: string): void {
    this.cache.delete(key);
    if (this.isAvailable) {
      localStorage.removeItem(key);
    }
  }

  /**
   * Handle storage quota exceeded
   */
  private handleStorageQuotaExceeded(): void {
    console.warn('Storage quota exceeded, attempting cleanup...');

    // Remove old session data first
    this.removeItem(STORAGE_KEYS.LAST_SESSION);

    // If still not enough space, remove statistics
    try {
      const testKey = '__quota_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (e) {
      this.removeItem(STORAGE_KEYS.STATISTICS);
    }
  }

  /**
   * Save player profile
   */
  savePlayerProfile(profile: Partial<PlayerProfile>): boolean {
    const existing = this.getPlayerProfile();
    const merged = { ...existing, ...profile };
    return this.setItem(STORAGE_KEYS.PLAYER_PROFILE, merged);
  }

  /**
   * Get player profile
   */
  getPlayerProfile(): PlayerProfile | null {
    return this.getItem<PlayerProfile>(STORAGE_KEYS.PLAYER_PROFILE);
  }

  /**
   * Save high scores
   */
  saveHighScores(scores: HighScoreEntry[]): boolean {
    // Keep only top 10 scores per difficulty
    const grouped = scores.reduce((acc, score) => {
      if (!acc[score.difficulty]) {
        acc[score.difficulty] = [];
      }
      acc[score.difficulty].push(score);
      return acc;
    }, {} as Record<string, HighScoreEntry[]>);

    // Sort and limit each difficulty group
    Object.keys(grouped).forEach(difficulty => {
      grouped[difficulty] = grouped[difficulty]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    });

    return this.setItem(STORAGE_KEYS.HIGH_SCORES, grouped);
  }

  /**
   * Get high scores
   */
  getHighScores(): Record<string, HighScoreEntry[]> {
    return this.getItem<Record<string, HighScoreEntry[]>>(STORAGE_KEYS.HIGH_SCORES) || {};
  }

  /**
   * Add new high score
   */
  addHighScore(score: HighScoreEntry): boolean {
    const scores = this.getHighScores();
    const difficultyScores = scores[score.difficulty] || [];
    difficultyScores.push(score);

    // Sort and keep top 10
    scores[score.difficulty] = difficultyScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return this.setItem(STORAGE_KEYS.HIGH_SCORES, scores);
  }

  /**
   * Save achievements
   */
  saveAchievements(achievements: Achievement[]): boolean {
    return this.setItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }

  /**
   * Get achievements
   */
  getAchievements(): Achievement[] {
    return this.getItem<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS) || [];
  }

  /**
   * Unlock achievement
   */
  unlockAchievement(achievementId: string): boolean {
    const achievements = this.getAchievements();
    const achievement = achievements.find(a => a.id === achievementId);

    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date();
      return this.saveAchievements(achievements);
    }

    return false;
  }

  /**
   * Save game settings
   */
  saveSettings(settings: Record<string, unknown>): boolean {
    return this.setItem(STORAGE_KEYS.GAME_SETTINGS, settings);
  }

  /**
   * Get game settings
   */
  getSettings(): Record<string, unknown> {
    return this.getItem<Record<string, unknown>>(STORAGE_KEYS.GAME_SETTINGS) || {};
  }

  /**
   * Save statistics
   */
  saveStatistics(stats: PlayerStatistics): boolean {
    return this.setItem(STORAGE_KEYS.STATISTICS, stats);
  }

  /**
   * Get statistics
   */
  getStatistics(): PlayerStatistics | null {
    return this.getItem<PlayerStatistics>(STORAGE_KEYS.STATISTICS);
  }

  /**
   * Update statistics
   */
  updateStatistics(updates: Partial<PlayerStatistics>): boolean {
    const existing = this.getStatistics() || {
      totalPlayTime: 0,
      averageScore: 0,
      highScore: 0,
      totalDrinksConsumed: 0,
      drinkBreakdown: {},
      averageCaffeineLevel: 0,
      timeInOptimalZone: 0,
      perfectDays: 0,
      crashCount: 0,
      explosionCount: 0,
    };

    const merged = { ...existing, ...updates };
    return this.saveStatistics(merged);
  }

  /**
   * Save session data
   */
  saveSession(session: SessionData): boolean {
    return this.setItem(STORAGE_KEYS.LAST_SESSION, session);
  }

  /**
   * Get last session
   */
  getLastSession(): SessionData | null {
    return this.getItem<SessionData>(STORAGE_KEYS.LAST_SESSION);
  }

  /**
   * Save unlocked content
   */
  saveUnlockedContent(content: string[]): boolean {
    return this.setItem(STORAGE_KEYS.UNLOCKED_CONTENT, content);
  }

  /**
   * Get unlocked content
   */
  getUnlockedContent(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.UNLOCKED_CONTENT) || [];
  }

  /**
   * Clear all storage
   */
  clearAll(): void {
    this.cache.clear();
    if (this.isAvailable) {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  }

  /**
   * Export all data (for backup)
   */
  exportData(): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const value = this.getItem(key);
      if (value) {
        data[name] = value;
      }
    });

    return {
      version: STORAGE_VERSION,
      exportDate: new Date().toISOString(),
      data,
    };
  }

  /**
   * Import data (from backup)
   */
  importData(backup: Record<string, unknown>): boolean {
    try {
      const { data } = backup as { data: Record<string, unknown> };

      Object.entries(data).forEach(([name, value]) => {
        const key = STORAGE_KEYS[name as keyof typeof STORAGE_KEYS];
        if (key) {
          this.setItem(key, value);
        }
      });

      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  }

  /**
   * Get storage size in bytes
   */
  getStorageSize(): number {
    if (!this.isAvailable) return 0;

    let size = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        size += item.length * 2; // UTF-16 characters
      }
    });

    return size;
  }

  /**
   * Check if storage is near quota
   */
  isNearQuota(): boolean {
    if (!this.isAvailable) return false;

    try {
      // Try to estimate remaining space
      const testData = new Array(1024).join('x'); // 1KB test string
      const testKey = '__quota_check__';

      for (let i = 0; i < 1024; i++) { // Try up to 1MB
        localStorage.setItem(testKey + i, testData);
      }

      // If we got here, we have at least 1MB free
      for (let i = 0; i < 1024; i++) {
        localStorage.removeItem(testKey + i);
      }
      return false;
    } catch (e) {
      // Quota exceeded during test
      return true;
    }
  }
}

// Singleton instance
let storageManager: StorageManager | null = null;

/**
 * Get storage manager instance
 */
export function getStorageManager(): StorageManager {
  if (!storageManager) {
    storageManager = new StorageManager();
  }
  return storageManager;
}

/**
 * Reset storage manager (useful for testing)
 */
export function resetStorageManager(): void {
  storageManager = null;
}