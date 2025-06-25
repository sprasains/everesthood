import { notFound } from "next/navigation";
import { Box, Card, CardContent, Typography, Avatar, Button, CircularProgress } from "@mui/material";
import { Suspense } from "react";
import CommentList from "@/components/ui/CommentList";
import CommentForm from "@/components/ui/CommentForm";

async function fetchPost(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/v1/community/posts/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await fetchPost(params.id);
  if (!post) return notFound();

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
                    <img src={post.originalArticle.imageUrl} alt="article" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                  )}
                  <Box>
                    <Typography fontWeight="bold">{post.originalArticle.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{post.originalArticle.sourceName}</Typography>
                  </Box>
                </Box>
              </a>
            </Card>
          )}
        </CardContent>
      </Card>
      <Suspense fallback={<CircularProgress />}>
        <CommentForm postId={post.id} />
        <CommentList postId={post.id} />
      </Suspense>
    </Box>
  );
}
