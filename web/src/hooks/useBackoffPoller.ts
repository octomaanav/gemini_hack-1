import { useCallback, useRef } from 'react';

export async function pollWithBackoff<T>(input: {
  delaysMs: number[];
  tick: () => Promise<T>;
  isDone: (value: T) => boolean;
  onUpdate?: (value: T) => void;
  shouldStop?: () => boolean;
}) {
  for (const d of input.delaysMs) {
    if (input.shouldStop?.()) return null;
    await new Promise((r) => setTimeout(r, d));
    if (input.shouldStop?.()) return null;
    const value = await input.tick();
    input.onUpdate?.(value);
    if (input.isDone(value)) return value;
  }
  return null;
}

export function useBackoffPoller() {
  const stopRef = useRef(false);

  const stop = useCallback(() => {
    stopRef.current = true;
  }, []);

  const reset = useCallback(() => {
    stopRef.current = false;
  }, []);

  const poll = useCallback(async <T,>(args: Omit<Parameters<typeof pollWithBackoff<T>>[0], 'shouldStop'>) => {
    stopRef.current = false;
    return pollWithBackoff<T>({
      ...args,
      shouldStop: () => stopRef.current,
    });
  }, []);

  return { poll, stop, reset };
}

