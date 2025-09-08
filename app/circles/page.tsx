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
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction
} from '@mui/material';
import { 
  Group, 
  Add, 
  Search, 
  FilterList,
  Edit,
  Delete,
  Person,
  Lock,
  Public,
  People,
  Message,
  Notifications,
  Settings,
  Join,
  ExitToApp
} from '@mui/icons-material';
import AppLayoutShell from '@/components/layout/AppLayoutShell';

interface Circle {
  id: string;
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  memberCount: number;
  maxMembers: number;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    image?: string;
  };
  members: Array<{
    id: string;
    name: string;
    image?: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
  }>;
  tags: string[];
  isJoined: boolean;
}

interface CirclePost {
  id: string;
  content: string;
  author: {
    name: string;
    image?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
}

export default function CollaborativeCirclesPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [posts, setPosts] = useState<CirclePost[]>([]);

  const categories = [
    'Technology',
    'Design',
    'Business',
    'Education',
    'Health & Wellness',
    'Creative Arts',
    'Gaming',
    'Sports',
    'Travel',
    'Food & Cooking',
    'Other'
  ];

  useEffect(() => {
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/circles');
      if (response.ok) {
        const data = await response.json();
        setCircles(data.circles || []);
      } else {
        setError('Failed to fetch circles');
      }
    } catch (err) {
      setError('Error loading circles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCircle = async (circleData: any) => {
    try {
      const response = await fetch('/api/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circleData),
      });

      if (response.ok) {
        await fetchCircles();
        setCreateDialogOpen(false);
      } else {
        setError('Failed to create circle');
      }
    } catch (err) {
      setError('Error creating circle');
    }
  };

  const handleJoinCircle = async (circleId: string) => {
    try {
      const response = await fetch(`/api/circles/${circleId}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchCircles();
      } else {
        setError('Failed to join circle');
      }
    } catch (err) {
      setError('Error joining circle');
    }
  };

  const handleLeaveCircle = async (circleId: string) => {
    try {
      const response = await fetch(`/api/circles/${circleId}/leave`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchCircles();
      } else {
        setError('Failed to leave circle');
      }
    } catch (err) {
      setError('Error leaving circle');
    }
  };

  const handleViewCircle = async (circle: Circle) => {
    setSelectedCircle(circle);
    // Fetch posts for this circle
    try {
      const response = await fetch(`/api/circles/${circle.id}/posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const filteredCircles = circles.filter(circle => {
    const matchesSearch = circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         circle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         circle.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || circle.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
            Collaborative Circles
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Join focused communities and collaborate with like-minded people
          </Typography>

          {/* Search and Filter */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search circles, topics, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Create Circle
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

        {/* Circles Grid */}
        <Grid container spacing={3}>
          {filteredCircles.map((circle) => (
            <Grid item xs={12} md={6} lg={4} key={circle.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
                onClick={() => handleViewCircle(circle)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 48, height: 48, mr: 2, bgcolor: 'primary.main' }}>
                        <Group />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {circle.name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          {circle.isPrivate ? (
                            <Lock fontSize="small" color="action" />
                          ) : (
                            <Public fontSize="small" color="action" />
                          )}
                          <Typography variant="body2" color="text.secondary">
                            {circle.isPrivate ? 'Private' : 'Public'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Chip label={circle.category} size="small" color="primary" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {circle.description}
                  </Typography>

                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                    {circle.tags.slice(0, 3).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                    {circle.tags.length > 3 && (
                      <Chip label={`+${circle.tags.length - 3}`} size="small" variant="outlined" />
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box display="flex" alignItems="center">
                        <People fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {circle.memberCount}/{circle.maxMembers}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Message fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          Active
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Avatar src={circle.owner.image} sx={{ width: 24, height: 24 }}>
                        {circle.owner.name.charAt(0)}
                      </Avatar>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  {circle.isJoined ? (
                    <Button
                      startIcon={<ExitToApp />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeaveCircle(circle.id);
                      }}
                      color="error"
                    >
                      Leave
                    </Button>
                  ) : (
                    <Button
                      startIcon={<Join />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinCircle(circle.id);
                      }}
                      variant="contained"
                    >
                      Join
                    </Button>
                  )}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewCircle(circle);
                    }}
                  >
                    View
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredCircles.length === 0 && !loading && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No circles found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Be the first to create a collaborative circle!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Your Circle
            </Button>
          </Box>
        )}

        {/* Create Circle Dialog */}
        <CreateCircleDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSubmit={handleCreateCircle}
          categories={categories}
        />

        {/* Circle Detail Dialog */}
        <CircleDetailDialog
          circle={selectedCircle}
          posts={posts}
          onClose={() => setSelectedCircle(null)}
        />
      </Container>
    </AppLayoutShell>
  );
}

// Create Circle Dialog Component
function CreateCircleDialog({ 
  open, 
  onClose, 
  onSubmit, 
  categories 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (data: any) => void;
  categories: string[];
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPrivate: false,
    maxMembers: 50,
    tags: [] as string[]
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      name: '',
      description: '',
      category: '',
      isPrivate: false,
      maxMembers: 50,
      tags: []
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Collaborative Circle</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Circle Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., React Developers, Design Thinkers"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose and goals of your circle..."
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
            <TextField
              fullWidth
              label="Max Members"
              type="number"
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
              inputProps={{ min: 2, max: 1000 }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                />
              }
              label="Private Circle (invite only)"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Create Circle
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Circle Detail Dialog Component
function CircleDetailDialog({ 
  circle, 
  posts, 
  onClose 
}: { 
  circle: Circle | null; 
  posts: CirclePost[];
  onClose: () => void;
}) {
  if (!circle) return null;

  return (
    <Dialog open={!!circle} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar sx={{ width: 48, height: 48, mr: 2, bgcolor: 'primary.main' }}>
              <Group />
            </Avatar>
            <Box>
              <Typography variant="h6">{circle.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {circle.category} • {circle.memberCount} members
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Settings">
              <IconButton>
                <Settings />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton>
                <Notifications />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {circle.description}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Tags</Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {circle.tags.map((tag, index) => (
              <Chip key={index} label={tag} />
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Members</Typography>
          <List>
            {circle.members.slice(0, 5).map((member) => (
              <ListItem key={member.id}>
                <ListItemAvatar>
                  <Avatar src={member.image}>
                    {member.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.name}
                  secondary={member.role}
                />
                {member.role === 'owner' && (
                  <ListItemSecondaryAction>
                    <Chip label="Owner" size="small" color="primary" />
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
            {circle.members.length > 5 && (
              <ListItem>
                <ListItemText
                  primary={`+${circle.members.length - 5} more members`}
                />
              </ListItem>
            )}
          </List>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Recent Posts</Typography>
          {posts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No posts yet
            </Typography>
          ) : (
            <Box>
              {posts.slice(0, 3).map((post) => (
                <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar src={post.author.image} sx={{ width: 32, height: 32, mr: 1 }}>
                      {post.author.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {post.author.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2">{post.content}</Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained">Join Circle</Button>
      </DialogActions>
    </Dialog>
  );
}
