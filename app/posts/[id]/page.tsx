"use client";
import { notFound } from "next/navigation";
import { Box, Card, CardContent, Typography, Avatar, Button, CircularProgress } from "@mui/material";
import { Suspense } from "react";
import CommentList from "@/components/posts/CommentList";
import CommentForm from "@/components/posts/CommentForm";
import PostPageSkeleton from "@/components/posts/PostPageSkeleton";
import dynamic from "next/dynamic";
import ThreadedComments from '@/app/posts/posts/ThreadedComments';
import Image from 'next/image';
import { useUser } from '@/src/hooks/useUser';

const EditPostButton = dynamic(() => import("@/app/posts/posts/EditPostButton"), { ssr: false });

// NOTE: This fetch runs on the server. NEXT_PUBLIC_BASE_URL must be set in your environment (e.g., https://yourdomain.com)
async function fetchPost(id: string) {
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error('NEXT_PUBLIC_BASE_URL is required for server-side fetches to /api/v1/posts/.');
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/posts/${id}`);
  if (!res.ok) return null;
  return res.json();
}

// Client component for post page
function PostPageClient({ post }: { post: any }) {
  const { user } = useUser();
  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar src={post.author?.image || "https://i.pravatar.cc/150?u=everhood"} />
            <Box>
              <Typography fontWeight="bold">{post.author?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>{post.title}</Typography>
          <Typography sx={{ whiteSpace: "pre-wrap", mb: 2 }}>{post.content}</Typography>
          {post.originalArticle && (
            <Card variant="outlined" sx={{ p: 2, mt: 2, borderColor: "rgba(255,255,255,0.2)" }}>
              <a href={post.originalArticle.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {post.originalArticle.imageUrl && (
                    <Image src={post.originalArticle.imageUrl} alt="article" width={80} height={80} style={{ objectFit: "cover", borderRadius: 8 }} />
                  )}
                  <Box>
                    <Typography fontWeight="bold">{post.originalArticle.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{post.originalArticle.sourceName}</Typography>
                  </Box>
                </Box>
              </a>
            </Card>
          )}
          <EditPostButton postId={post.id} authorId={post.author?.id} />
        </CardContent>
      </Card>
      <Suspense fallback={<PostPageSkeleton />}>
        <ThreadedComments postId={post.id} currentUserId={user?.id || ''} />
      </Suspense>
    </Box>
  );
}

export default function PostPage({ params }: { params: { id: string } }) {
  // Use a state and useEffect to fetch data if needed
  return <PostPageClient post={post} />;
}
