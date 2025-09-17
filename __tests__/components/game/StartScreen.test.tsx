import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StartScreen, QuickStart } from '../../../components/game/StartScreen';

describe('StartScreen', () => {
  const defaultProps = {
    isOpen: true,
    onStartGame: vi.fn(),
    onShowSettings: vi.fn(),
    onShowHighScores: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<StartScreen {...defaultProps} />);
    expect(screen.getByText('Stay Caffeinated')).toBeInTheDocument();
    expect(screen.getByText('Keep your productivity high!')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<StartScreen {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Stay Caffeinated')).not.toBeInTheDocument();
  });

  it('displays all difficulty options', () => {
    render(<StartScreen {...defaultProps} />);
    expect(screen.getByText('Casual')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Crunch Time')).toBeInTheDocument();
    expect(screen.getByText('Death March')).toBeInTheDocument();
  });

  it('selects difficulty when clicked', () => {
    render(<StartScreen {...defaultProps} />);
    const hardButton = screen.getByLabelText('Select Crunch Time difficulty');
    fireEvent.click(hardButton);
    expect(hardButton.className).toContain('border-blue-500');
  });

  it('calls onStartGame with selected difficulty', () => {
    render(<StartScreen {...defaultProps} />);
    const hardButton = screen.getByLabelText('Select Crunch Time difficulty');
    fireEvent.click(hardButton);

    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    expect(defaultProps.onStartGame).toHaveBeenCalledWith('hard');
  });

  it('uses saved difficulty when provided', () => {
    render(<StartScreen {...defaultProps} savedDifficulty="extreme" />);
    const extremeButton = screen.getByLabelText('Select Death March difficulty');
    expect(extremeButton.className).toContain('border-blue-500');
  });

  it('toggles difficulty details', () => {
    render(<StartScreen {...defaultProps} />);
    const detailsButton = screen.getByText('Difficulty Details');

    expect(screen.queryByText(/Workday:/)).not.toBeInTheDocument();

    fireEvent.click(detailsButton);
    expect(screen.getByText(/Workday:/)).toBeInTheDocument();

    fireEvent.click(detailsButton);
    expect(screen.queryByText(/Workday:/)).not.toBeInTheDocument();
  });

  it('shows high scores button when handler provided', () => {
    render(<StartScreen {...defaultProps} />);
    expect(screen.getByText('High Scores')).toBeInTheDocument();
  });

  it('shows settings button when handler provided', () => {
    render(<StartScreen {...defaultProps} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls onShowHighScores when button clicked', () => {
    render(<StartScreen {...defaultProps} />);
    fireEvent.click(screen.getByText('High Scores'));
    expect(defaultProps.onShowHighScores).toHaveBeenCalledTimes(1);
  });

  it('calls onShowSettings when button clicked', () => {
    render(<StartScreen {...defaultProps} />);
    fireEvent.click(screen.getByText('Settings'));
    expect(defaultProps.onShowSettings).toHaveBeenCalledTimes(1);
  });
});

describe('QuickStart', () => {
  const defaultProps = {
    onStart: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and button', () => {
    render(<QuickStart {...defaultProps} />);
    expect(screen.getByText('Stay Caffeinated')).toBeInTheDocument();
    expect(screen.getByText('Start Working')).toBeInTheDocument();
  });

  it('displays difficulty when provided', () => {
    render(<QuickStart {...defaultProps} difficulty="hard" />);
    expect(screen.getByText(/Crunch Time/)).toBeInTheDocument();
  });

  it('calls onStart when button clicked', () => {
    render(<QuickStart {...defaultProps} />);
    fireEvent.click(screen.getByText('Start Working'));
    expect(defaultProps.onStart).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(<QuickStart {...defaultProps} className="custom-quick" />);
    expect(container.querySelector('.custom-quick')).toBeInTheDocument();
  });
});