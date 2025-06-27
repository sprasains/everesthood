"use client";
import { Box, Container, Typography, Grid, Paper, Button, CircularProgress, Stack, Avatar } from "@mui/material";
import PostCard from "@/components/ui/PostCard";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import Skeleton from "@mui/material/Skeleton";
import NewsTicker from '@/components/ui/NewsTicker';
import AiContentHub from '@/components/ui/AiContentHub';

const fetchUserPosts = async (userId: string) => {
  const res = await fetch(`/api/v1/posts?authorId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

const fetchFriendsCount = async () => {
  const res = await fetch("/api/v1/friends");
  if (!res.ok) throw new Error("Failed to fetch friends");
  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
};
const fetchAchievementsCount = async () => {
  const res = await fetch("/api/v1/achievements");
  if (!res.ok) throw new Error("Failed to fetch achievements");
  const data = await res.json();
  return Array.isArray(data) ? data.filter(a => a.earned).length : 0;
};

export default function DashboardPage() {
  const { user } = useUser();
  const theme = useTheme();

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["userPosts", user?.id],
    queryFn: () => fetchUserPosts(user!.id),
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
  // Use image or fallback
  const avatar = user?.image || "https://i.pravatar.cc/150?u=everhood";

  return (
    <>
      {/* NewsTicker at the very top */}
      <Box sx={{ mb: 3 }}>
        <NewsTicker />
      </Box>
      <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 6 }, pb: 6 }}>
        {/* AI Content Hub at the top of dashboard */}
        <Box sx={{ mb: 4 }}>
          <AiContentHub />
        </Box>
        {/* Main Dashboard Widgets */}
        <Grid container spacing={4}>
          {/* Main Content Area */}
          <Grid item xs={12} md={8}>
            {/* ProfileStatusCard */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Avatar src={typeof avatar === 'string' ? avatar : undefined} alt={user?.name || ""} sx={{ width: 72, height: 72, mb: 2 }} />
                <Typography variant="h6" fontWeight="bold">{user?.name || 'Explorer'}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{user?.email}</Typography>
                <Button component={Link} href="/settings" variant="outlined" startIcon={<EditIcon />}>Edit Profile</Button>
              </Paper>
            </motion.div>
            {/* StatsOverview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minHeight: 220 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Your At-a-Glance Stats</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Link href={user?.id ? `/profile/${user.id}` : "/profile"} style={{ textDecoration: 'none' }}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)', boxShadow: 6 }, cursor: 'pointer' }}>
                        {postsLoading ? (
                          <Skeleton variant="text" width={60} height={48} sx={{ mx: 'auto' }} />
                        ) : (
                          <Typography variant="h4" fontWeight="bold" color="primary">{Array.isArray(postsData?.posts) ? postsData.posts.length : 0}</Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">Posts</Typography>
                      </Paper>
                    </Link>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Link href="/friends" style={{ textDecoration: 'none' }}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)', boxShadow: 6 }, cursor: 'pointer' }}>
                        {friendsCountLoading ? (
                          <Skeleton variant="text" width={60} height={48} sx={{ mx: 'auto' }} />
                        ) : (
                          <Typography variant="h4" fontWeight="bold" color="secondary">{friendsCount}</Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">Friends</Typography>
                      </Paper>
                    </Link>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Link href="/achievements" style={{ textDecoration: 'none' }}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)', boxShadow: 6 }, cursor: 'pointer' }}>
                        {achievementsCountLoading ? (
                          <Skeleton variant="text" width={60} height={48} sx={{ mx: 'auto' }} />
                        ) : (
                          <Typography variant="h4" fontWeight="bold" color="success.main">{achievementsCount}</Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">Achievements</Typography>
                      </Paper>
                    </Link>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
            {/* RecentActivityFeed */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Your Latest Posts</Typography>
                {/* Replace with real post fetching and skeletons */}
                {postsLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                    <CircularProgress />
                  </Box>
                ) : postsData && postsData.posts.length > 0 ? (
                  <Grid container spacing={2}>
                    {postsData.posts.slice(0, 3).map((post: any) => (
                      <Grid item xs={12} key={post.id}>
                        <PostCard post={post} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography>No posts yet. Why not create your first one?</Typography>
                    <Button component={Link} href="/posts/create" variant="contained" sx={{ mt: 2 }}>Create Post</Button>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
