/**
 * Power-up types and interfaces
 */

export type PowerUpType =
  | 'energyBoost'
  | 'healthPack'
  | 'slowTime'
  | 'doublePoints'
  | 'shield'
  | 'autoBalance';

export interface PowerUp {
  id: PowerUpType;
  name: string;
  description: string;
  icon: string;
  duration?: number; // Duration in ms, undefined for instant effects
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: PowerUpEffect;
  cooldown?: number; // Time before it can appear again
}

export interface PowerUpEffect {
  type: 'instant' | 'duration' | 'passive';
  caffeineBoost?: number;
  healthBoost?: number;
  scoreMultiplier?: number;
  depletionRateModifier?: number;
  immunityToDamage?: boolean;
  autoBalanceCaffeine?: boolean;
  special?: string;
}

export interface ActivePowerUp {
  powerUp: PowerUp;
  startTime: number;
  endTime?: number;
  remaining?: number;
  isActive: boolean;
}

export interface PowerUpSpawn {
  powerUp: PowerUp;
  x: number;
  y: number;
  spawnTime: number;
  expiresAt: number;
  collected: boolean;
}