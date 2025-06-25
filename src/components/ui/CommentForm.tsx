import { useState } from "react";
import { Box, TextField, Button } from "@mui/material";

export default function CommentForm({ postId, onComment }: { postId: string; onComment: () => void }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/v1/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setContent("");
    setLoading(false);
    onComment();
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
      <Button type="submit" variant="contained" disabled={loading || !content.trim()}>
        {loading ? "Posting..." : "Post"}
      </Button>
    </Box>
  );
}
