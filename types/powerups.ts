/**
 * Power-up types and interfaces
 */

export type PowerUpType = 'proteinBar' | 'vitamins' | 'powerNap';

export interface PowerUp {
  id: PowerUpType;
  name: string;
  description: string;
  icon: string;
  duration: number; // Duration in ms
  cost: number; // Time cost in ms (for power nap)
  cooldown: number; // Cooldown period in ms
  effect: PowerUpEffect;
  color: string;
  soundEffect?: string;
}

export interface PowerUpEffect {
  type: 'instant' | 'duration';
  caffeineBoost?: number;
  healthBoost?: number;
  productivityMultiplier?: number;
  crashReduction?: number;
  caffeineDepletionReduction?: number;
}

export interface ActivePowerUp {
  powerUp: PowerUp;
  startTime: number;
  endTime: number;
  isActive: boolean;
}

export interface PowerUpSystemConfig {
  enabled: boolean;
  maxActivePowerUps: number;
  globalCooldownMultiplier: number;
}

export interface PowerUpSystemCallbacks {
  onPowerUpActivated?: (powerUp: PowerUp) => void;
  onPowerUpExpired?: (powerUp: PowerUp) => void;
  onPowerUpReady?: (powerUp: PowerUp) => void;
}