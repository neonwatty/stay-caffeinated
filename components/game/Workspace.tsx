import React, { useState, useEffect, useMemo } from 'react';
import { Monitor, MonitorContent, CodeEditor } from './Monitor';
import { Desk, CoffeeCup, generateCoffeeCup, DeskAccessories } from './Desk';
import { Character } from './Character';

export interface WorkspaceProps {
  caffeineLevel: number;
  coffeeCupsConsumed?: number;
  currentTask?: string;
  codeContent?: string;
  showCharacter?: boolean;
  showAccessories?: boolean;
  onDeskFull?: () => void;
  className?: string;
  layout?: 'default' | 'compact' | 'wide';
}

export const Workspace: React.FC<WorkspaceProps> = ({
  caffeineLevel,
  coffeeCupsConsumed = 0,
  currentTask,
  codeContent,
  showCharacter = true,
  showAccessories = false,
  onDeskFull,
  className = '',
  layout = 'default',
}) => {
  const [coffeeCups, setCoffeeCups] = useState<CoffeeCup[]>([]);
  const [monitorContent, setMonitorContent] = useState<string[]>([]);

  useEffect(() => {
    const newCups: CoffeeCup[] = [];
    for (let i = 0; i < coffeeCupsConsumed; i++) {
      const types: CoffeeCup['type'][] = ['coffee', 'espresso', 'latte', 'energy'];
      const type = types[i % types.length];
      newCups.push(generateCoffeeCup(type, i));
    }

    if (Math.random() > 0.7 && coffeeCupsConsumed > 3) {
      const randomIndex = Math.floor(Math.random() * newCups.length);
      newCups[randomIndex].isEmpty = true;
    }

    setCoffeeCups(newCups);

    if (coffeeCupsConsumed >= 10 && onDeskFull) {
      onDeskFull();
    }
  }, [coffeeCupsConsumed, onDeskFull]);

  useEffect(() => {
    const messages: string[] = [];

    if (caffeineLevel < 30) {
      messages.push('> System: Low caffeine detected');
      messages.push('> Warning: Productivity decreasing');
      messages.push('> Suggestion: Consume caffeine');
    } else if (caffeineLevel > 70) {
      messages.push('> System: High caffeine levels');
      messages.push('> Warning: Overstimulation risk');
      messages.push('> Status: Maximum efficiency');
    } else {
      messages.push('> System: Optimal performance');
      messages.push('> Status: Ready for tasks');
      if (currentTask) {
        messages.push(`> Current: ${currentTask}`);
      }
    }

    setMonitorContent(messages);
  }, [caffeineLevel, currentTask]);

  const getLayoutStyles = () => {
    switch (layout) {
      case 'compact':
        return {
          container: 'flex flex-col items-center gap-2',
          monitor: { width: 300, height: 225 },
          desk: { width: 400, height: 150 },
          character: { width: 150, height: 150 },
        };
      case 'wide':
        return {
          container: 'flex flex-row items-end gap-4',
          monitor: { width: 500, height: 375 },
          desk: { width: 700, height: 250 },
          character: { width: 250, height: 250 },
        };
      default:
        return {
          container: 'flex flex-col items-center gap-4',
          monitor: { width: 400, height: 300 },
          desk: { width: 600, height: 200 },
          character: { width: 200, height: 200 },
        };
    }
  };

  const layoutStyles = getLayoutStyles();

  const monitorContentElement = useMemo(() => {
    if (codeContent) {
      return (
        <CodeEditor
          code={codeContent}
          caffeineLevel={caffeineLevel}
          language="typescript"
        />
      );
    }
    return <MonitorContent lines={monitorContent} cursor={true} />;
  }, [codeContent, caffeineLevel, monitorContent]);

  return (
    <div
      className={`relative ${layoutStyles.container} ${className}`}
      role="region"
      aria-label="Workspace environment"
    >
      <div className="relative">
        <Monitor
          caffeineLevel={caffeineLevel}
          content={monitorContentElement}
          width={layoutStyles.monitor.width}
          height={layoutStyles.monitor.height}
        />

        {showCharacter && layout === 'default' && (
          <div className="absolute -right-20 top-1/2 -translate-y-1/2">
            <Character
              caffeineLevel={caffeineLevel}
              width={layoutStyles.character.width}
              height={layoutStyles.character.height}
              animateTransitions={true}
            />
          </div>
        )}
      </div>

      <Desk
        coffeeCups={coffeeCups}
        maxCups={10}
        showKeyboard={true}
        showMouse={true}
        showNotepad={caffeineLevel > 50}
        width={layoutStyles.desk.width}
        height={layoutStyles.desk.height}
      />

      {showCharacter && layout !== 'default' && (
        <Character
          caffeineLevel={caffeineLevel}
          width={layoutStyles.character.width}
          height={layoutStyles.character.height}
          animateTransitions={true}
        />
      )}

      {showAccessories && (
        <DeskAccessories
          showPlant={true}
          showLamp={caffeineLevel < 40}
          showPhoto={coffeeCupsConsumed > 5}
          className="absolute bottom-0 left-0"
        />
      )}

      <WorkspaceStats
        caffeineLevel={caffeineLevel}
        coffeeCups={coffeeCupsConsumed}
        deskCapacity={10}
        className="absolute top-0 right-0"
      />
    </div>
  );
};

