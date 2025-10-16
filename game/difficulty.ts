/**
 * Difficulty System - Manages game difficulty levels and challenge modifiers
 */

import type { Difficulty, DifficultyConfig } from '@/types/game';

/**
 * Extended difficulty configuration with additional gameplay parameters
 */
export interface ExtendedDifficultyConfig extends DifficultyConfig {
  id: Difficulty;
  caffeineDepletionMultiplier: number;
  healthDepletionMultiplier: number;
  drinkEffectivenessMultiplier: number;
  scoreMultiplier: number;
  reactionTimeWindow: number; // milliseconds for time-based challenges
  maxSimultaneousTasks: number; // for multitasking challenges
  crashSeverityMultiplier: number; // how harsh caffeine crashes are
  toleranceBuildup: number; // how quickly tolerance builds
}

/**
 * Challenge modifiers that can be applied based on difficulty
 */
export interface ChallengeModifiers {
  caffeineVolatility: number; // How much caffeine levels fluctuate
  focusRequirement: number; // How precise optimal zone management needs to be
  multitaskingPenalty: number; // Penalty for switching between tasks
  timePresssure: number; // Speed requirements for tasks
}

/**
 * Difficulty configurations for all levels
 */
export const DIFFICULTY_LEVELS: Record<Difficulty, ExtendedDifficultyConfig> = {
  intern: {
    id: 'intern',
    name: 'Intern',
    workdayLength: 360, // 6 hours in game minutes
    optimalZoneSize: 50, // 25-75 range (50% of scale)
    caffeineDepletionRate: 0.5,
    description: 'Easy mode - shorter day, larger optimal zone, forgiving mechanics',
    caffeineDepletionMultiplier: 0.75,
    healthDepletionMultiplier: 0.5,
    drinkEffectivenessMultiplier: 1.25,
    scoreMultiplier: 1.0,
    reactionTimeWindow: 3000,
    maxSimultaneousTasks: 1,
    crashSeverityMultiplier: 0.5,
    toleranceBuildup: 0.25,
  },
  junior: {
    id: 'junior',
    name: 'Junior Developer',
    workdayLength: 480, // 8 hours in game minutes
    optimalZoneSize: 40, // 30-70 range (40% of scale)
    caffeineDepletionRate: 0.75,
    description: 'Normal mode - standard workday, balanced challenge',
    caffeineDepletionMultiplier: 1.0,
    healthDepletionMultiplier: 1.0,
    drinkEffectivenessMultiplier: 1.0,
    scoreMultiplier: 1.5,
    reactionTimeWindow: 2000,
    maxSimultaneousTasks: 2,
    crashSeverityMultiplier: 1.0,
    toleranceBuildup: 0.5,
  },
  senior: {
    id: 'senior',
    name: 'Senior Developer',
    workdayLength: 600, // 10 hours in game minutes
    optimalZoneSize: 30, // 35-65 range (30% of scale)
    caffeineDepletionRate: 1.0,
    description: 'Hard mode - longer day, smaller optimal zone, demanding pace',
    caffeineDepletionMultiplier: 1.25,
    healthDepletionMultiplier: 1.5,
    drinkEffectivenessMultiplier: 0.85,
    scoreMultiplier: 2.0,
    reactionTimeWindow: 1500,
    maxSimultaneousTasks: 3,
    crashSeverityMultiplier: 1.5,
    toleranceBuildup: 0.75,
  },
  founder: {
    id: 'founder',
    name: 'Startup Founder',
    workdayLength: 840, // 14 hours in game minutes
    optimalZoneSize: 20, // 40-60 range (20% of scale)
    caffeineDepletionRate: 1.5,
    description: 'Extreme mode - marathon day, tiny optimal zone, unforgiving mechanics',
    caffeineDepletionMultiplier: 1.5,
    healthDepletionMultiplier: 2.0,
    drinkEffectivenessMultiplier: 0.7,
    scoreMultiplier: 3.0,
    reactionTimeWindow: 1000,
    maxSimultaneousTasks: 4,
    crashSeverityMultiplier: 2.0,
    toleranceBuildup: 1.0,
  },
};

/**
 * Manages difficulty settings and provides difficulty-based game parameters
 */
export class DifficultyManager {
  private currentDifficulty: Difficulty;
  private config: ExtendedDifficultyConfig;
  private customModifiers: Partial<ChallengeModifiers> = {};

  constructor(difficulty: Difficulty = 'junior') {
    this.currentDifficulty = difficulty;
    this.config = DIFFICULTY_LEVELS[difficulty];
  }

  /**
   * Get current difficulty level
   */
  getCurrentDifficulty(): Difficulty {
    return this.currentDifficulty;
  }

  /**
   * Get current difficulty configuration
   */
  getConfig(): ExtendedDifficultyConfig {
    return { ...this.config };
  }

  /**
   * Set difficulty level
   */
  setDifficulty(difficulty: Difficulty): void {
    if (!DIFFICULTY_LEVELS[difficulty]) {
      throw new Error(`Invalid difficulty: ${difficulty}`);
    }
    this.currentDifficulty = difficulty;
    this.config = DIFFICULTY_LEVELS[difficulty];
  }

  /**
   * Calculate optimal caffeine range based on difficulty
   */
  getOptimalCaffeineRange(): { min: number; max: number } {
    const center = 50; // Center of 0-100 scale
    const halfSize = this.config.optimalZoneSize / 2;

    return {
      min: Math.max(0, center - halfSize),
      max: Math.min(100, center + halfSize),
    };
  }

