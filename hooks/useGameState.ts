'use client';

/**
 * useGameState - Custom hook for accessing and managing game state
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';
import type { GameStats, GameState, Difficulty } from '@/types';
import { DIFFICULTY_CONFIGS } from '@/game/core/constants';

export interface UseGameStateReturn {
  // State
  currentState: GameState;
  stats: GameStats;
  difficulty: Difficulty;
  isPaused: boolean;
  isPlaying: boolean;
  isGameOver: boolean;
  isVictory: boolean;

  // Computed values
  caffeinePercentage: number;
  healthPercentage: number;
  timeProgress: number; // 0-100 percentage of workday complete
  formattedTime: string;
  scoreDisplay: string;
  optimalZoneRange: { min: number; max: number };

  // Actions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  returnToMenu: () => void;
  consumeDrink: (caffeineAmount: number) => void;
  setDifficulty: (difficulty: Difficulty) => void;
}

export function useGameState(): UseGameStateReturn {
  const game = useGame();
  const { gameState, startGame, pauseGame, resumeGame, resetGame, returnToMenu, consumeDrink, setDifficulty } = game;

  // Extract values from game state
  const currentState = gameState?.state || 'menu';
  const stats = gameState?.stats || {
    currentCaffeineLevel: 50,
    currentHealthLevel: 100,
    timeElapsed: 0,
    drinksConsumed: 0,
    score: 0,
    streak: 0,
    isInOptimalZone: false,
  };
  const difficulty = gameState?.config.difficulty || 'junior';
  const isPaused = gameState?.isPaused || false;

  // Computed state flags
  const isPlaying = currentState === 'playing';
  const isGameOver = currentState === 'gameOver';
  const isVictory = currentState === 'victory';

  // Calculate percentages
  const caffeinePercentage = stats.currentCaffeineLevel;
  const healthPercentage = stats.currentHealthLevel;

  // Calculate time progress
  const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
  const timeProgress = useMemo(() => {
    if (!difficultyConfig) return 0;
    const totalSeconds = difficultyConfig.workdayLength * 60;
    return Math.min(100, (stats.timeElapsed / totalSeconds) * 100);
  }, [stats.timeElapsed, difficultyConfig]);

  // Format time display
  const formattedTime = useMemo(() => {
    const totalSeconds = Math.floor(stats.timeElapsed);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [stats.timeElapsed]);

  // Format score display
  const scoreDisplay = useMemo(() => {
    return Math.floor(stats.score).toLocaleString();
  }, [stats.score]);

  // Calculate optimal zone range
  const optimalZoneRange = useMemo(() => {
    if (!difficultyConfig) return { min: 30, max: 70 };
    const zoneHalf = difficultyConfig.optimalZoneSize / 2;
    const center = 50;
    return {
      min: center - zoneHalf,
      max: center + zoneHalf,
    };
  }, [difficultyConfig]);

  return {
    // State
    currentState,
    stats,
    difficulty,
    isPaused,
    isPlaying,
    isGameOver,
    isVictory,

    // Computed values
    caffeinePercentage,
    healthPercentage,
    timeProgress,
    formattedTime,
    scoreDisplay,
    optimalZoneRange,

    // Actions
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    returnToMenu,
    consumeDrink,
    setDifficulty,
  };
}

// Hook for tracking caffeine level with smooth updates
export function useCaffeineLevel() {
  const { stats } = useGameState();
  const [smoothLevel, setSmoothLevel] = useState(stats.currentCaffeineLevel);

  useEffect(() => {
    const animationDuration = 300; // ms
    const startLevel = smoothLevel;
    const targetLevel = stats.currentCaffeineLevel;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const newLevel = startLevel + (targetLevel - startLevel) * easeProgress;

      setSmoothLevel(newLevel);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [stats.currentCaffeineLevel]);

  return smoothLevel;
}

// Hook for tracking health with smooth updates
export function useHealthLevel() {
  const { stats } = useGameState();
  const [smoothLevel, setSmoothLevel] = useState(stats.currentHealthLevel);

  useEffect(() => {
    const animationDuration = 500; // ms
    const startLevel = smoothLevel;
    const targetLevel = stats.currentHealthLevel;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Linear interpolation for health
      const newLevel = startLevel + (targetLevel - startLevel) * progress;

      setSmoothLevel(newLevel);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [stats.currentHealthLevel]);

  return smoothLevel;
}