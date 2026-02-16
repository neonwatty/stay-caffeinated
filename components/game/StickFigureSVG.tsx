'use client';

import { useMemo } from 'react';

interface StickFigureSVGProps {
  caffeineLevel: number; // 0-100
  width?: number;
  height?: number;
  isActive?: boolean;
}

/**
 * Minimalist stick figure developer that reacts to caffeine level.
 * XKCD-style clean lines with expressive animations.
 * 4 states: sleepy, optimal, wired, plaid (90%+).
 */
export function StickFigureSVG({
  caffeineLevel,
  width = 400,
  height = 400,
  isActive = true,
}: StickFigureSVGProps) {
  const level = Math.max(0, Math.min(100, caffeineLevel));
  const animId = 'sf';

  const state = useMemo(() => {
    const t = level / 100;
    const isSleepy = t < 0.3;
    const isOptimal = t >= 0.3 && t < 0.7;
    const isWired = t >= 0.7 && t < 0.9;
    const isPlaid = t >= 0.9;

    return {
      t, isSleepy, isOptimal, isWired, isPlaid,
      headTilt: isSleepy ? 20 : 0,
      eyeOpen: isSleepy ? 0.3 : isWired || isPlaid ? 1.5 : 1.0,
      shakeAmt: isWired ? 2 + (t - 0.7) * 12 : isPlaid ? 6 : 0,
      lineColor: isSleepy ? '#667' : isWired ? '#C33' : isPlaid ? '#F44' : '#333',
      bgColor: isSleepy ? 'hsl(220, 20%, 95%)' : isWired ? 'hsl(0, 20%, 96%)' : isPlaid ? '#CC2200' : 'hsl(0, 0%, 97%)',
      typingSpeed: isSleepy ? 0 : isOptimal ? 1 : isWired ? 3 : 0,
    };
  }, [level]);

  const keyframes_css = isActive ? `
    @keyframes sfShake-${animId} {
      0%, 100% { transform: translate(0, 0); }
      20% { transform: translate(${state.shakeAmt}px, ${-state.shakeAmt * 0.3}px); }
      40% { transform: translate(${-state.shakeAmt}px, ${state.shakeAmt * 0.2}px); }
      60% { transform: translate(${state.shakeAmt * 0.7}px, ${state.shakeAmt * 0.3}px); }
      80% { transform: translate(${-state.shakeAmt * 0.5}px, ${-state.shakeAmt * 0.2}px); }
    }
    @keyframes sfZzz-${animId} {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      15% { opacity: 0.6; }
      100% { transform: translateY(-40px) translateX(12px); opacity: 0; }
    }
    @keyframes sfType-${animId} {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }
    @keyframes sfSteam-${animId} {
      0% { opacity: 0.4; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-15px); }
    }
    @keyframes sfSweat-${animId} {
      0% { transform: translateY(0); opacity: 0.6; }
      100% { transform: translateY(12px); opacity: 0; }
    }
    @keyframes sfDroop-${animId} {
      0%, 70%, 100% { transform: rotate(0deg); }
      85% { transform: rotate(10deg); }
    }
    @keyframes sfPlaidFlash-${animId} {
      0% { opacity: 0; }
      15% { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes sfSpeedLine-${animId} {
      0% { transform: translateX(-400px); }
      100% { transform: translateX(400px); }
    }
    @keyframes sfPlaidPulse-${animId} {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 0.95; }
    }
    @keyframes sfBlur-${animId} {
      0%, 100% { filter: blur(0); transform: translateX(0); }
      30% { filter: blur(2px); transform: translateX(3px); }
      60% { filter: blur(0); transform: translateX(-2px); }
      90% { filter: blur(3px); transform: translateX(4px); }
    }
    @keyframes sfBlink-${animId} {
      0%, 90%, 100% { transform: scaleY(1); }
      94% { transform: scaleY(0.1); }
    }
  ` : '';

  // Plaid pattern colors
  const plaid = { bg1: '#CC2200', bg2: '#003366', ln1: '#FFCC00', ln2: '#228B22', ln3: '#FFF' };

  return (
    <div style={{ width, height, display: 'inline-flex' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes_css }} />}
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <pattern id={`sfPlaid-${animId}`} width="30" height="30" patternUnits="userSpaceOnUse">
            <rect width="30" height="30" fill={plaid.bg1} />
            <rect x="0" y="0" width="15" height="30" fill={plaid.bg2} opacity="0.55" />
            <rect x="0" y="0" width="30" height="15" fill={plaid.bg2} opacity="0.35" />
            <line x1="7" y1="0" x2="7" y2="30" stroke={plaid.ln1} strokeWidth="1.5" opacity="0.7" />
            <line x1="22" y1="0" x2="22" y2="30" stroke={plaid.ln3} strokeWidth="1" opacity="0.4" />
            <line x1="0" y1="7" x2="30" y2="7" stroke={plaid.ln2} strokeWidth="1.5" opacity="0.6" />
            <line x1="0" y1="22" x2="30" y2="22" stroke={plaid.ln1} strokeWidth="1" opacity="0.4" />
          </pattern>
        </defs>

        {/* === BACKGROUND === */}
        {state.isPlaid ? (
          <g>
            <rect width="400" height="400" fill="white"
              style={{ animation: isActive ? `sfPlaidFlash-${animId} 0.4s ease-out forwards` : 'none' }} />
            {/* Speed lines */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
              <rect key={i}
                x="-100" y={15 + i * 40} width="500" height={2 + (i % 3)}
                fill={i % 2 === 0 ? '#FFF' : '#FFDD00'} opacity={0.3 + (i % 3) * 0.12}
                style={{ animation: isActive ? `sfSpeedLine-${animId} ${0.25 + (i % 4) * 0.08}s linear infinite` : 'none' }}
              />
            ))}
            <rect width="400" height="400" fill={`url(#sfPlaid-${animId})`}
              style={{ animation: isActive ? `sfPlaidPulse-${animId} 0.5s infinite` : 'none' }} />
          </g>
        ) : (
          <rect width="400" height="400" fill={state.bgColor} />
        )}

        {/* === STICK FIGURE CHARACTER === */}
        <g style={{
          animation: isActive && (state.isWired || state.isPlaid)
            ? state.isPlaid
              ? `sfBlur-${animId} 0.12s infinite, sfShake-${animId} 0.08s infinite`
              : `sfShake-${animId} ${0.18 - state.shakeAmt * 0.006}s infinite`
            : 'none',
          transformOrigin: '200px 250px',
        }}>

          {/* Simple desk line */}
          <line x1="100" y1="305" x2="300" y2="305" stroke={state.lineColor} strokeWidth="2.5" />
          {/* Desk legs */}
          <line x1="110" y1="305" x2="110" y2="380" stroke={state.lineColor} strokeWidth="2" />
          <line x1="290" y1="305" x2="290" y2="380" stroke={state.lineColor} strokeWidth="2" />

          {/* Laptop — simple rectangle */}
          <rect x="160" y="280" width="70" height="5" rx="1" stroke={state.lineColor} fill="none" strokeWidth="2" />
          <rect x="165" y="245" width="60" height="35" rx="2" stroke={state.lineColor} fill="none" strokeWidth="2" />
          {/* Screen lines */}
          {[0, 1, 2].map(i => (
            <line key={`sl-${i}`} x1="172" y1={255 + i * 9} x2={195 + (i * 13) % 20} y2={255 + i * 9}
              stroke={state.isSleepy ? '#AAA' : '#6A6'} strokeWidth="1.5" />
          ))}

          {/* Mug on desk */}
          <rect x="248" y="290" width="14" height="15" rx="2" stroke={state.lineColor} fill="none" strokeWidth="2" />
          <path d="M 262 293 Q 270 293 270 298 Q 270 303 262 302" fill="none" stroke={state.lineColor} strokeWidth="1.5" />
          {/* Coffee inside */}
          <rect x="250" y={305 - state.t * 12} width="10" height={state.t * 12} fill="hsl(25, 50%, 35%)" rx="1" />
          {/* Steam */}
          {state.isOptimal && isActive && [0, 1].map(i => (
            <path key={`st-${i}`}
              d={`M ${252 + i * 5} 290 Q ${254 + i * 5} 283 ${251 + i * 6} 278`}
              fill="none" stroke="#999" strokeWidth="1" strokeLinecap="round"
              style={{ animation: `sfSteam-${animId} ${1.2 + i * 0.3}s ease-out ${i * 0.4}s infinite` }}
            />
          ))}

          {/* Extra mugs (wired) */}
          {state.isWired && (
            <g opacity="0.5">
              <rect x="120" y="296" width="10" height="9" rx="1" stroke={state.lineColor} fill="none" strokeWidth="1.5" transform="rotate(-8, 125, 300)" />
              <rect x="135" y="297" width="10" height="9" rx="1" stroke={state.lineColor} fill="none" strokeWidth="1.5" transform="rotate(5, 140, 301)" />
            </g>
          )}

          {/* Chair */}
          <path d="M 180 310 Q 175 315 180 320 L 220 320 Q 225 315 220 310"
            fill="none" stroke={state.lineColor} strokeWidth="2" />
          <line x1="200" y1="320" x2="200" y2="350" stroke={state.lineColor} strokeWidth="2" />
          <line x1="185" y1="350" x2="215" y2="350" stroke={state.lineColor} strokeWidth="2" />

          {/* === BODY === */}
          {/* Spine */}
          <line x1="200" y1="195" x2="200" y2="310" stroke={state.lineColor} strokeWidth="2.5" />

          {/* Arms */}
          {state.isSleepy ? (
            /* One arm propping chin, other dangling */
            <g>
              <path d="M 200 220 Q 165 235 170 200" fill="none" stroke={state.lineColor} strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 200 230 Q 230 260 225 280" fill="none" stroke={state.lineColor} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ) : (
            /* Arms to keyboard */
            <g>
              <path d="M 200 225 Q 170 260 172 283" fill="none" stroke={state.lineColor} strokeWidth="2.5" strokeLinecap="round"
                style={{
                  animation: isActive && state.typingSpeed > 0
                    ? `sfType-${animId} ${state.isWired ? 0.12 : 0.3}s infinite`
                    : 'none',
                }} />
              <path d="M 200 225 Q 225 260 222 283" fill="none" stroke={state.lineColor} strokeWidth="2.5" strokeLinecap="round"
                style={{
                  animation: isActive && state.typingSpeed > 0
                    ? `sfType-${animId} ${state.isWired ? 0.1 : 0.25}s infinite 0.08s`
                    : 'none',
                }} />
            </g>
          )}

          {/* === HEAD === */}
          <g style={{
            animation: isActive && state.isSleepy ? `sfDroop-${animId} 3s ease-in-out infinite` : 'none',
            transformOrigin: '200px 195px',
          }}>
            {/* Head circle */}
            <circle cx="200" cy="155" r="35" fill="none" stroke={state.lineColor} strokeWidth="2.5" />

            {/* Eyes */}
            <g style={{
              animation: isActive && state.isOptimal ? `sfBlink-${animId} 3.5s infinite` : 'none',
              transformOrigin: '200px 150px',
            }}>
              {state.isSleepy ? (
                /* Sleepy — half lines */
                <g>
                  <line x1="183" y1="150" x2="193" y2="150" stroke={state.lineColor} strokeWidth="2" strokeLinecap="round" />
                  <line x1="207" y1="150" x2="217" y2="150" stroke={state.lineColor} strokeWidth="2" strokeLinecap="round" />
                </g>
              ) : state.isWired || state.isPlaid ? (
                /* Wired — big circles with tiny pupils */
                <g>
                  <circle cx="188" cy="148" r="8" fill="none" stroke={state.lineColor} strokeWidth="2" />
                  <circle cx="212" cy="148" r="8" fill="none" stroke={state.lineColor} strokeWidth="2" />
                  <circle cx="188" cy="148" r="2" fill={state.lineColor} />
                  <circle cx="212" cy="148" r="2" fill={state.lineColor} />
                  {/* Bloodshot lines */}
                  {state.isWired && (
                    <g opacity="0.4">
                      <line x1="181" y1="145" x2="183" y2="148" stroke="red" strokeWidth="0.8" />
                      <line x1="219" y1="145" x2="217" y2="148" stroke="red" strokeWidth="0.8" />
                    </g>
                  )}
                </g>
              ) : (
                /* Normal — dot eyes */
                <g>
                  <circle cx="188" cy="150" r="3" fill={state.lineColor} />
                  <circle cx="212" cy="150" r="3" fill={state.lineColor} />
                </g>
              )}
            </g>

            {/* Mouth */}
            {state.isSleepy ? (
              /* Yawn — open circle */
              <circle cx="200" cy="168" r="5" fill="none" stroke={state.lineColor} strokeWidth="2" />
            ) : state.isOptimal ? (
              /* Slight smile */
              <path d="M 192 166 Q 200 174 208 166" fill="none" stroke={state.lineColor} strokeWidth="2" strokeLinecap="round" />
            ) : state.isWired ? (
              /* Grimace — wavy */
              <path d="M 190 168 Q 195 165 200 168 Q 205 171 210 168" fill="none" stroke={state.lineColor} strokeWidth="2" strokeLinecap="round" />
            ) : (
              /* Plaid — open scream */
              <ellipse cx="200" cy="168" rx="6" ry="8" fill="none" stroke={state.lineColor} strokeWidth="2" />
            )}

            {/* Messy hair lines (wired/plaid) */}
            {(state.isWired || state.isPlaid) && (
              <g>
                <line x1="190" y1="122" x2="186" y2="112" stroke={state.lineColor} strokeWidth="2" strokeLinecap="round" />
                <line x1="200" y1="120" x2="200" y2="108" stroke={state.lineColor} strokeWidth="2" strokeLinecap="round" />
                <line x1="210" y1="122" x2="214" y2="112" stroke={state.lineColor} strokeWidth="2" strokeLinecap="round" />
              </g>
            )}
          </g>

          {/* Sweat drops (wired/plaid) */}
          {(state.isWired || state.isPlaid) && isActive && (
            <g>
              <circle cx="165" cy="140" r="2" fill="#69C"
                style={{ animation: `sfSweat-${animId} 0.8s ease-in infinite` }} />
              <circle cx="238" cy="145" r="1.5" fill="#69C"
                style={{ animation: `sfSweat-${animId} 1s ease-in 0.3s infinite` }} />
            </g>
          )}

          {/* Zzz (sleepy) */}
          {state.isSleepy && isActive && (
            <g>
              <g style={{ animation: `sfZzz-${animId} 2.5s infinite 0.3s` }}>
                <text x="238" y="130" fill="#88A" fontSize="14" fontFamily="monospace" fontWeight="bold">z</text>
              </g>
              <g style={{ animation: `sfZzz-${animId} 3s infinite 0.8s` }}>
                <text x="248" y="115" fill="#88A" fontSize="18" fontFamily="monospace" fontWeight="bold">z</text>
              </g>
              <g style={{ animation: `sfZzz-${animId} 3.5s infinite 1.3s` }}>
                <text x="255" y="100" fill="#88A" fontSize="22" fontFamily="monospace" fontWeight="bold">z</text>
              </g>
            </g>
          )}
        </g>

        {/* Plaid overlay speed streaks on character */}
        {state.isPlaid && isActive && (
          <g opacity="0.25">
            {[0, 1, 2, 3].map(i => (
              <rect key={i}
                x="160" y={140 + i * 45} width="80" height={2 + (i % 2)}
                fill={i % 2 ? '#FFF' : '#FFDD00'}
                style={{ animation: `sfSpeedLine-${animId} ${0.18 + i * 0.04}s linear infinite` }}
              />
            ))}
          </g>
        )}

        {/* Labels */}
        {state.isPlaid && isActive && (
          <g>
            <text x="200" y="35" fill="#FFDD00" fontSize="20" fontFamily="monospace"
              textAnchor="middle" fontWeight="bold" stroke="#000" strokeWidth="0.5">
              LUDICROUS SPEED!
            </text>
            <text x="200" y="390" fill="#FFDD00" fontSize="14" fontFamily="monospace"
              textAnchor="middle" opacity="0.8" stroke="#000" strokeWidth="0.3">
              They&apos;ve gone to plaid!
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
