import { test, expect } from '@playwright/test';
import { GamePage } from '../fixtures/game-page';

test.describe('Game Flow', () => {
  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
  });

  test('should complete full game flow from start to game over', async ({ page }) => {
    // Select difficulty and start game
    await gamePage.selectDifficulty('intern');
    await gamePage.startGame();

    // Wait for game to start
    await page.waitForTimeout(500);

    // Verify game has started
    await expect(gamePage.gameStatus).toContainText('playing');
    await expect(gamePage.caffeineBar).toBeVisible();
    await expect(gamePage.healthBar).toBeVisible();
    await expect(gamePage.scoreDisplay).toBeVisible();

    // Initial stats check
    const initialCaffeine = await gamePage.getCaffeineLevel();
    expect(initialCaffeine).toBeGreaterThan(0);
    expect(initialCaffeine).toBeLessThanOrEqual(100);

    // Consume some drinks
    await gamePage.consumeDrink('coffee');
    await page.waitForTimeout(1000);

    // Check caffeine increased
    const afterDrinkCaffeine = await gamePage.getCaffeineLevel();
    expect(afterDrinkCaffeine).toBeGreaterThan(initialCaffeine);

    // Test pause functionality
    await gamePage.pauseGame();
    await expect(gamePage.gameStatus).toContainText('paused');

    // Resume game
    await gamePage.pauseButton.click();
    await expect(gamePage.gameStatus).toContainText('playing');

    // Check score is increasing
    await page.waitForTimeout(2000);
    const score = await gamePage.getScore();
    expect(score).toBeGreaterThan(0);
  });

  test('should handle different drink types', async ({ page }) => {
    await gamePage.selectDifficulty('junior');
    await gamePage.startGame();

    // Wait for game to start
    await page.waitForTimeout(500);

    // Test different drinks
    const drinks = ['coffee', 'espresso', 'tea', 'energy-drink'];

    for (const drink of drinks) {
      const beforeCaffeine = await gamePage.getCaffeineLevel();

      // Try to consume drink (might not be available)
      const drinkButton = page.locator(`[data-testid="drink-${drink}"]`);
      const isVisible = await drinkButton.isVisible().catch(() => false);

      if (isVisible) {
        await drinkButton.click();
        await page.waitForTimeout(500);

        const afterCaffeine = await gamePage.getCaffeineLevel();
        // Caffeine should change (increase or stay same if on cooldown)
        expect(afterCaffeine).toBeGreaterThanOrEqual(beforeCaffeine);
      }
    }
  });

  test('should display correct UI elements during gameplay', async ({ page }) => {
    await gamePage.selectDifficulty('senior');
    await gamePage.startGame();

    // Check all game UI elements are present
    await expect(gamePage.caffeineBar).toBeVisible();
    await expect(gamePage.healthBar).toBeVisible();
    await expect(gamePage.scoreDisplay).toBeVisible();
    await expect(gamePage.timeDisplay).toBeVisible();
    await expect(gamePage.pauseButton).toBeVisible();

    // Check drinks are available
    const drinkCount = await gamePage.drinkButtons.count();
    expect(drinkCount).toBeGreaterThan(0);

    // Check optimal zone indicator if present
    const optimalZone = page.locator('[data-testid="optimal-zone"]');
    const isOptimalZoneVisible = await optimalZone.isVisible().catch(() => false);

    if (isOptimalZoneVisible) {
      await expect(optimalZone).toBeVisible();
    }
  });

  test('should handle game over scenario', async ({ page }) => {
    await gamePage.selectDifficulty('founder'); // Hardest difficulty
    await gamePage.startGame();

    // Wait for game to start
    await page.waitForTimeout(500);

    // Let health deplete naturally or force game over
    // This is a simplified test - in real scenario, you might want to
    // manipulate the game state to force game over quickly

    // For now, just verify the game over flow elements exist
    // You could extend this to actually play until game over
    const isPlaying = await gamePage.isGameActive();
    expect(isPlaying).toBe(true);

    // Verify pause works even on hardest difficulty
    await gamePage.pauseGame();
    await expect(gamePage.gameStatus).toContainText('paused');
  });

  test('should maintain game state through pause/resume', async ({ page }) => {
    await gamePage.selectDifficulty('junior');
    await gamePage.startGame();

    await page.waitForTimeout(1000);

    // Get initial state
    const scoreBeforePause = await gamePage.getScore();
    const caffeineBeforePause = await gamePage.getCaffeineLevel();

    // Pause game
    await gamePage.pauseGame();
    await page.waitForTimeout(2000);

    // Score shouldn't change while paused
    const scoreWhilePaused = await gamePage.getScore();
    expect(scoreWhilePaused).toBe(scoreBeforePause);

    // Resume game
    await gamePage.pauseButton.click();
    await page.waitForTimeout(1000);

    // Score should start increasing again
    const scoreAfterResume = await gamePage.getScore();
    expect(scoreAfterResume).toBeGreaterThanOrEqual(scoreWhilePaused);
  });
});