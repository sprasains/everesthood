import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    const { postId, commentId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const cursor = searchParams.get('cursor');
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    const commentsJson = post.commentsJson || [];
    // Helper to find the comment by id recursively
    function findCommentById(comments: any[], id: string): any | null {
      for (const comment of comments) {
        if (comment.id === id) return comment;
        if (comment.replies) {
          const found = findCommentById(comment.replies, id);
          if (found) return found;
        }
      }
      return null;
    }
    const parent = findCommentById(commentsJson, commentId);
    if (!parent) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    let replies = Array.isArray(parent.replies) ? parent.replies : [];
    let startIdx = 0;
    if (cursor) {
      const idx = replies.findIndex((c: any) => c.id === cursor);
      startIdx = idx >= 0 ? idx + 1 : 0;
    }
    const paged = replies.slice(startIdx, startIdx + limit);
    const nextCursor = (startIdx + limit) < replies.length ? replies[startIdx + limit - 1]?.id : null;
    return NextResponse.json({ replies: paged, nextCursor });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch replies", details: err }, { status: 500 });
  }
} 