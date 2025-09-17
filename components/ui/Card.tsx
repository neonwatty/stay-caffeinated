'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Responsive Card component with configurable styles
 * Mobile-first design with touch-friendly interactions
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  elevation = 'md',
  padding = 'md',
  rounded = 'lg',
}) => {
  // Elevation styles (shadows)
  const elevationStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  // Border radius styles
  const roundedStyles = {
    none: '',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  // Combine styles
  const combinedClassName = `
    bg-white dark:bg-gray-800
    ${elevationStyles[elevation]}
    ${paddingStyles[padding]}
    ${roundedStyles[rounded]}
    ${hoverable ? 'transition-all duration-200 hover:shadow-xl hover:scale-[1.02] cursor-pointer' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={combinedClassName}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </Component>
  );
};

// Card Header component
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`flex justify-between items-start mb-4 ${className}`}>
      <div className="flex-1">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
};

// Card Body component
interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return (
    <div className={`text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </div>
  );
};

// Card Footer component
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  divider = false,
}) => {
  return (
    <div
      className={`
        mt-4
        ${divider ? 'pt-4 border-t border-gray-200 dark:border-gray-700' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Card Grid component for responsive layouts
interface CardGridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  cols = { default: 1, sm: 1, md: 2, lg: 3 },
  gap = 'md',
  className = '',
}) => {
  const gapStyles = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  };

  const gridCols = `
    grid-cols-${cols.default || 1}
    ${cols.sm ? `sm:grid-cols-${cols.sm}` : ''}
    ${cols.md ? `md:grid-cols-${cols.md}` : ''}
    ${cols.lg ? `lg:grid-cols-${cols.lg}` : ''}
    ${cols.xl ? `xl:grid-cols-${cols.xl}` : ''}
  `;

  return (
    <div
      className={`
        grid
        ${gridCols}
        ${gapStyles[gap]}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
    </div>
  );
};