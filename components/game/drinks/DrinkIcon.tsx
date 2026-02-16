'use client';

import { TeaCupSVG } from './TeaCupSVG';
import { CoffeeMugSVG } from './CoffeeMugSVG';
import { EnergyDrinkCanSVG } from './EnergyDrinkCanSVG';
import { EspressoShotSVG } from './EspressoShotSVG';
import { WaterGlassSVG } from './WaterGlassSVG';

type DrinkType = 'tea' | 'coffee' | 'energyDrink' | 'espresso' | 'water';

interface DrinkIconProps {
  drinkType: DrinkType;
  state: 'idle' | 'consumed' | 'cooldown';
  cooldownProgress?: number;
  size?: number;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * Wrapper that selects the correct drink SVG based on drinkType.
 */
export function DrinkIcon({
  drinkType,
  state,
  cooldownProgress,
  size = 100,
  isActive = true,
  onClick,
}: DrinkIconProps) {
  const props = { state, cooldownProgress, size, isActive };

  const content = (() => {
    switch (drinkType) {
      case 'tea': return <TeaCupSVG {...props} />;
      case 'coffee': return <CoffeeMugSVG {...props} />;
      case 'energyDrink': return <EnergyDrinkCanSVG {...props} />;
      case 'espresso': return <EspressoShotSVG {...props} />;
      case 'water': return <WaterGlassSVG {...props} />;
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
          cursor: state === 'cooldown' ? 'not-allowed' : 'pointer',
          opacity: state === 'cooldown' ? 0.6 : 1,
          transition: 'transform 0.15s ease',
        }}
        disabled={state === 'cooldown'}
      >
        {content}
      </button>
    );
  }

  return content;
}
