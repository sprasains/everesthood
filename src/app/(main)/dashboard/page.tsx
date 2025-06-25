"use client";
import { Box, Container, Typography, Grid, Paper, Button } from "@mui/material";
import StreakDisplay from "@/components/ui/StreakDisplay";
import PostCard from "@/components/ui/PostCard";
import Link from "next/link";
import { Stack } from "@mui/system";
import { useUser } from "@/hooks/useUser";

// Mock data, to be replaced with API calls
const mockFriendPosts = [];
const mockJobs = [{ id: '1', title: 'AI Ethics Researcher', company: { name: 'FutureAI' } }];

export default function DashboardPage() {
  const { user } = useUser();
  
  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: 6 }}>
      <Typography variant="h3" fontWeight="bold" sx={{ color: 'white', mb: 4 }}>
        Welcome back, {user?.name || 'Explorer'}!
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>Latest from your Community</Typography>
              {mockFriendPosts.length > 0 ? (
                mockFriendPosts.map(post => <PostCard key={post.id} post={post as any} />)
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
              {mockJobs.map(job => (
                <Box key={job.id} sx={{ mb: 1 }}>
                  <Typography fontWeight="bold" color="white">{job.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{job.company.name}</Typography>
                </Box>
              ))}
              <Button component={Link} href="/careers" fullWidth sx={{ mt: 1 }}>View All Jobs</Button>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
