"use client";
import { Paper, Box, Avatar, Typography, Link as MuiLink } from "@mui/material";
import { Post, User, Article } from "@prisma/client";
import Link from "next/link";

type PostWithDetails = Post & {
  author: Partial<User>;
  originalArticle?: Article | null;
};

interface PostCardProps {
  post: PostWithDetails;
}

export default function PostCard({ post }: PostCardProps) {
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
          >
            {post.originalArticle.imageUrl && (
              <Box
                component="img"
                src={post.originalArticle.imageUrl}
                sx={{
                  width: "100%",
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 1,
                }}
              />
            )}
            <Typography fontWeight="bold" sx={{ mt: 1 }}>
              {post.originalArticle.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {post.originalArticle.sourceName}
            </Typography>
          </MuiLink>
        </Paper>
      )}

      {/* Add Actions like comments/likes for posts here */}
    </Paper>
  );
}
