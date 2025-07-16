"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { Container, Typography, CircularProgress } from "@mui/material";
import type { Article } from "@/types/index";
import Item from './Item';

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
