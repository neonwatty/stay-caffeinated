'use client';

import { ProteinBarSVG } from './ProteinBarSVG';
import { VitaminsSVG } from './VitaminsSVG';
import { PowerNapSVG } from './PowerNapSVG';
import { EnergyBoostSVG } from './EnergyBoostSVG';
import { ShieldSVG } from './ShieldSVG';

type PowerUpType = 'proteinBar' | 'vitamins' | 'powerNap' | 'energyBoost' | 'shield';

interface PowerUpIconProps {
  powerUpType: PowerUpType;
  state: 'available' | 'active' | 'used';
  size?: number;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * Wrapper that selects the correct power-up SVG based on powerUpType.
 */
export function PowerUpIcon({
  powerUpType,
  state,
  size = 80,
  isActive = true,
  onClick,
}: PowerUpIconProps) {
  const props = { state, size, isActive };

  const content = (() => {
    switch (powerUpType) {
      case 'proteinBar': return <ProteinBarSVG {...props} />;
      case 'vitamins': return <VitaminsSVG {...props} />;
      case 'powerNap': return <PowerNapSVG {...props} />;
      case 'energyBoost': return <EnergyBoostSVG {...props} />;
      case 'shield': return <ShieldSVG {...props} />;
    }
  })();

  if (onClick) {
    return (
      <button
        onClick={onClick}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: state === 'used' ? 'not-allowed' : 'pointer',
          transition: 'transform 0.15s ease',
        }}
        disabled={state === 'used'}
      >
        {content}
      </button>
    );
  }

  return content;
}
