'use client';

import React, { useEffect, useState } from 'react';
import { ProgressBar, CircularProgress } from '../ui/ProgressBar';

interface StatusBarsProps {
  caffeineLevel: number;
  healthLevel: number;
  score: number;
  timeRemaining: number;
  totalTime: number;
  className?: string;
  compact?: boolean;
}

/**
 * Game status bars showing caffeine, health, and progress
 * Animated with visual feedback for critical states
 */
export const StatusBars: React.FC<StatusBarsProps> = ({
  caffeineLevel,
  healthLevel,
  score,
  timeRemaining,
  totalTime,
  className = '',
  compact = false,
}) => {
  const [pulseHealth, setPulseHealth] = useState(false);
  const [pulseCaffeine, setPulseCaffeine] = useState(false);

  // Determine caffeine status and color
  const getCaffeineStatus = () => {
    if (caffeineLevel < 20) return { status: 'Low', color: 'danger' as const };
    if (caffeineLevel < 30) return { status: 'Warning', color: 'warning' as const };
    if (caffeineLevel > 80) return { status: 'High', color: 'warning' as const };
    if (caffeineLevel > 90) return { status: 'Critical', color: 'danger' as const };
    return { status: 'Optimal', color: 'success' as const };
  };

  // Determine health color
  const getHealthColor = () => {
    if (healthLevel < 20) return 'danger' as const;
    if (healthLevel < 50) return 'warning' as const;
    return 'success' as const;
  };

  // Trigger pulse animations for critical states
  useEffect(() => {
    setPulseHealth(healthLevel < 20);
    setPulseCaffeine(caffeineLevel < 20 || caffeineLevel > 90);
  }, [healthLevel, caffeineLevel]);

  const caffeineStatus = getCaffeineStatus();
  const timeProgress = ((totalTime - timeRemaining) / totalTime) * 100;

  if (compact) {
    return (
      <div className={`flex items-center gap-4 p-3 bg-gray-900 rounded-lg ${className}`}>
        {/* Compact caffeine indicator */}
        <div className="flex items-center gap-2">
          <CaffeineIcon className="w-5 h-5 text-amber-500" />
          <div className="w-24">
            <ProgressBar
              value={caffeineLevel}
              max={100}
              size="sm"
              color={caffeineStatus.color}
              animated
            />
          </div>
          <span className="text-xs font-medium text-white w-10">
            {caffeineLevel}%
          </span>
        </div>

        {/* Compact health indicator */}
        <div className="flex items-center gap-2">
          <HeartIcon className="w-5 h-5 text-red-500" />
          <div className="w-24">
            <ProgressBar
              value={healthLevel}
              max={100}
              size="sm"
              color={getHealthColor()}
              animated
            />
          </div>
          <span className="text-xs font-medium text-white w-10">
            {healthLevel}%
          </span>
        </div>

        {/* Score */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-400">Score:</span>
          <span className="text-lg font-bold text-white">{score.toLocaleString()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* Caffeine Level */}
      <div className={`space-y-2 ${pulseCaffeine ? 'animate-pulse' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CaffeineIcon className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Caffeine Level
            </span>
          </div>
          <span className={`
            text-sm font-semibold px-2 py-1 rounded
            ${caffeineStatus.color === 'success' ? 'bg-green-100 text-green-800' : ''}
            ${caffeineStatus.color === 'warning' ? 'bg-amber-100 text-amber-800' : ''}
            ${caffeineStatus.color === 'danger' ? 'bg-red-100 text-red-800' : ''}
          `}>
            {caffeineStatus.status}
          </span>
        </div>
        <ProgressBar
          value={caffeineLevel}
          max={100}
          color={caffeineStatus.color}
          showValue
          animated
          striped={pulseCaffeine}
        />
      </div>

      {/* Health Level */}
      <div className={`space-y-2 ${pulseHealth ? 'animate-pulse' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartIcon className="w-5 h-5 text-red-600" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Health
            </span>
          </div>
          {healthLevel < 20 && (
            <span className="text-sm font-semibold text-red-600 animate-bounce">
              Critical!
            </span>
          )}
        </div>
        <ProgressBar
          value={healthLevel}
          max={100}
          color={getHealthColor()}
          showValue
          animated
          striped={pulseHealth}
        />
      </div>

      {/* Time and Score */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
            Time Progress
          </span>
          <CircularProgress
            value={timeProgress}
            max={100}
            size="md"
            color="#8B5CF6"
            showValue
          />
          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} left
          </span>
        </div>
        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
            Score
          </span>
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {score.toLocaleString()}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
            points
          </span>
        </div>
      </div>
    </div>
  );
};

// Icon components
const CaffeineIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 5a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H7z"
      clipRule="evenodd"
    />
  </svg>
);

const HeartIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
      clipRule="evenodd"
    />
  </svg>
);

// Optimal zone indicator
interface OptimalZoneIndicatorProps {
  isInZone: boolean;
  className?: string;
}

export const OptimalZoneIndicator: React.FC<OptimalZoneIndicatorProps> = ({
  isInZone,
  className = '',
}) => {
  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-all
        ${isInZone
          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }
        ${className}
      `}
    >
      <div
        className={`
          w-3 h-3 rounded-full transition-all
          ${isInZone
            ? 'bg-green-500 animate-pulse'
            : 'bg-gray-400'
          }
        `}
      />
      <span className="text-sm font-medium">
        {isInZone ? 'Optimal Zone' : 'Outside Zone'}
      </span>
    </div>
  );
};