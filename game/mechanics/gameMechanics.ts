/**
 * Game Mechanics Integration
 * Combines all game systems: Events, Power-ups, and Enhanced Scoring
 */

import { EventSystem, type EventSystemState } from './eventSystem';
import { PowerUpSystem, type PowerUpSystemState } from './powerUpSystem';
import { ScoringSystem } from './scoringSystem';
import type { Difficulty } from '@/types';
import type { PowerUpSpawn } from '@/types/powerups';
import type { GameStateData } from '../core/gameStateManager';

export interface EnhancedGameState extends GameStateData {
  eventState: EventSystemState;
  powerUpState: PowerUpSystemState;
  comboMultiplier: number;
  achievements: string[];
}

export interface GameMechanicsConfig {
  enableEvents: boolean;
  enablePowerUps: boolean;
  eventFrequency: number; // 0-1, higher = more frequent
  powerUpFrequency: number; // 0-1, higher = more frequent
  difficulty: Difficulty;
}

export class GameMechanics {
  private eventSystem: EventSystem;
  private powerUpSystem: PowerUpSystem;
  private scoringSystem: ScoringSystem;
  private config: GameMechanicsConfig;

  constructor(config?: Partial<GameMechanicsConfig>) {
    this.eventSystem = new EventSystem();
    this.powerUpSystem = new PowerUpSystem();
    this.scoringSystem = new ScoringSystem();

    this.config = {
      enableEvents: true,
      enablePowerUps: true,
      eventFrequency: 0.5,
      powerUpFrequency: 0.5,
      difficulty: 'junior',
      ...config
    };
  }

  /**
   * Initialize enhanced game state
   */
  initializeState(): EnhancedGameState {
    const now = Date.now();
    return {
      // Base GameStateData fields
      state: 'playing',
      stats: {
        currentCaffeineLevel: 50,
        currentHealthLevel: 100,
        score: 0,
        drinksConsumed: 0,
        streak: 0,
        timeElapsed: 0,
        isInOptimalZone: false
      },
      config: {
        difficulty: this.config.difficulty,
        soundEnabled: true,
        particlesEnabled: true,
        screenShakeEnabled: true
      },
      startTime: now,
      lastUpdateTime: now,
      gameTime: 0,
      realTimeElapsed: 0,
      isPaused: false,

      // Enhanced mechanics
      eventState: {
        activeEvent: null,
        nextEventTime: 30000, // First event after 30 seconds
        eventHistory: [],
        totalEventsTriggered: 0
      },
      powerUpState: {
        activePowerUps: [],
        availablePowerUps: [],
        collectedCount: 0,
        lastSpawnTime: 0,
        powerUpHistory: []
      },
      comboMultiplier: 1,
      achievements: []
    };
  }

  /**
   * Update game state with all mechanics
   */
  update(
    state: EnhancedGameState,
    deltaTime: number,
    currentTime: number
  ): EnhancedGameState {
    let newState = { ...state };

    // Update events
    if (this.config.enableEvents) {
      newState = this.updateEvents(newState, currentTime);
    }

    // Update power-ups
    if (this.config.enablePowerUps) {
      newState = this.updatePowerUps(newState, currentTime, deltaTime);
    }

    // Update scoring with enhancements
    newState = this.updateScoring(newState, deltaTime);

    // Check achievements
    newState.achievements = this.checkAchievements(newState);

    return newState;
  }

