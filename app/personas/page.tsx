'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Avatar,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Persona {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED';
  tags: string[];
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  usageCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  _count: {
    instances: number;
    reviews: number;
  };
}

export default function PersonasPage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState<string | null>(null);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: searchQuery,
        visibility: visibilityFilter,
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/personas?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch personas');
      }

      const data = await response.json();
      setPersonas(data.personas);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, [page, searchQuery, visibilityFilter, sortBy, sortOrder]);

  const handleDeletePersona = async (personaId: string) => {
    try {
      const response = await fetch(`/api/personas/${personaId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete persona');
      }

      setPersonas(prev => prev.filter(p => p.id !== personaId));
      setDeleteDialogOpen(false);
      setPersonaToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC': return 'success';
      case 'SHARED': return 'info';
      case 'PRIVATE': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'DRAFT': return 'warning';
      case 'INACTIVE': return 'error';
      case 'ARCHIVED': return 'default';
      default: return 'default';
    }
  };

  if (loading && personas.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading personas...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <PsychologyIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Custom AI Personas
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Discover and create custom AI assistants with unique personalities
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search personas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Visibility</InputLabel>
              <Select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                label="Visibility"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="PUBLIC">Public</MenuItem>
                <MenuItem value="SHARED">Shared</MenuItem>
                <MenuItem value="PRIVATE">Private</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="createdAt">Date Created</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="usageCount">Usage</MenuItem>
                <MenuItem value="averageRating">Rating</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="Order"
              >
                <MenuItem value="desc">Descending</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/personas/create')}
            >
              Create Persona
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Personas Grid */}
      {personas.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PsychologyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No personas found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery || visibilityFilter
              ? 'Try adjusting your search criteria'
              : 'Create your first custom AI persona to get started'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/personas/create')}
          >
            Create Your First Persona
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {personas.map((persona) => (
              <Grid item xs={12} sm={6} md={4} key={persona.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={persona.avatar}
                        sx={{ mr: 2, width: 48, height: 48 }}
                      >
                        <PsychologyIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {persona.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip
                            label={persona.visibility.toLowerCase()}
                            size="small"
                            color={getVisibilityColor(persona.visibility)}
                          />
                          <Chip
                            label={persona.status.toLowerCase()}
                            size="small"
                            color={getStatusColor(persona.status)}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {persona.description}
                    </Typography>

                    {persona.tags.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        {persona.tags.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                        {persona.tags.length > 3 && (
                          <Chip
                            label={`+${persona.tags.length - 3}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating
                          value={persona.averageRating}
                          readOnly
                          size="small"
                          precision={0.1}
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({persona.reviewCount})
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {persona.usageCount} uses
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {persona.user.name}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<PlayIcon />}
                      onClick={() => router.push(`/personas/${persona.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ShareIcon />}
                      onClick={() => router.push(`/personas/${persona.id}/share`)}
                    >
                      Share
                    </Button>
                    {persona.user.id === 'current-user' && (
                      <>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => router.push(`/personas/${persona.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          color="error"
                          onClick={() => {
                            setPersonaToDelete(persona.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="create persona"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => router.push('/personas/create')}
      >
        <AddIcon />
      </Fab>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Persona</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this persona? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => personaToDelete && handleDeletePersona(personaToDelete)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
