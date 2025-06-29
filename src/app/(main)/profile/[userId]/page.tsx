"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Container, Paper, Avatar, Typography, Box, Button, Divider } from "@mui/material";
import PostCard from "@/components/ui/PostCard";
import AddReactionIcon from '@mui/icons-material/AddReaction';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ProfileHeaderSkeleton from "@/components/ui/ProfileHeaderSkeleton";
import PostCardSkeleton from "@/components/ui/PostCardSkeleton";
import Grid from '@mui/material/Grid';

const fetchUserProfile = async (userId: string) => {
  const res = await fetch(`/api/v1/users/${userId}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
};

const fetchUserPosts = async (userId: string) => {
  const res = await fetch(`/api/v1/posts?authorId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user's posts");
  return res.json();
};

const fetchUserAchievements = async (userId: string) => {
  const res = await fetch(`/api/v1/users/${userId}/achievements`);
  if (!res.ok) throw new Error("Failed to fetch achievements");
  return res.json();
};

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.userId as string | undefined;

  const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => userId ? fetchUserProfile(userId) : Promise.resolve(undefined),
    enabled: !!userId,
  });

  const { data: postsData, isLoading: arePostsLoading } = useQuery({
    queryKey: ["userPosts", userId],
    queryFn: () => userId ? fetchUserPosts(userId) : Promise.resolve(undefined),
    enabled: !!userId,
  });

  const { data: achievementsData, isLoading: areAchievementsLoading } = useQuery({
    queryKey: ["userAchievements", userId],
    queryFn: () => userId ? fetchUserAchievements(userId) : Promise.resolve(undefined),
    enabled: !!userId,
  });

  if (isUserLoading) {
    return <ProfileHeaderSkeleton />;
  }

  if (userError) {
    return <Typography color="error" textAlign="center" p={5}>Could not load profile. Please try again later.</Typography>;
  }

  return (
    <Box>
      <Paper 
        elevation={2} 
        sx={{ 
          height: '300px', 
          backgroundImage: `url(${user.coverPicture || '/default-cover.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 0,
        }} 
      />
      <Container maxWidth="md" sx={{ mt: -10 }}>
        <Paper elevation={4} sx={{ p: 3, borderRadius: 4 }}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" gap={3}>
              <Avatar
                src={user.image || undefined}
                alt={user.name}
                sx={{ width: 160, height: 160, border: '4px solid white' }}
              />
              <Box flexGrow={1}>
                <Typography variant="h4" fontWeight="bold">{user.name}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>{user.bio}</Typography>
                <Divider sx={{ my: 2 }}/>
                <Box display="flex" gap={3}>
                    <Typography><strong>{user.postCount}</strong> Posts</Typography>
                    <Typography><strong>{user.friendCount}</strong> Friends</Typography>
                </Box>
              </Box>
              <Box>
                {/* Friendship button logic would go here */}
                {user.friendshipStatus === 'NONE' && <Button variant="contained" startIcon={<AddReactionIcon />}>Add Friend</Button>}
                {user.friendshipStatus === 'PENDING' && <Button variant="outlined" disabled>Request Sent</Button>}
                {user.friendshipStatus === 'ACCEPTED' && <Button variant="outlined" startIcon={<PersonRemoveIcon />}>Remove Friend</Button>}
              </Box>
            </Box>
        </Paper>

        <Typography variant="h5" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            Posts by {user.name}
        </Typography>

        {arePostsLoading ? (
            <Box>
              {Array.from(new Array(3)).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </Box>
        ) : postsData && postsData.posts.length > 0 ? (
            <Grid container spacing={2}>
              {postsData.posts.map((post: any) => (
                <Grid key={post.id} sx={{ width: '100%' }}>
                  <PostCard post={post} />
                </Grid>
              ))}
            </Grid>
        ) : (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {user.isCurrentUser
                  ? "You haven't posted anything yet."
                  : `${user.name || 'This user'} hasn't posted anything yet.`}
              </Typography>
              {user.isCurrentUser && (
                <Button href="/posts/create" variant="contained" sx={{ mt: 2 }}>Create Your First Post</Button>
              )}
            </Box>
        )}

        {/* Achievements Section */}
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
              Achievements
          </Typography>
          {areAchievementsLoading ? (
              <Box>
                {Array.from(new Array(3)).map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </Box>
          ) : achievementsData && achievementsData.achievements.length > 0 ? (
              <Grid container spacing={2}>
                  {achievementsData.achievements.map((ach: any) => (
                      <Grid key={ach.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' } }}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="h4">{ach.icon}</Typography>
                              <Typography fontWeight="bold">{ach.name}</Typography>
                              <Typography variant="body2" color="text.secondary">{ach.description}</Typography>
                          </Paper>
                      </Grid>
                  ))}
              </Grid>
          ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {user.isCurrentUser
                    ? "You haven't earned any achievements yet."
                    : `${user.name || 'This user'} has not earned any achievements yet.`}
                </Typography>
                <Typography variant="body2">Keep engaging to unlock achievements!</Typography>
              </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
