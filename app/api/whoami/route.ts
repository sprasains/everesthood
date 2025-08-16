import { NextRequest } from 'next/server';
import { requireUser } from '../../../lib/auth/guard';
import { setSecureHeaders } from '../../../lib/security/headers';

// GET /api/whoami - returns session and role info for debugging
export async function GET(req: NextRequest) {
  setSecureHeaders();
  try {
    const session = requireUser(req);
    return new Response(JSON.stringify({ userId: session.userId, role: session.role }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: err.status || 401 });
  }
}
