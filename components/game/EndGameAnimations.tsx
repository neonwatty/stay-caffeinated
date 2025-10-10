'use client';

import React, { useEffect, useRef, useState } from 'react';
import anime from '@/lib/anime';

export interface EndGameAnimationsProps {
  outcome: 'victory' | 'passOut' | 'explosion' | null;
  finalStats?: {
    score: number;
    timeElapsed: number;
    drinksConsumed: number;
    streak: number;
  };
  onAnimationComplete?: () => void;
  className?: string;
}

/**
 * Victory Animation Component
 */
const VictoryAnimation: React.FC<{
  stats?: EndGameAnimationsProps['finalStats'];
  onComplete?: () => void;
}> = ({ stats, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const confettiRefs = useRef<HTMLDivElement[]>([]);
  const textRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create confetti particles
    const colors = ['#FFD700', '#FFA500', '#32CD32', '#FF69B4', '#00CED1', '#9370DB'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'absolute w-2 h-3 rounded-sm';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = '-20px';
      containerRef.current.appendChild(confetti);
      confettiRefs.current.push(confetti);
    }

    // Animate confetti falling
    anime(confettiRefs.current, {
      translateY: [
        { value: '100vh', duration: 3000 }
      ],
      translateX: () => anime.random(-100, 100),
      rotate: () => anime.random(0, 360),
      scale: () => anime.random(0.5, 1.5),
      opacity: [
        { value: 1, duration: 0 },
        { value: 0, duration: 3000 }
      ],
      delay: anime.stagger(50, { from: 'random' }),
      easing: 'easeInOutQuad',
    });

    // Animate victory text
    if (textRef.current) {
      anime(textRef.current, {
        scale: [0, 1.2, 1],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutElastic(1, .8)',
      });

      // Add glow effect
      anime(textRef.current, {
        textShadow: [
          '0 0 10px #FFD700',
          '0 0 30px #FFD700',
          '0 0 10px #FFD700',
        ],
        duration: 2000,
        loop: true,
        easing: 'easeInOutSine',
      });
    }

    // Animate stats display
    if (statsRef.current) {
      anime(statsRef.current, {
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 800,
        delay: 500,
        easing: 'easeOutQuad',
      });
    }

    // Complete animation
    const timer = setTimeout(() => {
      onComplete?.();
    }, 5000);

    return () => {
      clearTimeout(timer);
      confettiRefs.current.forEach(ref => ref.remove());
      confettiRefs.current = [];
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-green-900/90 to-green-600/90"
    >
      <div ref={textRef} className="text-center mb-8">
        <h1 className="text-7xl font-bold text-yellow-400 mb-4">VICTORY!</h1>
        <p className="text-2xl text-white">You survived the workday!</p>
      </div>

      {stats && (
        <div ref={statsRef} className="bg-black/50 rounded-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-4 text-center">Final Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400">Score:</span>
              <span className="ml-2 text-yellow-400 font-bold">{stats.score.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400">Time:</span>
              <span className="ml-2 text-green-400 font-bold">
                {Math.floor(stats.timeElapsed / 60)}:{(stats.timeElapsed % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Drinks:</span>
              <span className="ml-2 text-blue-400 font-bold">{stats.drinksConsumed}</span>
            </div>
            <div>
              <span className="text-gray-400">Streak:</span>
              <span className="ml-2 text-purple-400 font-bold">{stats.streak}s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Pass Out Animation Component
 */
const PassOutAnimation: React.FC<{
  onComplete?: () => void;
}> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const eyeLidTop = useRef<HTMLDivElement>(null);
  const eyeLidBottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const timeline = anime.timeline({
      easing: 'easeInOutQuad',
      complete: onComplete,
    });

    // Screen wobble
    timeline.add(containerRef.current, {
      rotate: [0, -5, 5, -3, 3, 0],
      scale: [1, 0.98, 1],
      duration: 1500,
    });

    // Blur and darken
    if (overlayRef.current) {
      timeline.add(overlayRef.current, {
        opacity: [0, 0.8],
        duration: 2000,
      }, '-=1000');
    }

    // Eyelids closing
    if (eyeLidTop.current && eyeLidBottom.current) {
      timeline.add(eyeLidTop.current, {
        translateY: ['0%', '50%'],
        duration: 2000,
      }, '-=1000');

      timeline.add(eyeLidBottom.current, {
        translateY: ['0%', '-50%'],
        duration: 2000,
      }, '-=2000');
    }

    // Text fade in
    if (textRef.current) {
      timeline.add(textRef.current, {
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 800,
      }, '-=500');
    }

    // Final fade to black
    timeline.add(containerRef.current, {
      opacity: [1, 0],
      duration: 1000,
      delay: 1000,
    });

    return () => {
      timeline.pause();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Blur overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 backdrop-blur-md bg-black/70"
        style={{ opacity: 0 }}
      />

      {/* Eyelids */}
      <div
        ref={eyeLidTop}
        className="absolute top-0 left-0 w-full h-1/2 bg-black"
        style={{ transform: 'translateY(-100%)' }}
      />
      <div
        ref={eyeLidBottom}
        className="absolute bottom-0 left-0 w-full h-1/2 bg-black"
        style={{ transform: 'translateY(100%)' }}
      />

      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div ref={textRef} className="text-center opacity-0">
          <h1 className="text-6xl font-bold text-gray-400 mb-4">YOU PASSED OUT</h1>
          <p className="text-xl text-gray-500">Too little caffeine...</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Explosion Animation Component
 */
const ExplosionAnimation: React.FC<{
  onComplete?: () => void;
}> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const explosionRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const textRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const timeline = anime.timeline({
      easing: 'easeOutQuad',
      complete: onComplete,
    });

    // Create explosion particles
    const particleCount = 30;
    const colors = ['#FF0000', '#FF4500', '#FFA500', '#FFD700', '#FFFF00'];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-4 h-4 rounded-full';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = '50%';
      particle.style.top = '50%';
      particle.style.transform = 'translate(-50%, -50%)';
      containerRef.current.appendChild(particle);
      particlesRef.current.push(particle);
    }

    // Flash effect
    if (flashRef.current) {
      timeline.add(flashRef.current, {
        opacity: [0, 1, 0],
        duration: 200,
      });
    }

    // Screen shake
    timeline.add(containerRef.current, {
      translateX: () => anime.random(-20, 20),
      translateY: () => anime.random(-20, 20),
      duration: 500,
      easing: 'easeInOutQuad',
      loop: 3,
    }, '-=200');

    // Central explosion
    if (explosionRef.current) {
      timeline.add(explosionRef.current, {
        scale: [0, 3],
        opacity: [1, 0],
        duration: 600,
        easing: 'easeOutExpo',
      }, '-=500');
    }

    // Particles explosion
    timeline.add(particlesRef.current, {
      translateX: () => anime.random(-300, 300),
      translateY: () => anime.random(-300, 300),
      scale: [1, 0],
      opacity: [1, 0],
      duration: 1000,
      easing: 'easeOutExpo',
    }, '-=600');

    // Text appearance
    if (textRef.current) {
      timeline.add(textRef.current, {
        opacity: [0, 1],
        scale: [1.5, 1],
        duration: 800,
        easing: 'easeOutElastic(1, .8)',
      }, '-=500');

      // Add pulsing effect to text
      timeline.add(textRef.current, {
        scale: [1, 1.05, 1],
        duration: 1000,
        loop: 2,
        easing: 'easeInOutSine',
      });
    }

    // Fade out
    timeline.add(containerRef.current, {
      opacity: [1, 0],
      duration: 1000,
      delay: 1000,
    });

    return () => {
      timeline.pause();
      particlesRef.current.forEach(ref => ref.remove());
      particlesRef.current = [];
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-gradient-to-b from-red-900/90 to-orange-600/90"
    >
      {/* Flash overlay */}
      <div
        ref={flashRef}
        className="absolute inset-0 bg-white opacity-0 pointer-events-none"
      />

      {/* Central explosion */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={explosionRef}
          className="w-64 h-64 rounded-full bg-gradient-radial from-yellow-300 via-orange-500 to-red-600 blur-xl"
        />
      </div>

      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div ref={textRef} className="text-center opacity-0">
          <h1 className="text-7xl font-bold text-red-500 mb-4">BOOM!</h1>
          <p className="text-2xl text-white">Too much caffeine!</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Main End Game Animations Component
 */
export const EndGameAnimations: React.FC<EndGameAnimationsProps> = ({
  outcome,
  finalStats,
  onAnimationComplete,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentOutcome, setCurrentOutcome] = useState<typeof outcome>(null);

  useEffect(() => {
    if (outcome && !isAnimating) {
      setIsAnimating(true);
      setCurrentOutcome(outcome);
    }
  }, [outcome, isAnimating]);

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    setCurrentOutcome(null);
    onAnimationComplete?.();
  };

  if (!currentOutcome || !isAnimating) return null;

  return (
    <div className={`end-game-animations ${className}`}>
      {currentOutcome === 'victory' && (
        <VictoryAnimation
          stats={finalStats}
          onComplete={handleAnimationComplete}
        />
      )}
      {currentOutcome === 'passOut' && (
        <PassOutAnimation onComplete={handleAnimationComplete} />
      )}
      {currentOutcome === 'explosion' && (
        <ExplosionAnimation onComplete={handleAnimationComplete} />
      )}
    </div>
  );
};

/**
 * End Game Modal Component (for post-animation display)
 */
export interface EndGameModalProps {
  isOpen: boolean;
  outcome: 'victory' | 'passOut' | 'explosion';
  stats: EndGameAnimationsProps['finalStats'];
  onRestart: () => void;
  onMainMenu: () => void;
}

export const EndGameModal: React.FC<EndGameModalProps> = ({
  isOpen,
  outcome,
  stats,
  onRestart,
  onMainMenu,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      anime(modalRef.current, {
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutQuad',
      });
    }
  }, [isOpen]);

  if (!isOpen || !stats) return null;

  const getOutcomeColor = () => {
    switch (outcome) {
      case 'victory': return 'text-green-400';
      case 'passOut': return 'text-gray-400';
      case 'explosion': return 'text-red-400';
    }
  };

  const getOutcomeMessage = () => {
    switch (outcome) {
      case 'victory': return 'Congratulations! You made it through the day!';
      case 'passOut': return 'You ran out of energy and passed out.';
      case 'explosion': return 'You had way too much caffeine!';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div
        ref={modalRef}
        className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 p-8 max-w-md w-full mx-4"
      >
        <h2 className={`text-3xl font-bold mb-2 ${getOutcomeColor()}`}>
          {outcome === 'victory' ? 'Victory!' : 'Game Over'}
        </h2>

        <p className="text-gray-300 mb-6">{getOutcomeMessage()}</p>

        {/* Stats display */}
        <div className="bg-black/50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Final Score:</span>
              <span className="text-yellow-400 font-semibold">{stats.score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time Survived:</span>
              <span className="text-blue-400 font-semibold">
                {Math.floor(stats.timeElapsed / 60)}:{(stats.timeElapsed % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Drinks:</span>
              <span className="text-purple-400 font-semibold">{stats.drinksConsumed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Best Streak:</span>
              <span className="text-green-400 font-semibold">{stats.streak}s</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onMainMenu}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};