'use client';

import { useMemo } from 'react';

interface CoffeeStainsSVGProps {
  count: number;       // number of drinks consumed (0-10)
  width?: number;
  height?: number;
  isActive?: boolean;
}

/**
 * Decorative overlay of coffee ring stains that accumulate on the desk surface.
 * Each stain is a slightly irregular circle with semi-transparent brown coloring.
 * New stains appear with a "wet" animation (darker, then fading to dry).
 * Positions are deterministic (seeded by drink index).
 */
export function CoffeeStainsSVG({
  count,
  width = 400,
  height = 200,
  isActive = true,
}: CoffeeStainsSVGProps) {
  const stainCount = Math.max(0, Math.min(10, Math.floor(count)));

  // Generate deterministic stain data
  const stains = useMemo(() => {
    const result = [];
    for (let i = 0; i < 10; i++) {
      // Seeded pseudo-random using index
      const seed = (i + 1) * 137.508;
      const x = 40 + ((seed * 7.3) % 320);
      const y = 30 + ((seed * 4.1) % 140);
      const radius = 18 + (i % 3) * 6;
      const rotation = ((seed * 11.7) % 360);
      const opacity = 0.08 + (i % 4) * 0.04;

      // Generate irregular ring path
      const ringWidth = 2 + (i % 3);
      const innerR = radius - ringWidth;
      const outerR = radius;

      // Slight distortion for each stain
      const wobble = [
        1 + ((seed * 1.3) % 0.15),
        1 - ((seed * 2.7) % 0.1),
        1 + ((seed * 3.1) % 0.12),
        1 - ((seed * 4.9) % 0.08),
      ];

      result.push({
        x, y, outerR, innerR, rotation, opacity, wobble,
        hue: 25 + (i % 5) * 3,
        sat: 40 + (i % 3) * 10,
        light: 30 + (i % 4) * 5,
      });
    }
    return result;
  }, []);

  const animId = `cs${stainCount}`;

  const keyframes_css = isActive ? `
    @keyframes stainAppear-${animId} {
      0% { opacity: 0; transform: scale(0.8); }
      30% { opacity: 0.25; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes drying-${animId} {
      0% { filter: saturate(1.5) brightness(0.8); }
      100% { filter: saturate(0.7) brightness(1); }
    }
  ` : '';

  return (
    <div style={{ width, height, display: 'inline-flex' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes_css }} />}
      <svg viewBox="0 0 400 200" width="100%" height="100%">
        <defs>
          {stains.slice(0, stainCount).map((stain, i) => (
            <radialGradient key={`grad-${i}`} id={`stainGrad-${animId}-${i}`}>
              <stop offset="70%" stopColor={`hsla(${stain.hue}, ${stain.sat}%, ${stain.light}%, 0)`} />
              <stop offset="82%" stopColor={`hsla(${stain.hue}, ${stain.sat}%, ${stain.light}%, ${stain.opacity})`} />
              <stop offset="92%" stopColor={`hsla(${stain.hue}, ${stain.sat}%, ${stain.light}%, ${stain.opacity * 1.3})`} />
              <stop offset="100%" stopColor={`hsla(${stain.hue}, ${stain.sat}%, ${stain.light}%, 0)`} />
            </radialGradient>
          ))}
        </defs>

        {stains.slice(0, stainCount).map((stain, i) => {
          const isNewest = i === stainCount - 1;
          return (
            <g
              key={i}
              style={{
                animation: isActive && isNewest
                  ? `stainAppear-${animId} 0.8s ease-out, drying-${animId} 2s ease-out`
                  : 'none',
                transformOrigin: `${stain.x}px ${stain.y}px`,
              }}
            >
              {/* Main ring stain using radial gradient */}
              <ellipse
                cx={stain.x}
                cy={stain.y}
                rx={stain.outerR * stain.wobble[0]}
                ry={stain.outerR * stain.wobble[1]}
                fill={`url(#stainGrad-${animId}-${i})`}
                transform={`rotate(${stain.rotation} ${stain.x} ${stain.y})`}
              />

              {/* Inner fill (very faint) */}
              <ellipse
                cx={stain.x}
                cy={stain.y}
                rx={stain.innerR * stain.wobble[2]}
                ry={stain.innerR * stain.wobble[3]}
                fill={`hsla(${stain.hue}, ${stain.sat - 10}%, ${stain.light + 10}%, ${stain.opacity * 0.3})`}
                transform={`rotate(${stain.rotation + 15} ${stain.x} ${stain.y})`}
              />

              {/* Tiny splash dots near recent stains */}
              {i >= stainCount - 3 && (
                <>
                  <circle
                    cx={stain.x + stain.outerR + 5}
                    cy={stain.y - 3}
                    r="1.5"
                    fill={`hsla(${stain.hue}, ${stain.sat}%, ${stain.light}%, ${stain.opacity * 0.8})`}
                  />
                  <circle
                    cx={stain.x - stain.outerR - 3}
                    cy={stain.y + 5}
                    r="1"
                    fill={`hsla(${stain.hue}, ${stain.sat}%, ${stain.light}%, ${stain.opacity * 0.6})`}
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
