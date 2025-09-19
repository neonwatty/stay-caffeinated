# API Documentation

This document provides comprehensive documentation for the Stay Caffeinated game API, including internal APIs, game mechanics interfaces, and integration points.

## Table of Contents

- [Overview](#overview)
- [Game State API](#game-state-api)
- [Game Mechanics API](#game-mechanics-api)
- [Utility APIs](#utility-apis)
- [Hook APIs](#hook-apis)
- [Event System](#event-system)
- [Storage API](#storage-api)
- [Performance API](#performance-api)
- [Error Handling](#error-handling)

## Overview

Stay Caffeinated uses a modular API architecture with clear separation between game logic, UI components, and utility functions. All APIs are TypeScript-based with full type safety.

### API Principles

- **Type Safety**: All APIs use TypeScript interfaces
- **Immutability**: State updates return new objects
- **Pure Functions**: Game mechanics are pure functions
- **Error Boundaries**: Graceful error handling
- **Performance**: Optimized for 60 FPS gameplay

## Game State API

### useGameState Hook

Primary hook for managing game state.

```typescript
import { useGameState } from '@/hooks/useGameState';

const gameState = useGameState();
```

#### Returns

```typescript
interface UseGameStateReturn {
  // State
  currentState: GameState;
  stats: GameStats;
  config: GameConfig;
  scoreDisplay: number;

  // Actions
  startGame: (difficulty?: Difficulty) => void;
  endGame: (reason: GameEndReason) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  consumeDrink: (drinkType: DrinkType) => void;
  updateStats: (updates: Partial<GameStats>) => void;

  // Computed Properties
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
}
```

#### Example Usage

```typescript
function GameComponent() {
  const {
    stats,
    consumeDrink,
    isPlaying
  } = useGameState();

  const handleDrinkSelection = (drink: DrinkType) => {
    if (isPlaying) {
      consumeDrink(drink);
    }
  };

  return (
    <div>
      <div>Caffeine: {stats.currentCaffeineLevel}%</div>
      <button onClick={() => handleDrinkSelection('coffee')}>
        Drink Coffee
      </button>
    </div>
  );
}
```

### GameStats Interface

```typescript
interface GameStats {
  currentCaffeineLevel: number;  // 0-100
  currentHealthLevel: number;     // 0-100
  timeElapsed: number;           // seconds
  drinksConsumed: number;
  score: number;
  streak: number;
  isInOptimalZone: boolean;
}
```

### GameConfig Interface

```typescript
interface GameConfig {
  difficulty: Difficulty;
  duration: number;              // seconds
  caffeineDecayRate: number;     // units per second
  healthDecayRate: number;       // units per second
  optimalZoneMin: number;        // percentage
  optimalZoneMax: number;        // percentage
  soundEnabled: boolean;
  particlesEnabled: boolean;
  screenShakeEnabled: boolean;
}
```

## Game Mechanics API

### CaffeineSystem

Manages caffeine metabolism and effects.

```typescript
import { CaffeineSystem } from '@/game/mechanics/caffeineSystem';
```

#### Methods

```typescript
class CaffeineSystem {
  // Calculate caffeine decay
  static calculateDecay(
    currentLevel: number,
    deltaTime: number,
    decayRate: number
  ): number;

  // Apply drink effects
  static applyDrinkEffect(
    currentLevel: number,
    drinkType: DrinkType
  ): number;

  // Check if in optimal zone
  static isInOptimalZone(
    level: number,
    min: number,
    max: number
  ): boolean;

  // Calculate crash probability
  static getCrashProbability(level: number): number;
}
```

#### Example

```typescript
// Calculate caffeine decay over time
const newLevel = CaffeineSystem.calculateDecay(
  currentCaffeine,
  deltaTime,
  config.caffeineDecayRate
);

// Apply coffee effect
const afterDrink = CaffeineSystem.applyDrinkEffect(
  currentCaffeine,
  'coffee'
);
```

### ScoringSystem

Handles score calculation and multipliers.

```typescript
import { ScoringSystem } from '@/game/mechanics/scoringSystem';
```

#### Methods

```typescript
class ScoringSystem {
  // Calculate base score
  static calculateBaseScore(
    timeElapsed: number,
    difficulty: Difficulty
  ): number;

  // Apply multipliers
  static applyMultipliers(
    baseScore: number,
    multipliers: ScoreMultipliers
  ): number;

  // Calculate streak bonus
  static calculateStreakBonus(
    streakTime: number
  ): number;

  // Get achievement points
  static getAchievementPoints(
    achievementId: string
  ): number;
}
```

#### ScoreMultipliers Interface

```typescript
interface ScoreMultipliers {
  optimalZone: number;      // 1.0 - 2.0
  health: number;           // 1.0 - 1.5
  streak: number;           // 1.0 - 3.0
  difficulty: number;       // 1.0 - 2.0
  events: number;           // 0.5 - 1.5
}
```

### EventSystem

Manages random game events.

```typescript
import { EventSystem } from '@/game/events/eventSystem';
```

#### Methods

```typescript
class EventSystem {
  // Initialize event system
  constructor(config: EventConfig);

  // Check for new events
  checkForEvent(gameTime: number): GameEvent | null;

  // Apply event effects
  applyEventEffects(
    event: GameEvent,
    state: GameState
  ): GameState;

  // End current event
  endEvent(eventId: string): void;

  // Get active events
  getActiveEvents(): GameEvent[];
}
```

#### GameEvent Interface

```typescript
interface GameEvent {
  id: string;
  type: EventType;
  name: string;
  description: string;
  duration: number;          // seconds
  effects: EventEffects;
  probability: number;       // 0-1
  minTime?: number;         // earliest occurrence
  maxTime?: number;         // latest occurrence
}

type EventType =
  | 'coffee_machine_broken'
  | 'double_shot_day'
  | 'health_inspector'
  | 'team_meeting'
  | 'lunch_break';

interface EventEffects {
  caffeineMultiplier?: number;
  healthMultiplier?: number;
  scoreMultiplier?: number;
  disabledDrinks?: DrinkType[];
}
```

## Utility APIs

### Animation Utils

```typescript
import {
  animateCaffeineBar,
  animateHealthBar,
  animateScore,
  createParticleEffect
} from '@/utils/animations';

// Animate caffeine bar change
animateCaffeineBar(element, fromValue, toValue, duration);

// Create particle burst effect
createParticleEffect({
  x: 100,
  y: 200,
  count: 20,
  color: '#00ff00',
  spread: 45
});
```

### Sound Manager

```typescript
import { SoundManager } from '@/utils/soundManager';

// Initialize sound manager
const sound = new SoundManager({
  enabled: true,
  volume: 0.5
});

// Play sound effects
sound.play('drink_coffee');
sound.play('achievement_unlock');
sound.play('game_over');

// Background music
sound.startMusic('game_theme');
sound.stopMusic();
```

### Storage Utils

```typescript
import {
  saveGameState,
  loadGameState,
  clearGameData,
  getHighScore,
  saveHighScore
} from '@/utils/storage';

// Save current game
saveGameState(gameState);

// Load saved game
const savedState = loadGameState();

// High scores
const highScore = getHighScore('hard');
saveHighScore('hard', 10000);
```

## Hook APIs

### useGameLoop

Main game loop hook for real-time updates.

```typescript
import { useGameLoop } from '@/hooks/useGameLoop';

function Game() {
  const { stats, updateStats } = useGameState();

  useGameLoop({
    onUpdate: (deltaTime) => {
      // Update game logic
      const newCaffeine = stats.currentCaffeineLevel -
        (deltaTime * config.caffeineDecayRate);

      updateStats({
        currentCaffeineLevel: Math.max(0, newCaffeine)
      });
    },
    fps: 60,
    enabled: isPlaying
  });
}
```

### useAnimation

Animation hook using Anime.js.

```typescript
import { useAnimation } from '@/hooks/useAnimation';

function AnimatedComponent() {
  const { ref, play, pause, restart } = useAnimation({
    scale: [1, 1.2, 1],
    duration: 400,
    easing: 'easeOutElastic',
    autoplay: false
  });

  return (
    <div ref={ref} onClick={play}>
      Click to animate
    </div>
  );
}
```

### useKeyboardControls

Keyboard input handling.

```typescript
import { useKeyboardControls } from '@/hooks/useKeyboardControls';

function GameControls() {
  const { consumeDrink } = useGameState();

  useKeyboardControls({
    '1': () => consumeDrink('coffee'),
    '2': () => consumeDrink('tea'),
    '3': () => consumeDrink('energy_drink'),
    '4': () => consumeDrink('soda'),
    '5': () => consumeDrink('water'),
    'Space': () => togglePause(),
    'Escape': () => openMenu()
  });
}
```

### useAchievements

Achievement tracking and unlocking.

```typescript
import { useAchievements } from '@/hooks/useAchievements';

function AchievementTracker() {
  const {
    achievements,
    unlockAchievement,
    getProgress,
    isUnlocked
  } = useAchievements();

  // Check achievement conditions
  useEffect(() => {
    if (stats.streak >= 300) {
      unlockAchievement('streak_master');
    }
  }, [stats.streak]);

  return (
    <div>
      Progress: {getProgress('streak_master')}%
    </div>
  );
}
```

## Event System

### Event Bus

Global event communication system.

```typescript
import { eventBus } from '@/utils/eventBus';

// Subscribe to events
eventBus.on('game:start', (data) => {
  console.log('Game started', data);
});

eventBus.on('achievement:unlock', (achievement) => {
  showNotification(`Unlocked: ${achievement.name}`);
});

// Emit events
eventBus.emit('game:start', { difficulty: 'hard' });
eventBus.emit('score:update', { score: 1000 });

// Unsubscribe
eventBus.off('game:start', handler);
```

### Event Types

```typescript
type GameEventType =
  | 'game:start'
  | 'game:end'
  | 'game:pause'
  | 'game:resume'
  | 'drink:consume'
  | 'score:update'
  | 'achievement:unlock'
  | 'event:start'
  | 'event:end'
  | 'health:critical'
  | 'caffeine:critical';
```

## Storage API

### Local Storage Manager

```typescript
import { StorageManager } from '@/utils/storage';

// Initialize storage
const storage = new StorageManager('stay-caffeinated');

// Save data
storage.set('user-settings', {
  soundEnabled: true,
  difficulty: 'medium'
});

// Load data
const settings = storage.get('user-settings');

// Remove data
storage.remove('user-settings');

// Clear all game data
storage.clear();
```

### IndexedDB for Large Data

```typescript
import { GameDatabase } from '@/utils/database';

// Initialize database
const db = new GameDatabase();

// Save game replay
await db.saveReplay({
  id: 'replay-001',
  timestamp: Date.now(),
  actions: gameActions,
  finalScore: 10000
});

// Load replays
const replays = await db.getRepl   ays();

// Delete old replays
await db.deleteReplay('replay-001');
```

## Performance API

### Performance Monitor

```typescript
import { PerformanceMonitor } from '@/utils/performance';

const monitor = new PerformanceMonitor();

// Start monitoring
monitor.start();

// Mark specific operations
monitor.mark('render-start');
// ... render operations
monitor.mark('render-end');
monitor.measure('render-time', 'render-start', 'render-end');

// Get metrics
const metrics = monitor.getMetrics();
console.log('FPS:', metrics.fps);
console.log('Frame time:', metrics.frameTime);
console.log('Memory:', metrics.memory);

// Stop monitoring
monitor.stop();
```

### Performance Optimization Utils

```typescript
import {
  throttle,
  debounce,
  memoize,
  requestIdleCallback
} from '@/utils/performance';

// Throttle expensive operations
const throttledUpdate = throttle(updateUI, 16); // 60 FPS

// Debounce user input
const debouncedSearch = debounce(search, 300);

// Memoize calculations
const memoizedScore = memoize(calculateComplexScore);

// Defer non-critical work
requestIdleCallback(() => {
  saveAnalytics();
});
```

## Error Handling

### Error Boundaries

```typescript
import { GameErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <GameErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Game error:', error);
        logErrorToService(error, errorInfo);
      }}
      fallback={<ErrorFallback />}
    >
      <Game />
    </GameErrorBoundary>
  );
}
```

### Error Types

```typescript
class GameError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public context?: any
  ) {
    super(message);
    this.name = 'GameError';
  }
}

enum ErrorCode {
  INITIALIZATION_FAILED = 'INIT_001',
  STATE_CORRUPTION = 'STATE_001',
  SAVE_FAILED = 'SAVE_001',
  LOAD_FAILED = 'LOAD_001',
  NETWORK_ERROR = 'NET_001',
  VALIDATION_ERROR = 'VAL_001'
}
```

### Error Recovery

```typescript
import { ErrorRecovery } from '@/utils/errorRecovery';

const recovery = new ErrorRecovery({
  maxRetries: 3,
  retryDelay: 1000,
  onError: (error) => {
    console.error('Recovery failed:', error);
  }
});

// Wrap risky operations
const result = await recovery.execute(async () => {
  return await riskyOperation();
});

// With custom recovery strategy
const saved = await recovery.execute(
  () => saveGameState(state),
  {
    fallback: () => saveToLocalStorage(state),
    retries: 5
  }
);
```

## Testing Utilities

### Mock Factories

```typescript
import {
  createMockGameState,
  createMockStats,
  createMockEvent
} from '@/test-utils/mocks';

// Create test data
const mockState = createMockGameState({
  currentState: 'playing',
  stats: createMockStats({
    currentCaffeineLevel: 50
  })
});

const mockEvent = createMockEvent('coffee_machine_broken');
```

### Test Helpers

```typescript
import {
  renderWithGameContext,
  simulateGameplay,
  waitForNextFrame
} from '@/test-utils/helpers';

// Render with game context
const { getByRole } = renderWithGameContext(
  <GameComponent />
);

// Simulate gameplay
await simulateGameplay({
  duration: 60, // seconds
  actions: [
    { time: 10, action: 'drink', drink: 'coffee' },
    { time: 20, action: 'drink', drink: 'water' }
  ]
});

// Wait for animation frame
await waitForNextFrame();
```

## WebSocket API (Future)

### Multiplayer Support

```typescript
import { MultiplayerClient } from '@/api/multiplayer';

const client = new MultiplayerClient({
  url: 'wss://api.staycaffeinated.game',
  roomId: 'room-123'
});

// Connect to game room
await client.connect();

// Send game actions
client.sendAction({
  type: 'drink',
  drink: 'coffee',
  timestamp: Date.now()
});

// Receive opponent actions
client.on('opponent:action', (action) => {
  updateOpponentState(action);
});

// Disconnect
client.disconnect();
```

---

## API Response Formats

### Success Response

```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: number;
}
```

### Error Response

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: number;
}
```

## Rate Limiting

API calls are rate-limited to prevent abuse:

- Game state updates: 60/second
- Score submissions: 1/second
- Achievement unlocks: 10/minute
- Analytics events: 100/minute

## Versioning

The API follows semantic versioning:

- **Current Version**: 1.0.0
- **Minimum Supported**: 1.0.0
- **Deprecation Notice**: 30 days

---

*Last Updated: September 2024*
*API Version: 1.0.0*