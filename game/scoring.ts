/**
 * Comprehensive Scoring System for Stay Caffeinated
 * Manages score calculation, multipliers, bonuses, and leaderboards
 */

import type { GameStats, Difficulty } from '@/types';
import { StorageManager } from '@/utils/storage';

/**
 * Score event types for bonus calculation
 */
export type ScoreEventType =
  | 'perfect_timing'    // Perfect drink timing
  | 'close_call'        // Survived with low health
  | 'event_complete'    // Completed event successfully
  | 'powerup_chain'     // Multiple powerups in sequence
  | 'comeback'          // Recovery from low state
  | 'streak_milestone'  // Reached streak milestone
  | 'efficiency_bonus'; // Maintained optimal efficiency

/**
 * Score multiplier source
 */
export interface ScoreMultiplier {
  source: string;
  value: number;
  duration?: number;
  startTime?: number;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  difficulty: Difficulty;
  date: Date;
  stats: {
    survivalTime: number;
    optimalTime: number;
    drinksConsumed: number;
    eventsCompleted: number;
    powerupsUsed: number;
  };
}

/**
 * Score breakdown for detailed display
 */
export interface DetailedScoreBreakdown {
  baseScore: number;
  timeBonus: number;
  optimalBonus: number;
  streakBonus: number;
  eventBonus: number;
  powerupBonus: number;
  difficultyMultiplier: number;
  healthBonus: number;
  perfectBonus: number;
  totalScore: number;
}

/**
 * Scoring configuration
 */
export interface ScoringConfig {
  baseScoreRate: number;
  optimalMultiplier: number;
  streakBonusRate: number;
  eventCompleteBonus: number;
  powerupScoreBonus: number;
  difficultyMultipliers: Record<Difficulty, number>;
  milestoneThresholds: number[];
}

/**
 * Enhanced Scoring System
 */
export class EnhancedScoringSystem {
  private config: ScoringConfig;
  private currentScore: number = 0;
  private multipliers: Map<string, ScoreMultiplier> = new Map();
  private bonusQueue: number[] = [];
  private storage: StorageManager;
  private sessionStartTime: number;
  private milestoneReached: Set<number> = new Set();

  // Score tracking metrics
  private metrics = {
    totalTimeAlive: 0,
    timeInOptimal: 0,
    longestStreak: 0,
    eventsCompleted: 0,
    powerupsUsed: 0,
    perfectActions: 0,
    bonusesEarned: 0,
  };

  constructor(config?: Partial<ScoringConfig>) {
    this.config = {
      baseScoreRate: 10,
      optimalMultiplier: 2,
      streakBonusRate: 100,
      eventCompleteBonus: 1000,
      powerupScoreBonus: 500,
      difficultyMultipliers: {
        intern: 1.0,
        junior: 1.5,
        senior: 2.0,
        founder: 3.0,
      },
      milestoneThresholds: [1000, 5000, 10000, 25000, 50000, 100000],
      ...config,
    };

    this.storage = new StorageManager();
    this.sessionStartTime = Date.now();
  }

  /**
   * Update score with time-based calculation
   */
  updateScore(
    deltaTime: number,
    gameState: {
      isInOptimalZone: boolean;
      streakTime: number;
      difficulty: Difficulty;
      healthLevel: number;
      caffeineLevel: number;
    }
  ): number {
    const seconds = deltaTime / 1000;

    // Base score calculation
    let frameScore = this.config.baseScoreRate * seconds;

    // Apply optimal zone multiplier
    if (gameState.isInOptimalZone) {
      frameScore *= this.config.optimalMultiplier;
      this.metrics.timeInOptimal += deltaTime;
    }

    // Apply streak bonus (progressive)
    if (gameState.streakTime > 0) {
      const streakSeconds = gameState.streakTime / 1000;
      const streakMultiplier = 1 + (streakSeconds / 60); // +100% per minute
      frameScore *= streakMultiplier;

      // Track longest streak
      if (gameState.streakTime > this.metrics.longestStreak) {
        this.metrics.longestStreak = gameState.streakTime;
      }
    }

    // Apply active multipliers
    const totalMultiplier = this.calculateTotalMultiplier();
    frameScore *= totalMultiplier;

    // Apply difficulty multiplier
    frameScore *= this.config.difficultyMultipliers[gameState.difficulty];

    // Process bonus queue
    while (this.bonusQueue.length > 0) {
      frameScore += this.bonusQueue.shift()!;
    }

    // Update current score
    this.currentScore += frameScore;

    // Check milestones
    this.checkMilestones(this.currentScore);

    // Update metrics
    this.metrics.totalTimeAlive += deltaTime;

    return frameScore;
  }

