import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Stay Caffeinated game
 */
export class GamePage {
  readonly page: Page;

  // Main menu elements
  readonly startButton: Locator;
  readonly difficultyButtons: {
    intern: Locator;
    junior: Locator;
    senior: Locator;
    founder: Locator;
  };

  // Game UI elements
  readonly caffeineBar: Locator;
  readonly healthBar: Locator;
  readonly scoreDisplay: Locator;
  readonly timeDisplay: Locator;
  readonly drinkButtons: Locator;
  readonly pauseButton: Locator;
  readonly gameStatus: Locator;

  // Game over elements
  readonly gameOverModal: Locator;
  readonly finalScore: Locator;
  readonly playAgainButton: Locator;
  readonly mainMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main menu
    this.startButton = page.getByRole('button', { name: /start game/i });
    this.difficultyButtons = {
      intern: page.getByRole('button', { name: 'intern' }),
      junior: page.getByRole('button', { name: 'junior' }),
      senior: page.getByRole('button', { name: 'senior' }),
      founder: page.getByRole('button', { name: 'founder' }),
    };

    // Game UI
    this.caffeineBar = page.locator('[data-testid="caffeine-bar"]');
    this.healthBar = page.locator('[data-testid="health-bar"]');
    this.scoreDisplay = page.locator('[data-testid="score"]');
    this.timeDisplay = page.locator('[data-testid="time-display"]');
    this.drinkButtons = page.locator('[data-testid^="drink-"]');
    this.pauseButton = page.getByRole('button', { name: /pause/i });
    this.gameStatus = page.locator('text=/playing|paused|gameOver|mainMenu/');

    // Game over
    this.gameOverModal = page.locator('[data-testid="game-over-modal"]');
    this.finalScore = page.locator('[data-testid="final-score"]');
    this.playAgainButton = page.getByRole('button', { name: /play again/i });
    this.mainMenuButton = page.getByRole('button', { name: /main menu/i });
  }

  async goto() {
    await this.page.goto('/game-test');
  }

  async selectDifficulty(difficulty: 'intern' | 'junior' | 'senior' | 'founder') {
    await this.difficultyButtons[difficulty].click();
  }

  async startGame() {
    await this.startButton.click();
  }

  async consumeDrink(drinkType: string) {
    const drink = this.page.locator(`[data-testid="drink-${drinkType}"]`);
    await drink.click();
  }

  async pauseGame() {
    await this.pauseButton.click();
  }

  async getCaffeineLevel(): Promise<number> {
    const text = await this.caffeineBar.textContent();
    return parseInt(text?.match(/\d+/)?.[0] || '0');
  }

  async getHealthLevel(): Promise<number> {
    const text = await this.healthBar.textContent();
    return parseInt(text?.match(/\d+/)?.[0] || '0');
  }

  async getScore(): Promise<number> {
    const text = await this.scoreDisplay.textContent();
    return parseInt(text?.replace(/,/g, '') || '0');
  }

  async waitForGameOver() {
    await this.gameOverModal.waitFor({ state: 'visible', timeout: 120000 });
  }

  async isGameActive(): Promise<boolean> {
    const status = await this.gameStatus.textContent();
    return status === 'playing';
  }
}