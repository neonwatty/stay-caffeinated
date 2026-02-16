'use client';

import { useEffect, useCallback } from 'react';
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas';

interface RiveCharacterProps {
  /** Path to the .riv file (relative to /public) */
  src: string;
  /** Name of the state machine to use */
  stateMachine?: string;
  /** Name of the numeric input that controls caffeine level (0-100) */
  caffeineInputName?: string;
  /** Current caffeine level 0-100 */
  caffeineLevel: number;
  width?: number;
  height?: number;
  isActive?: boolean;
  /** Optional artboard name */
  artboard?: string;
}

/**
 * Rive character component that connects a caffeine level (0-100) to a Rive
 * state machine numeric input.
 *
 * For custom .riv files:
 *   1. Create a state machine in the Rive editor
 *   2. Add a Number input named "caffeineLevel" (or whatever you pass as caffeineInputName)
 *   3. Use a 1D Blend State to blend between sleepy/optimal/wired animations
 *   4. Export as .riv and place in /public/rive/
 *
 * For demo files without a matching state machine, the animation will still
 * play but won't respond to the caffeine slider.
 */
export function RiveCharacter({
  src,
  stateMachine,
  caffeineInputName = 'caffeineLevel',
  caffeineLevel,
  width = 220,
  height = 220,
  isActive = true,
  artboard,
}: RiveCharacterProps) {
  const params: Parameters<typeof useRive>[0] = {
    src,
    autoplay: isActive,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  };

  if (stateMachine) {
    params.stateMachines = stateMachine;
  }
  if (artboard) {
    params.artboard = artboard;
  }

  const { rive, RiveComponent } = useRive(params);

  // Connect to the state machine numeric input
  const caffeineInput = useStateMachineInput(
    rive,
    stateMachine ?? '',
    caffeineInputName,
  );

  // Update the Rive input when caffeine level changes
  useEffect(() => {
    if (caffeineInput) {
      caffeineInput.value = caffeineLevel;
    }
  }, [caffeineLevel, caffeineInput]);

  // Handle play/pause
  useEffect(() => {
    if (!rive) return;
    if (isActive) {
      rive.play();
    } else {
      rive.pause();
    }
  }, [rive, isActive]);

  return (
    <div style={{ width, height }}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

/**
 * Simple Rive animation player — plays a named animation from a .riv file
 * without state machine. Good for previewing community files.
 */
export function RiveAnimation({
  src,
  animation,
  width = 220,
  height = 220,
  isActive = true,
  artboard,
}: {
  src: string;
  animation?: string;
  width?: number;
  height?: number;
  isActive?: boolean;
  artboard?: string;
}) {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: isActive,
    ...(animation ? { animations: animation } : {}),
    ...(artboard ? { artboard } : {}),
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  useEffect(() => {
    if (!rive) return;
    if (isActive) rive.play();
    else rive.pause();
  }, [rive, isActive]);

  return (
    <div style={{ width, height }}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

/**
 * Debug component that lists all artboards, animations, and state machines
 * in a .riv file. Useful for exploring community files.
 */
export function RiveInspector({
  src,
  width = 220,
  height = 300,
}: {
  src: string;
  width?: number;
  height?: number;
}) {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  const getInfo = useCallback(() => {
    if (!rive) return null;
    const contents = rive.contents;
    return contents;
  }, [rive]);

  const info = getInfo();

  return (
    <div style={{ width }}>
      <div style={{ width, height: height * 0.6 }}>
        <RiveComponent style={{ width: '100%', height: '100%' }} />
      </div>
      {info && (
        <div className="text-xs text-gray-400 mt-2 max-h-32 overflow-y-auto">
          {/* eslint-disable @typescript-eslint/no-explicit-any */}
          {info.artboards?.map((ab: any) => (
            <div key={ab.name} className="mb-1">
              <div className="text-gray-300 font-semibold">{ab.name}</div>
              {ab.animations?.length > 0 && (
                <div className="ml-2">Animations: {ab.animations.map((a: any) => a.name).join(', ')}</div>
              )}
              {ab.stateMachines?.length > 0 && (
                <div className="ml-2">
                  State Machines: {ab.stateMachines.map((sm: any) => (
                    <span key={sm.name}>
                      {sm.name}
                      {sm.inputs?.length > 0 && ` (${sm.inputs.map((i: any) => `${i.name}:${i.type}`).join(', ')})`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {/* eslint-enable @typescript-eslint/no-explicit-any */}
        </div>
      )}
    </div>
  );
}
