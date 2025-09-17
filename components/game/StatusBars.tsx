'use client';

import React from 'react';
import { CircularProgress } from '../ui/ProgressBar';
import { CaffeineBar, CaffeineGauge } from './CaffeineBar';
import { HealthBar, HealthMeter } from './HealthBar';

interface StatusBarsProps {
  caffeineLevel: number;
  healthLevel: number;
  score: number;
  timeRemaining: number;
  totalTime: number;
  className?: string;
  compact?: boolean;
  variant?: 'default' | 'gauge' | 'minimal';
}

/**
 * Enhanced StatusBars component using specialized bar components
 * Provides multiple visualization options for game status
 */
export const StatusBars: React.FC<StatusBarsProps> = ({
  caffeineLevel,
  healthLevel,
  score,
  timeRemaining,
  totalTime,
  className = '',
  compact = false,
  variant = 'default',
}) => {
  const timeProgress = ((totalTime - timeRemaining) / totalTime) * 100;

  // Minimal compact view
  if (compact) {
    return (
      <div className={`flex items-center gap-4 p-3 bg-gray-900 rounded-lg ${className}`}>
        <CaffeineBar value={caffeineLevel} compact animated />
        <HealthBar value={healthLevel} compact animated />

        {/* Score */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-400">Score:</span>
          <span className="text-lg font-bold text-white">{score.toLocaleString()}</span>
        </div>
      </div>
    );
  }

  // Gauge variant with circular meters
  if (variant === 'gauge') {
    return (
      <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
        <div className="grid grid-cols-2 gap-6">
          {/* Caffeine and Health Gauges */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Caffeine Level
              </h3>
              <CaffeineGauge value={caffeineLevel} size="md" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Health Status
              </h3>
              <HealthMeter value={healthLevel} size="md" showPulse />
            </div>
          </div>

          {/* Score and Time */}
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                Time Progress
              </span>
              <CircularProgress
                value={timeProgress}
                max={100}
                size="lg"
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
      </div>
    );
  }

  // Default bar variant
  return (
    <div className={`space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* Caffeine Bar with optimal zone */}
      <CaffeineBar
        value={caffeineLevel}
        showLabel
        showOptimalZone
        animated
      />

      {/* Health Bar with indicators */}
      <HealthBar
        value={healthLevel}
        showLabel
        showHeartbeat
        animated
      />

      {/* Time and Score */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
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

// Optimal zone indicator (kept for backward compatibility)
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

// Game stats display component
interface GameStatsProps {
  caffeineLevel: number;
  healthLevel: number;
  score: number;
  timeRemaining: number;
  totalTime: number;
  streak?: number;
  drinksConsumed?: number;
  className?: string;
}

export const GameStats: React.FC<GameStatsProps> = ({
  caffeineLevel,
  healthLevel,
  score,
  timeRemaining,
  totalTime,
  streak = 0,
  drinksConsumed = 0,
  className = '',
}) => {
  const isOptimal = caffeineLevel >= 30 && caffeineLevel <= 70;
  const timeProgress = ((totalTime - timeRemaining) / totalTime) * 100;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
      <StatCard
        label="Caffeine"
        value={`${caffeineLevel}%`}
        color={isOptimal ? 'green' : caffeineLevel < 20 || caffeineLevel > 80 ? 'red' : 'amber'}
      />
      <StatCard
        label="Health"
        value={`${healthLevel}%`}
        color={healthLevel > 50 ? 'green' : healthLevel > 20 ? 'amber' : 'red'}
      />
      <StatCard
        label="Score"
        value={score.toLocaleString()}
        color="indigo"
      />
      <StatCard
        label="Time"
        value={`${Math.round(timeProgress)}%`}
        color="purple"
      />
      {streak > 0 && (
        <StatCard
          label="Streak"
          value={`${streak}s`}
          color="blue"
        />
      )}
      {drinksConsumed > 0 && (
        <StatCard
          label="Drinks"
          value={drinksConsumed.toString()}
          color="gray"
        />
      )}
    </div>
  );
};

// Individual stat card component
interface StatCardProps {
  label: string;
  value: string;
  color: 'green' | 'amber' | 'red' | 'indigo' | 'purple' | 'blue' | 'gray';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  const colorClasses = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    gray: 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300',
  };

  return (
    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
      <div className="text-xs opacity-75">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
};