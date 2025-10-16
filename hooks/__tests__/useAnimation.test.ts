import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock must be defined before imports that use it
vi.mock('@/lib/anime');

import { useAnimation, useTimeline, useScrollAnimation } from '../useAnimation';
import anime from '@/lib/anime';

// Cast anime to mock functions
const animeMock = anime as unknown as {
  mockImplementation: (fn: () => unknown) => void;
  timeline: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  random: ReturnType<typeof vi.fn>;
  stagger: ReturnType<typeof vi.fn>;
};

describe('useAnimation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    const mockAnimation = {
      pause: vi.fn(),
      play: vi.fn(),
      restart: vi.fn(),
      reverse: vi.fn(),
      seek: vi.fn(),
      animatables: []
    };

    const mockTimeline = {
      pause: vi.fn(),
      play: vi.fn(),
      restart: vi.fn(),
      add: vi.fn().mockReturnThis(),
    };

    animeMock.mockImplementation(() => mockAnimation);
    animeMock.timeline = vi.fn(() => mockTimeline);
    animeMock.remove = vi.fn();
    animeMock.random = vi.fn((min: number, max: number) => Math.random() * (max - min) + min);
    animeMock.stagger = vi.fn((value: unknown) => value);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Animation Lifecycle', () => {
    it('should initialize animation when target ref is set', () => {
      // Create the element first
      const div = document.createElement('div');

      const { result, rerender } = renderHook(
        (props) => useAnimation(props),
        {
          initialProps: { duration: 1000, easing: 'linear' }
        }
      );

      // Initially, no animation since ref is null
      expect(result.current.animation).toBeNull();
      expect(animeMock).not.toHaveBeenCalled();

      // Set the ref and trigger re-render with new props to re-run effect
      act(() => {
        Object.defineProperty(result.current.ref, 'current', {
          value: div,
          writable: true,
          configurable: true
        });
      });

      // Trigger effect by changing props
      rerender({ duration: 1001, easing: 'linear' });

      expect(animeMock).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: div,
          autoplay: true,
          duration: 1001,
          easing: 'linear'
        })
      );
    });

    it('should handle autoplay option correctly', () => {
      const div = document.createElement('div');

      const { result, rerender } = renderHook(
        (props) => useAnimation(props),
        {
          initialProps: { autoplay: false, duration: 500 }
        }
      );

      // Set the ref
      act(() => {
        Object.defineProperty(result.current.ref, 'current', {
          value: div,
          writable: true,
          configurable: true
        });
      });

      // Trigger effect by changing props
      rerender({ autoplay: false, duration: 501 });

      expect(animeMock).toHaveBeenCalledWith(
        expect.objectContaining({
          autoplay: false,
          duration: 501
        })
      );
    });
  });

  describe('Animation Controls', () => {
    it('should provide play control', () => {
      const mockAnimation = {
        play: vi.fn(),
        pause: vi.fn(),
        restart: vi.fn(),
        reverse: vi.fn(),
        seek: vi.fn()
      };
      animeMock.mockReturnValue(mockAnimation);

      const div = document.createElement('div');
      const { result, rerender } = renderHook(
        (props) => useAnimation(props),
        { initialProps: {} }
      );

      // Set ref before effect runs
      act(() => {
        Object.defineProperty(result.current.ref, 'current', {
          value: div,
          writable: true,
          configurable: true
        });
      });

      // Trigger effect with new props
      rerender({ duration: 100 });

      act(() => {
        result.current.play();
      });

      expect(mockAnimation.play).toHaveBeenCalled();
    });

    it('should provide pause control', () => {
      const mockAnimation = {
        play: vi.fn(),
        pause: vi.fn(),
        restart: vi.fn(),
        reverse: vi.fn(),
        seek: vi.fn()
      };
      animeMock.mockReturnValue(mockAnimation);

      const div = document.createElement('div');
      const { result, rerender } = renderHook(
        (props) => useAnimation(props),
        { initialProps: {} }
      );

      act(() => {
        Object.defineProperty(result.current.ref, 'current', {
          value: div,
          writable: true,
          configurable: true
        });
      });

      rerender({ duration: 100 });

      act(() => {
        result.current.pause();
      });

      expect(mockAnimation.pause).toHaveBeenCalled();
    });

    it('should provide restart control', () => {
      const mockAnimation = {
        play: vi.fn(),
        pause: vi.fn(),
        restart: vi.fn(),
        reverse: vi.fn(),
        seek: vi.fn()
      };
      animeMock.mockReturnValue(mockAnimation);

      const div = document.createElement('div');
      const { result, rerender } = renderHook(
        (props) => useAnimation(props),
        { initialProps: {} }
      );

      act(() => {
        Object.defineProperty(result.current.ref, 'current', {
          value: div,
          writable: true,
          configurable: true
        });
      });

      rerender({ duration: 100 });

      act(() => {
        result.current.restart();
      });

      expect(mockAnimation.restart).toHaveBeenCalled();
    });

    it('should provide reverse control', () => {
      const mockAnimation = {
        play: vi.fn(),
        pause: vi.fn(),
        restart: vi.fn(),
        reverse: vi.fn(),
        seek: vi.fn()
      };
      animeMock.mockReturnValue(mockAnimation);

      const div = document.createElement('div');
      const { result, rerender } = renderHook(
        (props) => useAnimation(props),
        { initialProps: {} }
      );

      act(() => {
        Object.defineProperty(result.current.ref, 'current', {
          value: div,
          writable: true,
          configurable: true
        });
      });

      rerender({ duration: 100 });

      act(() => {
        result.current.reverse();
      });

      expect(mockAnimation.reverse).toHaveBeenCalled();
    });

    it('should provide seek control', () => {
      const mockAnimation = {
        play: vi.fn(),
        pause: vi.fn(),
        restart: vi.fn(),
        reverse: vi.fn(),
        seek: vi.fn()
      };
      animeMock.mockReturnValue(mockAnimation);

      const div = document.createElement('div');
      const { result, rerender } = renderHook(
        (props) => useAnimation(props),
        { initialProps: {} }
      );

      act(() => {
        Object.defineProperty(result.current.ref, 'current', {
          value: div,
          writable: true,
          configurable: true
        });
      });

      rerender({ duration: 100 });

      act(() => {
        result.current.seek(500);
      });

      expect(mockAnimation.seek).toHaveBeenCalledWith(500);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup animation on unmount', () => {
      const mockAnimation = {
        pause: vi.fn(),
        play: vi.fn(),
        restart: vi.fn(),
        reverse: vi.fn(),
        seek: vi.fn()
      };
      animeMock.mockReturnValue(mockAnimation);

      const div = document.createElement('div');
      const { result, unmount, rerender } = renderHook(
        (props) => useAnimation(props),
        { initialProps: {} }
      );

      act(() => {
        Object.defineProperty(result.current.ref, 'current', {
          value: div,
          writable: true,
          configurable: true
        });
      });

      rerender({ duration: 100 });

      unmount();

      expect(mockAnimation.pause).toHaveBeenCalled();
      expect(animeMock.remove).toHaveBeenCalledWith(div);
    });

    it('should handle cleanup when animation not started', () => {
      const { unmount } = renderHook(() => useAnimation());

      expect(() => unmount()).not.toThrow();
    });
  });
});

