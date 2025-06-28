"use client";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from '@mui/material/Grid';
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import AchievementCard from "@/components/ui/AchievementCard";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

const fetchAchievements = async () => {
  const res = await fetch("/api/v1/achievements");
  if (!res.ok) throw new Error("Failed to fetch achievements");
  return res.json();
};

export default function AchievementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: fetchAchievements,
  });
  const achievements = data?.achievements || [];
  const userAchievements = data?.userAchievements || [];

  return (
    <Container sx={{ pt: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Achievements
        </Typography>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, mt: 4 }}>
            <Grid container spacing={3}>
              {achievements.map((achievement: any) => (
                <Grid key={achievement.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' } }}>
                  <AchievementCard
                    achievement={achievement}
                    earned={userAchievements.includes(achievement.id)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </motion.div>
    </Container>
  );
}
