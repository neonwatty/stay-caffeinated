'use client';

import { useState } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import { useGameState } from '@/hooks';
import { DRINKS } from '@/game';
import { CoffeeCupSVG, type ExpressionType, type AccessoryType } from '@/components/game/CoffeeCupSVG';
import { CaffeineMeterSVG, HealthBarSVG, ScoreDisplaySVG, ToastNotificationSVG } from '@/components/game/ui';
import { OfficeWorkerSVG } from '@/components/game/OfficeWorkerSVG';

function SpriteTestContent() {
  const {
    currentState,
    caffeinePercentage,
    isPlaying,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    consumeDrink,
  } = useGameState();

  const [manualLevel, setManualLevel] = useState(50);
  const [useManual, setUseManual] = useState(true);
  const [demoScore, setDemoScore] = useState(2450);
  const [demoStreak, setDemoStreak] = useState(15);
  const [demoHealth, setDemoHealth] = useState(72);
  const [showToast, setShowToast] = useState(false);
  const [demoExpression, setDemoExpression] = useState<ExpressionType>('default');
  const [demoAccessories, setDemoAccessories] = useState<AccessoryType[]>([]);

  const displayLevel = useManual ? manualLevel : caffeinePercentage;
  const stateLabel = displayLevel < 30 ? 'Under-Caffeinated' : displayLevel > 70 ? 'Over-Caffeinated' : 'Optimal';
  const stateColor = displayLevel < 30 ? 'text-blue-400' : displayLevel > 70 ? 'text-red-400' : 'text-green-400';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Stay Caffeinated</h1>
        <p className="text-gray-400 text-center text-sm mb-6">
          Drag the slider to see characters and UI react to caffeine levels
        </p>

        {/* Caffeine slider */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useManual}
                onChange={(e) => setUseManual(e.target.checked)}
                className="w-4 h-4"
              />
              Manual control
            </label>
            <span className={`ml-auto text-sm font-medium ${stateColor}`}>
              {stateLabel}
            </span>
          </div>

          {useManual ? (
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs text-gray-500 w-6">0%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={manualLevel}
                  onChange={(e) => setManualLevel(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 w-10">100%</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 px-8">
                <span>|</span>
                <span>30% zone</span>
                <span>70% zone</span>
                <span>|</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-2xl font-bold">{manualLevel}%</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {!isPlaying && currentState === 'menu' && (
                <button onClick={startGame} className="px-4 py-2 bg-green-600 rounded-lg text-sm">
                  Start Game
                </button>
              )}
              {isPlaying && (
                <>
                  <button onClick={pauseGame} className="px-3 py-1.5 bg-yellow-600 rounded-lg text-sm">Pause</button>
                  {Object.values(DRINKS).slice(0, 4).map((drink) => (
                    <button
                      key={drink.id}
                      onClick={() => consumeDrink(drink.caffeineBoost)}
                      className="px-3 py-1.5 bg-indigo-600 rounded-lg text-sm"
                    >
                      {drink.icon} +{drink.caffeineBoost}
                    </button>
                  ))}
                </>
              )}
              {currentState === 'paused' && (
                <button onClick={resumeGame} className="px-3 py-1.5 bg-green-600 rounded-lg text-sm">Resume</button>
              )}
              <button onClick={resetGame} className="px-3 py-1.5 bg-gray-600 rounded-lg text-sm">Reset</button>
              <span className="self-center text-sm text-gray-400 ml-auto">
                {caffeinePercentage.toFixed(0)}%
              </span>
            </div>
          )}
        </div>

        {/* Custom SVG Coffee Cup Character */}
        <h2 className="text-lg font-semibold mb-3 text-gray-300">Custom Coffee Cup</h2>
        <p className="text-xs text-gray-500 mb-3">
          Animated SVG character — reacts to caffeine level with 3 states: sleepy, optimal, wired
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-emerald-700">
            <h2 className="text-sm font-semibold mb-1">Coffee Cup Character</h2>
            <p className="text-xs text-gray-500 mb-3">Full character with face, steam, effects</p>
            <div className="flex justify-center">
              <CoffeeCupSVG
                caffeineLevel={displayLevel}
                width={220}
                height={220}
                isActive
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-emerald-700">
            <h2 className="text-sm font-semibold mb-1">Large View</h2>
            <p className="text-xs text-gray-500 mb-3">Larger to see detail</p>
            <div className="flex justify-center">
              <CoffeeCupSVG
                caffeineLevel={displayLevel}
                width={300}
                height={300}
                isActive
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-emerald-700">
            <h2 className="text-sm font-semibold mb-1">Paused (Static)</h2>
            <p className="text-xs text-gray-500 mb-3">Animations paused</p>
            <div className="flex justify-center">
              <CoffeeCupSVG
                caffeineLevel={displayLevel}
                width={220}
                height={220}
                isActive={false}
              />
            </div>
          </div>
        </div>

        {/* Office Worker Character */}
        <h2 className="text-lg font-semibold mb-3 mt-8 text-gray-300">Office Worker</h2>
        <p className="text-xs text-gray-500 mb-3">
          Detailed person character — 4 states: sleepy, optimal, wired, and &quot;gone to plaid&quot; (90%+)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-amber-700">
            <h3 className="text-sm font-semibold mb-1">Developer at Desk</h3>
            <p className="text-xs text-gray-500 mb-3">Laptop, coffee, glasses — set slider to 90%+ for plaid</p>
            <div className="flex justify-center">
              <OfficeWorkerSVG
                caffeineLevel={displayLevel}
                width={380}
                height={380}
                isActive
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-amber-700">
            <h3 className="text-sm font-semibold mb-1">Paused (Static)</h3>
            <p className="text-xs text-gray-500 mb-3">Animations paused</p>
            <div className="flex justify-center">
              <OfficeWorkerSVG
                caffeineLevel={displayLevel}
                width={380}
                height={380}
                isActive={false}
              />
            </div>
          </div>
        </div>

        {/* Character Expressions & Accessories */}
        <h2 className="text-lg font-semibold mb-3 mt-8 text-gray-300">Expressions & Accessories</h2>
        <p className="text-xs text-gray-500 mb-3">
          Event-triggered expressions and unlockable cosmetic accessories
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Expression Demo */}
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-pink-800">
            <h3 className="text-sm font-semibold mb-2">Expressions</h3>
            <p className="text-xs text-gray-500 mb-3">Click to trigger event expressions</p>
            <div className="flex justify-center mb-4">
              <CoffeeCupSVG
                caffeineLevel={displayLevel}
                width={220}
                height={220}
                isActive
                expression={demoExpression}
                accessories={demoAccessories}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {([
                { key: 'default', label: 'Default', color: 'bg-gray-600' },
                { key: 'surprise', label: 'Surprise', color: 'bg-yellow-700' },
                { key: 'celebration', label: 'Celebrate', color: 'bg-green-700' },
                { key: 'disgust', label: 'Disgust', color: 'bg-orange-700' },
                { key: 'panic', label: 'Panic', color: 'bg-red-700' },
                { key: 'determined', label: 'Determined', color: 'bg-blue-700' },
              ] as const).map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setDemoExpression(key)}
                  className={`px-2.5 py-1 rounded text-xs ${demoExpression === key ? color + ' ring-2 ring-white' : color + ' opacity-60 hover:opacity-100'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Accessories Demo */}
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-pink-800">
            <h3 className="text-sm font-semibold mb-2">Accessories</h3>
            <p className="text-xs text-gray-500 mb-3">Toggle to equip cosmetic items</p>
            <div className="flex justify-center mb-4">
              <CoffeeCupSVG
                caffeineLevel={displayLevel}
                width={220}
                height={220}
                isActive
                expression={demoExpression}
                accessories={demoAccessories}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {([
                { key: 'sunglasses', label: 'Sunglasses' },
                { key: 'topHat', label: 'Top Hat' },
                { key: 'beanie', label: 'Beanie' },
                { key: 'sleepMask', label: 'Sleep Mask' },
                { key: 'devSticker', label: 'Dev Sticker' },
                { key: 'bowtie', label: 'Bowtie' },
                { key: 'headphones', label: 'Headphones' },
                { key: 'crownLaurel', label: 'Crown' },
              ] as const).map(({ key, label }) => {
                const equipped = demoAccessories.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => setDemoAccessories((prev) =>
                      equipped ? prev.filter((a) => a !== key) : [...prev, key]
                    )}
                    className={`px-2.5 py-1 rounded text-xs ${equipped ? 'bg-purple-600 ring-2 ring-white' : 'bg-gray-600 opacity-60 hover:opacity-100'}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Animated SVG UI Elements */}
        <h2 className="text-lg font-semibold mb-3 mt-8 text-gray-300">Animated SVG UI</h2>
        <p className="text-xs text-gray-500 mb-3">
          Game HUD components — react to caffeine level and game state
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Caffeine Meter */}
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-cyan-700">
            <h2 className="text-sm font-semibold mb-1">Caffeine Meter</h2>
            <p className="text-xs text-gray-500 mb-3">Mug-shaped gauge, zone markers</p>
            <div className="flex justify-center">
              <CaffeineMeterSVG
                caffeineLevel={displayLevel}
                healthLevel={demoHealth}
                width={120}
                height={200}
                isActive
              />
            </div>
          </div>

          {/* Health Bar */}
          <div className="bg-gray-800 rounded-lg p-4 border border-cyan-700">
            <h2 className="text-sm font-semibold mb-1 text-center">Health Bar (ECG)</h2>
            <p className="text-xs text-gray-500 mb-3 text-center">Heartbeat line, pulse synced to caffeine</p>
            <div className="flex flex-col items-center gap-3">
              <HealthBarSVG
                healthLevel={demoHealth}
                caffeineLevel={displayLevel}
                width={280}
                height={80}
                isActive
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Health:</span>
                <input
                  type="range" min={0} max={100} value={demoHealth}
                  onChange={(e) => setDemoHealth(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-xs text-gray-400 w-8">{demoHealth}%</span>
              </div>
            </div>
          </div>

          {/* Score Display */}
          <div className="bg-gray-800 rounded-lg p-4 border border-cyan-700">
            <h2 className="text-sm font-semibold mb-1 text-center">Score Display</h2>
            <p className="text-xs text-gray-500 mb-3 text-center">Animated counter, combo badge, streaks</p>
            <div className="flex flex-col items-center gap-3">
              <ScoreDisplaySVG
                score={demoScore}
                streak={demoStreak}
                multiplier={demoStreak >= 30 ? 2.5 : demoStreak >= 10 ? 1.5 : 1.0}
                width={260}
                height={80}
                isActive
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setDemoScore((s) => s + 100)}
                  className="px-3 py-1 bg-indigo-700 rounded text-xs"
                >
                  +100 pts
                </button>
                <button
                  onClick={() => setDemoScore((s) => s + 1000)}
                  className="px-3 py-1 bg-yellow-700 rounded text-xs"
                >
                  +1000 pts
                </button>
                <button
                  onClick={() => setDemoStreak((s) => s + 10)}
                  className="px-3 py-1 bg-green-700 rounded text-xs"
                >
                  +10s streak
                </button>
              </div>
            </div>
          </div>

          {/* Toast Notifications */}
          <div className="bg-gray-800 rounded-lg p-4 border border-cyan-700">
            <h2 className="text-sm font-semibold mb-1 text-center">Toast Notifications</h2>
            <p className="text-xs text-gray-500 mb-3 text-center">Slide-in notifications with auto-dismiss</p>
            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-col gap-2 w-full">
                {showToast ? (
                  <ToastNotificationSVG
                    type="achievement"
                    title="Score Milestone!"
                    description="You reached 5,000 points"
                    icon="star"
                    duration={4000}
                    onDismiss={() => setShowToast(false)}
                  />
                ) : (
                  <ToastNotificationSVG
                    type="info"
                    title="Morning Meeting"
                    description="Caffeine depletes 2x faster!"
                    icon="coffee"
                    duration={99999}
                    isActive={false}
                  />
                )}
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={() => { setShowToast(false); setTimeout(() => setShowToast(true), 50); }}
                  className="px-3 py-1 bg-yellow-700 rounded text-xs"
                >
                  Achievement Toast
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick preset buttons */}
        <div className="flex justify-center gap-3 mt-8 mb-4">
          <button
            onClick={() => { setUseManual(true); setManualLevel(10); }}
            className="px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-lg text-sm"
          >
            Sleepy (10%)
          </button>
          <button
            onClick={() => { setUseManual(true); setManualLevel(50); }}
            className="px-4 py-2 bg-green-800 hover:bg-green-700 rounded-lg text-sm"
          >
            Optimal (50%)
          </button>
          <button
            onClick={() => { setUseManual(true); setManualLevel(90); }}
            className="px-4 py-2 bg-red-800 hover:bg-red-700 rounded-lg text-sm"
          >
            Wired (90%)
          </button>
          <button
            onClick={() => { setUseManual(true); setManualLevel(95); }}
            className="px-4 py-2 bg-purple-800 hover:bg-purple-700 rounded-lg text-sm"
          >
            Plaid (95%)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SpriteTestPage() {
  return (
    <GameProvider>
      <SpriteTestContent />
    </GameProvider>
  );
}
