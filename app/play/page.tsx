'use client';

import { useState, useCallback } from 'react';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { useGameState } from '@/hooks/useGameState';
import { CharacterSelect } from '@/components/game/play/CharacterSelect';
import { GameScene } from '@/components/game/play/GameScene';
import { PauseOverlay } from '@/components/game/play/PauseOverlay';
import { GameOverOverlay } from '@/components/game/play/GameOverOverlay';
import type { CharacterType } from '@/components/game/play/CharacterSelect';

export default function PlayPage() {
  return (
    <GameProvider>
      <PlayContent />
    </GameProvider>
  );
}

function PlayContent() {
  const [character, setCharacter] = useState<CharacterType | null>(null);

  const { currentState, stats, caffeinePercentage, healthPercentage } = useGameState();
  const { resumeGame, resetGame, returnToMenu } = useGame();

  const handlePlayAgain = useCallback(() => {
    setCharacter(null);
    resetGame();
  }, [resetGame]);

  const handleQuit = useCallback(() => {
    setCharacter(null);
    returnToMenu();
  }, [returnToMenu]);

  const getOutcome = useCallback((): 'victory' | 'explosion' | 'passOut' => {
    if (currentState === 'victory') return 'victory';
    if (caffeinePercentage >= 50) return 'explosion';
    return 'passOut';
  }, [currentState, caffeinePercentage]);

  // Menu state or no character selected — show character selection
  if (currentState === 'menu' || !character) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <CharacterSelect onSelect={setCharacter} />
      </div>
    );
  }

  // Active game states — always render GameScene with conditional overlays
  return (
    <div className="relative w-full h-screen">
      <GameScene character={character} />

      {currentState === 'paused' && (
        <PauseOverlay onResume={resumeGame} onQuit={handleQuit} />
      )}

      {(currentState === 'gameOver' || currentState === 'victory') && (
        <GameOverOverlay
          outcome={getOutcome()}
          score={stats.score}
          healthBonus={Math.round(healthPercentage * 10)}
          zoneBonus={Math.round(stats.streak * 50)}
          difficultyMultiplier={1}
          onPlayAgain={handlePlayAgain}
          onMenu={handleQuit}
        />
      )}
    </div>
  );
}
