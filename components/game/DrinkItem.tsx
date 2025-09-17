import React, { useState, useRef, useEffect } from 'react';

export interface DrinkItemProps {
  id: string;
  name: string;
  icon: string;
  caffeineBoost: number;
  color: string;
  cooldown: number;
  description?: string;
  effects?: string[];
  isAvailable: boolean;
  remainingCooldown?: number;
  onSelect: () => void;
  onHover?: (isHovered: boolean) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  disabled?: boolean;
  layout?: 'card' | 'compact' | 'list';
  showEffectsPreview?: boolean;
  className?: string;
}

export const DrinkItem: React.FC<DrinkItemProps> = ({
  id,
  name,
  icon,
  caffeineBoost,
  color,
  cooldown,
  description,
  effects = [],
  isAvailable,
  remainingCooldown = 0,
  onSelect,
  onHover,
  onDragStart,
  onDragEnd,
  disabled = false,
  layout = 'card',
  showEffectsPreview = true,
  className = '',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const itemRef = useRef<HTMLDivElement>(null);

  const isOnCooldown = remainingCooldown > 0;
  const canSelect = isAvailable && !isOnCooldown && !disabled;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!canSelect) return;
    setIsPressed(true);
    setTouchStartTime(Date.now());

    if (onDragStart) {
      setTimeout(() => {
        if (isPressed) {
          setIsDragging(true);
          onDragStart();
        }
      }, 500);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchDuration = Date.now() - touchStartTime;

    if (isDragging) {
      setIsDragging(false);
      if (onDragEnd) onDragEnd();
    } else if (touchDuration < 500 && canSelect) {
      e.preventDefault();
      onSelect();
    }

    setIsPressed(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!canSelect) return;
    e.preventDefault();
    onSelect();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHover) onHover(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHover) onHover(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!canSelect) return;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('drinkId', id);
    if (onDragStart) onDragStart();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (onDragEnd) onDragEnd();
  };

  const getCooldownPercentage = () => {
    if (!isOnCooldown || cooldown === 0) return 0;
    return ((cooldown - remainingCooldown) / cooldown) * 100;
  };

  const formatCooldown = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  if (layout === 'list') {
    return (
      <div
        ref={itemRef}
        className={`
          flex items-center gap-3 p-3 rounded-lg transition-all duration-200
          ${canSelect ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : 'cursor-not-allowed opacity-50'}
          ${isPressed ? 'scale-95' : ''}
          ${isHovered && canSelect ? 'shadow-md' : ''}
          ${className}
        `}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        draggable={canSelect}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        role="button"
        aria-label={`Select ${name} drink`}
        aria-disabled={!canSelect}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-gray-600">
            +{caffeineBoost}% caffeine
            {isOnCooldown && <span className="ml-2 text-red-500">{formatCooldown(remainingCooldown)}</span>}
          </div>
        </div>
        {showEffectsPreview && effects.length > 0 && (
          <div className="text-xs text-gray-500">
            {effects.slice(0, 2).join(', ')}
          </div>
        )}
      </div>
    );
  }

  if (layout === 'compact') {
    return (
      <div
        ref={itemRef}
        className={`
          relative p-2 rounded-lg transition-all duration-200
          ${canSelect ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : 'cursor-not-allowed'}
          ${isPressed ? 'scale-90' : ''}
          ${className}
        `}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        draggable={canSelect}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        role="button"
        aria-label={`Select ${name} drink`}
        aria-disabled={!canSelect}
      >
        <div
          className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl mx-auto mb-1"
          style={{
            backgroundColor: color,
            opacity: canSelect ? 1 : 0.4,
          }}
        >
          {icon}
        </div>
        <div className="text-xs text-center font-medium">{name}</div>
        {isOnCooldown && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <span className="text-white text-sm font-bold">{formatCooldown(remainingCooldown)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={itemRef}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200
        ${canSelect
          ? 'border-gray-200 hover:border-blue-400 dark:border-gray-700 dark:hover:border-blue-500 cursor-pointer'
          : 'border-gray-100 dark:border-gray-800 cursor-not-allowed'
        }
        ${isPressed ? 'scale-95 shadow-inner' : 'shadow-lg'}
        ${isHovered && canSelect ? 'transform -translate-y-1 shadow-xl' : ''}
        ${isDragging ? 'opacity-50' : ''}
        ${!isAvailable ? 'grayscale' : ''}
        ${className}
      `}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      draggable={canSelect}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      role="button"
      aria-label={`Select ${name} drink. ${description || ''} ${!canSelect ? 'Currently unavailable' : ''}`}
      aria-disabled={!canSelect}
      tabIndex={canSelect ? 0 : -1}
    >
      {isOnCooldown && (
        <div
          className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-xl flex items-center justify-center z-10"
        >
          <div className="text-white text-center">
            <div className="text-2xl font-bold">{formatCooldown(remainingCooldown)}</div>
            <div className="text-xs">Cooldown</div>
          </div>
        </div>
      )}

      {isOnCooldown && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 rounded-b-xl overflow-hidden"
        >
          <div
            className="h-full bg-blue-500 transition-all duration-100"
            style={{ width: `${getCooldownPercentage()}%` }}
          />
        </div>
      )}

      <div className="flex flex-col items-center space-y-2">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all duration-200"
          style={{
            backgroundColor: color,
            opacity: canSelect ? 1 : 0.4,
            transform: isPressed ? 'scale(0.9)' : 'scale(1)',
          }}
        >
          {icon}
        </div>

        <h3 className="font-bold text-lg">{name}</h3>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          +{caffeineBoost}% caffeine
        </div>

        {description && (
          <p className="text-xs text-center text-gray-500 dark:text-gray-500">
            {description}
          </p>
        )}

        {showEffectsPreview && effects.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 w-full">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Effects:
            </div>
            <div className="space-y-1">
              {effects.map((effect, index) => (
                <div key={index} className="text-xs text-gray-500 dark:text-gray-500">
                  • {effect}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isAvailable && !isOnCooldown && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Locked
          </div>
        )}
      </div>
    </div>
  );
};

export interface DrinkIconProps {
  type: 'coffee' | 'espresso' | 'energy' | 'tea' | 'soda';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export const DrinkIcon: React.FC<DrinkIconProps> = ({
  type,
  size = 'medium',
  animated = false
}) => {
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl',
  };

  const icons = {
    coffee: '☕',
    espresso: '🍵',
    energy: '⚡',
    tea: '🫖',
    soda: '🥤',
  };

  return (
    <span
      className={`
        ${sizeClasses[size]}
        ${animated ? 'animate-bounce' : ''}
      `}
    >
      {icons[type]}
    </span>
  );
};

export const getDrinkDefaults = () => {
  return [
    {
      id: 'coffee',
      name: 'Coffee',
      icon: '☕',
      caffeineBoost: 20,
      color: '#6F4E37',
      cooldown: 5000,
      description: 'Classic brew for steady energy',
      effects: ['Moderate boost', 'Lasts 30 seconds'],
    },
    {
      id: 'espresso',
      name: 'Espresso',
      icon: '🍵',
      caffeineBoost: 40,
      color: '#3E2723',
      cooldown: 8000,
      description: 'Quick and powerful shot',
      effects: ['Strong boost', 'Quick effect', 'Lasts 20 seconds'],
    },
    {
      id: 'energy',
      name: 'Energy Drink',
      icon: '⚡',
      caffeineBoost: 60,
      color: '#00E676',
      cooldown: 12000,
      description: 'Maximum energy surge',
      effects: ['Massive boost', 'Jittery side effects', 'Lasts 45 seconds'],
    },
    {
      id: 'tea',
      name: 'Green Tea',
      icon: '🫖',
      caffeineBoost: 10,
      color: '#4CAF50',
      cooldown: 3000,
      description: 'Gentle and sustained lift',
      effects: ['Mild boost', 'No crash', 'Lasts 60 seconds'],
    },
    {
      id: 'soda',
      name: 'Soda',
      icon: '🥤',
      caffeineBoost: 15,
      color: '#F44336',
      cooldown: 4000,
      description: 'Sweet and fizzy pick-me-up',
      effects: ['Small boost', 'Sugar rush', 'Lasts 25 seconds'],
    },
  ];
};