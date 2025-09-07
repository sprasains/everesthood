"use client";
import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Stack, Chip, Button, Select, MenuItem, FormControl, InputLabel, LinearProgress } from '@mui/material';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import SpeedIcon from '@mui/icons-material/Speed';
import CategoryIcon from '@mui/icons-material/Category';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

interface MarketplaceMetrics {
  totalAgents: number;
  totalUsers: number;
  totalRuns: number;
  averageRating: number;
  growthRate: number;
  topCategories: Array<{ category: string; count: number; growth: number }>;
  topAgents: Array<{ id: string; name: string; runs: number; rating: number; growth: number }>;
  usageTrends: Array<{ date: string; runs: number; users: number }>;
  categoryDistribution: Array<{ category: string; percentage: number; count: number }>;
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    retentionRate: number;
  };
  performanceMetrics: {
    averageExecutionTime: number;
    successRate: number;
    errorRate: number;
    satisfactionScore: number;
  };
}

interface MarketplaceAnalyticsProps {
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: string) => void;
}

export default function MarketplaceAnalytics({ timeRange = '30d', onTimeRangeChange }: MarketplaceAnalyticsProps) {
  const [metrics, setMetrics] = useState<MarketplaceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/agent-marketplace/analytics?timeRange=${selectedTimeRange}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setMetrics(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (newRange: string) => {
    setSelectedTimeRange(newRange);
    if (onTimeRangeChange) {
      onTimeRangeChange(newRange);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Marketplace Analytics</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Marketplace Analytics</Typography>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!metrics) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Marketplace Analytics</Typography>
        <Typography>No analytics data available.</Typography>
      </Box>
    );
  }

  // Chart data configurations
  const usageTrendsData = {
    labels: metrics.usageTrends.map(t => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Runs',
        data: metrics.usageTrends.map(t => t.runs),
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Active Users',
        data: metrics.usageTrends.map(t => t.users),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
      }
    ],
  };

  const categoryDistributionData = {
    labels: metrics.categoryDistribution.map(c => c.category),
    datasets: [{
      data: metrics.categoryDistribution.map(c => c.percentage),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
      ],
      borderWidth: 0,
    }],
  };

  const topAgentsData = {
    labels: metrics.topAgents.map(a => a.name),
    datasets: [{
      label: 'Runs',
      data: metrics.topAgents.map(a => a.runs),
      backgroundColor: 'rgba(139, 92, 246, 0.6)',
      borderColor: '#8b5cf6',
      borderWidth: 1,
    }],
  };

  const topCategoriesData = {
    labels: metrics.topCategories.map(c => c.category),
    datasets: [{
      label: 'Agent Count',
      data: metrics.topCategories.map(c => c.count),
      backgroundColor: 'rgba(34, 197, 94, 0.6)',
      borderColor: '#22c55e',
      borderWidth: 1,
    }],
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Info note about analytics limitations */}
      <Box sx={{ mb: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #90caf9' }}>
        <Typography variant="body2" color="primary">
          Note: Ratings and satisfaction scores are currently unavailable due to database limitations. Only usage, engagement, and performance metrics are shown.
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#1976d2' }}>
          Marketplace Analytics
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={selectedTimeRange}
            label="Time Range"
            onChange={(e) => handleTimeRangeChange(e.target.value)}
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
            <MenuItem value="1y">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {metrics.totalAgents.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Agents
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {metrics.growthRate > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                      {Math.abs(metrics.growthRate).toFixed(1)}% this period
                    </Typography>
                  </Box>
                </Box>
                <CategoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {metrics.totalUsers.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active Users
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {metrics.userEngagement.dailyActiveUsers} daily active
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {metrics.totalRuns.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Runs
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {metrics.performanceMetrics.successRate.toFixed(1)}% success rate
                  </Typography>
                </Box>
                <SpeedIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {metrics.averageRating.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Average Rating
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {metrics.performanceMetrics.satisfactionScore.toFixed(1)}/10 satisfaction
                  </Typography>
                </Box>
                <StarIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Usage Trends</Typography>
              <Box sx={{ height: 300 }}>
                <Line data={usageTrendsData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Category Distribution</Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut data={categoryDistributionData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Performers */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Performing Agents</Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={topAgentsData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Popular Categories</Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={topCategoriesData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>User Engagement</Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Daily Active Users</Typography>
                  <Typography variant="h6" color="primary">
                    {metrics.userEngagement.dailyActiveUsers.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Weekly Active Users</Typography>
                  <Typography variant="h6" color="primary">
                    {metrics.userEngagement.weeklyActiveUsers.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Monthly Active Users</Typography>
                  <Typography variant="h6" color="primary">
                    {metrics.userEngagement.monthlyActiveUsers.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Retention Rate</Typography>
                  <Typography variant="h6" color="primary">
                    {metrics.userEngagement.retentionRate.toFixed(1)}%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Avg Execution Time</Typography>
                  <Typography variant="h6" color="primary">
                    {metrics.performanceMetrics.averageExecutionTime.toFixed(1)}s
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Success Rate</Typography>
                  <Typography variant="h6" color="success.main">
                    {metrics.performanceMetrics.successRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Error Rate</Typography>
                  <Typography variant="h6" color="error.main">
                    {metrics.performanceMetrics.errorRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Satisfaction Score</Typography>
                  <Typography variant="h6" color="primary">
                    {metrics.performanceMetrics.satisfactionScore.toFixed(1)}/10
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Agents List */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Top Agents by Usage</Typography>
          <Stack spacing={2}>
            {metrics.topAgents.map((agent, index) => (
              <Box key={agent.id} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" color="primary">
                    #{index + 1}
                  </Typography>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {agent.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon sx={{ fontSize: 16, color: 'gold' }} />
                      <Typography variant="body2" color="text.secondary">
                        {agent.rating.toFixed(1)} rating
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" color="primary">
                    {agent.runs.toLocaleString()} runs
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    {agent.growth > 0 ? <TrendingUpIcon sx={{ fontSize: 16, color: 'green' }} /> : <TrendingDownIcon sx={{ fontSize: 16, color: 'red' }} />}
                    <Typography variant="caption" color={agent.growth > 0 ? 'green' : 'red'}>
                      {Math.abs(agent.growth).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