interface WorkspaceStatsProps {
  caffeineLevel: number;
  coffeeCups: number;
  deskCapacity: number;
  className?: string;
}

const WorkspaceStats: React.FC<WorkspaceStatsProps> = ({
  caffeineLevel,
  coffeeCups,
  deskCapacity,
  className = '',
}) => {
  const getProductivityLevel = () => {
    if (caffeineLevel < 30) return 'Low';
    if (caffeineLevel < 50) return 'Moderate';
    if (caffeineLevel < 70) return 'High';
    if (caffeineLevel < 85) return 'Peak';
    return 'Overdrive';
  };

  const getProductivityColor = () => {
    if (caffeineLevel < 30) return 'text-red-500';
    if (caffeineLevel < 50) return 'text-yellow-500';
    if (caffeineLevel < 70) return 'text-green-500';
    if (caffeineLevel < 85) return 'text-blue-500';
    return 'text-purple-500';
  };

  return (
    <div className={`bg-black bg-opacity-70 text-white p-2 rounded text-xs ${className}`}>
      <div>Productivity: <span className={getProductivityColor()}>{getProductivityLevel()}</span></div>
      <div>Cups: {coffeeCups}/{deskCapacity}</div>
      <div>Monitor: {Math.round((caffeineLevel / 100) * 100)}% Clear</div>
    </div>
  );
};

export interface WorkspaceSceneProps extends WorkspaceProps {
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  weather?: 'sunny' | 'cloudy' | 'rainy';
  ambientSound?: boolean;
}

export const WorkspaceScene: React.FC<WorkspaceSceneProps> = ({
  timeOfDay = 'morning',
  weather = 'sunny',
  ambientSound = false,
  ...workspaceProps
}) => {
  const getBackgroundColor = () => {
    const colors = {
      morning: 'bg-gradient-to-b from-yellow-100 to-blue-200',
      afternoon: 'bg-gradient-to-b from-blue-300 to-blue-400',
      evening: 'bg-gradient-to-b from-orange-300 to-purple-400',
      night: 'bg-gradient-to-b from-indigo-900 to-black',
    };
    return colors[timeOfDay];
  };

  const getWindowView = () => {
    return (
      <div className="absolute top-4 left-4 w-32 h-24 rounded border-4 border-gray-600 overflow-hidden">
        <div className={`w-full h-full ${getBackgroundColor()}`}>
          {weather === 'sunny' && (
            <div className="absolute top-2 right-2 w-8 h-8 bg-yellow-400 rounded-full" />
          )}
          {weather === 'cloudy' && (
            <>
              <div className="absolute top-4 left-4 w-12 h-6 bg-gray-300 rounded-full opacity-70" />
              <div className="absolute top-6 right-6 w-10 h-5 bg-gray-300 rounded-full opacity-70" />
            </>
          )}
          {weather === 'rainy' && (
            <div className="absolute inset-0 opacity-30">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-blue-400"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: '1px',
                    height: '10px',
                    animation: 'fall 1s linear infinite',
                    animationDelay: `${Math.random()}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full p-8">
      {getWindowView()}
      <Workspace {...workspaceProps} />
      {ambientSound && (
        <div className="absolute bottom-4 right-4 text-xs text-gray-500">
          🔊 Ambient: {weather === 'rainy' ? 'Rain' : 'Office'}
        </div>
      )}
    </div>
  );
};

export { Monitor, MonitorContent, CodeEditor } from './Monitor';
export { Desk, generateCoffeeCup, DeskAccessories, type CoffeeCup } from './Desk';