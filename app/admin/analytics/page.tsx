"use client";
export const dynamic = "force-dynamic";
import { Box, Typography, Card, CardContent, CircularProgress } from "@mui/material";
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
        <Box display="flex" flexWrap="wrap" gap={3}>
          <Box flex="1 1 220px" minWidth={220} maxWidth={350}>
            <Card>
              <CardContent>
                <Typography variant="h6">New Users Today</Typography>
                <Typography variant="h4">{metrics.newUsersToday ?? "-"}</Typography>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1 1 220px" minWidth={220} maxWidth={350}>
            <Card>
              <CardContent>
                <Typography variant="h6">Posts Today</Typography>
                <Typography variant="h4">{metrics.postsToday ?? "-"}</Typography>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1 1 220px" minWidth={220} maxWidth={350}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Users</Typography>
                <Typography variant="h4">{metrics.totalUsers ?? "-"}</Typography>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1 1 220px" minWidth={220} maxWidth={350}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Posts</Typography>
                <Typography variant="h4">{metrics.totalPosts ?? "-"}</Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );
} 