'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { ProgressBar } from '../ui/ProgressBar';
import anime from '@/lib/anime';

interface CaffeineBarProps {
  value: number;
  optimalMin?: number;
  optimalMax?: number;
  dangerLow?: number;
  dangerHigh?: number;
  showLabel?: boolean;
  showOptimalZone?: boolean;
  animated?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * CaffeineBar component with optimal zone visualization
 * Shows danger zones, optimal zone, and current level with appropriate colors
 */
export const CaffeineBar: React.FC<CaffeineBarProps> = ({
  value,
  optimalMin = 30,
  optimalMax = 70,
  dangerLow = 20,
  dangerHigh = 80,
  showLabel = true,
  showOptimalZone = true,
  animated = true,
  className = '',
  compact = false,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const optimalZoneRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef(value);
  // Determine status based on value
  const status = useMemo(() => {
    if (value < dangerLow) {
      return { label: 'Critical Low', color: 'danger' as const, pulse: true, shake: true };
    }
    if (value < optimalMin) {
      return { label: 'Low', color: 'warning' as const, pulse: false, shake: false };
    }
    if (value > dangerHigh) {
      return { label: 'Critical High', color: 'danger' as const, pulse: true, shake: true };
    }
    if (value > optimalMax) {
      return { label: 'High', color: 'warning' as const, pulse: false, shake: false };
    }
    return { label: 'Optimal', color: 'success' as const, pulse: false, shake: false };
  }, [value, dangerLow, optimalMin, optimalMax, dangerHigh]);

  // Smooth transition animation for value changes
  useEffect(() => {
    if (!animated || !barRef.current) return;

    // Animate the bar fill on value change
    if (Math.abs(value - prevValueRef.current) > 1) {
      anime({
        targets: barRef.current.querySelector('.progress-fill'),
        width: `${value}%`,
        duration: 600,
        easing: 'easeInOutQuad',
      });
    }

    // Pulsing animation for danger zones
    if (status.pulse && barRef.current) {
      const pulseAnimation = anime({
        targets: barRef.current,
        scale: [1, 1.02, 1],
        duration: 800,
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate',
      });

      return () => {
        pulseAnimation.pause();
        if (barRef.current) {
          anime.remove(barRef.current);
        }
      };
    }

    // Shake animation when entering danger zone
    if (status.shake && value !== prevValueRef.current && barRef.current) {
      anime({
        targets: barRef.current,
        translateX: [0, -3, 3, -3, 0],
        duration: 300,
        easing: 'easeInOutQuad',
      });
    }

    prevValueRef.current = value;
  }, [value, status.pulse, status.shake, animated]);

  // Optimal zone glow animation
  useEffect(() => {
    if (!showOptimalZone || !optimalZoneRef.current) return;

    const isInOptimalZone = value >= optimalMin && value <= optimalMax;

    if (isInOptimalZone) {
      const glowAnimation = anime({
        targets: optimalZoneRef.current,
        opacity: [0.2, 0.4, 0.2],
        duration: 2000,
        easing: 'easeInOutSine',
        loop: true,
      });

      return () => {
        glowAnimation.pause();
        if (optimalZoneRef.current) {
          anime.remove(optimalZoneRef.current);
        }
      };
    }
  }, [value, optimalMin, optimalMax, showOptimalZone]);

  // Compact version for small spaces
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CaffeineIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <ProgressBar
            value={value}
            max={100}
            size="sm"
            color={status.color}
            animated={animated}
            striped={status.pulse}
          />
        </div>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-10 text-right">
          {value}%
        </span>
      </div>
    );
  }

  return (
    <div ref={barRef} className={`space-y-2 ${className}`}>
      {/* Header with label and status */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CaffeineIcon className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Caffeine Level
            </span>
          </div>
          <StatusBadge status={status.label} color={status.color} />
        </div>
      )}

      {/* Progress bar with optimal zone overlay */}
      <div className="relative">
        <ProgressBar
          value={value}
          max={100}
          showValue
          color={status.color}
          animated={animated}
          striped={status.pulse}
        />

