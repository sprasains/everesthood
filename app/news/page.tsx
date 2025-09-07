'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
  Avatar,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Source as SourceIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NewsSource {
  id: string;
  name: string;
  url: string;
  description?: string;
  type: string;
  isActive: boolean;
  categories: string[];
  tags: string[];
  _count: {
    articles: number;
  };
}

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  url: string;
  imageUrl?: string;
  author?: string;
  publishedAt: string;
  category: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  shareCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  sentiment?: number;
  source: {
    id: string;
    name: string;
    url: string;
  };
  _count: {
    interactions: number;
    bookmarks: number;
  };
  userInteractions: {
    isBookmarked: boolean;
    isLiked: boolean;
    isShared: boolean;
  };
}

interface UserPreferences {
  id: string;
  categories: string[];
  sources: string[];
  tags: string[];
  keywords: string[];
  isActive: boolean;
}

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

export default function NewsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [preferencesDialog, setPreferencesDialog] = useState(false);
  const [tempPreferences, setTempPreferences] = useState<UserPreferences | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        category: categoryFilter,
        source: sourceFilter,
        sortBy,
        sortOrder
      });

      if (tabValue === 1) params.append('featured', 'true');
      if (tabValue === 2) params.append('trending', 'true');

      const response = await fetch(`/api/news?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      setArticles(data.articles);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/news/sources?active=true');
      if (response.ok) {
        const data = await response.json();
        setSources(data);
      }
    } catch (err) {
      console.error('Failed to fetch sources:', err);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/news/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, categoryFilter, sourceFilter, sortBy, sortOrder, tabValue]);

  useEffect(() => {
    fetchSources();
    fetchPreferences();
  }, []);

  const handleInteract = async (articleId: string, type: 'like' | 'share' | 'bookmark') => {
    try {
      const response = await fetch(`/api/news/${articleId}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        // Update local state
        setArticles(prev => prev.map(article => {
          if (article.id === articleId) {
            const updated = { ...article };
            if (type === 'like') {
              updated.userInteractions.isLiked = !updated.userInteractions.isLiked;
              updated.likeCount += updated.userInteractions.isLiked ? 1 : -1;
            } else if (type === 'share') {
              updated.userInteractions.isShared = !updated.userInteractions.isShared;
              updated.shareCount += updated.userInteractions.isShared ? 1 : -1;
            } else if (type === 'bookmark') {
              updated.userInteractions.isBookmarked = !updated.userInteractions.isBookmarked;
            }
            return updated;
          }
          return article;
        }));
      }
    } catch (err) {
      setError('Failed to update interaction');
    }
  };

  const handleSavePreferences = async () => {
    try {
      const response = await fetch('/api/news/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempPreferences),
      });

      if (response.ok) {
        setPreferences(tempPreferences);
        setPreferencesDialog(false);
        fetchArticles(); // Refresh articles with new preferences
      }
    } catch (err) {
      setError('Failed to save preferences');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'TECHNOLOGY': 'primary',
      'AI_ML': 'secondary',
      'PROGRAMMING': 'info',
      'BUSINESS': 'success',
      'SCIENCE': 'warning',
      'HEALTH': 'error',
      'ENTERTAINMENT': 'default',
      'SPORTS': 'default',
      'POLITICS': 'default',
      'EDUCATION': 'default',
      'LIFESTYLE': 'default',
      'TRAVEL': 'default',
      'FOOD': 'default',
      'FASHION': 'default',
      'GAMING': 'default',
      'STARTUPS': 'default',
      'CRYPTO': 'default',
      'OTHER': 'default'
    };
    return colors[category] || 'default';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && articles.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading news...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <VisibilityIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          News & Content
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Stay updated with personalized news and curated content
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="All News" />
          <Tab label="Featured" />
          <Tab label="Trending" />
          <Tab label="Bookmarks" />
        </Tabs>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="Search articles..."
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
                    {categoryLabels[category]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                label="Source"
              >
                <MenuItem value="">All Sources</MenuItem>
                {sources.map((source) => (
                  <MenuItem key={source.id} value={source.id}>
                    {source.name}
                  </MenuItem>
                ))}
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
                <MenuItem value="publishedAt">Date</MenuItem>
                <MenuItem value="viewCount">Views</MenuItem>
                <MenuItem value="likeCount">Likes</MenuItem>
                <MenuItem value="shareCount">Shares</MenuItem>
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
                <MenuItem value="desc">Newest First</MenuItem>
                <MenuItem value="asc">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => {
                setTempPreferences(preferences);
                setPreferencesDialog(true);
              }}
            >
              Preferences
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <VisibilityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No articles found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery || categoryFilter || sourceFilter
              ? 'Try adjusting your search criteria'
              : 'No news articles available at the moment'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchArticles}
          >
            Refresh
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {articles.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {article.imageUrl && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={article.imageUrl}
                      alt={article.title}
                    />
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={categoryLabels[article.category] || article.category}
                        color={getCategoryColor(article.category) as any}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {article.isFeatured && (
                        <Chip
                          label="Featured"
                          color="primary"
                          size="small"
                          icon={<StarIcon />}
                        />
                      )}
                      {article.isTrending && (
                        <Chip
                          label="Trending"
                          color="secondary"
                          size="small"
                          icon={<TrendingUpIcon />}
                        />
                      )}
                    </Box>

                    <Typography variant="h6" component="h3" gutterBottom>
                      {article.title}
                    </Typography>
                    
                    {article.summary && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {article.summary}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <SourceIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {article.source.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScheduleIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(article.publishedAt)}
                        </Typography>
                      </Box>
                    </Box>

                    {article.author && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {article.author}
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <VisibilityIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {article.viewCount}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ThumbUpIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {article.likeCount}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ShareIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {article.shareCount}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => window.open(article.url, '_blank')}
                    >
                      Read More
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleInteract(article.id, 'like')}
                      color={article.userInteractions.isLiked ? 'primary' : 'default'}
                    >
                      {article.userInteractions.isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleInteract(article.id, 'share')}
                      color={article.userInteractions.isShared ? 'primary' : 'default'}
                    >
                      <ShareIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleInteract(article.id, 'bookmark')}
                      color={article.userInteractions.isBookmarked ? 'primary' : 'default'}
                    >
                      {article.userInteractions.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
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

      {/* Preferences Dialog */}
      <Dialog
        open={preferencesDialog}
        onClose={() => setPreferencesDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>News Preferences</DialogTitle>
        <DialogContent>
          {tempPreferences && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Categories
              </Typography>
              <Autocomplete
                multiple
                options={categories}
                value={tempPreferences.categories}
                onChange={(_, newValue) => setTempPreferences({ ...tempPreferences, categories: newValue })}
                getOptionLabel={(option) => categoryLabels[option] || option}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={categoryLabels[option] || option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Categories"
                    placeholder="Choose your preferred news categories"
                  />
                )}
                sx={{ mb: 3 }}
              />

              <Typography variant="h6" gutterBottom>
                Sources
              </Typography>
              <Autocomplete
                multiple
                options={sources}
                value={sources.filter(source => tempPreferences.sources.includes(source.id))}
                onChange={(_, newValue) => setTempPreferences({ 
                  ...tempPreferences, 
                  sources: newValue.map(source => source.id) 
                })}
                getOptionLabel={(option) => option.name}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Sources"
                    placeholder="Choose your preferred news sources"
                  />
                )}
                sx={{ mb: 3 }}
              />

              <Typography variant="h6" gutterBottom>
                Keywords
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                value={tempPreferences.keywords}
                onChange={(_, newValue) => setTempPreferences({ ...tempPreferences, keywords: newValue })}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Keywords"
                    placeholder="Add keywords to filter content"
                  />
                )}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreferencesDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSavePreferences}
            variant="contained"
          >
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}