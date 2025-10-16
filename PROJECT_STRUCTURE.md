# Project Structure

## Directory Organization

```
stay-caffeinated/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── [test pages]/       # Test pages for development
│
├── components/             # React components
│   ├── game/              # Game-specific components
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
│
├── game/                   # Game logic and mechanics
│   ├── core/              # Core game engine
│   │   └── constants.ts   # Game constants and config
│   ├── events/            # Event system
│   └── mechanics/         # Game mechanics
│       └── drinks.ts      # Drink system
│
├── hooks/                  # Custom React hooks
│   ├── useAnimation.ts     # Animation hooks
│   └── index.ts           # Central exports
│
├── types/                  # TypeScript type definitions
│   ├── game.ts            # Game-related types
│   ├── drinks.ts          # Drink-related types
│   ├── events.ts          # Event-related types
│   └── index.ts           # Central exports
│
├── utils/                  # Utility functions
│   ├── animations.ts       # Animation utilities
│   └── index.ts           # Central exports + utilities
│
├── lib/                    # Library wrappers
│   └── anime.ts           # Anime.js wrapper
│
├── public/                 # Static assets
├── docs/                   # Documentation
└── plans/                  # Project planning documents
```

## Module Organization

### Separation of Concerns

- **app/**: Contains only page components and routing logic
- **components/**: Presentational React components
- **game/**: Pure game logic, no React dependencies
- **hooks/**: React-specific logic and state management
- **types/**: TypeScript interfaces and types
- **utils/**: Pure utility functions
- **lib/**: Third-party library wrappers

### Import Patterns

```typescript
// Import from centralized exports
import { GameState, DrinkType } from '@/types';
import { useAnimation } from '@/hooks';
import { DRINKS, calculateDrinkEffect } from '@/game';
import { clamp, formatTime } from '@/utils';
```

### File Naming Conventions

- Components: PascalCase (e.g., `StatusBar.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useGameState.ts`)
- Utils/Logic: camelCase (e.g., `animations.ts`)
- Types: singular noun (e.g., `game.ts`, `drinks.ts`)
- Constants: UPPER_SNAKE_CASE in code

### Export Strategy

Each major directory has an `index.ts` file that:
1. Re-exports all public APIs from that module
2. Provides a clean import path
3. Controls what is exposed to other modules

This structure ensures:
- Clear separation of concerns
- Easy module discovery
- Predictable file locations
- Scalable architecture
- Clean import paths