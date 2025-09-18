import React, { useMemo, useEffect, useState, useRef } from 'react';
import {
  UnderCaffeinatedCharacter,
  OptimalCharacter,
  OverCaffeinatedCharacter,
  CharacterState,
  getCharacterComponent,
} from './svg/CharacterStates';
import { animateCharacterState } from '@/utils/animations';
import anime from '@/lib/anime';

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
  const animationRef = useRef<anime.AnimeInstance | null>(null);
  const blinkAnimationRef = useRef<anime.AnimeInstance | null>(null);
  const jitterAnimationRef = useRef<anime.AnimeInstance | null>(null);
  const breathAnimationRef = useRef<anime.AnimeInstance | null>(null);
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

      // Apply smooth state transition animation
      if (characterRef.current && animateTransitions) {
        // Clean up previous animation
        if (animationRef.current) {
          animationRef.current.pause();
        }

        // Transition animation between states
        const transitionTimeline = anime.timeline({
          easing: 'easeInOutQuad',
        });

        // Fade out current state
        transitionTimeline
          .add({
            targets: characterRef.current,
            opacity: [1, 0.6],
            scale: [1, 0.95],
            duration: 200,
          })
          // Morph to new state
          .add({
            targets: characterRef.current,
            opacity: [0.6, 1],
            scale: [0.95, 1],
            rotate: currentState === 'over' ? [0, 5, 0] : currentState === 'under' ? [0, -3, 0] : 0,
            duration: 300,
            complete: () => {
              // Map states to animation states
              const animationStateMap: Record<CharacterState, 'sleepy' | 'normal' | 'hyper'> = {
                'under': 'sleepy',
                'optimal': 'normal',
                'over': 'hyper'
              };

              animationRef.current = animateCharacterState(
                characterRef.current!,
                animationStateMap[currentState]
              );
            }
          });
      }

      setPreviousState(currentState);
    }
  }, [currentState, previousState, onStateChange, animateTransitions]);

  // Blinking animation for all states
  useEffect(() => {
    if (!characterRef.current || !animateTransitions) return;

    // Find eye elements within the character SVG
    const setupBlinking = () => {
      const eyes = characterRef.current?.querySelectorAll('circle[r="8"], circle[r="10"]');
      if (!eyes || eyes.length === 0) return;

      eyesRef.current = eyes;

      // Different blink rates for different states
      const blinkInterval = currentState === 'under' ? 4000 : currentState === 'over' ? 800 : 2000;
      const blinkDuration = currentState === 'under' ? 300 : currentState === 'over' ? 100 : 200;

      // Clean up previous blink animation
      if (blinkAnimationRef.current) {
        blinkAnimationRef.current.pause();
      }

      // Create blink animation
      blinkAnimationRef.current = anime({
        targets: eyes,
        scaleY: [1, 0.1, 1],
        duration: blinkDuration,
        easing: 'easeInOutQuad',
        loop: true,
        delay: (el, i) => i * 50,
        loopBegin: function() {
          // Random delay between blinks
          const randomDelay = Math.random() * blinkInterval + blinkInterval;
          if (blinkAnimationRef.current) {
            blinkAnimationRef.current.delay = randomDelay;
          }
        }
      });
    };

    // Wait for SVG to mount
    const timer = setTimeout(setupBlinking, 100);

    return () => {
      clearTimeout(timer);
      if (blinkAnimationRef.current) {
        blinkAnimationRef.current.pause();
      }
    };
  }, [currentState, animateTransitions]);

  // Jittery movement for over-caffeinated state
  useEffect(() => {
    if (!characterRef.current || !animateTransitions) return;

    if (currentState === 'over') {
      // Clean up previous jitter animation
      if (jitterAnimationRef.current) {
        jitterAnimationRef.current.pause();
      }

      // Create jitter animation
      jitterAnimationRef.current = anime({
        targets: characterRef.current,
        translateX: () => anime.random(-2, 2),
        translateY: () => anime.random(-2, 2),
        duration: 100,
        easing: 'linear',
        loop: true,
        direction: 'alternate',
      });
    } else {
      // Stop jitter when not over-caffeinated
      if (jitterAnimationRef.current) {
        jitterAnimationRef.current.pause();
        anime({
          targets: characterRef.current,
          translateX: 0,
          translateY: 0,
          duration: 200,
          easing: 'easeOutQuad',
        });
      }
    }

    return () => {
      if (jitterAnimationRef.current) {
        jitterAnimationRef.current.pause();
      }
    };
  }, [currentState, animateTransitions]);

  // Breathing animation for all states
  useEffect(() => {
    if (!characterRef.current || !animateTransitions) return;

    const setupBreathing = () => {
      const body = characterRef.current?.querySelector('circle[r="50"]');
      if (!body) return;

      // Different breathing patterns for different states
      const breathDuration = currentState === 'under' ? 3000 : currentState === 'over' ? 800 : 1500;
      const breathScale = currentState === 'under' ? [1, 0.98, 1] : currentState === 'over' ? [1, 1.02, 1] : [1, 1.01, 1];

      // Clean up previous breath animation
      if (breathAnimationRef.current) {
        breathAnimationRef.current.pause();
      }

      // Create breathing animation
      breathAnimationRef.current = anime({
        targets: body,
        scale: breathScale,
        duration: breathDuration,
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate',
      });
    };

    // Wait for SVG to mount
    const timer = setTimeout(setupBreathing, 100);

    return () => {
      clearTimeout(timer);
      if (breathAnimationRef.current) {
        breathAnimationRef.current.pause();
      }
    };
  }, [currentState, animateTransitions]);

  // Additional state-specific animations
  useEffect(() => {
    if (!characterRef.current || !animateTransitions) return;

    const setupStateAnimations = () => {
      // Animate Zzz for under-caffeinated
      if (currentState === 'under') {
        const zzzElements = characterRef.current?.querySelectorAll('.zzz-1, .zzz-2, .zzz-3');
        if (zzzElements && zzzElements.length > 0) {
          anime({
            targets: zzzElements,
            opacity: [0, 0.7, 0],
            translateY: [0, -10],
            duration: 2000,
            delay: anime.stagger(400),
            easing: 'easeOutQuad',
            loop: true,
          });
        }
      }

      // Animate sparkles for optimal state
      if (currentState === 'optimal') {
        const sparkles = characterRef.current?.querySelectorAll('.sparkle-1, .sparkle-2, .sparkle-3, .sparkle-4');
        if (sparkles && sparkles.length > 0) {
          anime({
            targets: sparkles,
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180, 360],
            duration: 2000,
            delay: anime.stagger(300),
            easing: 'easeInOutSine',
            loop: true,
          });
        }
      }

      // Animate shake lines for over-caffeinated
      if (currentState === 'over') {
        const shakeLines = characterRef.current?.querySelectorAll('.shake-line-1, .shake-line-2, .shake-line-3, .shake-line-4, .shake-line-5, .shake-line-6');
        if (shakeLines && shakeLines.length > 0) {
          anime({
            targets: shakeLines,
            opacity: [0, 0.7, 0],
            strokeWidth: [1, 3, 1],
            duration: 200,
            delay: anime.stagger(50),
            easing: 'linear',
            loop: true,
          });
        }

        // Eye twitch animation
        const eyeTwitches = characterRef.current?.querySelectorAll('.eye-twitch');
        if (eyeTwitches && eyeTwitches.length > 0) {
          anime({
            targets: eyeTwitches,
            translateX: () => anime.random(-1, 1),
            translateY: () => anime.random(-1, 1),
            duration: 50,
            easing: 'linear',
            loop: true,
          });
        }
      }
    };

    // Wait for SVG to mount
    const timer = setTimeout(setupStateAnimations, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [currentState, animateTransitions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
      if (blinkAnimationRef.current) {
        blinkAnimationRef.current.pause();
      }
      if (jitterAnimationRef.current) {
        jitterAnimationRef.current.pause();
      }
      if (breathAnimationRef.current) {
        breathAnimationRef.current.pause();
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