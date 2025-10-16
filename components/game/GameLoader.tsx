'use client';

import { useEffect, useState, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingStates';
import { preloadGameComponents } from './DynamicComponents';
import { usePerformanceMark } from '@/app/web-vitals';

/**
 * Optimized game loader with preloading and performance tracking
 */
export function GameLoader({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  usePerformanceMark('game-load');

  useEffect(() => {
    const loadAssets = async () => {
      try {
        // Update progress
        setLoadingProgress(10);

        // Preload critical game components
        preloadGameComponents();
        setLoadingProgress(30);

        // Preload game assets
        await preloadGameAssets();
        setLoadingProgress(60);

        // Initialize game systems
        await initializeGameSystems();
        setLoadingProgress(90);

        // Small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 100));
        setLoadingProgress(100);
        
        setIsReady(true);
      } catch (error) {
        console.error('Failed to load game:', error);
        setIsReady(true); // Still show game but with error state
      }
    };

    loadAssets();
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-8">Stay Caffeinated</h1>
          <LoadingSpinner size="large" color="blue" />
          <div className="mt-4">
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-gray-400 mt-2 text-sm">Loading game assets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner size="large" color="blue" />}>
      {children}
    </Suspense>
  );
}

/**
 * Preload game assets for better performance
 */
async function preloadGameAssets() {
  const assetPromises = [];

  // Preload critical images
  const criticalImages = [
    '/images/coffee-cup.svg',
    '/images/character.svg',
    // Add more critical images
  ];

  for (const src of criticalImages) {
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });
    assetPromises.push(promise);
  }

  // Preload fonts if needed
  if ('fonts' in document) {
    assetPromises.push(
      (document as unknown as { fonts: { load: (font: string) => Promise<void> } }).fonts.load('1rem Geist'),
      (document as unknown as { fonts: { load: (font: string) => Promise<void> } }).fonts.load('1rem "Geist Mono"')
    );
  }

  await Promise.allSettled(assetPromises);
}

/**
 * Initialize game systems
 */
async function initializeGameSystems() {
  // Initialize audio context (if needed)
  if (typeof window !== 'undefined' && 'AudioContext' in window) {
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      const audioContext = new AudioContext();
      // Store in global for later use
      (window as unknown as { __audioContext: AudioContext }).__audioContext = audioContext;
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  // Warm up animation engine
  if (typeof window !== 'undefined') {
    requestAnimationFrame(() => {
      // Trigger a dummy animation frame to warm up the engine
    });
  }

  // Initialize local storage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      // Check if localStorage is available
      localStorage.setItem('_test', '1');
      localStorage.removeItem('_test');
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }
}

/**
 * Resource hints component for better loading
 */
export function ResourceHints() {
  return (
    <>
      {/* DNS Prefetch for external resources */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      
      {/* Preconnect for faster connection */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Prefetch critical resources */}
      <link rel="prefetch" href="/api/game-data" />
      
      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="/fonts/geist.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </>
  );
}