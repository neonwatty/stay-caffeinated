import { test, expect } from '@playwright/test';

test.describe('Game Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game-test');
  });

  test('should have correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Stay Caffeinated/);
  });

  test('should display the main game title', async ({ page }) => {
    const title = page.locator('h1').first();
    await expect(title).toContainText('Stay Caffeinated');
    await expect(title).toBeVisible();
  });

  test('should show difficulty selection', async ({ page }) => {
    const difficultySection = page.locator('text=/select your difficulty/i');
    await expect(difficultySection).toBeVisible();

    // Check all difficulty buttons are present
    await expect(page.getByRole('button', { name: 'intern' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'junior' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'senior' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'founder' })).toBeVisible();
  });

  test('should allow difficulty selection', async ({ page }) => {
    const internButton = page.getByRole('button', { name: 'intern' });
    await internButton.click();

    // Check if the button gets selected state (might have different styling)
    await expect(internButton).toHaveAttribute('aria-pressed', 'true');

    // Start button should be enabled after difficulty selection
    const startButton = page.getByRole('button', { name: /start game/i });
    await expect(startButton).toBeEnabled();
  });

  test('should display drink information', async ({ page }) => {
    // Check if drinks are displayed
    await expect(page.locator('text=/coffee/i')).toBeVisible();
    await expect(page.locator('text=/espresso/i')).toBeVisible();
    await expect(page.locator('text=/tea/i')).toBeVisible();
  });

  test('should have responsive design', async ({ page, viewport }) => {
    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.container')).toBeVisible();

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.container')).toBeVisible();

    // Check if layout adjusts properly
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should have accessible keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Check that difficulty buttons can be selected with keyboard
    const internButton = page.getByRole('button', { name: 'intern' });
    await internButton.focus();
    await page.keyboard.press('Enter');
    await expect(internButton).toHaveAttribute('aria-pressed', 'true');
  });
});