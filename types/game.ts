/**
 * Core game types and interfaces
 */

export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'victory';

export type Difficulty = 'intern' | 'junior' | 'senior' | 'founder';

export interface DifficultyConfig {
  name: string;
  workdayLength: number; // in game minutes
  optimalZoneSize: number; // percentage
  caffeineDepletionRate: number;
  description: string;
}

export interface GameConfig {
  difficulty: Difficulty;
  soundEnabled: boolean;
  particlesEnabled: boolean;
  screenShakeEnabled: boolean;
}

export interface GameStats {
  currentCaffeineLevel: number; // 0-100
  currentHealthLevel: number; // 0-100
  timeElapsed: number; // in seconds
  drinksConsumed: number;
  score: number;
  streak: number; // time in optimal zone
  isInOptimalZone: boolean;
}

export interface GameSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  config: GameConfig;
  finalStats?: GameStats;
  outcome?: 'victory' | 'passOut' | 'explosion';
}