import { useEffect, useState, useCallback } from "react";
import { Box, Avatar, Typography, Paper, CircularProgress, IconButton, TextField, Button } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();

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
    await fetch(`/api/v1/posts/${postId}/comments/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    setEditingId(null);
    setEditContent("");
    fetchComments();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/v1/posts/${postId}/comments/${id}`, { method: "DELETE" });
    fetchComments();
  };

  if (loading) return <CircularProgress />;
  if (!comments.length) return <Typography>No comments yet.</Typography>;

  return (
    <Box sx={{ mt: 2 }}>
      {comments.map((comment) => (
        <Paper key={comment.id} sx={{ p: 2, mb: 1, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'rgba(255,255,255,0.03)' }}>
          <Avatar src={comment.author.image} />
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight="bold">{comment.author.name}</Typography>
            <Typography variant="caption" color="text.secondary">{new Date(comment.createdAt).toLocaleString()}</Typography>
            {editingId === comment.id ? (
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 8 }}>
                <TextField value={editContent} onChange={e => setEditContent(e.target.value)} size="small" fullWidth />
                <Button type="submit" variant="contained" size="small">Save</Button>
                <Button onClick={() => setEditingId(null)} size="small">Cancel</Button>
              </form>
            ) : (
              <Typography sx={{ mt: 1 }}>{comment.content}</Typography>
            )}
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
