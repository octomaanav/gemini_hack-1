import { describe, expect, it, vi } from 'vitest';
import { pollWithBackoff } from './useBackoffPoller';

describe('pollWithBackoff', () => {
  it('stops when isDone returns true', async () => {
    vi.useFakeTimers();
    const values = ['PENDING', 'PENDING', 'READY'];
    let idx = 0;

    const promise = pollWithBackoff<string>({
      delaysMs: [10, 10, 10],
      tick: async () => values[idx++] || 'READY',
      isDone: (v) => v === 'READY',
    });

    await vi.advanceTimersByTimeAsync(30);
    const result = await promise;
    expect(result).toBe('READY');
    expect(idx).toBeGreaterThanOrEqual(3);
    vi.useRealTimers();
  });

  it('returns null if exhausted', async () => {
    vi.useFakeTimers();
    let calls = 0;
    const promise = pollWithBackoff<string>({
      delaysMs: [5, 5],
      tick: async () => {
        calls++;
        return 'PENDING';
      },
      isDone: (v) => v === 'READY',
    });
    await vi.advanceTimersByTimeAsync(10);
    const result = await promise;
    expect(result).toBeNull();
    expect(calls).toBe(2);
    vi.useRealTimers();
  });
});

