import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OfficeWorkerSVG } from '@/components/game/OfficeWorkerSVG';

describe('OfficeWorkerSVG', () => {
  it('exposes a tripped-out state for extreme caffeine', () => {
    render(<OfficeWorkerSVG caffeineLevel={98} isActive={false} />);

    expect(screen.getByRole('img', { name: /tripped out/i })).toBeInTheDocument();
  });

  it('keeps ordinary over-caffeination distinct from tripped out', () => {
    render(<OfficeWorkerSVG caffeineLevel={90} isActive={false} />);

    expect(screen.getByRole('img', { name: /over-caffeinated/i })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /tripped out/i })).not.toBeInTheDocument();
  });
});
