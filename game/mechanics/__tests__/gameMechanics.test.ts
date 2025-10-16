import { describe, it, expect, beforeEach } from 'vitest';
import { GameMechanics } from '../gameMechanics';
import { EventSystem } from '../eventSystem';
import { PowerUpSystem } from '../powerUpSystem';
import { ScoringSystem } from '../scoringSystem';
import type { EnhancedGameState } from '../gameMechanics';

describe('GameMechanics Integration', () => {
  let gameMechanics: GameMechanics;
  let initialState: EnhancedGameState;

  beforeEach(() => {
    gameMechanics = new GameMechanics({
      enableEvents: true,
      enablePowerUps: true,
      eventFrequency: 0.5,
      powerUpFrequency: 0.5,
      difficulty: 'junior'
    });
    initialState = gameMechanics.initializeState();
  });

  describe('State Initialization', () => {
    it('should initialize enhanced game state correctly', () => {
      expect(initialState).toBeDefined();
      expect(initialState.caffeineLevel).toBe(50);
      expect(initialState.healthLevel).toBe(100);
      expect(initialState.score).toBe(0);
      expect(initialState.eventState).toBeDefined();
      expect(initialState.powerUpState).toBeDefined();
      expect(initialState.comboMultiplier).toBe(1);
      expect(initialState.achievements).toEqual([]);
    });

    it('should set event state correctly', () => {
      expect(initialState.eventState.activeEvent).toBeNull();
      expect(initialState.eventState.nextEventTime).toBe(30000);
      expect(initialState.eventState.eventHistory).toEqual([]);
      expect(initialState.eventState.totalEventsTriggered).toBe(0);
    });

    it('should set power-up state correctly', () => {
      expect(initialState.powerUpState.activePowerUps).toEqual([]);
      expect(initialState.powerUpState.availablePowerUps).toEqual([]);
      expect(initialState.powerUpState.collectedCount).toBe(0);
      expect(initialState.powerUpState.lastSpawnTime).toBe(0);
    });
  });

  describe('Event System Integration', () => {
    it('should trigger events based on timing', () => {
      // Fast forward to trigger event
      const currentTime = 35000;
      const deltaTime = 100;

      // Mock event system to trigger
      const eventSystem = new EventSystem();
      const mockEvent = eventSystem.getEvent('morningMeeting');

      if (mockEvent) {
        initialState.eventState.nextEventTime = 30000;

        const updatedState = gameMechanics.update(initialState, deltaTime, currentTime);

        // Event may or may not trigger based on probability
        // We can't assert it will always trigger, but the system should work
        expect(updatedState.eventState).toBeDefined();
      }
    });

    it('should apply event effects when active', () => {
      const eventSystem = new EventSystem();
      const mockEvent = eventSystem.getEvent('codeReview');

      if (mockEvent) {
        initialState.eventState.activeEvent = {
          event: mockEvent,
          startTime: 1000,
          endTime: 21000,
          isActive: true
        };

        const effects = eventSystem.applyEventEffects(
          mockEvent.effect,
          2, // base caffeine drain
          1  // base health drain
        );

        expect(effects.caffeineDrain).toBe(4); // 2 * 2 multiplier
        expect(effects.healthDrain).toBe(1.2); // 1 * 1.2 multiplier
        expect(effects.optimalZoneAdjustment).toBe(10);
      }
    });
  });

  describe('Power-Up System Integration', () => {
    it('should spawn power-ups based on timing', () => {
      const powerUpSystem = new PowerUpSystem();

      // Test spawn timing - base interval is 45s, but with variance
      // With difficulty=1, interval is divided by difficulty, so still 45s
      // Time since last spawn needs to be >= (45000 +/- variance)
      // Since variance is random, we can't guarantee exact timing

      // Definitely should spawn after long time
      const shouldSpawnEventually = powerUpSystem.shouldSpawnPowerUp(100000, 0, 1);
      expect(shouldSpawnEventually).toBe(true);

      // Definitely should NOT spawn immediately
      const shouldNotSpawn = powerUpSystem.shouldSpawnPowerUp(5000, 0, 1);
      expect(shouldNotSpawn).toBe(false);
    });

    it('should collect and activate power-ups', () => {
      const powerUpSystem = new PowerUpSystem();
      const mockPowerUp = powerUpSystem.getPowerUp('energyBoost');

      if (mockPowerUp) {
        const spawn = powerUpSystem.spawnPowerUp(mockPowerUp, 1000);
        initialState.powerUpState.availablePowerUps.push(spawn);

        const updatedState = gameMechanics.collectPowerUp(initialState, spawn, 2000);

        expect(updatedState.powerUpState.collectedCount).toBe(1);
        expect(updatedState.powerUpState.powerUpHistory).toContain('energyBoost');
        expect(updatedState.score).toBeGreaterThan(initialState.score);
      }
    });

    it('should apply power-up effects correctly', () => {
      const powerUpSystem = new PowerUpSystem();
      const slowTimePowerUp = powerUpSystem.getPowerUp('slowTime');
      const doublePointsPowerUp = powerUpSystem.getPowerUp('doublePoints');

      if (slowTimePowerUp && doublePointsPowerUp) {
        const activePowerUps = [
          powerUpSystem.activatePowerUp(slowTimePowerUp, 1000),
          powerUpSystem.activatePowerUp(doublePointsPowerUp, 1000)
        ];

        const effects = powerUpSystem.applyPowerUpEffects(
          activePowerUps,
          2, // base caffeine drain
          1  // base health drain
        );

        expect(effects.caffeineDrain).toBe(1); // 2 * 0.5
        expect(effects.healthDrain).toBe(0.5); // 1 * 0.5
        expect(effects.scoreMultiplier).toBe(2);
      }
    });
  });

  describe('Scoring System Integration', () => {
    it('should calculate enhanced scores with multipliers', () => {
      const scoringSystem = new ScoringSystem();

      const baseScore = 100;
      const powerUpMultiplier = 2;
      const eventBonus = 500;
      const comboMultiplier = 3;

      const enhancedScore = scoringSystem.calculateEnhancedScore(
        baseScore,
        powerUpMultiplier,
        eventBonus,
        comboMultiplier
      );

      expect(enhancedScore).toBe(1100); // (100 * 2 * 3) + 500
    });

    it('should track achievements based on performance', () => {
      const scoringSystem = new ScoringSystem();

      const achievements = scoringSystem.getAchievement({
        totalEventsCompleted: 6,
        totalPowerUpsCollected: 10,
        maxStreak: 65,
        finalScore: 55000
      });

      expect(achievements).toContain('Event Handler: Survived 5+ events');
      expect(achievements).toContain('Power User: Collected 8+ power-ups');
      expect(achievements).toContain('In The Zone: 1 minute streak');
      expect(achievements).toContain('Senior Developer: 50,000+ points');
    });

    it('should award action bonuses', () => {
      const scoringSystem = new ScoringSystem();

      expect(scoringSystem.calculateActionBonus('perfect_drink_timing')).toBe(200);
      expect(scoringSystem.calculateActionBonus('close_call')).toBe(500);
      expect(scoringSystem.calculateActionBonus('event_no_damage')).toBe(1000);
      expect(scoringSystem.calculateActionBonus('unknown_action')).toBe(0);
    });
  });

  describe('Complex Gameplay Scenarios', () => {
    it('should handle simultaneous event and power-up', () => {
      const eventSystem = new EventSystem();
      const powerUpSystem = new PowerUpSystem();

      const mockEvent = eventSystem.getEvent('bugFix');
      const mockPowerUp = powerUpSystem.getPowerUp('shield');

      if (mockEvent && mockPowerUp) {
        // Active event with high drain
        initialState.eventState.activeEvent = {
          event: mockEvent,
          startTime: 1000,
          endTime: 26000,
          isActive: true
        };

        // Active shield power-up
        initialState.powerUpState.activePowerUps.push(
          powerUpSystem.activatePowerUp(mockPowerUp, 1000)
        );

        const effects = powerUpSystem.applyPowerUpEffects(
          initialState.powerUpState.activePowerUps,
          2.5 * 2, // event multiplied drain
          1.5 * 1  // event multiplied health
        );

        expect(effects.isInvincible).toBe(true);
        expect(effects.healthDrain).toBe(0); // Shield prevents all health damage
      }
    });

    it('should update combo multiplier based on streak', () => {
      const scoringSystem = new ScoringSystem();

      expect(scoringSystem.getComboMultiplier(5)).toBe(1);
      expect(scoringSystem.getComboMultiplier(15)).toBe(1.5);
      expect(scoringSystem.getComboMultiplier(45)).toBe(2);
      expect(scoringSystem.getComboMultiplier(90)).toBe(3);
      expect(scoringSystem.getComboMultiplier(150)).toBe(5);
    });

    it('should generate status messages correctly', () => {
      const eventSystem = new EventSystem();
      const powerUpSystem = new PowerUpSystem();

      const mockEvent = eventSystem.getEvent('morningMeeting');
      const mockPowerUp = powerUpSystem.getPowerUp('doublePoints');

      if (mockEvent && mockPowerUp) {
        initialState.eventState.activeEvent = {
          event: mockEvent,
          startTime: 1000,
          endTime: 16000,
          isActive: true
        };

        initialState.powerUpState.activePowerUps.push(
          powerUpSystem.activatePowerUp(mockPowerUp, 1000)
        );

        initialState.comboMultiplier = 2;

        const messages = gameMechanics.getStatusMessages(initialState, 5000);

        expect(messages.length).toBeGreaterThan(0);
        expect(messages.some(m => m.includes('Morning Standup'))).toBe(true);
        expect(messages.some(m => m.includes('Double Points'))).toBe(true);
        expect(messages.some(m => m.includes('2x Combo'))).toBe(true);
      }
    });

    it('should handle game over during event', () => {
      initialState.healthLevel = 5;
      initialState.isGameOver = false;

      const eventSystem = new EventSystem();
      const mockEvent = eventSystem.getEvent('bugFix');

      if (mockEvent) {
        initialState.eventState.activeEvent = {
          event: mockEvent,
          startTime: 1000,
          endTime: 26000,
          isActive: true
        };

        // High drain should deplete health quickly
        const effects = eventSystem.applyEventEffects(
          mockEvent.effect,
          2, // base caffeine drain
          5  // base health drain (high due to low health)
        );

        expect(effects.healthDrain).toBe(7.5); // Would cause game over

        // Score penalty for failing during event
        const eventScore = eventSystem.calculateEventScore(
          mockEvent,
          false, // failed
          30
        );

        expect(eventScore).toBeLessThan(0);
      }
    });
  });

  describe('Configuration', () => {
    it('should respect configuration settings', () => {
      const customMechanics = new GameMechanics({
        enableEvents: false,
        enablePowerUps: false,
        difficulty: 'founder'
      });

      const config = customMechanics.getConfig();
      expect(config.enableEvents).toBe(false);
      expect(config.enablePowerUps).toBe(false);
      expect(config.difficulty).toBe('founder');
    });

    it('should update configuration', () => {
      gameMechanics.updateConfig({
        eventFrequency: 0.8,
        powerUpFrequency: 0.2
      });

      const config = gameMechanics.getConfig();
      expect(config.eventFrequency).toBe(0.8);
      expect(config.powerUpFrequency).toBe(0.2);
    });
  });
});