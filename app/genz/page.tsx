"use client";
export const dynamic = "force-dynamic";
import GenZContentPanel from "@/components/ui/GenZContentPanel";
import { Box, Typography } from "@mui/material";

export default function GenZPage() {
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", py: 6, px: 2 }}>
      <Typography variant="h3" fontWeight="bold" mb={4} align="center">
        Gen-Z Content
      </Typography>
      <GenZContentPanel />
    </Box>
  );
} 