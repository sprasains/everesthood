"use client";

import { Box, Container, Typography, Paper, Card, CardContent, CardMedia, CardActions, Avatar, Chip, Button, LinearProgress, Alert, AlertTitle, TextField, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Badge } from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  PlayArrow as PlayArrowIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoLibraryIcon,
  Headphones as HeadphonesIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Lock as LockIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  NewReleases as NewReleasesIcon
} from "@mui/icons-material";

interface ExclusiveContent {
  id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  category: string;
  tags: string[];
  tier: string;
  price: number;
  currency: string;
  isPublished: boolean;
  publishedAt?: string;
  featured: boolean;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  thumbnailUrl?: string;
  mediaUrls: string[];
  duration?: number;
  difficulty?: string;
  prerequisites: string[];
  learningOutcomes: string[];
  createdAt: string;
  author: {
    id: string;
    name: string;
    image?: string;
    level: number;
    xp: number;
  };
  hasAccess: boolean;
  _count: {
    comments: number;
  };
}

export default function ExclusiveContentPage() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const router = useRouter();
  const [content, setContent] = useState<ExclusiveContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTier, setSelectedTier] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    content: '',
    type: 'ARTICLE',
    category: 'TECHNOLOGY',
    tier: 'PREMIUM',
    price: 0
  });

  const contentTypes = [
    { value: 'ARTICLE', label: 'Article', icon: <ArticleIcon /> },
    { value: 'VIDEO', label: 'Video', icon: <VideoLibraryIcon /> },
    { value: 'AUDIO', label: 'Audio', icon: <HeadphonesIcon /> },
    { value: 'DOCUMENT', label: 'Document', icon: <DescriptionIcon /> },
    { value: 'COURSE', label: 'Course', icon: <SchoolIcon /> },
    { value: 'WORKSHOP', label: 'Workshop', icon: <EventIcon /> }
  ];

  const categories = [
    { value: 'TECHNOLOGY', label: 'Technology' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'CREATIVITY', label: 'Creativity' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'LIFESTYLE', label: 'Lifestyle' }
  ];

  const tiers = [
    { value: 'FREE', label: 'Free', color: 'success' },
    { value: 'PREMIUM', label: 'Premium', color: 'primary' },
    { value: 'VIP', label: 'VIP', color: 'warning' },
    { value: 'EXCLUSIVE', label: 'Exclusive', color: 'error' }
  ];

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchContent();
  }, [session, status, router, selectedType, selectedCategory, selectedTier, activeTab]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedType) params.set('type', selectedType);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedTier) params.set('tier', selectedTier);
      if (searchQuery) params.set('search', searchQuery);
      if (activeTab === 1) params.set('featured', 'true');
      
      const response = await fetch(`/api/exclusive-content?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const data = await response.json();
      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    try {
      const response = await fetch('/api/exclusive-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContent)
      });

      if (!response.ok) {
        throw new Error('Failed to create content');
      }

      setCreateDialogOpen(false);
      setNewContent({
        title: '',
        description: '',
        content: '',
        type: 'ARTICLE',
        category: 'TECHNOLOGY',
        tier: 'PREMIUM',
        price: 0
      });
      fetchContent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handlePurchaseContent = async (contentId: string) => {
    try {
      const response = await fetch(`/api/exclusive-content/${contentId}/purchase`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to purchase content');
      }

      fetchContent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getTypeIcon = (type: string) => {
    const typeObj = contentTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : <ArticleIcon />;
  };

  const getTierColor = (tier: string) => {
    const tierObj = tiers.find(t => t.value === tier);
    return tierObj ? tierObj.color : 'default';
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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
              Loading Exclusive Content...
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
              Exclusive Content
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Discover premium content from expert creators
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {/* Search and Filters */}
          <Paper sx={{ 
            mb: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: 3
          }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  {contentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Tier</InputLabel>
                <Select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  label="Tier"
                >
                  <MenuItem value="">All Tiers</MenuItem>
                  {tiers.map((tier) => (
                    <MenuItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="All Content" />
              <Tab label="Featured" />
              <Tab label="My Content" />
            </Tabs>
          </Paper>

          {/* Content Grid */}
          {content.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper sx={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                textAlign: 'center',
                p: 6
              }}>
                <StarIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                  No Content Found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  {activeTab === 2 
                    ? 'You haven\'t created any content yet. Start sharing your expertise!'
                    : 'No exclusive content matches your current filters.'
                  }
                </Typography>
                {activeTab === 2 && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    Create Content
                  </Button>
                )}
              </Paper>
            </motion.div>
          ) : (
            <Grid container spacing={3}>
              {content.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {item.featured && (
                        <Chip
                          label="Featured"
                          color="warning"
                          size="small"
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            zIndex: 1 
                          }}
                        />
                      )}
                      
                      {item.thumbnailUrl && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={item.thumbnailUrl}
                          alt={item.title}
                        />
                      )}
                      
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          {getTypeIcon(item.type)}
                          <Chip
                            label={item.tier}
                            size="small"
                            color={getTierColor(item.tier) as any}
                          />
                          {item.duration && (
                            <Chip
                              label={formatDuration(item.duration)}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                          {item.title}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {item.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar 
                            src={item.author.image} 
                            sx={{ width: 24, height: 24 }}
                          >
                            {item.author.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Typography variant="caption">
                            {item.author.name}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {item.tags.slice(0, 2).map((tag, tagIndex) => (
                            <Chip
                              key={tagIndex}
                              label={`#${tag}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </CardContent>
                      
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" color="primary.main">
                              {item.tier === 'FREE' ? 'Free' : `$${item.price.toFixed(2)}`}
                            </Typography>
                          </Box>
                          
                          {item.hasAccess ? (
                            <Button
                              variant="contained"
                              onClick={() => router.push(`/exclusive-content/${item.id}`)}
                            >
                              View
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              onClick={() => handlePurchaseContent(item.id)}
                              disabled={item.tier === 'FREE'}
                            >
                              {item.tier === 'FREE' ? 'Free' : 'Purchase'}
                            </Button>
                          )}
                        </Box>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Create Content Dialog */}
          <Dialog 
            open={createDialogOpen} 
            onClose={() => setCreateDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Create Exclusive Content</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Title"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newContent.description}
                onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Content"
                value={newContent.content}
                onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newContent.type}
                    onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                    label="Type"
                  >
                    {contentTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newContent.category}
                    onChange={(e) => setNewContent({ ...newContent, category: e.target.value })}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Tier</InputLabel>
                  <Select
                    value={newContent.tier}
                    onChange={(e) => setNewContent({ ...newContent, tier: e.target.value })}
                    label="Tier"
                  >
                    {tiers.map((tier) => (
                      <MenuItem key={tier.value} value={tier.value}>
                        {tier.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={newContent.price}
                  onChange={(e) => setNewContent({ ...newContent, price: parseFloat(e.target.value) || 0 })}
                  disabled={newContent.tier === 'FREE'}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateContent}
                variant="contained"
                disabled={!newContent.title || !newContent.description || !newContent.content}
              >
                Create Content
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
} 