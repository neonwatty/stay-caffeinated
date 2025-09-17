'use client';

/**
 * Game Context - React context for game state management
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { GameStateManager, GameStateData } from '@/game/core/gameStateManager';
import { GameLoop, createGameLoop, destroyGameLoop } from '@/game/core/gameLoop';
import type { GameConfig, Difficulty } from '@/types';

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
  consumeDrink: (caffeineAmount: number) => void;

  // Configuration
  setDifficulty: (difficulty: Difficulty) => void;
  setConfig: (config: Partial<GameConfig>) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<GameConfig>;
}

export function GameProvider({ children, initialConfig }: GameProviderProps) {
  const [gameState, setGameState] = useState<GameStateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  const consumeDrink = useCallback((caffeineAmount: number) => {
    if (!gameManagerRef.current) return;
    gameManagerRef.current.consumeDrink(caffeineAmount);
  }, []);

  // Configuration
  const setDifficulty = useCallback((difficulty: Difficulty) => {
    if (!gameManagerRef.current) return;
    gameManagerRef.current.setDifficulty(difficulty);
  }, []);

  const setConfig = useCallback((config: Partial<GameConfig>) => {
    if (!gameManagerRef.current) return;
    gameManagerRef.current.setConfig(config);
  }, []);

  const value: GameContextValue = {
    gameState,
    isLoading,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    returnToMenu,
    consumeDrink,
    setDifficulty,
    setConfig,
  };

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