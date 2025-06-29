import { useEffect, useState, useCallback } from "react";
import { Box, Avatar, Typography, Paper, CircularProgress, IconButton, Button } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useQueryClient } from '@tanstack/react-query';

const CommentForm = dynamic(() => import("@/components/ui/CommentForm"), { ssr: false });

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string; image?: string; id?: string };
}

export default function CommentList({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const fetchComments = useCallback(() => {
    fetch(`/api/v1/posts/${postId}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    fetchComments();
    const socket = getSocket();
    socket.emit("join_post", postId);
    socket.on("comment_update", fetchComments);
    return () => {
      socket.emit("leave_post", postId);
      socket.off("comment_update", fetchComments);
    };
  }, [postId, fetchComments]);

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Optimistic update
    await queryClient.cancelQueries({ queryKey: ['comments', postId] });
    const previousComments = queryClient.getQueryData<any[]>(['comments', postId]);
    queryClient.setQueryData(['comments', postId], (old: any[] = []) =>
      old.map(c => c.id === editingId ? { ...c, content: editContent } : c)
    );
    try {
      await fetch(`/api/v1/posts/${postId}/comments/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
    } catch {
      // Revert on error
      if (previousComments) {
        queryClient.setQueryData(['comments', postId], previousComments);
      }
    } finally {
      setEditingId(null);
      setEditContent("");
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    await queryClient.cancelQueries({ queryKey: ['comments', postId] });
    const previousComments = queryClient.getQueryData<any[]>(['comments', postId]);
    queryClient.setQueryData(['comments', postId], (old: any[] = []) => old.filter(c => c.id !== id));
    try {
      await fetch(`/api/v1/posts/${postId}/comments/${id}`, { method: "DELETE" });
    } catch {
      // Revert on error
      if (previousComments) {
        queryClient.setQueryData(['comments', postId], previousComments);
      }
    } finally {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    }
  };

  const handleReply = (parentId: string) => {
    setReplyTo(replyTo === parentId ? null : parentId);
  };

  const handleCommentPosted = () => {
    fetchComments();
    setReplyTo(null);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ mt: 2 }}>
      {/* Top-level comment form */}
      <CommentForm postId={postId} onComment={handleCommentPosted} />
      {comments.length === 0 && <Typography>No comments yet.</Typography>}
      {comments.map((comment) => (
        <Paper key={comment.id} sx={{ p: 2, mb: 1, display: 'flex', gap: 2, alignItems: 'flex-start', bgcolor: 'rgba(255,255,255,0.03)' }}>
          <Avatar src={comment.author.image} />
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight="bold">{comment.author.name}</Typography>
            <Typography variant="caption" color="text.secondary">{new Date(comment.createdAt).toLocaleString()}</Typography>
            {editingId === comment.id ? (
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 8 }}>
                {/* You may want to use RichTextEditor here for editing as well */}
                <input value={editContent} onChange={e => setEditContent(e.target.value)} style={{ flex: 1 }} />
                <Button type="submit" variant="contained" size="small">Save</Button>
                <Button onClick={() => setEditingId(null)} size="small">Cancel</Button>
              </form>
            ) : (
              <Typography sx={{ mt: 1 }}>{comment.content}</Typography>
            )}
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button size="small" onClick={() => handleReply(comment.id)}>
                {replyTo === comment.id ? "Cancel" : "Reply"}
              </Button>
              {replyTo === comment.id && (
                <CommentForm postId={postId} parentId={comment.id} onComment={handleCommentPosted} />
              )}
            </Box>
          </Box>
          {session?.user?.id && comment.author.id === session.user.id && editingId !== comment.id && (
            <Box>
              <IconButton onClick={() => handleEdit(comment)} size="small"><EditIcon fontSize="small" /></IconButton>
              <IconButton onClick={() => handleDelete(comment.id)} size="small"><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          )}
        </Paper>
      ))}
    </Box>
  );
}
