"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container, Typography, Box, Paper, Avatar, Button, CircularProgress, Tabs, Tab } from "@mui/material";
import Link from 'next/link';
import { useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Grid from '@mui/material/Grid';

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
    const [tab, setTab] = useState(0);
    const { data, isLoading, error } = useQuery({
        queryKey: ['friends'],
        queryFn: fetchFriendsData
    });

    const mutation = useMutation({
        mutationFn: handleFriendRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        }
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };
    
    if (isLoading) return <CircularProgress />;
    if (error) return <Typography color="error">Could not load your friends.</Typography>

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Your Network</Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tab} onChange={handleTabChange}>
                    <Tab label={`All Friends (${data.friends.length})`} />
                    <Tab label={`Pending Requests (${data.pendingReceived.length})`} />
                </Tabs>
            </Box>
            {tab === 0 && (
                 <Grid container spacing={3}>
                    {data.friends.map((friend: any) => (
                        <Grid key={friend.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' } }}>
                            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar src={friend.profilePicture} />
                                <Typography fontWeight="bold" component={Link} href={`/profile/${friend.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>{friend.name}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                 </Grid>
            )}
            {tab === 1 && (
                <Grid container columns={12} spacing={2} sx={{ mt: 2 }}>
                    {data.pendingReceived.length > 0 ? data.pendingReceived.map((req: any) => (
                        <Grid key={req.requester.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' } }}>
                            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}>
                                    <Avatar src={req.requester.image || undefined} />
                                    <Typography fontWeight="bold">{req.requester.name}</Typography>
                                </Box>
                                <Box>
                                    <Button size="small" color="success" onClick={() => mutation.mutate({ userId: req.requester.id, action: 'accept' })}>
                                        <CheckCircleIcon />
                                    </Button>
                                    <Button size="small" color="error" onClick={() => mutation.mutate({ userId: req.requester.id, action: 'decline' })}>
                                        <CancelIcon />
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    )) : <Typography sx={{ mt: 3, width: '100%', textAlign: 'center' }}>No new friend requests.</Typography>}
                </Grid>
            )}
        </Container>
    );
}
