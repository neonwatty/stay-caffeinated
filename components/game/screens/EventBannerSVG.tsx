'use client';

import { useMemo } from 'react';

export type EventType = 'morningMeeting' | 'codeReview' | 'bugFix' | 'lunchBreak';

interface EventBannerSVGProps {
  eventType: EventType;
  title: string;
  description: string;
  onComplete?: () => void;
  width?: number;
  height?: number;
  isActive?: boolean;
}

/**
 * In-game event announcement banner.
 * Ribbon slides in from top with bounce, shows icon + title + description,
 * then slides out after 4s.
 */
export function EventBannerSVG({
  eventType,
  title,
  description,
  onComplete,
  width = 400,
  height = 120,
  isActive = true,
}: EventBannerSVGProps) {
  const animId = 'eb';

  const theme = useMemo(() => {
    switch (eventType) {
      case 'morningMeeting':
        return { color: '#3B82F6', bg: 'hsl(217, 91%, 95%)', accent: '#2563EB' };
      case 'codeReview':
        return { color: '#8B5CF6', bg: 'hsl(263, 70%, 95%)', accent: '#7C3AED' };
      case 'bugFix':
        return { color: '#EF4444', bg: 'hsl(0, 84%, 95%)', accent: '#DC2626' };
      case 'lunchBreak':
        return { color: '#22C55E', bg: 'hsl(142, 71%, 95%)', accent: '#16A34A' };
    }
  }, [eventType]);

  const keyframes_css = isActive ? `
    @keyframes ebSlideIn-${animId} {
      0% { transform: translateY(-130px); }
      60% { transform: translateY(8px); }
      80% { transform: translateY(-3px); }
      100% { transform: translateY(0); }
    }
    @keyframes ebSlideOut-${animId} {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(-130px); opacity: 0; }
    }
    @keyframes ebIconPop-${animId} {
      0% { transform: scale(0); }
      60% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    @keyframes ebTextFade-${animId} {
      0% { opacity: 0; transform: translateX(10px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    @keyframes ebShimmer-${animId} {
      0% { x: -60; }
      100% { x: 420; }
    }
  ` : '';

  return (
    <div style={{ width, height, display: 'inline-flex' }}>
      {isActive && <style dangerouslySetInnerHTML={{ __html: keyframes_css }} />}
      <svg viewBox="0 0 400 120" width="100%" height="100%">
        {/* Banner container — slides in then out */}
        <g style={{
          animation: isActive
            ? `ebSlideIn-${animId} 0.5s ease-out forwards, ebSlideOut-${animId} 0.4s ease-in 4.5s forwards`
            : 'none',
        }}
        onAnimationEnd={(e) => {
          if (e.animationName.includes('ebSlideOut') && onComplete) onComplete();
        }}>
          {/* Backdrop for readability */}
          <rect x="-20" y="-10" width="440" height="140" rx="16" fill="rgba(0,0,0,0.4)" />

          {/* Shadow */}
          <rect x="8" y="12" width="384" height="96" rx="14" fill="rgba(0,0,0,0.15)" />

          {/* Ribbon shape — main body */}
          <rect x="5" y="8" width="390" height="96" rx="12" fill={theme.bg}
            stroke={theme.color} strokeWidth="2" />

          {/* Ribbon notches on sides */}
          <polygon points="0,8 5,8 5,104 0,104 8,56" fill={theme.color} />
          <polygon points="400,8 395,8 395,104 400,104 392,56" fill={theme.color} />

          {/* Shimmer highlight */}
          <defs>
            <clipPath id={`ebClip-${animId}`}>
              <rect x="5" y="8" width="390" height="96" rx="12" />
            </clipPath>
          </defs>
          <rect x="-60" y="8" width="60" height="96" fill="rgba(255,255,255,0.15)"
            clipPath={`url(#ebClip-${animId})`}
            style={{
              animation: isActive ? `ebShimmer-${animId} 1.2s ease-in-out 0.5s forwards` : 'none',
            }}
          />

          {/* Color accent bar at top */}
          <rect x="20" y="10" width="360" height="3" rx="1.5" fill={theme.color} opacity="0.5" />

          {/* Icon circle */}
          <g style={{
            animation: isActive ? `ebIconPop-${animId} 0.4s ease-out 0.3s both` : 'none',
            transformOrigin: '55px 56px',
          }}>
            <circle cx="55" cy="56" r="28" fill={theme.color} opacity="0.15" />
            <circle cx="55" cy="56" r="22" fill={theme.color} />

            {/* Event-specific icon */}
            {eventType === 'morningMeeting' && (
              /* Clock icon */
              <g>
                <circle cx="55" cy="56" r="12" fill="none" stroke="white" strokeWidth="2" />
                <line x1="55" y1="56" x2="55" y2="48" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="55" y1="56" x2="61" y2="56" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="55" cy="56" r="1.5" fill="white" />
              </g>
            )}
            {eventType === 'codeReview' && (
              /* Magnifying glass icon */
              <g>
                <circle cx="52" cy="53" r="9" fill="none" stroke="white" strokeWidth="2" />
                <line x1="58" y1="59" x2="66" y2="67" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                {/* Code brackets inside lens */}
                <text x="52" y="57" fill="white" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  {'</>'}
                </text>
              </g>
            )}
            {eventType === 'bugFix' && (
              /* Bug icon */
              <g>
                <ellipse cx="55" cy="58" rx="7" ry="9" fill="white" opacity="0.9" />
                <circle cx="55" cy="48" r="5" fill="white" opacity="0.9" />
                {/* Antennae */}
                <line x1="52" y1="44" x2="48" y2="39" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="58" y1="44" x2="62" y2="39" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                {/* Legs */}
                <line x1="48" y1="53" x2="43" y2="50" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="48" y1="58" x2="42" y2="58" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="48" y1="63" x2="43" y2="66" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="62" y1="53" x2="67" y2="50" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="62" y1="58" x2="68" y2="58" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="62" y1="63" x2="67" y2="66" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                {/* Body segments */}
                <line x1="48" y1="55" x2="62" y2="55" stroke={theme.color} strokeWidth="0.8" />
                <line x1="48" y1="60" x2="62" y2="60" stroke={theme.color} strokeWidth="0.8" />
              </g>
            )}
            {eventType === 'lunchBreak' && (
              /* Sandwich icon */
              <g>
                {/* Top bread */}
                <path d="M 43 50 Q 49 42 55 42 Q 61 42 67 50 Z" fill="white" opacity="0.9" />
                {/* Fillings */}
                <rect x="42" y="50" width="26" height="3" rx="1" fill="#FFD700" /> {/* cheese */}
                <rect x="42" y="53" width="26" height="3" rx="1" fill="#EF4444" /> {/* tomato */}
                <path d="M 41 56 Q 43 59 45 56 Q 47 59 49 56 Q 51 59 53 56 Q 55 59 57 56 Q 59 59 61 56 Q 63 59 65 56 Q 67 59 69 56"
                  fill="none" stroke="#22C55E" strokeWidth="2" /> {/* lettuce */}
                {/* Bottom bread */}
                <rect x="42" y="59" width="26" height="6" rx="2" fill="white" opacity="0.9" />
              </g>
            )}
          </g>

          {/* Title text */}
          <g style={{
            animation: isActive ? `ebTextFade-${animId} 0.3s ease-out 0.4s both` : 'none',
          }}>
            <text x="95" y="48" fill={theme.accent} fontSize="18" fontFamily="monospace"
              fontWeight="bold">
              {title}
            </text>
          </g>

          {/* Description text */}
          <g style={{
            animation: isActive ? `ebTextFade-${animId} 0.3s ease-out 0.6s both` : 'none',
          }}>
            <text x="95" y="72" fill="rgba(60,60,80,0.7)" fontSize="12" fontFamily="monospace">
              {description}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
