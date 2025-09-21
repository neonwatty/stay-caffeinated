# E2E Testing with Playwright

This directory contains end-to-end tests for the Stay Caffeinated game using Playwright.

## Structure

```
e2e/
├── fixtures/       # Page Object Models and shared test fixtures
├── tests/          # Test specifications
├── utils/          # Helper utilities for tests
└── README.md       # This file
```

## Running Tests

### Local Development

```bash
# Run all tests headless
npm run e2e

# Run tests with browser visible
npm run e2e:headed

# Debug tests interactively
npm run e2e:debug

# Open Playwright UI mode
npm run e2e:ui

# Generate tests using Playwright codegen
npm run e2e:codegen

# View test report
npm run e2e:report
```

### Run Specific Test Files

```bash
# Run only homepage tests
npx playwright test e2e/tests/homepage.spec.ts

# Run only game flow tests
npx playwright test e2e/tests/game-flow.spec.ts

# Run accessibility tests
npx playwright test e2e/tests/accessibility.spec.ts

# Run performance tests
npx playwright test e2e/tests/performance.spec.ts
```

### Run Tests in Specific Browsers

```bash
# Run in Chrome only
npx playwright test --project=chromium

# Run in Firefox only
npx playwright test --project=firefox

# Run in Safari only
npx playwright test --project=webkit

# Run mobile tests
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## Test Categories

### 1. Homepage Tests (`homepage.spec.ts`)
- Title and heading validation
- Difficulty selection
- UI element presence
- Responsive design
- Keyboard navigation

### 2. Game Flow Tests (`game-flow.spec.ts`)
- Complete game playthrough
- Drink consumption mechanics
- Pause/resume functionality
- Score tracking
- Game over scenarios

### 3. Accessibility Tests (`accessibility.spec.ts`)
- WCAG compliance using axe-core
- Keyboard navigation
- ARIA labels and roles
- Color contrast
- Focus indicators
- Screen reader announcements

### 4. Performance Tests (`performance.spec.ts`)
- Page load times
- Web Vitals (FCP, LCP, CLS)
- Interaction responsiveness
- Memory leak detection
- Animation frame rates

## Page Object Model

The `GamePage` class in `fixtures/game-page.ts` provides a clean interface for interacting with game elements:

```typescript
const gamePage = new GamePage(page);
await gamePage.goto();
await gamePage.selectDifficulty('intern');
await gamePage.startGame();
await gamePage.consumeDrink('coffee');
```

## Writing New Tests

1. Create a new test file in `e2e/tests/`
2. Import necessary utilities:
   ```typescript
   import { test, expect } from '@playwright/test';
   import { GamePage } from '../fixtures/game-page';
   ```
3. Write your test cases:
   ```typescript
   test.describe('Feature Name', () => {
     test('should do something', async ({ page }) => {
       // Your test code here
     });
   });
   ```

## Best Practices

1. **Use Page Object Models**: Keep selectors and page interactions in fixture files
2. **Explicit Waits**: Use Playwright's built-in waiting mechanisms instead of arbitrary timeouts
3. **Test Isolation**: Each test should be independent and not rely on previous test state
4. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
5. **Assertions**: Use proper assertions instead of just checking for element presence
6. **Error Handling**: Tests should fail gracefully with clear error messages

## CI/CD Integration

Tests run automatically on GitHub Actions for:
- Every push to main/develop branches
- All pull requests
- Manual workflow dispatch

The CI pipeline tests across multiple browsers and generates reports with screenshots and videos for failed tests.

## Debugging Failed Tests

1. **Run with debug mode**: `npm run e2e:debug`
2. **Check screenshots**: Located in `test-results/` directory
3. **Watch videos**: Failed test recordings in `test-results/`
4. **View traces**: Use `npx playwright show-trace` to view detailed execution traces
5. **HTML Report**: Run `npm run e2e:report` after tests to see detailed HTML report

## Configuration

Test configuration is in `playwright.config.ts`:
- Base URL: `http://localhost:3000` (configurable via `PLAYWRIGHT_BASE_URL` env var)
- Browsers: Chromium, Firefox, WebKit
- Mobile devices: Pixel 7, iPhone 14
- Retries: 2 on CI, 0 locally
- Artifacts: Screenshots on failure, videos on failure, traces on retry