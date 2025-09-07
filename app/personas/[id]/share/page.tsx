'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Person as PersonIcon,
  Public as PublicIcon,
  Group as GroupIcon,
  Delete as DeleteIcon,
  Psychology as PsychologyIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Persona {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED';
  tags: string[];
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Share {
  id: string;
  sharedWith: string;
  permissions: string;
  createdAt: string;
}

export default function SharePersonaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [shareDialog, setShareDialog] = useState(false);
  const [shareWith, setShareWith] = useState('');
  const [permissions, setPermissions] = useState('read');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPersona();
    fetchShares();
  }, [params.id]);

  const fetchPersona = async () => {
    try {
      const response = await fetch(`/api/personas/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch persona');
      }
      const data = await response.json();
      setPersona(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchShares = async () => {
    try {
      // This would be a new API endpoint to fetch shares
      // For now, we'll simulate it
      setShares([]);
    } catch (err) {
      console.error('Failed to fetch shares:', err);
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      setError(null);

      const response = await fetch(`/api/personas/${params.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sharedWith: shareWith,
          permissions: JSON.stringify({ access: permissions })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to share persona');
      }

      setSuccess('Persona shared successfully!');
      setShareDialog(false);
      setShareWith('');
      setPermissions('read');
      fetchShares();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/personas/${params.id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy link');
    }
  };

  const handleMakePublic = async () => {
    try {
      const response = await fetch(`/api/personas/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visibility: 'PUBLIC'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to make persona public');
      }

      setSuccess('Persona is now public!');
      fetchPersona();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      // This would be a new API endpoint to remove shares
      // For now, we'll simulate it
      setShares(prev => prev.filter(share => share.id !== shareId));
      setSuccess('Share removed successfully!');
    } catch (err) {
      setError('Failed to remove share');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading persona...
        </Typography>
      </Container>
    );
  }

  if (error && !persona) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            <ShareIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Share Persona
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Share "{persona?.name}" with others or make it public
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Persona Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <PsychologyIcon sx={{ color: 'white', fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="h6">
                    {persona?.name}
                  </Typography>
                  <Chip
                    label={persona?.visibility.toLowerCase()}
                    color={persona?.visibility === 'PUBLIC' ? 'success' : persona?.visibility === 'SHARED' ? 'info' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {persona?.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sharing Options */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sharing Options
            </Typography>

            {/* Current Visibility */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Visibility: {persona?.visibility}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {persona?.visibility === 'PRIVATE' && 'Only you can see and use this persona.'}
                {persona?.visibility === 'SHARED' && 'This persona is shared with specific users.'}
                {persona?.visibility === 'PUBLIC' && 'Anyone can discover and use this persona.'}
              </Typography>
            </Box>

            {/* Quick Actions */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LinkIcon />}
                  onClick={handleCopyLink}
                  sx={{ height: 56 }}
                >
                  {copied ? (
                    <>
                      <CheckIcon sx={{ mr: 1 }} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <CopyIcon sx={{ mr: 1 }} />
                      Copy Link
                    </>
                  )}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PublicIcon />}
                  onClick={handleMakePublic}
                  disabled={persona?.visibility === 'PUBLIC'}
                  sx={{ height: 56 }}
                >
                  Make Public
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Share with Specific Users */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Share with Specific Users
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonIcon />}
                onClick={() => setShareDialog(true)}
              >
                Share with User
              </Button>
            </Box>

            {/* Current Shares */}
            {shares.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Current Shares ({shares.length})
                </Typography>
                <List>
                  {shares.map((share) => (
                    <ListItem key={share.id}>
                      <ListItemText
                        primary={share.sharedWith === 'public' ? 'Public' : share.sharedWith}
                        secondary={`Shared on ${new Date(share.createdAt).toLocaleDateString()}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveShare(share.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Share Dialog */}
      <Dialog
        open={shareDialog}
        onClose={() => setShareDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share with User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="User ID or Email"
            value={shareWith}
            onChange={(e) => setShareWith(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Enter user ID or email address"
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Permissions</InputLabel>
            <Select
              value={permissions}
              onChange={(e) => setPermissions(e.target.value)}
              label="Permissions"
            >
              <MenuItem value="read">Read Only</MenuItem>
              <MenuItem value="use">Use Only</MenuItem>
              <MenuItem value="edit">Edit</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog(false)}>Cancel</Button>
          <Button
            onClick={handleShare}
            variant="contained"
            disabled={!shareWith.trim() || sharing}
          >
            {sharing ? 'Sharing...' : 'Share'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
