import { Card, CardContent, Box, Skeleton, Avatar } from "@mui/material";

export default function ProfileHeaderSkeleton() {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Skeleton variant="circular" width={120} height={120}>
            <Avatar sx={{ width: 120, height: 120 }} />
          </Skeleton>
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width={180} height={36} />
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="text" width={100} height={20} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
