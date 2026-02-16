# Plan 04: Character Expressions & Accessories

## Overview

Extend the CoffeeCupSVG character with additional expressions triggered by game events, and unlockable cosmetic accessories. This adds personality and a progression/reward system.

## Expressions to Add

### Event-Triggered Expressions

These are temporary expression overrides that play when specific game events occur, then return to the caffeine-driven default.

#### 1. Surprise
- **Trigger:** Random caffeine spike (bug fix event), receiving a power-up
- **Visual:** Eyes go perfectly round and huge, mouth becomes a small "o", brief upward jump, exclamation mark appears above head
- **Duration:** 1.5 seconds

#### 2. Celebration
- **Trigger:** Reaching score milestone, completing a streak, victory
- **Visual:** Eyes become happy crescents (^_^), wide smile, arms/handle wiggles, confetti particles burst outward, slight bounce
- **Duration:** 2 seconds

#### 3. Disgust/Grimace
- **Trigger:** Consuming water when already low caffeine, bad event
- **Visual:** One eye squints, mouth goes wavy/squiggly, slight lean back, tongue sticks out briefly
- **Duration:** 1 second

#### 4. Panic
- **Trigger:** Health below 20%, caffeine approaching crash zone
- **Visual:** Eyes dart left-right rapidly, sweat drops appear on forehead, mouth is tight grimace, handle trembles, red exclamation mark
- **Duration:** Continuous while condition persists

#### 5. Determined
- **Trigger:** Code review event (must stay optimal for 30s)
- **Visual:** Eyebrows appear and angle inward (focused), slight squint, firm set mouth, subtle forward lean, small fire/determination aura
- **Duration:** Duration of event

### Updated Component API

```typescript
interface CoffeeCupSVGProps {
  caffeineLevel: number;
  width?: number;
  height?: number;
  isActive?: boolean;
  expression?: 'default' | 'surprise' | 'celebration' | 'disgust' | 'panic' | 'determined';
  accessories?: AccessoryType[];
}

type AccessoryType =
  | 'sunglasses'
  | 'topHat'
  | 'beanie'
  | 'devSticker'
  | 'bowtie'
  | 'headphones'
  | 'crownLaurel'
  | 'sleepMask';
```

## Accessories to Build

Cosmetic items rendered as additional SVG layers on top of the base character. Unlocked via achievements.

### Hat/Head Accessories (positioned above mug rim)

#### 1. Sunglasses
- **Unlock:** Win a game on any difficulty
- **Visual:** Dark lens rectangles over eyes with slight reflection shine, thin arms going to handle area
- **Interaction with expressions:** Eyes still visible as dots behind dark lenses in wired state

#### 2. Top Hat
- **Unlock:** Score above 10,000
- **Visual:** Classic black top hat sitting on rim, slight wobble when shaking (wired state)
- **Size:** Proportional, sits just above the mug rim

#### 3. Beanie
- **Unlock:** Win using only tea
- **Visual:** Knit beanie draped over top of mug, small pom-pom on top, matches caffeine color (blue when sleepy, green optimal, red wired)
- **Adaptive:** Color shifts with caffeine state

#### 4. Sleep Mask
- **Unlock:** Pass out 10 times (humorous)
- **Visual:** Eye mask pushed up on forehead when awake, pulled down over eyes when sleepy (< 15% caffeine)
- **Adaptive:** Position changes based on state

### Body Accessories

#### 5. Dev Sticker
- **Unlock:** Complete code review event
- **Visual:** Small rectangular sticker on mug body ("I <3 CODE" or a git branch icon)
- **Static:** Doesn't change with caffeine

#### 6. Bowtie
- **Unlock:** Win on Senior Dev difficulty
- **Visual:** Small bowtie below the face, on the front of the mug
- **Interaction:** Spins briefly during celebration expression

#### 7. Headphones
- **Unlock:** Play 10 games
- **Visual:** Over-ear headphones draped over top of mug, small music notes floating when optimal
- **Adaptive:** Music notes style changes (sleepy = slow notes, wired = fast notes)

#### 8. Crown/Laurel
- **Unlock:** Win on Startup Founder difficulty
- **Visual:** Golden laurel wreath around top of mug, subtle shimmer
- **Premium feel:** Reserved for hardest achievement

## Technical Approach

### Expressions
- Each expression modifies the face parameters (eyeOpen, pupilScale, mouthCurve, etc.) with an override `useMemo`
- Expression overrides the caffeine-driven defaults temporarily
- A `useEffect` timer returns to 'default' after the expression duration
- New SVG elements for expression-specific items (exclamation mark, sweat drops, confetti) added conditionally

### Accessories
- Each accessory is a separate SVG `<g>` group with a fixed position relative to the mug
- Accessories render AFTER the base character elements (z-order)
- Position offsets account for shake animation (accessories move with the shake wrapper `<g>`)
- Accessories are pure visual overlays — no impact on game mechanics

### Unlock System
- Accessories are stored in localStorage via the existing `SaveData.achievements` system
- A new `unlockedAccessories` field in SaveData
- Simple `AccessorySelector` UI in settings/menu to equip accessories

## File Structure

```
components/game/
  CoffeeCupSVG.tsx           // extend with expression + accessories props
  accessories/
    SunglassesSVG.tsx
    TopHatSVG.tsx
    BeanieSVG.tsx
    SleepMaskSVG.tsx
    DevStickerSVG.tsx
    BowtieSVG.tsx
    HeadphonesSVG.tsx
    CrownLaurelSVG.tsx
    AccessoryLayer.tsx        // renders equipped accessories
    index.ts
  AccessorySelector.tsx       // UI for equipping in menu
```

## Integration

- Extend `CoffeeCupSVG` props (backwards compatible — new props are optional)
- Game events trigger expressions via a new `useCharacterExpression()` hook
- Accessories load from localStorage, selected in menu
- `AccessoryLayer` wraps around CoffeeCupSVG's face/body group

## Implementation Order

1. **Expressions** (surprise, celebration, panic) — adds life to gameplay immediately
2. **AccessoryLayer wrapper** — infrastructure for accessories
3. **Sunglasses + TopHat** — two visually distinct accessories to test the system
4. **Remaining accessories** — fill out the collection
5. **AccessorySelector UI** — menu integration
6. **Unlock triggers** — wire to achievement system

## Complexity Estimate

- Expressions: Medium (face parameter overrides + temporary SVG elements + timers)
- Individual accessories: Low each (~30-60 lines, simple SVG groups)
- AccessoryLayer: Low (conditional rendering wrapper)
- AccessorySelector UI: Medium (grid picker, localStorage integration)
- Unlock triggers: Low (event listeners on achievement system)