  /**
   * Update event system
   */
  private updateEvents(state: EnhancedGameState, currentTime: number): EnhancedGameState {
    const { eventState } = state;
    const newEventState = { ...eventState };

    // Update active event
    if (newEventState.activeEvent) {
      const updatedEvent = this.eventSystem.updateEvent(
        newEventState.activeEvent,
        currentTime
      );

      if (!updatedEvent) {
        // Event ended
        const eventScore = this.eventSystem.calculateEventScore(
          newEventState.activeEvent.event,
          state.stats.currentHealthLevel > 0,
          state.stats.currentCaffeineLevel
        );

        state.stats.score += eventScore;
        newEventState.activeEvent = null;
        newEventState.nextEventTime = currentTime + 30000; // Next event in 30s
      } else {
        newEventState.activeEvent = updatedEvent;
      }
    }

    // Check for new event
    if (!newEventState.activeEvent &&
        this.eventSystem.shouldTriggerEvent(currentTime, newEventState.nextEventTime)) {
      const newEvent = this.eventSystem.selectRandomEvent(newEventState.eventHistory);

      if (newEvent) {
        newEventState.activeEvent = this.eventSystem.startEvent(newEvent, currentTime);
        newEventState.eventHistory.push(newEvent.id);
        newEventState.totalEventsTriggered++;

        if (newEventState.eventHistory.length > 10) {
          newEventState.eventHistory.shift(); // Keep history limited
        }
      }
    }

    return {
      ...state,
      eventState: newEventState
    };
  }

  /**
   * Update power-up system
   */
  private updatePowerUps(
    state: EnhancedGameState,
    currentTime: number,
    deltaTime: number
  ): EnhancedGameState {
    const { powerUpState } = state;
    const newPowerUpState = { ...powerUpState };

    // Update active power-ups
    newPowerUpState.activePowerUps = this.powerUpSystem.updateActivePowerUps(
      newPowerUpState.activePowerUps,
      currentTime
    );

    // Remove expired available power-ups
    newPowerUpState.availablePowerUps = newPowerUpState.availablePowerUps.filter(
      spawn => !spawn.collected && spawn.expiresAt > currentTime
    );

    // Spawn new power-ups
    if (this.powerUpSystem.shouldSpawnPowerUp(
      currentTime,
      newPowerUpState.lastSpawnTime,
      this.config.powerUpFrequency
    )) {
      const excludeTypes = newPowerUpState.activePowerUps.map(p => p.powerUp.id);
      const newPowerUp = this.powerUpSystem.selectRandomPowerUp(excludeTypes);

      if (newPowerUp && newPowerUpState.availablePowerUps.length < 3) {
        const spawn = this.powerUpSystem.spawnPowerUp(newPowerUp, currentTime);
        newPowerUpState.availablePowerUps.push(spawn);
        newPowerUpState.lastSpawnTime = currentTime;
      }
    }

    // Apply power-up effects
    const effects = this.powerUpSystem.applyPowerUpEffects(
      newPowerUpState.activePowerUps,
      this.getBaseCaffeineDrain(state),
      this.getBaseHealthDrain(state)
    );

    // Apply instant effects
    if (effects.instantCaffeine > 0) {
      state.stats.currentCaffeineLevel = Math.min(100, state.stats.currentCaffeineLevel + effects.instantCaffeine);
    }
    if (effects.instantHealth > 0) {
      state.stats.currentHealthLevel = Math.min(100, state.stats.currentHealthLevel + effects.instantHealth);
    }

    // Auto-balance caffeine if power-up is active
    if (effects.shouldAutoBalance) {
      const optimalTarget = 60; // Middle of optimal zone
      const difference = optimalTarget - state.stats.currentCaffeineLevel;
      const adjustmentRate = 0.5; // Smooth adjustment
      state.stats.currentCaffeineLevel += difference * adjustmentRate * (deltaTime / 1000);
    }

    return {
      ...state,
      powerUpState: newPowerUpState
    };
  }

