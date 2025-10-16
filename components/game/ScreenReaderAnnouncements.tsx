'use client';

import React, { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';

/**
 * Component for providing screen reader announcements for game events
 */
export function ScreenReaderAnnouncements() {
  const [announcement, setAnnouncement] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');
  const gameState = useGameState();

  // Announce caffeine level changes
  useEffect(() => {
    const level = gameState.stats.currentCaffeineLevel;
    const isOptimal = gameState.stats.isInOptimalZone;
    
    if (level <= 10) {
      setAnnouncement('Critical: Caffeine level very low!');
      setPriority('assertive');
    } else if (level >= 90) {
      setAnnouncement('Warning: Caffeine level very high!');
      setPriority('assertive');
    } else if (isOptimal) {
      setAnnouncement(`Caffeine level optimal at ${Math.round(level)} percent`);
      setPriority('polite');
    }
  }, [gameState.stats.currentCaffeineLevel, gameState.stats.isInOptimalZone]);

  // Announce health changes
  useEffect(() => {
    const health = gameState.stats.currentHealthLevel;
    
    if (health <= 20) {
      setAnnouncement(`Critical: Health at ${Math.round(health)} percent`);
      setPriority('assertive');
    } else if (health <= 50) {
      setAnnouncement(`Warning: Health at ${Math.round(health)} percent`);
      setPriority('polite');
    }
  }, [gameState.stats.currentHealthLevel]);

  // Announce game state changes
  useEffect(() => {
    switch (gameState.currentState) {
      case 'playing':
        setAnnouncement('Game started. Use number keys 1-5 to select drinks.');
        setPriority('assertive');
        break;
      case 'paused':
        setAnnouncement('Game paused');
        setPriority('polite');
        break;
      case 'gameOver':
        setAnnouncement(`Game over. Final score: ${gameState.scoreDisplay}`);
        setPriority('assertive');
        break;
    }
  }, [gameState.currentState, gameState.scoreDisplay]);


  return (
    <>
      {/* Live region for polite announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {priority === 'polite' && announcement}
      </div>

      {/* Live region for assertive announcements */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {priority === 'assertive' && announcement}
      </div>
    </>
  );
}

/**
 * Hook for manual screen reader announcements
 */
export function useScreenReaderAnnounce() {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message: string, _priority: 'polite' | 'assertive' = 'polite') => {
    // Clear and set to trigger announcement
    setAnnouncement('');
    setTimeout(() => setAnnouncement(message), 100);
  };

  return {
    announce,
    AnnouncementRegion: () => (
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    ),
  };
}