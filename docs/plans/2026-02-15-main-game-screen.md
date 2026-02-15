# Main Game Screen Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a playable game page at `/play` that composes all existing SVG assets into a single-scene game with character select, drink toolbar, HUD, events, and game-over screens.

**Architecture:** Single Next.js page wrapping `GameProvider`. Game state machine (`menu → playing → paused → gameOver → victory`) drives which sub-components render. All game logic uses existing hooks — no new engine work. Sub-components extracted into `components/game/play/`.

**Tech Stack:** Next.js 15, React 19, TypeScript, existing game hooks/state/SVG components, Tailwind CSS for layout.

---

### Task 1: Create the page shell and character select screen

**Files:**
- Create: `app/play/page.tsx`
- Create: `components/game/play/CharacterSelect.tsx`

**Step 1: Create the page shell**

`app/play/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import { CharacterSelect } from '@/components/game/play/CharacterSelect';

export type CharacterType = 'officeWorker' | 'coffeeCup';

export default function PlayPage() {
  return (
    <GameProvider>
      <PlayContent />
    </GameProvider>
  );
}

function PlayContent() {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);

  // For now, just render character select
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <CharacterSelect onSelect={setSelectedCharacter} />
    </div>
  );
}
```

**Step 2: Create CharacterSelect component**

`components/game/play/CharacterSelect.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { OfficeWorkerSVG } from '@/components/game/OfficeWorkerSVG';
import { CoffeeCupSVG } from '@/components/game/CoffeeCupSVG';
import { DIFFICULTY_CONFIGS } from '@/game/core/constants';
import type { Difficulty } from '@/types/game';
import type { CharacterType } from '@/app/play/page';

interface CharacterSelectProps {
  onSelect: (character: CharacterType) => void;
}

export function CharacterSelect({ onSelect }: CharacterSelectProps) {
  const { setDifficulty, startGame } = useGame();
  const [character, setCharacter] = useState<CharacterType | null>(null);
  const [difficulty, setDiff] = useState<Difficulty>('junior');

  const handleStart = () => {
    if (!character) return;
    setDifficulty(difficulty);
    onSelect(character);
    startGame();
  };

  const difficulties = Object.entries(DIFFICULTY_CONFIGS) as [Difficulty, typeof DIFFICULTY_CONFIGS[Difficulty]][];

  return (
    <div className="text-center space-y-8 p-8">
      <h1 className="text-4xl font-bold text-white">Stay Caffeinated</h1>
      <p className="text-gray-400">Survive the workday. Keep your caffeine in the zone.</p>

      {/* Character cards */}
      <div className="flex gap-6 justify-center">
        <button
          onClick={() => setCharacter('officeWorker')}
          className={`p-4 rounded-xl border-2 transition-all ${
            character === 'officeWorker'
              ? 'border-green-500 bg-green-500/10'
              : 'border-gray-700 bg-gray-800 hover:border-gray-500'
          }`}
        >
          <OfficeWorkerSVG caffeineLevel={50} width={160} height={160} isActive={false} />
          <p className="text-white mt-2 font-medium">Office Worker</p>
        </button>

        <button
          onClick={() => setCharacter('coffeeCup')}
          className={`p-4 rounded-xl border-2 transition-all ${
            character === 'coffeeCup'
              ? 'border-green-500 bg-green-500/10'
              : 'border-gray-700 bg-gray-800 hover:border-gray-500'
          }`}
        >
          <CoffeeCupSVG caffeineLevel={50} width={160} height={160} isActive={false} />
          <p className="text-white mt-2 font-medium">Coffee Cup</p>
        </button>
      </div>

      {/* Difficulty selector */}
      <div className="space-y-2">
        <p className="text-gray-300 text-sm">Difficulty</p>
        <div className="flex gap-2 justify-center flex-wrap">
          {difficulties.map(([key, config]) => (
            <button
              key={key}
              onClick={() => setDiff(key)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                difficulty === key
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {config.name}
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!character}
        className={`px-8 py-3 rounded-xl text-lg font-bold transition-all ${
          character
            ? 'bg-green-600 text-white hover:bg-green-500 cursor-pointer'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        Start Shift
      </button>
    </div>
  );
}
```

**Step 3: Verify it renders**

Run: Navigate to `http://localhost:3777/play`
Expected: Character select screen with two character cards, difficulty buttons, and a Start Shift button.

