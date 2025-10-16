/**
 * Achievements System for Stay Caffeinated
 * Tracks and manages player achievements with persistence
 */

import type {
  Achievement,
  AchievementRequirement,
} from '@/types/achievements';
import { StorageManager } from '@/utils/storage';

/**
 * Achievement definitions with varying difficulty levels
 */
export const ACHIEVEMENT_DEFINITIONS: Record<string, Omit<Achievement, 'unlocked' | 'unlockedAt'>> = {
  firstSip: {
    id: 'firstSip',
    name: 'First Sip',
    description: 'Consume your first drink',
    icon: '☕',
    category: 'drinks',
    rarity: 'common',
    points: 10,
    requirement: {
      type: 'drinks',
      value: 1,
      comparison: 'greater',
    },
  },
  caffeineAddict: {
    id: 'caffeineAddict',
    name: 'Caffeine Addict',
    description: 'Consume 50 drinks in total',
    icon: '🔥',
    category: 'drinks',
    rarity: 'uncommon',
    points: 25,
    progress: 0,
    maxProgress: 50,
    requirement: {
      type: 'drinks',
      value: 50,
      comparison: 'greater',
    },
  },
  survivor: {
    id: 'survivor',
    name: 'Survivor',
    description: 'Survive for 10 minutes without crashing',
    icon: '🛡️',
    category: 'endurance',
    rarity: 'rare',
    points: 50,
    requirement: {
      type: 'survival',
      value: 600000, // 10 minutes in milliseconds
      comparison: 'greater',
    },
  },
  highAchiever: {
    id: 'highAchiever',
    name: 'High Achiever',
    description: 'Score 10,000 points in a single game',
    icon: '🏆',
    category: 'gameplay',
    rarity: 'epic',
    points: 75,
    requirement: {
      type: 'score',
      value: 10000,
      comparison: 'greater',
    },
  },
  perfectBalance: {
    id: 'perfectBalance',
    name: 'Perfect Balance',
    description: 'Stay in the optimal caffeine zone for 5 minutes straight',
    icon: '⚖️',
    category: 'mastery',
    rarity: 'legendary',
    points: 100,
    requirement: {
      type: 'special',
      value: 300000, // 5 minutes in milliseconds
      comparison: 'greater',
      additionalConditions: {
        zone: 'optimal',
      },
    },
  },
};

/**
 * Achievement system callbacks
 */
export interface AchievementSystemCallbacks {
  onAchievementUnlocked?: (achievement: Achievement) => void;
  onProgressUpdate?: (achievementId: string, progress: number) => void;
}

/**
 * Achievement Tracker System
 */
export class AchievementTracker {
  private achievements: Map<string, Achievement> = new Map();
  private storage: StorageManager;
  private callbacks: AchievementSystemCallbacks;
  private sessionStats: {
    drinksConsumed: number;
    survivalTime: number;
    optimalZoneTime: number;
    currentScore: number;
    gameStartTime: number;
    lastOptimalZoneEntry?: number;
    currentOptimalStreak: number;
  };

  constructor(callbacks: AchievementSystemCallbacks = {}) {
    this.storage = new StorageManager();
    this.callbacks = callbacks;
    this.sessionStats = {
      drinksConsumed: 0,
      survivalTime: 0,
      optimalZoneTime: 0,
      currentScore: 0,
      gameStartTime: Date.now(),
      currentOptimalStreak: 0,
    };

    this.loadAchievements();
  }

  /**
   * Load achievements from storage
   */
  private loadAchievements(): void {
    const savedAchievements = this.storage.getAchievements();

    // Initialize all achievements
    Object.entries(ACHIEVEMENT_DEFINITIONS).forEach(([id, definition]) => {
      const saved = savedAchievements.find(a => a.id === id);
      const achievement: Achievement = {
        ...definition,
        unlocked: saved?.unlocked || false,
        unlockedAt: saved?.unlockedAt,
        progress: saved?.progress || definition.progress,
      };
      this.achievements.set(id, achievement);
    });
  }

  /**
   * Save achievements to storage
   */
  private saveAchievements(): void {
    const achievementsArray = Array.from(this.achievements.values());
    this.storage.saveAchievements(achievementsArray);
  }

  /**
   * Check if an achievement should be unlocked
   */
  private checkRequirement(
    requirement: AchievementRequirement,
    value: number
  ): boolean {
    switch (requirement.comparison) {
      case 'greater':
        return value >= requirement.value;
      case 'equal':
        return value === requirement.value;
      case 'less':
        return value <= requirement.value;
      case 'between':
        // For between, requirement.value is the minimum
        const max = requirement.additionalConditions?.max as number;
        return value >= requirement.value && value <= max;
      default:
        return false;
    }
  }

