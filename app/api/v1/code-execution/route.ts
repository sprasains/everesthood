import { NextResponse } from 'next/server';

export async function POST() {
  // TODO: Integrate with a secure code execution sandbox (Docker, Wasm, or third-party service)
  return new NextResponse('Code execution is not available in production yet.', { status: 501 });
}