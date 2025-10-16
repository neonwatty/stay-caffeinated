/**
 * Enhanced Game Loop Engine
 * Manages the main game loop with time progression, state updates, and collision detection
 * Supports 60fps updates with caffeine depletion, health calculations, and win/lose conditions
 */

import type { Difficulty } from '@/types/game';
import type { DrinkType } from '@/types/drinks';
import { GameStateManager, type GameStateData } from './core/gameStateManager';
import { DrinkConsumptionManager } from './drinks';
import { DrinkEffectCalculator } from './effects';
import { DifficultyManager } from './difficulty';
import { ScoringSystem } from './mechanics/scoringSystem';

/**
 * Game loop configuration
 */
export interface GameLoopConfig {
  targetFPS: number;
  maxDeltaTime: number;
  fixedTimeStep: boolean;
  interpolation: boolean;
}

/**
 * Game loop update context
 */
export interface UpdateContext {
  deltaTime: number;
  totalTime: number;
  frameCount: number;
  fps: number;
  interpolation: number;
}

/**
 * Game loop state updates
 */
export interface GameLoopUpdate {
  state: GameStateData;
  caffeineChange: number;
  healthChange: number;
  scoreChange: number;
  activeDrinks: string[];
  crashingDrinks: string[];
  events: GameEvent[];
}

/**
 * Game events that occur during updates
 */
export interface GameEvent {
  type: 'milestone' | 'warning' | 'critical' | 'achievement' | 'state_change';
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: number;
}

/**
 * Collision/threshold detection
 */
export interface CollisionDetection {
  caffeineThresholds: {
    low: boolean;
    high: boolean;
    critical: boolean;
  };
  healthThresholds: {
    low: boolean;
    critical: boolean;
  };
  timeThresholds: {
    quarterDay: boolean;
    halfDay: boolean;
    threeQuarterDay: boolean;
    nearEnd: boolean;
  };
}

/**
 * Enhanced Game Loop Engine
 */
export class GameLoopEngine {
  private config: GameLoopConfig;
  private gameState: GameStateManager;
  private drinkManager: DrinkConsumptionManager;
  private effectCalculator: DrinkEffectCalculator;
  private difficultyManager: DifficultyManager;
  private scoringSystem: ScoringSystem;

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animationFrameId: number | null = null;

  private lastTimestamp: number = 0;
  private accumulator: number = 0;
  private frameCount: number = 0;
  private fpsAccumulator: number = 0;
  private currentFPS: number = 60;

  private updateCallbacks: Set<(update: GameLoopUpdate) => void> = new Set();
  private eventQueue: GameEvent[] = [];

  constructor(
    gameState?: GameStateManager,
    config?: Partial<GameLoopConfig>
  ) {
    this.config = {
      targetFPS: 60,
      maxDeltaTime: 250,
      fixedTimeStep: true,
      interpolation: true,
      ...config,
    };

    this.gameState = gameState || new GameStateManager();
    this.drinkManager = new DrinkConsumptionManager();
    this.effectCalculator = new DrinkEffectCalculator();
    this.difficultyManager = new DifficultyManager(this.gameState.getConfig().difficulty);
    this.scoringSystem = new ScoringSystem();
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.lastTimestamp = performance.now();
    this.accumulator = 0;
    this.frameCount = 0;
    this.fpsAccumulator = 0;
    this.eventQueue = [];

    this.gameState.startGame();
    this.queueEvent({
      type: 'state_change',
      message: 'Game started',
      severity: 'info',
      timestamp: Date.now(),
    });

    this.loop(this.lastTimestamp);
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.queueEvent({
      type: 'state_change',
      message: 'Game stopped',
      severity: 'info',
      timestamp: Date.now(),
    });
  }

