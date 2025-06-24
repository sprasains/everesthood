"use client";
import Navbar from "@/components/layout/Navbar";
import { Container, Typography } from "@mui/material";

export default function SettingsPage() {
  return (
    <>
      <Navbar />
      <Container sx={{ pt: 10 }}>
        <Typography variant="h3" fontWeight="bold">
          Settings Page
        </Typography>
      </Container>
    </>
  );
}
