'use client';

import { useState, useEffect, useCallback } from 'react';
import { VictoryScreenSVG } from '@/components/game/screens/VictoryScreenSVG';
import { PassOutScreenSVG } from '@/components/game/screens/PassOutScreenSVG';
import { ExplosionScreenSVG } from '@/components/game/screens/ExplosionScreenSVG';
import { TransitionOverlaySVG } from '@/components/game/screens/TransitionOverlaySVG';
import type { StrategyRunSummary } from '@/components/game/play/GameScene';

interface GameOverOverlayProps {
  outcome: 'victory' | 'passOut' | 'explosion';
  score: number;
  healthBonus?: number;
  zoneBonus?: number;
  difficultyMultiplier?: number;
  strategySummary?: StrategyRunSummary;
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
  strategySummary,
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
              <RunSummaryPanel strategySummary={strategySummary} outcome={outcome} />
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
              <RunSummaryPanel strategySummary={strategySummary} outcome={outcome} />
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
              <RunSummaryPanel strategySummary={strategySummary} outcome={outcome} />
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

function RunSummaryPanel({
  strategySummary,
  outcome,
}: {
  strategySummary?: StrategyRunSummary;
  outcome: 'victory' | 'passOut' | 'explosion';
}) {
  const choices = strategySummary?.drinkChoices ?? [];
  const eventsHandled = strategySummary?.eventsHandled ?? [];
  const preparedEvents = strategySummary?.preparedEvents ?? [];
  const eventOutcomes = strategySummary?.eventOutcomes ?? [];
  const scoreNotes = strategySummary?.scoreNotes ?? [];
  const outcomeLabel = outcome === 'victory'
    ? 'Score grew because the shift was survived'
    : 'Score stopped because the run ended early';

  return (
    <div
      data-testid="run-summary"
      className="mt-2 w-[min(92vw,520px)] rounded-lg border border-white/10 bg-black/70 px-4 py-3 text-white shadow-lg backdrop-blur-sm"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-amber-300">
          Shift Summary
        </h2>
        <span className="text-xs text-gray-300">
          {outcome === 'victory' ? 'Shift survived' : 'Run ended early'}
        </span>
      </div>
      <div className="grid gap-2 text-xs sm:grid-cols-3">
        <div>
          <p className="font-semibold text-cyan-200">Drink plan</p>
          <p className="text-gray-200">
            {strategySummary?.drinksUsed ?? 0} used
          </p>
        </div>
        <div>
          <p className="font-semibold text-cyan-200">Events handled</p>
          <p className="text-gray-200">
            {eventsHandled.length > 0 ? eventsHandled.join(', ') : 'None yet'}
          </p>
        </div>
        <div>
          <p className="font-semibold text-cyan-200">Prepared for</p>
          <p className="text-gray-200">
            {preparedEvents.length > 0 ? preparedEvents.join(', ') : 'No preview prep logged'}
          </p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2" data-testid="score-explanation">
        <div>
          <p className="font-semibold text-amber-200">Score story</p>
          <p className="text-gray-200">{outcomeLabel}</p>
          {scoreNotes.slice(0, 2).map((note) => (
            <p key={note} className="mt-1 text-gray-300">{note}</p>
          ))}
        </div>
        <div>
          <p className="font-semibold text-amber-200">Event pressure</p>
          <p className="text-gray-200">
            {eventOutcomes.length > 0 ? eventOutcomes[eventOutcomes.length - 1] : 'No event pressure recorded'}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-300" data-testid="run-summary-decision">
        {choices.length > 0 ? choices[choices.length - 1] : strategySummary?.lastEventStatus ?? 'No drink choices recorded'}
      </p>
    </div>
  );
}
