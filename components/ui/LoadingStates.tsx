'use client';

import React, { useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/useAccessibility';

/**
 * Loading Spinner Component
 */
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'blue-500',
  className = '',
  label = 'Loading...',
}) => {
  const { reducedMotion } = useUserPreferences();

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`} role="status">
      <div
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-${color} rounded-full ${
          !reducedMotion ? 'animate-spin' : ''
        }`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

/**
 * Skeleton Loader Component
 */
interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  variant = 'text',
  animation = 'pulse',
  className = '',
}) => {
  const { reducedMotion } = useUserPreferences();
  const animationType = reducedMotion ? 'none' : animation;

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  return (
    <div
      className={`bg-gray-300 dark:bg-gray-700 ${variantClasses[variant]} ${
        animationClasses[animationType]
      } ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      role="presentation"
      aria-hidden="true"
    />
  );
};

/**
 * Progress Bar Component
 */
interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: string;
  height?: number;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = false,
  color = 'blue-500',
  height = 4,
  animated = true,
  className = '',
}) => {
  const { reducedMotion } = useUserPreferences();
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (animated && !reducedMotion) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, animated, reducedMotion]);

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-gray-700 dark:text-gray-300">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div
        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`h-full bg-${color} transition-all duration-300 ease-out`}
          style={{ width: `${displayProgress}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Loading Overlay Component
 */
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  blur?: boolean;
  children?: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  fullScreen = false,
  blur = true,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isVisible) return <>{children}</>;

  const overlayContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <LoadingSpinner size="large" />
      {message && (
        <p className="text-gray-700 dark:text-gray-300 font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <>
        {children}
        <div
          className={`fixed inset-0 z-50 bg-white/80 dark:bg-black/80 flex items-center justify-center transition-opacity duration-300 ${
            isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } ${blur ? 'backdrop-blur-sm' : ''}`}
        >
          {overlayContent}
        </div>
      </>
    );
  }

  return (
    <div className="relative">
      {children}
      <div
        className={`absolute inset-0 z-10 bg-white/80 dark:bg-black/80 flex items-center justify-center transition-opacity duration-300 ${
          isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${blur ? 'backdrop-blur-sm' : ''}`}
      >
        {overlayContent}
      </div>
    </div>
  );
};

/**
 * Transition Component
 */
interface TransitionProps {
  show: boolean;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  duration?: number;
  children: React.ReactNode;
}

export const Transition: React.FC<TransitionProps> = ({
  show,
  enter = 'transition-opacity duration-300',
  enterFrom = 'opacity-0',
  enterTo = 'opacity-100',
  leave = 'transition-opacity duration-300',
  leaveFrom = 'opacity-100',
  leaveTo = 'opacity-0',
  duration = 300,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionClasses, setTransitionClasses] = useState('');

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsTransitioning(true);
      setTransitionClasses(`${enter} ${enterFrom}`);

      requestAnimationFrame(() => {
        setTransitionClasses(`${enter} ${enterTo}`);
      });

      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsTransitioning(true);
      setTransitionClasses(`${leave} ${leaveFrom}`);

      requestAnimationFrame(() => {
        setTransitionClasses(`${leave} ${leaveTo}`);
      });

      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsTransitioning(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, enter, enterFrom, enterTo, leave, leaveFrom, leaveTo, duration]);

  if (!isVisible) return null;

  return <div className={transitionClasses}>{children}</div>;
};

/**
 * Fade Transition Component
 */
interface FadeProps {
  show: boolean;
  duration?: number;
  children: React.ReactNode;
}

export const Fade: React.FC<FadeProps> = ({ show, duration = 300, children }) => {
  return (
    <Transition
      show={show}
      enter={`transition-opacity duration-${duration}`}
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave={`transition-opacity duration-${duration}`}
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      duration={duration}
    >
      {children}
    </Transition>
  );
};

/**
 * Slide Transition Component
 */
interface SlideProps {
  show: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  children: React.ReactNode;
}

export const Slide: React.FC<SlideProps> = ({
  show,
  direction = 'down',
  duration = 300,
  children,
}) => {
  const transforms = {
    up: {
      enterFrom: 'translate-y-full',
      enterTo: 'translate-y-0',
      leaveFrom: 'translate-y-0',
      leaveTo: 'translate-y-full',
    },
    down: {
      enterFrom: '-translate-y-full',
      enterTo: 'translate-y-0',
      leaveFrom: 'translate-y-0',
      leaveTo: '-translate-y-full',
    },
    left: {
      enterFrom: 'translate-x-full',
      enterTo: 'translate-x-0',
      leaveFrom: 'translate-x-0',
      leaveTo: 'translate-x-full',
    },
    right: {
      enterFrom: '-translate-x-full',
      enterTo: 'translate-x-0',
      leaveFrom: 'translate-x-0',
      leaveTo: '-translate-x-full',
    },
  };

  const transform = transforms[direction];

  return (
    <Transition
      show={show}
      enter={`transition-transform duration-${duration} ease-out`}
      enterFrom={transform.enterFrom}
      enterTo={transform.enterTo}
      leave={`transition-transform duration-${duration} ease-in`}
      leaveFrom={transform.leaveFrom}
      leaveTo={transform.leaveTo}
      duration={duration}
    >
      {children}
    </Transition>
  );
};

/**
 * Scale Transition Component
 */
interface ScaleProps {
  show: boolean;
  duration?: number;
  children: React.ReactNode;
}

export const Scale: React.FC<ScaleProps> = ({ show, duration = 300, children }) => {
  return (
    <Transition
      show={show}
      enter={`transition-all duration-${duration} ease-out`}
      enterFrom="scale-95 opacity-0"
      enterTo="scale-100 opacity-100"
      leave={`transition-all duration-${duration} ease-in`}
      leaveFrom="scale-100 opacity-100"
      leaveTo="scale-95 opacity-0"
      duration={duration}
    >
      {children}
    </Transition>
  );
};