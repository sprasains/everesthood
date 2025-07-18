"use client";
import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button, Container, Paper } from "@mui/material";
import AppLayoutShell from '@/components/layout/AppLayoutShell';

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    // Placeholder for future API integration
    setTimeout(() => {
      // Simulate API call
      setWallet(null); // No wallet data yet
      setLoading(false);
    }, 1200);
  }, []);

  return (
    <AppLayoutShell>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Tipping Credits Wallet
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Send and receive tips, manage your credits, and view your transaction history. Wallet features coming soon!
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : !wallet ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No wallet data available yet.
              </Typography>
              <Button variant="contained" color="primary" disabled sx={{ mt: 2 }}>
                Coming Soon
              </Button>
            </Box>
          ) : (
            <Box>
              {/* Map over wallet data when available */}
            </Box>
          )}
        </Paper>
      </Container>
    </AppLayoutShell>
  );
} 