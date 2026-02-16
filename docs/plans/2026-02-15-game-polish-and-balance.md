# Game Polish & Balance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix HUD display bugs, rebalance caffeine/health/workday timing, add drink feedback juice, and clean up visuals — all from the approved design at `docs/plans/07-game-polish-and-balance-design.md`.

**Architecture:** Four independently shippable layers applied to existing game components. Layer 1 (bug fixes) and Layer 2 (balance) are constant/display changes. Layer 3 (juice) adds a new FloatingText component + CSS animations. Layer 4 (visual cleanup) adjusts sizes and adds a progress bar + zone label.

**Tech Stack:** React 19, Next.js 15, TypeScript, Tailwind CSS, SVG, CSS keyframe animations

---

### Task 1: Fix HUD Number Formatting (Score)

**Files:**
- Modify: `components/game/ui/ScoreDisplaySVG.tsx:100-102`
- Modify: `components/game/ui/ScoreDisplaySVG.tsx:171`

**Step 1: Fix score formatting — clamp to non-negative**

In `ScoreDisplaySVG.tsx`, the `formatScore` function (line 100-102) already uses `toLocaleString()` which handles commas. But the score can go negative. Fix by clamping:

```typescript
const formatScore = (s: number): string => {
  return Math.max(0, Math.round(s)).toLocaleString();
};
```

**Step 2: Fix streak display — round to integer**

In `ScoreDisplaySVG.tsx`, line 171 displays `{streak}s streak` where streak is a raw float. Fix:

```tsx
{Math.round(streak)}s streak
```

**Step 3: Verify in browser**

Run: Open `/play`, start a game, confirm:
- Score shows as "1,234" not "1234.56789"
- Score never shows negative
- Streak shows "45s streak" not "45.102299s streak"

**Step 4: Commit**

```bash
git add components/game/ui/ScoreDisplaySVG.tsx
git commit -m "fix: clamp score non-negative, round streak display in ScoreDisplaySVG"
```

---

### Task 2: Fix HUD Number Formatting (Caffeine Meter)

**Files:**
- Modify: `components/game/ui/CaffeineMeterSVG.tsx:201-204`

**Step 1: Round caffeine level text**

In `CaffeineMeterSVG.tsx`, line 203 displays `{level}%`. The `level` variable is already clamped (line 33) but not rounded. Fix line 33:

```typescript
const level = Math.round(Math.max(0, Math.min(100, caffeineLevel)));
```

**Step 2: Verify in browser**

Run: Open `/play`, start a game, confirm caffeine meter shows "52%" not "52.38291%"

**Step 3: Commit**

```bash
git add components/game/ui/CaffeineMeterSVG.tsx
git commit -m "fix: round caffeine level display in CaffeineMeterSVG"
```

---

### Task 3: Balance Tuning — Caffeine Depletion Rates

**Files:**
- Modify: `game/core/constants.ts:37,44,49,58`

**Step 1: Update caffeine depletion rates**

In `constants.ts`, update `caffeineDepletionRate` for each difficulty:

```typescript
export const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
  intern: {
    name: 'Intern',
    workdayLength: 6 * 60,
    optimalZoneSize: 50,
    caffeineDepletionRate: 0.15,
    description: 'Easy mode - shorter day, larger optimal zone'
  },
  junior: {
    name: 'Junior Dev',
    workdayLength: 8 * 60,
    optimalZoneSize: 40,
    caffeineDepletionRate: 0.25,
    description: 'Normal mode - standard workday'
  },
  senior: {
    name: 'Senior Dev',
    workdayLength: 10 * 60,
    optimalZoneSize: 30,
    caffeineDepletionRate: 0.35,
    description: 'Hard mode - longer day, smaller optimal zone'
  },
  founder: {
    name: 'Startup Founder',
    workdayLength: 14 * 60,
    optimalZoneSize: 20,
    caffeineDepletionRate: 0.5,
    description: 'Extreme mode - very long day, tiny optimal zone'
  }
};
```

**Step 2: Verify in browser**

Run: Open `/play`, select Junior, start game. Caffeine should drain from 40% to ~0% in roughly 160s (40 / 0.25), not in ~6 seconds. You should need to drink every ~8-12 seconds, not every 2-3 seconds.

**Step 3: Commit**

```bash
git add game/core/constants.ts
git commit -m "balance: slow caffeine depletion rates ~3x across all difficulties"
```

---

### Task 4: Balance Tuning — Workday, Health, Starting Caffeine

**Files:**
- Modify: `game/core/constants.ts:10`
- Modify: `game/core/constants.ts:23`
- Modify: `game/core/gameStateManager.ts:49,91`

