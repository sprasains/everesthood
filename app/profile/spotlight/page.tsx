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
  Rating, 
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
  Tooltip
} from '@mui/material';
import { 
  Star, 
  Visibility, 
  ThumbUp, 
  Comment, 
  Share, 
  Add, 
  Search, 
  FilterList,
  Edit,
  Delete,
  Person,
  Work,
  School,
  LocationOn
} from '@mui/icons-material';
import AppLayoutShell from '@/components/layout/AppLayoutShell';

interface SpotlightProfile {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  experience: string;
  achievements: string[];
  portfolio: string[];
  isActive: boolean;
  views: number;
  likes: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

interface SpotlightReview {
  id: string;
  rating: number;
  comment: string;
  reviewer: {
    name: string;
    image?: string;
  };
  createdAt: string;
}

export default function ProfileSpotlightPage() {
  const [profiles, setProfiles] = useState<SpotlightProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<SpotlightProfile | null>(null);
  const [reviews, setReviews] = useState<SpotlightReview[]>([]);

  const categories = [
    'Technology',
    'Design',
    'Business',
    'Marketing',
    'Writing',
    'Education',
    'Healthcare',
    'Finance',
    'Other'
  ];

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/spotlight');
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
      } else {
        setError('Failed to fetch spotlight profiles');
      }
    } catch (err) {
      setError('Error loading profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (profileData: any) => {
    try {
      const response = await fetch('/api/spotlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        await fetchProfiles();
        setCreateDialogOpen(false);
      } else {
        setError('Failed to create profile');
      }
    } catch (err) {
      setError('Error creating profile');
    }
  };

  const handleViewProfile = async (profile: SpotlightProfile) => {
    setSelectedProfile(profile);
    // Fetch reviews for this profile
    try {
      const response = await fetch(`/api/spotlight/${profile.id}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || profile.category === categoryFilter;
    return matchesSearch && matchesCategory && profile.isActive;
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
            Profile Spotlight
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Discover talented professionals and showcase your skills to the community
          </Typography>

          {/* Search and Filter */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search profiles, skills, or categories..."
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
                  Create Profile
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

        {/* Profiles Grid */}
        <Grid container spacing={3}>
          {filteredProfiles.map((profile) => (
            <Grid item xs={12} md={6} lg={4} key={profile.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
                onClick={() => handleViewProfile(profile)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar 
                      src={profile.user.image} 
                      sx={{ width: 56, height: 56, mr: 2 }}
                    >
                      {profile.user.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {profile.user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profile.title}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {profile.description}
                  </Typography>

                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                    <Chip label={profile.category} size="small" color="primary" />
                    {profile.skills.slice(0, 3).map((skill, index) => (
                      <Chip key={index} label={skill} size="small" variant="outlined" />
                    ))}
                    {profile.skills.length > 3 && (
                      <Chip label={`+${profile.skills.length - 3}`} size="small" variant="outlined" />
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <Rating value={profile.rating} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({profile.reviewCount})
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box display="flex" alignItems="center">
                        <Visibility fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {profile.views}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <ThumbUp fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {profile.likes}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredProfiles.length === 0 && !loading && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No profiles found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Be the first to create a spotlight profile!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Your Profile
            </Button>
          </Box>
        )}

        {/* Create Profile Dialog */}
        <CreateProfileDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSubmit={handleCreateProfile}
          categories={categories}
        />

        {/* Profile Detail Dialog */}
        <ProfileDetailDialog
          profile={selectedProfile}
          reviews={reviews}
          onClose={() => setSelectedProfile(null)}
        />
      </Container>
    </AppLayoutShell>
  );
}

// Create Profile Dialog Component
function CreateProfileDialog({ 
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
    title: '',
    description: '',
    category: '',
    skills: [] as string[],
    experience: '',
    achievements: [] as string[],
    portfolio: [] as string[]
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      category: '',
      skills: [],
      experience: '',
      achievements: [],
      portfolio: []
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Spotlight Profile</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Professional Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Senior Software Engineer, UX Designer"
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
              placeholder="Tell us about your professional background and expertise..."
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
              label="Years of Experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="e.g., 5+ years"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Create Profile
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Profile Detail Dialog Component
function ProfileDetailDialog({ 
  profile, 
  reviews, 
  onClose 
}: { 
  profile: SpotlightProfile | null; 
  reviews: SpotlightReview[];
  onClose: () => void;
}) {
  if (!profile) return null;

  return (
    <Dialog open={!!profile} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar src={profile.user.image} sx={{ width: 48, height: 48, mr: 2 }}>
              {profile.user.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{profile.user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.title}
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
          {profile.description}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Skills</Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {profile.skills.map((skill, index) => (
              <Chip key={index} label={skill} />
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Experience</Typography>
          <Typography variant="body2">{profile.experience}</Typography>
        </Box>

        {profile.achievements.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Achievements</Typography>
            <ul>
              {profile.achievements.map((achievement, index) => (
                <li key={index}>
                  <Typography variant="body2">{achievement}</Typography>
                </li>
              ))}
            </ul>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Reviews</Typography>
          {reviews.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No reviews yet
            </Typography>
          ) : (
            <Box>
              {reviews.map((review) => (
                <Paper key={review.id} sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar src={review.reviewer.image} sx={{ width: 32, height: 32, mr: 1 }}>
                      {review.reviewer.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {review.reviewer.name}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>
                  </Box>
                  <Typography variant="body2">{review.comment}</Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained">Contact</Button>
      </DialogActions>
    </Dialog>
  );
}
