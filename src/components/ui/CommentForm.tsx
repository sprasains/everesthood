"use client";
import { useState } from "react";
import { Box, TextField, Button, CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

export default function CommentForm({ postId, onComment, parentId }: { postId: string; onComment: (content: string) => void; parentId?: string }) {
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const mutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/v1/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, postId, parentId }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
    },
    onSuccess: (_data, variables) => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      onComment(variables);
      enqueueSnackbar('Comment posted!', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to post comment. Please try again.', { variant: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(content);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 2, display: 'flex', gap: 2 }}>
      <TextField
        value={content}
        onChange={e => setContent(e.target.value)}
        label="Add a comment"
        size="small"
        fullWidth
        required
      />
      <Button type="submit" variant="contained" disabled={mutation.status === 'pending' || !content.trim()}>
        {mutation.status === 'pending' ? <CircularProgress size={18} /> : "Post"}
      </Button>
    </Box>
  );
}
