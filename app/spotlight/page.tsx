"use client";

import { Box, Container, Typography, Paper, Grid, Card, CardContent, CardActions, Avatar, Chip, Button, LinearProgress, Alert, AlertTitle, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Rating, Divider, List, ListItem, ListItemText, ListItemAvatar } from "@mui/material";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SearchIcon,
  StarIcon,
  VisibilityIcon,
  VerifiedIcon,
  TrendingUpIcon,
  AddIcon,
  RefreshIcon,
  PersonIcon,
  BusinessIcon,
  SchoolIcon,
  CreateIcon,
  EmojiEventsIcon,
  LinkedInIcon,
  TwitterIcon,
  InstagramIcon,
  GitHubIcon,
  LanguageIcon
} from "@mui/icons-material";

interface SpotlightProfile {
  id: string;
  title: string;
  description: string;
  category: string;
  specialties: string[];
  socialLinks?: any;
  portfolio: any[];
  isActive: boolean;
  isVerified: boolean;
  featuredUntil?: string;
  viewCount: number;
  clickCount: number;
  contactCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
    email: string;
    level: number;
    xp: number;
  };
  reviews?: SpotlightReview[];
  _count: {
    reviews: number;
  };
}

interface SpotlightReview {
  id: string;
  rating: number;
  title: string;
  content: string;
  isVerified: boolean;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function ProfileSpotlightPage() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const router = useRouter();
  const [profiles, setProfiles] = useState<SpotlightProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProfile, setNewProfile] = useState({
    title: '',
    description: '',
    category: 'CREATOR',
    specialties: [] as string[],
    socialLinks: {
      linkedin: '',
      twitter: '',
      instagram: '',
      github: '',
      website: ''
    },
    portfolio: [] as any[]
  });

  const categories = [
    { value: 'CREATOR', label: 'Creator', icon: <CreateIcon /> },
    { value: 'EXPERT', label: 'Expert', icon: <SchoolIcon /> },
    { value: 'INFLUENCER', label: 'Influencer', icon: <TrendingUpIcon /> },
    { value: 'ENTREPRENEUR', label: 'Entrepreneur', icon: <BusinessIcon /> },
    { value: 'EDUCATOR', label: 'Educator', icon: <PersonIcon /> }
  ];

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchProfiles();
  }, [session, status, router, selectedCategory, activeTab]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory) params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);
      if (activeTab === 1) params.set('featured', 'true');
      if (activeTab === 2) params.set('verified', 'true');
      
      const response = await fetch(`/api/spotlight?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }
      
      const data = await response.json();
      setProfiles(data.profiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    try {
      const response = await fetch('/api/spotlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      setCreateDialogOpen(false);
      setNewProfile({
        title: '',
        description: '',
        category: 'CREATOR',
        specialties: [],
        socialLinks: {
          linkedin: '',
          twitter: '',
          instagram: '',
          github: '',
          website: ''
        },
        portfolio: []
      });
      fetchProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryObj = categories.find(c => c.value === category);
    return categoryObj ? categoryObj.icon : <PersonIcon />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CREATOR': return 'primary';
      case 'EXPERT': return 'success';
      case 'INFLUENCER': return 'warning';
      case 'ENTREPRENEUR': return 'info';
      case 'EDUCATOR': return 'secondary';
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
              Loading Profile Spotlight...
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
              Profile Spotlight
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Discover talented creators, experts, and influencers in our community
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
                placeholder="Search profiles..."
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
              <FormControl sx={{ minWidth: 150 }}>
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
            </Box>

            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="All Profiles" />
              <Tab label="Featured" />
              <Tab label="Verified" />
            </Tabs>
          </Paper>

          {/* Profiles Grid */}
          {profiles.length === 0 ? (
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
                  No Profiles Found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Be the first to create a spotlight profile and showcase your expertise!
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Create Profile
                </Button>
              </Paper>
            </motion.div>
          ) : (
            <Grid container spacing={3}>
              {profiles.map((profile, index) => (
                <Grid item xs={12} sm={6} md={4} key={profile.id}>
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
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        transition: 'transform 0.2s ease-in-out'
                      }
                    }}
                    onClick={() => router.push(`/spotlight/${profile.id}`)}
                    >
                      {profile.featuredUntil && new Date(profile.featuredUntil) > new Date() && (
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
                      
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar 
                            src={profile.user.image} 
                            sx={{ width: 60, height: 60 }}
                          >
                            {profile.user.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h6" fontWeight="bold">
                                {profile.user.name}
                              </Typography>
                              {profile.isVerified && (
                                <VerifiedIcon color="primary" fontSize="small" />
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getCategoryIcon(profile.category)}
                              <Chip
                                label={profile.category}
                                size="small"
                                color={getCategoryColor(profile.category) as any}
                              />
                            </Box>
                          </Box>
                        </Box>
                        
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                          {profile.title}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {profile.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          {profile.specialties.slice(0, 3).map((specialty, specialtyIndex) => (
                            <Chip
                              key={specialtyIndex}
                              label={specialty}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Rating 
                            value={profile.rating} 
                            readOnly 
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            ({profile.reviewCount} reviews)
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <VisibilityIcon fontSize="small" color="action" />
                            <Typography variant="caption">
                              {profile.viewCount}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarIcon fontSize="small" color="action" />
                            <Typography variant="caption">
                              {profile.rating.toFixed(1)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                      
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/spotlight/${profile.id}`);
                          }}
                        >
                          View Profile
                        </Button>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Create Profile Dialog */}
          <Dialog 
            open={createDialogOpen} 
            onClose={() => setCreateDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Create Spotlight Profile</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Title"
                value={newProfile.title}
                onChange={(e) => setNewProfile({ ...newProfile, title: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="e.g., Senior Software Engineer, Creative Director"
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newProfile.description}
                onChange={(e) => setNewProfile({ ...newProfile, description: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="Tell us about yourself and your expertise..."
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newProfile.category}
                  onChange={(e) => setNewProfile({ ...newProfile, category: e.target.value })}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Specialties (comma-separated)"
                value={newProfile.specialties.join(', ')}
                onChange={(e) => setNewProfile({ 
                  ...newProfile, 
                  specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
                sx={{ mb: 2 }}
                placeholder="e.g., React, Node.js, UI/UX Design, Marketing"
              />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Social Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="LinkedIn"
                  value={newProfile.socialLinks.linkedin}
                  onChange={(e) => setNewProfile({ 
                    ...newProfile, 
                    socialLinks: { ...newProfile.socialLinks, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/in/username"
                />
                <TextField
                  fullWidth
                  label="Twitter"
                  value={newProfile.socialLinks.twitter}
                  onChange={(e) => setNewProfile({ 
                    ...newProfile, 
                    socialLinks: { ...newProfile.socialLinks, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/username"
                />
                <TextField
                  fullWidth
                  label="Website"
                  value={newProfile.socialLinks.website}
                  onChange={(e) => setNewProfile({ 
                    ...newProfile, 
                    socialLinks: { ...newProfile.socialLinks, website: e.target.value }
                  })}
                  placeholder="https://yourwebsite.com"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProfile}
                variant="contained"
                disabled={!newProfile.title || !newProfile.description}
              >
                Create Profile
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
}

