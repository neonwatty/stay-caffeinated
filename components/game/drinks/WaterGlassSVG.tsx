'use client';

import { useMemo } from 'react';

interface WaterGlassSVGProps {
  state: 'idle' | 'consumed' | 'cooldown';
  cooldownProgress?: number;
  size?: number;
  isActive?: boolean;
}

/**
 * Clear water glass with visible water level, rising bubbles, condensation, ice cubes.
 * States: idle (bubbling), consumed (tilts/pours), cooldown (faded, timer ring).
 */
export function WaterGlassSVG({
  state = 'idle',
  cooldownProgress = 0,
  size = 100,
  isActive = true,
}: WaterGlassSVGProps) {
  const animId = 'wtr';

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
    @keyframes wtr-bubble-${animId} {
      0% { transform: translateY(0); opacity: 0.5; }
      100% { transform: translateY(-25px); opacity: 0; }
    }
    @keyframes wtr-consume-${animId} {
      0% { transform: rotate(0deg); }
      35% { transform: rotate(-45deg); }
      60% { transform: rotate(-45deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes wtr-condense-${animId} {
      0%, 100% { opacity: 0.3; transform: translateY(0); }
      50% { opacity: 0.6; transform: translateY(1px); }
    }
  ` : '';

  return (
    <div style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <g opacity={visual.opacity} style={{ transition: 'opacity 0.4s ease' }}>
          <g style={{
            transformOrigin: '50px 85px',
            animation: visual.isConsumed && isActive ? `wtr-consume-${animId} 1.2s ease-in-out` : 'none',
          }}>
            {/* Glass body - tapers slightly */}
            <path d="M 30 18 L 26 80 Q 26 85, 32 85 L 68 85 Q 74 85, 70 80 L 66 18 Z"
              fill="rgba(200, 225, 255, 0.15)" stroke="rgba(180, 210, 240, 0.5)" strokeWidth="1.5" />

            {/* Water */}
            <clipPath id="wtr-clip">
              <path d="M 30 18 L 26 80 Q 26 85, 32 85 L 68 85 Q 74 85, 70 80 L 66 18 Z" />
            </clipPath>
            <g clipPath="url(#wtr-clip)">
              <rect x="24" y="34" width="52" height="54" fill="rgba(96, 165, 250, 0.35)" />
              <ellipse cx="48" cy="34" rx="24" ry="3" fill="rgba(147, 197, 253, 0.3)" />

              {/* Ice cubes */}
              <rect x="36" y="40" width="10" height="8" rx="2" fill="rgba(220, 235, 255, 0.5)" stroke="rgba(180, 210, 240, 0.4)" strokeWidth="0.8" />
              <rect x="52" y="46" width="9" height="7" rx="2" fill="rgba(220, 235, 255, 0.45)" stroke="rgba(180, 210, 240, 0.4)" strokeWidth="0.8" transform="rotate(12 56 49)" />

              {/* Bubbles */}
              {visual.isIdle && isActive && (
                <>
                  <circle cx="40" cy="65" r="1.5" fill="rgba(200, 225, 255, 0.5)"
                    style={{ animation: `wtr-bubble-${animId} 2s infinite` }} />
                  <circle cx="55" cy="70" r="1" fill="rgba(200, 225, 255, 0.4)"
                    style={{ animation: `wtr-bubble-${animId} 2.5s infinite 0.5s` }} />
                  <circle cx="46" cy="72" r="1.2" fill="rgba(200, 225, 255, 0.4)"
                    style={{ animation: `wtr-bubble-${animId} 1.8s infinite 1s` }} />
                </>
              )}
            </g>

            {/* Glass rim highlight */}
            <path d="M 30 18 L 66 18" stroke="rgba(220, 235, 255, 0.6)" strokeWidth="2" strokeLinecap="round" />

            {/* Glass shine */}
            <line x1="33" y1="24" x2="30" y2="70" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

            {/* Condensation droplets */}
            {visual.isIdle && (
              <g>
                <circle cx="28" cy="50" r="1.5" fill="rgba(147, 197, 253, 0.4)"
                  style={{ animation: isActive ? `wtr-condense-${animId} 4s infinite` : 'none' }} />
                <circle cx="27" cy="62" r="1.2" fill="rgba(147, 197, 253, 0.35)"
                  style={{ animation: isActive ? `wtr-condense-${animId} 5s infinite 1s` : 'none' }} />
                <circle cx="69" cy="55" r="1.3" fill="rgba(147, 197, 253, 0.35)"
                  style={{ animation: isActive ? `wtr-condense-${animId} 4.5s infinite 2s` : 'none' }} />
              </g>
            )}
          </g>
        </g>

        {/* Cooldown ring */}
        {visual.isCooldown && cooldownProgress > 0 && (
          <circle cx="50" cy="50" r={ringRadius}
            fill="none" stroke="#3b82f6" strokeWidth="3"
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
