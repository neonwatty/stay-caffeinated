import { useEffect, useRef, useCallback } from 'react';
import anime from '@/lib/anime';

interface AnimationOptions extends Omit<anime.AnimeParams, 'targets'> {
  autoplay?: boolean;
}

/**
 * Custom hook for managing Anime.js animations with React
 * Handles cleanup automatically and provides control methods
 */
export function useAnimation<T extends HTMLElement>(
  options: AnimationOptions = {}
) {
  const targetRef = useRef<T>(null);
  const animationRef = useRef<{ pause: () => void; play?: () => void; restart?: () => void; reverse?: () => void; seek?: (time: number) => void } | null>(null);

  const play = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.play?.();
    }
  }, []);

  const pause = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.pause();
    }
  }, []);

  const restart = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.restart?.();
    }
  }, []);

  const reverse = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.reverse?.();
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (animationRef.current) {
      animationRef.current.seek?.(time);
    }
  }, []);

  useEffect(() => {
    if (!targetRef.current) return;

    const { autoplay = true, ...animeOptions } = options;

    animationRef.current = anime(targetRef.current, {
      autoplay,
      ...animeOptions,
    });

    // Cleanup
    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
        anime.remove(targetRef.current);
      }
    };
  }, [options]);

  return {
    ref: targetRef,
    animation: animationRef.current,
    play,
    pause,
    restart,
    reverse,
    seek,
  };
}

/**
 * Hook for creating timeline animations
 */
export function useTimeline(options: anime.AnimeAnimParams = {}) {
  const timelineRef = useRef<anime.AnimeTimelineInstance | null>(null);

  const play = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.play();
    }
  }, []);

  const pause = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.pause();
    }
  }, []);

  const restart = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.restart();
    }
  }, []);

  const add = useCallback((params: anime.AnimeParams, offset?: string | number) => {
    if (timelineRef.current) {
      return timelineRef.current.add(params, offset);
    }
    return null;
  }, []);

  useEffect(() => {
    timelineRef.current = anime.timeline({
      autoplay: false,
      ...options,
    });

    return () => {
      if (timelineRef.current) {
        timelineRef.current.pause();
      }
    };
  }, []);

  return {
    timeline: timelineRef.current,
    play,
    pause,
    restart,
    add,
  };
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation<T extends HTMLElement>(
  options: AnimationOptions = {},
  scrollOptions: {
    trigger?: number; // Percentage of viewport (0-1)
    once?: boolean;
  } = {}
) {
  const targetRef = useRef<T>(null);
  const animationRef = useRef<{ pause: () => void; play?: () => void; restart?: () => void; reverse?: () => void; seek?: (time: number) => void } | null>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!targetRef.current) return;

    const { trigger = 0.8, once = true } = scrollOptions;

    const handleScroll = () => {
      if (!targetRef.current) return;
      if (once && hasTriggered.current) return;

      const rect = targetRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const triggerPoint = windowHeight * trigger;

      if (rect.top <= triggerPoint) {
        if (!animationRef.current) {
          animationRef.current = anime(targetRef.current, {
            ...options,
          });
        } else {
          animationRef.current.play?.();
        }
        hasTriggered.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationRef.current) {
        anime.remove(targetRef.current);
      }
    };
  }, [options, scrollOptions]);

  return {
    ref: targetRef,
    animation: animationRef.current,
  };
}