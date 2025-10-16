/**
 * Power-up System - Manages power-ups, their effects, and spawning
 */

import type { PowerUp, PowerUpType, ActivePowerUp, PowerUpSpawn } from '@/types/powerups';

export interface PowerUpSystemState {
  activePowerUps: ActivePowerUp[];
  availablePowerUps: PowerUpSpawn[];
  collectedCount: number;
  lastSpawnTime: number;
  powerUpHistory: PowerUpType[];
}

export class PowerUpSystem {
  private powerUps: Map<PowerUpType, PowerUp>;
  private spawnInterval = 45000; // Base spawn interval: 45 seconds
  private spawnVariance = 15000; // ±15 seconds variance
  private maxActivePowerUps = 3;
  private powerUpLifetime = 20000; // Power-ups disappear after 20 seconds if not collected

  constructor() {
    this.powerUps = new Map();
    this.initializePowerUps();
  }

  private initializePowerUps() {
    const powerUpDefinitions: PowerUp[] = [
      {
        id: 'energyBoost',
        name: 'Energy Boost',
        description: 'Instant +30 caffeine',
        icon: '⚡',
        rarity: 'common',
        effect: {
          type: 'instant',
          caffeineBoost: 30,
          special: 'Instant caffeine boost without crash'
        }
      },
      {
        id: 'healthPack',
        name: 'Health Pack',
        description: 'Restore 25 health',
        icon: '❤️',
        rarity: 'common',
        effect: {
          type: 'instant',
          healthBoost: 25,
          special: 'Instant health restoration'
        }
      },
      {
        id: 'slowTime',
        name: 'Time Dilation',
        description: 'Slow depletion rates by 50% for 30 seconds',
        icon: '⏰',
        duration: 30000,
        rarity: 'rare',
        effect: {
          type: 'duration',
          depletionRateModifier: 0.5,
          special: 'Slows caffeine and health depletion'
        }
      },
      {
        id: 'doublePoints',
        name: 'Double Points',
        description: '2x score multiplier for 20 seconds',
        icon: '💎',
        duration: 20000,
        rarity: 'rare',
        effect: {
          type: 'duration',
          scoreMultiplier: 2,
          special: 'Doubles all points earned'
        }
      },
      {
        id: 'shield',
        name: 'Invincibility Shield',
        description: 'No health loss for 15 seconds',
        icon: '🛡️',
        duration: 15000,
        rarity: 'epic',
        effect: {
          type: 'duration',
          immunityToDamage: true,
          special: 'Complete immunity to health damage'
        }
      },
      {
        id: 'autoBalance',
        name: 'Perfect Balance',
        description: 'Auto-balance caffeine in optimal zone for 25 seconds',
        icon: '⚖️',
        duration: 25000,
        rarity: 'legendary',
        effect: {
          type: 'duration',
          autoBalanceCaffeine: true,
          special: 'Automatically maintains optimal caffeine level'
        },
        cooldown: 120000 // 2 minute cooldown
      }
    ];

    powerUpDefinitions.forEach(powerUp => {
      this.powerUps.set(powerUp.id, powerUp);
    });
  }

  /**
   * Check if a power-up should spawn
   */
  shouldSpawnPowerUp(currentTime: number, lastSpawnTime: number, difficulty: number = 1): boolean {
    const adjustedInterval = this.spawnInterval / difficulty; // Spawn more frequently at higher difficulties
    const timeSinceLastSpawn = currentTime - lastSpawnTime;
    const variance = (Math.random() - 0.5) * this.spawnVariance;

    return timeSinceLastSpawn >= (adjustedInterval + variance);
  }

  /**
   * Select a random power-up based on rarity weights
   */
  selectRandomPowerUp(excludeTypes: PowerUpType[] = []): PowerUp | null {
    const availablePowerUps = Array.from(this.powerUps.values()).filter(
      powerUp => !excludeTypes.includes(powerUp.id)
    );

    if (availablePowerUps.length === 0) {
      return null;
    }

    // Rarity weights
    const rarityWeights = {
      common: 50,
      rare: 30,
      epic: 15,
      legendary: 5
    };

    // Calculate total weight
    const totalWeight = availablePowerUps.reduce(
      (sum, powerUp) => sum + rarityWeights[powerUp.rarity],
      0
    );

    // Random selection based on weights
    let random = Math.random() * totalWeight;
    for (const powerUp of availablePowerUps) {
      random -= rarityWeights[powerUp.rarity];
      if (random <= 0) {
        return powerUp;
      }
    }

    // Fallback (shouldn't reach here)
    return availablePowerUps[0];
  }

