import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface Pane {
  id: string;
  windowName: string;
  command: string;
}

const LIST_FORMAT = '#{pane_id}|#{window_name}|#{pane_current_command}';

export async function listPanes(): Promise<Pane[]> {
  const { stdout } = await execFileAsync('tmux', ['list-panes', '-a', '-F', LIST_FORMAT]);
  return stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split('|'))
    .filter((parts) => parts.length === 3 && parts.every((p) => p.length > 0))
    .map(([id, windowName, command]) => ({ id, windowName, command }));
}
