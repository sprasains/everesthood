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
  Paper,
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
  // Deprecated: const res = await fetch(`/api/v1/news${params}`);
  const res = await fetch(`/api/v1/news${params}`);
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

const searchNews = async (query: string) => {
  // Deprecated: const res = await fetch(`/api/v1/news/search?q=${encodeURIComponent(query)}`);
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
    <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, md: 4 },
            mb: 4,
            bgcolor: "background.paper",
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              color: "primary.main",
              mb: 2,
              textAlign: "center",
            }}
          >
            Trending News
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            mb={3}
          >
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                icon={cat.icon}
                label={cat.name}
                color={
                  selectedCategory === cat.id ? "primary" : "default"
                }
                onClick={() => setSelectedCategory(cat.id)}
                sx={{ fontWeight: "bold", fontSize: 16 }}
              />
            ))}
          </Stack>
          <Box display="flex" justifyContent="center" mb={3}>
            <TextField
              variant="outlined"
              placeholder="Search news..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 400 } }}
            />
          </Box>
          <Grid container spacing={3}>
            {(newsLoading || searchLoading) ? (
              <Grid item xs={12}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minHeight={200}
                >
                  <LoadingSpinner />
                </Box>
              </Grid>
            ) : (
              (search ? searchData : newsData)?.length > 0 ? (
                (search ? searchData : newsData).map((article: any) => (
                  <Grid item xs={12} sm={6} md={4} key={article.id}>
                    <NewsCard article={article} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: "center",
                      bgcolor: "background.default",
                      borderRadius: 3,
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      No news found.
                    </Typography>
                  </Paper>
                </Grid>
              )
            )}
          </Grid>
        </Paper>
      </motion.div>
    </Container>
  );
}
