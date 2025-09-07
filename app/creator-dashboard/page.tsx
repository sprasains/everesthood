"use client";

import { Box, Container, Typography, Paper, Grid, Card, CardContent, CardHeader, Avatar, Chip, Button, LinearProgress, Alert, AlertTitle } from "@mui/material";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import CreatorDashboard from "@/components/creator/CreatorDashboard";
import { useRouter } from "next/navigation";

export default function CreatorDashboardPage() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // Check if user has creator access
    if (user?.subscriptionTier !== "CREATOR" && user?.role !== "SUPER_ADMIN") {
      router.push("/subscribe?tier=creator");
      return;
    }

    setIsLoading(false);
  }, [session, status, user, router]);

  if (status === "loading" || isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading Creator Dashboard...
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  if (user?.subscriptionTier !== "CREATOR" && user?.role !== "SUPER_ADMIN") {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert severity="warning" sx={{ mb: 4 }}>
            <AlertTitle>Creator Access Required</AlertTitle>
            You need a Creator subscription to access the Creator Dashboard. Upgrade now to unlock powerful creator tools and analytics.
          </Alert>
        </motion.div>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      pt: 8, // Account for navbar
    }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              sx={{ 
                color: 'white', 
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Creator Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Manage your content, track performance, and grow your creator presence
            </Typography>
          </Box>

          {/* Creator Dashboard Component */}
          <CreatorDashboard />
        </motion.div>
      </Container>
    </Box>
  );
}
