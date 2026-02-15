'use client';

import { useState } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import { CharacterSelect } from '@/components/game/play/CharacterSelect';
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

  if (!character) {
    return <CharacterSelect onSelect={setCharacter} />;
  }

  // Placeholder until later tasks wire up the full game UI
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <p className="text-lg">Playing as: {character}</p>
    </div>
  );
}
