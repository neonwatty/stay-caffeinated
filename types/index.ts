/**
 * Central export point for all type definitions
 */

export * from './game';
export * from './drinks';
export * from './events';

// Re-export commonly used types for convenience
export type {
  GameState,
  Difficulty,
  GameConfig,
  GameStats,
} from './game';

export type { DrinkType } from './drinks';
export type { EventType } from './events';