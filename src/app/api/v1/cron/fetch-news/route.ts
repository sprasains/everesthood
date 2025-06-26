import { NextRequest, NextResponse } from 'next/server';
import { fetchAndStoreNews } from '@/lib/newsFetcher';

export async function GET(request: NextRequest) {
  // Secure your cron job endpoint with a secret token
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await fetchAndStoreNews();
    return NextResponse.json({ success: true, message: 'News fetched successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch news.' }, { status: 500 });
  }
}