  /**
   * Add a score multiplier
   */
  addMultiplier(id: string, multiplier: number, duration?: number): void {
    this.multipliers.set(id, {
      source: id,
      value: multiplier,
      duration,
      startTime: duration ? Date.now() : undefined,
    });
  }

  /**
   * Remove a multiplier
   */
  removeMultiplier(id: string): void {
    this.multipliers.delete(id);
  }

  /**
   * Calculate total active multiplier
   */
  private calculateTotalMultiplier(): number {
    const now = Date.now();
    let total = 1;

    // Clean up expired multipliers and calculate total
    for (const [id, mult] of this.multipliers) {
      if (mult.duration && mult.startTime) {
        if (now - mult.startTime > mult.duration) {
          this.multipliers.delete(id);
          continue;
        }
      }
      total *= mult.value;
    }

    return total;
  }

  /**
   * Add bonus points for special events
   */
  addBonus(event: ScoreEventType, contextValue?: number): number {
    const bonusAmounts: Record<ScoreEventType, number> = {
      perfect_timing: 250,
      close_call: 500,
      event_complete: this.config.eventCompleteBonus,
      powerup_chain: 300,
      comeback: 750,
      streak_milestone: 1000,
      efficiency_bonus: 600,
    };

    let bonus = bonusAmounts[event];

    // Apply context-based scaling
    if (contextValue) {
      bonus = Math.floor(bonus * (1 + contextValue / 100));
    }

    this.bonusQueue.push(bonus);
    this.metrics.bonusesEarned += bonus;

    return bonus;
  }

  /**
   * Track event completion
   */
  trackEventComplete(): void {
    this.metrics.eventsCompleted++;
    this.addBonus('event_complete');
  }

  /**
   * Track powerup usage
   */
  trackPowerupUsed(): void {
    this.metrics.powerupsUsed++;

    // Check for powerup chain
    if (this.metrics.powerupsUsed % 3 === 0) {
      this.addBonus('powerup_chain');
    }
  }

  /**
   * Track perfect action
   */
  trackPerfectAction(): void {
    this.metrics.perfectActions++;
    if (this.metrics.perfectActions % 5 === 0) {
      this.addBonus('perfect_timing');
    }
  }

  /**
   * Check and trigger milestone bonuses
   */
  private checkMilestones(score: number): void {
    for (const threshold of this.config.milestoneThresholds) {
      if (score >= threshold && !this.milestoneReached.has(threshold)) {
        this.milestoneReached.add(threshold);
        this.addBonus('streak_milestone', threshold / 1000);
      }
    }
  }

