import { NextRequest, NextResponse } from 'next/server';
import { fetchAndStoreJobs } from '@/lib/jobFetcher';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await fetchAndStoreJobs();
    return NextResponse.json({ success: true, message: 'Jobs fetched successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch jobs.' }, { status: 500 });
  }
}
