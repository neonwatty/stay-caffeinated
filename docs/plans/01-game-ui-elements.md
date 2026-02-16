# Plan 01: Animated Game UI Elements

## Overview

Replace plain HTML/CSS game UI with animated SVG components that react to caffeine level and game state. These are the HUD elements players see constantly, so visual polish here has outsized impact.

## Components to Build

### 1. CaffeineMeterSVG

An animated coffee-cup-shaped gauge that replaces the plain range slider. The cup fills/drains in real-time as caffeine changes.

**Visual design:**
- Mug outline (reuse the CoffeeCupSVG trapezoid shape, simplified)
- Liquid level maps directly to `caffeineLevel` (0-100)
- Color gradient: blue (low) → green (optimal 30-70) → red (high)
- Zone markers: subtle tick marks at 30% and 70% on the mug
- Animated surface: gentle wave on coffee surface (CSS keyframe)
- Steam intensity scales with level
- Danger glow: pulsing red border when health is low

**Props:**
```typescript
interface CaffeineMeterSVGProps {
  caffeineLevel: number;     // 0-100
  healthLevel: number;       // 0-100, drives danger indicators
  optimalZone: [number, number]; // e.g. [30, 70]
  width?: number;
  height?: number;
}
```

**Integration:** Replace or supplement the `<input type="range">` in `StatusBars.tsx`. Read from `useGameState()` hook's `caffeinePercentage`.

### 2. ScoreDisplaySVG

Animated score counter with visual flair for combos and milestones.

**Visual design:**
- Numbers rendered as SVG text with a retro/pixel or coffee-stain font style
- Digit roll animation: numbers scroll vertically when changing (CSS translateY transition)
- Combo multiplier badge: glowing circle that pulses when streak is active
- Milestone flash: brief golden burst animation at score thresholds (1000, 5000, etc.)
- Small coffee bean icon next to score

**Props:**
```typescript
interface ScoreDisplaySVGProps {
  score: number;
  streak: number;          // current optimal-zone streak
  multiplier: number;      // score multiplier
  width?: number;
  height?: number;
}
```

**Integration:** Use alongside existing score display in game HUD. Reads from `GameStats.score` and `GameStats.streak`.

### 3. ToastNotificationSVG

Animated in-game notifications for events, achievements, and drink effects.

**Visual design:**
- Slide-in from top with bounce easing
- Background: semi-transparent card with coffee-stain texture border
- Icon area: small SVG icon (coffee cup, lightning bolt, zzz, star)
- Text area: event title + brief description
- Auto-dismiss after 2-3 seconds with fade-out
- Queue system: stack multiple toasts, newest on top
- Color coding: blue (info), green (positive), red (warning), gold (achievement)

**Props:**
```typescript
interface ToastNotificationSVGProps {
  type: 'info' | 'positive' | 'warning' | 'achievement';
  title: string;
  description?: string;
  icon?: 'coffee' | 'lightning' | 'zzz' | 'star' | 'heart';
  duration?: number;        // ms before auto-dismiss
  onDismiss?: () => void;
}
```

**Integration:** Wire into `EventNotification.tsx` and `AchievementNotification.tsx`. Triggered by game events via `triggerEvent()`.

### 4. HealthBarSVG

Heart-rate monitor style health indicator.

**Visual design:**
- ECG/heartbeat line that pulses across the bar
- Pulse rate increases with caffeine level (slow when sleepy, frantic when wired)
- Bar fill is a gradient from red (low) to green (full)
- Heart icon that beats in sync with the ECG line
- Critical state: entire bar flashes red with faster pulse
- Smooth depletion animation

**Props:**
```typescript
interface HealthBarSVGProps {
  healthLevel: number;     // 0-100
  caffeineLevel: number;   // drives pulse rate
  isCritical: boolean;     // below 20%
  width?: number;
  height?: number;
}
```

**Integration:** Replace or supplement existing health display in `StatusBars.tsx`.

## Technical Approach

All components follow the CoffeeCupSVG pattern:
- `'use client'` React components
- `useMemo` to compute visual state from numeric inputs
- CSS `@keyframes` injected via `<style dangerouslySetInnerHTML>` (no SVG `<animate>`)
- Inline `style` props for transitions
- Unique animation IDs to avoid CSS collisions when multiple instances exist
- `viewBox`-based SVG for resolution independence

## File Structure

```
components/game/ui/
  CaffeineMeterSVG.tsx
  ScoreDisplaySVG.tsx
  ToastNotificationSVG.tsx
  HealthBarSVG.tsx
  index.ts                  // barrel export
```

## Implementation Order

1. **CaffeineMeterSVG** — highest visual impact, replaces most prominent UI element
2. **HealthBarSVG** — complements the meter, completes the HUD
3. **ToastNotificationSVG** — needed before events/achievements can feel polished
4. **ScoreDisplaySVG** — nice-to-have, lowest priority

## Complexity Estimate

- CaffeineMeterSVG: Medium (liquid fill + wave animation + zone markers)
- HealthBarSVG: Medium (ECG line animation is the tricky part)
- ToastNotificationSVG: Medium (queue management + slide animations)
- ScoreDisplaySVG: Low-Medium (digit roll is straightforward CSS)
