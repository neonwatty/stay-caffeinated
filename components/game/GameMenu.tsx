import React, { ReactNode } from 'react';

export interface GameMenuProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  className?: string;
  overlay?: boolean;
  centered?: boolean;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  className = '',
  overlay = true,
  centered = true,
}) => {
  if (!isOpen) return null;

  const content = (
    <div
      className={`
        ${centered ? 'fixed inset-0 flex items-center justify-center z-50' : ''}
        ${overlay ? '' : 'relative'}
        ${className}
      `}
    >
      {overlay && (
        <div
          className="absolute inset-0 bg-black bg-opacity-75"
          onClick={onClose}
        />
      )}
      <div
        className={`
          relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl
          p-8 max-w-md w-full mx-4
          ${centered ? '' : 'mt-16'}
        `}
      >
        {title && (
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            {title}
          </h2>
        )}
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );

  return content;
};

export interface MenuButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  onClick,
  variant = 'primary',
  size = 'large',
  disabled = false,
  children,
  className = '',
  fullWidth = true,
}) => {
  const baseClasses = `
    font-semibold rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg',
  };

  const variantClasses = {
    primary: `
      bg-blue-600 text-white hover:bg-blue-700
      focus:ring-blue-500 disabled:bg-blue-300
    `,
    secondary: `
      bg-gray-200 text-gray-900 hover:bg-gray-300
      dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600
      focus:ring-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-800
    `,
    danger: `
      bg-red-600 text-white hover:bg-red-700
      focus:ring-red-500 disabled:bg-red-300
    `,
    success: `
      bg-green-600 text-white hover:bg-green-700
      focus:ring-green-500 disabled:bg-green-300
    `,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'cursor-not-allowed opacity-50' : 'transform hover:scale-105'}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export interface MenuSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b dark:border-gray-700">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};