describe('useTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    const mockTimeline = {
      pause: vi.fn(),
      play: vi.fn(),
      restart: vi.fn(),
      add: vi.fn().mockReturnThis(),
    };

    animeMock.timeline = vi.fn(() => mockTimeline);
  });

  describe('Timeline Creation', () => {
    it('should create timeline with default options', () => {
      renderHook(() => useTimeline());

      expect(animeMock.timeline).toHaveBeenCalledWith({
        autoplay: false
      });
    });

    it('should create timeline with custom options', () => {
      renderHook(() => useTimeline({
        duration: 2000,
        easing: 'easeInOutQuad'
      }));

      expect(animeMock.timeline).toHaveBeenCalledWith({
        autoplay: false,
        duration: 2000,
        easing: 'easeInOutQuad'
      });
    });
  });

  describe('Timeline Controls', () => {
    it('should provide play control', () => {
      const mockTimeline = {
        play: vi.fn(),
        pause: vi.fn(),
        restart: vi.fn(),
        add: vi.fn().mockReturnThis()
      };
      animeMock.timeline.mockReturnValue(mockTimeline);

      const { result } = renderHook(() => useTimeline());

      act(() => {
        result.current.play();
      });

      expect(mockTimeline.play).toHaveBeenCalled();
    });

    it('should provide pause control', () => {
      const mockTimeline = { pause: vi.fn() };
      animeMock.timeline.mockReturnValue(mockTimeline);

      const { result } = renderHook(() => useTimeline());

      act(() => {
        result.current.pause();
      });

      expect(mockTimeline.pause).toHaveBeenCalled();
    });

    it('should provide restart control', () => {
      const mockTimeline = {
        play: vi.fn(),
        pause: vi.fn(),
        restart: vi.fn(),
        add: vi.fn().mockReturnThis()
      };
      animeMock.timeline.mockReturnValue(mockTimeline);

      const { result } = renderHook(() => useTimeline());

      act(() => {
        result.current.restart();
      });

      expect(mockTimeline.restart).toHaveBeenCalled();
    });

    it('should provide add method', () => {
      const mockTimeline = {
        play: vi.fn(),
        pause: vi.fn(),
        restart: vi.fn(),
        add: vi.fn().mockReturnThis()
      };
      animeMock.timeline.mockReturnValue(mockTimeline);

      const { result } = renderHook(() => useTimeline());

      const params = { targets: '.element', translateX: 100 };
      const offset = '+=100';

      act(() => {
        result.current.add(params, offset);
      });

      expect(mockTimeline.add).toHaveBeenCalledWith(params, offset);
    });
  });

  describe('Timeline Cleanup', () => {
    it('should pause timeline on unmount', () => {
      const mockTimeline = { pause: vi.fn() };
      animeMock.timeline.mockReturnValue(mockTimeline);

      const { unmount } = renderHook(() => useTimeline());

      unmount();

      expect(mockTimeline.pause).toHaveBeenCalled();
    });
  });
});

