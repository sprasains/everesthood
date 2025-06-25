"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import NewsCard from "@/components/ui/NewsCard";
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
import { useQuery } from "@tanstack/react-query";

// Define categories with icons
const categories = [
  { id: "all", name: "All", icon: <WhatshotIcon /> },
  { id: "ai", name: "AI", icon: <AutoAwesomeIcon /> },
  { id: "tech", name: "Tech", icon: <ComputerIcon /> },
  { id: "startup", name: "Startup", icon: <RocketLaunchIcon /> },
  { id: "culture", name: "Culture", icon: <TheaterComedyIcon /> },
  { id: "science", name: "Science", icon: <ScienceIcon /> },
];

const fetchNews = async (category: string) => {
  const params = category !== "all" ? `?category=${category}` : "";
  const res = await fetch(`/api/v1/news${params}`);
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

const searchNews = async (query: string) => {
  const res = await fetch(`/api/v1/news/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
};

export default function NewsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Category-based news
  const {
    data: newsData,
    isLoading: newsLoading,
    isError: newsError,
    refetch: refetchNews,
  } = useQuery({
    queryKey: ["news", selectedCategory],
    queryFn: () => fetchNews(selectedCategory),
    enabled: !search.trim(),
  });

  // Search-based news
  const {
    data: searchData,
    isLoading: searchLoading,
    isError: searchError,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ["news-search", search],
    queryFn: () => searchNews(search),
    enabled: !!search.trim(),
  });

  // Debounce search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      refetchSearch();
    }, 400);
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
            }}
          >
            News Feed
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                icon={cat.icon}
                label={cat.name}
                color={selectedCategory === cat.id ? "primary" : "default"}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearch("");
                  refetchNews();
                }}
                sx={{ fontWeight: 600, fontSize: "1rem" }}
              />
            ))}
          </Stack>
          <TextField
            value={search}
            onChange={handleSearchChange}
            placeholder="Search news..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 4, width: { xs: "100%", md: 400 } }}
            variant="outlined"
            size="small"
          />
          {(newsLoading || searchLoading) && <LoadingSpinner />}
          {(newsError || searchError) && (
            <Typography color="error" sx={{ mt: 2 }}>
              Error loading news.
            </Typography>
          )}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {(search.trim() ? searchData?.articles : newsData?.articles)?.map((article: Article) => (
              <Grid item xs={12} sm={6} md={4} key={article.id}>
                <NewsCard article={article} />
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}
