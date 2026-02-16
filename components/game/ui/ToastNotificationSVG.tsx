'use client';

import { useEffect, useState, useCallback } from 'react';

type ToastType = 'info' | 'positive' | 'warning' | 'achievement';
type ToastIcon = 'coffee' | 'lightning' | 'zzz' | 'star' | 'heart';

interface ToastNotificationSVGProps {
  type: ToastType;
  title: string;
  description?: string;
  icon?: ToastIcon;
  duration?: number;        // ms before auto-dismiss
  onDismiss?: () => void;
  isActive?: boolean;
}

const TYPE_COLORS: Record<ToastType, { bg: string; border: string; text: string; accent: string }> = {
  info: { bg: '#1E3A5F', border: '#3B82F6', text: '#93C5FD', accent: '#60A5FA' },
  positive: { bg: '#1A3A2A', border: '#22C55E', text: '#86EFAC', accent: '#4ADE80' },
  warning: { bg: '#3A2A1A', border: '#EF4444', text: '#FCA5A5', accent: '#F87171' },
  achievement: { bg: '#3A331A', border: '#FFD700', text: '#FDE68A', accent: '#FBBF24' },
};

function IconSVG({ icon, color }: { icon: ToastIcon; color: string }) {
  switch (icon) {
    case 'coffee':
      return (
        <g fill={color}>
          <path d="M 4 6 L 3 18 Q 3 20, 5 20 L 15 20 Q 17 20, 16 18 L 15 6 Z" />
          <path d="M 16 9 Q 21 9, 21 13 Q 21 17, 16 16" fill="none" stroke={color} strokeWidth="2" />
        </g>
      );
    case 'lightning':
      return (
        <path d="M 12 2 L 6 12 L 10 12 L 8 22 L 18 10 L 13 10 L 16 2 Z" fill={color} />
      );
    case 'zzz':
      return (
        <g fill="none" stroke={color} strokeWidth="2">
          <path d="M 5 16 L 12 16 L 5 10 L 12 10" />
          <path d="M 13 8 L 18 8 L 13 4 L 18 4" opacity="0.7" />
        </g>
      );
    case 'star':
      return (
        <path d="M 12 2 L 14.5 8.5 L 21.5 9 L 16 14 L 17.5 21 L 12 17.5 L 6.5 21 L 8 14 L 2.5 9 L 9.5 8.5 Z"
          fill={color} />
      );
    case 'heart':
      return (
        <path d="M 12 20 C 5 14 1 10 1 6 C 1 3 3.5 1 6 1 C 8 1 10 2 12 4 C 14 2 16 1 18 1 C 20.5 1 23 3 23 6 C 23 10 19 14 12 20 Z"
          fill={color} />
      );
  }
}

/**
 * Single animated toast notification.
 * Slides in from top with bounce, auto-dismisses after duration.
 * Uses CSS animations to avoid React hydration mismatches.
 */
export function ToastNotificationSVG({
  type,
  title,
  description,
  icon = 'coffee',
  duration = 3000,
  onDismiss,
  isActive = true,
}: ToastNotificationSVGProps) {
  const [phase, setPhase] = useState<'entering' | 'visible' | 'exiting' | 'gone'>('entering');

  useEffect(() => {
    if (!isActive) return;

    // Enter
    const enterTimer = setTimeout(() => setPhase('visible'), 50);

    // Start exit
    const exitTimer = setTimeout(() => setPhase('exiting'), duration);

    // Gone
    const goneTimer = setTimeout(() => {
      setPhase('gone');
      onDismiss?.();
    }, duration + 400);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(goneTimer);
    };
  }, [duration, isActive, onDismiss]);

  if (phase === 'gone') return null;

  const colors = TYPE_COLORS[type];
  const animId = `toast-${type}-${title.slice(0, 8)}`;

  const keyframes = `
    @keyframes toast-enter-${animId} {
      0% { transform: translateY(-100%) scale(0.9); opacity: 0; }
      60% { transform: translateY(8px) scale(1.02); opacity: 1; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }
    @keyframes toast-exit-${animId} {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(-100%); opacity: 0; }
    }
    @keyframes achievement-shimmer-${animId} {
      0%, 100% { opacity: 0; }
      50% { opacity: 0.3; }
    }
  `;

  const animStyle: React.CSSProperties = {
    animation: phase === 'entering' || phase === 'visible'
      ? `toast-enter-${animId} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`
      : `toast-exit-${animId} 0.4s ease-in forwards`,
  };

  return (
    <div style={{
      width: 320,
      ...animStyle,
    }}>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <svg viewBox="0 0 320 72" width="100%" height="auto">
        {/* Background card */}
        <rect x="2" y="2" width="316" height="68" rx="10"
          fill={colors.bg} stroke={colors.border} strokeWidth="2" opacity="0.95" />

        {/* Coffee stain texture border accent */}
        <circle cx="300" cy="60" r="12" fill={colors.border} opacity="0.06" />
        <circle cx="20" cy="12" r="8" fill={colors.border} opacity="0.04" />

        {/* Achievement shimmer */}
        {type === 'achievement' && (
          <rect x="2" y="2" width="316" height="68" rx="10"
            fill="url(#shimmer-grad)"
            style={{ animation: `achievement-shimmer-${animId} 2s infinite` }}
          />
        )}
        {type === 'achievement' && (
          <defs>
            <linearGradient id="shimmer-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0" />
              <stop offset="50%" stopColor="#FFD700" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
            </linearGradient>
          </defs>
        )}

        {/* Icon area */}
        <g transform="translate(14, 22)">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <IconSVG icon={icon} color={colors.accent} />
          </svg>
        </g>

        {/* Title text */}
        <text x="52" y="32" fontSize="15" fontWeight="bold" fill={colors.text}>
          {title}
        </text>

        {/* Description text */}
        {description && (
          <text x="52" y="52" fontSize="11" fill={colors.text} opacity="0.7">
            {description.length > 42 ? description.slice(0, 42) + '...' : description}
          </text>
        )}

        {/* Type indicator dot */}
        <circle cx="305" cy="12" r="4" fill={colors.accent} opacity="0.6" />
      </svg>
    </div>
  );
}

/**
 * Toast queue manager - renders stacked toasts.
 */
interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  icon?: ToastIcon;
  duration?: number;
}

interface ToastQueueProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastQueue({ toasts, onDismiss }: ToastQueueProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 16,
      right: 16,
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <ToastNotificationSVG
            type={toast.type}
            title={toast.title}
            description={toast.description}
            icon={toast.icon}
            duration={toast.duration}
            onDismiss={() => onDismiss(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
