'use client';

import { useMemo, useRef, useEffect, useState } from 'react';

interface ScoreDisplaySVGProps {
  score: number;
  streak: number;           // current optimal-zone streak in seconds
  multiplier: number;       // score multiplier
  width?: number;
  height?: number;
  isActive?: boolean;
}

/**
 * Animated SVG score counter with digit roll animation, combo badge,
 * milestone flash, and coffee bean icon.
 * Uses CSS animations to avoid React hydration mismatches.
 */
export function ScoreDisplaySVG({
  score,
  streak,
  multiplier,
  width = 260,
  height = 80,
  isActive = true,
}: ScoreDisplaySVGProps) {
  const [displayScore, setDisplayScore] = useState(score);
  const [isMilestone, setIsMilestone] = useState(false);
  const prevScoreRef = useRef(score);
  const animFrameRef = useRef<number | null>(null);

  // Animate score counting up
  useEffect(() => {
    if (!isActive) {
      setDisplayScore(score);
      return;
    }

    const start = prevScoreRef.current;
    const end = score;
    if (start === end) return;

    const duration = 400; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.floor(start + (end - start) * eased));

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        prevScoreRef.current = end;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [score, isActive]);

  // Milestone flash at thresholds
  useEffect(() => {
    const thresholds = [1000, 2500, 5000, 10000, 25000, 50000, 100000];
    const crossed = thresholds.some(
      (t) => score >= t && prevScoreRef.current < t
    );
    if (crossed) {
      setIsMilestone(true);
      const timer = setTimeout(() => setIsMilestone(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [score]);

  const state = useMemo(() => {
    const hasStreak = streak > 0;
    const hasMultiplier = multiplier > 1;
    // Multiplier badge color
    let multColor: string;
    if (multiplier >= 5) multColor = '#FFD700';
    else if (multiplier >= 3) multColor = '#FFA500';
    else if (multiplier >= 2) multColor = '#32CD32';
    else multColor = '#87CEEB';
    // Streak color
    let streakColor: string;
    if (streak >= 120) streakColor = '#FFD700';
    else if (streak >= 60) streakColor = '#FFA500';
    else if (streak >= 30) streakColor = '#FF69B4';
    else if (streak >= 10) streakColor = '#32CD32';
    else streakColor = '#87CEEB';
    return { hasStreak, hasMultiplier, multColor, streakColor };
  }, [streak, multiplier]);

  const animId = `sd${score}`;

  const formatScore = (s: number): string => {
    return Math.max(0, Math.round(s)).toLocaleString();
  };

  const keyframes = isActive ? `
    @keyframes milestone-flash-${animId} {
      0% { opacity: 0; transform: scale(0.5); }
      30% { opacity: 1; transform: scale(1.1); }
      100% { opacity: 0; transform: scale(1.5); }
    }
    @keyframes mult-pulse-${animId} {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }
    @keyframes bean-bob-${animId} {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }
    @keyframes streak-glow-${animId} {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
  ` : '';

  return (
    <div style={{ width, height, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg viewBox="0 0 280 80" width="100%" height="100%">
        {/* Coffee bean icon */}
        <g transform="translate(8, 20)" style={{
          animation: isActive ? `bean-bob-${animId} 2s ease-in-out infinite` : 'none',
        }}>
          <ellipse cx="14" cy="18" rx="12" ry="16" fill="#8B4513" />
          <path d="M 14 4 Q 8 18, 14 32" fill="none" stroke="#6B3410" strokeWidth="2" />
          <ellipse cx="14" cy="18" rx="10" ry="14" fill="none" stroke="#A0522D" strokeWidth="1" opacity="0.5" />
        </g>

        {/* Main score text */}
        <text x="44" y="42" fontSize="32" fontWeight="bold" fill="white"
          fontFamily="'Courier New', monospace">
          {formatScore(displayScore)}
        </text>

        {/* Milestone flash burst */}
        {isMilestone && isActive && (
          <circle cx="150" cy="35" r="30" fill="none" stroke="#FFD700" strokeWidth="3"
            opacity="0"
            style={{ animation: `milestone-flash-${animId} 1.2s ease-out forwards` }}
          />
        )}

        {/* Multiplier badge */}
        {state.hasMultiplier && (
          <g transform="translate(220, 8)" style={{
            animation: isActive ? `mult-pulse-${animId} 1.5s ease-in-out infinite` : 'none',
            transformOrigin: '235px 22px',
          }}>
            <circle cx="15" cy="14" r="14" fill={state.multColor} opacity="0.2" />
            <circle cx="15" cy="14" r="11" fill={state.multColor} opacity="0.15" />
            <text x="15" y="19" textAnchor="middle" fontSize="13" fontWeight="bold"
              fill={state.multColor}>
              x{multiplier.toFixed(1)}
            </text>
          </g>
        )}

        {/* Streak indicator */}
        {state.hasStreak && (
          <g style={{
            animation: isActive ? `streak-glow-${animId} 2s ease-in-out infinite` : 'none',
          }}>
            <text x="44" y="68" fontSize="12" fill={state.streakColor} fontWeight="600">
              {Math.round(streak)}s streak
            </text>
            {/* Small fire icon */}
            <g transform="translate(110, 56)">
              <path d="M 6 12 Q 0 6, 3 0 Q 6 4, 9 0 Q 12 6, 6 12 Z"
                fill={state.streakColor} opacity="0.7" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
