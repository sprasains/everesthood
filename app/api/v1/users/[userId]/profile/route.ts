import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Get user profile by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  return NextResponse.json({ ok: true, userId: params.userId, profile: {} });
}
