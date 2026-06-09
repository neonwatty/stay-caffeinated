/**
 * Game State Manager - Core state management for the game
 */

import type { Drink, DrinkType, GameState, GameStats, GameConfig, Difficulty } from '@/types';
import { DRINKS } from '@/game/data/drinks';
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
  activeDrinkEffects?: DrinkEffectState[];
  recentDrinkConsequences?: string[];
}

interface DrinkEffectState {
  id: number;
  drinkId: DrinkType;
  releaseRemaining: number;
  releaseDuration: number;
  releaseElapsed: number;
  crashRemaining: number;
  crashDuration: number;
  crashElapsed: number;
}

export class GameStateManager {
  private state: GameStateData;
  private listeners: Set<(state: GameStateData) => void> = new Set();
  private nextDrinkEffectId = 1;

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
        currentCaffeineLevel: 40, // Start at moderate caffeine
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
      activeDrinkEffects: [],
      recentDrinkConsequences: [],
    };
  }

  // State getters
  getState(): GameStateData {
    return {
      ...this.state,
      activeDrinkEffects: (this.state.activeDrinkEffects ?? []).map(effect => ({ ...effect })),
      recentDrinkConsequences: [...(this.state.recentDrinkConsequences ?? [])],
    };
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
      currentCaffeineLevel: 40,
      currentHealthLevel: 100,
      timeElapsed: 0,
      drinksConsumed: 0,
      score: 0,
      streak: 0,
      isInOptimalZone: true,
    };
    this.state.activeDrinkEffects = [];
    this.state.recentDrinkConsequences = [];
    this.nextDrinkEffectId = 1;
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
    const drink = this.findDrinkForCaffeineAmount(caffeineAmount);

    if (!drink) {
      this.updateCaffeineLevel(caffeineAmount);
      this.state.stats.drinksConsumed++;
      this.addRecentDrinkConsequence(`Quick boost ${formatSignedAmount(caffeineAmount)}`);
      this.notifyListeners();
      return;
    }

    if (drink.id === 'water') {
      const stabilizedCrash = this.stabilizePendingCrashes();
      this.addRecentDrinkConsequence(
        stabilizedCrash > 0 ? `Water stabilized ${stabilizedCrash.toFixed(1)} crash` : 'Water stabilized health',
      );
      this.state.stats.drinksConsumed++;
      this.notifyListeners();
      return;
    }

    const immediateRelease = getImmediateRelease(drink);
    const releaseRemaining = Math.max(0, drink.caffeineBoost - immediateRelease);
    const crashSeverity = Math.max(0, drink.crashSeverity);

    this.updateCaffeineLevel(immediateRelease);
    const activeDrinkEffects = this.state.activeDrinkEffects ?? [];
    activeDrinkEffects.push({
      id: this.nextDrinkEffectId++,
      drinkId: drink.id,
      releaseRemaining,
      releaseDuration: Math.max(250, drink.releaseSpeed),
      releaseElapsed: 0,
      crashRemaining: crashSeverity,
      crashDuration: 2500 + crashSeverity * 300,
      crashElapsed: 0,
    });
    this.state.activeDrinkEffects = activeDrinkEffects;
    this.addRecentDrinkConsequence(
      `${drink.name}: ${formatSignedAmount(immediateRelease)} now, ${formatSignedAmount(releaseRemaining)} release, ${formatSignedAmount(-crashSeverity)} crash`,
    );
    this.state.stats.drinksConsumed++;
    this.notifyListeners();
  }

  // Public health modification
  healHealth(amount: number): void {
    if (this.state.state !== 'playing') return;
    this.state.stats.currentHealthLevel = Math.min(
      HEALTH_MAX,
      this.state.stats.currentHealthLevel + amount
    );
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

    // If lastUpdateTime is in the future (test scenario), reset it
    if (this.state.lastUpdateTime > currentTime) {
      this.state.lastUpdateTime = currentTime;
      this.state.startTime = currentTime;
      this.state.realTimeElapsed = 0;
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

    // Update active drink release/crash effects
    this.updateDrinkEffects(deltaTime);

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

  private updateDrinkEffects(deltaTime: number): void {
    const activeDrinkEffects = this.state.activeDrinkEffects ?? [];
    if (activeDrinkEffects.length === 0) return;

    let caffeineDelta = 0;
    const remainingEffects: DrinkEffectState[] = [];

    for (const effect of activeDrinkEffects) {
      if (effect.releaseRemaining > 0 && effect.releaseElapsed < effect.releaseDuration) {
        const previousProgress = effect.releaseElapsed / effect.releaseDuration;
        effect.releaseElapsed = Math.min(effect.releaseDuration, effect.releaseElapsed + deltaTime);
        const currentProgress = effect.releaseElapsed / effect.releaseDuration;
        const releaseDelta = effect.releaseRemaining * (currentProgress - previousProgress);
        caffeineDelta += releaseDelta;
      } else if (effect.crashRemaining > 0 && effect.crashElapsed < effect.crashDuration) {
        const previousProgress = effect.crashElapsed / effect.crashDuration;
        effect.crashElapsed = Math.min(effect.crashDuration, effect.crashElapsed + deltaTime);
        const currentProgress = effect.crashElapsed / effect.crashDuration;
        const crashDelta = -effect.crashRemaining * (currentProgress - previousProgress);
        caffeineDelta += crashDelta;
      }

      const releaseDone = effect.releaseRemaining <= 0 || effect.releaseElapsed >= effect.releaseDuration;
      const crashDone = effect.crashRemaining <= 0 || effect.crashElapsed >= effect.crashDuration;

      if (!releaseDone || !crashDone) {
        remainingEffects.push(effect);
      }
    }

    this.state.activeDrinkEffects = remainingEffects;

    if (caffeineDelta !== 0) {
      this.updateCaffeineLevel(caffeineDelta);
    }
  }

  private findDrinkForCaffeineAmount(caffeineAmount: number): Drink | undefined {
    return DRINKS.find(drink => drink.caffeineBoost === caffeineAmount);
  }

  private stabilizePendingCrashes(): number {
    let stabilized = 0;

    const activeDrinkEffects = this.state.activeDrinkEffects ?? [];
    this.state.activeDrinkEffects = activeDrinkEffects.map(effect => {
      const reduction = effect.crashRemaining * 0.5;
      stabilized += reduction;

      return {
        ...effect,
        crashRemaining: effect.crashRemaining - reduction,
      };
    });

    return stabilized;
  }

  private addRecentDrinkConsequence(message: string): void {
    this.state.recentDrinkConsequences = [message, ...(this.state.recentDrinkConsequences ?? [])].slice(0, 3);
  }

  // Configuration
  setDifficulty(difficulty: Difficulty): void {
    this.state.config.difficulty = difficulty;
    this.updateOptimalZoneStatus(); // Recalculate optimal zone with new difficulty
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

function getImmediateRelease(drink: Drink): number {
  const releaseFraction = {
    instant: 0.65,
    moderate: 0.35,
    slow: 0.2,
  }[drink.releaseProfile];

  return roundToTenth(drink.caffeineBoost * releaseFraction);
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function formatSignedAmount(value: number): string {
  const rounded = roundToTenth(value);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}