**Step 1: Extend workday real time to 4 minutes**

In `constants.ts` line 10:

```typescript
export const WORKDAY_REAL_TIME = 4 * 60 * 1000; // 4 minutes in milliseconds
```

**Step 2: Reduce health depletion rate**

In `constants.ts` line 23:

```typescript
export const HEALTH_DEPLETION_RATE = 0.3; // per second when outside optimal zone
```

**Step 3: Lower starting caffeine to 40%**

In `gameStateManager.ts`, change the starting caffeine in both `createInitialState` (line 49) and `startGame` (line 91):

```typescript
// line 49 in createInitialState
currentCaffeineLevel: 40,
```

```typescript
// line 91 in startGame
currentCaffeineLevel: 40,
```

**Step 4: Verify in browser**

Run: Open `/play`, start a game:
- Game clock should span 4 minutes real time (9AM → 5PM)
- Starting caffeine should read 40%
- Health should drain noticeably slower when outside optimal zone

**Step 5: Commit**

```bash
git add game/core/constants.ts game/core/gameStateManager.ts
git commit -m "balance: extend workday to 4min, slow health drain, start caffeine at 40%"
```

---

### Task 5: Game Juice — FloatingText Component

**Files:**
- Create: `components/game/play/FloatingText.tsx`

**Step 1: Create FloatingText component**

This component renders a "+30" or "+5 HP" text that floats up and fades out over ~1s using CSS keyframes.

```tsx
'use client';

import { useEffect, useState } from 'react';

interface FloatingTextProps {
  text: string;
  color: string;         // e.g. '#D97706' for amber, '#22C55E' for green
  onComplete?: () => void;
}

export function FloatingText({ text, color, onComplete }: FloatingTextProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <span
      className="pointer-events-none absolute text-lg font-bold drop-shadow-lg"
      style={{
        color,
        animation: 'floatUp 1s ease-out forwards',
      }}
    >
      {text}
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
      `}</style>
    </span>
  );
}
```

**Step 2: Verify component renders**

Manually import and render in any page to confirm the text floats up and fades.

**Step 3: Commit**

```bash
git add components/game/play/FloatingText.tsx
git commit -m "feat: add FloatingText component for drink feedback juice"
```

---

### Task 6: Game Juice — Wire FloatingText + Icon Bounce into DrinkToolbar

**Files:**
- Modify: `components/game/play/DrinkToolbar.tsx`

**Step 1: Add floating text state and icon bounce**

Update `DrinkToolbar.tsx` to track which drink was just consumed and show a FloatingText. Add a bounce CSS class on click.

Replace the entire `DrinkToolbar.tsx` with:

```tsx
'use client';

import { useState, useCallback } from 'react';
import { DrinkIcon } from '@/components/game/drinks/DrinkIcon';
import { FloatingText } from '@/components/game/play/FloatingText';
import { DRINKS } from '@/game/data/drinks';
import { useDrinkCooldown } from '@/hooks/useDrinkCooldown';
import type { DrinkType } from '@/types/drinks';

interface DrinkToolbarProps {
  onConsume: (drinkType: DrinkType) => void;
  onPause: () => void;
  disabled?: boolean;
  isActive: boolean;
}

const TOOLBAR_DRINKS: DrinkType[] = ['tea', 'coffee', 'espresso', 'energyDrink', 'water'];

function getCaffeineLabel(drinkType: DrinkType): string {
  if (drinkType === 'water') return '+5 HP';
  const drink = DRINKS.find((d) => d.id === drinkType);
  return drink ? `+${drink.caffeineBoost}` : '';
}

interface FloatingItem {
  id: number;
  drinkType: DrinkType;
}

let floatingId = 0;

