/**
 * React Hook for Game Loop Integration
 * Provides a clean interface for components to interact with the game loop engine
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { GameStateData } from '@/game/core/gameStateManager';
import type { GameLoopUpdate, GameEvent } from '@/game/gameLoop';
import {
  GameLoopEngine,
  createGameLoop,
  getGameLoop,
  destroyGameLoop,
} from '@/game/gameLoop';

/**
 * Hook configuration options
 */
export interface UseGameLoopOptions {
  autoStart?: boolean;
  targetFPS?: number;
  onUpdate?: (update: GameLoopUpdate) => void;
  onEvent?: (event: GameEvent) => void;
  onStateChange?: (state: GameStateData) => void;
  onGameOver?: (outcome: 'victory' | 'passOut' | 'explosion') => void;
}

/**
 * Hook return value
 */
export interface UseGameLoopReturn {
  // Game state
  gameState: GameStateData | null;
  isRunning: boolean;
  isPaused: boolean;
  fps: number;

  // Recent updates
  lastUpdate: GameLoopUpdate | null;
  recentEvents: GameEvent[];

  // Controls
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;

  // Actions
  consumeDrink: (drinkType: string) => boolean;
  setDifficulty: (difficulty: 'intern' | 'junior' | 'senior' | 'founder') => void;

  // Info
  caffeineLevel: number;
  healthLevel: number;
  score: number;
  timeElapsed: number;
  isInOptimalZone: boolean;
}

/**
 * React hook for game loop integration
 */
export function useGameLoop(options: UseGameLoopOptions = {}): UseGameLoopReturn {
  const {
    autoStart = false,
    targetFPS = 60,
    onUpdate,
    onEvent,
    onStateChange,
    onGameOver,
  } = options;

  // Refs for stable references
  const gameLoopRef = useRef<GameLoopEngine | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const eventHistoryRef = useRef<GameEvent[]>([]);

  // State
  const [gameState, setGameState] = useState<GameStateData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [fps, setFps] = useState(60);
  const [lastUpdate, setLastUpdate] = useState<GameLoopUpdate | null>(null);
  const [recentEvents, setRecentEvents] = useState<GameEvent[]>([]);

  // Initialize game loop
  useEffect(() => {
    // Create or get existing game loop
    gameLoopRef.current = createGameLoop(undefined, { targetFPS });

    // Subscribe to updates
    unsubscribeRef.current = gameLoopRef.current.onUpdate((update: GameLoopUpdate) => {
      // Update state
      setGameState(update.state);
      setLastUpdate(update);
      setIsRunning(gameLoopRef.current?.isActive() || false);
      setIsPaused(gameLoopRef.current?.isGamePaused() || false);
      setFps(gameLoopRef.current?.getFPS() || 60);

      // Handle events
      if (update.events.length > 0) {
        const newEvents = [...update.events];
        eventHistoryRef.current = [
          ...eventHistoryRef.current,
          ...newEvents,
        ].slice(-100); // Keep last 100 events

        setRecentEvents(newEvents);

        // Call event handler
        newEvents.forEach(event => {
          onEvent?.(event);
        });
      }

      // Call update handler
      onUpdate?.(update);

      // Call state change handler
      onStateChange?.(update.state);

      // Check for game over
      if (update.state.state === 'gameOver' || update.state.state === 'victory') {
        const outcome = update.state.state === 'victory' ? 'victory' :
          update.state.stats.currentCaffeineLevel < 10 ? 'passOut' : 'explosion';
        onGameOver?.(outcome);
      }
    });

    // Auto-start if requested
    if (autoStart) {
      gameLoopRef.current.start();
    }

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      // Don't destroy the singleton, just stop it
      if (gameLoopRef.current?.isActive()) {
        gameLoopRef.current.stop();
      }
    };
  }, []); // Only run on mount

  // Control functions
  const start = useCallback(() => {
    if (gameLoopRef.current) {
      gameLoopRef.current.start();
      setIsRunning(true);
      setIsPaused(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (gameLoopRef.current) {
      gameLoopRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (gameLoopRef.current) {
      gameLoopRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (gameLoopRef.current) {
      gameLoopRef.current.stop();
      setIsRunning(false);
      setIsPaused(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (gameLoopRef.current) {
      gameLoopRef.current.reset();
      setGameState(null);
      setLastUpdate(null);
      setRecentEvents([]);
      eventHistoryRef.current = [];
      setIsRunning(false);
      setIsPaused(false);
    }
  }, []);

  // Action functions
  const consumeDrink = useCallback((drinkType: string): boolean => {
    if (gameLoopRef.current) {
      return gameLoopRef.current.consumeDrink(drinkType);
    }
    return false;
  }, []);

  const setDifficulty = useCallback(
    (difficulty: 'intern' | 'junior' | 'senior' | 'founder') => {
      if (gameLoopRef.current) {
        gameLoopRef.current.setDifficulty(difficulty);
      }
    },
    []
  );

  // Extract key values for convenience
  const caffeineLevel = gameState?.stats.currentCaffeineLevel || 0;
  const healthLevel = gameState?.stats.currentHealthLevel || 0;
  const score = gameState?.stats.score || 0;
  const timeElapsed = gameState?.stats.timeElapsed || 0;
  const isInOptimalZone = gameState?.stats.isInOptimalZone || false;

  return {
    // State
    gameState,
    isRunning,
    isPaused,
    fps,

    // Recent updates
    lastUpdate,
    recentEvents,

    // Controls
    start,
    pause,
    resume,
    stop,
    reset,

    // Actions
    consumeDrink,
    setDifficulty,

    // Info
    caffeineLevel,
    healthLevel,
    score,
    timeElapsed,
    isInOptimalZone,
  };
}

/**
 * Hook for accessing just the game state without controls
 */
export function useGameState() {
  const [gameState, setGameState] = useState<GameStateData | null>(null);

  useEffect(() => {
    const gameLoop = getGameLoop();
    if (!gameLoop) return;

    const unsubscribe = gameLoop.onUpdate((update: GameLoopUpdate) => {
      setGameState(update.state);
    });

    // Get initial state
    setGameState(gameLoop.getState());

    return unsubscribe;
  }, []);

  return gameState;
}

/**
 * Hook for accessing game events
 */
export function useGameEvents(maxEvents: number = 10): GameEvent[] {
  const [events, setEvents] = useState<GameEvent[]>([]);

  useEffect(() => {
    const gameLoop = getGameLoop();
    if (!gameLoop) return;

    const recentEvents: GameEvent[] = [];

    const unsubscribe = gameLoop.onUpdate((update: GameLoopUpdate) => {
      if (update.events.length > 0) {
        recentEvents.push(...update.events);
        while (recentEvents.length > maxEvents) {
          recentEvents.shift();
        }
        setEvents([...recentEvents]);
      }
    });

    return unsubscribe;
  }, [maxEvents]);

  return events;
}

/**
 * Hook for FPS monitoring
 */
export function useGameFPS(): number {
  const [fps, setFps] = useState(60);

  useEffect(() => {
    const gameLoop = getGameLoop();
    if (!gameLoop) return;

    const interval = setInterval(() => {
      setFps(gameLoop.getFPS());
    }, 500); // Update FPS twice per second

    return () => clearInterval(interval);
  }, []);

  return fps;
}