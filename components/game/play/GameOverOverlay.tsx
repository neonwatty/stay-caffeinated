'use client';

import { useState, useEffect, useCallback } from 'react';
import { VictoryScreenSVG } from '@/components/game/screens/VictoryScreenSVG';
import { PassOutScreenSVG } from '@/components/game/screens/PassOutScreenSVG';
import { ExplosionScreenSVG } from '@/components/game/screens/ExplosionScreenSVG';
import { TransitionOverlaySVG } from '@/components/game/screens/TransitionOverlaySVG';

interface GameOverOverlayProps {
  outcome: 'victory' | 'passOut' | 'explosion';
  score: number;
  healthBonus?: number;
  zoneBonus?: number;
  difficultyMultiplier?: number;
  onPlayAgain: () => void;
  onMenu?: () => void;
}

/**
 * Game over overlay with transition wipe effect.
 * On mount: plays TransitionOverlaySVG (coffee-pour, direction="in") for 800ms,
 * then shows the appropriate end screen based on outcome.
 */
export function GameOverOverlay({
  outcome,
  score,
  healthBonus = 0,
  zoneBonus = 0,
  difficultyMultiplier = 1,
  onPlayAgain,
  onMenu,
}: GameOverOverlayProps) {
  const [showTransition, setShowTransition] = useState(true);
  const [showEndScreen, setShowEndScreen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTransition(false);
      setShowEndScreen(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayAgain = useCallback(() => {
    onPlayAgain();
  }, [onPlayAgain]);

  const handleMenu = useCallback(() => {
    onMenu?.();
  }, [onMenu]);

  return (
    <div className="absolute inset-0 z-50">
      {/* Transition wipe */}
      {showTransition && (
        <div className="absolute inset-0 flex items-center justify-center">
          <TransitionOverlaySVG
            isActive={true}
            direction="in"
            variant="coffee-pour"
            width={500}
            height={500}
          />
        </div>
      )}

      {/* End screen */}
      {showEndScreen && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
          {outcome === 'victory' && (
            <>
              <VictoryScreenSVG
                score={score}
                zoneBonus={zoneBonus}
                healthBonus={healthBonus}
                difficultyMultiplier={difficultyMultiplier}
                isActive={true}
                onPlayAgain={handlePlayAgain}
                onMenu={handleMenu}
                width={400}
                height={400}
              />
              {/* Fallback buttons if VictoryScreenSVG doesn't render its own */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handlePlayAgain}
                  className="rounded-xl bg-amber-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-amber-500"
                >
                  Play Again
                </button>
                {onMenu && (
                  <button
                    onClick={handleMenu}
                    className="rounded-xl bg-gray-700 px-6 py-3 text-lg text-gray-300 transition-colors hover:bg-gray-600"
                  >
                    Menu
                  </button>
                )}
              </div>
            </>
          )}

          {outcome === 'passOut' && (
            <>
              <PassOutScreenSVG
                score={score}
                isActive={true}
                width={400}
                height={400}
              />
              <button
                onClick={handlePlayAgain}
                className="mt-4 rounded-xl bg-amber-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-amber-500"
              >
                Try Again
              </button>
            </>
          )}

          {outcome === 'explosion' && (
            <>
              <ExplosionScreenSVG
                score={score}
                isActive={true}
                width={400}
                height={400}
              />
              <button
                onClick={handlePlayAgain}
                className="mt-4 rounded-xl bg-red-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-red-500"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
