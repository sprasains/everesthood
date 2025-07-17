"use client";
import { useUser } from '@/hooks/useUser';
import Navbar from '@/components/layout/Navbar';
import AppSidebar from '@/components/layout/AppSidebar';
import { Box, Typography } from '@mui/material';

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  if (!user) {
    // Not logged in: show a beautiful background and center the content
    return (
      <Box
        minHeight="100vh"
        width="100vw"
        sx={{
          background: "linear-gradient(135deg, #0f2027 0%, #8b5cf6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated background shapes */}
        <Box sx={{
          position: "absolute",
          top: -120,
          left: -120,
          width: 400,
          height: 400,
          background: "radial-gradient(circle at 60% 40%, #ff4e53 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.7,
          zIndex: 0,
        }} />
        <Box sx={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 350,
          height: 350,
          background: "radial-gradient(circle at 40% 60%, #ffcc00 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.6,
          zIndex: 0,
        }} />
        <Box sx={{ zIndex: 2, width: "100%", maxWidth: { xs: '98vw', md: '60vw' }, mx: "auto", p: { xs: 2, md: 0 } }}>
          {children}
        </Box>
      </Box>
    );
  }

  // Logged in: show dashboard layout with Navbar and AppSidebar
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f2027' }}>
      <AppSidebar />
      <Box component="main" sx={{ flexGrow: 1, width: '100%', ml: { md: '250px' } }}>
        <Navbar />
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
} 