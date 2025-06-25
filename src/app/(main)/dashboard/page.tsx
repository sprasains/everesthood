"use client";
import { Box, Container, Typography, Grid, Paper, Button, CircularProgress, Stack } from "@mui/material";
import StreakDisplay from "@/components/ui/StreakDisplay";
import PostCard from "@/components/ui/PostCard";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

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

export default function DashboardPage() {
  const { user } = useUser();
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["community-posts"],
    queryFn: fetchCommunityPosts,
  });
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: fetchJobs,
  });

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: 6 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <Typography variant="h3" fontWeight="bold" sx={{ color: 'white', mb: 4 }}>
          Welcome back, {user?.name || 'Explorer'}!
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>Latest from your Community</Typography>
                {postsLoading ? (
                  <Box textAlign="center" py={4}><CircularProgress /></Box>
                ) : postsData?.length > 0 ? (
                  postsData.map((post: any) => <PostCard key={post.id} post={post} />)
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography color="text.secondary">Your friends haven't posted anything yet. Why not create the first post?</Typography>
                    <Button component={Link} href="/create-post" variant="outlined" sx={{ mt: 2 }}>Write an Article</Button>
                  </Box>
                )}
              </Paper>
            </Stack>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <StreakDisplay />
              <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>Featured Opportunities</Typography>
                {jobsLoading ? (
                  <Box textAlign="center" py={2}><CircularProgress /></Box>
                ) : jobsData?.length > 0 ? (
                  jobsData.map((job: any) => (
                    <Box key={job.id} sx={{ mb: 1 }}>
                      <Typography fontWeight="bold" color="white">{job.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{job.company?.name}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">No featured jobs right now.</Typography>
                )}
                <Button component={Link} href="/careers" fullWidth sx={{ mt: 1 }}>View All Jobs</Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
}
