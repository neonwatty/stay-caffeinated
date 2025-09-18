/**
 * EventNotification - Displays event warnings and active event information
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { GameEvent, ActiveEvent } from '@/types';
import * as anime from 'animejs';

interface EventNotificationProps {
  activeEvent: ActiveEvent | null;
  isWarning?: boolean;
  className?: string;
}

/**
 * EventNotification component displays event warnings and active events
 */
export default function EventNotification({
  activeEvent,
  isWarning = false,
  className = ''
}: EventNotificationProps) {
  const notificationRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [displayEvent, setDisplayEvent] = useState<GameEvent | null>(null);
  const animationRef = useRef<anime.AnimeInstance | null>(null);
  const progressAnimationRef = useRef<anime.AnimeInstance | null>(null);

  // Update display event
  useEffect(() => {
    if (activeEvent?.event) {
      setDisplayEvent(activeEvent.event);
    } else {
      // Keep displaying for fade out animation
      const timer = setTimeout(() => setDisplayEvent(null), 500);
      return () => clearTimeout(timer);
    }
  }, [activeEvent]);

  // Animate notification appearance
  useEffect(() => {
    if (!notificationRef.current || !displayEvent) return;

    // Clean up previous animation
    if (animationRef.current) {
      animationRef.current.pause();
    }

    // Create entrance animation
    if (activeEvent) {
      animationRef.current = anime({
        targets: notificationRef.current,
        translateY: ['-100%', '0%'],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutElastic(1, .8)'
      });

      // Animate icon
      if (iconRef.current) {
        anime({
          targets: iconRef.current,
          rotate: [0, 360],
          scale: [0, 1],
          duration: 600,
          delay: 200,
          easing: 'easeOutElastic(1, .6)'
        });
      }
    } else {
      // Exit animation
      animationRef.current = anime({
        targets: notificationRef.current,
        translateY: ['0%', '-120%'],
        opacity: [1, 0],
        duration: 400,
        easing: 'easeInBack'
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [activeEvent, displayEvent]);

  // Animate progress bar
  useEffect(() => {
    if (!progressRef.current || !activeEvent?.isActive) return;

    // Clean up previous animation
    if (progressAnimationRef.current) {
      progressAnimationRef.current.pause();
    }

    const duration = activeEvent.endTime - activeEvent.startTime;

    progressAnimationRef.current = anime({
      targets: progressRef.current,
      width: ['100%', '0%'],
      duration: duration,
      easing: 'linear'
    });

    return () => {
      if (progressAnimationRef.current) {
        progressAnimationRef.current.pause();
      }
    };
  }, [activeEvent]);

  if (!displayEvent) return null;

  const isActive = activeEvent?.isActive ?? false;

  return (
    <div
      ref={notificationRef}
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 ${className}`}
      style={{ opacity: 0 }}
    >
      <div
        className={`
          relative overflow-hidden rounded-lg shadow-2xl
          ${isWarning ? 'bg-yellow-900/95' : isActive ? 'bg-red-900/95' : 'bg-gray-900/95'}
          border-2 ${isWarning ? 'border-yellow-500' : isActive ? 'border-red-500' : 'border-gray-600'}
          backdrop-blur-sm transition-all duration-300
          ${isActive ? 'animate-pulse-slow' : ''}
        `}
      >
        {/* Warning badge */}
        {isWarning && !isActive && (
          <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-lg animate-pulse">
            WARNING
          </div>
        )}

        {/* Content */}
        <div className="relative px-6 py-4 flex items-center space-x-4">
          {/* Icon */}
          <div
            ref={iconRef}
            className="text-4xl animate-bounce-slow"
            style={{ animationDelay: '0.1s' }}
          >
            {displayEvent.icon}
          </div>

          {/* Text content */}
          <div className="flex-1">
            <h3 className={`
              text-lg font-bold mb-1
              ${isWarning ? 'text-yellow-300' : isActive ? 'text-red-300' : 'text-gray-300'}
            `}>
              {isWarning && !isActive ? `Incoming: ${displayEvent.name}` : displayEvent.name}
            </h3>

            <p className="text-sm text-gray-200 mb-2">
              {displayEvent.description}
            </p>

            {/* Special condition */}
            {displayEvent.effect.specialCondition && (
              <div className={`
                text-xs px-2 py-1 rounded inline-block
                ${isActive ? 'bg-red-800/50 text-red-200' : 'bg-yellow-800/50 text-yellow-200'}
              `}>
                ⚠️ {displayEvent.effect.specialCondition}
              </div>
            )}

            {/* Effect indicators */}
            <div className="flex gap-2 mt-2">
              {displayEvent.effect.caffeineMultiplier && displayEvent.effect.caffeineMultiplier !== 1 && (
                <span className="text-xs bg-black/30 px-2 py-1 rounded">
                  ☕ {displayEvent.effect.caffeineMultiplier > 1 ? '↑' : '↓'}
                  {Math.abs((displayEvent.effect.caffeineMultiplier - 1) * 100).toFixed(0)}%
                </span>
              )}
              {displayEvent.effect.healthMultiplier && displayEvent.effect.healthMultiplier !== 1 && (
                <span className="text-xs bg-black/30 px-2 py-1 rounded">
                  ❤️ {displayEvent.effect.healthMultiplier > 1 ? '↑' : '↓'}
                  {Math.abs((displayEvent.effect.healthMultiplier - 1) * 100).toFixed(0)}%
                </span>
              )}
              {displayEvent.effect.optimalZoneShift && (
                <span className="text-xs bg-black/30 px-2 py-1 rounded">
                  🎯 Zone {displayEvent.effect.optimalZoneShift}%
                </span>
              )}
              {displayEvent.effect.drinkRestriction && (
                <span className="text-xs bg-black/30 px-2 py-1 rounded">
                  🚫 No Drinks
                </span>
              )}
            </div>
          </div>

          {/* Duration indicator */}
          {isActive && activeEvent && (
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-red-400">
                {Math.ceil((activeEvent.endTime - Date.now()) / 1000)}s
              </div>
              <div className="text-xs text-gray-400">remaining</div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {isActive && (
          <div className="h-1 bg-black/30">
            <div
              ref={progressRef}
              className="h-full bg-gradient-to-r from-red-500 to-red-600"
              style={{ width: '100%' }}
            />
          </div>
        )}

        {/* Warning countdown */}
        {isWarning && !isActive && (
          <div className="h-1 bg-black/30">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 animate-pulse"
              style={{
                width: '100%',
                animation: `shrink ${displayEvent.warningTime}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      {/* Glow effect */}
      <div
        className={`
          absolute inset-0 -z-10 blur-xl opacity-50
          ${isWarning ? 'bg-yellow-500' : isActive ? 'bg-red-500' : 'bg-gray-500'}
        `}
        style={{ transform: 'scale(1.2)' }}
      />
    </div>
  );
}

/**
 * EventNotificationContainer manages multiple notifications and warning states
 */
export function EventNotificationContainer({
  activeEvent,
  upcomingEvent,
  className = ''
}: {
  activeEvent: ActiveEvent | null;
  upcomingEvent?: ActiveEvent | null;
  className?: string;
}) {
  const [showWarning, setShowWarning] = useState(false);

  // Manage warning display
  useEffect(() => {
    if (upcomingEvent && !activeEvent) {
      const warningTime = upcomingEvent.startTime - upcomingEvent.event.warningTime;
      const now = Date.now();

      if (now >= warningTime && now < upcomingEvent.startTime) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    } else {
      setShowWarning(false);
    }
  }, [upcomingEvent, activeEvent]);

  // Show active event or warning
  if (activeEvent?.isActive) {
    return (
      <EventNotification
        activeEvent={activeEvent}
        isWarning={false}
        className={className}
      />
    );
  }

  if (showWarning && upcomingEvent) {
    return (
      <EventNotification
        activeEvent={upcomingEvent}
        isWarning={true}
        className={className}
      />
    );
  }

  return null;
}