# ☕ Stay Caffeinated - Game Concept

## Overview
A darkly humorous survival game where players must maintain optimal caffeine levels throughout an 8-hour workday. Too little caffeine and you pass out; too much and your head explodes. Perfect for our Next.js + TypeScript + Anime.js tech stack.

## 🎮 Core Gameplay Mechanics

### Dual Bar Management System
- **Caffeine Bar**: Constantly depleting, with a green "optimal zone" in the middle
- **Health Bar**: Decreases when caffeine goes outside optimal range
- Both bars use Anime.js for smooth real-time updates with pulsing/warning animations

### Time Progression
- 8-hour workday compressed to ~3-5 minutes of gameplay
- Clock ticks faster as difficulty increases
- Visual day/night cycle in background

## ☕ Consumables & Effects

### Drinks with Different Profiles
| Drink | Caffeine Boost | Release Speed | Crash Severity |
|-------|---------------|---------------|----------------|
| **Tea** 🍵 | +15 | Slow | Minimal |
| **Coffee** ☕ | +30 | Moderate | Moderate |
| **Energy Drink** ⚡ | +50 | Instant | Severe |
| **Espresso Shot** 🔥 | +40 | Instant | Sharp |
| **Water** 💧 | 0 | N/A | None (slows depletion) |

### Visual Feedback Using Anime.js
- Screen shakes when overcaffeinated (spring physics)
- Vision blurs when under-caffeinated (SVG filters)
- Heart rate monitor that speeds up/slows down (timeline animations)
- Steam particles from coffee cups (particle effects)
- Hands shake more as you approach danger zones

## 🏆 Progression System

### Difficulty Levels
1. **Intern**: 6-hour day, wide optimal zone
2. **Junior Dev**: 8-hour day, normal optimal zone
3. **Senior Dev**: 10-hour day, narrow optimal zone
4. **Startup Founder**: 12-hour day, tiny optimal zone, faster depletion

### Challenges & Events
- **Morning Meeting**: Caffeine depletes 2x faster
- **Code Review**: Need to stay in optimal zone for 30 seconds
- **Bug Fix Crisis**: Random caffeine spikes/drops
- **Lunch Break**: Can't consume anything for 20 seconds

## 🎨 Visual Design

### Character States (using SVG morphing)
- **Under-caffeinated**: Droopy eyes, slow blink animations, nodding off
- **Optimal**: Alert, productive typing animations
- **Over-caffeinated**: Wide eyes, jittery movements, sweating particles

### Workspace Environment
- Monitor shows actual code that gets blurrier/clearer based on caffeine
- Coffee cups stack up on desk
- Clock with accelerated hands
- Co-workers that judge your performance

## 🔧 Technical Implementation

### Deployment Strategy
- **Client-side only**: All game logic runs in the browser
- **No backend required**: Game state managed locally
- **Static export**: Built with Next.js `output: 'export'`
- **GitHub Pages deployment**: Free hosting with GitHub Actions CI/CD
- **Local storage**: Save high scores and progress client-side
- **Zero server costs**: Completely static, no API calls needed

### React Components Structure
```typescript
<GameContainer>
  <StatusBars>
    <CaffeineBar /> // Animated level indicator
    <HealthBar />   // Pulsing when in danger
  </StatusBars>
  <Workspace>
    <Character />    // SVG character with state animations
    <Desk />        // Accumulating coffee cups
    <Monitor />     // Shows productivity
  </Workspace>
  <DrinkSelector /> // Draggable drink items
  <TimeDisplay />   // Accelerated clock
</GameContainer>
```

### Anime.js Animation Features
- Liquid sloshing in cups when selected
- Steam rising from hot drinks
- Screen shake intensity based on caffeine level
- Heartbeat visualization
- Smooth bar transitions with easing
- Staggered animations for multiple UI elements

