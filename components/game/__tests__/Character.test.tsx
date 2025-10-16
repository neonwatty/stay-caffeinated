import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Character,
  CharacterMood,
  AnimatedCharacter,
} from '../Character';

describe('Character Component', () => {
  describe('State Transitions', () => {
    it('should render under-caffeinated state when level is below 30', () => {
      render(<Character caffeineLevel={20} />);
      const character = screen.getByRole('img', { name: /Character is under-caffeinated/i });
      expect(character).toBeInTheDocument();
    });

    it('should render optimal state when level is between 30-70', () => {
      render(<Character caffeineLevel={50} />);
      const character = screen.getByRole('img', { name: /Character is optimally caffeinated/i });
      expect(character).toBeInTheDocument();
    });

    it('should render over-caffeinated state when level is above 70', () => {
      render(<Character caffeineLevel={85} />);
      const character = screen.getByRole('img', { name: /Character is over-caffeinated/i });
      expect(character).toBeInTheDocument();
    });

    it('should use custom thresholds when provided', () => {
      const customThresholds = {
        underCaffeinated: 40,
        optimal: { min: 40, max: 60 },
        overCaffeinated: 60,
      };

      render(<Character caffeineLevel={35} customThresholds={customThresholds} />);
      const character = screen.getByRole('img', { name: /Character is under-caffeinated/i });
      expect(character).toBeInTheDocument();
    });
  });

  describe('State Change Callback', () => {
    it('should call onStateChange when state transitions', () => {
      const onStateChange = vi.fn();
      const { rerender } = render(
        <Character caffeineLevel={50} onStateChange={onStateChange} />
      );

      rerender(<Character caffeineLevel={25} onStateChange={onStateChange} />);

      expect(onStateChange).toHaveBeenCalledWith('under', 'optimal');
    });

    it('should not call onStateChange when state remains the same', () => {
      const onStateChange = vi.fn();
      const { rerender } = render(
        <Character caffeineLevel={50} onStateChange={onStateChange} />
      );

      rerender(<Character caffeineLevel={55} onStateChange={onStateChange} />);

      expect(onStateChange).not.toHaveBeenCalled();
    });
  });

  describe('Visual Props', () => {
    it('should render with custom width and height', () => {
      render(<Character caffeineLevel={50} width={300} height={300} />);
      const svg = screen.getByRole('img', { name: /optimally caffeinated character/i });
      expect(svg).toHaveAttribute('width', '300');
      expect(svg).toHaveAttribute('height', '300');
    });

    it('should show state label when showStateLabel is true', () => {
      render(<Character caffeineLevel={50} showStateLabel={true} />);
      expect(screen.getByText('Optimally Caffeinated')).toBeInTheDocument();
    });

    it('should not show state label by default', () => {
      render(<Character caffeineLevel={50} />);
      expect(screen.queryByText('Optimally Caffeinated')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Character caffeineLevel={50} className="custom-class" />);
      const container = screen.getByRole('img', { name: /Character is optimally caffeinated/i });
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Character caffeineLevel={50} />);
      const character = screen.getByRole('img', { name: /Character is optimally caffeinated/i });
      expect(character).toBeInTheDocument();
    });

    it('should announce caffeine level to screen readers', () => {
      render(<Character caffeineLevel={65} />);
      const srOnly = screen.getByText('Caffeine level: 65%');
      expect(srOnly).toHaveClass('sr-only');
    });

    it('should have live region for state changes', () => {
      render(<Character caffeineLevel={50} />);
      const liveRegion = screen.getByText(/Caffeine level:/);
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
});

describe('CharacterMood Component', () => {
  it('should render happy mood as optimal state', () => {
    render(<CharacterMood mood="happy" />);
    const character = screen.getByRole('img', { name: /Character mood: happy/i });
    expect(character).toBeInTheDocument();
  });

  it('should render tired mood as under-caffeinated state', () => {
    render(<CharacterMood mood="tired" />);
    const character = screen.getByRole('img', { name: /Character mood: tired/i });
    expect(character).toBeInTheDocument();
  });

  it('should render anxious mood as over-caffeinated state', () => {
    render(<CharacterMood mood="anxious" />);
    const character = screen.getByRole('img', { name: /Character mood: anxious/i });
    expect(character).toBeInTheDocument();
  });

  it('should apply size correctly', () => {
    render(<CharacterMood mood="happy" size="small" />);
    const svg = screen.getByRole('img', { name: /optimally caffeinated character/i });
    expect(svg).toHaveAttribute('width', '100');
    expect(svg).toHaveAttribute('height', '100');
  });

  it('should use medium size by default', () => {
    render(<CharacterMood mood="happy" />);
    const svg = screen.getByRole('img', { name: /optimally caffeinated character/i });
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '200');
  });
});

describe('AnimatedCharacter Component', () => {
  it('should apply pulse animation when optimal', () => {
    const { container } = render(<AnimatedCharacter caffeineLevel={50} pulseWhenOptimal={true} />);
    const animatedWrapper = container.firstChild;
    expect(animatedWrapper).toHaveClass('animate-pulse');
  });

  it('should apply shake animation when over-caffeinated', () => {
    const { container } = render(<AnimatedCharacter caffeineLevel={85} shakeWhenOverCaffeinated={true} />);
    const animatedWrapper = container.firstChild;
    expect(animatedWrapper).toHaveClass('animate-shake');
  });

  it('should apply fade effect when under-caffeinated', () => {
    const { container } = render(<AnimatedCharacter caffeineLevel={20} fadeWhenUnderCaffeinated={true} />);
    const animatedWrapper = container.firstChild;
    expect(animatedWrapper).toHaveClass('opacity-70');
  });

  it('should not apply animations when isActive is false', () => {
    const { container } = render(
      <AnimatedCharacter
        caffeineLevel={50}
        isActive={false}
        pulseWhenOptimal={true}
      />
    );
    const animatedWrapper = container.firstChild;
    expect(animatedWrapper).not.toHaveClass('animate-pulse');
  });

  it('should pass through all Character props', () => {
    render(
      <AnimatedCharacter
        caffeineLevel={50}
        showStateLabel={true}
        width={250}
        height={250}
      />
    );
    expect(screen.getByText('Optimally Caffeinated')).toBeInTheDocument();
    const svg = screen.getByRole('img', { name: /optimally caffeinated character/i });
    expect(svg).toHaveAttribute('width', '250');
  });
});

describe('SVG Character States', () => {
  it('should render all three character states', () => {
    const { rerender } = render(<Character caffeineLevel={20} />);
    expect(screen.getByRole('img', { name: /under-caffeinated character/i })).toBeInTheDocument();

    rerender(<Character caffeineLevel={50} />);
    expect(screen.getByRole('img', { name: /optimally caffeinated character/i })).toBeInTheDocument();

    rerender(<Character caffeineLevel={85} />);
    expect(screen.getByRole('img', { name: /over-caffeinated character/i })).toBeInTheDocument();
  });

  it('should contain proper SVG elements', () => {
    render(<Character caffeineLevel={50} />);
    const svg = screen.getByRole('img', { name: /optimally caffeinated character/i });

    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 200 200');
  });
});