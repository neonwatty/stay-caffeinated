/**
 * Power-up System for Stay Caffeinated
 * Manages protein bars, vitamins, and power naps with strategic benefits
 */

import type {
  PowerUp,
  PowerUpType,
  ActivePowerUp,
  PowerUpSystemConfig,
  PowerUpSystemCallbacks,
  PowerUpEffect
} from '@/types/powerups';

/**
 * Power-up definitions
 */
export const POWERUP_DEFINITIONS: Record<PowerUpType, PowerUp> = {
  proteinBar: {
    id: 'proteinBar',
    name: 'Protein Bar',
    description: 'Sustained energy with reduced crash',
    icon: '🍫',
    color: '#8b4513',
    duration: 30000, // 30 seconds
    cost: 0,
    cooldown: 45000, // 45 seconds
    effect: {
      type: 'duration',
      crashReduction: 0.5, // 50% crash reduction
      caffeineDepletionReduction: 0.2, // 20% slower caffeine depletion
    },
    soundEffect: 'powerup_protein',
  },
  vitamins: {
    id: 'vitamins',
    name: 'Vitamins',
    description: 'Instant health boost and improved productivity',
    icon: '💊',
    color: '#10b981',
    duration: 20000, // 20 seconds
    cost: 0,
    cooldown: 60000, // 60 seconds
    effect: {
      type: 'instant',
      healthBoost: 25,
      productivityMultiplier: 1.5, // 50% productivity boost
    },
    soundEffect: 'powerup_vitamins',
  },
  powerNap: {
    id: 'powerNap',
    name: 'Power Nap',
    description: 'Take a quick nap to restore energy',
    icon: '😴',
    color: '#6366f1',
    duration: 15000, // 15 second effect
    cost: 5000, // 5 second nap time
    cooldown: 90000, // 90 seconds
    effect: {
      type: 'instant',
      caffeineBoost: 30,
      healthBoost: 15,
      crashReduction: 0.3,
    },
    soundEffect: 'powerup_nap',
  },
};

/**
 * Power-up system manager
 */
export class PowerUpSystem {
  private activePowerUps: Map<PowerUpType, ActivePowerUp> = new Map();
  private cooldowns: Map<PowerUpType, number> = new Map();
  private config: PowerUpSystemConfig;
  private callbacks: PowerUpSystemCallbacks;
  private isPaused: boolean = false;

  constructor(
    config: Partial<PowerUpSystemConfig> = {},
    callbacks: PowerUpSystemCallbacks = {}
  ) {
    this.config = {
      enabled: true,
      maxActivePowerUps: 2,
      globalCooldownMultiplier: 1,
      ...config,
    };
    this.callbacks = callbacks;
  }

  /**
   * Update the power-up system
   */
  update(currentTime: number): void {
    if (this.isPaused || !this.config.enabled) return;

    // Check active power-ups
    this.activePowerUps.forEach((activePowerUp, type) => {
      if (currentTime >= activePowerUp.endTime) {
        this.deactivatePowerUp(type);
      }
    });

    // Update cooldowns
    this.cooldowns.forEach((cooldownEnd, type) => {
      if (currentTime >= cooldownEnd) {
        this.cooldowns.delete(type);
        const powerUp = POWERUP_DEFINITIONS[type];
        this.callbacks.onPowerUpReady?.(powerUp);
      }
    });
  }

  /**
   * Activate a power-up
   */
  activatePowerUp(type: PowerUpType, currentTime: number = Date.now()): boolean {
    if (!this.canActivatePowerUp(type)) {
      return false;
    }

    const powerUp = POWERUP_DEFINITIONS[type];

    // Check if we've reached max active power-ups
    if (this.activePowerUps.size >= this.config.maxActivePowerUps) {
      return false;
    }

    // Apply power nap cost (pause time)
    if (powerUp.cost > 0) {
      // The game should handle the pause for the cost duration
      // This is just tracking the effect duration
    }

    // Create active power-up
    const activePowerUp: ActivePowerUp = {
      powerUp,
      startTime: currentTime,
      endTime: currentTime + powerUp.duration,
      isActive: true,
    };

    this.activePowerUps.set(type, activePowerUp);
    this.setCooldown(type, currentTime);

    this.callbacks.onPowerUpActivated?.(powerUp);
    return true;
  }

  /**
   * Deactivate a power-up
   */
  private deactivatePowerUp(type: PowerUpType): void {
    const activePowerUp = this.activePowerUps.get(type);
    if (activePowerUp) {
      this.activePowerUps.delete(type);
      this.callbacks.onPowerUpExpired?.(activePowerUp.powerUp);
    }
  }

  /**
   * Set cooldown for a power-up
   */
  private setCooldown(type: PowerUpType, currentTime: number): void {
    const powerUp = POWERUP_DEFINITIONS[type];
    const cooldownDuration = powerUp.cooldown * this.config.globalCooldownMultiplier;
    this.cooldowns.set(type, currentTime + cooldownDuration);
  }

  /**
   * Check if a power-up can be activated
   */
  canActivatePowerUp(type: PowerUpType): boolean {
    if (!this.config.enabled || this.isPaused) return false;
    if (this.activePowerUps.has(type)) return false;
    if (this.cooldowns.has(type)) return false;
    return true;
  }

  /**
   * Get active power-ups
   */
  getActivePowerUps(): ActivePowerUp[] {
    return Array.from(this.activePowerUps.values());
  }

  /**
   * Get combined effect from all active power-ups
   */
  getCombinedEffect(): PowerUpEffect {
    const combined: PowerUpEffect = {
      type: 'duration',
      caffeineBoost: 0,
      healthBoost: 0,
      productivityMultiplier: 1,
      crashReduction: 0,
      caffeineDepletionReduction: 0,
    };

    this.activePowerUps.forEach(active => {
      const effect = active.powerUp.effect;

      if (effect.caffeineBoost) {
        combined.caffeineBoost! += effect.caffeineBoost;
      }
      if (effect.healthBoost) {
        combined.healthBoost! += effect.healthBoost;
      }
      if (effect.productivityMultiplier) {
        combined.productivityMultiplier! *= effect.productivityMultiplier;
      }
      if (effect.crashReduction) {
        combined.crashReduction = Math.max(
          combined.crashReduction!,
          effect.crashReduction
        );
      }
      if (effect.caffeineDepletionReduction) {
        combined.caffeineDepletionReduction = Math.max(
          combined.caffeineDepletionReduction!,
          effect.caffeineDepletionReduction
        );
      }
    });

    return combined;
  }

  /**
   * Get cooldown remaining for a power-up
   */
  getCooldownRemaining(type: PowerUpType, currentTime: number = Date.now()): number {
    const cooldownEnd = this.cooldowns.get(type);
    if (!cooldownEnd) return 0;
    return Math.max(0, cooldownEnd - currentTime);
  }

  /**
   * Check if a power-up is active
   */
  isPowerUpActive(type: PowerUpType): boolean {
    return this.activePowerUps.has(type);
  }

  /**
   * Pause the system
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume the system
   */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * Reset the system
   */
  reset(): void {
    this.activePowerUps.clear();
    this.cooldowns.clear();
    this.isPaused = false;
  }

  /**
   * Set configuration
   */
  setConfig(config: Partial<PowerUpSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Create a pre-configured power-up system
 */
export function createPowerUpSystem(
  config?: Partial<PowerUpSystemConfig>,
  callbacks?: PowerUpSystemCallbacks
): PowerUpSystem {
  return new PowerUpSystem(config, callbacks);
}