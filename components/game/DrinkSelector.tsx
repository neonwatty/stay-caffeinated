'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DrinkItem, getDrinkDefaults } from './DrinkItem';
import { animateDrinkConsumption, animatePowerUp } from '@/utils/animations';
import anime from '@/lib/anime';

export interface Drink {
  id: string;
  name: string;
  caffeineBoost: number;
  icon: string;
  color: string;
  cooldown: number;
  description?: string;
  effects?: string[];
  unlockLevel?: number;
}

export interface DrinkSelectorProps {
  drinks?: Drink[];
  onSelect: (drinkId: string) => void;
  cooldowns?: Record<string, number>;
  disabled?: boolean;
  className?: string;
  layout?: 'grid' | 'list' | 'compact' | 'carousel';
  showEffectsPreview?: boolean;
  playerLevel?: number;
  onDragDrink?: (drinkId: string, targetElement: HTMLElement) => void;
  enableTouchGestures?: boolean;
  enableKeyboardShortcuts?: boolean;
}

export const DrinkSelector: React.FC<DrinkSelectorProps> = ({
  drinks = getDrinkDefaults(),
  onSelect,
  cooldowns = {},
  disabled = false,
  className = '',
  layout = 'grid',
  showEffectsPreview = true,
  playerLevel = 1,
  onDragDrink,
  enableTouchGestures = true,
  enableKeyboardShortcuts = true,
}) => {
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [remainingCooldowns, setRemainingCooldowns] = useState<Record<string, number>>({});
  const [hoveredDrink, setHoveredDrink] = useState<string | null>(null);
  const [draggedDrink, setDraggedDrink] = useState<string | null>(null);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

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

  useEffect(() => {
    setRemainingCooldowns(cooldowns);
  }, [cooldowns]);

  // Keyboard navigation disabled temporarily to fix infinite loop
  // TODO: Fix dependency array issue
  /*
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      const key = e.key;
      const numberKey = parseInt(key);

      if (numberKey >= 1 && numberKey <= drinks.length && numberKey <= 5) {
        e.preventDefault();
        const drinkIndex = numberKey - 1;
        const drink = drinks[drinkIndex];
        if (drink && isDrinkAvailable(drink)) {
          handleDrinkSelect(drink.id);
        }
      }

      if (key === 'ArrowLeft' && layout === 'carousel') {
        navigateCarousel('prev');
      } else if (key === 'ArrowRight' && layout === 'carousel') {
        navigateCarousel('next');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => window.removeEventListener('keydown', handleGlobalKeyPress);
  }, [drinks, layout, enableKeyboardShortcuts]);
  */

  const isDrinkAvailable = (drink: Drink) => {
    const isUnlocked = !drink.unlockLevel || playerLevel >= drink.unlockLevel;
    const isNotOnCooldown = !remainingCooldowns[drink.id] || remainingCooldowns[drink.id] === 0;
    return isUnlocked && isNotOnCooldown && !disabled;
  };

  const handleDrinkSelect = useCallback((drinkId: string, event?: React.MouseEvent<HTMLElement>) => {
    const drink = drinks.find(d => d.id === drinkId);
    if (!drink || !isDrinkAvailable(drink)) return;

    setSelectedDrink(drinkId);

    // Animate the drink selection
    if (event && event.currentTarget) {
      const drinkElement = event.currentTarget;

      // Create a clone for animation
      const clone = drinkElement.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      const rect = drinkElement.getBoundingClientRect();
      clone.style.left = `${rect.left}px`;
      clone.style.top = `${rect.top}px`;
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.pointerEvents = 'none';
      clone.style.zIndex = '9999';
      document.body.appendChild(clone);

      // Animate the clone
      anime({
        targets: clone,
        scale: [1, 1.5, 0],
        opacity: [1, 0.8, 0],
        translateY: -50,
        duration: 600,
        easing: 'easeOutQuad',
        complete: () => {
          clone.remove();
        }
      });

      // Pulse the original element
      animatePowerUp(drinkElement);
    }

    onSelect(drinkId);

    setRemainingCooldowns(prev => ({
      ...prev,
      [drinkId]: drink.cooldown,
    }));

    if (window.navigator?.vibrate && enableTouchGestures) {
      window.navigator.vibrate(50);
    }
  }, [drinks, disabled, onSelect, enableTouchGestures]);

  const handleDrinkHover = useCallback((drinkId: string | null) => {
    setHoveredDrink(drinkId);
  }, []);

  const handleDragStart = useCallback((drinkId: string) => {
    setDraggedDrink(drinkId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedDrink(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedDrink && onDragDrink) {
      onDragDrink(draggedDrink, e.currentTarget);
    }
    setDraggedDrink(null);
  }, [draggedDrink, onDragDrink]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableTouchGestures) return;
    const touch = e.touches[0];
    setSwipeStartX(touch.clientX);

    touchTimeout.current = setTimeout(() => {
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(100);
      }
    }, 500);
  }, [enableTouchGestures]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enableTouchGestures || swipeStartX === null) return;

    const touch = e.touches[0];
    const diffX = touch.clientX - swipeStartX;

    if (Math.abs(diffX) > 50 && layout === 'carousel') {
      if (diffX > 0) {
        navigateCarousel('prev');
      } else {
        navigateCarousel('next');
      }
      setSwipeStartX(null);
    }
  }, [enableTouchGestures, swipeStartX, layout]);

  const handleTouchEnd = useCallback(() => {
    if (touchTimeout.current) {
      clearTimeout(touchTimeout.current);
    }
    setSwipeStartX(null);
  }, []);

  const navigateCarousel = (direction: 'prev' | 'next') => {
    const itemsPerPage = 3;
    const totalPages = Math.ceil(drinks.length / itemsPerPage);

    if (direction === 'prev') {
      setCurrentPage(prev => Math.max(0, prev - 1));
    } else {
      setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    }
  };

  const getLayoutClass = () => {
    switch (layout) {
      case 'list':
        return 'space-y-3';
      case 'compact':
        return 'flex flex-wrap gap-2';
      case 'carousel':
        return 'flex gap-4 overflow-hidden';
      default:
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4';
    }
  };

  const renderDrinks = () => {
    let drinksToRender = drinks;

    if (layout === 'carousel') {
      const itemsPerPage = 3;
      const start = currentPage * itemsPerPage;
      drinksToRender = drinks.slice(start, start + itemsPerPage);
    }

    return drinksToRender.map((drink, index) => {
      const isAvailable = isDrinkAvailable(drink);
      const cooldown = remainingCooldowns[drink.id] || 0;

      return (
        <div
          key={drink.id}
          className={`
            ${layout === 'carousel' ? 'flex-shrink-0 w-1/3' : ''}
            ${draggedDrink === drink.id ? 'opacity-50' : ''}
          `}
        >
          <DrinkItem
            {...drink}
            isAvailable={isAvailable}
            remainingCooldown={cooldown}
            onSelect={(e) => handleDrinkSelect(drink.id, e)}
            onHover={(hovered) => handleDrinkHover(hovered ? drink.id : null)}
            onDragStart={() => handleDragStart(drink.id)}
            onDragEnd={handleDragEnd}
            disabled={disabled}
            layout={layout === 'compact' ? 'compact' : layout === 'list' ? 'list' : 'card'}
            showEffectsPreview={showEffectsPreview}
          />
          {enableKeyboardShortcuts && index < 5 && layout === 'grid' && (
            <div className="text-center mt-1 text-xs text-gray-500 dark:text-gray-400">
              Press {index + 1}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      role="region"
      aria-label="Drink selection menu"
    >
      {hoveredDrink && showEffectsPreview && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white px-3 py-2 rounded-lg text-sm z-20 pointer-events-none">
          <div className="font-bold mb-1">
            {drinks.find(d => d.id === hoveredDrink)?.name}
          </div>
          <div className="text-xs">
            {drinks.find(d => d.id === hoveredDrink)?.description}
          </div>
        </div>
      )}

      <div className={getLayoutClass()}>
        {renderDrinks()}
      </div>

      {layout === 'carousel' && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => navigateCarousel('prev')}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            disabled={currentPage === 0}
            aria-label="Previous drinks"
          >
            ←
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.ceil(drinks.length / 3) }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === currentPage ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => navigateCarousel('next')}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            disabled={currentPage >= Math.ceil(drinks.length / 3) - 1}
            aria-label="Next drinks"
          >
            →
          </button>
        </div>
      )}

      {enableTouchGestures && layout !== 'carousel' && (
        <div className="text-center mt-4 text-xs text-gray-500 dark:text-gray-400">
          Tap to select • Long press for details
        </div>
      )}

      {enableKeyboardShortcuts && (
        <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          Use number keys 1-5 for quick selection
        </div>
      )}
    </div>
  );
};

export interface DrinkDropZoneProps {
  onDrop: (drinkId: string) => void;
  children: React.ReactNode;
  className?: string;
  highlightOnDrag?: boolean;
}

export const DrinkDropZone: React.FC<DrinkDropZoneProps> = ({
  onDrop,
  children,
  className = '',
  highlightOnDrag = true,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (highlightOnDrag) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    if (highlightOnDrag) setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const drinkId = e.dataTransfer.getData('drinkId');
    if (drinkId) {
      onDrop(drinkId);
    }
    setIsDragOver(false);
  };

  return (
    <div
      className={`
        ${className}
        ${isDragOver ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
        transition-all duration-200
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};

export { DrinkItem, getDrinkDefaults } from './DrinkItem';