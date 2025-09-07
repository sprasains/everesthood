"use client";

import { Box, Container, Typography, Paper, Grid, Card, CardContent, CardHeader, Avatar, Chip, Button, LinearProgress, Alert, AlertTitle, Fab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, IconButton, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AddIcon,
  SearchIcon,
  FilterListIcon,
  ShareIcon,
  EditIcon,
  DeleteIcon,
  VisibilityIcon,
  ScheduleIcon,
  CheckCircleIcon,
  ErrorIcon,
  RefreshIcon,
  ContentCopyIcon,
  LinkIcon,
  DescriptionIcon,
  VideoLibraryIcon,
  AudioFileIcon,
  ArticleIcon
} from "@mui/icons-material";

interface AISummary {
  id: string;
  title: string;
  content: string;
  summary: string;
  sourceType: string;
  sourceUrl?: string;
  sourceText?: string;
  model: string;
  tokensUsed?: number;
  cost?: number;
  status: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function SummariesPage() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const router = useRouter();
  const [summaries, setSummaries] = useState<AISummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceTypeFilter, setSourceTypeFilter] = useState("");
  const [publicFilter, setPublicFilter] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSummary, setNewSummary] = useState({
    title: "",
    content: "",
    sourceType: "text",
    sourceUrl: "",
    tags: [] as string[],
    isPublic: false
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchSummaries();
  }, [session, status, router, searchTerm, sourceTypeFilter, publicFilter]);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (sourceTypeFilter) params.append('sourceType', sourceTypeFilter);
      if (publicFilter) params.append('isPublic', publicFilter);
      
      const response = await fetch(`/api/summaries?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch summaries');
      }
      
      const data = await response.json();
      setSummaries(data.summaries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSummary = async () => {
    try {
      const response = await fetch('/api/summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSummary)
      });

      if (!response.ok) {
        throw new Error('Failed to create summary');
      }

      setCreateDialogOpen(false);
      setNewSummary({
        title: "",
        content: "",
        sourceType: "text",
        sourceUrl: "",
        tags: [],
        isPublic: false
      });
      fetchSummaries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'url': return <LinkIcon />;
      case 'text': return <DescriptionIcon />;
      case 'document': return <ArticleIcon />;
      case 'video': return <VideoLibraryIcon />;
      case 'audio': return <AudioFileIcon />;
      default: return <DescriptionIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PROCESSING': return 'warning';
      case 'PENDING': return 'info';
      case 'FAILED': return 'error';
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
              Loading AI Summaries...
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
              AI Summaries
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Transform any content into digestible summaries with AI
            </Typography>
          </Box>

          {/* Search and Filters */}
          <Paper sx={{ 
            p: 3, 
            mb: 4, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
          }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search summaries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Source Type</InputLabel>
                  <Select
                    value={sourceTypeFilter}
                    onChange={(e) => setSourceTypeFilter(e.target.value)}
                    label="Source Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="url">URL</MenuItem>
                    <MenuItem value="document">Document</MenuItem>
                    <MenuItem value="video">Video</MenuItem>
                    <MenuItem value="audio">Audio</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Visibility</InputLabel>
                  <Select
                    value={publicFilter}
                    onChange={(e) => setPublicFilter(e.target.value)}
                    label="Visibility"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Public</MenuItem>
                    <MenuItem value="false">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchSummaries}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {/* Summaries Grid */}
          <Grid container spacing={3}>
            {summaries.map((summary) => (
              <Grid item xs={12} md={6} lg={4} key={summary.id}>
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
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getSourceTypeIcon(summary.sourceType)}
                        </Avatar>
                      }
                      title={
                        <Typography variant="h6" fontWeight="bold" noWrap>
                          {summary.title}
                        </Typography>
                      }
                      subheader={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Chip
                            label={summary.sourceType}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={summary.status}
                            size="small"
                            color={getStatusColor(summary.status) as any}
                          />
                          {summary.isPublic && (
                            <Chip
                              label="Public"
                              size="small"
                              color="success"
                            />
                          )}
                        </Box>
                      }
                      action={
                        <Box>
                          <Tooltip title="View">
                            <IconButton size="small">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                    <CardContent>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {summary.summary || 'Processing...'}
                      </Typography>
                      
                      {summary.tags.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          {summary.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                          {summary.tags.length > 3 && (
                            <Chip
                              label={`+${summary.tags.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          )}
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(summary.createdAt).toLocaleDateString()}
                        </Typography>
                        {summary.cost && (
                          <Typography variant="caption" color="success.main" fontWeight="bold">
                            ${summary.cost.toFixed(4)}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {summaries.length === 0 && !loading && (
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
                  No summaries yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first AI summary to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Create Summary
                </Button>
              </Paper>
            </motion.div>
          )}

          {/* Create Summary FAB */}
          <Fab
            color="primary"
            aria-label="create summary"
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

          {/* Create Summary Dialog */}
          <Dialog 
            open={createDialogOpen} 
            onClose={() => setCreateDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Create New AI Summary</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={newSummary.title}
                    onChange={(e) => setNewSummary({ ...newSummary, title: e.target.value })}
                    placeholder="Enter a title for your summary"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Source Type</InputLabel>
                    <Select
                      value={newSummary.sourceType}
                      onChange={(e) => setNewSummary({ ...newSummary, sourceType: e.target.value })}
                      label="Source Type"
                    >
                      <MenuItem value="text">Text</MenuItem>
                      <MenuItem value="url">URL</MenuItem>
                      <MenuItem value="document">Document</MenuItem>
                      <MenuItem value="video">Video</MenuItem>
                      <MenuItem value="audio">Audio</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newSummary.isPublic}
                        onChange={(e) => setNewSummary({ ...newSummary, isPublic: e.target.checked })}
                      />
                    }
                    label="Make Public"
                  />
                </Grid>
                {newSummary.sourceType === 'url' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Source URL"
                      value={newSummary.sourceUrl}
                      onChange={(e) => setNewSummary({ ...newSummary, sourceUrl: e.target.value })}
                      placeholder="https://example.com/article"
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Content to Summarize"
                    value={newSummary.content}
                    onChange={(e) => setNewSummary({ ...newSummary, content: e.target.value })}
                    placeholder="Paste or type the content you want to summarize..."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSummary}
                variant="contained"
                disabled={!newSummary.title || !newSummary.content}
              >
                Create Summary
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
}
