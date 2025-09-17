import React, { useState, useEffect } from 'react';
import { GameMenu, MenuButton, MenuSection } from './GameMenu';

export interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: GameSettings) => void;
  currentSettings?: GameSettings;
  className?: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  notificationsEnabled: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  showTutorial: boolean;
  reducedMotion: boolean;
  colorBlindMode: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es' | 'fr' | 'de' | 'ja';
}

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 70,
  musicVolume: 50,
  notificationsEnabled: true,
  autoSave: true,
  autoSaveInterval: 60,
  showTutorial: true,
  reducedMotion: false,
  colorBlindMode: false,
  theme: 'system',
  language: 'en',
};

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings = DEFAULT_SETTINGS,
  className = '',
}) => {
  const [settings, setSettings] = useState<GameSettings>(currentSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'audio' | 'gameplay' | 'accessibility'>('audio');

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  useEffect(() => {
    const savedSettings = loadSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const handleSettingChange = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettings(settings);
    if (onSave) {
      onSave(settings);
    }
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  const handleCancel = () => {
    setSettings(currentSettings);
    setHasChanges(false);
    onClose();
  };

  const renderAudioSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-gray-700 dark:text-gray-300">Sound Effects</label>
        <button
          onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
          className={`w-12 h-6 rounded-full transition-colors ${
            settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          role="switch"
          aria-checked={settings.soundEnabled}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-gray-700 dark:text-gray-300">
          Sound Volume: {settings.soundVolume}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.soundVolume}
          onChange={(e) => handleSettingChange('soundVolume', parseInt(e.target.value))}
          disabled={!settings.soundEnabled}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="text-gray-700 dark:text-gray-300">Background Music</label>
        <button
          onClick={() => handleSettingChange('musicEnabled', !settings.musicEnabled)}
          className={`w-12 h-6 rounded-full transition-colors ${
            settings.musicEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          role="switch"
          aria-checked={settings.musicEnabled}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.musicEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-gray-700 dark:text-gray-300">
          Music Volume: {settings.musicVolume}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.musicVolume}
          onChange={(e) => handleSettingChange('musicVolume', parseInt(e.target.value))}
          disabled={!settings.musicEnabled}
          className="w-full"
        />
      </div>
    </div>
  );

  const renderGameplaySettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-gray-700 dark:text-gray-300">Notifications</label>
        <button
          onClick={() => handleSettingChange('notificationsEnabled', !settings.notificationsEnabled)}
          className={`w-12 h-6 rounded-full transition-colors ${
            settings.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          role="switch"
          aria-checked={settings.notificationsEnabled}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-gray-700 dark:text-gray-300">Auto-Save</label>
        <button
          onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
          className={`w-12 h-6 rounded-full transition-colors ${
            settings.autoSave ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          role="switch"
          aria-checked={settings.autoSave}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.autoSave ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {settings.autoSave && (
        <div className="space-y-2">
          <label className="text-gray-700 dark:text-gray-300">
            Auto-Save Interval
          </label>
          <select
            value={settings.autoSaveInterval}
            onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          >
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={120}>2 minutes</option>
            <option value={300}>5 minutes</option>
          </select>
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="text-gray-700 dark:text-gray-300">Show Tutorial</label>
        <button
          onClick={() => handleSettingChange('showTutorial', !settings.showTutorial)}
          className={`w-12 h-6 rounded-full transition-colors ${
            settings.showTutorial ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          role="switch"
          aria-checked={settings.showTutorial}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.showTutorial ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );

  const renderAccessibilitySettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-gray-700 dark:text-gray-300">Reduced Motion</label>
        <button
          onClick={() => handleSettingChange('reducedMotion', !settings.reducedMotion)}
          className={`w-12 h-6 rounded-full transition-colors ${
            settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          role="switch"
          aria-checked={settings.reducedMotion}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-gray-700 dark:text-gray-300">Color Blind Mode</label>
        <button
          onClick={() => handleSettingChange('colorBlindMode', !settings.colorBlindMode)}
          className={`w-12 h-6 rounded-full transition-colors ${
            settings.colorBlindMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          role="switch"
          aria-checked={settings.colorBlindMode}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.colorBlindMode ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-gray-700 dark:text-gray-300">Theme</label>
        <select
          value={settings.theme}
          onChange={(e) => handleSettingChange('theme', e.target.value as GameSettings['theme'])}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-gray-700 dark:text-gray-300">Language</label>
        <select
          value={settings.language}
          onChange={(e) => handleSettingChange('language', e.target.value as GameSettings['language'])}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="ja">日本語</option>
        </select>
      </div>
    </div>
  );

  return (
    <GameMenu
      isOpen={isOpen}
      onClose={handleCancel}
      title="Settings"
      showCloseButton={true}
      className={className}
    >
      <div className="space-y-6">
        <div className="flex justify-around border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('audio')}
            className={`pb-2 px-4 ${
              activeTab === 'audio'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Audio
          </button>
          <button
            onClick={() => setActiveTab('gameplay')}
            className={`pb-2 px-4 ${
              activeTab === 'gameplay'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Gameplay
          </button>
          <button
            onClick={() => setActiveTab('accessibility')}
            className={`pb-2 px-4 ${
              activeTab === 'accessibility'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Accessibility
          </button>
        </div>

        <MenuSection>
          {activeTab === 'audio' && renderAudioSettings()}
          {activeTab === 'gameplay' && renderGameplaySettings()}
          {activeTab === 'accessibility' && renderAccessibilitySettings()}
        </MenuSection>

        <div className="space-y-3">
          <MenuButton
            onClick={handleSave}
            variant="primary"
            size="large"
            disabled={!hasChanges}
          >
            Save Settings
          </MenuButton>

          <MenuButton
            onClick={handleReset}
            variant="secondary"
            size="medium"
          >
            Reset to Defaults
          </MenuButton>

          <MenuButton
            onClick={handleCancel}
            variant="secondary"
            size="medium"
          >
            Cancel
          </MenuButton>
        </div>

        {hasChanges && (
          <div className="text-center text-sm text-orange-600 dark:text-orange-400">
            You have unsaved changes
          </div>
        )}
      </div>
    </GameMenu>
  );
};

export const loadSettings = (): GameSettings | null => {
  try {
    const stored = localStorage.getItem('stayCaffeinatedSettings');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return null;
};

export const saveSettings = (settings: GameSettings): void => {
  try {
    localStorage.setItem('stayCaffeinatedSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const resetSettings = (): void => {
  try {
    localStorage.removeItem('stayCaffeinatedSettings');
  } catch (error) {
    console.error('Failed to reset settings:', error);
  }
};