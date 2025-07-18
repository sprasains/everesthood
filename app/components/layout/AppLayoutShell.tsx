"use client";
import { useUser } from '@/hooks/useUser';
import Navbar from '@/components/layout/Navbar';
import AppSidebar from '@/components/layout/AppSidebar';
import { Box, Container, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  if (!user) {
    // Not logged in: show a beautiful background and center the content
    return (
      <Box
        minHeight="100vh"
        width="100vw"
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated background shapes with improved colors */}
        <Box sx={{
          position: "absolute",
          top: -120,
          left: -120,
          width: 400,
          height: 400,
          background: "radial-gradient(circle at 60% 40%, #8b5cf6 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.4,
          zIndex: 0,
          animation: "float 6s ease-in-out infinite",
        }} />
        <Box sx={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 350,
          height: 350,
          background: "radial-gradient(circle at 40% 60%, #06b6d4 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.3,
          zIndex: 0,
          animation: "float 8s ease-in-out infinite reverse",
        }} />
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          height: 300,
          background: "radial-gradient(circle at center, #f59e0b 0%, transparent 70%)",
          filter: "blur(60px)",
          opacity: 0.2,
          zIndex: 0,
          animation: "pulse 4s ease-in-out infinite",
        }} />
        
        {/* Content container with improved styling */}
        <Container 
          maxWidth="lg" 
          sx={{ 
            zIndex: 2, 
            position: "relative",
            p: { xs: 3, md: 4 },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </Container>

        {/* Add CSS animations */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.1); }
          }
        `}</style>
      </Box>
    );
  }

  // Logged in: show dashboard layout with Navbar and AppSidebar
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        position: 'relative',
      }}
    >
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main content area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: '100%', 
          ml: { md: '250px' },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Top navbar */}
        <Navbar />
        
        {/* Content wrapper with improved spacing and responsive design */}
        <Box 
          sx={{ 
            flex: 1,
            pt: { xs: 2, md: 3 },
            pb: { xs: 3, md: 4 },
            px: { xs: 2, md: 4 },
            mt: { xs: '64px', md: '72px' }, // Account for navbar height
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Content container with max width for better readability */}
          <Container 
            maxWidth="xl" 
            disableGutters 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              {children}
            </motion.div>
          </Container>
        </Box>
      </Box>
    </Box>
  );
} 