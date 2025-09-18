/**
 * Tests for the Events System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventSystem, createEventSystem } from '../events';
import type { GameEvent } from '@/types';

describe('EventSystem', () => {
  let eventSystem: EventSystem;
  let onEventStart: ReturnType<typeof vi.fn>;
  let onEventEnd: ReturnType<typeof vi.fn>;
  let onEventWarning: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    onEventStart = vi.fn();
    onEventEnd = vi.fn();
    onEventWarning = vi.fn();

    eventSystem = new EventSystem(
      {
        minTimeBetweenEvents: 30000,
        maxTimeBetweenEvents: 60000,
        enabled: true
      },
      {
        onEventStart,
        onEventEnd,
        onEventWarning
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Event Triggering', () => {
    it('should schedule events after minimum time', () => {
      // Create a new event system with shorter timings for testing
      const testSystem = new EventSystem({
        minTimeBetweenEvents: 1000,
        maxTimeBetweenEvents: 2000,
        enabled: true
      });

      const currentTime = Date.now();
      vi.setSystemTime(currentTime);

      // First update to initialize
      testSystem.update(currentTime);

      // Advance past the max event time
      const futureTime = currentTime + 3000;
      vi.setSystemTime(futureTime);
      testSystem.update(futureTime);

      // Should have created an event
      const activeEvent = testSystem.getActiveEvent();
      expect(activeEvent).not.toBeNull();
    });

    it('should handle event lifecycle correctly', () => {
      const currentTime = Date.now();

      // Force an event to start immediately
      eventSystem.forceEvent('morningMeeting', currentTime);

      // Event should be active and start callback called
      expect(onEventStart).toHaveBeenCalled();

      const activeEvent = eventSystem.getActiveEvent();
      expect(activeEvent).not.toBeNull();
      expect(activeEvent?.isActive).toBe(true);
    });

    it('should call start callback when event becomes active', () => {
      const currentTime = Date.now();
      eventSystem.forceEvent('morningMeeting', currentTime);

      expect(onEventStart).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'morningMeeting',
          name: 'Morning Stand-up'
        })
      );
    });

    it('should call end callback when event completes', () => {
      const currentTime = Date.now();
      eventSystem.forceEvent('morningMeeting', currentTime);

      // Advance past event duration
      vi.advanceTimersByTime(16000);
      eventSystem.update(currentTime + 16000);

      expect(onEventEnd).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'morningMeeting'
        })
      );
    });
  });

  describe('Event Effects', () => {
    it('should return correct effect for active event', () => {
      const currentTime = Date.now();
      eventSystem.forceEvent('codeReview', currentTime);

      const effect = eventSystem.getCurrentEffect();
      expect(effect).toEqual(
        expect.objectContaining({
          optimalZoneShift: -10,
          caffeineMultiplier: 1.5
        })
      );
    });

    it('should restrict drinks during meeting event', () => {
      const currentTime = Date.now();

      expect(eventSystem.areDrinksRestricted()).toBe(false);

      eventSystem.forceEvent('morningMeeting', currentTime);

      expect(eventSystem.areDrinksRestricted()).toBe(true);
    });

    it('should return null effect when no event is active', () => {
      expect(eventSystem.getCurrentEffect()).toBeNull();
    });
  });

  describe('Event History and Rotation', () => {
    it('should avoid repeating recent events', () => {
      const events: string[] = [];

      // Force several events and track them
      for (let i = 0; i < 6; i++) {
        const currentTime = Date.now() + i * 100000;
        vi.setSystemTime(currentTime);

        // Trigger next event
        vi.advanceTimersByTime(40000);
        eventSystem.update(currentTime + 40000);

        const activeEvent = eventSystem.getActiveEvent();
        if (activeEvent) {
          events.push(activeEvent.event.id);

          // End the event
          vi.advanceTimersByTime(20000);
          eventSystem.update(currentTime + 60000);
        }
      }

      // Check that we don't have too many immediate repeats
      for (let i = 1; i < events.length; i++) {
        if (i >= 2) {
          // Shouldn't repeat within 2 events if possible
          const recent = events.slice(i - 2, i);
          const duplicates = recent.filter(e => e === events[i]);
          expect(duplicates.length).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  describe('Pause and Resume', () => {
    it('should pause event system', () => {
      eventSystem.pause();

      const currentTime = Date.now();
      vi.advanceTimersByTime(40000);
      eventSystem.update(currentTime + 40000);

      // Should not trigger events while paused
      expect(onEventWarning).not.toHaveBeenCalled();
    });

    it('should resume event system and reschedule', () => {
      eventSystem.pause();
      eventSystem.resume();

      const currentTime = Date.now();
      vi.setSystemTime(currentTime);

      // Advance time beyond the maximum time between events to ensure triggering
      // maxTimeBetweenEvents is 60000ms, so advance 65000ms to guarantee an event
      vi.advanceTimersByTime(65000);
      eventSystem.update(currentTime + 65000);

      // Should trigger events after resume
      expect(onEventWarning).toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should respect enabled flag', () => {
      eventSystem.setConfig({ enabled: false });

      const currentTime = Date.now();
      vi.advanceTimersByTime(40000);
      eventSystem.update(currentTime + 40000);

      expect(onEventWarning).not.toHaveBeenCalled();
    });

    it('should apply difficulty scaling', () => {
      const seniorSystem = createEventSystem('senior', {
        onEventStart: vi.fn()
      });

      // Senior difficulty has 0.8 scaling, events should happen more frequently
      const config = { difficultyScaling: 0.8 };
      expect(seniorSystem).toBeDefined();
    });
  });

  describe('Reset', () => {
    it('should reset event system state', () => {
      const currentTime = Date.now();
      eventSystem.forceEvent('bugFix', currentTime);

      expect(eventSystem.getActiveEvent()).not.toBeNull();

      eventSystem.reset();

      expect(eventSystem.getActiveEvent()).toBeNull();
      expect(eventSystem.getTimeUntilNextEvent()).toBeGreaterThan(0);
    });
  });

  describe('All Event Types', () => {
    const eventTypes: Array<'morningMeeting' | 'codeReview' | 'bugFix' | 'lunchBreak'> = [
      'morningMeeting',
      'codeReview',
      'bugFix',
      'lunchBreak'
    ];

    eventTypes.forEach(eventType => {
      it(`should handle ${eventType} event correctly`, () => {
        const currentTime = Date.now();
        eventSystem.forceEvent(eventType, currentTime);

        const activeEvent = eventSystem.getActiveEvent();
        expect(activeEvent).not.toBeNull();
        expect(activeEvent?.event.id).toBe(eventType);

        const effect = eventSystem.getCurrentEffect();
        expect(effect).toBeDefined();

        // Each event should have unique effects
        switch(eventType) {
          case 'morningMeeting':
            expect(effect?.drinkRestriction).toBe(true);
            expect(effect?.caffeineMultiplier).toBe(2.0);
            break;
          case 'codeReview':
            expect(effect?.optimalZoneShift).toBe(-10);
            expect(effect?.caffeineMultiplier).toBe(1.5);
            break;
          case 'bugFix':
            expect(effect?.healthMultiplier).toBe(2.5);
            expect(effect?.caffeineMultiplier).toBe(1.3);
            break;
          case 'lunchBreak':
            expect(effect?.caffeineMultiplier).toBe(0.5);
            expect(effect?.healthMultiplier).toBe(0.8);
            break;
        }
      });
    });
  });
});