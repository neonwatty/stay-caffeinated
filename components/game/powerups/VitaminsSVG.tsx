'use client';

import { useMemo } from 'react';

interface VitaminsSVGProps {
  state: 'available' | 'active' | 'used';
  size?: number;
  isActive?: boolean;
}

/**
 * Pill capsule (half red, half white), spinning slowly, small plus signs floating.
 */
export function VitaminsSVG({
  state = 'available',
  size = 80,
  isActive = true,
}: VitaminsSVGProps) {
  const animId = 'vit';

  const visual = useMemo(() => ({
    isAvailable: state === 'available',
    isActiveState: state === 'active',
    isUsed: state === 'used',
    opacity: state === 'used' ? 0.3 : 1,
  }), [state]);

  const keyframes = isActive ? `
    @keyframes vit-spin-${animId} {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes vit-plus-${animId} {
      0%, 100% { transform: translateY(0); opacity: 0.6; }
      50% { transform: translateY(-6px); opacity: 0.2; }
    }
    @keyframes vit-glow-${animId} {
      0%, 100% { opacity: 0.15; }
      50% { opacity: 0.4; }
    }
  ` : '';

  return (
    <div style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        {/* Active glow */}
        {visual.isActiveState && isActive && (
          <circle cx="40" cy="40" r="36" fill="rgba(34, 197, 94, 0.1)"
            style={{ animation: `vit-glow-${animId} 1.5s infinite` }} />
        )}

        <g opacity={visual.opacity} style={{
          transition: 'opacity 0.4s ease',
          transformOrigin: '40px 40px',
          animation: visual.isAvailable && isActive ? `vit-spin-${animId} 8s linear infinite` : 'none',
        }}>
          {/* Capsule - left half (red) */}
          <path d="M 28 30 Q 28 20, 40 20 L 40 60 Q 28 60, 28 50 Z" fill="#DC2626" />
          {/* Capsule - right half (white) */}
          <path d="M 40 20 Q 52 20, 52 30 L 52 50 Q 52 60, 40 60 Z" fill="#F5F5F5" />
          {/* Capsule outline */}
          <rect x="28" y="20" width="24" height="40" rx="12" fill="none" stroke="#B91C1C" strokeWidth="1.5" />
          {/* Center line */}
          <line x1="28" y1="40" x2="52" y2="40" stroke="#B91C1C" strokeWidth="1" opacity="0.5" />
          {/* Shine */}
          <ellipse cx="36" cy="30" rx="3" ry="6" fill="white" opacity="0.3" />
        </g>

        {/* Plus signs floating */}
        {(visual.isAvailable || visual.isActiveState) && isActive && (
          <g>
            <text x="18" y="26" fontSize="10" fill="#22C55E" fontWeight="bold" opacity="0.5"
              style={{ animation: `vit-plus-${animId} 2.5s infinite` }}>+</text>
            <text x="60" y="34" fontSize="8" fill="#22C55E" fontWeight="bold" opacity="0.4"
              style={{ animation: `vit-plus-${animId} 3s infinite 0.5s` }}>+</text>
            <text x="22" y="64" fontSize="9" fill="#22C55E" fontWeight="bold" opacity="0.4"
              style={{ animation: `vit-plus-${animId} 2.8s infinite 1s` }}>+</text>
          </g>
        )}
      </svg>
    </div>
  );
}
