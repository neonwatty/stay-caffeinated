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
  buttonLabel?: string;
  disabled?: boolean;
  describedBy?: string;
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
  buttonLabel,
  disabled = false,
  describedBy,
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

  if (buttonLabel || onClick) {
    const isDisabled = disabled || state === 'cooldown';

    return (
      <button
        type="button"
        aria-label={buttonLabel}
        aria-describedby={describedBy}
        onClick={isDisabled ? undefined : onClick}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.6 : 1,
          transition: 'transform 0.15s ease',
        }}
        disabled={isDisabled}
      >
        <span aria-hidden="true">{content}</span>
      </button>
    );
  }

  return content;
}
