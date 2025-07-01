import { NextRequest, NextResponse } from 'next/server';
import { fetchGenZContent } from '../../../../scripts/fetchGenZContent';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await fetchGenZContent();
    return NextResponse.json({ success: true, message: 'GenZ content fetched successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch GenZ content.' }, { status: 500 });
  }
}
