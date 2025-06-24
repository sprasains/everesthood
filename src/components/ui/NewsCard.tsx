"use client";

import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
} from "@mui/material";
import Link from "next/link";
import { Article } from "@/types";
import { trackEngagement } from "@/lib/analytics";
import { useUser } from "@/hooks/useUser";
import { motion } from "framer-motion";

interface NewsCardProps {
  article: Article;
  onSummarize?: (article: Article) => void;
  onShare?: (article: Article) => void;
}

export default function NewsCard({
  article,
  onSummarize,
  onShare,
}: NewsCardProps) {
  const { user } = useUser();
  const isSummarizeDisabled =
    !user ||
    (user.subscriptionStatus === "free" && (user.summariesUsed || 0) >= 3);

  const handleSummarizeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSummarize?.(article);
    trackEngagement.aiSummaryUsed(
      user?.persona || "ZenGPT",
      article.id,
      user?.id
    );
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onShare?.(article);
    trackEngagement.socialShare("native", "article", user?.id);
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
              {article.sourceName} •{" "}
              {new Date(article.publishedAt).toLocaleDateString()}
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
          onClick={handleSummarizeClick}
          disabled={isSummarizeDisabled}
          sx={{
            color: "#c4b5fd",
            "&:hover": { bgcolor: "rgba(139, 92, 246, 0.2)" },
          }}
        >
          🤖 AI Summary
        </Button>
        <Button
          size="small"
          onClick={handleShareClick}
          sx={{
            color: "#93c5fd",
            "&:hover": { bgcolor: "rgba(59, 130, 246, 0.2)" },
          }}
        >
          Share
        </Button>
      </CardActions>
    </Card>
  );
}
