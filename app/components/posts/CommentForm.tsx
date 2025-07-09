"use client";
import { useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import dynamic from "next/dynamic";

// Corrected import path for RichTextEditor
const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });

export default function CommentForm({ postId, onComment, parentId }: { postId: string; onComment?: (content: any) => void; parentId?: string }) {
  const [editorContent, setEditorContent] = useState<any>(null);
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const mutation = useMutation({
    mutationFn: async (content: any) => {
      // Extract mentioned user IDs from TipTap JSON
      const mentions: any[] = [];
      const findMentions = (node: any) => {
        if (node?.type === "mention" && node.attrs?.id) {
          mentions.push(node.attrs.id);
        }
        if (node?.content) {
          node.content.forEach(findMentions);
        }
      };
      findMentions(content);
      const mentionedUserIds = Array.from(new Set(mentions));
      const res = await fetch(`/api/v1/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, postId, parentId, mentionedUserIds }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      return res.json();
    },
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });
      const previousComments = queryClient.getQueryData<any[]>(['comments', postId]);
      // Optimistically add the new comment
      const optimisticComment = {
        id: `optimistic-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        author: { name: 'You', id: 'me' },
        parentId: parentId || null,
        optimistic: true,
      };
      queryClient.setQueryData(['comments', postId], (old: any[] = []) => [optimisticComment, ...(old || [])]);
      return { previousComments };
    },
    onError: (_err, _content, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', postId], context.previousComments);
      }
      enqueueSnackbar('Failed to post comment. Please try again.', { variant: 'error' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onSuccess: (_data, variables) => {
      setEditorContent(null);
      onComment?.(variables);
      enqueueSnackbar('Comment posted!', { variant: 'success' });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(editorContent);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 2, display: 'flex', gap: 2 }}>
      <Box sx={{ my: 2, flex: 1 }}>
        <RichTextEditor initialContent={editorContent} onUpdate={setEditorContent} />
      </Box>
      <Button type="submit" variant="contained" disabled={mutation.status === 'pending' || !editorContent}>
        {mutation.status === 'pending' ? <CircularProgress size={18} /> : "Post"}
      </Button>
    </Box>
  );
}
