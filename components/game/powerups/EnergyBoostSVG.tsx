'use client';

import { useMemo } from 'react';

interface EnergyBoostSVGProps {
  state: 'available' | 'active' | 'used';
  size?: number;
  isActive?: boolean;
}

/**
 * Lightning bolt shape with electric crackling and rotating glow ring.
 */
export function EnergyBoostSVG({
  state = 'available',
  size = 80,
  isActive = true,
}: EnergyBoostSVGProps) {
  const animId = 'eboost';

  const visual = useMemo(() => ({
    isAvailable: state === 'available',
    isActiveState: state === 'active',
    isUsed: state === 'used',
    opacity: state === 'used' ? 0.3 : 1,
  }), [state]);

  const keyframes = isActive ? `
    @keyframes eboost-ring-${animId} {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes eboost-crackle-${animId} {
      0%, 100% { opacity: 0.7; }
      30% { opacity: 0; }
      60% { opacity: 0.9; }
    }
    @keyframes eboost-pulse-${animId} {
      0%, 100% { transform: scale(1); filter: brightness(1); }
      50% { transform: scale(1.08); filter: brightness(1.3); }
    }
  ` : '';

  return (
    <div style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        {/* Rotating glow ring */}
        {visual.isActiveState && isActive && (
          <circle cx="40" cy="40" r="34" fill="none"
            stroke="#FBBF24" strokeWidth="2" strokeDasharray="8 12"
            opacity="0.5"
            style={{
              transformOrigin: '40px 40px',
              animation: `eboost-ring-${animId} 2s linear infinite`,
            }}
          />
        )}

        <g opacity={visual.opacity} style={{
          transition: 'opacity 0.4s ease',
          transformOrigin: '40px 40px',
          animation: visual.isActiveState && isActive ? `eboost-pulse-${animId} 0.8s infinite` : 'none',
        }}>
          {/* Glow background */}
          <circle cx="40" cy="40" r="24" fill="#FBBF24" opacity="0.1" />

          {/* Lightning bolt */}
          <path d="M 42 8 L 26 38 L 36 36 L 30 72 L 56 36 L 44 38 L 52 8 Z"
            fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Inner highlight */}
          <path d="M 42 14 L 30 36 L 38 34 L 34 62 L 50 38 L 42 40 L 48 14 Z"
            fill="#FDE68A" opacity="0.5" />

          {/* Crackle sparks */}
          {(visual.isAvailable || visual.isActiveState) && isActive && (
            <g>
              <line x1="22" y1="28" x2="16" y2="22" stroke="#F59E0B" strokeWidth="1.5" opacity="0.5"
                style={{ animation: `eboost-crackle-${animId} 0.4s infinite` }} />
              <line x1="58" y1="50" x2="66" y2="54" stroke="#F59E0B" strokeWidth="1.5" opacity="0.4"
                style={{ animation: `eboost-crackle-${animId} 0.5s infinite 0.15s` }} />
              <line x1="24" y1="56" x2="18" y2="60" stroke="#F59E0B" strokeWidth="1" opacity="0.4"
                style={{ animation: `eboost-crackle-${animId} 0.45s infinite 0.3s` }} />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
