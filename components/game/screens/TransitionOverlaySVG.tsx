'use client';

interface TransitionOverlaySVGProps {
  isActive: boolean;
  direction: 'in' | 'out';
  variant?: 'cup-wipe' | 'coffee-pour';
  onComplete?: () => void;
  width?: number;
  height?: number;
}

/**
 * Scene transition overlay.
 * - "coffee-pour": Brown liquid pours down from top, fills screen, then drains.
 * - "cup-wipe": Giant coffee cup silhouette slides across like a movie wipe.
 * Duration: ~0.6-0.8s total.
 */
export function TransitionOverlaySVG({
  isActive,
  direction,
  variant = 'coffee-pour',
  onComplete,
  width = 500,
  height = 500,
}: TransitionOverlaySVGProps) {
  const animId = 'tr';

  const keyframes_css = isActive ? `
    @keyframes trPourIn-${animId} {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(0); }
    }
    @keyframes trPourOut-${animId} {
      0% { transform: translateY(0); }
      100% { transform: translateY(100%); }
    }
    @keyframes trWipeIn-${animId} {
      0% { transform: translateX(-110%); }
      100% { transform: translateX(0); }
    }
    @keyframes trWipeOut-${animId} {
      0% { transform: translateX(0); }
      100% { transform: translateX(110%); }
    }
    @keyframes trDripIn-${animId} {
      0% { transform: translateY(-20px); opacity: 0; }
      50% { opacity: 0.6; }
      100% { transform: translateY(40px); opacity: 0; }
    }
    @keyframes trSteamWipe-${animId} {
      0% { transform: translateY(0); opacity: 0.3; }
      100% { transform: translateY(-30px); opacity: 0; }
    }
  ` : '';

  const pourAnim = direction === 'in'
    ? `trPourIn-${animId} 0.4s ease-in forwards`
    : `trPourOut-${animId} 0.4s ease-out 0.2s forwards`;

  const wipeAnim = direction === 'in'
    ? `trWipeIn-${animId} 0.5s ease-in-out forwards`
    : `trWipeOut-${animId} 0.5s ease-in-out 0.1s forwards`;

  return (
    <div style={{ width, height, display: 'inline-flex' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes_css }} />}
      <svg viewBox="0 0 500 500" width="100%" height="100%">
        {variant === 'coffee-pour' && (
          <g
            style={{
              animation: isActive ? pourAnim : 'none',
              ...(direction === 'out' ? {} : {}),
            }}
            onAnimationEnd={() => onComplete?.()}
          >
            {/* Main coffee fill */}
            <rect x="0" y="0" width="500" height="500" fill="hsl(25, 55%, 22%)" />

            {/* Wavy top edge */}
            <path
              d="M 0 0 Q 50 12 100 5 Q 150 -2 200 8 Q 250 15 300 4 Q 350 -3 400 7 Q 450 14 500 2 L 500 -20 L 0 -20 Z"
              fill="hsl(25, 55%, 22%)"
            />

            {/* Coffee surface highlights */}
            <ellipse cx="250" cy="12" rx="200" ry="8" fill="hsl(30, 40%, 30%)" opacity="0.4" />

            {/* Drip details at leading edge */}
            {isActive && [0, 1, 2, 3, 4].map(i => (
              <ellipse
                key={i}
                cx={60 + i * 100}
                cy={-5}
                rx={4 + (i % 3)}
                ry={8 + (i % 2) * 3}
                fill="hsl(25, 50%, 25%)"
                style={{
                  animation: `trDripIn-${animId} 0.6s ease-in ${i * 0.08}s infinite`,
                }}
              />
            ))}

            {/* Foam/crema texture */}
            <rect x="0" y="-2" width="500" height="6" fill="hsl(30, 35%, 40%)" opacity="0.3" />
          </g>
        )}

        {variant === 'cup-wipe' && (
          <g
            style={{
              animation: isActive ? wipeAnim : 'none',
            }}
            onAnimationEnd={() => onComplete?.()}
          >
            {/* Background fill behind the cup shape */}
            <rect x="0" y="0" width="500" height="500" fill="hsl(25, 55%, 22%)" />

            {/* Cup silhouette cutout on the leading edge */}
            <g transform={direction === 'in' ? 'translate(460, 80) scale(0.7)' : 'translate(-60, 80) scale(0.7)'}>
              {/* Mug outline */}
              <path
                d="M 0 0 L -15 200 Q -15 240 20 240 L 100 240 Q 135 240 120 200 L 105 0 Z"
                fill="hsl(30, 30%, 85%)"
                stroke="hsl(25, 20%, 65%)"
                strokeWidth="3"
              />
              {/* Handle */}
              <path
                d="M 120 50 Q 170 50 170 120 Q 170 180 120 165"
                fill="none"
                stroke="hsl(25, 20%, 65%)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Coffee inside */}
              <rect x="-10" y="50" width="125" height="145" fill="hsl(25, 60%, 28%)" />
              {/* Happy face */}
              <path d="M 25 100 Q 40 85 55 100" fill="none" stroke="#555" strokeWidth="3" strokeLinecap="round" />
              <path d="M 65 100 Q 80 85 95 100" fill="none" stroke="#555" strokeWidth="3" strokeLinecap="round" />
              <path d="M 35 140 Q 60 165 85 140" fill="none" stroke="#555" strokeWidth="3" strokeLinecap="round" />

              {/* Steam wisps */}
              {isActive && [0, 1, 2].map(i => (
                <path
                  key={i}
                  d={`M ${25 + i * 30} -5 Q ${30 + i * 30} -20 ${25 + i * 30} -30`}
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{
                    animation: `trSteamWipe-${animId} 1s ease-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
