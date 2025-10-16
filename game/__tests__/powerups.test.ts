/**
 * Tests for the Power-ups System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PowerUpSystem, createPowerUpSystem, POWERUP_DEFINITIONS } from '../powerups';
import type { PowerUp } from '@/types/powerups';

describe('PowerUpSystem', () => {
  let powerUpSystem: PowerUpSystem;
  let onPowerUpActivated: ReturnType<typeof vi.fn>;
  let onPowerUpExpired: ReturnType<typeof vi.fn>;
  let onPowerUpReady: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    onPowerUpActivated = vi.fn();
    onPowerUpExpired = vi.fn();
    onPowerUpReady = vi.fn();

    powerUpSystem = new PowerUpSystem(
      {
        enabled: true,
        maxActivePowerUps: 2,
        globalCooldownMultiplier: 1,
      },
      {
        onPowerUpActivated,
        onPowerUpExpired,
        onPowerUpReady,
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Power-up Activation', () => {
    it('should activate protein bar power-up', () => {
      const currentTime = Date.now();
      vi.setSystemTime(currentTime);

      const result = powerUpSystem.activatePowerUp('proteinBar', currentTime);

      expect(result).toBe(true);
      expect(onPowerUpActivated).toHaveBeenCalledWith(POWERUP_DEFINITIONS.proteinBar);
      expect(powerUpSystem.isPowerUpActive('proteinBar')).toBe(true);
    });

    it('should activate vitamins power-up with instant effect', () => {
      const currentTime = Date.now();
      vi.setSystemTime(currentTime);

      const result = powerUpSystem.activatePowerUp('vitamins', currentTime);

      expect(result).toBe(true);
      expect(onPowerUpActivated).toHaveBeenCalledWith(POWERUP_DEFINITIONS.vitamins);
      expect(powerUpSystem.isPowerUpActive('vitamins')).toBe(true);
    });

    it('should activate power nap with time cost', () => {
      const currentTime = Date.now();
      vi.setSystemTime(currentTime);

      const result = powerUpSystem.activatePowerUp('powerNap', currentTime);

      expect(result).toBe(true);
      expect(onPowerUpActivated).toHaveBeenCalledWith(POWERUP_DEFINITIONS.powerNap);
      expect(powerUpSystem.isPowerUpActive('powerNap')).toBe(true);
    });

    it('should not activate same power-up twice', () => {
      const currentTime = Date.now();
      powerUpSystem.activatePowerUp('proteinBar', currentTime);

      const result = powerUpSystem.activatePowerUp('proteinBar', currentTime);

      expect(result).toBe(false);
      expect(onPowerUpActivated).toHaveBeenCalledTimes(1);
    });

    it('should respect max active power-ups limit', () => {
      const currentTime = Date.now();

      powerUpSystem.activatePowerUp('proteinBar', currentTime);
      powerUpSystem.activatePowerUp('vitamins', currentTime);
      const result = powerUpSystem.activatePowerUp('powerNap', currentTime);

      expect(result).toBe(false);
      expect(powerUpSystem.getActivePowerUps()).toHaveLength(2);
    });

    it('should not activate when on cooldown', () => {
      const currentTime = Date.now();
      vi.setSystemTime(currentTime);

      powerUpSystem.activatePowerUp('proteinBar', currentTime);

      // Expire the power-up
      vi.advanceTimersByTime(30000);
      powerUpSystem.update(currentTime + 30000);

      // Try to reactivate immediately (still on cooldown)
      const result = powerUpSystem.activatePowerUp('proteinBar', currentTime + 30000);

      expect(result).toBe(false);
      expect(powerUpSystem.getCooldownRemaining('proteinBar', currentTime + 30000)).toBeGreaterThan(0);
    });
  });

  describe('Power-up Effects', () => {
    it('should combine effects from multiple power-ups', () => {
      const currentTime = Date.now();

      powerUpSystem.activatePowerUp('proteinBar', currentTime);
      powerUpSystem.activatePowerUp('vitamins', currentTime);

      const combined = powerUpSystem.getCombinedEffect();

      expect(combined.healthBoost).toBe(25); // From vitamins
      expect(combined.productivityMultiplier).toBe(1.5); // From vitamins
      expect(combined.crashReduction).toBe(0.5); // From protein bar
      expect(combined.caffeineDepletionReduction).toBe(0.2); // From protein bar
    });

    it('should return correct effect for power nap', () => {
      const currentTime = Date.now();

      powerUpSystem.activatePowerUp('powerNap', currentTime);

      const combined = powerUpSystem.getCombinedEffect();

      expect(combined.caffeineBoost).toBe(30);
      expect(combined.healthBoost).toBe(15);
      expect(combined.crashReduction).toBe(0.3);
    });
  });

  describe('Power-up Duration', () => {
    it('should expire power-up after duration', () => {
      const currentTime = Date.now();
      vi.setSystemTime(currentTime);

      powerUpSystem.activatePowerUp('proteinBar', currentTime);

      // Advance time past duration
      vi.advanceTimersByTime(31000);
      powerUpSystem.update(currentTime + 31000);

      expect(powerUpSystem.isPowerUpActive('proteinBar')).toBe(false);
      expect(onPowerUpExpired).toHaveBeenCalledWith(POWERUP_DEFINITIONS.proteinBar);
    });

    it('should track multiple power-up durations independently', () => {
      const currentTime = Date.now();
      vi.setSystemTime(currentTime);

      powerUpSystem.activatePowerUp('proteinBar', currentTime);

      // Activate vitamins after 5 seconds
      vi.advanceTimersByTime(5000);
      powerUpSystem.activatePowerUp('vitamins', currentTime + 5000);

      // Advance to expire vitamins but not protein bar
      vi.advanceTimersByTime(21000);
      powerUpSystem.update(currentTime + 26000);

      expect(powerUpSystem.isPowerUpActive('proteinBar')).toBe(true);
      expect(powerUpSystem.isPowerUpActive('vitamins')).toBe(false);
    });
  });

  describe('Cooldown Management', () => {
    it('should apply cooldown after activation', () => {
      const currentTime = Date.now();

      powerUpSystem.activatePowerUp('proteinBar', currentTime);

      const cooldown = powerUpSystem.getCooldownRemaining('proteinBar', currentTime);
      expect(cooldown).toBe(45000); // 45 seconds as defined
    });

    it('should trigger ready callback when cooldown expires', () => {
      const currentTime = Date.now();
      vi.setSystemTime(currentTime);

      powerUpSystem.activatePowerUp('proteinBar', currentTime);

      // Expire the power-up
      vi.advanceTimersByTime(30000);
      powerUpSystem.update(currentTime + 30000);

      // Advance past cooldown
      vi.advanceTimersByTime(46000);
      powerUpSystem.update(currentTime + 76000);

      expect(onPowerUpReady).toHaveBeenCalledWith(POWERUP_DEFINITIONS.proteinBar);
    });

    it('should apply global cooldown multiplier', () => {
      powerUpSystem.setConfig({ globalCooldownMultiplier: 0.5 });

      const currentTime = Date.now();
      powerUpSystem.activatePowerUp('proteinBar', currentTime);

      const cooldown = powerUpSystem.getCooldownRemaining('proteinBar', currentTime);
      expect(cooldown).toBe(22500); // 45000 * 0.5
    });
  });

  describe('Availability Checks', () => {
    it('should check if power-up can be activated', () => {
      const currentTime = Date.now();

      expect(powerUpSystem.canActivatePowerUp('proteinBar')).toBe(true);

      powerUpSystem.activatePowerUp('proteinBar', currentTime);

      expect(powerUpSystem.canActivatePowerUp('proteinBar')).toBe(false);
    });

    it('should not allow activation when disabled', () => {
      powerUpSystem.setConfig({ enabled: false });

      expect(powerUpSystem.canActivatePowerUp('proteinBar')).toBe(false);
    });

    it('should not allow activation when paused', () => {
      powerUpSystem.pause();

      expect(powerUpSystem.canActivatePowerUp('proteinBar')).toBe(false);
    });
  });

  describe('Pause and Resume', () => {
    it('should pause power-up system', () => {
      const currentTime = Date.now();
      vi.setSystemTime(currentTime);

      powerUpSystem.activatePowerUp('proteinBar', currentTime);
      powerUpSystem.pause();

      vi.advanceTimersByTime(40000);
      powerUpSystem.update(currentTime + 40000);

      // Should still be active because system is paused
      expect(powerUpSystem.isPowerUpActive('proteinBar')).toBe(true);
    });

    it('should resume power-up system', () => {
      const currentTime = Date.now();
      vi.setSystemTime(currentTime);

      powerUpSystem.activatePowerUp('proteinBar', currentTime);
      powerUpSystem.pause();
      powerUpSystem.resume();

      vi.advanceTimersByTime(31000);
      powerUpSystem.update(currentTime + 31000);

      expect(powerUpSystem.isPowerUpActive('proteinBar')).toBe(false);
    });
  });

  describe('Reset', () => {
    it('should reset all power-ups and cooldowns', () => {
      const currentTime = Date.now();

      powerUpSystem.activatePowerUp('proteinBar', currentTime);
      powerUpSystem.activatePowerUp('vitamins', currentTime);

      powerUpSystem.reset();

      expect(powerUpSystem.getActivePowerUps()).toHaveLength(0);
      expect(powerUpSystem.canActivatePowerUp('proteinBar')).toBe(true);
      expect(powerUpSystem.canActivatePowerUp('vitamins')).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const currentTime = Date.now();

      powerUpSystem.setConfig({ maxActivePowerUps: 1 });

      powerUpSystem.activatePowerUp('proteinBar', currentTime);
      const result = powerUpSystem.activatePowerUp('vitamins', currentTime);

      expect(result).toBe(false);
      expect(powerUpSystem.getActivePowerUps()).toHaveLength(1);
    });
  });

  describe('Factory Function', () => {
    it('should create power-up system with factory function', () => {
      const system = createPowerUpSystem(
        { enabled: true },
        { onPowerUpActivated: vi.fn() }
      );

      expect(system).toBeInstanceOf(PowerUpSystem);
      expect(system.canActivatePowerUp('proteinBar')).toBe(true);
    });
  });
});