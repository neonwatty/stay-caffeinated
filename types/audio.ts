/**
 * Audio and sound effect types
 */

export type SoundCategory = 'music' | 'sfx' | 'ui' | 'ambient';

export type MusicTrack = 'menu' | 'gameplay' | 'intense' | 'victory' | 'defeat';

export type SoundEffect =
  | 'drink_tea'
  | 'drink_coffee'
  | 'drink_energy'
  | 'drink_espresso'
  | 'drink_water'
  | 'caffeine_low'
  | 'caffeine_high'
  | 'health_warning'
  | 'crash'
  | 'explosion'
  | 'achievement'
  | 'button_click'
  | 'button_hover'
  | 'score_increase'
  | 'streak_bonus'
  | 'event_warning'
  | 'event_start'
  | 'event_end'
  | 'pause'
  | 'resume'
  | 'countdown';

export interface AudioConfig {
  masterVolume: number; // 0-1
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1
  uiVolume: number; // 0-1
  ambientVolume: number; // 0-1
  muted: boolean;
  spatialAudio: boolean;
}

export interface SoundInstance {
  id: string;
  source: string;
  category: SoundCategory;
  volume: number;
  loop: boolean;
  playing: boolean;
  position?: { x: number; y: number };
  fadeIn?: number;
  fadeOut?: number;
}

export interface MusicState {
  currentTrack?: MusicTrack;
  nextTrack?: MusicTrack;
  isTransitioning: boolean;
  crossfadeDuration: number;
  adaptive: boolean; // Changes based on game state
}

export interface AudioQueue {
  sounds: SoundEffect[];
  priority: 'low' | 'normal' | 'high';
  delay: number;
}