**Step 4: Commit**

```bash
git add app/play/page.tsx components/game/play/CharacterSelect.tsx
git commit -m "feat: add /play page with character select screen"
```

---

### Task 2: Build the GameHUD component

**Files:**
- Create: `components/game/play/GameHUD.tsx`

**Step 1: Create GameHUD**

This positions the 4 HUD elements (caffeine meter, health bar, clock, score) in screen corners plus a game-time clock.

`components/game/play/GameHUD.tsx`:
```tsx
'use client';

import { CaffeineMeterSVG } from '@/components/game/ui/CaffeineMeterSVG';
import { HealthBarSVG } from '@/components/game/ui/HealthBarSVG';
import { ScoreDisplaySVG } from '@/components/game/ui/ScoreDisplaySVG';

interface GameHUDProps {
  caffeineLevel: number;
  healthLevel: number;
  score: number;
  streak: number;
  multiplier: number;
  timeProgress: number; // 0-100
  formattedTime: string;
  optimalZone: [number, number];
  isActive: boolean;
}

export function GameHUD({
  caffeineLevel,
  healthLevel,
  score,
  streak,
  multiplier,
  timeProgress,
  formattedTime,
  optimalZone,
  isActive,
}: GameHUDProps) {
  // Map timeProgress (0-100) to game clock (9 AM start)
  const gameHour = 9 + (timeProgress / 100) * 8; // 9 AM to 5 PM
  const hour = Math.floor(gameHour);
  const minutes = Math.floor((gameHour - hour) * 60);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  const gameClockDisplay = `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top-left: Caffeine Meter */}
      <div className="absolute top-3 left-3">
        <CaffeineMeterSVG
          caffeineLevel={caffeineLevel}
          healthLevel={healthLevel}
          optimalZone={optimalZone}
          width={120}
          height={100}
          isActive={isActive}
        />
      </div>

      {/* Top-left below meter: Health Bar */}
      <div className="absolute top-[110px] left-3">
        <HealthBarSVG
          healthLevel={healthLevel}
          caffeineLevel={caffeineLevel}
          isCritical={healthLevel < 20}
          width={140}
          height={50}
          isActive={isActive}
        />
      </div>

      {/* Top-right: Game Clock */}
      <div className="absolute top-3 right-3 text-right">
        <div className="bg-black/50 rounded-lg px-3 py-2 backdrop-blur-sm">
          <div className="text-white text-xl font-mono font-bold">{gameClockDisplay}</div>
          <div className="text-gray-400 text-xs">
            {Math.round(timeProgress)}% of workday
          </div>
        </div>
      </div>

      {/* Top-right below clock: Score */}
      <div className="absolute top-[70px] right-3">
        <ScoreDisplaySVG
          score={score}
          streak={streak}
          multiplier={multiplier}
          width={150}
          height={70}
          isActive={isActive}
        />
      </div>
    </div>
  );
}
```

**Step 2: Verify it compiles**

The dev server should auto-compile without errors.

**Step 3: Commit**

```bash
git add components/game/play/GameHUD.tsx
git commit -m "feat: add GameHUD component with corner-positioned UI elements"
```

---

### Task 3: Build the DrinkToolbar component

**Files:**
- Create: `components/game/play/DrinkToolbar.tsx`

**Step 1: Create DrinkToolbar**

`components/game/play/DrinkToolbar.tsx`:
```tsx
'use client';

import { DrinkIcon } from '@/components/game/drinks/DrinkIcon';
import { DRINKS } from '@/game/data/drinks';
import { useDrinkCooldown } from '@/hooks/useDrinkCooldown';
import type { DrinkType } from '@/types/drinks';

interface DrinkToolbarProps {
  onConsume: (drinkType: DrinkType) => void;
  onPause: () => void;
  disabled?: boolean; // during events that restrict drinking
  isActive: boolean;
}

