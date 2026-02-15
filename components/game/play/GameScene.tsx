'use client';

/**
 * GameScene - Main playing-state view that layers background, character,
 * HUD, drink bar, and event banners.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useGameState } from '@/hooks/useGameState';
import { useDrinkCooldown } from '@/hooks/useDrinkCooldown';
import { WorkspaceBackgroundSVG } from '@/components/game/environment/WorkspaceBackgroundSVG';
import { OfficeWorkerSVG } from '@/components/game/OfficeWorkerSVG';
import { CoffeeCupSVG } from '@/components/game/CoffeeCupSVG';
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
}

const GAME_EVENTS: GameEvent[] = [
  {
    type: 'morningMeeting',
    threshold: 10,
    title: 'Morning Meeting',
    description: 'Caffeine drains faster!',
  },
  {
    type: 'codeReview',
    threshold: 35,
    title: 'Code Review',
    description: "Can't drink for 15 seconds!",
  },
  {
    type: 'lunchBreak',
    threshold: 55,
    title: 'Lunch Break',
    description: 'Caffeine drain paused!',
  },
  {
    type: 'bugFix',
    threshold: 80,
    title: 'Bug Fix',
    description: 'Health drains faster!',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface GameSceneProps {
  character: CharacterType;
}

export function GameScene({ character }: GameSceneProps) {
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
  const { startCooldown } = useDrinkCooldown();

  // ---- Event state ----
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [drinkRestricted, setDrinkRestricted] = useState(false);
  const firedEventsRef = useRef<Set<EventType>>(new Set());
  const restrictionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Trigger events at workday progress thresholds ----
  useEffect(() => {
    if (!isPlaying) return;

    for (const event of GAME_EVENTS) {
      if (
        timeProgress >= event.threshold &&
        !firedEventsRef.current.has(event.type)
      ) {
        firedEventsRef.current.add(event.type);
        setActiveEvent(event);

        // Code review: restrict drinks for 15 seconds
        if (event.type === 'codeReview') {
          setDrinkRestricted(true);
          restrictionTimerRef.current = setTimeout(() => {
            setDrinkRestricted(false);
          }, 15_000);
        }

        // Only fire one event at a time
        break;
      }
    }
  }, [timeProgress, isPlaying]);

  // Cleanup restriction timer on unmount
  useEffect(() => {
    return () => {
      if (restrictionTimerRef.current) {
        clearTimeout(restrictionTimerRef.current);
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
      consumeDrink(boost, drinkType);
      startCooldown(drinkType);

      // Water heals the player
      if (drinkType === 'water') {
        healHealth(5);
      }
    },
    [drinkRestricted, consumeDrink, healHealth, startCooldown],
  );

  // ---- Banner complete handler ----
  const handleBannerComplete = useCallback(() => {
    setActiveEvent(null);
  }, []);

  // ---- Derived values ----
  const multiplier = stats.isInOptimalZone ? 2 : 1;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Layer 1 — Background (absolute inset-0, centered) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <WorkspaceBackgroundSVG
          caffeineLevel={caffeinePercentage}
          timeProgress={timeProgress / 100}
          drinksConsumed={stats.drinksConsumed}
          isActive={isPlaying}
        />
      </div>

      {/* Layer 2 — Character (absolute inset-0, centered) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {character === 'officeWorker' ? (
          <OfficeWorkerSVG
            caffeineLevel={caffeinePercentage}
            width={320}
            height={320}
            isActive={isPlaying}
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

      {/* Layer 4 — Drink Toolbar (z-20) */}
      <DrinkToolbar
        onConsume={handleConsume}
        onPause={pauseGame}
        disabled={drinkRestricted}
        isActive={isPlaying}
      />

      {/* Layer 5 — Drink Restricted indicator (z-25) */}
      {drinkRestricted && (
        <div className="absolute inset-x-0 bottom-24 z-25 flex items-center justify-center pointer-events-none">
          <span className="animate-pulse text-2xl font-bold text-red-500 drop-shadow-lg">
            No Drinks Allowed!
          </span>
        </div>
      )}

      {/* Layer 6 — Event Banner (z-30) */}
      {activeEvent && (
        <div className="absolute inset-x-0 top-16 z-30 flex justify-center pointer-events-none">
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
