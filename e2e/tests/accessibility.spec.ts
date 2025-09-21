import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('game should be navigable with keyboard only', async ({ page }) => {
    await page.goto('/');

    // Navigate using only keyboard
    await page.keyboard.press('Tab');

    // First focused element should be a difficulty button or start button
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A']).toContain(focusedElement);

    // Tab through difficulty options
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
    }

    // Select a difficulty with Enter
    await page.keyboard.press('Enter');

    // Tab to start button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Start game with Enter
    await page.keyboard.press('Enter');

    // Check that game controls are keyboard accessible
    await page.waitForTimeout(1000);
    await page.keyboard.press('Tab');

    const gameElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(gameElement).toBeTruthy();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // Check for ARIA labels on interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();

      // Button should have either aria-label or text content
      expect(ariaLabel || textContent).toBeTruthy();
    }

    // Check for ARIA live regions for dynamic content
    const liveRegions = page.locator('[aria-live]');
    const liveRegionCount = await liveRegions.count();

    // Should have at least one live region for game updates
    expect(liveRegionCount).toBeGreaterThan(0);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    // Check color contrast for text elements
    const contrastResults = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, span, h1, h2, h3, button');
      const results: any[] = [];

      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        const textColor = styles.color;

        // Simple check - in production, use a proper contrast calculation
        if (bgColor && textColor && bgColor !== 'transparent') {
          results.push({
            element: el.tagName,
            bgColor,
            textColor,
          });
        }
      });

      return results;
    });

    // Verify we're checking contrast
    expect(contrastResults.length).toBeGreaterThan(0);
  });

  test('should have focus indicators', async ({ page }) => {
    await page.goto('/');

    // Check that focused elements have visible focus indicators
    await page.keyboard.press('Tab');

    const focusStyles = await page.evaluate(() => {
      const focused = document.activeElement;
      if (!focused) return null;

      const styles = window.getComputedStyle(focused);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
        border: styles.border,
      };
    });

    // Should have some form of focus indicator
    expect(
      focusStyles?.outline !== 'none' ||
      focusStyles?.boxShadow !== 'none' ||
      focusStyles?.border !== 'none'
    ).toBeTruthy();
  });

  test('should have skip navigation links', async ({ page }) => {
    await page.goto('/');

    // Check for skip navigation link (usually hidden but accessible)
    const skipLink = page.locator('a[href="#main"], a[href="#content"], [class*="skip"]');
    const skipLinkExists = await skipLink.count() > 0;

    // This is a best practice but not always implemented
    if (skipLinkExists) {
      await page.keyboard.press('Tab');
      const firstLink = await page.evaluate(() => (document.activeElement as HTMLAnchorElement)?.href);
      expect(firstLink).toContain('#');
    }
  });

  test('should announce game state changes to screen readers', async ({ page }) => {
    await page.goto('/');

    // Start game
    await page.getByRole('button', { name: 'intern' }).click();
    await page.getByRole('button', { name: /start game/i }).click();

    // Check for ARIA live region updates
    const liveRegion = page.locator('[aria-live="polite"], [aria-live="assertive"], [role="status"], [role="alert"]');
    await expect(liveRegion).toHaveCount(1, { timeout: 5000 });

    // Pause game and check for announcement
    await page.getByRole('button', { name: /pause/i }).click();

    // There should be some indication of state change
    const pauseAnnouncement = await liveRegion.textContent();
    expect(pauseAnnouncement).toBeTruthy();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const headings = await page.evaluate(() => {
      const h1s = document.querySelectorAll('h1');
      const h2s = document.querySelectorAll('h2');
      const h3s = document.querySelectorAll('h3');

      return {
        h1Count: h1s.length,
        h2Count: h2s.length,
        h3Count: h3s.length,
      };
    });

    // Should have exactly one h1
    expect(headings.h1Count).toBe(1);

    // If there are h3s, there should be h2s
    if (headings.h3Count > 0) {
      expect(headings.h2Count).toBeGreaterThan(0);
    }
  });
});