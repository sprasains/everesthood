"use client";
export const dynamic = "force-dynamic";
import Navbar from "app/components/layout/Navbar";
import { Container, Typography } from "@mui/material";

export default function ApiDocsPage() {
  return (
    <>
      <Navbar />
      <Container sx={{ pt: 10 }}>
        <Typography variant="h3" fontWeight="bold">
          API Docs
        </Typography>
      </Container>
    </>
  );
}

//stories 
//update the stories
//