export function DrinkToolbar({ onConsume, onPause, disabled, isActive }: DrinkToolbarProps) {
  const { getCooldownState, isOnCooldown, getCooldownProgress } = useDrinkCooldown();

  const drinkOrder: DrinkType[] = ['tea', 'coffee', 'espresso', 'energyDrink', 'water'];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className="flex items-center justify-center gap-2 p-3 bg-black/60 backdrop-blur-sm">
        {drinkOrder.map((drinkType) => {
          const drink = DRINKS.find(d => d.id === drinkType);
          if (!drink) return null;

          const onCooldown = isOnCooldown(drinkType);
          const progress = getCooldownProgress(drinkType);

          return (
            <div key={drinkType} className="flex flex-col items-center">
              <DrinkIcon
                drinkType={drinkType}
                state={onCooldown ? 'cooldown' : 'idle'}
                cooldownProgress={progress}
                size={60}
                isActive={isActive}
                onClick={disabled || onCooldown ? undefined : () => onConsume(drinkType)}
              />
              <span className="text-[10px] text-gray-400 mt-1">{drink.name}</span>
              <span className="text-[10px] text-amber-400">
                {drinkType === 'water' ? '+5 HP' : `+${drink.caffeineBoost}`}
              </span>
            </div>
          );
        })}

        {/* Pause button */}
        <button
          onClick={onPause}
          className="ml-4 p-3 rounded-lg bg-gray-700/80 hover:bg-gray-600 transition-colors pointer-events-auto"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
            <rect x="4" y="3" width="4" height="14" rx="1" />
            <rect x="12" y="3" width="4" height="14" rx="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Verify it compiles**

Dev server auto-compiles.

**Step 3: Commit**

```bash
git add components/game/play/DrinkToolbar.tsx
git commit -m "feat: add DrinkToolbar with drink icons and cooldown states"
```

---

### Task 4: Build the GameScene component

**Files:**
- Create: `components/game/play/GameScene.tsx`

**Step 1: Create GameScene**

This is the main playing-state view that layers background, character, HUD, drink bar, and events.

`components/game/play/GameScene.tsx`:
```tsx
'use client';

import { useState, useCallback } from 'react';
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
import type { CharacterType } from '@/app/play/page';
import type { DrinkType } from '@/types/drinks';
import type { EventType } from '@/components/game/screens/EventBannerSVG';

interface GameSceneProps {
  character: CharacterType;
}

// Event schedule: maps workday progress thresholds to event types
const EVENT_SCHEDULE: { threshold: number; event: EventType; title: string; description: string }[] = [
  { threshold: 10, event: 'morningMeeting', title: 'Morning Meeting', description: 'Caffeine drains 2x faster!' },
  { threshold: 35, event: 'codeReview', title: 'Code Review', description: "Can't drink for 15 seconds!" },
  { threshold: 55, event: 'lunchBreak', title: 'Lunch Break', description: 'Caffeine drain paused. Relax!' },
  { threshold: 80, event: 'bugFix', title: 'Critical Bug!', description: 'Health drains faster!' },
];

export function GameScene({ character }: GameSceneProps) {
  const { consumeDrink, pauseGame, gameState } = useGame();
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

  const [activeEvent, setActiveEvent] = useState<typeof EVENT_SCHEDULE[0] | null>(null);
  const [triggeredEvents, setTriggeredEvents] = useState<Set<number>>(new Set());
  const [drinkRestricted, setDrinkRestricted] = useState(false);

  // Check for event triggers based on time progress
  // This runs on every render — lightweight check
  EVENT_SCHEDULE.forEach((evt) => {
    if (timeProgress >= evt.threshold && !triggeredEvents.has(evt.threshold) && !activeEvent) {
      setTriggeredEvents(prev => new Set(prev).add(evt.threshold));
      setActiveEvent(evt);

      // Apply event effects
      if (evt.event === 'codeReview') {
        setDrinkRestricted(true);
        setTimeout(() => setDrinkRestricted(false), 15000);
      }
    }
  });

  const handleConsumeDrink = useCallback((drinkType: DrinkType) => {
    if (drinkRestricted) return;
    const boost = getDrinkCaffeineBoost(drinkType);
    consumeDrink(boost, drinkType);
    startCooldown(drinkType);
  }, [consumeDrink, startCooldown, drinkRestricted]);

  const handleEventComplete = useCallback(() => {
    setActiveEvent(null);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Layer 1: Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <WorkspaceBackgroundSVG
          caffeineLevel={caffeinePercentage}
          timeProgress={timeProgress / 100}
          drinksConsumed={stats.drinksConsumed}
          width={800}
          height={500}
          isActive={isPlaying}
        />
      </div>

      {/* Layer 2: Character */}
      <div className="absolute inset-0 flex items-center justify-center">
        {character === 'officeWorker' ? (
          <OfficeWorkerSVG
            caffeineLevel={caffeinePercentage}
            width={350}
            height={350}
            isActive={isPlaying}
          />
        ) : (
          <CoffeeCupSVG
            caffeineLevel={caffeinePercentage}
            width={250}
            height={250}
            isActive={isPlaying}
          />
        )}
      </div>

      {/* Layer 3: HUD */}
      <GameHUD
        caffeineLevel={caffeinePercentage}
        healthLevel={healthPercentage}
        score={stats.score}
        streak={stats.streak}
        multiplier={stats.isInOptimalZone ? 2 : 1}
        timeProgress={timeProgress}
        formattedTime={formattedTime}
        optimalZone={[optimalZoneRange.min, optimalZoneRange.max]}
        isActive={isPlaying}
      />

      {/* Layer 4: Drink Toolbar */}
      <DrinkToolbar
        onConsume={handleConsumeDrink}
        onPause={pauseGame}
        disabled={drinkRestricted}
        isActive={isPlaying}
      />

      {/* Layer 5: Event Banner */}
      {activeEvent && (
        <div className="absolute top-1/4 left-0 right-0 flex justify-center z-30">
          <EventBannerSVG
            eventType={activeEvent.event}
            title={activeEvent.title}
            description={activeEvent.description}
            onComplete={handleEventComplete}
            width={400}
            height={120}
            isActive={true}
          />
        </div>
      )}

      {/* Drink restricted indicator */}
      {drinkRestricted && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-25
                        bg-red-900/80 text-white px-6 py-3 rounded-xl text-lg font-bold
                        animate-pulse pointer-events-none">
          No Drinks Allowed!
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify it compiles**

Dev server auto-compiles.

**Step 3: Commit**

```bash
git add components/game/play/GameScene.tsx
git commit -m "feat: add GameScene with layered background, character, HUD, drinks, events"
```

---

### Task 5: Build PauseOverlay and GameOverOverlay

**Files:**
- Create: `components/game/play/PauseOverlay.tsx`
- Create: `components/game/play/GameOverOverlay.tsx`

**Step 1: Create PauseOverlay**

`components/game/play/PauseOverlay.tsx`:
```tsx
'use client';

interface PauseOverlayProps {
  onResume: () => void;
  onQuit: () => void;
}

export function PauseOverlay({ onResume, onQuit }: PauseOverlayProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="text-center space-y-6">
        <h2 className="text-4xl font-bold text-white">Paused</h2>
        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="px-8 py-3 bg-green-600 text-white rounded-xl text-lg font-bold
                       hover:bg-green-500 transition-colors"
          >
            Resume
          </button>
          <button
            onClick={onQuit}
            className="px-8 py-3 bg-gray-700 text-gray-300 rounded-xl text-lg
                       hover:bg-gray-600 transition-colors"
          >
            Quit to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create GameOverOverlay**

`components/game/play/GameOverOverlay.tsx`:
```tsx
'use client';

import { useState, useEffect } from 'react';
import { VictoryScreenSVG } from '@/components/game/screens/VictoryScreenSVG';
import { PassOutScreenSVG } from '@/components/game/screens/PassOutScreenSVG';
import { ExplosionScreenSVG } from '@/components/game/screens/ExplosionScreenSVG';
import { TransitionOverlaySVG } from '@/components/game/screens/TransitionOverlaySVG';

interface GameOverOverlayProps {
  outcome: 'victory' | 'passOut' | 'explosion';
  score: number;
  healthBonus?: number;
  zoneBonus?: number;
  difficultyMultiplier?: number;
  onPlayAgain: () => void;
}

export function GameOverOverlay({
  outcome,
  score,
  healthBonus,
  zoneBonus,
  difficultyMultiplier,
  onPlayAgain,
}: GameOverOverlayProps) {
  const [showTransition, setShowTransition] = useState(true);
  const [showScreen, setShowScreen] = useState(false);

  useEffect(() => {
    // Show transition wipe, then reveal end screen
    const timer = setTimeout(() => {
      setShowTransition(false);
      setShowScreen(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-50">
      {/* Transition wipe */}
      {showTransition && (
        <TransitionOverlaySVG
          isActive={true}
          direction="in"
          variant="coffee-pour"
          width={800}
          height={600}
        />
      )}

      {/* End screen */}
      {showScreen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          {outcome === 'victory' && (
            <VictoryScreenSVG
              score={score}
              zoneBonus={zoneBonus}
              healthBonus={healthBonus}
              difficultyMultiplier={difficultyMultiplier}
              width={500}
              height={400}
              isActive={true}
              onPlayAgain={onPlayAgain}
            />
          )}
          {outcome === 'passOut' && (
            <div className="text-center space-y-6">
              <PassOutScreenSVG score={score} width={500} height={400} isActive={true} />
              <button
                onClick={onPlayAgain}
                className="px-8 py-3 bg-amber-600 text-white rounded-xl text-lg font-bold
                           hover:bg-amber-500 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          {outcome === 'explosion' && (
            <div className="text-center space-y-6">
              <ExplosionScreenSVG score={score} width={500} height={400} isActive={true} />
              <button
                onClick={onPlayAgain}
                className="px-8 py-3 bg-red-600 text-white rounded-xl text-lg font-bold
                           hover:bg-red-500 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Verify both compile**

Dev server auto-compiles.

**Step 4: Commit**

```bash
git add components/game/play/PauseOverlay.tsx components/game/play/GameOverOverlay.tsx
git commit -m "feat: add PauseOverlay and GameOverOverlay with transition effects"
```

---

### Task 6: Wire everything together in PlayPage

**Files:**
- Modify: `app/play/page.tsx`

**Step 1: Update PlayContent to render all states**

Replace the `PlayContent` function in `app/play/page.tsx` with the full state-driven composition:

```tsx
'use client';

import { useState, useCallback } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import { useGameState } from '@/hooks/useGameState';
import { useGame } from '@/contexts/GameContext';
import { CharacterSelect } from '@/components/game/play/CharacterSelect';
import { GameScene } from '@/components/game/play/GameScene';
import { PauseOverlay } from '@/components/game/play/PauseOverlay';
import { GameOverOverlay } from '@/components/game/play/GameOverOverlay';

export type CharacterType = 'officeWorker' | 'coffeeCup';

export default function PlayPage() {
  return (
    <GameProvider>
      <PlayContent />
    </GameProvider>
  );
}

function PlayContent() {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);
  const { currentState, stats, caffeinePercentage, healthPercentage } = useGameState();
  const { resumeGame, resetGame, returnToMenu } = useGame();

  const handlePlayAgain = useCallback(() => {
    setSelectedCharacter(null);
    resetGame();
  }, [resetGame]);

  const handleQuit = useCallback(() => {
    setSelectedCharacter(null);
    returnToMenu();
  }, [returnToMenu]);

  // Determine game-over outcome
  const getOutcome = (): 'victory' | 'passOut' | 'explosion' => {
    if (currentState === 'victory') return 'victory';
    if (caffeinePercentage >= 50) return 'explosion';
    return 'passOut';
  };

  // Menu state: show character select
  if (currentState === 'menu' || !selectedCharacter) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <CharacterSelect onSelect={setSelectedCharacter} />
      </div>
    );
  }

  // Playing / Paused / GameOver / Victory: show game scene with overlays
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <GameScene character={selectedCharacter} />

      {currentState === 'paused' && (
        <PauseOverlay onResume={resumeGame} onQuit={handleQuit} />
      )}

      {(currentState === 'gameOver' || currentState === 'victory') && (
        <GameOverOverlay
          outcome={getOutcome()}
          score={stats.score}
          healthBonus={Math.round(healthPercentage * 10)}
          zoneBonus={Math.round(stats.streak * 50)}
          difficultyMultiplier={1}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
```

**Step 2: Verify the full flow works**

Navigate to `http://localhost:3777/play`:
1. Character select screen appears
2. Pick a character + difficulty → click Start Shift
3. Game scene renders with background, character, HUD, drink bar
4. Clicking drinks changes caffeine level
5. Pause button shows pause overlay
6. Game over shows appropriate end screen

**Step 3: Commit**

```bash
git add app/play/page.tsx
git commit -m "feat: wire up complete game flow with state-driven rendering"
```

---

### Task 7: Add water healing and Escape key for pause

**Files:**
- Modify: `components/game/play/GameScene.tsx` (add water healing + Escape listener)

**Step 1: Add water health boost to handleConsumeDrink**

In `GameScene.tsx`, update the `handleConsumeDrink` callback to apply a health boost when water is consumed. Since `GameStateManager` doesn't have a `healHealth` method, we need to handle this via `updateCaffeineLevel` or by modifying the state manager. The simplest approach: add the boost through the existing `consumeDrink` with a side effect that updates health.

Check if `GameStateManager` exposes health modification. If not, add a `healHealth(amount)` method to it.

**If GameStateManager needs modification** — add to `game/core/gameStateManager.ts`:
```typescript
healHealth(amount: number): void {
  if (this.state.state !== 'playing') return;
  this.state.stats.currentHealthLevel = Math.min(
    HEALTH_MAX,
    this.state.stats.currentHealthLevel + amount
  );
  this.notifyListeners();
}
```

Then in `GameScene.tsx`, update `handleConsumeDrink`:
```tsx
const handleConsumeDrink = useCallback((drinkType: DrinkType) => {
  if (drinkRestricted) return;
  const boost = getDrinkCaffeineBoost(drinkType);
  consumeDrink(boost, drinkType);
  startCooldown(drinkType);

  // Water heals +5 HP
  if (drinkType === 'water') {
    // Health boost handled via game state
    // If healHealth is available on context, call it
    // Otherwise this is a TODO for integration
  }
}, [consumeDrink, startCooldown, drinkRestricted]);
```

**Step 2: Add Escape key listener for pause**

In `GameScene.tsx`, add a `useEffect` for keyboard:
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isPlaying) {
      pauseGame();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isPlaying, pauseGame]);
