"use client";
import { useUser } from '@/hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import { Box, Grid, Typography, Paper, CircularProgress, Divider, Avatar, Stack, Card, CardContent } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import UserStatusPanel from './UserStatusPanel';
import { useEffect, useMemo } from 'react';

// Fetch functions for stats and analytics
const fetchAnalytics = async () => {
  const res = await fetch('/api/v1/user/analytics');
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
};
const fetchAgentPerformance = async () => {
  const res = await fetch('/api/v1/agents/performance');
  if (!res.ok) throw new Error('Failed to fetch agent performance');
  return res.json();
};
const fetchUserPosts = async (userId: string) => {
  const res = await fetch(`/api/v1/posts?authorId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
};
const fetchFriendsCount = async () => {
  const res = await fetch('/api/v1/friends');
  if (!res.ok) throw new Error('Failed to fetch friends');
  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
};
const fetchAchievementsCount = async () => {
  const res = await fetch('/api/v1/achievements');
  if (!res.ok) throw new Error('Failed to fetch achievements');
  const data = await res.json();
  return Array.isArray(data) ? data.filter(a => a.earned).length : 0;
};

export default function DashboardOverview() {
  const { user, loading } = useUser();
  const { data: analytics, isLoading: analyticsLoading } = useQuery({ queryKey: ['analytics'], queryFn: fetchAnalytics });
  const { data: agentPerf, isLoading: agentPerfLoading } = useQuery({ queryKey: ['agent-performance'], queryFn: fetchAgentPerformance });
  const { data: postsData, isLoading: postsLoading } = useQuery({ queryKey: ['userPosts', user?.id], queryFn: () => user ? fetchUserPosts(user.id) : Promise.resolve({ posts: [] }), enabled: !!user });
  const { data: friendsCount, isLoading: friendsCountLoading } = useQuery({ queryKey: ['friends-count'], queryFn: fetchFriendsCount });
  const { data: achievementsCount, isLoading: achievementsCountLoading } = useQuery({ queryKey: ['achievements-count'], queryFn: fetchAchievementsCount });

  // Knowledge Graph Chart
  const knowledgeGraphData = analytics?.knowledgeGraph ? {
    labels: Object.keys(analytics.knowledgeGraph),
    datasets: [{
      label: 'Topics Engaged With',
      data: Object.values(analytics.knowledgeGraph),
      backgroundColor: 'rgba(139, 92, 246, 0.5)',
    }],
  } : null;

  // Agent Performance Chart
  const agentPerfChartData = agentPerf?.performanceByAgent ? {
    labels: Object.keys(agentPerf.performanceByAgent),
    datasets: [
      {
        label: 'Total Runs',
        data: Object.values(agentPerf.performanceByAgent).map((a: any) => a.total),
        backgroundColor: 'rgba(33, 150, 243, 0.5)',
      },
      {
        label: 'Successes',
        data: Object.values(agentPerf.performanceByAgent).map((a: any) => a.successful),
        backgroundColor: 'rgba(76, 175, 80, 0.5)',
      },
      {
        label: 'Failures',
        data: Object.values(agentPerf.performanceByAgent).map((a: any) => a.failed),
        backgroundColor: 'rgba(244, 67, 54, 0.5)',
      },
    ],
  } : null;

  if (loading || !user) return <CircularProgress />;

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, bgcolor: 'transparent' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, background: 'linear-gradient(90deg, #8b5cf6, #ffcc00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Welcome, {user.name || user.email || 'AI Explorer'}!
      </Typography>
      <Grid container spacing={3}>
        {/* User Info & Stats */}
        <Grid item xs={12} md={4}>
          <UserStatusPanel user={user} />
          <Paper sx={{ p: 2, mt: 2, background: 'rgba(255,255,255,0.07)' }}>
            <Typography variant="subtitle1" fontWeight="bold">Quick Stats</Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="h6">{postsLoading ? '-' : postsData?.posts?.length ?? 0}</Typography>
                <Typography variant="caption">Posts</Typography>
              </Box>
              <Box>
                <Typography variant="h6">{friendsCountLoading ? '-' : friendsCount ?? 0}</Typography>
                <Typography variant="caption">Friends</Typography>
              </Box>
              <Box>
                <Typography variant="h6">{achievementsCountLoading ? '-' : achievementsCount ?? 0}</Typography>
                <Typography variant="caption">Achievements</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        {/* Charts & Activity */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.05)' }}>
                <Typography variant="subtitle1" fontWeight="bold">Knowledge Graph</Typography>
                {analyticsLoading ? <CircularProgress /> : knowledgeGraphData ? <Bar data={knowledgeGraphData} /> : <Typography color="text.secondary">No data.</Typography>}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.05)' }}>
                <Typography variant="subtitle1" fontWeight="bold">Agent Performance</Typography>
                {agentPerfLoading ? <CircularProgress /> : agentPerfChartData ? <Bar data={agentPerfChartData} /> : <Typography color="text.secondary">No data.</Typography>}
                <Divider sx={{ my: 1 }} />
                {agentPerf && (
                  <Stack direction="row" spacing={2}>
                    <Box>
                      <Typography variant="h6">{agentPerf.totalRuns}</Typography>
                      <Typography variant="caption">Total Runs</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6">{agentPerf.successRate?.toFixed(1)}%</Typography>
                      <Typography variant="caption">Success Rate</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6">{agentPerf.averageRunTimeSeconds?.toFixed(2)}s</Typography>
                      <Typography variant="caption">Avg Run Time</Typography>
                    </Box>
                  </Stack>
                )}
              </Paper>
            </Grid>
            {/* Recent Activity */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.04)' }}>
                <Typography variant="subtitle1" fontWeight="bold">Recent Activity</Typography>
                <Box sx={{ mt: 1 }}>
                  {postsLoading ? <CircularProgress /> : postsData?.posts?.length ? (
                    <Stack spacing={1}>
                      {postsData.posts.slice(0, 5).map((post: any) => (
                        <Box key={post.id}>
                          <Typography variant="body2" fontWeight="bold">{post.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{new Date(post.createdAt).toLocaleString()}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : <Typography color="text.secondary">No recent posts.</Typography>}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        {/* System Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 2, background: 'rgba(255,255,255,0.06)' }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>System Overview</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              EverestHood is your digital assistant factory—create, schedule, and run smart agents to automate your work and life. Enjoy real-time and scheduled automation, social learning, and creator monetization.
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">Key Features</Typography>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>Unified agent execution</li>
                  <li>Real-time & scheduled automation</li>
                  <li>Modular, extensible logic</li>
                  <li>Centralized logging & monitoring</li>
                  <li>Social, gamified, monetized modules</li>
                </ul>
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">Modules</Typography>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>AI Personas & Summaries</li>
                  <li>News & Content Curation</li>
                  <li>Social Community</li>
                  <li>Achievements & Gamification</li>
                  <li>Job Board & Resume Tools</li>
                  <li>Payments, Tipping, Subscriptions</li>
                  <li>Family, Money, Health, Productivity</li>
                </ul>
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">Best Practices</Typography>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>Modularize agent/API logic</li>
                  <li>Use fix scripts regularly</li>
                  <li>Document new features</li>
                  <li>Encourage creative agent use</li>
                </ul>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 