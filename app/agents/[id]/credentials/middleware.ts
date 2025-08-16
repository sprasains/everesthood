import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.method === 'GET') {
    // Forbid reading credentials from client
    return NextResponse.json({ error: 'Forbidden: Credentials are write-only.' }, { status: 403 });
  }
  return NextResponse.next();
}
