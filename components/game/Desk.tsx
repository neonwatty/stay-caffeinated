import React, { useMemo } from 'react';

export interface CoffeeCup {
  id: string;
  x: number;
  y: number;
  type: 'espresso' | 'coffee' | 'latte' | 'energy';
  isEmpty: boolean;
}

export interface DeskProps {
  coffeeCups?: CoffeeCup[];
  maxCups?: number;
  showKeyboard?: boolean;
  showMouse?: boolean;
  showNotepad?: boolean;
  deskColor?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const Desk: React.FC<DeskProps> = ({
  coffeeCups = [],
  maxCups = 10,
  showKeyboard = true,
  showMouse = true,
  showNotepad = false,
  deskColor = '#8B4513',
  width = 600,
  height = 200,
  className = '',
}) => {
  const cupPositions = useMemo(() => {
    const positions: Array<{ x: number; y: number }> = [];
    const rows = 2;
    const cols = Math.ceil(maxCups / rows);
    const cupArea = { x: width * 0.1, y: height * 0.3, w: width * 0.35, h: height * 0.5 };

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (positions.length < maxCups) {
          positions.push({
            x: cupArea.x + (col * cupArea.w / cols) + 15,
            y: cupArea.y + (row * cupArea.h / rows) + 10,
          });
        }
      }
    }
    return positions;
  }, [maxCups, width, height]);

  const getCupColor = (type: CoffeeCup['type'], isEmpty: boolean) => {
    if (isEmpty) return '#D3D3D3';
    switch (type) {
      case 'espresso': return '#2F1B14';
      case 'coffee': return '#6F4E37';
      case 'latte': return '#C4A574';
      case 'energy': return '#00FF00';
      default: return '#6F4E37';
    }
  };

  const getCupSize = (type: CoffeeCup['type']) => {
    switch (type) {
      case 'espresso': return { width: 20, height: 25 };
      case 'coffee': return { width: 25, height: 30 };
      case 'latte': return { width: 28, height: 35 };
      case 'energy': return { width: 22, height: 40 };
      default: return { width: 25, height: 30 };
    }
  };

  return (
    <div
      className={`relative ${className}`}
      style={{ width, height }}
      role="img"
      aria-label={`Desk with ${coffeeCups.length} coffee cups`}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="desk-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={deskColor} stopOpacity="1" />
            <stop offset="100%" stopColor="#654321" stopOpacity="1" />
          </linearGradient>

          <pattern id="wood-texture" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill={deskColor} />
            <line x1="0" y1="0" x2="100" y2="0" stroke="#654321" strokeWidth="0.5" opacity="0.3" />
            <line x1="0" y1="25" x2="100" y2="25" stroke="#654321" strokeWidth="0.5" opacity="0.3" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#654321" strokeWidth="0.5" opacity="0.3" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="#654321" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>

        <rect
          x="0"
          y="20"
          width={width}
          height={height - 20}
          fill="url(#wood-texture)"
        />
        <rect
          x="0"
          y="20"
          width={width}
          height="5"
          fill="#654321"
        />

        {showKeyboard && (
          <g id="keyboard">
            <rect
              x={width * 0.5}
              y={height * 0.4}
              width="140"
              height="50"
              rx="3"
              fill="#2C3E50"
              stroke="#1a1a1a"
              strokeWidth="1"
            />
            <rect
              x={width * 0.5 + 5}
              y={height * 0.4 + 5}
              width="130"
              height="40"
              fill="#34495E"
            />
            {[...Array(4)].map((_, row) => (
              [...Array(10)].map((_, col) => (
                <rect
                  key={`key-${row}-${col}`}
                  x={width * 0.5 + 10 + col * 12}
                  y={height * 0.4 + 10 + row * 9}
                  width="10"
                  height="7"
                  fill="#2C3E50"
                  rx="1"
                />
              ))
            ))}
          </g>
        )}

        {showMouse && (
          <g id="mouse">
            <ellipse
              cx={width * 0.75}
              cy={height * 0.6}
              rx="15"
              ry="20"
              fill="#2C3E50"
              stroke="#1a1a1a"
              strokeWidth="1"
            />
            <line
              x1={width * 0.75}
              y1={height * 0.6 - 10}
              x2={width * 0.75}
              y2={height * 0.6}
              stroke="#1a1a1a"
              strokeWidth="1"
            />
          </g>
        )}

        {showNotepad && (
          <g id="notepad">
            <rect
              x={width * 0.8}
              y={height * 0.3}
              width="60"
              height="80"
              fill="#FFFACD"
              stroke="#DAA520"
              strokeWidth="1"
            />
            {[...Array(8)].map((_, i) => (
              <line
                key={`line-${i}`}
                x1={width * 0.8 + 5}
                y1={height * 0.3 + 15 + i * 8}
                x2={width * 0.8 + 55}
                y2={height * 0.3 + 15 + i * 8}
                stroke="#DAA520"
                strokeWidth="0.5"
                opacity="0.3"
              />
            ))}
          </g>
        )}

        {coffeeCups.slice(0, maxCups).map((cup, index) => {
          const pos = cupPositions[index] || { x: cup.x, y: cup.y };
          const size = getCupSize(cup.type);
          const color = getCupColor(cup.type, cup.isEmpty);

          return (
            <g key={cup.id} id={`cup-${cup.id}`}>
              <ellipse
                cx={pos.x}
                cy={pos.y + size.height}
                rx={size.width / 2 - 2}
                ry="3"
                fill="#000000"
                opacity="0.2"
              />

              <rect
                x={pos.x - size.width / 2}
                y={pos.y}
                width={size.width}
                height={size.height}
                fill={color}
                rx="2"
              />

              {!cup.isEmpty && (
                <ellipse
                  cx={pos.x}
                  cy={pos.y + 3}
                  rx={size.width / 2 - 3}
                  ry="2"
                  fill={color}
                  opacity="0.7"
                />
              )}

              {cup.type === 'coffee' && (
                <path
                  d={`M ${pos.x + size.width / 2} ${pos.y + 10}
                      Q ${pos.x + size.width / 2 + 5} ${pos.y + 15}
                      ${pos.x + size.width / 2} ${pos.y + 20}`}
                  stroke={color}
                  strokeWidth="3"
                  fill="none"
                />
              )}

              {!cup.isEmpty && (
                <g className="steam" opacity="0.5">
                  <path
                    d={`M ${pos.x - 5} ${pos.y - 5} Q ${pos.x - 3} ${pos.y - 10}, ${pos.x - 5} ${pos.y - 15}`}
                    stroke="#95A5A6"
                    strokeWidth="1"
                    fill="none"
                  />
                  <path
                    d={`M ${pos.x} ${pos.y - 5} Q ${pos.x + 2} ${pos.y - 10}, ${pos.x} ${pos.y - 15}`}
                    stroke="#95A5A6"
                    strokeWidth="1"
                    fill="none"
                  />
                  <path
                    d={`M ${pos.x + 5} ${pos.y - 5} Q ${pos.x + 3} ${pos.y - 10}, ${pos.x + 5} ${pos.y - 15}`}
                    stroke="#95A5A6"
                    strokeWidth="1"
                    fill="none"
                  />
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {coffeeCups.length >= maxCups && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl">
          Desk Full!
        </div>
      )}
    </div>
  );
};

export const generateCoffeeCup = (
  type: CoffeeCup['type'] = 'coffee',
  index: number = 0
): CoffeeCup => {
  return {
    id: `cup-${Date.now()}-${index}`,
    x: 0,
    y: 0,
    type,
    isEmpty: false,
  };
};

export const DeskAccessories: React.FC<{
  showPlant?: boolean;
  showLamp?: boolean;
  showPhoto?: boolean;
  className?: string;
}> = ({
  showPlant = false,
  showLamp = false,
  showPhoto = false,
  className = '',
}) => {
  return (
    <div className={`flex gap-4 ${className}`}>
      {showPlant && (
        <svg width="40" height="50" viewBox="0 0 40 50">
          <rect x="10" y="30" width="20" height="20" fill="#8B4513" rx="2" />
          <ellipse cx="20" cy="20" rx="15" ry="18" fill="#228B22" />
          <ellipse cx="20" cy="18" rx="10" ry="12" fill="#32CD32" />
        </svg>
      )}

      {showLamp && (
        <svg width="50" height="60" viewBox="0 0 50 60">
          <line x1="25" y1="60" x2="25" y2="20" stroke="#333" strokeWidth="3" />
          <path
            d="M 10 20 L 40 20 L 35 5 L 15 5 Z"
            fill="#FFD700"
            opacity="0.8"
          />
          <ellipse cx="25" cy="60" rx="10" ry="3" fill="#333" />
        </svg>
      )}

      {showPhoto && (
        <svg width="40" height="35" viewBox="0 0 40 35">
          <rect x="5" y="5" width="30" height="25" fill="#8B4513" stroke="#654321" strokeWidth="2" />
          <rect x="8" y="8" width="24" height="19" fill="#FFFAF0" />
          <circle cx="20" cy="15" r="3" fill="#FFD700" />
          <path d="M 10 22 L 15 18 L 20 20 L 25 16 L 30 22" stroke="#228B22" strokeWidth="2" fill="none" />
        </svg>
      )}
    </div>
  );
};