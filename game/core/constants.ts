/**
 * Game constants and configuration
 */

import type { DifficultyConfig } from '@/types';

// Timing constants
export const FRAME_RATE = 60; // Target FPS
export const TICK_INTERVAL = 1000 / FRAME_RATE;
export const WORKDAY_REAL_TIME = 3 * 60 * 1000; // 3 minutes in milliseconds

// Caffeine system constants
export const CAFFEINE_MIN = 0;
export const CAFFEINE_MAX = 100;
export const CAFFEINE_OPTIMAL_MIN = 30;
export const CAFFEINE_OPTIMAL_MAX = 70;
export const CAFFEINE_DANGER_LOW = 20;
export const CAFFEINE_DANGER_HIGH = 80;

// Health system constants
export const HEALTH_MIN = 0;
export const HEALTH_MAX = 100;
export const HEALTH_DEPLETION_RATE = 0.5; // per second when outside optimal zone
export const HEALTH_CRITICAL = 20;

// Score constants
export const SCORE_PER_SECOND = 10;
export const SCORE_OPTIMAL_MULTIPLIER = 2;
export const SCORE_STREAK_BONUS = 500; // per minute in optimal zone

// Difficulty configurations
export const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
  intern: {
    name: 'Intern',
    workdayLength: 6 * 60, // 6 hours in game minutes
    optimalZoneSize: 50, // 25-75 range
    caffeineDepletionRate: 0.5,
    description: 'Easy mode - shorter day, larger optimal zone'
  },
  junior: {
    name: 'Junior Dev',
    workdayLength: 8 * 60, // 8 hours
    optimalZoneSize: 40, // 30-70 range
    caffeineDepletionRate: 0.75,
    description: 'Normal mode - standard workday'
  },
  senior: {
    name: 'Senior Dev',
    workdayLength: 10 * 60, // 10 hours
    optimalZoneSize: 30, // 35-65 range
    caffeineDepletionRate: 1.0,
    description: 'Hard mode - longer day, smaller optimal zone'
  },
  founder: {
    name: 'Startup Founder',
    workdayLength: 14 * 60, // 14 hours
    optimalZoneSize: 20, // 40-60 range
    caffeineDepletionRate: 1.5,
    description: 'Extreme mode - very long day, tiny optimal zone'
  }
};