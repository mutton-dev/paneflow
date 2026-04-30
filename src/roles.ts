import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

const rolesFile =
  process.env.PANEFLOW_ROLES_FILE ?? join(homedir(), '.paneflow', 'roles.json');

const roleMap = new Map<string, string>();

try {
  const raw = readFileSync(rolesFile, 'utf-8');
  const data = JSON.parse(raw) as Record<string, string>;
  for (const [id, role] of Object.entries(data)) roleMap.set(id, role);
} catch {
  // file absent or malformed — start with empty map
}

function persist(): void {
  const dir = dirname(rolesFile);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(rolesFile, JSON.stringify(Object.fromEntries(roleMap), null, 2));
}

export function setRole(paneId: string, role: string): void {
  roleMap.set(paneId, role);
  persist();
}

export function getRole(paneId: string): string | undefined {
  return roleMap.get(paneId);
}

export function getAllRoles(): Map<string, string> {
  return new Map(roleMap);
}

export function clearRoles(): void {
  roleMap.clear();
  persist();
}
