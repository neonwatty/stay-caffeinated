'use client';

import { useMemo } from 'react';

interface VictoryScreenSVGProps {
  score: number;
  zoneBonus?: number;
  healthBonus?: number;
  difficultyMultiplier?: number;
  isNewHighScore?: boolean;
  width?: number;
  height?: number;
  isActive?: boolean;
  onPlayAgain?: () => void;
  onMenu?: () => void;
}

/**
 * Victory screen — "You Survived the Workday!"
 * 4-5 second animation: character jumps, confetti, golden text, score tally.
 * Gold/warm celebration palette.
 */
export function VictoryScreenSVG({
  score,
  zoneBonus = 500,
  healthBonus = 300,
  difficultyMultiplier = 1.5,
  isNewHighScore = false,
  width = 500,
  height = 500,
  isActive = true,
}: VictoryScreenSVGProps) {
  const animId = 'vic';

  // Confetti particles (deterministic)
  const confetti = useMemo(() => {
    const particles = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#FB923C', '#34D399', '#F472B6', '#60A5FA', '#FBBF24', '#E879F9'];
    for (let i = 0; i < 30; i++) {
      const seed = (i + 1) * 137.508;
      particles.push({
        x: 30 + ((seed * 3.7) % 440),
        y: -20 - ((seed * 1.3) % 60),
        w: 6 + (i % 4) * 2,
        h: 3 + (i % 3),
        color: colors[i % colors.length],
        rotation: ((seed * 11.7) % 360),
        delay: (i * 0.08).toFixed(2),
        duration: (2.5 + (i % 5) * 0.3).toFixed(1),
        xDrift: ((seed * 2.1) % 60) - 30,
      });
    }
    return particles;
  }, []);

  // Star sparkles
  const stars = useMemo(() => {
    const s = [];
    for (let i = 0; i < 12; i++) {
      const seed = (i + 1) * 97.31;
      s.push({
        x: 60 + ((seed * 4.3) % 380),
        y: 40 + ((seed * 2.7) % 200),
        r: 2 + (i % 3),
        delay: (0.5 + i * 0.15).toFixed(2),
      });
    }
    return s;
  }, []);

  const keyframes_css = isActive ? `
    @keyframes vicBounce-${animId} {
      0% { transform: translateY(0) scale(1); }
      20% { transform: translateY(-30px) scale(1.05); }
      40% { transform: translateY(0) scale(0.95); }
      60% { transform: translateY(-15px) scale(1.02); }
      80% { transform: translateY(0) scale(0.98); }
      100% { transform: translateY(0) scale(1); }
    }
    @keyframes vicConfetti-${animId} {
      0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(520px) translateX(var(--drift)) rotate(720deg); opacity: 0.3; }
    }
    @keyframes vicTextGlow-${animId} {
      0% { opacity: 0; transform: scale(0.5); filter: blur(8px); }
      40% { opacity: 1; transform: scale(1.1); filter: blur(0); }
      60% { transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1); filter: blur(0); }
    }
    @keyframes vicStarBurst-${animId} {
      0% { opacity: 0; r: 0; }
      50% { opacity: 1; }
      100% { opacity: 0; r: 6; }
    }
    @keyframes vicTrophyShine-${animId} {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
    @keyframes vicFadeIn-${animId} {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes vicOverlayIn-${animId} {
      0% { opacity: 0; }
      100% { opacity: 0.7; }
    }
    @keyframes vicScoreSlide-${animId} {
      0% { transform: translateY(30px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
  ` : '';

  return (
    <div style={{ width, height, display: 'inline-flex' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes_css }} />}
      <svg viewBox="0 0 500 500" width="100%" height="100%">
        {/* Dark overlay background */}
        <rect width="500" height="500" fill="rgba(0,0,0,0.7)"
          style={{
            animation: isActive ? `vicOverlayIn-${animId} 0.5s ease-out forwards` : 'none',
          }} />

        {/* Golden radial glow */}
        <defs>
          <radialGradient id={`vicGlow-${animId}`}>
            <stop offset="0%" stopColor="rgba(255, 215, 0, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 215, 0, 0)" />
          </radialGradient>
        </defs>
        <circle cx="250" cy="200" r="200" fill={`url(#vicGlow-${animId})`}
          style={{
            animation: isActive ? `vicFadeIn-${animId} 1s ease-out 0.5s both` : 'none',
          }} />

        {/* Confetti */}
        {confetti.map((c, i) => (
          <rect
            key={i}
            x={c.x} y={c.y}
            width={c.w} height={c.h}
            rx="1"
            fill={c.color}
            transform={`rotate(${c.rotation} ${c.x + c.w / 2} ${c.y + c.h / 2})`}
            style={{
              // @ts-expect-error CSS custom property
              '--drift': `${c.xDrift}px`,
              animation: isActive
                ? `vicConfetti-${animId} ${c.duration}s ease-in ${c.delay}s infinite`
                : 'none',
            }}
          />
        ))}

        {/* Character (happy bouncing cup) */}
        <g style={{
          animation: isActive ? `vicBounce-${animId} 1s ease-out 0.3s both` : 'none',
          transformOrigin: '250px 160px',
        }}>
          {/* Simple happy mug */}
          <g transform="translate(200, 80) scale(0.5)">
            {/* Mug body */}
            <path d="M 50 50 L 40 180 Q 40 200 60 200 L 140 200 Q 160 200 150 180 L 140 50 Z"
              fill="hsl(40, 15%, 94%)" stroke="hsl(30, 20%, 75%)" strokeWidth="3" />
            <path d="M 45 50 L 150 50" stroke="hsl(30, 15%, 88%)" strokeWidth="6" strokeLinecap="round" />
            {/* Coffee */}
            <rect x="42" y="90" width="116" height="105" fill="hsl(25, 65%, 30%)" rx="2" />
            <ellipse cx="100" cy="90" rx="45" ry="5" fill="hsl(30, 40%, 45%)" opacity="0.3" />
            {/* Handle */}
            <path d="M 150 80 Q 200 80 200 130 Q 200 170 150 160"
              fill="none" stroke="hsl(30, 20%, 75%)" strokeWidth="14" strokeLinecap="round" />
            {/* Happy crescent eyes (^_^) */}
            <path d="M 65 110 Q 80 95 95 110" fill="none" stroke="#3A3A3A" strokeWidth="4" strokeLinecap="round" />
            <path d="M 105 110 Q 120 95 135 110" fill="none" stroke="#3A3A3A" strokeWidth="4" strokeLinecap="round" />
            {/* Big smile */}
            <path d="M 75 140 Q 100 170 125 140" fill="none" stroke="#3A3A3A" strokeWidth="4" strokeLinecap="round" />
            {/* Blush */}
            <ellipse cx="65" cy="135" rx="12" ry="6" fill="#FFB5D5" opacity="0.5" />
            <ellipse cx="135" cy="135" rx="12" ry="6" fill="#FFB5D5" opacity="0.5" />
          </g>
        </g>

        {/* Star sparkles */}
        {stars.map((star, i) => (
          <circle key={i} cx={star.x} cy={star.y} r="0" fill="#FFE066"
            style={{
              animation: isActive
                ? `vicStarBurst-${animId} 1s ease-out ${star.delay}s infinite`
                : 'none',
            }}
          />
        ))}

        {/* "You Survived!" text */}
        <g style={{
          animation: isActive ? `vicTextGlow-${animId} 1s ease-out 1s both` : 'none',
          transformOrigin: '250px 260px',
        }}>
          <text x="250" y="260" fill="#FFD700" fontSize="32" fontFamily="monospace"
            textAnchor="middle" fontWeight="bold">
            You Survived!
          </text>
          <text x="250" y="282" fill="rgba(255, 215, 0, 0.6)" fontSize="13" fontFamily="monospace"
            textAnchor="middle">
            Another productive workday complete
          </text>
        </g>

        {/* Trophy icon */}
        <g style={{
          animation: isActive ? `vicFadeIn-${animId} 0.5s ease-out 1.5s both` : 'none',
        }}>
          {/* Trophy cup */}
          <path d="M 230 295 L 225 320 L 275 320 L 270 295"
            fill="#FFD700" stroke="#DAA520" strokeWidth="1.5" />
          {/* Trophy handles */}
          <path d="M 230 300 Q 215 300 215 310 Q 215 318 228 318"
            fill="none" stroke="#DAA520" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 270 300 Q 285 300 285 310 Q 285 318 272 318"
            fill="none" stroke="#DAA520" strokeWidth="2.5" strokeLinecap="round" />
          {/* Trophy base */}
          <rect x="237" y="320" width="26" height="4" rx="1" fill="#DAA520" />
          <rect x="233" y="324" width="34" height="4" rx="1" fill="#B8860B" />
          {/* Star on trophy */}
          <path d="M 250 302 L 253 308 L 259 309 L 254 313 L 256 319 L 250 316 L 244 319 L 246 313 L 241 309 L 247 308 Z"
            fill="#FFF8DC" opacity="0.8" />
          {/* Shine */}
          <line x1="235" y1="298" x2="240" y2="305" stroke="white" strokeWidth="1.5" opacity="0.4"
            style={{ animation: isActive ? `vicTrophyShine-${animId} 2s infinite 2s` : 'none' }} />
        </g>

        {/* Score summary area */}
        <g style={{
          animation: isActive ? `vicScoreSlide-${animId} 0.6s ease-out 2s both` : 'none',
        }}>
          {/* Score panel */}
          <rect x="100" y="340" width="300" height="140" rx="10" fill="rgba(0,0,0,0.5)"
            stroke="rgba(255,215,0,0.2)" strokeWidth="1" />

          {/* Score lines with stagger */}
          {[
            { label: 'Base Score', val: score, color: '#CCC', delay: 2.4 },
            { label: 'Zone Bonus', val: zoneBonus, color: '#4ECDC4', delay: 2.7 },
            { label: 'Health Bonus', val: healthBonus, color: '#FF6B6B', delay: 3.0 },
          ].map((row, i) => (
            <g key={i} style={{
              animation: isActive ? `vicFadeIn-${animId} 0.3s ease-out ${row.delay}s both` : 'none',
            }}>
              <text x="120" y={368 + i * 24} fill={row.color} fontSize="12" fontFamily="monospace">
                {row.label}
              </text>
              <text x="380" y={368 + i * 24} fill={row.color} fontSize="12" fontFamily="monospace"
                textAnchor="end">
                +{row.val.toLocaleString()}
              </text>
            </g>
          ))}

          {/* Difficulty multiplier */}
          <g style={{
            animation: isActive ? `vicFadeIn-${animId} 0.3s ease-out 3.3s both` : 'none',
          }}>
            <text x="120" y={368 + 3 * 24} fill="#A78BFA" fontSize="12" fontFamily="monospace">
              Difficulty
            </text>
            <text x="380" y={368 + 3 * 24} fill="#A78BFA" fontSize="12" fontFamily="monospace"
              textAnchor="end">
              x{difficultyMultiplier.toFixed(1)}
            </text>
          </g>

          {/* Final score */}
          <g style={{
            animation: isActive
              ? isNewHighScore
                ? `vicFadeIn-${animId} 0.3s ease-out 3.6s both, highScorePulse 1.5s infinite 4s`
                : `vicFadeIn-${animId} 0.3s ease-out 3.6s both`
              : 'none',
          }}>
            <line x1="120" y1={375 + 3 * 24} x2="380" y2={375 + 3 * 24}
              stroke="rgba(255,215,0,0.3)" strokeWidth="1" />
            <text x="250" y={468} fill="#FFD700" fontSize="20" fontFamily="monospace"
              textAnchor="middle" fontWeight="bold">
              {Math.round(score * difficultyMultiplier + zoneBonus + healthBonus).toLocaleString()}
            </text>
            {isNewHighScore && (
              <text x="250" y={483} fill="#FF6B6B" fontSize="10" fontFamily="monospace"
                textAnchor="middle">
                NEW HIGH SCORE!
              </text>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}
