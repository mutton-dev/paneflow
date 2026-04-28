const roleMap = new Map<string, string>();

export function setRole(paneId: string, role: string): void {
  roleMap.set(paneId, role);
}

export function getRole(paneId: string): string | undefined {
  return roleMap.get(paneId);
}

export function getAllRoles(): Map<string, string> {
  return new Map(roleMap);
}

export function clearRoles(): void {
  roleMap.clear();
}
