'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Sprite, Texture, Rectangle, Assets } from 'pixi.js';
import type { CharacterState } from './svg/CharacterStates';
import { AnimatedCharacter } from './Character';
import { DEFAULT_SPRITE_CONFIG, type SpriteConfig, type SpriteSheetConfig } from './sprites/config';

// Register Pixi display objects for @pixi/react JSX
extend({ Container, Sprite });

/** Cut a horizontal or vertical sprite strip into individual frame textures */
async function loadSpriteFrames(
  config: SpriteSheetConfig,
  basePath: string,
): Promise<Texture[]> {
  const url = `${basePath}${config.path}`;
  const baseTexture = await Assets.load(url);
  const frames: Texture[] = [];

  for (let i = 0; i < config.frameCount; i++) {
    const x = config.layout === 'vertical' ? 0 : i * config.frameWidth;
    const y = config.layout === 'vertical' ? i * config.frameHeight : 0;

    frames.push(
      new Texture({
        source: baseTexture.source,
        frame: new Rectangle(x, y, config.frameWidth, config.frameHeight),
      }),
    );
  }

  return frames;
}

/** Frame-by-frame sprite animator using useTick */
function SpriteAnimator({
  frames,
  fps,
  isActive,
  width,
  height,
}: {
  frames: Texture[];
  fps: number;
  isActive: boolean;
  width: number;
  height: number;
}) {
  const spriteRef = useRef<InstanceType<typeof Sprite> | null>(null);
  const frameIndex = useRef(0);
  const elapsed = useRef(0);

  // Reset animation when frames change (state transition)
  useEffect(() => {
    frameIndex.current = 0;
    elapsed.current = 0;
    if (spriteRef.current && frames.length > 0) {
      spriteRef.current.texture = frames[0];
    }
  }, [frames]);

  useTick((ticker) => {
    if (!isActive || !spriteRef.current || frames.length <= 1) return;

    elapsed.current += ticker.deltaTime / 60;
    const frameDuration = 1 / fps;

    if (elapsed.current >= frameDuration) {
      elapsed.current -= frameDuration;
      frameIndex.current = (frameIndex.current + 1) % frames.length;
      spriteRef.current.texture = frames[frameIndex.current];
    }
  });

  if (frames.length === 0) return null;

  return (
    <pixiSprite
      ref={spriteRef}
      texture={frames[0]}
      width={width}
      height={height}
      anchor={0.5}
      x={width / 2}
      y={height / 2}
    />
  );
}

export interface SpriteCharacterProps {
  caffeineLevel: number;
  width?: number;
  height?: number;
  className?: string;
  isActive?: boolean;
  showStateLabel?: boolean;
  spriteConfig?: SpriteConfig;
  customThresholds?: {
    underCaffeinated?: number;
    overCaffeinated?: number;
  };
  onStateChange?: (newState: CharacterState, oldState: CharacterState) => void;
}

export const SpriteCharacter: React.FC<SpriteCharacterProps> = ({
  caffeineLevel,
  width = 220,
  height = 220,
  className = '',
  isActive = true,
  showStateLabel = false,
  spriteConfig = DEFAULT_SPRITE_CONFIG,
  customThresholds,
  onStateChange,
}) => {
  const [spriteFrames, setSpriteFrames] = useState<Map<CharacterState, Texture[]>>(new Map());
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const prevStateRef = useRef<CharacterState>('optimal');

  const currentState = useMemo((): CharacterState => {
    const underThresh = customThresholds?.underCaffeinated ?? 30;
    const overThresh = customThresholds?.overCaffeinated ?? 70;
    if (caffeineLevel < underThresh) return 'under';
    if (caffeineLevel > overThresh) return 'over';
    return 'optimal';
  }, [caffeineLevel, customThresholds]);

  // Fire state change callback
  useEffect(() => {
    if (currentState !== prevStateRef.current) {
      onStateChange?.(currentState, prevStateRef.current);
      prevStateRef.current = currentState;
    }
  }, [currentState, onStateChange]);

  // Detect basePath for Next.js static export
  const basePath = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const nextData = (window as unknown as { __NEXT_DATA__?: { assetPrefix?: string; basePath?: string } }).__NEXT_DATA__;
    return nextData?.assetPrefix || nextData?.basePath || '';
  }, []);

  // Load all sprite sheets
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        const states: CharacterState[] = ['under', 'optimal', 'over'];
        const entries = await Promise.all(
          states.map(async (state): Promise<[CharacterState, Texture[]]> => {
            const frames = await loadSpriteFrames(spriteConfig[state], basePath);
            return [state, frames];
          }),
        );

        if (!cancelled) {
          setSpriteFrames(new Map(entries));
          setLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setLoadFailed(true);
        }
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [spriteConfig, basePath]);

  // Fall back to SVG character if sprites aren't available
  if (loadFailed || !loaded) {
    return (
      <AnimatedCharacter
        caffeineLevel={caffeineLevel}
        width={width}
        height={height}
        className={className}
        showStateLabel={showStateLabel}
        animateTransitions={true}
        isActive={isActive}
      />
    );
  }

  const currentFrames = spriteFrames.get(currentState) || [];
  const currentConfig = spriteConfig[currentState];

  const stateLabels: Record<CharacterState, string> = {
    under: 'Under-Caffeinated',
    optimal: 'Optimally Caffeinated',
    over: 'Over-Caffeinated',
  };

  const stateColors: Record<CharacterState, string> = {
    under: 'text-blue-600',
    optimal: 'text-green-600',
    over: 'text-red-600',
  };

  return (
    <div
      className={`inline-flex flex-col items-center justify-center ${className}`}
      role="img"
      aria-label={`Character is ${stateLabels[currentState].toLowerCase()}`}
    >
      <Application
        width={width}
        height={height}
        backgroundAlpha={0}
        antialias
        resolution={typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1}
        autoDensity
      >
        <pixiContainer>
          <SpriteAnimator
            frames={currentFrames}
            fps={currentConfig.fps}
            isActive={isActive}
            width={width}
            height={height}
          />
        </pixiContainer>
      </Application>

      {showStateLabel && (
        <div className={`mt-2 text-sm font-medium ${stateColors[currentState]} transition-all duration-300`}>
          {stateLabels[currentState]}
        </div>
      )}

      <div className="sr-only" aria-live="polite">
        Caffeine level: {caffeineLevel}%
      </div>
    </div>
  );
};
