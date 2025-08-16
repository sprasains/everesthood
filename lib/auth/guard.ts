// RBAC guard helpers for API routes
// Dummy getSession implementation; replace with actual session extraction logic
function getSession(req: any): { userId?: string; role?: string } {
  // Example: extract from req.session or req.headers
  return req.session || {};
}

export function requireUser(req: any) {
  const session = getSession(req);
  if (!session?.userId) {
    throw { status: 401, message: 'Authentication required' };
  }
  return session;
}

export function requireAdmin(req: any) {
  const session = getSession(req);
  if (session?.role !== 'admin') {
    throw { status: 403, message: 'Admin access required' };
  }
  return session;
}

export function requireCreator(req: any) {
  const session = getSession(req);
  if (session?.role !== 'creator' && session?.role !== 'admin') {
    throw { status: 403, message: 'Creator or admin access required' };
  }
  return session;
}

// Usage: Call in API route before processing, pass req object.
