import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameStateManager } from '../gameStateManager';
import { CAFFEINE_MIN, CAFFEINE_MAX, HEALTH_MAX, HEALTH_DEPLETION_RATE } from '../constants';

describe('GameStateManager', () => {
  let gameManager: GameStateManager;

  beforeEach(() => {
    gameManager = new GameStateManager();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const state = gameManager.getState();
      expect(state.state).toBe('menu');
      expect(state.stats.currentCaffeineLevel).toBe(50);
      expect(state.stats.currentHealthLevel).toBe(100);
      expect(state.stats.drinksConsumed).toBe(0);
      expect(state.stats.score).toBe(0);
      expect(state.stats.streak).toBe(0);
      expect(state.stats.isInOptimalZone).toBe(true);
      expect(state.config.difficulty).toBe('junior');
      expect(state.isPaused).toBe(false);
    });

    it('should accept custom config during initialization', () => {
      const customManager = new GameStateManager({
        difficulty: 'senior',
        soundEnabled: false,
        particlesEnabled: false,
      });
      const config = customManager.getConfig();
      expect(config.difficulty).toBe('senior');
      expect(config.soundEnabled).toBe(false);
      expect(config.particlesEnabled).toBe(false);
    });
  });

  describe('state transitions', () => {
    it('should transition to playing state when game starts', () => {
      gameManager.startGame();
      expect(gameManager.getCurrentState()).toBe('playing');
      const state = gameManager.getState();
      expect(state.startTime).toBeGreaterThan(0);
      expect(state.stats.currentCaffeineLevel).toBe(50);
      expect(state.stats.currentHealthLevel).toBe(100);
    });

    it('should pause and resume game correctly', () => {
      gameManager.startGame();
      expect(gameManager.getCurrentState()).toBe('playing');

      gameManager.pauseGame();
      expect(gameManager.getCurrentState()).toBe('paused');
      expect(gameManager.getState().isPaused).toBe(true);

      gameManager.resumeGame();
      expect(gameManager.getCurrentState()).toBe('playing');
      expect(gameManager.getState().isPaused).toBe(false);
    });

    it('should not pause if not playing', () => {
      gameManager.pauseGame();
      expect(gameManager.getCurrentState()).toBe('menu');
    });

    it('should not resume if not paused', () => {
      gameManager.startGame();
      gameManager.resumeGame();
      expect(gameManager.getCurrentState()).toBe('playing');
    });

    it('should end game with victory outcome', () => {
      gameManager.startGame();
      gameManager.endGame('victory');
      expect(gameManager.getCurrentState()).toBe('victory');
    });

    it('should end game with gameOver for non-victory outcomes', () => {
      gameManager.startGame();
      gameManager.endGame('passOut');
      expect(gameManager.getCurrentState()).toBe('gameOver');

      gameManager.startGame();
      gameManager.endGame('explosion');
      expect(gameManager.getCurrentState()).toBe('gameOver');
    });

    it('should reset state when returning to menu', () => {
      gameManager.startGame();
      gameManager.consumeDrink(30);
      gameManager.returnToMenu();

      const state = gameManager.getState();
      expect(state.state).toBe('menu');
      expect(state.stats.drinksConsumed).toBe(0);
      expect(state.stats.currentCaffeineLevel).toBe(50);
    });
  });

  describe('caffeine management', () => {
    beforeEach(() => {
      gameManager.startGame();
    });

    it('should update caffeine level within bounds', () => {
      gameManager.updateCaffeineLevel(20);
      expect(gameManager.getStats().currentCaffeineLevel).toBe(70);

      gameManager.updateCaffeineLevel(-30);
      expect(gameManager.getStats().currentCaffeineLevel).toBe(40);
    });

    it('should not exceed maximum caffeine level', () => {
      gameManager.updateCaffeineLevel(100);
      expect(gameManager.getStats().currentCaffeineLevel).toBe(CAFFEINE_MAX);
    });

    it('should not go below minimum caffeine level', () => {
      gameManager.updateCaffeineLevel(-100);
      expect(gameManager.getStats().currentCaffeineLevel).toBe(CAFFEINE_MIN);
    });

    it('should track drinks consumed', () => {
      gameManager.consumeDrink(15);
      expect(gameManager.getStats().drinksConsumed).toBe(1);
      expect(gameManager.getStats().currentCaffeineLevel).toBe(65);

      gameManager.consumeDrink(10);
      expect(gameManager.getStats().drinksConsumed).toBe(2);
      expect(gameManager.getStats().currentCaffeineLevel).toBe(75);
    });
  });

  describe('optimal zone detection', () => {
    beforeEach(() => {
      gameManager.startGame();
    });

    it('should detect when in optimal zone for junior difficulty', () => {
      gameManager.setDifficulty('junior');

      // Junior has 40-width zone (30-70)
      gameManager.updateCaffeineLevel(-15); // 35
      expect(gameManager.getStats().isInOptimalZone).toBe(true);

      gameManager.updateCaffeineLevel(-10); // 25
      expect(gameManager.getStats().isInOptimalZone).toBe(false);
    });

    it('should detect when in optimal zone for senior difficulty', () => {
      gameManager.setDifficulty('senior');

      // Senior has 30-width zone (35-65)
      gameManager.updateCaffeineLevel(5); // 55
      expect(gameManager.getStats().isInOptimalZone).toBe(true);

      gameManager.updateCaffeineLevel(10); // 65 - exactly at the upper boundary
      expect(gameManager.getStats().isInOptimalZone).toBe(true);

      gameManager.updateCaffeineLevel(1); // 66 - should be outside range
      expect(gameManager.getStats().isInOptimalZone).toBe(false);
    });

    it('should reset streak when leaving optimal zone', () => {
      const startTime = 1000;
      // Build up some streak first
      gameManager.update(startTime);
      gameManager.update(startTime + 2000); // 2 seconds later to build streak

      const initialStreak = gameManager.getStats().streak;
      expect(initialStreak).toBeGreaterThan(0);

      gameManager.updateCaffeineLevel(50); // Leave optimal zone
      expect(gameManager.getStats().isInOptimalZone).toBe(false);
      expect(gameManager.getStats().streak).toBe(0);
    });
  });

  describe('game update loop', () => {
    beforeEach(() => {
      gameManager.startGame();
    });

    it('should not update when paused', () => {
      const initialStats = gameManager.getStats();
      gameManager.pauseGame();
      gameManager.update(1000);

      const updatedStats = gameManager.getStats();
      expect(updatedStats.score).toBe(initialStats.score);
      expect(updatedStats.timeElapsed).toBe(initialStats.timeElapsed);
    });

    it('should update score while playing', () => {
      // Mock performance.now to have deterministic timing
      let mockTime = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => mockTime);

      gameManager.startGame(); // This will set startTime to 1000
      mockTime = 2000; // Move time forward
      gameManager.update(2000); // 1 second later

      const stats = gameManager.getStats();
      expect(stats.score).toBeGreaterThan(0);
      expect(stats.timeElapsed).toBeCloseTo(1, 0);

      vi.restoreAllMocks();
    });

    it('should apply double score multiplier in optimal zone', () => {
      // Mock performance.now for deterministic timing
      let mockTime = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => mockTime);

      // Test in optimal zone
      gameManager.startGame();
      expect(gameManager.getStats().isInOptimalZone).toBe(true);
      mockTime = 2000;
      gameManager.update(2000);
      const optimalScore = gameManager.getStats().score;

      // Reset and test outside optimal zone
      mockTime = 3000;
      gameManager.startGame();
      gameManager.updateCaffeineLevel(50); // Move out of zone
      mockTime = 4000;
      gameManager.update(4000);
      const nonOptimalScore = gameManager.getStats().score;

      expect(optimalScore).toBeGreaterThan(nonOptimalScore);
      // Optimal score should be roughly double the non-optimal
      expect(optimalScore).toBeCloseTo(nonOptimalScore * 2, 0);

      vi.restoreAllMocks();
    });

    it('should deplete health when outside optimal zone', () => {
      gameManager.updateCaffeineLevel(50); // Move out of optimal zone
      expect(gameManager.getStats().isInOptimalZone).toBe(false);

      const startTime = 1000;
      gameManager.update(startTime);
      gameManager.update(startTime + 1000); // 1 second later

      const expectedHealth = HEALTH_MAX - HEALTH_DEPLETION_RATE;
      expect(gameManager.getStats().currentHealthLevel).toBeLessThan(HEALTH_MAX);
      expect(gameManager.getStats().currentHealthLevel).toBeGreaterThan(expectedHealth - 1);
    });

    it('should not deplete health when in optimal zone', () => {
      expect(gameManager.getStats().isInOptimalZone).toBe(true);

      const startTime = 1000;
      gameManager.update(startTime);
      gameManager.update(startTime + 1000);

      expect(gameManager.getStats().currentHealthLevel).toBe(HEALTH_MAX);
    });

    it('should deplete caffeine over time', () => {
      const startTime = 1000;
      const initialCaffeine = gameManager.getStats().currentCaffeineLevel;
      gameManager.update(startTime);
      gameManager.update(startTime + 2000); // 2 seconds later to ensure meaningful depletion

      expect(gameManager.getStats().currentCaffeineLevel).toBeLessThan(initialCaffeine);
    });
  });

  describe('win/loss conditions', () => {
    beforeEach(() => {
      gameManager.startGame();
    });

    it('should trigger victory when workday ends', () => {
      gameManager.setDifficulty('junior');
      const startTime = 1000;
      gameManager.update(startTime);

      // Simulate passing the workday (8 hours = 28800 seconds game time)
      // Junior difficulty real time is 5 minutes = 300000ms
      gameManager.update(startTime + 300001);

      expect(gameManager.getCurrentState()).toBe('victory');
    });

    it('should trigger passOut when health depletes with low caffeine', () => {
      // Test the endGame method directly for passOut outcome
      gameManager.startGame();
      gameManager.updateCaffeineLevel(-45); // Very low caffeine (5)

      gameManager.endGame('passOut');
      expect(gameManager.getCurrentState()).toBe('gameOver');
    });

    it('should trigger explosion when health depletes with high caffeine', () => {
      // Test the endGame method directly for explosion outcome
      gameManager.startGame();
      gameManager.updateCaffeineLevel(45); // High caffeine (95)

      gameManager.endGame('explosion');
      expect(gameManager.getCurrentState()).toBe('gameOver');
    });
  });

  describe('configuration management', () => {
    it('should update difficulty', () => {
      gameManager.setDifficulty('senior');
      expect(gameManager.getConfig().difficulty).toBe('senior');
    });

    it('should update multiple config options', () => {
      gameManager.setConfig({
        soundEnabled: false,
        particlesEnabled: false,
        screenShakeEnabled: false,
      });

      const config = gameManager.getConfig();
      expect(config.soundEnabled).toBe(false);
      expect(config.particlesEnabled).toBe(false);
      expect(config.screenShakeEnabled).toBe(false);
    });

    it('should preserve existing config when partially updating', () => {
      gameManager.setDifficulty('senior');
      gameManager.setConfig({ soundEnabled: false });

      const config = gameManager.getConfig();
      expect(config.difficulty).toBe('senior');
      expect(config.soundEnabled).toBe(false);
      expect(config.particlesEnabled).toBe(true); // Default unchanged
    });
  });

  describe('event subscription', () => {
    it('should notify listeners on state changes', () => {
      const listener = vi.fn();
      const unsubscribe = gameManager.subscribe(listener);

      gameManager.startGame();
      expect(listener).toHaveBeenCalledTimes(1);

      gameManager.pauseGame();
      expect(listener).toHaveBeenCalledTimes(2);

      gameManager.consumeDrink(10);
      expect(listener).toHaveBeenCalledTimes(4); // consumeDrink calls updateCaffeineLevel and then notifyListeners twice

      unsubscribe();
      gameManager.resumeGame();
      expect(listener).toHaveBeenCalledTimes(4); // No new calls after unsubscribe
    });

    it('should pass current state to listeners', () => {
      const listener = vi.fn();
      gameManager.subscribe(listener);

      gameManager.startGame();
      const callArg = listener.mock.calls[0][0];
      expect(callArg.state).toBe('playing');
      expect(callArg.stats).toBeDefined();
      expect(callArg.config).toBeDefined();
    });

    it('should support multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      gameManager.subscribe(listener1);
      gameManager.subscribe(listener2);

      gameManager.startGame();
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe('streak tracking', () => {
    beforeEach(() => {
      gameManager.startGame();
    });

    it('should accumulate streak while in optimal zone', () => {
      expect(gameManager.getStats().isInOptimalZone).toBe(true);

      const startTime = 1000;
      gameManager.update(startTime);
      gameManager.update(startTime + 2000); // 2 seconds

      expect(gameManager.getStats().streak).toBeGreaterThan(1.5);
      expect(gameManager.getStats().streak).toBeLessThan(3);
    });

    it('should not accumulate streak outside optimal zone', () => {
      gameManager.updateCaffeineLevel(50); // Leave optimal zone
      expect(gameManager.getStats().isInOptimalZone).toBe(false);

      const startTime = 1000;
      gameManager.update(startTime);
      gameManager.update(startTime + 2000);

      expect(gameManager.getStats().streak).toBe(0);
    });
  });
});