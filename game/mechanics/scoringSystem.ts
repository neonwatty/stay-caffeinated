/**
 * Scoring System - Manages score calculation and achievements
 */

import type { GameStats, Difficulty } from '@/types';

export interface ScoreBreakdown {
  baseScore: number;
  optimalBonus: number;
  streakBonus: number;
  difficultyMultiplier: number;
  healthBonus: number;
  totalScore: number;
}

export class ScoringSystem {
  private baseScoreRate = 10; // Points per second
  private optimalMultiplier = 2;
  private streakBonusRate = 500; // Bonus per minute in optimal zone
  private perfectStreakThreshold = 60; // Seconds for perfect streak

  /**
   * Calculate score for a time period
   */
  calculateScore(
    deltaTime: number,
    isInOptimalZone: boolean,
    streakTime: number,
    difficulty: Difficulty
  ): number {
    const seconds = deltaTime / 1000;

    // Base score
    let score = this.baseScoreRate * seconds;

    // Optimal zone multiplier
    if (isInOptimalZone) {
      score *= this.optimalMultiplier;
    }

    // Streak bonus (progressive)
    if (streakTime > 0) {
      const streakMinutes = streakTime / 60;
      const streakBonus = (this.streakBonusRate * streakMinutes * seconds) / 60;
      score += streakBonus;
    }

    // Difficulty multiplier
    const difficultyMultipliers: Record<Difficulty, number> = {
      intern: 1,
      junior: 1.5,
      senior: 2,
      founder: 3,
    };
    score *= difficultyMultipliers[difficulty] || 1;

    return score;
  }

  /**
   * Calculate final score at game end
   */
  calculateFinalScore(
    stats: GameStats,
    difficulty: Difficulty,
    victory: boolean
  ): ScoreBreakdown {
    const breakdown: ScoreBreakdown = {
      baseScore: stats.score,
      optimalBonus: 0,
      streakBonus: 0,
      difficultyMultiplier: 1,
      healthBonus: 0,
      totalScore: stats.score,
    };

    // Victory bonus
    if (victory) {
      breakdown.optimalBonus = 5000;

      // Perfect streak bonus
      if (stats.streak >= this.perfectStreakThreshold) {
        breakdown.streakBonus = Math.floor(stats.streak) * 10;
      }

      // Health bonus (percentage of remaining health)
      breakdown.healthBonus = Math.floor(stats.currentHealthLevel * 10);
    }

    // Difficulty multiplier for final score
    const difficultyMultipliers: Record<Difficulty, number> = {
      intern: 1,
      junior: 1.5,
      senior: 2,
      founder: 3,
    };
    breakdown.difficultyMultiplier = difficultyMultipliers[difficulty] || 1;

    // Calculate total
    breakdown.totalScore =
      (breakdown.baseScore + breakdown.optimalBonus + breakdown.streakBonus + breakdown.healthBonus) *
      breakdown.difficultyMultiplier;

    return breakdown;
  }

  /**
   * Format score for display
   */
  formatScore(score: number): string {
    return Math.floor(score).toLocaleString();
  }

  /**
   * Get score rank based on score value
   */
  getScoreRank(score: number): string {
    if (score >= 50000) return 'S';
    if (score >= 30000) return 'A';
    if (score >= 20000) return 'B';
    if (score >= 10000) return 'C';
    if (score >= 5000) return 'D';
    return 'F';
  }

  /**
   * Check for score milestones
   */
  checkMilestones(score: number, previousScore: number): string[] {
    const milestones: string[] = [];
    const thresholds = [1000, 5000, 10000, 25000, 50000, 100000];

    for (const threshold of thresholds) {
      if (previousScore < threshold && score >= threshold) {
        milestones.push(`${threshold.toLocaleString()} points!`);
      }
    }

    return milestones;
  }

  /**
   * Calculate combo multiplier based on consecutive optimal zone time
   */
  getComboMultiplier(streakTime: number): number {
    if (streakTime < 10) return 1;
    if (streakTime < 30) return 1.5;
    if (streakTime < 60) return 2;
    if (streakTime < 120) return 3;
    return 5; // Max combo
  }

  /**
   * Calculate enhanced score with power-ups and events
   */
  calculateEnhancedScore(
    baseScore: number,
    powerUpMultiplier: number = 1,
    eventBonus: number = 0,
    comboMultiplier: number = 1
  ): number {
    return (baseScore * powerUpMultiplier * comboMultiplier) + eventBonus;
  }

  /**
   * Get achievement based on performance
   */
  getAchievement(
    stats: {
      totalEventsCompleted: number;
      totalPowerUpsCollected: number;
      maxStreak: number;
      finalScore: number;
    }
  ): string[] {
    const achievements: string[] = [];

    // Event achievements
    if (stats.totalEventsCompleted >= 10) {
      achievements.push('Event Master: Survived 10+ events');
    }
    if (stats.totalEventsCompleted >= 5) {
      achievements.push('Event Handler: Survived 5+ events');
    }

    // Power-up achievements
    if (stats.totalPowerUpsCollected >= 15) {
      achievements.push('Power Collector: Collected 15+ power-ups');
    }
    if (stats.totalPowerUpsCollected >= 8) {
      achievements.push('Power User: Collected 8+ power-ups');
    }

    // Streak achievements
    if (stats.maxStreak >= 120) {
      achievements.push('Perfect Flow: 2+ minute streak');
    }
    if (stats.maxStreak >= 60) {
      achievements.push('In The Zone: 1 minute streak');
    }

    // Score achievements
    if (stats.finalScore >= 100000) {
      achievements.push('Legendary Developer: 100,000+ points');
    }
    if (stats.finalScore >= 50000) {
      achievements.push('Senior Developer: 50,000+ points');
    }
    if (stats.finalScore >= 25000) {
      achievements.push('Mid-Level Developer: 25,000+ points');
    }

    return achievements;
  }

  /**
   * Calculate bonus points for special actions
   */
  calculateActionBonus(action: string): number {
    const bonuses: Record<string, number> = {
      'perfect_drink_timing': 200,    // Consumed drink at perfect moment
      'close_call': 500,              // Survived with < 10 health
      'event_no_damage': 1000,        // Completed event without health loss
      'power_up_chain': 300,          // Collected 3 power-ups quickly
      'comeback': 750,                // Recovered from < 20% to optimal
      'efficiency_master': 600        // Maintained optimal for 60s+
    };

    return bonuses[action] || 0;
  }
}