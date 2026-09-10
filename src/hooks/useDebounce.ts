import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to debounce a fast-changing state or value.
 * Commonly used for live search, real-time calculations, autocomplete, and filters.
 *
 * @param value The raw input value
 * @param delayMs Delay in milliseconds (default: 400ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delayMs: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Custom hook to debounce an asynchronous callback or API hit.
 * Ensures the callback is only invoked after the specified delay has passed since the last call.
 *
 * @param callback The function to execute
 * @param delayMs Delay in milliseconds (default: 400ms)
 * @returns Debounced callback function with a cancel method
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delayMs: number = 400
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delayMs);
    },
    [delayMs, cancel]
  );

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return { execute: debouncedFn, cancel };
}
