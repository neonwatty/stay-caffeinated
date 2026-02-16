# Plan 05: Game-Over & Transition Screens

## Overview

Create animated SVG scenes for game endings and state transitions. These are the most memorable moments of each play session — a satisfying victory or dramatic game-over makes players want to try again.

## Screens to Build

### 1. PassOutScreenSVG — "You Fell Asleep"

**Trigger:** Health reaches 0 from low caffeine.

**Animation sequence (3-4 seconds):**
1. **Phase 1 (0-1s):** Character's eyes slowly close (eyelids descend), mouth opens in a yawn, body tilts to one side
2. **Phase 2 (1-2s):** Character tips over sideways, coffee spills out in a puddle spreading on the "floor"
3. **Phase 3 (2-3s):** Zzz letters float up in increasing size, screen dims to blue/dark
4. **Phase 4 (3-4s):** "You Fell Asleep..." text fades in with gentle typewriter effect, score summary slides up

**Visual details:**
- Coffee puddle spreads using an ellipse that grows with CSS animation
- Zzz letters use the existing float animation, staggered timing
- Blue/moonlight color wash over everything
- Small snoring sound wave lines near the mouth
- Background goes dark/starry

**Color palette:** Deep blue, dark purple, grey — night/sleep tones

### 2. ExplosionScreenSVG — "Too Much Caffeine!"

**Trigger:** Health reaches 0 from high caffeine.

**Animation sequence (3-4 seconds):**
1. **Phase 1 (0-0.5s):** Character shakes violently, eyes go maximum wide, cracks appear on the mug body
2. **Phase 2 (0.5-1.5s):** Mug shatters outward — pieces fly in all directions (6-8 triangular shards with rotation), coffee splashes everywhere
3. **Phase 3 (1.5-2.5s):** Explosion flash (bright white circle expanding then fading), star/spark particles scatter
4. **Phase 4 (2.5-4s):** Shards settle, "Too Much Caffeine!" text zooms in with impact, score summary slides up

**Visual details:**
- Mug shards are triangular SVG paths that fly outward with CSS `transform: translate() rotate()`
- Coffee splash: brown droplets in multiple directions
- Explosion flash: white radial gradient circle that scales up then fades
- Background goes red briefly then darkens
- Comical cartoon-style "POW" burst shape behind explosion

**Color palette:** Red, orange, bright yellow — explosive energy tones

### 3. VictoryScreenSVG — "You Survived!"

**Trigger:** Game clock reaches end of workday with health > 0.

**Animation sequence (4-5 seconds):**
1. **Phase 1 (0-1s):** Character does a little jump (translateY bounce), eyes become happy crescents, confetti starts falling
2. **Phase 2 (1-2s):** "You Survived!" text appears with golden glow, star particles radiate outward
3. **Phase 3 (2-3.5s):** Score tallies up with animated counter (base score + zone bonus + health bonus + difficulty bonus)
4. **Phase 4 (3.5-5s):** Final score displayed large with trophy/star icon, "Play Again" and "Menu" buttons fade in

**Visual details:**
- Confetti: 20-30 small rectangles in various colors falling with slight horizontal sway (CSS keyframe)
- Trophy icon: simple golden cup SVG with shine animation
- Score tally: each line rolls in from right with stagger delay, numbers count up
- Celebratory golden color wash
- Stars sparkle around the character

**Color palette:** Gold, warm yellow, celebratory greens and blues

### 4. TransitionOverlaySVG — Scene Transitions

**Usage:** Between menu → game start, between events, difficulty level changes.

**Visual design:**
- Coffee cup shape wipe: a giant coffee cup silhouette slides across the screen (like a classic movie wipe but coffee-themed)
- OR: Coffee pour effect — dark brown liquid pours down from top, fills screen, then drains from bottom revealing next scene
- Duration: 0.5-0.8 seconds total

**Props:**
```typescript
interface TransitionOverlaySVGProps {
  isActive: boolean;
  direction: 'in' | 'out';
  variant?: 'cup-wipe' | 'coffee-pour';
  onComplete?: () => void;
}
```

### 5. EventBannerSVG — In-Game Event Announcements

**Usage:** "Morning Meeting!", "Code Review!", "Bug Fix Crisis!", "Lunch Break!"

**Animation sequence (1.5 seconds):**
1. Banner slides in from top with bounce
2. Event icon + title displayed prominently
3. Brief description of the effect ("Caffeine depletes 2x faster!")
4. Banner slides out after 1.5s

**Visual design:**
- Ribbon/banner shape (SVG path with wavy edges)
- Event-specific icon and color:
  - Morning Meeting: clock icon, blue
  - Code Review: magnifying glass icon, purple
  - Bug Fix: bug icon, red
  - Lunch Break: sandwich icon, green

**Props:**
```typescript
interface EventBannerSVGProps {
  eventType: EventType;
  title: string;
  description: string;
  onComplete?: () => void;
}
```

## Shared Score Summary Component

Used by all three game-over screens:

```typescript
interface ScoreSummarySVGProps {
  baseScore: number;
  zoneBonus: number;
  healthBonus: number;
  difficultyMultiplier: number;
  finalScore: number;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
  onMenu: () => void;
}
```

**Animation:** Each score line appears with a stagger delay, numbers count up from 0 to final value, final score has a golden pulse if it's a new high score.

## Technical Approach

### Animation Sequencing
- CSS animations with `animation-delay` for sequencing phases
- Each phase is a separate `@keyframes` with appropriate delays
- `animation-fill-mode: forwards` to hold final states
- `onAnimationEnd` event listeners to trigger next phases (for interactive elements like buttons)

### Particle Systems (confetti, sparks, shards)
- Fixed number of SVG elements (not dynamically created)
- Each particle has a unique CSS animation with randomized (but deterministic) parameters
- Parameters: start position, end position, rotation, duration, delay
- Generated via `useMemo` with a simple seeded random function

### Screen Overlays
- Positioned as fixed overlay on top of game content
- Semi-transparent background that dims the game
- z-index above all game elements
- Fade-in/fade-out via CSS transition on the container

## File Structure

```
components/game/screens/
  PassOutScreenSVG.tsx
  ExplosionScreenSVG.tsx
  VictoryScreenSVG.tsx
  ScoreSummarySVG.tsx
  TransitionOverlaySVG.tsx
  EventBannerSVG.tsx
  index.ts
```

## Integration

- Game-over screens triggered when `GameState` transitions to `'gameOver'` or `'victory'`
- Wire into existing `GameMenu.tsx` or create a `GameOverlay.tsx` container
- Score data from `GameStats`
- "Play Again" calls `resetGame()`, "Menu" navigates to menu state
- Event banners triggered by `triggerEvent()` in the event system
- Transitions play during state changes (menu → playing, etc.)

## Implementation Order

1. **VictoryScreenSVG + ScoreSummarySVG** — positive reinforcement first, motivates playtesting
2. **PassOutScreenSVG** — most common game-over, needs to feel good
3. **ExplosionScreenSVG** — dramatic, fun to build (particle shard system)
4. **EventBannerSVG** — enhances in-game events
5. **TransitionOverlaySVG** — polish, lowest priority

## Complexity Estimate

- VictoryScreenSVG: Medium (confetti particles + score tally animation)
- ScoreSummarySVG: Medium (animated counter + layout)
- PassOutScreenSVG: Medium (tipping animation + puddle spread)
- ExplosionScreenSVG: High (shard physics + explosion flash + particles)
- EventBannerSVG: Low-Medium (slide in/out + icon variants)
- TransitionOverlaySVG: Low (single shape wipe animation)
