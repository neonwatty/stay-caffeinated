import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Workspace, WorkspaceScene } from '../Workspace';
import { Monitor, MonitorContent, CodeEditor } from '../Monitor';
import { Desk, generateCoffeeCup, DeskAccessories } from '../Desk';

describe('Monitor Component', () => {
  describe('Clarity Calculation', () => {
    it('should have low clarity when caffeine level is below 20', () => {
      render(<Monitor caffeineLevel={15} />);
      const monitor = screen.getByRole('img', { name: /Monitor at 30% clarity/i });
      expect(monitor).toBeInTheDocument();
    });

    it('should have moderate clarity when caffeine level is between 20-40', () => {
      render(<Monitor caffeineLevel={30} />);
      const monitor = screen.getByRole('img', { name: /Monitor at 60% clarity/i });
      expect(monitor).toBeInTheDocument();
    });

    it('should have high clarity when caffeine level is between 40-60', () => {
      render(<Monitor caffeineLevel={50} />);
      const monitor = screen.getByRole('img', { name: /Monitor at 85% clarity/i });
      expect(monitor).toBeInTheDocument();
    });

    it('should have full clarity when caffeine level is between 60-80', () => {
      render(<Monitor caffeineLevel={70} />);
      const monitor = screen.getByRole('img', { name: /Monitor at 100% clarity/i });
      expect(monitor).toBeInTheDocument();
    });

    it('should have slightly reduced clarity when caffeine level is above 80', () => {
      render(<Monitor caffeineLevel={90} />);
      const monitor = screen.getByRole('img', { name: /Monitor at 90% clarity/i });
      expect(monitor).toBeInTheDocument();
    });
  });

  describe('Monitor Content', () => {
    it('should display custom content when provided', () => {
      const customContent = <div>Custom Monitor Content</div>;
      render(<Monitor caffeineLevel={50} content={customContent} />);
      expect(screen.getByText('Custom Monitor Content')).toBeInTheDocument();
    });

    it('should display default content when no custom content provided', () => {
      render(<Monitor caffeineLevel={50} />);
      expect(screen.getByText('STAY CAFFEINATED v1.0')).toBeInTheDocument();
      expect(screen.getByText('Ready to Work')).toBeInTheDocument();
    });

    it('should show clock when showClock is true', () => {
      render(<Monitor caffeineLevel={50} showClock={true} currentTime="10:30" />);
      expect(screen.getByText('10:30')).toBeInTheDocument();
    });
  });

  describe('MonitorContent Component', () => {
    it('should display lines of text', () => {
      const lines = ['Line 1', 'Line 2', 'Line 3'];
      render(<MonitorContent lines={lines} />);
      lines.forEach(line => {
        expect(screen.getByText(line)).toBeInTheDocument();
      });
    });

    it('should show cursor on last line when cursor is true', () => {
      const lines = ['Line 1', 'Line 2'];
      render(<MonitorContent lines={lines} cursor={true} />);
      const lastLine = screen.getByText((content, element) => {
        return element?.textContent === 'Line 2_';
      });
      expect(lastLine).toBeInTheDocument();
    });
  });

  describe('CodeEditor Component', () => {
    it('should display code with proper clarity based on caffeine level', () => {
      const code = 'function test() {\n  return true;\n}';
      render(<CodeEditor code={code} caffeineLevel={70} />);
      expect(screen.getByText(/function test/)).toBeInTheDocument();
    });

    it('should show line numbers when showLineNumbers is true', () => {
      const code = 'line1\nline2';
      render(<CodeEditor code={code} caffeineLevel={50} showLineNumbers={true} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});

describe('Desk Component', () => {
  describe('Coffee Cup Management', () => {
    it('should display coffee cups on the desk', () => {
      const cups = [
        generateCoffeeCup('coffee', 0),
        generateCoffeeCup('espresso', 1),
      ];
      render(<Desk coffeeCups={cups} />);
      const desk = screen.getByRole('img', { name: /Desk with 2 coffee cups/i });
      expect(desk).toBeInTheDocument();
    });

    it('should limit cups to maxCups value', () => {
      const cups = Array.from({ length: 15 }, (_, i) => generateCoffeeCup('coffee', i));
      render(<Desk coffeeCups={cups} maxCups={10} />);
      const desk = screen.getByRole('img', { name: /Desk with 15 coffee cups/i });
      expect(desk).toBeInTheDocument();
    });

    it('should show desk full warning when at capacity', () => {
      const cups = Array.from({ length: 10 }, (_, i) => generateCoffeeCup('coffee', i));
      render(<Desk coffeeCups={cups} maxCups={10} />);
      expect(screen.getByText('Desk Full!')).toBeInTheDocument();
    });
  });

  describe('Desk Accessories', () => {
    it('should show keyboard when showKeyboard is true', () => {
      const { container } = render(<Desk showKeyboard={true} />);
      const keyboard = container.querySelector('#keyboard');
      expect(keyboard).toBeInTheDocument();
    });

    it('should show mouse when showMouse is true', () => {
      const { container } = render(<Desk showMouse={true} />);
      const mouse = container.querySelector('#mouse');
      expect(mouse).toBeInTheDocument();
    });

    it('should show notepad when showNotepad is true', () => {
      const { container } = render(<Desk showNotepad={true} />);
      const notepad = container.querySelector('#notepad');
      expect(notepad).toBeInTheDocument();
    });
  });

  describe('Coffee Cup Generation', () => {
    it('should generate coffee cup with correct properties', () => {
      const cup = generateCoffeeCup('espresso', 5);
      expect(cup.type).toBe('espresso');
      expect(cup.isEmpty).toBe(false);
      expect(cup.id).toContain('cup-');
    });
  });

  describe('DeskAccessories Component', () => {
    it('should render plant when showPlant is true', () => {
      const { container } = render(<DeskAccessories showPlant={true} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render lamp when showLamp is true', () => {
      const { container } = render(<DeskAccessories showLamp={true} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render photo when showPhoto is true', () => {
      const { container } = render(<DeskAccessories showPhoto={true} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});

describe('Workspace Component', () => {
  describe('Integration', () => {
    it('should render all workspace components', () => {
      render(<Workspace caffeineLevel={50} coffeeCupsConsumed={3} />);
      expect(screen.getByRole('region', { name: /Workspace environment/i })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /Monitor/i })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /Desk/i })).toBeInTheDocument();
    });

    it('should update coffee cups based on coffeeCupsConsumed', () => {
      render(<Workspace caffeineLevel={50} coffeeCupsConsumed={5} />);
      const desk = screen.getByRole('img', { name: /Desk with 5 coffee cups/i });
      expect(desk).toBeInTheDocument();
    });

    it('should call onDeskFull when desk reaches capacity', () => {
      const onDeskFull = vi.fn();
      render(<Workspace caffeineLevel={50} coffeeCupsConsumed={10} onDeskFull={onDeskFull} />);
      expect(onDeskFull).toHaveBeenCalled();
    });

    it('should show character when showCharacter is true', () => {
      render(<Workspace caffeineLevel={50} showCharacter={true} />);
      expect(screen.getByRole('img', { name: /Character is optimally caffeinated/i })).toBeInTheDocument();
    });
  });

  describe('Layout Options', () => {
    it('should apply default layout', () => {
      const { container } = render(<Workspace caffeineLevel={50} layout="default" />);
      expect(container.querySelector('.flex-col')).toBeInTheDocument();
    });

    it('should apply compact layout', () => {
      const { container } = render(<Workspace caffeineLevel={50} layout="compact" />);
      expect(container.querySelector('.gap-2')).toBeInTheDocument();
    });

    it('should apply wide layout', () => {
      const { container } = render(<Workspace caffeineLevel={50} layout="wide" />);
      expect(container.querySelector('.flex-row')).toBeInTheDocument();
    });
  });

  describe('Productivity Stats', () => {
    it('should show low productivity for low caffeine', () => {
      render(<Workspace caffeineLevel={20} />);
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('should show high productivity for optimal caffeine', () => {
      render(<Workspace caffeineLevel={65} />);
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('should display cup count and capacity', () => {
      render(<Workspace caffeineLevel={50} coffeeCupsConsumed={4} />);
      expect(screen.getByText('Cups: 4/10')).toBeInTheDocument();
    });
  });
});

describe('WorkspaceScene Component', () => {
  it('should render workspace with scene elements', () => {
    render(<WorkspaceScene caffeineLevel={50} timeOfDay="morning" />);
    expect(screen.getByRole('region', { name: /Workspace environment/i })).toBeInTheDocument();
  });

  it('should apply morning background', () => {
    const { container } = render(<WorkspaceScene caffeineLevel={50} timeOfDay="morning" />);
    expect(container.querySelector('.from-yellow-100')).toBeInTheDocument();
  });

  it('should apply night background', () => {
    const { container } = render(<WorkspaceScene caffeineLevel={50} timeOfDay="night" />);
    expect(container.querySelector('.from-indigo-900')).toBeInTheDocument();
  });

  it('should show sun for sunny weather', () => {
    const { container } = render(<WorkspaceScene caffeineLevel={50} weather="sunny" />);
    expect(container.querySelector('.bg-yellow-400')).toBeInTheDocument();
  });

  it('should show clouds for cloudy weather', () => {
    const { container } = render(<WorkspaceScene caffeineLevel={50} weather="cloudy" />);
    expect(container.querySelector('.bg-gray-300')).toBeInTheDocument();
  });

  it('should show ambient sound indicator when enabled', () => {
    render(<WorkspaceScene caffeineLevel={50} ambientSound={true} weather="rainy" />);
    expect(screen.getByText('🔊 Ambient: Rain')).toBeInTheDocument();
  });
});