  /**
   * Get caffeine depletion rate adjusted for difficulty
   */
  getCaffeineDepletionRate(baseRate: number = 1): number {
    return baseRate * this.config.caffeineDepletionRate * this.config.caffeineDepletionMultiplier;
  }

  /**
   * Get health depletion rate adjusted for difficulty
   */
  getHealthDepletionRate(baseRate: number = 0.5): number {
    return baseRate * this.config.healthDepletionMultiplier;
  }

  /**
   * Adjust drink effectiveness based on difficulty
   */
  adjustDrinkEffectiveness(baseEffectiveness: number): number {
    return baseEffectiveness * this.config.drinkEffectivenessMultiplier;
  }

  /**
   * Calculate score with difficulty multiplier
   */
  calculateScore(baseScore: number): number {
    return Math.floor(baseScore * this.config.scoreMultiplier);
  }

  /**
   * Get challenge modifiers for current difficulty
   */
  getChallengeModifiers(): ChallengeModifiers {
    const baseModifiers: ChallengeModifiers = {
      caffeineVolatility: this.config.caffeineDepletionMultiplier,
      focusRequirement: 1 / (this.config.optimalZoneSize / 100),
      multitaskingPenalty: this.config.maxSimultaneousTasks * 0.1,
      timePresssure: 1000 / this.config.reactionTimeWindow,
    };

    return { ...baseModifiers, ...this.customModifiers };
  }

  /**
   * Set custom challenge modifiers
   */
  setCustomModifiers(modifiers: Partial<ChallengeModifiers>): void {
    this.customModifiers = modifiers;
  }

  /**
   * Get crash severity multiplier
   */
  getCrashSeverity(): number {
    return this.config.crashSeverityMultiplier;
  }

  /**
   * Get tolerance buildup rate
   */
  getToleranceBuildup(): number {
    return this.config.toleranceBuildup;
  }

  /**
   * Get workday length in milliseconds (real time)
   */
  getWorkdayDuration(realTimeMinutes: number = 3): number {
    // Convert game minutes to real milliseconds
    const gameToRealRatio = (realTimeMinutes * 60 * 1000) / (8 * 60); // Base on junior (8 hours)
    return this.config.workdayLength * gameToRealRatio;
  }

  /**
   * Check if a given time is within reaction window
   */
  isWithinReactionWindow(reactionTime: number): boolean {
    return reactionTime <= this.config.reactionTimeWindow;
  }

  /**
   * Get difficulty progression (for dynamic difficulty)
   */
  getNextDifficulty(): Difficulty | null {
    const progression: Difficulty[] = ['intern', 'junior', 'senior', 'founder'];
    const currentIndex = progression.indexOf(this.currentDifficulty);

    if (currentIndex < progression.length - 1) {
      return progression[currentIndex + 1];
    }
    return null;
  }

  /**
   * Get previous difficulty (for dynamic difficulty)
   */
  getPreviousDifficulty(): Difficulty | null {
    const progression: Difficulty[] = ['intern', 'junior', 'senior', 'founder'];
    const currentIndex = progression.indexOf(this.currentDifficulty);

    if (currentIndex > 0) {
      return progression[currentIndex - 1];
    }
    return null;
  }

  /**
   * Check if current difficulty is the hardest
   */
  isMaxDifficulty(): boolean {
    return this.currentDifficulty === 'founder';
  }

  /**
   * Check if current difficulty is the easiest
   */
  isMinDifficulty(): boolean {
    return this.currentDifficulty === 'intern';
  }

  /**
   * Get formatted difficulty info for UI
   */
  getDifficultyInfo(): {
    name: string;
    description: string;
    stats: Array<{ label: string; value: string }>;
  } {
    const optimalRange = this.getOptimalCaffeineRange();

    return {
      name: this.config.name,
      description: this.config.description,
      stats: [
        { label: 'Workday Length', value: `${Math.floor(this.config.workdayLength / 60)} hours` },
        { label: 'Optimal Zone', value: `${optimalRange.min}-${optimalRange.max}%` },
        { label: 'Caffeine Depletion', value: `${(this.config.caffeineDepletionRate * 100).toFixed(0)}%` },
        { label: 'Score Multiplier', value: `${this.config.scoreMultiplier}x` },
        { label: 'Max Tasks', value: `${this.config.maxSimultaneousTasks}` },
      ],
    };
  }

  /**
   * Reset difficulty to default
   */
  reset(): void {
    this.setDifficulty('junior');
    this.customModifiers = {};
  }
}

/**
 * Singleton instance for global access
 */
let difficultyManagerInstance: DifficultyManager | null = null;

/**
 * Get or create the difficulty manager instance
 */
export function getDifficultyManager(): DifficultyManager {
  if (!difficultyManagerInstance) {
    difficultyManagerInstance = new DifficultyManager();
  }
  return difficultyManagerInstance;
}

/**
 * Helper function to get difficulty names for UI
 */
export function getDifficultyNames(): Array<{ value: Difficulty; label: string }> {
  return Object.values(DIFFICULTY_LEVELS).map(config => ({
    value: config.id,
    label: config.name,
  }));
}

/**
 * Helper function to validate difficulty
 */
export function isValidDifficulty(difficulty: string): difficulty is Difficulty {
  return difficulty in DIFFICULTY_LEVELS;
}