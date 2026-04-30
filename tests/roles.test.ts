import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('node:fs', () => ({
  readFileSync: vi.fn().mockImplementation(() => { throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' }); }),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  existsSync: vi.fn().mockReturnValue(true),
}));

import { writeFileSync } from 'node:fs';
import { setRole, getRole, getAllRoles, clearRoles } from '../src/roles.js';

const writeFileSyncMock = vi.mocked(writeFileSync);

describe('roles', () => {
  beforeEach(() => {
    clearRoles();
    writeFileSyncMock.mockClear();
  });

  it('returns undefined for an unknown pane id', () => {
    expect(getRole('%99')).toBeUndefined();
  });

  it('stores and retrieves a role for a pane id', () => {
    setRole('%0', 'impl-paneflow');
    expect(getRole('%0')).toBe('impl-paneflow');
  });

  it('overwrites an existing role for the same pane id', () => {
    setRole('%0', 'first');
    setRole('%0', 'second');
    expect(getRole('%0')).toBe('second');
  });

  it('getAllRoles returns a Map containing every set role', () => {
    setRole('%0', 'lead');
    setRole('%1', 'reviewer');
    const all = getAllRoles();
    expect(all.size).toBe(2);
    expect(all.get('%0')).toBe('lead');
    expect(all.get('%1')).toBe('reviewer');
  });

  it('clearRoles removes everything', () => {
    setRole('%0', 'a');
    setRole('%1', 'b');
    clearRoles();
    expect(getAllRoles().size).toBe(0);
  });

  it('persists to disk on setRole', () => {
    setRole('%0', 'researcher');
    expect(writeFileSyncMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('"researcher"'),
    );
  });

  it('persists to disk on clearRoles', () => {
    setRole('%0', 'a');
    writeFileSyncMock.mockClear();
    clearRoles();
    expect(writeFileSyncMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('{}'),
    );
  });

  it('loads existing roles from disk on startup', async () => {
    const { readFileSync } = await import('node:fs');
    vi.mocked(readFileSync).mockReturnValueOnce('{"%%0":"preloaded"}' as unknown as Buffer);

    vi.resetModules();
    const { getRole: freshGetRole } = await import('../src/roles.js');
    expect(freshGetRole('%%0')).toBe('preloaded');
  });
});
