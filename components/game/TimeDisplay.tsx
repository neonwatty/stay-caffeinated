import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export interface TimeDisplayProps {
  difficulty?: 'easy' | 'normal' | 'hard' | 'extreme';
  isPaused?: boolean;
  onDayComplete?: () => void;
  onTimeUpdate?: (time: GameTime) => void;
  format?: '12h' | '24h';
  showProgress?: boolean;
  showDayCounter?: boolean;
  className?: string;
  startTime?: number; // Starting hour (0-23)
  endTime?: number;   // Ending hour (0-23)
}

export interface GameTime {
  hours: number;
  minutes: number;
  seconds: number;
  day: number;
  isWorkHours: boolean;
  isLunchTime: boolean;
  isOvertime: boolean;
  progress: number; // 0-100 percentage of workday complete
}

const DIFFICULTY_SPEEDS = {
  easy: 180000,    // 3 minutes for full workday
  normal: 240000,  // 4 minutes for full workday
  hard: 300000,    // 5 minutes for full workday
  extreme: 360000, // 6 minutes for full workday
};

const WORK_START = 9;  // 9 AM
const LUNCH_START = 12; // 12 PM
const LUNCH_END = 13;   // 1 PM
const WORK_END = 17;    // 5 PM
const OVERTIME_END = 20; // 8 PM

