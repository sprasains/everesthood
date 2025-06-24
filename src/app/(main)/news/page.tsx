"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import NewsCard from "@/components/ui/NewsCard";
import GenZContentPanel from "@/components/ui/GenZContentPanel";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Article } from "@/types";
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
} from "@mui/material";
import { Grid } from "@mui/material"; // Using latest Grid for MUI v7 with size prop
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ComputerIcon from "@mui/icons-material/Computer";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import ScienceIcon from "@mui/icons-material/Science";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function NewsPage() {
  const { user } = useUser();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [summaryModal, setSummaryModal] = useState<{
    show: boolean;
    article?: Article;
    summary?: string;
  }>({ show: false });

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params =
        selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
      const response = await fetch(`/api/v1/news${params}`);

      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async (article: Article) => {
    setSummaryModal({ show: true, article, summary: undefined });

    try {
      const response = await fetch("/api/v1/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: article.content || article.description,
          persona: user?.persona || "ZenGPT",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummaryModal((prev) => ({ ...prev, summary: data.summary }));
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummaryModal((prev) => ({
        ...prev,
        summary: "Sorry, failed to generate summary. Please try again.",
      }));
    }
  };

  const handleShare = (article: Article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: article.url,
      });
    } else {
      navigator.clipboard.writeText(article.url);
      // Show toast notification (assumed to be handled elsewhere)
    }
  };

  const categories = [
    {
      id: "all",
      name: "All",
      icon: (
        <WbSunnyRoundedIcon
          sx={{ color: "#ffcc00", mr: 1, verticalAlign: "middle" }}
        />
      ),
    },
    {
      id: "ai",
      name: "AI",
      icon: (
        <AutoAwesomeIcon
          sx={{ color: "#ff4e53", mr: 1, verticalAlign: "middle" }}
        />
      ),
    },
    {
      id: "tech",
      name: "Tech",
      icon: (
        <ComputerIcon
          sx={{ color: "#2575fc", mr: 1, verticalAlign: "middle" }}
        />
      ),
    },
    {
      id: "startup",
      name: "Startup",
      icon: (
        <RocketLaunchIcon
          sx={{ color: "#34A853", mr: 1, verticalAlign: "middle" }}
        />
      ),
    },
    {
      id: "culture",
      name: "Culture",
      icon: (
        <TheaterComedyIcon
          sx={{ color: "#EA4335", mr: 1, verticalAlign: "middle" }}
        />
      ),
    },
    {
      id: "science",
      name: "Science",
      icon: (
        <ScienceIcon
          sx={{ color: "#FBBC05", mr: 1, verticalAlign: "middle" }}
        />
      ),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        color: "white",
        overflowX: "hidden",
      }}
    >
      <Navbar />
      <GenZContentPanel />

      <Container
        maxWidth="xl"
        sx={{
          ml: { xs: 0, md: "80px" }, // Adjust for sidebar or navbar if present
          pt: { xs: 10, md: 12 },
          px: { xs: 2, sm: 4, md: 6 },
          pb: 6,
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              background: "linear-gradient(45deg, #ff4e53, #ffcc00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: { xs: 1, sm: 2 },
            }}
          >
            🔥 Latest AI News
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#d0d0d0",
              mb: { xs: 4, sm: 6, md: 8 },
              fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
            }}
          >
            Stay ahead of the curve with AI-powered summaries and Gen-Z
            perspectives.
          </Typography>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
        >
          <Card
            sx={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
              backdropFilter: "blur(15px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white",
              borderRadius: 3,
              p: { xs: 3, sm: 4 },
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
              mb: { xs: 4, sm: 6, md: 8 },
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{
                  fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
                  color: "#fff",
                  mb: { xs: 2, sm: 3 },
                }}
              >
                🗂️ Filter by Category
              </Typography>
              <Stack
                direction="row"
                spacing={{ xs: 1, sm: 1.5, md: 2 }}
                flexWrap="wrap"
                useFlexGap
              >
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    icon={category.icon}
                    label={category.name}
                    onClick={() => setSelectedCategory(category.id)}
                    color={
                      selectedCategory === category.id ? "warning" : "default"
                    }
                    variant={
                      selectedCategory === category.id ? "filled" : "outlined"
                    }
                    sx={{
                      color:
                        selectedCategory === category.id ? "white" : "#d0d0d0",
                      backgroundColor:
                        selectedCategory === category.id
                          ? "#ff4e53"
                          : "rgba(255, 255, 255, 0.1)",
                      borderColor:
                        selectedCategory === category.id
                          ? "transparent"
                          : "rgba(255, 255, 255, 0.2)",
                      fontSize: { xs: "0.75rem", sm: "0.85rem" },
                      px: { xs: 1, sm: 1.5 },
                      py: { xs: 0.5, sm: 1 },
                      borderRadius: "50px",
                      transition: "transform 0.2s, background 0.2s, color 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        backgroundColor:
                          selectedCategory === category.id
                            ? "#ff4e53"
                            : "rgba(255, 255, 255, 0.15)",
                      },
                    }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </motion.div>

        {/* News Grid */}
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={{ xs: 8, md: 12 }}
          >
            <LoadingSpinner size="lg" />
          </Box>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Grid container spacing={{ xs: 3, sm: 4, md: 6 }}>
              {articles.map((article, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 6 }} key={article.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                  >
                    <NewsCard
                      article={article}
                      user={user}
                      onSummarize={handleSummarize}
                      onShare={handleShare}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={{ xs: 8, md: 12 }}
            textAlign="center"
          >
            <Typography
              variant="h3"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: { xs: "2rem", sm: "2.5rem" },
                color: "#d0d0d0",
                mb: 2,
              }}
            >
              📰 No Articles Found
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#a0a0a0",
                fontSize: { xs: "0.9rem", sm: "1rem" },
              }}
            >
              Try selecting a different category or check back later.
            </Typography>
          </Box>
        )}
      </Container>

      {/* AI Summary Modal */}
      {summaryModal.show && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            p: { xs: 2, sm: 4 },
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            sx={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
              backdropFilter: "blur(15px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white",
              borderRadius: 3,
              p: { xs: 3, sm: 5, md: 6 },
              maxWidth: { xs: "90%", sm: "600px" },
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={4}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: "1.2rem", sm: "1.4rem" },
                    color: "#fff",
                    mb: 0.5,
                  }}
                >
                  🤖 AI Summary
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#ff4e53",
                    fontSize: { xs: "0.8rem", sm: "0.85rem" },
                  }}
                >
                  by {user?.persona || "ZenGPT"}
                </Typography>
              </Box>
              <Button
                onClick={() => setSummaryModal({ show: false })}
                sx={{
                  color: "#d0d0d0",
                  "&:hover": {
                    color: "#ff4e53",
                  },
                  minWidth: "auto",
                  p: 0,
                }}
              >
                ✕
              </Button>
            </Box>

            <Box mb={4}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{
                  color: "#fff",
                  mb: 0.5,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                {summaryModal.article?.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#a0a0a0",
                  fontSize: { xs: "0.75rem", sm: "0.8rem" },
                }}
              >
                {summaryModal.article?.sourceName}
              </Typography>
            </Box>

            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 2,
                p: { xs: 2, sm: 3, md: 4 },
                border: "1px solid rgba(255, 255, 255, 0.1)",
                minHeight: "100px",
              }}
            >
              {summaryModal.summary ? (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#e0e0e0",
                    lineHeight: 1.6,
                    fontSize: { xs: "0.85rem", sm: "0.9rem" },
                  }}
                >
                  {summaryModal.summary}
                </Typography>
              ) : (
                <Box display="flex" alignItems="center" gap={2}>
                  <LoadingSpinner size="sm" />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#a0a0a0",
                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                    }}
                  >
                    Generating personalized summary...
                  </Typography>
                </Box>
              )}
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={4}
            >
              {summaryModal.article?.url && (
                <Button
                  variant="outlined"
                  href={summaryModal.article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#ffcc00",
                    borderColor: "rgba(255, 204, 0, 0.5)",
                    fontSize: { xs: "0.75rem", sm: "0.8rem" },
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#ffcc00",
                      backgroundColor: "rgba(255, 204, 0, 0.1)",
                    },
                  }}
                >
                  🔗 Read Full Article
                </Button>
              )}
              {summaryModal.summary && (
                <Button
                  variant="contained"
                  onClick={() => {
                    if (summaryModal.article) {
                      handleShare(summaryModal.article);
                    }
                  }}
                  sx={{
                    background: "linear-gradient(45deg, #ff4e53, #ffcc00)",
                    color: "white",
                    fontSize: { xs: "0.75rem", sm: "0.8rem" },
                    textTransform: "none",
                    "&:hover": {
                      background: "linear-gradient(45deg, #ffcc00, #ff4e53)",
                    },
                  }}
                >
                  Share Summary
                </Button>
              )}
            </Box>
          </motion.div>
        </Box>
      )}
    </Box>
  );
}
