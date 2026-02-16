'use client';

import { useEffect, useRef, useState } from 'react';

const FLOAT_DURATION_MS = 1000;

const floatUpKeyframes = `
@keyframes floatUp {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-40px); }
}
`;

interface FloatingTextProps {
  text: string;
  color: string;
  onComplete?: () => void;
}

export function FloatingText({ text, color, onComplete }: FloatingTextProps) {
  const [visible, setVisible] = useState(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onCompleteRef.current?.();
    }, FLOAT_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <span
      className="pointer-events-none absolute text-lg font-bold drop-shadow-lg"
      style={{
        color,
        animation: `floatUp ${FLOAT_DURATION_MS}ms ease-out forwards`,
      }}
    >
      {text}
      <style>{floatUpKeyframes}</style>
    </span>
  );
}
