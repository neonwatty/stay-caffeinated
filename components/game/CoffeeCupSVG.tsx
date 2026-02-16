'use client';

import { useMemo } from 'react';

export type ExpressionType = 'default' | 'surprise' | 'celebration' | 'disgust' | 'panic' | 'determined';
export type AccessoryType = 'sunglasses' | 'topHat' | 'beanie' | 'devSticker' | 'bowtie' | 'headphones' | 'crownLaurel' | 'sleepMask';

interface CoffeeCupSVGProps {
  caffeineLevel: number; // 0-100
  width?: number;
  height?: number;
  isActive?: boolean;
  expression?: ExpressionType;
  accessories?: AccessoryType[];
}

/**
 * Animated SVG coffee cup character that responds to a caffeine level (0-100).
 * Uses CSS animations (not SVG animate) to avoid React hydration mismatches.
 *
 * Three states:
 *   - Sleepy (0-30): droopy eyes, empty cup, blue tint, Zzz floating
 *   - Optimal (30-70): bright eyes, half-full, warm colors, gentle steam
 *   - Wired (70-100): huge eyes, overflowing, red glow, shaking, lightning
 */
export function CoffeeCupSVG({
  caffeineLevel,
  width = 220,
  height = 220,
  isActive = true,
  expression = 'default',
  accessories = [],
}: CoffeeCupSVGProps) {
  const level = Math.max(0, Math.min(100, caffeineLevel));

  const state = useMemo(() => {
    const t = level / 100;
    const coffeeFillPct = 0.2 + t * 0.7;
    const eyeOpen = t < 0.5 ? 0.3 + t * 1.4 : 1.0 + (t - 0.5) * 0.4;
    const pupilScale = t < 0.3 ? 0.7 : t > 0.7 ? 1.3 + (t - 0.7) * 1.0 : 1.0;
    const shake = t > 0.7 ? (t - 0.7) / 0.3 : 0;
    const steamOpacity = t < 0.2 ? 0 : t < 0.7 ? (t - 0.2) * 1.6 : 0.8;
    const bodyHue = t < 0.3 ? 220 : t > 0.7 ? 10 : 40;
    const bodySat = t < 0.3 ? 30 : t > 0.7 ? 40 : 15;
    const bodyLight = t < 0.3 ? 85 : t > 0.7 ? 90 : 94;
    const mouthCurve = t < 0.3 ? -15 : t > 0.7 ? -8 : 20;
    const blushOpacity = t < 0.3 ? 0.1 : t > 0.7 ? 0.6 : 0.3;
    const coffeeHue = t > 0.7 ? 15 : 25;
    const coffeeSat = 55 + t * 20;
    const coffeeLight = 35 - t * 10;
    return {
      coffeeFillPct, eyeOpen, pupilScale, shake, steamOpacity,
      bodyHue, bodySat, bodyLight, mouthCurve, blushOpacity,
      coffeeHue, coffeeSat, coffeeLight,
      isSleepy: t < 0.3, isWired: t > 0.7, isOptimal: t >= 0.3 && t <= 0.7, t,
    };
  }, [level]);

  // Expression overrides — modify face parameters when an expression is active
  const expr = useMemo(() => {
    switch (expression) {
      case 'surprise':
        return {
          eyeOpen: 1.4, pupilScale: 1.5, mouthCurve: 0,
          showMouthO: true, showExclamation: true, showJump: true,
          blushOpacity: 0.15,
        };
      case 'celebration':
        return {
          eyeOpen: 0.15, pupilScale: 1.0, mouthCurve: 30,
          showHappyEyes: true, showConfetti: true, showBounce: true,
          blushOpacity: 0.5,
        };
      case 'disgust':
        return {
          eyeOpen: 0.6, pupilScale: 0.9, mouthCurve: -5,
          showSquint: true, showTongue: true, showWavyMouth: true,
          blushOpacity: 0.15,
        };
      case 'panic':
        return {
          eyeOpen: 1.2, pupilScale: 0.8, mouthCurve: -12,
          showDartingEyes: true, showSweat: true, showRedAlert: true,
          blushOpacity: 0.1,
        };
      case 'determined':
        return {
          eyeOpen: 0.85, pupilScale: 1.0, mouthCurve: 2,
          showEyebrows: true, showFireAura: true, showSquint: true,
          blushOpacity: 0.2,
        };
      default:
        return null;
    }
  }, [expression]);

  // Apply expression overrides to state
  const face = useMemo(() => ({
    eyeOpen: expr?.eyeOpen ?? state.eyeOpen,
    pupilScale: expr?.pupilScale ?? state.pupilScale,
    mouthCurve: expr?.mouthCurve ?? state.mouthCurve,
    blushOpacity: expr?.blushOpacity ?? state.blushOpacity,
  }), [expr, state.eyeOpen, state.pupilScale, state.mouthCurve, state.blushOpacity]);

  const coffeeTopY = 390 - state.coffeeFillPct * 235;
  const bodyColor = `hsl(${state.bodyHue}, ${state.bodySat}%, ${state.bodyLight}%)`;
  const coffeeColor = `hsl(${state.coffeeHue}, ${state.coffeeSat}%, ${state.coffeeLight}%)`;

  // Generate unique animation name suffix to avoid collisions
  const animId = `cc${level}${expression !== 'default' ? expression[0] : ''}`;

  // CSS keyframes for animations (injected via style tag)
  const keyframes = isActive ? `
    @keyframes steam-${animId} {
      0%, 100% { transform: translateY(0) translateX(0); opacity: 0.5; }
      50% { transform: translateY(-8px) translateX(3px); opacity: 0.2; }
    }
    @keyframes float-${animId} {
      0%, 100% { transform: translateY(0); opacity: 0.7; }
      50% { transform: translateY(-15px); opacity: 0.2; }
    }
    @keyframes shake-${animId} {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(${state.shake * 3}px, ${-state.shake * 2}px); }
      50% { transform: translate(${-state.shake * 4}px, ${state.shake * 1}px); }
      75% { transform: translate(${state.shake * 2}px, ${state.shake * 3}px); }
    }
    @keyframes blink-${animId} {
      0%, 85%, 100% { transform: scaleY(1); }
      90% { transform: scaleY(0.05); }
    }
    @keyframes flash-${animId} {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    @keyframes sparkle-${animId} {
      0%, 100% { opacity: 0.6; r: 3; }
      50% { opacity: 0.1; r: 1.5; }
    }
    @keyframes yawn-${animId} {
      0%, 100% { ry: 10; }
      50% { ry: 14; }
    }
    @keyframes bubble-${animId} {
      0% { transform: translateY(0); opacity: 0.6; }
      100% { transform: translateY(-30px); opacity: 0; }
    }
    @keyframes jump-${animId} {
      0%, 100% { transform: translateY(0); }
      40% { transform: translateY(-20px); }
    }
    @keyframes bounce-${animId} {
      0%, 100% { transform: translateY(0) scaleY(1); }
      30% { transform: translateY(-15px) scaleY(1.05); }
      60% { transform: translateY(0) scaleY(0.95); }
      80% { transform: translateY(-5px) scaleY(1.02); }
    }
    @keyframes confettiFall-${animId} {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
    }
    @keyframes dartEyes-${animId} {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(6px); }
      75% { transform: translateX(-6px); }
    }
    @keyframes sweatDrop-${animId} {
      0% { transform: translateY(0); opacity: 0.8; }
      100% { transform: translateY(20px); opacity: 0; }
    }
    @keyframes fireFlicker-${animId} {
      0%, 100% { opacity: 0.4; transform: scaleY(1); }
      50% { opacity: 0.7; transform: scaleY(1.1); }
    }
    @keyframes tongueOut-${animId} {
      0%, 70%, 100% { transform: scaleY(0); }
      20%, 50% { transform: scaleY(1); }
    }
    @keyframes exclaim-${animId} {
      0% { transform: translateY(10px); opacity: 0; }
      30% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes spinBowtie-${animId} {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes musicNote-${animId} {
      0% { transform: translateY(0) translateX(0); opacity: 0.7; }
      100% { transform: translateY(-25px) translateX(8px); opacity: 0; }
    }
    @keyframes crownShimmer-${animId} {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.7; }
    }
  ` : '';

  return (
    <div style={{ width, height, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg
        viewBox="0 0 500 500"
        width="100%"
        height="100%"
        style={{
          filter: state.isWired
            ? `drop-shadow(0 0 ${8 + state.shake * 12}px rgba(255, 100, 50, ${0.3 + state.shake * 0.4}))`
            : state.isSleepy
              ? 'saturate(0.6) brightness(0.9)'
              : 'none',
          transition: 'filter 0.5s ease',
        }}
      >
        {/* Shake / expression animation wrapper */}
        <g style={{
          animation: isActive
            ? expr?.showJump ? `jump-${animId} 0.6s ease-out`
            : expr?.showBounce ? `bounce-${animId} 0.8s ease-in-out infinite`
            : state.isWired ? `shake-${animId} 0.15s infinite`
            : 'none'
          : 'none',
          transformOrigin: '250px 300px',
        }}>

          {/* MUG BODY */}
          <path
            d="M 150 150 L 135 385 Q 135 415, 165 415 L 335 415 Q 365 415, 350 385 L 335 150 Z"
            fill={bodyColor}
            stroke="hsl(30, 20%, 75%)"
            strokeWidth="3"
            style={{ transition: 'fill 0.5s ease' }}
          />
          {/* Mug rim */}
          <path d="M 145 150 L 340 150" stroke="hsl(30, 15%, 88%)" strokeWidth="8" strokeLinecap="round" />

          {/* COFFEE LIQUID */}
          <clipPath id={`mug-clip-${animId}`}>
            <path d="M 150 150 L 135 385 Q 135 415, 165 415 L 335 415 Q 365 415, 350 385 L 335 150 Z" />
          </clipPath>
          <g clipPath={`url(#mug-clip-${animId})`}>
            <rect
              x="130" y={coffeeTopY} width="250" height={420 - coffeeTopY}
              fill={coffeeColor}
              style={{ transition: 'y 0.8s ease, height 0.8s ease, fill 0.5s ease' }}
            />
            {/* Coffee surface shine */}
            <ellipse cx="250" cy={coffeeTopY} rx="70" ry="6" fill="hsl(30, 40%, 45%)" opacity="0.3" />

            {/* Bubbles when wired */}
            {state.isWired && isActive && (
              <>
                <circle cx="200" cy={coffeeTopY + 15} r="4" fill="hsl(30, 50%, 50%)" opacity="0.6"
                  style={{ animation: `bubble-${animId} 0.8s infinite` }} />
                <circle cx="260" cy={coffeeTopY + 20} r="3" fill="hsl(30, 50%, 50%)" opacity="0.5"
                  style={{ animation: `bubble-${animId} 0.6s infinite 0.2s` }} />
                <circle cx="300" cy={coffeeTopY + 10} r="5" fill="hsl(30, 50%, 50%)" opacity="0.4"
                  style={{ animation: `bubble-${animId} 1s infinite 0.4s` }} />
              </>
            )}
          </g>

          {/* HANDLE */}
          <path d="M 345 210 Q 420 210, 420 290 Q 420 370, 345 350"
            fill="none" stroke="hsl(30, 20%, 75%)" strokeWidth="20" strokeLinecap="round" />
          <path d="M 345 220 Q 408 220, 408 290 Q 408 360, 345 345"
            fill="none" stroke={bodyColor} strokeWidth="12" strokeLinecap="round"
            style={{ transition: 'stroke 0.5s ease' }} />

          {/* FACE */}
          <g>
            {/* Eyes — with expression overrides */}
            {expr?.showHappyEyes ? (
              /* Celebration: happy crescent eyes (^_^) */
              <>
                <path d="M 190 255 Q 205 240 220 255" fill="none" stroke="#3A3A3A" strokeWidth="4" strokeLinecap="round" />
                <path d="M 280 255 Q 295 240 310 255" fill="none" stroke="#3A3A3A" strokeWidth="4" strokeLinecap="round" />
              </>
            ) : (
              /* Normal/expression-modified eyes */
              <g style={{
                animation: isActive && expr?.showDartingEyes
                  ? `dartEyes-${animId} 0.3s infinite`
                  : 'none',
              }}>
                <g style={{
                  transformOrigin: '205px 255px',
                  animation: isActive && state.isWired && !expr ? `blink-${animId} 0.8s infinite` : 'none',
                }}>
                  <ellipse cx="205" cy="255"
                    rx={16 * face.pupilScale} ry={18 * face.eyeOpen}
                    fill="#3A3A3A" style={{ transition: 'rx 0.3s ease, ry 0.3s ease' }} />
                  <ellipse cx="210" cy="248"
                    rx={5 * face.pupilScale} ry={6 * face.eyeOpen}
                    fill="white" opacity="0.85" style={{ transition: 'all 0.3s ease' }} />
                </g>
                <g style={{
                  transformOrigin: '295px 255px',
                  animation: isActive && state.isWired && !expr ? `blink-${animId} 0.8s infinite 0.15s` : 'none',
                }}>
                  {/* Disgust: right eye squints */}
                  <ellipse cx="295" cy="255"
                    rx={16 * face.pupilScale * (expr?.showSquint ? 0.8 : 1)}
                    ry={18 * face.eyeOpen * (expr?.showSquint ? 0.5 : 1)}
                    fill="#3A3A3A" style={{ transition: 'rx 0.3s ease, ry 0.3s ease' }} />
                  <ellipse cx="300" cy="248"
                    rx={5 * face.pupilScale} ry={6 * face.eyeOpen * (expr?.showSquint ? 0.5 : 1)}
                    fill="white" opacity="0.85" style={{ transition: 'all 0.3s ease' }} />
                </g>
              </g>
            )}

            {/* Determined: eyebrows */}
            {expr?.showEyebrows && (
              <>
                <line x1="185" y1={235} x2="225" y2={228}
                  stroke="#3A3A3A" strokeWidth="4" strokeLinecap="round" />
                <line x1="275" y1={228} x2="315" y2={235}
                  stroke="#3A3A3A" strokeWidth="4" strokeLinecap="round" />
              </>
            )}

            {/* Sleepy droopy eyelids */}
            {state.isSleepy && !expr && (
              <>
                <rect x="185" y={237 - 18 * state.eyeOpen} width="40" height={12}
                  fill={bodyColor} style={{ transition: 'all 0.3s ease' }} />
                <rect x="275" y={237 - 18 * state.eyeOpen} width="40" height={12}
                  fill={bodyColor} style={{ transition: 'all 0.3s ease' }} />
              </>
            )}

            {/* Mouth — with expression overrides */}
            {expr?.showMouthO ? (
              /* Surprise: small "o" mouth */
              <ellipse cx="250" cy="315" rx="10" ry="12" fill="#3A3A3A" opacity="0.7" />
            ) : expr?.showWavyMouth ? (
              /* Disgust: wavy/squiggly mouth */
              <path d="M 220 312 Q 235 305 250 315 Q 265 325 280 312"
                fill="none" stroke="#3A3A3A" strokeWidth="4" strokeLinecap="round" />
            ) : (
              /* Normal mouth */
              <path
                d={`M 220 310 Q 250 ${310 + face.mouthCurve}, 280 310`}
                fill="none" stroke="#3A3A3A" strokeWidth="4.5" strokeLinecap="round"
              />
            )}

            {/* Disgust: tongue */}
            {expr?.showTongue && (
              <ellipse cx="255" cy="325" rx="8" ry="6" fill="#E07070"
                style={{
                  transformOrigin: '255px 320px',
                  animation: isActive ? `tongueOut-${animId} 2s infinite` : 'none',
                }} />
            )}

            {/* Yawn for sleepy */}
            {state.isSleepy && !expr && (
              <ellipse cx="250" cy="318" rx="12" ry="10" fill="#2A2A2A" opacity="0.6"
                style={{ animation: isActive ? `yawn-${animId} 3s infinite` : 'none' }} />
            )}

            {/* Cheek blush */}
            <ellipse cx="180" cy="295" rx="18" ry="10"
              fill={state.isWired ? '#FF8888' : expression === 'celebration' ? '#FFB5D5' : '#FFB5B5'}
              opacity={face.blushOpacity} style={{ transition: 'all 0.4s ease' }} />
            <ellipse cx="320" cy="295" rx="18" ry="10"
              fill={state.isWired ? '#FF8888' : expression === 'celebration' ? '#FFB5D5' : '#FFB5B5'}
              opacity={face.blushOpacity} style={{ transition: 'all 0.4s ease' }} />
          </g>

          {/* === EXPRESSION-SPECIFIC EFFECTS === */}

          {/* Surprise: exclamation mark */}
          {expr?.showExclamation && (
            <g style={{ animation: isActive ? `exclaim-${animId} 0.5s ease-out forwards` : 'none' }}>
              <rect x="244" y="60" width="12" height="40" rx="3" fill="#FF6644" />
              <circle cx="250" cy="112" r="6" fill="#FF6644" />
            </g>
          )}

          {/* Celebration: confetti */}
          {expr?.showConfetti && isActive && (
            <g>
              {[
                { x: 180, y: 80, color: '#FF6B6B', delay: 0, rot: 45 },
                { x: 220, y: 60, color: '#4ECDC4', delay: 0.1, rot: 90 },
                { x: 260, y: 70, color: '#FFE66D', delay: 0.2, rot: 135 },
                { x: 300, y: 55, color: '#A78BFA', delay: 0.15, rot: 60 },
                { x: 320, y: 80, color: '#FB923C', delay: 0.05, rot: 120 },
                { x: 200, y: 50, color: '#34D399', delay: 0.25, rot: 30 },
                { x: 280, y: 45, color: '#F472B6', delay: 0.3, rot: 150 },
                { x: 160, y: 65, color: '#60A5FA', delay: 0.12, rot: 75 },
              ].map((c, i) => (
                <rect key={i} x={c.x} y={c.y} width="8" height="4" rx="1"
                  fill={c.color}
                  transform={`rotate(${c.rot} ${c.x + 4} ${c.y + 2})`}
                  style={{
                    animation: `confettiFall-${animId} 1.5s ease-in ${c.delay}s infinite`,
                  }}
                />
              ))}
            </g>
          )}

          {/* Panic: sweat drops */}
          {expr?.showSweat && isActive && (
            <g>
              <ellipse cx="170" cy="220" rx="4" ry="6" fill="#88CCEE" opacity="0.7"
                style={{ animation: `sweatDrop-${animId} 1s infinite` }} />
              <ellipse cx="335" cy="225" rx="3" ry="5" fill="#88CCEE" opacity="0.6"
                style={{ animation: `sweatDrop-${animId} 1.2s infinite 0.3s` }} />
              <ellipse cx="180" cy="235" rx="3" ry="4" fill="#88CCEE" opacity="0.5"
                style={{ animation: `sweatDrop-${animId} 0.9s infinite 0.6s` }} />
            </g>
          )}

          {/* Panic: red exclamation */}
          {expr?.showRedAlert && (
            <g>
              <rect x="244" y="65" width="12" height="35" rx="3" fill="#FF2222" opacity="0.8" />
              <circle cx="250" cy="110" r="5" fill="#FF2222" opacity="0.8" />
            </g>
          )}

          {/* Determined: fire aura */}
          {expr?.showFireAura && isActive && (
            <g opacity="0.5" style={{ animation: `fireFlicker-${animId} 0.8s infinite` }}>
              <path d="M 155 420 Q 145 370 165 340 Q 155 380 170 350 Q 160 400 155 420"
                fill="#FF8C00" opacity="0.4" />
              <path d="M 340 420 Q 350 370 330 340 Q 340 380 325 350 Q 335 400 340 420"
                fill="#FF8C00" opacity="0.4" />
              <path d="M 250 425 Q 240 390 255 360 Q 245 385 260 370 Q 250 405 250 425"
                fill="#FF6600" opacity="0.3" />
            </g>
          )}

          {/* === ACCESSORIES === */}

          {/* Sunglasses */}
          {accessories.includes('sunglasses') && (
            <g>
              <rect x="182" y="243" width="46" height="22" rx="3" fill="#1A1A1A" opacity="0.9" />
              <rect x="272" y="243" width="46" height="22" rx="3" fill="#1A1A1A" opacity="0.9" />
              <line x1="228" y1="254" x2="272" y2="254" stroke="#1A1A1A" strokeWidth="3" />
              <line x1="182" y1="250" x2="165" y2="245" stroke="#1A1A1A" strokeWidth="2" />
              <line x1="318" y1="250" x2="340" y2="245" stroke="#1A1A1A" strokeWidth="2" />
              {/* Lens reflection */}
              <line x1="188" y1="248" x2="198" y2="252" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
              <line x1="278" y1="248" x2="288" y2="252" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* Top Hat */}
          {accessories.includes('topHat') && (
            <g style={{
              transformOrigin: '250px 120px',
              animation: isActive && state.isWired ? `shake-${animId} 0.15s infinite` : 'none',
            }}>
              <rect x="195" y="80" width="110" height="65" rx="4" fill="#1A1A1A" />
              <rect x="175" y="140" width="150" height="12" rx="3" fill="#1A1A1A" />
              {/* Hat band */}
              <rect x="195" y="130" width="110" height="10" fill="#8B4513" />
              <rect x="236" y="128" width="28" height="14" rx="2" fill="#DAA520" />
            </g>
          )}

          {/* Beanie */}
          {accessories.includes('beanie') && (() => {
            const beanieHue = state.isSleepy ? 220 : state.isWired ? 0 : 150;
            return (
              <g>
                <ellipse cx="250" cy="148" rx="100" ry="30"
                  fill={`hsl(${beanieHue}, 50%, 45%)`} />
                <path d="M 160 148 Q 160 100 250 90 Q 340 100 340 148"
                  fill={`hsl(${beanieHue}, 50%, 45%)`} />
                {/* Knit lines */}
                <path d="M 175 130 Q 210 125 250 128 Q 290 125 325 130"
                  fill="none" stroke={`hsl(${beanieHue}, 40%, 38%)`} strokeWidth="2" />
                <path d="M 170 140 Q 210 135 250 138 Q 290 135 330 140"
                  fill="none" stroke={`hsl(${beanieHue}, 40%, 38%)`} strokeWidth="2" />
                {/* Pom-pom */}
                <circle cx="250" cy="85" r="14" fill={`hsl(${beanieHue}, 45%, 55%)`} />
              </g>
            );
          })()}

          {/* Sleep Mask */}
          {accessories.includes('sleepMask') && (
            <g>
              {level < 15 ? (
                /* Pulled down over eyes */
                <>
                  <rect x="172" y="238" width="156" height="28" rx="8" fill="#6B5B95" />
                  <ellipse cx="205" cy="252" rx="22" ry="12" fill="#5A4B84" />
                  <ellipse cx="295" cy="252" rx="22" ry="12" fill="#5A4B84" />
                  <line x1="172" y1="250" x2="155" y2="248" stroke="#6B5B95" strokeWidth="3" />
                  <line x1="328" y1="250" x2="345" y2="248" stroke="#6B5B95" strokeWidth="3" />
                </>
              ) : (
                /* Pushed up on forehead */
                <>
                  <rect x="180" y="158" width="140" height="20" rx="6" fill="#6B5B95" opacity="0.8" />
                  <line x1="180" y1="168" x2="160" y2="170" stroke="#6B5B95" strokeWidth="2" />
                  <line x1="320" y1="168" x2="340" y2="170" stroke="#6B5B95" strokeWidth="2" />
                </>
              )}
            </g>
          )}

          {/* Dev Sticker */}
          {accessories.includes('devSticker') && (
            <g transform="rotate(-8 230 350)">
              <rect x="200" y="335" width="60" height="25" rx="3" fill="white" />
              <rect x="202" y="337" width="56" height="21" rx="2" fill="#F0F0F0" />
              {/* "I <3 CODE" text as shapes */}
              <rect x="207" y="343" width="3" height="9" fill="#333" />
              <path d="M 215 344 L 218 349 L 221 344" fill="#E74C3C" stroke="#E74C3C" strokeWidth="1" />
              <rect x="226" y="343" width="24" height="9" rx="1" fill="none" stroke="#333" strokeWidth="1.5" />
              <line x1="230" y1="345" x2="244" y2="345" stroke="#27AE60" strokeWidth="1.5" />
              <line x1="230" y1="349" x2="240" y2="349" stroke="#3498DB" strokeWidth="1.5" />
            </g>
          )}

          {/* Bowtie */}
          {accessories.includes('bowtie') && (
            <g style={{
              transformOrigin: '250px 340px',
              animation: isActive && expression === 'celebration'
                ? `spinBowtie-${animId} 0.6s ease-out`
                : 'none',
            }}>
              <path d="M 230 340 L 215 325 L 215 355 Z" fill="#E74C3C" />
              <path d="M 270 340 L 285 325 L 285 355 Z" fill="#E74C3C" />
              <circle cx="250" cy="340" r="6" fill="#C0392B" />
            </g>
          )}

          {/* Headphones */}
          {accessories.includes('headphones') && (
            <g>
              {/* Band */}
              <path d="M 160 200 Q 160 110 250 100 Q 340 110 340 200"
                fill="none" stroke="#2C2C2C" strokeWidth="8" strokeLinecap="round" />
              {/* Ear cups */}
              <ellipse cx="158" cy="210" rx="16" ry="22" fill="#2C2C2C" />
              <ellipse cx="158" cy="210" rx="10" ry="16" fill="#3D3D3D" />
              <ellipse cx="342" cy="210" rx="16" ry="22" fill="#2C2C2C" />
              <ellipse cx="342" cy="210" rx="10" ry="16" fill="#3D3D3D" />
              {/* Music notes when optimal */}
              {state.isOptimal && isActive && (
                <g>
                  <g style={{ animation: `musicNote-${animId} 2s infinite` }}>
                    <text x="370" y="190" fontSize="16" fill="#FFE066" opacity="0.6">&#9835;</text>
                  </g>
                  <g style={{ animation: `musicNote-${animId} 2.5s infinite 0.8s` }}>
                    <text x="130" y="185" fontSize="14" fill="#FFE066" opacity="0.5">&#9834;</text>
                  </g>
                </g>
              )}
            </g>
          )}

          {/* Crown Laurel */}
          {accessories.includes('crownLaurel') && (
            <g>
              {/* Left laurel branch */}
              <path d="M 175 150 Q 165 130 180 115 Q 175 125 185 110 Q 180 120 195 108 Q 188 118 205 105 Q 195 115 215 108"
                fill="none" stroke="#DAA520" strokeWidth="2.5" strokeLinecap="round" />
              {/* Right laurel branch */}
              <path d="M 325 150 Q 335 130 320 115 Q 325 125 315 110 Q 320 120 305 108 Q 312 118 295 105 Q 305 115 285 108"
                fill="none" stroke="#DAA520" strokeWidth="2.5" strokeLinecap="round" />
              {/* Leaves */}
              {[
                [178, 125, -20], [185, 112, -10], [198, 106, 0],
                [322, 125, 20], [315, 112, 10], [302, 106, 0],
              ].map(([cx, cy, rot], i) => (
                <ellipse key={i} cx={cx} cy={cy} rx="8" ry="4"
                  fill="#DAA520"
                  transform={`rotate(${rot} ${cx} ${cy})`}
                  opacity="0.8" />
              ))}
              {/* Center gem */}
              <circle cx="250" cy="138" r="5" fill="#FFD700" />
              {/* Shimmer */}
              <circle cx="250" cy="138" r="8" fill="none" stroke="#FFD700" strokeWidth="1"
                style={{ animation: isActive ? `crownShimmer-${animId} 2s infinite` : 'none' }} />
            </g>
          )}

          {/* STEAM */}
          {state.steamOpacity > 0 && (
            <g opacity={state.steamOpacity} style={{ transition: 'opacity 0.5s ease' }}>
              <line x1="210" y1="130" x2="210" y2="70"
                stroke="rgba(200,200,200,0.5)" strokeWidth="4" strokeLinecap="round"
                style={{ animation: isActive ? `steam-${animId} ${state.isWired ? '0.8s' : '2.5s'} infinite` : 'none' }} />
              <line x1="250" y1="125" x2="250" y2="55"
                stroke="rgba(200,200,200,0.4)" strokeWidth="4" strokeLinecap="round"
                style={{ animation: isActive ? `steam-${animId} ${state.isWired ? '0.6s' : '3s'} infinite 0.3s` : 'none' }} />
              <line x1="290" y1="130" x2="290" y2="65"
                stroke="rgba(200,200,200,0.35)" strokeWidth="4" strokeLinecap="round"
                style={{ animation: isActive ? `steam-${animId} ${state.isWired ? '0.7s' : '2.8s'} infinite 0.6s` : 'none' }} />
              {state.isWired && (
                <>
                  <line x1="180" y1="135" x2="185" y2="70"
                    stroke="rgba(200,200,200,0.3)" strokeWidth="3" strokeLinecap="round"
                    style={{ animation: isActive ? `steam-${animId} 0.9s infinite 0.1s` : 'none' }} />
                  <line x1="320" y1="135" x2="315" y2="70"
                    stroke="rgba(200,200,200,0.3)" strokeWidth="3" strokeLinecap="round"
                    style={{ animation: isActive ? `steam-${animId} 0.75s infinite 0.2s` : 'none' }} />
                </>
              )}
            </g>
          )}

          {/* ZZZ (sleepy) */}
          {state.isSleepy && (
            <g>
              <g style={{ animation: isActive ? `float-${animId} 2s infinite` : 'none' }}>
                <rect x="336" y="100" width="22" height="24" rx="3" fill="transparent" />
                <path d="M 340 120 L 355 120 L 340 108 L 355 108" stroke="#7788CC" strokeWidth="3" fill="none" opacity="0.7" />
              </g>
              <g style={{ animation: isActive ? `float-${animId} 2.5s infinite 0.3s` : 'none' }}>
                <path d="M 362 95 L 374 95 L 362 85 L 374 85" stroke="#7788CC" strokeWidth="2.5" fill="none" opacity="0.5" />
              </g>
              <g style={{ animation: isActive ? `float-${animId} 3s infinite 0.6s` : 'none' }}>
                <path d="M 378 75 L 388 75 L 378 67 L 388 67" stroke="#7788CC" strokeWidth="2" fill="none" opacity="0.3" />
              </g>
            </g>
          )}

          {/* LIGHTNING (wired) */}
          {state.isWired && (
            <g>
              <path d="M 155 90 L 142 120 L 160 116 L 145 148"
                fill="none" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: isActive ? `flash-${animId} 0.4s infinite` : 'none' }} />
              <path d="M 345 80 L 358 112 L 340 108 L 355 140"
                fill="none" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: isActive ? `flash-${animId} 0.35s infinite 0.15s` : 'none' }} />
            </g>
          )}

          {/* SPARKLES (optimal) */}
          {state.isOptimal && (
            <g>
              <circle cx="365" cy="170" r="3" fill="#FFE066" opacity="0.6"
                style={{ animation: isActive ? `sparkle-${animId} 2s infinite` : 'none' }} />
              <circle cx="140" cy="200" r="2.5" fill="#FFE066" opacity="0.5"
                style={{ animation: isActive ? `sparkle-${animId} 2.5s infinite 0.5s` : 'none' }} />
              <circle cx="355" cy="380" r="2" fill="#FFE066" opacity="0.4"
                style={{ animation: isActive ? `sparkle-${animId} 1.8s infinite 1s` : 'none' }} />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
