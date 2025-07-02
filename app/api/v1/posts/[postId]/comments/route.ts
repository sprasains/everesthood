import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parse } from 'url';

// Helper to emit comment updates
function emitCommentUpdate(postId: string) {
  if ((globalThis.io as any)?.to) {
    (globalThis.io as any).to(postId).emit("comment_update");
  }
}

// Helper to insert a reply into the commentsJson tree
function insertReply(comments: any[], parentId: string, newComment: any): boolean {
  for (const comment of comments) {
    if (comment.id === parentId) {
      comment.replies = comment.replies || [];
      comment.replies.push(newComment);
      return true;
    }
    if (comment.replies && insertReply(comment.replies, parentId, newComment)) return true;
  }
  return false;
}

// GET comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const cursor = searchParams.get('cursor');
    console.log('[GET /comments] postId:', postId, 'limit:', limit, 'cursor:', cursor);
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    const commentsJson = (post as any).commentsJson || [];
    console.log('[GET /comments] commentsJson:', JSON.stringify(commentsJson, null, 2));
    let masterComments = Array.isArray(commentsJson) ? commentsJson.map((c: any) => ({ ...c, replies: undefined, hasReplies: Array.isArray(c.replies) && c.replies.length > 0 })) : [];
    let startIdx = 0;
    if (cursor) {
      const idx = masterComments.findIndex((c: any) => c.id === cursor);
      startIdx = idx >= 0 ? idx + 1 : 0;
    }
    const paged = masterComments.slice(startIdx, startIdx + limit);
    const nextCursor = (startIdx + limit) < masterComments.length ? masterComments[startIdx + limit - 1]?.id : null;
    console.log('[GET /comments] paged:', JSON.stringify(paged, null, 2), 'nextCursor:', nextCursor);
    return NextResponse.json({ comments: paged, nextCursor });
  } catch (err) {
    console.error('[GET /comments] Error:', err);
    return NextResponse.json({ error: "Failed to fetch comments", details: err }, { status: 500 });
  }
}

// POST a new comment or reply (supports parentId for nesting, and rich text JSON content)
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content, parentId, mentionedUserIds = [] } = await request.json();
    const { postId } = params;
    console.log('[POST /comments] postId:', postId, 'user:', session.user.id, 'parentId:', parentId, 'content:', content);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // Build new comment object
    const newComment = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      userName: session.user.name,
      userAvatar: session.user.image,
      content,
      createdAt: new Date().toISOString(),
      parentId: parentId || null,
      replies: [],
      mentionedUserIds,
    };
    console.log('[POST /comments] newComment:', JSON.stringify(newComment, null, 2));

    // Insert into commentsJson tree
    let commentsJson = (post as any).commentsJson || [];
    if (!Array.isArray(commentsJson)) commentsJson = [];
    if (!parentId) {
      // Top-level comment
      commentsJson.push(newComment);
    } else {
      // Find parent and insert as a reply
      insertReply(commentsJson, parentId, newComment);
    }
    console.log('[POST /comments] updated commentsJson:', JSON.stringify(commentsJson, null, 2));

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { commentsJson: commentsJson },
      select: { commentsJson: true }
    });

    emitCommentUpdate(postId);
    console.log('[POST /comments] response commentsJson:', JSON.stringify(updatedPost.commentsJson, null, 2));
    return NextResponse.json({ newComment, commentsJson: updatedPost.commentsJson }, { status: 201 });
  } catch (err) {
    console.error('[POST /comments] Error:', err);
    return NextResponse.json({ error: "Failed to post comment", details: err }, { status: 500 });
  }
}
