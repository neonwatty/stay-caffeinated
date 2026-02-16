'use client';

import { useMemo } from 'react';

interface OfficeWorkerSVGProps {
  caffeineLevel: number; // 0-100
  width?: number;
  height?: number;
  isActive?: boolean;
}

/**
 * Detailed office worker character that reacts to caffeine level.
 * 4 states:
 *   - Sleepy   (0-30):  drooping head, heavy lids, Zzz, blue/grey
 *   - Optimal  (30-70): alert, typing, steam, warm tones
 *   - Wired    (70-90): huge eyes, jittery, sweat, red tint
 *   - Plaid    (90-100): full Spaceballs — speed lines morph to tartan, character blurs
 */
export function OfficeWorkerSVG({
  caffeineLevel,
  width = 400,
  height = 400,
  isActive = true,
}: OfficeWorkerSVGProps) {
  const level = Math.max(0, Math.min(100, caffeineLevel));
  const animId = 'ow';

  const state = useMemo(() => {
    const t = level / 100;
    const isSleepy = t < 0.3;
    const isOptimal = t >= 0.3 && t < 0.7;
    const isWired = t >= 0.7 && t < 0.9;
    const isPlaid = t >= 0.9;

    // Head tilt (sleepy droops forward)
    const headTilt = isSleepy ? 15 * (1 - t / 0.3) : isPlaid ? 0 : 0;
    // Eye openness
    const eyeOpen = isSleepy ? 0.3 + (t / 0.3) * 0.5 : isWired || isPlaid ? 1.4 : 1.0;
    // Pupil size
    const pupilR = isSleepy ? 3 : isWired ? 5 : isPlaid ? 6 : 4;
    // Mouth
    const mouthCurve = isSleepy ? -8 : isOptimal ? 12 : isWired ? -5 : 0;
    // Body hue shift
    const skinTone = isSleepy ? 'hsl(220, 15%, 78%)' : isWired ? 'hsl(15, 45%, 80%)' : isPlaid ? 'hsl(0, 60%, 85%)' : 'hsl(30, 40%, 82%)';
    // Shake intensity
    const shakeAmt = isWired ? 3 + (t - 0.7) * 15 : isPlaid ? 8 : 0;
    // Steam
    const steamOpacity = isSleepy ? 0 : isOptimal ? 0.5 + (t - 0.3) * 0.5 : 0.3;
    // Coffee fill
    const coffeeFill = 0.15 + t * 0.7;
    // Number of empty mugs
    const emptyMugs = isWired ? Math.floor((t - 0.7) * 15) : isPlaid ? 3 : 0;
    // Sweat
    const showSweat = isWired || isPlaid;
    // Bloodshot
    const bloodshot = isWired || isPlaid;
    // Typing speed
    const typingSpeed = isSleepy ? 0 : isOptimal ? 1 : isWired ? 3 : 0;

    return {
      t, isSleepy, isOptimal, isWired, isPlaid,
      headTilt, eyeOpen, pupilR, mouthCurve, skinTone,
      shakeAmt, steamOpacity, coffeeFill, emptyMugs,
      showSweat, bloodshot, typingSpeed,
    };
  }, [level]);

  // Plaid pattern colors
  const plaidColors = useMemo(() => ({
    bg1: '#CC2200', bg2: '#003366', line1: '#FFCC00', line2: '#228B22', line3: '#FFFFFF',
  }), []);

  const keyframes_css = isActive ? `
    @keyframes owShake-${animId} {
      0%, 100% { transform: translate(0, 0); }
      15% { transform: translate(${state.shakeAmt}px, ${-state.shakeAmt * 0.5}px); }
      30% { transform: translate(${-state.shakeAmt}px, ${state.shakeAmt * 0.3}px); }
      45% { transform: translate(${state.shakeAmt * 0.8}px, ${state.shakeAmt * 0.4}px); }
      60% { transform: translate(${-state.shakeAmt * 0.6}px, ${-state.shakeAmt * 0.3}px); }
      75% { transform: translate(${state.shakeAmt * 0.5}px, ${state.shakeAmt * 0.2}px); }
      90% { transform: translate(${-state.shakeAmt * 0.3}px, ${-state.shakeAmt * 0.1}px); }
    }
    @keyframes owSteam-${animId} {
      0% { transform: translateY(0) scaleX(1); opacity: ${state.steamOpacity}; }
      50% { transform: translateY(-12px) scaleX(1.3); opacity: ${state.steamOpacity * 0.6}; }
      100% { transform: translateY(-25px) scaleX(0.8); opacity: 0; }
    }
    @keyframes owZzz-${animId} {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      15% { opacity: 0.7; }
      100% { transform: translateY(-50px) translateX(15px); opacity: 0; }
    }
    @keyframes owBlink-${animId} {
      0%, 92%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }
    @keyframes owType-${animId} {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-1.5px); }
    }
    @keyframes owSweat-${animId} {
      0% { transform: translateY(0); opacity: 0.7; }
      100% { transform: translateY(15px); opacity: 0; }
    }
    @keyframes owPlaidFlash-${animId} {
      0% { opacity: 0; }
      10% { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes owSpeedLines-${animId} {
      0% { transform: translateX(-500px); }
      100% { transform: translateX(500px); }
    }
    @keyframes owPlaidPulse-${animId} {
      0%, 100% { opacity: 0.85; }
      50% { opacity: 0.95; }
    }
    @keyframes owBlur-${animId} {
      0%, 100% { filter: blur(0px); transform: translateX(0); }
      25% { filter: blur(2px); transform: translateX(4px); }
      50% { filter: blur(0px); transform: translateX(-3px); }
      75% { filter: blur(3px); transform: translateX(5px); }
    }
    @keyframes owHeadDroop-${animId} {
      0%, 70%, 100% { transform: rotate(0deg); }
      85% { transform: rotate(8deg); }
    }
    @keyframes owScreenDim-${animId} {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.5; }
    }
  ` : '';

  return (
    <div style={{ width, height, display: 'inline-flex' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes_css }} />}
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          {/* Plaid pattern */}
          <pattern id={`plaid-${animId}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill={plaidColors.bg1} />
            <rect x="0" y="0" width="20" height="40" fill={plaidColors.bg2} opacity="0.6" />
            <rect x="0" y="0" width="40" height="20" fill={plaidColors.bg2} opacity="0.4" />
            <line x1="10" y1="0" x2="10" y2="40" stroke={plaidColors.line1} strokeWidth="2" opacity="0.7" />
            <line x1="30" y1="0" x2="30" y2="40" stroke={plaidColors.line3} strokeWidth="1" opacity="0.5" />
            <line x1="0" y1="10" x2="40" y2="10" stroke={plaidColors.line2} strokeWidth="2" opacity="0.6" />
            <line x1="0" y1="30" x2="40" y2="30" stroke={plaidColors.line1} strokeWidth="1.5" opacity="0.5" />
            <line x1="20" y1="0" x2="20" y2="40" stroke={plaidColors.line3} strokeWidth="0.5" opacity="0.3" />
            <line x1="0" y1="20" x2="40" y2="20" stroke={plaidColors.line3} strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>

        {/* === PLAID BACKGROUND (90-100%) === */}
        {state.isPlaid && isActive && (
          <g>
            {/* White flash on entry */}
            <rect width="400" height="400" fill="white"
              style={{ animation: `owPlaidFlash-${animId} 0.4s ease-out forwards` }} />

            {/* Speed lines background */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <rect key={`sl-${i}`}
                x="-100" y={30 + i * 50} width="600" height={3 + (i % 3) * 2}
                fill={i % 2 === 0 ? '#FFFFFF' : '#FFDD00'}
                opacity={0.4 + (i % 3) * 0.15}
                style={{
                  animation: `owSpeedLines-${animId} ${0.3 + (i % 4) * 0.1}s linear infinite`,
                }}
              />
            ))}

            {/* Plaid pattern overlay */}
            <rect width="400" height="400" fill={`url(#plaid-${animId})`}
              style={{ animation: `owPlaidPulse-${animId} 0.5s ease-in-out infinite` }} />

            {/* "LUDICROUS SPEED" text */}
            <text x="200" y="60" fill="#FFDD00" fontSize="22" fontFamily="monospace"
              textAnchor="middle" fontWeight="bold" opacity="0.9"
              stroke="#000" strokeWidth="0.8">
              LUDICROUS SPEED!
            </text>
          </g>
        )}

        {/* === NORMAL BACKGROUND === */}
        {!state.isPlaid && (
          <g>
            {/* Office wall */}
            <rect width="400" height="260" fill={state.isSleepy ? 'hsl(220, 15%, 25%)' : state.isWired ? 'hsl(10, 20%, 30%)' : 'hsl(35, 15%, 35%)'} />
            {/* Floor */}
            <rect y="260" width="400" height="140" fill={state.isSleepy ? 'hsl(220, 10%, 20%)' : state.isWired ? 'hsl(10, 15%, 22%)' : 'hsl(25, 12%, 28%)'} />
          </g>
        )}

        {/* === CHARACTER GROUP (shakes when wired, blurs when plaid) === */}
        <g style={{
          animation: isActive && (state.isWired || state.isPlaid)
            ? state.isPlaid
              ? `owBlur-${animId} 0.15s infinite, owShake-${animId} 0.08s infinite`
              : `owShake-${animId} ${0.15 - state.shakeAmt * 0.005}s infinite`
            : 'none',
          transformOrigin: '200px 250px',
        }}>
          {/* === DESK === */}
          <rect x="60" y="280" width="280" height="12" rx="3" fill="hsl(25, 35%, 45%)" />
          {/* Desk front panel */}
          <rect x="70" y="292" width="260" height="80" rx="2" fill="hsl(25, 30%, 38%)" />
          {/* Desk legs */}
          <rect x="80" y="372" width="8" height="28" fill="hsl(25, 25%, 32%)" />
          <rect x="312" y="372" width="8" height="28" fill="hsl(25, 25%, 32%)" />

          {/* === LAPTOP === */}
          <g>
            {/* Laptop base */}
            <rect x="140" y="268" width="100" height="12" rx="2" fill="#555" />
            {/* Laptop screen */}
            <rect x="148" y="205" width="84" height="63" rx="3" fill="#333"
              style={{
                animation: isActive && state.isSleepy ? `owScreenDim-${animId} 3s infinite` : 'none',
              }} />
            {/* Screen content */}
            <rect x="153" y="210" width="74" height="53" rx="2"
              fill={state.isSleepy ? 'hsl(220, 30%, 15%)' : state.isWired ? 'hsl(0, 40%, 20%)' : 'hsl(210, 50%, 18%)'} />
            {/* Code lines on screen */}
            {[0, 1, 2, 3, 4].map(i => (
              <rect key={`code-${i}`}
                x={158 + (i % 2) * 5}
                y={216 + i * 9}
                width={30 + (i * 17) % 35}
                height={3}
                rx={1}
                fill={i % 3 === 0 ? '#6AACF0' : i % 3 === 1 ? '#98D89A' : '#F0C06A'}
                opacity={state.isSleepy ? 0.3 : 0.7}
              />
            ))}
            {/* Cursor blink */}
            {state.isOptimal && isActive && (
              <rect x="185" y="243" width="6" height="8" fill="#AAFFAA" opacity="0.8">
              </rect>
            )}
          </g>

          {/* === COFFEE MUG ON DESK === */}
          <g>
            {/* Mug body */}
            <rect x="260" y="253" width="22" height="27" rx="3" fill="hsl(10, 40%, 90%)" stroke="hsl(10, 30%, 70%)" strokeWidth="1.5" />
            {/* Mug handle */}
            <path d="M 282 258 Q 295 258 295 266 Q 295 275 282 273" fill="none" stroke="hsl(10, 30%, 70%)" strokeWidth="3" strokeLinecap="round" />
            {/* Coffee fill */}
            <rect x="262" y={280 - state.coffeeFill * 22} width="18" height={state.coffeeFill * 22} fill="hsl(25, 55%, 28%)" rx="1" />
            {/* Steam */}
            {state.steamOpacity > 0 && isActive && [0, 1, 2].map(i => (
              <path key={`steam-${i}`}
                d={`M ${265 + i * 6} 253 Q ${268 + i * 6} ${245 - i * 3} ${264 + i * 7} ${238 - i * 3}`}
                fill="none" stroke="rgba(200,200,200,0.5)" strokeWidth="1.5" strokeLinecap="round"
                style={{
                  animation: `owSteam-${animId} ${1.5 + i * 0.3}s ease-out ${i * 0.3}s infinite`,
                  transformOrigin: `${265 + i * 6}px 253px`,
                }}
              />
            ))}
          </g>

          {/* === EXTRA EMPTY MUGS (wired state) === */}
          {state.emptyMugs >= 1 && (
            <rect x="100" y="264" width="18" height="16" rx="2" fill="hsl(10, 30%, 85%)" stroke="hsl(10, 20%, 65%)" strokeWidth="1" transform="rotate(-12, 109, 272)" />
          )}
          {state.emptyMugs >= 2 && (
            <rect x="118" y="266" width="16" height="14" rx="2" fill="hsl(10, 25%, 82%)" stroke="hsl(10, 15%, 60%)" strokeWidth="1" transform="rotate(8, 126, 273)" />
          )}
          {state.emptyMugs >= 3 && (
            <rect x="85" y="268" width="14" height="12" rx="2" fill="hsl(10, 20%, 78%)" stroke="hsl(10, 15%, 58%)" strokeWidth="1" transform="rotate(-5, 92, 274)" />
          )}

          {/* === CHAIR === */}
          <path d="M 150 310 Q 145 295 160 290 L 240 290 Q 255 295 250 310 Z" fill="hsl(220, 30%, 35%)" />
          <rect x="165" y="310" width="70" height="50" rx="3" fill="hsl(220, 30%, 30%)" />
          <rect x="190" y="360" width="20" height="25" fill="#555" />
          {/* Chair wheels */}
          <circle cx="178" cy="390" r="5" fill="#444" />
          <circle cx="222" cy="390" r="5" fill="#444" />

          {/* === BODY (torso + arms) === */}
          <g>
            {/* Torso */}
            <path d="M 170 195 Q 165 240 168 280 L 232 280 Q 235 240 230 195 Z"
              fill={state.isSleepy ? 'hsl(220, 25%, 45%)' : state.isWired ? 'hsl(0, 40%, 50%)' : state.isPlaid ? 'hsl(350, 50%, 45%)' : 'hsl(210, 30%, 50%)'}
              stroke={state.isSleepy ? 'hsl(220, 20%, 35%)' : state.isWired ? 'hsl(0, 30%, 40%)' : 'hsl(210, 25%, 40%)'}
              strokeWidth="1.5" />
            {/* Collar */}
            <path d="M 180 195 L 200 210 L 220 195" fill="none" stroke="white" strokeWidth="2" opacity="0.6" />

            {/* Left arm */}
            {state.isSleepy ? (
              /* Arm propping up chin */
              <path d="M 170 220 Q 140 230 145 200 Q 148 185 165 180"
                fill="none" stroke={state.skinTone} strokeWidth="14" strokeLinecap="round" />
            ) : (
              /* Arms on keyboard */
              <g>
                <path d="M 170 230 Q 150 250 155 268"
                  fill="none" stroke={state.skinTone} strokeWidth="12" strokeLinecap="round" />
                {/* Left hand/fingers */}
                <ellipse cx="157" cy="268" rx="8" ry="5" fill={state.skinTone}
                  style={{
                    animation: isActive && state.typingSpeed > 0
                      ? `owType-${animId} ${0.3 / state.typingSpeed}s infinite`
                      : 'none',
                  }} />
              </g>
            )}

            {/* Right arm */}
            {state.isSleepy ? (
              <path d="M 230 230 Q 250 260 240 270"
                fill="none" stroke={state.skinTone} strokeWidth="12" strokeLinecap="round" />
            ) : (
              <g>
                <path d="M 230 230 Q 240 250 235 268"
                  fill="none" stroke={state.skinTone} strokeWidth="12" strokeLinecap="round" />
                {/* Right hand/fingers */}
                <ellipse cx="234" cy="268" rx="8" ry="5" fill={state.skinTone}
                  style={{
                    animation: isActive && state.typingSpeed > 0
                      ? `owType-${animId} ${0.25 / state.typingSpeed}s infinite ${0.1}s`
                      : 'none',
                  }} />
              </g>
            )}
          </g>

          {/* === HEAD === */}
          <g style={{
            animation: isActive && state.isSleepy
              ? `owHeadDroop-${animId} 3s ease-in-out infinite`
              : 'none',
            transformOrigin: '200px 195px',
            transform: `rotate(${state.headTilt}deg)`,
          }}>
            {/* Neck */}
            <rect x="190" y="175" width="20" height="25" fill={state.skinTone} />

            {/* Head shape */}
            <ellipse cx="200" cy="150" rx="42" ry="48" fill={state.skinTone} />

            {/* Hair */}
            <path d="M 158 140 Q 158 100 200 95 Q 242 100 242 140 Q 235 115 200 110 Q 165 115 158 140 Z"
              fill={state.isSleepy ? 'hsl(30, 25%, 25%)' : 'hsl(30, 35%, 22%)'} />
            {/* Messy hair sticking up (wired/plaid) */}
            {(state.isWired || state.isPlaid) && (
              <g>
                <path d="M 185 102 Q 182 88 188 85" fill="none" stroke="hsl(30, 35%, 22%)" strokeWidth="3" strokeLinecap="round" />
                <path d="M 200 98 Q 200 82 205 80" fill="none" stroke="hsl(30, 35%, 22%)" strokeWidth="3" strokeLinecap="round" />
                <path d="M 215 102 Q 220 87 216 83" fill="none" stroke="hsl(30, 35%, 22%)" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}

            {/* === EYES === */}
            <g style={{
              animation: isActive && state.isOptimal ? `owBlink-${animId} 4s infinite` : 'none',
              transformOrigin: '200px 145px',
            }}>
              {/* Eye whites */}
              <ellipse cx="183" cy="145" rx="13" ry={10 * state.eyeOpen} fill="white"
                stroke={state.bloodshot ? 'hsl(0, 60%, 70%)' : '#ddd'} strokeWidth="1" />
              <ellipse cx="217" cy="145" rx="13" ry={10 * state.eyeOpen} fill="white"
                stroke={state.bloodshot ? 'hsl(0, 60%, 70%)' : '#ddd'} strokeWidth="1" />

              {/* Bloodshot veins */}
              {state.bloodshot && (
                <g opacity="0.5">
                  <line x1="173" y1="142" x2="178" y2="145" stroke="red" strokeWidth="0.5" />
                  <line x1="175" y1="148" x2="179" y2="146" stroke="red" strokeWidth="0.5" />
                  <line x1="227" y1="142" x2="222" y2="145" stroke="red" strokeWidth="0.5" />
                  <line x1="225" y1="149" x2="221" y2="146" stroke="red" strokeWidth="0.5" />
                </g>
              )}

              {/* Pupils */}
              <circle cx="185" cy="146" r={state.pupilR} fill="#2A2A2A" />
              <circle cx="219" cy="146" r={state.pupilR} fill="#2A2A2A" />
              {/* Pupil highlight */}
              <circle cx="183" cy="143" r="2" fill="white" opacity="0.8" />
              <circle cx="217" cy="143" r="2" fill="white" opacity="0.8" />

              {/* Heavy eyelids (sleepy) */}
              {state.isSleepy && (
                <g>
                  <ellipse cx="183" cy={140 - state.eyeOpen * 2} rx="15" ry={12 - state.eyeOpen * 8}
                    fill={state.skinTone} />
                  <ellipse cx="217" cy={140 - state.eyeOpen * 2} rx="15" ry={12 - state.eyeOpen * 8}
                    fill={state.skinTone} />
                </g>
              )}
            </g>

            {/* Eyebrows */}
            <path d={`M 172 ${state.isSleepy ? 132 : state.isWired ? 126 : 130} Q 183 ${state.isSleepy ? 130 : state.isWired ? 120 : 127} 194 ${state.isSleepy ? 132 : state.isWired ? 126 : 130}`}
              fill="none" stroke="hsl(30, 30%, 25%)" strokeWidth="2.5" strokeLinecap="round" />
            <path d={`M 206 ${state.isSleepy ? 132 : state.isWired ? 126 : 130} Q 217 ${state.isSleepy ? 130 : state.isWired ? 120 : 127} 228 ${state.isSleepy ? 132 : state.isWired ? 126 : 130}`}
              fill="none" stroke="hsl(30, 30%, 25%)" strokeWidth="2.5" strokeLinecap="round" />

            {/* Nose */}
            <path d="M 200 150 Q 196 160 200 165 Q 204 160 200 150" fill="none" stroke="hsl(25, 20%, 60%)" strokeWidth="1.5" />

            {/* Mouth */}
            {state.isSleepy ? (
              /* Yawning mouth */
              <ellipse cx="200" cy="175" rx="8" ry="10" fill="#4A2A2A" opacity="0.7" />
            ) : (
              <path d={`M 188 172 Q 200 ${172 + state.mouthCurve} 212 172`}
                fill="none" stroke="#4A2A2A" strokeWidth="2.5" strokeLinecap="round" />
            )}

            {/* Blush */}
            <ellipse cx="170" cy="162" rx="10" ry="5" fill="#FFB5B5"
              opacity={state.isWired ? 0.5 : state.isOptimal ? 0.25 : 0.1} />
            <ellipse cx="230" cy="162" rx="10" ry="5" fill="#FFB5B5"
              opacity={state.isWired ? 0.5 : state.isOptimal ? 0.25 : 0.1} />

            {/* Glasses */}
            <circle cx="183" cy="145" r="16" fill="none" stroke="hsl(220, 15%, 30%)" strokeWidth="2" />
            <circle cx="217" cy="145" r="16" fill="none" stroke="hsl(220, 15%, 30%)" strokeWidth="2" />
            <line x1="199" y1="145" x2="201" y2="145" stroke="hsl(220, 15%, 30%)" strokeWidth="2" />
            <line x1="167" y1="143" x2="160" y2="140" stroke="hsl(220, 15%, 30%)" strokeWidth="1.5" />
            <line x1="233" y1="143" x2="240" y2="140" stroke="hsl(220, 15%, 30%)" strokeWidth="1.5" />

            {/* Forehead veins (wired) */}
            {state.isWired && (
              <g opacity="0.4">
                <path d="M 185 108 Q 182 115 186 120" fill="none" stroke="hsl(0, 50%, 60%)" strokeWidth="1" />
                <path d="M 215 110 Q 218 116 214 122" fill="none" stroke="hsl(0, 50%, 60%)" strokeWidth="1" />
              </g>
            )}
          </g>

          {/* === SWEAT DROPS === */}
          {state.showSweat && isActive && (
            <g>
              <circle cx="158" cy="130" r="3" fill="hsl(200, 80%, 70%)"
                style={{ animation: `owSweat-${animId} 1s ease-in infinite` }} />
              <circle cx="245" cy="135" r="2.5" fill="hsl(200, 80%, 70%)"
                style={{ animation: `owSweat-${animId} 1.2s ease-in 0.3s infinite` }} />
            </g>
          )}

          {/* === ZZZ (sleepy) === */}
          {state.isSleepy && isActive && (
            <g>
              <g style={{ animation: `owZzz-${animId} 2.5s infinite 0.5s` }}>
                <text x="245" y="120" fill="#7788CC" fontSize="16" fontFamily="monospace" fontWeight="bold" opacity="0.6">Z</text>
              </g>
              <g style={{ animation: `owZzz-${animId} 3s infinite 1s` }}>
                <text x="255" y="105" fill="#7788CC" fontSize="22" fontFamily="monospace" fontWeight="bold" opacity="0.4">Z</text>
              </g>
              <g style={{ animation: `owZzz-${animId} 3.5s infinite 1.5s` }}>
                <text x="262" y="88" fill="#7788CC" fontSize="28" fontFamily="monospace" fontWeight="bold" opacity="0.3">Z</text>
              </g>
            </g>
          )}
        </g>

        {/* === PLAID OVERLAY on character (speed streaks) === */}
        {state.isPlaid && isActive && (
          <g opacity="0.3">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <rect key={`cs-${i}`}
                x="150" y={120 + i * 35} width="100" height={2 + (i % 3)}
                fill={i % 2 === 0 ? '#FFFFFF' : '#FFDD00'}
                style={{
                  animation: `owSpeedLines-${animId} ${0.2 + (i % 3) * 0.05}s linear infinite`,
                }}
              />
            ))}
          </g>
        )}

        {/* === PLAID "THEY'VE GONE TO PLAID" text === */}
        {state.isPlaid && isActive && (
          <text x="200" y="385" fill="#FFDD00" fontSize="16" fontFamily="monospace"
            textAnchor="middle" fontWeight="bold" opacity="0.8"
            stroke="#000" strokeWidth="0.5">
            They&apos;ve gone to plaid!
          </text>
        )}
      </svg>
    </div>
  );
}
