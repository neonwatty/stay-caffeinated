'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Accessible Button component with multiple variants and sizes
 * Follows WCAG 2.1 accessibility guidelines
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      icon,
      children,
      className = '',
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    // Base styles for all buttons
    const baseStyles = `
      inline-flex items-center justify-center font-medium rounded-lg
      transition-all duration-200 transform
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      active:scale-95
    `;

    // Variant styles
    const variantStyles: Record<ButtonVariant, string> = {
      primary: `
        bg-indigo-600 text-white hover:bg-indigo-700
        focus:ring-indigo-500
      `,
      secondary: `
        bg-gray-200 text-gray-900 hover:bg-gray-300
        focus:ring-gray-500
      `,
      danger: `
        bg-red-600 text-white hover:bg-red-700
        focus:ring-red-500
      `,
      success: `
        bg-green-600 text-white hover:bg-green-700
        focus:ring-green-500
      `,
      ghost: `
        bg-transparent text-gray-700 hover:bg-gray-100
        focus:ring-gray-500
      `,
    };

    // Size styles
    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-sm px-3 py-1.5 gap-1.5',
      md: 'text-base px-4 py-2 gap-2',
      lg: 'text-lg px-6 py-3 gap-3',
    };

    // Combine all styles
    const combinedClassName = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.replace(/\s+/g, ' ').trim();

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={`${combinedClassName} touch-target touch-feedback`}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && icon && <span className="inline-block">{icon}</span>}
        {children && <span>{children}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Button Group component for related actions
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  align = 'left'
}) => {
  const alignmentStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div
      className={`flex flex-wrap gap-2 ${alignmentStyles[align]} ${className}`}
      role="group"
    >
      {children}
    </div>
  );
};