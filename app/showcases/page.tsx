"use client";
import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Avatar, 
  Chip, 
  Grid, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Rating,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import { 
  Work, 
  Add, 
  Search, 
  FilterList,
  Edit,
  Delete,
  Person,
  Star,
  Visibility,
  ThumbUp,
  Comment,
  Share,
  Download,
  Link,
  GitHub,
  LinkedIn,
  Twitter,
  School,
  LocationOn,
  CalendarToday,
  TrendingUp,
  EmojiEvents
} from '@mui/icons-material';
import AppLayoutShell from '@/components/layout/AppLayoutShell';

interface Showcase {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'project' | 'achievement' | 'certification' | 'experience' | 'skill';
  status: 'published' | 'draft' | 'archived';
  featured: boolean;
  views: number;
  likes: number;
  comments: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    image?: string;
    title?: string;
    company?: string;
  };
  tags: string[];
  skills: string[];
  media: Array<{
    type: 'image' | 'video' | 'document' | 'link';
    url: string;
    title: string;
  }>;
  links: Array<{
    platform: 'github' | 'linkedin' | 'twitter' | 'website' | 'other';
    url: string;
    title: string;
  }>;
  metrics: {
    impact: string;
    duration: string;
    teamSize?: number;
    technologies: string[];
  };
}

interface ShowcaseComment {
  id: string;
  content: string;
  author: {
    name: string;
    image?: string;
  };
  createdAt: string;
  likes: number;
}

