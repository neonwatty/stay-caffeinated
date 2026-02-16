'use client';

import { useMemo } from 'react';

interface HealthBarSVGProps {
  healthLevel: number;     // 0-100
  caffeineLevel: number;   // drives pulse rate
  isCritical?: boolean;    // below 20%
  width?: number;
  height?: number;
  isActive?: boolean;
}

/**
 * ECG/heartbeat-style health indicator SVG.
 * Uses CSS animations to avoid React hydration mismatches.
 *
 * - Heart-rate monitor line that pulses across the bar
 * - Pulse rate tied to caffeine level (slow when sleepy, frantic when wired)
 * - Bar fill gradient: red (low) → green (full)
 * - Heart icon beats in sync with ECG line
 * - Critical state: bar flashes red with faster pulse
 */
export function HealthBarSVG({
  healthLevel,
  caffeineLevel,
  isCritical,
  width = 280,
  height = 80,
  isActive = true,
}: HealthBarSVGProps) {
  const health = Math.round(Math.max(0, Math.min(100, healthLevel)));
  const caffeine = Math.max(0, Math.min(100, caffeineLevel));
  const critical = isCritical ?? health < 20;

  const state = useMemo(() => {
    const t = health / 100;
    // Color: red -> amber -> green
    let hue: number;
    if (t < 0.3) {
      hue = 0; // red
    } else if (t < 0.6) {
      hue = ((t - 0.3) / 0.3) * 60; // red -> amber/yellow
    } else {
      hue = 60 + ((t - 0.6) / 0.4) * 60; // amber -> green
    }
    const sat = 65;
    const light = 45;

    // Pulse speed: caffeine drives ECG speed
    const ct = caffeine / 100;
    const pulseDuration = ct < 0.3 ? 2.5 : ct > 0.7 ? 0.6 : 1.4;

    return { hue, sat, light, pulseDuration, t };
  }, [health, caffeine]);

  const animId = `hb${health}`;
  const barColor = `hsl(${state.hue}, ${state.sat}%, ${state.light}%)`;
  const barColorLight = `hsl(${state.hue}, ${state.sat}%, ${state.light + 15}%)`;
  const barWidth = (health / 100) * 220; // 220px available bar width

  // ECG path: a heartbeat spike pattern
  // This pattern repeats and scrolls across the bar
  const ecgY = 25; // center of ECG area
  const ecgPath = `M 0 ${ecgY} L 8 ${ecgY} L 12 ${ecgY - 3} L 16 ${ecgY} L 22 ${ecgY} L 26 ${ecgY - 14} L 30 ${ecgY + 10} L 34 ${ecgY - 4} L 38 ${ecgY} L 50 ${ecgY}`;

  const keyframes = isActive ? `
    @keyframes ecg-scroll-${animId} {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50px); }
    }
    @keyframes heartbeat-${animId} {
      0%, 100% { transform: scale(1); }
      15% { transform: scale(1.25); }
      30% { transform: scale(1); }
      45% { transform: scale(1.15); }
      60% { transform: scale(1); }
    }
    @keyframes critical-flash-${animId} {
      0%, 100% { opacity: 0; }
      50% { opacity: 0.3; }
    }
    @keyframes bar-pulse-${animId} {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.3); }
    }
  ` : '';

  return (
    <div style={{ width, height, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg viewBox="0 0 300 80" width="100%" height="100%">
        {/* Background bar track */}
        <rect x="45" y="42" width="225" height="22" rx="11"
          fill="hsl(0, 0%, 20%)" stroke="hsl(0, 0%, 30%)" strokeWidth="1" />

        {/* Health fill */}
        <rect x="47" y="44" width={Math.max(0, barWidth)} height="18" rx="9"
          fill={barColor}
          style={{
            transition: 'width 0.6s ease, fill 0.4s ease',
            animation: isActive && critical ? `bar-pulse-${animId} 0.5s infinite` : 'none',
          }}
        />
        {/* Fill shine */}
        <rect x="47" y="44" width={Math.max(0, barWidth)} height="9" rx="9"
          fill={barColorLight} opacity="0.3"
          style={{ transition: 'width 0.6s ease' }}
        />

        {/* Segment marks */}
        {[20, 40, 60, 80].map((pct) => (
          <line key={pct}
            x1={47 + (pct / 100) * 220} y1="42"
            x2={47 + (pct / 100) * 220} y2="64"
            stroke="hsl(0, 0%, 15%)" strokeWidth="1" opacity="0.5"
          />
        ))}

        {/* Critical flash overlay */}
        {critical && isActive && (
          <rect x="45" y="42" width="225" height="22" rx="11"
            fill="rgba(239, 68, 68, 0.4)"
            style={{ animation: `critical-flash-${animId} 0.8s infinite` }}
          />
        )}

        {/* ECG line area */}
        <clipPath id={`ecg-clip-${animId}`}>
          <rect x="45" y="2" width="225" height="38" />
        </clipPath>

        <g clipPath={`url(#ecg-clip-${animId})`}>
          {/* Repeating ECG pattern */}
          <g style={{
            animation: isActive ? `ecg-scroll-${animId} ${state.pulseDuration}s linear infinite` : 'none',
          }}>
            {[0, 50, 100, 150, 200, 250, 300].map((offset) => (
              <path key={offset}
                d={ecgPath}
                fill="none"
                stroke={critical ? '#EF4444' : barColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform={`translate(${45 + offset}, 0)`}
                opacity="0.8"
                style={{ transition: 'stroke 0.4s ease' }}
              />
            ))}
          </g>
        </g>

        {/* Heart icon */}
        <g transform="translate(10, 38)" style={{
          transformOrigin: '22px 50px',
          animation: isActive ? `heartbeat-${animId} ${state.pulseDuration}s infinite` : 'none',
        }}>
          <path
            d="M 12 21.593 C 5.017 15.056 0 11.27 0 6.5 C 0 2.91 2.735 0 6.5 0 C 8.526 0 10.51 0.91 12 2.367 C 13.49 0.91 15.474 0 17.5 0 C 21.265 0 24 2.91 24 6.5 C 24 11.27 18.983 15.056 12 21.593 Z"
            fill={critical ? '#EF4444' : '#F87171'}
            style={{ transition: 'fill 0.3s ease' }}
          />
        </g>

        {/* Health text */}
        <text x="280" y="58" textAnchor="end" fontSize="14" fontWeight="bold"
          fill={critical ? '#EF4444' : barColor}
          style={{ transition: 'fill 0.3s ease' }}>
          {health}%
        </text>
      </svg>
    </div>
  );
}
