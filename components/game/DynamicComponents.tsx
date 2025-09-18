'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingStates';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner size="medium" color="blue" />
  </div>
);

// Dynamically import heavy animation components
export const DynamicEndGameAnimations = dynamic(
  () => import('./EndGameAnimations').then(mod => mod.EndGameAnimations as any),
  {
    loading: LoadingFallback,
    ssr: false, // Animations don't need SSR
  }
);

// Dynamically import particle effects
export const DynamicParticleEffects = dynamic(
  () => import('./ParticleEffects').then(mod => mod.ParticleEffects as any),
  {
    loading: LoadingFallback,
    ssr: false,
  }
);

// Dynamically import screen effects
export const DynamicScreenEffects = dynamic(
  () => import('./ScreenEffects'),
  {
    loading: LoadingFallback,
    ssr: false,
  }
);

// Dynamically import settings menu (only loaded when needed)
export const DynamicSettingsMenu = dynamic(
  () => import('./SettingsMenu').then(mod => mod.SettingsMenu as any),
  {
    loading: LoadingFallback,
  }
);

// Dynamically import score display
export const DynamicScoreDisplay = dynamic(
  () => import('./ScoreDisplay'),
  {
    loading: LoadingFallback,
  }
);

// Preload function for critical components
export const preloadGameComponents = () => {
  // Preload components that will be needed soon
  import('./EndGameAnimations');
  import('./ParticleEffects');
  import('./ScreenEffects');
};

// Lazy load with retry for better reliability
export function createDynamicComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> } | ComponentType<P>>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
    retries?: number;
  }
) {
  const { loading = LoadingFallback, ssr = true, retries = 3 } = options || {};

  return dynamic<P>(
    async () => {
      let lastError: Error | null = null;
      
      for (let i = 0; i < retries; i++) {
        try {
          const module = await importFn();
          return 'default' in module ? module : { default: module };
        } catch (error) {
          lastError = error as Error;
          if (i < retries - 1) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }
      
      throw lastError;
    },
    {
      loading,
      ssr,
    }
  );
}

// Intersection Observer for lazy loading
export function useLazyComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  rootMargin = '100px'
) {
  const [Component, setComponent] = useState<ComponentType<P> | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isIntersecting) {
          setIsIntersecting(true);
          importFn().then(module => {
            setComponent(() => module.default);
          });
        }
      },
      { rootMargin }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [importFn, rootMargin, isIntersecting]);

  return { Component, ref };
}

import { useState, useRef, useEffect } from 'react';