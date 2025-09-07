import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Search news articles
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') || '';
  return NextResponse.json({ ok: true, query, articles: [] });
}
