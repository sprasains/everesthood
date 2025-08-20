import { NextRequest, NextResponse } from 'next/server';
import { cacheKeys, cacheGetJson } from '../../../../lib/cache/index';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (process.env.FEATURE_DEBUG !== 'true') {
    return NextResponse.json({ error: 'Not enabled' }, { status: 403 });
  }
  const keys = await cacheKeys();
  const data: Record<string, any> = {};
  for (const key of keys) {
    data[key] = await cacheGetJson(key);
  }
  return NextResponse.json({ keys, data });
}
