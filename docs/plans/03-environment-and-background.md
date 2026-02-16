# Plan 03: Animated Environment & Background

## Overview

Create an animated workspace/café backdrop that reacts to caffeine level, replacing a plain dark background with an immersive scene. The environment provides ambient visual feedback without competing with gameplay elements.

## Components to Build

### 1. WorkspaceBackgroundSVG

The main game backdrop — a desk scene viewed from above or slightly angled.

**Visual elements (layered back to front):**

1. **Wall/Window layer:**
   - Window with sky that shifts color based on time-of-day (dawn amber → day blue → dusk purple → night dark)
   - Blinds that are open during day, partially closed at night
   - Wall has a framed "World's Best Coder" certificate and a small clock

2. **Desk surface layer:**
   - Wooden desk texture (subtle SVG grain pattern)
   - Stain rings from coffee cups that accumulate as drinks are consumed (persistent visual counter)
   - Scattered sticky notes (decorative)
   - A small plant in a pot

3. **Laptop/monitor layer:**
   - Open laptop showing "code" (colored horizontal lines that simulate syntax)
   - Screen brightness/clarity reacts to caffeine:
     - Sleepy: screen dims, "code lines" blur/droop
     - Optimal: screen bright, clean lines, cursor blinking
     - Wired: screen flickers, lines vibrate, too many windows open
   - Typing cursor blink rate matches caffeine level

4. **Ambient items:**
   - Stack of consumed cups that grows (1 cup per drink consumed, max ~8 before they "fall off")
   - Phone that occasionally lights up (random game events)
   - Headphones on desk

**Caffeine-reactive behaviors:**
- Sleepy (0-30): Desk lamp flickers, plant droops, everything desaturated
- Optimal (30-70): Warm lighting, plant perky, pleasant atmosphere
- Wired (70+): Lamp too bright, papers flutter, plant shakes, screen glitch

**Props:**
```typescript
interface WorkspaceBackgroundSVGProps {
  caffeineLevel: number;
  timeProgress: number;         // 0-1, maps to day progression
  drinksConsumed: number;       // drives cup stack
  currentEvent?: EventType;     // changes ambient (e.g. meeting dims lights)
  width?: number;
  height?: number;
}
```

### 2. DayNightCycleSVG

A sky/window component that shows time progression through color and lighting.

**Visual states (driven by `timeProgress` 0-1):**
- **0.0-0.1 (8am):** Dawn — warm orange/pink sky, sun peeking up
- **0.1-0.4 (9am-12pm):** Morning — bright blue sky, sun moving up
- **0.4-0.5 (12-1pm):** Midday — peak brightness, sun at top
- **0.5-0.7 (1-4pm):** Afternoon — slightly warmer sky, sun moving down
- **0.7-0.85 (4-6pm):** Late afternoon — golden hour, orange tones
- **0.85-1.0 (6-8pm):** Evening — purple/dark blue, stars appearing

**Implementation:** SVG gradient backgrounds with `stop` colors interpolated via `useMemo`. Stars are circles with opacity animated by CSS.

**Props:**
```typescript
interface DayNightCycleSVGProps {
  timeProgress: number;  // 0-1
  width?: number;
  height?: number;
}
```

### 3. CoffeeStainsSVG

Decorative overlay — coffee ring stains that accumulate on the desk.

**Visual design:**
- Each stain is a slightly irregular circle (SVG path with subtle distortion)
- Semi-transparent brown, varying opacity (0.1-0.3)
- New stains appear with a brief "wet" animation (darker then fading to dry)
- Positions are pseudo-random but deterministic (seeded by drink index)
- Max ~8-10 stains before they stop accumulating

**Props:**
```typescript
interface CoffeeStainsSVGProps {
  count: number;           // number of drinks consumed
  width?: number;
  height?: number;
}
```

## Technical Approach

- Workspace is a large SVG with nested `<g>` groups for each layer
- Each layer can animate independently via CSS keyframes
- Day/night uses SVG `<linearGradient>` with computed `stop-color` values
- Coffee stains use SVG `<path>` with slightly irregular circles
- Time-driven animations use CSS transitions (smooth interpolation)
- Caffeine-driven animations use the same `useMemo` pattern as CoffeeCupSVG

## File Structure

```
components/game/environment/
  WorkspaceBackgroundSVG.tsx
  DayNightCycleSVG.tsx
  CoffeeStainsSVG.tsx
  DeskItemsSVG.tsx          // laptop, plant, cups (extracted for reuse)
  index.ts
```

## Integration

- `WorkspaceBackgroundSVG` goes behind the main game content in `Workspace.tsx`
- `timeProgress` comes from `GameStats.timeElapsed / totalGameDuration`
- `drinksConsumed` from `GameStats.drinksConsumed`
- `currentEvent` from the event system
- Can be toggled off for performance on low-end devices

## Implementation Order

1. **DayNightCycleSVG** — simple gradient, big visual impact, standalone
2. **CoffeeStainsSVG** — fun detail, simple, adds character
3. **WorkspaceBackgroundSVG** — complex, builds on the above two, integrates desk items
4. **DeskItemsSVG** — extracted pieces (laptop screen, plant) that react to caffeine

## Complexity Estimate

- DayNightCycleSVG: Low (gradient interpolation)
- CoffeeStainsSVG: Low (path generation + fade-in)
- WorkspaceBackgroundSVG: High (many layers, many reactive elements)
- DeskItemsSVG: Medium (individual items with state-reactive animations)
