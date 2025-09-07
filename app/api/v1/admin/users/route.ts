import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin list users - stub implementation
export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: true, users: [] });
}
