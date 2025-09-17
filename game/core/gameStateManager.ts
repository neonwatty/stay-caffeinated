/**
 * Game State Manager - Core state management for the game
 */

import type { GameState, GameStats, GameConfig, Difficulty } from '@/types';
import {
  CAFFEINE_MAX,
  CAFFEINE_MIN,
  CAFFEINE_OPTIMAL_MIN,
  CAFFEINE_OPTIMAL_MAX,
  HEALTH_MAX,
  HEALTH_MIN,
  HEALTH_DEPLETION_RATE,
  DIFFICULTY_CONFIGS,
  WORKDAY_REAL_TIME,
} from './constants';

export interface GameStateData {
  state: GameState;
  stats: GameStats;
  config: GameConfig;
  startTime: number;
  lastUpdateTime: number;
  gameTime: number; // Current time in the game day (0-workdayLength)
  realTimeElapsed: number;
  isPaused: boolean;
}

export class GameStateManager {
  private state: GameStateData;
  private listeners: Set<(state: GameStateData) => void> = new Set();

  constructor(config?: Partial<GameConfig>) {
    this.state = this.createInitialState(config);
  }

  private createInitialState(config?: Partial<GameConfig>): GameStateData {
    const defaultConfig: GameConfig = {
      difficulty: 'junior',
      soundEnabled: true,
      particlesEnabled: true,
      screenShakeEnabled: true,
      ...config,
    };

    return {
      state: 'menu',
      stats: {
        currentCaffeineLevel: 50, // Start at moderate caffeine
        currentHealthLevel: 100,
        timeElapsed: 0,
        drinksConsumed: 0,
        score: 0,
        streak: 0,
        isInOptimalZone: true,
      },
      config: defaultConfig,
      startTime: 0,
      lastUpdateTime: 0,
      gameTime: 0,
      realTimeElapsed: 0,
      isPaused: false,
    };
  }

  // State getters
  getState(): GameStateData {
    return { ...this.state };
  }

  getCurrentState(): GameState {
    return this.state.state;
  }

  getStats(): GameStats {
    return { ...this.state.stats };
  }

  getConfig(): GameConfig {
    return { ...this.state.config };
  }

  // State transitions
  startGame(): void {
    this.state.state = 'playing';
    this.state.startTime = performance.now();
    this.state.lastUpdateTime = performance.now();
    this.state.gameTime = 0;
    this.state.realTimeElapsed = 0;
    this.state.stats = {
      currentCaffeineLevel: 50,
      currentHealthLevel: 100,
      timeElapsed: 0,
      drinksConsumed: 0,
      score: 0,
      streak: 0,
      isInOptimalZone: true,
    };
    this.notifyListeners();
  }

  pauseGame(): void {
    if (this.state.state === 'playing') {
      this.state.state = 'paused';
      this.state.isPaused = true;
      this.notifyListeners();
    }
  }

  resumeGame(): void {
    if (this.state.state === 'paused') {
      this.state.state = 'playing';
      this.state.isPaused = false;
      this.state.lastUpdateTime = performance.now();
      this.notifyListeners();
    }
  }

  endGame(outcome: 'victory' | 'passOut' | 'explosion'): void {
    this.state.state = outcome === 'victory' ? 'victory' : 'gameOver';
    this.notifyListeners();
  }

  returnToMenu(): void {
    this.state = this.createInitialState(this.state.config);
    this.notifyListeners();
  }

  // Caffeine management
  updateCaffeineLevel(delta: number): void {
    const newLevel = Math.max(
      CAFFEINE_MIN,
      Math.min(CAFFEINE_MAX, this.state.stats.currentCaffeineLevel + delta)
    );
    this.state.stats.currentCaffeineLevel = newLevel;
    this.updateOptimalZoneStatus();
    this.notifyListeners();
  }

  consumeDrink(caffeineAmount: number): void {
    this.updateCaffeineLevel(caffeineAmount);
    this.state.stats.drinksConsumed++;
    this.notifyListeners();
  }

