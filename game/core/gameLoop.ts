/**
 * Game Loop Engine - Manages the main game update cycle
 */

import { GameStateManager } from './gameStateManager';
import { TICK_INTERVAL } from './constants';

export type GameLoopCallback = (state: GameStateManager) => void;

export class GameLoop {
  private gameState: GameStateManager;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private accumulator: number = 0;
  private isRunning: boolean = false;
  private callbacks: Set<GameLoopCallback> = new Set();

  constructor(gameState: GameStateManager) {
    this.gameState = gameState;
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.accumulator = 0;
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
  }

  /**
   * Pause the game loop
   */
  pause(): void {
    this.gameState.pauseGame();
  }

  /**
   * Resume the game loop
   */
  resume(): void {
    this.gameState.resumeGame();
    this.lastTimestamp = performance.now();
  }

  /**
   * Main game loop using fixed timestep with interpolation
   */
  private loop = (timestamp: number): void => {
    if (!this.isRunning) return;

    const deltaTime = Math.min(timestamp - this.lastTimestamp, 250); // Cap at 250ms to prevent spiral of death
    this.lastTimestamp = timestamp;

    // Fixed timestep accumulator pattern for consistent physics
    this.accumulator += deltaTime;

    // Update at fixed intervals
    while (this.accumulator >= TICK_INTERVAL) {
      this.update(TICK_INTERVAL);
      this.accumulator -= TICK_INTERVAL;
    }

    // Interpolation factor for smooth rendering
    const interpolation = this.accumulator / TICK_INTERVAL;
    this.render(interpolation);

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Fixed timestep update
   */
  private update(deltaTime: number): void {
    // Update game state
    this.gameState.update(performance.now());

    // Notify all callbacks
    this.callbacks.forEach(callback => callback(this.gameState));
  }

  /**
   * Render with interpolation (for smooth animations)
   */
  private render(interpolation: number): void {
    // Rendering is handled by React components
    // The interpolation factor can be used for smooth visual updates
    // This is where we'd trigger React updates if needed
  }

  /**
   * Register a callback to be called on each update
   */
  onUpdate(callback: GameLoopCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Get current game state
   */
  getGameState(): GameStateManager {
    return this.gameState;
  }

  /**
   * Check if the loop is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Reset the game loop
   */
  reset(): void {
    this.stop();
    this.accumulator = 0;
    this.lastTimestamp = 0;
  }
}

// Singleton instance for global access
let gameLoopInstance: GameLoop | null = null;

export function createGameLoop(gameState: GameStateManager): GameLoop {
  if (!gameLoopInstance) {
    gameLoopInstance = new GameLoop(gameState);
  }
  return gameLoopInstance;
}

export function getGameLoop(): GameLoop | null {
  return gameLoopInstance;
}

export function destroyGameLoop(): void {
  if (gameLoopInstance) {
    gameLoopInstance.stop();
    gameLoopInstance = null;
  }
}