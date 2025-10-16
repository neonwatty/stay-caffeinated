# Architecture Documentation

This document describes the technical architecture of Stay Caffeinated, including system design, component structure, data flow, and architectural decisions.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Principles](#architecture-principles)
- [Technology Stack](#technology-stack)
- [Application Structure](#application-structure)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [Performance Architecture](#performance-architecture)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Future Architecture](#future-architecture)

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                          │
├─────────────────────────────────────────────────────────────┤
│                    Next.js Application                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    App Router                        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                  React Components                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │   │
│  │  │   Pages   │  │   Game   │  │      UI      │     │   │
│  │  │           │  │Components│  │  Components  │     │   │
│  │  └──────────┘  └──────────┘  └──────────────┘     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                   Game Engine                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │   │
│  │  │Mechanics │  │  Events  │  │   Scoring    │     │   │
│  │  │  System  │  │  System  │  │   System     │     │   │
│  │  └──────────┘  └──────────┘  └──────────────┘     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                  State Management                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │   │
│  │  │  Context │  │   Hooks  │  │Local Storage │     │   │
│  │  │    API   │  │          │  │              │     │   │
│  │  └──────────┘  └──────────┘  └──────────────┘     │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                     External Services                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐            │
│  │Analytics │  │   CDN    │  │  Monitoring  │            │
│  └──────────┘  └──────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Architecture Principles

### Core Principles

1. **Separation of Concerns**
   - Clear boundaries between game logic, UI, and data
   - Modular component design
   - Single responsibility principle

2. **Performance First**
   - 60 FPS target for all animations
   - Lazy loading and code splitting
   - Optimized re-renders

3. **Type Safety**
   - Full TypeScript coverage
   - Strict type checking
   - No implicit any types

4. **Accessibility**
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support

5. **Progressive Enhancement**
   - Core functionality without JavaScript
   - Enhanced features for modern browsers
   - Graceful degradation

## Technology Stack

### Frontend Core

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5 | React framework with SSR/SSG |
| React | 19.1 | UI library |
| TypeScript | 5.0 | Type safety |
| Tailwind CSS | 4.0 | Utility-first CSS |

### Game Engine

| Technology | Purpose |
|------------|---------|
| Anime.js | Animation library |
| Canvas API | Particle effects |
| Web Audio API | Sound effects (future) |
| RequestAnimationFrame | Game loop |

### Development Tools

| Tool | Purpose |
|------|---------|
| Vitest | Testing framework |
| ESLint | Code linting |
| Prettier | Code formatting |
| Husky | Git hooks |

### Build & Deploy

| Tool | Purpose |
|------|---------|
| Webpack | Module bundling |
| Turbopack | Fast development builds |
| GitHub Actions | CI/CD pipeline |
| GitHub Pages | Static hosting |

## Application Structure

```
stay-caffeinated/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── web-vitals.tsx      # Performance monitoring
│
├── components/              # React components
│   ├── game/               # Game-specific components
│   │   ├── CaffeineBar.tsx
│   │   ├── HealthBar.tsx
│   │   ├── DrinkSelector.tsx
│   │   ├── ScoreDisplay.tsx
│   │   └── ...
│   │
│   └── ui/                 # Reusable UI components
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       └── ...
│
├── game/                   # Game logic
│   ├── mechanics/         # Core game mechanics
│   │   ├── caffeineSystem.ts
│   │   ├── healthSystem.ts
│   │   ├── scoringSystem.ts
│   │   └── gameMechanics.ts
│   │
│   └── events/           # Event system
│       ├── eventSystem.ts
│       ├── eventTypes.ts
│       └── eventHandlers.ts
│
├── hooks/                 # Custom React hooks
│   ├── useGameState.ts
│   ├── useGameLoop.ts
│   ├── useAnimation.ts
│   └── ...
│
├── utils/                # Utility functions
│   ├── animations.ts
│   ├── storage.ts
│   ├── performance.ts
│   └── ...
│
├── types/                # TypeScript definitions
│   ├── game.ts
│   ├── events.ts
│   ├── drinks.ts
│   └── ...
│
├── styles/              # Styling
│   ├── animations.css
│   ├── themes.css
│   └── utilities.css
│
├── public/             # Static assets
│   ├── images/
│   ├── sounds/
│   └── fonts/
│
└── docs/              # Documentation
    ├── API.md
    ├── ARCHITECTURE.md
    ├── SETUP.md
    └── ...
```

## Component Architecture

### Component Hierarchy

```
App
├── Layout
│   ├── Header
│   └── Footer
│
├── GameContainer
│   ├── GameCanvas
│   │   ├── Character
│   │   ├── Background
│   │   └── Effects
│   │
│   ├── GameUI
│   │   ├── StatusBars
│   │   │   ├── CaffeineBar
│   │   │   └── HealthBar
│   │   │
│   │   ├── Controls
│   │   │   ├── DrinkSelector
│   │   │   └── ActionButtons
│   │   │
│   │   └── Display
│   │       ├── ScoreDisplay
│   │       ├── Timer
│   │       └── EventNotification
│   │
│   └── Overlays
│       ├── StartScreen
│       ├── PauseMenu
│       ├── GameOverScreen
│       └── SettingsMenu
│
└── ErrorBoundary
```

### Component Design Patterns

#### 1. Compound Components

```typescript
// Example: StatusBar compound component
<StatusBar>
  <StatusBar.Label>Caffeine</StatusBar.Label>
  <StatusBar.Progress value={caffeineLevel} />
  <StatusBar.Indicator status={caffeineStatus} />
</StatusBar>
```

#### 2. Render Props

```typescript
// Example: Animation render prop
<AnimationController
  render={({ play, pause, progress }) => (
    <div onClick={play}>
      Animation Progress: {progress}%
    </div>
  )}
/>
```

#### 3. Higher-Order Components

```typescript
// Example: withGameContext HOC
const EnhancedComponent = withGameContext(Component);
```

#### 4. Custom Hooks

```typescript
// Example: Game state hook
function GameComponent() {
  const { stats, consumeDrink } = useGameState();
  // Component logic
}
```

## State Management

### State Architecture

```
┌─────────────────────────────────────┐
│         Global State                 │
│   (React Context + useReducer)      │
├─────────────────────────────────────┤
│         Component State              │
│         (useState, useRef)          │
├─────────────────────────────────────┤
│        Persistent State             │
│        (LocalStorage)               │
└─────────────────────────────────────┘
```

### State Flow

```typescript
// 1. Action Dispatch
dispatch({ type: 'CONSUME_DRINK', payload: 'coffee' })

// 2. Reducer Processing
const gameReducer = (state, action) => {
  switch (action.type) {
    case 'CONSUME_DRINK':
      return {
        ...state,
        caffeine: state.caffeine + DRINK_EFFECTS[action.payload]
      };
  }
};

// 3. State Update
const newState = reducer(currentState, action);

// 4. Component Re-render
useEffect(() => {
  // React to state changes
}, [state]);
```

### State Types

```typescript
interface AppState {
  game: GameState;
  user: UserState;
  settings: SettingsState;
  ui: UIState;
}

interface GameState {
  status: 'idle' | 'playing' | 'paused' | 'gameOver';
  stats: GameStats;
  config: GameConfig;
  events: ActiveEvent[];
}

interface UserState {
  achievements: Achievement[];
  highScores: HighScore[];
  preferences: UserPreferences;
}

interface SettingsState {
  sound: boolean;
  music: boolean;
  particles: boolean;
  difficulty: Difficulty;
}

interface UIState {
  activeModal: string | null;
  notifications: Notification[];
  theme: 'light' | 'dark' | 'system';
}
```

## Data Flow

### Game Loop Data Flow

```
┌──────────────┐
│   User Input │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Input Handler│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Game Logic   │◄───┐
└──────┬───────┘    │
       │            │
       ▼            │
┌──────────────┐    │
│State Update  │    │
└──────┬───────┘    │
       │            │
       ▼            │
┌──────────────┐    │
│   Render     │    │
└──────┬───────┘    │
       │            │
       ▼            │
┌──────────────┐    │
│Animation Frame├───┘
└──────────────┘
```

### Event System Flow

```typescript
// 1. Event Trigger
eventBus.emit('drink:consumed', { type: 'coffee' });

// 2. Event Listeners
eventBus.on('drink:consumed', (data) => {
  // Update caffeine level
  updateCaffeine(data.type);

  // Trigger animations
  animateDrinkConsumption(data.type);

  // Check achievements
  checkAchievements({ drinkConsumed: data.type });

  // Update analytics
  trackEvent('drink_consumed', data);
});

// 3. State Updates
// Each listener updates relevant state

// 4. UI Updates
// React re-renders based on state changes
```

## Performance Architecture

### Optimization Strategies

#### 1. Code Splitting

```typescript
// Dynamic imports for heavy components
const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  { ssr: false }
);
```

#### 2. Memoization

```typescript
// Memoize expensive calculations
const memoizedScore = useMemo(
  () => calculateComplexScore(stats),
  [stats]
);

// Memoize components
const MemoizedComponent = memo(Component);
```

#### 3. Virtual DOM Optimization

```typescript
// Use keys for list items
items.map(item => (
  <Item key={item.id} {...item} />
));

// Avoid inline functions
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

#### 4. Asset Optimization

```
- Image compression (WebP, AVIF)
- Font subsetting
- CSS minification
- JavaScript tree-shaking
- Lazy loading images
```

### Performance Monitoring

```typescript
// Core Web Vitals monitoring
export function reportWebVitals(metric) {
  switch (metric.name) {
    case 'FCP': // First Contentful Paint
    case 'LCP': // Largest Contentful Paint
    case 'CLS': // Cumulative Layout Shift
    case 'FID': // First Input Delay
    case 'TTFB': // Time to First Byte
      analytics.track(metric.name, {
        value: metric.value,
        rating: metric.rating
      });
      break;
  }
}
```

## Security Architecture

### Security Measures

#### 1. Content Security Policy

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob:;
      font-src 'self';
      connect-src 'self' https://api.staycaffeinated.game;
    `.replace(/\n/g, ' ')
  }
];
```

#### 2. Input Validation

```typescript
// Validate all user inputs
function validateDrinkSelection(drink: unknown): DrinkType {
  if (!isValidDrinkType(drink)) {
    throw new ValidationError('Invalid drink type');
  }
  return drink as DrinkType;
}
```

#### 3. XSS Prevention

```typescript
// Sanitize user-generated content
function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input);
}
```

#### 4. State Validation

```typescript
// Validate state transitions
function validateStateTransition(
  current: GameState,
  next: GameState
): boolean {
  // Ensure valid state transitions
  const validTransitions = {
    idle: ['playing'],
    playing: ['paused', 'gameOver'],
    paused: ['playing', 'gameOver'],
    gameOver: ['idle']
  };

  return validTransitions[current]?.includes(next);
}
```

## Deployment Architecture

### Build Pipeline

```
Source Code
    │
    ▼
