"use client";
export const dynamic = "force-dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container, Typography, Box, Paper, Avatar, Button, CircularProgress, Tabs, Tab } from "@mui/material";
import Link from 'next/link';
import { useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const fetchFriendsData = async () => {
  const res = await fetch('/api/v1/friends');
  if (!res.ok) throw new Error("Could not load friends");
  return res.json();
};

const handleFriendRequest = async ({ userId, action }: { userId: string, action: 'accept' | 'decline' }) => {
    const res = await fetch(`/api/v1/friends/requests/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
    });
    if (!res.ok) throw new Error('Action failed');
    return res.json();
};

export default function FriendsPage() {
    const queryClient = useQueryClient();
    // Remove tab state and pending requests logic
    const { data: friends = [], isLoading, error } = useQuery({
        queryKey: ['friends'],
        queryFn: fetchFriendsData
    });

    if (isLoading) return <CircularProgress />;
    if (error) return <Typography color="error">Could not load your friends.</Typography>

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Your Friends</Typography>
            {/* Responsive flexbox grid for friends */}
            <Box display="flex" flexWrap="wrap" gap={3}>
                {friends.length > 0 ? friends.map((friend: any) => (
                    <Box key={friend.id} flexBasis={{ xs: '100%', sm: '48%', md: '31%' }} flexGrow={1} minWidth={280} maxWidth={{ xs: '100%', sm: '48%', md: '31%' }}>
                        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={friend.profilePicture} />
                            <Typography fontWeight="bold" component={Link} href={`/profile/${friend.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>{friend.name}</Typography>
                        </Paper>
                    </Box>
                )) : <Typography sx={{ mt: 3, width: '100%', textAlign: 'center' }}>You have no friends yet.</Typography>}
            </Box>
        </Container>
    );
}
