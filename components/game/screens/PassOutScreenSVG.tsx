'use client';

import { useMemo } from 'react';

interface PassOutScreenSVGProps {
  score: number;
  width?: number;
  height?: number;
  isActive?: boolean;
}

/**
 * "You Fell Asleep" game-over screen.
 * Animation: eyes close, body tilts, coffee spills, Zzz float, screen dims to blue.
 * 3-4 second sequence. Deep blue/purple/grey night palette.
 */
export function PassOutScreenSVG({
  score,
  width = 500,
  height = 500,
  isActive = true,
}: PassOutScreenSVGProps) {
  const animId = 'po';

  // Snore wave positions
  const snoreWaves = useMemo(() =>
    [0, 1, 2].map(i => ({
      x: 285 + i * 5,
      y: 265 + i * 2,
      delay: i * 0.3,
    })),
  []);

  const keyframes_css = isActive ? `
    @keyframes poOverlay-${animId} {
      0% { opacity: 0; }
      50% { opacity: 0.3; }
      100% { opacity: 0.8; }
    }
    @keyframes poEyeClose-${animId} {
      0% { ry: 14; }
      100% { ry: 2; }
    }
    @keyframes poTilt-${animId} {
      0% { transform: rotate(0deg) translateY(0); }
      40% { transform: rotate(0deg) translateY(0); }
      100% { transform: rotate(25deg) translateY(20px); }
    }
    @keyframes poPuddle-${animId} {
      0% { rx: 0; ry: 0; opacity: 0; }
      30% { rx: 0; ry: 0; opacity: 0; }
      100% { rx: 80; ry: 20; opacity: 0.7; }
    }
    @keyframes poDrip-${animId} {
      0% { transform: translateY(0); opacity: 0; }
      20% { opacity: 0.8; }
      100% { transform: translateY(60px); opacity: 0; }
    }
    @keyframes poZzz-${animId} {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: 0.8; }
      100% { transform: translateY(-60px) translateX(20px); opacity: 0; }
    }
    @keyframes poTextType-${animId} {
      0% { opacity: 0; letter-spacing: 8px; }
      100% { opacity: 1; letter-spacing: 0; }
    }
    @keyframes poScoreFade-${animId} {
      0% { transform: translateY(20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes poStarTwinkle-${animId} {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 0.15; }
    }
    @keyframes poSnore-${animId} {
      0%, 100% { transform: scaleX(1); opacity: 0.4; }
      50% { transform: scaleX(1.3); opacity: 0.7; }
    }
    @keyframes poYawnOpen-${animId} {
      0% { ry: 0; }
      40% { ry: 12; }
      100% { ry: 8; }
    }
    @keyframes poMoonGlow-${animId} {
      0%, 100% { opacity: 0.1; }
      50% { opacity: 0.2; }
    }
  ` : '';

  // Stars for night sky
  const stars = useMemo(() => {
    const s = [];
    for (let i = 0; i < 20; i++) {
      const seed = (i + 1) * 137.508;
      s.push({
        x: 20 + ((seed * 3.7) % 460),
        y: 15 + ((seed * 2.3) % 150),
        r: 0.8 + (i % 3) * 0.5,
        delay: (i * 0.2) % 3,
      });
    }
    return s;
  }, []);

  return (
    <div style={{ width, height, display: 'inline-flex' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes_css }} />}
      <svg viewBox="0 0 500 500" width="100%" height="100%">
        {/* Dark blue overlay */}
        <rect width="500" height="500" fill="hsl(230, 50%, 10%)"
          style={{
            animation: isActive ? `poOverlay-${animId} 3s ease-out forwards` : 'none',
          }} />

        {/* Night sky gradient */}
        <defs>
          <linearGradient id={`poSky-${animId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(240, 50%, 12%)" />
            <stop offset="100%" stopColor="hsl(250, 40%, 20%)" />
          </linearGradient>
        </defs>
        <rect width="500" height="250" fill={`url(#poSky-${animId})`} />

        {/* Moon */}
        <circle cx="400" cy="70" r="30" fill="#E8E0D0" opacity="0.6"
          style={{ animation: isActive ? `poMoonGlow-${animId} 4s infinite` : 'none' }} />
        <circle cx="410" cy="62" r="25" fill="hsl(240, 50%, 12%)" />
        <circle cx="400" cy="70" r="40" fill="rgba(200, 195, 180, 0.05)" />

        {/* Stars */}
        {stars.map((star, i) => (
          <circle key={i} cx={star.x} cy={star.y} r={star.r} fill="white"
            style={{
              animation: isActive
                ? `poStarTwinkle-${animId} ${1.5 + (i % 3) * 0.5}s infinite ${star.delay}s`
                : 'none',
            }} />
        ))}

        {/* Character — tilting and falling asleep */}
        <g style={{
          animation: isActive ? `poTilt-${animId} 2.5s ease-in-out forwards` : 'none',
          transformOrigin: '250px 350px',
        }}>
          {/* Mug body */}
          <path d="M 200 200 L 190 340 Q 190 360 210 360 L 290 360 Q 310 360 300 340 L 290 200 Z"
            fill="hsl(220, 30%, 80%)" stroke="hsl(220, 20%, 65%)" strokeWidth="2.5"
            style={{ transition: 'fill 1s ease' }} />
          <path d="M 196 200 L 296 200" stroke="hsl(220, 15%, 85%)" strokeWidth="6" strokeLinecap="round" />

          {/* Coffee inside (low) */}
          <clipPath id={`poMugClip-${animId}`}>
            <path d="M 200 200 L 190 340 Q 190 360 210 360 L 290 360 Q 310 360 300 340 L 290 200 Z" />
          </clipPath>
          <g clipPath={`url(#poMugClip-${animId})`}>
            <rect x="185" y="310" width="130" height="55" fill="hsl(25, 40%, 28%)" />
          </g>

          {/* Handle */}
          <path d="M 300 240 Q 350 240 350 290 Q 350 330 300 320"
            fill="none" stroke="hsl(220, 20%, 65%)" strokeWidth="14" strokeLinecap="round" />
          <path d="M 300 248 Q 340 248 340 290 Q 340 322 300 315"
            fill="none" stroke="hsl(220, 30%, 80%)" strokeWidth="8" strokeLinecap="round" />

          {/* Eyes closing */}
          <ellipse cx="230" cy="265" rx="12" ry="14" fill="#3A3A3A"
            style={{
              animation: isActive ? `poEyeClose-${animId} 1.5s ease-in-out forwards` : 'none',
            }} />
          <ellipse cx="270" cy="265" rx="12" ry="14" fill="#3A3A3A"
            style={{
              animation: isActive ? `poEyeClose-${animId} 1.5s ease-in-out 0.2s forwards` : 'none',
            }} />
          {/* Eyelids descending */}
          <rect x="215" y="248" width="30" height="0" fill="hsl(220, 30%, 80%)"
            style={{
              animation: isActive ? `poEyeClose-${animId} 1.5s ease-in-out forwards` : 'none',
              transformOrigin: '230px 250px',
            }} />

          {/* Yawn mouth */}
          <ellipse cx="250" cy="305" rx="10" ry="0" fill="#2A2A2A" opacity="0.6"
            style={{
              animation: isActive ? `poYawnOpen-${animId} 2s ease-in-out forwards` : 'none',
            }} />

          {/* Blush (fading) */}
          <ellipse cx="215" cy="290" rx="12" ry="6" fill="#9999CC" opacity="0.25" />
          <ellipse cx="285" cy="290" rx="12" ry="6" fill="#9999CC" opacity="0.25" />

          {/* Snore waves */}
          {snoreWaves.map((w, i) => (
            <path key={i}
              d={`M ${w.x} ${w.y} Q ${w.x + 5} ${w.y - 4} ${w.x + 10} ${w.y} Q ${w.x + 15} ${w.y + 4} ${w.x + 20} ${w.y}`}
              fill="none" stroke="rgba(150, 150, 200, 0.4)" strokeWidth="1.5"
              style={{
                animation: isActive
                  ? `poSnore-${animId} 2s infinite ${1.5 + w.delay}s`
                  : 'none',
                transformOrigin: `${w.x + 10}px ${w.y}px`,
              }}
            />
          ))}
        </g>

        {/* Coffee puddle spreading on floor */}
        <ellipse cx="280" cy="390" rx="0" ry="0" fill="hsl(25, 50%, 25%)" opacity="0"
          style={{
            animation: isActive ? `poPuddle-${animId} 3s ease-out 1.5s forwards` : 'none',
          }} />
        {/* Puddle shine */}
        <ellipse cx="270" cy="387" rx="0" ry="0" fill="hsl(25, 40%, 35%)" opacity="0"
          style={{
            animation: isActive ? `poPuddle-${animId} 3s ease-out 1.7s forwards` : 'none',
          }} />

        {/* Coffee drips */}
        {isActive && (
          <>
            <circle cx="300" cy="355" r="3" fill="hsl(25, 50%, 28%)"
              style={{ animation: `poDrip-${animId} 1.5s ease-in 1.8s infinite` }} />
            <circle cx="310" cy="350" r="2" fill="hsl(25, 50%, 28%)"
              style={{ animation: `poDrip-${animId} 1.2s ease-in 2.1s infinite` }} />
          </>
        )}

        {/* Floating Zzz */}
        {isActive && (
          <g>
            <g style={{ animation: `poZzz-${animId} 3s infinite 1.5s` }}>
              <text x="320" y="220" fill="#7788CC" fontSize="22" fontFamily="monospace" fontWeight="bold"
                opacity="0.7">Z</text>
            </g>
            <g style={{ animation: `poZzz-${animId} 3.5s infinite 2s` }}>
              <text x="340" y="195" fill="#7788CC" fontSize="28" fontFamily="monospace" fontWeight="bold"
                opacity="0.5">Z</text>
            </g>
            <g style={{ animation: `poZzz-${animId} 4s infinite 2.5s` }}>
              <text x="355" y="170" fill="#7788CC" fontSize="34" fontFamily="monospace" fontWeight="bold"
                opacity="0.3">Z</text>
            </g>
          </g>
        )}

        {/* "You Fell Asleep..." text */}
        <g style={{
          animation: isActive ? `poTextType-${animId} 1s ease-out 2.5s both` : 'none',
        }}>
          <text x="250" y="430" fill="#8888CC" fontSize="28" fontFamily="monospace"
            textAnchor="middle" fontWeight="bold">
            You Fell Asleep...
          </text>
        </g>

        {/* Score */}
        <g style={{
          animation: isActive ? `poScoreFade-${animId} 0.5s ease-out 3.2s both` : 'none',
        }}>
          <text x="250" y="465" fill="rgba(150, 150, 200, 0.7)" fontSize="14" fontFamily="monospace"
            textAnchor="middle">
            Final Score: {score.toLocaleString()}
          </text>
        </g>
      </svg>
    </div>
  );
}