export function DrinkToolbar({ onConsume, onPause, disabled = false, isActive }: DrinkToolbarProps) {
  const { isOnCooldown, getCooldownProgress } = useDrinkCooldown();
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);
  const [bouncingDrink, setBouncingDrink] = useState<DrinkType | null>(null);

  const handleClick = useCallback((drinkType: DrinkType) => {
    onConsume(drinkType);

    // Trigger floating text
    const id = ++floatingId;
    setFloatingItems((prev) => [...prev, { id, drinkType }]);

    // Trigger bounce
    setBouncingDrink(drinkType);
    setTimeout(() => setBouncingDrink(null), 200);
  }, [onConsume]);

  const removeFloating = useCallback((id: number) => {
    setFloatingItems((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 bg-black/60 p-3 backdrop-blur-sm">
      {TOOLBAR_DRINKS.map((drinkType) => {
        const drink = DRINKS.find((d) => d.id === drinkType);
        if (!drink) return null;

        const onCooldown = isOnCooldown(drinkType);
        const progress = getCooldownProgress(drinkType);
        const isDisabled = onCooldown || disabled;
        const state: 'idle' | 'cooldown' = onCooldown ? 'cooldown' : 'idle';
        const isBouncing = bouncingDrink === drinkType;

        return (
          <div key={drinkType} className="relative flex flex-col items-center">
            <div
              style={{
                transform: isBouncing ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 200ms ease-out',
              }}
            >
              <DrinkIcon
                drinkType={drinkType}
                state={state}
                cooldownProgress={progress}
                size={64}
                isActive={isActive}
                onClick={isDisabled ? undefined : () => handleClick(drinkType)}
              />
            </div>
            <span className="mt-1 text-[10px] leading-tight text-gray-400">{drink.name}</span>
            <span className="text-[10px] leading-tight text-amber-400">{getCaffeineLabel(drinkType)}</span>

            {/* Floating text items for this drink */}
            {floatingItems
              .filter((f) => f.drinkType === drinkType)
              .map((f) => (
                <FloatingText
                  key={f.id}
                  text={getCaffeineLabel(drinkType)}
                  color={drinkType === 'water' ? '#22C55E' : '#D97706'}
                  onComplete={() => removeFloating(f.id)}
                />
              ))}
          </div>
        );
      })}

      {/* Pause button */}
      <button
        type="button"
        onClick={onPause}
        className="ml-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700 transition-colors hover:bg-gray-600"
        aria-label="Pause"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-gray-200">
          <rect x="2" y="1" width="4" height="14" rx="1" />
          <rect x="10" y="1" width="4" height="14" rx="1" />
        </svg>
      </button>
    </div>
  );
}
```

Key changes from original:
- DrinkIcon `size` changed from 48 to 64 (Layer 4: bigger icons)
- Added `FloatingText` import and floating item tracking
- Added bounce animation via `bouncingDrink` state
- Wrapped DrinkIcon in a div with scale transform for bounce

**Step 2: Verify in browser**

Run: Open `/play`, start game, click a drink:
- "+30" should float up from the icon in amber
- "+5 HP" should float up from water in green
- Icon should briefly scale up then back down

**Step 3: Commit**

```bash
git add components/game/play/DrinkToolbar.tsx
git commit -m "feat: add floating text + icon bounce feedback, increase drink icons to 64px"
```

---

### Task 7: Game Juice — Caffeine Meter Pulse on Change

**Files:**
- Modify: `components/game/ui/CaffeineMeterSVG.tsx`

**Step 1: Add pulse effect when caffeine changes significantly**

Add a ref to track previous caffeine level, and a `isPulsing` state that triggers a 300ms border glow when caffeine jumps (drink consumed = change > 5 in one frame).

At the top of the component function, add:

```tsx
const [isPulsing, setIsPulsing] = useState(false);
const prevCaffeineRef = useRef(caffeineLevel);

useEffect(() => {
  const delta = Math.abs(caffeineLevel - prevCaffeineRef.current);
  prevCaffeineRef.current = caffeineLevel;
  if (delta > 5) {
    setIsPulsing(true);
    const timer = setTimeout(() => setIsPulsing(false), 300);
    return () => clearTimeout(timer);
  }
}, [caffeineLevel]);
```

Add the required imports (`useState, useRef, useEffect`) to the existing import line.

Then on the SVG's outer `<div>`, add a conditional box-shadow:

```tsx
<div style={{
  width, height,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
  boxShadow: isPulsing ? `0 0 16px 4px ${liquidColor}` : 'none',
  transition: 'box-shadow 300ms ease-out',
}}>
```

Note: `liquidColor` is computed later in the component, so move this style to the `<svg>` wrapper or compute the pulse color from the existing `state` object. Simplest approach: apply the shadow to the outer div using the `state.isOptimal` check:

```tsx
boxShadow: isPulsing
  ? `0 0 16px 4px hsl(${state.hue}, ${state.sat}%, ${state.light}%)`
  : 'none',
```

**Step 2: Verify in browser**

Run: Open `/play`, drink coffee. The caffeine meter should briefly glow/pulse with the current liquid color.

**Step 3: Commit**

```bash
git add components/game/ui/CaffeineMeterSVG.tsx
git commit -m "feat: add caffeine meter pulse glow on drink consumption"
```

---

### Task 8: Visual Cleanup — Event Banner Display Time

**Files:**
- Modify: `components/game/screens/EventBannerSVG.tsx:79`

**Step 1: Increase banner display time from ~1.5s to 4s**

In `EventBannerSVG.tsx`, line 79, the slide-out animation starts at `2.8s` (0.5s slide-in + ~2.3s visible). Change the slide-out delay to `4.5s` (0.5s slide-in + 4s visible):

```tsx
animation: isActive
  ? `ebSlideIn-${animId} 0.5s ease-out forwards, ebSlideOut-${animId} 0.4s ease-in 4.5s forwards`
  : 'none',
```

**Step 2: Add semi-transparent backdrop**

Add a backdrop rect behind the banner for readability. Before the shadow rect (line 86), add:

```tsx
{/* Backdrop for readability */}
<rect x="-20" y="-10" width="440" height="140" rx="16" fill="rgba(0,0,0,0.4)" />
```

**Step 3: Verify in browser**

Run: Open `/play`, play until 10% progress (Morning Meeting event). Banner should stay visible for ~4 seconds and have a dark backdrop behind it.

**Step 4: Commit**

```bash
git add components/game/screens/EventBannerSVG.tsx
git commit -m "fix: increase event banner display to 4s, add dark backdrop"
```

---

### Task 9: Visual Cleanup — Optimal Zone Label on Caffeine Meter

**Files:**
- Modify: `components/game/ui/CaffeineMeterSVG.tsx`

**Step 1: Replace "opt" label with dynamic zone status**

In `CaffeineMeterSVG.tsx`, replace the zone label text (around line 167-169) with a dynamic label that shows the current zone status:

Replace:
```tsx
<text x="165" y={(zoneMinY + zoneMaxY) / 2 + 4} fontSize="10" fill="hsl(120, 50%, 55%)" opacity="0.6">
  opt
</text>
```

With:
```tsx
{state.isOptimal && (
  <text x="165" y={(zoneMinY + zoneMaxY) / 2 + 4} fontSize="10" fontWeight="bold"
    fill="hsl(120, 50%, 55%)">
    OPTIMAL
  </text>
)}
{state.isLow && (
  <text x="165" y={(zoneMinY + zoneMaxY) / 2 + 4} fontSize="10" fontWeight="bold"
    fill="#60A5FA">
    LOW
  </text>
)}
{state.isHigh && (
  <text x="165" y={(zoneMinY + zoneMaxY) / 2 + 4} fontSize="10" fontWeight="bold"
    fill="#F87171">
    HIGH
  </text>
)}
```

**Step 2: Verify in browser**

Run: Open `/play`, start game. The label next to the caffeine meter optimal zone should show:
- "OPTIMAL" in green when in zone
- "LOW" in blue when below zone
- "HIGH" in red when above zone

**Step 3: Commit**

```bash
git add components/game/ui/CaffeineMeterSVG.tsx
git commit -m "feat: dynamic OPTIMAL/LOW/HIGH zone label on caffeine meter"
```

---

### Task 10: Visual Cleanup — Workday Progress Bar

**Files:**
- Modify: `components/game/play/GameHUD.tsx`

**Step 1: Add a thin progress bar across the top of the screen**

In `GameHUD.tsx`, add a workday progress bar at the very top of the HUD div (before the caffeine meter). The bar should be a thin horizontal bar spanning the full width.

After the opening `<div className="absolute inset-0 pointer-events-none z-10">`, add:

```tsx
{/* Workday progress bar */}
<div className="absolute top-0 left-0 right-0 h-1.5 bg-black/30">
  <div
    className="h-full transition-all duration-500 ease-linear"
    style={{
      width: `${Math.max(0, Math.min(100, timeProgress))}%`,
      background: timeProgress > 80
        ? 'linear-gradient(90deg, #22C55E, #FFD700)'
        : 'linear-gradient(90deg, #3B82F6, #22C55E)',
    }}
  />
</div>
```

**Step 2: Verify in browser**

Run: Open `/play`, start game. A thin progress bar should appear at the very top of the screen, gradually filling from left to right over the course of the workday. It should turn golden near the end.

**Step 3: Commit**

```bash
git add components/game/play/GameHUD.tsx
git commit -m "feat: add workday progress bar across top of game screen"
```

---

### Task 11: Update Barrel Export

**Files:**
- Modify: `components/game/play/index.ts`

**Step 1: Add FloatingText to barrel export**

Add FloatingText to the barrel export file:

```typescript
export { FloatingText } from './FloatingText';
```

**Step 2: Commit**

```bash
git add components/game/play/index.ts
git commit -m "chore: add FloatingText to barrel export"
```
