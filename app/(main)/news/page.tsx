"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Typography,
  Box,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Button,
  Paper,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
} from "@mui/material";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ComputerIcon from "@mui/icons-material/Computer";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import ScienceIcon from "@mui/icons-material/Science";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SearchIcon from "@mui/icons-material/Search";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import NewsCardGrid from "@/components/ui/NewsCardGrid";
import NewsCardList from "@/components/ui/NewsCardList";

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
  const [layout, setLayout] = useState<"grid" | "list">("grid");
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

  const handleLayoutChange = (
    event: React.MouseEvent<HTMLElement>,
    newLayout: "grid" | "list" | null
  ) => {
    if (newLayout !== null) {
      setLayout(newLayout);
    }
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
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" color="text.secondary">
              {search.trim() ? "Search Results" : "Latest Articles"}
            </Typography>
            <ToggleButtonGroup
              value={layout}
              exclusive
              onChange={handleLayoutChange}
              aria-label="layout"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Grid container spacing={2}>
            {(newsLoading || searchLoading) ? (
              <Grid sx={{ width: '100%' }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <CircularProgress />
                </Box>
              </Grid>
            ) : (
              (search ? searchData : newsData)?.length > 0 ? (
                layout === "grid" ? (
                  (search ? searchData : newsData).map((article: any) => (
                    <Grid key={article.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' } }}>
                      <NewsCardGrid article={article} />
                    </Grid>
                  ))
                ) : (
                  <Stack spacing={2}>
                    {(search ? searchData : newsData).map((article: any) => (
                      <NewsCardList key={article.id} article={article} />
                    ))}
                  </Stack>
                )
              ) : (
                <Grid sx={{ width: '100%' }}>
                  <Paper sx={{ p: 4, textAlign: "center", bgcolor: "background.default", borderRadius: 3 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      We couldn&apos;t find any articles right now.
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Please check back later or try a different search/category.
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
