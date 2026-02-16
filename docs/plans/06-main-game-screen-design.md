# 06 — Main Game Screen Design

## Overview

Single page at `/play` that composes all existing SVG assets into a playable game. Uses Approach A: one route with layered scene composition, driven by the existing `GameStateManager` state machine.

## Game State Flow

```
menu     → Character select + difficulty picker + "Start Shift" button
playing  → Game scene (background + character + HUD + drink bar + events)
paused   → Game scene dimmed + pause overlay (Resume / Quit)
gameOver → PassOutScreenSVG or ExplosionScreenSVG overlay
victory  → VictoryScreenSVG overlay with score breakdown
```

Character selection (Office Worker or Coffee Cup) is stored in local component state. Difficulty selection uses the existing `setDifficulty()` from game hooks.

## Game Scene Layout (playing state)

```
┌─────────────────────────────────────────────┐
│  [Caffeine Meter]              [Clock]      │  HUD top
│  [Health Bar]                  [Score]      │  HUD second row
│                                             │
│         ┌───────────────────────┐           │
│         │  WorkspaceBackground  │           │
│         │  + Character          │           │
│         │  (centered)           │           │
│         └───────────────────────┘           │
│                                             │
│  ┌─── EventBanner (slides in from top) ──┐  │
│                                             │
│  [Tea] [Coffee] [Espresso] [Energy] [Water] [⏸] │  Drink toolbar
└─────────────────────────────────────────────┘
```

### Layers (bottom to top)

1. **Background**: `WorkspaceBackgroundSVG` — `timeProgress` from game clock, `caffeineLevel` and `drinksConsumed` from state
2. **Character**: `OfficeWorkerSVG` or `CoffeeCupSVG` — `caffeineLevel` from state, `isActive` = true when playing
3. **HUD corners**: `CaffeineMeterSVG` (top-left), `HealthBarSVG` (below caffeine), clock (top-right), `ScoreDisplaySVG` (below clock) — all compact sizing
4. **Drink toolbar**: Fixed bottom bar with 5 `DrinkIcon` components + pause button
5. **Event banner**: `EventBannerSVG` overlays when event is active

## Drink System

| Drink        | Caffeine | Cooldown | Notes                    |
|--------------|----------|----------|--------------------------|
| Tea          | +15      | 2s       | Slow release, gentle     |
| Coffee       | +30      | 3s       | Moderate, balanced       |
| Espresso     | +40      | 4s       | Fast hit                 |
| Energy Drink | +50      | 5s       | Instant, high crash risk |
| Water        | +0       | 1s       | Heals +5 HP             |

Click to consume. Shows cooldown ring overlay until available. Uses existing `useGameLoop.consumeDrink()` and `useDrinkCooldown` hooks.

Water gets a small health recovery (+5 HP) to make it a tactical choice.

## Event System

| Event           | Game Time  | Effect                        | Duration |
|-----------------|------------|-------------------------------|----------|
| Morning Meeting | ~9:30 AM   | Caffeine drains 2x faster     | 30s      |
| Code Review     | ~11:00 AM  | Can't drink for 15s           | 15s      |
| Lunch Break     | ~12:30 PM  | Caffeine drain paused         | 20s      |
| Bug Fix         | ~3:00 PM   | Health drains faster           | 25s      |

`EventBannerSVG` announces each event. Effects apply for duration then clear. Wired to game clock via `useGameActions.useGameEvents()`.

## Game Over Conditions

1. **Pass Out**: Health = 0, caffeine < 50% → `PassOutScreenSVG`
2. **Explosion**: Health = 0, caffeine >= 50% → `ExplosionScreenSVG`
3. **Victory**: Survive full workday → `VictoryScreenSVG` with score breakdown

End screens overlay game scene with `TransitionOverlaySVG` (coffee-pour) wipe. Each shows final score + "Play Again" button (returns to character select).

## Technical Approach

- **Page**: `app/play/page.tsx` — client component wrapping `GameProvider`
- **Sub-components**: Extract `CharacterSelect`, `GameScene`, `DrinkToolbar`, `GameHUD`, `PauseOverlay`, `GameOverOverlay` into `components/game/play/`
- **State**: All game state via existing `useGameLoop` hook. Character choice in `useState`.
- **No new game engine work**: Core loop, state manager, drinks, difficulty, cooldowns all exist and are production-ready
- **Event integration**: Wire `useGameEvents` timestamps to actual game clock progress
- **Water healing**: Add health boost logic when water is consumed

## Existing Infrastructure Used

- `GameProvider` / `useGameLoop` / `useGameActions` / `useDrinkCooldown`
- `GameStateManager` (state machine, scoring, win/loss conditions)
- `WorkspaceBackgroundSVG`, `OfficeWorkerSVG`, `CoffeeCupSVG`
- `CaffeineMeterSVG`, `HealthBarSVG`, `ScoreDisplaySVG`, `ToastNotificationSVG`
- `DrinkIcon` (CoffeeMugSVG, TeaCupSVG, EspressoShotSVG, EnergyDrinkCanSVG, WaterGlassSVG)
- `EventBannerSVG`, `TransitionOverlaySVG`
- `VictoryScreenSVG`, `PassOutScreenSVG`, `ExplosionScreenSVG`
- `DRINKS` data, `DIFFICULTY_CONFIGS`, all type definitions
