import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameMenu, MenuButton, MenuSection } from '../../../components/game/GameMenu';

describe('GameMenu', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Menu',
    children: <div>Menu Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<GameMenu {...defaultProps} />);
    expect(screen.getByText('Test Menu')).toBeInTheDocument();
    expect(screen.getByText('Menu Content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<GameMenu {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Menu')).not.toBeInTheDocument();
  });

  it('displays title when provided', () => {
    render(<GameMenu {...defaultProps} />);
    expect(screen.getByText('Test Menu')).toBeInTheDocument();
  });

  it('shows close button when showCloseButton is true', () => {
    render(<GameMenu {...defaultProps} showCloseButton={true} />);
    const closeButton = screen.getByLabelText('Close menu');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<GameMenu {...defaultProps} showCloseButton={true} />);
    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', () => {
    const { container } = render(<GameMenu {...defaultProps} />);
    const overlay = container.querySelector('.bg-black.bg-opacity-75');
    if (overlay) {
      fireEvent.click(overlay);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('applies custom className', () => {
    const { container } = render(<GameMenu {...defaultProps} className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('renders without overlay when overlay prop is false', () => {
    const { container } = render(<GameMenu {...defaultProps} overlay={false} />);
    const overlay = container.querySelector('.bg-black.bg-opacity-75');
    expect(overlay).not.toBeInTheDocument();
  });
});

describe('MenuButton', () => {
  const defaultProps = {
    onClick: vi.fn(),
    children: 'Click Me',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders button with children', () => {
    render(<MenuButton {...defaultProps} />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<MenuButton {...defaultProps} />);
    fireEvent.click(screen.getByText('Click Me'));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    const { rerender } = render(<MenuButton {...defaultProps} variant="primary" />);
    let button = screen.getByRole('button');
    expect(button.className).toContain('bg-blue-600');

    rerender(<MenuButton {...defaultProps} variant="danger" />);
    button = screen.getByRole('button');
    expect(button.className).toContain('bg-red-600');
  });

  it('applies size classes', () => {
    const { rerender } = render(<MenuButton {...defaultProps} size="small" />);
    let button = screen.getByRole('button');
    expect(button.className).toContain('text-sm');

    rerender(<MenuButton {...defaultProps} size="large" />);
    button = screen.getByRole('button');
    expect(button.className).toContain('text-lg');
  });

  it('disables button when disabled prop is true', () => {
    render(<MenuButton {...defaultProps} disabled={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.className).toContain('cursor-not-allowed');
  });

  it('applies fullWidth styling', () => {
    const { rerender } = render(<MenuButton {...defaultProps} fullWidth={true} />);
    let button = screen.getByRole('button');
    expect(button.className).toContain('w-full');

    rerender(<MenuButton {...defaultProps} fullWidth={false} />);
    button = screen.getByRole('button');
    expect(button.className).not.toContain('w-full');
  });
});

describe('MenuSection', () => {
  it('renders children', () => {
    render(
      <MenuSection>
        <div>Section Content</div>
      </MenuSection>
    );
    expect(screen.getByText('Section Content')).toBeInTheDocument();
  });

  it('displays title when provided', () => {
    render(
      <MenuSection title="Section Title">
        <div>Content</div>
      </MenuSection>
    );
    expect(screen.getByText('Section Title')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MenuSection className="custom-section">
        <div>Content</div>
      </MenuSection>
    );
    expect(container.querySelector('.custom-section')).toBeInTheDocument();
  });
});