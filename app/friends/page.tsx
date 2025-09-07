"use client";

import { Box, Container, Typography, Paper, Card, CardContent, CardHeader, Avatar, Chip, Button, LinearProgress, Alert, AlertTitle, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Message as MessageIcon,
  MoreVert as MoreVertIcon,
  Pending as PendingIcon
} from "@mui/icons-material";

interface Friend {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  friend: {
    id: string;
    name: string;
    image?: string;
    email: string;
    level: number;
    xp: number;
  };
}

interface PendingRequest {
  id: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
    email: string;
    level: number;
    xp: number;
  };
}

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addFriendDialogOpen, setAddFriendDialogOpen] = useState(false);
  const [friendId, setFriendId] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchFriendsData();
  }, [session, status, router]);

  const fetchFriendsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/friends');
      
      if (!response.ok) {
        throw new Error('Failed to fetch friends data');
      }
      
      const data = await response.json();
      setFriends(data.friends);
      setPendingRequests(data.pendingRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId })
      });

      if (!response.ok) {
        throw new Error('Failed to send friend request');
      }

      setAddFriendDialogOpen(false);
      setFriendId("");
      fetchFriendsData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleFriendRequest = async (friendshipId: string, action: string) => {
    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} friend request`);
      }

      fetchFriendsData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'success';
      case 'PENDING': return 'warning';
      case 'BLOCKED': return 'error';
      case 'DECLINED': return 'default';
      default: return 'default';
    }
  };

  if (status === "loading" || loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading Friends...
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      pt: 8, // Account for navbar
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              sx={{ 
                color: 'white', 
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Friends & Connections
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Connect with other users and build your network
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  textAlign: 'center',
                  p: 3
                }}>
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {friends.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Friends
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  textAlign: 'center',
                  p: 3
                }}>
                  <PendingIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {pendingRequests.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Requests
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  textAlign: 'center',
                  p: 3
                }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {friends.filter(f => f.status === 'ACCEPTED').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Connections
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Pending Friend Requests */}
          {pendingRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper sx={{ 
                mb: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
              }}>
                <CardHeader
                  title="Pending Friend Requests"
                  avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><PendingIcon /></Avatar>}
                  action={
                    <IconButton onClick={fetchFriendsData}>
                      <RefreshIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <List>
                    {pendingRequests.map((request, index) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <ListItem>
                          <ListItemIcon>
                            <Avatar src={request.user.image} sx={{ bgcolor: 'primary.main' }}>
                              {request.user.name?.charAt(0) || 'U'}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={request.user.name}
                            secondary={`Level ${request.user.level} • ${request.user.xp} XP`}
                          />
                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Accept">
                                <IconButton
                                  color="success"
                                  onClick={() => handleFriendRequest(request.id, 'accept')}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Decline">
                                <IconButton
                                  color="error"
                                  onClick={() => handleFriendRequest(request.id, 'decline')}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < pendingRequests.length - 1 && <Divider />}
                      </motion.div>
                    ))}
                  </List>
                </CardContent>
              </Paper>
            </motion.div>
          )}

          {/* Friends List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper sx={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
            }}>
              <CardHeader
                title="My Friends"
                avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><PeopleIcon /></Avatar>}
                action={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={fetchFriendsData}>
                      <RefreshIcon />
                    </IconButton>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={() => setAddFriendDialogOpen(true)}
                      sx={{ borderRadius: 2 }}
                    >
                      Add Friend
                    </Button>
                  </Box>
                }
              />
              <CardContent>
                {friends.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      No friends yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Start building your network by adding friends
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={() => setAddFriendDialogOpen(true)}
                      sx={{ borderRadius: 2 }}
                    >
                      Add Your First Friend
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {friends.map((friendship, index) => (
                      <motion.div
                        key={friendship.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <ListItem>
                          <ListItemIcon>
                            <Avatar src={friendship.friend.image} sx={{ bgcolor: 'primary.main' }}>
                              {friendship.friend.name?.charAt(0) || 'U'}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={friendship.friend.name}
                            secondary={`Level ${friendship.friend.level} • ${friendship.friend.xp} XP`}
                          />
                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Chip
                                label={friendship.status}
                                size="small"
                                color={getStatusColor(friendship.status) as any}
                              />
                              <Tooltip title="Message">
                                <IconButton>
                                  <MessageIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="More">
                                <IconButton>
                                  <MoreVertIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < friends.length - 1 && <Divider />}
                      </motion.div>
                    ))}
                  </List>
                )}
              </CardContent>
            </Paper>
          </motion.div>

          {/* Add Friend Dialog */}
          <Dialog 
            open={addFriendDialogOpen} 
            onClose={() => setAddFriendDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Add Friend</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="User ID or Email"
                value={friendId}
                onChange={(e) => setFriendId(e.target.value)}
                placeholder="Enter user ID or email address"
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddFriendDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddFriend}
                variant="contained"
                disabled={!friendId}
              >
                Send Request
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
}
