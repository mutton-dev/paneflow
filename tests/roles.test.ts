import { describe, it, expect, beforeEach } from 'vitest';
import { setRole, getRole, getAllRoles, clearRoles } from '../src/roles.js';

describe('roles', () => {
  beforeEach(() => {
    clearRoles();
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
});
