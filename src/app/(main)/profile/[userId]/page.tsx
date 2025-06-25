"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Box, Container, Typography, CircularProgress, Paper, Avatar, Stack, Divider } from "@mui/material";
import PostCard from "@/components/ui/PostCard"; // Assumes PostCard component exists

export default function UserProfilePage() {
    const params = useParams();
    const userId = params.userId as string;
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            const fetchProfile = async () => {
                setLoading(true);
                const res = await fetch(`/api/v1/users/${userId}/profile`);
                if (res.ok) {
                    setProfileData(await res.json());
                }
                setLoading(false);
            };
            fetchProfile();
        }
    }, [userId]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress /></Box>;
    if (!profileData) return <Typography>User not found.</Typography>;

    const { user, posts, friendCount } = profileData;

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
            <Navbar />
            <Container maxWidth="md" sx={{ pt: 12, pb: 6 }}>
                <Paper sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                    <Stack direction="row" spacing={4} alignItems="center">
                        <Avatar src={user.image} sx={{ width: 100, height: 100 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">{user.name}</Typography>
                            <Stack direction="row" spacing={3} sx={{ mt: 1 }} divider={<Divider orientation="vertical" flexItem />}>
                                <Box textAlign="center">
                                    <Typography fontWeight="bold">{posts.length}</Typography>
                                    <Typography variant="caption" color="text.secondary">Posts</Typography>
                                </Box>
                                <Box textAlign="center">
                                    <Typography fontWeight="bold">{friendCount}</Typography>
                                    <Typography variant="caption" color="text.secondary">Friends</Typography>
                                </Box>
                                <Box textAlign="center">
                                    <Typography fontWeight="bold">Level {user.level}</Typography>
                                    <Typography variant="caption" color="text.secondary">{user.xp} XP</Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>

                <Box mt={4}>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Feed</Typography>
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
