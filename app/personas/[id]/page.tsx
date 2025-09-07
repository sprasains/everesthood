'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Rating,
  Avatar,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  PlayArrow as PlayIcon,
  Psychology as PsychologyIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Tag as TagIcon,
  Add as AddIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Persona {
  id: string;
  name: string;
  description: string;
  personality: string;
  systemPrompt: string;
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
  instances: Array<{
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    title?: string;
    content?: string;
    helpful: number;
    notHelpful: number;
    createdAt: string;
    user: {
      id: string;
      name: string;
      image?: string;
    };
  }>;
  _count: {
    instances: number;
    reviews: number;
    shares: number;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`persona-tabpanel-${index}`}
      aria-labelledby={`persona-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PersonaDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [createInstanceDialog, setCreateInstanceDialog] = useState(false);
  const [createReviewDialog, setCreateReviewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [instanceName, setInstanceName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');

  const fetchPersona = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/personas/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch persona');
      }
      const data = await response.json();
      setPersona(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersona();
  }, [params.id]);

  const handleCreateInstance = async () => {
    try {
      const response = await fetch(`/api/personas/${params.id}/instances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: instanceName,
          config: JSON.stringify({})
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create instance');
      }

      setCreateInstanceDialog(false);
      setInstanceName('');
      fetchPersona(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCreateReview = async () => {
    try {
      const response = await fetch(`/api/personas/${params.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle,
          content: reviewContent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create review');
      }

      setCreateReviewDialog(false);
      setReviewTitle('');
      setReviewContent('');
      setReviewRating(5);
      fetchPersona(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeletePersona = async () => {
    try {
      const response = await fetch(`/api/personas/${params.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete persona');
      }

      router.push('/personas');
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading persona...
        </Typography>
      </Container>
    );
  }

  if (error || !persona) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Persona not found'}
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

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={persona.avatar}
                sx={{ mr: 3, width: 80, height: 80 }}
              >
                <PsychologyIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {persona.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={persona.visibility.toLowerCase()}
                    color={getVisibilityColor(persona.visibility)}
                  />
                  <Chip
                    label={persona.status.toLowerCase()}
                    color={getStatusColor(persona.status)}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Rating
                    value={persona.averageRating}
                    readOnly
                    precision={0.1}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({persona.reviewCount} reviews)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {persona.usageCount} uses
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={() => setCreateInstanceDialog(true)}
              >
                Create Instance
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={() => router.push(`/personas/${persona.id}/share`)}
              >
                Share
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => router.push(`/personas/${persona.id}/edit`)}
              >
                Edit
              </Button>
              <IconButton
                color="error"
                onClick={() => setDeleteDialog(true)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="body1" sx={{ mb: 3 }}>
          {persona.description}
        </Typography>

        {persona.tags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {persona.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Created by {persona.user.name}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {new Date(persona.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" />
          <Tab label="Instances" />
          <Tab label="Reviews" />
          <Tab label="System Prompt" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h4" color="primary">
                      {persona.usageCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Uses
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" color="primary">
                      {persona._count.instances}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Instances
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" color="primary">
                      {persona.reviewCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reviews
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" color="primary">
                      {persona._count.shares}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Shares
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personality Traits
                </Typography>
                {persona.personality && (
                  <Box>
                    {Object.entries(JSON.parse(persona.personality)).map(([trait, value]) => (
                      <Box key={trait} sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {trait.charAt(0).toUpperCase() + trait.slice(1)}: {value}%
                        </Typography>
                        <Box
                          sx={{
                            height: 6,
                            backgroundColor: 'grey.200',
                            borderRadius: 3,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${value}%`,
                              backgroundColor: 'primary.main',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Instances Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Instances ({persona.instances.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateInstanceDialog(true)}
          >
            Create Instance
          </Button>
        </Box>

        {persona.instances.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                No instances created yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create an instance to start using this persona
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateInstanceDialog(true)}
              >
                Create First Instance
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {persona.instances.map((instance) => (
              <Grid item xs={12} sm={6} md={4} key={instance.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {instance.name}
                    </Typography>
                    <Chip
                      label={instance.isActive ? 'Active' : 'Inactive'}
                      color={instance.isActive ? 'success' : 'default'}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Created {new Date(instance.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Reviews Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Reviews ({persona.reviews.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<StarIcon />}
            onClick={() => setCreateReviewDialog(true)}
          >
            Write Review
          </Button>
        </Box>

        {persona.reviews.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                No reviews yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Be the first to review this persona
              </Typography>
              <Button
                variant="contained"
                startIcon={<StarIcon />}
                onClick={() => setCreateReviewDialog(true)}
              >
                Write First Review
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {persona.reviews.map((review) => (
              <Grid item xs={12} key={review.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={review.user.image} sx={{ mr: 2 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1">
                          {review.user.name}
                        </Typography>
                        <Rating value={review.rating} readOnly size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {review.title && (
                      <Typography variant="h6" gutterBottom>
                        {review.title}
                      </Typography>
                    )}
                    {review.content && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {review.content}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small">
                        <ThumbUpIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" color="text.secondary">
                        {review.helpful}
                      </Typography>
                      <IconButton size="small">
                        <ThumbDownIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" color="text.secondary">
                        {review.notHelpful}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* System Prompt Tab */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Prompt
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={12}
              value={persona.systemPrompt}
              InputProps={{
                readOnly: true
              }}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }
              }}
            />
          </CardContent>
        </Card>
      </TabPanel>

      {/* Create Instance Dialog */}
      <Dialog
        open={createInstanceDialog}
        onClose={() => setCreateInstanceDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Instance</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Instance Name"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateInstanceDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateInstance}
            variant="contained"
            disabled={!instanceName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Review Dialog */}
      <Dialog
        open={createReviewDialog}
        onClose={() => setCreateReviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Write Review</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Rating</Typography>
            <Rating
              value={reviewRating}
              onChange={(_, newValue) => setReviewRating(newValue || 5)}
            />
          </Box>
          <TextField
            fullWidth
            label="Title (Optional)"
            value={reviewTitle}
            onChange={(e) => setReviewTitle(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Review"
            multiline
            rows={4}
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateReviewDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateReview}
            variant="contained"
            disabled={!reviewContent.trim()}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>Delete Persona</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{persona.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeletePersona}
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
