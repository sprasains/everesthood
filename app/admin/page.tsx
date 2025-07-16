"use client";
export const dynamic = "force-dynamic";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>
        Admin Dashboard
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={3}>
        <Box flex="1 1 300px" minWidth={280} maxWidth={400}>
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
        </Box>
        <Box flex="1 1 300px" minWidth={280} maxWidth={400}>
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
        </Box>
        <Box flex="1 1 300px" minWidth={280} maxWidth={400}>
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
        </Box>
      </Box>
    </Box>
  );
} 