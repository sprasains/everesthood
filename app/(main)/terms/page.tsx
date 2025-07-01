"use client";
import Navbar from "@/components/layout/Navbar";
import { Container, Typography } from "@mui/material";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <Container sx={{ pt: 10 }}>
        <Typography variant="h3" fontWeight="bold">
          Terms of Service
        </Typography>
      </Container>
    </>
  );
}
