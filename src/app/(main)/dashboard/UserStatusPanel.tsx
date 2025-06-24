"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Grid,
} from "@mui/material";

interface UserStatusPanelProps {
  user: {
    name?: string;
    email?: string;
    persona?: string;
    level?: number;
    xp?: number;
    streak?: number;
    articlesRead?: number;
    summariesUsed?: number;
  };
}

export default function UserStatusPanel({ user }: UserStatusPanelProps) {
  const displayName = user?.name || user?.email?.split("@")[0] || "AI Explorer";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
      style={{ width: "100%" }}
    >
      <Card
        sx={{
          background: "rgba(255,255,255,0.09)",
          backdropFilter: "blur(10px)",
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          p: { xs: 2, sm: 3, md: 4 },
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 0, textAlign: "center" }}>
          <Avatar
            sx={{
              width: { xs: 70, sm: 90 },
              height: { xs: 70, sm: 90 },
              mx: "auto",
              mb: 2,
              fontSize: { xs: "2.2rem", sm: "2.8rem" },
              bgcolor: "rgba(255,255,255,0.13)",
            }}
          >
            {user?.persona === "ZenGPT"
              ? "🧘‍♀️"
              : user?.persona === "HustleBot"
              ? "🔥"
              : user?.persona === "DataDaddy"
              ? "📊"
              : "👤"}
          </Avatar>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              background: "linear-gradient(45deg, #ff4e53, #ffcc00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "1.1rem", sm: "1.3rem" },
              mb: 0.5,
            }}
          >
            {displayName}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.8)",
              mb: 2,
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
            }}
          >
            Level {user?.level || 1} • {user?.persona || "ZenGPT"}
          </Typography>
          <Grid container spacing={2} justifyContent="center" sx={{ mb: 1 }}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="h6" fontWeight="bold">
                {user?.xp || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: "#e0e0e0" }}>
                XP
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="h6" fontWeight="bold">
                {user?.streak || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: "#e0e0e0" }}>
                Streak
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="h6" fontWeight="bold">
                {user?.articlesRead || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: "#e0e0e0" }}>
                Articles
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="h6" fontWeight="bold">
                {user?.summariesUsed || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: "#e0e0e0" }}>
                Summaries
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
}
