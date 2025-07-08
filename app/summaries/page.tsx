"use client";
import Navbar from "@/components/layout/Navbar";
import { Container, Typography } from "@mui/material";

export default function SummariesPage() {
  return (
    <>
      <Navbar />
      <Container sx={{ pt: 10 }}>
        <Typography variant="h3" fontWeight="bold">
          Summaries Page
        </Typography>
      </Container>
    </>
  );
}
