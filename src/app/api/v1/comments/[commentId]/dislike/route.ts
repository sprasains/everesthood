import { NextRequest, NextResponse } from "next/server";

// POST /api/v1/comments/[commentId]/dislike
export async function POST() {
  return new NextResponse("Comment dislikes are not supported.", { status: 501 });
}
