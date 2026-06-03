'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface CaffeineMeterSVGProps {
  caffeineLevel: number;     // 0-100
  healthLevel: number;       // 0-100, drives danger indicators
  optimalZone?: [number, number]; // e.g. [30, 70]
  width?: number;
  height?: number;
  isActive?: boolean;
}

/**
 * Coffee-cup-shaped gauge that fills/drains based on caffeine level.
 * Uses CSS animations (not SVG animate) to avoid React hydration mismatches.
 *
 * - Liquid level maps to caffeineLevel (0-100)
 * - Color: blue (low) -> green (optimal) -> red (high)
 * - Zone markers at optimal boundaries
 * - Wave animation on coffee surface
 * - Steam scales with level
 * - Danger glow when health is low
 */
export function CaffeineMeterSVG({
  caffeineLevel,
  healthLevel,
  optimalZone = [30, 70],
  width = 120,
  height = 200,
  isActive = true,
}: CaffeineMeterSVGProps) {
  const level = Math.round(Math.max(0, Math.min(100, caffeineLevel)));
  const health = Math.max(0, Math.min(100, healthLevel));

  const [isPulsing, setIsPulsing] = useState(false);
  const prevCaffeineRef = useRef(caffeineLevel);

  useEffect(() => {
    const delta = Math.abs(caffeineLevel - prevCaffeineRef.current);
    prevCaffeineRef.current = caffeineLevel;
    if (delta > 5) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [caffeineLevel]);

  const state = useMemo(() => {
    const t = level / 100;
    // Liquid fill: 10% at 0, 90% at 100
    const fillPct = 0.1 + t * 0.8;
    // Color interpolation: blue -> green -> red
    let hue: number, sat: number, light: number;
    if (t < 0.3) {
      // Blue to green
      const p = t / 0.3;
      hue = 220 - p * 100; // 220 -> 120
      sat = 50 + p * 20;
      light = 50 - p * 10;
    } else if (t > 0.7) {
      // Green to red
      const p = (t - 0.7) / 0.3;
      hue = 120 - p * 120; // 120 -> 0
      sat = 70 + p * 10;
      light = 40 + p * 5;
    } else {
      // Optimal green
      hue = 120;
      sat = 70;
      light = 40;
    }
    const steamOpacity = t < 0.15 ? 0 : Math.min((t - 0.15) * 1.5, 0.7);
    const isLow = t < 0.3;
    const isOverCaffeinated = t > 0.7;
    const isTripped = t > 0.95;
    const isHigh = isOverCaffeinated && !isTripped;
    const isOptimal = t >= 0.3 && t <= 0.7;
    const isDanger = health < 20;
    return {
      fillPct,
      hue,
      sat,
      light,
      steamOpacity,
      isLow,
      isOverCaffeinated,
      isHigh,
      isTripped,
      isOptimal,
      isDanger,
      t,
    };
  }, [level, health]);

  const animId = `cm${level}`;

  // Mug dimensions within viewBox 0 0 200 340
  const mugTop = 60;
  const mugBottom = 290;
  const mugHeight = mugBottom - mugTop;
  const liquidTop = mugBottom - state.fillPct * mugHeight;

  const liquidColor = `hsl(${state.hue}, ${state.sat}%, ${state.light}%)`;
  const liquidDark = `hsl(${state.hue}, ${state.sat}%, ${state.light - 10}%)`;

  const keyframes = isActive ? `
    @keyframes wave-${animId} {
      0%, 100% { d: path("M 45 ${liquidTop} Q 75 ${liquidTop - 6}, 100 ${liquidTop} Q 125 ${liquidTop + 6}, 155 ${liquidTop} L 155 ${liquidTop} L 45 ${liquidTop} Z"); }
      50% { d: path("M 45 ${liquidTop} Q 75 ${liquidTop + 6}, 100 ${liquidTop} Q 125 ${liquidTop - 6}, 155 ${liquidTop} L 155 ${liquidTop} L 45 ${liquidTop} Z"); }
    }
    @keyframes steam-cm-${animId} {
      0%, 100% { transform: translateY(0) translateX(0); opacity: 0.5; }
      50% { transform: translateY(-10px) translateX(2px); opacity: 0.15; }
    }
    @keyframes danger-pulse-${animId} {
      0%, 100% { opacity: 0; }
      50% { opacity: 0.6; }
    }
    @keyframes bubble-cm-${animId} {
      0% { transform: translateY(0); opacity: 0.5; }
      100% { transform: translateY(-20px); opacity: 0; }
    }
  ` : '';

  // Zone marker Y positions
  const zoneMinY = mugBottom - (optimalZone[0] / 100) * mugHeight;
  const zoneMaxY = mugBottom - (optimalZone[1] / 100) * mugHeight;

  return (
    <div style={{
      width,
      height,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      boxShadow: isPulsing
        ? `0 0 16px 4px hsl(${state.hue}, ${state.sat}%, ${state.light}%)`
        : 'none',
      transition: 'box-shadow 300ms ease-out',
    }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg
        viewBox="0 0 200 340"
        width="100%"
        height="100%"
        style={{
          filter: state.isDanger
            ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))'
            : 'none',
          transition: 'filter 0.5s ease',
        }}
      >
        {/* Mug body */}
        <path
          d="M 50 55 L 42 285 Q 42 305, 60 305 L 140 305 Q 158 305, 150 285 L 142 55 Z"
          fill="hsl(30, 15%, 94%)"
          stroke="hsl(30, 20%, 78%)"
          strokeWidth="2.5"
        />
        {/* Mug rim */}
        <path d="M 47 55 L 145 55" stroke="hsl(30, 15%, 88%)" strokeWidth="6" strokeLinecap="round" />

        {/* Liquid clip */}
        <clipPath id={`meter-clip-${animId}`}>
          <path d="M 50 55 L 42 285 Q 42 305, 60 305 L 140 305 Q 158 305, 150 285 L 142 55 Z" />
        </clipPath>

        <g clipPath={`url(#meter-clip-${animId})`}>
          {/* Liquid fill */}
          <rect
            x="38" y={liquidTop} width="124" height={310 - liquidTop}
            fill={liquidColor}
            style={{ transition: 'y 0.6s ease, height 0.6s ease, fill 0.4s ease' }}
          />
          {/* Surface shine */}
          <ellipse cx="100" cy={liquidTop} rx="50" ry="4"
            fill={liquidDark} opacity="0.4"
            style={{ transition: 'cy 0.6s ease' }}
          />

          {/* Bubbles when high caffeine */}
          {state.isOverCaffeinated && isActive && (
            <>
              <circle cx="75" cy={liquidTop + 15} r="3" fill={liquidDark} opacity="0.4"
                style={{ animation: `bubble-cm-${animId} 0.7s infinite` }} />
              <circle cx="110" cy={liquidTop + 20} r="2.5" fill={liquidDark} opacity="0.3"
                style={{ animation: `bubble-cm-${animId} 0.9s infinite 0.2s` }} />
              <circle cx="130" cy={liquidTop + 10} r="2" fill={liquidDark} opacity="0.3"
                style={{ animation: `bubble-cm-${animId} 0.6s infinite 0.4s` }} />
            </>
          )}
        </g>

        {/* Optimal zone markers */}
        <line x1="38" y1={zoneMinY} x2="162" y2={zoneMinY}
          stroke="hsl(120, 60%, 50%)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"
          style={{ transition: 'y1 0.3s ease, y2 0.3s ease' }}
        />
        <line x1="38" y1={zoneMaxY} x2="162" y2={zoneMaxY}
          stroke="hsl(120, 60%, 50%)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"
          style={{ transition: 'y1 0.3s ease, y2 0.3s ease' }}
        />
        {/* Zone label */}
        {state.isOptimal && (
          <text x="165" y={(zoneMinY + zoneMaxY) / 2 + 4} fontSize="10" fontWeight="bold"
            textAnchor="middle" fill="hsl(120, 50%, 55%)">
            OPTIMAL
          </text>
        )}
        {state.isLow && (
          <text x="165" y={(zoneMinY + zoneMaxY) / 2 + 4} fontSize="10" fontWeight="bold"
            textAnchor="middle" fill="#60A5FA">
            LOW
          </text>
        )}
        {state.isHigh && (
          <text x="165" y={(zoneMinY + zoneMaxY) / 2 + 4} fontSize="10" fontWeight="bold"
            textAnchor="middle" fill="#F87171">
            HIGH
          </text>
        )}
        {state.isTripped && (
          <text x="165" y={(zoneMinY + zoneMaxY) / 2 + 4} fontSize="9" fontWeight="bold"
            textAnchor="middle" fill="#E879F9">
            TRIPPED
          </text>
        )}

        {/* Handle */}
        <path d="M 148 100 Q 195 100, 195 160 Q 195 220, 148 210"
          fill="none" stroke="hsl(30, 20%, 78%)" strokeWidth="14" strokeLinecap="round" />
        <path d="M 148 107 Q 187 107, 187 160 Q 187 213, 148 206"
          fill="none" stroke="hsl(30, 15%, 94%)" strokeWidth="8" strokeLinecap="round" />

        {/* Steam */}
        {state.steamOpacity > 0 && (
          <g opacity={state.steamOpacity} style={{ transition: 'opacity 0.4s ease' }}>
            <line x1="75" y1="45" x2="75" y2="15"
              stroke="rgba(180,180,180,0.5)" strokeWidth="3" strokeLinecap="round"
              style={{ animation: isActive ? `steam-cm-${animId} ${state.isOverCaffeinated ? '0.9s' : '2.5s'} infinite` : 'none' }} />
            <line x1="100" y1="42" x2="100" y2="8"
              stroke="rgba(180,180,180,0.4)" strokeWidth="3" strokeLinecap="round"
              style={{ animation: isActive ? `steam-cm-${animId} ${state.isOverCaffeinated ? '0.7s' : '3s'} infinite 0.3s` : 'none' }} />
            <line x1="125" y1="45" x2="125" y2="12"
              stroke="rgba(180,180,180,0.35)" strokeWidth="3" strokeLinecap="round"
              style={{ animation: isActive ? `steam-cm-${animId} ${state.isOverCaffeinated ? '0.8s' : '2.8s'} infinite 0.6s` : 'none' }} />
          </g>
        )}

        {/* Danger pulse overlay */}
        {state.isDanger && isActive && (
          <rect x="38" y="55" width="124" height="255" rx="8"
            fill="rgba(239, 68, 68, 0.15)"
            style={{ animation: `danger-pulse-${animId} 1s infinite` }}
          />
        )}

        {/* Level text */}
        <text x="100" y="325" textAnchor="middle" fontSize="16" fontWeight="bold"
          fill={state.isDanger ? '#EF4444' : state.isTripped ? '#E879F9' : state.isOptimal ? '#22C55E' : state.isLow ? '#60A5FA' : '#F87171'}>
          {level}%
        </text>
      </svg>
    </div>
  );
}