  // Health management
  private updateHealth(deltaTime: number): void {
    if (!this.state.stats.isInOptimalZone) {
      const healthDelta = -HEALTH_DEPLETION_RATE * (deltaTime / 1000);
      const newHealth = Math.max(
        HEALTH_MIN,
        Math.min(HEALTH_MAX, this.state.stats.currentHealthLevel + healthDelta)
      );
      this.state.stats.currentHealthLevel = newHealth;
    }
  }

  // Optimal zone checking
  private updateOptimalZoneStatus(): void {
    const { currentCaffeineLevel } = this.state.stats;
    const difficulty = DIFFICULTY_CONFIGS[this.state.config.difficulty];
    const zoneHalf = difficulty.optimalZoneSize / 2;
    const center = 50;
    const min = center - zoneHalf;
    const max = center + zoneHalf;

    const wasInOptimalZone = this.state.stats.isInOptimalZone;
    this.state.stats.isInOptimalZone = currentCaffeineLevel >= min && currentCaffeineLevel <= max;

    // Reset streak if left optimal zone
    if (wasInOptimalZone && !this.state.stats.isInOptimalZone) {
      this.state.stats.streak = 0;
    }
  }

  // Score calculation
  private updateScore(deltaTime: number): void {
    const baseScore = (deltaTime / 1000) * 10; // 10 points per second
    const multiplier = this.state.stats.isInOptimalZone ? 2 : 1;
    this.state.stats.score += baseScore * multiplier;

    // Update streak
    if (this.state.stats.isInOptimalZone) {
      this.state.stats.streak += deltaTime / 1000;
    }
  }

  // Main update function
  update(currentTime: number): void {
    if (this.state.state !== 'playing' || this.state.isPaused) {
      return;
    }

    const deltaTime = currentTime - this.state.lastUpdateTime;
    this.state.lastUpdateTime = currentTime;
    this.state.realTimeElapsed += deltaTime;

    // Calculate game time progression
    const difficulty = DIFFICULTY_CONFIGS[this.state.config.difficulty];
    const gameTimeScale = (difficulty.workdayLength * 60 * 1000) / WORKDAY_REAL_TIME;
    this.state.gameTime += (deltaTime * gameTimeScale) / 1000;
    // timeElapsed should track real time, not scaled game time
    this.state.stats.timeElapsed = this.state.realTimeElapsed / 1000;

    // Update caffeine depletion
    const caffeineDepletion = -difficulty.caffeineDepletionRate * (deltaTime / 1000);
    this.updateCaffeineLevel(caffeineDepletion);

    // Update health
    this.updateHealth(deltaTime);

    // Update score
    this.updateScore(deltaTime);

    // Check win/lose conditions
    this.checkGameEndConditions();

    this.notifyListeners();
  }

  private checkGameEndConditions(): void {
    const difficulty = DIFFICULTY_CONFIGS[this.state.config.difficulty];

    // Victory: survived the full workday
    if (this.state.gameTime >= difficulty.workdayLength * 60) {
      this.endGame('victory');
      return;
    }

    // Loss: health depleted
    if (this.state.stats.currentHealthLevel <= 0) {
      // Determine loss type based on caffeine level
      if (this.state.stats.currentCaffeineLevel <= CAFFEINE_MIN + 10) {
        this.endGame('passOut');
      } else if (this.state.stats.currentCaffeineLevel >= CAFFEINE_MAX - 10) {
        this.endGame('explosion');
      } else {
        this.endGame('passOut');
      }
    }
  }

  // Configuration
  setDifficulty(difficulty: Difficulty): void {
    this.state.config.difficulty = difficulty;
    this.notifyListeners();
  }

  setConfig(config: Partial<GameConfig>): void {
    this.state.config = { ...this.state.config, ...config };
    this.notifyListeners();
  }

  // Event listeners
  subscribe(listener: (state: GameStateData) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }
}