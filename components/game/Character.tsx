import React, { useMemo, useEffect, useState, useRef } from 'react';
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
  const characterRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<NodeListOf<Element> | null>(null);

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

      // Apply smooth state transition animation (CSS version)
      if (characterRef.current && animateTransitions) {
        // Add a CSS class for smooth transitions
        characterRef.current.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';

        // Brief fade effect for transition
        characterRef.current.style.opacity = '0.6';
        characterRef.current.style.transform = 'scale(0.95)';

        setTimeout(() => {
          if (characterRef.current) {
            characterRef.current.style.opacity = '1';
            characterRef.current.style.transform = 'scale(1)';

            // Add rotation for specific states
            if (currentState === 'over') {
              characterRef.current.style.transform = 'scale(1) rotate(2deg)';
            } else if (currentState === 'under') {
              characterRef.current.style.transform = 'scale(1) rotate(-1deg)';
            }
          }
        }, 200);
      }

      setPreviousState(currentState);
    }
  }, [currentState, previousState, onStateChange, animateTransitions]);

  // Blinking animation for all states (simplified CSS version)
  useEffect(() => {
    if (!characterRef.current || !animateTransitions) return;

    // Find eye elements within the character SVG
    const setupBlinking = () => {
      const eyes = characterRef.current?.querySelectorAll('circle[r="8"], circle[r="10"]');
      if (!eyes || eyes.length === 0) return;

      eyesRef.current = eyes;

      // Apply CSS animation classes for blinking
      eyes.forEach((eye) => {
        const element = eye as HTMLElement;
        element.style.transformOrigin = 'center';

        // Different animation speeds for different states
        if (currentState === 'under') {
          element.style.animation = 'blink 4s infinite';
        } else if (currentState === 'over') {
          element.style.animation = 'blink 0.8s infinite';
        } else {
          element.style.animation = 'blink 2s infinite';
        }
      });
    };

    // Wait for SVG to mount
    const timer = setTimeout(setupBlinking, 100);

    return () => {
      clearTimeout(timer);
      if (eyesRef.current) {
        eyesRef.current.forEach((eye) => {
          const element = eye as HTMLElement;
          element.style.animation = '';
        });
      }
    };
  }, [currentState, animateTransitions]);

  // Jittery movement for over-caffeinated state (CSS version)
  useEffect(() => {
    if (!characterRef.current || !animateTransitions) return;

    if (currentState === 'over') {
      // Apply jitter animation class
      characterRef.current.classList.add('animate-jitter');
    } else {
      // Remove jitter animation
      characterRef.current.classList.remove('animate-jitter');
    }

    return () => {
      if (characterRef.current) {
        characterRef.current.classList.remove('animate-jitter');
      }
    };
  }, [currentState, animateTransitions]);

  // Breathing animation for all states (CSS version)
  useEffect(() => {
    if (!characterRef.current || !animateTransitions) return;

    const setupBreathing = () => {
      const body = characterRef.current?.querySelector('circle[r="50"]');
      if (!body) return;

      const element = body as HTMLElement;
      element.style.transformOrigin = 'center';

      // Different breathing patterns for different states
      if (currentState === 'under') {
        element.style.animation = 'breathSlow 3s ease-in-out infinite';
      } else if (currentState === 'over') {
        element.style.animation = 'breathFast 0.8s ease-in-out infinite';
      } else {
        element.style.animation = 'breathNormal 1.5s ease-in-out infinite';
      }
    };

    // Wait for SVG to mount
    const timer = setTimeout(setupBreathing, 100);

    return () => {
      clearTimeout(timer);
      const body = characterRef.current?.querySelector('circle[r="50"]');
      if (body) {
        const element = body as HTMLElement;
        element.style.animation = '';
      }
    };
  }, [currentState, animateTransitions]);

  // Additional state-specific animations (CSS version)
  useEffect(() => {
    if (!characterRef.current || !animateTransitions) return;

    const setupStateAnimations = () => {
      // Animate Zzz for under-caffeinated
      if (currentState === 'under') {
        const zzzElements = characterRef.current?.querySelectorAll('.zzz-1, .zzz-2, .zzz-3');
        zzzElements?.forEach((el, i) => {
          const element = el as HTMLElement;
          element.style.animation = `floatUp 2s ${i * 0.4}s ease-out infinite`;
        });
      }

      // Animate sparkles for optimal state
      if (currentState === 'optimal') {
        const sparkles = characterRef.current?.querySelectorAll('.sparkle-1, .sparkle-2, .sparkle-3, .sparkle-4');
        sparkles?.forEach((el, i) => {
          const element = el as HTMLElement;
          element.style.transformOrigin = 'center';
          element.style.animation = `sparkle 2s ${i * 0.3}s ease-in-out infinite`;
        });
      }

      // Animate shake lines for over-caffeinated
      if (currentState === 'over') {
        const shakeLines = characterRef.current?.querySelectorAll('.shake-line-1, .shake-line-2, .shake-line-3, .shake-line-4, .shake-line-5, .shake-line-6');
        shakeLines?.forEach((el, i) => {
          const element = el as HTMLElement;
          element.style.animation = `shakeLine 0.2s ${i * 0.05}s linear infinite`;
        });

        // Eye twitch animation
        const eyeTwitches = characterRef.current?.querySelectorAll('.eye-twitch');
        eyeTwitches?.forEach((el) => {
          const element = el as HTMLElement;
          element.style.animation = 'twitch 0.05s linear infinite';
        });
      }
    };

    // Wait for SVG to mount
    const timer = setTimeout(setupStateAnimations, 150);

    return () => {
      clearTimeout(timer);
      // Clean up animations
      const allAnimated = characterRef.current?.querySelectorAll('.zzz-1, .zzz-2, .zzz-3, .sparkle-1, .sparkle-2, .sparkle-3, .sparkle-4, .shake-line-1, .shake-line-2, .shake-line-3, .shake-line-4, .shake-line-5, .shake-line-6, .eye-twitch');
      allAnimated?.forEach((el) => {
        const element = el as HTMLElement;
        element.style.animation = '';
      });
    };
  }, [currentState, animateTransitions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up any remaining CSS animations
      if (characterRef.current) {
        characterRef.current.style.animation = '';
        characterRef.current.style.transition = '';
        characterRef.current.style.transform = '';
        characterRef.current.style.opacity = '';
      }
    };
  }, []);

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

  // Add state-specific CSS animations
  const getStateAnimationClass = () => {
    if (!animateTransitions) return '';

    switch (currentState) {
      case 'under':
        return 'animate-slow-pulse opacity-90';
      case 'optimal':
        return 'animate-gentle-bounce';
      case 'over':
        return 'animate-fast-shake';
      default:
        return '';
    }
  };

  return (
    <div
      className={`inline-flex flex-col items-center justify-center ${className}`}
      role="img"
      aria-label={`Character is ${getStateLabel(currentState).toLowerCase()}`}
    >
      <div ref={characterRef} className={`${transitionClass} ${getStateAnimationClass()} transform-gpu`}>
        <CharacterComponent width={width} height={height} className={`${transitionClass}`} />
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