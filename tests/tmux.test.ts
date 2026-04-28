import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:child_process', () => ({
  execFile: vi.fn(),
}));

import { execFile } from 'node:child_process';
import { listPanes } from '../src/tmux.js';

const execFileMock = vi.mocked(execFile);

function mockExecFileStdout(stdout: string) {
  execFileMock.mockImplementation(((_cmd: string, _args: string[], cb: (err: Error | null, out: { stdout: string; stderr: string }) => void) => {
    cb(null, { stdout, stderr: '' });
  }) as unknown as typeof execFile);
}

describe('listPanes', () => {
  beforeEach(() => {
    execFileMock.mockReset();
  });

  it('parses tmux list-panes output into Pane objects', async () => {
    mockExecFileStdout('%0|main|node\n%1|build|tsx\n%2|logs|tail\n');

    const panes = await listPanes();

    expect(panes).toEqual([
      { id: '%0', windowName: 'main', command: 'node' },
      { id: '%1', windowName: 'build', command: 'tsx' },
      { id: '%2', windowName: 'logs', command: 'tail' },
    ]);
  });

  it('calls tmux with the correct list-panes args', async () => {
    mockExecFileStdout('');

    await listPanes();

    expect(execFileMock).toHaveBeenCalledWith(
      'tmux',
      ['list-panes', '-a', '-F', '#{pane_id}|#{window_name}|#{pane_current_command}'],
      expect.any(Function),
    );
  });

  it('returns an empty array when tmux returns no output', async () => {
    mockExecFileStdout('\n');
    expect(await listPanes()).toEqual([]);
  });

  it('ignores malformed lines that do not have all 3 fields', async () => {
    mockExecFileStdout('%0|main|node\nbroken-line\n%1|build|tsx\n');
    const panes = await listPanes();
    expect(panes).toEqual([
      { id: '%0', windowName: 'main', command: 'node' },
      { id: '%1', windowName: 'build', command: 'tsx' },
    ]);
  });
});
