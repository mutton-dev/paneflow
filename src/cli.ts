import { parseArgs } from 'node:util';

export interface ParsedFlags {
  help: boolean;
  version: boolean;
}

export function parseFlags(argv: string[]): ParsedFlags {
  const { values } = parseArgs({
    args: argv,
    options: {
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
    strict: true,
  });
  return {
    help: values.help ?? false,
    version: values.version ?? false,
  };
}

export const HELP = `paneflow — tmux pane × Claude Code Agent Teams を監視する TUI

Usage:
  paneflow              Start the dashboard
  paneflow --help       Show this help
  paneflow --version    Show version

Keys:
  q                     Quit
`;
