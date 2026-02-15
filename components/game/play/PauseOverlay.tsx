'use client';

interface PauseOverlayProps {
  onResume: () => void;
  onQuit: () => void;
}

/**
 * Simple pause screen overlay with Resume and Quit buttons.
 * Absolute positioned with semi-transparent backdrop and blur.
 */
export function PauseOverlay({ onResume, onQuit }: PauseOverlayProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-4xl font-bold text-white mb-4">Paused</h2>

        <button
          onClick={onResume}
          className="w-48 rounded-xl bg-green-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-green-500"
        >
          Resume
        </button>

        <button
          onClick={onQuit}
          className="w-48 rounded-xl bg-gray-700 px-6 py-3 text-lg text-gray-300 transition-colors hover:bg-gray-600"
        >
          Quit to Menu
        </button>
      </div>
    </div>
  );
}
