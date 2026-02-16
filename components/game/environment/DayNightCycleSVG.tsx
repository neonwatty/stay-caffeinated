'use client';

import { useMemo } from 'react';

interface DayNightCycleSVGProps {
  timeProgress: number; // 0-1 (0 = 8am dawn, 1 = 8pm evening)
  width?: number;
  height?: number;
  isActive?: boolean;
}

/**
 * Sky/window component that shows time progression through gradient colors and celestial bodies.
 * Uses CSS animations for star twinkle and sun/moon movement.
 *
 * Timeline:
 *   0.0-0.1  Dawn — warm orange/pink
 *   0.1-0.4  Morning — bright blue, sun rising
 *   0.4-0.5  Midday — peak brightness
 *   0.5-0.7  Afternoon — warmer sky, sun descending
 *   0.7-0.85 Late afternoon — golden hour
 *   0.85-1.0 Evening — purple/dark, stars appear
 */
export function DayNightCycleSVG({
  timeProgress,
  width = 400,
  height = 200,
  isActive = true,
}: DayNightCycleSVGProps) {
  const t = Math.max(0, Math.min(1, timeProgress));

  const sky = useMemo(() => {
    // Interpolate sky gradient colors based on time
    // Each keyframe: [time, topColor, bottomColor]
    const keyframes: [number, string, string][] = [
      [0.0,  'hsl(25, 80%, 40%)',  'hsl(35, 90%, 65%)'],   // dawn top, dawn bottom
      [0.1,  'hsl(30, 70%, 55%)',  'hsl(45, 85%, 75%)'],   // early morning
      [0.2,  'hsl(210, 70%, 55%)', 'hsl(200, 60%, 75%)'],  // morning blue
      [0.4,  'hsl(210, 75%, 58%)', 'hsl(195, 55%, 80%)'],  // late morning
      [0.5,  'hsl(210, 80%, 60%)', 'hsl(200, 50%, 85%)'],  // midday
      [0.6,  'hsl(210, 70%, 55%)', 'hsl(200, 55%, 78%)'],  // early afternoon
      [0.7,  'hsl(30, 70%, 55%)',  'hsl(40, 80%, 70%)'],   // golden hour
      [0.85, 'hsl(270, 40%, 30%)', 'hsl(280, 50%, 45%)'],  // dusk
      [1.0,  'hsl(240, 50%, 15%)', 'hsl(250, 45%, 25%)'],  // night
    ];

    // Find surrounding keyframes
    let i = 0;
    while (i < keyframes.length - 1 && keyframes[i + 1][0] <= t) i++;
    if (i >= keyframes.length - 1) i = keyframes.length - 2;

    const [t0, top0, bot0] = keyframes[i];
    const [t1, top1, bot1] = keyframes[i + 1];
    const frac = t1 > t0 ? (t - t0) / (t1 - t0) : 0;
    const clampedFrac = Math.max(0, Math.min(1, frac));

    // Parse and interpolate HSL
    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
    const parseHSL = (s: string) => {
      const m = s.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
    };
    const lerpHSL = (a: string, b: string, f: number) => {
      const [ah, as, al] = parseHSL(a);
      const [bh, bs, bl] = parseHSL(b);
      // Handle hue wrapping
      let dh = bh - ah;
      if (dh > 180) dh -= 360;
      if (dh < -180) dh += 360;
      const h = ((ah + dh * f) % 360 + 360) % 360;
      return `hsl(${Math.round(h)}, ${Math.round(lerp(as, bs, f))}%, ${Math.round(lerp(al, bl, f))}%)`;
    };

    const topColor = lerpHSL(top0, top1, clampedFrac);
    const bottomColor = lerpHSL(bot0, bot1, clampedFrac);

    // Sun position (arc from left to right)
    const sunVisible = t < 0.88;
    const sunAngle = t * Math.PI; // 0 to PI
    const sunX = 50 + 300 * (t / 0.88);
    const sunY = sunVisible ? 160 - Math.sin(sunAngle / 0.88 * Math.PI) * 120 : 200;
    const sunRadius = t < 0.1 ? 15 + t * 50 : t > 0.8 ? 20 - (t - 0.8) * 80 : 20;
    const sunOpacity = t < 0.05 ? t * 20 : t > 0.82 ? Math.max(0, (0.88 - t) * 16) : 1;

    // Sun glow color
    const sunGlowColor = t < 0.15 || t > 0.7
      ? 'rgba(255, 150, 50, 0.4)'
      : 'rgba(255, 220, 100, 0.3)';

    // Stars visibility
    const starsOpacity = t > 0.8 ? (t - 0.8) * 5 : 0;

    // Cloud brightness
    const cloudOpacity = t > 0.85 ? 0.05 : t < 0.1 ? 0.15 : 0.25;

    return {
      topColor, bottomColor,
      sunX: Math.min(sunX, 370), sunY: Math.max(sunY, 20),
      sunRadius: Math.max(sunRadius, 0),
      sunOpacity: Math.max(0, sunOpacity),
      sunGlowColor,
      sunVisible,
      starsOpacity: Math.min(1, starsOpacity),
      cloudOpacity,
      isNight: t > 0.85,
      isDawn: t < 0.15,
      isGolden: t > 0.65 && t < 0.85,
    };
  }, [t]);

  const animId = `dnc${Math.round(t * 100)}`;

  const keyframes_css = isActive ? `
    @keyframes twinkle-${animId} {
      0%, 100% { opacity: 0.9; }
      50% { opacity: 0.2; }
    }
    @keyframes sunPulse-${animId} {
      0%, 100% { r: ${sky.sunRadius}; }
      50% { r: ${sky.sunRadius + 2}; }
    }
    @keyframes cloudDrift-${animId} {
      0% { transform: translateX(0); }
      100% { transform: translateX(20px); }
    }
  ` : '';

  // Deterministic star positions
  const stars = useMemo(() => {
    const s = [];
    for (let i = 0; i < 25; i++) {
      const seed = i * 137.508;
      s.push({
        x: (seed * 3.7) % 380 + 10,
        y: (seed * 2.3) % 140 + 10,
        r: 1 + (i % 3) * 0.6,
        delay: (i * 0.3) % 3,
        dur: 1.5 + (i % 4) * 0.5,
      });
    }
    return s;
  }, []);

  return (
    <div style={{ width, height, display: 'inline-flex' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes_css }} />}
      <svg viewBox="0 0 400 200" width="100%" height="100%">
        <defs>
          <linearGradient id={`skyGrad-${animId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sky.topColor} />
            <stop offset="100%" stopColor={sky.bottomColor} />
          </linearGradient>
          {/* Sun glow radial */}
          <radialGradient id={`sunGlow-${animId}`}>
            <stop offset="0%" stopColor="rgba(255, 230, 120, 0.6)" />
            <stop offset="50%" stopColor={sky.sunGlowColor} />
            <stop offset="100%" stopColor="rgba(255, 200, 80, 0)" />
          </radialGradient>
        </defs>

        {/* Sky background */}
        <rect width="400" height="200" fill={`url(#skyGrad-${animId})`}
          style={{ transition: 'fill 0.5s ease' }} />

        {/* Stars (visible at dusk/night) */}
        {sky.starsOpacity > 0 && (
          <g opacity={sky.starsOpacity} style={{ transition: 'opacity 1s ease' }}>
            {stars.map((star, i) => (
              <circle
                key={i}
                cx={star.x}
                cy={star.y}
                r={star.r}
                fill="white"
                style={{
                  animation: isActive
                    ? `twinkle-${animId} ${star.dur}s infinite ${star.delay}s`
                    : 'none',
                }}
              />
            ))}
          </g>
        )}

        {/* Sun / Moon */}
        {sky.sunVisible && sky.sunOpacity > 0 && (
          <g opacity={sky.sunOpacity} style={{ transition: 'opacity 0.5s ease' }}>
            {/* Glow */}
            <circle
              cx={sky.sunX} cy={sky.sunY}
              r={sky.sunRadius * 2.5}
              fill={`url(#sunGlow-${animId})`}
            />
            {/* Sun disc */}
            <circle
              cx={sky.sunX} cy={sky.sunY}
              r={sky.sunRadius}
              fill={sky.isDawn || sky.isGolden ? '#FF9944' : '#FFE066'}
              style={{
                animation: isActive ? `sunPulse-${animId} 4s infinite ease-in-out` : 'none',
                transition: 'fill 0.5s ease',
              }}
            />
          </g>
        )}

        {/* Moon (night only) */}
        {sky.isNight && (
          <g opacity={sky.starsOpacity} style={{ transition: 'opacity 1s ease' }}>
            <circle cx="320" cy="45" r="18" fill="#E8E0D0" />
            <circle cx="328" cy="40" r="14" fill={sky.topColor} />
            {/* Moon glow */}
            <circle cx="320" cy="45" r="30" fill="rgba(200, 195, 180, 0.1)" />
          </g>
        )}

        {/* Clouds */}
        <g opacity={sky.cloudOpacity} style={{ transition: 'opacity 0.5s ease' }}>
          <g style={{
            animation: isActive ? `cloudDrift-${animId} 60s infinite linear alternate` : 'none',
          }}>
            {/* Cloud 1 */}
            <ellipse cx="80" cy="50" rx="35" ry="12" fill="white" opacity="0.5" />
            <ellipse cx="70" cy="48" rx="20" ry="10" fill="white" opacity="0.6" />
            <ellipse cx="95" cy="47" rx="18" ry="9" fill="white" opacity="0.5" />
          </g>
          <g style={{
            animation: isActive ? `cloudDrift-${animId} 45s infinite linear alternate-reverse` : 'none',
          }}>
            {/* Cloud 2 */}
            <ellipse cx="260" cy="35" rx="30" ry="10" fill="white" opacity="0.4" />
            <ellipse cx="250" cy="33" rx="18" ry="8" fill="white" opacity="0.5" />
            <ellipse cx="275" cy="33" rx="15" ry="7" fill="white" opacity="0.4" />
          </g>
          <g style={{
            animation: isActive ? `cloudDrift-${animId} 55s infinite linear alternate` : 'none',
          }}>
            {/* Cloud 3 */}
            <ellipse cx="170" cy="65" rx="25" ry="9" fill="white" opacity="0.35" />
            <ellipse cx="160" cy="63" rx="15" ry="7" fill="white" opacity="0.4" />
          </g>
        </g>

        {/* Horizon line */}
        <line x1="0" y1="195" x2="400" y2="195" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      </svg>
    </div>
  );
}
