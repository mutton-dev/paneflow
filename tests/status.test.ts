import { describe, it, expect } from 'vitest';
import { detectStatus, type PaneState } from '../src/status.js';

function makeState(overrides: Partial<PaneState> = {}): PaneState {
  return {
    lastOutput: 'prev',
    lastChangedAt: 0,
    outputHistory: [],
    ...overrides,
  };
}

describe('detectStatus', () => {
  it('returns "working" when current output differs from lastOutput', () => {
    const state = makeState({ lastOutput: 'old', lastChangedAt: 0 });
    expect(detectStatus(state, 'new', 1_000)).toBe('working');
  });

  it('returns "idle" when output unchanged for more than 60s', () => {
    const state = makeState({ lastOutput: 'same', lastChangedAt: 0 });
    expect(detectStatus(state, 'same', 60_001)).toBe('idle');
  });

  it('returns "working" when output unchanged but within 60s', () => {
    const state = makeState({ lastOutput: 'same', lastChangedAt: 0 });
    expect(detectStatus(state, 'same', 30_000)).toBe('working');
  });

  it('returns "stuck" when last 3 history entries are identical (regardless of time)', () => {
    const state = makeState({
      lastOutput: 'same',
      lastChangedAt: 0,
      outputHistory: ['same', 'same', 'same'],
    });
    expect(detectStatus(state, 'same', 10_000)).toBe('stuck');
  });

  it('"stuck" takes precedence over "idle"', () => {
    const state = makeState({
      lastOutput: 'same',
      lastChangedAt: 0,
      outputHistory: ['same', 'same', 'same'],
    });
    expect(detectStatus(state, 'same', 120_000)).toBe('stuck');
  });

  it('does not return "stuck" when history has fewer than 3 entries', () => {
    const state = makeState({
      lastOutput: 'same',
      lastChangedAt: 0,
      outputHistory: ['same', 'same'],
    });
    expect(detectStatus(state, 'same', 10_000)).toBe('working');
  });

  it('does not return "stuck" when last 3 history entries differ', () => {
    const state = makeState({
      lastOutput: 'same',
      lastChangedAt: 0,
      outputHistory: ['a', 'b', 'same'],
    });
    expect(detectStatus(state, 'same', 10_000)).toBe('working');
  });

  it('uses Date.now() when "now" is not provided', () => {
    const state = makeState({ lastOutput: 'changed', lastChangedAt: 0 });
    expect(detectStatus(state, 'new')).toBe('working');
  });
});
