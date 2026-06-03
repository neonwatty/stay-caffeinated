import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CaffeineMeterSVG } from '@/components/game/ui/CaffeineMeterSVG';

describe('CaffeineMeterSVG', () => {
  it('labels extreme caffeine as tripped instead of high', () => {
    render(<CaffeineMeterSVG caffeineLevel={98} healthLevel={100} isActive={false} />);

    expect(screen.getByText('TRIPPED')).toBeInTheDocument();
    expect(screen.queryByText('HIGH')).not.toBeInTheDocument();
  });

  it('keeps ordinary over-caffeination labeled as high', () => {
    render(<CaffeineMeterSVG caffeineLevel={90} healthLevel={100} isActive={false} />);

    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.queryByText('TRIPPED')).not.toBeInTheDocument();
  });
});
