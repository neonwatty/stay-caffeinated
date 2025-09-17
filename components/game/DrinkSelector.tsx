'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';

interface Drink {
  id: string;
  name: string;
  caffeineBoost: number;
  icon: string;
  color: string;
  cooldown: number;
  description?: string;
}

interface DrinkSelectorProps {
  drinks: Drink[];
  onSelect: (drinkId: string) => void;
  cooldowns?: Record<string, number>;
  disabled?: boolean;
  className?: string;
  layout?: 'grid' | 'list' | 'compact';
}

/**
 * DrinkSelector component for choosing drinks in the game
 * Supports cooldowns, keyboard navigation, and touch interactions
 */
export const DrinkSelector: React.FC<DrinkSelectorProps> = ({
  drinks,
  onSelect,
  cooldowns = {},
  disabled = false,
  className = '',
  layout = 'grid',
}) => {
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [remainingCooldowns, setRemainingCooldowns] = useState<Record<string, number>>({});

  // Update cooldown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingCooldowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(drinkId => {
          if (updated[drinkId] > 0) {
            updated[drinkId] = Math.max(0, updated[drinkId] - 100);
          }
        });
        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Sync external cooldowns
  useEffect(() => {
    setRemainingCooldowns(cooldowns);
  }, [cooldowns]);

  const handleDrinkSelect = (drinkId: string) => {
    if (disabled || remainingCooldowns[drinkId] > 0) return;

    setSelectedDrink(drinkId);
    onSelect(drinkId);

    // Set cooldown
    const drink = drinks.find(d => d.id === drinkId);
    if (drink) {
      setRemainingCooldowns(prev => ({
        ...prev,
        [drinkId]: drink.cooldown,
      }));
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, drinkId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDrinkSelect(drinkId);
    }
  };

  if (layout === 'compact') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {drinks.map((drink) => {
          const cooldownRemaining = remainingCooldowns[drink.id] || 0;
          const isOnCooldown = cooldownRemaining > 0;

          return (
            <button
              key={drink.id}
              onClick={() => handleDrinkSelect(drink.id)}
              disabled={disabled || isOnCooldown}
              className={`
                relative p-3 rounded-lg transition-all
                ${isOnCooldown || disabled
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                  : 'hover:scale-105 active:scale-95 bg-white dark:bg-gray-700 shadow-md hover:shadow-lg'
                }
                ${selectedDrink === drink.id ? 'ring-2 ring-indigo-500' : ''}
              `}
              title={`${drink.name} (+${drink.caffeineBoost} caffeine)`}
            >
              <span className="text-2xl">{drink.icon}</span>
              {isOnCooldown && (
                <div className="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {Math.ceil(cooldownRemaining / 1000)}s
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className={`space-y-2 ${className}`}>
        {drinks.map((drink) => {
          const cooldownRemaining = remainingCooldowns[drink.id] || 0;
          const isOnCooldown = cooldownRemaining > 0;

          return (
            <DrinkListItem
              key={drink.id}
              drink={drink}
              isOnCooldown={isOnCooldown}
              cooldownRemaining={cooldownRemaining}
              disabled={disabled}
              selected={selectedDrink === drink.id}
              onSelect={() => handleDrinkSelect(drink.id)}
              onKeyDown={(e) => handleKeyDown(e, drink.id)}
            />
          );
        })}
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 ${className}`}>
      {drinks.map((drink) => {
        const cooldownRemaining = remainingCooldowns[drink.id] || 0;
        const isOnCooldown = cooldownRemaining > 0;

        return (
          <DrinkCard
            key={drink.id}
            drink={drink}
            isOnCooldown={isOnCooldown}
            cooldownRemaining={cooldownRemaining}
            disabled={disabled}
            selected={selectedDrink === drink.id}
            onSelect={() => handleDrinkSelect(drink.id)}
            onKeyDown={(e) => handleKeyDown(e, drink.id)}
          />
        );
      })}
    </div>
  );
};

// Drink card component
interface DrinkCardProps {
  drink: Drink;
  isOnCooldown: boolean;
  cooldownRemaining: number;
  disabled: boolean;
  selected: boolean;
  onSelect: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const DrinkCard: React.FC<DrinkCardProps> = ({
  drink,
  isOnCooldown,
  cooldownRemaining,
  disabled,
  selected,
  onSelect,
  onKeyDown,
}) => {
  return (
    <Card
      onClick={onSelect}
      hoverable={!disabled && !isOnCooldown}
      className={`
        relative cursor-pointer text-center
        ${isOnCooldown || disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${selected ? 'ring-2 ring-indigo-500' : ''}
      `}
      padding="sm"
    >
      <div
        className="p-4"
        role="button"
        tabIndex={disabled || isOnCooldown ? -1 : 0}
        onKeyDown={onKeyDown}
        aria-label={`${drink.name}, adds ${drink.caffeineBoost} caffeine`}
        aria-disabled={disabled || isOnCooldown}
      >
        <div className="text-4xl mb-2">{drink.icon}</div>
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {drink.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          +{drink.caffeineBoost}
        </p>
        {drink.description && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {drink.description}
          </p>
        )}
      </div>

      {/* Cooldown overlay */}
      {isOnCooldown && (
        <div className="absolute inset-0 bg-gray-900/60 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {Math.ceil(cooldownRemaining / 1000)}
            </div>
            <div className="text-xs text-white/80">seconds</div>
          </div>
        </div>
      )}
    </Card>
  );
};

// Drink list item component
type DrinkListItemProps = DrinkCardProps;

const DrinkListItem: React.FC<DrinkListItemProps> = ({
  drink,
  isOnCooldown,
  cooldownRemaining,
  disabled,
  selected,
  onSelect,
  onKeyDown,
}) => {
  return (
    <button
      onClick={onSelect}
      onKeyDown={onKeyDown}
      disabled={disabled || isOnCooldown}
      className={`
        w-full flex items-center gap-4 p-3 rounded-lg
        bg-white dark:bg-gray-800 transition-all
        ${isOnCooldown || disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
        }
        ${selected ? 'ring-2 ring-indigo-500' : 'shadow-sm'}
      `}
    >
      <div className="text-2xl flex-shrink-0">{drink.icon}</div>
      <div className="flex-1 text-left">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {drink.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          +{drink.caffeineBoost} caffeine
        </p>
      </div>
      {isOnCooldown && (
        <div className="flex-shrink-0">
          <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {Math.ceil(cooldownRemaining / 1000)}s
            </span>
          </div>
        </div>
      )}
    </button>
  );
};