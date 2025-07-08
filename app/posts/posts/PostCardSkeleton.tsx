import { Card, CardContent, Box, Skeleton, Avatar } from "@mui/material";

export default function PostCardSkeleton() {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Skeleton variant="circular">
            <Avatar />
          </Skeleton>
          <Box>
            <Skeleton variant="text" width={120} height={28} />
            <Skeleton variant="text" width={80} height={18} />
          </Box>
        </Box>
        <Skeleton variant="text" width="80%" height={32} />
        <Skeleton variant="rectangular" width="100%" height={80} sx={{ my: 2 }} />
        <Skeleton variant="text" width="60%" height={24} />
      </CardContent>
    </Card>
  );
}
