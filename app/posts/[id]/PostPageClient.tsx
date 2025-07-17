"use client";
import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import Link from 'next/link';

export const PostPageClient = ({ post }: { post: any }) => {
  // TODO: Implement real post/comment logic
  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, textAlign: 'center' }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Post Details</Typography>
          <Typography sx={{ whiteSpace: "pre-wrap", mb: 2 }}>This post is not available. Please return to the <Link href="/news">news feed</Link>.</Typography>
          <Button variant="contained" sx={{ mt: 2 }} component={Link} href="/news">Back to Feed</Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PostPageClient; 