        {/* Optimal zone indicator overlay */}
        {showOptimalZone && (
          <>
            {/* Optimal zone background with animation */}
            <div
              ref={optimalZoneRef}
              className="absolute top-0 h-full bg-green-500/20 pointer-events-none transition-opacity"
              style={{
                left: `${optimalMin}%`,
                width: `${optimalMax - optimalMin}%`,
              }}
              aria-hidden="true"
            />

            {/* Zone markers */}
            <div
              className="absolute top-0 w-0.5 h-full bg-green-600/50"
              style={{ left: `${optimalMin}%` }}
              aria-hidden="true"
            />
            <div
              className="absolute top-0 w-0.5 h-full bg-green-600/50"
              style={{ left: `${optimalMax}%` }}
              aria-hidden="true"
            />
          </>
        )}
      </div>

      {/* Zone indicators */}
      {showOptimalZone && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0%</span>
          <span className="text-green-600 dark:text-green-400">
            Optimal: {optimalMin}-{optimalMax}%
          </span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
};

// Caffeine icon component
const CaffeineIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Caffeine"
  >
    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 0v9h10V5H5zm3 2a1 1 0 000 2h4a1 1 0 100-2H8zm0 3a1 1 0 100 2h4a1 1 0 100-2H8z" />
  </svg>
);

// Status badge component
interface StatusBadgeProps {
  status: string;
  color: 'success' | 'warning' | 'danger';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, color }) => {
  const colorClasses = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <span
      className={`
        text-xs font-semibold px-2 py-1 rounded
        ${colorClasses[color]}
      `}
    >
      {status}
    </span>
  );
};

// Visual caffeine meter component (alternative visualization)
interface CaffeineGaugeProps {
  value: number;
  optimalMin?: number;
  optimalMax?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CaffeineGauge: React.FC<CaffeineGaugeProps> = ({
  value,
  optimalMin = 30,
  optimalMax = 70,
  size = 'md',
  className = '',
}) => {
  const sizeConfig = {
    sm: { width: 120, height: 80, strokeWidth: 8 },
    md: { width: 180, height: 120, strokeWidth: 12 },
    lg: { width: 240, height: 160, strokeWidth: 16 },
  };

  const config = sizeConfig[size];
  const centerX = config.width / 2;
  const centerY = config.height - 10;
  const radius = Math.min(centerX, centerY) - config.strokeWidth;

  // Calculate arc paths
  const startAngle = -180;
  const endAngle = 0;
  const currentAngle = startAngle + (value / 100) * (endAngle - startAngle);

  const getCoordinates = (angle: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY + radius * Math.sin(radian),
    };
  };

  const optimalStartCoords = getCoordinates(startAngle + (optimalMin / 100) * 180);
  const optimalEndCoords = getCoordinates(startAngle + (optimalMax / 100) * 180);
  const currentCoords = getCoordinates(currentAngle);

  return (
    <div className={`inline-block ${className}`}>
      <svg width={config.width} height={config.height}>
        {/* Background arc */}
        <path
          d={`M ${getCoordinates(startAngle).x} ${getCoordinates(startAngle).y}
              A ${radius} ${radius} 0 0 1 ${getCoordinates(endAngle).x} ${getCoordinates(endAngle).y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />

        {/* Optimal zone arc */}
        <path
          d={`M ${optimalStartCoords.x} ${optimalStartCoords.y}
              A ${radius} ${radius} 0 0 1 ${optimalEndCoords.x} ${optimalEndCoords.y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-green-200 dark:text-green-800"
        />

        {/* Current value arc */}
        <path
          d={`M ${getCoordinates(startAngle).x} ${getCoordinates(startAngle).y}
              A ${radius} ${radius} 0 0 1 ${currentCoords.x} ${currentCoords.y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className={
            value < 20 || value > 80
              ? 'text-red-500'
              : value >= optimalMin && value <= optimalMax
              ? 'text-green-500'
              : 'text-amber-500'
          }
        />

        {/* Value text */}
        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          className="fill-current text-gray-700 dark:text-gray-300 font-bold"
          style={{ fontSize: config.width / 10 }}
        >
          {value}%
        </text>
      </svg>
    </div>
  );
};