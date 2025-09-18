'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { POWERUP_DEFINITIONS } from '@/game/powerups';
import type { PowerUpType } from '@/types/powerups';
import anime from '@/lib/anime';

export interface PowerupSelectorProps {
  onActivate: (powerupId: PowerUpType) => void;
  cooldowns?: Map<PowerUpType, number>;
  activePowerups?: PowerUpType[];
  disabled?: boolean;
  className?: string;
  showTooltip?: boolean;
}

interface PowerupItemProps {
  powerupId: PowerUpType;
  isActive: boolean;
  cooldownRemaining: number;
  disabled: boolean;
  onClick: () => void;
  showTooltip?: boolean;
}

const PowerupItem: React.FC<PowerupItemProps> = ({
  powerupId,
  isActive,
  cooldownRemaining,
  disabled,
  onClick,
  showTooltip = true,
}) => {
  const powerup = POWERUP_DEFINITIONS[powerupId];
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (!disabled && cooldownRemaining <= 0 && !isActive) {
      onClick();

      // Animate activation
      anime({
        targets: `.powerup-${powerupId}`,
        scale: [1, 1.2, 1],
        rotate: '1turn',
        duration: 600,
        easing: 'easeOutElastic(1, .8)',
      });
    }
  }, [disabled, cooldownRemaining, isActive, onClick, powerupId]);

  const getCooldownDisplay = () => {
    if (cooldownRemaining > 0) {
      return `${Math.ceil(cooldownRemaining / 1000)}s`;
    }
    return null;
  };

  const getStatusClass = () => {
    if (disabled) return 'opacity-50 cursor-not-allowed';
    if (isActive) return 'ring-2 ring-green-500 animate-pulse';
    if (cooldownRemaining > 0) return 'opacity-60 cursor-not-allowed';
    return 'cursor-pointer hover:scale-105 transition-transform';
  };

  return (
    <div className="relative">
      <button
        className={`powerup-${powerupId} relative flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-700 bg-gray-800 ${getStatusClass()}`}
        onClick={handleClick}
        disabled={disabled || cooldownRemaining > 0 || isActive}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: isActive ? `${powerup.color}20` : undefined,
          borderColor: isActive ? powerup.color : undefined,
        }}
      >
        <span className="text-3xl mb-2">{powerup.icon}</span>
        <span className="text-sm font-medium text-gray-200">{powerup.name}</span>

        {/* Cooldown overlay */}
        {cooldownRemaining > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg">
            <span className="text-white font-bold">{getCooldownDisplay()}</span>
          </div>
        )}

        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-1 right-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}

        {/* Cost indicator for power nap */}
        {powerup.cost > 0 && (
          <div className="absolute bottom-1 left-1 text-xs text-gray-400">
            {powerup.cost / 1000}s cost
          </div>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && isHovered && !disabled && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
          <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl border border-gray-700 min-w-[200px]">
            <div className="font-semibold mb-1">{powerup.name}</div>
            <div className="text-xs text-gray-300 mb-2">{powerup.description}</div>

            {/* Effect details */}
            <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
              {powerup.effect.caffeineBoost && (
                <div>+{powerup.effect.caffeineBoost} Caffeine</div>
              )}
              {powerup.effect.healthBoost && (
                <div>+{powerup.effect.healthBoost} Health</div>
              )}
              {powerup.effect.productivityMultiplier && (
                <div>{(powerup.effect.productivityMultiplier * 100).toFixed(0)}% Productivity</div>
              )}
              {powerup.effect.crashReduction && (
                <div>-{(powerup.effect.crashReduction * 100).toFixed(0)}% Crash</div>
              )}
              {powerup.effect.caffeineDepletionReduction && (
                <div>-{(powerup.effect.caffeineDepletionReduction * 100).toFixed(0)}% Depletion</div>
              )}
              <div className="mt-1">Duration: {powerup.duration / 1000}s</div>
              <div>Cooldown: {powerup.cooldown / 1000}s</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const PowerupSelector: React.FC<PowerupSelectorProps> = ({
  onActivate,
  cooldowns = new Map(),
  activePowerups = [],
  disabled = false,
  className = '',
  showTooltip = true,
}) => {
  const [remainingCooldowns, setRemainingCooldowns] = useState<Map<PowerUpType, number>>(new Map());

  // Update cooldown timers
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const updated = new Map<PowerUpType, number>();

      cooldowns.forEach((endTime, type) => {
        const remaining = Math.max(0, endTime - now);
        if (remaining > 0) {
          updated.set(type, remaining);
        }
      });

      setRemainingCooldowns(updated);
    }, 100);

    return () => clearInterval(interval);
  }, [cooldowns]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled) return;

      const shortcuts: Record<string, PowerUpType> = {
        '1': 'proteinBar',
        '2': 'vitamins',
        '3': 'powerNap',
      };

      const powerupType = shortcuts[e.key];
      if (powerupType && !remainingCooldowns.has(powerupType) && !activePowerups.includes(powerupType)) {
        onActivate(powerupType);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [disabled, remainingCooldowns, activePowerups, onActivate]);

  const powerupTypes: PowerUpType[] = ['proteinBar', 'vitamins', 'powerNap'];

  return (
    <div className={`powerup-selector ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-gray-300">Power-ups</span>
        <span className="text-xs text-gray-500">(Press 1-3)</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {powerupTypes.map((type) => (
          <PowerupItem
            key={type}
            powerupId={type}
            isActive={activePowerups.includes(type)}
            cooldownRemaining={remainingCooldowns.get(type) || 0}
            disabled={disabled}
            onClick={() => onActivate(type)}
            showTooltip={showTooltip}
          />
        ))}
      </div>
    </div>
  );
};