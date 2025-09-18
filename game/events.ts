/**
 * Events System - Manages random game events like meetings and code reviews
 */

import type { GameEvent, EventType, ActiveEvent, EventEffect } from '@/types';

/**
 * Event definitions with unique mechanics and visual indicators
 */
const GAME_EVENTS: Record<EventType, GameEvent> = {
  morningMeeting: {
    id: 'morningMeeting',
    name: 'Morning Stand-up',
    description: 'Daily sync meeting - caffeine depletes faster!',
    duration: 15000, // 15 seconds
    warningTime: 5000, // 5 second warning
    icon: '👥',
    effect: {
      caffeineMultiplier: 2.0, // Double caffeine depletion
      drinkRestriction: true, // Can't drink during meetings
      specialCondition: 'No drinks allowed during meeting'
    }
  },
  codeReview: {
    id: 'codeReview',
    name: 'Code Review',
    description: 'Intense focus required - optimal zone narrows!',
    duration: 20000, // 20 seconds
    warningTime: 7000, // 7 second warning
    icon: '👀',
    effect: {
      optimalZoneShift: -10, // Narrows optimal zone by 10%
      caffeineMultiplier: 1.5, // 50% more caffeine depletion
      specialCondition: 'Maintain precise caffeine levels'
    }
  },
  bugFix: {
    id: 'bugFix',
    name: 'Critical Bug',
    description: 'Emergency fix needed - health drains faster!',
    duration: 12000, // 12 seconds
    warningTime: 4000, // 4 second warning
    icon: '🐛',
    effect: {
      healthMultiplier: 2.5, // Much faster health drain
      caffeineMultiplier: 1.3, // Slightly faster caffeine use
      specialCondition: 'Urgent deadline pressure'
    }
  },
  lunchBreak: {
    id: 'lunchBreak',
    name: 'Lunch Break',
    description: 'Mandatory break - drinks have reduced effect!',
    duration: 18000, // 18 seconds
    warningTime: 6000, // 6 second warning
    icon: '🍕',
    effect: {
      caffeineMultiplier: 0.5, // Drinks only 50% effective
      healthMultiplier: 0.8, // Slightly reduced health drain
      specialCondition: 'Reduced drink effectiveness'
    }
  }
};

export interface EventSystemConfig {
  minTimeBetweenEvents: number; // Minimum time between events
  maxTimeBetweenEvents: number; // Maximum time between events
  difficultyScaling: number; // How much difficulty affects frequency
  enabled: boolean; // Whether events are enabled
}

export interface EventSystemCallbacks {
  onEventStart?: (event: GameEvent) => void;
  onEventEnd?: (event: GameEvent) => void;
  onEventWarning?: (event: GameEvent) => void;
}

/**
 * EventSystem manages random events during gameplay
 */
export class EventSystem {
  private activeEvent: ActiveEvent | null = null;
  private nextEventTime: number = 0;
  private lastEventEndTime: number = 0;
  private config: EventSystemConfig;
  private callbacks: EventSystemCallbacks;
  private eventHistory: EventType[] = [];
  private isPaused: boolean = false;

  constructor(
    config: Partial<EventSystemConfig> = {},
    callbacks: EventSystemCallbacks = {}
  ) {
    this.config = {
      minTimeBetweenEvents: 30000, // 30 seconds minimum
      maxTimeBetweenEvents: 90000, // 90 seconds maximum
      difficultyScaling: 0.8, // Higher difficulty = more frequent events
      enabled: true,
      ...config
    };

    this.callbacks = callbacks;
    this.scheduleNextEvent();
  }

  /**
   * Update the event system
   */
  update(currentTime: number): void {
    if (this.isPaused || !this.config.enabled) return;

    // Check if we should trigger a new event
    if (!this.activeEvent && currentTime >= this.nextEventTime) {
      this.triggerRandomEvent(currentTime);
    }

    // Check active event
    if (this.activeEvent) {
      const event = this.activeEvent;

      // Check for warning phase
      if (!event.isActive && currentTime >= event.startTime - event.event.warningTime) {
        this.callbacks.onEventWarning?.(event.event);
      }

      // Start event
      if (!event.isActive && currentTime >= event.startTime) {
        event.isActive = true;
        this.callbacks.onEventStart?.(event.event);
      }

      // End event
      if (event.isActive && currentTime >= event.endTime) {
        this.endEvent(currentTime);
      }
    }
  }

