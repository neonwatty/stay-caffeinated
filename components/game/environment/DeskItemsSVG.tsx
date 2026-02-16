'use client';

import { useMemo } from 'react';

interface DeskItemsSVGProps {
  caffeineLevel: number; // 0-100
  drinksConsumed: number;
  width?: number;
  height?: number;
  isActive?: boolean;
}

/**
 * Desk items (laptop, plant, headphones, phone, cup stack) that react to caffeine level.
 *
 * Sleepy (0-30): screen dims, code lines droop, plant wilts, desk lamp flickers
 * Optimal (30-70): bright screen, clean code, perky plant, warm lamp
 * Wired (70+): screen flickers/glitches, plant shakes, papers flutter, too many windows
 */
export function DeskItemsSVG({
  caffeineLevel,
  drinksConsumed,
  width = 400,
  height = 250,
  isActive = true,
}: DeskItemsSVGProps) {
  const level = Math.max(0, Math.min(100, caffeineLevel));

  const state = useMemo(() => {
    const t = level / 100;
    return {
      isSleepy: t < 0.3,
      isOptimal: t >= 0.3 && t <= 0.7,
      isWired: t > 0.7,
      t,
      screenBrightness: t < 0.3 ? 0.4 + t * 1.5 : t > 0.7 ? 0.85 : 0.9,
      screenHue: t < 0.3 ? 220 : t > 0.7 ? 200 : 210,
      plantDroop: t < 0.3 ? 15 + (0.3 - t) * 30 : t > 0.7 ? 5 : 0,
      plantColor: t < 0.3 ? 'hsl(100, 25%, 45%)' : t > 0.7 ? 'hsl(120, 50%, 40%)' : 'hsl(120, 45%, 42%)',
      cursorBlinkSpeed: t < 0.3 ? 2 : t > 0.7 ? 0.3 : 1,
      lampBrightness: t < 0.3 ? 0.3 : t > 0.7 ? 1 : 0.7,
      codeLineOpacity: t < 0.3 ? 0.3 : 0.7,
    };
  }, [level]);

  const cupCount = Math.min(6, Math.floor(drinksConsumed));
  const animId = `di${level}`;

  const keyframes_css = isActive ? `
    @keyframes cursorBlink-${animId} {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes screenFlicker-${animId} {
      0%, 95%, 100% { opacity: ${state.screenBrightness}; }
      96% { opacity: ${state.screenBrightness * 0.5}; }
      97% { opacity: ${state.screenBrightness}; }
      98% { opacity: ${state.screenBrightness * 0.7}; }
    }
    @keyframes plantSway-${animId} {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(${state.isWired ? 4 : state.isSleepy ? -2 : 1}deg); }
    }
    @keyframes lampFlicker-${animId} {
      0%, 90%, 100% { opacity: ${state.lampBrightness}; }
      93% { opacity: ${state.lampBrightness * 0.3}; }
      96% { opacity: ${state.lampBrightness * 0.8}; }
    }
    @keyframes phoneBuzz-${animId} {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(1px, 0); }
      75% { transform: translate(-1px, 0); }
    }
    @keyframes paperFloat-${animId} {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-3px) rotate(2deg); }
    }
    @keyframes codeScroll-${animId} {
      0% { transform: translateY(0); }
      100% { transform: translateY(-8px); }
    }
  ` : '';

  // Code lines for laptop screen
  const codeLines = useMemo(() => {
    const lines = [];
    const colors = ['#61AFEF', '#E06C75', '#98C379', '#C678DD', '#D19A66', '#56B6C2'];
    for (let i = 0; i < 8; i++) {
      const indent = (i % 3) * 8;
      const w = 20 + ((i * 17) % 40);
      lines.push({
        x: 148 + indent,
        y: 68 + i * 10,
        w,
        color: colors[i % colors.length],
        opacity: state.codeLineOpacity,
      });
    }
    return lines;
  }, [state.codeLineOpacity]);

  return (
    <div style={{ width, height, display: 'inline-flex' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes_css }} />}
      <svg viewBox="0 0 400 250" width="100%" height="100%">

        {/* === DESK SURFACE === */}
        <defs>
          <pattern id={`woodGrain-${animId}`} patternUnits="userSpaceOnUse" width="400" height="250">
            <rect width="400" height="250" fill="hsl(28, 35%, 55%)" />
            {/* Grain lines */}
            {[0, 30, 55, 90, 120, 150, 180, 210, 235].map((y, i) => (
              <line key={i} x1="0" y1={y + (i % 2) * 3} x2="400" y2={y + (i % 3) * 2}
                stroke={`hsla(28, 30%, ${48 + (i % 3) * 4}%, 0.3)`}
                strokeWidth={1 + (i % 2)} />
            ))}
          </pattern>
        </defs>
        <rect width="400" height="250" fill={`url(#woodGrain-${animId})`} rx="4" />

        {/* === DESK LAMP (left side) === */}
        <g style={{
          animation: isActive && state.isSleepy ? `lampFlicker-${animId} 3s infinite` : 'none',
          transformOrigin: '55px 200px',
        }}>
          {/* Lamp base */}
          <ellipse cx="55" cy="220" rx="18" ry="5" fill="hsl(0, 0%, 30%)" />
          {/* Lamp arm */}
          <line x1="55" y1="220" x2="50" y2="140" stroke="hsl(0, 0%, 35%)" strokeWidth="3" />
          <line x1="50" y1="140" x2="75" y2="110" stroke="hsl(0, 0%, 35%)" strokeWidth="3" />
          {/* Lamp shade */}
          <path d="M 60 108 L 90 108 L 85 95 L 65 95 Z" fill="hsl(45, 30%, 50%)" />
          {/* Lamp light cone */}
          <path d="M 62 108 L 50 150 L 100 150 L 88 108 Z"
            fill={`rgba(255, 230, 150, ${state.lampBrightness * 0.15})`} />
        </g>

        {/* === LAPTOP === */}
        <g style={{
          animation: isActive && state.isWired ? `screenFlicker-${animId} 2s infinite` : 'none',
        }}>
          {/* Laptop base/keyboard */}
          <path d="M 115 175 L 280 175 L 290 210 L 105 210 Z" fill="hsl(220, 10%, 65%)" />
          {/* Keyboard keys (tiny rectangles) */}
          {[0,1,2,3,4,5,6,7,8].map(i => (
            <rect key={i} x={125 + i * 16} y={183} width="12" height="6" rx="1"
              fill="hsl(220, 10%, 55%)" opacity="0.6" />
          ))}
          {[0,1,2,3,4,5,6,7,8].map(i => (
            <rect key={i} x={122 + i * 16} y={193} width="12" height="6" rx="1"
              fill="hsl(220, 10%, 55%)" opacity="0.6" />
          ))}
          {/* Trackpad */}
          <rect x="175" y="202" width="45" height="5" rx="2" fill="hsl(220, 10%, 58%)" opacity="0.5" />

          {/* Screen */}
          <rect x="125" y="50" width="150" height="125" rx="3" fill="hsl(220, 10%, 25%)" />
          {/* Screen bezel */}
          <rect x="130" y="55" width="140" height="115" rx="2"
            fill={`hsla(${state.screenHue}, 30%, 15%, 1)`}
            opacity={state.screenBrightness}
            style={{ transition: 'opacity 0.5s ease' }} />

          {/* Code lines on screen */}
          <g clipPath={`url(#screenClip-${animId})`}>
            <clipPath id={`screenClip-${animId}`}>
              <rect x="135" y="60" width="130" height="105" />
            </clipPath>
            <g style={{
              animation: isActive && state.isOptimal
                ? `codeScroll-${animId} 8s infinite linear`
                : 'none',
            }}>
              {codeLines.map((line, i) => (
                <rect key={i}
                  x={line.x}
                  y={line.y + (state.isSleepy ? Math.sin(i) * 3 : 0)}
                  width={line.w}
                  height="3"
                  rx="1"
                  fill={line.color}
                  opacity={line.opacity}
                  style={{ transition: 'opacity 0.5s ease, y 0.3s ease' }}
                />
              ))}
            </g>

            {/* Cursor */}
            <rect x="200" y="128" width="2" height="10" fill="#61AFEF"
              style={{
                animation: isActive
                  ? `cursorBlink-${animId} ${state.cursorBlinkSpeed}s infinite step-end`
                  : 'none',
              }} />

            {/* Extra "windows" when wired */}
            {state.isWired && (
              <>
                <rect x="180" y="62" width="80" height="50" rx="2"
                  fill="hsla(0, 0%, 10%, 0.9)" stroke="#444" strokeWidth="1" />
                <rect x="185" y="70" width="30" height="2" rx="1" fill="#E06C75" opacity="0.6" />
                <rect x="185" y="76" width="50" height="2" rx="1" fill="#98C379" opacity="0.6" />
                <rect x="185" y="82" width="25" height="2" rx="1" fill="#61AFEF" opacity="0.6" />
              </>
            )}
          </g>

          {/* Screen hinge */}
          <rect x="170" y="172" width="55" height="4" rx="1" fill="hsl(220, 10%, 55%)" />
        </g>

        {/* === PLANT (right side) === */}
        <g style={{
          transformOrigin: '335px 210px',
          animation: isActive
            ? `plantSway-${animId} ${state.isWired ? '0.5s' : '4s'} infinite ease-in-out`
            : 'none',
        }}>
          {/* Pot */}
          <path d="M 320 215 L 318 240 L 352 240 L 350 215 Z" fill="hsl(15, 50%, 45%)" />
          <rect x="316" y="210" width="38" height="8" rx="2" fill="hsl(15, 45%, 40%)" />
          {/* Soil */}
          <ellipse cx="335" cy="215" rx="16" ry="3" fill="hsl(25, 40%, 25%)" />

          {/* Leaves */}
          <g style={{
            transform: `rotate(${-state.plantDroop}deg)`,
            transformOrigin: '335px 210px',
            transition: 'transform 0.5s ease',
          }}>
            <path d="M 335 210 Q 325 185 310 175"
              fill="none" stroke={state.plantColor} strokeWidth="2.5" />
            <ellipse cx="308" cy="173" rx="10" ry="5"
              fill={state.plantColor} transform="rotate(-30 308 173)" />

            <path d="M 335 210 Q 345 188 355 180"
              fill="none" stroke={state.plantColor} strokeWidth="2.5" />
            <ellipse cx="358" cy="178" rx="9" ry="5"
              fill={state.plantColor} transform="rotate(25 358 178)" />

            <path d="M 335 210 Q 335 190 340 178"
              fill="none" stroke={state.plantColor} strokeWidth="2" />
            <ellipse cx="341" cy="175" rx="7" ry="4"
              fill={state.plantColor} transform="rotate(5 341 175)" />
          </g>
        </g>

        {/* === HEADPHONES (behind laptop) === */}
        <g opacity="0.7">
          <path d="M 95 155 Q 85 125 100 110 Q 115 95 130 110"
            fill="none" stroke="hsl(0, 0%, 30%)" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="90" cy="155" rx="8" ry="10" fill="hsl(0, 0%, 25%)" />
          <ellipse cx="90" cy="155" rx="5" ry="7" fill="hsl(0, 0%, 35%)" />
          <ellipse cx="133" cy="115" rx="6" ry="8" fill="hsl(0, 0%, 25%)" />
        </g>

        {/* === PHONE (right of laptop) === */}
        <g style={{
          animation: isActive && state.isWired ? `phoneBuzz-${animId} 0.1s infinite` : 'none',
        }}>
          <rect x="295" y="180" width="22" height="38" rx="3" fill="hsl(220, 10%, 20%)" />
          <rect x="297" y="184" width="18" height="28" rx="1" fill="hsl(220, 15%, 12%)" />
          {/* Phone notification dot */}
          {state.isWired && (
            <circle cx="314" cy="183" r="3" fill="#FF4444" opacity="0.8" />
          )}
        </g>

        {/* === CUP STACK (right edge) === */}
        {cupCount > 0 && (
          <g>
            {Array.from({ length: cupCount }).map((_, i) => {
              const offsetX = (i % 2) * 8;
              const offsetY = -i * 14;
              const tilt = ((i * 7) % 5) - 2;
              return (
                <g key={i} transform={`translate(${365 + offsetX}, ${225 + offsetY}) rotate(${tilt})`}>
                  {/* Simple cup silhouette */}
                  <path d="M -8 0 L -6 -18 L 6 -18 L 8 0 Z"
                    fill={`hsl(30, 15%, ${80 - i * 3}%)`}
                    stroke="hsl(30, 10%, 70%)" strokeWidth="0.5" />
                  {/* Handle */}
                  <path d="M 6 -14 Q 12 -14 12 -8 Q 12 -2 6 -3"
                    fill="none" stroke="hsl(30, 10%, 70%)" strokeWidth="1.5" />
                  {/* Coffee residue inside */}
                  <path d="M -5 -2 L 5 -2 L 6 0 L -6 0 Z"
                    fill="hsla(25, 50%, 30%, 0.4)" />
                </g>
              );
            })}
          </g>
        )}

        {/* === STICKY NOTES (decorative) === */}
        <rect x="25" y="165" width="28" height="28" rx="1"
          fill="hsl(55, 80%, 75%)" transform="rotate(-5 39 179)"
          style={{
            animation: isActive && state.isWired
              ? `paperFloat-${animId} 2s infinite ease-in-out`
              : 'none',
          }} />
        <line x1="29" y1="173" x2="49" y2="172" stroke="hsl(55, 30%, 55%)" strokeWidth="0.5" />
        <line x1="29" y1="178" x2="45" y2="177" stroke="hsl(55, 30%, 55%)" strokeWidth="0.5" />

        <rect x="5" y="140" width="25" height="25" rx="1"
          fill="hsl(200, 70%, 75%)" transform="rotate(3 17 152)" />
        <line x1="9" y1="148" x2="26" y2="149" stroke="hsl(200, 30%, 55%)" strokeWidth="0.5" />

      </svg>
    </div>
  );
}
