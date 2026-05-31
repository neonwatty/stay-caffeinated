import { expect, test } from '@playwright/test';

test.describe('Playable polish slice', () => {
  test('shipped route reaches live play with truthful drink and event feedback', async ({ page }) => {
    test.setTimeout(140_000);

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Stay Caffeinated' })).toBeVisible();
    await expect(page.getByText('Browser game prototype')).toBeVisible();
    await page.getByRole('link', { name: 'Start Shift' }).click();

    await expect(page).toHaveURL(/\/play\/?$/);
    await page.getByRole('button', { name: /Office Worker/ }).click();
    await page.getByRole('button', { name: /Intern/ }).click();
    await page.getByRole('button', { name: 'Start Shift' }).click();

    await expect(page.getByTestId('game-scene')).toBeVisible();
    await expect(page.getByTestId('sprite-frame')).toBeVisible();
    await expect(page.getByTestId('caffeine-bar')).toHaveAttribute('aria-label', /Caffeine/);
    await expect(page.getByTestId('health-bar')).toHaveAttribute('aria-label', /Health/);
    await expect(page.getByTestId('time-display')).toContainText(/AM|PM/);
    await expect(page.getByTestId('strategy-panel')).toBeVisible();
    await expect(page.getByTestId('shift-status')).toContainText(/% complete/);
    await expect(page.getByTestId('caffeine-status')).toContainText(/Green zone|Under zone|Over zone/);
    await expect(page.getByTestId('upcoming-event')).toContainText('Morning Meeting');
    await expect(page.getByTestId('active-event-status')).toContainText('Plan your next drink');

    const coffee = page.getByTestId('drink-coffee');
    const tea = page.getByTestId('drink-tea');

    await expect(coffee).toHaveAttribute('data-cooldown', '3000');
    await expect(coffee).toHaveAttribute('data-strategy-role', 'Steady lift');
    await expect(tea).toHaveAttribute('data-cooldown', '2000');
    await expect(tea).toHaveAttribute('data-strategy-role', 'Fine tune');

    await page.getByRole('button', { name: 'Drink Coffee' }).click();
    await expect(coffee).toHaveAttribute('data-disabled', 'true');
    await expect(page.getByRole('button', { name: 'Drink Coffee' })).toBeDisabled();
    await expect(page.getByTestId('drink-coffee-status')).toContainText(/Cooling down \d+s/);

    await page.getByRole('button', { name: 'Drink Tea' }).click();
    await expect(tea).toHaveAttribute('data-disabled', 'true');
    await expect(page.getByRole('button', { name: 'Drink Tea' })).toBeDisabled();
    await expect(page.getByTestId('drink-tea-status')).toContainText(/Cooling down \d+s/);

    await expect(page.getByTestId('event-banner')).toContainText('Code Review', {
      timeout: 40_000,
    });
    await expect(page.getByTestId('event-banner')).toContainText('Drinks locked for 15 seconds.');
    await expect(page.getByTestId('active-event-status')).toContainText('Code Review');
    await expect(page.getByTestId('active-event-status')).toContainText(/Drinks locked - \d+s/);
    await expect(page.getByTestId('drink-restriction')).toContainText('No Drinks Allowed!');
    await expect(page.getByRole('button', { name: 'Drink Water' })).toBeDisabled();
    await expect(page.getByTestId('drink-water-status')).toContainText(/Locked \d+s/);

    await expect(page.getByRole('button', { name: 'Play Again' })).toBeVisible({
      timeout: 110_000,
    });
    await expect(page.getByTestId('run-summary')).toContainText('Shift Summary');
    await expect(page.getByTestId('run-summary')).toContainText('Events handled');
    await expect(page.getByTestId('score-explanation')).toContainText('Score story');
    await expect(page.getByTestId('score-explanation')).toContainText('Event pressure');
    await expect(page.getByTestId('run-summary-decision')).toBeVisible();
    await expect(page.getByText('Menu')).toBeVisible();
  });
});
