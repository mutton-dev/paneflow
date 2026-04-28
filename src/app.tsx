import React, { useEffect, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { listPanes, capturePaneOutput, type Pane } from './tmux.js';
import { detectStatus, type PaneState, type PaneStatus } from './status.js';
import { getRole } from './roles.js';

export interface DashboardRow {
  id: string;
  role: string;
  status: PaneStatus;
  tail: string[];
}

export interface DashboardSummary {
  total: number;
  working: number;
  idle: number;
  stuck: number;
}

export function lastNLines(text: string, n: number): string[] {
  const lines = text.split('\n').filter((l) => l.length > 0);
  return lines.slice(-n);
}

export function summarizeRows(rows: DashboardRow[]): DashboardSummary {
  const summary: DashboardSummary = { total: rows.length, working: 0, idle: 0, stuck: 0 };
  for (const r of rows) summary[r.status]++;
  return summary;
}

const STATUS_COLOR: Record<PaneStatus, string> = {
  working: 'green',
  idle: 'yellow',
  stuck: 'red',
};

const HISTORY_SIZE = 5;
const REFRESH_MS = 2000;

async function buildRows(states: Map<string, PaneState>): Promise<DashboardRow[]> {
  const panes = await listPanes();
  const rows: DashboardRow[] = [];
  for (const pane of panes) {
    const out = await capturePaneOutput(pane.id);
    const prev = states.get(pane.id) ?? { lastOutput: '', lastChangedAt: Date.now(), outputHistory: [] };
    const status = detectStatus(prev, out);
    const changed = out !== prev.lastOutput;
    const next: PaneState = {
      lastOutput: out,
      lastChangedAt: changed ? Date.now() : prev.lastChangedAt,
      outputHistory: [...prev.outputHistory, out].slice(-HISTORY_SIZE),
    };
    states.set(pane.id, next);
    rows.push({
      id: pane.id,
      role: getRole(pane.id) ?? 'untagged',
      status,
      tail: lastNLines(out, 2),
    });
  }
  return rows;
}

export function App(): React.ReactElement {
  const { exit } = useApp();
  const [rows, setRows] = useState<DashboardRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useInput((input) => {
    if (input === 'q') exit();
  });

  useEffect(() => {
    const states = new Map<string, PaneState>();
    let cancelled = false;
    const tick = async () => {
      try {
        const next = await buildRows(states);
        if (!cancelled) setRows(next);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    };
    void tick();
    const id = setInterval(() => void tick(), REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const summary = summarizeRows(rows);

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold>paneflow</Text>
        <Text> </Text>
        <Text>
          panes={summary.total} working={summary.working} idle={summary.idle} stuck={summary.stuck}
        </Text>
      </Box>
      {error && <Text color="red">error: {error}</Text>}
      {rows.map((row) => (
        <Box key={row.id} flexDirection="column" marginTop={1}>
          <Box>
            <Text>[{row.id}] </Text>
            <Text>{row.role} </Text>
            <Text color={STATUS_COLOR[row.status]}>● {row.status}</Text>
          </Box>
          {row.tail.map((line, i) => (
            <Text key={i} dimColor>
              {'  '}
              {line}
            </Text>
          ))}
        </Box>
      ))}
      <Box marginTop={1}>
        <Text dimColor>press q to quit</Text>
      </Box>
    </Box>
  );
}
