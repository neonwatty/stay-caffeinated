'use client';

/**
 * GameScene - Main playing-state view that layers background, character,
 * HUD, drink bar, and event banners.
 */

import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
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

const TRIPPED_OUT_CAFFEINE_THRESHOLD = 95;

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
  const isTrippedOut = caffeinePercentage > TRIPPED_OUT_CAFFEINE_THRESHOLD;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Layer 1 — Background (absolute inset-0, centered) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <WorkspaceBackgroundSVG
          caffeineLevel={caffeinePercentage}
          timeProgress={timeProgress / 100}
          drinksConsumed={stats.drinksConsumed}
          isActive={isPlaying}
        />
      </div>

      {/* Layer 1b — Extreme caffeine trip overlay */}
      {isTrippedOut && isPlaying && (
        <TrippedOutOverlay caffeineLevel={caffeinePercentage} />
      )}

      {/* Layer 2 — Character (absolute inset-0, centered) */}
      <div
        data-testid="character-layer"
        className="absolute inset-0 z-[6] flex items-center justify-center pointer-events-none"
      >
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

function TrippedOutOverlay({ caffeineLevel }: { caffeineLevel: number }) {
  const intensity = Math.min(
    1,
    Math.max(0, (caffeineLevel - TRIPPED_OUT_CAFFEINE_THRESHOLD) / 5),
  );
  const portalOpacity = 0.72 + intensity * 0.2;
  const washOpacity = 0.18 + intensity * 0.15;
  const spiralPaths = [
    'M 500 500 C 535 472 575 468 610 490 C 650 515 645 568 602 592 C 548 621 480 592 458 534 C 430 458 486 378 570 366 C 674 351 760 438 748 546',
    'M 500 500 C 540 492 578 510 592 548 C 608 594 564 638 512 632 C 448 625 410 564 430 504 C 454 430 536 390 610 422 C 700 462 730 570 672 652',
    'M 500 500 C 525 530 526 570 500 600 C 468 636 410 625 386 580 C 356 524 386 454 445 430 C 520 399 606 438 632 516 C 666 620 592 722 480 730',
    'M 500 500 C 492 540 462 568 420 570 C 370 572 342 518 365 472 C 394 414 470 392 525 428 C 594 474 606 566 552 628 C 480 710 352 704 288 612',
    'M 500 500 C 466 520 426 512 400 480 C 368 440 394 388 446 378 C 510 366 568 414 572 480 C 578 562 512 632 428 630 C 320 628 244 520 278 414',
    'M 500 500 C 460 488 434 456 440 416 C 448 368 506 348 548 378 C 600 416 604 496 552 540 C 488 594 392 574 350 500 C 296 406 352 286 464 258',
    'M 500 500 C 476 468 482 428 514 402 C 554 370 606 394 616 446 C 628 510 580 568 514 572 C 432 578 362 512 364 428 C 366 320 474 244 580 278',
    'M 500 500 C 510 462 542 436 582 442 C 630 450 650 506 622 548 C 586 602 504 606 460 552 C 406 486 430 392 504 350 C 598 296 718 354 744 466',
    'M 500 500 C 532 476 572 482 598 514 C 630 554 606 606 554 616 C 490 628 432 580 428 514 C 422 432 488 362 572 364 C 680 366 756 474 722 580',
    'M 500 500 C 538 512 562 546 552 586 C 540 632 482 646 444 612 C 396 570 400 492 456 454 C 528 406 620 438 652 518 C 694 622 622 734 506 746',
    'M 500 500 C 518 536 506 574 470 594 C 424 620 374 582 374 528 C 374 462 434 410 500 424 C 584 442 636 526 608 608 C 572 716 448 762 344 706',
    'M 500 500 C 486 538 450 560 410 548 C 364 534 352 474 388 438 C 434 392 516 402 550 462 C 592 536 554 626 470 652 C 360 686 254 604 254 486',
  ];

  return (
    <div
      data-testid="tripped-out-overlay"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
    >
      <style>{`
        @keyframes portalSpin {
          0% { transform: rotate(0deg) scale(1); filter: hue-rotate(0deg) saturate(2); }
          50% { transform: rotate(180deg) scale(1.14); filter: hue-rotate(180deg) saturate(2.7); }
          100% { transform: rotate(360deg) scale(1); filter: hue-rotate(360deg) saturate(2); }
        }

        @keyframes portalSpiralCore {
          0% { transform: rotate(0deg) scale(0.96); filter: hue-rotate(0deg) saturate(2.1); }
          50% { transform: rotate(270deg) scale(1.08); filter: hue-rotate(170deg) saturate(3); }
          100% { transform: rotate(540deg) scale(0.96); filter: hue-rotate(360deg) saturate(2.1); }
        }

        @keyframes portalSpiralArm {
          0% { opacity: 0.42; transform: rotate(var(--spiral-angle)) translateX(10%) rotate(18deg) scaleX(0.9) skewY(-22deg); filter: hue-rotate(0deg); }
          42% { opacity: 1; transform: rotate(calc(var(--spiral-angle) + 62deg)) translateX(20%) rotate(42deg) scaleX(1.25) skewY(-34deg); filter: hue-rotate(150deg); }
          100% { opacity: 0.52; transform: rotate(calc(var(--spiral-angle) + 124deg)) translateX(12%) rotate(24deg) scaleX(0.95) skewY(-24deg); filter: hue-rotate(360deg); }
        }

        @keyframes portalCounterSpin {
          0% { transform: rotate(360deg) scale(1.04); }
          100% { transform: rotate(0deg) scale(1.04); }
        }

        @keyframes portalPulse {
          0%, 100% { opacity: 0.5; transform: scale(0.94); }
          50% { opacity: 0.86; transform: scale(1.08); }
        }

        @keyframes portalMouth {
          0%, 100% { transform: translate(-50%, -50%) scale(0.92); box-shadow: 0 0 24px rgba(14, 165, 233, 0.58), inset 0 0 26px rgba(0, 0, 0, 0.95); }
          50% { transform: translate(-50%, -50%) scale(1.08); box-shadow: 0 0 42px rgba(236, 72, 153, 0.72), inset 0 0 34px rgba(0, 0, 0, 1); }
        }

        @keyframes portalSpark {
          0% { transform: rotate(0deg) translateX(27%) scale(0.65); opacity: 0; }
          20% { opacity: 0.9; }
          100% { transform: rotate(360deg) translateX(43%) scale(1.15); opacity: 0; }
        }

        @keyframes portalChaos {
          0%, 100% { transform: rotate(0deg) scale(0.94) skewX(0deg); opacity: 0.48; filter: hue-rotate(0deg) contrast(1.2); }
          35% { transform: rotate(72deg) scale(1.08) skewX(7deg); opacity: 0.8; filter: hue-rotate(120deg) contrast(1.6); }
          70% { transform: rotate(210deg) scale(1.02) skewX(-9deg); opacity: 0.65; filter: hue-rotate(260deg) contrast(1.4); }
        }

        @keyframes portalRift {
          0%, 100% { opacity: 0.18; transform: rotate(var(--rift-angle)) translateX(29%) scaleY(0.6); filter: hue-rotate(0deg); }
          30% { opacity: 1; transform: rotate(calc(var(--rift-angle) + 8deg)) translateX(37%) scaleY(1.3); filter: hue-rotate(160deg); }
          65% { opacity: 0.46; transform: rotate(calc(var(--rift-angle) - 10deg)) translateX(34%) scaleY(0.9); filter: hue-rotate(300deg); }
        }

        @keyframes portalComet {
          0% { opacity: 0; transform: rotate(var(--comet-angle)) translateX(21%) scale(0.4); }
          18% { opacity: 1; }
          55% { opacity: 0.7; transform: rotate(calc(var(--comet-angle) + 190deg)) translateX(44%) scale(1.15); }
          100% { opacity: 0; transform: rotate(calc(var(--comet-angle) + 360deg)) translateX(50%) scale(0.7); }
        }

        @keyframes portalShockwave {
          0% { opacity: 0.16; transform: scale(0.18); border-width: 10px; filter: hue-rotate(0deg); }
          18% { opacity: 0.92; }
          100% { opacity: 0.08; transform: scale(1.42); border-width: 1px; filter: hue-rotate(260deg); }
        }

        @keyframes portalShard {
          0%, 100% { opacity: 0.42; transform: rotate(var(--shard-angle)) translateX(11%) skewY(0deg) scale(0.85); filter: hue-rotate(0deg); }
          45% { opacity: 0.95; transform: rotate(calc(var(--shard-angle) + 18deg)) translateX(19%) skewY(18deg) scale(1.18); filter: hue-rotate(190deg); }
          72% { opacity: 0.68; transform: rotate(calc(var(--shard-angle) - 12deg)) translateX(15%) skewY(-14deg) scale(0.96); filter: hue-rotate(310deg); }
        }

        @keyframes portalGlyph {
          0% { opacity: 0.36; transform: rotate(var(--glyph-angle)) translateX(19%) translateY(0) scale(0.7); filter: hue-rotate(0deg); }
          28% { opacity: 1; }
          100% { opacity: 0.22; transform: rotate(calc(var(--glyph-angle) + 95deg)) translateX(47%) translateY(-36px) scale(1.35); filter: hue-rotate(300deg); }
        }

        @keyframes portalTear {
          0%, 100% { opacity: 0.28; transform: translateX(-14px) scaleX(0.9); filter: hue-rotate(0deg); }
          22% { opacity: 0.98; transform: translateX(18px) scaleX(1.24); filter: hue-rotate(100deg); }
          48% { opacity: 0.56; transform: translateX(-30px) scaleX(1.55); filter: hue-rotate(220deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .portal-spin,
          .portal-rings,
          .portal-aura,
          .portal-mouth,
          .portal-spark,
          .portal-chaos-field,
          .portal-rift,
          .portal-comet,
          .portal-shockwave,
          .portal-kaleidoscope-shard,
          .portal-glyph,
          .portal-tear,
          .portal-spiral-core,
          .portal-spiral-arm {
            animation: none !important;
            transform: none !important;
          }

          .portal-mouth {
            transform: translate(-50%, -50%) !important;
          }
        }
      `}</style>
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          opacity: washOpacity,
          background:
            'radial-gradient(circle at 50% 48%, rgba(236,72,153,0.9), rgba(59,130,246,0.42) 28%, rgba(16,185,129,0.3) 48%, rgba(250,204,21,0.18) 60%, transparent 74%)',
          filter: 'blur(22px) saturate(1.7)',
        }}
      />
      <div
        data-testid="trippy-portal"
        className="absolute left-1/2 top-[45%] aspect-square w-[min(72vmin,680px)] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
        style={{
          opacity: portalOpacity,
          filter: 'drop-shadow(0 0 34px rgba(34,211,238,0.84)) drop-shadow(0 0 72px rgba(236,72,153,0.62))',
        }}
      >
        <div
          data-testid="portal-head-origin"
          className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.96), rgba(34,211,238,0.76) 42%, rgba(236,72,153,0.38) 62%, transparent 76%)',
            boxShadow:
              '0 0 20px rgba(255,255,255,0.82), 0 0 46px rgba(34,211,238,0.66), 0 0 78px rgba(236,72,153,0.58)',
          }}
        />
        <div
          className="portal-aura absolute -inset-20 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(250,204,21,0.45) 0 11%, rgba(236,72,153,0.5) 24%, rgba(59,130,246,0.38) 42%, rgba(34,197,94,0.26) 58%, transparent 74%)',
            animation: 'portalPulse 2.4s ease-in-out infinite',
          }}
        />
        {[0, 1, 2, 3].map((wave) => (
          <div
            key={`shockwave-${wave}`}
            data-testid="portal-shockwave"
            className="portal-shockwave absolute inset-10 rounded-full border-white/80"
            style={{
              borderStyle: 'solid',
              borderColor:
                wave % 2 === 0 ? 'rgba(255,255,255,0.82)' : 'rgba(45,212,191,0.72)',
              animation: `portalShockwave ${1.55 + wave * 0.16}s ease-out infinite`,
              animationDelay: `${wave * 0.32}s`,
              boxShadow: '0 0 22px rgba(255,255,255,0.55), inset 0 0 22px rgba(236,72,153,0.34)',
            }}
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((shard) => (
          <div
            key={`shard-${shard}`}
            data-testid="portal-kaleidoscope-shard"
            className="portal-kaleidoscope-shard absolute left-1/2 top-1/2 h-[52%] w-[12%] origin-bottom"
            style={{
              '--shard-angle': `${shard * 30}deg`,
              background:
                shard % 3 === 0
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.72), rgba(236,72,153,0.58), transparent)'
                  : shard % 3 === 1
                    ? 'linear-gradient(180deg, rgba(250,204,21,0.74), rgba(34,197,94,0.55), transparent)'
                    : 'linear-gradient(180deg, rgba(45,212,191,0.72), rgba(168,85,247,0.58), transparent)',
              clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
              mixBlendMode: 'screen',
              animation: `portalShard ${2 + (shard % 4) * 0.18}s ease-in-out infinite`,
              animationDelay: `${shard * 0.06}s`,
            } as CSSProperties}
          />
        ))}
        <div
          data-testid="portal-chaos-field"
          className="portal-chaos-field absolute -inset-6 rounded-full"
          style={{
            background:
              'repeating-conic-gradient(from 8deg, rgba(255,255,255,0.76) 0deg 2deg, transparent 2deg 12deg, rgba(45,212,191,0.48) 12deg 15deg, transparent 15deg 24deg, rgba(250,204,21,0.52) 24deg 27deg, transparent 27deg 38deg)',
            maskImage:
              'radial-gradient(circle, transparent 0 10%, black 16% 74%, transparent 84%)',
            WebkitMaskImage:
              'radial-gradient(circle, transparent 0 10%, black 16% 74%, transparent 84%)',
            animation: 'portalChaos 3.1s ease-in-out infinite',
          }}
        />
        <div
          data-testid="portal-spiral-core"
          className="portal-spiral-core absolute inset-[5%] rounded-full"
          style={{
            background:
              'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.95) 0deg 4deg, rgba(236,72,153,0.82) 4deg 11deg, rgba(34,211,238,0.9) 11deg 18deg, rgba(250,204,21,0.86) 18deg 25deg, rgba(34,197,94,0.82) 25deg 32deg, transparent 32deg 42deg)',
            maskImage:
              'radial-gradient(circle, transparent 0 12%, black 17% 68%, transparent 82%), repeating-radial-gradient(circle, black 0 3%, transparent 3.5% 6%)',
            WebkitMaskImage:
              'radial-gradient(circle, transparent 0 12%, black 17% 68%, transparent 82%), repeating-radial-gradient(circle, black 0 3%, transparent 3.5% 6%)',
            animation: 'portalSpiralCore 2.8s cubic-bezier(0.45, 0, 0.55, 1) infinite',
            filter: 'blur(0.8px) saturate(2.4)',
            opacity: 0.82,
          }}
        />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((arm) => (
          <div
            key={`spiral-arm-${arm}`}
            data-testid="portal-spiral-arm"
            className="portal-spiral-arm absolute left-1/2 top-1/2 h-[10%] w-[45%] origin-left rounded-[999px]"
            style={{
              '--spiral-angle': `${arm * 22.5}deg`,
              background:
                arm % 4 === 0
                  ? 'linear-gradient(90deg, rgba(255,255,255,0.98), rgba(236,72,153,0.82), transparent 78%)'
                  : arm % 4 === 1
                    ? 'linear-gradient(90deg, rgba(250,204,21,0.95), rgba(34,197,94,0.78), transparent 80%)'
                    : arm % 4 === 2
                      ? 'linear-gradient(90deg, rgba(34,211,238,0.95), rgba(59,130,246,0.76), transparent 78%)'
                      : 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(168,85,247,0.82), transparent 80%)',
              clipPath:
                'polygon(0 46%, 16% 0, 38% 12%, 62% 44%, 100% 35%, 100% 70%, 62% 82%, 36% 100%, 14% 84%, 0 58%)',
              mixBlendMode: 'screen',
              boxShadow: '0 0 14px rgba(255,255,255,0.34)',
              animation: `portalSpiralArm ${1.65 + (arm % 5) * 0.12}s ease-in-out infinite`,
              animationDelay: `${arm * 0.045}s`,
            } as CSSProperties}
          />
        ))}
        <svg
          data-testid="portal-spiral-svg"
          className="portal-spiral-core absolute inset-0 h-full w-full"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid meet"
          style={{
            animation: 'portalSpiralCore 3.8s cubic-bezier(0.45, 0, 0.55, 1) infinite',
            filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.72)) drop-shadow(0 0 30px rgba(34,211,238,0.58))',
            opacity: 0.9,
          }}
        >
          <defs>
            <linearGradient id="portal-spiral-stroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="24%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="48%" stopColor="rgba(34,211,238,0.9)" />
              <stop offset="72%" stopColor="rgba(236,72,153,0.88)" />
              <stop offset="100%" stopColor="rgba(250,204,21,0)" />
            </linearGradient>
          </defs>
          {spiralPaths.map((path, index) => (
            <path
              key={`spiral-path-${index}`}
              data-testid="portal-spiral-path"
              d={path}
              fill="none"
              stroke="url(#portal-spiral-stroke)"
              strokeLinecap="round"
              strokeWidth={index % 3 === 0 ? 18 : 12}
              opacity={0.62 + (index % 4) * 0.08}
              transform={`rotate(${index * 30} 500 500)`}
            />
          ))}
        </svg>
        <div
          className="portal-spin absolute inset-0 rounded-full"
          style={{
            background:
              'repeating-conic-gradient(from 18deg, rgba(236,72,153,1) 0deg 7deg, rgba(59,130,246,0.62) 7deg 13deg, rgba(34,197,94,0.98) 13deg 21deg, rgba(250,204,21,1) 21deg 29deg, rgba(249,115,22,0.7) 29deg 36deg, rgba(168,85,247,1) 36deg 45deg)',
            maskImage:
              'radial-gradient(circle, transparent 0 13%, black 18% 64%, transparent 76%)',
            WebkitMaskImage:
              'radial-gradient(circle, transparent 0 13%, black 18% 64%, transparent 76%)',
            animation: 'portalSpin 3.2s linear infinite',
            filter: 'blur(1.2px) saturate(2.45)',
          }}
        />
        <div
          className="portal-rings absolute inset-8 rounded-full"
          style={{
            background:
              'repeating-radial-gradient(circle, transparent 0 8%, rgba(255,255,255,0.42) 8.7% 9.2%, transparent 10% 15%), conic-gradient(from 90deg, rgba(45,212,191,0.42), rgba(236,72,153,0.38), rgba(250,204,21,0.34), rgba(45,212,191,0.42))',
            maskImage:
              'radial-gradient(circle, transparent 0 18%, black 22% 70%, transparent 76%)',
            WebkitMaskImage:
              'radial-gradient(circle, transparent 0 18%, black 22% 70%, transparent 76%)',
            animation: 'portalCounterSpin 7.2s linear infinite',
          }}
        />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((rift) => (
          <div
            key={`rift-${rift}`}
            data-testid="portal-rift"
            className="portal-rift absolute left-1/2 top-1/2 h-[4px] w-[44%] origin-left rounded-full"
            style={{
              '--rift-angle': `${rift * 40}deg`,
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.96), rgba(250,204,21,0.85) 28%, rgba(236,72,153,0.62) 58%, transparent)',
              clipPath:
                'polygon(0 45%, 13% 0, 26% 58%, 39% 12%, 50% 70%, 65% 18%, 78% 82%, 100% 42%, 100% 62%, 76% 100%, 62% 52%, 48% 96%, 35% 45%, 22% 88%, 10% 50%, 0 72%)',
              animation: `portalRift ${1.7 + (rift % 3) * 0.22}s ease-in-out infinite`,
              animationDelay: `${rift * 0.09}s`,
            } as CSSProperties}
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((comet) => (
          <div
            key={`comet-${comet}`}
            data-testid="portal-comet"
            className="portal-comet absolute left-1/2 top-1/2 h-4 w-24 origin-left rounded-full"
            style={{
              '--comet-angle': `${comet * 45}deg`,
              background:
                'linear-gradient(90deg, rgba(255,255,255,1), rgba(34,211,238,0.9) 34%, rgba(236,72,153,0.72) 62%, transparent)',
              boxShadow: '0 0 14px rgba(255,255,255,0.75), 0 0 28px rgba(34,211,238,0.55)',
              animation: `portalComet ${1.35 + (comet % 4) * 0.16}s linear infinite`,
              animationDelay: `${comet * 0.11}s`,
            } as CSSProperties}
          />
        ))}
        {['☕', '⚡', '∞', '!!!', '404', '++', '✦', '0xC0F', 'WAKE', '???'].map((glyph, index) => (
          <div
            key={`glyph-${glyph}-${index}`}
            data-testid="portal-glyph"
            className="portal-glyph absolute left-1/2 top-1/2 select-none font-mono text-lg font-black tracking-widest text-white"
            style={{
              '--glyph-angle': `${index * 36}deg`,
              textShadow:
                '0 0 8px rgba(255,255,255,0.95), 0 0 18px rgba(236,72,153,0.85), 0 0 28px rgba(34,211,238,0.75)',
              color:
                index % 3 === 0 ? '#FDE047' : index % 3 === 1 ? '#67E8F9' : '#F0ABFC',
              animation: `portalGlyph ${1.8 + (index % 5) * 0.14}s linear infinite`,
              animationDelay: `${index * 0.1}s`,
            } as CSSProperties}
          >
            {glyph}
          </div>
        ))}
        {[0, 1, 2, 3, 4, 5].map((spark) => (
          <div
            key={spark}
            className="portal-spark absolute left-1/2 top-1/2 h-3 w-16 origin-left rounded-full"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.96), rgba(45,212,191,0.7), transparent)',
              animation: `portalSpark ${1.2 + spark * 0.12}s linear infinite`,
              animationDelay: `${spark * 0.18}s`,
              transform: `rotate(${spark * 60}deg) translateX(34%)`,
            }}
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((tear) => (
          <div
            key={`tear-${tear}`}
            data-testid="portal-tear"
            className="portal-tear absolute left-[3%] right-[3%] h-[5px] rounded-full"
            style={{
              top: `${18 + tear * 10}%`,
              background:
                tear % 2 === 0
                  ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), rgba(236,72,153,0.75), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(34,211,238,0.88), rgba(250,204,21,0.7), transparent)',
              boxShadow:
                '0 0 10px rgba(255,255,255,0.72), 0 0 22px rgba(34,211,238,0.42)',
              animation: `portalTear ${0.85 + (tear % 3) * 0.14}s steps(2, end) infinite`,
              animationDelay: `${tear * 0.07}s`,
            }}
          />
        ))}
        <div
          data-testid="portal-mouth"
          className="portal-mouth absolute left-1/2 top-1/2 aspect-square w-[18%] rounded-full opacity-80"
          style={{
            background:
              'radial-gradient(circle, rgba(5,0,18,0.96) 0 34%, rgba(49,46,129,0.84) 46%, rgba(14,165,233,0.44) 61%, transparent 74%)',
            animation: 'portalMouth 1.8s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}
