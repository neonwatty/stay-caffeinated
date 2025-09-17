/**
 * Animation-related types and interfaces
 */

export type AnimationType =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideIn'
  | 'slideOut'
  | 'bounce'
  | 'shake'
  | 'pulse'
  | 'spin'
  | 'caffeineRush'
  | 'crash'
  | 'victory'
  | 'gameOver';

export interface AnimationConfig {
  type: AnimationType;
  target?: string | HTMLElement | NodeList;
  duration?: number;
  delay?: number;
  loop?: boolean | number;
  autoplay?: boolean;
}

export interface ParticleEffect {
  type: 'steam' | 'bubbles' | 'sparkles' | 'explosion';
  origin: { x: number; y: number };
  particleCount: number;
  duration: number;
  spread: number;
  colors: string[];
}

export interface ScreenShake {
  intensity: 'light' | 'medium' | 'heavy';
  duration: number;
  frequency: number;
}

export interface TransitionEffect {
  name: string;
  from: string | number | { [key: string]: string | number };
  to: string | number | { [key: string]: string | number };
  duration: number;
  easing: string;
}

export interface AnimationQueue {
  animations: AnimationConfig[];
  sequential: boolean;
  onComplete?: () => void;
}