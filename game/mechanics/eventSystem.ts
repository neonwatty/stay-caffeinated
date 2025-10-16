/**
 * Event System - Manages random events and challenges during gameplay
 */

import type { GameEvent, EventType, ActiveEvent, EventEffect } from '@/types/events';

export interface EventSystemState {
  activeEvent: ActiveEvent | null;
  nextEventTime: number;
  eventHistory: EventType[];
  totalEventsTriggered: number;
}

export class EventSystem {
  private events: Map<EventType, GameEvent>;
  private minTimeBetweenEvents = 30000; // 30 seconds minimum
  private maxTimeBetweenEvents = 90000; // 90 seconds maximum
  private eventProbability = 0.3; // 30% chance when eligible

  constructor() {
    this.events = new Map();
    this.initializeEvents();
  }

  private initializeEvents() {
    const eventDefinitions: GameEvent[] = [
      {
        id: 'morningMeeting',
        name: 'Morning Standup',
        description: 'Team meeting requires focus!',
        duration: 15000,
        effect: {
          caffeineMultiplier: 1.5,
          drinkRestriction: true,
          specialCondition: 'No drinks during meeting'
        },
        warningTime: 5000,
        icon: '👥'
      },
      {
        id: 'codeReview',
        name: 'Code Review',
        description: 'Intense code review session',
        duration: 20000,
        effect: {
          caffeineMultiplier: 2,
          healthMultiplier: 1.2,
          optimalZoneShift: 10,
          specialCondition: 'Optimal zone shifted higher'
        },
        warningTime: 3000,
        icon: '🔍'
      },
      {
        id: 'bugFix',
        name: 'Critical Bug',
        description: 'Production bug needs immediate fix!',
        duration: 25000,
        effect: {
          caffeineMultiplier: 2.5,
          healthMultiplier: 1.5,
          specialCondition: 'Extreme caffeine drain'
        },
        warningTime: 2000,
        icon: '🐛'
      },
      {
        id: 'lunchBreak',
        name: 'Lunch Break',
        description: 'Time to relax and recover',
        duration: 10000,
        effect: {
          caffeineMultiplier: 0.5,
          healthMultiplier: 0.8,
          specialCondition: 'Reduced depletion rates'
        },
        warningTime: 5000,
        icon: '🍕'
      }
    ];

    eventDefinitions.forEach(event => {
      this.events.set(event.id, event);
    });
  }

  /**
   * Check if an event should trigger
   */
  shouldTriggerEvent(currentTime: number, lastEventTime: number): boolean {
    const timeSinceLastEvent = currentTime - lastEventTime;

    if (timeSinceLastEvent < this.minTimeBetweenEvents) {
      return false;
    }

    if (timeSinceLastEvent > this.maxTimeBetweenEvents) {
      return true;
    }

    return Math.random() < this.eventProbability;
  }

  /**
   * Select a random event based on game state
   */
  selectRandomEvent(
    excludeTypes: EventType[] = [],
    timeOfDay?: number
  ): GameEvent | null {
    const availableEvents = Array.from(this.events.values()).filter(
      event => !excludeTypes.includes(event.id)
    );

    if (availableEvents.length === 0) {
      return null;
    }

    // Weight events based on time of day if provided
    if (timeOfDay !== undefined) {
      // Morning meetings more likely in the morning
      // Lunch breaks around midday
      // Bug fixes in the afternoon
      // This is a simplified version - could be more sophisticated
    }

    const randomIndex = Math.floor(Math.random() * availableEvents.length);
    return availableEvents[randomIndex];
  }

  /**
   * Start an event
   */
  startEvent(event: GameEvent, currentTime: number): ActiveEvent {
    return {
      event,
      startTime: currentTime,
      endTime: currentTime + event.duration,
      isActive: true
    };
  }

  /**
   * Update active event status
   */
  updateEvent(activeEvent: ActiveEvent, currentTime: number): ActiveEvent | null {
    if (currentTime >= activeEvent.endTime) {
      return null; // Event finished
    }

    return {
      ...activeEvent,
      isActive: currentTime >= activeEvent.startTime
    };
  }

  /**
   * Apply event effects to game state
   */
  applyEventEffects(
    effect: EventEffect,
    baseCaffeineDrain: number,
    baseHealthDrain: number
  ): {
    caffeineDrain: number;
    healthDrain: number;
    optimalZoneAdjustment: number;
    canConsumeDrink: boolean;
  } {
    return {
      caffeineDrain: baseCaffeineDrain * (effect.caffeineMultiplier || 1),
      healthDrain: baseHealthDrain * (effect.healthMultiplier || 1),
      optimalZoneAdjustment: effect.optimalZoneShift || 0,
      canConsumeDrink: !effect.drinkRestriction
    };
  }

  /**
   * Get event warning message
   */
  getEventWarning(event: GameEvent): string {
    return `⚠️ ${event.name} starting in ${Math.ceil(event.warningTime / 1000)} seconds!`;
  }

  /**
   * Get event status message
   */
  getEventStatus(activeEvent: ActiveEvent, currentTime: number): string {
    const remaining = Math.ceil((activeEvent.endTime - currentTime) / 1000);
    return `${activeEvent.event.icon} ${activeEvent.event.name}: ${remaining}s remaining`;
  }

  /**
   * Calculate score bonus/penalty for event completion
   */
  calculateEventScore(
    event: GameEvent,
    survivedEvent: boolean,
    averageCaffeineLevel: number
  ): number {
    let score = 0;

    if (survivedEvent) {
      // Base completion bonus
      score += 1000;

      // Difficulty bonus based on multipliers
      const difficulty = (event.effect.caffeineMultiplier || 1) +
                        (event.effect.healthMultiplier || 1);
      score += difficulty * 500;

      // Performance bonus if maintained good caffeine levels
      if (averageCaffeineLevel > 40 && averageCaffeineLevel < 80) {
        score += 500;
      }
    } else {
      // Penalty for failing during event
      score -= 500;
    }

    return score;
  }

  /**
   * Get all available events
   */
  getAllEvents(): GameEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * Get event by ID
   */
  getEvent(id: EventType): GameEvent | undefined {
    return this.events.get(id);
  }
}