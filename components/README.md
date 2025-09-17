# Components Directory Structure

This directory contains all React components organized by their purpose:

## Directory Structure

### `/game`
Game-specific components like status bars, character, workspace, etc.
- `StatusBars.tsx` - Caffeine and health bars
- `Character.tsx` - Player character visualization
- `Workspace.tsx` - Game environment
- `DrinkSelector.tsx` - Drink selection UI

### `/ui`
Reusable UI components
- `Button.tsx` - Generic button component
- `Modal.tsx` - Modal dialog component
- `Card.tsx` - Card container component
- `ProgressBar.tsx` - Generic progress bar

### `/layout`
Layout components
- `Header.tsx` - Page header
- `Footer.tsx` - Page footer
- `Container.tsx` - Layout container

## Component Guidelines

1. Each component should be in its own file
2. Use TypeScript interfaces for props
3. Export components as named exports
4. Include JSDoc comments for complex components
5. Keep components focused on a single responsibility

## Example Component Structure

```tsx
import React from 'react';

interface ComponentProps {
  // Define props here
}

export function Component({ ...props }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```