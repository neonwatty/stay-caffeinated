'use client';

import { useMemo } from 'react';
import { CaffeineMeterSVG } from '@/components/game/ui/CaffeineMeterSVG';
import { HealthBarSVG } from '@/components/game/ui/HealthBarSVG';
import { ScoreDisplaySVG } from '@/components/game/ui/ScoreDisplaySVG';

interface GameHUDProps {
  caffeineLevel: number;
  healthLevel: number;
  score: number;
  streak: number;
  multiplier: number;
  timeProgress: number;
  formattedTime: string;
  optimalZone: [number, number];
  isActive: boolean;
}

/**
 * Maps timeProgress (0-100) to a game clock string "H:MM AM/PM".
 * 0 = 9:00 AM, 100 = 5:00 PM (8-hour workday = 480 minutes).
 */
function formatGameTime(timeProgress: number): string {
  const clamped = Math.max(0, Math.min(100, timeProgress));
  const totalMinutes = Math.round((clamped / 100) * 480);
  const hours24 = 9 + Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 > 12 ? hours24 - 12 : hours24;

  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function GameHUD({
  caffeineLevel,
  healthLevel,
  score,
  streak,
  multiplier,
  timeProgress,
  optimalZone,
  isActive,
}: GameHUDProps) {
  const gameTime = useMemo(() => formatGameTime(timeProgress), [timeProgress]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top-left: Caffeine Meter */}
      <div className="absolute top-2 left-2">
        <CaffeineMeterSVG
          caffeineLevel={caffeineLevel}
          healthLevel={healthLevel}
          optimalZone={optimalZone}
          width={120}
          height={100}
          isActive={isActive}
        />
      </div>

      {/* Below caffeine meter: Health Bar */}
      <div className="absolute left-2" style={{ top: 110 }}>
        <HealthBarSVG
          healthLevel={healthLevel}
          caffeineLevel={caffeineLevel}
          isCritical={healthLevel < 20}
          width={140}
          height={50}
          isActive={isActive}
        />
      </div>

      {/* Top-right: Game Clock */}
      <div className="absolute top-2 right-2">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10">
          <span className="text-white/90 text-sm font-mono font-semibold tracking-wide">
            {gameTime}
          </span>
        </div>
      </div>

      {/* Below clock: Score Display */}
      <div className="absolute right-2" style={{ top: 70 }}>
        <ScoreDisplaySVG
          score={score}
          streak={streak}
          multiplier={multiplier}
          width={150}
          height={70}
          isActive={isActive}
        />
      </div>
    </div>
  );
}
