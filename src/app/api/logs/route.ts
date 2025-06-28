import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const logEntry = await request.json();
    // Add a source tag for easier filtering in GCP
    logEntry.source = 'frontend';
    // Write to stdout (Cloud Run/App Engine will pick this up)
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(logEntry));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Failed to relay frontend log:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
} 