describe('useScrollAnimation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    const mockAnimation = {
      pause: vi.fn(),
      play: vi.fn(),
      restart: vi.fn(),
      reverse: vi.fn(),
      seek: vi.fn(),
      animatables: []
    };

    animeMock.mockImplementation(() => mockAnimation);
    animeMock.remove = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Scroll Trigger', () => {
    it('should trigger animation when element enters viewport', () => {
      const div = document.createElement('div');

      Object.defineProperty(div, 'getBoundingClientRect', {
        value: vi.fn(() => ({ top: 500 })),
        writable: true
      });

      Object.defineProperty(window, 'innerHeight', {
        value: 1000,
        writable: true,
        configurable: true
      });

      const { result, rerender } = renderHook(
        (props) => useScrollAnimation(
          props.animation,
          props.scroll
        ),
        {
          initialProps: {
            animation: { translateY: [-50, 0], opacity: [0, 1] },
            scroll: { trigger: 0.8 }
          }
        }
      );

      act(() => {
        Object.defineProperty(result.current.ref, 'current', {
          value: div,
          writable: true,
          configurable: true
        });
      });

      // Trigger effect by changing props
      rerender({
        animation: { translateY: [-50, 0], opacity: [0, 1], duration: 100 },
        scroll: { trigger: 0.8 }
      });

      // The hook should have called handleScroll on mount, which checks initial position
      expect(animeMock).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: div,
          translateY: [-50, 0],
          opacity: [0, 1]
        })
      );
    });

    it('should respect once option', () => {
      const mockAnimation = { play: vi.fn() };
      animeMock.mockReturnValue(mockAnimation);

      const { result } = renderHook(() =>
        useScrollAnimation({}, { once: true })
      );

      const div = document.createElement('div');
      act(() => {
        Object.defineProperty(result.current.ref, 'current', {
          value: div,
          writable: true,
          configurable: true
        });

        Object.defineProperty(div, 'getBoundingClientRect', {
          value: vi.fn(() => ({ top: 500 })),
          writable: true
        });
      });

      const { rerender } = renderHook(() =>
        useScrollAnimation({}, { once: true })
      );

      rerender();

      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      const initialCallCount = animeMock.mock.calls.length;

      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      expect(animeMock.mock.calls.length).toBe(initialCallCount);
    });

    it('should check initial position on mount', () => {
      const div = document.createElement('div');

      Object.defineProperty(div, 'getBoundingClientRect', {
        value: vi.fn(() => ({ top: 100 })),
        writable: true
      });

      Object.defineProperty(window, 'innerHeight', {
        value: 1000,
        writable: true,
        configurable: true
      });

      const { result, rerender } = renderHook(
        (props) => useScrollAnimation(props),
        { initialProps: {} }
      );

      act(() => {
        Object.defineProperty(result.current.ref, 'current', {
          value: div,
          writable: true,
          configurable: true
        });
      });

      // Trigger effect with new props
      rerender({ duration: 100 });

      // Since top (100) < trigger point (800), animation should be created
      expect(animeMock).toHaveBeenCalled();
    });
  });

  describe('Scroll Cleanup', () => {
    it('should remove scroll listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const div = document.createElement('div');
      const { result, unmount, rerender } = renderHook(
        (props) => useScrollAnimation(props),
        { initialProps: {} }
      );

      act(() => {
        Object.defineProperty(result.current.ref, 'current', {
          value: div,
          writable: true,
          configurable: true
        });
      });

      // Trigger effect to add listener
      rerender({ duration: 100 });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('should cleanup animation on unmount', () => {
      const mockAnimation = {};
      animeMock.mockReturnValue(mockAnimation);

      const div = document.createElement('div');

      Object.defineProperty(div, 'getBoundingClientRect', {
        value: vi.fn(() => ({ top: 100 })),
        writable: true
      });

      Object.defineProperty(window, 'innerHeight', {
        value: 1000,
        writable: true,
        configurable: true
      });

      const { result, unmount, rerender } = renderHook(
        (props) => useScrollAnimation(props),
        { initialProps: {} }
      );

      act(() => {
        Object.defineProperty(result.current.ref, 'current', {
          value: div,
          writable: true,
          configurable: true
        });
      });

      // Trigger effect
      rerender({ duration: 100 });

      unmount();

      expect(animeMock.remove).toHaveBeenCalledWith(div);
    });
  });
});