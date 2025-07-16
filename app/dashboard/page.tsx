"use client";
export const dynamic = "force-dynamic";
import { Box, Container, Typography, Paper, Button, CircularProgress, Stack, Avatar } from "@mui/material";
import Link from "next/link";
import { useUser } from '@/hooks/useUser';
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from '@mui/material/styles';
import { useMemo, useEffect } from 'react';
import Skeleton from "@mui/material/Skeleton";
import { useRouter } from "next/navigation";

const fetchUserPosts = async (userId: string) => {
  const res = await fetch(`/api/v1/posts?authorId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

const fetchFriendsCount = async () => {
  try {
    const res = await fetch("/api/v1/friends");
    if (!res.ok) {
      throw new Error("Failed to fetch friends");
    }
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch (error: any) {
    throw error;
  }
};
const fetchAchievementsCount = async () => {
  const res = await fetch("/api/v1/achievements");
  if (!res.ok) throw new Error("Failed to fetch achievements");
  const data = await res.json();
  return Array.isArray(data) ? data.filter(a => a.earned).length : 0;
};

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const theme = useTheme();
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["userPosts", user?.id],
    queryFn: () => user ? fetchUserPosts(user.id) : Promise.resolve({ posts: [] }),
    enabled: !!user,
  });
  const { data: friendsCount, isLoading: friendsCountLoading } = useQuery({
    queryKey: ["friends-count"],
    queryFn: fetchFriendsCount,
  });
  const { data: achievementsCount, isLoading: achievementsCountLoading } = useQuery({
    queryKey: ["achievements-count"],
    queryFn: fetchAchievementsCount,
  });
  // Mock notifications/messages for demo
  const notifications = useMemo(() => [
    { id: 1, text: "🔥 Your drip is valid! Glow up, fam!" },
    { id: 2, text: "Bet! You just got a W with that post." },
  ], []);
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, loading, router]);
  if (loading || !user) {
    return <CircularProgress />;
  }
  // Use image or fallback
  const avatar = user?.image || "https://i.pravatar.cc/150?u=everhood";

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Dashboard</Typography>
      <Box sx={{ mt: 4 }}>
        <Typography>Some dashboard features are coming soon.</Typography>
      </Box>
    </Box>
  );
}
