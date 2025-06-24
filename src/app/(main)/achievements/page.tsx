"use client";
import Navbar from "@/components/layout/Navbar";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import AchievementCard from "@/components/ui/AchievementCard";
import { useEffect, useState } from "react";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<
    import("@/types").Achievement[]
  >([]);
  const [userAchievements, setUserAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/achievements");
        if (res.ok) {
          const data = await res.json();
          setAchievements(data.achievements);
          setUserAchievements(data.userAchievements);
        }
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  return (
    <>
      <Navbar />
      <Container sx={{ pt: 10 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Achievements
        </Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, mt: 4 }}>
            <Grid container spacing={3}>
              {achievements.map((ach) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={ach.id}>
                  <AchievementCard
                    achievement={ach}
                    earned={userAchievements.includes(ach.id)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </>
  );
}
