"use client";

import { Box, Container, Typography, Paper, Grid, Card, CardContent, CardHeader, Avatar, Chip, Button, LinearProgress, Alert, AlertTitle, Fab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Slider, IconButton, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AddIcon,
  SelfCareIcon,
  PsychologyIcon,
  TimerIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  PlayArrowIcon,
  PauseIcon,
  StopIcon,
  RefreshIcon,
  SpaIcon,
  AirIcon,
  PsychologyAltIcon,
  CoffeeIcon,
  MoodIcon,
  NotesIcon,
  DeleteIcon,
  EditIcon
} from "@mui/icons-material";

interface WellnessSession {
  id: string;
  type: string;
  duration: number;
  completed: boolean;
  notes?: string;
  moodBefore?: number;
  moodAfter?: number;
  createdAt: string;
}

export default function DigitalZenPage() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const router = useRouter();
  const [sessions, setSessions] = useState<WellnessSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    type: 'meditation',
    duration: 10,
    notes: '',
    moodBefore: 5,
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchWellnessData();
  }, [session, status, router]);

  const fetchWellnessData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wellness');
      
      if (!response.ok) {
        throw new Error('Failed to fetch wellness data');
      }
      
      const data = await response.json();
      setSessions(data.sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      const response = await fetch('/api/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      setCreateDialogOpen(false);
      setNewSession({
        type: 'meditation',
        duration: 10,
        notes: '',
        moodBefore: 5,
      });
      fetchWellnessData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'meditation': return <SpaIcon />;
      case 'breathing': return <AirIcon />;
      case 'focus': return <PsychologyAltIcon />;
      case 'break': return <CoffeeIcon />;
      default: return <SelfCareIcon />;
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'meditation': return 'primary';
      case 'breathing': return 'info';
      case 'focus': return 'success';
      case 'break': return 'warning';
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
              Loading Digital Zen...
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
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
              Digital Zen
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Find your balance with mindful wellness sessions
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {/* Sessions Grid */}
          <Grid container spacing={3}>
            {sessions.map((session) => (
              <Grid item xs={12} md={6} lg={4} key={session.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: `${getSessionTypeColor(session.type)}.main` }}>
                          {getSessionTypeIcon(session.type)}
                        </Avatar>
                      }
                      title={
                        <Typography variant="h6" fontWeight="bold">
                          {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                        </Typography>
                      }
                      subheader={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Chip
                            label={`${session.duration} min`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={session.completed ? 'Completed' : 'Incomplete'}
                            size="small"
                            color={session.completed ? 'success' : 'warning'}
                          />
                        </Box>
                      }
                    />
                    <CardContent>
                      {session.notes && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ mb: 2 }}
                        >
                          {session.notes}
                        </Typography>
                      )}
                      
                      {session.moodBefore && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Mood Before: {session.moodBefore}/10
                          </Typography>
                          {session.moodAfter && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                              Mood After: {session.moodAfter}/10
                            </Typography>
                          )}
                        </Box>
                      )}

                      <Typography variant="caption" color="text.secondary">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {sessions.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper sx={{ 
                p: 6, 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
              }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                  Start Your Wellness Journey
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first wellness session to begin your digital zen practice
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Create Session
                </Button>
              </Paper>
            </motion.div>
          )}

          {/* Create Session FAB */}
          <Fab
            color="primary"
            aria-label="create session"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)',
              },
            }}
            onClick={() => setCreateDialogOpen(true)}
          >
            <AddIcon />
          </Fab>

          {/* Create Session Dialog */}
          <Dialog 
            open={createDialogOpen} 
            onClose={() => setCreateDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Create Wellness Session</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Session Type</InputLabel>
                    <Select
                      value={newSession.type}
                      onChange={(e) => setNewSession({ ...newSession, type: e.target.value })}
                      label="Session Type"
                    >
                      <MenuItem value="meditation">Meditation</MenuItem>
                      <MenuItem value="breathing">Breathing Exercise</MenuItem>
                      <MenuItem value="focus">Focus Session</MenuItem>
                      <MenuItem value="break">Digital Break</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Duration: {newSession.duration} minutes</Typography>
                  <Slider
                    value={newSession.duration}
                    onChange={(_, value) => setNewSession({ ...newSession, duration: value as number })}
                    min={1}
                    max={60}
                    step={1}
                    marks={[
                      { value: 5, label: '5m' },
                      { value: 15, label: '15m' },
                      { value: 30, label: '30m' },
                      { value: 60, label: '60m' },
                    ]}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Mood Before: {newSession.moodBefore}/10</Typography>
                  <Slider
                    value={newSession.moodBefore}
                    onChange={(_, value) => setNewSession({ ...newSession, moodBefore: value as number })}
                    min={1}
                    max={10}
                    step={1}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 5, label: '5' },
                      { value: 10, label: '10' },
                    ]}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes (Optional)"
                    value={newSession.notes}
                    onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                    placeholder="Any thoughts or intentions for this session..."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSession}
                variant="contained"
              >
                Create Session
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
}