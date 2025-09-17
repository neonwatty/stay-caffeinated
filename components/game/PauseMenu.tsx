import React from 'react';
import { GameMenu, MenuButton, MenuSection } from './GameMenu';

export interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart?: () => void;
  onSettings?: () => void;
  onQuit?: () => void;
  currentStats?: GamePauseStats;
  className?: string;
}

export interface GamePauseStats {
  timeElapsed: string;
  currentDay: number;
  coffeesConsumed: number;
  currentCaffeine: number;
  currentHealth: number;
  score: number;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  onResume,
  onRestart,
  onSettings,
  onQuit,
  currentStats,
  className = '',
}) => {
  return (
    <GameMenu
      isOpen={isOpen}
      onClose={onResume}
      title="Game Paused"
      showCloseButton={true}
      className={className}
    >
      <div className="space-y-6">
        {currentStats && (
          <MenuSection title="Current Progress">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <div className="text-gray-600 dark:text-gray-400">Time</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {currentStats.timeElapsed}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <div className="text-gray-600 dark:text-gray-400">Day</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {currentStats.currentDay}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <div className="text-gray-600 dark:text-gray-400">Coffees</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {currentStats.coffeesConsumed}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <div className="text-gray-600 dark:text-gray-400">Score</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {currentStats.score.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Caffeine</span>
                  <span className="text-gray-900 dark:text-white">{currentStats.currentCaffeine}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentStats.currentCaffeine < 30
                        ? 'bg-red-500'
                        : currentStats.currentCaffeine <= 70
                        ? 'bg-green-500'
                        : 'bg-orange-500'
                    }`}
                    style={{ width: `${currentStats.currentCaffeine}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Health</span>
                  <span className="text-gray-900 dark:text-white">{currentStats.currentHealth}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentStats.currentHealth < 30
                        ? 'bg-red-500 animate-pulse'
                        : currentStats.currentHealth < 60
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${currentStats.currentHealth}%` }}
                  />
                </div>
              </div>
            </div>
          </MenuSection>
        )}

        <div className="space-y-3">
          <MenuButton
            onClick={onResume}
            variant="primary"
            size="large"
          >
            Resume Game
          </MenuButton>

          {onRestart && (
            <MenuButton
              onClick={onRestart}
              variant="secondary"
              size="medium"
            >
              Restart Day
            </MenuButton>
          )}

          {onSettings && (
            <MenuButton
              onClick={onSettings}
              variant="secondary"
              size="medium"
            >
              Settings
            </MenuButton>
          )}

          {onQuit && (
            <MenuButton
              onClick={onQuit}
              variant="danger"
              size="medium"
            >
              Quit to Menu
            </MenuButton>
          )}
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t dark:border-gray-700">
          Press ESC or P to resume
        </div>
      </div>
    </GameMenu>
  );
};

export interface QuickPauseProps {
  onResume: () => void;
  isPaused: boolean;
  className?: string;
}

export const QuickPause: React.FC<QuickPauseProps> = ({
  onResume,
  isPaused,
  className = '',
}) => {
  if (!isPaused) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}
      onClick={onResume}
    >
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Paused
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Click anywhere or press ESC to resume
        </p>
        <button
          onClick={onResume}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Resume
        </button>
      </div>
    </div>
  );
};