"use client";

import { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Article } from "@/types";
import { useUser } from "@/hooks/useUser";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CommentIcon from "@mui/icons-material/Comment";
import RepeatIcon from "@mui/icons-material/Repeat";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

// Update Article type to include new properties
type ArticleWithSocial = Article & {
  isLiked?: boolean;
  isFavorited?: boolean;
  likeCount: number;
  favoriteCount: number;
};

interface NewsCardProps {
  article: ArticleWithSocial;
}

export default function NewsCard({ article }: NewsCardProps) {
  const { user } = useUser();
  const router = useRouter();

  // State for optimistic UI updates
  const [isLiked, setIsLiked] = useState(article.isLiked || false);
  const [likeCount, setLikeCount] = useState(article.likeCount || 0);
  const [isFavorited, setIsFavorited] = useState(article.isFavorited || false);
  const [favoriteCount, setFavoriteCount] = useState(
    article.favoriteCount || 0
  );

  const handleAction = async (action: "like" | "favorite" | "repost") => {
    if (!user) return; // Or prompt to login

    if (action === "like") {
      const originalState = { isLiked, likeCount };
      setIsLiked(!isLiked);
      setLikeCount((prev) => prev + (originalState.isLiked ? -1 : 1));
      try {
        // Deprecated: const res = await fetch(`/api/v1/articles/${article.id}/like`, {
        // Deprecated: const res = await fetch(`/api/v1/articles/${article.id}/favorite`, {
      } catch {
        setIsLiked(originalState.isLiked);
        setLikeCount(originalState.likeCount);
      }
    }

    if (action === "favorite") {
      const originalState = { isFavorited, favoriteCount };
      setIsFavorited(!isFavorited);
      setFavoriteCount((prev) => prev + (isFavorited ? -1 : 1));
      try {
        // Deprecated: const res = await fetch(`/api/v1/articles/${article.id}/favorite`, {
      } catch {
        setIsFavorited(originalState.isFavorited);
        setFavoriteCount(originalState.favoriteCount);
      }
    }

    if (action === "repost") {
      const commentary = prompt("Add your thoughts (optional):", "");
      if (commentary === null) return;
      await fetch(`/api/v1/articles/${article.id}/repost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentary }),
      });
      alert("Article shared to the community feed!");
    }
  };

  return (
    <Card
      data-testid="news-card"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "rgba(30, 41, 59, 0.5)",
        color: "white",
        borderRadius: 4,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Link
        href={article.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardMedia
          component="img"
          sx={{ height: 140 }}
          image={
            article.imageUrl ||
            "https://source.unsplash.com/random/400x300/?abstract"
          }
          alt={article.title}
        />
      </Link>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="caption"
          sx={{ color: "rgba(255, 255, 255, 0.7)" }}
        >
          {article.sourceName}
        </Typography>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{
            fontWeight: "bold",
            mt: 1,
            lineHeight: 1.3,
            height: "3.9em",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </Typography>
      </CardContent>
      <CardActions
        sx={{
          p: 1,
          justifyContent: "space-around",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Tooltip title="Comment">
          <IconButton
            onClick={() => alert("Navigate to post detail page to comment.")}
          >
            <CommentIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Repost">
          <IconButton onClick={() => handleAction("repost")}>
            <RepeatIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Like">
          <IconButton
            onClick={() => handleAction("like")}
            sx={{
              color: isLiked ? "rgb(244, 63, 94)" : "rgba(255,255,255,0.7)",
            }}
          >
            {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            <Typography variant="body2" sx={{ ml: 0.5, minWidth: "1ch" }}>
              {likeCount}
            </Typography>
          </IconButton>
        </Tooltip>
        <Tooltip title="Favorite">
          <IconButton
            onClick={() => handleAction("favorite")}
            sx={{
              color: isFavorited ? "rgb(255, 193, 7)" : "rgba(255,255,255,0.7)",
            }}
          >
            {isFavorited ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            <Typography variant="body2" sx={{ ml: 0.5, minWidth: "1ch" }}>
              {favoriteCount}
            </Typography>
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
