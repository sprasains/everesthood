"use client";
import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button, Container, Paper } from "@mui/material";
import AppLayoutShell from '@/components/layout/AppLayoutShell';

export default function ProfileSpotlightPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spotlight, setSpotlight] = useState<any[]>([]);

  useEffect(() => {
    // Placeholder for future API integration
    setTimeout(() => {
      // Simulate API call
      setSpotlight([]); // No spotlight yet
      setLoading(false);
    }, 1200);
  }, []);

  return (
    <AppLayoutShell>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Profile Spotlight
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Boost your profile visibility and get discovered by the community. Spotlight coming soon!
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : spotlight.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No spotlight features available yet.
              </Typography>
              <Button variant="contained" color="primary" disabled sx={{ mt: 2 }}>
                Coming Soon
              </Button>
            </Box>
          ) : (
            <Box>
              {/* Map over spotlight features when available */}
            </Box>
          )}
        </Paper>
      </Container>
    </AppLayoutShell>
  );
} 