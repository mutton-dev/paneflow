import { describe, it, expect } from 'vitest';
import { parseFlags, HELP } from '../src/cli.js';

describe('parseFlags', () => {
  it('returns false for both flags when no args', () => {
    expect(parseFlags([])).toEqual({ help: false, version: false });
  });

  it('sets help=true for --help', () => {
    expect(parseFlags(['--help'])).toEqual({ help: true, version: false });
  });

  it('sets help=true for -h', () => {
    expect(parseFlags(['-h'])).toEqual({ help: true, version: false });
  });

  it('sets version=true for --version', () => {
    expect(parseFlags(['--version'])).toEqual({ help: false, version: true });
  });

  it('sets version=true for -v', () => {
    expect(parseFlags(['-v'])).toEqual({ help: false, version: true });
  });

  it('throws on unknown flags (strict mode)', () => {
    expect(() => parseFlags(['--unknown'])).toThrow();
  });
});

describe('HELP', () => {
  it('contains usage and key bindings', () => {
    expect(HELP).toContain('paneflow');
    expect(HELP).toContain('--help');
    expect(HELP).toContain('--version');
    expect(HELP).toContain('q');
  });
});
