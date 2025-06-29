"use client";
import { Box, Typography, Card, CardContent, Grid, Button } from "@mui/material";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">User Management</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Search, view, ban, or soft-delete users.
              </Typography>
              <Button component={Link} href="/admin/users" variant="contained" sx={{ mt: 2 }}>
                Manage Users
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Content Moderation</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Review, edit, or remove posts and comments.
              </Typography>
              <Button component={Link} href="/admin/posts" variant="contained" sx={{ mt: 2 }}>
                Moderate Posts
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Analytics</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                View platform metrics and trends.
              </Typography>
              <Button component={Link} href="/admin/analytics" variant="contained" sx={{ mt: 2 }}>
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 