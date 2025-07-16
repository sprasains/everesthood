"use client";
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { Box, Card, CardContent, Typography, Avatar, Button, CircularProgress } from "@mui/material";
import { Suspense } from "react";
import loadable from "next/dynamic";
import Image from 'next/image';

// NOTE: This fetch runs on the server. NEXT_PUBLIC_BASE_URL must be set in your environment (e.g., https://yourdomain.com)
async function fetchPost(id: string) {
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error('NEXT_PUBLIC_BASE_URL is required for server-side fetches to /api/v1/posts/.');
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/posts/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default function PostPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Post Details</Typography>
      <Typography sx={{ mt: 2 }}>Post details and comments are currently unavailable.</Typography>
    </Box>
  );
}
