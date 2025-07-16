"use client";
export const dynamic = "force-dynamic";
import Navbar from "@/components/layout/Navbar";
import { Container, Typography } from "@mui/material";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <Container sx={{ pt: 10 }}>
        <Typography variant="h3" fontWeight="bold">
          Contact
        </Typography>
      </Container>
    </>
  );
}
