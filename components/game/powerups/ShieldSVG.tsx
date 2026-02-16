'use client';

import { useMemo } from 'react';

interface ShieldSVGProps {
  state: 'available' | 'active' | 'used';
  size?: number;
  isActive?: boolean;
}

/**
 * Transparent bubble/shield dome with hexagonal pattern and shimmer.
 */
export function ShieldSVG({
  state = 'available',
  size = 80,
  isActive = true,
}: ShieldSVGProps) {
  const animId = 'shld';

  const visual = useMemo(() => ({
    isAvailable: state === 'available',
    isActiveState: state === 'active',
    isUsed: state === 'used',
    opacity: state === 'used' ? 0.3 : 1,
  }), [state]);

  const keyframes = isActive ? `
    @keyframes shld-shimmer-${animId} {
      0% { transform: translateX(-30px); opacity: 0; }
      50% { opacity: 0.6; }
      100% { transform: translateX(30px); opacity: 0; }
    }
    @keyframes shld-pulse-${animId} {
      0%, 100% { stroke-opacity: 0.3; }
      50% { stroke-opacity: 0.7; }
    }
    @keyframes shld-float-${animId} {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
  ` : '';

  return (
    <div style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <g opacity={visual.opacity} style={{
          transition: 'opacity 0.4s ease',
          transformOrigin: '40px 40px',
          animation: visual.isAvailable && isActive ? `shld-float-${animId} 3s ease-in-out infinite` : 'none',
        }}>
          {/* Shield dome */}
          <path d="M 40 8 L 66 22 L 66 48 Q 66 68, 40 74 Q 14 68, 14 48 L 14 22 Z"
            fill="rgba(96, 165, 250, 0.12)"
            stroke="rgba(96, 165, 250, 0.5)"
            strokeWidth="2"
            style={{ animation: visual.isActiveState && isActive ? `shld-pulse-${animId} 1.5s infinite` : 'none' }}
          />

          {/* Inner shield */}
          <path d="M 40 14 L 60 26 L 60 46 Q 60 62, 40 68 Q 20 62, 20 46 L 20 26 Z"
            fill="rgba(96, 165, 250, 0.08)"
            stroke="rgba(147, 197, 253, 0.3)"
            strokeWidth="1"
          />

          {/* Hexagonal pattern */}
          <g stroke="rgba(147, 197, 253, 0.2)" strokeWidth="0.8" fill="none">
            <path d="M 30 30 L 38 26 L 46 30 L 46 38 L 38 42 L 30 38 Z" />
            <path d="M 34 42 L 42 38 L 50 42 L 50 50 L 42 54 L 34 50 Z" />
            <path d="M 42 26 L 50 22 L 58 26 L 58 34 L 50 38 L 42 34 Z" />
          </g>

          {/* Shimmer line */}
          <clipPath id="shld-clip">
            <path d="M 40 8 L 66 22 L 66 48 Q 66 68, 40 74 Q 14 68, 14 48 L 14 22 Z" />
          </clipPath>
          {visual.isActiveState && isActive && (
            <rect x="10" y="10" width="12" height="60" fill="rgba(255,255,255,0.3)" rx="6"
              clipPath="url(#shld-clip)"
              style={{ animation: `shld-shimmer-${animId} 2s infinite` }}
            />
          )}

          {/* Center star highlight */}
          <circle cx="40" cy="40" r="3" fill="rgba(147, 197, 253, 0.4)" />
        </g>
      </svg>
    </div>
  );
}
