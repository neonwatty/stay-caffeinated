'use client';

import { GameProvider } from '@/contexts/GameContext';
import { useGameState } from '@/hooks';
import { DRINKS } from '@/game';

function GameTestContent() {
  const {
    currentState,
    stats,
    difficulty,
    caffeinePercentage,
    healthPercentage,
    timeProgress,
    formattedTime,
    scoreDisplay,
    optimalZoneRange,
    isPlaying,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    returnToMenu,
    consumeDrink,
    setDifficulty,
  } = useGameState();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Game Engine Test</h1>

        {/* Game State Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Game State</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">State:</p>
              <p className="text-xl">{currentState}</p>
            </div>
            <div>
              <p className="text-gray-400">Difficulty:</p>
              <p className="text-xl">{difficulty}</p>
            </div>
            <div>
              <p className="text-gray-400">Time:</p>
              <p className="text-xl">{formattedTime}</p>
            </div>
            <div>
              <p className="text-gray-400">Score:</p>
              <p className="text-xl">{scoreDisplay}</p>
            </div>
          </div>
        </div>

        {/* Stats Display */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Stats</h2>

          {/* Caffeine Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span>Caffeine: {caffeinePercentage.toFixed(1)}%</span>
              <span className="text-sm text-gray-400">
                Optimal: {optimalZoneRange.min}-{optimalZoneRange.max}%
              </span>
            </div>
            <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full transition-all duration-300 ${
                  stats.isInOptimalZone ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${caffeinePercentage}%` }}
              />
              {/* Optimal zone indicator */}
              <div
                className="absolute top-0 h-full bg-green-900 opacity-30"
                style={{
                  left: `${optimalZoneRange.min}%`,
                  width: `${optimalZoneRange.max - optimalZoneRange.min}%`
                }}
              />
            </div>
          </div>

          {/* Health Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span>Health: {healthPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-8 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span>Workday Progress: {timeProgress.toFixed(1)}%</span>
            </div>
            <div className="h-8 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${timeProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Drinks Consumed: </span>
              <span>{stats.drinksConsumed}</span>
            </div>
            <div>
              <span className="text-gray-400">Streak: </span>
              <span>{Math.floor(stats.streak)}s</span>
            </div>
            <div>
              <span className="text-gray-400">In Optimal Zone: </span>
              <span className={stats.isInOptimalZone ? 'text-green-400' : 'text-red-400'}>
                {stats.isInOptimalZone ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Controls</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            {currentState === 'menu' && (
              <button
                onClick={startGame}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Start Game
              </button>
            )}

            {isPlaying && (
              <button
                onClick={pauseGame}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg"
              >
                Pause
              </button>
            )}

            {currentState === 'paused' && (
              <button
                onClick={resumeGame}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Resume
              </button>
            )}

            {(isPlaying || currentState === 'paused') && (
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg"
              >
                Reset
              </button>
            )}

            {currentState !== 'menu' && (
              <button
                onClick={returnToMenu}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Return to Menu
              </button>
            )}
          </div>

          {/* Difficulty Selection */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Difficulty</h3>
            <div className="flex gap-2">
              {(['intern', 'junior', 'senior', 'founder'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-3 py-1 rounded-lg ${
                    difficulty === diff
                      ? 'bg-blue-600'
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                  disabled={isPlaying}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Drinks */}
          {isPlaying && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Drinks</h3>
              <div className="flex gap-2">
                {Object.values(DRINKS).map((drink) => (
                  <button
                    key={drink.id}
                    onClick={() => consumeDrink(drink.caffeineBoost)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex flex-col items-center"
                  >
                    <span className="text-2xl">{drink.icon}</span>
                    <span className="text-xs">{drink.name}</span>
                    <span className="text-xs text-gray-300">+{drink.caffeineBoost}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• Keep your caffeine level in the optimal zone (green area)</li>
            <li>• Health decreases when outside the optimal zone</li>
            <li>• Survive the entire workday to win</li>
            <li>• Different drinks have different effects</li>
            <li>• Higher difficulty = longer day, smaller optimal zone</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function GameTestPage() {
  return (
    <GameProvider>
      <GameTestContent />
    </GameProvider>
  );
}