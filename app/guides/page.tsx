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
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  Person as PersonIcon,
  MenuBook as MenuBookIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'UNDER_REVIEW';
  isPublic: boolean;
  isFeatured: boolean;
  thumbnail?: string;
  estimatedTime?: number;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  publishedAt?: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  _count: {
    steps: number;
    reviews: number;
    progress: number;
  };
  userProgress?: {
    progress: number;
    isCompleted: boolean;
    currentStep?: string;
  } | null;
}

export default function GuidesPage() {
  const router = useRouter();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [featured, setFeatured] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [guideToDelete, setGuideToDelete] = useState<string | null>(null);

  const categories = [
    'Programming', 'Design', 'Business', 'Marketing', 'Data Science',
    'AI/ML', 'Web Development', 'Mobile Development', 'DevOps',
    'Cybersecurity', 'Productivity', 'Career Development', 'Personal Finance',
    'Health & Wellness', 'Creative Writing', 'Photography', 'Music',
    'Language Learning', 'Cooking', 'DIY & Crafts', 'Other'
  ];

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: searchQuery,
        category: categoryFilter,
        difficulty: difficultyFilter,
        sortBy,
        sortOrder,
        featured: featured.toString()
      });

      const response = await fetch(`/api/guides?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch guides');
      }

      const data = await response.json();
      setGuides(data.guides);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, [page, searchQuery, categoryFilter, difficultyFilter, sortBy, sortOrder, featured]);

  const handleDeleteGuide = async (guideId: string) => {
    try {
      const response = await fetch(`/api/guides/${guideId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete guide');
      }

      setGuides(prev => prev.filter(g => g.id !== guideId));
      setDeleteDialogOpen(false);
      setGuideToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleBookmark = async (guideId: string) => {
    try {
      const response = await fetch(`/api/guides/${guideId}/bookmark`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to toggle bookmark');
      }

      // Refresh guides to update bookmark status
      fetchGuides();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'success';
      case 'INTERMEDIATE': return 'warning';
      case 'ADVANCED': return 'error';
      case 'EXPERT': return 'secondary';
      default: return 'default';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return '🟢';
      case 'INTERMEDIATE': return '🟡';
      case 'ADVANCED': return '🟠';
      case 'EXPERT': return '🔴';
      default: return '⚪';
    }
  };

  if (loading && guides.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading guides...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <MenuBookIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Guides & Tutorials
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Learn from the community's knowledge and share your expertise
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
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                label="Difficulty"
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="BEGINNER">Beginner</MenuItem>
                <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                <MenuItem value="ADVANCED">Advanced</MenuItem>
                <MenuItem value="EXPERT">Expert</MenuItem>
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
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="viewCount">Views</MenuItem>
                <MenuItem value="averageRating">Rating</MenuItem>
                <MenuItem value="likeCount">Likes</MenuItem>
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
          <Grid item xs={12} sm={3} md={1}>
            <Button
              fullWidth
              variant={featured ? "contained" : "outlined"}
              startIcon={<TrendingUpIcon />}
              onClick={() => setFeatured(!featured)}
            >
              Featured
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Create Guide Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/guides/create')}
          size="large"
        >
          Create Guide
        </Button>
      </Box>

      {/* Guides Grid */}
      {guides.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <MenuBookIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No guides found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery || categoryFilter || difficultyFilter
              ? 'Try adjusting your search criteria'
              : 'Create your first guide to share knowledge with the community'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/guides/create')}
          >
            Create Your First Guide
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {guides.map((guide) => (
              <Grid item xs={12} sm={6} md={4} key={guide.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {guide.thumbnail && (
                    <Box
                      sx={{
                        height: 200,
                        backgroundImage: `url(${guide.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                      }}
                    >
                      {guide.isFeatured && (
                        <Chip
                          label="Featured"
                          color="primary"
                          size="small"
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                        />
                      )}
                    </Box>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={guide.user.image}
                        sx={{ mr: 2, width: 32, height: 32 }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {guide.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(guide.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h6" component="h3" gutterBottom>
                      {guide.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {guide.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={guide.difficulty.toLowerCase()}
                        color={getDifficultyColor(guide.difficulty)}
                        size="small"
                        icon={<span>{getDifficultyIcon(guide.difficulty)}</span>}
                      />
                      <Chip
                        label={guide.category}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {guide.tags.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        {guide.tags.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                        {guide.tags.length > 3 && (
                          <Chip
                            label={`+${guide.tags.length - 3}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating
                          value={guide.averageRating}
                          readOnly
                          size="small"
                          precision={0.1}
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({guide.reviewCount})
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {guide.viewCount} views
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MenuBookIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {guide._count.steps} steps
                        </Typography>
                      </Box>
                      {guide.estimatedTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ScheduleIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {guide.estimatedTime} min
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* User Progress */}
                    {guide.userProgress && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Your Progress
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(guide.userProgress.progress)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={guide.userProgress.progress}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<PlayIcon />}
                      onClick={() => router.push(`/guides/${guide.id}`)}
                    >
                      {guide.userProgress?.isCompleted ? 'Review' : 'Start'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ShareIcon />}
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/guides/${guide.id}`)}
                    >
                      Share
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleBookmark(guide.id)}
                    >
                      <BookmarkBorderIcon />
                    </IconButton>
                    {guide.user.id === 'current-user' && (
                      <>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => router.push(`/guides/${guide.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setGuideToDelete(guide.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
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
        aria-label="create guide"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => router.push('/guides/create')}
      >
        <AddIcon />
      </Fab>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Guide</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this guide? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => guideToDelete && handleDeleteGuide(guideToDelete)}
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
