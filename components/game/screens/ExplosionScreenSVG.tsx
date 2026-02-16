'use client';

import { useMemo } from 'react';

interface ExplosionScreenSVGProps {
  score: number;
  width?: number;
  height?: number;
  isActive?: boolean;
}

/**
 * "Too Much Caffeine!" game-over screen.
 * Animation: violent shake, cracks, mug shatters into shards, explosion flash,
 * coffee splash, "POW" burst, text zooms in, score.
 * 3-4 second sequence. Red/orange/yellow explosive palette.
 */
export function ExplosionScreenSVG({
  score,
  width = 500,
  height = 500,
  isActive = true,
}: ExplosionScreenSVGProps) {
  const animId = 'ex';

  // Mug shards — triangular pieces that fly outward
  const shards = useMemo(() => {
    const pieces = [];
    const cx = 250, cy = 280;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const nextAngle = ((i + 1) / 8) * Math.PI * 2;
      const r1 = 60 + (i % 3) * 15;
      const r2 = 55 + ((i + 1) % 3) * 12;
      // Triangle from center to two edge points
      const x1 = cx + Math.cos(angle) * r1;
      const y1 = cy + Math.sin(angle) * r1;
      const x2 = cx + Math.cos(nextAngle) * r2;
      const y2 = cy + Math.sin(nextAngle) * r2;
      // Fly-out direction
      const midAngle = (angle + nextAngle) / 2;
      const flyDist = 150 + (i % 3) * 50;
      const flyX = Math.cos(midAngle) * flyDist;
      const flyY = Math.sin(midAngle) * flyDist;
      const rotation = ((i * 137) % 360) - 180;

      pieces.push({
        path: `M ${cx} ${cy} L ${x1} ${y1} L ${x2} ${y2} Z`,
        flyX, flyY, rotation,
        color: i % 2 === 0 ? 'hsl(10, 40%, 88%)' : 'hsl(30, 20%, 82%)',
        delay: 0.5 + (i * 0.05),
      });
    }
    return pieces;
  }, []);

  // Coffee splash droplets
  const splashes = useMemo(() => {
    const drops = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = 80 + (i % 4) * 30;
      drops.push({
        x: 250 + Math.cos(angle) * 20,
        y: 280 + Math.sin(angle) * 20,
        flyX: Math.cos(angle) * dist,
        flyY: Math.sin(angle) * dist - 20,
        r: 3 + (i % 3) * 2,
        delay: 0.6 + (i * 0.03),
      });
    }
    return drops;
  }, []);

  // Spark particles
  const sparks = useMemo(() => {
    const s = [];
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const dist = 100 + (i % 5) * 40;
      s.push({
        x: 250,
        y: 280,
        flyX: Math.cos(angle) * dist,
        flyY: Math.sin(angle) * dist,
        delay: 0.5 + (i * 0.04),
        color: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FF6B6B' : '#FFA500',
      });
    }
    return s;
  }, []);

  const keyframes_css = isActive ? `
    @keyframes exShake-${animId} {
      0%, 100% { transform: translate(0, 0); }
      10% { transform: translate(5px, -3px); }
      20% { transform: translate(-6px, 4px); }
      30% { transform: translate(4px, 2px); }
      40% { transform: translate(-5px, -4px); }
      50% { transform: translate(6px, 3px); }
      60% { transform: translate(-4px, -2px); }
      70% { transform: translate(5px, 4px); }
      80% { transform: translate(-6px, -3px); }
      90% { transform: translate(4px, 2px); }
    }
    @keyframes exCrack-${animId} {
      0% { stroke-dashoffset: 100; opacity: 0; }
      100% { stroke-dashoffset: 0; opacity: 1; }
    }
    @keyframes exShardFly-${animId} {
      0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
      100% { transform: translate(var(--fx), var(--fy)) rotate(var(--rot)); opacity: 0; }
    }
    @keyframes exSplash-${animId} {
      0% { transform: translate(0, 0); opacity: 0.8; r: var(--r); }
      100% { transform: translate(var(--fx), var(--fy)); opacity: 0; r: 1; }
    }
    @keyframes exFlash-${animId} {
      0% { r: 0; opacity: 0; }
      20% { r: 200; opacity: 1; }
      100% { r: 300; opacity: 0; }
    }
    @keyframes exSpark-${animId} {
      0% { transform: translate(0, 0); opacity: 1; }
      100% { transform: translate(var(--fx), var(--fy)); opacity: 0; }
    }
    @keyframes exPow-${animId} {
      0% { transform: scale(0); opacity: 0; }
      30% { transform: scale(1.2); opacity: 1; }
      60% { transform: scale(0.9); opacity: 0.8; }
      100% { transform: scale(0); opacity: 0; }
    }
    @keyframes exText-${animId} {
      0% { transform: scale(3); opacity: 0; filter: blur(8px); }
      50% { transform: scale(0.9); opacity: 1; filter: blur(0); }
      70% { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; filter: blur(0); }
    }
    @keyframes exOverlay-${animId} {
      0% { fill: rgba(0,0,0,0); }
      15% { fill: rgba(255,50,0,0.3); }
      100% { fill: rgba(0,0,0,0.75); }
    }
    @keyframes exFadeIn-${animId} {
      0% { opacity: 0; transform: translateY(15px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes exMugFade-${animId} {
      0%, 40% { opacity: 1; }
      50% { opacity: 0; }
      100% { opacity: 0; }
    }
    @keyframes exEyeWide-${animId} {
      0% { ry: 14; rx: 12; }
      100% { ry: 20; rx: 18; }
    }
  ` : '';

  return (
    <div style={{ width, height, display: 'inline-flex' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes_css }} />}
      <svg viewBox="0 0 500 500" width="100%" height="100%">
        {/* Background overlay — red flash then darken */}
        <rect width="500" height="500"
          style={{
            animation: isActive ? `exOverlay-${animId} 2s ease-out forwards` : 'none',
          }} />

        {/* Explosion flash */}
        <circle cx="250" cy="280" r="0" fill="white"
          style={{
            animation: isActive ? `exFlash-${animId} 0.8s ease-out 0.5s forwards` : 'none',
          }} />

        {/* POW burst shape */}
        <g style={{
          animation: isActive ? `exPow-${animId} 1.2s ease-out 0.6s forwards` : 'none',
          transformOrigin: '250px 280px',
        }}>
          <polygon
            points="250,180 270,240 330,230 285,270 310,330 250,295 190,330 215,270 170,230 230,240"
            fill="#FF4444" opacity="0.7" />
          <polygon
            points="250,200 265,245 315,240 278,272 298,320 250,292 202,320 222,272 185,240 235,245"
            fill="#FF8C00" opacity="0.5" />
        </g>

        {/* Mug (visible before explosion, fades) */}
        <g style={{
          animation: isActive
            ? `exShake-${animId} 0.15s infinite, exMugFade-${animId} 1s ease-out forwards`
            : 'none',
          transformOrigin: '250px 280px',
        }}>
          {/* Mug body */}
          <path d="M 200 200 L 190 340 Q 190 360 210 360 L 290 360 Q 310 360 300 340 L 290 200 Z"
            fill="hsl(10, 40%, 90%)" stroke="hsl(10, 30%, 70%)" strokeWidth="2.5" />
          <path d="M 196 200 L 296 200" stroke="hsl(30, 15%, 88%)" strokeWidth="6" strokeLinecap="round" />

          {/* Coffee */}
          <clipPath id={`exMugClip-${animId}`}>
            <path d="M 200 200 L 190 340 Q 190 360 210 360 L 290 360 Q 310 360 300 340 L 290 200 Z" />
          </clipPath>
          <g clipPath={`url(#exMugClip-${animId})`}>
            <rect x="185" y="220" width="130" height="145" fill="hsl(15, 60%, 28%)" />
          </g>

          {/* Handle */}
          <path d="M 300 240 Q 350 240 350 290 Q 350 330 300 320"
            fill="none" stroke="hsl(10, 30%, 70%)" strokeWidth="14" strokeLinecap="round" />

          {/* Wide panicking eyes */}
          <ellipse cx="230" cy="265" rx="12" ry="14" fill="#3A3A3A"
            style={{
              animation: isActive ? `exEyeWide-${animId} 0.3s ease-out forwards` : 'none',
            }} />
          <ellipse cx="235" cy="258" rx="5" ry="6" fill="white" opacity="0.85" />
          <ellipse cx="270" cy="265" rx="12" ry="14" fill="#3A3A3A"
            style={{
              animation: isActive ? `exEyeWide-${animId} 0.3s ease-out forwards` : 'none',
            }} />
          <ellipse cx="275" cy="258" rx="5" ry="6" fill="white" opacity="0.85" />

          {/* Panicked mouth */}
          <path d="M 235 310 Q 250 298 265 310" fill="none" stroke="#3A3A3A"
            strokeWidth="3.5" strokeLinecap="round" />

          {/* Cracks */}
          <path d="M 220 220 L 235 260 L 225 290"
            fill="none" stroke="#333" strokeWidth="2" strokeDasharray="100"
            style={{
              animation: isActive ? `exCrack-${animId} 0.4s ease-out 0.2s forwards` : 'none',
            }} />
          <path d="M 275 225 L 260 255 L 270 280"
            fill="none" stroke="#333" strokeWidth="1.5" strokeDasharray="100"
            style={{
              animation: isActive ? `exCrack-${animId} 0.4s ease-out 0.3s forwards` : 'none',
            }} />
        </g>

        {/* Shards flying outward */}
        {shards.map((shard, i) => (
          <path key={i}
            d={shard.path}
            fill={shard.color}
            stroke="hsl(30, 15%, 65%)" strokeWidth="1"
            style={{
              // @ts-expect-error CSS custom properties
              '--fx': `${shard.flyX}px`,
              '--fy': `${shard.flyY}px`,
              '--rot': `${shard.rotation}deg`,
              animation: isActive
                ? `exShardFly-${animId} 1.2s ease-out ${shard.delay}s forwards`
                : 'none',
              opacity: 0,
            }}
          />
        ))}

        {/* Coffee splash droplets */}
        {splashes.map((drop, i) => (
          <circle key={i}
            cx={drop.x} cy={drop.y} r={drop.r}
            fill="hsl(25, 55%, 30%)"
            style={{
              // @ts-expect-error CSS custom properties
              '--fx': `${drop.flyX}px`,
              '--fy': `${drop.flyY}px`,
              '--r': `${drop.r}`,
              animation: isActive
                ? `exSplash-${animId} 1s ease-out ${drop.delay}s forwards`
                : 'none',
              opacity: 0,
            }}
          />
        ))}

        {/* Spark particles */}
        {sparks.map((spark, i) => (
          <circle key={i}
            cx={spark.x} cy={spark.y} r="2"
            fill={spark.color}
            style={{
              // @ts-expect-error CSS custom properties
              '--fx': `${spark.flyX}px`,
              '--fy': `${spark.flyY}px`,
              animation: isActive
                ? `exSpark-${animId} 0.8s ease-out ${spark.delay}s forwards`
                : 'none',
              opacity: 0,
            }}
          />
        ))}

        {/* "Too Much Caffeine!" text */}
        <g style={{
          animation: isActive ? `exText-${animId} 0.8s ease-out 1.5s both` : 'none',
          transformOrigin: '250px 410px',
        }}>
          <text x="250" y="415" fill="#FF4444" fontSize="28" fontFamily="monospace"
            textAnchor="middle" fontWeight="bold">
            Too Much Caffeine!
          </text>
        </g>

        {/* Score */}
        <g style={{
          animation: isActive ? `exFadeIn-${animId} 0.5s ease-out 2.5s both` : 'none',
        }}>
          <text x="250" y="450" fill="rgba(255, 150, 100, 0.7)" fontSize="14" fontFamily="monospace"
            textAnchor="middle">
            Final Score: {score.toLocaleString()}
          </text>
        </g>
      </svg>
    </div>
  );
}
