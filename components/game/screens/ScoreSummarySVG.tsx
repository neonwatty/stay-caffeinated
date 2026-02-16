'use client';

import { useMemo, useState, useEffect } from 'react';

interface ScoreSummarySVGProps {
  baseScore: number;
  zoneBonus: number;
  healthBonus: number;
  difficultyMultiplier: number;
  finalScore: number;
  isNewHighScore?: boolean;
  onPlayAgain?: () => void;
  onMenu?: () => void;
  width?: number;
  height?: number;
  isActive?: boolean;
  startDelay?: number; // ms before starting count-up
}

/**
 * Animated score tally used by all game-over/victory screens.
 * Each line appears with stagger delay, numbers count up from 0.
 * Final score has golden pulse if new high score.
 */
export function ScoreSummarySVG({
  baseScore,
  zoneBonus,
  healthBonus,
  difficultyMultiplier,
  finalScore,
  isNewHighScore = false,
  onPlayAgain,
  onMenu,
  width = 340,
  height = 280,
  isActive = true,
  startDelay = 0,
}: ScoreSummarySVGProps) {
  const [animProgress, setAnimProgress] = useState(0); // 0-5 (one per row + buttons)
  const [counters, setCounters] = useState({ base: 0, zone: 0, health: 0, final: 0 });

  // Animate rows appearing one by one
  useEffect(() => {
    if (!isActive) return;
    const timers: NodeJS.Timeout[] = [];
    for (let i = 1; i <= 5; i++) {
      timers.push(setTimeout(() => setAnimProgress(i), startDelay + i * 400));
    }
    return () => timers.forEach(clearTimeout);
  }, [isActive, startDelay]);

  // Count up animation for each row
  useEffect(() => {
    if (!isActive || animProgress < 1) return;
    const duration = 600;
    const start = Date.now();
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setCounters({
        base: animProgress >= 1 ? Math.round(baseScore * ease) : 0,
        zone: animProgress >= 2 ? Math.round(zoneBonus * ease) : 0,
        health: animProgress >= 3 ? Math.round(healthBonus * ease) : 0,
        final: animProgress >= 4 ? Math.round(finalScore * ease) : 0,
      });
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isActive, animProgress, baseScore, zoneBonus, healthBonus, finalScore]);

  const animId = 'ss';

  const keyframes_css = isActive ? `
    @keyframes slideInRow-${animId} {
      0% { transform: translateX(40px); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    @keyframes highScorePulse-${animId} {
      0%, 100% { filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6)); }
      50% { filter: drop-shadow(0 0 12px rgba(255, 215, 0, 1)); }
    }
    @keyframes fadeInUp-${animId} {
      0% { transform: translateY(10px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
  ` : '';

  const rows = useMemo(() => [
    { label: 'Base Score', value: counters.base, show: animProgress >= 1, color: '#CCCCCC' },
    { label: 'Zone Bonus', value: counters.zone, show: animProgress >= 2, color: '#4ECDC4' },
    { label: 'Health Bonus', value: counters.health, show: animProgress >= 3, color: '#FF6B6B' },
  ], [counters, animProgress]);

  return (
    <div style={{ width, height, display: 'inline-flex' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes_css }} />}
      <svg viewBox="0 0 340 280" width="100%" height="100%">
        {/* Background panel */}
        <rect x="10" y="10" width="320" height="260" rx="12" fill="rgba(0,0,0,0.6)"
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* Score rows */}
        {rows.map((row, i) => (
          <g key={i}
            opacity={row.show ? 1 : 0}
            style={{
              animation: row.show && isActive ? `slideInRow-${animId} 0.4s ease-out forwards` : 'none',
            }}
          >
            <text x="35" y={55 + i * 35} fill={row.color} fontSize="14" fontFamily="monospace">
              {row.label}
            </text>
            <text x="290" y={55 + i * 35} fill={row.color} fontSize="14" fontFamily="monospace"
              textAnchor="end">
              +{row.value.toLocaleString()}
            </text>
            {/* Divider */}
            <line x1="30" y1={62 + i * 35} x2="310" y2={62 + i * 35}
              stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </g>
        ))}

        {/* Difficulty multiplier */}
        {animProgress >= 3 && (
          <g style={{
            animation: isActive ? `slideInRow-${animId} 0.4s ease-out forwards` : 'none',
          }}>
            <text x="35" y={55 + 3 * 35} fill="#A78BFA" fontSize="14" fontFamily="monospace">
              Difficulty
            </text>
            <text x="290" y={55 + 3 * 35} fill="#A78BFA" fontSize="14" fontFamily="monospace"
              textAnchor="end">
              x{difficultyMultiplier.toFixed(1)}
            </text>
            <line x1="30" y1={62 + 3 * 35} x2="310" y2={62 + 3 * 35}
              stroke="rgba(255,215,0,0.3)" strokeWidth="1" />
          </g>
        )}

        {/* Final score */}
        {animProgress >= 4 && (
          <g style={{
            animation: isActive
              ? isNewHighScore
                ? `slideInRow-${animId} 0.4s ease-out forwards, highScorePulse-${animId} 1.5s infinite 0.5s`
                : `slideInRow-${animId} 0.4s ease-out forwards`
              : 'none',
          }}>
            <text x="170" y={210} fill="#FFD700" fontSize="24" fontFamily="monospace"
              textAnchor="middle" fontWeight="bold">
              {counters.final.toLocaleString()}
            </text>
            {isNewHighScore && (
              <text x="170" y={228} fill="#FF6B6B" fontSize="11" fontFamily="monospace"
                textAnchor="middle">
                NEW HIGH SCORE!
              </text>
            )}
          </g>
        )}

        {/* Buttons */}
        {animProgress >= 5 && (
          <g style={{
            animation: isActive ? `fadeInUp-${animId} 0.5s ease-out forwards` : 'none',
          }}>
            {/* Play Again button */}
            <g onClick={onPlayAgain} style={{ cursor: 'pointer' }}>
              <rect x="40" y="240" width="120" height="28" rx="6" fill="#22C55E" opacity="0.9" />
              <text x="100" y="259" fill="white" fontSize="12" fontFamily="monospace"
                textAnchor="middle">Play Again</text>
            </g>
            {/* Menu button */}
            <g onClick={onMenu} style={{ cursor: 'pointer' }}>
              <rect x="180" y="240" width="120" height="28" rx="6" fill="#6B7280" opacity="0.9" />
              <text x="240" y="259" fill="white" fontSize="12" fontFamily="monospace"
                textAnchor="middle">Menu</text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
