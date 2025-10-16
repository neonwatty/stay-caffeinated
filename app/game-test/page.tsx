'use client';

import { GameProvider } from '@/contexts/GameContext';
import { useGameState } from '@/hooks';
import { DRINKS } from '@/game';
import { AnimatedCharacter } from '@/components/game/Character';

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
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-center">Stay Caffeinated</h1>

        {/* Main Game Layout */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

          {/* Left Column: Character and Stats */}
          <div className="lg:w-1/3">
            {/* Animated Character Display */}
            <div className="bg-gray-800 rounded-lg p-6 mb-4 text-center">
              <AnimatedCharacter
                caffeineLevel={caffeinePercentage}
                width={220}
                height={220}
                showStateLabel={true}
                animateTransitions={true}
                pulseWhenOptimal={true}
                shakeWhenOverCaffeinated={true}
                fadeWhenUnderCaffeinated={true}
                isActive={isPlaying}
              />
              <div className="mt-3 text-lg font-medium text-gray-300">
                Your Developer
              </div>

              {/* Quick Stats under Character */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-700 rounded px-2 py-1">
                  <span className="text-gray-400">Caffeine:</span>
                  <span className="ml-1 font-bold">{caffeinePercentage.toFixed(0)}%</span>
                </div>
                <div className="bg-gray-700 rounded px-2 py-1">
                  <span className="text-gray-400">Health:</span>
                  <span className="ml-1 font-bold">{healthPercentage.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Compact Game State */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Game Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="font-medium">{currentState}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className="font-medium">{difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="font-medium">{formattedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Score:</span>
                  <span className="font-medium text-yellow-400">{scoreDisplay}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Game Controls and Stats */}
          <div className="lg:w-2/3 space-y-4">

            {/* Game Controls */}
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-4">Game Controls</h2>

              <div className="space-y-4">
                {/* Main Control Buttons */}
                <div className="flex flex-wrap gap-2">
                  {currentState === 'menu' && (
                    <button
                      onClick={startGame}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-lg"
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
                      Menu
                    </button>
                  )}
                </div>

                {/* Drinks - Show when playing */}
                {isPlaying && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Consume Drinks</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {Object.values(DRINKS).map((drink) => (
                        <button
                          key={drink.id}
                          onClick={() => consumeDrink(drink.caffeineBoost)}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex flex-col items-center transition-transform hover:scale-105"
                        >
                          <span className="text-2xl">{drink.icon}</span>
                          <span className="text-xs mt-1">{drink.name}</span>
                          <span className="text-xs text-gray-300">+{drink.caffeineBoost}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Difficulty Selection */}
                {currentState === 'menu' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Select Difficulty</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['intern', 'junior', 'senior', 'founder'] as const).map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setDifficulty(diff)}
                          className={`px-3 py-2 rounded-lg capitalize font-medium ${
                            difficulty === diff
                              ? 'bg-blue-600'
                              : 'bg-gray-600 hover:bg-gray-700'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Bars */}
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-4">Progress</h2>

              {/* Caffeine Bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span>Caffeine: {caffeinePercentage.toFixed(1)}%</span>
                  <span className="text-sm text-gray-400">
                    Optimal: {optimalZoneRange.min}-{optimalZoneRange.max}%
                  </span>
                </div>
                <div className="h-8 bg-gray-700 rounded-full overflow-hidden flex">
                  {/* Caffeine fill bar using transform instead of width */}
                  <div
                    className={`h-full w-full origin-left ${
                      stats.isInOptimalZone ? 'bg-green-500' :
                      caffeinePercentage > optimalZoneRange.max ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}
                    style={{
                      transform: `scaleX(${Math.min(100, Math.max(0, caffeinePercentage)) / 100})`,
                      transition: 'transform 0.3s ease'
                    }}
                    data-caffeine={caffeinePercentage}
                  />
                </div>
              </div>

              {/* Health Bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span>Health: {healthPercentage.toFixed(1)}%</span>
                  <span className={`text-sm ${healthPercentage < 30 ? 'text-red-400' : 'text-gray-400'}`}>
                    {healthPercentage < 30 ? 'Critical!' : ''}
                  </span>
                </div>
                <div className="h-8 bg-gray-700 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full w-full origin-left transition-all duration-300 ${
                      healthPercentage < 30 ? 'bg-red-600' : healthPercentage < 60 ? 'bg-red-500' : 'bg-red-400'
                    }`}
                    style={{
                      transform: `scaleX(${Math.min(100, Math.max(0, healthPercentage)) / 100})`,
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Workday Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span>Workday: {timeProgress.toFixed(1)}%</span>
                  <span className="text-sm text-gray-400">{formattedTime}</span>
                </div>
                <div className="h-8 bg-gray-700 rounded-full overflow-hidden flex">
                  <div
                    className="h-full w-full origin-left bg-blue-500 transition-all duration-300"
                    style={{
                      transform: `scaleX(${Math.min(100, Math.max(0, timeProgress)) / 100})`,
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-700 rounded px-3 py-2">
                  <span className="text-gray-400 block">Drinks</span>
                  <span className="font-bold">{stats.drinksConsumed}</span>
                </div>
                <div className="bg-gray-700 rounded px-3 py-2">
                  <span className="text-gray-400 block">Streak</span>
                  <span className="font-bold">{Math.floor(stats.streak)}s</span>
                </div>
                <div className="bg-gray-700 rounded px-3 py-2">
                  <span className="text-gray-400 block">Optimal</span>
                  <span className={`font-bold ${stats.isInOptimalZone ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.isInOptimalZone ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">How to Play</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Keep caffeine in the green zone (30-70%)</li>
                <li>• Health decreases when outside optimal zone</li>
                <li>• Survive the entire workday to win</li>
                <li>• Higher difficulty = longer day</li>
              </ul>
            </div>

          </div>
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