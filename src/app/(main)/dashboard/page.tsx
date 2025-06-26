"use client";
import { Box, Container, Typography, Grid, Paper, Button, CircularProgress, Stack, Avatar, IconButton } from "@mui/material";
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
import NewsTicker from '@/components/ui/NewsTicker';

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
  const avatar = (user && 'image' in user) ? user.image : undefined || "https://i.pravatar.cc/150?u=everhood";

  return (
    <>
      {/* NewsTicker at the very top */}
      <Box sx={{ mb: 3 }}>
        <NewsTicker />
      </Box>
      <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 6 }, pb: 6 }}>
        {/* Unified Top Navbar with Explorer Panel */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Paper elevation={6} sx={{ p: 2, mb: 4, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper' }}>
            {/* Explorer panel merged with nav */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={typeof avatar === 'string' ? avatar : undefined} alt={user?.name || ""} sx={{ width: 48, height: 48 }} />
              <Box>
                <Typography fontWeight="bold" variant="h6">{user?.name || 'Explorer'}</Typography>
                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              </Box>
            </Box>
            {/* Nav buttons and icons */}
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