  /**
   * Pause the game
   */
  pause(): void {
    if (!this.isPaused && this.isRunning) {
      this.isPaused = true;
      this.gameState.pauseGame();
      this.queueEvent({
        type: 'state_change',
        message: 'Game paused',
        severity: 'info',
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Resume the game
   */
  resume(): void {
    if (this.isPaused && this.isRunning) {
      this.isPaused = false;
      this.lastTimestamp = performance.now();
      this.gameState.resumeGame();
      this.queueEvent({
        type: 'state_change',
        message: 'Game resumed',
        severity: 'info',
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Main game loop
   */
  private loop = (timestamp: number): void => {
    if (!this.isRunning) return;

    const rawDeltaTime = timestamp - this.lastTimestamp;
    const deltaTime = Math.min(rawDeltaTime, this.config.maxDeltaTime);
    this.lastTimestamp = timestamp;

    // Calculate FPS
    this.updateFPS(deltaTime);

    if (!this.isPaused) {
      if (this.config.fixedTimeStep) {
        // Fixed timestep with accumulator
        const timeStep = 1000 / this.config.targetFPS;
        this.accumulator += deltaTime;

        while (this.accumulator >= timeStep) {
          this.update(timeStep);
          this.accumulator -= timeStep;
        }

        // Calculate interpolation for smooth rendering
        const interpolation = this.config.interpolation ? this.accumulator / timeStep : 0;
        this.render(interpolation);
      } else {
        // Variable timestep
        this.update(deltaTime);
        this.render(0);
      }
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Update game state
   */
  private update(deltaTime: number): void {
    const currentTime = performance.now();
    this.frameCount++;

    // Get current state before update
    const previousState = this.gameState.getState();
    const previousCaffeine = previousState.stats.currentCaffeineLevel;
    const previousHealth = previousState.stats.currentHealthLevel;
    const previousScore = previousState.stats.score;

    // Update game state manager
    this.gameState.update(currentTime);

    // Update drink effects
    const effectUpdate = this.drinkManager.updateEffects(
      currentTime,
      deltaTime
    );

    // Apply caffeine changes from drinks
    if (effectUpdate.caffeineChange !== 0) {
      this.gameState.updateCaffeineLevel(effectUpdate.caffeineChange);
    }

    // Get updated state
    const currentState = this.gameState.getState();

    // Detect collisions/thresholds
    this.detectCollisions(currentState);

    // Check for milestones
    this.checkMilestones(currentState, previousState);

    // Calculate changes
    const caffeineChange = currentState.stats.currentCaffeineLevel - previousCaffeine;
    const healthChange = currentState.stats.currentHealthLevel - previousHealth;
    const scoreChange = currentState.stats.score - previousScore;

    // Build update object
    const update: GameLoopUpdate = {
      state: currentState,
      caffeineChange,
      healthChange,
      scoreChange,
      activeDrinks: effectUpdate.activeDrinks,
      crashingDrinks: effectUpdate.crashingDrinks,
      events: [...this.eventQueue],
    };

    // Clear event queue
    this.eventQueue = [];

    // Notify callbacks
    this.notifyCallbacks(update);
  }

  /**
   * Render interpolated state
   */
  private render(interpolation: number): void {
    // Rendering is handled by React components
    // The interpolation value can be used for smooth animations
    const context: UpdateContext = {
      deltaTime: 1000 / this.config.targetFPS,
      totalTime: performance.now() - this.gameState.getState().startTime,
      frameCount: this.frameCount,
      fps: this.currentFPS,
      interpolation,
    };

    // This context can be accessed by components for smooth rendering
  }

  /**
   * Detect collisions and threshold crossings
   */
  private detectCollisions(state: GameStateData): CollisionDetection {
    const caffeine = state.stats.currentCaffeineLevel;
    const health = state.stats.currentHealthLevel;
    const gameTime = state.gameTime;
    const workdayLength = this.difficultyManager.getConfig().workdayLength * 60;

    const detection: CollisionDetection = {
      caffeineThresholds: {
        low: caffeine < 20,
        high: caffeine > 80,
        critical: caffeine < 10 || caffeine > 90,
      },
      healthThresholds: {
        low: health < 30,
        critical: health < 10,
      },
      timeThresholds: {
        quarterDay: Math.abs(gameTime - workdayLength * 0.25) < 1,
        halfDay: Math.abs(gameTime - workdayLength * 0.5) < 1,
        threeQuarterDay: Math.abs(gameTime - workdayLength * 0.75) < 1,
        nearEnd: gameTime > workdayLength * 0.9,
      },
    };

    // Generate events based on threshold crossings
    if (detection.caffeineThresholds.critical) {
      this.queueEvent({
        type: 'critical',
        message: caffeine < 10 ? 'Critical: About to pass out!' : 'Critical: Heart racing dangerously!',
        severity: 'error',
        timestamp: Date.now(),
      });
    } else if (detection.caffeineThresholds.low || detection.caffeineThresholds.high) {
      this.queueEvent({
        type: 'warning',
        message: caffeine < 20 ? 'Warning: Caffeine getting low' : 'Warning: Caffeine getting high',
        severity: 'warning',
        timestamp: Date.now(),
      });
    }

    if (detection.healthThresholds.critical) {
      this.queueEvent({
        type: 'critical',
        message: 'Critical: Health dangerously low!',
        severity: 'error',
        timestamp: Date.now(),
      });
    } else if (detection.healthThresholds.low) {
      this.queueEvent({
        type: 'warning',
        message: 'Warning: Health getting low',
        severity: 'warning',
        timestamp: Date.now(),
      });
    }

    return detection;
  }

  /**
   * Check for game milestones
   */
  private checkMilestones(current: GameStateData, previous: GameStateData): void {
    const scoreMilestones = this.scoringSystem.checkMilestones(
      current.stats.score,
      previous.stats.score
    );

    scoreMilestones.forEach(milestone => {
      this.queueEvent({
        type: 'milestone',
        message: `Milestone: ${milestone}`,
        severity: 'success',
        timestamp: Date.now(),
      });
    });

    // Check time milestones
    const workdayLength = this.difficultyManager.getConfig().workdayLength * 60;
    const currentProgress = current.gameTime / workdayLength;
    const previousProgress = previous.gameTime / workdayLength;

    if (previousProgress < 0.25 && currentProgress >= 0.25) {
      this.queueEvent({
        type: 'milestone',
        message: '25% of workday complete!',
        severity: 'info',
        timestamp: Date.now(),
      });
    }
    if (previousProgress < 0.5 && currentProgress >= 0.5) {
      this.queueEvent({
        type: 'milestone',
        message: 'Halfway through the workday!',
        severity: 'info',
        timestamp: Date.now(),
      });
    }
    if (previousProgress < 0.75 && currentProgress >= 0.75) {
      this.queueEvent({
        type: 'milestone',
        message: '75% of workday complete!',
        severity: 'info',
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Update FPS calculation
   */
  private updateFPS(deltaTime: number): void {
    this.fpsAccumulator += deltaTime;
    if (this.fpsAccumulator >= 1000) {
      this.currentFPS = Math.round(1000 / (this.fpsAccumulator / this.frameCount));
      this.fpsAccumulator = 0;
      this.frameCount = 0;
    }
  }

  /**
   * Queue a game event
   */
  private queueEvent(event: GameEvent): void {
    this.eventQueue.push(event);
  }

  /**
   * Notify all update callbacks
   */
  private notifyCallbacks(update: GameLoopUpdate): void {
    this.updateCallbacks.forEach(callback => callback(update));
  }

  /**
   * Register an update callback
   */
  onUpdate(callback: (update: GameLoopUpdate) => void): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  /**
   * Consume a drink
   */
  consumeDrink(drinkType: string): boolean {
    const result = this.drinkManager.consumeDrink(
      drinkType as DrinkType,
      performance.now()
    );

    if (result.success) {
      this.gameState.consumeDrink(result.caffeineBoost);
      this.queueEvent({
        type: 'state_change',
        message: result.message,
        severity: 'success',
        timestamp: Date.now(),
      });
      return true;
    }

    return false;
  }

  /**
   * Get current game state
   */
  getState(): GameStateData {
    return this.gameState.getState();
  }

  /**
   * Get game state manager
   */
  getGameStateManager(): GameStateManager {
    return this.gameState;
  }

  /**
   * Get drink manager
   */
  getDrinkManager(): DrinkConsumptionManager {
    return this.drinkManager;
  }

  /**
   * Get difficulty manager
   */
  getDifficultyManager(): DifficultyManager {
    return this.difficultyManager;
  }

  /**
   * Set difficulty
   */
  setDifficulty(difficulty: Difficulty): void {
    this.difficultyManager.setDifficulty(difficulty);
    this.gameState.setDifficulty(difficulty);
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.currentFPS;
  }

  /**
   * Check if game is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Check if game is paused
   */
  isGamePaused(): boolean {
    return this.isPaused;
  }

  /**
   * Reset the game loop
   */
  reset(): void {
    this.stop();
    this.drinkManager.reset();
    this.effectCalculator.reset();
    this.gameState.returnToMenu();
    this.accumulator = 0;
    this.frameCount = 0;
    this.eventQueue = [];
  }

  /**
   * Destroy the game loop
   */
  destroy(): void {
    this.stop();
    this.updateCallbacks.clear();
    this.eventQueue = [];
  }
}

/**
 * Singleton instance management
 */
let gameLoopInstance: GameLoopEngine | null = null;

/**
 * Create or get the game loop instance
 */
export function createGameLoop(
  gameState?: GameStateManager,
  config?: Partial<GameLoopConfig>
): GameLoopEngine {
  if (!gameLoopInstance) {
    gameLoopInstance = new GameLoopEngine(gameState, config);
  }
  return gameLoopInstance;
}

/**
 * Get the current game loop instance
 */
export function getGameLoop(): GameLoopEngine | null {
  return gameLoopInstance;
}

/**
 * Destroy the game loop instance
 */
export function destroyGameLoop(): void {
  if (gameLoopInstance) {
    gameLoopInstance.destroy();
    gameLoopInstance = null;
  }
}