/**
 * Central export point for all type definitions
 */

export * from './game';
export * from './drinks';
export * from './events';
export * from './animations';
export * from './ui';
export * from './achievements';
export * from './audio';
export * from './powerups';

// Re-export commonly used types for convenience
export type {
  GameState,
  Difficulty,
  GameConfig,
  GameStats,
} from './game';

export type { DrinkType } from './drinks';
export type { EventType } from './events';
export type { AnimationType } from './animations';
export type { ButtonVariant } from './ui';
export type { AchievementCategory } from './achievements';
export type { SoundEffect, MusicTrack } from './audio';
export type { PowerUpType } from './powerups';