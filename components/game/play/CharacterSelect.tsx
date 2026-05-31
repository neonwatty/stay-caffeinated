'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { CoffeeCupSVG } from '@/components/game/CoffeeCupSVG';
import { SpriteCharacter } from '@/components/game/SpriteCharacter';
import { DIFFICULTY_CONFIGS } from '@/game/core/constants';
import type { Difficulty } from '@/types/game';

export type CharacterType = 'officeWorker' | 'coffeeCup';

interface CharacterSelectProps {
  onSelect: (character: CharacterType) => void;
}

const CHARACTERS: { id: CharacterType; name: string; description: string }[] = [
  {
    id: 'officeWorker',
    name: 'Office Worker',
    description: 'A developer fueled by caffeine',
  },
  {
    id: 'coffeeCup',
    name: 'Coffee Cup',
    description: 'A sentient mug of ambition',
  },
];

const DIFFICULTY_KEYS = Object.keys(DIFFICULTY_CONFIGS) as Difficulty[];

export function CharacterSelect({ onSelect }: CharacterSelectProps) {
  const { setDifficulty, startGame } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('officeWorker');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('junior');

  function handleStart() {
    setDifficulty(selectedDifficulty);
    onSelect(selectedCharacter);
    startGame();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 text-white">
      {/* Title */}
      <h1 className="mb-2 text-4xl font-bold tracking-tight">Stay Caffeinated</h1>
      <p className="mb-10 text-lg text-gray-400">Choose your character and difficulty</p>

      {/* Character cards */}
      <div className="mb-10 flex gap-6">
        {CHARACTERS.map((char) => {
          const isSelected = selectedCharacter === char.id;
          return (
            <button
              key={char.id}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Selected character' : 'Choose character'} ${char.name}. ${char.description}`}
              onClick={() => setSelectedCharacter(char.id)}
              className={`flex flex-col items-center rounded-xl border-2 bg-gray-800 p-6 transition-all hover:bg-gray-750 ${
                isSelected
                  ? 'border-green-500 shadow-lg shadow-green-500/20'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="mb-3">
                {char.id === 'officeWorker' ? (
                  <SpriteCharacter caffeineLevel={50} width={160} height={160} isActive={false} />
                ) : (
                  <CoffeeCupSVG caffeineLevel={50} width={160} height={160} isActive={false} />
                )}
              </div>
              <span className="text-lg font-semibold">{char.name}</span>
              <span className="mt-1 text-sm text-gray-400">{char.description}</span>
            </button>
          );
        })}
      </div>

      {/* Difficulty selector */}
      <div className="mb-8">
        <h2 className="mb-3 text-center text-sm font-medium uppercase tracking-wider text-gray-400">
          Difficulty
        </h2>
        <div className="flex gap-2">
          {DIFFICULTY_KEYS.map((key) => {
            const config = DIFFICULTY_CONFIGS[key];
            const isActive = selectedDifficulty === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDifficulty(key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {config.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Start button */}
      <button
        type="button"
        onClick={handleStart}
        className="rounded-xl bg-green-600 px-8 py-3 text-lg font-bold transition-colors hover:bg-green-500"
      >
        Start Shift
      </button>
    </div>
  );
}
