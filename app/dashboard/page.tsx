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
import AppLayoutShell from '@/components/layout/AppLayoutShell';
import DashboardOverview from './DashboardOverview';

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
  return (
    <AppLayoutShell>
      <DashboardOverview />
    </AppLayoutShell>
  );
}
