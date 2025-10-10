'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CircularProgress } from '../ui/ProgressBar';
import { CaffeineBar, CaffeineGauge } from './CaffeineBar';
import { HealthBar, HealthMeter } from './HealthBar';
import { screenShake } from '@/utils/animations';
import anime from '@/lib/anime';
import { useAnimation } from '@/hooks/useAnimation';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const prevHealthRef = useRef(healthLevel);
  const prevCaffeineRef = useRef(caffeineLevel);
  const [isOptimalZone, setIsOptimalZone] = useState(false);
  const optimalIndicatorRef = useRef<HTMLDivElement>(null);

  // Animation configurations
  const scoreAnimation = useAnimation({
    scale: [1, 1.2, 1],
    duration: 400,
    easing: 'easeOutElastic(1, 0.5)',
    autoplay: false,
  });
  const scoreRef = scoreAnimation.ref as React.RefObject<HTMLDivElement>;

  const timeControls = useAnimation({
    rotate: 360,
    duration: 1000,
    easing: 'linear',
    autoplay: false,
  });

  // Enhanced critical health animation with screen effects
  useEffect(() => {
    if (!containerRef.current) return;

    // Critical health pulse and flash
    if (healthLevel < 20 && healthLevel < prevHealthRef.current) {
      // Container flash animation
      const flashAnimation = anime.timeline()
      .add(containerRef.current, {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        duration: 200,
        easing: 'easeOutQuad',
      })
      .add(containerRef.current, {
        backgroundColor: 'transparent',
        duration: 400,
        easing: 'easeInQuad',
      });

      // Add border pulse for extreme critical (< 10%)
      if (healthLevel < 10) {
        anime(containerRef.current, {
          borderColor: ['rgba(239, 68, 68, 0)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0)'],
          borderWidth: ['0px', '2px', '0px'],
          duration: 600,
          easing: 'easeOutQuad',
        });
      }

      return () => {
        flashAnimation.pause();
      };
    }
    prevHealthRef.current = healthLevel;
  }, [healthLevel]);

  // Enhanced over-caffeination effects
  useEffect(() => {
    if (!containerRef.current) return;

    // Shake effect for high caffeine
    if (caffeineLevel > 85 && caffeineLevel > prevCaffeineRef.current) {
      screenShake(containerRef.current, Math.min(caffeineLevel / 20, 5));

      // Jitter animation for extreme over-caffeination
      if (caffeineLevel > 95) {
        anime(containerRef.current, {
          rotate: [0, -1, 1, -1, 0],
          duration: 200,
          easing: 'easeInOutQuad',
          loop: 3,
        });
      }
    }

    // Under-caffeination drowsy effect
    if (caffeineLevel < 15 && caffeineLevel < prevCaffeineRef.current) {
      anime(containerRef.current, {
        opacity: [1, 0.7, 1],
        duration: 2000,
        easing: 'easeInOutSine',
      });
    }

    prevCaffeineRef.current = caffeineLevel;
  }, [caffeineLevel]);

  // Optimal zone celebration animation
  useEffect(() => {
    const inOptimalZone = caffeineLevel >= 30 && caffeineLevel <= 70 && healthLevel >= 50;
    setIsOptimalZone(inOptimalZone);

    if (inOptimalZone && !prevCaffeineRef.current) {
      // Entering optimal zone animation
      if (optimalIndicatorRef.current) {
        anime(optimalIndicatorRef.current, {
          scale: [0.8, 1.1, 1],
          opacity: [0, 1],
          duration: 600,
          easing: 'easeOutElastic(1, 0.5)',
        });
      }
    }
  }, [caffeineLevel, healthLevel]);

  // Animate score changes
  useEffect(() => {
    if (scoreAnimation && score > 0) {
      scoreAnimation.play();
    }
  }, [score, scoreAnimation]);

  // Time warning animation
  useEffect(() => {
    if (timeRemaining < 60 && timeRemaining % 10 === 0 && timeControls) {
      timeControls.play();
    }
  }, [timeRemaining, timeControls]);

  // Minimal compact view
  if (compact) {
    return (
      <div ref={containerRef} className={`flex items-center gap-4 p-3 bg-gray-900 rounded-lg ${className}`}>
        <CaffeineBar value={caffeineLevel} compact animated />
        <HealthBar value={healthLevel} compact animated />

        {/* Score with animation */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-400">Score:</span>
          <span ref={scoreRef} className="text-lg font-bold text-white">
            {score.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }

  // Gauge variant with circular meters
  if (variant === 'gauge') {
    return (
      <div ref={containerRef} className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
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
              <div ref={scoreRef} className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
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
    <div ref={containerRef} className={`space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* Optimal Zone Indicator */}
      {isOptimalZone && (
        <div ref={optimalIndicatorRef} className="mb-2">
          <OptimalZoneIndicator isInZone={isOptimalZone} />
        </div>
      )}

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
          <div ref={scoreRef} className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
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
  const indicatorRef = useRef<HTMLDivElement>(null);
  const prevInZoneRef = useRef(isInZone);

  // Animate zone transitions
  useEffect(() => {
    if (!indicatorRef.current) return;

    // Entering optimal zone
    if (isInZone && !prevInZoneRef.current) {
      anime(indicatorRef.current, {
        scale: [0.9, 1.05, 1],
        backgroundColor: ['#86efac', '#10b981', '#86efac'],
        duration: 800,
        easing: 'easeOutElastic(1, 0.5)',
      });
    }

    // Leaving optimal zone
    if (!isInZone && prevInZoneRef.current) {
      anime(indicatorRef.current, {
        scale: [1, 0.95, 1],
        backgroundColor: ['#9ca3af', '#6b7280'],
        duration: 400,
        easing: 'easeInOutQuad',
      });
    }

    prevInZoneRef.current = isInZone;
  }, [isInZone]);

  return (
    <div
      ref={indicatorRef}
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
            ? 'bg-green-500'
            : 'bg-gray-400'
          }
        `}
      >
        {isInZone && (
          <div className="w-full h-full rounded-full bg-green-400 animate-ping" />
        )}
      </div>
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