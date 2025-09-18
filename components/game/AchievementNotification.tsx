'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Achievement } from '@/types/achievements';
import anime from '@/lib/anime';

export interface AchievementNotificationProps {
  achievement: Achievement | null;
  onComplete?: () => void;
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  className?: string;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#94a3b8',
  uncommon: '#10b981',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

const RARITY_GLOW: Record<string, string> = {
  common: 'rgba(148, 163, 184, 0.4)',
  uncommon: 'rgba(16, 185, 129, 0.4)',
  rare: 'rgba(59, 130, 246, 0.4)',
  epic: 'rgba(168, 85, 247, 0.4)',
  legendary: 'rgba(245, 158, 11, 0.6)',
};

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onComplete,
  duration = 4000,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<anime.AnimeInstance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-4 left-1/2 -translate-x-1/2';
    }
  };

  const showNotification = useCallback(() => {
    if (!notificationRef.current || !currentAchievement) return;

    setIsVisible(true);

    // Entrance animation
    animationRef.current = anime({
      targets: notificationRef.current,
      translateY: position === 'bottom' ? [100, 0] : [-100, 0],
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 600,
      easing: 'easeOutExpo',
      complete: () => {
        // Add glow effect for rare achievements
        if (['epic', 'legendary'].includes(currentAchievement.rarity)) {
          anime({
            targets: notificationRef.current,
            boxShadow: [
              `0 0 20px ${RARITY_GLOW[currentAchievement.rarity]}`,
              `0 0 40px ${RARITY_GLOW[currentAchievement.rarity]}`,
              `0 0 20px ${RARITY_GLOW[currentAchievement.rarity]}`,
            ],
            duration: 1500,
            loop: true,
            easing: 'easeInOutSine',
          });
        }
      },
    });

    // Auto-hide after duration
    timeoutRef.current = setTimeout(() => {
      hideNotification();
    }, duration);
  }, [currentAchievement, duration, position, hideNotification]);

  const hideNotification = useCallback(() => {
    if (!notificationRef.current) return;

    anime({
      targets: notificationRef.current,
      translateY: position === 'bottom' ? 100 : -100,
      opacity: 0,
      scale: 0.8,
      duration: 400,
      easing: 'easeInExpo',
      complete: () => {
        setIsVisible(false);
        setCurrentAchievement(null);
        onComplete?.();
      },
    });
  }, [position, onComplete]);

  // Handle new achievement
  useEffect(() => {
    if (achievement && achievement.id !== currentAchievement?.id) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Cancel existing animation
      if (animationRef.current) {
        anime.remove(notificationRef.current);
      }

      setCurrentAchievement(achievement);
    }
  }, [achievement, currentAchievement]);

  // Show notification when achievement changes
  useEffect(() => {
    if (currentAchievement && !isVisible) {
      showNotification();
    }
  }, [currentAchievement, isVisible, showNotification]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationRef.current) {
        anime.remove(notificationRef.current);
      }
    };
  }, []);

  if (!currentAchievement) return null;

  const rarityColor = RARITY_COLORS[currentAchievement.rarity];

  return (
    <div
      ref={notificationRef}
      className={`fixed ${getPositionClasses()} z-50 opacity-0 ${className}`}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      <div
        className="relative bg-gray-900 rounded-lg shadow-2xl border-2 overflow-hidden"
        style={{ borderColor: rarityColor }}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${rarityColor} 0%, transparent 100%)`,
          }}
        />

        {/* Content */}
        <div className="relative flex items-center gap-4 p-4 min-w-[320px] max-w-[400px]">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-full text-3xl"
            style={{
              backgroundColor: `${rarityColor}20`,
              border: `2px solid ${rarityColor}`,
            }}
          >
            {currentAchievement.icon}
          </div>

          {/* Text content */}
          <div className="flex-1">
            <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: rarityColor }}>
              Achievement Unlocked!
            </div>
            <div className="text-white font-bold text-lg mb-1">
              {currentAchievement.name}
            </div>
            <div className="text-gray-400 text-sm">
              {currentAchievement.description}
            </div>
            {/* Points and rarity */}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-medium" style={{ color: rarityColor }}>
                +{currentAchievement.points} points
              </span>
              <span className="text-xs capitalize px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${rarityColor}20`,
                  color: rarityColor,
                  border: `1px solid ${rarityColor}40`
                }}>
                {currentAchievement.rarity}
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={hideNotification}
            className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar for legendary achievements */}
        {currentAchievement.rarity === 'legendary' && (
          <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 animate-pulse" />
        )}
      </div>
    </div>
  );
};

/**
 * Achievement Queue Component
 * Manages multiple achievement notifications
 */
export interface AchievementQueueProps {
  position?: 'top' | 'bottom' | 'center';
  duration?: number;
}

export const AchievementQueue: React.FC<AchievementQueueProps> = ({
  position = 'top',
  duration = 4000,
}) => {
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  // Add achievement to queue
  const addAchievement = useCallback((achievement: Achievement) => {
    setQueue(prev => [...prev, achievement]);
  }, []);

  // Process queue
  useEffect(() => {
    if (!currentAchievement && queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrentAchievement(next);
      setQueue(rest);
    }
  }, [currentAchievement, queue]);

  // Handle notification complete
  const handleComplete = useCallback(() => {
    setCurrentAchievement(null);
  }, []);

  // Expose method to add achievements
  useEffect(() => {
    // This would be connected to your achievement system
    // For now, we'll expose it on window for testing
    if (typeof window !== 'undefined') {
      (window as Record<string, unknown>).showAchievement = addAchievement;
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as Record<string, unknown>).showAchievement;
      }
    };
  }, [addAchievement]);

  return (
    <AchievementNotification
      achievement={currentAchievement}
      onComplete={handleComplete}
      position={position}
      duration={duration}
    />
  );
};