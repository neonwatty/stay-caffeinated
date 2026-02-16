'use client';

import { useMemo } from 'react';

interface EspressoShotSVGProps {
  state: 'idle' | 'consumed' | 'cooldown';
  cooldownProgress?: number;
  size?: number;
  isActive?: boolean;
}

/**
 * Tiny espresso cup on saucer with thick crema layer, intense steam, saucer rattle.
 * States: idle (steaming/rattling), consumed (rapid tip), cooldown (matte, timer ring).
 */
export function EspressoShotSVG({
  state = 'idle',
  cooldownProgress = 0,
  size = 100,
  isActive = true,
}: EspressoShotSVGProps) {
  const animId = 'esp';

  const visual = useMemo(() => ({
    isIdle: state === 'idle',
    isConsumed: state === 'consumed',
    isCooldown: state === 'cooldown',
    opacity: state === 'cooldown' ? 0.4 : 1,
  }), [state]);

  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - cooldownProgress * ringCircumference;

  const keyframes = isActive ? `
    @keyframes esp-rattle-${animId} {
      0%, 100% { transform: translate(0, 0); }
      20% { transform: translate(0.8px, 0); }
      40% { transform: translate(-0.8px, 0); }
      60% { transform: translate(0.5px, 0); }
      80% { transform: translate(-0.5px, 0); }
    }
    @keyframes esp-steam-${animId} {
      0%, 100% { transform: translateY(0); opacity: 0.6; }
      50% { transform: translateY(-10px); opacity: 0.1; }
    }
    @keyframes esp-consume-${animId} {
      0% { transform: rotate(0deg); }
      20% { transform: rotate(-50deg); }
      40% { transform: rotate(-50deg); }
      100% { transform: rotate(0deg); }
    }
  ` : '';

  return (
    <div style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <g opacity={visual.opacity} style={{ transition: 'opacity 0.4s ease' }}>
          <g style={{
            transformOrigin: '50px 78px',
            animation: visual.isConsumed && isActive
              ? `esp-consume-${animId} 0.7s ease-in-out`
              : visual.isIdle && isActive
                ? `esp-rattle-${animId} 0.4s infinite`
                : 'none',
          }}>
            {/* Saucer */}
            <ellipse cx="50" cy="78" rx="32" ry="6" fill="#F0ECE4" stroke="#D8D0C4" strokeWidth="1.5" />

            {/* Cup body - small and wide */}
            <path d="M 30 50 L 28 72 Q 28 77, 34 77 L 66 77 Q 72 77, 70 72 L 68 50 Z"
              fill="#F0ECE4" stroke="#D8D0C4" strokeWidth="1.5" />

            {/* Espresso liquid */}
            <clipPath id="esp-clip">
              <path d="M 30 50 L 28 72 Q 28 77, 34 77 L 66 77 Q 72 77, 70 72 L 68 50 Z" />
            </clipPath>
            <g clipPath="url(#esp-clip)">
              <rect x="26" y="55" width="48" height="26" fill="#2C1810" />
              {/* Crema layer */}
              <rect x="26" y="53" width="48" height="6" fill="#C8963E" opacity="0.9" />
              <ellipse cx="50" cy="55" rx="18" ry="2" fill="#D4A44A" opacity="0.5" />
            </g>

            {/* Cup rim */}
            <path d="M 29 50 L 69 50" stroke="#E8E0D4" strokeWidth="3" strokeLinecap="round" />

            {/* Small handle */}
            <path d="M 69 54 Q 80 54, 80 63 Q 80 72, 69 70"
              fill="none" stroke="#D8D0C4" strokeWidth="3" strokeLinecap="round" />

            {/* Intense steam */}
            {visual.isIdle && (
              <g>
                <line x1="40" y1="44" x2="40" y2="28" stroke="rgba(200,150,62,0.4)" strokeWidth="2" strokeLinecap="round"
                  style={{ animation: isActive ? `esp-steam-${animId} 1.8s infinite` : 'none' }} />
                <line x1="50" y1="42" x2="50" y2="24" stroke="rgba(200,150,62,0.35)" strokeWidth="2.5" strokeLinecap="round"
                  style={{ animation: isActive ? `esp-steam-${animId} 2s infinite 0.2s` : 'none' }} />
                <line x1="60" y1="44" x2="60" y2="28" stroke="rgba(200,150,62,0.3)" strokeWidth="2" strokeLinecap="round"
                  style={{ animation: isActive ? `esp-steam-${animId} 1.6s infinite 0.4s` : 'none' }} />
              </g>
            )}
          </g>
        </g>

        {/* Cooldown ring */}
        {visual.isCooldown && cooldownProgress > 0 && (
          <circle cx="50" cy="50" r={ringRadius}
            fill="none" stroke="#1e293b" strokeWidth="3"
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