### Game State Management
```typescript
// All state managed client-side, no server needed
interface GameState {
  caffeineLevel: number;
  health: number;
  timeElapsed: number;
  difficulty: DifficultyLevel;
  score: number;
  consumedDrinks: Drink[];
}

// Local storage for persistence
interface SaveData {
  highScores: Record<DifficultyLevel, number>;
  achievements: string[];
  totalGamesPlayed: number;
  preferences: UserPreferences;
}

interface Drink {
  name: string;
  caffeineAmount: number;
  releaseProfile: 'instant' | 'slow' | 'moderate';
  crashSeverity: number;
  effectDuration: number;
}
```

## 🎯 Additional Features

### Power-ups
- **Protein Bar**: Slows caffeine depletion by 25% for 30 seconds
- **Vitamins**: Restores 10% health
- **Power Nap**: Resets to optimal but loses 1 hour of time

### Achievements
- "Perfect Balance" - Stay in optimal zone for 2 minutes
- "Caffeine Tolerance" - Survive on maximum for 30 seconds
- "Natural Energy" - Complete day using only tea
- "Speed Runner" - Complete day in under 2 minutes
- "Health Conscious" - Finish with 80% health

### End Game Scenarios
1. **Pass Out**: Character falls asleep on keyboard (Z's float up)
2. **Head Explosion**: Cartoon-style with particle effects
3. **Success**: Character celebrates with confetti animation

## 📊 Scoring System

### Point Calculation
- **Base points**: 10 points per second survived
- **Optimal zone bonus**: 2x multiplier when in green zone
- **Health bonus**: Final health percentage × 100
- **Difficulty multiplier**: 1x (Intern) to 4x (Startup Founder)
- **Perfect streak bonus**: +500 for every minute in optimal zone

### Leaderboard Categories
- Local high scores (stored in browser)
- Personal best per difficulty
- Fastest completion times
- Most drinks consumed in winning run
- Optional: Share scores via URL parameters (no backend needed)

## 🚀 Future Expansion Ideas

### Additional Modes
- **Endless Mode**: See how long you can survive
- **Challenge Mode**: Specific scenarios to complete
- **Multiplayer**: Compete in real-time caffeine management

### Unlockables
- New drink types (Matcha, Yerba Mate, etc.)
- Character customization
- Office themes
- Special visual effects

### Seasonal Events
- **Monday Morning Madness**: Extra difficult starts
- **Friday Afternoon Drag**: Faster depletion rates
- **Holiday Crunch**: Marathon sessions

## 📱 Responsive Design Considerations
- Mobile-friendly touch controls for drink selection
- Landscape orientation for better gameplay
- Simplified UI for smaller screens
- Swipe gestures for quick drink consumption

## 🎵 Audio Design (Future)
- Heartbeat sound that changes with caffeine level
- Coffee brewing sounds
- Typing sounds that speed up/slow down
- Alert sounds for danger zones
- Chill lo-fi music that distorts when over/under caffeinated

---

## 📦 Deployment & Architecture

### Client-Side Focus
- **100% client-side**: No server, database, or API required
- **Static site generation**: Uses Next.js static export
- **GitHub Pages ready**: Deploys directly via GitHub Actions
- **Offline capable**: Once loaded, works without internet
- **Browser storage**: LocalStorage for saves and settings

### Build & Deploy Process
```bash
# Build for production
npm run build  # Creates static files in 'out' directory

# Deploy to GitHub Pages
git push main  # GitHub Actions handles deployment automatically
```

### Performance Optimizations
- **Code splitting**: Lazy load game components
- **Asset optimization**: SVGs and compressed images
- **Minimal dependencies**: Only Anime.js for animations
- **Static assets**: All resources bundled at build time

This game concept leverages our tech stack perfectly:
- **Next.js**: Component-based architecture, static export for GitHub Pages
- **TypeScript**: Type-safe game logic and state management
- **Anime.js**: All animations and visual effects (lightweight at 24KB)
- **Tailwind CSS**: Rapid UI development and responsive design
- **GitHub Pages**: Free hosting with custom domain support

The combination of relatable theme, skill-based gameplay, and humorous presentation would make this highly shareable and addictive - all while being completely free to host!