TypeScript Compilation
    │
    ▼
Bundle Optimization
    │
    ▼
Asset Optimization
    │
    ▼
Static Site Generation
    │
    ▼
Deploy to CDN
```

### Deployment Environments

```yaml
# Production
- URL: https://staycaffeinated.game
- Branch: main
- Auto-deploy: Yes
- Cache: CloudFlare CDN

# Staging
- URL: https://staging.staycaffeinated.game
- Branch: develop
- Auto-deploy: Yes
- Cache: Browser only

# Preview
- URL: Dynamic per PR
- Branch: PR branches
- Auto-deploy: Yes
- Cache: Disabled
```

### CI/CD Pipeline

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    - Lint code
    - Type check
    - Run tests
    - Check coverage

  build:
    - Build application
    - Optimize assets
    - Generate sitemap

  deploy:
    - Upload to CDN
    - Invalidate cache
    - Update DNS
    - Health check
```

## Future Architecture

### Planned Enhancements

#### 1. Multiplayer Architecture

```
┌─────────────┐     WebSocket     ┌─────────────┐
│  Player 1   │◄─────────────────►│ Game Server │
└─────────────┘                   └──────┬──────┘
                                         │
┌─────────────┐                         │
│  Player 2   │◄────────────────────────┘
└─────────────┘
```

