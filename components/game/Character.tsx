import React, { useMemo, useEffect, useState } from 'react';
import {
  UnderCaffeinatedCharacter,
  OptimalCharacter,
  OverCaffeinatedCharacter,
  CharacterState,
  getCharacterComponent,
} from './svg/CharacterStates';

export interface CharacterProps {
  caffeineLevel: number;
  width?: number;
  height?: number;
  className?: string;
  showStateLabel?: boolean;
  animateTransitions?: boolean;
  customThresholds?: {
    underCaffeinated?: number;
    optimal?: { min: number; max: number };
    overCaffeinated?: number;
  };
  onStateChange?: (newState: CharacterState, oldState: CharacterState) => void;
}

export const Character: React.FC<CharacterProps> = ({
  caffeineLevel,
  width = 200,
  height = 200,
  className = '',
  showStateLabel = false,
  animateTransitions = true,
  customThresholds = {
    underCaffeinated: 30,
    optimal: { min: 30, max: 70 },
    overCaffeinated: 70,
  },
  onStateChange,
}) => {
  const [previousState, setPreviousState] = useState<CharacterState>('optimal');

  const currentState = useMemo((): CharacterState => {
    const { underCaffeinated = 30, overCaffeinated = 70 } = customThresholds;

    if (caffeineLevel < underCaffeinated) {
      return 'under';
    } else if (caffeineLevel > overCaffeinated) {
      return 'over';
    } else {
      return 'optimal';
    }
  }, [caffeineLevel, customThresholds]);

  useEffect(() => {
    if (currentState !== previousState) {
      if (onStateChange) {
        onStateChange(currentState, previousState);
      }
      setPreviousState(currentState);
    }
  }, [currentState, previousState, onStateChange]);

  const CharacterComponent = getCharacterComponent(currentState);

  const getStateLabel = (state: CharacterState): string => {
    switch (state) {
      case 'under':
        return 'Under-Caffeinated';
      case 'optimal':
        return 'Optimally Caffeinated';
      case 'over':
        return 'Over-Caffeinated';
      default:
        return '';
    }
  };

  const getStateColor = (state: CharacterState): string => {
    switch (state) {
      case 'under':
        return 'text-blue-600';
      case 'optimal':
        return 'text-green-600';
      case 'over':
        return 'text-red-600';
      default:
        return '';
    }
  };

  const transitionClass = animateTransitions ? 'transition-all duration-300 ease-in-out' : '';

  return (
    <div
      className={`inline-flex flex-col items-center justify-center ${className}`}
      role="img"
      aria-label={`Character is ${getStateLabel(currentState).toLowerCase()}`}
    >
      <div className={`${transitionClass} ${currentState === 'over' ? 'animate-shake' : ''}`}>
        <CharacterComponent width={width} height={height} className={transitionClass} />
      </div>

      {showStateLabel && (
        <div className={`mt-2 text-sm font-medium ${getStateColor(currentState)} ${transitionClass}`}>
          {getStateLabel(currentState)}
        </div>
      )}

      <div className="sr-only" aria-live="polite">
        Caffeine level: {caffeineLevel}%
      </div>
    </div>
  );
};

export interface CharacterMoodProps {
  mood: 'happy' | 'tired' | 'energized' | 'anxious' | 'focused';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const CharacterMood: React.FC<CharacterMoodProps> = ({
  mood,
  size = 'medium',
  className = '',
}) => {
  const sizeMap = {
    small: { width: 100, height: 100 },
    medium: { width: 200, height: 200 },
    large: { width: 300, height: 300 },
  };

  const { width, height } = sizeMap[size];

  const moodToStateMap: Record<CharacterMoodProps['mood'], CharacterState> = {
    happy: 'optimal',
    tired: 'under',
    energized: 'optimal',
    anxious: 'over',
    focused: 'optimal',
  };

  const CharacterComponent = getCharacterComponent(moodToStateMap[mood]);

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      role="img"
      aria-label={`Character mood: ${mood}`}
    >
      <CharacterComponent width={width} height={height} />
    </div>
  );
};

export interface AnimatedCharacterProps extends CharacterProps {
  isActive?: boolean;
  pulseWhenOptimal?: boolean;
  shakeWhenOverCaffeinated?: boolean;
  fadeWhenUnderCaffeinated?: boolean;
}

export const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({
  isActive = true,
  pulseWhenOptimal = true,
  shakeWhenOverCaffeinated = true,
  fadeWhenUnderCaffeinated = true,
  caffeineLevel,
  ...props
}) => {
  const state = useMemo((): CharacterState => {
    const { underCaffeinated = 30, overCaffeinated = 70 } = props.customThresholds || {};

    if (caffeineLevel < underCaffeinated) {
      return 'under';
    } else if (caffeineLevel > overCaffeinated) {
      return 'over';
    } else {
      return 'optimal';
    }
  }, [caffeineLevel, props.customThresholds]);

  const animationClass = useMemo(() => {
    if (!isActive) return '';

    const classes = [];

    if (state === 'optimal' && pulseWhenOptimal) {
      classes.push('animate-pulse');
    }

    if (state === 'over' && shakeWhenOverCaffeinated) {
      classes.push('animate-shake');
    }

    if (state === 'under' && fadeWhenUnderCaffeinated) {
      classes.push('opacity-70');
    }

    return classes.join(' ');
  }, [state, isActive, pulseWhenOptimal, shakeWhenOverCaffeinated, fadeWhenUnderCaffeinated]);

  return (
    <div className={animationClass}>
      <Character caffeineLevel={caffeineLevel} {...props} />
    </div>
  );
};

export { UnderCaffeinatedCharacter, OptimalCharacter, OverCaffeinatedCharacter };
export type { CharacterState };