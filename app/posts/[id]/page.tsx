"use client";
export const dynamic = "force-dynamic";
import { Box, Typography, Button, CircularProgress, Paper, Avatar, Container } from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThreadedComments from '@/components/posts/ThreadedComments';

export default function PostPage() {
  const params = useParams();
  const postId = params?.id as string | undefined;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    fetch(`/api/v1/posts/${postId}`)
      .then(res => res.ok ? res.json() : Promise.reject('Not found'))
      .then(data => setPost(data))
      .catch(() => setError('Post not found.'))
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error || !post) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4">Post Details</Typography>
      <Typography sx={{ mt: 2 }}>This post is not available. Please return to the <Link href="/news">news feed</Link>.</Typography>
      <Button variant="contained" sx={{ mt: 3 }} component={Link} href="/news">Back to Feed</Button>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 10, md: 12 }, pb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, bgcolor: "rgba(255, 255, 255, 0.05)", borderRadius: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar src={post.author?.image || undefined} />
          <Typography fontWeight="bold">{post.author?.name}</Typography>
        </Box>
        <Typography sx={{ whiteSpace: "pre-wrap", my: 2 }}>{post.content}</Typography>
        {/* Comments Section */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Comments</Typography>
        <ThreadedComments postId={post.id} currentUserId={post.author?.id || ''} />
      </Paper>
    </Container>
  );
}
