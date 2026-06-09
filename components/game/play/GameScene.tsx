'use client';

/**
 * GameScene - Main playing-state view that layers background, character,
 * HUD, drink bar, and event banners.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useGameState } from '@/hooks/useGameState';
import { WorkspaceBackgroundSVG } from '@/components/game/environment/WorkspaceBackgroundSVG';
import { CoffeeCupSVG } from '@/components/game/CoffeeCupSVG';
import { SpriteCharacter } from '@/components/game/SpriteCharacter';
import { EventBannerSVG } from '@/components/game/screens/EventBannerSVG';
import { GameHUD } from './GameHUD';
import { DrinkToolbar } from './DrinkToolbar';
import { getDrinkCaffeineBoost } from '@/game/data/drinks';
import type { CharacterType } from '@/components/game/play/CharacterSelect';
import type { DrinkType } from '@/types/drinks';
import type { EventType } from '@/components/game/screens/EventBannerSVG';

// ---------------------------------------------------------------------------
// Event definitions
// ---------------------------------------------------------------------------

interface GameEvent {
  type: EventType;
  threshold: number; // percentage of workday (0-100)
  title: string;
  description: string;
  durationMs: number;
  status: string;
  planningHint: string;
}

const GAME_EVENTS: GameEvent[] = [
  {
    type: 'morningMeeting',
    threshold: 5,
    title: 'Morning Meeting',
    description: 'First checkpoint: keep caffeine in the green zone.',
    durationMs: 8_000,
    status: 'Checkpoint active',
    planningHint: 'Enter the green zone before it starts.',
  },
  {
    type: 'codeReview',
    threshold: 12,
    title: 'Code Review',
    description: 'Drinks locked for 15 seconds.',
    durationMs: 15_000,
    status: 'Drinks locked',
    planningHint: 'Pre-load caffeine before the lockout.',
  },
  {
    type: 'lunchBreak',
    threshold: 55,
    title: 'Lunch Break',
    description: 'Midday checkpoint: water can recover health.',
    durationMs: 10_000,
    status: 'Recovery window',
    planningHint: 'Use water if health is slipping.',
  },
  {
    type: 'bugFix',
    threshold: 80,
    title: 'Bug Fix',
    description: 'Final stretch: stay inside the optimal zone.',
    durationMs: 12_000,
    status: 'Final focus',
    planningHint: 'Save a steady drink for the finish.',
  },
];

interface ActiveEffect {
  event: GameEvent;
  endsAt: number;
}

type SpritePressure = 'none' | 'drink' | 'event';
type PrepTiming = 'early' | 'timed' | 'late';
type PrepMatch = 'strong' | 'partial' | 'poor';

interface EventPrepRecord {
  eventType: EventType;
  eventTitle: string;
  drinkType: DrinkType;
  drinkName: string;
  distanceToEvent: number;
  timing: PrepTiming;
  zoneAtPrep: string;
  match: PrepMatch;
}

export interface StrategyRunSummary {
  drinkChoices: string[];
  drinksUsed: number;
  eventsHandled: string[];
  preparedEvents: string[];
  eventOutcomes: string[];
  scoreNotes: string[];
  lastEventStatus: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface GameSceneProps {
  character: CharacterType;
  onStrategySummaryChange?: (summary: StrategyRunSummary) => void;
}

const EMPTY_SUMMARY: StrategyRunSummary = {
  drinkChoices: [],
  drinksUsed: 0,
  eventsHandled: [],
  preparedEvents: [],
  eventOutcomes: [],
  scoreNotes: [],
  lastEventStatus: 'No events handled yet',
};

export function GameScene({ character, onStrategySummaryChange }: GameSceneProps) {
  const { consumeDrink, healHealth, pauseGame } = useGame();
  const {
    caffeinePercentage,
    healthPercentage,
    stats,
    timeProgress,
    formattedTime,
    optimalZoneRange,
    isPlaying,
  } = useGameState();
  // ---- Event state ----
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [activeEffect, setActiveEffect] = useState<ActiveEffect | null>(null);
  const [drinkRestricted, setDrinkRestricted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [drinkChoices, setDrinkChoices] = useState<string[]>([]);
  const [eventsHandled, setEventsHandled] = useState<string[]>([]);
  const [eventPrepRecords, setEventPrepRecords] = useState<EventPrepRecord[]>([]);
  const [eventOutcomes, setEventOutcomes] = useState<string[]>([]);
  const [spritePressure, setSpritePressure] = useState<SpritePressure>('none');
  const firedEventsRef = useRef<Set<EventType>>(new Set());
  const restrictionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spriteFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Trigger events at workday progress thresholds ----
  useEffect(() => {
    if (!isPlaying) return;

    for (const event of GAME_EVENTS) {
      if (
        timeProgress >= event.threshold &&
        !firedEventsRef.current.has(event.type)
      ) {
        firedEventsRef.current.add(event.type);
        const eventStartedAt = Date.now();
        setActiveEvent(event);
        setNow(eventStartedAt);
        setActiveEffect({ event, endsAt: eventStartedAt + event.durationMs });
        setEventsHandled((prev) => [...prev, event.title]);
        const eventPressure = evaluateEventPressure(
          event,
          caffeinePercentage,
          healthPercentage,
          [optimalZoneRange.min, optimalZoneRange.max],
          eventPrepRecords,
        );
        setEventOutcomes((prev) => [...prev.slice(-4), eventPressure.summary]);

        if (eventPressure.healthDelta !== 0) {
          healHealth(eventPressure.healthDelta);
        }

        setSpritePressure('event');
        if (spriteFeedbackTimerRef.current) {
          clearTimeout(spriteFeedbackTimerRef.current);
        }
        spriteFeedbackTimerRef.current = setTimeout(() => setSpritePressure('none'), 1600);

        if (restrictionTimerRef.current) {
          clearTimeout(restrictionTimerRef.current);
        }

        // Code review: restrict drinks for the active event duration.
        if (event.type === 'codeReview') {
          setDrinkRestricted(true);
          restrictionTimerRef.current = setTimeout(() => {
            setDrinkRestricted(false);
            setActiveEffect((current) => (
              current?.event.type === event.type ? null : current
            ));
          }, event.durationMs);
        } else {
          restrictionTimerRef.current = setTimeout(() => {
            setActiveEffect((current) => (
              current?.event.type === event.type ? null : current
            ));
          }, event.durationMs);
        }

        // Only fire one event at a time
        break;
      }
    }
  }, [
    timeProgress,
    isPlaying,
    caffeinePercentage,
    healthPercentage,
    healHealth,
    optimalZoneRange.min,
    optimalZoneRange.max,
    eventPrepRecords,
  ]);

  useEffect(() => {
    if (!activeEffect || !isPlaying) return undefined;

    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [activeEffect, isPlaying]);

  // Cleanup restriction timer on unmount
  useEffect(() => {
    return () => {
      if (restrictionTimerRef.current) {
        clearTimeout(restrictionTimerRef.current);
      }
      if (spriteFeedbackTimerRef.current) {
        clearTimeout(spriteFeedbackTimerRef.current);
      }
    };
  }, []);

  // ---- Escape key to pause ----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPlaying) {
        pauseGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, pauseGame]);

  // ---- Drink consumption handler ----
  const handleConsume = useCallback(
    (drinkType: DrinkType) => {
      if (drinkRestricted) return;

      const boost = getDrinkCaffeineBoost(drinkType);
      const upcomingEvent = GAME_EVENTS.find(
        (event) => event.threshold > timeProgress && !firedEventsRef.current.has(event.type),
      );
      const distanceToEvent = upcomingEvent ? upcomingEvent.threshold - timeProgress : null;
      const inPrepWindow = upcomingEvent && distanceToEvent !== null && distanceToEvent <= 12;
      consumeDrink(boost, drinkType);

      // Water heals the player
      if (drinkType === 'water') {
        healHealth(5);
      }

      const decision = describeDrinkDecision(
        drinkType,
        caffeinePercentage,
        healthPercentage,
        [optimalZoneRange.min, optimalZoneRange.max],
        upcomingEvent,
      );
      setDrinkChoices((prev) => [...prev.slice(-4), decision]);
      setSpritePressure('drink');
      if (spriteFeedbackTimerRef.current) {
        clearTimeout(spriteFeedbackTimerRef.current);
      }
      spriteFeedbackTimerRef.current = setTimeout(() => setSpritePressure('none'), 900);

      if (inPrepWindow && upcomingEvent) {
        const prepRecord = buildEventPrepRecord(
          upcomingEvent,
          drinkType,
          distanceToEvent,
          caffeinePercentage,
          [optimalZoneRange.min, optimalZoneRange.max],
        );
        setEventPrepRecords((prev) => [
          ...prev.filter((record) => record.eventType !== upcomingEvent.type),
          prepRecord,
        ]);
      }
    },
    [
      drinkRestricted,
      timeProgress,
      consumeDrink,
      healHealth,
      caffeinePercentage,
      healthPercentage,
      optimalZoneRange.min,
      optimalZoneRange.max,
    ],
  );

  // ---- Banner complete handler ----
  const handleBannerComplete = useCallback(() => {
    setActiveEvent(null);
  }, []);

  // ---- Derived values ----
  const multiplier = stats.isInOptimalZone ? 2 : 1;
  const nextEvent = useMemo(
    () => GAME_EVENTS.find(
      (event) => event.threshold > timeProgress && !firedEventsRef.current.has(event.type),
    ) ?? null,
    [timeProgress],
  );
  const activeEffectSeconds = activeEffect
    ? Math.max(0, Math.ceil((activeEffect.endsAt - now) / 1000))
    : 0;
  const eventDistance = nextEvent ? Math.max(0, Math.ceil(nextEvent.threshold - timeProgress)) : 0;
  const preparedEvents = useMemo(
    () => eventPrepRecords.map((record) => describePrepRecord(record)),
    [eventPrepRecords],
  );
  const nextEventPrep = nextEvent
    ? findPrepForEvent(eventPrepRecords, nextEvent)
    : null;
  const activeEventPrep = activeEffect
    ? findPrepForEvent(eventPrepRecords, activeEffect.event)
    : null;
  const caffeineZoneLabel = getCaffeineZoneLabel(
    caffeinePercentage,
    [optimalZoneRange.min, optimalZoneRange.max],
  );
  const spritePressureState: SpritePressure = spritePressure !== 'none'
    ? spritePressure
    : activeEffect && activeEffectSeconds > 0
      ? 'event'
      : 'none';
  const currentStatusLabel = activeEffect && activeEffectSeconds > 0
    ? `${activeEffect.event.status} - ${activeEffectSeconds}s`
    : 'Plan your next drink';
  const strategySummary = useMemo<StrategyRunSummary>(() => ({
    drinkChoices,
    drinksUsed: stats.drinksConsumed,
    eventsHandled,
    preparedEvents,
    eventOutcomes,
    scoreNotes: buildScoreNotes(stats.streak, stats.drinksConsumed, eventOutcomes, preparedEvents),
    lastEventStatus: activeEffect
      ? `${activeEffect.event.title}: ${activeEffect.event.status} (${activeEffectSeconds}s)`
      : eventsHandled.length > 0
        ? `${eventsHandled[eventsHandled.length - 1]} handled`
        : EMPTY_SUMMARY.lastEventStatus,
  }), [
    activeEffect,
    activeEffectSeconds,
    drinkChoices,
    eventOutcomes,
    eventsHandled,
    preparedEvents,
    stats.drinksConsumed,
    stats.streak,
  ]);

  useEffect(() => {
    onStrategySummaryChange?.(strategySummary);
  }, [onStrategySummaryChange, strategySummary]);

  return (
    <div data-testid="game-scene" className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Layer 1 — Background (absolute inset-0, centered) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <WorkspaceBackgroundSVG
          caffeineLevel={caffeinePercentage}
          timeProgress={timeProgress / 100}
          drinksConsumed={stats.drinksConsumed}
          isActive={isPlaying}
        />
      </div>

      {/* Layer 2 — Character (absolute inset-0, centered) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {character === 'officeWorker' ? (
          <SpriteCharacter
            caffeineLevel={caffeinePercentage}
            width={320}
            height={320}
            isActive={isPlaying}
            pressureState={spritePressureState}
            activeEventTitle={activeEffect?.event.title}
          />
        ) : (
          <CoffeeCupSVG
            caffeineLevel={caffeinePercentage}
            width={260}
            height={260}
            isActive={isPlaying}
          />
        )}
      </div>

      {/* Layer 3 — HUD (z-10) */}
      <GameHUD
        caffeineLevel={caffeinePercentage}
        healthLevel={healthPercentage}
        score={stats.score}
        streak={stats.streak}
        multiplier={multiplier}
        timeProgress={timeProgress}
        formattedTime={formattedTime}
        optimalZone={[optimalZoneRange.min, optimalZoneRange.max]}
        isActive={isPlaying}
      />

      {/* Layer 3b — Command panel (z-20) */}
      <div className="absolute inset-x-0 top-3 z-20 flex justify-center px-3 pointer-events-none sm:px-28">
        <div
          data-testid="strategy-panel"
          data-hud-priority="events"
          className="grid w-full max-w-4xl grid-cols-2 gap-2 rounded-lg border border-cyan-300/25 bg-black/80 px-3 py-2 text-white shadow-xl shadow-cyan-950/30 backdrop-blur-md md:grid-cols-4"
          aria-live="polite"
        >
          <div data-testid="shift-status" className="min-w-0 border-r border-white/10 pr-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-300">Shift</p>
            <p className="text-base font-bold leading-tight">{formattedTime}</p>
            <p className="text-xs text-gray-200">{Math.round(timeProgress)}% complete</p>
          </div>

          <div data-testid="caffeine-status" className="min-w-0 border-r border-white/10 pr-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">Caffeine</p>
            <p className="text-base font-bold leading-tight">
              {Math.round(caffeinePercentage)}% - {caffeineZoneLabel}
            </p>
            <p className="text-xs text-gray-200">Health {Math.round(healthPercentage)}%</p>
          </div>

          <div data-testid="upcoming-event" className="min-w-0 border-r border-white/10 pr-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300">Next</p>
            {nextEvent ? (
              <>
                <p className="truncate text-base font-bold leading-tight">{nextEvent.title}</p>
                <p className="text-xs text-gray-200">
                  {nextEventPrep
                    ? `Prep: ${describePrepRecord(nextEventPrep)}`
                    : `In ${eventDistance}% - ${nextEvent.planningHint}`}
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-bold leading-tight">End of shift</p>
                <p className="text-xs text-gray-200">Hold the optimal zone.</p>
              </>
            )}
          </div>

          <div data-testid="active-event-status" className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-300">Now</p>
            {activeEffect && activeEffectSeconds > 0 ? (
              <>
                <p className="truncate text-base font-bold leading-tight">{activeEffect.event.title}</p>
                <p className="text-xs text-gray-200">{currentStatusLabel}</p>
                {activeEventPrep && (
                  <p className="truncate text-xs text-amber-100">
                    Prep: {describePrepRecord(activeEventPrep)}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-base font-bold leading-tight">Plan your next drink</p>
                <p className="text-xs text-gray-200">
                  {caffeineZoneLabel}; next drink should match the event plan
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Layer 4 — Drink Toolbar (z-20) */}
      <DrinkToolbar
        onConsume={handleConsume}
        onPause={pauseGame}
        disabled={drinkRestricted}
        drinkRestrictionRemainingSeconds={activeEffect?.event.type === 'codeReview' ? activeEffectSeconds : 0}
        strategyContext={{
          caffeineLevel: caffeinePercentage,
          healthLevel: healthPercentage,
          nextEventTitle: nextEvent?.title,
          optimalZone: [optimalZoneRange.min, optimalZoneRange.max],
        }}
        isActive={isPlaying}
      />

      {/* Layer 5 — Drink Restricted indicator (z-25) */}
      {drinkRestricted && (
        <div data-testid="drink-restriction" className="absolute inset-x-0 bottom-24 z-[25] flex items-center justify-center pointer-events-none">
          <span className="animate-pulse text-2xl font-bold text-red-500 drop-shadow-lg">
            No Drinks Allowed! {activeEffectSeconds}s
          </span>
        </div>
      )}

      {/* Layer 6 — Event Banner (z-30) */}
      {activeEvent && (
        <div data-testid="event-banner" className="absolute inset-x-0 top-16 z-30 flex justify-center pointer-events-none">
          <EventBannerSVG
            eventType={activeEvent.type}
            title={activeEvent.title}
            description={activeEvent.description}
            onComplete={handleBannerComplete}
            isActive={isPlaying}
          />
        </div>
      )}
    </div>
  );
}

function describeDrinkDecision(
  drinkType: DrinkType,
  caffeineLevel: number,
  healthLevel: number,
  optimalZone: [number, number],
  upcomingEvent: GameEvent | null | undefined,
): string {
  if (drinkType === 'water') {
    return healthLevel < 70
      ? 'Water recovered health during a risky stretch'
      : 'Water saved caffeine space while stabilizing health';
  }

  if (upcomingEvent?.type === 'codeReview') {
    return `${getDrinkName(drinkType)} pre-loaded caffeine before Code Review`;
  }

  if (caffeineLevel < optimalZone[0]) {
    return `${getDrinkName(drinkType)} pushed caffeine back into the green zone`;
  }

  if (caffeineLevel > optimalZone[1] - 10) {
    return `${getDrinkName(drinkType)} was a risky boost near the upper limit`;
  }

  if (upcomingEvent) {
    return `${getDrinkName(drinkType)} prepared for ${upcomingEvent.title}`;
  }

  return `${getDrinkName(drinkType)} maintained focus for the final stretch`;
}

function buildEventPrepRecord(
  event: GameEvent,
  drinkType: DrinkType,
  distanceToEvent: number,
  caffeineLevel: number,
  optimalZone: [number, number],
): EventPrepRecord {
  const drinkName = getDrinkName(drinkType);
  const zoneAtPrep = getCaffeineZoneLabel(caffeineLevel, optimalZone);
  const timing = getPrepTiming(distanceToEvent);
  const match = getPrepMatch(event, drinkType, timing, zoneAtPrep);

  return {
    eventType: event.type,
    eventTitle: event.title,
    drinkType,
    drinkName,
    distanceToEvent: Math.max(0, Math.ceil(distanceToEvent)),
    timing,
    zoneAtPrep,
    match,
  };
}

function getPrepTiming(distanceToEvent: number): PrepTiming {
  if (distanceToEvent <= 3) return 'late';
  if (distanceToEvent <= 8) return 'timed';
  return 'early';
}

function getPrepMatch(
  event: GameEvent,
  drinkType: DrinkType,
  timing: PrepTiming,
  zoneAtPrep: string,
): PrepMatch {
  if (event.type === 'codeReview') {
    const steadyDrink = drinkType === 'tea' || drinkType === 'coffee';
    if (steadyDrink && timing !== 'late' && zoneAtPrep === 'Green zone') return 'strong';
    if (steadyDrink || zoneAtPrep === 'Green zone') return 'partial';
    return 'poor';
  }

  if (event.type === 'lunchBreak') {
    if (drinkType === 'water') return 'strong';
    if (drinkType === 'tea') return 'partial';
    return 'poor';
  }

  if (drinkType === 'water') return 'partial';
  if (timing === 'late') return 'partial';
  return 'strong';
}

function findPrepForEvent(
  records: EventPrepRecord[],
  event: GameEvent,
): EventPrepRecord | null {
  return records.find((record) => record.eventType === event.type) ?? null;
}

function describePrepRecord(record: EventPrepRecord): string {
  return `${record.drinkName} -> ${record.eventTitle}, ${record.distanceToEvent}% away, ${record.zoneAtPrep}, timing: ${record.timing}`;
}

function getDrinkName(drinkType: DrinkType): string {
  switch (drinkType) {
    case 'tea':
      return 'Tea';
    case 'coffee':
      return 'Coffee';
    case 'espresso':
      return 'Espresso';
    case 'energyDrink':
      return 'Energy Drink';
    case 'water':
      return 'Water';
    default:
      return 'Drink';
  }
}

function getCaffeineZoneLabel(caffeineLevel: number, optimalZone: [number, number]): string {
  const [minOptimal, maxOptimal] = optimalZone;

  if (caffeineLevel < minOptimal) return 'Under zone';
  if (caffeineLevel > maxOptimal) return 'Over zone';
  return 'Green zone';
}

function evaluateEventPressure(
  event: GameEvent,
  caffeineLevel: number,
  healthLevel: number,
  optimalZone: [number, number],
  eventPrepRecords: EventPrepRecord[],
): { healthDelta: number; summary: string } {
  const inZone = caffeineLevel >= optimalZone[0] && caffeineLevel <= optimalZone[1];
  const prepRecord = findPrepForEvent(eventPrepRecords, event);
  const strongPrep = prepRecord?.match === 'strong';

  if (event.type === 'lunchBreak') {
    if (strongPrep && prepRecord.drinkType === 'water') {
      return {
        healthDelta: 6,
        summary: `Lunch Break rewarded water prep (${describePrepRecord(prepRecord)}) with a health boost`,
      };
    }

    if (prepRecord) {
      return {
        healthDelta: -3,
        summary: `Lunch Break wanted recovery prep; ${prepRecord.drinkName} was caffeine-only planning`,
      };
    }

    if (healthLevel < 85) {
      return {
        healthDelta: 2,
        summary: 'Lunch Break recovered a little health, but no water prep was ready',
      };
    }

    return {
      healthDelta: -6,
      summary: 'Lunch Break punished ignoring recovery; health slipped',
    };
  }

  if (event.type === 'codeReview') {
    if (inZone && strongPrep && prepRecord) {
      return {
        healthDelta: 0,
        summary: `Code Review held because ${describePrepRecord(prepRecord)} matched the lockout`,
      };
    }

    if (prepRecord) {
      return {
        healthDelta: -8,
        summary: `Code Review saw ${describePrepRecord(prepRecord)}, but the prep was not steady and green enough`,
      };
    }

    return {
      healthDelta: -12,
      summary: 'Code Review created pressure: missing prep or zone control cost health',
    };
  }

  if (event.type === 'bugFix') {
    if (inZone) {
      return {
        healthDelta: 0,
        summary: 'Bug Fix stayed manageable because caffeine was in the green zone',
      };
    }

    return {
      healthDelta: -10,
      summary: 'Bug Fix punished drifting outside the green zone',
    };
  }

  if (inZone || strongPrep) {
    return {
      healthDelta: 0,
      summary: `${event.title} was handled with caffeine in the green zone`,
    };
  }

  return {
    healthDelta: -8,
    summary: `${event.title} added pressure because caffeine was outside the green zone`,
  };
}

function buildScoreNotes(
  streak: number,
  drinksUsed: number,
  eventOutcomes: string[],
  preparedEvents: string[],
): string[] {
  const notes = [
    `Zone bonus came from a ${streak}x focus streak`,
    `${drinksUsed} drink${drinksUsed === 1 ? '' : 's'} shaped the caffeine plan`,
  ];

  if (preparedEvents.length > 0) {
    notes.push(`Prepared events protected the run: ${preparedEvents.join(', ')}`);
  }

  if (eventOutcomes.length > 0) {
    notes.push(eventOutcomes[eventOutcomes.length - 1]);
  }

  return notes;
}
