import { NextRequest, NextResponse } from 'next/server';
import { unfurl } from 'unfurl.js';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid URL' }, { status: 400 });
    }
    const data = await unfurl(url, { timeout: 7000 });
    return NextResponse.json({
      title: data.title || '',
      description: data.description || '',
      image: data.open_graph?.images?.[0]?.url || data.favicon || '',
      url,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to unfurl URL' }, { status: 500 });
  }
} 