'use client';

import { useMemo } from 'react';

type EventType = 'meeting' | 'deadline' | 'break' | 'lunchRush' | null;

interface WorkspaceBackgroundSVGProps {
  caffeineLevel: number;       // 0-100
  timeProgress: number;        // 0-1 (day progression)
  drinksConsumed: number;
  currentEvent?: EventType;
  width?: number;
  height?: number;
  isActive?: boolean;
}

/**
 * Main game backdrop — a layered workspace/café scene.
 * Combines wall/window, desk surface, and reactive ambient elements.
 * Reacts to caffeine level, time-of-day, and drink count.
 *
 * Layers (back to front):
 *   1. Wall + window (with DayNightCycle sky)
 *   2. Desk surface (wood grain, stain rings)
 *   3. Framed items on wall
 *   4. Ambient lighting overlay
 */
export function WorkspaceBackgroundSVG({
  caffeineLevel,
  timeProgress,
  drinksConsumed,
  currentEvent = null,
  width = 600,
  height = 400,
  isActive = true,
}: WorkspaceBackgroundSVGProps) {
  const level = Math.max(0, Math.min(100, caffeineLevel));
  const t = Math.max(0, Math.min(1, timeProgress));

  const env = useMemo(() => {
    const caf = level / 100;
    const isSleepy = caf < 0.3;
    const isWired = caf > 0.7;

    // Sky colors (simplified DayNightCycle inline)
    const skyLerp = (a: number, b: number, f: number) => a + (b - a) * f;
    let skyTopH: number, skyTopS: number, skyTopL: number;
    let skyBotH: number, skyBotS: number, skyBotL: number;

    if (t < 0.15) {
      // Dawn
      const f = t / 0.15;
      skyTopH = skyLerp(25, 210, f); skyTopS = skyLerp(80, 70, f); skyTopL = skyLerp(40, 55, f);
      skyBotH = skyLerp(35, 200, f); skyBotS = skyLerp(90, 60, f); skyBotL = skyLerp(65, 75, f);
    } else if (t < 0.7) {
      // Day
      skyTopH = 210; skyTopS = 75; skyTopL = 58;
      skyBotH = 200; skyBotS = 55; skyBotL = 80;
    } else if (t < 0.85) {
      // Golden hour
      const f = (t - 0.7) / 0.15;
      skyTopH = skyLerp(210, 30, f); skyTopS = skyLerp(75, 70, f); skyTopL = skyLerp(58, 50, f);
      skyBotH = skyLerp(200, 40, f); skyBotS = skyLerp(55, 80, f); skyBotL = skyLerp(80, 65, f);
    } else {
      // Night
      const f = (t - 0.85) / 0.15;
      skyTopH = skyLerp(30, 240, f); skyTopS = skyLerp(70, 50, f); skyTopL = skyLerp(50, 15, f);
      skyBotH = skyLerp(40, 250, f); skyBotS = skyLerp(80, 45, f); skyBotL = skyLerp(65, 25, f);
    }

    // Room lighting
    const ambientLight = t < 0.15 ? 0.6 : t > 0.85 ? 0.3 : 0.9;
    const warmth = t > 0.65 ? 30 : 0; // warm overlay for golden hour

    // Blinds position
    const blindsOpen = t < 0.85 ? 0.8 : 0.4;

    // Event effects
    let eventTint = 'transparent';
    if (currentEvent === 'meeting') eventTint = 'rgba(100, 100, 255, 0.05)';
    if (currentEvent === 'deadline') eventTint = 'rgba(255, 50, 50, 0.05)';
    if (currentEvent === 'break') eventTint = 'rgba(50, 200, 50, 0.05)';

    // Sun position in window
    const sunX = 80 + t * 140;
    const sunY = t < 0.5
      ? 90 - Math.sin(t * Math.PI) * 50
      : 90 - Math.sin(t * Math.PI) * 50;
    const sunVisible = t > 0.05 && t < 0.85;
    const sunOpacity = t < 0.1 ? (t - 0.05) * 20 : t > 0.8 ? (0.85 - t) * 20 : 1;

    return {
      isSleepy, isWired, caf,
      skyTop: `hsl(${Math.round(skyTopH)}, ${Math.round(skyTopS)}%, ${Math.round(skyTopL)}%)`,
      skyBot: `hsl(${Math.round(skyBotH)}, ${Math.round(skyBotS)}%, ${Math.round(skyBotL)}%)`,
      ambientLight, warmth, blindsOpen, eventTint,
      sunX, sunY: Math.max(50, sunY), sunVisible,
      sunOpacity: Math.max(0, Math.min(1, sunOpacity)),
      isNight: t > 0.85,
      starsVisible: t > 0.8,
    };
  }, [level, t, currentEvent]);

  const cupCount = Math.min(8, Math.floor(drinksConsumed));
  const stainCount = Math.min(8, Math.floor(drinksConsumed));
  const animId = `wb${level}${Math.round(t * 100)}`;

  const keyframes_css = isActive ? `
    @keyframes wallClock-${animId} {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes ambientPulse-${animId} {
      0%, 100% { opacity: ${env.ambientLight}; }
      50% { opacity: ${env.ambientLight * 0.95}; }
    }
    @keyframes starTwinkle-${animId} {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 0.2; }
    }
    @keyframes blindsSway-${animId} {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(1px); }
    }
    @keyframes certGlint-${animId} {
      0%, 90%, 100% { opacity: 0; }
      95% { opacity: 0.3; }
    }
  ` : '';

  // Deterministic stain positions
  const stains = useMemo(() => {
    const result = [];
    for (let i = 0; i < 8; i++) {
      const seed = (i + 1) * 137.508;
      result.push({
        cx: 100 + ((seed * 5.3) % 400),
        cy: 240 + ((seed * 3.1) % 120),
        r: 12 + (i % 3) * 4,
        rot: ((seed * 11) % 60) - 30,
        opacity: 0.06 + (i % 4) * 0.02,
      });
    }
    return result;
  }, []);

  // Star positions for night sky
  const stars = useMemo(() => {
    const s = [];
    for (let i = 0; i < 15; i++) {
      const seed = (i + 1) * 97.31;
      s.push({
        x: 115 + ((seed * 3.7) % 180),
        y: 30 + ((seed * 2.1) % 85),
        r: 0.8 + (i % 3) * 0.4,
        delay: (i * 0.4) % 2.5,
      });
    }
    return s;
  }, []);

  return (
    <div style={{ width, height, display: 'inline-flex' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes_css }} />}
      <svg viewBox="0 0 600 400" width="100%" height="100%" style={{ borderRadius: 8 }}>
        <defs>
          <linearGradient id={`skyGrad-${animId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={env.skyTop} />
            <stop offset="100%" stopColor={env.skyBot} />
          </linearGradient>
          <pattern id={`woodGrain-${animId}`} patternUnits="userSpaceOnUse" width="600" height="200">
            <rect width="600" height="200" fill="hsl(28, 38%, 52%)" />
            {[0, 15, 35, 55, 75, 95, 120, 140, 165, 185].map((y, i) => (
              <line key={i} x1="0" y1={y + (i % 2) * 2} x2="600" y2={y + (i % 3)}
                stroke={`hsla(28, 30%, ${46 + (i % 4) * 3}%, 0.35)`}
                strokeWidth={0.8 + (i % 2) * 0.5} />
            ))}
          </pattern>
          <clipPath id={`windowClip-${animId}`}>
            <rect x="110" y="25" width="190" height="130" rx="3" />
          </clipPath>
        </defs>

        {/* ===== LAYER 1: WALL ===== */}
        <rect width="600" height="210" fill="hsl(35, 20%, 82%)"
          style={{ transition: 'fill 0.5s ease' }} />
        {/* Wall texture (subtle) */}
        {[0, 40, 80, 120, 160].map((y, i) => (
          <line key={i} x1="0" y1={y} x2="600" y2={y}
            stroke="hsla(35, 15%, 78%, 0.4)" strokeWidth="0.5" />
        ))}

        {/* ===== WINDOW ===== */}
        {/* Window frame */}
        <rect x="105" y="20" width="200" height="140" rx="4"
          fill="hsl(30, 20%, 60%)" />
        <rect x="108" y="23" width="194" height="134" rx="3"
          fill="hsl(30, 15%, 50%)" />

        {/* Sky through window */}
        <g clipPath={`url(#windowClip-${animId})`}>
          <rect x="110" y="25" width="190" height="130"
            fill={`url(#skyGrad-${animId})`}
            style={{ transition: 'fill 1s ease' }} />

          {/* Sun */}
          {env.sunVisible && env.sunOpacity > 0 && (
            <g opacity={env.sunOpacity}>
              <circle cx={env.sunX} cy={env.sunY} r="30"
                fill="rgba(255, 220, 100, 0.15)" />
              <circle cx={env.sunX} cy={env.sunY} r="12"
                fill={t > 0.65 ? '#FF9944' : '#FFE066'} />
            </g>
          )}

          {/* Moon */}
          {env.isNight && (
            <g opacity={env.starsVisible ? (t - 0.8) * 5 : 0}>
              <circle cx="260" cy="55" r="10" fill="#E8E0D0" />
              <circle cx="264" cy="52" r="8" fill={env.skyTop} />
            </g>
          )}

          {/* Stars */}
          {env.starsVisible && (
            <g opacity={Math.min(1, (t - 0.8) * 5)}>
              {stars.map((star, i) => (
                <circle key={i} cx={star.x} cy={star.y} r={star.r} fill="white"
                  style={{
                    animation: isActive
                      ? `starTwinkle-${animId} 2s infinite ${star.delay}s`
                      : 'none',
                  }} />
              ))}
            </g>
          )}

          {/* Clouds */}
          {!env.isNight && (
            <g opacity="0.3">
              <ellipse cx="150" cy="50" rx="25" ry="8" fill="white" />
              <ellipse cx="145" cy="48" rx="15" ry="6" fill="white" />
              <ellipse cx="240" cy="65" rx="20" ry="6" fill="white" />
            </g>
          )}
        </g>

        {/* Window dividers */}
        <line x1="205" y1="25" x2="205" y2="155" stroke="hsl(30, 20%, 55%)" strokeWidth="3" />
        <line x1="110" y1="90" x2="300" y2="90" stroke="hsl(30, 20%, 55%)" strokeWidth="3" />

        {/* Blinds (partially drawn) */}
        <g opacity={0.3} style={{
          animation: isActive ? `blindsSway-${animId} 10s infinite ease-in-out` : 'none',
        }}>
          {Array.from({ length: Math.round((1 - env.blindsOpen) * 8) }).map((_, i) => (
            <rect key={i} x="112" y={26 + i * 6} width="186" height="4" rx="1"
              fill="hsl(35, 20%, 75%)" />
          ))}
        </g>

        {/* ===== WALL DECORATIONS ===== */}

        {/* "World's Best Coder" certificate */}
        <g>
          <rect x="340" y="40" width="70" height="55" rx="2" fill="hsl(35, 15%, 88%)"
            stroke="hsl(35, 30%, 60%)" strokeWidth="2" />
          <rect x="346" y="46" width="58" height="43" fill="hsl(45, 20%, 95%)" />
          {/* Certificate text lines */}
          <line x1="355" y1="56" x2="395" y2="56" stroke="hsl(35, 20%, 60%)" strokeWidth="1" />
          <line x1="360" y1="62" x2="390" y2="62" stroke="hsl(35, 20%, 70%)" strokeWidth="0.5" />
          <line x1="358" y1="68" x2="392" y2="68" stroke="hsl(35, 20%, 70%)" strokeWidth="0.5" />
          {/* Gold star */}
          <circle cx="375" cy="78" r="4" fill="hsl(45, 80%, 55%)" />
          {/* Glint animation */}
          <rect x="340" y="40" width="70" height="55" rx="2" fill="white"
            style={{
              animation: isActive ? `certGlint-${animId} 8s infinite` : 'none',
            }} />
        </g>

        {/* Wall clock */}
        <g>
          <circle cx="470" cy="55" r="22" fill="hsl(0, 0%, 92%)"
            stroke="hsl(0, 0%, 40%)" strokeWidth="2" />
          {/* Hour marks */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 470 + Math.sin(rad) * 17;
            const y1 = 55 - Math.cos(rad) * 17;
            const x2 = 470 + Math.sin(rad) * 19;
            const y2 = 55 - Math.cos(rad) * 19;
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="hsl(0, 0%, 30%)" strokeWidth={i % 3 === 0 ? 1.5 : 0.5} />
            );
          })}
          {/* Hour hand */}
          <line x1="470" y1="55" x2={470 + Math.sin(t * 2 * Math.PI) * 10}
            y2={55 - Math.cos(t * 2 * Math.PI) * 10}
            stroke="hsl(0, 0%, 20%)" strokeWidth="2" strokeLinecap="round" />
          {/* Minute hand */}
          <line x1="470" y1="55" x2={470 + Math.sin(t * 24 * Math.PI) * 14}
            y2={55 - Math.cos(t * 24 * Math.PI) * 14}
            stroke="hsl(0, 0%, 30%)" strokeWidth="1" strokeLinecap="round" />
          <circle cx="470" cy="55" r="2" fill="hsl(0, 0%, 25%)" />
        </g>

        {/* ===== LAYER 2: DESK SURFACE ===== */}
        <rect x="0" y="200" width="600" height="200"
          fill={`url(#woodGrain-${animId})`} />
        {/* Desk edge highlight */}
        <line x1="0" y1="202" x2="600" y2="202"
          stroke="hsla(28, 30%, 60%, 0.5)" strokeWidth="2" />

        {/* ===== COFFEE STAINS on desk ===== */}
        {stains.slice(0, stainCount).map((stain, i) => (
          <g key={i}>
            <ellipse cx={stain.cx} cy={stain.cy}
              rx={stain.r} ry={stain.r * 0.9}
              fill="transparent"
              stroke={`hsla(25, 45%, 35%, ${stain.opacity})`}
              strokeWidth="2"
              transform={`rotate(${stain.rot} ${stain.cx} ${stain.cy})`}
            />
            <ellipse cx={stain.cx} cy={stain.cy}
              rx={stain.r * 0.7} ry={stain.r * 0.6}
              fill={`hsla(25, 40%, 38%, ${stain.opacity * 0.3})`}
              transform={`rotate(${stain.rot + 10} ${stain.cx} ${stain.cy})`}
            />
          </g>
        ))}

        {/* ===== AMBIENT LIGHTING OVERLAY ===== */}
        {/* Time-of-day tint */}
        <rect width="600" height="400"
          fill={env.isNight
            ? 'rgba(20, 20, 60, 0.2)'
            : env.warmth > 0
              ? `rgba(255, 200, 100, ${env.warmth / 400})`
              : 'transparent'}
          style={{
            transition: 'fill 1s ease',
            animation: isActive ? `ambientPulse-${animId} 6s infinite` : 'none',
          }}
        />

        {/* Event tint */}
        {currentEvent && (
          <rect width="600" height="400" fill={env.eventTint}
            style={{ transition: 'fill 0.5s ease' }} />
        )}

        {/* Sleepy desaturation overlay */}
        {env.isSleepy && (
          <rect width="600" height="400"
            fill="rgba(100, 100, 130, 0.08)"
            style={{ transition: 'fill 0.5s ease' }} />
        )}

        {/* Wired energy overlay */}
        {env.isWired && (
          <rect width="600" height="400"
            fill="rgba(255, 100, 50, 0.03)"
            style={{ transition: 'fill 0.5s ease' }} />
        )}
      </svg>
    </div>
  );
}
