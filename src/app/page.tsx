"use client";

import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Paper,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AutoAwesome, Lightbulb, TrendingUp } from "@mui/icons-material";
import AuthForm from "@/components/ui/AuthForm";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function HomePage() {
  const { data: session, status } = useSession();
  const [showSignUp, setShowSignUp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      console.log("User is logged in, but no automatic redirection.");
    }
  }, [session]);

  if (status === "loading") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
          backgroundAttachment: "fixed",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: 50,
            height: 50,
            border: "5px solid transparent",
            borderTop: "5px solid #ff4e53",
            borderRadius: "50%",
          }}
        />
      </Box>
    );
  }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 0,
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: '100vh',
          gap: { xs: 4, md: 6 },
          py: 8,
        }}
      >
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 6, md: 8 },
            px: { xs: 2, md: 4 },
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            maxWidth: 600,
            width: '100%',
            flexShrink: 0,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <Typography
              variant="h1"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: { xs: '2.8rem', md: '3.5rem' },
                background: 'linear-gradient(45deg, #ff4e53, #ffcc00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-1px',
                marginBottom: 2,
              }}
            >
              Welcome to Everhood
            </Typography>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontSize: { xs: '1.2rem', md: '1.8rem' },
                color: '#f0f0f0',
                fontWeight: 300,
                marginBottom: 3,
              }}
            >
              The AI Vibe Hub for Gen-Z
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 700,
                margin: '0 auto',
                color: '#d0d0d0',
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.7,
                padding: { xs: 1, md: 2 },
              }}
            >
              Discover the latest in AI, tech, and culture with personalized
              summaries, gamified learning, and a community that gets you.
            </Typography>
          </motion.div>
          <Box mt={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(45deg, #ff4e53, #ffcc00)',
                  padding: { xs: '14px 28px', md: '16px 32px' },
                  borderRadius: '50px',
                  fontWeight: 'bold',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  textTransform: 'none',
                  boxShadow: '0 10px 20px rgba(255, 78, 83, 0.5)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 14px 28px rgba(255, 78, 83, 0.7)',
                    background: 'linear-gradient(45deg, #ffcc00, #ff4e53)',
                  },
                }}
                onClick={() => {
                  const signUpBox = document.getElementById('signup-box');
                  if (signUpBox) signUpBox.scrollIntoView({ behavior: 'smooth' });
                }}
                startIcon={<AutoAwesome />}
              >
                Get Started Free ✨
              </Button>
            </motion.div>
          </Box>
        </Box>
        {/* Auth Form Toggleable */}
        <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
          {showSignUp ? (
            <Paper id="signup-box" elevation={16} sx={{ p: 4, borderRadius: 4, background: 'rgba(255,255,255,0.05)' }}>
              <Typography variant="h4" fontWeight="bold" mb={2} align="center">
                Create an Account
              </Typography>
              <AuthForm isSignUp />
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                Already have an account?{' '}
                <Button variant="text" onClick={() => setShowSignUp(false)} sx={{ textTransform: 'none' }}>
                  Sign In
                </Button>
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={16} sx={{ p: 4, borderRadius: 4, background: 'rgba(255,255,255,0.05)' }}>
              <Typography variant="h4" fontWeight="bold" mb={2} align="center">
                Sign In
              </Typography>
              <AuthForm />
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                Don&apos;t have an account?{' '}
                <Button variant="text" onClick={() => setShowSignUp(true)} sx={{ textTransform: 'none' }}>
                  Create an Account
                </Button>
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          px: { xs: 2, md: 4 },
          py: { xs: 6, md: 10 },
        }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          gutterBottom
          sx={{
            fontSize: { xs: "1.8rem", md: "2.5rem" },
            background: "linear-gradient(45deg, #ffcc00, #ff4e53)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 6,
            fontWeight: "bold",
          }}
        >
          Why Everesthood?
        </Typography>
        <Stack spacing={2}>
          {[
            {
              title: "AI-Powered Summaries",
              description:
                "Get personalized AI summaries tailored to your preferences, helping you stay informed and ahead of the curve.",
              icon: <Lightbulb sx={{ fontSize: 50, color: "#ffcc00" }} />,
            },
            {
              title: "Gamified Learning",
              description:
                "Level up your learning experience with gamification, earn rewards, and maintain streaks to keep your progress exciting.",
              icon: <AutoAwesome sx={{ fontSize: 50, color: "#ff4e53" }} />,
            },
            {
              title: "Gen-Z Content Curation",
              description:
                "Stay updated with curated content from top Gen-Z sources, bringing you the latest trends and insights.",
              icon: <TrendingUp sx={{ fontSize: 50, color: "#ff8e53" }} />,
            },
          ].map((feature, index) => (
            <Box key={index}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.2,
                  duration: 0.9,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    background:
                      "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                    backdropFilter: "blur(15px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "white",
                    borderRadius: 4,
                    padding: 4,
                    textAlign: "center",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: "0 16px 40px rgba(255, 78, 83, 0.3)",
                      border: "1px solid rgba(255, 78, 83, 0.3)",
                    },
                  }}
                >
                  <CardContent sx={{ padding: 0 }}>
                    <Box mb={3}>{feature.icon}</Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        fontSize: { xs: "1.2rem", md: "1.4rem" },
                        color: "#fff",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#e0e0e0",
                        lineHeight: 1.7,
                        fontSize: { xs: "0.9rem", md: "1rem" },
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          ))}
        </Stack>
      </Box>
    </Container>
  );
}
