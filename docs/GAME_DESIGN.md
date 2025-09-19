# Stay Caffeinated - Game Design Document

## Executive Summary

**Stay Caffeinated** is a browser-based productivity survival game where players must strategically manage caffeine consumption to maintain optimal performance throughout an 8-hour workday. The game combines resource management, timing, and strategic decision-making in an accessible, engaging format.

## Table of Contents

1. [Game Overview](#game-overview)
2. [Core Mechanics](#core-mechanics)
3. [Game Systems](#game-systems)
4. [User Interface](#user-interface)
5. [Progression System](#progression-system)
6. [Technical Specifications](#technical-specifications)
7. [Monetization Strategy](#monetization-strategy)
8. [Future Development](#future-development)

## Game Overview

### Concept
Players take on the role of an office worker who must maintain productivity through strategic caffeine consumption while avoiding crashes and health issues.

### Target Audience
- **Primary**: Young professionals (22-35 years)
- **Secondary**: Students and gamers interested in casual/strategic games
- **Tertiary**: Anyone who relates to caffeine dependency humor

### Platform
- Web browsers (Desktop & Mobile)
- Progressive Web App (installable)
- Future: iOS and Android native apps

### Genre
- Casual Strategy
- Resource Management
- Survival

### Core Loop
1. **Monitor** caffeine and health levels
2. **Decide** which drink to consume
3. **Consume** the selected beverage
4. **Experience** the effects
5. **Adapt** strategy based on results
6. **Repeat** until workday ends or game over

## Core Mechanics

### Caffeine System

#### Metabolism Rate
```
Base Decay Rate = 2 units/second (Easy)
               = 3 units/second (Medium)
               = 5 units/second (Hard)

Modified Rate = Base Rate × Event Multiplier × Health Modifier
```

#### Optimal Zone
- **Range**: 40-70% caffeine level
- **Benefits**:
  - 2x score multiplier
  - No health degradation
  - Productivity bonus
  - Streak accumulation

#### Danger Zones
- **Low (<20%)**
  - Severe productivity penalty
  - Slower reaction time
  - Visual blur effects
  - Warning indicators

- **High (>80%)**
  - Jitters animation
  - Health degradation
  - Risk of crash event
  - Screen shake effect

### Drink Types

| Drink | Caffeine | Health | Duration | Cooldown | Special Effect |
|-------|----------|---------|----------|----------|----------------|
| Coffee | +25 | -2 | Instant | 5s | Steady boost |
| Tea | +15 | 0 | 10s gradual | 3s | Sustained release |
| Energy Drink | +40 | -5 | Instant | 10s | Crash risk if >70% |
| Soda | +10 | -1 | Instant | 2s | Sugar rush (+5 score/s for 5s) |
| Water | 0 | +5 | Instant | 1s | Removes negative effects |

### Health System

#### Health Mechanics
- **Starting Health**: 100
- **Degradation**:
  - Caffeine >80%: -1 health/second
  - Caffeine >95%: -3 health/second
  - Energy drink crash: -10 health instantly

- **Regeneration**:
  - Water consumption: +5 health
  - Optimal zone maintenance: +0.5 health/second
  - Rest periods (no drinks): +0.2 health/second

#### Game Over Conditions
1. **Health Depletion** (health = 0)
2. **Caffeine Crash** (caffeine = 0 for 30 seconds)
3. **Time Victory** (survive 8 hours)

### Scoring System

#### Base Scoring
```
Base Score = Time Survived (seconds) × 10
```

#### Multipliers
- **Optimal Zone**: 2x
- **Perfect Health (>80)**: 1.5x
- **Streak Bonus**: +0.1x per 30 seconds in optimal zone
- **Difficulty Multiplier**:
  - Easy: 1x
  - Medium: 1.5x
  - Hard: 2x

#### Bonus Points
- **Quick Decision** (<2s to choose drink): +50
- **Close Call** (recover from <10% caffeine): +200
- **Perfect Minute** (60s in optimal zone): +500
- **Health Master** (maintain >90% health for 60s): +300

## Game Systems

### Event System

#### Random Events (10% chance per minute)

1. **Coffee Machine Broken**
   - Duration: 30 seconds
   - Effect: Coffee unavailable
   - Strategy: Rely on alternative drinks

2. **Double Shot Day**
   - Duration: 60 seconds
   - Effect: All drinks 1.5x effective
   - Strategy: Aggressive consumption

3. **Health Inspector Visit**
   - Duration: 45 seconds
   - Effect: Energy drinks unavailable
   - Strategy: Conservative management

4. **Team Meeting**
   - Duration: 20 seconds
   - Effect: 2x caffeine decay rate
   - Strategy: Preemptive boosting

5. **Lunch Break**
   - Duration: 30 seconds
   - Effect: +2 health/second
   - Strategy: Recovery opportunity

### Achievement System

#### Categories

**Endurance**
- Survivor: Complete Easy mode
- Veteran: Complete Medium mode
- Legend: Complete Hard mode
- Iron Will: Survive 1 hour on Hard

**Skill**
- Perfect Balance: 5 minutes in optimal zone
- Health Conscious: Maintain >80% health for entire game
- Speed Demon: 50 drinks in one game
- Minimalist: Win with <20 drinks

**Special**
- Close Call: Recover from <5% caffeine
- Caffeine Immune: Reach 100% without crashing
- Hydration Hero: Use water 10 times in one game
- Event Master: Survive all event types

### Power-Up System (Future)

1. **Time Slow** - Reduces decay rate by 50% for 30s
2. **Double Points** - 2x score multiplier for 60s
3. **Shield** - Prevents health loss for 45s
4. **Instant Optimal** - Sets caffeine to 55% instantly
5. **Metabolism Boost** - Faster drink processing for 60s

## User Interface

### Main Game Screen

```
+------------------+
|  Score | Timer   |  <- Top Bar
+------------------+
|                  |
|   Character      |  <- Main Display
|   Animation      |
|                  |
+------------------+
| ♥♥♥♥♥ | ☕☕☕☕☕ |  <- Status Bars
+------------------+
| [1][2][3][4][5]  |  <- Drink Selector
+------------------+
```

### HUD Elements

1. **Score Display**
   - Current score
   - Multiplier indicator
   - Streak counter

2. **Timer**
   - Time remaining
   - Event countdown
   - Visual urgency at <1 minute

3. **Caffeine Bar**
   - Gradient fill (green→yellow→red)
   - Optimal zone highlight
   - Animated decrease
   - Pulse effect when critical

4. **Health Bar**
   - Heart icons or bar
   - Damage flash animation
   - Regeneration sparkle effect

5. **Drink Selector**
   - Carousel or grid layout
   - Cooldown timers
   - Availability indicators
   - Keyboard shortcuts visible

### Visual Feedback

- **Screen Effects**
  - Blur when low caffeine
  - Shake when overcaffeinated
  - Vignette in danger zones
  - Color temperature shifts

- **Character Animations**
  - Idle: Normal typing
  - Low caffeine: Slow, drooping
  - High caffeine: Jittery, fast
  - Optimal: Smooth, productive

## Progression System

### Unlockables

1. **Difficulty Modes**
   - Medium: Unlocked after Easy completion
   - Hard: Unlocked after Medium completion
   - Endless: Unlocked after Hard completion

2. **Cosmetics**
   - Character skins
   - Office themes
   - Drink cup designs
   - UI color schemes

3. **Statistics Tracking**
   - Total games played
   - Best scores per difficulty
   - Total caffeine consumed
   - Favorite drink stats
   - Achievement progress

### Leaderboards

- **Daily Challenge**: Same seed for all players
- **Weekly Best**: Highest score in 7 days
- **All-Time**: Global high scores
- **Friends**: Social comparison

## Technical Specifications

### Performance Requirements

- **Target FPS**: 60
- **Load Time**: <3 seconds
- **Memory Usage**: <100MB
- **Battery Friendly**: Optimized animations

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

### Responsive Design

- **Desktop**: 1920x1080 optimal
- **Tablet**: 768x1024 minimum
- **Mobile**: 375x667 minimum
- **Scaling**: Vector graphics where possible

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard-only navigation
- Screen reader support
- Colorblind modes
- Adjustable text size

## Monetization Strategy

### Current Model
- **Free to Play**: Core game completely free
- **No Ads**: Clean, uninterrupted experience
- **Open Source**: Community-driven development

### Future Opportunities

1. **Premium Version**
   - Additional game modes
   - Exclusive achievements
   - Advanced statistics
   - Custom themes

2. **Cosmetic Store**
   - Character skins
   - Office decorations
   - Special effects
   - Drink animations

3. **Season Pass**
   - Monthly challenges
   - Exclusive rewards
   - Leaderboard seasons
   - Special events

4. **Educational License**
   - Bulk licenses for schools
   - Custom branding
   - Progress tracking
   - No external links

## Future Development

### Version 1.1 - Power & Polish
- Power-up system implementation
- Sound effects and music
- Enhanced animations
- Performance optimizations

### Version 1.2 - Social Features
- Friend system
- Challenge mode
- Share scores
- Multiplayer prep

### Version 2.0 - Multiplayer Madness
- Real-time competitions
- Team modes
- Tournament system
- Spectator mode

### Version 3.0 - Mobile Native
- iOS app
- Android app
- Cloud saves
- Push notifications

### Long-term Vision
- VR/AR support
- Voice commands
- AI opponents
- Procedural events
- Community mods

---

## Appendices

### A. Control Schemes

**Keyboard**
- 1-5: Select drinks
- Space: Pause
- M: Mute
- ESC: Menu
- Tab: Navigate UI

**Mouse/Touch**
- Click/Tap: Select drinks
- Swipe: Navigate carousel
- Long press: View drink info
- Pinch: Zoom UI

### B. Difficulty Scaling

| Parameter | Easy | Medium | Hard |
|-----------|------|--------|------|
| Decay Rate | 2/s | 3/s | 5/s |
| Event Frequency | 5% | 10% | 15% |
| Cooldowns | 0.5x | 1x | 1.5x |
| Score Multiplier | 1x | 1.5x | 2x |
| Starting Health | 100 | 100 | 80 |

### C. Analytics Events

- Game start/end
- Drink selections
- Achievement unlocks
- Score milestones
- Failure reasons
- Settings changes
- Tutorial completion

---

*Last Updated: September 2024*
*Version: 1.0.0*