# Custom Rive Coffee Cup Character

## Overview
A coffee mug character for Stay Caffeinated that responds to a caffeine level slider (0-100) via a Rive state machine with a 1D Blend State.

## Character Anatomy
- **Body**: Rounded trapezoid mug (wider at top), white/cream ceramic
- **Handle**: C-shaped handle on right side
- **Coffee inside**: Visible liquid that rises/falls with caffeine level
- **Face**: Two dot eyes + mouth on the mug body
- **Steam/effects**: Contextual particles above and around the mug

## Three Caffeine States

| Element | Sleepy (0-30%) | Optimal (30-70%) | Wired (70-100%) |
|---------|---------------|-------------------|-----------------|
| Coffee level | Nearly empty (20%) | Half full (50%) | Overflowing/bubbling |
| Eyes | Droopy half-closed | Round and bright | Wide/bulging, rapid blinks |
| Mouth | Yawn / sad curve | Happy smile | Grimace / wavy |
| Steam | None or faint | 2-3 gentle wisps | 5+ rapid swirling clouds |
| Body motion | Slow tilt/sway | Gentle breathing | Rapid vibration/shake |
| Color tint | Blue/desaturated | Warm cream | Red/orange heat glow |
| Extras | Zzz floating above | Sparkle/shine | Lightning bolts / cracks |

## State Machine
- State Machine: `caffeineStateMachine`
- Input: `caffeineLevel` (Number, 0-100)
- 1D Blend State mapping: 0 -> sleepy, 50 -> optimal, 100 -> wired

## Integration
```tsx
<RiveCharacter
  src="/rive/coffee-cup.riv"
  stateMachine="caffeineStateMachine"
  caffeineInputName="caffeineLevel"
  caffeineLevel={displayLevel}
  width={220}
  height={220}
  isActive
/>
```

## Build Steps
1. Draw mug body, handle, coffee area
2. Add face (eyes, mouth) as separate groups
3. Add effects (steam, Zzz, sparkles, lightning) as separate groups
4. Use bones for squash/stretch and eye blinks
5. Create 3 timeline animations: sleepy, optimal, wired
6. Create State Machine with Number input "caffeineLevel"
7. Add 1D Blend State: 0->sleepy, 50->optimal, 100->wired
8. Export as .riv to /public/rive/coffee-cup.riv
