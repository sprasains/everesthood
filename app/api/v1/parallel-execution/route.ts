import { NextResponse } from 'next/server';

export async function POST() {
  // TODO: Integrate with real agent/task execution engine
  return new NextResponse('Parallel execution is not available in production yet.', { status: 501 });
}
