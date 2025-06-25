import { useEffect, useState } from "react";
import { Box, Avatar, Typography, Paper, CircularProgress } from "@mui/material";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string; image?: string };
}

export default function CommentList({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/posts/${postId}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading) return <CircularProgress />;
  if (!comments.length) return <Typography>No comments yet.</Typography>;

  return (
    <Box sx={{ mt: 2 }}>
      {comments.map((comment) => (
        <Paper key={comment.id} sx={{ p: 2, mb: 1, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'rgba(255,255,255,0.03)' }}>
          <Avatar src={comment.author.image} />
          <Box>
            <Typography fontWeight="bold">{comment.author.name}</Typography>
            <Typography variant="caption" color="text.secondary">{new Date(comment.createdAt).toLocaleString()}</Typography>
            <Typography sx={{ mt: 1 }}>{comment.content}</Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
