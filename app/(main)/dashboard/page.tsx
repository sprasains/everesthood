"use client";
import { Box, Container, Typography, Grid, Paper, Button, CircularProgress, Stack, Avatar } from "@mui/material";
import PostCard from "@/components/ui/PostCard";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from '@mui/material/styles';
import { useMemo, useEffect } from 'react';
import Skeleton from "@mui/material/Skeleton";
import NewsTicker from '@/components/ui/NewsTicker';
import AiContentHub from '@/components/ui/AiContentHub';
import { logger, newCorrelationId, getCorrelationId } from '@/services/logger';
import PostCardSkeleton from "@/components/ui/PostCardSkeleton";
import { useRouter } from "next/navigation";
import DailyDigest from 'components/dashboard/DailyDigest';
import MarketSnapshot from '../../../components/dashboard/MarketSnapshot';
import AICacheDisplay from '../../../components/dashboard/AICacheDisplay';

const fetchUserPosts = async (userId: string) => {
  const res = await fetch(`/api/v1/posts?authorId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

const fetchFriendsCount = async () => {
  newCorrelationId();
  logger.info('Fetching friends count.');
  try {
    const headers = new Headers({ 'X-Correlation-ID': getCorrelationId() });
    const res = await fetch("/api/v1/friends", { headers });
    if (!res.ok) {
      logger.warn('Failed to fetch friends.', { status: res.status });
      throw new Error("Failed to fetch friends");
    }
    const data = await res.json();
    logger.info('Fetched friends count.', { count: Array.isArray(data) ? data.length : 0 });
    return Array.isArray(data) ? data.length : 0;
  } catch (error: any) {
    logger.error('Error fetching friends count.', { error: error.message, stack: error.stack });
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
          <Grid sx={{ width: '100%' }}>
            {/* Market Snapshot above DailyDigest */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <MarketSnapshot />
            </motion.div>
            {/* Cached AI Content below Market Snapshot */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <AICacheDisplay prompt={"What's the latest in AI?"} />
            </motion.div>
            {/* DailyDigest now above profile card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white', mb: 3 }}>
                <DailyDigest />
              </Paper>
            </motion.div>
            {/* ProfileStatusCard with horizontal avatar and edit button, AI Content Hub style */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 4, minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white', mb: 3 }}>
                {user ? (
                  <>
                    <Box display="flex" alignItems="center" justifyContent="center" width="100%" mb={2} gap={2}>
                      <Avatar src={typeof avatar === 'string' ? avatar : undefined} alt={user?.name || ""} sx={{ width: 64, height: 64, boxShadow: 2, border: '2px solid #fff' }} />
                      <Button component={Link} href="/settings" variant="contained" color="inherit" startIcon={<EditIcon />} sx={{ borderRadius: 2, fontWeight: 600, boxShadow: 1, color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
                        Edit Profile
                      </Button>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>{user?.name || 'Explorer'}</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>{user?.email}</Typography>
                    {/* Compact, colorful, vertically stacked stats */}
                    <Grid container direction="column" alignItems="center" spacing={1} sx={{ mt: 1, width: 'auto' }}>
                      <Grid item>
                        <Link href={user?.id ? `/profile/${user.id}` : "/profile"} style={{ textDecoration: 'none' }}>
                          <Paper sx={{ p: 1, textAlign: 'center', borderRadius: 2, background: 'linear-gradient(90deg, #fbbf24, #f59e42)', minWidth: 60, mb: 1, boxShadow: 1, color: 'white' }}>
                            {postsLoading ? (
                              <Skeleton variant="text" width={30} height={24} sx={{ mx: 'auto', bgcolor: 'rgba(255,255,255,0.2)' }} />
                            ) : (
                              <Typography variant="h6" fontWeight="bold" color="white" sx={{ fontSize: '1.2rem' }}>{Array.isArray(postsData?.posts) ? postsData.posts.length : 0}</Typography>
                            )}
                            <Typography variant="caption" color="white">Posts</Typography>
                          </Paper>
                        </Link>
                      </Grid>
                      <Grid item>
                        <Link href="/friends" style={{ textDecoration: 'none' }}>
                          <Paper sx={{ p: 1, textAlign: 'center', borderRadius: 2, background: 'linear-gradient(90deg, #38bdf8, #6366f1)', minWidth: 60, mb: 1, boxShadow: 1, color: 'white' }}>
                            {friendsCountLoading ? (
                              <Skeleton variant="text" width={30} height={24} sx={{ mx: 'auto', bgcolor: 'rgba(255,255,255,0.2)' }} />
                            ) : (
                              <Typography variant="h6" fontWeight="bold" color="white" sx={{ fontSize: '1.2rem' }}>{friendsCount}</Typography>
                            )}
                            <Typography variant="caption" color="white">Friends</Typography>
                          </Paper>
                        </Link>
                      </Grid>
                      <Grid item>
                        <Link href="/achievements" style={{ textDecoration: 'none' }}>
                          <Paper sx={{ p: 1, textAlign: 'center', borderRadius: 2, background: 'linear-gradient(90deg, #f472b6, #a21caf)', minWidth: 60, boxShadow: 1, color: 'white' }}>
                            {achievementsCountLoading ? (
                              <Skeleton variant="text" width={30} height={24} sx={{ mx: 'auto', bgcolor: 'rgba(255,255,255,0.2)' }} />
                            ) : (
                              <Typography variant="h6" fontWeight="bold" color="white" sx={{ fontSize: '1.2rem' }}>{achievementsCount}</Typography>
                            )}
                            <Typography variant="caption" color="white">Achievements</Typography>
                          </Paper>
                        </Link>
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Skeleton variant="circular" width={64} height={64} sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
                    <Skeleton variant="text" width={120} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    <Skeleton variant="text" width={180} height={24} sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
                    <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
                  </>
                )}
              </Paper>
            </motion.div>
            {/* RecentActivityFeed */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Your Latest Posts</Typography>
                {/* Replace with real post fetching and skeletons */}
                {postsLoading ? (
                  <Box>
                    {Array.from(new Array(2)).map((_, i) => (
                      <Box key={i} mb={2}><PostCardSkeleton /></Box>
                    ))}
                  </Box>
                ) : postsData && postsData.posts.length > 0 ? (
                  <Grid container spacing={2}>
                    {postsData.posts.slice(0, 3).map((post: any) => (
                      <Grid key={post.id} sx={{ width: '100%' }}>
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
