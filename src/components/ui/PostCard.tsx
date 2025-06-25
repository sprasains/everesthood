"use client";
import { Paper, Box, Avatar, Typography, Link as MuiLink, Button } from "@mui/material";
import { Post, User, Article } from "@prisma/client";
import Link from "next/link";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import { useState, useEffect } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CircularProgress from "@mui/material/CircularProgress";
import { useSession } from "next-auth/react";

type PostWithDetails = Post & {
  author: Partial<User>;
  originalArticle?: Article | null;
  likeCount?: number; // Add likeCount for UI
};

interface PostCardProps {
  post: PostWithDetails;
}

export default function PostCard({ post }: PostCardProps) {
  const [refreshComments, setRefreshComments] = useState(0);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const { data: session } = useSession();

  // Fetch like status for current user
  useEffect(() => {
    async function fetchLikeStatus() {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/v1/posts/${post.id}/like`, { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setLiked(!!data.liked);
        if (typeof data.likeCount === "number") setLikeCount(data.likeCount);
      } else {
        // fallback: fetch like count directly if available
        setLiked(false);
        setLikeCount(post.likeCount ?? 0);
      }
    }
    fetchLikeStatus();
  }, [post.id, session?.user?.id, post.likeCount]);

  const handleLike = async () => {
    setLikeLoading(true);
    const action = liked ? "unlike" : "like";
    const res = await fetch(`/api/v1/posts/${post.id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    }
    setLikeLoading(false);
  };

  const handleComment = () => setRefreshComments((c) => c + 1);

  return (
    <Paper
      data-testid="post-card"
      sx={{
        p: 3,
        bgcolor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 3,
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Avatar src={post.author.image || undefined} />
        <Box>
          <Typography fontWeight="bold">{post.author.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(post.createdAt).toLocaleString()}
          </Typography>
        </Box>
      </Box>
      <Typography sx={{ whiteSpace: "pre-wrap", my: 2 }}>
        {post.content}
      </Typography>

      {post.originalArticle && (
        <Paper
          variant="outlined"
          sx={{ p: 2, mt: 2, borderColor: "rgba(255,255,255,0.2)" }}
        >
          <MuiLink
            href={post.originalArticle.url}
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
            sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
          >
            {post.originalArticle.imageUrl && (
              <Box
                component="img"
                src={post.originalArticle.imageUrl}
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              />
            )}
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight="bold" sx={{ mt: 0 }}>
                {post.originalArticle.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {post.originalArticle.sourceName}
              </Typography>
              <Button
                href={post.originalArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Read Original
              </Button>
            </Box>
          </MuiLink>
        </Paper>
      )}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
        <MuiLink component={Link} href={`/posts/${post.id}`} underline="none">
          <Button variant="outlined" size="small" color="primary">Comment</Button>
        </MuiLink>
        <Button
          variant={liked ? "contained" : "outlined"}
          size="small"
          color="secondary"
          onClick={handleLike}
          startIcon={likeLoading ? <CircularProgress size={18} /> : (liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />)}
          disabled={likeLoading}
        >
          {likeCount}
        </Button>
        <MuiLink component={Link} href={`/posts/${post.id}`} underline="none">
          <Button variant="text" size="small" color="info">View Post</Button>
        </MuiLink>
      </Box>
      {/* Comments Section */}
      <CommentForm postId={post.id} onComment={handleComment} />
      <CommentList key={refreshComments} postId={post.id} />
      {/* Tipping Section */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Support the creator by tipping!
        </Typography>
        <Button
          variant="contained"
          size="small"
          color="success"
          onClick={() => alert('Tipping functionality coming soon!')}
        >
          Tip Creator
        </Button>
      </Box>
      {/* End of Tipping Section */}
    </Paper>
  );
}
