import React, { useMemo } from 'react';

export interface MonitorProps {
  caffeineLevel: number;
  content?: React.ReactNode;
  showClock?: boolean;
  currentTime?: string;
  className?: string;
  width?: number;
  height?: number;
  showReflection?: boolean;
}

export const Monitor: React.FC<MonitorProps> = ({
  caffeineLevel,
  content,
  showClock = true,
  currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }),
  className = '',
  width = 400,
  height = 300,
  showReflection = true,
}) => {
  const clarity = useMemo(() => {
    if (caffeineLevel < 20) return 0.3;
    if (caffeineLevel < 40) return 0.6;
    if (caffeineLevel < 60) return 0.85;
    if (caffeineLevel <= 80) return 1;
    return 0.9;
  }, [caffeineLevel]);

  const blurAmount = useMemo(() => {
    const blur = Math.max(0, (1 - clarity) * 5);
    return blur;
  }, [clarity]);

  const getScreenColor = () => {
    if (caffeineLevel < 30) return '#1a1a2e';
    if (caffeineLevel > 70) return '#0f3460';
    return '#16213e';
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width, height }}
      role="img"
      aria-label={`Monitor at ${Math.round(clarity * 100)}% clarity`}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="monitor-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blurAmount} />
          </filter>

          <linearGradient id="screen-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={getScreenColor()} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="bezel-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a4a4a" />
            <stop offset="50%" stopColor="#2a2a2a" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </linearGradient>
        </defs>

        <rect
          x="10"
          y="10"
          width={width - 20}
          height={height - 60}
          rx="5"
          ry="5"
          fill="url(#bezel-gradient)"
          stroke="#000"
          strokeWidth="2"
        />

        <rect
          x="20"
          y="20"
          width={width - 40}
          height={height - 80}
          rx="2"
          ry="2"
          fill="url(#screen-gradient)"
          opacity={clarity}
        />

        <rect
          x={(width / 2) - 60}
          y={height - 50}
          width="120"
          height="40"
          fill="url(#bezel-gradient)"
        />
        <rect
          x={(width / 2) - 80}
          y={height - 20}
          width="160"
          height="20"
          fill="#1a1a1a"
        />

        <circle
          cx={width / 2}
          cy={height - 45}
          r="3"
          fill="#00ff00"
          opacity={caffeineLevel > 20 ? 0.8 : 0.2}
        />

        {showReflection && (
          <ellipse
            cx="60"
            cy="60"
            rx="30"
            ry="40"
            fill="#ffffff"
            opacity="0.1"
            transform={`rotate(-30 60 60)`}
          />
        )}
      </svg>

      <div
        className="absolute inset-x-5 top-5 bottom-20 overflow-hidden rounded"
        style={{
          filter: `blur(${blurAmount}px)`,
          opacity: clarity,
        }}
      >
        {content || (
          <div className="h-full w-full flex flex-col items-center justify-center p-4 text-green-400 font-mono">
            <div className="text-xs mb-2">STAY CAFFEINATED v1.0</div>
            <div className="text-2xl mb-4">Ready to Work</div>
            {showClock && (
              <div className="text-lg">{currentTime}</div>
            )}
            <div className="text-xs mt-4">
              Clarity: {Math.round(clarity * 100)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export interface MonitorContentProps {
  lines: string[];
  cursor?: boolean;
  typewriterEffect?: boolean;
  className?: string;
}

export const MonitorContent: React.FC<MonitorContentProps> = ({
  lines,
  cursor = true,
  typewriterEffect = false,
  className = '',
}) => {
  return (
    <div className={`h-full w-full p-4 font-mono text-green-400 text-sm ${className}`}>
      {lines.map((line, index) => (
        <div key={index} className="mb-1">
          {line}
          {cursor && index === lines.length - 1 && (
            <span className="animate-pulse">_</span>
          )}
        </div>
      ))}
    </div>
  );
};

export interface CodeEditorProps {
  code: string;
  language?: 'javascript' | 'typescript' | 'python' | 'html' | 'css';
  caffeineLevel: number;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language = 'javascript',
  caffeineLevel,
  showLineNumbers = true,
  className = '',
}) => {
  const clarity = useMemo(() => {
    if (caffeineLevel < 30) return 0.4;
    if (caffeineLevel < 50) return 0.7;
    if (caffeineLevel < 70) return 0.9;
    return 1;
  }, [caffeineLevel]);

  const lines = code.split('\n');

  return (
    <div
      className={`h-full w-full bg-gray-900 p-2 overflow-auto ${className}`}
      style={{ opacity: clarity }}
    >
      <div className="font-mono text-xs">
        {lines.map((line, index) => (
          <div key={index} className="flex">
            {showLineNumbers && (
              <span className="text-gray-500 mr-4 select-none">
                {String(index + 1).padStart(3, ' ')}
              </span>
            )}
            <span className="text-gray-300" style={{ filter: `blur(${(1 - clarity) * 2}px)` }}>
              {line || ' '}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};