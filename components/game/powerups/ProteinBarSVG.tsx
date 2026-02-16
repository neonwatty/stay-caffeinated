'use client';

import { useMemo } from 'react';

interface ProteinBarSVGProps {
  state: 'available' | 'active' | 'used';
  size?: number;
  isActive?: boolean;
}

/**
 * Wrapped protein bar with bite marks, energy glow, pulsing aura.
 */
export function ProteinBarSVG({
  state = 'available',
  size = 80,
  isActive = true,
}: ProteinBarSVGProps) {
  const animId = 'pbar';

  const visual = useMemo(() => ({
    isAvailable: state === 'available',
    isActiveState: state === 'active',
    isUsed: state === 'used',
    opacity: state === 'used' ? 0.3 : 1,
  }), [state]);

  const keyframes = isActive ? `
    @keyframes pbar-glow-${animId} {
      0%, 100% { opacity: 0.2; r: 38; }
      50% { opacity: 0.5; r: 42; }
    }
    @keyframes pbar-pulse-${animId} {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  ` : '';

  return (
    <div style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        {/* Active glow */}
        {visual.isActiveState && isActive && (
          <circle cx="40" cy="40" r="38" fill="none" stroke="#22C55E" strokeWidth="2" opacity="0.3"
            style={{ animation: `pbar-glow-${animId} 1.5s infinite` }} />
        )}

        <g opacity={visual.opacity} style={{
          transition: 'opacity 0.4s ease',
          transformOrigin: '40px 40px',
          animation: visual.isActiveState && isActive ? `pbar-pulse-${animId} 1s infinite` : 'none',
        }}>
          {/* Wrapper */}
          <rect x="12" y="28" width="56" height="24" rx="4" fill="#C4963A" stroke="#A07830" strokeWidth="1.5" />

          {/* Wrapper fold lines */}
          <line x1="20" y1="28" x2="20" y2="52" stroke="#B08630" strokeWidth="1" opacity="0.5" />
          <line x1="60" y1="28" x2="60" y2="52" stroke="#B08630" strokeWidth="1" opacity="0.5" />

          {/* Wrapper label */}
          <rect x="22" y="32" width="36" height="16" rx="2" fill="#8B6914" opacity="0.4" />
          <text x="40" y="44" textAnchor="middle" fontSize="7" fill="#FFE0A0" fontWeight="bold">PROTEIN</text>

          {/* Bite marks (right side) */}
          <circle cx="66" cy="34" r="3" fill="#1A1A2E" />
          <circle cx="67" cy="42" r="2.5" fill="#1A1A2E" />

          {/* Energy sparkles when active */}
          {visual.isActiveState && isActive && (
            <>
              <circle cx="10" cy="30" r="2" fill="#22C55E" opacity="0.6" />
              <circle cx="70" cy="26" r="1.5" fill="#22C55E" opacity="0.5" />
              <circle cx="14" cy="52" r="1.5" fill="#22C55E" opacity="0.4" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
