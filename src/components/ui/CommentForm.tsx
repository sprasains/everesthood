"use client";
import { useState } from "react";
import { Box, TextField, Button, CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), { ssr: false });

export default function CommentForm({ postId, onComment, parentId }: { postId: string; onComment: (content: string) => void; parentId?: string }) {
  const [editorContent, setEditorContent] = useState<any>(null);
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
      setEditorContent(null);
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      onComment(variables);
      enqueueSnackbar('Comment posted!', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to post comment. Please try again.', { variant: 'error' });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mentions: any[] = [];
    const findMentions = (node: any) => {
      if (node?.type === "mention" && node.attrs?.id) {
        mentions.push(node.attrs.id);
      }
      if (node?.content) {
        node.content.forEach(findMentions);
      }
    };
    findMentions(editorContent);
    const mentionedUserIds = [...new Set(mentions)];
    mutation.mutate(editorContent);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 2, display: 'flex', gap: 2 }}>
      <Box sx={{ my: 2 }}>
        <RichTextEditor value={editorContent} onChange={setEditorContent} />
      </Box>
      <Button type="submit" variant="contained" disabled={mutation.status === 'pending' || !editorContent}>
        {mutation.status === 'pending' ? <CircularProgress size={18} /> : "Post"}
      </Button>
    </Box>
  );
}
