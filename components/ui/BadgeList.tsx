import React from "react";
import { Box, Tooltip, Avatar, Typography, Stack } from "@mui/material";

export type Badge = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  earnedAt: string;
};

export function BadgeList({ badges }: { badges: Badge[] }) {
  if (!badges || badges.length === 0) return null;
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Badges
      </Typography>
      <Stack direction="row" spacing={2}>
        {badges.map((badge) => (
          <Tooltip
            key={badge.id}
            title={
              <Box>
                <Typography variant="subtitle2">{badge.name}</Typography>
                <Typography variant="body2">{badge.description}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                </Typography>
              </Box>
            }
            arrow
          >
            <Avatar
              src={badge.imageUrl}
              alt={badge.name}
              sx={{ width: 48, height: 48, border: "2px solid #FFD700", boxShadow: 2, cursor: "pointer" }}
            />
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );
} 