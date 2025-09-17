'use client';

/**
 * useLocalStorage Hook
 * React hook for managing localStorage with automatic state synchronization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getStorageManager } from '@/utils/storage';
import type {
  Achievement,
  PlayerProfile,
  PlayerStatistics,
} from '@/types/achievements';
import type { HighScoreEntry, SessionData } from '@/utils/storage';

/**
 * Generic useLocalStorage hook
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
    syncAcrossTabs?: boolean;
  }
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { serialize = JSON.stringify, deserialize = JSON.parse, syncAcrossTabs = true } = options || {};

  // Initialize state with value from localStorage or initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Reference to track if we're the source of storage events
  const isSettingRef = useRef(false);

  // Set value in both state and localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        isSettingRef.current = true;
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serialize(valueToStore));
        }
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      } finally {
        isSettingRef.current = false;
      }
    },
    [key, serialize, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }, [key, initialValue]);

  // Sync state when localStorage changes (from other tabs)
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || isSettingRef.current) return;

      try {
        const newValue = e.newValue ? deserialize(e.newValue) : initialValue;
        setStoredValue(newValue);
      } catch (error) {
        console.error(`Error syncing ${key} from storage event:`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, deserialize, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing player profile
 */
export function usePlayerProfile() {
  const storageManager = getStorageManager();
  const [profile, setProfileState] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedProfile = storageManager.getPlayerProfile();
        setProfileState(savedProfile);
      } catch (error) {
        console.error('Failed to load player profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [storageManager]);

  const updateProfile = useCallback(
    (updates: Partial<PlayerProfile>) => {
      const newProfile = { ...profile, ...updates } as PlayerProfile;
      setProfileState(newProfile);
      storageManager.savePlayerProfile(newProfile);
    },
    [profile, storageManager]
  );

  const resetProfile = useCallback(() => {
    setProfileState(null);
    storageManager.savePlayerProfile({} as PlayerProfile);
  }, [storageManager]);

  return {
    profile,
    loading,
    updateProfile,
    resetProfile,
  };
}

/**
 * Hook for managing high scores
 */
export function useHighScores() {
  const storageManager = getStorageManager();
  const [highScores, setHighScores] = useState<Record<string, HighScoreEntry[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = () => {
      try {
        const scores = storageManager.getHighScores();
        setHighScores(scores);
      } catch (error) {
        console.error('Failed to load high scores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScores();
  }, [storageManager]);

  const addHighScore = useCallback(
    (score: HighScoreEntry) => {
      const success = storageManager.addHighScore(score);
      if (success) {
        setHighScores(storageManager.getHighScores());
      }
      return success;
    },
    [storageManager]
  );

  const getTopScore = useCallback(
    (difficulty?: string) => {
      if (!difficulty) {
        // Get top score across all difficulties
        let topScore = 0;
        Object.values(highScores).forEach(scores => {
          if (scores[0]?.score > topScore) {
            topScore = scores[0].score;
          }
        });
        return topScore;
      }

      return highScores[difficulty]?.[0]?.score || 0;
    },
    [highScores]
  );

  const clearHighScores = useCallback(() => {
    storageManager.saveHighScores([]);
    setHighScores({});
  }, [storageManager]);

  return {
    highScores,
    loading,
    addHighScore,
    getTopScore,
    clearHighScores,
  };
}

/**
 * Hook for managing achievements
 */
export function useAchievements() {
  const storageManager = getStorageManager();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const loadAchievements = () => {
      try {
        const saved = storageManager.getAchievements();
        setAchievements(saved);
        setUnlockedCount(saved.filter(a => a.unlocked).length);
        setTotalPoints(saved.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0));
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
    };

    loadAchievements();
  }, [storageManager]);

  const unlockAchievement = useCallback(
    (achievementId: string) => {
      const success = storageManager.unlockAchievement(achievementId);
      if (success) {
        const updated = storageManager.getAchievements();
        setAchievements(updated);
        setUnlockedCount(updated.filter(a => a.unlocked).length);
        setTotalPoints(updated.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0));
      }
      return success;
    },
    [storageManager]
  );

  const getAchievementProgress = useCallback(
    (achievementId: string) => {
      const achievement = achievements.find(a => a.id === achievementId);
      if (!achievement) return 0;

      if (achievement.unlocked) return 100;
      if (!achievement.progress || !achievement.maxProgress) return 0;

      return (achievement.progress / achievement.maxProgress) * 100;
    },
    [achievements]
  );

  const updateAchievementProgress = useCallback(
    (achievementId: string, progress: number) => {
      const achievement = achievements.find(a => a.id === achievementId);
      if (!achievement || achievement.unlocked) return false;

      achievement.progress = progress;

      // Check if achievement should be unlocked
      if (achievement.maxProgress && progress >= achievement.maxProgress) {
        return unlockAchievement(achievementId);
      }

      storageManager.saveAchievements(achievements);
      setAchievements([...achievements]);
      return true;
    },
    [achievements, storageManager, unlockAchievement]
  );

  return {
    achievements,
    unlockedCount,
    totalPoints,
    unlockAchievement,
    getAchievementProgress,
    updateAchievementProgress,
  };
}

