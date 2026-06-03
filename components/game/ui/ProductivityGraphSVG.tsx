'use client';

import { useMemo } from 'react';

export interface ProductivityInputs {
  caffeineLevel: number;
  healthLevel: number;
  streak: number;
  multiplier: number;
  timeProgress: number;
}

interface ProductivityGraphSVGProps extends ProductivityInputs {
  width?: number;
  height?: number;
  isActive?: boolean;
}

interface ProductivityResult {
  score: number;
  label: 'Fading' | 'Warming Up' | 'Deep Work' | 'Chaos';
  color: string;
}

const clamp = (value: number, min = 0, max = 100) => (
  Math.max(min, Math.min(max, value))
);

function caffeineProductivity(caffeine: number): number {
  if (caffeine < 30) {
    return 25 + caffeine * 1.1;
  }

  if (caffeine <= 70) {
    const distanceFromPeak = Math.abs(caffeine - 55);
    return 80 + (1 - distanceFromPeak / 25) * 10;
  }

  if (caffeine >= 95) {
    return 42 - (caffeine - 95) * 2;
  }

  return 76 - (caffeine - 70) * 1.6;
}

export function calculateProductivity({
  caffeineLevel,
  healthLevel,
  streak,
  multiplier,
  timeProgress,
}: ProductivityInputs): ProductivityResult {
  const caffeine = clamp(caffeineLevel);
  const health = clamp(healthLevel);
  const progress = clamp(timeProgress);
  const dayRhythm = Math.sin((progress / 100) * Math.PI) * 0.5;
  const healthAdjustment = (health - 70) * 0.08;
  const streakBoost = Math.min(3, Math.max(0, streak) / 45 * 1.5);
  const multiplierBoost = Math.min(3, Math.max(0, multiplier - 1) * 2);
  const score = Math.round(clamp(
    caffeineProductivity(caffeine)
      + healthAdjustment
      + streakBoost
      + multiplierBoost
      + dayRhythm,
  ));

  if (caffeine >= 95) {
    return { score, label: 'Chaos', color: '#F97316' };
  }

  if (score < 45 || caffeine < 25) {
    return { score, label: 'Fading', color: '#60A5FA' };
  }

  if (score >= 82) {
    return { score, label: 'Deep Work', color: '#22C55E' };
  }

  return { score, label: 'Warming Up', color: '#FACC15' };
}

function buildCurvePath(points: Array<{ x: number; y: number }>): string {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

export function ProductivityGraphSVG({
  caffeineLevel,
  healthLevel,
  streak,
  multiplier,
  timeProgress,
  width = 180,
  height = 96,
  isActive = true,
}: ProductivityGraphSVGProps) {
  const current = useMemo(
    () => calculateProductivity({
      caffeineLevel,
      healthLevel,
      streak,
      multiplier,
      timeProgress,
    }),
    [caffeineLevel, healthLevel, streak, multiplier, timeProgress],
  );

  const graph = useMemo(() => {
    const samples = Array.from({ length: 9 }, (_, index) => {
      const progress = index * 12.5;
      const projectedCaffeine = clamp(caffeineLevel - Math.abs(progress - timeProgress) * 0.22);
      const projected = calculateProductivity({
        caffeineLevel: projectedCaffeine,
        healthLevel,
        streak,
        multiplier,
        timeProgress: progress,
      });

      return {
        x: 14 + index * 18.5,
        y: 74 - projected.score * 0.48,
      };
    });

    const currentX = 14 + clamp(timeProgress) * 1.48;
    const currentY = 74 - current.score * 0.48;

    return {
      path: buildCurvePath(samples),
      currentX,
      currentY,
      points: samples,
    };
  }, [caffeineLevel, current.score, healthLevel, multiplier, streak, timeProgress]);

  const animId = `pg${current.score}`;
  const keyframes = isActive ? `
    @keyframes productivity-dash-${animId} {
      0% { stroke-dashoffset: 16; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes productivity-marker-${animId} {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.18); opacity: 1; }
    }
  ` : '';

  return (
    <div
      data-testid="productivity-graph-panel"
      className="pointer-events-auto rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 shadow-lg backdrop-blur-sm"
      style={{ width, height }}
    >
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg
        viewBox="0 0 180 96"
        width="100%"
        height="100%"
        role="img"
        aria-label={`Productivity graph: ${current.score}% ${current.label}`}
      >
        <defs>
          <linearGradient id={`productivity-fill-${animId}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.22" />
            <stop offset="48%" stopColor="#38BDF8" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#FACC15" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        <text x="3" y="14" fontSize="11" fontWeight="700" fill="rgba(255,255,255,0.9)">
          Productivity
        </text>
        <text x="176" y="17" textAnchor="end" fontSize="18" fontWeight="800" fill={current.color}>
          {`${current.score}%`}
        </text>
        <text x="176" y="31" textAnchor="end" fontSize="9" fontWeight="700" fill="rgba(255,255,255,0.72)">
          {current.label}
        </text>

        <rect x="12" y="27" width="150" height="42" rx="5" fill="rgba(255,255,255,0.05)" />
        <rect x="12" y="36" width="150" height="17" rx="4" fill="rgba(34,197,94,0.12)" />
        <line x1="12" y1="53" x2="162" y2="53" stroke="rgba(34,197,94,0.35)" strokeDasharray="3 3" />
        <line x1="12" y1="36" x2="162" y2="36" stroke="rgba(34,197,94,0.35)" strokeDasharray="3 3" />

        <path
          d={`${graph.path} L 162 74 L 14 74 Z`}
          fill={`url(#productivity-fill-${animId})`}
          opacity="0.85"
        />
        <path
          data-testid="productivity-curve"
          d={graph.path}
          fill="none"
          stroke={current.color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 8"
          style={{
            animation: isActive ? `productivity-dash-${animId} 1.4s linear infinite` : 'none',
          }}
        />

        {graph.points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="1.6"
            fill="rgba(255,255,255,0.7)"
          />
        ))}

        <line
          x1={graph.currentX}
          y1="27"
          x2={graph.currentX}
          y2="74"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
        />
        <circle
          data-testid="productivity-current-marker"
          cx={graph.currentX}
          cy={graph.currentY}
          r="5"
          fill={current.color}
          stroke="white"
          strokeWidth="1.5"
          style={{
            transformOrigin: `${graph.currentX}px ${graph.currentY}px`,
            animation: isActive ? `productivity-marker-${animId} 1.2s ease-in-out infinite` : 'none',
          }}
        />

        <text x="12" y="88" fontSize="8" fill="rgba(255,255,255,0.48)">
          9a
        </text>
        <text x="86" y="88" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.48)">
          lunch
        </text>
        <text x="162" y="88" textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.48)">
          5p
        </text>
      </svg>
    </div>
  );
}
