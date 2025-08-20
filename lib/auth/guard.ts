// lib/auth/guard.ts

export function requireUser(req: any) {
  // Implement authentication logic here
  if (!req.user) throw { message: 'Unauthorized', status: 401 };
  return req.user;
}
