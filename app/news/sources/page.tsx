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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Autocomplete,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Source as SourceIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Article as ArticleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface NewsSource {
  id: string;
  name: string;
  url: string;
  description?: string;
  type: 'RSS' | 'API' | 'MANUAL' | 'SCRAPED';
  isActive: boolean;
  lastFetched?: string;
  fetchInterval: number;
  categories: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  _count: {
    articles: number;
  };
  articles?: Array<{
    id: string;
    title: string;
    publishedAt: string;
    viewCount: number;
    likeCount: number;
    isFeatured: boolean;
    isTrending: boolean;
  }>;
}

const sourceTypes = [
  { value: 'RSS', label: 'RSS Feed' },
  { value: 'API', label: 'API' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'SCRAPED', label: 'Scraped' }
];

const categories = [
  'TECHNOLOGY', 'BUSINESS', 'SCIENCE', 'HEALTH', 'ENTERTAINMENT',
  'SPORTS', 'POLITICS', 'EDUCATION', 'LIFESTYLE', 'TRAVEL',
  'FOOD', 'FASHION', 'GAMING', 'AI_ML', 'PROGRAMMING',
  'STARTUPS', 'CRYPTO', 'OTHER'
];

const categoryLabels: { [key: string]: string } = {
  'TECHNOLOGY': 'Technology',
  'BUSINESS': 'Business',
  'SCIENCE': 'Science',
  'HEALTH': 'Health',
  'ENTERTAINMENT': 'Entertainment',
  'SPORTS': 'Sports',
  'POLITICS': 'Politics',
  'EDUCATION': 'Education',
  'LIFESTYLE': 'Lifestyle',
  'TRAVEL': 'Travel',
  'FOOD': 'Food',
  'FASHION': 'Fashion',
  'GAMING': 'Gaming',
  'AI_ML': 'AI & ML',
  'PROGRAMMING': 'Programming',
  'STARTUPS': 'Startups',
  'CRYPTO': 'Crypto',
  'OTHER': 'Other'
};

export default function NewsSourcesPage() {
  const router = useRouter();
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedSource, setSelectedSource] = useState<NewsSource | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    type: 'RSS' as const,
    categories: [] as string[],
    tags: [] as string[],
    fetchInterval: 3600,
    isActive: true
  });

  const fetchSources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        search: searchQuery,
        category: categoryFilter,
        type: typeFilter,
        active: activeFilter
      });

      const response = await fetch(`/api/news/sources?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sources');
      }

      const data = await response.json();
      setSources(data.sources);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [page, rowsPerPage, searchQuery, categoryFilter, typeFilter, activeFilter]);

  const handleCreateSource = async () => {
    try {
      const response = await fetch('/api/news/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create source');
      }

      setCreateDialog(false);
      setFormData({
        name: '',
        url: '',
        description: '',
        type: 'RSS',
        categories: [],
        tags: [],
        fetchInterval: 3600,
        isActive: true
      });
      fetchSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpdateSource = async () => {
    if (!selectedSource) return;

    try {
      const response = await fetch(`/api/news/sources/${selectedSource.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update source');
      }

      setEditDialog(false);
      setSelectedSource(null);
      fetchSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this source? This will also delete all associated articles.')) {
      return;
    }

    try {
      const response = await fetch(`/api/news/sources/${sourceId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete source');
      }

      fetchSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEditSource = (source: NewsSource) => {
    setSelectedSource(source);
    setFormData({
      name: source.name,
      url: source.url,
      description: source.description || '',
      type: source.type,
      categories: source.categories,
      tags: source.tags,
      fetchInterval: source.fetchInterval,
      isActive: source.isActive
    });
    setEditDialog(true);
  };

  const formatInterval = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading && sources.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading news sources...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <SourceIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          News Sources
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage news sources and content feeds
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters and Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                    {categoryLabels[category]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Type"
              >
                <MenuItem value="">All Types</MenuItem>
                {sourceTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialog(true)}
            >
              Add Source
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Sources Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Categories</TableCell>
              <TableCell>Articles</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Fetched</TableCell>
              <TableCell>Interval</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">
                      {source.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {source.url}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={sourceTypes.find(t => t.value === source.type)?.label || source.type}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {source.categories.slice(0, 2).map((category) => (
                      <Chip
                        key={category}
                        label={categoryLabels[category] || category}
                        size="small"
                        color="primary"
                      />
                    ))}
                    {source.categories.length > 2 && (
                      <Chip
                        label={`+${source.categories.length - 2}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ArticleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {source._count.articles}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={source.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                    label={source.isActive ? 'Active' : 'Inactive'}
                    color={source.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formatTimeAgo(source.lastFetched)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatInterval(source.fetchInterval)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditSource(source)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSource(source.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Create Source Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add News Source</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Source Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    label="Type"
                  >
                    {sourceTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fetch Interval (seconds)"
                  type="number"
                  value={formData.fetchInterval}
                  onChange={(e) => setFormData({ ...formData, fetchInterval: parseInt(e.target.value) || 3600 })}
                  helperText={`Current: ${formatInterval(formData.fetchInterval)}`}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={categories}
                  value={formData.categories}
                  onChange={(_, newValue) => setFormData({ ...formData, categories: newValue })}
                  getOptionLabel={(option) => categoryLabels[option] || option}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={categoryLabels[option] || option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Categories"
                      placeholder="Select categories"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  value={formData.tags}
                  onChange={(_, newValue) => setFormData({ ...formData, tags: newValue })}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Add tags"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSource}
            variant="contained"
            disabled={!formData.name || !formData.url}
          >
            Create Source
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Source Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit News Source</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Source Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    label="Type"
                  >
                    {sourceTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fetch Interval (seconds)"
                  type="number"
                  value={formData.fetchInterval}
                  onChange={(e) => setFormData({ ...formData, fetchInterval: parseInt(e.target.value) || 3600 })}
                  helperText={`Current: ${formatInterval(formData.fetchInterval)}`}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={categories}
                  value={formData.categories}
                  onChange={(_, newValue) => setFormData({ ...formData, categories: newValue })}
                  getOptionLabel={(option) => categoryLabels[option] || option}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={categoryLabels[option] || option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Categories"
                      placeholder="Select categories"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  value={formData.tags}
                  onChange={(_, newValue) => setFormData({ ...formData, tags: newValue })}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Add tags"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateSource}
            variant="contained"
            disabled={!formData.name || !formData.url}
          >
            Update Source
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
