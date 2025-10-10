/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

// Anime.js v4 wrapper for Next.js/TypeScript
import type { animate as AnimateType } from 'animejs';

let animeModule: any = null;
let isLoaded = false;

// Create a proxy that will load anime.js on first use
const animeProxy: any = new Proxy({}, {
  get(target, prop) {
    if (!isLoaded && typeof window !== 'undefined') {
      // Load anime.js synchronously when first accessed
      animeModule = require('animejs');
      isLoaded = true;
    }

    if (!animeModule) {
      // Return a no-op function for SSR
      return () => ({ pause: () => {}, play: () => {}, restart: () => {} });
    }

    // Map the property access
    if (prop === 'apply' || prop === 'call' || prop === 'bind') {
      // For function calls - use animate as the default
      return animeModule.animate[prop];
    }

    switch(prop) {
      case 'timeline':
        return animeModule.createTimeline;
      case 'stagger':
        return animeModule.stagger;
      case 'random':
        return animeModule.utils?.random || ((min: number, max: number) => Math.random() * (max - min) + min);
      case 'remove':
        return animeModule.utils?.remove || (() => {});
      default:
        // Default to calling animate for direct function calls
        return animeModule.animate;
    }
  },
  apply(target, thisArg, args) {
    if (!isLoaded && typeof window !== 'undefined') {
      animeModule = require('animejs');
      isLoaded = true;
    }

    if (!animeModule) {
      // Return a mock animation instance for SSR
      return { pause: () => {}, play: () => {}, restart: () => {} };
    }

    // Call animate function directly
    return animeModule.animate(...args);
  }
});

const anime = animeProxy as typeof AnimateType & {
  timeline: (params?: any) => any;
  stagger: (val: number | string | any[], params?: any) => any;
  random: (min: number, max: number) => number;
  remove: (targets: any) => void;
};

export default anime;

// Re-export types
export type * from 'animejs';