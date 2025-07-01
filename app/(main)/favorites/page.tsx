"use client";

import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Grid from '@mui/material/Grid';
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Navbar from "@/components/layout/Navbar";
import { Container, Typography, CircularProgress } from "@mui/material";
import NewsCard from "@/components/ui/NewsCard";
import type { Article } from "@/types";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function FavoritesPage() {
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
        <Typography>
          The favorites feature is no longer supported.
        </Typography>
      </Container>
    </Box>
  );
}
