'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { CharacterState } from './svg/CharacterStates';
import { DEFAULT_SPRITE_CONFIG, type SpriteConfig } from './sprites/config';

export interface SpriteCharacterProps {
  caffeineLevel: number;
  width?: number;
  height?: number;
  className?: string;
  isActive?: boolean;
  pressureState?: 'none' | 'drink' | 'event';
  activeEventTitle?: string;
  showStateLabel?: boolean;
  spriteConfig?: SpriteConfig;
  customThresholds?: {
    underCaffeinated?: number;
    overCaffeinated?: number;
  };
  onStateChange?: (newState: CharacterState, oldState: CharacterState) => void;
}

export const SpriteCharacter: React.FC<SpriteCharacterProps> = ({
  caffeineLevel,
  width = 220,
  height = 220,
  className = '',
  isActive = true,
  pressureState = 'none',
  activeEventTitle,
  showStateLabel = false,
  spriteConfig = DEFAULT_SPRITE_CONFIG,
  customThresholds,
  onStateChange,
}) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const prevStateRef = useRef<CharacterState>('optimal');

  const currentState = useMemo((): CharacterState => {
    const underThresh = customThresholds?.underCaffeinated ?? 30;
    const overThresh = customThresholds?.overCaffeinated ?? 70;
    if (caffeineLevel < underThresh) return 'under';
    if (caffeineLevel > overThresh) return 'over';
    return 'optimal';
  }, [caffeineLevel, customThresholds]);

  // Fire state change callback
  useEffect(() => {
    if (currentState !== prevStateRef.current) {
      onStateChange?.(currentState, prevStateRef.current);
      prevStateRef.current = currentState;
    }
  }, [currentState, onStateChange]);

  // Detect basePath for Next.js static export
  const basePath = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const nextData = (window as unknown as { __NEXT_DATA__?: { assetPrefix?: string; basePath?: string } }).__NEXT_DATA__;
    return nextData?.assetPrefix || nextData?.basePath || '';
  }, []);

  useEffect(() => {
    setFrameIndex(0);
  }, [currentState]);

  const currentConfig = spriteConfig[currentState];

  useEffect(() => {
    if (!isActive || currentConfig.frameCount <= 1) return;

    const interval = window.setInterval(() => {
      setFrameIndex((index) => (index + 1) % currentConfig.frameCount);
    }, 1000 / currentConfig.fps);

    return () => window.clearInterval(interval);
  }, [currentConfig.fps, currentConfig.frameCount, isActive]);

  const stateLabels: Record<CharacterState, string> = {
    under: 'Under-Caffeinated',
    optimal: 'Optimally Caffeinated',
    over: 'Over-Caffeinated',
  };

  const stateColors: Record<CharacterState, string> = {
    under: 'text-blue-600',
    optimal: 'text-green-600',
    over: 'text-red-600',
  };

  const isVertical = currentConfig.layout === 'vertical';
  const sheetUrl = `${basePath}${currentConfig.path}`;
  const backgroundSize = isVertical
    ? `${width}px ${height * currentConfig.frameCount}px`
    : `${width * currentConfig.frameCount}px ${height}px`;
  const backgroundPosition = isVertical
    ? `0px -${frameIndex * height}px`
    : `-${frameIndex * width}px 0px`;

  return (
    <div
      className={`inline-flex flex-col items-center justify-center ${className}`}
      role="img"
      aria-label={`Character is ${stateLabels[currentState].toLowerCase()}${pressureState === 'event' && activeEventTitle ? ` under pressure from ${activeEventTitle}` : ''}${pressureState === 'drink' ? ' after a drink choice' : ''}`}
      data-pressure-state={pressureState}
      data-active-event={activeEventTitle ?? ''}
      style={{ imageRendering: 'pixelated' }}
    >
      <div className="relative" style={{ width, height }}>
        <div
          data-testid="sprite-frame"
          aria-hidden="true"
          style={{
            width,
            height,
            backgroundImage: `url(${sheetUrl})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition,
            backgroundSize,
            imageRendering: 'pixelated',
            filter: pressureState === 'event'
              ? 'drop-shadow(0 0 12px rgba(248, 113, 113, 0.8))'
              : pressureState === 'drink'
                ? 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.75))'
                : undefined,
            transform: pressureState === 'event' ? 'translateY(-2px)' : undefined,
            transition: 'filter 160ms ease, transform 160ms ease',
          }}
        />
        {pressureState !== 'none' && (
          <div
            data-testid="sprite-feedback"
            aria-hidden="true"
            className={`absolute inset-0 rounded-xl border-4 ${
              pressureState === 'event'
                ? 'border-red-400/70 shadow-[0_0_28px_rgba(248,113,113,0.5)]'
                : 'border-emerald-300/70 shadow-[0_0_28px_rgba(52,211,153,0.45)]'
            }`}
          />
        )}
      </div>

      {showStateLabel && (
        <div className={`mt-2 text-sm font-medium ${stateColors[currentState]} transition-all duration-300`}>
          {stateLabels[currentState]}
        </div>
      )}

      <div className="sr-only" aria-live="polite">
        Caffeine level: {caffeineLevel}%
      </div>
    </div>
  );
};