export default function CareerShowcasesPage() {
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedShowcase, setSelectedShowcase] = useState<Showcase | null>(null);
  const [comments, setComments] = useState<ShowcaseComment[]>([]);

  const categories = [
    'Technology',
    'Design',
    'Business',
    'Marketing',
    'Data Science',
    'AI/ML',
    'Web Development',
    'Mobile Development',
    'DevOps',
    'Cybersecurity',
    'Product Management',
    'Sales',
    'Finance',
    'Healthcare',
    'Education',
    'Other'
  ];

  const types = [
    'project',
    'achievement',
    'certification',
    'experience',
    'skill'
  ];

  const tabs = [
    { label: 'All', value: 0 },
    { label: 'Featured', value: 1 },
    { label: 'Projects', value: 2 },
    { label: 'Achievements', value: 3 },
    { label: 'Certifications', value: 4 }
  ];

  useEffect(() => {
    fetchShowcases();
  }, []);

  const fetchShowcases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/showcases');
      if (response.ok) {
        const data = await response.json();
        setShowcases(data.showcases || []);
      } else {
        setError('Failed to fetch showcases');
      }
    } catch (err) {
      setError('Error loading showcases');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShowcase = async (showcaseData: any) => {
    try {
      const response = await fetch('/api/showcases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(showcaseData),
      });

      if (response.ok) {
        await fetchShowcases();
        setCreateDialogOpen(false);
      } else {
        setError('Failed to create showcase');
      }
    } catch (err) {
      setError('Error creating showcase');
    }
  };

  const handleViewShowcase = async (showcase: Showcase) => {
    setSelectedShowcase(showcase);
    // Fetch comments for this showcase
    try {
      const response = await fetch(`/api/showcases/${showcase.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleLikeShowcase = async (showcaseId: string) => {
    try {
      const response = await fetch(`/api/showcases/${showcaseId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchShowcases();
      }
    } catch (err) {
      console.error('Error liking showcase:', err);
    }
  };

  const getFilteredShowcases = () => {
    let filtered = showcases.filter(showcase => {
      const matchesSearch = showcase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           showcase.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           showcase.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !categoryFilter || showcase.category === categoryFilter;
      const matchesType = !typeFilter || showcase.type === typeFilter;
      return matchesSearch && matchesCategory && matchesType && showcase.status === 'published';
    });

    // Apply tab filters
    switch (tabValue) {
      case 1: // Featured
        filtered = filtered.filter(showcase => showcase.featured);
        break;
      case 2: // Projects
        filtered = filtered.filter(showcase => showcase.type === 'project');
        break;
      case 3: // Achievements
        filtered = filtered.filter(showcase => showcase.type === 'achievement');
        break;
      case 4: // Certifications
        filtered = filtered.filter(showcase => showcase.type === 'certification');
        break;
    }

    return filtered;
  };

  const filteredShowcases = getFilteredShowcases();

  if (loading) {
    return (
      <AppLayoutShell>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        </Container>
      </AppLayoutShell>
    );
  }

  return (
    <AppLayoutShell>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Career Showcases
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Discover amazing projects, achievements, and skills from talented professionals
          </Typography>

          {/* Tabs */}
          <Paper elevation={1} sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map((tab) => (
                <Tab key={tab.value} label={tab.label} />
              ))}
            </Tabs>
          </Paper>

          {/* Search and Filter */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search showcases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {types.map(type => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Create Showcase
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Showcases Grid */}
        <Grid container spacing={3}>
          {filteredShowcases.map((showcase) => (
            <Grid item xs={12} md={6} lg={4} key={showcase.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
                onClick={() => handleViewShowcase(showcase)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        src={showcase.author.image} 
                        sx={{ width: 48, height: 48, mr: 2 }}
                      >
                        {showcase.author.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {showcase.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {showcase.author.name}
                        </Typography>
                      </Box>
                    </Box>
                    {showcase.featured && (
                      <Chip label="Featured" size="small" color="primary" />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {showcase.description}
                  </Typography>

                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                    <Chip label={showcase.category} size="small" color="primary" />
                    <Chip 
                      label={showcase.type} 
                      size="small" 
                      variant="outlined"
                    />
                    {showcase.skills.slice(0, 2).map((skill, index) => (
                      <Chip key={index} label={skill} size="small" variant="outlined" />
                    ))}
                  </Box>

                  {showcase.metrics && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Impact: {showcase.metrics.impact}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {showcase.metrics.duration}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box display="flex" alignItems="center">
                        <Visibility fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {showcase.views}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <ThumbUp fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {showcase.likes}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Comment fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {showcase.comments}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Rating value={showcase.rating} readOnly size="small" />
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    startIcon={<ThumbUp />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeShowcase(showcase.id);
                    }}
                  >
                    Like
                  </Button>
                  <Button
                    startIcon={<Share />}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle share
                    }}
                  >
                    Share
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewShowcase(showcase);
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredShowcases.length === 0 && !loading && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No showcases found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Be the first to showcase your amazing work!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Showcase
            </Button>
          </Box>
        )}

        {/* Create Showcase Dialog */}
        <CreateShowcaseDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSubmit={handleCreateShowcase}
          categories={categories}
          types={types}
        />

        {/* Showcase Detail Dialog */}
        <ShowcaseDetailDialog
          showcase={selectedShowcase}
          comments={comments}
          onClose={() => setSelectedShowcase(null)}
        />
      </Container>
    </AppLayoutShell>
  );
}

// Create Showcase Dialog Component
function CreateShowcaseDialog({ 
  open, 
  onClose, 
  onSubmit, 
  categories,
  types
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (data: any) => void;
  categories: string[];
  types: string[];
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'project',
    tags: [] as string[],
    skills: [] as string[],
    impact: '',
    duration: '',
    teamSize: 1,
    technologies: [] as string[]
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      category: '',
      type: 'project',
      tags: [],
      skills: [],
      impact: '',
      duration: '',
      teamSize: 1,
      technologies: []
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Career Showcase</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Showcase Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., E-commerce Platform with AI Recommendations"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project, achievement, or experience in detail..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Type"
              >
                {types.map(type => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Impact"
              value={formData.impact}
              onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
              placeholder="e.g., Increased user engagement by 40%"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g., 3 months, 6 weeks"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Team Size"
              type="number"
              value={formData.teamSize}
              onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) })}
              inputProps={{ min: 1, max: 100 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Create Showcase
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Showcase Detail Dialog Component
function ShowcaseDetailDialog({ 
  showcase, 
  comments, 
  onClose 
}: { 
  showcase: Showcase | null; 
  comments: ShowcaseComment[];
  onClose: () => void;
}) {
  if (!showcase) return null;

  return (
    <Dialog open={!!showcase} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar src={showcase.author.image} sx={{ width: 48, height: 48, mr: 2 }}>
              {showcase.author.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{showcase.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {showcase.author.name} • {showcase.category}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Share">
              <IconButton>
                <Share />
              </IconButton>
            </Tooltip>
            <Tooltip title="Like">
              <IconButton>
                <ThumbUp />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {showcase.description}
        </Typography>

        {showcase.metrics && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>Impact</Typography>
              <Typography variant="body2">{showcase.metrics.impact}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>Duration</Typography>
              <Typography variant="body2">{showcase.metrics.duration}</Typography>
            </Grid>
            {showcase.metrics.teamSize && (
              <Grid item xs={6}>
                <Typography variant="h6" gutterBottom>Team Size</Typography>
                <Typography variant="body2">{showcase.metrics.teamSize} people</Typography>
              </Grid>
            )}
          </Grid>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Skills & Technologies</Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {showcase.skills.map((skill, index) => (
              <Chip key={index} label={skill} />
            ))}
          </Box>
        </Box>

        {showcase.links.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Links</Typography>
            <List>
              {showcase.links.map((link, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>
                      {link.platform === 'github' && <GitHub />}
                      {link.platform === 'linkedin' && <LinkedIn />}
                      {link.platform === 'twitter' && <Twitter />}
                      {link.platform === 'website' && <Link />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={link.title}
                    secondary={link.url}
                  />
                  <ListItemSecondaryAction>
                    <IconButton>
                      <Download />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Comments</Typography>
          {comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No comments yet
            </Typography>
          ) : (
            <Box>
              {comments.map((comment) => (
                <Paper key={comment.id} sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar src={comment.author.image} sx={{ width: 32, height: 32, mr: 1 }}>
                      {comment.author.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {comment.author.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2">{comment.content}</Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained">Contact Author</Button>
      </DialogActions>
    </Dialog>
  );
}