  /**
   * Spawn a power-up at a random position
   */
  spawnPowerUp(powerUp: PowerUp, currentTime: number, gameArea?: { width: number; height: number }): PowerUpSpawn {
    const area = gameArea || { width: 800, height: 600 };

    return {
      powerUp,
      x: Math.random() * (area.width - 100) + 50, // Keep away from edges
      y: Math.random() * (area.height - 100) + 50,
      spawnTime: currentTime,
      expiresAt: currentTime + this.powerUpLifetime,
      collected: false
    };
  }

  /**
   * Activate a power-up
   */
  activatePowerUp(powerUp: PowerUp, currentTime: number): ActivePowerUp {
    return {
      powerUp,
      startTime: currentTime,
      endTime: powerUp.duration ? currentTime + powerUp.duration : undefined,
      remaining: powerUp.duration,
      isActive: true
    };
  }

  /**
   * Update active power-ups
   */
  updateActivePowerUps(activePowerUps: ActivePowerUp[], currentTime: number): ActivePowerUp[] {
    const updated: ActivePowerUp[] = [];

    for (const activePowerUp of activePowerUps) {
      if (activePowerUp.endTime && currentTime >= activePowerUp.endTime) {
        continue; // Power-up expired
      }

      updated.push({
        ...activePowerUp,
        remaining: activePowerUp.endTime ? activePowerUp.endTime - currentTime : undefined
      });
    }

    return updated;
  }

  /**
   * Apply power-up effects to game state
   */
  applyPowerUpEffects(
    activePowerUps: ActivePowerUp[],
    baseCaffeineDrain: number,
    baseHealthDrain: number
  ): {
    caffeineDrain: number;
    healthDrain: number;
    scoreMultiplier: number;
    instantCaffeine: number;
    instantHealth: number;
    isInvincible: boolean;
    shouldAutoBalance: boolean;
  } {
    let caffeineDrain = baseCaffeineDrain;
    let healthDrain = baseHealthDrain;
    let scoreMultiplier = 1;
    let instantCaffeine = 0;
    let instantHealth = 0;
    let isInvincible = false;
    let shouldAutoBalance = false;

    activePowerUps.forEach(activePowerUp => {
      const effect = activePowerUp.powerUp.effect;

      // Apply instant effects (should only happen once)
      if (effect.type === 'instant') {
        instantCaffeine += effect.caffeineBoost || 0;
        instantHealth += effect.healthBoost || 0;
      }

      // Apply duration effects
      if (effect.type === 'duration' && activePowerUp.isActive) {
        if (effect.depletionRateModifier !== undefined) {
          caffeineDrain *= effect.depletionRateModifier;
          healthDrain *= effect.depletionRateModifier;
        }

        if (effect.scoreMultiplier !== undefined) {
          scoreMultiplier *= effect.scoreMultiplier;
        }

        if (effect.immunityToDamage) {
          isInvincible = true;
          healthDrain = 0;
        }

        if (effect.autoBalanceCaffeine) {
          shouldAutoBalance = true;
        }
      }
    });

    return {
      caffeineDrain,
      healthDrain: isInvincible ? 0 : healthDrain,
      scoreMultiplier,
      instantCaffeine,
      instantHealth,
      isInvincible,
      shouldAutoBalance
    };
  }

  /**
   * Check collision between player and power-up
   */
  checkPowerUpCollision(
    playerX: number,
    playerY: number,
    powerUpSpawn: PowerUpSpawn,
    collisionRadius: number = 30
  ): boolean {
    const distance = Math.sqrt(
      Math.pow(playerX - powerUpSpawn.x, 2) +
      Math.pow(playerY - powerUpSpawn.y, 2)
    );

    return distance <= collisionRadius;
  }

  /**
   * Get power-up status message
   */
  getPowerUpStatus(activePowerUp: ActivePowerUp): string {
    if (!activePowerUp.remaining) {
      return `${activePowerUp.powerUp.icon} ${activePowerUp.powerUp.name} active`;
    }

    const secondsRemaining = Math.ceil(activePowerUp.remaining / 1000);
    return `${activePowerUp.powerUp.icon} ${activePowerUp.powerUp.name}: ${secondsRemaining}s`;
  }

  /**
   * Calculate power-up collection score
   */
  calculateCollectionScore(powerUp: PowerUp): number {
    const rarityScores = {
      common: 100,
      rare: 250,
      epic: 500,
      legendary: 1000
    };

    return rarityScores[powerUp.rarity] || 100;
  }

  /**
   * Get all available power-ups
   */
  getAllPowerUps(): PowerUp[] {
    return Array.from(this.powerUps.values());
  }

  /**
   * Get power-up by ID
   */
  getPowerUp(id: PowerUpType): PowerUp | undefined {
    return this.powerUps.get(id);
  }

  /**
   * Check if can activate more power-ups
   */
  canActivateMorePowerUps(activePowerUps: ActivePowerUp[]): boolean {
    return activePowerUps.length < this.maxActivePowerUps;
  }
}