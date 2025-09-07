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
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Paper,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import {
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  OpenInNew as OpenInNewIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Source as SourceIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    description?: string;
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

export default function NewsArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [params.id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      const data = await response.json();
      setArticle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInteract = async (type: 'like' | 'share' | 'bookmark') => {
    if (!article) return;

    try {
      const response = await fetch(`/api/news/${article.id}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        // Update local state
        setArticle(prev => {
          if (!prev) return null;
          const updated = { ...prev };
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
        });
      }
    } catch (err) {
      setError('Failed to update interaction');
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading article...
        </Typography>
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Article not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink
          component={Link}
          href="/news"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <ArrowBackIcon fontSize="small" />
          Back to News
        </MuiLink>
        <Typography color="text.primary">
          {categoryLabels[article.category] || article.category}
        </Typography>
      </Breadcrumbs>

      {/* Article Header */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip
                label={categoryLabels[article.category] || article.category}
                color={getCategoryColor(article.category) as any}
                sx={{ mr: 2 }}
              />
              {article.isFeatured && (
                <Chip
                  label="Featured"
                  color="primary"
                  icon={<StarIcon />}
                  sx={{ mr: 1 }}
                />
              )}
              {article.isTrending && (
                <Chip
                  label="Trending"
                  color="secondary"
                  icon={<TrendingUpIcon />}
                />
              )}
            </Box>

            <Typography variant="h3" component="h1" gutterBottom>
              {article.title}
            </Typography>

            {article.summary && (
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                {article.summary}
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SourceIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {article.source.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {formatTimeAgo(article.publishedAt)}
                </Typography>
              </Box>
              {article.author && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {article.author}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VisibilityIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {article.viewCount} views
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ThumbUpIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {article.likeCount} likes
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ShareIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {article.shareCount} shares
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={article.userInteractions.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                onClick={() => handleInteract('bookmark')}
                color={article.userInteractions.isBookmarked ? 'primary' : 'inherit'}
              >
                {article.userInteractions.isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={() => handleInteract('share')}
                color={article.userInteractions.isShared ? 'primary' : 'inherit'}
              >
                Share
              </Button>
              <Button
                variant="contained"
                startIcon={<OpenInNewIcon />}
                onClick={() => window.open(article.url, '_blank')}
              >
                Read Original
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Article Image */}
      {article.imageUrl && (
        <Box sx={{ mb: 4 }}>
          <CardMedia
            component="img"
            height="400"
            image={article.imageUrl}
            alt={article.title}
            sx={{ borderRadius: 2 }}
          />
        </Box>
      )}

      {/* Article Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {article.content}
            </Typography>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Source Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SourceIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {article.source.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {article.source.description || 'News Source'}
                  </Typography>
                </Box>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                onClick={() => window.open(article.source.url, '_blank')}
              >
                Visit Source
              </Button>
            </CardContent>
          </Card>

          {/* Tags */}
          {article.tags.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {article.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Engagement Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Engagement
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon fontSize="small" color="action" />
                    <Typography variant="body2">Views</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {article.viewCount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ThumbUpIcon fontSize="small" color="action" />
                    <Typography variant="body2">Likes</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {article.likeCount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShareIcon fontSize="small" color="action" />
                    <Typography variant="body2">Shares</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {article.shareCount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BookmarkIcon fontSize="small" color="action" />
                    <Typography variant="body2">Bookmarks</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {article._count.bookmarks}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
