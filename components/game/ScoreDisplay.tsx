'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { DetailedScoreBreakdown, LeaderboardEntry } from '@/game/scoring';
import anime from '@/lib/anime';

export interface ScoreDisplayProps {
  currentScore: number;
  rank?: { rank: string; color: string; title: string };
  multiplier?: number;
  streak?: number;
  showDetails?: boolean;
  className?: string;
  animate?: boolean;
}

/**
 * Main Score Display Component
 */
export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  currentScore,
  rank,
  multiplier = 1,
  streak = 0,
  showDetails = true,
  className = '',
  animate = true,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const scoreRef = useRef<HTMLDivElement>(null);
  const multiplierRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<anime.AnimeInstance | null>(null);

  // Animate score changes
  useEffect(() => {
    if (!animate) {
      setDisplayScore(currentScore);
      return;
    }

    if (animationRef.current) {
      animationRef.current.pause();
    }

    const scoreObj = { score: displayScore };
    animationRef.current = anime({
      targets: scoreObj,
      score: currentScore,
      duration: 500,
      easing: 'easeOutQuad',
      update: () => {
        setDisplayScore(Math.floor(scoreObj.score));
      },
      complete: () => {
        setPreviousScore(currentScore);
      },
    });

    // Pulse effect on score increase
    if (currentScore > previousScore && scoreRef.current) {
      anime({
        targets: scoreRef.current,
        scale: [1, 1.1, 1],
        duration: 300,
        easing: 'easeOutElastic(1, .8)',
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [currentScore, displayScore, previousScore, animate]);

  // Animate multiplier changes
  useEffect(() => {
    if (multiplier > 1 && multiplierRef.current) {
      anime({
        targets: multiplierRef.current,
        scale: [0.8, 1.2, 1],
        rotate: [0, 5, -5, 0],
        duration: 600,
        easing: 'easeOutBounce',
      });
    }
  }, [multiplier]);

  const formatScore = (score: number): string => {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(2)}M`;
    }
    if (score >= 10000) {
      return `${Math.floor(score / 1000)}K`;
    }
    return score.toLocaleString();
  };

  const getMultiplierColor = (): string => {
    if (multiplier >= 5) return '#FFD700';
    if (multiplier >= 3) return '#FFA500';
    if (multiplier >= 2) return '#32CD32';
    if (multiplier > 1) return '#87CEEB';
    return '#FFFFFF';
  };

  const getStreakColor = (): string => {
    if (streak >= 120) return '#FFD700';
    if (streak >= 60) return '#FFA500';
    if (streak >= 30) return '#FF69B4';
    if (streak >= 10) return '#32CD32';
    return '#FFFFFF';
  };

  return (
    <div className={`score-display ${className}`}>
      <div className="flex flex-col items-end space-y-2">
        {/* Main score */}
        <div ref={scoreRef} className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">
            {formatScore(displayScore)}
          </span>
          {rank && (
            <span
              className="text-lg font-bold px-2 py-1 rounded"
              style={{
                color: rank.color,
                backgroundColor: `${rank.color}20`,
                border: `1px solid ${rank.color}40`,
              }}
            >
              {rank.rank}
            </span>
          )}
        </div>

        {/* Details section */}
        {showDetails && (
          <div className="flex flex-col items-end space-y-1 text-sm">
            {/* Multiplier */}
            {multiplier > 1 && (
              <div
                ref={multiplierRef}
                className="flex items-center gap-1"
                style={{ color: getMultiplierColor() }}
              >
                <span className="font-medium">×{multiplier.toFixed(1)}</span>
                <span className="text-xs opacity-80">MULTIPLIER</span>
              </div>
            )}

            {/* Streak */}
            {streak > 0 && (
              <div
                className="flex items-center gap-1"
                style={{ color: getStreakColor() }}
              >
                <span className="font-medium">{streak}s</span>
                <span className="text-xs opacity-80">STREAK</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Score Breakdown Modal Component
 */
export interface ScoreBreakdownModalProps {
  breakdown: DetailedScoreBreakdown | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({
  breakdown,
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      anime({
        targets: modalRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 300,
        easing: 'easeOutQuad',
      });
    }
  }, [isOpen]);

  if (!isOpen || !breakdown) return null;

  const items = [
    { label: 'Base Score', value: breakdown.baseScore, color: '#FFFFFF' },
    { label: 'Time Bonus', value: breakdown.timeBonus, color: '#87CEEB' },
    { label: 'Optimal Zone Bonus', value: breakdown.optimalBonus, color: '#32CD32' },
    { label: 'Streak Bonus', value: breakdown.streakBonus, color: '#FFD700' },
    { label: 'Event Bonus', value: breakdown.eventBonus, color: '#FF69B4' },
    { label: 'Power-up Bonus', value: breakdown.powerupBonus, color: '#9370DB' },
    { label: 'Health Bonus', value: breakdown.healthBonus, color: '#00CED1' },
    { label: 'Perfect Actions', value: breakdown.perfectBonus, color: '#FFA500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose} />
      <div
        ref={modalRef}
        className="relative bg-gray-900 rounded-lg shadow-2xl border border-gray-700 p-6 max-w-md w-full mx-4"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Score Breakdown</h2>

        {/* Score items */}
        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-gray-400">{item.label}</span>
              <span className="font-medium" style={{ color: item.color }}>
                +{item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Difficulty multiplier */}
        <div className="border-t border-gray-700 pt-3 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Difficulty Multiplier</span>
            <span className="font-medium text-yellow-400">
              ×{breakdown.difficultyMultiplier}
            </span>
          </div>
        </div>

        {/* Total score */}
        <div className="border-t border-gray-700 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-white">Total Score</span>
            <span className="text-2xl font-bold text-green-400">
              {breakdown.totalScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Leaderboard Display Component
 */
export interface LeaderboardDisplayProps {
  entries: LeaderboardEntry[];
  currentPlayer?: string;
  type: 'daily' | 'weekly' | 'allTime';
  showStats?: boolean;
  className?: string;
}

export const LeaderboardDisplay: React.FC<LeaderboardDisplayProps> = ({
  entries,
  currentPlayer,
  type,
  showStats = false,
  className = '',
}) => {
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);

  const getRankColor = (rank: number): string => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    if (rank <= 10) return '#87CEEB';
    return '#FFFFFF';
  };

  const getRankIcon = (rank: number): string | null => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getTypeLabel = (): string => {
    switch (type) {
      case 'daily': return 'Today\'s Best';
      case 'weekly': return 'This Week';
      case 'allTime': return 'All Time';
    }
  };

  return (
    <div className={`leaderboard-display ${className}`}>
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span>🏆</span>
          <span>{getTypeLabel()} Leaderboard</span>
        </h3>

        {/* Leaderboard entries */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No scores yet</p>
          ) : (
            entries.map((entry) => (
              <div
                key={`${entry.playerName}-${entry.date}`}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${
                  entry.playerName === currentPlayer
                    ? 'bg-blue-900 bg-opacity-30 border border-blue-500'
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div
                    className="font-bold text-lg w-8 text-center"
                    style={{ color: getRankColor(entry.rank) }}
                  >
                    {getRankIcon(entry.rank) || entry.rank}
                  </div>

                  {/* Player info */}
                  <div>
                    <div className="font-medium text-white">{entry.playerName}</div>
                    <div className="text-xs text-gray-500">
                      {entry.difficulty} • {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="font-bold text-white">
                    {entry.score.toLocaleString()}
                  </div>
                  {showStats && (
                    <div className="text-xs text-gray-500">
                      {Math.floor(entry.stats.survivalTime / 1000)}s
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected entry stats */}
        {selectedEntry && showStats && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Performance Stats</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Survival:</span>
                <span className="ml-2 text-white">
                  {Math.floor(selectedEntry.stats.survivalTime / 1000)}s
                </span>
              </div>
              <div>
                <span className="text-gray-500">Optimal:</span>
                <span className="ml-2 text-white">
                  {Math.floor(selectedEntry.stats.optimalTime / 1000)}s
                </span>
              </div>
              <div>
                <span className="text-gray-500">Drinks:</span>
                <span className="ml-2 text-white">{selectedEntry.stats.drinksConsumed}</span>
              </div>
              <div>
                <span className="text-gray-500">Events:</span>
                <span className="ml-2 text-white">{selectedEntry.stats.eventsCompleted}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Score Popup Component (for bonus points)
 */
export interface ScorePopupProps {
  value: number;
  text?: string;
  color?: string;
  position: { x: number; y: number };
  onComplete?: () => void;
}

export const ScorePopup: React.FC<ScorePopupProps> = ({
  value,
  text,
  color = '#FFD700',
  position,
  onComplete,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (popupRef.current) {
      anime({
        targets: popupRef.current,
        translateY: [-20, -80],
        opacity: [1, 0],
        scale: [0.5, 1.2, 1],
        duration: 1500,
        easing: 'easeOutQuad',
        complete: onComplete,
      });
    }
  }, [onComplete]);

  return (
    <div
      ref={popupRef}
      className="fixed pointer-events-none z-40"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        color,
      }}
    >
      <div className="font-bold text-lg drop-shadow-lg">
        +{value.toLocaleString()}
        {text && <span className="text-sm ml-1">{text}</span>}
      </div>
    </div>
  );
};