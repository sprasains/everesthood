import { NextResponse } from 'next/server';

export async function POST() {
  // TODO: Implement real agent-to-agent invocation logic
  return new NextResponse('Agent-to-agent invocation is not available in production yet.', { status: 501 });
}
