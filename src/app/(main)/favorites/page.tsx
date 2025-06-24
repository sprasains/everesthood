"use client";

import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Navbar from "@/components/layout/Navbar";
import { Container, Typography, CircularProgress } from "@mui/material";
import NewsCard from "@/components/ui/NewsCard";
import { Article } from "@prisma/client";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFavorites = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await fetch("/api/v1/user/favorites");
        if (response.ok) {
          const data: Article[] = await response.json();
          setFavorites(data);
        }
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        color: "white",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <Container
        maxWidth="lg"
        sx={{
          pt: { xs: 10, md: 12 },
          pb: 6,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h3" fontWeight="bold" sx={{ mb: 4 }}>
          Your Saved Articles
        </Typography>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexGrow: 1,
            }}
          >
            <CircularProgress />
          </Box>
        ) : favorites.length > 0 ? (
          <Box
            sx={{
              width: "100%",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Grid container spacing={3} sx={{ flexGrow: 1 }}>
              {favorites.map((article, idx) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={article.id}
                  sx={{
                    display: "flex",
                    flexGrow: idx === 0 ? 1 : undefined,
                  }}
                >
                  <Item
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <NewsCard article={article} />
                  </Item>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Typography>
            You have no saved articles yet. Favorite one from the news feed!
          </Typography>
        )}
      </Container>
    </Box>
  );
}
