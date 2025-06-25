"use client";
import { Box, Container, Typography, Grid, Paper, Button, CircularProgress, Stack, Avatar, IconButton } from "@mui/material";
import StreakDisplay from "@/components/ui/StreakDisplay";
import PostCard from "@/components/ui/PostCard";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import Skeleton from "@mui/material/Skeleton";

const fetchCommunityPosts = async () => {
  const res = await fetch("/api/v1/community/posts");
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

const fetchJobs = async () => {
  const res = await fetch("/api/v1/jobs?featured=true");
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
};
const fetchPostsCount = async () => {
  const res = await fetch("/api/v1/community/posts");
  if (!res.ok) throw new Error("Failed to fetch posts");
  const data = await res.json();
  if (Array.isArray(data)) {
    return data.length;
  }
  if (typeof data.count === "number") {
    return data.count;
  }
  if (Array.isArray(data.posts)) {
    return data.posts.length;
  }
  return 0;
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
    queryKey: ["community-posts"],
    queryFn: fetchCommunityPosts,
  });
  const { data: postsCount, isLoading: postsCountLoading } = useQuery({
    queryKey: ["posts-count"],
    queryFn: fetchPostsCount,
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
    { id: 3, text: "Sheesh, your vibe check was bussin'." },
    { id: 4, text: "GOAT status unlocked. No cap." },
    { id: 5, text: "FOMO? Take several seats, you’re main character now." },
    { id: 6, text: "Slay! That comment was a clapback." },
    { id: 7, text: "Mood: Vibing with the squad. WYWH!" },
  ], []);
  // Use image or fallback
  const avatar = (user && (user as any).image) ? (user as any).image : "https://i.pravatar.cc/150?u=everhood";

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: 6 }}>
      {/* Top Navbar Paper */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Paper elevation={6} sx={{ p: 2, mb: 4, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={avatar} alt={user?.name} sx={{ width: 48, height: 48 }} />
            <Box>
              <Typography fontWeight="bold" variant="h6">{user?.name || 'Explorer'}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Button component={Link} href="/dashboard" color="primary" variant="text">Dashboard</Button>
            <Button component={Link} href="/friends" color="primary" variant="text">Friends</Button>
            <Button component={Link} href="/settings" color="primary" variant="text">Settings</Button>
            <IconButton color="primary">
              <NotificationsIcon />
            </IconButton>
            <IconButton color="primary">
              <MailOutlineIcon />
            </IconButton>
          </Box>
        </Paper>
      </motion.div>

      {/* Animated Notifications/Message Bar */}
      <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
        <Paper elevation={2} sx={{ mb: 4, p: 1.5, borderRadius: 3, overflowX: 'auto', bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.7)' : 'grey.100' }}>
          <Box sx={{ display: 'flex', gap: 3, minHeight: 40 }}>
            {notifications.map((notif, idx) => (
              <motion.div key={notif.id} initial={{ x: 60 }} animate={{ x: 0 }} transition={{ delay: 0.2 + idx * 0.15 }}>
                <Paper sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 500, boxShadow: 2, minWidth: 180 }}>
                  {notif.text}
                </Paper>
              </motion.div>
            ))}
          </Box>
        </Paper>
      </motion.div>

      {/* Main Dashboard Widgets */}
      <Grid container spacing={3}>
        {/* ProfileStatusCard */}
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar src={avatar || undefined} alt={user?.name || undefined} sx={{ width: 72, height: 72, mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">{user?.name || 'Explorer'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{user?.email}</Typography>
              <Button component={Link} href="/settings" variant="outlined" startIcon={<EditIcon />}>Edit Profile</Button>
            </Paper>
          </motion.div>
        </Grid>
        {/* StatsOverview */}
        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minHeight: 220 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Your At-a-Glance Stats</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Link href="/admin/posts" style={{ textDecoration: 'none' }}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)', boxShadow: 6 }, cursor: 'pointer' }}>
                      {postsCountLoading ? (
                        <Skeleton variant="text" width={60} height={48} sx={{ mx: 'auto' }} />
                      ) : (
                        <Typography variant="h4" fontWeight="bold" color="primary">{postsCount}</Typography>
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
        </Grid>
        {/* RecentActivityFeed */}
        <Grid item xs={12}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Your Latest Articles</Typography>
              {/* Replace with real post fetching and skeletons */}
              {postsLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                  <CircularProgress />
                </Box>
              ) : postsData && postsData.length > 0 ? (
                <Grid container spacing={2}>
                  {postsData.slice(0, 3).map((post: any) => (
                    <Grid item xs={12} md={4} key={post.id}>
                      <PostCard post={post} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography>No articles yet. Why not create your first one?</Typography>
                  <Button component={Link} href="/posts/create" variant="contained" sx={{ mt: 2 }}>Create Post</Button>
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
}
