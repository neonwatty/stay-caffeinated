/**
 * Tests for Status Bar Components
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusBars, OptimalZoneIndicator, GameStats } from '../StatusBars';
import { CaffeineBar } from '../CaffeineBar';
import { HealthBar } from '../HealthBar';

describe('CaffeineBar', () => {
  it('should render with correct value', () => {
    render(<CaffeineBar value={50} />);
    expect(screen.getByText(/50/)).toBeInTheDocument();
    expect(screen.getByText('Caffeine Level')).toBeInTheDocument();
  });

  it('should show optimal status when value is in optimal range', () => {
    render(<CaffeineBar value={50} />);
    // Use getAllByText and check first occurrence
    const optimalTexts = screen.getAllByText('Optimal');
    expect(optimalTexts[0]).toBeInTheDocument();
  });

  it('should show warning status when value is low', () => {
    render(<CaffeineBar value={25} />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('should show critical status when value is very low', () => {
    render(<CaffeineBar value={10} />);
    expect(screen.getByText('Critical Low')).toBeInTheDocument();
  });

  it('should show warning status when value is high', () => {
    render(<CaffeineBar value={75} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('should show critical status when value is very high', () => {
    render(<CaffeineBar value={85} />);
    expect(screen.getByText('Critical High')).toBeInTheDocument();
  });

  it('should render compact version', () => {
    const { container } = render(<CaffeineBar value={50} compact />);
    expect(container.querySelector('.flex.items-center.gap-2')).toBeInTheDocument();
  });

  it('should show optimal zone when enabled', () => {
    render(<CaffeineBar value={50} showOptimalZone />);
    expect(screen.getByText('Optimal: 30-70%')).toBeInTheDocument();
  });
});

describe('HealthBar', () => {
  it('should render with correct value', () => {
    render(<HealthBar value={75} />);
    expect(screen.getByText(/75/)).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
  });

  it('should show healthy status when value is high', () => {
    render(<HealthBar value={75} />);
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('should show low status when value is below warning threshold', () => {
    render(<HealthBar value={40} />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('should show critical status when value is below critical threshold', () => {
    render(<HealthBar value={15} />);
    expect(screen.getByText('Critical!')).toBeInTheDocument();
  });

  it('should render compact version', () => {
    const { container } = render(<HealthBar value={75} compact />);
    expect(container.querySelector('.flex.items-center.gap-2')).toBeInTheDocument();
  });

  it('should display health indicators', () => {
    render(<HealthBar value={85} />);
    expect(screen.getByText(/Excellent health/)).toBeInTheDocument();
  });

  it('should display correct indicator text for low health', () => {
    render(<HealthBar value={15} />);
    expect(screen.getByText(/Critical health/)).toBeInTheDocument();
  });
});

describe('StatusBars', () => {
  const defaultProps = {
    caffeineLevel: 50,
    healthLevel: 75,
    score: 1000,
    timeRemaining: 120,
    totalTime: 300,
  };

  it('should render all status bars in default view', () => {
    render(<StatusBars {...defaultProps} />);
    expect(screen.getByText('Caffeine Level')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('Time Progress')).toBeInTheDocument();
  });

  it('should display score correctly', () => {
    render(<StatusBars {...defaultProps} />);
    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  it('should calculate and display time remaining', () => {
    render(<StatusBars {...defaultProps} />);
    expect(screen.getByText('2:00 left')).toBeInTheDocument();
  });

  it('should render compact version', () => {
    const { container } = render(<StatusBars {...defaultProps} compact />);
    expect(container.querySelector('.bg-gray-900')).toBeInTheDocument();
  });

  it('should render gauge variant', () => {
    render(<StatusBars {...defaultProps} variant="gauge" />);
    expect(screen.getByText('Caffeine Level')).toBeInTheDocument();
    expect(screen.getByText('Health Status')).toBeInTheDocument();
  });

  it('should format large scores with commas', () => {
    render(<StatusBars {...defaultProps} score={1234567} />);
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });
});

describe('OptimalZoneIndicator', () => {
  it('should show "Optimal Zone" when in zone', () => {
    render(<OptimalZoneIndicator isInZone={true} />);
    expect(screen.getByText('Optimal Zone')).toBeInTheDocument();
  });

  it('should show "Outside Zone" when not in zone', () => {
    render(<OptimalZoneIndicator isInZone={false} />);
    expect(screen.getByText('Outside Zone')).toBeInTheDocument();
  });

  it('should apply correct styling when in zone', () => {
    const { container } = render(<OptimalZoneIndicator isInZone={true} />);
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('bg-green-100');
  });

  it('should apply correct styling when outside zone', () => {
    const { container } = render(<OptimalZoneIndicator isInZone={false} />);
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('bg-gray-100');
  });
});

describe('GameStats', () => {
  const defaultProps = {
    caffeineLevel: 50,
    healthLevel: 75,
    score: 1000,
    timeRemaining: 120,
    totalTime: 300,
  };

  it('should render all basic stats', () => {
    render(<GameStats {...defaultProps} />);
    expect(screen.getByText('Caffeine')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
  });

  it('should display caffeine level with percentage', () => {
    render(<GameStats {...defaultProps} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should display health level with percentage', () => {
    render(<GameStats {...defaultProps} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should calculate time progress percentage', () => {
    render(<GameStats {...defaultProps} />);
    expect(screen.getByText('60%')).toBeInTheDocument(); // (180/300) * 100
  });

  it('should display streak when provided', () => {
    render(<GameStats {...defaultProps} streak={30} />);
    expect(screen.getByText('Streak')).toBeInTheDocument();
    expect(screen.getByText('30s')).toBeInTheDocument();
  });

  it('should display drinks consumed when provided', () => {
    render(<GameStats {...defaultProps} drinksConsumed={5} />);
    expect(screen.getByText('Drinks')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should apply correct color for optimal caffeine', () => {
    const { container } = render(<GameStats {...defaultProps} caffeineLevel={50} />);
    const caffeineCard = container.querySelector('.bg-green-50');
    expect(caffeineCard).toBeInTheDocument();
  });

  it('should apply correct color for low health', () => {
    const { container } = render(<GameStats {...defaultProps} healthLevel={15} />);
    const healthCard = container.querySelector('.bg-red-50');
    expect(healthCard).toBeInTheDocument();
  });
});