  /**
   * Update achievement progress
   */
  private updateProgress(achievementId: string, progress: number): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    if (achievement.maxProgress) {
      achievement.progress = Math.min(progress, achievement.maxProgress);
      this.callbacks.onProgressUpdate?.(achievementId, achievement.progress);

      if (achievement.progress >= achievement.maxProgress) {
        this.unlockAchievement(achievementId);
      }
    }
  }

  /**
   * Unlock an achievement
   */
  private unlockAchievement(achievementId: string): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlockedAt = new Date();

    this.saveAchievements();
    this.callbacks.onAchievementUnlocked?.(achievement);
  }

  /**
   * Track drink consumption
   */
  trackDrinkConsumed(): void {
    this.sessionStats.drinksConsumed++;

    // Check first sip achievement
    if (this.sessionStats.drinksConsumed === 1) {
      this.checkAndUnlock('firstSip', 1);
    }

    // Update caffeine addict progress
    const totalDrinks = this.storage.getStatistics()?.totalDrinksConsumed || 0;
    this.updateProgress('caffeineAddict', totalDrinks + this.sessionStats.drinksConsumed);
  }

  /**
   * Track game score
   */
  trackScore(score: number): void {
    this.sessionStats.currentScore = score;
    this.checkAndUnlock('highAchiever', score);
  }

  /**
   * Track survival time
   */
  trackSurvival(currentTime: number): void {
    this.sessionStats.survivalTime = currentTime - this.sessionStats.gameStartTime;
    this.checkAndUnlock('survivor', this.sessionStats.survivalTime);
  }

  /**
   * Track optimal zone time
   */
  trackOptimalZone(inOptimalZone: boolean, currentTime: number): void {
    if (inOptimalZone) {
      if (!this.sessionStats.lastOptimalZoneEntry) {
        this.sessionStats.lastOptimalZoneEntry = currentTime;
      }

      const currentStreak = currentTime - this.sessionStats.lastOptimalZoneEntry;
      this.sessionStats.currentOptimalStreak = currentStreak;

      // Check perfect balance achievement
      if (currentStreak >= 300000) {
        this.checkAndUnlock('perfectBalance', currentStreak, { zone: 'optimal' });
      }
    } else {
      this.sessionStats.lastOptimalZoneEntry = undefined;
      this.sessionStats.currentOptimalStreak = 0;
    }
  }

  /**
   * Check and unlock achievement if conditions are met
   */
  private checkAndUnlock(
    achievementId: string,
    value: number,
    _additionalData?: Record<string, unknown>
  ): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    if (this.checkRequirement(achievement.requirement, value)) {
      this.unlockAchievement(achievementId);
    }
  }

  /**
   * Get all achievements
   */
  getAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => a.unlocked);
  }

  /**
   * Get achievement by ID
   */
  getAchievement(id: string): Achievement | undefined {
    return this.achievements.get(id);
  }

  /**
   * Get total points earned
   */
  getTotalPoints(): number {
    return this.getUnlockedAchievements().reduce((total, a) => total + a.points, 0);
  }

  /**
   * Get achievement completion percentage
   */
  getCompletionPercentage(): number {
    const total = this.achievements.size;
    const unlocked = this.getUnlockedAchievements().length;
    return total > 0 ? (unlocked / total) * 100 : 0;
  }

  /**
   * Reset session stats (for new game)
   */
  resetSessionStats(): void {
    this.sessionStats = {
      drinksConsumed: 0,
      survivalTime: 0,
      optimalZoneTime: 0,
      currentScore: 0,
      gameStartTime: Date.now(),
      currentOptimalStreak: 0,
    };
  }

  /**
   * Reset all achievements (for testing or player request)
   */
  resetAllAchievements(): void {
    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
      achievement.unlockedAt = undefined;
      achievement.progress = 0;
    });
    this.saveAchievements();
    this.resetSessionStats();
  }

  /**
   * Export achievements data
   */
  exportAchievements(): string {
    return JSON.stringify({
      achievements: Array.from(this.achievements.values()),
      totalPoints: this.getTotalPoints(),
      completionPercentage: this.getCompletionPercentage(),
      exportDate: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Import achievements data
   */
  importAchievements(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.achievements || !Array.isArray(parsed.achievements)) {
        return false;
      }

      parsed.achievements.forEach((imported: Achievement) => {
        const existing = this.achievements.get(imported.id);
        if (existing) {
          existing.unlocked = imported.unlocked;
          existing.unlockedAt = imported.unlockedAt ? new Date(imported.unlockedAt) : undefined;
          existing.progress = imported.progress;
        }
      });

      this.saveAchievements();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create a pre-configured achievement tracker
 */
export function createAchievementTracker(
  callbacks?: AchievementSystemCallbacks
): AchievementTracker {
  return new AchievementTracker(callbacks);
}