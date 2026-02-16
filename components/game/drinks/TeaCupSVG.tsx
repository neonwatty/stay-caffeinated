'use client';

import { useMemo } from 'react';

interface TeaCupSVGProps {
  state: 'idle' | 'consumed' | 'cooldown';
  cooldownProgress?: number; // 0-1
  size?: number;
  isActive?: boolean;
}

/**
 * Animated tea cup with saucer, gentle steam, swaying tea bag tag.
 * States: idle (steaming), consumed (tips back), cooldown (greyed, timer ring).
 */
export function TeaCupSVG({
  state = 'idle',
  cooldownProgress = 0,
  size = 100,
  isActive = true,
}: TeaCupSVGProps) {
  const animId = 'tea';

  const visual = useMemo(() => {
    const isIdle = state === 'idle';
    const isConsumed = state === 'consumed';
    const isCooldown = state === 'cooldown';
    const opacity = isCooldown ? 0.4 : 1;
    const tilt = isConsumed ? -30 : 0;
    return { isIdle, isConsumed, isCooldown, opacity, tilt };
  }, [state]);

  // Cooldown ring: SVG circle dash trick
  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - cooldownProgress * ringCircumference;

  const keyframes = isActive ? `
    @keyframes tea-steam-${animId} {
      0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
      50% { transform: translateY(-6px) translateX(2px); opacity: 0.1; }
    }
    @keyframes tea-tag-${animId} {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(8deg); }
    }
    @keyframes tea-consume-${animId} {
      0% { transform: rotate(0deg); }
      40% { transform: rotate(-35deg); }
      60% { transform: rotate(-35deg); }
      100% { transform: rotate(0deg); }
    }
  ` : '';

  return (
    <div style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <g opacity={visual.opacity} style={{ transition: 'opacity 0.4s ease' }}>
          {/* Consume animation wrapper */}
          <g style={{
            transformOrigin: '50px 75px',
            animation: visual.isConsumed && isActive ? `tea-consume-${animId} 1.2s ease-in-out` : 'none',
          }}>
            {/* Saucer */}
            <ellipse cx="50" cy="78" rx="35" ry="7" fill="#E8DDD0" stroke="#D4C4B0" strokeWidth="1.5" />

            {/* Cup body */}
            <path d="M 28 40 L 25 72 Q 25 78, 32 78 L 68 78 Q 75 78, 72 72 L 69 40 Z"
              fill="#F5F0E8" stroke="#D4C4B0" strokeWidth="1.5" />

            {/* Tea liquid */}
            <clipPath id="tea-clip">
              <path d="M 28 40 L 25 72 Q 25 78, 32 78 L 68 78 Q 75 78, 72 72 L 69 40 Z" />
            </clipPath>
            <g clipPath="url(#tea-clip)">
              <rect x="22" y="48" width="56" height="34" fill="#A8D5A2" opacity="0.7" />
              <ellipse cx="50" cy="48" rx="24" ry="3" fill="#8BC48A" opacity="0.4" />
            </g>

            {/* Cup rim */}
            <path d="M 27 40 L 70 40" stroke="#E8DDD0" strokeWidth="3" strokeLinecap="round" />

            {/* Handle */}
            <path d="M 70 48 Q 84 48, 84 60 Q 84 72, 70 68"
              fill="none" stroke="#D4C4B0" strokeWidth="3.5" strokeLinecap="round" />

            {/* Tea bag string */}
            <line x1="62" y1="40" x2="72" y2="30" stroke="#B8A88A" strokeWidth="1" />
            {/* Tea bag tag */}
            <g style={{
              transformOrigin: '72px 28px',
              animation: visual.isIdle && isActive ? `tea-tag-${animId} 3s ease-in-out infinite` : 'none',
            }}>
              <rect x="69" y="24" width="10" height="8" rx="1" fill="#DDD4C0" stroke="#C4B8A0" strokeWidth="0.8" />
            </g>

            {/* Steam (idle only) */}
            {visual.isIdle && (
              <g>
                <line x1="40" y1="35" x2="40" y2="22" stroke="rgba(160,213,162,0.4)" strokeWidth="2" strokeLinecap="round"
                  style={{ animation: isActive ? `tea-steam-${animId} 3s infinite` : 'none' }} />
                <line x1="50" y1="33" x2="50" y2="18" stroke="rgba(160,213,162,0.3)" strokeWidth="2" strokeLinecap="round"
                  style={{ animation: isActive ? `tea-steam-${animId} 3.5s infinite 0.4s` : 'none' }} />
              </g>
            )}
          </g>
        </g>

        {/* Cooldown ring */}
        {visual.isCooldown && cooldownProgress > 0 && (
          <circle cx="50" cy="50" r={ringRadius}
            fill="none" stroke="#10b981" strokeWidth="3"
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
