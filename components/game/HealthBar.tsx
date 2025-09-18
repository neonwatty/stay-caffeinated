'use client';

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { ProgressBar } from '../ui/ProgressBar';
import anime from '@/lib/anime';

interface HealthBarProps {
  value: number;
  criticalThreshold?: number;
  warningThreshold?: number;
  showLabel?: boolean;
  showHeartbeat?: boolean;
  animated?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * HealthBar component with visual feedback for health states
 * Includes heartbeat animation for critical states
 */
export const HealthBar: React.FC<HealthBarProps> = ({
  value,
  criticalThreshold = 20,
  warningThreshold = 50,
  showLabel = true,
  showHeartbeat = true,
  animated = true,
  className = '',
  compact = false,
}) => {
  // Removed unused heartbeatScale state - now using anime.js directly
  const barRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<SVGSVGElement>(null);
  const prevValueRef = useRef(value);
  const warningAnimationRef = useRef<anime.AnimeInstance | null>(null);

  // Determine health status
  const status = useMemo(() => {
    if (value <= criticalThreshold) {
      return { label: 'Critical', color: 'danger' as const, pulse: true };
    }
    if (value <= warningThreshold) {
      return { label: 'Low', color: 'warning' as const, pulse: false };
    }
    return { label: 'Healthy', color: 'success' as const, pulse: false };
  }, [value, criticalThreshold, warningThreshold]);

  // Enhanced heartbeat animation for critical health
  useEffect(() => {
    if (status.pulse && showHeartbeat && heartRef.current) {
      // Use anime.js for smoother heartbeat
      const heartbeatAnimation = anime({
        targets: heartRef.current,
        scale: [1, 1.3, 1],
        duration: 600,
        easing: 'easeInOutQuad',
        loop: true,
      });

      return () => {
        heartbeatAnimation.pause();
        if (heartRef.current) {
          anime.remove(heartRef.current);
        }
      };
    }
  }, [status.pulse, showHeartbeat]);

  // Warning flash animation when health drops
  useEffect(() => {
    if (!animated || !barRef.current) return;

    const healthDrop = prevValueRef.current - value;

    // Flash red when taking damage
    if (healthDrop > 5) {
      if (warningAnimationRef.current) {
        warningAnimationRef.current.pause();
      }

      warningAnimationRef.current = anime({
        targets: barRef.current,
        backgroundColor: [
          { value: 'rgba(239, 68, 68, 0.2)', duration: 100 },
          { value: 'transparent', duration: 400 }
        ],
        easing: 'easeOutQuad',
        complete: () => {
          warningAnimationRef.current = null;
        }
      });
    }

    // Critical health warning animation
    if (value <= criticalThreshold && value < prevValueRef.current) {
      const criticalAnimation = anime({
        targets: barRef.current,
        translateX: [0, -2, 2, -2, 2, 0],
        duration: 400,
        easing: 'easeInOutQuad',
      });

      // Screen edge glow for critical health
      if (value < 10) {
        anime({
          targets: barRef.current,
          boxShadow: [
            { value: '0 0 20px rgba(239, 68, 68, 0.5)', duration: 200 },
            { value: '0 0 40px rgba(239, 68, 68, 0.8)', duration: 200 },
            { value: '0 0 20px rgba(239, 68, 68, 0.5)', duration: 200 },
            { value: 'none', duration: 200 }
          ],
          easing: 'easeInOutQuad',
        });
      }

      return () => {
        criticalAnimation.pause();
      };
    }

    prevValueRef.current = value;
  }, [value, criticalThreshold, animated]);

  // Compact version
  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 ${className}`}
        role="region"
        aria-label="Health status"
      >
        <HeartIcon
          ref={heartRef}
          className={`w-4 h-4 text-red-600 flex-shrink-0`}
        />
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
    <div ref={barRef} className={`space-y-2 relative ${className}`}>
      {/* Header with label and status */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartIcon
              ref={heartRef}
              className={`w-5 h-5 text-red-600`}
            />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Health
            </span>
          </div>
          {status.pulse && (
            <span className="text-xs font-bold text-red-600 dark:text-red-400 animate-bounce">
              {status.label}!
            </span>
          )}
          {!status.pulse && <HealthBadge status={status.label} color={status.color} />}
        </div>
      )}

      {/* Health bar with gradient */}
      <div className="relative">
        <ProgressBar
          value={value}
          max={100}
          showValue
          color={status.color}
          animated={animated}
          striped={status.pulse}
        />

        {/* Health segments overlay */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-gray-300/30 dark:border-gray-600/30 last:border-r-0"
            />
          ))}
        </div>
      </div>

      {/* Health indicators */}
      <HealthIndicators value={value} />
    </div>
  );
};

// Heart icon component
const HeartIcon = React.forwardRef<
  SVGSVGElement,
  { className?: string; style?: React.CSSProperties }
>(({ className = '', style }, ref) => (
  <svg
    ref={ref}
    className={className}
    style={style}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Health"
  >
    <path
      fillRule="evenodd"
      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
      clipRule="evenodd"
    />
  </svg>
));

HeartIcon.displayName = 'HeartIcon';

// Health badge component
interface HealthBadgeProps {
  status: string;
  color: 'success' | 'warning' | 'danger';
}

const HealthBadge: React.FC<HealthBadgeProps> = ({ status, color }) => {
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

// Health indicators component
const HealthIndicators: React.FC<{ value: number }> = ({ value }) => {
  const getIndicatorText = () => {
    if (value > 80) return 'Excellent health! Keep it up!';
    if (value > 60) return 'Good health, stay in the optimal zone';
    if (value > 40) return 'Health declining, find the optimal zone';
    if (value > 20) return 'Low health, urgent action needed';
    return 'Critical health! Find caffeine balance now!';
  };

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500 dark:text-gray-400">
        {getIndicatorText()}
      </span>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <HeartIcon
            key={i}
            className={`w-3 h-3 ${
              i < Math.ceil(value / 20)
                ? 'text-red-500'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Visual health meter component (alternative visualization)
interface HealthMeterProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

export const HealthMeter: React.FC<HealthMeterProps> = ({
  value,
  size = 'md',
  showPulse = true,
  className = '',
}) => {
  const sizeConfig = {
    sm: { width: 60, height: 60, strokeWidth: 4 },
    md: { width: 80, height: 80, strokeWidth: 6 },
    lg: { width: 100, height: 100, strokeWidth: 8 },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value <= 20) return '#DC2626'; // red-600
    if (value <= 50) return '#F59E0B'; // amber-500
    return '#10B981'; // green-500
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={config.width}
        height={config.height}
        className={`transform -rotate-90 ${
          showPulse && value <= 20 ? 'animate-pulse' : ''
        }`}
      >
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />

        {/* Health circle */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={config.strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <HeartIcon
          className={`w-${config.width / 5} h-${config.height / 5} text-red-500 ${
            showPulse && value <= 20 ? 'animate-bounce' : ''
          }`}
        />
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
          {value}%
        </span>
      </div>
    </div>
  );
};

// Health trend indicator
interface HealthTrendProps {
  currentValue: number;
  previousValue: number;
  className?: string;
}

export const HealthTrend: React.FC<HealthTrendProps> = ({
  currentValue,
  previousValue,
  className = '',
}) => {
  const trend = currentValue - previousValue;
  const trendDirection = trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable';

  const getTrendIcon = () => {
    if (trendDirection === 'up') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    }
    if (trendDirection === 'down') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  const trendColor = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    stable: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className={`flex items-center ${trendColor[trendDirection]}`}>
        {getTrendIcon()}
      </span>
      <span className={`text-xs font-medium ${trendColor[trendDirection]}`}>
        {Math.abs(trend).toFixed(1)}%
      </span>
    </div>
  );
};