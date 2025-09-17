/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

// Anime.js v4 wrapper for Next.js/TypeScript
let anime: any;

if (typeof window !== 'undefined') {
  // Dynamic import for client-side only
  anime = require('animejs').default || require('animejs');
}

export default anime;

// Re-export types
export type * from 'animejs';