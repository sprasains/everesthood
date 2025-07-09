import React from 'react';
import useSWR from 'swr';
import { Box, Typography, Paper, Avatar, CircularProgress } from '@mui/material';
import RichTextRenderer from '../posts/RichTextRenderer';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function UserMentionedPosts() {
  const { data: posts, error, isLoading } = useSWR('/api/v1/posts/mentioned', fetcher);

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Failed to load mentioned posts</Typography>;
  if (!posts || posts.length === 0) return <Typography>No mentions yet.</Typography>;

  return (
    <Box>
      <Typography variant="h6" mb={2}>Posts You Were Mentioned In</Typography>
      {posts.map((post: any) => (
        <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar src={post.author?.image} sx={{ mr: 1 }} />
            <Typography fontWeight="bold">{post.author?.name || 'User'}</Typography>
            <Typography variant="caption" sx={{ ml: 2 }}>{new Date(post.createdAt).toLocaleString()}</Typography>
          </Box>
          <Typography variant="subtitle1" fontWeight="bold">{post.title}</Typography>
          <RichTextRenderer content={post.content} />
        </Paper>
      ))}
    </Box>
  );
} 