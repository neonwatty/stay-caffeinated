import React from 'react';

export interface CharacterStateProps {
  width?: number;
  height?: number;
  className?: string;
}

export const UnderCaffeinatedCharacter: React.FC<CharacterStateProps> = ({
  width = 200,
  height = 200,
  className = '',
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 200 200"
    className={className}
    role="img"
    aria-label="Under-caffeinated character"
  >
    <g id="under-caffeinated">
      <circle cx="100" cy="100" r="50" fill="#E8D5C4" stroke="#8B7355" strokeWidth="2" />

      <circle cx="85" cy="90" r="8" fill="#2C3E50" />
      <circle cx="85" cy="92" r="3" fill="#95A5A6" />

      <circle cx="115" cy="90" r="8" fill="#2C3E50" />
      <circle cx="115" cy="92" r="3" fill="#95A5A6" />

      <path d="M 87 85 Q 85 82, 83 85" stroke="#8B7355" strokeWidth="2" fill="none" />
      <path d="M 117 85 Q 115 82, 113 85" stroke="#8B7355" strokeWidth="2" fill="none" />

      <path
        d="M 85 115 Q 100 105, 115 115"
        stroke="#8B7355"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <g className="zzz" opacity="0.7">
        <text x="140" y="70" fontSize="16" fill="#95A5A6" fontFamily="Arial">Z</text>
        <text x="150" y="60" fontSize="14" fill="#95A5A6" fontFamily="Arial">z</text>
        <text x="158" y="50" fontSize="12" fill="#95A5A6" fontFamily="Arial">z</text>
      </g>

      <g className="sweat-drops">
        <ellipse cx="70" cy="85" rx="3" ry="5" fill="#87CEEB" opacity="0.6" />
        <ellipse cx="130" cy="85" rx="3" ry="5" fill="#87CEEB" opacity="0.6" />
      </g>
    </g>
  </svg>
);

export const OptimalCharacter: React.FC<CharacterStateProps> = ({
  width = 200,
  height = 200,
  className = '',
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 200 200"
    className={className}
    role="img"
    aria-label="Optimally caffeinated character"
  >
    <g id="optimal">
      <circle cx="100" cy="100" r="50" fill="#FFE5CC" stroke="#D4A373" strokeWidth="2" />

      <circle cx="85" cy="90" r="8" fill="#2C3E50" />
      <circle cx="85" cy="89" r="4" fill="#34495E" />
      <circle cx="86" cy="88" r="2" fill="#FFFFFF" />

      <circle cx="115" cy="90" r="8" fill="#2C3E50" />
      <circle cx="115" cy="89" r="4" fill="#34495E" />
      <circle cx="116" cy="88" r="2" fill="#FFFFFF" />

      <path d="M 87 82 Q 85 80, 83 82" stroke="#D4A373" strokeWidth="2" fill="none" />
      <path d="M 117 82 Q 115 80, 113 82" stroke="#D4A373" strokeWidth="2" fill="none" />

      <path
        d="M 85 110 Q 100 120, 115 110"
        stroke="#D4A373"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <g className="sparkles">
        <path d="M 60 70 L 65 75 L 60 80 L 55 75 Z" fill="#FFD700" opacity="0.8" />
        <path d="M 140 70 L 145 75 L 140 80 L 135 75 Z" fill="#FFD700" opacity="0.8" />
        <path d="M 70 120 L 73 123 L 70 126 L 67 123 Z" fill="#FFD700" opacity="0.6" />
        <path d="M 130 120 L 133 123 L 130 126 L 127 123 Z" fill="#FFD700" opacity="0.6" />
      </g>

      <circle cx="72" cy="105" r="8" fill="#FFB6C1" opacity="0.4" />
      <circle cx="128" cy="105" r="8" fill="#FFB6C1" opacity="0.4" />
    </g>
  </svg>
);

export const OverCaffeinatedCharacter: React.FC<CharacterStateProps> = ({
  width = 200,
  height = 200,
  className = '',
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 200 200"
    className={className}
    role="img"
    aria-label="Over-caffeinated character"
  >
    <g id="over-caffeinated">
      <circle cx="100" cy="100" r="50" fill="#FFDAB9" stroke="#CD853F" strokeWidth="2" />

      <circle cx="85" cy="90" r="10" fill="#FFFFFF" stroke="#2C3E50" strokeWidth="2" />
      <circle cx="85" cy="90" r="6" fill="#2C3E50" />
      <circle cx="83" cy="88" r="2" fill="#FFFFFF" />

      <circle cx="115" cy="90" r="10" fill="#FFFFFF" stroke="#2C3E50" strokeWidth="2" />
      <circle cx="115" cy="90" r="6" fill="#2C3E50" />
      <circle cx="113" cy="88" r="2" fill="#FFFFFF" />

      <path d="M 87 78 L 83 82" stroke="#CD853F" strokeWidth="2" fill="none" />
      <path d="M 113 78 L 117 82" stroke="#CD853F" strokeWidth="2" fill="none" />

      <ellipse cx="100" cy="115" rx="15" ry="8" fill="#2C3E50" opacity="0.3" />

      <g className="shake-lines">
        <path d="M 55 85 L 50 85" stroke="#FF6347" strokeWidth="2" opacity="0.7" />
        <path d="M 55 95 L 48 95" stroke="#FF6347" strokeWidth="2" opacity="0.7" />
        <path d="M 55 105 L 50 105" stroke="#FF6347" strokeWidth="2" opacity="0.7" />

        <path d="M 145 85 L 150 85" stroke="#FF6347" strokeWidth="2" opacity="0.7" />
        <path d="M 145 95 L 152 95" stroke="#FF6347" strokeWidth="2" opacity="0.7" />
        <path d="M 145 105 L 150 105" stroke="#FF6347" strokeWidth="2" opacity="0.7" />
      </g>

      <g className="lightning-bolts">
        <path
          d="M 70 60 L 65 70 L 70 68 L 65 78"
          stroke="#FFD700"
          strokeWidth="2"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M 130 60 L 135 70 L 130 68 L 135 78"
          stroke="#FFD700"
          strokeWidth="2"
          fill="none"
          opacity="0.8"
        />
      </g>

      <g className="steam">
        <path
          d="M 100 50 Q 102 45, 100 40"
          stroke="#95A5A6"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M 90 50 Q 88 45, 90 40"
          stroke="#95A5A6"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M 110 50 Q 112 45, 110 40"
          stroke="#95A5A6"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />
      </g>
    </g>
  </svg>
);

export type CharacterState = 'under' | 'optimal' | 'over';

export const getCharacterComponent = (state: CharacterState) => {
  switch (state) {
    case 'under':
      return UnderCaffeinatedCharacter;
    case 'optimal':
      return OptimalCharacter;
    case 'over':
      return OverCaffeinatedCharacter;
    default:
      return OptimalCharacter;
  }
};