#### 2. Backend Services

```typescript
// Future API structure
/api
  /auth         # Authentication
  /users        # User management
  /games        # Game sessions
  /leaderboard  # High scores
  /achievements # Achievement tracking
  /analytics    # Game analytics
```

#### 3. Microservices

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Game Service │  │ User Service │  │Score Service │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                    ┌─────▼─────┐
                    │ API Gateway│
                    └────────────┘
```

#### 4. Database Architecture

```sql
-- Future database schema
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  created_at TIMESTAMP
);

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  score INTEGER,
  duration INTEGER,
  created_at TIMESTAMP
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_id VARCHAR(255),
  unlocked_at TIMESTAMP
);
```

### Scalability Considerations

1. **Horizontal Scaling**
   - Load balancing
   - Database sharding
   - CDN distribution

2. **Caching Strategy**
   - Redis for session data
   - CDN for static assets
   - Browser caching

3. **Performance Targets**
   - < 100ms API response time
   - < 1s page load time
   - 99.9% uptime

---

## Architecture Decision Records (ADRs)

### ADR-001: Use Next.js App Router

**Status**: Accepted
**Context**: Need modern React framework with good performance
**Decision**: Use Next.js 15 with App Router
**Consequences**: Better performance, built-in optimizations, learning curve for team

### ADR-002: TypeScript Everywhere

**Status**: Accepted
**Context**: Need type safety and better developer experience
**Decision**: Use TypeScript for all code
**Consequences**: Increased type safety, better IDE support, slight build time increase

### ADR-003: Tailwind CSS

**Status**: Accepted
**Context**: Need consistent, maintainable styling solution
**Decision**: Use Tailwind CSS v4
**Consequences**: Utility-first approach, smaller CSS bundle, learning curve

### ADR-004: Client-Side Game Logic

**Status**: Accepted
**Context**: Game needs real-time responsiveness
**Decision**: Run all game logic client-side
**Consequences**: No server costs, instant responsiveness, potential for cheating

---

*Last Updated: September 2024*
*Version: 1.0.0*