'use client';

import React, { useState } from 'react';
import { Container } from './Container';

interface HeaderProps {
  logo?: React.ReactNode;
  title?: string;
  navigation?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
  }>;
  actions?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

/**
 * Responsive Header component with mobile menu
 * Accessible navigation with keyboard support
 */
export const Header: React.FC<HeaderProps> = ({
  logo,
  title,
  navigation = [],
  actions,
  className = '',
  sticky = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header
      className={`
        bg-white dark:bg-gray-900 shadow-sm
        ${sticky ? 'sticky top-0 z-40' : ''}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            {logo && <div className="flex-shrink-0">{logo}</div>}
            {title && (
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            )}
          </div>

          {/* Desktop navigation */}
          {navigation.length > 0 && (
            <nav className="hidden md:flex items-center gap-1" role="navigation">
              {navigation.map((item, index) => (
                <NavItem key={index} {...item} />
              ))}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}

            {/* Mobile menu button */}
            {navigation.length > 0 && (
              <button
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={toggleMobileMenu}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && navigation.length > 0 && (
          <nav
            className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700"
            role="navigation"
          >
            <div className="flex flex-col gap-1">
              {navigation.map((item, index) => (
                <NavItem key={index} {...item} mobile />
              ))}
            </div>
            {actions && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 sm:hidden">
                {actions}
              </div>
            )}
          </nav>
        )}
      </Container>
    </header>
  );
};

// Navigation item component
interface NavItemProps {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  mobile?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  label,
  href,
  onClick,
  active = false,
  mobile = false,
}) => {
  const baseStyles = mobile
    ? 'block w-full text-left px-3 py-2 rounded-lg'
    : 'px-3 py-2 rounded-lg';

  const activeStyles = active
    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800';

  const combinedClassName = `
    ${baseStyles}
    ${activeStyles}
    font-medium transition-colors
  `.replace(/\s+/g, ' ').trim();

  if (href) {
    return (
      <a
        href={href}
        className={combinedClassName}
        aria-current={active ? 'page' : undefined}
      >
        {label}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={combinedClassName}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </button>
  );
};

// Breadcrumb component for navigation hierarchy
interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
  separator = '/',
}) => {
  return (
    <nav
      className={`flex items-center gap-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-gray-400 dark:text-gray-600" aria-hidden="true">
                {separator}
              </span>
            )}
            {index === items.length - 1 ? (
              <span
                className="text-gray-700 dark:text-gray-300 font-medium"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : item.href ? (
              <a
                href={item.href}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <button
                onClick={item.onClick}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};