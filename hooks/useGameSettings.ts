'use client';

/**
 * useGameSettings - Hook for managing game settings and preferences
 */

import { useCallback, useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import type { Difficulty, PlayerPreferences, AudioConfig } from '@/types';

const DEFAULT_PREFERENCES: PlayerPreferences = {
  difficulty: 'junior',
  soundEnabled: true,
  musicVolume: 0.5,
  effectsVolume: 0.7,
  particlesEnabled: true,
  screenShakeEnabled: true,
  colorBlindMode: false,
  reducedMotion: false,
};

const DEFAULT_AUDIO: AudioConfig = {
  masterVolume: 1,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  uiVolume: 0.8,
  ambientVolume: 0.3,
  muted: false,
  spatialAudio: false,
};

export interface UseGameSettingsReturn {
  // Settings
  preferences: PlayerPreferences;
  audioConfig: AudioConfig;

  // Actions
  updatePreferences: (updates: Partial<PlayerPreferences>) => void;
  updateAudioConfig: (updates: Partial<AudioConfig>) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  toggleSound: () => void;
  toggleParticles: () => void;
  toggleScreenShake: () => void;
  toggleColorBlindMode: () => void;
  toggleReducedMotion: () => void;

  // Persistence
  saveSettings: () => void;
  loadSettings: () => void;
  resetSettings: () => void;
}

export function useGameSettings(): UseGameSettingsReturn {
  const game = useGame();
  const [preferences, setPreferences] = useState<PlayerPreferences>(DEFAULT_PREFERENCES);
  const [audioConfig, setAudioConfig] = useState<AudioConfig>(DEFAULT_AUDIO);

  // Load settings from localStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem('gamePreferences', JSON.stringify(preferences));
      localStorage.setItem('audioConfig', JSON.stringify(audioConfig));
      console.log('Settings saved');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [preferences, audioConfig]);

  // Load settings from localStorage
  const loadSettings = useCallback(() => {
    try {
      const savedPreferences = localStorage.getItem('gamePreferences');
      const savedAudio = localStorage.getItem('audioConfig');

      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }

      if (savedAudio) {
        const parsed = JSON.parse(savedAudio);
        setAudioConfig({ ...DEFAULT_AUDIO, ...parsed });
      }

      console.log('Settings loaded');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    setAudioConfig(DEFAULT_AUDIO);
    localStorage.removeItem('gamePreferences');
    localStorage.removeItem('audioConfig');
    console.log('Settings reset to defaults');
  }, []);

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<PlayerPreferences>) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, ...updates };

      // Apply difficulty change to game
      if (updates.difficulty) {
        game.setDifficulty(updates.difficulty as Difficulty);
      }

      return newPrefs;
    });
  }, [game]);

  // Update audio config
  const updateAudioConfig = useCallback((updates: Partial<AudioConfig>) => {
    setAudioConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Specific setting toggles
  const setDifficulty = useCallback((difficulty: Difficulty) => {
    updatePreferences({ difficulty });
  }, [updatePreferences]);

  const toggleSound = useCallback(() => {
    updatePreferences({ soundEnabled: !preferences.soundEnabled });
  }, [preferences.soundEnabled, updatePreferences]);

  const toggleParticles = useCallback(() => {
    updatePreferences({ particlesEnabled: !preferences.particlesEnabled });
  }, [preferences.particlesEnabled, updatePreferences]);

  const toggleScreenShake = useCallback(() => {
    updatePreferences({ screenShakeEnabled: !preferences.screenShakeEnabled });
  }, [preferences.screenShakeEnabled, updatePreferences]);

  const toggleColorBlindMode = useCallback(() => {
    updatePreferences({ colorBlindMode: !preferences.colorBlindMode });
  }, [preferences.colorBlindMode, updatePreferences]);

  const toggleReducedMotion = useCallback(() => {
    updatePreferences({ reducedMotion: !preferences.reducedMotion });
  }, [preferences.reducedMotion, updatePreferences]);

  // Auto-save settings when they change
  useEffect(() => {
    const saveTimer = setTimeout(saveSettings, 500);
    return () => clearTimeout(saveTimer);
  }, [preferences, audioConfig, saveSettings]);

  return {
    preferences,
    audioConfig,
    updatePreferences,
    updateAudioConfig,
    setDifficulty,
    toggleSound,
    toggleParticles,
    toggleScreenShake,
    toggleColorBlindMode,
    toggleReducedMotion,
    saveSettings,
    loadSettings,
    resetSettings,
  };
}

// Hook for managing game statistics
export function useGameStatistics() {
  const { stats } = useGame().gameState || { stats: null };
  const [sessionStats, setSessionStats] = useState({
    sessionStartTime: Date.now(),
    totalPlayTime: 0,
    gamesPlayed: 0,
    highScore: 0,
    averageScore: 0,
    totalDrinksConsumed: 0,
  });

  // Update session statistics
  useEffect(() => {
    if (!stats) return;

    setSessionStats(prev => ({
      ...prev,
      totalPlayTime: (Date.now() - prev.sessionStartTime) / 1000,
      highScore: Math.max(prev.highScore, stats.score),
    }));
  }, [stats]);

  // Calculate derived statistics
  const derivedStats = {
    averageCaffeineLevel: stats?.currentCaffeineLevel || 0,
    timeInOptimalZone: stats?.isInOptimalZone ? 1 : 0,
    currentStreak: stats?.streak || 0,
    efficiency: stats ? (stats.score / Math.max(1, stats.timeElapsed)) * 100 : 0,
  };

  return {
    sessionStats,
    derivedStats,
    currentGameStats: stats,
  };
}

// Hook for managing visual preferences
export function useVisualPreferences() {
  const { preferences } = useGameSettings();

  // Apply visual preferences to document
  useEffect(() => {
    const root = document.documentElement;

    // Apply color blind mode
    if (preferences.colorBlindMode) {
      root.classList.add('color-blind-mode');
    } else {
      root.classList.remove('color-blind-mode');
    }

    // Apply reduced motion
    if (preferences.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Apply particle settings
    root.style.setProperty('--particles-enabled', preferences.particlesEnabled ? '1' : '0');
  }, [preferences]);

  return {
    isColorBlindMode: preferences.colorBlindMode,
    isReducedMotion: preferences.reducedMotion,
    hasParticles: preferences.particlesEnabled,
    hasScreenShake: preferences.screenShakeEnabled,
  };
}