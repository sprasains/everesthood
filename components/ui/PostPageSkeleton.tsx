import { Box, Card, CardContent, Skeleton, Avatar } from "@mui/material";

export default function PostPageSkeleton() {
  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Card sx={{ mb: 3 }}>
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
    </Box>
  );
}