  /**
   * Calculate final score with all bonuses
   */
  calculateFinalScore(
    gameStats: GameStats,
    difficulty: Difficulty,
    victory: boolean
  ): DetailedScoreBreakdown {
    const breakdown: DetailedScoreBreakdown = {
      baseScore: this.currentScore,
      timeBonus: Math.floor(this.metrics.totalTimeAlive / 1000) * 10,
      optimalBonus: Math.floor(this.metrics.timeInOptimal / 1000) * 25,
      streakBonus: Math.floor(this.metrics.longestStreak / 1000) * 50,
      eventBonus: this.metrics.eventsCompleted * this.config.eventCompleteBonus,
      powerupBonus: this.metrics.powerupsUsed * this.config.powerupScoreBonus,
      difficultyMultiplier: this.config.difficultyMultipliers[difficulty],
      healthBonus: victory ? Math.floor(gameStats.currentHealthLevel * 1000) : 0,
      perfectBonus: this.metrics.perfectActions * 200,
      totalScore: 0,
    };

    // Victory bonus
    if (victory) {
      breakdown.baseScore *= 1.5;
    }

    // Calculate total with difficulty multiplier
    const subtotal =
      breakdown.baseScore +
      breakdown.timeBonus +
      breakdown.optimalBonus +
      breakdown.streakBonus +
      breakdown.eventBonus +
      breakdown.powerupBonus +
      breakdown.healthBonus +
      breakdown.perfectBonus;

    breakdown.totalScore = Math.floor(subtotal * breakdown.difficultyMultiplier);

    return breakdown;
  }

  /**
   * Get current score
   */
  getCurrentScore(): number {
    return Math.floor(this.currentScore);
  }