/**
 * Hook for managing game statistics
 */
export function useGameStatistics() {
  const storageManager = getStorageManager();
  const [statistics, setStatistics] = useState<PlayerStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = () => {
      try {
        const stats = storageManager.getStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to load statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [storageManager]);

  const updateStatistics = useCallback(
    (updates: Partial<PlayerStatistics>) => {
      const success = storageManager.updateStatistics(updates);
      if (success) {
        setStatistics(storageManager.getStatistics());
      }
      return success;
    },
    [storageManager]
  );

  const incrementDrinkCount = useCallback(
    (drinkType: string) => {
      const current = statistics || {
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

      const breakdown = { ...current.drinkBreakdown };
      breakdown[drinkType] = (breakdown[drinkType] || 0) + 1;

      return updateStatistics({
        totalDrinksConsumed: current.totalDrinksConsumed + 1,
        drinkBreakdown: breakdown,
      });
    },
    [statistics, updateStatistics]
  );

  const recordGameEnd = useCallback(
    (score: number, crashed: boolean, explosion: boolean) => {
      const current = statistics || {
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

      const newHighScore = Math.max(current.highScore, score);
      const crashCount = current.crashCount + (crashed ? 1 : 0);
      const explosionCount = current.explosionCount + (explosion ? 1 : 0);

      return updateStatistics({
        highScore: newHighScore,
        crashCount,
        explosionCount,
      });
    },
    [statistics, updateStatistics]
  );

  return {
    statistics,
    loading,
    updateStatistics,
    incrementDrinkCount,
    recordGameEnd,
  };
}

/**
 * Hook for managing game sessions
 */
export function useGameSession() {
  const storageManager = getStorageManager();
  const [session, setSession] = useState<SessionData | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  useEffect(() => {
    const lastSession = storageManager.getLastSession();
    setSession(lastSession);
  }, [storageManager]);

  const startSession = useCallback(() => {
    const now = new Date();
    sessionStartRef.current = now;

    const newSession: SessionData = {
      startTime: now.toISOString(),
      totalPlayTime: 0,
      gamesPlayed: 0,
      highScore: 0,
      achievements: [],
    };

    setSession(newSession);
    storageManager.saveSession(newSession);
  }, [storageManager]);

  const endSession = useCallback(() => {
    if (!session || !sessionStartRef.current) return;

    const endTime = new Date();
    const totalPlayTime = Math.floor((endTime.getTime() - sessionStartRef.current.getTime()) / 1000);

    const updatedSession: SessionData = {
      ...session,
      endTime: endTime.toISOString(),
      totalPlayTime,
    };

    setSession(updatedSession);
    storageManager.saveSession(updatedSession);
    sessionStartRef.current = null;
  }, [session, storageManager]);

  const updateSession = useCallback(
    (updates: Partial<SessionData>) => {
      if (!session) return;

      const updatedSession = { ...session, ...updates };
      setSession(updatedSession);
      storageManager.saveSession(updatedSession);
    },
    [session, storageManager]
  );

  const recordGame = useCallback(
    (score: number) => {
      if (!session) return;

      updateSession({
        gamesPlayed: session.gamesPlayed + 1,
        highScore: Math.max(session.highScore, score),
      });
    },
    [session, updateSession]
  );

  return {
    session,
    startSession,
    endSession,
    updateSession,
    recordGame,
  };
}

/**
 * Hook for managing storage quota
 */
export function useStorageQuota() {
  const storageManager = getStorageManager();
  const [storageSize, setStorageSize] = useState(0);
  const [nearQuota, setNearQuota] = useState(false);

  useEffect(() => {
    const checkQuota = () => {
      const size = storageManager.getStorageSize();
      const near = storageManager.isNearQuota();
      setStorageSize(size);
      setNearQuota(near);
    };

    checkQuota();

    // Check quota periodically
    const interval = setInterval(checkQuota, 60000); // Every minute
    return () => clearInterval(interval);
  }, [storageManager]);

  const clearStorage = useCallback(() => {
    storageManager.clearAll();
    setStorageSize(0);
    setNearQuota(false);
  }, [storageManager]);

  const exportData = useCallback(() => {
    return storageManager.exportData();
  }, [storageManager]);

  const importData = useCallback(
    (data: Record<string, unknown>) => {
      return storageManager.importData(data);
    },
    [storageManager]
  );

  return {
    storageSize,
    nearQuota,
    clearStorage,
    exportData,
    importData,
  };
}