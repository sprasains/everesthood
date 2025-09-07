import { NextResponse } from 'next/server';

// Minimal admin metrics stub — implement real metrics later.
export async function GET() {
  return NextResponse.json({ ok: true, metrics: {} });
}