  /**
   * Get score metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Format score for display
   */
  formatScore(score: number): string {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(2)}M`;
    }
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score.toLocaleString();
  }

  /**
   * Get score rank
   */
  getScoreRank(score: number): { rank: string; color: string; title: string } {
    const ranks = [
      { threshold: 100000, rank: 'S+', color: '#FFD700', title: 'Legendary' },
      { threshold: 75000, rank: 'S', color: '#FFA500', title: 'Master' },
      { threshold: 50000, rank: 'A+', color: '#FF69B4', title: 'Expert' },
      { threshold: 35000, rank: 'A', color: '#9370DB', title: 'Advanced' },
      { threshold: 25000, rank: 'B+', color: '#00CED1', title: 'Skilled' },
      { threshold: 15000, rank: 'B', color: '#32CD32', title: 'Proficient' },
      { threshold: 10000, rank: 'C+', color: '#90EE90', title: 'Competent' },
      { threshold: 5000, rank: 'C', color: '#87CEEB', title: 'Capable' },
      { threshold: 2500, rank: 'D', color: '#B0C4DE', title: 'Beginner' },
      { threshold: 0, rank: 'F', color: '#D3D3D3', title: 'Intern' },
    ];

    for (const rankData of ranks) {
      if (score >= rankData.threshold) {
        return rankData;
      }
    }

    return ranks[ranks.length - 1];
  }

  /**
   * Reset scoring system for new game
   */
  reset(): void {
    this.currentScore = 0;
    this.multipliers.clear();
    this.bonusQueue = [];
    this.milestoneReached.clear();
    this.sessionStartTime = Date.now();
    this.metrics = {
      totalTimeAlive: 0,
      timeInOptimal: 0,
      longestStreak: 0,
      eventsCompleted: 0,
      powerupsUsed: 0,
      perfectActions: 0,
      bonusesEarned: 0,
    };
  }
}

/**
 * Leaderboard Manager
 */
export class LeaderboardManager {
  private storage: StorageManager;
  private leaderboards: Map<string, LeaderboardEntry[]> = new Map();
  private readonly MAX_ENTRIES_PER_BOARD = 100;
  private readonly LEADERBOARD_TYPES = ['daily', 'weekly', 'allTime'] as const;

  constructor() {
    this.storage = new StorageManager();
    this.loadLeaderboards();
  }

  /**
   * Load leaderboards from storage
   */
  private loadLeaderboards(): void {
    for (const type of this.LEADERBOARD_TYPES) {
      const key = `leaderboard_${type}`;
      const data = this.storage.getItem(key) as LeaderboardEntry[] | null;
      this.leaderboards.set(type, data || []);
    }
  }

  /**
   * Add a new score to leaderboards
   */
  addScore(entry: Omit<LeaderboardEntry, 'rank'>): void {
    const fullEntry: LeaderboardEntry = {
      ...entry,
      rank: 0,
    };

    // Add to all relevant leaderboards
    this.addToLeaderboard('allTime', fullEntry);

    // Check if score is from today
    if (this.isToday(entry.date)) {
      this.addToLeaderboard('daily', fullEntry);
    }

    // Check if score is from this week
    if (this.isThisWeek(entry.date)) {
      this.addToLeaderboard('weekly', fullEntry);
    }

    this.saveLeaderboards();
  }

  /**
   * Add entry to specific leaderboard
   */
  private addToLeaderboard(type: string, entry: LeaderboardEntry): void {
    const board = this.leaderboards.get(type) || [];

    // Add entry and sort
    board.push(entry);
    board.sort((a, b) => b.score - a.score);

    // Limit entries
    if (board.length > this.MAX_ENTRIES_PER_BOARD) {
      board.length = this.MAX_ENTRIES_PER_BOARD;
    }

    // Update ranks
    board.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    this.leaderboards.set(type, board);
  }

  /**
   * Get leaderboard by type
   */
  getLeaderboard(type: 'daily' | 'weekly' | 'allTime', limit?: number): LeaderboardEntry[] {
    const board = this.leaderboards.get(type) || [];
    return limit ? board.slice(0, limit) : board;
  }

  /**
   * Get player's rank
   */
  getPlayerRank(playerName: string, type: 'daily' | 'weekly' | 'allTime'): number | null {
    const board = this.leaderboards.get(type) || [];
    const entry = board.find(e => e.playerName === playerName);
    return entry ? entry.rank : null;
  }

  /**
   * Get scores around a specific rank
   */
  getScoresAroundRank(
    rank: number,
    type: 'daily' | 'weekly' | 'allTime',
    range: number = 2
  ): LeaderboardEntry[] {
    const board = this.leaderboards.get(type) || [];
    const startIdx = Math.max(0, rank - 1 - range);
    const endIdx = Math.min(board.length, rank + range);
    return board.slice(startIdx, endIdx);
  }

  /**
   * Clear old entries from daily/weekly leaderboards
   */
  cleanupOldEntries(): void {
    const now = new Date();

    // Clean daily leaderboard
    const dailyBoard = this.leaderboards.get('daily') || [];
    this.leaderboards.set(
      'daily',
      dailyBoard.filter(e => this.isToday(e.date))
    );

    // Clean weekly leaderboard
    const weeklyBoard = this.leaderboards.get('weekly') || [];
    this.leaderboards.set(
      'weekly',
      weeklyBoard.filter(e => this.isThisWeek(e.date))
    );

    this.saveLeaderboards();
  }

  /**
   * Check if date is today
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /**
   * Check if date is this week
   */
  private isThisWeek(date: Date): boolean {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }

  /**
   * Save leaderboards to storage
   */
  private saveLeaderboards(): void {
    for (const [type, board] of this.leaderboards) {
      this.storage.setItem(`leaderboard_${type}`, board);
    }
  }

  /**
   * Get leaderboard statistics
   */
  getStatistics(type: 'daily' | 'weekly' | 'allTime') {
    const board = this.leaderboards.get(type) || [];

    if (board.length === 0) {
      return {
        totalPlayers: 0,
        averageScore: 0,
        topScore: 0,
        medianScore: 0,
      };
    }

    const scores = board.map(e => e.score);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const sortedScores = [...scores].sort((a, b) => a - b);
    const medianIndex = Math.floor(sortedScores.length / 2);

    return {
      totalPlayers: board.length,
      averageScore: Math.floor(totalScore / board.length),
      topScore: board[0]?.score || 0,
      medianScore: sortedScores[medianIndex],
    };
  }

  /**
   * Export leaderboard data
   */
  exportLeaderboard(type: 'daily' | 'weekly' | 'allTime'): string {
    const board = this.leaderboards.get(type) || [];
    return JSON.stringify(board, null, 2);
  }
}

/**
 * Create pre-configured instances
 */
export function createScoringSystem(config?: Partial<ScoringConfig>): EnhancedScoringSystem {
  return new EnhancedScoringSystem(config);
}

export function createLeaderboardManager(): LeaderboardManager {
  return new LeaderboardManager();
}