"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import NewsCard from "@/components/ui/NewsCard";
import GenZContentPanel from "@/components/ui/GenZContentPanel";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Article } from "@/types";
import { Container, Typography, Box, Chip, Stack, Grid } from "@mui/material";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ComputerIcon from "@mui/icons-material/Computer";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import ScienceIcon from "@mui/icons-material/Science";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

// Define categories with icons
const categories = [
  { id: "all", name: "All", icon: <WhatshotIcon /> },
  { id: "ai", name: "AI", icon: <AutoAwesomeIcon /> },
  { id: "tech", name: "Tech", icon: <ComputerIcon /> },
  { id: "startup", name: "Startup", icon: <RocketLaunchIcon /> },
  { id: "culture", name: "Culture", icon: <TheaterComedyIcon /> },
  { id: "science", name: "Science", icon: <ScienceIcon /> },
];

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
    fetchNews();
  }, [selectedCategory]);

  const handleSummarize = (article: Article) => {
    // Your existing summarize logic...
  };

  const handleShare = (article: Article) => {
    // Your existing share logic...
  };

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

      <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 12 }, pb: 6 }}>
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
              background: "linear-gradient(45deg, #ff4e53, #ffcc00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            Latest AI News
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#d0d0d0", mb: { xs: 4, md: 6 } }}
          >
            Stay ahead of the curve with AI-powered summaries.
          </Typography>
        </motion.div>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: { xs: 4, md: 6 } }}
        >
          {categories.map((category) => (
            <Chip
              key={category.id}
              icon={category.icon}
              label={category.name}
              onClick={() => setSelectedCategory(category.id)}
              color={selectedCategory === category.id ? "secondary" : "default"}
              variant={selectedCategory === category.id ? "filled" : "outlined"}
              sx={{
                color: "white",
                borderColor: "rgba(255, 255, 255, 0.2)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            />
          ))}
        </Stack>

        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={12}
          >
            <LoadingSpinner size="lg" />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {articles.map((article, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  style={{ height: "100%" }}
                >
                  <NewsCard
                    article={article}
                    onSummarize={handleSummarize}
                    onShare={handleShare}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
