import { expect, test } from '@playwright/test';

test.describe('Playtest accessibility slice', () => {
  test('start flow and drink controls are clear named controls', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Start Shift' }).click();

    await expect(page).toHaveURL(/\/play\/?$/);
    await expect(page.getByRole('button', { name: /Selected character Office Worker/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Start Shift' })).toBeEnabled();

    await page.getByRole('button', { name: 'Start Shift' }).click();
    await expect(page.getByTestId('game-scene')).toBeVisible();

    const coffee = page.getByRole('button', { name: 'Drink Coffee' });
    const water = page.getByRole('button', { name: 'Drink Water' });

    await expect(coffee).toBeEnabled();
    await expect(water).toBeEnabled();

    await coffee.click();
    await expect(coffee).toBeDisabled();
    await expect(page.getByTestId('drink-coffee-status')).toContainText(/Cooling down \d+s/);

    await expect(page.getByTestId('strategy-panel')).toBeVisible();
    await expect(page.getByTestId('shift-status')).toContainText(/% complete/);
    await expect(page.getByTestId('caffeine-status')).toContainText(/Green zone|Under zone|Over zone/);
    await expect(page.getByTestId('upcoming-event')).toContainText(/Morning Meeting|Code Review/);
  });
});
