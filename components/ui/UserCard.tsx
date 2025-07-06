import { Card, CardContent, Avatar, Typography, Button, Box } from "@mui/material";

export interface UserCardProps {
  id: string;
  name: string;
  image?: string;
  bio?: string;
  isFollowing?: boolean;
  followersCount?: number;
  achievements?: string[];
}

export default function UserCard({ id, name, image, bio, isFollowing, followersCount, achievements }: UserCardProps) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, bgcolor: "rgba(255,255,255,0.07)", p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar src={image || `https://i.pravatar.cc/150?u=${id}`} sx={{ width: 56, height: 56 }} />
        <Box>
          <Typography fontWeight="bold" fontSize={18}>{name}</Typography>
          {bio && <Typography variant="body2" color="text.secondary">{bio}</Typography>}
          {followersCount !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {followersCount} follower{followersCount === 1 ? "" : "s"}
            </Typography>
          )}
        </Box>
      </Box>
      {achievements && achievements.length > 0 && (
        <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
          {achievements.map((ach, i) => (
            <Typography key={i} variant="caption" sx={{ bgcolor: "#e0f7fa", px: 1, borderRadius: 1 }}>
              {ach}
            </Typography>
          ))}
        </Box>
      )}
      <Button
        variant={isFollowing ? "contained" : "outlined"}
        color="primary"
        size="small"
        sx={{ mt: 2 }}
        disabled
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </Card>
  );
}
