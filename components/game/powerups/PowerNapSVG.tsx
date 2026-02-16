'use client';

import { useMemo } from 'react';

interface PowerNapSVGProps {
  state: 'available' | 'active' | 'used';
  size?: number;
  isActive?: boolean;
}

/**
 * Small pillow with Zzz floating above, moon/stars twinkle.
 */
export function PowerNapSVG({
  state = 'available',
  size = 80,
  isActive = true,
}: PowerNapSVGProps) {
  const animId = 'pnap';

  const visual = useMemo(() => ({
    isAvailable: state === 'available',
    isActiveState: state === 'active',
    isUsed: state === 'used',
    opacity: state === 'used' ? 0.3 : 1,
  }), [state]);

  const keyframes = isActive ? `
    @keyframes pnap-zzz-${animId} {
      0%, 100% { transform: translateY(0); opacity: 0.7; }
      50% { transform: translateY(-10px); opacity: 0.2; }
    }
    @keyframes pnap-star-${animId} {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
    @keyframes pnap-pulse-${animId} {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.03); }
    }
  ` : '';

  return (
    <div style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <g opacity={visual.opacity} style={{
          transition: 'opacity 0.4s ease',
          transformOrigin: '40px 50px',
          animation: visual.isActiveState && isActive ? `pnap-pulse-${animId} 2s infinite` : 'none',
        }}>
          {/* Pillow */}
          <path d="M 14 44 Q 14 38, 22 36 L 58 36 Q 66 38, 66 44 L 68 58 Q 68 66, 58 66 L 22 66 Q 12 66, 12 58 Z"
            fill="#8B7EC8" stroke="#6B5EAE" strokeWidth="1.5" />
          {/* Pillow puff top */}
          <path d="M 22 36 Q 40 28, 58 36" fill="none" stroke="#A090D8" strokeWidth="1" opacity="0.5" />
          {/* Pillow stitch line */}
          <line x1="40" y1="38" x2="40" y2="64" stroke="#7B6EB8" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          {/* Pillow shine */}
          <ellipse cx="32" cy="48" rx="8" ry="4" fill="#A090D8" opacity="0.3" />

          {/* Moon */}
          <circle cx="56" cy="18" r="8" fill="#FDE68A" />
          <circle cx="60" cy="15" r="7" fill="#1A1A2E" />

          {/* Stars */}
          <g>
            <circle cx="22" cy="14" r="1.5" fill="#FDE68A"
              style={{ animation: isActive ? `pnap-star-${animId} 2s infinite` : 'none' }} />
            <circle cx="36" cy="8" r="1" fill="#FDE68A"
              style={{ animation: isActive ? `pnap-star-${animId} 2.5s infinite 0.5s` : 'none' }} />
            <circle cx="14" cy="24" r="1" fill="#FDE68A"
              style={{ animation: isActive ? `pnap-star-${animId} 3s infinite 1s` : 'none' }} />
          </g>

          {/* Zzz */}
          <g>
            <g style={{ animation: isActive ? `pnap-zzz-${animId} 2s infinite` : 'none' }}>
              <path d="M 44 28 L 52 28 L 44 20 L 52 20" stroke="#A090D8" strokeWidth="2" fill="none" opacity="0.6" />
            </g>
            <g style={{ animation: isActive ? `pnap-zzz-${animId} 2.5s infinite 0.3s` : 'none' }}>
              <path d="M 56 22 L 62 22 L 56 16 L 62 16" stroke="#A090D8" strokeWidth="1.5" fill="none" opacity="0.4" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
