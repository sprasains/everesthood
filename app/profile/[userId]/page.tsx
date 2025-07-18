"use client";
export const dynamic = "force-dynamic";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Container, Paper, Avatar, Typography, Box, Button, Divider, CircularProgress } from "@mui/material";
import PostCard from "app/components/posts/PostCard";
import AddReactionIcon from '@mui/icons-material/AddReaction';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ProfileHeaderSkeleton from "app/components/ui/ProfileHeaderSkeleton";
import PostCardSkeleton from "app/components/posts/PostCardSkeleton";
import BadgeList from './BadgeList';
import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.userId as string | undefined;
  const [badges, setBadges] = useState<any[]>([]);

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

  const { data: achievements = [], isLoading: areAchievementsLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const res = await fetch("/api/v1/achievements");
      if (!res.ok) throw new Error("Failed to fetch achievements");
      return res.json();
    },
  });

  // Fetch friends for the current user
  const { data: friends = [], isLoading: areFriendsLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await fetch("/api/v1/friends");
      if (!res.ok) throw new Error("Failed to fetch friends");
      return res.json();
    },
  });

  useEffect(() => {
    if (!params || !params.userId) return;
    fetch(`/api/v1/users/${params.userId}/badges`).then(res => res.json()).then(data => setBadges(data.badges || []));
  }, [params]);

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

        <BadgeList />

        {/* Friends Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Friends
          </Typography>
          {areFriendsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>
          ) : friends.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={2}>
              {friends.slice(0, 6).map((friend: any) => (
                <Box key={friend.id} display="flex" alignItems="center" gap={1}>
                  <Avatar src={friend.profilePicture} sx={{ width: 40, height: 40 }} />
                  <Typography component={Link} href={`/profile/${friend.id}`} sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>{friend.name}</Typography>
                </Box>
              ))}
              {friends.length > 6 && (
                <Button href="/friends" variant="outlined" sx={{ ml: 2 }}>See all friends</Button>
              )}
            </Box>
          ) : (
            <Typography color="text.secondary">No friends yet.</Typography>
          )}
        </Box>

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
            // Responsive flexbox grid for posts
            <Box display="flex" flexWrap="wrap" gap={2}>
              {postsData.posts.map((post: any) => (
                <Box key={post.id} flexBasis={{ xs: '100%', sm: '48%', md: '31%' }} flexGrow={1} minWidth={280} maxWidth={{ xs: '100%', sm: '48%', md: '31%' }}>
                  <PostCard post={post} />
                </Box>
              ))}
            </Box>
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
          ) : achievements.length > 0 ? (
              // Responsive flexbox grid for achievements
              <Box display="flex" flexWrap="wrap" gap={2}>
                  {achievements.map((ach: any) => (
                      <Box key={ach.id} flexBasis={{ xs: '100%', sm: '48%', md: '31%' }} flexGrow={1} minWidth={280} maxWidth={{ xs: '100%', sm: '48%', md: '31%' }}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="h4">{ach.icon}</Typography>
                              <Typography fontWeight="bold">{ach.name}</Typography>
                              <Typography variant="body2" color="text.secondary">{ach.description}</Typography>
                              {ach.earned && (
                                <Typography variant="caption" color="success.main">Earned</Typography>
                              )}
                          </Paper>
                      </Box>
                  ))}
              </Box>
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
