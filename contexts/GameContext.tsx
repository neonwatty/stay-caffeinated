'use client';

/**
 * Game Context - React context for game state management
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { GameStateManager, GameStateData } from '@/game/core/gameStateManager';
import { GameLoop, createGameLoop, destroyGameLoop } from '@/game/core/gameLoop';
import type { GameConfig, Difficulty, DrinkType, EventType } from '@/types';

interface GameContextValue {
  gameState: GameStateData | null;
  isLoading: boolean;

  // Game controls
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  returnToMenu: () => void;

  // Game actions
  consumeDrink: (caffeineAmount: number, drinkType?: DrinkType) => void;
  triggerEvent: (eventType: EventType) => void;

  // Drink management
  drinkCooldowns: Map<DrinkType, number>;
  canConsumeDrink: (drinkType: DrinkType) => boolean;

  // Configuration
  setDifficulty: (difficulty: Difficulty) => void;
  setConfig: (config: Partial<GameConfig>) => void;

  // Performance metrics
  fps: number;
  lastUpdateTime: number;
}

const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<GameConfig>;
}

export function GameProvider({ children, initialConfig }: GameProviderProps) {
  const [gameState, setGameState] = useState<GameStateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drinkCooldowns, setDrinkCooldowns] = useState<Map<DrinkType, number>>(new Map());
  const [fps, setFps] = useState(60);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  const gameManagerRef = useRef<GameStateManager | null>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);

  // Initialize game manager and loop
  useEffect(() => {
    const manager = new GameStateManager(initialConfig);
    const loop = createGameLoop(manager);

    gameManagerRef.current = manager;
    gameLoopRef.current = loop;

    // Subscribe to state changes
    const unsubscribe = manager.subscribe((newState) => {
      setGameState(newState);
    });

    // Set initial state
    setGameState(manager.getState());
    setIsLoading(false);

    // Cleanup
    return () => {
      unsubscribe();
      loop.stop();
      destroyGameLoop();
    };
  }, [initialConfig]);

  // Game controls
  const startGame = useCallback(() => {
    if (!gameManagerRef.current || !gameLoopRef.current) return;

    gameManagerRef.current.startGame();
    gameLoopRef.current.start();
  }, []);

  const pauseGame = useCallback(() => {
    if (!gameLoopRef.current) return;
    gameLoopRef.current.pause();
  }, []);

  const resumeGame = useCallback(() => {
    if (!gameLoopRef.current) return;
    gameLoopRef.current.resume();
  }, []);

  const resetGame = useCallback(() => {
    if (!gameManagerRef.current || !gameLoopRef.current) return;

    gameLoopRef.current.stop();
    gameManagerRef.current.returnToMenu();
    gameManagerRef.current.startGame();
    gameLoopRef.current.start();
  }, []);

  const returnToMenu = useCallback(() => {
    if (!gameManagerRef.current || !gameLoopRef.current) return;

    gameLoopRef.current.stop();
    gameManagerRef.current.returnToMenu();
  }, []);

  // Game actions
  const consumeDrink = useCallback((caffeineAmount: number, drinkType?: DrinkType) => {
    if (!gameManagerRef.current) return;

    // Update cooldown if drink type provided
    if (drinkType) {
      setDrinkCooldowns(prev => {
        const newCooldowns = new Map(prev);
        newCooldowns.set(drinkType, Date.now() + 5000); // 5 second cooldown
        return newCooldowns;
      });
    }

    gameManagerRef.current.consumeDrink(caffeineAmount);
  }, []);

  const triggerEvent = useCallback((eventType: EventType) => {
    if (!gameManagerRef.current) return;
    // Event triggering logic will be implemented in event system
    console.log('Event triggered:', eventType);
  }, []);

  const canConsumeDrink = useCallback((drinkType: DrinkType) => {
    const cooldownTime = drinkCooldowns.get(drinkType) || 0;
    return Date.now() > cooldownTime;
  }, [drinkCooldowns]);

  // Configuration
  const setDifficulty = useCallback((difficulty: Difficulty) => {
    if (!gameManagerRef.current) return;
    gameManagerRef.current.setDifficulty(difficulty);
  }, []);

  const setConfig = useCallback((config: Partial<GameConfig>) => {
    if (!gameManagerRef.current) return;
    gameManagerRef.current.setConfig(config);
  }, []);

  // Update cooldowns periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setDrinkCooldowns(prev => {
        const now = Date.now();
        const newCooldowns = new Map(prev);
        let hasChanges = false;

        for (const [drink, cooldownTime] of newCooldowns) {
          if (cooldownTime <= now) {
            newCooldowns.delete(drink);
            hasChanges = true;
          }
        }

        return hasChanges ? newCooldowns : prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Track FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFps = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFps);
    };

    const animationFrame = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const value: GameContextValue = useMemo(() => ({
    gameState,
    isLoading,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    returnToMenu,
    consumeDrink,
    triggerEvent,
    drinkCooldowns,
    canConsumeDrink,
    setDifficulty,
    setConfig,
    fps,
    lastUpdateTime,
  }), [gameState, isLoading, startGame, pauseGame, resumeGame, resetGame, returnToMenu, consumeDrink, triggerEvent, drinkCooldowns, canConsumeDrink, setDifficulty, setConfig, fps, lastUpdateTime]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Custom hook to use the game context
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}