  /**
   * Trigger a random event
   */
  private triggerRandomEvent(currentTime: number): void {
    // Select a random event type, avoiding recent events
    const availableEvents = this.getAvailableEvents();
    if (availableEvents.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableEvents.length);
    const eventType = availableEvents[randomIndex];
    const event = GAME_EVENTS[eventType];

    // Create active event
    this.activeEvent = {
      event,
      startTime: currentTime + event.warningTime,
      endTime: currentTime + event.warningTime + event.duration,
      isActive: false
    };

    // Add to history
    this.eventHistory.push(eventType);
    if (this.eventHistory.length > 4) {
      this.eventHistory.shift(); // Keep only last 4 events
    }
  }

  /**
   * Get available events (avoiding repetition)
   */
  private getAvailableEvents(): EventType[] {
    const allEvents: EventType[] = ['morningMeeting', 'codeReview', 'bugFix', 'lunchBreak'];

    // Avoid repeating the last 2 events if possible
    if (this.eventHistory.length >= 2) {
      const recentEvents = this.eventHistory.slice(-2);
      const filtered = allEvents.filter(e => !recentEvents.includes(e));

      // If we have at least 2 options after filtering, use them
      if (filtered.length >= 2) {
        return filtered;
      }
    }

    return allEvents;
  }

  /**
   * End the current event
   */
  private endEvent(currentTime: number): void {
    if (this.activeEvent) {
      this.callbacks.onEventEnd?.(this.activeEvent.event);
      this.activeEvent = null;
      this.lastEventEndTime = currentTime;
      this.scheduleNextEvent();
    }
  }

  /**
   * Schedule the next event
   */
  private scheduleNextEvent(): void {
    const minTime = this.config.minTimeBetweenEvents * this.config.difficultyScaling;
    const maxTime = this.config.maxTimeBetweenEvents * this.config.difficultyScaling;
    const randomDelay = minTime + Math.random() * (maxTime - minTime);

    this.nextEventTime = Date.now() + randomDelay;
  }

  /**
   * Get the current active event
   */
  getActiveEvent(): ActiveEvent | null {
    return this.activeEvent;
  }

  /**
   * Get current event effect
   */
  getCurrentEffect(): EventEffect | null {
    return this.activeEvent?.isActive ? this.activeEvent.event.effect : null;
  }

  /**
   * Check if drinks are restricted
   */
  areDrinksRestricted(): boolean {
    const effect = this.getCurrentEffect();
    return effect?.drinkRestriction ?? false;
  }

  /**
   * Get time until next event (for UI)
   */
  getTimeUntilNextEvent(): number {
    if (this.activeEvent || this.isPaused || !this.config.enabled) {
      return -1;
    }
    return Math.max(0, this.nextEventTime - Date.now());
  }

  /**
   * Pause the event system
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume the event system
   */
  resume(): void {
    this.isPaused = false;

    // Reschedule next event based on pause duration
    if (!this.activeEvent) {
      this.scheduleNextEvent();
    }
  }

  /**
   * Reset the event system
   */
  reset(): void {
    this.activeEvent = null;
    this.nextEventTime = 0;
    this.lastEventEndTime = 0;
    this.eventHistory = [];
    this.isPaused = false;
    this.scheduleNextEvent();
  }

  /**
   * Set configuration
   */
  setConfig(config: Partial<EventSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Force trigger a specific event (for testing)
   */
  forceEvent(eventType: EventType, currentTime: number = Date.now()): void {
    const event = GAME_EVENTS[eventType];

    this.activeEvent = {
      event,
      startTime: currentTime,
      endTime: currentTime + event.duration,
      isActive: true
    };

    this.callbacks.onEventStart?.(event);
  }
}

/**
 * Create a pre-configured event system
 */
export function createEventSystem(
  difficulty: 'intern' | 'junior' | 'senior' | 'architect' = 'junior',
  callbacks?: EventSystemCallbacks
): EventSystem {
  const difficultyConfigs = {
    intern: { difficultyScaling: 1.2, minTimeBetweenEvents: 45000 },
    junior: { difficultyScaling: 1.0, minTimeBetweenEvents: 35000 },
    senior: { difficultyScaling: 0.8, minTimeBetweenEvents: 25000 },
    architect: { difficultyScaling: 0.6, minTimeBetweenEvents: 20000 }
  };

  return new EventSystem(difficultyConfigs[difficulty], callbacks);
}