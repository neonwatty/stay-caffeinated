'use client';

import { useMemo } from 'react';

interface EnergyDrinkCanSVGProps {
  state: 'idle' | 'consumed' | 'cooldown';
  cooldownProgress?: number;
  size?: number;
  isActive?: boolean;
}

/**
 * Tall slim energy drink can with lightning bolt logo, electric sparks.
 * States: idle (sparking/buzzing), consumed (crushes), cooldown (dark, timer ring).
 */
export function EnergyDrinkCanSVG({
  state = 'idle',
  cooldownProgress = 0,
  size = 100,
  isActive = true,
}: EnergyDrinkCanSVGProps) {
  const animId = 'ecan';

  const visual = useMemo(() => ({
    isIdle: state === 'idle',
    isConsumed: state === 'consumed',
    isCooldown: state === 'cooldown',
    opacity: state === 'cooldown' ? 0.35 : 1,
  }), [state]);

  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - cooldownProgress * ringCircumference;

  const keyframes = isActive ? `
    @keyframes ecan-buzz-${animId} {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(0.5px, -0.5px); }
      50% { transform: translate(-0.5px, 0.5px); }
      75% { transform: translate(0.5px, 0.5px); }
    }
    @keyframes ecan-spark-${animId} {
      0%, 100% { opacity: 0.8; r: 2; }
      50% { opacity: 0; r: 0.5; }
    }
    @keyframes ecan-crush-${animId} {
      0% { transform: scaleY(1) scaleX(1); }
      30% { transform: scaleY(0.5) scaleX(1.3); }
      50% { transform: scaleY(0.4) scaleX(1.4); }
      100% { transform: scaleY(1) scaleX(1); }
    }
  ` : '';

  return (
    <div style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <g opacity={visual.opacity} style={{ transition: 'opacity 0.4s ease' }}>
          <g style={{
            transformOrigin: '50px 82px',
            animation: visual.isConsumed && isActive
              ? `ecan-crush-${animId} 0.8s ease-in-out`
              : visual.isIdle && isActive
                ? `ecan-buzz-${animId} 0.15s infinite`
                : 'none',
          }}>
            {/* Can body */}
            <rect x="32" y="14" width="36" height="68" rx="4" fill="#1A1A2E" stroke="#333355" strokeWidth="1.5" />

            {/* Can top rim */}
            <rect x="34" y="14" width="32" height="6" rx="2" fill="#444466" />
            {/* Tab */}
            <ellipse cx="50" cy="16" rx="5" ry="2.5" fill="#666688" />

            {/* Can label area */}
            <rect x="34" y="28" width="32" height="40" fill="#0D0D1A" rx="2" />

            {/* Lightning bolt logo */}
            <path d="M 48 32 L 42 48 L 48 46 L 44 60 L 58 44 L 51 46 L 56 32 Z"
              fill="#22DD44" opacity="0.9" />

            {/* Neon accent lines */}
            <line x1="36" y1="34" x2="36" y2="62" stroke="#22DD44" strokeWidth="1" opacity="0.4" />
            <line x1="64" y1="34" x2="64" y2="62" stroke="#00BBFF" strokeWidth="1" opacity="0.4" />

            {/* Bottom rim */}
            <rect x="34" y="76" width="32" height="4" rx="2" fill="#444466" />
          </g>

          {/* Sparks (idle only) */}
          {visual.isIdle && isActive && (
            <g>
              <circle cx="28" cy="30" r="2" fill="#22DD44"
                style={{ animation: `ecan-spark-${animId} 0.6s infinite` }} />
              <circle cx="72" cy="45" r="1.5" fill="#00BBFF"
                style={{ animation: `ecan-spark-${animId} 0.8s infinite 0.2s` }} />
              <circle cx="26" cy="60" r="1.5" fill="#22DD44"
                style={{ animation: `ecan-spark-${animId} 0.5s infinite 0.4s` }} />
              <circle cx="74" cy="25" r="2" fill="#00BBFF"
                style={{ animation: `ecan-spark-${animId} 0.7s infinite 0.1s` }} />
            </g>
          )}
        </g>

        {/* Cooldown ring */}
        {visual.isCooldown && cooldownProgress > 0 && (
          <circle cx="50" cy="50" r={ringRadius}
            fill="none" stroke="#eab308" strokeWidth="3"
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringOffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            opacity="0.8"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        )}
      </svg>
    </div>
  );
}
