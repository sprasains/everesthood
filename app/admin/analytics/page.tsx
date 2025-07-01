"use client";
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

function fetchMetrics() {
  return fetch("/api/v1/admin/metrics").then((res) => res.json());
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-metrics"], queryFn: fetchMetrics });
  const metrics = data || {};

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Platform Analytics
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">New Users Today</Typography>
                <Typography variant="h4">{metrics.newUsersToday ?? "-"}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Posts Today</Typography>
                <Typography variant="h4">{metrics.postsToday ?? "-"}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Users</Typography>
                <Typography variant="h4">{metrics.totalUsers ?? "-"}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Posts</Typography>
                <Typography variant="h4">{metrics.totalPosts ?? "-"}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
} 