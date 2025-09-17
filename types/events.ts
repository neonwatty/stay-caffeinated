/**
 * Game event types and interfaces
 */

export type EventType = 'morningMeeting' | 'codeReview' | 'bugFix' | 'lunchBreak';

export interface GameEvent {
  id: EventType;
  name: string;
  description: string;
  duration: number; // in milliseconds
  effect: EventEffect;
  warningTime: number; // milliseconds before event to show warning
  icon: string;
}

export interface EventEffect {
  caffeineMultiplier?: number; // Multiplier for caffeine depletion
  healthMultiplier?: number; // Multiplier for health depletion
  optimalZoneShift?: number; // Temporary shift in optimal zone
  drinkRestriction?: boolean; // Whether drinks are restricted
  specialCondition?: string; // Special condition description
}

export interface ActiveEvent {
  event: GameEvent;
  startTime: number;
  endTime: number;
  isActive: boolean;
}