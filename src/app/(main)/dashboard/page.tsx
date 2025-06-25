"use client";

import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { useStreak } from "@/hooks/useStreak";
import PersonaSelector from "@/components/ui/PersonaSelector";
import SocialFeed from "@/components/ui/SocialFeed";
import GenZContentPanel from "@/components/ui/GenZContentPanel";
import AchievementCard from "@/components/ui/AchievementCard";
import Navbar from "@/components/layout/Navbar";
import UserStatusPanel from "./UserStatusPanel";
import { useState, useEffect } from "react";
import { Box, Container, Typography, Card, CardContent, Chip, Stack, Grid, CircularProgress, Button } from "@mui/material";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import StyleIcon from "@mui/icons-material/Style";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import DevicesIcon from "@mui/icons-material/Devices";
import GroupIcon from "@mui/icons-material/Group";
import NewsCard from "@/components/ui/NewsCard";

export default function DashboardPage() {
  const { user, loading } = useUser();
  const { incrementProgress } = useStreak();
  const [achievements, setAchievements] = useState([]);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    if (user) fetchAchievements();
  }, [user]);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoadingRecs(true);
      const res = await fetch('/api/v1/recommendations');
      if (res.ok) {
        setRecommendations(await res.json());
      }
      setLoadingRecs(false);
    };
    fetchRecs();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch("/api/v1/achievements");
      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  if (loading) {
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

  const displayName = user?.name || user?.email?.split("@")[0] || "AI Explorer";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        color: "white",
        overflowX: "hidden",
      }}
    >
      <Navbar />
      <GenZContentPanel />

      {/* --- Top Section: Hero and Trending --- */}
      <Container maxWidth="xl" sx={{ pt: { xs: 6, md: 8 }, pb: 2 }}>
        <Grid container spacing={3} alignItems="flex-start">
          {/* Trending/Filters Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <Card
                sx={{
                  background: "rgba(255,255,255,0.09)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 4,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                  px: { xs: 2, md: 3 },
                  py: { xs: 2, md: 3 },
                  mb: { xs: 2, md: 0 },
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    mb: 1,
                    background: "linear-gradient(90deg, #ff4e53, #ffcc00)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  🌟 Gen-Z Vibes
                </Typography>
                <Typography variant="body1" sx={{ color: "#bdbdbd", mb: 2 }}>
                  Trending culture & lifestyle
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    icon={<WhatshotIcon />}
                    label="All"
                    color="warning"
                    variant="filled"
                    sx={{ fontWeight: "bold" }}
                  />
                  <Chip
                    icon={<StyleIcon />}
                    label="Fashion"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: "bold" }}
                  />
                  <Chip
                    icon={<EmojiObjectsIcon />}
                    label="Culture"
                    color="secondary"
                    variant="outlined"
                    sx={{ fontWeight: "bold" }}
                  />
                  <Chip
                    icon={<DevicesIcon />}
                    label="Tech"
                    color="info"
                    variant="outlined"
                    sx={{ fontWeight: "bold" }}
                  />
                  <Chip
                    icon={<GroupIcon />}
                    label="Social"
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: "bold" }}
                  />
                </Stack>
              </Card>
            </motion.div>
          </Grid>
          {/* Hero Card */}
          <Grid size={{ xs: 12, md: 8 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <Card
                sx={{
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 4,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                  px: { xs: 3, md: 6 },
                  py: { xs: 4, md: 6 },
                  mb: 2,
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      fontSize: { xs: "2rem", md: "2.8rem" },
                      background: "linear-gradient(90deg, #ff4e53, #ffcc00)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Welcome back, {displayName}!{" "}
                    <span role="img" aria-label="wave">
                      👋
                    </span>
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#e0e0e0",
                      fontWeight: 400,
                      fontSize: { xs: "1rem", md: "1.2rem" },
                    }}
                  >
                    Ready to dive into the latest AI trends and level up your
                    knowledge?
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* --- Main Content Section --- */}
      <Container
        maxWidth="xl"
        sx={{
          pt: { xs: 2, md: 4 },
          px: { xs: 2, sm: 4, md: 6 },
          pb: 6,
        }}
      >
        {/* For You Feed Section */}
        <Box mt={6}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mb: 3 }}>
            For You
          </Typography>
          {loadingRecs ? <CircularProgress /> : (
            <Grid container spacing={3}>
              {recommendations.map(article => (
                <Grid item xs={12} md={6} lg={4} key={article.id}>
                  <NewsCard article={article} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        <Grid container spacing={{ xs: 3, md: 6 }}>
          {/* Left Column - Main Content */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 3, md: 6 },
              }}
            >
              {/* User Status Panel */}
              {user && <UserStatusPanel user={user} />}
              {/* Achievements Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              >
                <Card
                  sx={{
                    background:
                      "linear-gradient(120deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "white",
                    borderRadius: 3,
                    p: { xs: 3, sm: 4, md: 6 },
                    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                    mb: 4,
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        fontSize: {
                          xs: "1.2rem",
                          sm: "1.4rem",
                          md: "1.6rem",
                        },
                        color: "#fff",
                        mb: { xs: 2, sm: 3, md: 4 },
                      }}
                    >
                      🏆 Achievements
                    </Typography>
                    <Grid container spacing={2}>
                      {achievements.length === 0 && (
                        <Grid size={12}>
                          <Typography color="#bdbdbd">
                            No achievements yet.
                          </Typography>
                        </Grid>
                      )}
                      {achievements.map((a: any) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={a.id}>
                          <AchievementCard
                            achievement={a}
                            earned={a.earned}
                            progress={a.progress}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>

              {
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
                >
                  <Card
                    sx={{
                      background:
                        "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                      backdropFilter: "blur(15px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white",
                      borderRadius: 3,
                      p: { xs: 3, sm: 4, md: 6 },
                      boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                        sx={{
                          fontSize: {
                            xs: "1.2rem",
                            sm: "1.4rem",
                            md: "1.6rem",
                          },
                          color: "#fff",
                          mb: { xs: 2, sm: 3, md: 4 },
                        }}
                      >
                        🚀 Quick Actions
                      </Typography>
                      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                        <Grid size={{ xs: 6, sm: 6 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => (window.location.href = "/news")}
                            sx={{
                              background:
                                "linear-gradient(to right, #6a11cb, #2575fc)",
                              p: { xs: 2, sm: 3, md: 4 },
                              borderRadius: 2,
                              color: "white",
                              fontWeight: "medium",
                              fontSize: {
                                xs: "0.75rem",
                                sm: "0.8rem",
                                md: "0.9rem",
                              },
                              textTransform: "none",
                              boxShadow: "0 4px 8px rgba(106, 17, 203, 0.3)",
                              transition: "transform 0.2s, box-shadow 0.2s",
                              height: "100%",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 6px 12px rgba(106, 17, 203, 0.5)",
                              },
                            }}
                          >
                            📰 Read Latest News
                          </Button>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 6 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => setShowPersonaSelector(true)}
                            sx={{
                              background:
                                "linear-gradient(to right, #2575fc, #6a11cb)",
                              p: { xs: 2, sm: 3, md: 4 },
                              borderRadius: 2,
                              color: "white",
                              fontWeight: "medium",
                              fontSize: {
                                xs: "0.75rem",
                                sm: "0.8rem",
                                md: "0.9rem",
                              },
                              textTransform: "none",
                              boxShadow: "0 4px 8px rgba(37, 117, 252, 0.3)",
                              transition: "transform 0.2s, box-shadow 0.2s",
                              height: "100%",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 6px 12px rgba(37, 117, 252, 0.5)",
                              },
                            }}
                          >
                            🤖 Switch AI Persona
                          </Button>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 6 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() =>
                              (window.location.href = "/community")
                            }
                            sx={{
                              background:
                                "linear-gradient(to right, #34A853, #2575fc)",
                              p: { xs: 2, sm: 3, md: 4 },
                              borderRadius: 2,
                              color: "white",
                              fontWeight: "medium",
                              fontSize: {
                                xs: "0.75rem",
                                sm: "0.8rem",
                                md: "0.9rem",
                              },
                              textTransform: "none",
                              boxShadow: "0 4px 8px rgba(52, 168, 83, 0.3)",
                              transition: "transform 0.2s, box-shadow 0.2s",
                              height: "100%",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 6px 12px rgba(52, 168, 83, 0.5)",
                              },
                            }}
                          >
                            👥 Join Community
                          </Button>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 6 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => incrementProgress()}
                            sx={{
                              background:
                                "linear-gradient(to right, #FBBC05, #EA4335)",
                              p: { xs: 2, sm: 3, md: 4 },
                              borderRadius: 2,
                              color: "white",
                              fontWeight: "medium",
                              fontSize: {
                                xs: "0.75rem",
                                sm: "0.8rem",
                                md: "0.9rem",
                              },
                              textTransform: "none",
                              boxShadow: "0 4px 8px rgba(251, 188, 5, 0.3)",
                              transition: "transform 0.2s, box-shadow 0.2s",
                              height: "100%",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 6px 12px rgba(251, 188, 5, 0.5)",
                              },
                            }}
                          >
                            ⚡ Daily Challenge
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              }
              {/* Place your previously working bottom section code here */}
              <Card
                sx={{
                  background:
                    "linear-gradient(120deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))",
                  backdropFilter: "blur(16px)",
                  border: "1.5px solid rgba(255,255,255,0.13)",
                  color: "white",
                  borderRadius: 4,
                  p: { xs: 3, sm: 4, md: 6 },
                  boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                  mt: 2,
                  transition: "box-shadow 0.3s, border 0.3s",
                  "&:hover": {
                    boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
                    border: "2px solid #ff4e53",
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 0.5, sm: 1, md: 2 } }}>
                  {/* Demo: Threaded Comments for the user's first post (or demo post) */}
                  {user?.id && (
                    <Box
                      sx={{
                        px: { xs: 0, sm: 1, md: 2 },
                        py: { xs: 1, sm: 2 },
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.03)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    >
                      <ThreadedComments
                        postId={user.id + "-dashboard-demo"}
                        currentUserId={user.id}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Grid>
          {/* Right Column - Social Feed */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 3, md: 6 },
              }}
            >
              <SocialFeed />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Persona Selector Modal */}
      {showPersonaSelector && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            p: { xs: 2, sm: 4 },
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
              backdropFilter: "blur(15px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 12,
              padding: 32,
              maxWidth: 600,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              color: "white",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={4}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  fontSize: { xs: "1.2rem", sm: "1.4rem" },
                  color: "#fff",
                }}
              >
                Choose Your AI Mentor
              </Typography>
              <Button
                onClick={() => setShowPersonaSelector(false)}
                sx={{
                  color: "#d0d0d0",
                  "&:hover": {
                    color: "#ff4e53",
                  },
                  minWidth: "auto",
                  p: 0,
                }}
              >
                ✕
              </Button>
            </Box>
            <PersonaSelector
              onPersonaChange={() => setShowPersonaSelector(false)}
            />
          </motion.div>
        </Box>
      )}
    </Box>
  );
}
