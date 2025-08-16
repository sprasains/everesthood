// RBAC helpers for admin and role checks
export function isAdmin(user: { roles?: string[]; featureFlags?: string[] }) {
  return user?.roles?.includes('admin') || user?.featureFlags?.includes('admin');
}

export function hasRole(user: any, role: string) {
  return user?.roles?.includes(role);
}

export function isOrgAdmin(user: any, orgId: string) {
  return hasRole(user, 'admin') && user?.orgId === orgId;
}

export function canCreateAgent(user: any, orgId: string) {
  return hasRole(user, 'admin') || isOrgAdmin(user, orgId);
}