export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  difficulty = 'normal',
  isPaused = false,
  onDayComplete,
  onTimeUpdate,
  format = '12h',
  showProgress = true,
  showDayCounter = true,
  className = '',
  startTime = WORK_START,
  endTime = WORK_END,
}) => {
  const [gameTime, setGameTime] = useState<GameTime>({
    hours: startTime,
    minutes: 0,
    seconds: 0,
    day: 1,
    isWorkHours: true,
    isLunchTime: false,
    isOvertime: false,
    progress: 0,
  });

  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(Date.now());
  const accumulatedTimeRef = useRef<number>(0);

  // Calculate milliseconds per game minute based on difficulty
  const msPerGameMinute = useMemo(() => {
    const totalGameMinutes = (endTime - startTime) * 60;
    const totalRealMs = DIFFICULTY_SPEEDS[difficulty];
    return totalRealMs / totalGameMinutes;
  }, [difficulty, startTime, endTime]);

  // Calculate milliseconds per game second (60x faster than minutes)
  const msPerGameSecond = msPerGameMinute / 60;

  const calculateTimeState = useCallback((hours: number, minutes: number): Pick<GameTime, 'isWorkHours' | 'isLunchTime' | 'isOvertime' | 'progress'> => {
    const totalMinutes = hours * 60 + minutes;
    const workStartMinutes = startTime * 60;
    const workEndMinutes = endTime * 60;
    const currentWorkMinutes = totalMinutes - workStartMinutes;
    const totalWorkMinutes = workEndMinutes - workStartMinutes;

    const isWorkHours = hours >= startTime && hours < endTime;
    const isLunchTime = hours >= LUNCH_START && hours < LUNCH_END;
    const isOvertime = hours >= endTime && hours < OVERTIME_END;
    const progress = Math.min(100, Math.max(0, (currentWorkMinutes / totalWorkMinutes) * 100));

    return {
      isWorkHours,
      isLunchTime,
      isOvertime,
      progress,
    };
  }, [startTime, endTime]);

  const updateTime = useCallback(() => {
    if (isPaused) {
      lastUpdateRef.current = Date.now();
      return;
    }

    const now = Date.now();
    const deltaTime = now - lastUpdateRef.current;
    lastUpdateRef.current = now;

    // Accumulate time to handle sub-second updates
    accumulatedTimeRef.current += deltaTime;

    // Calculate how many game seconds have passed
    const gameSecondsPassed = Math.floor(accumulatedTimeRef.current / msPerGameSecond);

    if (gameSecondsPassed > 0) {
      accumulatedTimeRef.current -= gameSecondsPassed * msPerGameSecond;

      setGameTime(prevTime => {
        let { hours, minutes, seconds, day } = prevTime;

        // Add the passed game seconds
        seconds += gameSecondsPassed;

        // Handle overflow
        const additionalMinutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        minutes += additionalMinutes;

        const additionalHours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        hours += additionalHours;

        // Check for day transition
        if (hours >= OVERTIME_END) {
          hours = startTime;
          minutes = 0;
          seconds = 0;
          day += 1;
          accumulatedTimeRef.current = 0;

          if (onDayComplete) {
            onDayComplete();
          }
        }

        const newTimeState = {
          hours,
          minutes,
          seconds,
          day,
          ...calculateTimeState(hours, minutes),
        };

        if (onTimeUpdate) {
          onTimeUpdate(newTimeState);
        }

        return newTimeState;
      });
    }

    animationFrameRef.current = requestAnimationFrame(updateTime);
  }, [isPaused, msPerGameSecond, startTime, calculateTimeState, onDayComplete, onTimeUpdate]);

  useEffect(() => {
    if (!isPaused) {
      lastUpdateRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, updateTime]);

  const formatTime = (hours: number, minutes: number, seconds: number): string => {
    if (format === '24h') {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
  };

  const getTimeOfDayLabel = (): string => {
    const { hours, isLunchTime, isOvertime } = gameTime;

    if (isOvertime) return 'Overtime';
    if (isLunchTime) return 'Lunch Break';
    if (hours < 12) return 'Morning';
    if (hours < 17) return 'Afternoon';
    return 'Evening';
  };

  const getTimeOfDayColor = (): string => {
    const { isWorkHours, isLunchTime, isOvertime } = gameTime;

    if (isOvertime) return 'text-red-500';
    if (isLunchTime) return 'text-green-500';
    if (isWorkHours) return 'text-blue-500';
    return 'text-gray-500';
  };

  const getProgressBarColor = (): string => {
    const { progress, isOvertime } = gameTime;

    if (isOvertime) return 'bg-red-500';
    if (progress < 25) return 'bg-green-500';
    if (progress < 50) return 'bg-blue-500';
    if (progress < 75) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`} role="timer" aria-live="polite">
      {/* Main Time Display */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className={`text-2xl font-bold font-mono ${getTimeOfDayColor()}`}>
            {formatTime(gameTime.hours, gameTime.minutes, gameTime.seconds)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {getTimeOfDayLabel()}
          </div>
        </div>

        {showDayCounter && (
          <div className="text-right">
            <div className="text-lg font-semibold">Day {gameTime.day}</div>
            <div className="text-xs text-gray-500">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Mode
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Work Progress</span>
            <span>{Math.round(gameTime.progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressBarColor()}`}
              style={{ width: `${gameTime.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Time Indicators */}
      <TimeIndicators gameTime={gameTime} />

      {/* Pause Indicator */}
      {isPaused && (
        <div className="text-center text-yellow-500 animate-pulse">
          ⏸ PAUSED
        </div>
      )}
    </div>
  );
};

interface TimeIndicatorsProps {
  gameTime: GameTime;
}

const TimeIndicators: React.FC<TimeIndicatorsProps> = ({ gameTime }) => {
  const indicators = [];

  if (gameTime.isWorkHours && !gameTime.isLunchTime) {
    indicators.push(
      <span key="work" className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
        Working
      </span>
    );
  }

  if (gameTime.isLunchTime) {
    indicators.push(
      <span key="lunch" className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
        Lunch
      </span>
    );
  }

  if (gameTime.isOvertime) {
    indicators.push(
      <span key="overtime" className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-xs animate-pulse">
        Overtime!
      </span>
    );
  }

  if (gameTime.progress > 90 && !gameTime.isOvertime) {
    indicators.push(
      <span key="almost" className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded text-xs">
        Almost Done!
      </span>
    );
  }

  return indicators.length > 0 ? (
    <div className="flex gap-2 flex-wrap">
      {indicators}
    </div>
  ) : null;
};

export interface ClockFaceProps {
  hours: number;
  minutes: number;
  size?: number;
  showNumbers?: boolean;
  className?: string;
}

export const ClockFace: React.FC<ClockFaceProps> = ({
  hours,
  minutes,
  size = 100,
  showNumbers = true,
  className = '',
}) => {
  const hourAngle = ((hours % 12) * 30) + (minutes * 0.5) - 90;
  const minuteAngle = (minutes * 6) - 90;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`Clock showing ${hours}:${minutes.toString().padStart(2, '0')}`}
    >
      {/* Clock face */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="white"
        stroke="currentColor"
        strokeWidth="2"
        className="dark:fill-gray-800"
      />

      {/* Hour markers */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30) - 90;
        const x1 = 50 + 38 * Math.cos(angle * Math.PI / 180);
        const y1 = 50 + 38 * Math.sin(angle * Math.PI / 180);
        const x2 = 50 + 42 * Math.cos(angle * Math.PI / 180);
        const y2 = 50 + 42 * Math.sin(angle * Math.PI / 180);

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={i % 3 === 0 ? "2" : "1"}
            opacity={i % 3 === 0 ? "1" : "0.5"}
          />
        );
      })}

      {/* Numbers */}
      {showNumbers && [12, 3, 6, 9].map((num, i) => {
        const angle = (i * 90) - 90;
        const x = 50 + 32 * Math.cos(angle * Math.PI / 180);
        const y = 50 + 32 * Math.sin(angle * Math.PI / 180) + 4;

        return (
          <text
            key={num}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="10"
            fill="currentColor"
            className="font-semibold"
          >
            {num}
          </text>
        );
      })}

      {/* Hour hand */}
      <line
        x1="50"
        y1="50"
        x2={50 + 20 * Math.cos(hourAngle * Math.PI / 180)}
        y2={50 + 20 * Math.sin(hourAngle * Math.PI / 180)}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Minute hand */}
      <line
        x1="50"
        y1="50"
        x2={50 + 30 * Math.cos(minuteAngle * Math.PI / 180)}
        y2={50 + 30 * Math.sin(minuteAngle * Math.PI / 180)}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx="50" cy="50" r="3" fill="currentColor" />
    </svg>
  );
};

export interface DayProgressProps {
  progress: number;
  day: number;
  variant?: 'linear' | 'circular';
  showMilestones?: boolean;
  className?: string;
}

export const DayProgress: React.FC<DayProgressProps> = ({
  progress,
  day,
  variant = 'linear',
  showMilestones = true,
  className = '',
}) => {
  const milestones = [
    { label: 'Start', value: 0 },
    { label: 'Lunch', value: 37.5 }, // 12pm is 37.5% through 9-5
    { label: 'Afternoon', value: 50 },
    { label: 'End', value: 100 },
  ];

  if (variant === 'circular') {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg width="120" height="120" className="transform -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-blue-500 transition-all duration-500"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold">{Math.round(progress)}%</span>
          <span className="text-xs text-gray-500">Day {day}</span>
        </div>
      </div>
    );
  }

  // Linear variant
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="font-medium">Day {day}</span>
        <span className="text-gray-500">{Math.round(progress)}%</span>
      </div>
      <div className="relative">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {showMilestones && (
          <div className="absolute inset-0 flex justify-between">
            {milestones.map((milestone) => (
              <div
                key={milestone.label}
                className="relative"
                style={{ left: `${milestone.value}%` }}
              >
                <div className="absolute w-0.5 h-3 bg-white dark:bg-gray-900" />
                <div className="absolute -bottom-5 text-xs text-gray-500 -translate-x-1/2">
                  {milestone.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const getTimeSpeed = (difficulty: TimeDisplayProps['difficulty'] = 'normal'): number => {
  return DIFFICULTY_SPEEDS[difficulty];
};

export const formatGameTime = (time: GameTime, format: '12h' | '24h' = '12h'): string => {
  const { hours, minutes, seconds } = time;

  if (format === '24h') {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
};