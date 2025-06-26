"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Avatar,
  TextField,
  Button,
} from "@mui/material";
// Define minimal Post, User, and Article types for frontend use
type Post = {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  // Add other fields as needed
};

type User = {
  id: string;
  name?: string | null;
  image?: string | null;
  // Add other fields as needed
};

type Article = {
  id: string;
  title: string;
  sourceName?: string;
  // Add other fields as needed
};

type PostWithDetails = Post & {
  author: Partial<User>;
  originalArticle?: Article;
};

type CommentWithAuthor = {
  id: string;
  content: string;
  createdAt: string;
  author: Partial<User>;
};

export default function PostDetailPage() {
  const { user } = useUser();
  const params = useParams();
  const postId = params.postId as string;

  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      const fetchPostAndComments = async () => {
        setLoading(true);
        try {
          // Fetch the main post
          const postRes = await fetch(`/api/v1/posts/${postId}`);
          if (postRes.ok) setPost(await postRes.json());

          // Fetch the comments
          const commentsRes = await fetch(`/api/v1/posts/${postId}/comments`);
          if (commentsRes.ok) setComments(await commentsRes.json());
        } catch (error) {
          console.error("Failed to fetch post details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPostAndComments();
    }
  }, [postId]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const response = await fetch(`/api/v1/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });
    if (response.ok) {
      const addedComment = await response.json();
      setComments((prev) => [...prev, addedComment]);
      setNewComment("");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#0f2027",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return <Typography>Post not found.</Typography>;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        color: "white",
      }}
    >
      <Container maxWidth="md" sx={{ pt: { xs: 10, md: 12 }, pb: 6 }}>
        <Paper
          elevation={3}
          sx={{ p: 4, bgcolor: "rgba(255, 255, 255, 0.05)", borderRadius: 3 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar src={post.author.image || undefined} />
            <Typography fontWeight="bold">{post.author.name}</Typography>
          </Box>
          <Typography sx={{ whiteSpace: "pre-wrap", my: 2 }}>
            {post.content}
          </Typography>

          {/* If it's a repost, show the original article */}
          {post.originalArticle && (
            <Paper
              variant="outlined"
              sx={{ p: 2, my: 2, borderColor: "rgba(255,255,255,0.2)" }}
            >
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                Reposting:
              </Typography>
              <Typography fontWeight="bold">
                {post.originalArticle.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {post.originalArticle.sourceName}
              </Typography>
            </Paper>
          )}

          {/* Comment Section */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Comments
          </Typography>
          <Box className="space-y-4">
            {comments.map((comment) => (
              <Box key={comment.id} sx={{ display: "flex", gap: 2 }}>
                <Avatar
                  src={comment.author.image || undefined}
                  sx={{ width: 32, height: 32 }}
                />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {comment.author.name}
                  </Typography>
                  <Typography variant="body2">{comment.content}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Add a Comment */}
          {user && (
            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
              <Avatar src={user.image || undefined} />
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    borderRadius: 2,
                  },
                }}
              />
              <Button variant="contained" onClick={handleCommentSubmit}>
                Post
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
