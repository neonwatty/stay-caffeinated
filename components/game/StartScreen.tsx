import React, { useState, useEffect, useRef } from 'react';
import { GameMenu, MenuButton, MenuSection } from './GameMenu';
import anime from '@/lib/anime';

export interface StartScreenProps {
  isOpen: boolean;
  onStartGame: (difficulty: DifficultyLevel) => void;
  onShowSettings?: () => void;
  onShowHighScores?: () => void;
  className?: string;
  savedDifficulty?: DifficultyLevel;
}

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'extreme';

export interface DifficultyOption {
  level: DifficultyLevel;
  name: string;
  description: string;
  workdayLength: string;
  caffeineDecay: string;
  healthImpact: string;
  color: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    level: 'easy',
    name: 'Casual',
    description: 'A relaxed workday with forgiving caffeine levels',
    workdayLength: '3 minutes',
    caffeineDecay: 'Slow',
    healthImpact: 'Low',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    level: 'normal',
    name: 'Standard',
    description: 'A typical office day with balanced challenge',
    workdayLength: '4 minutes',
    caffeineDecay: 'Normal',
    healthImpact: 'Medium',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    level: 'hard',
    name: 'Crunch Time',
    description: 'Demanding deadlines require careful caffeine management',
    workdayLength: '5 minutes',
    caffeineDecay: 'Fast',
    healthImpact: 'High',
    color: 'text-orange-600 dark:text-orange-400',
  },
  {
    level: 'extreme',
    name: 'Death March',
    description: 'Only for the most experienced coffee warriors',
    workdayLength: '6 minutes',
    caffeineDecay: 'Very Fast',
    healthImpact: 'Extreme',
    color: 'text-red-600 dark:text-red-400',
  },
];

export const StartScreen: React.FC<StartScreenProps> = ({
  isOpen,
  onStartGame,
  onShowSettings,
  onShowHighScores,
  className = '',
  savedDifficulty,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(
    savedDifficulty || 'normal'
  );
  const [showDifficultyDetails, setShowDifficultyDetails] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (savedDifficulty) {
      setSelectedDifficulty(savedDifficulty);
    }
  }, [savedDifficulty]);

  const handleStartGame = () => {
    // Animate the menu closing before starting the game
    if (menuRef.current) {
      anime({
        targets: menuRef.current,
        scale: [1, 1.1, 0],
        opacity: [1, 0],
        duration: 500,
        easing: 'easeInOutQuad',
        complete: () => {
          onStartGame(selectedDifficulty);
        }
      });
    } else {
      onStartGame(selectedDifficulty);
    }
  };

  const selectedOption = DIFFICULTY_OPTIONS.find(opt => opt.level === selectedDifficulty);

  return (
    <GameMenu
      isOpen={isOpen}
      title="Stay Caffeinated"
      showCloseButton={false}
      role="dialog"
      aria-labelledby="game-title"
      aria-describedby="game-description"
      className={className}
    >
      <div className="space-y-6">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p className="text-lg mb-2">Keep your productivity high!</p>
          <p className="text-sm">Manage your caffeine levels to survive the workday</p>
        </div>

        <MenuSection title="Select Difficulty">
          <div className="grid grid-cols-2 gap-3">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.level}
                onClick={() => setSelectedDifficulty(option.level)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200
                  ${
                    selectedDifficulty === option.level
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }
                `}
                aria-label={`Select ${option.name} difficulty`}
              >
                <div className={`font-semibold ${option.color}`}>
                  {option.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {option.workdayLength}
                </div>
              </button>
            ))}
          </div>

          {selectedOption && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setShowDifficultyDetails(!showDifficultyDetails)}
                className="w-full text-left flex justify-between items-center"
                aria-expanded={showDifficultyDetails}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Difficulty Details
                </span>
                <span className="text-gray-500">
                  {showDifficultyDetails ? '−' : '+'}
                </span>
              </button>

              {showDifficultyDetails && (
                <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>{selectedOption.description}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="font-medium">Workday:</span> {selectedOption.workdayLength}
                    </div>
                    <div>
                      <span className="font-medium">Decay:</span> {selectedOption.caffeineDecay}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Health Impact:</span> {selectedOption.healthImpact}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </MenuSection>

        <div className="space-y-3">
          <MenuButton
            onClick={handleStartGame}
            variant="primary"
            size="large"
          >
            Start Game
          </MenuButton>

          {onShowHighScores && (
            <MenuButton
              onClick={onShowHighScores}
              variant="secondary"
              size="medium"
            >
              High Scores
            </MenuButton>
          )}

          {onShowSettings && (
            <MenuButton
              onClick={onShowSettings}
              variant="secondary"
              size="medium"
            >
              Settings
            </MenuButton>
          )}
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t dark:border-gray-700">
          <p>Use caffeinated drinks wisely to maintain productivity</p>
          <p>But beware - too much caffeine can be harmful!</p>
        </div>
      </div>
    </GameMenu>
  );
};

export interface QuickStartProps {
  onStart: () => void;
  difficulty?: DifficultyLevel;
  className?: string;
}

export const QuickStart: React.FC<QuickStartProps> = ({
  onStart,
  difficulty = 'normal',
  className = '',
}) => {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
        Stay Caffeinated
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Quick Start - {DIFFICULTY_OPTIONS.find(d => d.level === difficulty)?.name}
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
      >
        Start Working
      </button>
    </div>
  );
};