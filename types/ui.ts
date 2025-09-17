/**
 * UI component types and interfaces
 */

import type { ReactNode } from 'react';
import type { AnimationConfig } from './animations';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'drink';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  animation?: AnimationConfig;
  onClick?: () => void;
  children: ReactNode;
}

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'health' | 'caffeine' | 'progress';
  animated?: boolean;
  showLabel?: boolean;
  color?: string;
  warningThreshold?: number;
  dangerThreshold?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlay?: boolean;
  animation?: AnimationConfig;
  children: ReactNode;
}

export interface NotificationProps {
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement';
  message: string;
  description?: string;
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  icon?: ReactNode;
  onClose?: () => void;
}

export interface TooltipProps {
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  arrow?: boolean;
  children: ReactNode;
}

export interface GameHUDProps {
  caffeineLevel: number;
  healthLevel: number;
  score: number;
  timeRemaining: number;
  streak: number;
  showControls?: boolean;
  compact?: boolean;
}

export interface DrinkSelectorProps {
  drinks: string[];
  selectedDrink?: string;
  cooldowns: Map<string, number>;
  onSelect: (drinkId: string) => void;
  disabled?: boolean;
}

export interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onResume?: () => void;
  onRestart?: () => void;
  onQuit?: () => void;
  showSettings?: boolean;
}