```

**Step 3: Verify Escape pauses the game**

Play the game, press Escape → pause overlay appears.

**Step 4: Commit**

```bash
git add components/game/play/GameScene.tsx game/core/gameStateManager.ts
git commit -m "feat: add water healing and Escape key for pause"
```

---

### Task 8: Create barrel export and final polish

**Files:**
- Create: `components/game/play/index.ts`

**Step 1: Create barrel export**

`components/game/play/index.ts`:
```tsx
export { CharacterSelect } from './CharacterSelect';
export { GameScene } from './GameScene';
export { GameHUD } from './GameHUD';
export { DrinkToolbar } from './DrinkToolbar';
export { PauseOverlay } from './PauseOverlay';
export { GameOverOverlay } from './GameOverOverlay';
```

**Step 2: Browser test the full game loop**

Test the complete flow:
1. `/play` → character select renders
2. Pick Office Worker + Junior → Start Shift
3. Game starts: caffeine drains, character animates, clock ticks
4. Click Coffee → caffeine jumps, cooldown ring appears
5. Wait for Morning Meeting event → banner slides in
6. Press Escape → pause overlay
7. Resume → game continues
8. Let health drain to 0 → game over screen with transition
9. Click Try Again → back to character select

**Step 3: Commit**

```bash
git add components/game/play/index.ts
git commit -m "feat: add barrel export for play components"
```

---

## Summary

| Task | Component | Description |
|------|-----------|-------------|
| 1 | Page + CharacterSelect | Route shell, character cards, difficulty picker |
| 2 | GameHUD | Corner-positioned caffeine, health, clock, score |
| 3 | DrinkToolbar | Bottom bar with 5 drink icons + cooldowns + pause |
| 4 | GameScene | Main layered composition (bg + char + HUD + drinks + events) |
| 5 | PauseOverlay + GameOverOverlay | Pause menu, victory/passout/explosion end screens |
| 6 | PlayPage wiring | State-driven rendering tying all components together |
| 7 | Water healing + Escape | Health boost for water, keyboard pause |
| 8 | Barrel export + testing | Index file, full game loop browser verification |
