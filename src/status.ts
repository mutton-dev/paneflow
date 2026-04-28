export type PaneStatus = 'working' | 'idle' | 'stuck';

export interface PaneState {
  lastOutput: string;
  lastChangedAt: number;
  outputHistory: string[];
}

const IDLE_THRESHOLD_MS = 60_000;

export function detectStatus(state: PaneState, currOutput: string, now?: number): PaneStatus {
  const history = state.outputHistory;
  if (history.length >= 3) {
    const last3 = history.slice(-3);
    if (last3[0] === last3[1] && last3[1] === last3[2] && last3[0] === currOutput) {
      return 'stuck';
    }
  }

  if (currOutput !== state.lastOutput) {
    return 'working';
  }

  const t = now ?? Date.now();
  if (t - state.lastChangedAt > IDLE_THRESHOLD_MS) {
    return 'idle';
  }
  return 'working';
}
