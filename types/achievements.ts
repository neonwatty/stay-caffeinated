/**
 * Achievement and progression types
 */

export type AchievementCategory =
  | 'gameplay'
  | 'drinks'
  | 'endurance'
  | 'mastery'
  | 'special';

export type AchievementRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  requirement: AchievementRequirement;
}

export interface AchievementRequirement {
  type: 'score' | 'drinks' | 'streak' | 'survival' | 'special';
  value: number;
  comparison: 'equal' | 'greater' | 'less' | 'between';
  additionalConditions?: Record<string, string | number | boolean>;
}

export interface PlayerProfile {
  id: string;
  username: string;
  level: number;
  experience: number;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  longestStreak: number;
  favoriteDrink?: string;
  achievements: Achievement[];
  statistics: PlayerStatistics;
  preferences: PlayerPreferences;
}

export interface PlayerStatistics {
  totalPlayTime: number; // in seconds
  averageScore: number;
  highScore: number;
  totalDrinksConsumed: number;
  drinkBreakdown: Record<string, number>;
  averageCaffeineLevel: number;
  timeInOptimalZone: number;
  perfectDays: number;
  crashCount: number;
  explosionCount: number;
}

export interface PlayerPreferences {
  difficulty: string;
  soundEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
  particlesEnabled: boolean;
  screenShakeEnabled: boolean;
  colorBlindMode: boolean;
  reducedMotion: boolean;
}

export interface Leaderboard {
  daily: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  score: number;
  date: Date;
  difficulty: string;
}

export interface UnlockableContent {
  id: string;
  type: 'drink' | 'theme' | 'character' | 'effect';
  name: string;
  description: string;
  requiredLevel?: number;
  requiredAchievements?: string[];
  cost?: number;
  unlocked: boolean;
}