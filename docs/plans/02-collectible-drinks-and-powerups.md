# Plan 02: Animated Collectible Drinks & Power-ups

## Overview

Create animated SVG components for each drink type and power-up in the game. These replace the current text-based `DrinkSelector` with visually distinct, animated items that players interact with constantly. Each drink has a unique idle animation, a "consumed" animation, and a cooldown state.

## Drinks to Build

### Existing Drink Types (from `/game/data/drinks.ts`)

#### 1. TeaCupSVG
- **Idle:** Delicate teacup on saucer, single gentle steam wisp curving upward, tea bag string hanging over edge with tiny tag swaying
- **Color palette:** Soft greens and warm yellows
- **Consumed animation:** Cup tips back, liquid disappears, tea bag bounces
- **Cooldown:** Cup is greyed out, saucer has a circular timer ring filling

#### 2. CoffeeMugSVG
- **Idle:** Classic mug (similar shape to CoffeeCupSVG but simpler, no face), 2-3 steam wisps, slight liquid shimmer
- **Color palette:** Rich browns and cream
- **Consumed animation:** Mug tilts, coffee splashes, "gulp" effect
- **Cooldown:** Steam stops, mug dims, timer ring

#### 3. EnergyDrinkCanSVG
- **Idle:** Tall slim can with lightning bolt logo, electric sparks flickering around it, slight vibrating/buzzing animation
- **Color palette:** Neon green, electric blue, black
- **Consumed animation:** Can crushes vertically, sparks fly outward
- **Cooldown:** Sparks die, can goes dark, timer ring

#### 4. EspressoShotSVG
- **Idle:** Tiny espresso cup, thick crema layer on top, intense concentrated steam, slight rattle on saucer
- **Color palette:** Deep espresso brown, golden crema, white porcelain
- **Consumed animation:** Shot glass tips rapidly, crema swirls, fast gulp
- **Cooldown:** Glass empties, goes matte, timer ring

#### 5. WaterGlassSVG
- **Idle:** Clear glass with visible water level, subtle bubbles rising, condensation droplets on outside, ice cubes floating
- **Color palette:** Light blues, clear/white, crystal highlights
- **Consumed animation:** Glass tilts, water pours out smoothly, ice clinks
- **Cooldown:** Glass empties, condensation fades, timer ring

### Shared Component API

```typescript
interface DrinkSVGProps {
  drinkType: DrinkType;
  state: 'idle' | 'consumed' | 'cooldown';
  cooldownProgress?: number;  // 0-1, for cooldown ring
  isAvailable: boolean;       // false when on cooldown
  size?: number;              // width=height square
  onClick?: () => void;
}
```

Each drink is its own component but all share the `DrinkSVGProps` pattern. A `DrinkIcon` wrapper component selects the right SVG based on `drinkType`.

## Power-ups to Build

### From `/types/powerups.ts`

#### 1. ProteinBarSVG
- Wrapped bar with bite marks, subtle energy glow, pulsing aura
- Color: brown/gold wrapper, green energy aura

#### 2. VitaminsSVG
- Pill capsule (half red, half white), spinning slowly, small plus signs floating around it
- Color: red/white capsule, green plus signs

#### 3. PowerNapSVG
- Small pillow with Zzz floating above, moon/stars twinkle
- Color: soft blue/purple, white stars

#### 4. EnergyBoostSVG
- Lightning bolt shape, electric crackling, rotating glow ring
- Color: bright yellow, orange sparks

#### 5. ShieldSVG
- Transparent bubble/shield dome, hexagonal pattern, subtle shimmer
- Color: translucent blue, white highlights

### Power-up Component API

```typescript
interface PowerUpSVGProps {
  powerUpType: PowerUpType;
  state: 'available' | 'active' | 'used';
  remainingDuration?: number;  // seconds left when active
  size?: number;
  onClick?: () => void;
}
```

## Technical Approach

Same SVG+CSS pattern as CoffeeCupSVG:
- CSS `@keyframes` for idle animations
- State transitions via CSS `transition` on fill, opacity, transform
- Cooldown ring: SVG `<circle>` with `stroke-dasharray` + `stroke-dashoffset` animated
- Consumed animation: sequence of CSS transforms with `animation-fill-mode: forwards`
- Each component ~100-150 lines (simpler than the full character)

## File Structure

```
components/game/drinks/
  TeaCupSVG.tsx
  CoffeeMugSVG.tsx
  EnergyDrinkCanSVG.tsx
  EspressoShotSVG.tsx
  WaterGlassSVG.tsx
  DrinkIcon.tsx            // wrapper that selects correct SVG
  index.ts

components/game/powerups/
  ProteinBarSVG.tsx
  VitaminsSVG.tsx
  PowerNapSVG.tsx
  EnergyBoostSVG.tsx
  ShieldSVG.tsx
  PowerUpIcon.tsx          // wrapper
  index.ts
```

## Integration

- `DrinkIcon` replaces current drink rendering in `DrinkSelector.tsx`
- Wire `state` prop to `useDrinkCooldown()` hook
- `onClick` calls `consumeDrink()` from `useGameLoop()`
- `PowerUpIcon` integrates with `PowerupSelector.tsx`

## Implementation Order

1. **CoffeeMugSVG** — most commonly used drink, test the pattern
2. **EnergyDrinkCanSVG** — most visually distinct, tests the spark effects
3. **TeaCupSVG, EspressoShotSVG, WaterGlassSVG** — remaining drinks
4. **DrinkIcon wrapper** — ties them all together
5. **Power-ups** (ProteinBar → EnergyBoost → Vitamins → PowerNap → Shield)

## Complexity Estimate

- Individual drinks: Low-Medium each (~100-150 lines)
- Cooldown ring animation: Low (SVG circle dash trick)
- Consumed animation: Medium (needs sequenced keyframes)
- Power-ups: Low each (simpler shapes, mostly glow effects)
- DrinkIcon/PowerUpIcon wrappers: Low
