"use client";

import { useState } from "react";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import { Article } from "@/types";
import { useUser } from "@/hooks/useUser";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

interface NewsCardProps {
  article: Article & { isLiked?: boolean }; // Add isLiked to the type
}

export default function NewsCard({ article }: NewsCardProps) {
  const { user } = useUser();

  // State for optimistic UI updates
  const [isLiked, setIsLiked] = useState(article.isLiked || false);
  const [likeCount, setLikeCount] = useState(article.likeCount || 0);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      // Optionally prompt user to sign in
      return;
    }

    // Optimistic UI Update
    const originalLikedState = isLiked;
    const originalLikeCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(likeCount + (!isLiked ? 1 : -1));

    try {
      const response = await fetch(`/api/v1/articles/${article.id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        // Revert on error
        setIsLiked(originalLikedState);
        setLikeCount(originalLikeCount);
      } else {
        const data = await response.json();
        // Sync with server state
        setLikeCount(data.likeCount);
      }
    } catch (error) {
      // Revert on network error
      setIsLiked(originalLikedState);
      setLikeCount(originalLikeCount);
      console.error("Failed to like article", error);
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "rgba(255, 255, 255, 0.05)",
        color: "white",
        borderRadius: 4,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <Link href={article.url} passHref legacyBehavior>
        <CardActionArea
          component="a"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          <CardMedia
            component="img"
            sx={{
              height: 140, // Fixed height to solve overlapping issues
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
            image={
              article.imageUrl ||
              "[https://source.unsplash.com/random/400x300/?technology](https://source.unsplash.com/random/400x300/?technology)"
            }
            alt={article.title}
          />
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
                height: "3.9em", // Ensures space for 3 lines
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {article.title}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
      <CardActions
        sx={{
          bgcolor: "rgba(0, 0, 0, 0.2)",
          p: 1,
          justifyContent: "space-between",
        }}
      >
        <Button
          size="small"
          sx={{
            color: "#c4b5fd",
            "&:hover": { bgcolor: "rgba(139, 92, 246, 0.2)" },
          }}
        >
          Read More
        </Button>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <IconButton
            onClick={handleLikeClick}
            size="small"
            sx={{
              color: isLiked ? "#f43f5e" : "rgba(255,255,255,0.7)",
            }}
          >
            {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {likeCount}
          </Typography>
        </Box>
      </CardActions>
    </Card>
  );
}
