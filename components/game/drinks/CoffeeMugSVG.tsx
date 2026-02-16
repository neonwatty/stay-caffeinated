'use client';

import { useMemo } from 'react';

interface CoffeeMugSVGProps {
  state: 'idle' | 'consumed' | 'cooldown';
  cooldownProgress?: number;
  size?: number;
  isActive?: boolean;
}

/**
 * Classic coffee mug with rich brown liquid, 2-3 steam wisps, liquid shimmer.
 * States: idle (steaming), consumed (tilts/splashes), cooldown (dimmed, timer ring).
 */
export function CoffeeMugSVG({
  state = 'idle',
  cooldownProgress = 0,
  size = 100,
  isActive = true,
}: CoffeeMugSVGProps) {
  const animId = 'cmug';

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
    @keyframes cmug-steam-${animId} {
      0%, 100% { transform: translateY(0) translateX(0); opacity: 0.5; }
      50% { transform: translateY(-8px) translateX(2px); opacity: 0.15; }
    }
    @keyframes cmug-consume-${animId} {
      0% { transform: rotate(0deg); }
      35% { transform: rotate(-40deg); }
      55% { transform: rotate(-40deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes cmug-shimmer-${animId} {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 0.5; }
    }
  ` : '';

  return (
    <div style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <g opacity={visual.opacity} style={{ transition: 'opacity 0.4s ease' }}>
          <g style={{
            transformOrigin: '45px 80px',
            animation: visual.isConsumed && isActive ? `cmug-consume-${animId} 1s ease-in-out` : 'none',
          }}>
            {/* Mug body */}
            <path d="M 22 30 L 19 75 Q 19 82, 27 82 L 63 82 Q 71 82, 68 75 L 65 30 Z"
              fill="#F5F0E8" stroke="#C4A882" strokeWidth="2" />

            {/* Coffee liquid */}
            <clipPath id="cmug-clip">
              <path d="M 22 30 L 19 75 Q 19 82, 27 82 L 63 82 Q 71 82, 68 75 L 65 30 Z" />
            </clipPath>
            <g clipPath="url(#cmug-clip)">
              <rect x="16" y="38" width="58" height="48" fill="#6B3E26" />
              <ellipse cx="44" cy="38" rx="26" ry="4" fill="#8B5E3C" opacity="0.6" />
              {/* Shimmer */}
              <ellipse cx="38" cy="40" rx="10" ry="2" fill="#A0724E" opacity="0.3"
                style={{ animation: visual.isIdle && isActive ? `cmug-shimmer-${animId} 3s infinite` : 'none' }} />
            </g>

            {/* Mug rim */}
            <path d="M 20 30 L 67 30" stroke="#E0D5C8" strokeWidth="4" strokeLinecap="round" />

            {/* Handle */}
            <path d="M 66 40 Q 84 40, 84 56 Q 84 72, 66 68"
              fill="none" stroke="#C4A882" strokeWidth="5" strokeLinecap="round" />
            <path d="M 66 44 Q 80 44, 80 56 Q 80 68, 66 65"
              fill="none" stroke="#F5F0E8" strokeWidth="3" strokeLinecap="round" />

            {/* Steam */}
            {visual.isIdle && (
              <g>
                <line x1="32" y1="24" x2="32" y2="10" stroke="rgba(180,160,140,0.4)" strokeWidth="2.5" strokeLinecap="round"
                  style={{ animation: isActive ? `cmug-steam-${animId} 2.5s infinite` : 'none' }} />
                <line x1="44" y1="22" x2="44" y2="6" stroke="rgba(180,160,140,0.35)" strokeWidth="2.5" strokeLinecap="round"
                  style={{ animation: isActive ? `cmug-steam-${animId} 3s infinite 0.3s` : 'none' }} />
                <line x1="56" y1="24" x2="56" y2="10" stroke="rgba(180,160,140,0.3)" strokeWidth="2.5" strokeLinecap="round"
                  style={{ animation: isActive ? `cmug-steam-${animId} 2.8s infinite 0.6s` : 'none' }} />
              </g>
            )}
          </g>
        </g>

        {/* Cooldown ring */}
        {visual.isCooldown && cooldownProgress > 0 && (
          <circle cx="50" cy="50" r={ringRadius}
            fill="none" stroke="#8b4513" strokeWidth="3"
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
