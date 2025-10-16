/**
 * Power-up types and interfaces
 */

export type PowerUpType = 'proteinBar' | 'vitamins' | 'powerNap' | 'energyBoost' | 'healthPack' | 'slowTime' | 'doublePoints' | 'shield' | 'autoBalance';

export type PowerUpRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface PowerUp {
  id: PowerUpType;
  name: string;
  description: string;
  icon: string;
  duration?: number; // Duration in ms (optional for instant effects)
  cost?: number; // Time cost in ms (for power nap)
  cooldown?: number; // Cooldown period in ms
  effect: PowerUpEffect;
  color?: string;
  soundEffect?: string;
  rarity: PowerUpRarity;
}

export interface PowerUpEffect {
  type: 'instant' | 'duration';
  caffeineBoost?: number;
  healthBoost?: number;
  productivityMultiplier?: number;
  crashReduction?: number;
  caffeineDepletionReduction?: number;
  depletionRateModifier?: number;
  scoreMultiplier?: number;
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

export interface PowerUpSpawn {
  powerUp: PowerUp;
  x: number;
  y: number;
  spawnTime: number;
  expiresAt: number;
  collected: boolean;
}