import { NextResponse } from 'next/server';

export async function GET() {
  // placeholder: logs endpoint (read-only)
  return NextResponse.json({ ok: true, items: [] });
}
