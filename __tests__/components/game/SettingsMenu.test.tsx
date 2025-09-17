import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SettingsMenu, loadSettings, saveSettings, resetSettings, DEFAULT_SETTINGS } from '../../../components/game/SettingsMenu';

describe('SettingsMenu', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders when isOpen is true', () => {
    render(<SettingsMenu {...defaultProps} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<SettingsMenu {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('displays all tabs', () => {
    render(<SettingsMenu {...defaultProps} />);
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('Gameplay')).toBeInTheDocument();
    expect(screen.getByText('Accessibility')).toBeInTheDocument();
  });

  it('switches between tabs', () => {
    render(<SettingsMenu {...defaultProps} />);

    expect(screen.getByText('Sound Effects')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Gameplay'));
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Accessibility'));
    expect(screen.getByText('Reduced Motion')).toBeInTheDocument();
  });

  it('toggles sound enabled', () => {
    render(<SettingsMenu {...defaultProps} />);
    const soundToggle = screen.getByRole('switch', { name: 'Sound Effects' });

    expect(soundToggle).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(soundToggle);
    expect(soundToggle).toHaveAttribute('aria-checked', 'false');
  });

  it('changes sound volume', () => {
    render(<SettingsMenu {...defaultProps} />);
    const volumeSlider = screen.getByRole('slider', { name: 'Sound Volume' });

    fireEvent.change(volumeSlider, { target: { value: '85' } });
    expect(screen.getByText('Sound Volume: 85%')).toBeInTheDocument();
  });

  it('toggles auto-save and shows interval options', () => {
    render(<SettingsMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Gameplay'));

    const autoSaveToggle = screen.getByRole('switch', { name: 'Auto-Save' });
    expect(screen.getByText('Auto-Save Interval')).toBeInTheDocument();

    fireEvent.click(autoSaveToggle);
    expect(screen.queryByText('Auto-Save Interval')).not.toBeInTheDocument();
  });

  it('changes theme selection', () => {
    render(<SettingsMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Accessibility'));

    const themeSelect = screen.getByRole('combobox', { name: 'Theme' });
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    expect(themeSelect).toHaveValue('dark');
  });

  it('shows unsaved changes indicator', () => {
    render(<SettingsMenu {...defaultProps} />);

    expect(screen.queryByText('You have unsaved changes')).not.toBeInTheDocument();

    const soundToggle = screen.getByRole('switch', { name: 'Sound Effects' });
    fireEvent.click(soundToggle);

    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
  });

  it('saves settings when save button clicked', () => {
    render(<SettingsMenu {...defaultProps} />);

    const soundToggle = screen.getByRole('switch', { name: 'Sound Effects' });
    fireEvent.click(soundToggle);

    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);

    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ soundEnabled: false })
    );
  });

  it('resets to default settings', () => {
    render(<SettingsMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Gameplay'));

    const autoSaveToggle = screen.getByRole('switch', { name: 'Auto-Save' });
    fireEvent.click(autoSaveToggle);

    const resetButton = screen.getByText('Reset to Defaults');
    fireEvent.click(resetButton);

    expect(autoSaveToggle).toHaveAttribute('aria-checked', 'true');
  });

  it('cancels changes when cancel button clicked', () => {
    render(<SettingsMenu {...defaultProps} />);

    const soundToggle = screen.getByRole('switch', { name: 'Sound Effects' });
    fireEvent.click(soundToggle);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('loads saved settings from localStorage', () => {
    const customSettings = { ...DEFAULT_SETTINGS, soundEnabled: false };
    localStorage.setItem('stayCaffeinatedSettings', JSON.stringify(customSettings));

    render(<SettingsMenu {...defaultProps} />);
    const soundToggle = screen.getByRole('switch', { name: 'Sound Effects' });
    expect(soundToggle).toHaveAttribute('aria-checked', 'false');
  });
});

describe('Settings utility functions', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('loadSettings returns null when no settings saved', () => {
    const settings = loadSettings();
    expect(settings).toBeNull();
  });

  it('loadSettings returns saved settings', () => {
    const testSettings = { ...DEFAULT_SETTINGS, soundVolume: 90 };
    localStorage.setItem('stayCaffeinatedSettings', JSON.stringify(testSettings));

    const settings = loadSettings();
    expect(settings).toEqual(testSettings);
  });

  it('saveSettings stores settings in localStorage', () => {
    const testSettings = { ...DEFAULT_SETTINGS, musicEnabled: false };
    saveSettings(testSettings);

    const stored = localStorage.getItem('stayCaffeinatedSettings');
    expect(stored).toBeDefined();
    expect(JSON.parse(stored!)).toEqual(testSettings);
  });

  it('resetSettings removes settings from localStorage', () => {
    localStorage.setItem('stayCaffeinatedSettings', JSON.stringify(DEFAULT_SETTINGS));
    resetSettings();

    expect(localStorage.getItem('stayCaffeinatedSettings')).toBeNull();
  });
});