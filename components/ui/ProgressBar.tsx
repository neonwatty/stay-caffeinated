'use client';

import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'custom';
  customColor?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

/**
 * Accessible ProgressBar component with smooth animations
 * Supports both determinate and indeterminate states
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  color = 'primary',
  customColor,
  animated = true,
  striped = false,
  className = '',
}) => {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Size styles
  const sizeStyles = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  // Color styles
  const colorStyles = {
    primary: 'bg-indigo-600',
    success: 'bg-green-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
    custom: customColor || 'bg-gray-600',
  };

  // Get appropriate color based on value for dynamic coloring
  const getDynamicColor = () => {
    if (color !== 'primary') return colorStyles[color];

    if (percentage <= 25) return 'bg-red-600';
    if (percentage <= 50) return 'bg-amber-500';
    if (percentage <= 75) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label and value */}
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {value}/{max}
            </span>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div
        className={`
          w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden
          ${sizeStyles[size]}
        `}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        {/* Progress bar fill */}
        <div
          className={`
            h-full rounded-full
            ${color === 'primary' ? getDynamicColor() : colorStyles[color]}
            ${animated ? 'transition-all duration-300 ease-out' : ''}
            ${striped ? 'bg-stripes animate-stripes' : ''}
          `}
          style={{ width: `${percentage}%` }}
        >
          {/* Value text inside bar (for lg size only) */}
          {size === 'lg' && showValue && (
            <span className="flex items-center justify-center h-full text-xs font-semibold text-white">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Multi-progress bar for showing multiple values
interface MultiProgressBarProps {
  segments: Array<{
    value: number;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'custom';
    customColor?: string;
    label?: string;
  }>;
  max?: number;
  height?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
  className?: string;
}

export const MultiProgressBar: React.FC<MultiProgressBarProps> = ({
  segments,
  max = 100,
  height = 'md',
  showLegend = false,
  className = '',
}) => {
  const heightStyles = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const colorStyles = {
    primary: 'bg-indigo-600',
    success: 'bg-green-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
    custom: '',
  };

  // Calculate total and percentages
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const normalizedSegments = segments.map((segment) => ({
    ...segment,
    percentage: (segment.value / max) * 100,
  }));

  return (
    <div className={className}>
      {/* Progress bar */}
      <div
        className={`
          w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex
          ${heightStyles[height]}
        `}
        role="progressbar"
        aria-valuenow={total}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {normalizedSegments.map((segment, index) => (
          <div
            key={index}
            className={`
              h-full transition-all duration-300
              ${segment.color === 'custom'
                ? ''
                : colorStyles[segment.color || 'primary']}
              ${index === 0 ? 'rounded-l-full' : ''}
              ${index === segments.length - 1 ? 'rounded-r-full' : ''}
            `}
            style={{
              width: `${segment.percentage}%`,
              backgroundColor: segment.color === 'custom' ? segment.customColor : undefined,
            }}
            title={segment.label}
          />
        ))}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`
                  w-3 h-3 rounded-full
                  ${segment.color === 'custom'
                    ? ''
                    : colorStyles[segment.color || 'primary']}
                `}
                style={{
                  backgroundColor: segment.color === 'custom' ? segment.customColor : undefined,
                }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {segment.label || `Segment ${index + 1}`}: {segment.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Circular progress indicator
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  strokeWidth?: number;
  color?: string;
  showValue?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  strokeWidth = 4,
  color = '#4F46E5',
  showValue = true,
  className = '',
}) => {
  const sizeValues = {
    sm: 48,
    md: 64,
    lg: 96,
  };

  const dimension = sizeValues[size];
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={dimension}
        height={dimension}
        className="transform -rotate-90"
        aria-label={`${percentage}% complete`}
      >
        {/* Background circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {showValue && (
        <span className="absolute text-sm font-semibold text-gray-700 dark:text-gray-300">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};