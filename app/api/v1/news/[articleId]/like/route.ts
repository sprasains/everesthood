import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Get like status for an article
export async function GET(
  _req: NextRequest,
  { params }: { params: { articleId: string } }
) {
  return NextResponse.json({
    ok: true,
    articleId: params.articleId,
    liked: false,
  });
}
