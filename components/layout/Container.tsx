'use client';

import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  center?: boolean;
  padding?: boolean;
  fluid?: boolean;
}

/**
 * Responsive Container component for consistent layout spacing
 * Mobile-first with automatic responsive padding
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  maxWidth = 'xl',
  center = true,
  padding = true,
  fluid = false,
}) => {
  // Max width styles
  const maxWidthStyles = {
    sm: 'max-w-sm', // 384px
    md: 'max-w-md', // 448px
    lg: 'max-w-lg', // 512px
    xl: 'max-w-xl', // 576px
    '2xl': 'max-w-2xl', // 672px
    full: 'max-w-full',
  };

  const combinedClassName = `
    ${fluid ? 'w-full' : maxWidthStyles[maxWidth]}
    ${center && !fluid ? 'mx-auto' : ''}
    ${padding ? 'px-4 sm:px-6 lg:px-8' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return <div className={combinedClassName}>{children}</div>;
};

// Section component for page sections
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'none' | 'light' | 'dark' | 'gradient';
  fullHeight?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  spacing = 'md',
  background = 'none',
  fullHeight = false,
}) => {
  // Spacing styles
  const spacingStyles = {
    none: '',
    sm: 'py-4 sm:py-6',
    md: 'py-8 sm:py-12',
    lg: 'py-12 sm:py-16',
    xl: 'py-16 sm:py-24',
  };

  // Background styles
  const backgroundStyles = {
    none: '',
    light: 'bg-gray-50 dark:bg-gray-900',
    dark: 'bg-gray-900 dark:bg-black',
    gradient: 'bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800',
  };

  const combinedClassName = `
    ${spacingStyles[spacing]}
    ${backgroundStyles[background]}
    ${fullHeight ? 'min-h-screen' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return <section className={combinedClassName}>{children}</section>;
};

// Grid layout component
interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export const Grid: React.FC<GridProps> = ({
  children,
  className = '',
  cols = { default: 1, md: 2, lg: 3 },
  gap = 'md',
}) => {
  const gapStyles = {
    sm: 'gap-2 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  };

  // Dynamic grid columns based on breakpoints
  const getGridCols = () => {
    let gridClass = `grid-cols-${cols.default || 1}`;
    if (cols.sm) gridClass += ` sm:grid-cols-${cols.sm}`;
    if (cols.md) gridClass += ` md:grid-cols-${cols.md}`;
    if (cols.lg) gridClass += ` lg:grid-cols-${cols.lg}`;
    if (cols.xl) gridClass += ` xl:grid-cols-${cols.xl}`;
    return gridClass;
  };

  const combinedClassName = `
    grid ${getGridCols()} ${gapStyles[gap]} ${className}
  `.replace(/\s+/g, ' ').trim();

  return <div className={combinedClassName}>{children}</div>;
};

// Flex layout component
interface FlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  wrap?: boolean;
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

export const Flex: React.FC<FlexProps> = ({
  children,
  className = '',
  direction = 'row',
  justify = 'start',
  align = 'stretch',
  wrap = false,
  gap = 'none',
}) => {
  const directionStyles = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  const justifyStyles = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const alignStyles = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  const gapStyles = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const combinedClassName = `
    flex
    ${directionStyles[direction]}
    ${justifyStyles[justify]}
    ${alignStyles[align]}
    ${wrap ? 'flex-wrap' : ''}
    ${gapStyles[gap]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return <div className={combinedClassName}>{children}</div>;
};

// Spacer component for adding space between elements
interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  horizontal?: boolean;
}

export const Spacer: React.FC<SpacerProps> = ({
  size = 'md',
  horizontal = false,
}) => {
  const sizeStyles = {
    xs: horizontal ? 'w-2' : 'h-2',
    sm: horizontal ? 'w-4' : 'h-4',
    md: horizontal ? 'w-6' : 'h-6',
    lg: horizontal ? 'w-8' : 'h-8',
    xl: horizontal ? 'w-12' : 'h-12',
  };

  return <div className={sizeStyles[size]} aria-hidden="true" />;
};