  /**
   * Update scoring with all enhancements
   */
  private updateScoring(state: EnhancedGameState, deltaTime: number): EnhancedGameState {
    const isInOptimalZone = state.stats.currentCaffeineLevel >= 40 && state.stats.currentCaffeineLevel <= 70;

    // Calculate combo multiplier
    const comboMultiplier = this.scoringSystem.getComboMultiplier(state.stats.streak);

    // Get power-up multipliers
    const powerUpEffects = this.powerUpSystem.applyPowerUpEffects(
      state.powerUpState.activePowerUps,
      0, 0
    );

    // Calculate base score
    const baseScore = this.scoringSystem.calculateScore(
      deltaTime,
      isInOptimalZone,
      state.stats.streak,
      state.config.difficulty
    );

    // Apply all multipliers and bonuses
    const enhancedScore = this.scoringSystem.calculateEnhancedScore(
      baseScore,
      powerUpEffects.scoreMultiplier,
      0, // Event bonus handled separately
      comboMultiplier
    );

    // Check for milestones
    const milestones = this.scoringSystem.checkMilestones(
      state.stats.score + enhancedScore,
      state.stats.score
    );

    if (milestones.length > 0) {
      // Could trigger milestone notifications here
    }

    return {
      ...state,
      stats: {
        ...state.stats,
        score: state.stats.score + enhancedScore
      },
      comboMultiplier
    };
  }

  /**
   * Check and update achievements
   */
  private checkAchievements(state: EnhancedGameState): string[] {
    return this.scoringSystem.getAchievement({
      totalEventsCompleted: state.eventState.totalEventsTriggered,
      totalPowerUpsCollected: state.powerUpState.collectedCount,
      maxStreak: state.stats.streak,
      finalScore: state.stats.score
    });
  }

  /**
   * Get base caffeine drain rate
   */
  private getBaseCaffeineDrain(state: EnhancedGameState): number {
    const difficultyMultipliers = {
      intern: 0.8,
      junior: 1,
      senior: 1.3,
      founder: 1.6
    };

    return 2 * (difficultyMultipliers[state.config.difficulty] || 1);
  }

  /**
   * Get base health drain rate
   */
  private getBaseHealthDrain(state: EnhancedGameState): number {
    const difficultyMultipliers = {
      intern: 0.7,
      junior: 0.9,
      senior: 1.1,
      founder: 1.4
    };

    return 1 * (difficultyMultipliers[state.config.difficulty] || 1);
  }

  /**
   * Collect a power-up
   */
  collectPowerUp(
    state: EnhancedGameState,
    powerUpSpawn: PowerUpSpawn,
    currentTime: number
  ): EnhancedGameState {
    const newState = { ...state };

    // Mark as collected
    const spawnIndex = newState.powerUpState.availablePowerUps.findIndex(
      s => s === powerUpSpawn
    );

    if (spawnIndex !== -1) {
      newState.powerUpState.availablePowerUps[spawnIndex].collected = true;
      newState.powerUpState.collectedCount++;
      newState.powerUpState.powerUpHistory.push(powerUpSpawn.powerUp.id);

      // Activate the power-up
      if (this.powerUpSystem.canActivateMorePowerUps(newState.powerUpState.activePowerUps)) {
        const activePowerUp = this.powerUpSystem.activatePowerUp(
          powerUpSpawn.powerUp,
          currentTime
        );
        newState.powerUpState.activePowerUps.push(activePowerUp);
      }

      // Add collection score
      newState.stats.score += this.powerUpSystem.calculateCollectionScore(powerUpSpawn.powerUp);
    }

    return newState;
  }

  /**
   * Get current game status messages
   */
  getStatusMessages(state: EnhancedGameState, currentTime: number): string[] {
    const messages: string[] = [];

    // Event status
    if (state.eventState.activeEvent) {
      messages.push(this.eventSystem.getEventStatus(
        state.eventState.activeEvent,
        currentTime
      ));
    }

    // Power-up statuses
    state.powerUpState.activePowerUps.forEach(powerUp => {
      messages.push(this.powerUpSystem.getPowerUpStatus(powerUp));
    });

    // Combo status
    if (state.comboMultiplier > 1) {
      messages.push(`🔥 ${state.comboMultiplier}x Combo!`);
    }

    return messages;
  }

  /**
   * Get game configuration
   */
  getConfig(): GameMechanicsConfig {
    return { ...this.config };
  }

  /**
   * Update game configuration
   */
  updateConfig(config: Partial<GameMechanicsConfig>) {
    this.config = { ...this.config, ...config };
  }
}