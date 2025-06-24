"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import NewsCard from "@/components/ui/NewsCard";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Article } from "@/types";
import {
  Container,
  Typography,
  Box,
  Chip,
  Stack,
  Grid,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ComputerIcon from "@mui/icons-material/Computer";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import ScienceIcon from "@mui/icons-material/Science";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SearchIcon from "@mui/icons-material/Search";

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
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (query?: string) => {
    setSearchLoading(true);
    setSearchError("");
    try {
      const response = await fetch(
        `/api/v1/news/search?q=${encodeURIComponent(query ?? search)}`
      );
      if (!response.ok) throw new Error("Search failed");
      setArticles(await response.json());
    } catch (e) {
      setSearchError("No news found or error occurred.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    if (search.trim() === "") {
      setSearchError("");
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(search);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (search.trim()) return; // Don't auto-fetch if searching
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
  }, [selectedCategory, search]);

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

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: { xs: 4, md: 6 } }}
        >
          <Box flex={1}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search news by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.7)",
                  },
                },
              }}
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSearch()}
            disabled={searchLoading || !search.trim()}
            sx={{ minWidth: 120 }}
            startIcon={<SearchIcon />}
          >
            {searchLoading ? "Searching..." : "Search"}
          </Button>
        </Stack>
        {searchError && <Typography color="error">{searchError}</Typography>}

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
              <Grid item xs={12} sm={6} md={4} key={article.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  style={{ height: "100%" }}
                >
                  <NewsCard article={article as any} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
