import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/services/logger';

export async function POST(request: NextRequest) {
  try {
    const logEntry = await request.json();
    // Add a source tag for easier filtering in GCP
    logEntry.source = 'frontend';
    await logger.info('Frontend log', logEntry);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    await logger.error('Failed to relay frontend log', { error });
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
} 