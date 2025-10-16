import React, { useState, useEffect } from 'react';
import { GameMenu, MenuButton, MenuSection } from './GameMenu';
import { DifficultyLevel } from './StartScreen';

export interface GameOverScreenProps {
  isOpen: boolean;
  onRestart: () => void;
  onMainMenu: () => void;
  onShare?: (score: GameScore) => void;
  finalScore: GameScore;
  highScores?: HighScore[];
  className?: string;
}

export interface GameScore {
  score: number;
  day: number;
  time: string;
  coffeesConsumed: number;
  difficulty: DifficultyLevel;
  reason: GameOverReason;
  date?: Date;
}

export interface HighScore {
  id: string;
  playerName: string;
  score: number;
  day: number;
  difficulty: DifficultyLevel;
  date: Date;
}

export type GameOverReason =
  | 'health_depleted'
  | 'caffeine_crash'
  | 'workday_completed'
  | 'quit';

const GAME_OVER_MESSAGES: Record<GameOverReason, { title: string; message: string }> = {
  health_depleted: {
    title: 'Health Critical!',
    message: 'You pushed yourself too hard and collapsed from exhaustion.',
  },
  caffeine_crash: {
    title: 'Caffeine Crash!',
    message: 'Your caffeine levels dropped too low to continue working.',
  },
  workday_completed: {
    title: 'Day Complete!',
    message: 'Congratulations! You survived another day in the office.',
  },
  quit: {
    title: 'Game Ended',
    message: 'You decided to call it a day.',
  },
};

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  isOpen,
  onRestart,
  onMainMenu,
  onShare,
  finalScore,
  highScores = [],
  className = '',
}) => {
  const [showHighScores, setShowHighScores] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [savedHighScores, setSavedHighScores] = useState<HighScore[]>(highScores);

  useEffect(() => {
    const loadedScores = loadHighScores();
    setSavedHighScores(loadedScores);

    const isHighScore = checkIfHighScore(finalScore, loadedScores);
    setIsNewHighScore(isHighScore);
  }, [finalScore]);

  const loadHighScores = (): HighScore[] => {
    try {
      const stored = localStorage.getItem('stayCaffeinatedHighScores');
      if (stored) {
        const scores = JSON.parse(stored);
        return scores.map((s: HighScore) => ({
          ...s,
          date: new Date(s.date),
        }));
      }
    } catch (error) {
      console.error('Failed to load high scores:', error);
    }
    return [];
  };

  const saveHighScore = () => {
    if (!playerName.trim()) return;

    const newScore: HighScore = {
      id: Date.now().toString(),
      playerName: playerName.trim(),
      score: finalScore.score,
      day: finalScore.day,
      difficulty: finalScore.difficulty,
      date: new Date(),
    };

    const updatedScores = [...savedHighScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setSavedHighScores(updatedScores);

    try {
      localStorage.setItem('stayCaffeinatedHighScores', JSON.stringify(updatedScores));
    } catch (error) {
      console.error('Failed to save high scores:', error);
    }

    setIsNewHighScore(false);
    setShowHighScores(true);
  };

  const checkIfHighScore = (score: GameScore, existingScores: HighScore[]): boolean => {
    if (existingScores.length < 10) return true;
    return score.score > Math.min(...existingScores.map(s => s.score));
  };

  const gameOverInfo = GAME_OVER_MESSAGES[finalScore.reason];
  const isSuccess = finalScore.reason === 'workday_completed';

  return (
    <GameMenu
      isOpen={isOpen}
      title={gameOverInfo.title}
      showCloseButton={false}
      className={className}
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className={`text-5xl mb-3 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
            {isSuccess ? '🎉' : '☕'}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {gameOverInfo.message}
          </p>
        </div>

        <MenuSection title="Final Stats">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {finalScore.score.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                Day {finalScore.day}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Survived</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {finalScore.time}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {finalScore.coffeesConsumed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Coffees</div>
            </div>
          </div>
          <div className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
            Difficulty: {finalScore.difficulty.charAt(0).toUpperCase() + finalScore.difficulty.slice(1)}
          </div>
        </MenuSection>

        {isNewHighScore && !showHighScores && (
          <MenuSection title="New High Score!">
            <div className="space-y-3">
              <p className="text-center text-green-600 dark:text-green-400 font-semibold">
                Congratulations! You achieved a high score!
              </p>
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveHighScore()}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                maxLength={20}
                autoFocus
              />
              <MenuButton
                onClick={saveHighScore}
                variant="success"
                size="medium"
                disabled={!playerName.trim()}
              >
                Save High Score
              </MenuButton>
            </div>
          </MenuSection>
        )}

        {showHighScores && savedHighScores.length > 0 && (
          <MenuSection title="High Scores">
            <div className="max-h-40 overflow-y-auto space-y-2">
              {savedHighScores.map((score, index) => (
                <div
                  key={score.id}
                  className={`flex justify-between items-center p-2 rounded ${
                    index === 0
                      ? 'bg-yellow-50 dark:bg-yellow-900/20'
                      : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-500 dark:text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {score.playerName}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {score.score.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Day {score.day} • {score.difficulty}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </MenuSection>
        )}

        <div className="space-y-3">
          <MenuButton
            onClick={onRestart}
            variant="primary"
            size="large"
          >
            Try Again
          </MenuButton>

          <MenuButton
            onClick={() => setShowHighScores(!showHighScores)}
            variant="secondary"
            size="medium"
          >
            {showHighScores ? 'Hide' : 'Show'} High Scores
          </MenuButton>

          {onShare && (
            <MenuButton
              onClick={() => onShare(finalScore)}
              variant="secondary"
              size="medium"
            >
              Share Score
            </MenuButton>
          )}

          <MenuButton
            onClick={onMainMenu}
            variant="secondary"
            size="medium"
          >
            Main Menu
          </MenuButton>
        </div>
      </div>
    </GameMenu>
  );
};

export const clearHighScores = (): void => {
  try {
    localStorage.removeItem('stayCaffeinatedHighScores');
  } catch (error) {
    console.error('Failed to clear high scores:', error);
  }
};

export const getTopHighScores = (count: number = 10): HighScore[] => {
  try {
    const stored = localStorage.getItem('stayCaffeinatedHighScores');
    if (stored) {
      const scores = JSON.parse(stored);
      return scores
        .slice(0, count)
        .map((s: HighScore) => ({
          ...s,
          date: new Date(s.date),
        }));
    }
  } catch (error) {
    console.error('Failed to load high scores:', error);
  }
  return [];
};