import { describe, it, expect } from 'vitest';
import { summarizeRows, lastNLines, type DashboardRow } from '../src/app.js';

describe('lastNLines', () => {
  it('returns the last N non-empty lines', () => {
    expect(lastNLines('a\nb\nc\nd\n', 2)).toEqual(['c', 'd']);
  });

  it('skips trailing blank line from typical capture output', () => {
    expect(lastNLines('only-line\n', 2)).toEqual(['only-line']);
  });

  it('returns all lines when there are fewer than N', () => {
    expect(lastNLines('one\ntwo', 5)).toEqual(['one', 'two']);
  });

  it('returns an empty array for empty input', () => {
    expect(lastNLines('', 2)).toEqual([]);
  });
});

describe('summarizeRows', () => {
  it('counts pane statuses', () => {
    const rows: DashboardRow[] = [
      { id: '%0', role: 'a', status: 'working', tail: [] },
      { id: '%1', role: 'b', status: 'idle', tail: [] },
      { id: '%2', role: 'c', status: 'idle', tail: [] },
      { id: '%3', role: 'd', status: 'stuck', tail: [] },
    ];
    expect(summarizeRows(rows)).toEqual({
      total: 4,
      working: 1,
      idle: 2,
      stuck: 1,
    });
  });

  it('handles empty input', () => {
    expect(summarizeRows([])).toEqual({ total: 0, working: 0, idle: 0, stuck: 0 });
  });
});
