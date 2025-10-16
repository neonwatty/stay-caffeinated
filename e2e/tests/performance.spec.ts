import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Homepage should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check that main content is visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have good Web Vitals scores', async ({ page }) => {
    await page.goto('/');

    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let fcp: number | undefined;
        let lcp: number | undefined;
        let cls: number = 0;

        // First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          fcp = entries[entries.length - 1].startTime;
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          lcp = entries[entries.length - 1].startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });

        // Wait a bit for metrics to be collected
        setTimeout(() => {
          resolve({
            fcp: fcp || 0,
            lcp: lcp || 0,
            cls: cls,
          });
        }, 3000);
      });
    });

    // Assert good Web Vitals scores
    expect(metrics.fcp).toBeLessThan(1800); // FCP < 1.8s is good
    expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s is good
    expect(metrics.cls).toBeLessThan(0.1);  // CLS < 0.1 is good
  });

  test('should handle rapid interactions without lag', async ({ page }) => {
    await page.goto('/');

    // Select difficulty
    await page.getByRole('button', { name: 'intern' }).click();
    await page.getByRole('button', { name: /start game/i }).click();

    // Wait for game to start
    await page.waitForTimeout(500);

    // Perform rapid clicks on drink buttons
    const drinkButton = page.locator('[data-testid^="drink-"]').first();

    const startTime = Date.now();
    for (let i = 0; i < 10; i++) {
      await drinkButton.click();
      await page.waitForTimeout(100);
    }
    const endTime = Date.now();

    // Should handle 10 clicks in under 2 seconds
    expect(endTime - startTime).toBeLessThan(2000);

    // Game should still be responsive
    const pauseButton = page.getByRole('button', { name: /pause/i });
    await expect(pauseButton).toBeEnabled();
  });

  test('should not have memory leaks during extended gameplay', async ({ page }) => {
    await page.goto('/');

    // Start game
    await page.getByRole('button', { name: 'intern' }).click();
    await page.getByRole('button', { name: /start game/i }).click();

    // Monitor memory usage
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Play for 30 seconds
    for (let i = 0; i < 30; i++) {
      await page.locator('[data-testid^="drink-"]').first().click();
      await page.waitForTimeout(1000);
    }

    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Memory shouldn't increase by more than 50MB
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;
    expect(memoryIncrease).toBeLessThan(50);
  });

  test('should render animations smoothly', async ({ page }) => {
    await page.goto('/');

    // Start game
    await page.getByRole('button', { name: 'intern' }).click();
    await page.getByRole('button', { name: /start game/i }).click();

    // Check frame rate during animations
    const frameData = await page.evaluate(() => {
      return new Promise((resolve) => {
        const frames: number[] = [];
        let lastTime = performance.now();

        const checkFrame = () => {
          const currentTime = performance.now();
          const delta = currentTime - lastTime;
          frames.push(1000 / delta); // Convert to FPS
          lastTime = currentTime;

          if (frames.length < 60) {
            requestAnimationFrame(checkFrame);
          } else {
            const avgFPS = frames.reduce((a, b) => a + b, 0) / frames.length;
            resolve({
              avgFPS,
              minFPS: Math.min(...frames),
            });
          }
        };

        requestAnimationFrame(checkFrame);
      });
    });

    // Should maintain at least 30 FPS on average
    expect(frameData.avgFPS).toBeGreaterThan(30);
    // Minimum FPS shouldn't drop below 20
    expect(frameData.minFPS).toBeGreaterThan(20);
  });
});