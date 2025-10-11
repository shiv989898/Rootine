/**
 * Performance Optimization Utilities for Rootine
 * Prevents unnecessary re-renders and optimizes expensive operations
 */

import { useCallback, useRef, useEffect } from 'react';

/**
 * Debounce hook - prevents function from being called too frequently
 * Useful for search inputs, API calls, etc.
 */
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle hook - limits function execution to once per specified time
 * Useful for scroll handlers, resize handlers, etc.
 */
export const useThrottle = (callback: (...args: any[]) => void, delay: number) => {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  );
};

/**
 * Previous value hook - access previous value of a prop or state
 * Useful for detecting changes and preventing unnecessary updates
 */
export const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

/**
 * Mount hook - run effect only on mount
 */
export const useMount = (callback: () => void) => {
  useEffect(() => {
    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

/**
 * Unmount hook - run cleanup only on unmount
 */
export const useUnmount = (callback: () => void) => {
  useEffect(() => {
    return callback;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

/**
 * Async effect hook - safely handle async operations in useEffect
 */
export const useAsyncEffect = (
  effect: () => Promise<void>,
  deps: React.DependencyList
) => {
  useEffect(() => {
    let cancelled = false;

    const runEffect = async () => {
      try {
        await effect();
      } catch (error) {
        if (!cancelled) {
          console.error('Async effect error:', error);
        }
      }
    };

    runEffect();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

/**
 * Interval hook - safely set up intervals
 */
export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};

/**
 * Safe setState - prevents setState on unmounted components
 */
export const useSafeState = <T,>(initialState: T): [T, (value: T) => void] => {
  const [state, setState] = React.useState<T>(initialState);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeSetState = useCallback((value: T) => {
    if (mountedRef.current) {
      setState(value);
    }
  }, []);

  return [state, safeSetState];
};

/**
 * Memoize expensive calculations
 */
export const useMemoCompare = <T,>(
  factory: () => T,
  deps: React.DependencyList,
  compare: (prevDeps: React.DependencyList, nextDeps: React.DependencyList) => boolean
): T => {
  const ref = useRef<{
    deps: React.DependencyList;
    value: T;
  } | undefined>(undefined);

  if (!ref.current || !compare(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory(),
    };
  }

  return ref.current.value;
};

// Import React for useState
import React from 'react';
