'use client';

import { useEffect, useRef } from 'react';
import anime from '@/lib/anime';

export default function AnimeTest() {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!boxRef.current || !anime) return;

    // Simple animation test
    const animation = anime(boxRef.current, {
      translateX: 250,
      rotate: '1turn',
      backgroundColor: '#10b981',
      duration: 800,
      easing: 'easeInOutQuad',
      direction: 'alternate',
      loop: true
    });

    // Cleanup
    return () => {
      animation.pause();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Anime.js Installation Test</h1>

        <div className="space-y-8">
          {/* Basic Animation Test */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Animation Test</h2>
            <div
              ref={boxRef}
              className="w-20 h-20 bg-indigo-500 rounded-lg shadow-lg"
            />
          </section>

          {/* Installation Info */}
          <section className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-400 mb-2">✅ Anime.js Installed</h3>
            <ul className="text-gray-300 space-y-1">
              <li>• animejs v4.1.3 installed</li>
              <li>• @types/animejs v3.1.13 installed</li>
              <li>• Custom hooks available at /hooks/useAnimation.ts</li>
              <li>• Game utilities available at /utils/animations.ts</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}