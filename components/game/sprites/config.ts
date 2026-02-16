import type { CharacterState } from '../svg/CharacterStates';

export interface SpriteSheetConfig {
  /** Path to the sprite sheet image (relative to public/) */
  path: string;
  /** Number of frames in the strip */
  frameCount: number;
  /** Width of each individual frame in pixels */
  frameWidth: number;
  /** Height of each individual frame in pixels */
  frameHeight: number;
  /** Animation speed in frames per second */
  fps: number;
  /** Frame layout: horizontal strip (default) or vertical strip */
  layout?: 'horizontal' | 'vertical';
}

export type SpriteConfig = Record<CharacterState, SpriteSheetConfig>;

/**
 * Default sprite sheet configuration.
 *
 * Drop your sprite sheet PNGs into /public/sprites/ with these names:
 *   - under.png    (under-caffeinated: drowsy, slow animation)
 *   - optimal.png  (optimal: alert, medium animation)
 *   - over.png     (over-caffeinated: jittery, fast animation)
 *
 * Each PNG should be a horizontal strip of equally-sized frames.
 * Update frameCount/frameWidth/frameHeight below to match your sheets.
 */
export const DEFAULT_SPRITE_CONFIG: SpriteConfig = {
  under: {
    path: '/sprites/under.png',
    frameCount: 4,
    frameWidth: 64,
    frameHeight: 64,
    fps: 4,
    layout: 'horizontal',
  },
  optimal: {
    path: '/sprites/optimal.png',
    frameCount: 6,
    frameWidth: 64,
    frameHeight: 64,
    fps: 8,
    layout: 'horizontal',
  },
  over: {
    path: '/sprites/over.png',
    frameCount: 8,
    frameWidth: 64,
    frameHeight: 64,
    fps: 12,
    layout: 'horizontal',
  },
};
