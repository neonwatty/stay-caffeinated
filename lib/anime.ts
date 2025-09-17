/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

// Anime.js v4 wrapper for Next.js/TypeScript
let anime: any;

// Check if we're in a test environment or browser
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'test') {
  // Dynamic import for client-side and test environment
  const animeLib = require('animejs');
  // In v4, the main animation function is called 'animate'
  anime = animeLib.animate || animeLib.default || animeLib;
  // Add utility functions
  if (animeLib.stagger) anime.stagger = animeLib.stagger;
  if (animeLib.utils) {
    anime.random = animeLib.utils.random;
    anime.remove = animeLib.utils.remove;
  }
  if (animeLib.createTimeline || animeLib.timeline) {
    anime.timeline = animeLib.createTimeline || animeLib.timeline;
  }
}

export default anime;

// Re-export types
export type * from 'animejs';