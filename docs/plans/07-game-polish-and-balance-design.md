# 07 — Game Polish & Balance Design

## Overview

Comprehensive improvement pass on the /play game screen across 4 layers: bug fixes, balance tuning, game juice (feedback), and visual cleanup. Each layer is independently shippable.

## Layer 1: Bug Fixes (HUD Number Formatting)

Raw floats displayed throughout HUD. Fix all display values:

- **Score**: `Math.round(score)`, comma-formatted, clamped to `Math.max(0, score)`. No decimals, no negative.
- **Streak**: `Math.round(streak)` — show as "45s streak", not "45.102299..."
- **Caffeine meter text**: `Math.round(caffeineLevel)` — show as "52%", not "52.38291%"

All display-layer fixes in GameHUD and ScoreDisplaySVG. No engine changes.

## Layer 2: Balance Tuning

Caffeine drains too fast (50% → 0% in ~6 seconds). Game feels frantic, not strategic.

### Caffeine depletion rate (per second)

| Difficulty | Current | New |
|------------|---------|-----|
| Intern | 0.5 | 0.15 |
| Junior | 0.75 | 0.25 |
| Senior | 1.0 | 0.35 |
| Founder | 1.5 | 0.5 |

### Other tuning

- **Real-time workday**: 180s → 240s (4 minutes)
- **Health drain rate**: 0.5/sec → 0.3/sec when outside optimal zone
- **Starting caffeine**: 50% → 40% (slight urgency without danger)

Goal: drink every ~8-12 seconds on Junior, not every 2-3 seconds.

## Layer 3: Game Juice (Drink Feedback)

No feedback when drinks are consumed. Add:

- **Floating number**: "+30" text floats up from drink icon, fades out over ~1s. Amber for caffeine, green for water "+5 HP". Small `FloatingText` component with CSS keyframe animation.
- **Icon bounce**: Quick scale 1.0 → 1.2 → 1.0 over 200ms on click. CSS transition.
- **Cooldown ring**: Ensure existing cooldownProgress renders visibly — dark overlay + circular sweep.
- **Caffeine meter pulse**: Brief 300ms glow/border flash when caffeine changes.

## Layer 4: Visual Cleanup

- **Drink icons**: 48px → 64px. More tappable, easier to distinguish.
- **Event banners**: Display time 1.5s → 4s. Add semi-transparent backdrop behind banner.
- **Optimal zone label**: Text near caffeine meter: "OPTIMAL" (green), "LOW" (blue), "HIGH" (red). Always visible.
- **Workday progress bar**: Thin bar across top of screen showing workday progress. Visual "how much is left" indicator.
